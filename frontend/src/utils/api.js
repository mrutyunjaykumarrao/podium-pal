/**
 * API utilities for backend communication
 * Handles all HTTP requests to the FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Send recording data to backend for analysis
 * @param {string} transcript - The speech transcript
 * @param {Blob} audioBlob - The audio recording
 * @param {number} duration - Recording duration in seconds
 * @param {string} userGoal - User's speech goal
 * @param {string} aiPersonality - AI personality for feedback
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeRecording = async (
  transcript,
  audioBlob,
  duration,
  userGoal,
  aiPersonality
) => {
  // Validate inputs
  if (!userGoal || !userGoal.trim()) {
    throw new Error('Please enter your speech goal before recording!');
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('No speech detected. Please try recording again.');
  }

  // Create FormData to send both text and audio
  const formData = new FormData();
  formData.append('transcript', transcript);
  formData.append('userGoal', userGoal);
  formData.append('aiPersonality', aiPersonality);
  formData.append('duration', duration.toString());

  // Add audio file only if it has data
  if (audioBlob && audioBlob.size > 0) {
    console.log('Adding audio to request:', audioBlob.size, 'bytes');
    formData.append('audio', audioBlob, 'recording.webm');
  } else {
    console.log('No audio to send (proceeding with transcript only)');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Analysis response:', data);

    // Navigate to feedback page if sessionId present
    if (data && data.sessionId) {
      console.log('Session ID received:', data.sessionId);
      // Note: Navigation handled by parent component
    }

    return data;
  } catch (error) {
    console.error('Error sending transcript for analysis:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Could not connect to the backend. Please make sure the FastAPI server is running on http://localhost:8000'
      );
    }
    
    throw error;
  }
};

/**
 * Calculate words per minute
 * @param {number} wordCount - Number of words
 * @param {number} durationSeconds - Duration in seconds
 * @returns {number} WPM
 */
export const calculateWPM = (wordCount, durationSeconds) => {
  if (durationSeconds === 0) return 0;
  const durationMinutes = durationSeconds / 60;
  return Math.round(wordCount / durationMinutes);
};

/**
 * Format duration as MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Count words in text
 * @param {string} text - Text to count words in
 * @returns {number} Word count
 */
export const countWords = (text) => {
  if (!text || !text.trim()) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};
