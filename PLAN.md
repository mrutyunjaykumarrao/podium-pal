# Podium Pal: Hackathon Project Plan

## 1. Core Concept

Podium Pal is a web app that helps users improve their public speaking. A user practices a speech, and our AI provides feedback on pace, filler words, and a unique "Clarity Score" that measures how well their core message was delivered.

## 2. Technical Architecture

- **Frontend:** React with Vite for fast development. We will use the browser's built-in `SpeechRecognition` (Web Speech API) for live transcription to maximize speed and simplicity.
- **Backend:** Python with FastAPI. It will expose a single, stateless POST endpoint `/analyze` that accepts text and returns a JSON analysis.

## 3. The 3-Phase Roadmap

**Phase 1: Frontend Transcription (Hours 1-8)**
- **Goal:** Get the core user interaction working.
- **Tasks:**
  - Build the HTML interface.
  - Implement JavaScript to handle microphone access.
  - Use the Web Speech API to capture speech and display the transcript in real-time.
  - Store the final transcript in a variable when the user stops recording.

**Phase 2: Backend Analysis (Hours 9-16)**
- **Goal:** Get the core AI logic working.
- **Tasks:**
  - Set up the FastAPI backend with the `/analyze` endpoint.
  - Implement Python logic to calculate Pace (WPM) and count filler words from a given transcript.
  - Integrate the Gemini (or other LLM) API.
  - Craft the precise LLM prompt to generate the AI Summary, Clarity Score, and a constructive tip.

**Phase 3: Integration & Polish (Hours 17-20)**
- **Goal:** Connect the two parts and create the final demo.
- **Tasks:**
  - Implement the `fetch` call in the frontend JavaScript to send the transcript to the backend.
  - Create the UI to display the JSON feedback from the backend in a clean dashboard.
  - Style the application and practice the final presentation.

## 4. API Contract: `POST /analyze`

This is the contract between our frontend and backend.

**Request Body (JSON):**
```json
{
  "transcript": "hello so basically today I want to talk about our quarterly results um you know they were quite good.",
  "userGoal": "Clearly explain that our quarterly results were positive."
}
```

**Response Body (JSON):**
```json
{
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
```
