import './TranscriptDisplay.css';
import { FileTextIcon } from './Icons';

function TranscriptDisplay({ transcript }) {
  return (
    <div className="transcript-container">
      <h2>
        <FileTextIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
        Live Transcript
      </h2>
      <div className="transcript-box">
        <p>{transcript || 'Your speech will appear here as you speak...'}</p>
      </div>
    </div>
  );
}

export default TranscriptDisplay;
