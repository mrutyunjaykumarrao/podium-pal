// AuthContext - Google-Only Authentication State Management
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user document in Firestore
  const createUserDocument = async (
    user,
    additionalData = {}
  ) => {
    if (!user) return;

    console.log(
      "[Auth] Creating user document for:",
      user.uid
    );
    const userRef = doc(db, "users", user.uid);

    try {
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = serverTimestamp();

        await setDoc(userRef, {
          email,
          displayName: displayName || "User",
          photoURL: photoURL || null,
          createdAt,
          totalRecordings: 0,
          averageScore: 0,
          ...additionalData,
        });

        console.log("[Auth] ✓ User document created");
      } else {
        console.log("[Auth] User document already exists");
      }
    } catch (error) {
      console.error(
        "[Auth] Error creating user document:",
        error
      );
      throw error;
    }
  };

  // Sign in with Google (Only authentication method)
  const signInWithGoogle = async () => {
    console.log("[Auth] Signing in with Google");
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );
      await createUserDocument(result.user);
      console.log("[Auth] ✓ Google sign-in successful");
      return result.user;
    } catch (error) {
      console.error(
        "[Auth] ❌ Google sign-in error:",
        error
      );
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    console.log("[Auth] Logging out user");
    try {
      await signOut(auth);
      console.log("[Auth] ✓ Logout successful");
    } catch (error) {
      console.error("[Auth] ❌ Logout error:", error);
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes (handles session persistence automatically)
  useEffect(() => {
    console.log("[Auth] Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log(
          "[Auth] Auth state changed:",
          user ? user.email : "No user"
        );
        setCurrentUser(user);
        setLoading(false);

        // Ensure user document exists
        if (user) {
          await createUserDocument(user);
        }
      }
    );

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    logout,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
