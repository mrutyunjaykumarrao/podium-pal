# Podium Pal - Debugging & Validation Guide

## ✅ Quick Validation Checklist

Before running the app, verify:

### **Backend Setup**

- [ ] Python 3.8+ installed: `python --version`
- [ ] All dependencies installed: `pip install -r requirements.txt`
- [ ] Gemini API key is valid in `.env` file
- [ ] `.env` file is in the `backend/` folder (NOT in root)

### **Frontend Setup**

- [ ] Node.js installed: `node --version`
- [ ] npm dependencies installed: `npm install`
- [ ] Vite is configured: `vite.config.js` exists

---

## 🚀 Step-by-Step Testing

### **STEP 1: Start Backend**

**Windows (PowerShell):**

```powershell
cd backend
python main.py
```

**Expected output:**

```
✓ Gemini API configured successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**If you see errors, check:**

- Gemini API key is correct
- All packages installed: `pip install -r requirements.txt`

---

### **STEP 2: Start Frontend**

**In a NEW terminal:**

```powershell
cd frontend
npm run dev
```

**Expected output:**

```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**If you see errors, check:**

- `npm install` was run
- No TypeScript errors

---

### **STEP 3: Test the Application**

1. **Open browser**: `http://localhost:5173/`
2. **See the UI**: Should show Podium Pal with input field and recording button
3. **Enter a speech goal**: Type something like "I want to explain sales improved by 20%"
4. **Click "Start Recording"**

   - Should see "Listening... Speak now!" status
   - Check console (F12) for: `Speech recognition started successfully.`

5. **Speak clearly**: Say something related to your goal (at least 10-15 words)

   - Should see text appearing in "Live Transcript" section
   - Check console for: `Received speech result`

6. **Click "Stop Recording"**

   - Should see "Stopping..." then "Analyzing your speech..."
   - Check console for: `Sending to backend...`

7. **Wait for feedback** (5-10 seconds)
   - Should see "Analysis complete!"
   - Should see feedback report below with:
     - Clarity Score (big number)
     - Speaking Pace (WPM)
     - Filler Words
     - AI Summary
     - Constructive Tip

---

## 🔍 Debug Mode - Check Console Logs

Press **F12** in browser to open Developer Tools → Console tab

### **Successful flow should show:**

```
Speech Recognition initialized
STARTING RECORDING...
User goal: [your goal text]
Speech recognition started successfully.
Received speech result
Final transcript updated. Length: 42
Sending to backend...
Goal: [your goal]
Received feedback: {pace: 145, fillerWords: {...}, ...}
```

---

## 🐛 Common Issues & Fixes

### **Issue: "Speech Recognition initialized" but nothing happens**

**Solution:**

1. Click the lock icon in address bar
2. Allow microphone access
3. Refresh page (Ctrl+Shift+R)
4. Try again

---

### **Issue: Transcript appears but NO feedback**

**Check these in order:**

#### **1. Check Network Tab (F12 → Network)**

- Click "Start Recording" → Speak → "Stop Recording"
- Look for POST request to `http://localhost:8000/analyze`
- **Should see status: 200** (green checkmark)

If status is **500 (red)**:

```
Click the request → Response tab
You'll see the error message from backend
```

#### **2. Check Backend Terminal**

Should show:

```
=== ANALYSIS REQUEST ===
Goal: [your goal]
Transcript: [your speech]...
Metrics calculated: {'pace': 145, 'fillerWords': {...}}
LLM Feedback received: {'summary': '...', 'clarityScore': 92, 'tip': '...'}
Response prepared successfully
```

If you see errors here, scroll up to see what went wrong.

#### **3. Check Frontend Console (F12 → Console)**

Should show:

```
Sending to backend...
Received feedback: {...}
```

If you see errors, they'll be red in console.

---

### **Issue: Backend crashes or shows "Error configuring Gemini API"**

**Solution:**

1. Check `.env` file exists in `backend/` folder
2. Check file contains: `GEMINI_API_KEY=AIzaSyA0...` (your actual key)
3. **Verify the key is valid:**
   - Go to Google AI Studio (https://aistudio.google.com/)
   - Try to create a new API key
   - Get a working API key
   - Update `.env` file
4. Stop and restart backend: `python main.py`

---

### **Issue: "Could not get feedback. Is the backend server running?"**

**Solution:**

1. Make sure backend terminal shows no errors
2. Check backend is on `http://localhost:8000`
3. Go to browser and visit: `http://localhost:8000/`
   - Should see JSON response: `{"message": "Welcome to Podium Pal API", ...}`

---

### **Issue: Microphone permission denied**

**Solution:**

1. In browser address bar, click the 🔒 lock icon
2. Find "Microphone" permission
3. Change to "Allow"
4. Refresh page (Ctrl+Shift+R)
5. Try recording again

---

## 📊 Test Scenarios

### **Test 1: Short Speech**

- **Goal**: "Announce the project is complete"
- **Speak**: "The project is now complete and ready to launch"
- **Expected**: Should work, analyze, and return feedback

### **Test 2: Long Speech**

- **Goal**: "Explain our new product features"
- **Speak**: [longer speech with multiple sentences]
- **Expected**: Should handle longer transcripts

### **Test 3: With Filler Words**

- **Goal**: "Explain the solution"
- **Speak**: "Um, so basically, we have like, a solution that um, you know, is really good"
- **Expected**: Should detect multiple filler words: um, basically, like, you know

### **Test 4: Edge Case - Very Short**

- **Goal**: "Say yes"
- **Speak**: "Yes"
- **Expected**: May still work but might not have much to analyze

---

## 🔧 Advanced Debugging

### **Enable Network Request Logging in Backend**

Add this to `backend/main.py` after creating the app:

```python
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"Request: {request.method} {request.url.path}")
    print(f"Status: {response.status_code}")
    print(f"Time: {process_time:.3f}s")
    print(f"{'='*50}\n")
    return response
```

This will show every request/response in backend terminal.

---

### **Test Backend Directly (No Frontend)**

**Using cURL or Postman:**

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "hello so basically today I want to talk about our quarterly results you know they were quite good",
    "userGoal": "Clearly explain that our quarterly results were positive"
  }'
