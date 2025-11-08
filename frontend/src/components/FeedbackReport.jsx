import { useEffect, useRef } from "react";
import "./FeedbackReport.css";

function FeedbackReport({ data }) {
  const reportRef = useRef(null);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [data]);

  const fillerWordsCount = Object.keys(
    data.fillerWords
  ).length;

  return (
    <div className="report-section" ref={reportRef}>
      <h2>📊 Your Speech Analysis</h2>

      <div className="clarity-score">
        <div className="score-number">
          {data.clarityScore}
        </div>
        <div className="score-label">Clarity Score</div>
      </div>

      <div className="metric">
        <h3>⚡ Speaking Pace</h3>
        <p>
          <strong>{data.pace} words per minute</strong>
        </p>
        <p>Ideal range: 140-160 WPM</p>
      </div>

      {fillerWordsCount > 0 ? (
        <div className="metric">
          <h3>🚫 Filler Words Detected</h3>
          <ul>
            {Object.entries(data.fillerWords).map(
              ([word, count]) => (
                <li key={word}>
                  "{word}": {count} time
                  {count > 1 ? "s" : ""}
                </li>
              )
            )}
          </ul>
        </div>
      ) : (
        <div className="metric">
          <h3>✓ Filler Words</h3>
          <p>Excellent! No filler words detected.</p>
        </div>
      )}

      <div className="metric">
        <h3>📝 AI Summary</h3>
        <p>{data.aiSummary}</p>
      </div>

      <div className="metric">
        <h3>💡 Constructive Tip</h3>
        <p>{data.constructiveTip}</p>
      </div>
    </div>
  );
}

export default FeedbackReport;
