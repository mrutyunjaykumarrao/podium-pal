# Podium Pal - Feedback Generation Flow Guide

## 📊 Current Project Architecture

Your Podium Pal application follows this flow:

```
Frontend (React) ─→ Speech Recognition ─→ Transcript → Backend (FastAPI) → Gemini API → Feedback
```

---

## 🔄 Step-by-Step Flow

### **Step 1: User Input** (Frontend)

- User enters their **speech goal** in the text input
- Example: _"Explain that our quarterly results were positive"_

### **Step 2: Start Recording** (Frontend - App.jsx)

```javascript
// User clicks "Start Recording"
→ Speech Recognition API starts listening
→ Captures audio from microphone
→ Converts speech to text in real-time
```

### **Step 3: Generate Live Transcript** (Frontend)

```javascript
// As user speaks:
finalTranscriptRef.current += finalTranscript;
→ Live transcript updates in TranscriptDisplay component
```

### **Step 4: Stop Recording & Send to Backend** (Frontend)

```javascript
// User clicks "Stop Recording"
→ Speech recognition stops
→ analyzeTranscript() is called
→ Sends to backend API:
   {
     "transcript": "full speech text",
     "userGoal": "user's stated goal"
   }
```

### **Step 5: Backend Analysis** (Backend - main.py)

The `/analyze` endpoint receives the request and does two things:

#### **A) Calculate Metrics** (calculate_metrics function)

- **Speaking Pace**: Calculates words per minute
- **Filler Words**: Detects "um", "uh", "like", "you know", "basically", etc.

#### **B) Get AI Feedback** (get_llm_feedback function) ⭐ **THIS IS WHERE GEMINI IS CALLED**

- Sends a **specialized prompt** to Google Gemini API
- Prompt asks Gemini to analyze:
  - How well the speech matches the user's goal
  - Provide a summary of the speech
  - Generate a clarity score (0-100)
  - Provide constructive feedback

### **Step 6: Gemini AI Analysis**

```
Gemini receives this prompt:

"You are an expert public speaking coach. Analyze the following speech
transcript and the user's stated goal.

**User's Stated Goal:** [user's goal]
**Speech Transcript:** [the transcript]

1. Provide a one-sentence summary
2. Rate clarity score (1-100)
3. Provide constructive tip

Return as JSON with keys: aiSummary, clarityScore, constructiveTip"
```

### **Step 7: Return Feedback** (Backend → Frontend)

Backend returns JSON response:

```json
{
  "pace": 145,
  "fillerWords": {
    "basically": 1,
    "um": 1
  },
  "aiSummary": "The speaker announced that quarterly results were positive.",
  "clarityScore": 92,
  "constructiveTip": "Great job! Remove 'um' for more confidence."
}
```

### **Step 8: Display Feedback** (Frontend - FeedbackReport.jsx)

- Shows all metrics in a beautiful card layout
- **Clarity Score**: Large, prominent number
- **Speaking Pace**: WPM with ideal range
- **Filler Words**: List of detected filler words
- **AI Summary**: What Gemini understood your speech was about
- **Constructive Tip**: Personalized feedback from Gemini

---

## ✅ What Was Fixed

### **Issue 1: Async/Await Problem**

❌ **Before**: `async def get_llm_feedback()` with `await model.generate_content_async()`
✅ **After**: Synchronous `def get_llm_feedback()` with `model.generate_content()`

- **Why**: The async method wasn't working reliably. Using sync is simpler and more stable.

### **Issue 2: JSON Parsing**

✅ **Fixed**: Better error handling for JSON responses from Gemini

- Handles string numbers: `"92"` → `92`
- Handles float numbers: `92.5` → `92`
- Graceful fallback if parsing fails

### **Issue 3: Logging**

✅ **Added**: Debug print statements to track:

- When analysis starts
- What metrics are calculated
- What Gemini returns
- Any errors that occur

---

## 🔧 How to Test Everything

### **Test 1: Check Backend is Running**

```bash
cd backend
python main.py
```

Should see:

```
✓ Gemini API configured successfully
Uvicorn running on http://0.0.0.0:8000
```

### **Test 2: Check Frontend is Connected**

```bash
cd frontend
npm run dev
```

Open browser and check console (F12) for:

- "Speech Recognition initialized"
- No CORS errors

