// Test Database Integration - Run this in browser console
// This script tests all Firebase services without audio upload

import {
  saveRecording,
  getUserRecordings,
  deleteRecording,
  updateRecordingPinStatus,
  getUserStats,
} from "./recordingsService";
import {
  createOrUpdateUserProfile,
  getUserProfile,
} from "./userService";

// Test Suite
const testDatabase = async (userId) => {
  console.log("🧪 Starting Database Tests...\n");

  try {
    // Test 1: Create User Profile
    console.log("Test 1: Creating user profile...");
    await createOrUpdateUserProfile(userId, {
      email: "test@example.com",
      displayName: "Test User",
    });
    console.log("✅ User profile created\n");

    // Test 2: Get User Profile
    console.log("Test 2: Fetching user profile...");
    const profile = await getUserProfile(userId);
    console.log("✅ User profile fetched:", profile, "\n");

    // Test 3: Save Recording (without audio)
    console.log("Test 3: Saving test recording...");
    const testRecording = {
      goal: "Test recording for database verification",
      transcript:
        "This is a test transcript to verify database integration is working correctly.",
      transcriptPreview: "This is a test transcript...",
      duration: 30,
      wordCount: 15,
      wpm: 30,
      score: 8.5,
      sessionId: "test-session-" + Date.now(),
      audioFilePath: null, // No audio for testing
      feedback: {
        clarityScore: 85,
        confidenceScore: 80,
        engagementScore: 75,
        structureScore: 90,
        overall_score: 8.5,
        pace: 30,
        fillerWords: { um: 2, like: 1 },
        aiSummary: "Test summary",
        constructiveTip: "Test tip",
        strengths: ["Clear message", "Good pace"],
        improvements: ["Add examples", "Reduce fillers"],
      },
    };

    const recordingId = await saveRecording(
      userId,
      testRecording
    );
    console.log(
      "✅ Recording saved with ID:",
      recordingId,
      "\n"
    );

    // Test 4: Fetch Recordings
    console.log("Test 4: Fetching user recordings...");
    const recordings = await getUserRecordings(userId, 10);
    console.log(
      "✅ Fetched",
      recordings.length,
      "recordings"
    );
    console.log("Recording data:", recordings[0], "\n");

    // Test 5: Pin Recording
    console.log("Test 5: Pinning recording...");
    await updateRecordingPinStatus(recordingId, true);
    console.log("✅ Recording pinned\n");

    // Test 6: Unpin Recording
    console.log("Test 6: Unpinning recording...");
    await updateRecordingPinStatus(recordingId, false);
    console.log("✅ Recording unpinned\n");

    // Test 7: Get User Stats
    console.log("Test 7: Calculating user statistics...");
    const stats = await getUserStats(userId);
    console.log("✅ User stats:", stats, "\n");

    // Test 8: Delete Recording
    console.log("Test 8: Deleting test recording...");
    await deleteRecording(recordingId);
    console.log("✅ Recording deleted\n");

    console.log("🎉 All tests passed!\n");
    console.log("Summary:");
    console.log("✅ User profile creation/retrieval");
    console.log("✅ Recording creation (without audio)");
    console.log("✅ Recording retrieval");
    console.log("✅ Pin/unpin functionality");
    console.log("✅ User statistics");
    console.log("✅ Recording deletion");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
    return false;
  }
};

// Export for use
export { testDatabase };
