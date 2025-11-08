import React, { useState, useEffect } from 'react';
import './CollapsibleSidebar.css';

const CollapsibleSidebar = ({ 
  recordings, 
  onSelectRecording, 
  onDeleteRecording, 
  onTogglePin 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Keyboard shortcut: Cmd/Ctrl + B to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
      >
        <svg 
          className="sidebar-toggle-icon"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <rect x="9" y="9" width="6" height="7"></rect>
            </svg>
            <h3>Recent Recordings</h3>
          </>
        )}
        {isCollapsed && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6"></path>
          </svg>
        )}
      </div>

      {/* Recordings List */}
      <div className="sidebar-recordings-list">
        {recordings.length === 0 && !isCollapsed && (
          <div className="sidebar-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
            <p>No recordings yet</p>
            <small>Your recordings will appear here</small>
          </div>
        )}

        {recordings.map((recording) => (
          <div
            key={recording.id}
            className={`sidebar-recording-item ${recording.isPinned ? 'pinned' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => onSelectRecording(recording)}
            title={isCollapsed ? recording.title : ''}
          >
            {isCollapsed ? (
              // Collapsed view: Just show icon
              <div className="sidebar-recording-icon">
                {recording.isPinned ? '📌' : '🎤'}
              </div>
            ) : (
              // Expanded view: Full details
              <>
                <div className="sidebar-recording-header">
                  <div className="sidebar-recording-title">
                    {recording.title || 'Untitled Recording'}
                  </div>
                  <div className="sidebar-recording-actions">
                    <button
                      className={`sidebar-pin-btn ${recording.isPinned ? 'pinned' : ''}`}
                      onClick={(e) => onTogglePin(recording.id, e)}
                      aria-label={recording.isPinned ? "Unpin" : "Pin"}
                      title={recording.isPinned ? "Unpin" : "Pin"}
                    >
                      {recording.isPinned ? '📌' : '📍'}
                    </button>
                    <button
                      className="sidebar-delete-btn"
                      onClick={(e) => onDeleteRecording(recording.id, e)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="sidebar-recording-meta">
                  {formatTimestamp(recording.timestamp)} • {formatDuration(recording.duration || 0)}
                </div>

                {recording.stats && (
                  <div className="sidebar-recording-stats">
                    <span className="stat-badge">
                      {recording.stats.wordCount || 0} words
                    </span>
                    <span className="stat-badge">
                      {recording.stats.wpm || 0} WPM
                    </span>
                    {recording.stats.score !== undefined && (
                      <span className="stat-badge score">
                        {recording.stats.score}/10
                      </span>
                    )}
                  </div>
                )}

                {recording.preview && (
                  <div className="sidebar-recording-preview">
                    {recording.preview}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CollapsibleSidebar;
