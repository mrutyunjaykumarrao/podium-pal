import { useState } from 'react';
import { MicrophoneIcon } from './Icons';
import './ProgressiveInput.css';

/**
 * Progressive Input Component
 * - Clean centered input with send arrow
 * - AI tone selector at bottom
 * - Shows record button when submitted
 */
export default function ProgressiveInput({
  userGoal,
  setUserGoal,
  aiPersonality,
  setAiPersonality,
  isRecording,
  onStartRecording,
  onStopRecording,
  audioLevel,
  statusText,
  transcript,
  recordingDuration,
  wordCount,
}) {
  const [showRecordButton, setShowRecordButton] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userGoal.trim() && !isRecording) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (userGoal.trim() && !isRecording) {
      setShowRecordButton(true);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      onStopRecording();
      setUserGoal('');
      setShowRecordButton(false);
    } else {
      onStartRecording(userGoal, aiPersonality);
    }
  };

  const toneOptions = [
    { value: 'supportive', label: 'Supportive', emoji: '🌱', desc: 'Encouraging and nurturing' },
    { value: 'direct', label: 'Direct', emoji: '🎯', desc: 'Straightforward and concise' },
    { value: 'critical', label: 'Critical', emoji: '🔍', desc: 'Detailed and analytical' },
    { value: 'mentor', label: 'Mentor', emoji: '🧘', desc: 'Wise and reflective' },
    { value: 'professional', label: 'Professional', emoji: '💼', desc: 'Formal and structured' },
  ];

  return (
    <div className={`progressive-container ${showRecordButton ? 'recording-ready' : 'initial'}`}>
      {/* Input Section - moves up when record button appears */}
      <div className={`input-wrapper ${showRecordButton ? 'shifted-up' : 'centered'}`}>
        <header className="app-header">
          <h1 className="app-title">
            <MicrophoneIcon size={40} />
            Podium Pal
          </h1>
          <p className="app-subtitle">Your Personal AI Public Speaking Coach</p>
        </header>

        <div className="goal-input-box">
          <div className="input-row">
            <input
              type="text"
              id="goalInput"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What is the one key message of your speech?"
              disabled={isRecording}
              className="goal-input"
              autoFocus
            />
            
            {/* Send Arrow - appears when there's text */}
            {userGoal.trim() && !isRecording && (
              <button
                onClick={handleSubmit}
                className="send-button"
                aria-label="Submit"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 11L12 6L17 11M12 18V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* AI Tone Selector Badge */}
          <div className="tone-selector">
            <select
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              disabled={isRecording}
              className="tone-select"
            >
              {toneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label} - {option.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Record Button - appears when Enter is pressed */}
      {showRecordButton && (
        <div className={`recording-area ${isRecording ? 'split-layout' : 'center-layout'}`}>
          {/* Record Button Section */}
          <div className="record-section">
            <button
              onClick={handleRecordClick}
              className={`record-button ${isRecording ? 'recording' : ''}`}
              aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {/* Sound waves */}
              {isRecording && (
                <>
                  <div className="wave wave-1" style={{ opacity: audioLevel * 0.8 }} />
                  <div className="wave wave-2" style={{ opacity: audioLevel * 0.6 }} />
                  <div className="wave wave-3" style={{ opacity: audioLevel * 0.4 }} />
                </>
              )}

              {/* Icon */}
              <div className="button-icon">
                {isRecording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                    <rect x="8" y="8" width="8" height="8" rx="2" />
                  </svg>
                ) : (
                  <MicrophoneIcon size={32} />
                )}
              </div>

              {/* Text */}
              <span className="button-text">{isRecording ? 'STOP' : 'RECORD'}</span>
            </button>

            <p className="status-message">{statusText}</p>
          </div>

          {/* Live Transcript Section - appears on right when recording */}
          {isRecording && transcript && (
            <div className="transcript-section">
              <h3 className="transcript-title">📝 Live Transcript</h3>
              <div className="transcript-box">
                <p className="transcript-text">{transcript}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Stats - below the split layout when recording */}
      {isRecording && showRecordButton && (
        <div className="live-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Duration</span>
            <span className="stat-value">
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Words</span>
            <span className="stat-value">{wordCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">WPM</span>
            <span className="stat-value">
              {recordingDuration > 0 ? Math.round((wordCount / recordingDuration) * 60) : 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
