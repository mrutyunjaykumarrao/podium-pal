import { useState } from "react";
import "./App.css";
import FeedbackReport from "./components/FeedbackReport";
import ProfileMenu from "./components/ProfileMenu";
import CollapsibleSidebar from "./components/CollapsibleSidebar";
import ProgressiveInput from "./components/ProgressiveInput";
import { useRecording } from "./hooks/useRecording";
import { useRecordingHistory } from "./hooks/useRecordingHistory";

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
    console.log('[App] Recording clicked:', recording);
    console.log('[App] Feedback data:', recording.feedback);
    console.log('[App] Feedback keys:', recording.feedback ? Object.keys(recording.feedback) : 'no feedback');
    console.log('[App] Has clarityScore?', recording.feedback?.clarityScore);
    console.log('[App] Has strengths?', recording.feedback?.strengths);
    console.log('[App] Has improvements?', recording.feedback?.improvements);
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
          onSelectRecording={handleRecordingClick}
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
              transcript={transcript}
              recordingDuration={recordingDuration}
              wordCount={wordCount}
            />
          ) : (
            /* Feedback View */
            <main className="main-content">
              <div className="feedback-container">
                <button onClick={handleNewRecording} className="new-recording-btn">
                  + New Recording
                </button>
                <FeedbackReport data={feedback} />
              </div>
            </main>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
