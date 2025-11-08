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
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // ========================================
  // Backend Communication
  // ========================================
  const sendForAnalysis = useCallback(async (transcriptText, audioBlob) => {
    if (!userGoal.trim()) {
      alert('Please enter your speech goal before recording!');
      setStatusText('Ready to record');
      return;
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      alert('No speech detected. Please try recording again.');
      setStatusText('Ready to record');
      return;
    }

    // Create FormData to send both text and audio
    const formData = new FormData();
    formData.append('transcript', transcriptText);
    formData.append('userGoal', userGoal);
    
    // Add audio file only if it has data
    if (audioBlob && audioBlob.size > 0) {
      console.log('Adding audio to request:', audioBlob.size, 'bytes');
      formData.append('audio', audioBlob, 'recording.webm');
    } else {
      console.log('No audio to send (proceeding with transcript only)');
    }

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
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
          // Stop audio recording and send both transcript and audio
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          } else {
            // If media recorder already stopped, process immediately
            processRecording();
          }
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
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording, sendForAnalysis]);

  // ========================================
  // Audio Recording Functions
  // ========================================
  const processRecording = useCallback(() => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    console.log('Audio recorded:', audioBlob.size, 'bytes');
    
    // Only send if we have actual audio data
    if (audioBlob.size > 0) {
      sendForAnalysis(finalTranscriptRef.current.trim(), audioBlob);
    } else {
      console.warn('No audio data captured, sending transcript only');
      sendForAnalysis(finalTranscriptRef.current.trim(), null);
    }
    
    audioChunksRef.current = [];
  }, [sendForAnalysis]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Set up audio visualizer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Start visualizing audio levels
      visualizeAudio();
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        processRecording();
      };

      mediaRecorder.start();
      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Could not access microphone for audio recording. Please check permissions.');
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    analyser.fftSize = 512; // Increase for better frequency resolution
    analyser.smoothingTimeConstant = 0.3; // Lower value = more responsive
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!isRecording) {
        setAudioLevel(0);
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      
      // Focus on voice frequency range (85Hz - 3000Hz approximately)
      // Human voice is typically in the 85-255Hz (bass) to 2000-3000Hz (treble) range
      const voiceRange = dataArray.slice(5, 60); // Focus on voice frequencies
      
      // Calculate RMS (root mean square) for better sensitivity
      const rms = Math.sqrt(
        voiceRange.reduce((sum, value) => sum + value * value, 0) / voiceRange.length
      );
      
      // Normalize and boost sensitivity (0 = silence, 1 = loud)
      let normalizedLevel = Math.min(rms / 80, 1); // Adjusted threshold for better response
      
      // Apply slight smoothing but keep it responsive
      const smoothingFactor = 0.7;
      const currentLevel = audioLevel;
      normalizedLevel = currentLevel * (1 - smoothingFactor) + normalizedLevel * smoothingFactor;
      
      // Apply curve to make it more visually appealing (exponential response)
      normalizedLevel = Math.pow(normalizedLevel, 0.8);
      
      setAudioLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const stopAudioRecording = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Reset audio level
    setAudioLevel(0);
  };

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
        startAudioRecording(); // Start audio recording alongside transcription
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    } else {
      // Stop Recording
      setIsRecording(false);
      recognitionRef.current.stop();
      stopAudioRecording(); // Stop audio recording
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
          <div className="record-button-container">
            <button
              onClick={handleRecording}
              className={`record-btn-round ${isRecording ? 'recording' : ''}`}
              aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {/* Sound waves - 3 circles */}
              {isRecording && (
                <>
                  <div 
                    className="sound-wave wave-1" 
                    style={{ 
                      transform: `translate(-50%, -50%) scale(${1 + audioLevel * 0.4})`,
                      opacity: audioLevel * 0.8
                    }}
                  ></div>
                  <div 
                    className="sound-wave wave-2" 
                    style={{ 
                      transform: `translate(-50%, -50%) scale(${1 + audioLevel * 0.7})`,
                      opacity: audioLevel * 0.6
                    }}
                  ></div>
                  <div 
                    className="sound-wave wave-3" 
                    style={{ 
                      transform: `translate(-50%, -50%) scale(${1 + audioLevel * 1.0})`,
                      opacity: audioLevel * 0.4
                    }}
                  ></div>
                </>
              )}
              
              {/* Microphone icon */}
              <div className="mic-icon">
                {isRecording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </div>
            </button>
          </div>
          
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
