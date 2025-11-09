// Recording Service - Firestore Operations
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

/**
 * Save a new recording to Firestore
 * @param {string} userId - User ID
 * @param {object} recordingData - Recording data including transcript, feedback, etc.
 * @returns {Promise<string>} - Document ID of the saved recording
 */
export const saveRecording = async (
  userId,
  recordingData
) => {
  try {
    console.log(
      "[RecordingsService] Saving recording for user:",
      userId
    );

    // Prepare data for Firestore (following your schema)
    const recordingDoc = {
      // User reference
      user_id: userId,

      // Timestamps
      created_at: serverTimestamp(),

      // Basic info
      duration_seconds: recordingData.duration || 0,
      word_count: recordingData.wordCount || 0,
      speech_goal: recordingData.goal || "",

      // Transcript
      transcript_text: recordingData.transcript || "",

      // Scores (from FeedbackReport)
      overall_score: recordingData.score || 0,
      clarity_score:
        recordingData.feedback?.clarityScore || 0,
      confidence_score:
        recordingData.feedback?.confidenceScore || 0,
      engagement_score:
        recordingData.feedback?.engagementScore || 0,
      structure_score:
        recordingData.feedback?.structureScore || 0,

      // Metrics
      words_per_minute: recordingData.wpm || 0,
      filler_words_count: Object.keys(
        recordingData.feedback?.fillerWords || {}
      ).length,
      filler_words:
        recordingData.feedback?.fillerWords || {},

      // AI Feedback
      ai_summary: recordingData.feedback?.aiSummary || "",
      constructive_tip:
        recordingData.feedback?.constructiveTip || "",
      strengths: recordingData.feedback?.strengths || [],
      improvements:
        recordingData.feedback?.improvements || [],

      // Session tracking
      session_id: recordingData.sessionId || null,

      // Audio file (will be stored separately in Firebase Storage)
      audio_file_path: recordingData.audioFilePath || null,

      // UI features
      isPinned: false,
      transcriptPreview:
        recordingData.transcriptPreview || "",
    };

    // Save to Firestore
    const docRef = await addDoc(
      collection(db, "recordings"),
      recordingDoc
    );
    console.log(
      "[RecordingsService] ✓ Recording saved with ID:",
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to save recording:",
      error
    );
    throw error;
  }
};

/**
 * Get all recordings for a specific user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of recordings to fetch
 * @returns {Promise<Array>} - Array of recording objects
 */
export const getUserRecordings = async (
  userId,
  limitCount = 10
) => {
  try {
    console.log(
      "[RecordingsService] Fetching recordings for user:",
      userId
    );

    const q = query(
      collection(db, "recordings"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const recordings = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recordings.push({
        id: doc.id,
        goal: data.speech_goal,
        transcript: data.transcript_text,
        transcriptPreview: data.transcriptPreview,
        duration: data.duration_seconds,
        wordCount: data.word_count,
        wpm: data.words_per_minute,
        score: data.overall_score,
        sessionId: data.session_id,
        isPinned: data.isPinned || false,
        timestamp:
          data.created_at?.toDate().toISOString() ||
          new Date().toISOString(),
        feedback: {
          sessionId: data.session_id,
          pace: data.words_per_minute,
          fillerWords: data.filler_words,
          aiSummary: data.ai_summary,
          clarityScore: data.clarity_score,
          confidenceScore: data.confidence_score,
          engagementScore: data.engagement_score,
          structureScore: data.structure_score,
          overall_score: data.overall_score,
          constructiveTip: data.constructive_tip,
          strengths: data.strengths,
          improvements: data.improvements,
        },
      });
    });

    console.log(
      "[RecordingsService] ✓ Fetched",
      recordings.length,
      "recordings"
    );
    return recordings;
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to fetch recordings:",
      error
    );
    throw error;
  }
};

/**
 * Get a single recording by ID
 * @param {string} recordingId - Recording document ID
 * @returns {Promise<object>} - Recording object
 */
export const getRecordingById = async (recordingId) => {
  try {
    const docRef = doc(db, "recordings", recordingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        timestamp:
          data.created_at?.toDate().toISOString() ||
          new Date().toISOString(),
      };
    } else {
      throw new Error("Recording not found");
    }
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to fetch recording:",
      error
    );
    throw error;
  }
};

/**
 * Delete a recording
 * @param {string} recordingId - Recording document ID
 */
export const deleteRecording = async (recordingId) => {
  try {
    console.log(
      "[RecordingsService] Deleting recording:",
      recordingId
    );
    await deleteDoc(doc(db, "recordings", recordingId));
    console.log("[RecordingsService] ✓ Recording deleted");
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to delete recording:",
      error
    );
    throw error;
  }
};

/**
 * Update pin status of a recording
 * @param {string} recordingId - Recording document ID
 * @param {boolean} isPinned - New pin status
 */
export const updateRecordingPinStatus = async (
  recordingId,
  isPinned
) => {
  try {
    console.log(
      "[RecordingsService] Updating pin status:",
      recordingId,
      isPinned
    );
    const docRef = doc(db, "recordings", recordingId);
    await updateDoc(docRef, {
      isPinned: isPinned,
    });
    console.log("[RecordingsService] ✓ Pin status updated");
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to update pin status:",
      error
    );
    throw error;
  }
};

/**
 * Get user statistics and progress
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User statistics
 */
export const getUserStats = async (userId) => {
  try {
    console.log(
      "[RecordingsService] Fetching user stats for:",
      userId
    );

    const q = query(
      collection(db, "recordings"),
      where("user_id", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    let totalRecordings = 0;
    let totalScore = 0;
    let totalClarity = 0;
    let totalConfidence = 0;
    let totalEngagement = 0;
    let totalStructure = 0;
    let totalWPM = 0;
    let totalFillerCount = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalRecordings++;
      totalScore += data.overall_score || 0;
      totalClarity += data.clarity_score || 0;
      totalConfidence += data.confidence_score || 0;
      totalEngagement += data.engagement_score || 0;
      totalStructure += data.structure_score || 0;
      totalWPM += data.words_per_minute || 0;
      totalFillerCount += data.filler_words_count || 0;
    });

    const stats = {
      total_recordings: totalRecordings,
      avg_overall_score:
        totalRecordings > 0
          ? totalScore / totalRecordings
          : 0,
      avg_clarity_score:
        totalRecordings > 0
          ? totalClarity / totalRecordings
          : 0,
      avg_confidence_score:
        totalRecordings > 0
          ? totalConfidence / totalRecordings
          : 0,
      avg_engagement_score:
        totalRecordings > 0
          ? totalEngagement / totalRecordings
          : 0,
      avg_structure_score:
        totalRecordings > 0
          ? totalStructure / totalRecordings
          : 0,
      avg_wpm:
        totalRecordings > 0
          ? totalWPM / totalRecordings
          : 0,
      avg_filler_count:
        totalRecordings > 0
          ? totalFillerCount / totalRecordings
          : 0,
    };

    console.log(
      "[RecordingsService] ✓ User stats calculated:",
      stats
    );
    return stats;
  } catch (error) {
    console.error(
      "[RecordingsService] ❌ Failed to fetch user stats:",
      error
    );
    throw error;
  }
};
