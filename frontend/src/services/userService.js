// User Service - Firestore Operations for User Profile
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Create or update user profile in Firestore
 * @param {string} userId - User ID
 * @param {object} userData - User data (email, displayName, etc.)
 * @returns {Promise<void>}
 */
export const createOrUpdateUserProfile = async (
  userId,
  userData
) => {
  try {
    console.log(
      "[UserService] Creating/updating user profile:",
      userId
    );

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        user_id: userId,
        email: userData.email || "",
        display_name: userData.displayName || "",
        created_at: serverTimestamp(),
        preferred_ai_personality: "supportive",
        total_recordings: 0,
        last_login: serverTimestamp(),
      });
      console.log(
        "[UserService] ✓ New user profile created"
      );
    } else {
      // Update last login
      await updateDoc(userRef, {
        last_login: serverTimestamp(),
      });
      console.log("[UserService] ✓ User profile updated");
    }
  } catch (error) {
    console.error(
      "[UserService] ❌ Failed to create/update user profile:",
      error
    );
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    console.log(
      "[UserService] Fetching user profile:",
      userId
    );

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("[UserService] ✓ User profile fetched");
      return {
        id: userSnap.id,
        ...data,
        created_at:
          data.created_at?.toDate().toISOString() || null,
        last_login:
          data.last_login?.toDate().toISOString() || null,
      };
    } else {
      console.log("[UserService] ⚠ User profile not found");
      return null;
    }
  } catch (error) {
    console.error(
      "[UserService] ❌ Failed to fetch user profile:",
      error
    );
    throw error;
  }
};

/**
 * Update user's AI personality preference
 * @param {string} userId - User ID
 * @param {string} personality - AI personality type
 * @returns {Promise<void>}
 */
export const updateAIPersonality = async (
  userId,
  personality
) => {
  try {
    console.log(
      "[UserService] Updating AI personality:",
      userId,
      personality
    );

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferred_ai_personality: personality,
    });

    console.log("[UserService] ✓ AI personality updated");
  } catch (error) {
    console.error(
      "[UserService] ❌ Failed to update AI personality:",
      error
    );
    throw error;
  }
};

/**
 * Increment user's total recordings count
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const incrementRecordingsCount = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentCount =
        userSnap.data().total_recordings || 0;
      await updateDoc(userRef, {
        total_recordings: currentCount + 1,
      });
      console.log(
        "[UserService] ✓ Recordings count incremented"
      );
    }
  } catch (error) {
    console.error(
      "[UserService] ❌ Failed to increment recordings count:",
      error
    );
    throw error;
  }
};
