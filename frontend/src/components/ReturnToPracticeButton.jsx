import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReturnToPracticeButton.css';

const ReturnToPracticeButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      className="return-to-practice-btn" 
      onClick={() => navigate('/')}
      aria-label="Return to Practice"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Return to Practice</span>
    </button>
  );
};

export default ReturnToPracticeButton;
