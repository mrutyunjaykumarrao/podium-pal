"""
Podium Pal Backend - FastAPI Application
==========================================
A stateless API that analyzes speech transcripts and provides feedback.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel('gemini-pro')
    print("✓ Gemini API configured successfully")
except Exception as e:
    print(f"✗ Error configuring Gemini API: {e}")
    model = None

# Initialize FastAPI app
app = FastAPI(
    title="Podium Pal API",
    description="AI-powered public speaking coach API",
    version="1.0.0"
)

# ========================================
# CORS Configuration
# ========================================
# Allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# Pydantic Models (API Contract)
# ========================================

class AnalyzeRequest(BaseModel):
    """Request model for the /analyze endpoint"""
    transcript: str = Field(..., min_length=1, description="The speech transcript to analyze")
    userGoal: str = Field(..., min_length=1, description="The user's intended message or goal")

    class Config:
        json_schema_extra = {
            "example": {
                "transcript": "hello so basically today I want to talk about our quarterly results um you know they were quite good.",
                "userGoal": "Clearly explain that our quarterly results were positive."
            }
        }


class AnalyzeResponse(BaseModel):
    """Response model for the /analyze endpoint"""
    pace: int = Field(..., description="Speaking pace in words per minute")
    fillerWords: Dict[str, int] = Field(..., description="Dictionary of filler words and their counts")
    aiSummary: str = Field(..., description="AI-generated summary of the speech")
    clarityScore: int = Field(..., ge=0, le=100, description="Clarity score from 0-100")
    constructiveTip: str = Field(..., description="Constructive feedback for improvement")

    class Config:
        json_schema_extra = {
            "example": {
                "pace": 145,
                "fillerWords": {
                    "basically": 1,
                    "um": 1,
                    "you know": 1
                },
                "aiSummary": "The speaker announced that the quarterly results were positive.",
                "clarityScore": 92,
                "constructiveTip": "Great job on the directness! To sound even more confident, try removing introductory phrases like 'so basically' and just start with the main point."
            }
        }


# ========================================
# API Endpoints
# ========================================

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Welcome to Podium Pal API",
        "status": "operational",
        "endpoints": {
            "analyze": "/analyze (POST)"
        }
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_speech(request: AnalyzeRequest):
    """
    Analyze a speech transcript and return feedback
    
    Args:
        request: AnalyzeRequest containing transcript and user goal
        
    Returns:
        AnalyzeResponse with pace, filler words, AI summary, clarity score, and tip
    """
    try:
        transcript = request.transcript
        user_goal = request.userGoal
        
        print(f"=== ANALYSIS REQUEST ===")
        print(f"Goal: {user_goal}")
        print(f"Transcript: {transcript[:100]}..." if len(transcript) > 100 else f"Transcript: {transcript}")
        
        # Calculate basic metrics (pace, filler words)
        metrics = calculate_metrics(transcript)
        print(f"Metrics calculated: {metrics}")
        
        # Get AI-powered feedback (summary, clarity score, tip)
        # This function is synchronous, so we don't need to await it
        llm_feedback = get_llm_feedback(transcript, user_goal)
        print(f"LLM Feedback received: {llm_feedback}")
        
        # Combine results into response
        response = AnalyzeResponse(
            pace=metrics["pace"],
            fillerWords=metrics["fillerWords"],
            aiSummary=llm_feedback["summary"],
            clarityScore=llm_feedback["clarityScore"],
            constructiveTip=llm_feedback["tip"]
        )
        
        print(f"Response prepared successfully")
        return response
        
    except Exception as e:
        print(f"ERROR in analysis: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ========================================
# Analysis Functions
# ========================================

def calculate_metrics(transcript: str) -> Dict:
    """
    Calculate basic speech metrics from transcript
    
    Args:
        transcript: The speech text
        
    Returns:
        Dictionary with pace and filler words
    """
    # TODO: Implement actual calculation logic
    # For now, return placeholder values
    
    # Count words for pace calculation
    words = transcript.split()
    word_count = len(words)
    
    # Assume average speaking time (this is a placeholder)
    # In production, you'd need actual timing data
    estimated_minutes = word_count / 150  # Rough estimate
    pace = int(word_count / max(estimated_minutes, 0.5))  # Avoid division by zero
    
    # Common filler words to detect
    filler_word_list = [
        "um", "uh", "like", "you know", "basically", "actually",
        "literally", "so", "well", "right", "okay", "hmm"
    ]
    
    # Count filler words in transcript
    transcript_lower = transcript.lower()
    filler_words = {}
    
    for filler in filler_word_list:
        count = transcript_lower.split().count(filler)
        if count > 0:
            filler_words[filler] = count
    
    return {
        "pace": pace,
        "fillerWords": filler_words
    }


def get_llm_feedback(transcript: str, user_goal: str) -> Dict:
    """
    Get AI-powered feedback using Gemini LLM API
    
    Args:
        transcript: The speech text
        user_goal: The user's intended message
        
    Returns:
        Dictionary with summary, clarity score, and constructive tip
    """
    if not model:
        # Fallback if the model failed to initialize
        return {
            "summary": "LLM model not configured.",
            "clarityScore": 0,
            "tip": "Could not connect to the AI model. Please check the backend server and API key."
        }

    # This is the prompt that instructs the AI.
    # Telling it to return a JSON object is the key to reliable parsing.
    prompt = f"""
    You are an expert public speaking coach. Analyze the following speech transcript and the user's stated goal.

    **User's Stated Goal:** "{user_goal}"
    **Speech Transcript:** "{transcript}"

    Based on the above, perform the following tasks:
    1.  Provide a one-sentence summary of what the speech was actually about.
    2.  On a scale of 1-100, provide a "Clarity Score" that rates how well the transcript's main point matches the user's stated goal. A high score means the message was delivered very clearly.
    3.  Provide a single, brief, and constructive tip for improvement.

    Return your analysis as a single, minified JSON object with the following keys: "aiSummary", "clarityScore", "constructiveTip". Do not include any other text, explanations, or markdown formatting.
    """

    try:
        # Use synchronous method instead of async
        response = model.generate_content(prompt)
        
        # Clean up the response to ensure it's valid JSON
        # LLMs sometimes wrap their response in ```json ... ```
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        print(f"DEBUG: LLM Response: {cleaned_response}")
        
        # Parse the JSON string into a Python dictionary
        feedback_data = json.loads(cleaned_response)

        # Validate that the score is an integer
        if "clarityScore" in feedback_data:
            clarity_score = feedback_data["clarityScore"]
            # Convert to int if it's a string or float
            if isinstance(clarity_score, str):
                clarity_score = int(clarity_score)
            elif isinstance(clarity_score, float):
                clarity_score = int(clarity_score)
            
            return {
                "summary": feedback_data.get("aiSummary", "No summary available"),
                "clarityScore": clarity_score,
                "tip": feedback_data.get("constructiveTip", "No tip available")
            }
        else:
            # Handle cases where the score might not be present
            return {
                "summary": feedback_data.get("aiSummary", "No summary available"),
                "clarityScore": 75,
                "tip": feedback_data.get("constructiveTip", "Great speech! Keep practicing.")
            }

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from LLM response: {e}")
        # Return a structured error if the API fails or returns malformed data
        return {
            "summary": "Error analyzing transcript.",
            "clarityScore": 0,
            "tip": f"The AI model returned an invalid JSON response. Error: {str(e)}"
        }
    except Exception as e:
        print(f"Error getting LLM feedback: {e}")
        # Return a structured error if the API fails or returns malformed data
        return {
            "summary": "Error analyzing transcript.",
            "clarityScore": 0,
            "tip": f"The AI model encountered an error. Error: {str(e)}"
        }


# ========================================
# Application Entry Point
# ========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
