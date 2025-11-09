import { useState, useEffect, useCallback } from 'react';
import { getUserRecordings, deleteRecording as deleteRecordingFromDB } from '../services/recordingsService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing recording history
 * Fetches recordings from Firestore database
 */
export const useRecordingHistory = () => {
  const { currentUser } = useAuth();
  const [recordingHistory, setRecordingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load recording history from Firestore on mount
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('[useRecordingHistory] Fetching recordings from Firestore...');
        const recordings = await getUserRecordings(currentUser.uid, 10);
        
        // Sort: pinned items first, then by timestamp
        recordings.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setRecordingHistory(recordings);
        console.log('[useRecordingHistory] Loaded', recordings.length, 'recordings');
      } catch (error) {
        console.error('[useRecordingHistory] Failed to load recording history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [currentUser]);

  // Save recording to history (no-op now, as recordings are saved in FeedbackPage)
  const saveToHistory = useCallback(
    (recordingData) => {
      // Recordings are now saved to Firestore in FeedbackPage
      // This function kept for compatibility but doesn't do anything
      console.log('[useRecordingHistory] saveToHistory called (handled by FeedbackPage)');
      return recordingData;
    },
    []
  );

  // Delete recording from history
  const deleteRecording = useCallback(
    async (recordingId, e) => {
      if (e) e.stopPropagation(); // Prevent triggering the click to view
      
      if (!currentUser?.uid) return;
      
      try {
        await deleteRecordingFromDB(currentUser.uid, recordingId);
        const updatedHistory = recordingHistory.filter((r) => r.id !== recordingId);
        setRecordingHistory(updatedHistory);
        console.log('[useRecordingHistory] Recording deleted:', recordingId);
      } catch (error) {
        console.error('[useRecordingHistory] Failed to delete recording:', error);
      }
    },
    [recordingHistory, currentUser]
  );

  // Toggle pin status (simplified - just local state for now)
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
      console.log('[useRecordingHistory] Pin toggled for:', recordingId);
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
