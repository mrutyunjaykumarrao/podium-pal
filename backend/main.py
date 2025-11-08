"""
Podium Pal Backend - FastAPI Application
==========================================
A stateless API that analyzes speech transcripts and audio for comprehensive feedback.
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional
import os
from dotenv import load_dotenv
import shutil
from pathlib import Path
from datetime import datetime
import json
import re
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Create directory for storing audio files
AUDIO_STORAGE_DIR = Path("audio_recordings")
AUDIO_STORAGE_DIR.mkdir(exist_ok=True)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Treat common placeholder values as "not configured"
def _is_valid_api_key(key: str) -> bool:
    if not key:
        return False
    key_lower = key.lower()
    # Simple heuristics: reject obvious placeholders and very short keys
    if key_lower.startswith("your_") or "replace" in key_lower or "xxxxxxxx" in key_lower:
        return False
    if len(key) < 20:
        return False
    return True

if GEMINI_API_KEY and _is_valid_api_key(GEMINI_API_KEY):
    genai.configure(api_key=GEMINI_API_KEY)
    print("✓ Gemini AI configured successfully")
else:
    print("⚠ Warning: GEMINI_API_KEY not found or looks invalid in environment variables")
    print("  LLM feedback will use placeholder responses")

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
    confidenceScore: int = Field(..., ge=0, le=100, description="Confidence/assertiveness score from 0-100")
    engagementScore: int = Field(..., ge=0, le=100, description="Audience engagement score from 0-100")
    structureScore: int = Field(..., ge=0, le=100, description="Speech structure/organization score from 0-100")
    overall_score: float = Field(..., ge=0, le=10, description="Overall speech score from 0-10")
    constructiveTip: str = Field(..., description="Constructive feedback for improvement")
    strengths: list[str] = Field(..., description="List of key strengths in the speech")
    improvements: list[str] = Field(..., description="List of specific areas to improve")

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
                "confidenceScore": 85,
                "engagementScore": 78,
                "structureScore": 88,
                "overall_score": 8.6,
                "constructiveTip": "Great job on the directness! To sound even more confident, try removing introductory phrases like 'so basically' and just start with the main point.",
                "strengths": ["Clear main message", "Good pacing", "Professional tone"],
                "improvements": ["Reduce filler words", "Add more specific examples", "Stronger opening"]
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
async def analyze_speech(
    transcript: str = Form(...),
    userGoal: str = Form(...),
    duration: int = Form(0),  # Duration in seconds
    audio: UploadFile = File(None)
):
    """
    Analyze a speech transcript and audio recording, providing comprehensive feedback
    
    Args:
        transcript: The speech text (form field)
        userGoal: The user's intended message (form field)
        duration: Recording duration in seconds (form field)
        audio: Optional audio file of the speech (multipart/form-data)
        
    Returns:
        AnalyzeResponse with pace, filler words, AI summary, clarity score, and tip
    """
    try:
        print(f"=== Analyze Request Received ===")
        print(f"Transcript length: {len(transcript)} chars")
        print(f"Transcript preview: {transcript[:100]}...")
        print(f"UserGoal: {userGoal}")
        print(f"Duration: {duration} seconds")
        print(f"Audio file: {audio.filename if audio and hasattr(audio, 'filename') and audio.filename else 'None'}")
        
        # Validate inputs
        if not transcript or len(transcript.strip()) == 0:
            raise HTTPException(status_code=422, detail="Transcript cannot be empty")
        
        if not userGoal or len(userGoal.strip()) == 0:
            raise HTTPException(status_code=422, detail="User goal cannot be empty")
        
        # Save audio file if provided
        audio_path = None
        if audio and hasattr(audio, 'filename') and audio.filename:
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = audio.filename.split('.')[-1] if '.' in audio.filename else 'webm'
            audio_filename = f"recording_{timestamp}.{file_extension}"
            audio_path = AUDIO_STORAGE_DIR / audio_filename
            
            # Save the uploaded audio file
            with open(audio_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)
            
            print(f"Audio saved to: {audio_path}")
            print(f"Audio size: {audio_path.stat().st_size} bytes")
        
        # Calculate basic metrics (pace, filler words) from transcript
        metrics = calculate_metrics(transcript, duration)
        
        # Get AI-powered feedback (summary, clarity score, tip)
        # Pass audio_path to LLM function for future audio analysis
        llm_feedback = get_llm_feedback(transcript, userGoal, audio_path, duration)
        
        # Combine results into response
        response = AnalyzeResponse(
            pace=metrics["pace"],
            fillerWords=metrics["fillerWords"],
            aiSummary=llm_feedback["summary"],
            clarityScore=llm_feedback["clarityScore"],
            confidenceScore=llm_feedback["confidenceScore"],
            engagementScore=llm_feedback["engagementScore"],
            structureScore=llm_feedback["structureScore"],
            overall_score=llm_feedback["overall_score"],
            constructiveTip=llm_feedback["tip"],
            strengths=llm_feedback["strengths"],
            improvements=llm_feedback["improvements"]
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ========================================
# Analysis Functions
# ========================================

def calculate_metrics(transcript: str, duration: int = 0) -> Dict:
    """
    Calculate basic speech metrics from transcript
    
    Args:
        transcript: The speech text
        duration: Recording duration in seconds (0 if not provided)
        
    Returns:
        Dictionary with pace and filler words
    """
    # Count words for pace calculation
    words = transcript.split()
    word_count = len(words)
    
    # Calculate actual WPM if duration is provided
    if duration > 0:
        minutes = duration / 60.0
        pace = int(word_count / minutes) if minutes > 0 else 0
        print(f"✓ Calculating WPM: {word_count} words / {minutes:.2f} minutes = {pace} WPM")
    else:
        # Fallback: estimate based on average speaking pace
        estimated_minutes = word_count / 150  # Rough estimate
        pace = int(word_count / max(estimated_minutes, 0.5))  # Avoid division by zero
        print(f"⚠ Duration not provided, using estimated pace: {pace} WPM")
    
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
    
    print(f"✓ Metrics calculated: {word_count} words, {pace} WPM, {len(filler_words)} filler types")
    
    return {
        "pace": pace,
        "fillerWords": filler_words
    }


def get_llm_feedback(transcript: str, user_goal: str, audio_path: Optional[Path] = None, duration: int = 0) -> Dict:
    """
    Get AI-powered feedback using Gemini LLM API
    
    Args:
        transcript: The speech text
        user_goal: The user's intended message
        audio_path: Optional path to the audio file for tone/pace analysis
        duration: Recording duration in seconds
        
    Returns:
        Dictionary with summary, clarity score, and constructive tip
    """
    
    # Check if Gemini API is configured
    if not GEMINI_API_KEY:
        print("⚠ Gemini API not configured, using placeholder response")
        return {
            "summary": f"The speaker discussed their intended goal: {user_goal}",
            "clarityScore": 75,
            "confidenceScore": 70,
            "engagementScore": 65,
            "structureScore": 70,
            "overall_score": 7.0,
            "tip": "Configure GEMINI_API_KEY in .env file to get AI-powered feedback!",
            "strengths": ["Speech recorded successfully", "Basic structure present", "Clear intention"],
            "improvements": ["AI analysis unavailable", "Please configure GEMINI_API_KEY", "Enable full feedback system"]
        }
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Word count and duration for context
        word_count = len(transcript.split())
        duration_minutes = duration / 60.0 if duration > 0 else 0
        actual_wpm = int(word_count / duration_minutes) if duration_minutes > 0 else 0
        
        # Audio context note
        audio_note = ""
        if audio_path:
            audio_note = f"\n**AUDIO ANALYSIS NOTES:**\nAudio file provided: {audio_path.name} - Enable future audio analysis for tone, pacing, and confidence detection."
        else:
            audio_note = "\n**AUDIO ANALYSIS NOTES:**\nNo audio file provided - analysis based on transcript only."
        
        # Duration context
        duration_context = ""
        if duration > 0:
            duration_context = f"\n**SPEECH METRICS:**\n- Duration: {duration} seconds ({duration_minutes:.1f} minutes)\n- Word count: {word_count}\n- Speaking pace: {actual_wpm} WPM (ideal: 140-160 WPM)"
        
        # Construct comprehensive prompt
        prompt = f"""You are an expert public speaking coach analyzing a speech recording. Your goal is to provide constructive, actionable feedback to help the speaker improve.