### **Test 3: Do a Full Speech**

1. Type your speech goal
2. Click "Start Recording"
3. Speak clearly (at least 10-15 words)
4. Click "Stop Recording"
5. Check:
   - ✅ Transcript appears in "Live Transcript"
   - ✅ Feedback section appears below
   - ✅ Clarity Score shows (0-100)
   - ✅ AI Summary describes your speech
   - ✅ Constructive Tip provides feedback

---

## 🌐 Environment Variables

**Backend (.env file must have):**

```
GEMINI_API_KEY=your_actual_api_key_here
```

Your current key is set in the `.env` file. Make sure it's valid!

---

## 📁 File Structure Explained

```
backend/
├── main.py                  ← FastAPI app with /analyze endpoint
├── requirements.txt         ← Python dependencies
└── .env                     ← Gemini API key

frontend/
├── src/
│   ├── App.jsx             ← Main app, handles recording & state
│   ├── components/
│   │   ├── TranscriptDisplay.jsx  ← Shows live transcript
│   │   └── FeedbackReport.jsx     ← Shows feedback (THIS DISPLAYS GEMINI'S OUTPUT!)
│   └── ...
```

---

## 🚀 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PODIUM PAL FLOW                          │
└─────────────────────────────────────────────────────────────┘

    Frontend (React)                Backend (FastAPI)         Gemini API
         │                                │                        │
         ├─ User enters goal              │                        │
         ├─ Start Recording               │                        │
         ├─ Capture speech audio          │                        │
         ├─ Display live transcript       │                        │
         └─ Stop Recording                │                        │
              │                            │                        │
              ├────────────────────────────→ POST /analyze           │
              │    {transcript, goal}      │                        │
              │                            ├─ Calculate metrics     │
              │                            ├─ Prepare prompt       │
              │                            └────────────────────→  │
              │                                    │                │
              │                                    ├─ Analyze speech│
              │                                    ├─ Generate JSON │
              │                            ←───────────────────────┤
              │                            │ {summary, score, tip} │
              │                            │                        │
              │ ←─────────────────────────── Return response        │
              │ {pace, fillers, feedback}  │                        │
              │                            │                        │
         Display Feedback Section         │                        │
         - Clarity Score                  │                        │
         - Speaking Pace                  │                        │
         - Filler Words                   │                        │
         - AI Summary                     │                        │
         - Constructive Tip               │                        │
```

---

## 🐛 Troubleshooting

### **"Feedback is not showing"**

1. Check backend is running: `python main.py`
2. Check for errors in browser console (F12)
3. Check backend terminal for error messages
4. Make sure Gemini API key is valid

### **"Microphone not working"**

1. Check browser permissions (click lock icon in address bar)
2. Allow microphone access
3. Try a different browser (Chrome or Edge preferred)

### **"Analysis failed" error**

1. Check network tab in browser developer tools
2. Verify backend is responding at `localhost:8000`
3. Check backend logs for the actual error

---

## 💡 How Gemini Prompting Works

The prompt you send to Gemini determines the feedback quality. Your current prompt:

```
You are an expert public speaking coach. Analyze the following speech
transcript and the user's stated goal.

**User's Stated Goal:** "{user_goal}"
**Speech Transcript:** "{transcript}"

Based on the above, perform the following tasks:
1. Provide a one-sentence summary of what the speech was actually about.
2. On a scale of 1-100, provide a "Clarity Score" that rates how well
   the transcript's main point matches the user's stated goal.
3. Provide a single, brief, and constructive tip for improvement.

Return your analysis as a single, minified JSON object with the following
keys: "aiSummary", "clarityScore", "constructiveTip". Do not include any
other text, explanations, or markdown formatting.
```

**Key parts:**

- ✅ Sets context ("expert public speaking coach")
- ✅ Provides both goal and transcript
- ✅ Specifies format (JSON)
- ✅ Defines exact keys expected
- ✅ Forbids extra text (ensures clean JSON)

---

## 📝 Summary

Your application now correctly:

1. ✅ Captures voice using Web Speech API
2. ✅ Sends transcript + goal to backend
3. ✅ Backend sends to Gemini with smart prompt
4. ✅ Gemini analyzes and returns structured feedback
5. ✅ Frontend displays beautiful feedback report

Everything is connected and should work! 🎉
