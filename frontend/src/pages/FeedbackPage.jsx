import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FeedbackReport from "../components/FeedbackReport";
import ProfileMenu from "../components/ProfileMenu";
import ReturnToPracticeButton from "../components/ReturnToPracticeButton";
import { useAuth } from "../contexts/AuthContext";
import { saveRecording } from "../services/recordingsService";
import "./FeedbackPage.css";

function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      "[FeedbackPage] Mounted for session id:",
      id
    );
    if (!id) {
      setError("No session id provided");
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        console.log(
          "[FeedbackPage] Fetching feedback from backend..."
        );
        const res = await fetch(
          `http://localhost:8000/feedback/${id}`
        );
        if (!res.ok) {
          throw new Error(
            "Failed to fetch feedback: " + res.status
          );
        }
        const json = await res.json();
        console.log(
          "[FeedbackPage] Feedback received:",
          json
        );

        // Backend now returns full session data with structure:
        // { sessionId, timestamp, transcript, userGoal, duration, audioPath, feedback: {...} }
        setData(json.feedback || json); // Display the feedback object
        setError(null);

        // Save to Firestore if user is logged in
        if (currentUser) {
          try {
            console.log(
              "[FeedbackPage] Attempting to save to Firestore..."
            );
            console.log(
              "[FeedbackPage] User ID:",
              currentUser.uid
            );
            console.log(
              "[FeedbackPage] Session data:",
              json
            );

            // Extract from full session data
            const feedbackData = json.feedback || json;
            const recordingData = {
              goal: json.userGoal || "Speech recording",
              transcript: json.transcript || "",
              transcriptPreview:
                (json.transcript || "").substring(0, 100) +
                "...",
              duration: json.duration || 0,
              wordCount: json.transcript
                ? json.transcript
                    .split(/\s+/)
                    .filter((w) => w.length > 0).length
                : 0,
              wpm: feedbackData.pace || 0,
              score: feedbackData.overall_score || 0,
              sessionId: json.sessionId || id,
              audioFilePath: null,
              feedback: feedbackData,
            };

            console.log(
              "[FeedbackPage] Recording data to save:",
              recordingData
            );
            await saveRecording(
              currentUser.uid,
              recordingData
            );
            console.log(
              "[FeedbackPage] ✅ Feedback saved to Firestore"
            );
          } catch (saveError) {
            console.error(
              "[FeedbackPage] ❌ Failed to save to Firestore:",
              saveError
            );
            console.error(
              "[FeedbackPage] Error details:",
              saveError.message,
              saveError.stack
            );
          }
        } else {
          console.log(
            "[FeedbackPage] Not saving - currentUser:",
            !!currentUser,
            "json:",
            !!json
          );
        }
      } catch (err) {
        console.error(
          "[FeedbackPage] Error fetching feedback:",
          err
        );
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, navigate, currentUser]);

  if (loading)
    return (
      <div style={{ padding: 20 }}>Loading feedback...</div>
    );
  if (error)
    return (
      <div style={{ padding: 20 }}>
        <p>Error loading feedback: {error}</p>
        <button onClick={() => navigate("/")}>
          Go back
        </button>
      </div>
    );

  return (
    <div className="feedback-page-container">
      <ProfileMenu />
      <ReturnToPracticeButton />
      <FeedbackReport data={data} />
    </div>
  );
}

export default FeedbackPage;
