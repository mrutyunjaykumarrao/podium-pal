import { useState, useEffect, useRef } from "react";
import "./App.css";
import TranscriptDisplay from "./components/TranscriptDisplay";
import FeedbackReport from "./components/FeedbackReport";

function App() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [userGoal, setUserGoal] = useState("");

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const statusRef = useRef("idle");
  const analysisTriggeredRef = useRef(false);
  const stopTimeoutRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(
        "Your browser doesn't support the Speech Recognition API. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    console.log("Speech Recognition initialized");

    recognition.onstart = () => {
      console.log(
        "Speech recognition started successfully."
      );
      setStatus("recording");
    };

    recognition.onresult = (event) => {
      console.log("Received speech result");
      let interimTranscript = "";
      let finalTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        ++i
      ) {
        const piece = event.results[i][0].transcript;
        console.log([i], piece, event.results[i].isFinal);
        if (event.results[i].isFinal) {
          finalTranscript += piece + " ";
        } else {
          interimTranscript += piece;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        console.log(
          "Final transcript updated. Length:",
          finalTranscriptRef.current.length
        );
      }

      setTranscript(
        finalTranscriptRef.current + interimTranscript
      );
    };

    recognition.onend = () => {
      const currentStatus = statusRef.current;
      console.log(
        "Speech recognition ended. Status:",
        currentStatus
      );
      console.log(
        "Final transcript length:",
        finalTranscriptRef.current.length
      );

      // Clear any pending timeout
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      if (currentStatus === "stopping") {
        console.log(
          "User stopped - analyzing transcript..."
        );
        // Use setTimeout to ensure state updates and transcript finalization complete
        setTimeout(() => {
          analyzeTranscript();
        }, 100);
      } else if (currentStatus === "recording") {
        console.log(
          "Recognition stopped due to silence - restarting..."
        );
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart:", e);
          setStatus("idle");
        }
      } else {
        setStatus("idle");
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "no-speech") {
        console.log(
          "No speech error - will restart automatically"
        );
      } else if (event.error === "audio-capture") {
        setError(
          "No microphone found. Please connect a microphone and refresh."
        );
        setStatus("idle");
      } else if (event.error === "not-allowed") {
        setError(
          "Microphone permission denied. Click the lock icon in the address bar and allow microphone access."
        );
        setStatus("idle");
      } else if (event.error !== "aborted") {
        setError("Error: " + event.error);
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Cleanup error
          console.log("Cleanup error:", e);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeTranscript = async () => {
    console.log("=== STARTING ANALYSIS ===");
    
    // Prevent multiple analyses
    if (analysisTriggeredRef.current) {
      console.log("Analysis already triggered, skipping duplicate call");
      return;
    }
    analysisTriggeredRef.current = true;
    
    setStatus("analyzing");
    
    // Get the final transcript
    const finalTranscript = finalTranscriptRef.current.trim();

    console.log("Analyzing transcript...");
    console.log("Transcript length:", finalTranscript.length);
    console.log("Transcript:", finalTranscript);
    console.log("User Goal:", userGoal);

    // Validation checks
    if (!finalTranscript || finalTranscript.length < 5) {
      console.error("Transcript too short or empty");
      setError(
        "No speech was detected or transcript is too short. Please speak louder and clearer into your microphone."
      );
      setStatus("finished");
      return;
    }

    if (!userGoal.trim()) {
      console.error("User goal is empty");
      setError("Please enter your speech goal!");
      setStatus("finished");
      return;
    }

    console.log("Sending to backend...");
    console.log("Request payload:", { 
      transcript: finalTranscript.substring(0, 100) + "...",
      userGoal: userGoal 
    });

    try {
      const response = await fetch(
        "http://localhost:8000/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: finalTranscript,
            userGoal: userGoal,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(
          `Backend error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✓ Received feedback successfully:", data);
      setFeedback(data);
      setError(null);
    } catch (err) {
      console.error("Error analyzing transcript:", err);
      setError(
        `Could not get feedback: ${err.message}. Is the backend server running on http://localhost:8000?`
      );
    } finally {
      console.log("=== ANALYSIS COMPLETE ===");
      setStatus("finished");
      // Reset the flag so user can record again
      analysisTriggeredRef.current = false;
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError(
        "Speech recognition not initialized. Please refresh the page."
      );
      return;
    }

    if (!userGoal.trim()) {
      setError(
        "Please enter your speech goal before recording!"
      );
      return;
    }

    if (status === "idle" || status === "finished") {
      console.log("STARTING RECORDING...");
      console.log("User goal:", userGoal);

      setTranscript("");
      finalTranscriptRef.current = "";
      setFeedback(null);
      setError(null);
      setStatus("recording");
      analysisTriggeredRef.current = false; // Reset analysis flag for new recording

      try {
        recognitionRef.current.start();
        console.log(
          "Recognition.start() called successfully"
        );
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError(
          "Could not start. The microphone might be in use. Try refreshing the page."
        );
        setStatus("idle");
      }
    } else if (status === "recording") {
      console.log("STOPPING RECORDING...");
      console.log(
        "Transcript captured so far:",
        finalTranscriptRef.current
      );
      console.log(
        "Transcript length:",
        finalTranscriptRef.current.length
      );

      // Set status to stopping BEFORE calling stop()
      setStatus("stopping");
      
      try {
        recognitionRef.current.stop();
        console.log("Recognition.stop() called - waiting for onend event");
        
        // Safety fallback: if onend doesn't fire within 3 seconds, trigger analysis anyway
        stopTimeoutRef.current = setTimeout(() => {
          console.warn("onend event didn't fire in time, triggering analysis manually");
          if (statusRef.current === "stopping") {
            analyzeTranscript();
          }
        }, 3000);
      } catch (e) {
        console.error("Failed to stop recognition:", e);
        // If stop fails, try to analyze anyway
        setStatus("stopping");
        setTimeout(() => {
          analyzeTranscript();
        }, 100);
      }
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "recording":
        return "Stop Recording";
      case "stopping":
        return "Stopping...";
      case "analyzing":
        return "Analyzing...";
      default:
        return "Start Recording";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "recording":
        return "Listening... Speak now!";
      case "stopping":
        return "Stopping...";
      case "analyzing":
        return "Analyzing your speech...";
      case "finished":
        return "Analysis complete!";
      default:
        return "Ready to record";
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Podium Pal</h1>
        <p className="tagline">
          Your Personal AI Public Speaking Coach
        </p>
        {error && (
          <p
            className="error-message"
            style={{
              color: "#ff6b6b",
              marginTop: "10px",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {error}
          </p>
        )}
      </header>

      <main className="main-content">
        <div className="input-section">
          <label htmlFor="userGoalInput">
            What is the one key message of your speech?
          </label>
          <input
            id="userGoalInput"
            type="text"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder="e.g., Explain that our quarterly results were positive"
            disabled={
              status === "recording" ||
              status === "analyzing"
            }
            autoComplete="off"
          />
        </div>

        <div className="recording-section">
          <button
            onClick={toggleRecording}
            className={
              "record-btn " +
              (status === "recording" ? "recording" : "")
            }
            disabled={
              status === "stopping" ||
              status === "analyzing"
            }
          >
            {getButtonText()}
          </button>
          <p
            className={
              "status-text " +
              (error
                ? "error"
                : status === "finished"
                ? "success"
                : "")
            }
          >
            {getStatusText()}
          </p>
        </div>

        <TranscriptDisplay transcript={transcript} />

        {feedback && <FeedbackReport data={feedback} />}
      </main>

      <footer className="footer">
        <p>Built with love for hackathon excellence</p>
      </footer>
    </div>
  );
}

export default App;
