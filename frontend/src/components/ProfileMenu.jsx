import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProfileMenu.css';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    if (currentUser.displayName) {
      const names = currentUser.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (currentUser.email) {
      return currentUser.email[0].toUpperCase();
    }
    
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser) return 'User';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  };

  if (!currentUser) return null;

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button 
        className="profile-trigger" 
        onClick={toggleMenu}
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt="Profile" 
            className="profile-avatar-img"
          />
        ) : (
          <div className="profile-avatar-initials">
            {getUserInitials()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="profile-dropdown-avatar-img"
                />
              ) : (
                <div className="profile-dropdown-avatar-initials">
                  {getUserInitials()}
                </div>
              )}
            </div>
            <div className="profile-dropdown-info">
              <div className="profile-dropdown-name">{getDisplayName()}</div>
              <div className="profile-dropdown-email">{currentUser.email}</div>
            </div>
          </div>

          <div className="profile-dropdown-divider"></div>

          <nav className="profile-dropdown-nav">
            <button
              onClick={() => handleNavigation('/')}
              className="profile-dropdown-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavigation('/recordings')}
              className="profile-dropdown-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m8.66-10.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m18.66 8.66l-4.24-4.24m-4.24-4.24l-4.24-4.24"></path>
              </svg>
              <span>Recordings</span>
            </button>

            <button
              onClick={() => handleNavigation('/account')}
              className="profile-dropdown-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Account</span>
            </button>

            <button
              onClick={() => handleNavigation('/settings')}
              className="profile-dropdown-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6"></path>
                <path d="M17 7l-5 5-5-5m10 10l-5-5-5 5"></path>
              </svg>
              <span>Settings</span>
            </button>
          </nav>

          <div className="profile-dropdown-divider"></div>

          <button
            onClick={handleLogout}
            className="profile-dropdown-item profile-dropdown-logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
