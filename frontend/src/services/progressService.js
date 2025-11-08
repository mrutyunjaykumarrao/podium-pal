// Progress Snapshots Service - Periodic Progress Tracking
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Create a progress snapshot for a user
 * @param {string} userId - User ID
 * @param {Date} periodStart - Start date of the period
 * @param {Date} periodEnd - End date of the period
 * @returns {Promise<string>} - Snapshot document ID
 */
export const createProgressSnapshot = async (
  userId,
  periodStart,
  periodEnd
) => {
  try {
    console.log(
      "[ProgressService] Creating progress snapshot for user:",
      userId
    );

    // Query recordings in the time period
    const recordingsQuery = query(
      collection(db, "recordings"),
      where("user_id", "==", userId),
      where("created_at", ">=", periodStart),
      where("created_at", "<=", periodEnd)
    );

    const recordingsSnapshot = await getDocs(
      recordingsQuery
    );

    if (recordingsSnapshot.empty) {
      console.log(
        "[ProgressService] No recordings in this period"
      );
      return null;
    }

    // Calculate averages
    let totalOverall = 0;
    let totalClarity = 0;
    let totalConfidence = 0;
    let totalEngagement = 0;
    let totalStructure = 0;
    let totalWPM = 0;
    let totalFillerCount = 0;
    const recordingsCount = recordingsSnapshot.size;

    recordingsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalOverall += data.overall_score || 0;
      totalClarity += data.clarity_score || 0;
      totalConfidence += data.confidence_score || 0;
      totalEngagement += data.engagement_score || 0;
      totalStructure += data.structure_score || 0;
      totalWPM += data.words_per_minute || 0;
      totalFillerCount += data.filler_words_count || 0;
    });

    // Get previous snapshot for comparison
    const previousSnapshot = await getPreviousSnapshot(
      userId,
      periodStart
    );

    const snapshotData = {
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      created_at: serverTimestamp(),

      // Averages
      avg_overall_score: totalOverall / recordingsCount,
      avg_clarity_score: totalClarity / recordingsCount,
      avg_confidence_score:
        totalConfidence / recordingsCount,
      avg_engagement_score:
        totalEngagement / recordingsCount,
      avg_structure_score: totalStructure / recordingsCount,
      avg_wpm: totalWPM / recordingsCount,
      avg_filler_count: totalFillerCount / recordingsCount,

      // Comparison with previous period
      score_improvement: previousSnapshot
        ? totalOverall / recordingsCount -
          previousSnapshot.avg_overall_score
        : 0,
      filler_reduction: previousSnapshot
        ? previousSnapshot.avg_filler_count -
          totalFillerCount / recordingsCount
        : 0,

      // Metadata
      recordings_in_period: recordingsCount,
    };

    const docRef = await addDoc(
      collection(db, "progress_snapshots"),
      snapshotData
    );
    console.log(
      "[ProgressService] ✓ Progress snapshot created:",
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    console.error(
      "[ProgressService] ❌ Failed to create progress snapshot:",
      error
    );
    throw error;
  }
};

/**
 * Get the most recent progress snapshot before a given date
 * @param {string} userId - User ID
 * @param {Date} beforeDate - Date to search before
 * @returns {Promise<object|null>} - Previous snapshot or null
 */
const getPreviousSnapshot = async (userId, beforeDate) => {
  try {
    const q = query(
      collection(db, "progress_snapshots"),
      where("user_id", "==", userId),
      where("period_end", "<", beforeDate),
      orderBy("period_end", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return doc.data();
  } catch (error) {
    console.error(
      "[ProgressService] Failed to get previous snapshot:",
      error
    );
    return null;
  }
};

/**
 * Get all progress snapshots for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of snapshots to fetch
 * @returns {Promise<Array>} - Array of progress snapshots
 */
export const getUserProgressSnapshots = async (
  userId,
  limitCount = 12
) => {
  try {
    console.log(
      "[ProgressService] Fetching progress snapshots for user:",
      userId
    );

    const q = query(
      collection(db, "progress_snapshots"),
      where("user_id", "==", userId),
      orderBy("period_end", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const snapshots = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      snapshots.push({
        id: doc.id,
        ...data,
        period_start: data.period_start?.toDate() || null,
        period_end: data.period_end?.toDate() || null,
        created_at: data.created_at?.toDate() || null,
      });
    });

    console.log(
      "[ProgressService] ✓ Fetched",
      snapshots.length,
      "snapshots"
    );
    return snapshots;
  } catch (error) {
    console.error(
      "[ProgressService] ❌ Failed to fetch progress snapshots:",
      error
    );
    throw error;
  }
};

/**
 * Calculate and create weekly progress snapshot
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - Snapshot ID or null
 */
export const createWeeklySnapshot = async (userId) => {
  const now = new Date();
  const weekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  );

  return await createProgressSnapshot(userId, weekAgo, now);
};

/**
 * Calculate and create monthly progress snapshot
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - Snapshot ID or null
 */
export const createMonthlySnapshot = async (userId) => {
  const now = new Date();
  const monthAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  return await createProgressSnapshot(
    userId,
    monthAgo,
    now
  );
};
