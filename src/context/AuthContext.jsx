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
import { doc, getDoc, setDoc } from "../lib/store";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { DEMO_ADMIN_UID } from "../data/demo";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Demo mode (no Firebase): the only account is the admin login from .env.local, checked by /api/demo-auth.
const demoUser = (email) => ({ uid: DEMO_ADMIN_UID, email, displayName: "Demo Admin", emailVerified: true });
const demoProfile = (email) => ({ uid: DEMO_ADMIN_UID, email, firstName: "Demo", lastName: "Admin", role: "admin" });
const demoOnly = () => {
  throw Object.assign(new Error("DEMO_MODE"), { code: "demo/unavailable" });
};

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
    if (!isFirebaseConfigured) demoOnly();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${firstName} ${lastName}`.trim() });
    await sendEmailVerification(cred.user);
    const profile = await ensureUserDoc(cred.user, { firstName, lastName });
    await signOut(auth); // Sign out so they have to verify first
    setUserProfile(null);
    return { user: cred.user, profile };
  }

  async function demoLogin(email, password) {
    const res = await fetch("/api/demo-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.status === 404) demoOnly(); // no demo login configured in .env.local
    if (!res.ok) throw Object.assign(new Error("DEMO_LOGIN_FAILED"), { code: res.status === 429 ? "auth/too-many-requests" : "auth/invalid-credential" });
    const { user } = await res.json();
    setCurrentUser(demoUser(user.email));
    setUserProfile(demoProfile(user.email));
    return { user: demoUser(user.email) };
  }

  async function login(email, password) {
    if (!isFirebaseConfigured) return demoLogin(email, password);
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
    if (!isFirebaseConfigured) demoOnly();
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

  async function logout() {
    if (isFirebaseConfigured) return signOut(auth);
    await fetch("/api/demo-auth", { method: "DELETE" }).catch(() => {});
    setCurrentUser(null);
    setUserProfile(null);
  }

  const resetPassword = (email) => (isFirebaseConfigured ? sendPasswordResetEmail(auth, email) : demoOnly());

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Restore the demo admin session from its cookie.
      fetch("/api/demo-auth")
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then(({ user }) => {
          setCurrentUser(user ? demoUser(user.email) : null);
          setUserProfile(user ? demoProfile(user.email) : null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

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
