# Audio Data Collection Documentation

## Overview
Podium Pal now captures **both transcript text and audio recordings** for comprehensive speech analysis.

---

## What Data is Collected?

### 1. **Audio Recording** 🎙️
- **Format**: WebM audio (browser native)
- **Source**: User's microphone via `MediaRecorder API`
- **Storage**: Saved to `backend/audio_recordings/` directory
- **Filename Pattern**: `recording_YYYYMMDD_HHMMSS.webm`
- **Purpose**: Enable AI analysis of:
  - 🎵 **Tone & Pitch**: Confidence, enthusiasm, nervousness
  - ⏸️ **Pauses & Delays**: Hesitation patterns, thinking pauses
  - 📊 **Speaking Rhythm**: Pace variations, cadence
  - 🔊 **Volume Consistency**: Projection and clarity
  - 😊 **Emotional Tone**: Emotional state detection

### 2. **Transcript Text** 📝
- **Source**: Web Speech API (Chrome/Edge)
- **Content**: Real-time speech-to-text conversion
- **Transmission**: Sent as form field to backend
- **Purpose**: Text-based analysis of content and filler words

### 3. **User Goal** 🎯
- **Input**: User-provided text field
- **Purpose**: Context for analyzing speech effectiveness

---

## Data Flow

```
User speaks 
    ↓
┌───────────────────────────┐
│  Browser Captures:         │
│  1. Audio (MediaRecorder)  │
│  2. Text (Web Speech API)  │
└───────────────────────────┘
    ↓
┌───────────────────────────┐
│  POST /analyze             │
│  FormData:                 │
│  - transcript: string      │
│  - userGoal: string        │
│  - audio: File (webm)      │
└───────────────────────────┘
    ↓
┌───────────────────────────┐
│  Backend Processing:       │
│  1. Save audio file        │
│  2. Analyze transcript     │
│  3. (Future) Analyze audio │
└───────────────────────────┘
    ↓
┌───────────────────────────┐
│  Return Feedback:          │
│  - Pace (WPM)              │
│  - Filler words            │
│  - AI summary              │
│  - Clarity score           │
│  - Improvement tips        │
└───────────────────────────┘
```

---

## Implementation Details

### Frontend Changes (`frontend/src/App.jsx`)

#### New Refs:
```javascript
const mediaRecorderRef = useRef(null);      // MediaRecorder instance
const audioChunksRef = useRef([]);          // Audio data chunks
const audioStreamRef = useRef(null);        // Microphone stream
```

#### New Functions:
- **`startAudioRecording()`**: Initializes MediaRecorder and begins capturing
- **`stopAudioRecording()`**: Stops recording and releases microphone
- **`processRecording()`**: Creates audio Blob and sends to backend

#### Modified Functions:
- **`sendForAnalysis()`**: Now uses `FormData` instead of JSON to send audio file
- **`handleRecording()`**: Starts/stops both speech recognition AND audio recording

### Backend Changes (`backend/main.py`)

#### New Imports:
```python
from fastapi import File, UploadFile, Form
from pathlib import Path
from datetime import datetime
import shutil
```

#### New Configuration:
```python
AUDIO_STORAGE_DIR = Path("audio_recordings")
AUDIO_STORAGE_DIR.mkdir(exist_ok=True)
```

#### Modified Endpoint:
```python
@app.post("/analyze")
async def analyze_speech(
    transcript: str = Form(...),
    userGoal: str = Form(...),
    audio: Optional[UploadFile] = File(None)  # NEW
):
    # Saves audio file with timestamp
    # Passes audio_path to LLM function for future analysis
```

#### Modified Function:
```python
def get_llm_feedback(transcript, user_goal, audio_path=None):
    # Now accepts audio_path parameter
    # Ready for audio analysis implementation
```

---

## Future Audio Analysis Capabilities

When LLM integration is complete, the audio file will enable:

### 1. **Prosody Analysis**
- Pitch variations and monotony detection
- Stress and emphasis patterns
- Intonation appropriateness

### 2. **Timing Analysis**
- Actual speaking rate (not estimated from word count)
- Pause frequency and duration
- Rhythm and pacing variations
- Rush vs. dragging detection

### 3. **Vocal Quality**
- Volume consistency and projection
- Clarity of articulation
- Breathiness or strain detection

### 4. **Emotional Analysis**
- Confidence level detection
- Nervousness indicators (voice tremor, rushed speech)
- Enthusiasm and engagement level

### 5. **Advanced Metrics**
- Sentence-level pacing
- Filler word timing (clustered vs. distributed)
- Energy level throughout speech
- Authenticity and naturalness

---

## Privacy & Storage

### Current Implementation:
- ✅ Audio files saved locally in `backend/audio_recordings/`
- ✅ Ignored by git (added to `.gitignore`)
- ❌ No database persistence
- ❌ No automatic deletion
- ❌ No user authentication/session tracking

### Recommendations for Production:
1. **Retention Policy**: Auto-delete recordings after N days
2. **User Consent**: Explicit opt-in for audio storage
3. **Encryption**: Encrypt stored audio files at rest
4. **Cloud Storage**: Move to S3/GCS with lifecycle policies
5. **GDPR Compliance**: Allow users to request data deletion
6. **Anonymization**: Strip metadata from audio files

---

## Dependencies Added

### Backend (`requirements.txt`):
```
python-multipart==0.0.6  # Required for FastAPI file uploads
```

### Frontend:
No new npm packages required (uses native browser APIs)

---

## Testing the Audio Capture

1. Start backend: `uvicorn main:app --reload` (from `backend/` folder)
2. Start frontend: `npm run dev` (from `frontend/` folder)
3. Enter a speech goal
4. Click "Start Recording" (grants microphone permission)
5. Speak for 5-10 seconds
6. Click "Stop Recording"
7. Check `backend/audio_recordings/` for the saved `.webm` file
8. Check browser DevTools console for audio size logs

---

## Next Steps

1. **Install Backend Dependency**:
   ```bash
   cd backend
   pip install python-multipart
   ```

2. **Test Audio Capture**: Verify recordings are saved correctly

3. **Implement Audio Analysis**: 
   - Use libraries like `librosa`, `pydub`, or `speech_recognition`
   - OR use Gemini multimodal API for audio analysis
   - Extract tone, pace, pause patterns

4. **Integrate with LLM**: Pass audio insights to Gemini for holistic feedback

---

## Files Modified

### Frontend:
- ✅ `frontend/src/App.jsx` - Added audio recording logic

### Backend:
- ✅ `backend/main.py` - Added audio file handling
- ✅ `backend/requirements.txt` - Added `python-multipart`

### Configuration:
- ✅ `.gitignore` - Added `backend/audio_recordings/`

### Documentation:
- ✅ `AUDIO_DATA_COLLECTION.md` - This file

---

## Technical Notes

### Audio Format:
- **WebM** is the default format from MediaRecorder on Chrome/Edge
- For Safari support, may need to handle **MP4/AAC** format
- Backend accepts any format (saves as-is)

### Browser Compatibility:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ⚠️ Safari: May use different audio codec (MP4 instead of WebM)

### File Sizes:
- Typical: ~50-100 KB per minute of speech
- 5-minute speech: ~250-500 KB
- 10-minute presentation: ~500-1000 KB

---

## Questions or Issues?

If audio recording fails:
1. Check browser console for errors
2. Verify microphone permissions granted
3. Ensure backend `audio_recordings/` folder exists
4. Check backend logs for file save errors
