import React from 'react';
import NavMenu from '../components/NavMenu';
import './SettingsPage.css';

function SettingsPage() {
  return (
    <div className="settings-page">
      <NavMenu />
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your Podium Pal experience</p>
        </div>

        <div className="settings-card">
          <div className="settings-section">
            <h2>🎨 Appearance</h2>
            <div className="setting-item">
              <label>Theme</label>
              <select defaultValue="meditative">
                <option value="meditative">Meditative (Current)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Font Size</label>
              <select defaultValue="medium">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h2>🤖 AI Preferences</h2>
            <div className="setting-item">
              <label>Default AI Personality</label>
              <select defaultValue="supportive">
                <option value="supportive">Supportive</option>
                <option value="direct">Direct</option>
                <option value="critical">Critical</option>
                <option value="humorous">Humorous</option>
                <option value="mentor">Mentor</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h2>🎤 Recording</h2>
            <div className="setting-item">
              <label>Audio Quality</label>
              <select defaultValue="high">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="setting-item checkbox-item">
              <input type="checkbox" id="auto-save" defaultChecked />
              <label htmlFor="auto-save">Auto-save recordings</label>
            </div>
          </div>

          <div className="settings-section">
            <h2>🔔 Notifications</h2>
            <div className="setting-item checkbox-item">
              <input type="checkbox" id="analysis-complete" defaultChecked />
              <label htmlFor="analysis-complete">Analysis complete notifications</label>
            </div>
            <div className="setting-item checkbox-item">
              <input type="checkbox" id="tips" defaultChecked />
              <label htmlFor="tips">Show daily tips</label>
            </div>
          </div>

          <div className="settings-actions">
            <button className="save-btn">Save Changes</button>
            <button className="reset-btn">Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
