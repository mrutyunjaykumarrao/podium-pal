import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavMenu from '../components/NavMenu';
import { getUserRecordings, getUserStats } from '../services/recordingsService';
import { getUserProfile } from '../services/userService';
import { 
  getProgressTrends 
} from '../services/progressService';
import './ProgressPage.css';

function ProgressPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [progressSnapshots, setProgressSnapshots] = useState([]);
  const [trends, setTrends] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadProgressData = async () => {
      try {
        setLoading(true);

        // Load all data in parallel
        const [statsData, , recordingsData] = await Promise.all([
          getUserStats(currentUser.uid),
          getUserProfile(currentUser.uid),
          getUserRecordings(currentUser.uid)
        ]);

        setStats(statsData);
        setRecordings(recordingsData);

        // Create synthetic snapshots from recordings for visualization
        const syntheticSnapshots = createSnapshotsFromRecordings(recordingsData);
        setProgressSnapshots(syntheticSnapshots);

        // Calculate trends
        if (syntheticSnapshots.length > 0) {
          const trendsData = getProgressTrends(syntheticSnapshots);
          setTrends(trendsData);
        }

      } catch (error) {
        console.error('[ProgressPage] Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [currentUser]);

  // Create synthetic snapshots from recordings grouped by date
  const createSnapshotsFromRecordings = (recordings) => {
    if (!recordings || recordings.length === 0) return [];

    // Group recordings by date
    const groupedByDate = {};
    recordings.forEach(recording => {
      // Handle both Firestore Timestamp and regular Date objects
      let date;
      if (recording.timestamp?.toDate) {
        date = recording.timestamp.toDate();
      } else if (recording.timestamp instanceof Date) {
        date = recording.timestamp;
      } else if (recording.created_at?.toDate) {
        date = recording.created_at.toDate();
      } else if (recording.created_at instanceof Date) {
        date = recording.created_at;
      } else {
        return; // Skip if no valid date
      }
      
      const dateKey = date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(recording);
    });

    // Create snapshots for each date
    const snapshots = Object.entries(groupedByDate).map(([dateKey, recs]) => {
      const avgScore = recs.reduce((sum, r) => sum + (r.score || 0), 0) / recs.length;
      return {
        id: dateKey,
        timestamp: { toDate: () => new Date(dateKey) },
        averageScore: Math.round(avgScore),
        recordingsCount: recs.length,
      };
    });

    // Sort by date descending
    return snapshots.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
  };

  const filterRecordingsByTimeframe = (recordings) => {
    const now = new Date();
    let cutoffDate;

    switch (selectedTimeframe) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return recordings;
    }

    return recordings.filter(r => {
      let recordingDate;
      if (r.timestamp?.toDate) {
        recordingDate = r.timestamp.toDate();
      } else if (r.timestamp instanceof Date) {
        recordingDate = r.timestamp;
      } else if (r.created_at?.toDate) {
        recordingDate = r.created_at.toDate();
      } else if (r.created_at instanceof Date) {
        recordingDate = r.created_at;
      } else {
        return false;
      }
      return recordingDate > cutoffDate;
    });
  };

  const calculateAverageScore = (recordings) => {
    if (recordings.length === 0) return 0;
    const total = recordings.reduce((sum, r) => sum + (r.score || 0), 0);
    return (total / recordings.length).toFixed(1);
  };

  const calculateTotalDuration = (recordings) => {
    return recordings.reduce((sum, r) => sum + (r.duration || 0), 0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#6a6a6a'; // dark gray (excellent)
    if (score >= 60) return '#5a5a5a'; // medium gray (good)
    return '#4a4a4a'; // light gray (needs work)
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (!currentUser) {
    return (
      <div className="progress-page">
        <div className="empty-state">
          <h2>Please log in to view your progress</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="progress-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const filteredRecordings = filterRecordingsByTimeframe(recordings);
  const avgScore = calculateAverageScore(filteredRecordings);
  const totalDuration = calculateTotalDuration(filteredRecordings);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="progress-page">
      <NavMenu />
      <div className="progress-header">
        <h1>Your Progress Journey</h1>
        <p className="subtitle">Track your improvement over time</p>
      </div>

      {/* Timeframe Filter */}
      <div className="timeframe-selector">
        <button 
          className={selectedTimeframe === 'all' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('all')}
        >
          All Time
        </button>
        <button 
          className={selectedTimeframe === 'month' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('month')}
        >
          Last Month
        </button>
        <button 
          className={selectedTimeframe === 'week' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('week')}
        >
          Last Week
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#909090" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="#909090"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{filteredRecordings.length}</h3>
            <p>Total Recordings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#909090" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{avgScore}</h3>
            <p>Average Score</p>
            <span className="stat-label" style={{ color: getScoreColor(avgScore) }}>
              {getScoreLabel(avgScore)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#909090" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="#909090" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalMinutes}m</h3>
            <p>Practice Time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 3L21 21M9 9L3 3M15 9L21 3M9 15L3 21M15 15L21 21" stroke="#909090" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="4" stroke="#909090" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalWordCount || 0}</h3>
            <p>Words Spoken</p>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {progressSnapshots.length > 0 && (
        <div className="progress-chart-card">
          <h2>Score Trend</h2>
          <div className="chart-container">
            <div className="chart">
              {progressSnapshots.slice(0, 15).reverse().map((snapshot, index) => {
                const score = snapshot.averageScore || 0;
                const height = (score / 100) * 100;
                const date = snapshot.timestamp?.toDate();
                const dateStr = date ? `${date.getMonth() + 1}/${date.getDate()}` : '';

                return (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${height}%`,
                        background: getScoreColor(score)
                      }}
                      title={`${dateStr}: ${score}`}
                    >
                      <span className="bar-value">{score}</span>
                    </div>
                    <span className="bar-label">{dateStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skill Breakdown */}
      {filteredRecordings.length > 0 && (
        <div className="skills-breakdown">
          <h2>Skill Analysis</h2>
          <div className="skills-grid">
            <SkillBar 
              label="Clarity"
              score={stats?.averageClarityScore || 0}
              color="#5a5a5a"
            />
            <SkillBar 
              label="Pace"
              score={stats?.averagePaceScore || 0}
              color="#6a6a6a"
            />
            <SkillBar 
              label="Tone"
              score={stats?.averageToneScore || 0}
              color="#4a4a4a"
            />
            <SkillBar 
              label="Confidence"
              score={stats?.averageConfidenceScore || 0}
              color="#555555"
            />
          </div>
        </div>
      )}

      {/* Progress Insights */}
      {trends && (
        <div className="insights-section">
          <h2>Insights & Achievements</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <h3>Current Streak</h3>
              <p className="insight-value">{trends.currentStreak} days</p>
              <p className="insight-description">Keep it going!</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <h3>Improvement Rate</h3>
              <p className="insight-value">
                {trends.scoreImprovement > 0 ? '+' : ''}{trends.scoreImprovement.toFixed(1)}%
              </p>
              <p className="insight-description">Since last period</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🏆</div>
              <h3>Best Performance</h3>
              <p className="insight-value">{trends.bestScore || 0}</p>
              <p className="insight-description">Your highest score</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <h3>Most Active Day</h3>
              <p className="insight-value">{trends.mostActiveDay || 'N/A'}</p>
              <p className="insight-description">of the week</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Recordings Summary */}
      {filteredRecordings.length > 0 && (
        <div className="recent-recordings-summary">
          <h2>Recent Recordings</h2>
          <div className="recordings-list">
            {filteredRecordings.slice(0, 5).map((recording) => {
              // Handle both Firestore Timestamp and regular Date objects
              let dateString = 'No date';
              if (recording.timestamp?.toDate) {
                dateString = recording.timestamp.toDate().toLocaleDateString();
              } else if (recording.timestamp instanceof Date) {
                dateString = recording.timestamp.toLocaleDateString();
              } else if (recording.created_at?.toDate) {
                dateString = recording.created_at.toDate().toLocaleDateString();
              } else if (recording.created_at instanceof Date) {
                dateString = recording.created_at.toLocaleDateString();
              }

              return (
                <div key={recording.id} className="recording-summary-item">
                  <div className="recording-info">
                    <h4>{recording.goal || 'Untitled Recording'}</h4>
                    <p className="recording-date">
                      {dateString}
                    </p>
                  </div>
                  <div className="recording-score">
                    <div 
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(recording.score) }}
                    >
                      {recording.score || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recordings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No recordings yet</h2>
          <p>Start recording speeches to track your progress!</p>
          <button 
            className="cta-button"
            onClick={() => window.location.href = '/'}
          >
            Record Your First Speech
          </button>
        </div>
      )}
    </div>
  );
}

// Skill Bar Component
function SkillBar({ label, score, color }) {
  return (
    <div className="skill-bar">
      <div className="skill-header">
        <span className="skill-label">{label}</span>
        <span className="skill-score">{score.toFixed(0)}%</span>
      </div>
      <div className="skill-progress-track">
        <div 
          className="skill-progress-fill"
          style={{ 
            width: `${score}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

export default ProgressPage;
