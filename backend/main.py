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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
        
        # Calculate basic metrics (pace, filler words)
        metrics = calculate_metrics(transcript)
        
        # Get AI-powered feedback (summary, clarity score, tip)
        llm_feedback = get_llm_feedback(transcript, user_goal)
        
        # Combine results into response
        response = AnalyzeResponse(
            pace=metrics["pace"],
            fillerWords=metrics["fillerWords"],
            aiSummary=llm_feedback["summary"],
            clarityScore=llm_feedback["clarityScore"],
            constructiveTip=llm_feedback["tip"]
        )
        
        return response
        
    except Exception as e:
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
    Get AI-powered feedback using LLM API
    
    Args:
        transcript: The speech text
        user_goal: The user's intended message
        
    Returns:
        Dictionary with summary, clarity score, and constructive tip
    """
    # TODO: Implement actual LLM integration
    # This is where you'll call the Gemini API
    
    # For now, return placeholder values
    # In Phase 2, this will be replaced with actual LLM calls
    
    # Placeholder implementation
    return {
        "summary": f"The speaker discussed their intended goal: {user_goal}",
        "clarityScore": 85,
        "tip": "Great start! To improve clarity, try to structure your speech with a clear beginning, middle, and end."
    }
    
    # TODO: Actual implementation will look like:
    # import google.generativeai as genai
    # genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # model = genai.GenerativeModel('gemini-pro')
    # 
    # prompt = f"""
    # Analyze this speech transcript and provide feedback.
    # 
    # User's Goal: {user_goal}
    # Transcript: {transcript}
    # 
    # Provide:
    # 1. A one-sentence summary of what the speaker said
    # 2. A clarity score (0-100) on how well they achieved their goal
    # 3. One specific, constructive tip to improve
    # 
    # Return as JSON with keys: summary, clarityScore, tip
    # """
    # 
    # response = model.generate_content(prompt)
    # Parse and return the structured response


# ========================================
# Application Entry Point
# ========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
