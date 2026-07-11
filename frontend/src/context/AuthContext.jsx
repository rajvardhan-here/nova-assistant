import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { setGoogleToken, getGoogleToken, clearGoogleToken } from "../googleToken.js";
import AuthContext from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(!!getGoogleToken());
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setCalendarConnected(!!getGoogleToken());
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError("");
      googleProvider.addScope("https://www.googleapis.com/auth/calendar");
      googleProvider.setCustomParameters({ prompt: "consent" });

      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential?.accessToken) {
        setGoogleToken(credential.accessToken);
        setCalendarConnected(true);
      }
    } catch (error) {
      const message =
        error?.code === "auth/unauthorized-domain"
          ? "Google Sign-In is not enabled for this domain yet. Add the current domain to Firebase Authentication > Authorized domains."
          : "Google Sign-In could not start. Please try again.";
      setAuthError(message);
      throw error;
    }
  };

  const logout = () => {
    clearGoogleToken();
    setCalendarConnected(false);
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, calendarConnected, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "./authContext.js";
