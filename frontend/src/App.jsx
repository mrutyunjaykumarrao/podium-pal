import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import TranscriptDisplay from './components/TranscriptDisplay';
import FeedbackReport from './components/FeedbackReport';

function App() {
  // State Management
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [statusText, setStatusText] = useState('Ready to record');
  const [feedback, setFeedback] = useState(null);
  
  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // ========================================
  // Backend Communication
  // ========================================
  const sendForAnalysis = useCallback(async (transcriptText) => {
    if (!userGoal.trim()) {
      alert('Please enter your speech goal before recording!');
      setStatusText('Ready to record');
      return;
    }

    const requestBody = {
      transcript: transcriptText,
      userGoal: userGoal
    };

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data);
      setStatusText('✓ Analysis complete!');
      
    } catch (error) {
      console.error('Error sending transcript for analysis:', error);
      setStatusText('Failed to analyze. Is the backend running?');
      alert('Could not connect to the backend. Please make sure the FastAPI server is running on http://localhost:8000');
    }
  }, [userGoal]);

  // ========================================
  // Speech Recognition Setup
  // ========================================
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Event Handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setStatusText('🎤 Listening... Speak now!');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatusText(`Error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      if (!isRecording) {
        // Recording was stopped by user
        setStatusText('✓ Recording complete. Analyzing...');
        
        if (finalTranscriptRef.current.trim()) {
          sendForAnalysis(finalTranscriptRef.current.trim());
        } else {
          setStatusText('No speech detected. Please try again.');
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, sendForAnalysis]);

  // ========================================
  // Recording Control
  // ========================================
  const handleRecording = () => {
    if (!recognitionRef.current) return;

    if (!isRecording) {
      // Start Recording
      setIsRecording(true);
      finalTranscriptRef.current = '';
      setTranscript('');
      setFeedback(null);
      
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    } else {
      // Stop Recording
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎤 Podium Pal</h1>
        <p className="tagline">Your Personal AI Public Speaking Coach</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <label htmlFor="userGoalInput">
            What is the one key message of your speech?
          </label>
          <input
            type="text"
            id="userGoalInput"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder="e.g., Explain our positive quarterly results"
            autoComplete="off"
          />
        </div>

        <div className="recording-section">
          <button
            onClick={handleRecording}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
          </button>
          <p className={`status-text ${
            statusText.includes('Error') ? 'error' : 
            statusText.includes('✓') ? 'success' : ''
          }`}>
            {statusText}
          </p>
        </div>

        <TranscriptDisplay transcript={transcript} />
        
        {feedback && <FeedbackReport data={feedback} />}
      </main>

      <footer className="footer">
        <p>Built with ❤️ for hackathon excellence</p>
      </footer>
    </div>
  );
}

export default App;
