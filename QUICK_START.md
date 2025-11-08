# 🚀 Podium Pal - Quick Start Guide (5 Minutes)

## ⚡ TL;DR - Get Running in 5 Minutes

### **Prerequisites Check**

```powershell
# Check Python installed
python --version    # Should be 3.8+

# Check Node installed
node --version      # Should be 14+
npm --version       # Should be 6+
```

---

## 🎯 Step-by-Step Start

### **Step 1: Start Backend (Terminal 1)**

```powershell
cd backend
pip install -r requirements.txt
python main.py
```

**Expected Output:**

```
✓ Gemini API configured successfully
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### **Step 2: Start Frontend (Terminal 2)**

```powershell
cd frontend
npm install
npm run dev
```

**Expected Output:**

```
➜  Local:   http://localhost:5173/
➜  press h to show help
```

### **Step 3: Open Browser**

```
Go to: http://localhost:5173/
```

---

## 📸 Using the App

### **First Time Setup**

1. **Enter Speech Goal**

   ```
   Input Field: "What is the one key message of your speech?"
   Example: "Announce our sales increased by 30%"
   ```

2. **Click "Start Recording"**

   - You'll see: `Listening... Speak now!`
   - Microphone is active

3. **Speak Your Speech**

   - Speak clearly for 15-30 seconds
   - Watch transcript appear live below

4. **Click "Stop Recording"**

   - Status changes: `Analyzing your speech...`
   - Wait 5-10 seconds for AI

5. **See Feedback Section**

   ```
   📊 Your Speech Analysis

   Clarity Score: 85
   Speaking Pace: 145 WPM
   Filler Words: um (1x), like (2x)
   AI Summary: [What Gemini understood]
   💡 Tip: [Improvement advice from Gemini]
   ```

---

## ✅ Verify It's Working

### **Test 1: API Health**

```bash
curl http://localhost:8000/
# Should return JSON response
```

### **Test 2: Full Flow**

1. Enter: `"Explain our product is innovative"`
2. Speak: `"Our product is super innovative and really cool"`
3. Should see:
   - Filler words: `um`, `like`, `basically`
   - Clarity: ~75-85 (good clarity on message)
   - Tip: Something about removing fillers

---

## 🐛 Common Issues & Fixes

### **Issue: "Microphone permission denied"**

```
1. Click lock 🔒 icon in address bar
2. Select Microphone → Allow
3. Refresh page (Ctrl+R)
4. Try again
```

### **Issue: Backend shows "Error configuring Gemini API"**

```
1. Check .env file exists in backend/ folder
2. Verify it has: GEMINI_API_KEY=AIzaSy...
3. Restart backend: python main.py
```

### **Issue: "Could not get feedback" error**

```
1. Is backend running? (Check terminal)
2. Open http://localhost:8000/ in browser
   - Should show: {"message": "Welcome to Podium Pal API", ...}
3. Check backend logs for errors
4. Restart both backend and frontend
```

### **Issue: Nothing happens when I click "Start Recording"**

```
1. Check browser console (F12)
2. Look for errors
3. Check browser permissions
4. Try different browser (Chrome/Edge)
5. Refresh page
```

---

## 📊 Understanding the Feedback

### **Clarity Score**

- **90-100**: Perfect message delivery
- **75-89**: Good, clear communication
- **50-74**: Message somewhat unclear
- **0-49**: Message unclear or off-topic

### **Speaking Pace**

- **Ideal**: 140-160 WPM
- **Fast**: 160+ WPM (too fast)
- **Slow**: <140 WPM (may sound uncertain)

### **Filler Words**

- Common: `um`, `uh`, `like`, `you know`, `basically`, `so`
- **None detected**: ✓ Excellent
- **1-2**: Good, minimal impact
- **3+**: Try to reduce

---

## 🎓 Example Scenarios

### **Scenario 1: Good Speech**

```
Goal: "Announce project is complete"
Speech: "The project is now complete and ready for launch"
Result:
  Clarity: 95 ✅
  Pace: 145 WPM ✅
  Fillers: None ✅
  Tip: "Excellent delivery! Consider adding one sentence about next steps."
