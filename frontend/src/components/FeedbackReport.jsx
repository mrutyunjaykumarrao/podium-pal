import { useEffect, useRef, useState } from "react";
import "./FeedbackReport.css";
import {
  LotusIcon,
  BreathIcon,
  ZenCircleIcon,
  FlowIcon,
  PeaceIcon,
  MindfulnessIcon,
  HarmonyIcon,
  GrowthIcon,
  BalanceIcon,
  HomeIcon,
  SuccessLeafIcon,
  ImprovementArrowIcon,
} from "./svgs/MeditativeIcons";

function FeedbackReport({ data }) {
  const reportRef = useRef(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [metricsVisible, setMetricsVisible] =
    useState(false);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    // Animated counter for overall score
    if (data?.overall_score) {
      let start = 0;
      const end = data.overall_score;
      const duration = 1500;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(timer);
        } else {
          setAnimatedScore(start);
        }
      }, 16);

      // Show metrics after score animation
      setTimeout(() => setMetricsVisible(true), 500);

      return () => clearInterval(timer);
    }
  }, [data]);

  if (!data) return null;

  const fillerWordsCount = data.fillerWords
    ? Object.keys(data.fillerWords).length
    : 0;
  const overallScore = data.overall_score || 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "#8fb9a8"; // Sage green
    if (score >= 60) return "#c9b8a3"; // Warm sand
    return "#d4a5a5"; // Soft coral
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return "Masterful";
    if (score >= 80) return "Harmonious";
    if (score >= 70) return "Balanced";
    if (score >= 60) return "Growing";
    return "Beginning";
  };

  const circumference = 2 * Math.PI * 85;
  const scorePercentage = (animatedScore / 10) * 100;
  const strokeDashoffset =
    circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="modern-report" ref={reportRef}>
      {/* Back to Home Button */}
      <button
        className="back-home-btn"
        onClick={() => (window.location.href = "/")}
      >
        <HomeIcon size={20} />
        <span>Return to Practice</span>
      </button>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <LotusIcon size={36} />
          </div>
          <div className="header-text">
            <h2>Your Journey Insights</h2>
            <p className="dashboard-subtitle">
              Reflect on your mindful communication
            </p>
          </div>
        </div>
      </div>

      {/* Hero Score Section */}
      <div className="hero-section">
        <div className="hero-card">
          <div className="score-visual">
            <svg
              className="circular-progress"
              viewBox="0 0 200 200"
            >
              <defs>
                <linearGradient
                  id="scoreGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#a8c5d1" />
                  <stop offset="50%" stopColor="#c4d7e0" />
                  <stop offset="100%" stopColor="#b8d4c8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur
                    stdDeviation="4"
                    result="coloredBlur"
                  />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(124, 154, 238, 0.1)"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                filter="url(#glow)"
                className="progress-circle"
              />
            </svg>
            <div className="score-overlay">
              <div className="score-number">
                {animatedScore.toFixed(1)}
              </div>
              <div className="score-denominator">/10</div>
            </div>
          </div>
          <div className="score-meta">
            <div
              className="score-grade"
              style={{ color: getScoreColor(overallScore) }}
            >
              {getScoreGrade(overallScore)}
            </div>
            <div className="score-label">
              Overall Performance
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #8fb9a8, #a3c9b8)",
              }}
            >
              <SuccessLeafIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {data.strengths?.length || 0}
              </div>
              <div className="stat-label">Strengths</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #c9b8a3, #d4c4af)",
              }}
            >
              <ImprovementArrowIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {data.improvements?.length || 0}
              </div>
              <div className="stat-label">Growth Areas</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #a8c5d1, #b8d0dc)",
              }}
            >
              <FlowIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {data.pace || 0}
              </div>
              <div className="stat-label">Words/Min</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #d4a5a5, #e0b5b5)",
              }}
            >
              <BreathIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {fillerWordsCount}
              </div>
              <div className="stat-label">Pause Words</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div
        className={`metrics-section ${
          metricsVisible ? "visible" : ""
        }`}
      >
        <h3 className="section-title">
          <ZenCircleIcon size={20} />
          Mindful Metrics
        </h3>
        <div className="metrics-grid-modern">
          <MetricCard
            icon={<ZenCircleIcon size={28} />}
            title="Clarity"
            score={data.clarityScore}
            description="Message clarity and flow"
            color="#a8c5d1"
          />
          <MetricCard
            icon={<PeaceIcon size={28} />}
            title="Confidence"
            score={data.confidenceScore}
            description="Calm assurance in delivery"
            color="#b8d4c8"
          />
          <MetricCard
            icon={<MindfulnessIcon size={28} />}
            title="Engagement"
            score={data.engagementScore}
            description="Present and connected"
            color="#c4d7e0"
          />
          <MetricCard
            icon={<HarmonyIcon size={28} />}
            title="Structure"
            score={data.structureScore}
            description="Balanced organization"
            color="#b8c9d9"
          />
        </div>
      </div>

      {/* Strengths & Improvements Side by Side */}
      <div className="insights-grid">
        <div className="insight-panel strengths-panel">
          <div className="panel-header">
            <div className="panel-icon success">
              <SuccessLeafIcon size={24} />
            </div>
            <h3>Your Strengths</h3>
          </div>
          <div className="insight-list">
            {data.strengths && data.strengths.length > 0 ? (
              data.strengths.map((strength, idx) => (
                <div
                  key={idx}
                  className="insight-item success"
                >
                  <div className="insight-bullet"></div>
                  <p>{strength}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">
                Your strengths will bloom here.
              </p>
            )}
          </div>
        </div>

        <div className="insight-panel improvements-panel">
          <div className="panel-header">
            <div className="panel-icon warning">
              <GrowthIcon size={24} />
            </div>
            <h3>Growth Opportunities</h3>
          </div>
          <div className="insight-list">
            {data.improvements &&
            data.improvements.length > 0 ? (
              data.improvements.map((improvement, idx) => (
                <div
                  key={idx}
                  className="insight-item warning"
                >
                  <div className="insight-bullet"></div>
                  <p>{improvement}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">
                Your path to growth awaits.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filler Words Section */}
      {data.fillerWords && fillerWordsCount > 0 && (
        <div className="analysis-card filler-words-card">
          <div className="card-header">
            <div className="header-icon-wrapper">
              <BreathIcon size={24} />
            </div>
            <h3>Mindful Pauses</h3>
          </div>
          <div className="filler-grid-modern">
            {data.fillerWords &&
              Object.entries(data.fillerWords).map(
                ([word, count]) => (
                  <div key={word} className="filler-chip">
                    <span className="filler-word">
                      "{word}"
                    </span>
                    <span className="filler-count">
                      {count}×
                    </span>
                  </div>
                )
              )}
          </div>
        </div>
      )}

      {/* AI Summary Section */}
      {data.aiSummary && (
        <div className="analysis-card ai-summary">
          <div className="card-header">
            <div className="header-icon-wrapper">
              <MindfulnessIcon size={24} />
            </div>
            <h3>Reflective Summary</h3>
          </div>
          <div className="summary-content">
            <p>{data.aiSummary}</p>
          </div>
        </div>
      )}

      {/* Constructive Tip */}
      {data.constructiveTip && (
        <div className="analysis-card tip-card">
          <div className="card-header">
            <div className="header-icon-wrapper">
              <LotusIcon size={24} />
            </div>
            <h3>Gentle Guidance</h3>
          </div>
          <div className="tip-content">
            <p>{data.constructiveTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Metric Card Component
function MetricCard({
  icon,
  title,
  score,
  description,
  color,
}) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score || 0;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#8fb9a8"; // Sage green
    if (score >= 60) return "#c9b8a3"; // Warm sand
    return "#d4a5a5"; // Soft coral
  };

  const percentage = (score / 100) * 100;

  return (
    <div className="metric-card-modern">
      <div className="metric-header">
        <div
          className="metric-icon-wrapper"
          style={{ color }}
        >
          {icon}
        </div>
        <div className="metric-title-area">
          <h4>{title}</h4>
          <p className="metric-desc">{description}</p>
        </div>
      </div>
      <div className="metric-score-area">
        <div
          className="score-display"
          style={{ color: getScoreColor(score) }}
        >
          {animatedValue.toFixed(0)}
          <span className="score-suffix">/100</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}, ${getScoreColor(
                score
              )})`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackReport;