**SPEAKER'S GOAL:** {user_goal}

**TRANSCRIPT TO ANALYZE:**
{transcript}
{duration_context}
{audio_note}

**CRITICAL SCORING INSTRUCTIONS:**
- Score HONESTLY based on the actual content quality
- DO NOT give similar scores to different speeches
- Each speech is unique and should have DISTINCT scores
- Poor speeches should score 40-60, average 60-75, good 75-85, excellent 85-95+
- Be CRITICAL but FAIR - look for actual issues
- Consider speech length: very short speeches (<30 words) should generally score lower

**YOUR TASK:**
Analyze this SPECIFIC speech across multiple dimensions:

1. **CLARITY SCORE** (0-100):
   - How clearly did the speaker communicate their intended message?
   - Consider: organization, word choice, directness, coherence

2. **CONFIDENCE SCORE** (0-100):
   - How confident and assertive does the speaker sound?
   - Consider: use of hedging language, filler words, assertive statements

3. **ENGAGEMENT SCORE** (0-100):
   - How engaging and interesting is the content?
   - Consider: storytelling, examples, energy, audience connection

4. **STRUCTURE SCORE** (0-100):
   - How well-organized is the speech?
   - Consider: logical flow, clear beginning/middle/end, transitions

5. **OVERALL SCORE** (0-10, can use decimals like 8.5):
   - Holistic evaluation of the speech quality
   - Consider all factors: clarity, confidence, engagement, structure

