// Storage Service - Firebase Storage for Audio Files
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "../firebase";

const storage = getStorage(app);

/**
 * Upload audio file to Firebase Storage
 * @param {Blob} audioBlob - Audio blob to upload
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID for unique filename
 * @returns {Promise<string>} - Download URL of the uploaded file
 */
export const uploadAudioFile = async (
  audioBlob,
  userId,
  sessionId
) => {
  try {
    console.log(
      "[StorageService] Uploading audio file for session:",
      sessionId
    );

    // Create a reference to the file location
    const timestamp = new Date().getTime();
    const fileName = `${userId}/${sessionId}_${timestamp}.webm`;
    const storageRef = ref(
      storage,
      `audio_recordings/${fileName}`
    );

    // Upload the file
    const snapshot = await uploadBytes(
      storageRef,
      audioBlob
    );
    console.log(
      "[StorageService] ✓ Audio file uploaded:",
      snapshot.metadata.fullPath
    );

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(
      "[StorageService] ✓ Download URL obtained:",
      downloadURL
    );

    return downloadURL;
  } catch (error) {
    console.error(
      "[StorageService] ❌ Failed to upload audio file:",
      error
    );
    throw error;
  }
};

/**
 * Delete audio file from Firebase Storage
 * @param {string} audioFilePath - Full path or URL of the audio file
 * @returns {Promise<void>}
 */
export const deleteAudioFile = async (audioFilePath) => {
  try {
    if (!audioFilePath) return;

    console.log(
      "[StorageService] Deleting audio file:",
      audioFilePath
    );

    // Extract the path from the URL if it's a full URL
    let filePath = audioFilePath;
    if (audioFilePath.includes("firebase")) {
      // Extract path from Firebase Storage URL
      const match = audioFilePath.match(
        /audio_recordings%2F(.+?)\?/
      );
      if (match) {
        filePath = decodeURIComponent(match[1]);
      }
    }

    const storageRef = ref(
      storage,
      `audio_recordings/${filePath}`
    );
    await deleteObject(storageRef);

    console.log("[StorageService] ✓ Audio file deleted");
  } catch (error) {
    console.error(
      "[StorageService] ❌ Failed to delete audio file:",
      error
    );
    // Don't throw error for deletion failures (file might not exist)
  }
};

/**
 * Get download URL for an audio file
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<string>} - Download URL
 */
export const getAudioDownloadURL = async (filePath) => {
  try {
    const storageRef = ref(
      storage,
      `audio_recordings/${filePath}`
    );
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(
      "[StorageService] ❌ Failed to get download URL:",
      error
    );
    throw error;
  }
};
