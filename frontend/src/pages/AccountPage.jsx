import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';
import NavMenu from '../components/NavMenu';
import { 
  LotusIcon, 
  PeaceIcon, 
  MindfulnessIcon,
  BalanceIcon 
} from '../components/svgs/MeditativeIcons';

function AccountPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || 'Not available',
    age: '',
    bio: '',
    userId: currentUser?.uid || 'Not available',
    createdAt: currentUser?.metadata?.creationTime || new Date().toISOString(),
    lastSignIn: currentUser?.metadata?.lastSignInTime || new Date().toISOString(),
    totalRecordings: 0,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handlePersonalInfoChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalInfo = async () => {
    setIsSaving(true);
    // TODO: Call API to update user info
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert('Personal information updated successfully');
    }, 1000);
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    setIsSaving(true);
    // TODO: Call API to update password
    setTimeout(() => {
      setIsSaving(false);
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully');
    }, 1000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="account-page">
      <NavMenu />
      
      <div className="account-container">
        {/* Page Header */}
        <div className="account-header">
          <div className="header-content">
            <div className="header-icon">
              <LotusIcon size={40} />
            </div>
            <div>
              <h1>Your Sacred Space</h1>
              <p className="header-subtitle">Manage your mindful journey</p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="account-section">
          <div className="section-header">
            <div className="section-icon">
              <PeaceIcon size={24} />
            </div>
            <h2>Personal Information</h2>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          <div className="section-content">
            <div className="info-grid">
              <div className="info-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="meditative-input"
                  />
                ) : (
                  <div className="info-value">{userData.name}</div>
                )}
              </div>

              <div className="info-field">
                <label>Email Address</label>
                <div className="info-value">{userData.email}</div>
                <span className="info-note">Email cannot be changed</span>
              </div>

              <div className="info-field">
                <label>Age (Optional)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={userData.age}
                    onChange={(e) => handlePersonalInfoChange('age', e.target.value)}
                    placeholder="Enter your age"
                    className="meditative-input"
                  />
                ) : (
                  <div className="info-value">{userData.age || 'Not specified'}</div>
                )}
              </div>

              <div className="info-field full-width">
                <label>Bio (Optional)</label>
                {isEditing ? (
                  <textarea
                    value={userData.bio}
                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                    placeholder="Tell us about your speaking journey..."
                    className="meditative-textarea"
                    rows="4"
                  />
                ) : (
                  <div className="info-value">{userData.bio || 'No bio added yet'}</div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="action-buttons">
                <button 
                  className="save-btn"
                  onClick={handleSavePersonalInfo}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Details Section */}
        <div className="account-section">
          <div className="section-header">
            <div className="section-icon">
              <MindfulnessIcon size={24} />
            </div>
            <h2>Account Details</h2>
          </div>

          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">User ID</div>
                <div className="detail-value monospace">{userData.userId}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Account Created</div>
                <div className="detail-value">{formatDate(userData.createdAt)}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Last Sign In</div>
                <div className="detail-value">{formatDate(userData.lastSignIn)}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Total Recordings</div>
                <div className="detail-value highlight">{userData.totalRecordings}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="account-section">
          <div className="section-header">
            <div className="section-icon">
              <BalanceIcon size={24} />
            </div>
            <h2>Security</h2>
          </div>

          <div className="section-content">
            {!showPasswordChange ? (
              <div className="security-info">
                <p className="security-description">
                  Keep your account secure by using a strong password and updating it regularly.
                </p>
                <button 
                  className="change-password-btn"
                  onClick={() => setShowPasswordChange(true)}
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="password-change-form">
                <div className="info-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className="meditative-input"
                  />
                </div>

                <div className="info-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className="meditative-input"
                  />
                </div>

                <div className="info-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="meditative-input"
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className="save-btn"
                    onClick={handleUpdatePassword}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="account-section danger-section">
          <div className="section-header">
            <h2>Danger Zone</h2>
          </div>
          <div className="section-content">
            <div className="danger-info">
              <p>Once you delete your account, there is no going back. All your recordings and data will be permanently deleted.</p>
              <button className="delete-account-btn">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
