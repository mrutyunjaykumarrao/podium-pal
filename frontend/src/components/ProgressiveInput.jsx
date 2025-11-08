import { useState } from 'react';
import { LightbulbIcon, SparklesIcon, MicrophoneIcon } from './Icons';
import './ProgressiveInput.css';

/**
 * Progressive Input Component
 * - Initially centered with input + dropdown
 * - Shows record button when Enter is pressed
 * - Input moves up, record button appears below
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
}) {
  const [showRecordButton, setShowRecordButton] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userGoal.trim() && !isRecording) {
      e.preventDefault();
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
          <label htmlFor="goalInput" className="goal-label">
            <LightbulbIcon size={20} />
            What is the one key message of your speech?
          </label>
          <input
            type="text"
            id="goalInput"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Explain our positive quarterly results"
            disabled={isRecording}
            className="goal-input"
            autoFocus
          />

          {/* AI Style Dropdown */}
          <div className="style-selector">
            <label htmlFor="styleSelect" className="style-label">
              <SparklesIcon size={18} />
              Choose your AI feedback style
            </label>
            <select
              id="styleSelect"
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              disabled={isRecording}
              className="style-select"
            >
              <option value="supportive">🌱 Supportive - Encouraging and nurturing</option>
              <option value="direct">🎯 Direct - Straightforward and concise</option>
              <option value="critical">🔍 Critical - Detailed and analytical</option>
              <option value="humorous">😄 Humorous - Light-hearted and fun</option>
              <option value="mentor">🧘 Mentor - Wise and reflective</option>
              <option value="professional">💼 Professional - Formal and structured</option>
            </select>
          </div>

          {!showRecordButton && !isRecording && (
            <small className="hint-text">
              <SparklesIcon size={14} />
              Press Enter to continue
            </small>
          )}
        </div>
      </div>

      {/* Record Button - appears when Enter is pressed */}
      {showRecordButton && (
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
      )}
    </div>
  );
}
