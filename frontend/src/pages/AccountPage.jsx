import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavMenu from '../components/NavMenu';
import './AccountPage.css';

function AccountPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="account-page">
      <NavMenu />
      <div className="account-container">
        <div className="account-header">
          <h1>🧘 Account Settings</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        <div className="account-card">
          <div className="account-section">
            <h2>Profile Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <p>{currentUser?.email || 'Not available'}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p>{currentUser?.uid || 'Not available'}</p>
              </div>
              <div className="info-item">
                <label>Account Created</label>
                <p>{currentUser?.metadata?.creationTime || 'Not available'}</p>
              </div>
              <div className="info-item">
                <label>Last Sign In</label>
                <p>{currentUser?.metadata?.lastSignInTime || 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="account-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => navigate('/')}>
                <span>🎤</span>
                New Recording
              </button>
              <button className="action-btn" onClick={() => navigate('/recordings')}>
                <span>📊</span>
                View Recordings
              </button>
              <button className="action-btn" onClick={() => navigate('/settings')}>
                <span>⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