```

Should return:

```json
{
  "pace": 145,
  "fillerWords": {
    "basically": 1,
    "so": 1,
    "you know": 1
  },
  "aiSummary": "The speaker announced positive quarterly results.",
  "clarityScore": 85,
  "constructiveTip": "Remove filler words for more impact."
}
```

---

## 📝 Log Messages Explained

### **Frontend (Browser Console)**

| Message                                    | Meaning                        |
| ------------------------------------------ | ------------------------------ |
| `Speech Recognition initialized`           | ✅ Ready to record             |
| `STARTING RECORDING...`                    | User clicked "Start Recording" |
| `Speech recognition started successfully.` | ✅ Microphone is active        |
| `Received speech result`                   | Audio detected and transcribed |
| `Final transcript updated. Length: 42`     | Captured final words           |
| `Speech recognition ended.`                | Recording stopped              |
| `User stopped - analyzing transcript...`   | Sending to backend             |
| `Sending to backend...`                    | Making API call                |
| `Received feedback:`                       | ✅ Got response from backend   |
| `Error analyzing transcript:`              | ❌ Backend failed              |

### **Backend Terminal**

| Message                                | Meaning                     |
| -------------------------------------- | --------------------------- |
| `✓ Gemini API configured successfully` | ✅ API key is valid         |
| `✗ Error configuring Gemini API:`      | ❌ API key issue            |
| `=== ANALYSIS REQUEST ===`             | Request received            |
| `Metrics calculated:`                  | Basic analysis done         |
| `LLM Feedback received:`               | ✅ Gemini responded         |
| `Response prepared successfully`       | ✅ Sending back to frontend |
| `ERROR in analysis:`                   | ❌ Something failed         |

---

## 🎯 Success Criteria

Your app is working correctly when:

✅ **Recording Phase**

- Click "Start Recording" → status says "Listening... Speak now!"
- Speak → text appears in Live Transcript in real-time
- Click "Stop Recording" → status says "Analyzing your speech..."

✅ **Analysis Phase**

- Wait 5-10 seconds
- Status changes to "Analysis complete!"
- See "📊 Your Speech Analysis" section

✅ **Feedback Section Shows**

- Clarity Score: A number from 0-100
- Speaking Pace: Number + "words per minute"
- Filler Words: List or "No filler words detected"
- AI Summary: A sentence about your speech
- Constructive Tip: Personalized advice

✅ **No Errors**

- No red errors in browser console
- No red errors in backend terminal
- Network request shows status 200

---

## 🚨 If Still Having Issues

1. **Restart everything:**

   ```
   Close frontend terminal (Ctrl+C)
   Close backend terminal (Ctrl+C)
   Start backend again: python main.py
   Start frontend again: npm run dev
   Refresh browser page
   ```

2. **Check all files are present:**

   ```
   backend/
   ├── main.py              ← MUST EXIST
   ├── requirements.txt     ← MUST EXIST
   └── .env                 ← MUST EXIST (with API key)

   frontend/
   ├── package.json
   ├── vite.config.js
   └── src/
       ├── App.jsx          ← MUST EXIST
       └── components/
           ├── FeedbackReport.jsx      ← MUST EXIST
           └── TranscriptDisplay.jsx   ← MUST EXIST
   ```

3. **Check API key is valid:**

   - Visit: https://aistudio.google.com/
   - Try to create a new API key
   - If it works there, use it in `.env`

4. **Check ports are free:**
   - Backend uses `8000`
   - Frontend uses `5173`
   - If these ports are in use, close other applications

---

## 💡 Quick Reference

| Task                            | Command                                         |
| ------------------------------- | ----------------------------------------------- |
| Start Backend                   | `cd backend && python main.py`                  |
| Start Frontend                  | `cd frontend && npm run dev`                    |
| Install Dependencies (Backend)  | `cd backend && pip install -r requirements.txt` |
| Install Dependencies (Frontend) | `cd frontend && npm install`                    |
| Test Backend                    | `curl http://localhost:8000/`                   |
| Open App                        | `http://localhost:5173/`                        |
| Dev Tools                       | F12 (or Ctrl+Shift+I)                           |
| Clear Console                   | `clear()` or `console.clear()`                  |

---

Done! Your Podium Pal should now generate feedback from Gemini AI every time you record! 🎉
