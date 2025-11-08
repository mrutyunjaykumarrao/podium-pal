import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavMenu from '../components/NavMenu';
import './RecordingsPage.css';

function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('http://localhost:8000/recordings');
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      const data = await response.json();
      // Sort by date, newest first
      const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecordings(sorted);
      setError(null);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingClick = (sessionId) => {
    navigate(`/feedback/${sessionId}`);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="recordings-page">
        <NavMenu />
        <div className="recordings-loading">
          <div className="spinner"></div>
          <p>🧘 Loading your recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recordings-page">
      <NavMenu />
      <div className="recordings-container">
        <div className="recordings-header">
          <h1>📊 Your Recordings</h1>
          <p>View and analyze all your speech recordings</p>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={fetchRecordings}>Retry</button>
          </div>
        )}

        {!error && recordings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎤</div>
            <h2>No recordings yet</h2>
            <p>Start by recording your first speech!</p>
            <button className="cta-btn" onClick={() => navigate('/')}>
              Create Recording
            </button>
          </div>
        ) : (
          <div className="recordings-grid">
            {recordings.map((recording, index) => (
              <div 
                key={recording.session_id} 
                className="recording-card"
                onClick={() => handleRecordingClick(recording.session_id)}
              >
                <div className="card-header">
                  <div className="card-number">#{recordings.length - index}</div>
                  <div className="card-date">{formatDate(recording.timestamp)}</div>
                </div>
                
                <div className="card-content">
                  <h3>{recording.goal || 'General Speech'}</h3>
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{recording.overall_score || 'N/A'}</span>
                      <span className="stat-label">Score</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-value">{recording.ai_personality || 'N/A'}</span>
                      <span className="stat-label">Style</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="view-btn">View Analysis →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordingsPage;
