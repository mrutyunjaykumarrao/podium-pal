import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import "./App.css";
import TranscriptDisplay from "./components/TranscriptDisplay";
import FeedbackReport from "./components/FeedbackReport";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MicrophoneIcon,
  LightbulbIcon,
  SparklesIcon,
  ChartBarIcon,
  FileTextIcon,
  TargetIcon,
  UsersIcon,
  BriefcaseIcon,
  AwardIcon,
  StarIcon,
} from "./components/Icons";

function App() {
  // State Management
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [statusText, setStatusText] = useState(
    "Ready to record"
  );
  const [feedback, setFeedback] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [recordingDuration, setRecordingDuration] =
    useState(0);
  const [recordingHistory, setRecordingHistory] = useState(
    []
  );

  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const userGoalRef = useRef(""); // Store goal before clearing
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Load recording history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(
      "podiumPalHistory"
    );
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        // Sort: pinned items first, then by timestamp
        history.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
        setRecordingHistory(history);
      } catch (e) {
        console.error(
          "Failed to load recording history:",
          e
        );
      }
    }
  }, []);

  // Save recording to history
  const saveToHistory = useCallback(
    (recordingData) => {
      const newRecording = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        isPinned: false,
        ...recordingData,
      };

      const updatedHistory = [
        newRecording,
        ...recordingHistory,
      ].slice(0, 10); // Keep last 10
      setRecordingHistory(updatedHistory);
      localStorage.setItem(
        "podiumPalHistory",
        JSON.stringify(updatedHistory)
      );
    },
    [recordingHistory]
  );

  // Delete recording from history
  const deleteRecording = useCallback(
    (recordingId, e) => {
      e.stopPropagation(); // Prevent triggering the click to view
      const updatedHistory = recordingHistory.filter(
        (r) => r.id !== recordingId
      );
      setRecordingHistory(updatedHistory);
      localStorage.setItem(
        "podiumPalHistory",
        JSON.stringify(updatedHistory)
      );
    },
    [recordingHistory]
  );

  // Toggle pin status
  const togglePin = useCallback(
    (recordingId, e) => {
      e.stopPropagation(); // Prevent triggering the click to view
      const updatedHistory = recordingHistory.map((r) =>
        r.id === recordingId
          ? { ...r, isPinned: !r.isPinned }
          : r
      );
      // Sort: pinned items first, then by timestamp
      updatedHistory.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.timestamp) - new Date(a.timestamp)
        );
      });
      setRecordingHistory(updatedHistory);
      localStorage.setItem(
        "podiumPalHistory",
        JSON.stringify(updatedHistory)
      );
    },
    [recordingHistory]
  );

  // ========================================
  // Backend Communication
  // ========================================
  const sendForAnalysis = useCallback(
    async (transcriptText, audioBlob, duration, words) => {
      // Use the ref value which was saved before clearing
      const goalToUse = userGoalRef.current;

      if (!goalToUse || !goalToUse.trim()) {
        alert(
          "Please enter your speech goal before recording!"
        );
        setStatusText("Ready to record");
        return;
      }

      if (
        !transcriptText ||
        transcriptText.trim().length === 0
      ) {
        alert(
          "No speech detected. Please try recording again."
        );
        setStatusText("Ready to record");
        return;
      }

      // Create FormData to send both text and audio
      const formData = new FormData();
      formData.append("transcript", transcriptText);
      formData.append("userGoal", goalToUse);
      formData.append("duration", duration.toString()); // Send actual duration in seconds

      // Add audio file only if it has data
      if (audioBlob && audioBlob.size > 0) {
        console.log(
          "Adding audio to request:",
          audioBlob.size,
          "bytes"
        );
        formData.append(
          "audio",
          audioBlob,
          "recording.webm"
        );
      } else {
        console.log(
          "No audio to send (proceeding with transcript only)"
        );
      }

      try {
        const response = await fetch(
          "http://localhost:8000/analyze",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Backend error response:",
            errorText
          );
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Analysis response:", data);
        setFeedback(data);
        setStatusText("✓ Analysis complete!");

        // Navigate to feedback page if sessionId present
        try {
          if (data && data.sessionId) {
            console.log(
              "Navigating to /feedback/",
              data.sessionId
            );
            window.location.href = `/feedback/${data.sessionId}`;
          }
        } catch (navErr) {
          console.error("Navigation error:", navErr);
        }

        // Save to recording history with actual values
        const durationMinutes = duration / 60;
        const wpm =
          durationMinutes > 0
            ? Math.round(words / durationMinutes)
            : 0;

        saveToHistory({
          goal: goalToUse, // Use the saved goal from ref
          transcript: transcriptText, // Full transcript
          transcriptPreview:
            transcriptText.substring(0, 100) + "...", // Preview for display
          duration: duration,
          wordCount: words,
          wpm: wpm,
          score: data.overall_score || 0,
          feedback: data,
        });
      } catch (error) {
        console.error(
          "Error sending transcript for analysis:",
          error
        );
        setStatusText(
          "Failed to analyze. Is the backend running?"
        );
        alert(
          "Could not connect to the backend. Please make sure the FastAPI server is running on http://localhost:8000"
        );
      }
    },
    [userGoal, saveToHistory]
  );

  // ========================================
  // Speech Recognition Setup
  // ========================================
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Sorry, your browser does not support speech recognition. Please use Chrome or Edge."
      );
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Event Handlers
    recognition.onstart = () => {
      console.log("Speech recognition started");
      setStatusText("🎤 Listening... Speak now!");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcriptPart =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current +=
            transcriptPart + " ";
        } else {
          interimTranscript += transcriptPart;
        }
      }

      setTranscript(
        finalTranscriptRef.current + interimTranscript
      );

      // Update word count
      const words = (
        finalTranscriptRef.current + interimTranscript
      )
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      // Ignore 'no-speech' and 'aborted' errors as they're expected when stopping
      if (
        event.error === "no-speech" ||
        event.error === "aborted"
      ) {
        console.log("Ignorable error:", event.error);
        return; // Don't change state for these errors
      }

      // Handle specific error types
      let errorMessage = "Recording error occurred";
      if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        errorMessage =
          "Microphone permission denied. Please allow microphone access in your browser settings.";
      } else if (event.error === "network") {
        errorMessage =
          "Network error. Please check your internet connection.";
      } else if (event.error === "audio-capture") {
        errorMessage =
          "No microphone detected. Please connect a microphone.";
      }

      // For real errors, show message and stop recording
      setStatusText(`❌ ${errorMessage}`);
      setIsRecording(false);

      // Clean up audio recording
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      stopAudioRecording();

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");

      // Don't automatically set isRecording to false here
      // Let the handleRecording function manage the state

      // Only process if we have transcript and user intentionally stopped
      if (finalTranscriptRef.current.trim()) {
        setStatusText("✓ Recording complete. Analyzing...");

        // Stop audio recording and send both transcript and audio
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        } else {
          // If media recorder already stopped, process immediately
          processRecording();
        }
      } else {
        setStatusText(
          "🎤 Ready to record your next speech"
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []); // Empty dependency array - only set up once

  // ========================================
  // Audio Recording Functions
  // ========================================
  const processRecording = useCallback(() => {
    const audioBlob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });
    console.log("Audio recorded:", audioBlob.size, "bytes");

    // Calculate final stats
    const words = finalTranscriptRef.current
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    // Calculate actual duration from start time
    const duration = recordingStartTimeRef.current
      ? Math.floor(
          (Date.now() - recordingStartTimeRef.current) /
            1000
        )
      : 0;

    console.log("Recording stats:", {
      words,
      duration,
      wpm:
        duration > 0
          ? Math.round((words / duration) * 60)
          : 0,
    });

    // Only send if we have actual audio data
    if (audioBlob.size > 0) {
      sendForAnalysis(
        finalTranscriptRef.current.trim(),
        audioBlob,
        duration,
        words
      );
    } else {
      console.warn(
        "No audio data captured, sending transcript only"
      );
      sendForAnalysis(
        finalTranscriptRef.current.trim(),
        null,
        duration,
        words
      );
    }

    audioChunksRef.current = [];
  }, [sendForAnalysis]);

  const startAudioRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      audioStreamRef.current = stream;

      // Set up audio visualizer
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source =
        audioContext.createMediaStreamSource(stream);
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
        console.log("MediaRecorder stopped");
        processRecording();
      };

      mediaRecorder.start();
      console.log("Audio recording started");
    } catch (error) {
      console.error(
        "Error starting audio recording:",
        error
      );

      // Stop everything and show error
      setIsRecording(false);

      // Determine error type
      let errorMessage =
        "Could not access microphone. Please check permissions.";
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage =
          "No microphone found. Please connect a microphone and try again.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage =
          "Microphone is already in use by another application.";
      }

      setStatusText(`❌ ${errorMessage}`);

      // Stop speech recognition
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
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
        voiceRange.reduce(
          (sum, value) => sum + value * value,
          0
        ) / voiceRange.length
      );

      // Normalize and boost sensitivity (0 = silence, 1 = loud)
      let normalizedLevel = Math.min(rms / 80, 1); // Adjusted threshold for better response

      // Apply slight smoothing but keep it responsive
      const smoothingFactor = 0.7;
      const currentLevel = audioLevel;
      normalizedLevel =
        currentLevel * (1 - smoothingFactor) +
        normalizedLevel * smoothingFactor;

      // Apply curve to make it more visually appealing (exponential response)
      normalizedLevel = Math.pow(normalizedLevel, 0.8);

      setAudioLevel(normalizedLevel);
      animationFrameRef.current =
        requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopAudioRecording = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close audio context
    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      audioContextRef.current.close();
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Stop media recorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Reset audio level
    setAudioLevel(0);
  };

  // ========================================
  // Recording Control
  // ========================================
  const handleRecording = () => {
    if (!recognitionRef.current) {
      console.error("Recognition not initialized");
      return;
    }

    if (!isRecording) {
      // Validate goal before starting
      if (!userGoal.trim()) {
        alert(
          "Please enter your speech goal before recording!"
        );
        return;
      }

      // Start Recording
      console.log("Starting recording...");
      setIsRecording(true);

      // Save goal to ref so it persists after we clear the input
      userGoalRef.current = userGoal;

      finalTranscriptRef.current = "";
      setTranscript("");
      setFeedback(null);
      setWordCount(0);
      setRecordingDuration(0);
      recordingStartTimeRef.current = Date.now();
      audioChunksRef.current = []; // Clear previous audio chunks

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - recordingStartTimeRef.current) /
              1000
          );
          setRecordingDuration(elapsed);
        }
      }, 1000);

      try {
        // Start speech recognition
        recognitionRef.current.start();
        setStatusText("🎤 Listening... Speak now!");
        // Start audio recording
        startAudioRecording();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsRecording(false);

        let errorMsg =
          "Failed to start recording. Please try again.";
        if (e.message.includes("already started")) {
          errorMsg =
            "Recording is already in progress. Please wait.";
        }

        setStatusText(`❌ ${errorMsg}`);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      }
    } else {
      // Stop Recording
      console.log("Stopping recording...");
      setIsRecording(false);

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Clear the user goal input after stopping
      setUserGoal("");

      // Stop speech recognition
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }

      // Stop audio recording
      stopAudioRecording();
    }
  };

  const handleNewRecording = () => {
    setFeedback(null);
    setTranscript("");
    finalTranscriptRef.current = "";
    setStatusText("Ready to record");
    setWordCount(0);
    setRecordingDuration(0);
  };

  // Handle clicking a recording from history
  const handleRecordingClick = (recording) => {
    setFeedback(recording.feedback);
    setTranscript(recording.transcript);
    setUserGoal(recording.goal);
  };

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="app">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <h1>
                <MicrophoneIcon size={32} />
                <span style={{ marginLeft: "12px" }}>
                  Podium Pal
                </span>
              </h1>
              <p className="tagline">
                Your Personal AI Public Speaking Coach
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  {currentUser?.displayName || currentUser?.email}
                </p>
                {currentUser?.displayName && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
                    {currentUser?.email}
                  </p>
                )}
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="content-grid">
            {/* Left Column - Main Controls */}
            <div className="main-column">
              <div className="input-section">
                <label htmlFor="userGoalInput">
                  <LightbulbIcon
                    size={20}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "8px",
                    }}
                  />
                  What is the one key message of your
                  speech?
                </label>
                <input
                  type="text"
                  id="userGoalInput"
                  value={userGoal}
                  onChange={(e) =>
                    setUserGoal(e.target.value)
                  }
                  placeholder="e.g., Explain our positive quarterly results"
                  autoComplete="off"
                  disabled={isRecording}
                  aria-label="Speech goal input"
                />
                {!userGoal && !isRecording && (
                  <small
                    style={{
                      color: "#a0a0a0",
                      fontSize: "0.9rem",
                      marginTop: "5px",
                      display: "block",
                    }}
                  >
                    <SparklesIcon
                      size={16}
                      style={{
                        verticalAlign: "middle",
                        marginRight: "4px",
                      }}
                    />
                    Tip: Enter your goal before recording
                    for better AI feedback
                  </small>
                )}
              </div>

              <div className="recording-section">
                <div className="record-button-container">
                  <button
                    onClick={handleRecording}
                    className={`record-btn-round ${
                      isRecording ? "recording" : ""
                    }`}
                    aria-label={
                      isRecording
                        ? "Stop Recording"
                        : "Start Recording"
                    }
                    title={
                      isRecording
                        ? "Click to stop recording"
                        : "Click to start recording"
                    }
                  >
                    {/* Sound waves - 3 circles */}
                    {isRecording && (
                      <>
                        <div
                          className="sound-wave wave-1"
                          style={{
                            transform: `translate(-50%, -50%) scale(${
                              1 + audioLevel * 0.4
                            })`,
                            opacity: audioLevel * 0.8,
                          }}
                          aria-hidden="true"
                        ></div>
                        <div
                          className="sound-wave wave-2"
                          style={{
                            transform: `translate(-50%, -50%) scale(${
                              1 + audioLevel * 0.7
                            })`,
                            opacity: audioLevel * 0.6,
                          }}
                          aria-hidden="true"
                        ></div>
                        <div
                          className="sound-wave wave-3"
                          style={{
                            transform: `translate(-50%, -50%) scale(${
                              1 + audioLevel * 1.0
                            })`,
                            opacity: audioLevel * 0.4,
                          }}
                          aria-hidden="true"
                        ></div>
                      </>
                    )}

                    {/* Button Content */}
                    <div className="record-btn-content">
                      {/* Microphone icon */}
                      <div className="mic-icon">
                        {isRecording ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="28"
                            height="28"
                            aria-hidden="true"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="6"
                              height="6"
                              rx="1"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="28"
                            height="28"
                            aria-hidden="true"
                          >
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                          </svg>
                        )}
                      </div>
                      {/* Button Text */}
                      <span className="record-btn-text">
                        {isRecording ? "Stop" : "Record"}
                      </span>
                    </div>
                  </button>
                </div>

                <p
                  className={`status-text ${
                    statusText.includes("Error") ||
                    statusText.includes("Failed")
                      ? "error"
                      : statusText.includes("✓") ||
                        statusText.includes("complete")
                      ? "success"
                      : ""
                  }`}
                >
                  {statusText}
                </p>
              </div>

              {transcript && (
                <TranscriptDisplay
                  transcript={transcript}
                />
              )}

              {/* Live Stats During Recording */}
              {isRecording && (
                <div className="live-stats-card">
                  <h3>
                    <ChartBarIcon
                      size={20}
                      style={{
                        verticalAlign: "middle",
                        marginRight: "8px",
                      }}
                    />
                    Live Stats
                  </h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">
                        {wordCount}
                      </span>
                      <span className="stat-label">
                        Words
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {Math.floor(recordingDuration / 60)}
                        :
                        {(recordingDuration % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <span className="stat-label">
                        Duration
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {recordingDuration > 0
                          ? Math.round(
                              (wordCount /
                                recordingDuration) *
                                60
                            )
                          : 0}
                      </span>
                      <span className="stat-label">
                        WPM
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recent Recordings */}
            {!feedback && (
              <div className="sidebar-column">
                <div className="recent-recordings-panel">
                  <h3>
                    <FileTextIcon
                      size={20}
                      style={{
                        verticalAlign: "middle",
                        marginRight: "8px",
                      }}
                    />
                    Recent Recordings
                  </h3>
                  <div className="recordings-list">
                    {recordingHistory.length > 0 ? (
                      <>
                        {recordingHistory.map(
                          (recording, index) => {
                            const durationMin = Math.floor(
                              recording.duration / 60
                            );
                            const durationSec =
                              recording.duration % 60;
                            const durationText =
                              durationMin > 0
                                ? `${durationMin}:${durationSec
                                    .toString()
                                    .padStart(2, "0")} min`
                                : `${durationSec}s`;

                            const iconComponents = [
                              MicrophoneIcon,
                              TargetIcon,
                              UsersIcon,
                              BriefcaseIcon,
                              ChartBarIcon,
                              AwardIcon,
                              StarIcon,
                              LightbulbIcon,
                            ];
                            const IconComponent =
                              iconComponents[
                                index %
                                  iconComponents.length
                              ];

                            return (
                              <div
                                key={recording.id}
                                className={`recording-item ${
                                  recording.isPinned
                                    ? "pinned"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRecordingClick(
                                    recording
                                  )
                                }
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                  if (
                                    e.key === "Enter" ||
                                    e.key === " "
                                  ) {
                                    handleRecordingClick(
                                      recording
                                    );
                                  }
                                }}
                              >
                                <div className="recording-actions">
                                  <button
                                    className={`pin-btn ${
                                      recording.isPinned
                                        ? "pinned"
                                        : ""
                                    }`}
                                    onClick={(e) =>
                                      togglePin(
                                        recording.id,
                                        e
                                      )
                                    }
                                    title={
                                      recording.isPinned
                                        ? "Unpin"
                                        : "Pin to top"
                                    }
                                    aria-label={
                                      recording.isPinned
                                        ? "Unpin recording"
                                        : "Pin recording"
                                    }
                                  >
                                    {recording.isPinned
                                      ? "📌"
                                      : "📍"}
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={(e) =>
                                      deleteRecording(
                                        recording.id,
                                        e
                                      )
                                    }
                                    title="Delete recording"
                                    aria-label="Delete recording"
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <div className="recording-header">
                                  <span className="recording-icon">
                                    <IconComponent
                                      size={20}
                                    />
                                  </span>
                                  <div className="recording-info">
                                    <strong>
                                      {recording.isPinned && (
                                        <span className="pin-indicator">
                                          📌{" "}
                                        </span>
                                      )}
                                      {recording.goal ||
                                        "Speech Recording"}
                                    </strong>
                                    <span className="recording-meta">
                                      {durationText} •{" "}
                                      {recording.wpm} WPM •{" "}
                                      {recording.score.toFixed(
                                        1
                                      )}
                                      /10
                                    </span>
                                  </div>
                                </div>
                                <p className="recording-preview">
                                  {recording.transcriptPreview ||
                                    recording.transcript}
                                </p>
                                <small className="click-hint">
                                  Click to view full
                                  analysis
                                </small>
                              </div>
                            );
                          }
                        )}
                      </>
                    ) : (
                      <>
                        {/* Placeholder recordings when no history exists */}
                        <div className="recording-item placeholder">
                          <div className="recording-header">
                            <span className="recording-icon">
                              🎤
                            </span>
                            <div className="recording-info">
                              <strong>
                                Quarterly Results
                                Presentation
                              </strong>
                              <span className="recording-meta">
                                2 min • 152 WPM • 8.5/10
                              </span>
                            </div>
                          </div>
                          <p className="recording-preview">
                            Presented Q4 financial results
                            with strong revenue growth...
                          </p>
                        </div>

                        <div className="recording-item placeholder">
                          <div className="recording-header">
                            <span className="recording-icon">
                              �
                            </span>
                            <div className="recording-info">
                              <strong>
                                Product Launch Speech
                              </strong>
                              <span className="recording-meta">
                                3 min • 145 WPM • 9.0/10
                              </span>
                            </div>
                          </div>
                          <p className="recording-preview">
                            Introduced our new AI-powered
                            analytics platform...
                          </p>
                        </div>

                        <div className="recording-item placeholder">
                          <div className="recording-header">
                            <span className="recording-icon">
                              👥
                            </span>
                            <div className="recording-info">
                              <strong>
                                Team Motivation Talk
                              </strong>
                              <span className="recording-meta">
                                1.5 min • 138 WPM • 7.8/10
                              </span>
                            </div>
                          </div>
                          <p className="recording-preview">
                            Encouraged team collaboration
                            and innovation...
                          </p>
                        </div>

                        <div className="empty-state">
                          <p>
                            🎬 These are example recordings.
                            Your recordings will appear
                            here!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {feedback && (
            <>
              <div className="back-button-container">
                <button
                  onClick={handleNewRecording}
                  className="back-btn"
                  aria-label="Back to recording"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <FeedbackReport data={feedback} />
              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                }}
              >
                <button
                  onClick={handleNewRecording}
                  className="new-recording-btn"
                  aria-label="Start a new recording"
                >
                  <TargetIcon
                    size={18}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                    }}
                  />
                  Try Another Speech
                </button>
              </div>
            </>
          )}
        </main>

        <footer className="footer">
          <p>
            Built with{" "}
            <span style={{ color: "#ff6b9d" }}>❤️</span> for
            hackathon excellence
          </p>
          <small
            style={{
              color: "#606060",
              marginTop: "5px",
              display: "block",
            }}
          >
            🌐 Best experienced in Chrome or Edge
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
