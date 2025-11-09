import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import App from "./App.jsx";
import FeedbackPage from "./pages/FeedbackPage";
import AccountPage from "./pages/AccountPage";
import RecordingsPage from "./pages/RecordingsPage";
import SettingsPage from "./pages/SettingsPage";
import ProgressPage from "./pages/ProgressPage";
import DatabaseTest from "./pages/DatabaseTest";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

console.log("[Main] Initializing Podium Pal application");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback/:id"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recordings"
            element={
              <ProtectedRoute>
                <RecordingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-database"
            element={
              <ProtectedRoute>
                <DatabaseTest />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
