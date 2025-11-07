# Podium Pal - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Chrome or Edge browser (for Web Speech API support)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

5. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### Testing the Application

1. Open `http://localhost:5173` in Chrome or Edge
2. Enter your speech goal (e.g., "Explain our positive quarterly results")
3. Click "Start Recording" and allow microphone access
4. Speak your practice speech
5. Click "Stop Recording"
6. View your AI-powered feedback!

## 📋 Development Roadmap

Follow the 3-phase plan outlined in `PLAN.md`:

- **Phase 1 (Hours 1-8):** Frontend transcription ✅
- **Phase 2 (Hours 9-16):** Backend AI analysis (TODO: Implement LLM integration)
- **Phase 3 (Hours 17-20):** Polish and presentation prep

## 🔑 API Key Setup

To get full AI features working:

1. Get a Gemini API key from: https://makersuite.google.com/app/apikey
2. Add it to `backend/.env`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Update the `get_llm_feedback()` function in `backend/main.py` with the actual LLM integration code (see TODO comments)

## 🎯 Next Steps

1. Test the basic transcription flow
2. Implement the LLM integration in the backend
3. Refine the clarity score algorithm
4. Add styling polish
5. Practice your demo presentation!

Good luck with the hackathon! 🏆