```

### **Scenario 2: Room for Improvement**

```
Goal: "Explain our solution"
Speech: "Um, so like, we have a solution that um basically is really good you know"
Result:
  Clarity: 65 ⚠️
  Pace: 120 WPM ⚠️
  Fillers: um (2), so (1), like (1), basically (1), you know (1)
  Tip: "Remove filler words and speak at a natural pace. Practice beforehand."
```

### **Scenario 3: Off Topic**

```
Goal: "Announce new product"
Speech: "The weather is nice today and I like coffee"
Result:
  Clarity: 10 ❌
  Pace: 140 WPM
  Fillers: like (1)
  Tip: "Your speech doesn't match your goal. Focus on the product announcement."
```

---

## 📁 Project Structure

```
backend/
├── main.py                 ← API code (FIXED!)
├── requirements.txt        ← Python packages
└── .env                    ← API key

frontend/
├── src/
│   ├── App.jsx            ← Main component
│   └── components/
│       ├── FeedbackReport.jsx  ← Shows feedback
│       └── TranscriptDisplay.jsx ← Shows transcript
├── package.json
└── vite.config.js
```

---

## 🔧 What Got Fixed

**The Main Issue:** Feedback wasn't showing because:

- ❌ Async function trying to call non-existent async API
- ❌ Type conversion errors on clarity score
- ❌ No error logging

**The Fix:**

- ✅ Changed to synchronous Gemini call
- ✅ Added automatic type conversion (string/float → int)
- ✅ Added detailed logging at each step
- ✅ Added graceful error handling

Now it works reliably! 🎉

---

## 📚 Full Documentation

- **COMPLETE_INTEGRATION_GUIDE.md** - Architecture & flow
- **FEEDBACK_FLOW_GUIDE.md** - Detailed process explanation
- **DEBUGGING_GUIDE.md** - Troubleshooting (20+ scenarios)
- **QUICK_VISUAL_SUMMARY.md** - Diagrams & visual explanations

---

## 💡 Pro Tips

### **Tip 1: Test Backend Directly**

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "our sales grew 20 percent",
    "userGoal": "Announce sales growth"
  }'
```

This helps isolate if issues are backend or frontend.

### **Tip 2: Watch Backend Terminal**

The backend logs show exactly what's happening:

```
=== ANALYSIS REQUEST ===
Goal: [user's goal]
Transcript: [the speech]
Metrics calculated: {pace: 145, fillerWords: {...}}
LLM Feedback received: {summary: '...', clarityScore: 85, tip: '...'}
Response prepared successfully
```

### **Tip 3: Check Browser DevTools**

Press F12 and look at:

- **Console**: See logs & errors
- **Network**: See API requests/responses
- **Application**: Check stored data

### **Tip 4: Restart Everything**

If something acts weird:

```
1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Restart backend: python main.py
4. Restart frontend: npm run dev
5. Refresh browser: Ctrl+R
```

---

## 🎯 Next Steps

1. **Run the app** (follow steps above)
2. **Test with different speeches** (try scenarios above)
3. **Watch the logs** (terminal shows what's happening)
4. **Read the docs** (COMPLETE_INTEGRATION_GUIDE.md for deeper understanding)
5. **Customize prompts** (edit the prompt in backend/main.py to change feedback)

---

## 🆘 Still Having Issues?

1. **Check error logs**

   - Backend terminal (red text)
   - Browser console (F12, red text)

2. **Verify setup**

   - Backend running on 8000?
   - Frontend running on 5173?
   - Gemini API key valid?

3. **Read the guides**

   - DEBUGGING_GUIDE.md has 20+ solutions
   - COMPLETE_INTEGRATION_GUIDE.md explains everything

4. **Reset everything**
   ```powershell
   # Delete node_modules and reinstall
   cd frontend
   rm -r node_modules
   npm install
   npm run dev
   ```

---

## ✨ Summary

Your Podium Pal is now ready to:

- ✅ Record voice
- ✅ Generate transcript
- ✅ Send to Gemini AI
- ✅ Get intelligent feedback
- ✅ Display beautifully

**Go help people improve their public speaking!** 🚀

---

**Created:** 2025-11-08 | **Status:** ✅ Ready to Use
