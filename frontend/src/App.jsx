import { useState } from "react";
import "./App.css";
import TranscriptDisplay from "./components/TranscriptDisplay";
import FeedbackReport from "./components/FeedbackReport";
import ProfileMenu from "./components/ProfileMenu";
import CollapsibleSidebar from "./components/CollapsibleSidebar";
import ProgressiveInput from "./components/ProgressiveInput";
import { useRecording } from "./hooks/useRecording";
import { useRecordingHistory } from "./hooks/useRecordingHistory";
import { ChartBarIcon } from "./components/Icons";

function App() {
  // UI State
  const [feedback, setFeedback] = useState(null);
  const [userGoal, setUserGoal] = useState("");
  const [aiPersonality, setAiPersonality] = useState("supportive");

  // Custom Hooks
  const { recordingHistory, saveToHistory, deleteRecording, togglePin } = useRecordingHistory();
  
  const {
    isRecording,
    transcript,
    statusText,
    audioLevel,
    wordCount,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecording(
    (analysisData) => setFeedback(analysisData),
    saveToHistory
  );

  // Handlers
  const handleRecordingClick = (recording) => {
    setFeedback(recording.feedback);
    setUserGoal(recording.goal);
  };

  const handleNewRecording = () => {
    setFeedback(null);
    resetRecording();
  };

  return (
    <>
      <div className="app-container">
        {/* Profile Menu - Top Right */}
        <ProfileMenu />

        {/* Collapsible Sidebar - Left */}
        <CollapsibleSidebar
          recordings={recordingHistory}
          onRecordingClick={handleRecordingClick}
          onDeleteRecording={deleteRecording}
          onTogglePin={togglePin}
        />

        {/* Main Content Area */}
        <div className="app">
          {!feedback ? (
            /* Progressive Input - Initial View */
            <ProgressiveInput
              userGoal={userGoal}
              setUserGoal={setUserGoal}
              aiPersonality={aiPersonality}
              setAiPersonality={setAiPersonality}
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              audioLevel={audioLevel}
              statusText={statusText}
            />
          ) : (
            /* Feedback View */
            <main className="main-content">
              <div className="feedback-container">
                <button onClick={handleNewRecording} className="new-recording-btn">
                  + New Recording
                </button>
                <FeedbackReport feedback={feedback} />
              </div>
            </main>
          )}

          {/* Live Transcript - Show during recording */}
          {isRecording && transcript && (
            <div className="live-transcript-overlay">
              <TranscriptDisplay transcript={transcript} />
              <div className="live-stats">
                <div className="stat">
                  <ChartBarIcon size={16} />
                  <span>{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="stat">
                  <span>{wordCount} words</span>
                </div>
                <div className="stat">
                  <span>{recordingDuration > 0 ? Math.round((wordCount / recordingDuration) * 60) : 0} WPM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
