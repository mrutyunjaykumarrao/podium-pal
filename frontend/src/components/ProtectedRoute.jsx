// Protected Route Component - Requires Authentication
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  console.log(
    "[ProtectedRoute] Checking auth:",
    currentUser ? "Authenticated" : "Not authenticated"
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#e0e0e0",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    console.log(
      "[ProtectedRoute] Not authenticated, redirecting to auth"
    );
    return <Navigate to="/auth" />;
  }

  return children;
}

export default ProtectedRoute;
