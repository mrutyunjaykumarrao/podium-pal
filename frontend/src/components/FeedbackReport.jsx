import { useEffect, useRef } from 'react';
import './FeedbackReport.css';
import { 
  ChartBarIcon, 
  TargetIcon, 
  SparklesIcon, 
  ShieldIcon, 
  LayoutIcon, 
  ZapIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  FileTextIcon, 
  LightbulbIcon,
  ArrowRightIcon
} from './Icons';

function FeedbackReport({ data }) {
  const reportRef = useRef(null);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [data]);

  const fillerWordsCount = Object.keys(data.fillerWords).length;
  const overallScore = data.overall_score || 0;

  // Function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div className="report-section" ref={reportRef}>
      <h2>
        <ChartBarIcon size={24} style={{verticalAlign: 'middle', marginRight: '10px'}} />
        Your Speech Analysis
      </h2>
      
      {/* Overall Score - Big Display */}
      <div className="overall-score-card">
        <div className="overall-score-number">{overallScore.toFixed(1)}</div>
        <div className="overall-score-label">Overall Score</div>
        <div className="score-subtitle">out of 10</div>
      </div>

      {/* Key Explanation - Why this score? */}
      <div className="score-explanation">
        <h3>
          <TargetIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
          Why this score?
        </h3>
        <p className="explanation-text">
          Your score is based on multiple factors including clarity, confidence, engagement, structure, pacing, and filler word usage. 
          See detailed breakdown below.
        </p>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><SparklesIcon size={32} /></div>
          <div className="metric-score" style={{ color: getScoreColor(data.clarityScore) }}>
            {data.clarityScore}
          </div>
          <div className="metric-name">Clarity</div>
          <div className="metric-description">Message clarity</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><ShieldIcon size={32} /></div>
          <div className="metric-score" style={{ color: getScoreColor(data.confidenceScore) }}>
            {data.confidenceScore}
          </div>
          <div className="metric-name">Confidence</div>
          <div className="metric-description">Assertiveness level</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><TargetIcon size={32} /></div>
          <div className="metric-score" style={{ color: getScoreColor(data.engagementScore) }}>
            {data.engagementScore}
          </div>
          <div className="metric-name">Engagement</div>
          <div className="metric-description">Audience interest</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><LayoutIcon size={32} /></div>
          <div className="metric-score" style={{ color: getScoreColor(data.structureScore) }}>
            {data.structureScore}
          </div>
          <div className="metric-name">Structure</div>
          <div className="metric-description">Organization quality</div>
        </div>
      </div>

      {/* Score Breakdown Details */}
      <div className="score-breakdown-section">
        <h3>
          <ChartBarIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
          Detailed Score Breakdown
        </h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><SparklesIcon size={20} /></span>
              <span className="breakdown-label">Clarity</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar" 
                style={{ 
                  width: `${data.clarityScore}%`,
                  backgroundColor: getScoreColor(data.clarityScore)
                }}
              ></div>
            </div>
            <div className="breakdown-score">{data.clarityScore}/100</div>
            <p className="breakdown-description">How clearly you communicated your message</p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><ShieldIcon size={20} /></span>
              <span className="breakdown-label">Confidence</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar" 
                style={{ 
                  width: `${data.confidenceScore}%`,
                  backgroundColor: getScoreColor(data.confidenceScore)
                }}
              ></div>
            </div>
            <div className="breakdown-score">{data.confidenceScore}/100</div>
            <p className="breakdown-description">How assertive and self-assured you sounded</p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><TargetIcon size={20} /></span>
              <span className="breakdown-label">Engagement</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar" 
                style={{ 
                  width: `${data.engagementScore}%`,
                  backgroundColor: getScoreColor(data.engagementScore)
                }}
              ></div>
            </div>
            <div className="breakdown-score">{data.engagementScore}/100</div>
            <p className="breakdown-description">How interesting and captivating your content was</p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><LayoutIcon size={20} /></span>
              <span className="breakdown-label">Structure</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar" 
                style={{ 
                  width: `${data.structureScore}%`,
                  backgroundColor: getScoreColor(data.structureScore)
                }}
              ></div>
            </div>
            <div className="breakdown-score">{data.structureScore}/100</div>
            <p className="breakdown-description">How well-organized your speech was</p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><ZapIcon size={20} /></span>
              <span className="breakdown-label">Speaking Pace</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar pace-bar" 
                style={{ 
                  width: `${Math.min((data.pace / 160) * 100, 100)}%`,
                  backgroundColor: data.pace >= 140 && data.pace <= 160 ? '#4caf50' : '#ff9800'
                }}
              ></div>
            </div>
            <div className="breakdown-score">{data.pace} WPM</div>
            <p className="breakdown-description">Words per minute (ideal: 140-160 WPM)</p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon"><XCircleIcon size={20} /></span>
              <span className="breakdown-label">Filler Words</span>
            </div>
            <div className="breakdown-bar-container">
              <div 
                className="breakdown-bar filler-bar" 
                style={{ 
                  width: `${Math.min(fillerWordsCount * 10, 100)}%`,
                  backgroundColor: fillerWordsCount === 0 ? '#4caf50' : fillerWordsCount <= 3 ? '#ff9800' : '#f44336'
                }}
              ></div>
            </div>
            <div className="breakdown-score">{fillerWordsCount} detected</div>
            <p className="breakdown-description">
              {fillerWordsCount === 0 ? 'Excellent! No filler words' : `Found: ${Object.keys(data.fillerWords).join(', ')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths Section */}
      {data.strengths && data.strengths.length > 0 && (
        <div className="feedback-section strengths-section">
          <h3>
            <CheckCircleIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
            What You Did Well
          </h3>
          <ul className="feedback-list">
            {data.strengths.map((strength, index) => (
              <li key={index} className="feedback-item positive">
                <span className="feedback-bullet"><CheckCircleIcon size={16} /></span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements Section */}
      {data.improvements && data.improvements.length > 0 && (
        <div className="feedback-section improvements-section">
          <h3>
            <TargetIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
            Areas to Improve
          </h3>
          <ul className="feedback-list">
            {data.improvements.map((improvement, index) => (
              <li key={index} className="feedback-item improvement">
                <span className="feedback-bullet"><ArrowRightIcon size={16} /></span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Speaking Pace */}
      <div className="metric">
        <h3>
          <ZapIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
          Speaking Pace
        </h3>
        <p><strong>{data.pace} words per minute</strong></p>
        <p className="metric-hint">Ideal range: 140-160 WPM</p>
      </div>

      {/* Filler Words */}
      {fillerWordsCount > 0 ? (
        <div className="metric filler-words-section">
          <h3>
            <XCircleIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
            Filler Words Detected
          </h3>
          <div className="filler-words-grid">
            {Object.entries(data.fillerWords).map(([word, count]) => (
              <div key={word} className="filler-word-item">
                <span className="filler-word">"{word}"</span>
                <span className="filler-count">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="metric">
          <h3>
            <CheckCircleIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
            Filler Words
          </h3>
          <p>Excellent! No filler words detected.</p>
        </div>
      )}

      {/* AI Summary */}
      <div className="metric summary-section">
        <h3>
          <FileTextIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
          AI Summary
        </h3>
        <p className="summary-text">{data.aiSummary}</p>
      </div>

      {/* Constructive Tip */}
      <div className="metric tip-section">
        <h3>
          <LightbulbIcon size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
          Key Takeaway
        </h3>
        <p className="tip-text">{data.constructiveTip}</p>
      </div>
    </div>
  );
}

export default FeedbackReport;
