import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing recording history
 * Handles localStorage operations for recording data
 * Database-ready: Easy to swap localStorage with API calls
 */
export const useRecordingHistory = () => {
  const [recordingHistory, setRecordingHistory] = useState([]);

  // Load recording history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('podiumPalHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        // Sort: pinned items first, then by timestamp
        history.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        setRecordingHistory(history);
      } catch (e) {
        console.error('Failed to load recording history:', e);
      }
    }
  }, []);

  // Save recording to history
  const saveToHistory = useCallback(
    (recordingData) => {
      const newRecording = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        isPinned: false,
        ...recordingData,
      };

      const updatedHistory = [newRecording, ...recordingHistory].slice(0, 10); // Keep last 10
      setRecordingHistory(updatedHistory);
      localStorage.setItem('podiumPalHistory', JSON.stringify(updatedHistory));
      
      return newRecording;
    },
    [recordingHistory]
  );

  // Delete recording from history
  const deleteRecording = useCallback(
    (recordingId, e) => {
      if (e) e.stopPropagation(); // Prevent triggering the click to view
      
      const updatedHistory = recordingHistory.filter((r) => r.id !== recordingId);
      setRecordingHistory(updatedHistory);
      localStorage.setItem('podiumPalHistory', JSON.stringify(updatedHistory));
    },
    [recordingHistory]
  );

  // Toggle pin status
  const togglePin = useCallback(
    (recordingId, e) => {
      if (e) e.stopPropagation(); // Prevent triggering the click to view
      
      const updatedHistory = recordingHistory.map((r) =>
        r.id === recordingId ? { ...r, isPinned: !r.isPinned } : r
      );
      
      // Sort: pinned items first, then by timestamp
      updatedHistory.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setRecordingHistory(updatedHistory);
      localStorage.setItem('podiumPalHistory', JSON.stringify(updatedHistory));
    },
    [recordingHistory]
  );

  // Handle clicking a recording from history
  const handleRecordingClick = useCallback((recording) => {
    return recording; // Return the recording data for parent to handle
  }, []);

  return {
    recordingHistory,
    saveToHistory,
    deleteRecording,
    togglePin,
    handleRecordingClick,
  };
};
