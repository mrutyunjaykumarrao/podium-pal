import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserRecordings } from '../services/recordingsService';
import ProfileMenu from '../components/ProfileMenu';
import ReturnToPracticeButton from '../components/ReturnToPracticeButton';
import './RecordingsPage.css';

function RecordingsPage() {
  const { currentUser } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('[RecordingsPage] Fetching recordings from Firestore...');
        const data = await getUserRecordings(currentUser.uid, 50);
        console.log('[RecordingsPage] Fetched', data.length, 'recordings');
        setRecordings(data);
        setError(null);
      } catch (err) {
        console.error('[RecordingsPage] Error fetching recordings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [currentUser]);

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
        <ProfileMenu />
        <ReturnToPracticeButton />
        <div className="recordings-loading">
          <div className="spinner"></div>
          <p>🧘 Loading your recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recordings-page">
      <ProfileMenu />
      <ReturnToPracticeButton />
      <div className="recordings-container">
        <div className="recordings-header">
          <h1>📊 Your Recordings</h1>
          <p>View and analyze all your speech recordings</p>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
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
                key={recording.sessionId || recording.id} 
                className="recording-card"
                onClick={() => handleRecordingClick(recording.sessionId || recording.id)}
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
                      <span className="stat-value">{recording.score?.toFixed(1) || 'N/A'}</span>
                      <span className="stat-label">Score</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">📝</span>
                      <span className="stat-value">{recording.wordCount || 0}</span>
                      <span className="stat-label">Words</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">⏱️</span>
                      <span className="stat-value">{Math.floor((recording.duration || 0) / 60)}:{String((recording.duration || 0) % 60).padStart(2, '0')}</span>
                      <span className="stat-label">Duration</span>
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
