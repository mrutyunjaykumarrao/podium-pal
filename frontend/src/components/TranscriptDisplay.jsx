import './TranscriptDisplay.css';

function TranscriptDisplay({ transcript }) {
  return (
    <div className="transcript-section">
      <h2>Live Transcript</h2>
      <div className="transcript-box">
        {transcript || 'Your speech will appear here as you speak...'}
      </div>
    </div>
  );
}

export default TranscriptDisplay;