6. **FILLER WORDS & VERBAL CRUTCHES**:
   - Note excessive use of: um, uh, like, you know, so, basically, actually, literally, kind of, sort of

7. **STRENGTHS** (3-4 specific points):
   - What did the speaker do well?
   - Be specific with examples

8. **IMPROVEMENTS** (3-4 specific actionable points):
   - What can be improved?
   - Be specific and actionable

9. **CONSTRUCTIVE FEEDBACK** (2-3 sentences):
   - Main improvement opportunity with actionable advice

**IMPORTANT GUIDELINES:**
- Be constructive and encouraging, not harsh
- Focus on actionable improvements
- Acknowledge what they did well
- Use specific examples from their speech
- Keep feedback concise and prioritized

**RESPONSE FORMAT:**
Return your analysis as a valid JSON object with this exact structure:
{{
  "summary": "one or two sentence summary of what the speaker communicated",
  "clarityScore": number_between_0_and_100,
  "confidenceScore": number_between_0_and_100,
  "engagementScore": number_between_0_and_100,
  "structureScore": number_between_0_and_100,
  "overall_score": number_between_0_and_10_with_decimals,
  "tip": "detailed constructive feedback with specific actionable advice (2-3 sentences)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}}

CRITICAL: Return ONLY the JSON object, no other text before or after. Ensure the JSON is valid and properly formatted."""

        # Call Gemini API
        print(f"🤖 Calling Gemini API for speech analysis...")
        response = model.generate_content(prompt)
        
        # Extract response text
        response_text = response.text.strip()
        print(f"📥 Received response from Gemini ({len(response_text)} chars)")
        
        # Parse JSON response
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        response_text = response_text.strip()
        
        # Parse JSON
        try:
            feedback_data = json.loads(response_text)
            
            # Validate required fields
            required_fields = ['summary', 'clarityScore', 'confidenceScore', 'engagementScore', 
                             'structureScore', 'overall_score', 'tip', 'strengths', 'improvements']
            if not all(key in feedback_data for key in required_fields):
                raise ValueError(f"Missing required fields in LLM response. Got: {list(feedback_data.keys())}")
            
            # Ensure scores are properly typed
            feedback_data['clarityScore'] = int(feedback_data['clarityScore'])
            feedback_data['confidenceScore'] = int(feedback_data['confidenceScore'])
            feedback_data['engagementScore'] = int(feedback_data['engagementScore'])
            feedback_data['structureScore'] = int(feedback_data['structureScore'])
            feedback_data['overall_score'] = float(feedback_data['overall_score'])
            
            # Clamp scores to valid ranges
            feedback_data['clarityScore'] = max(0, min(100, feedback_data['clarityScore']))
            feedback_data['confidenceScore'] = max(0, min(100, feedback_data['confidenceScore']))
            feedback_data['engagementScore'] = max(0, min(100, feedback_data['engagementScore']))
            feedback_data['structureScore'] = max(0, min(100, feedback_data['structureScore']))
            feedback_data['overall_score'] = max(0.0, min(10.0, feedback_data['overall_score']))
            
            print(f"✓ LLM analysis complete:")
            print(f"  - Clarity: {feedback_data['clarityScore']}/100")
            print(f"  - Confidence: {feedback_data['confidenceScore']}/100")
            print(f"  - Engagement: {feedback_data['engagementScore']}/100")
            print(f"  - Structure: {feedback_data['structureScore']}/100")
            print(f"  - Overall: {feedback_data['overall_score']}/10")
            return feedback_data
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Response text: {response_text[:200]}...")
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
    
    except Exception as e:
        print(f"❌ Error calling Gemini API: {e}")
        
        # Fallback response with all required fields
        return {
            "summary": f"Unable to generate AI feedback. Error: {str(e)[:100]}",
            "clarityScore": 70,
            "confidenceScore": 65,
            "engagementScore": 60,
            "structureScore": 70,
            "overall_score": 6.6,
            "tip": "The AI analysis service encountered an error. Please try again or check your API configuration.",
            "strengths": ["Speech recorded successfully", "Basic structure present"],
            "improvements": ["AI analysis unavailable", "Please configure GEMINI_API_KEY"]
        }


# ========================================
# Application Entry Point
# ========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
