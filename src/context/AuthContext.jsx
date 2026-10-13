"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only create the profile when missing so an existing `role` (e.g. admin) is never overwritten.
  async function ensureUserDoc(user, extra = {}) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    // Create an email index for secure password reset checks
    if (user.email) {
      await setDoc(doc(db, "email_indices", user.email.toLowerCase().trim()), { uid: user.uid }, { merge: true });
    }

    if (snap.exists()) return snap.data();
    const [firstName = "", ...rest] = (user.displayName || "").split(" ");
    const data = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName: rest.join(" "),
      createdAt: new Date().toISOString(),
      role: "customer",
      ...extra,
    };
    await setDoc(ref, data);
    return data;
  }

  async function signup(email, password, firstName, lastName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${firstName} ${lastName}`.trim() });
    await sendEmailVerification(cred.user);
    const profile = await ensureUserDoc(cred.user, { firstName, lastName });
    await signOut(auth); // Sign out so they have to verify first
    setUserProfile(null);
    return { user: cred.user, profile };
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      const user = cred.user;
      await signOut(auth);
      // Attach the user object so the UI can offer to resend the email
      const error = new Error("EMAIL_NOT_VERIFIED");
      error.user = user;
      throw error;
    }
    return cred;
  }

  const sendVerification = (user) => (user || currentUser) && sendEmailVerification(user || currentUser);

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    if (!cred.user.emailVerified) {
      const user = cred.user;
      await signOut(auth);
      const error = new Error("EMAIL_NOT_VERIFIED");
      error.user = user;
      throw error;
    }
    setUserProfile(await ensureUserDoc(cred.user));
    return cred;
  }

  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          setUserProfile(snap.exists() ? snap.data() : null);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, signup, login, loginWithGoogle, logout, resetPassword, sendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}
