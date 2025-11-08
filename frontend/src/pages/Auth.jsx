// Google-Only Authentication Component
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    console.log("[Auth] Google sign-in attempt");
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      console.log("[Auth] ✓ Google sign-in successful");
      navigate("/");
    } catch (err) {
      console.error("[Auth] ❌ Google sign-in error:", err);
      setError(
        err.message ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Podium Pal</h1>
          <p className="auth-subtitle">
            Your AI Public Speaking Coach
          </p>
          <p className="auth-description">
            Practice presentations, receive instant AI
            feedback, and master your public speaking skills
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                fill="currentColor"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="google-signin-btn"
          disabled={loading}
        >
          <img
            src="/google.png"
            alt="Google"
            className="google-logo"
          />
          <span>
            {loading
              ? "Signing in..."
              : "Continue with Google"}
          </span>
        </button>

        <div className="auth-footer-text">
          <p>
            By continuing, you agree to our Terms of Service
            and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
