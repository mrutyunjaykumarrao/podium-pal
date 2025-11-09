import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FeedbackReport from "../components/FeedbackReport";
import ProfileMenu from "../components/ProfileMenu";
import ReturnToPracticeButton from "../components/ReturnToPracticeButton";
import "./FeedbackPage.css";

function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        setData(json);
        setError(null);
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
  }, [id, navigate]);

  if (loading)
    return (
      <div className="feedback-loading">
        <div>🧘 Loading your insights...</div>
      </div>
    );
  if (error)
    return (
      <div className="feedback-error">
        <p>Error loading feedback: {error}</p>
        <button onClick={() => navigate("/")}>
          Return Home
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
