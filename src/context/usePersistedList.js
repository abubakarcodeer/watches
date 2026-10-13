"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "../lib/store";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

// A list kept in localStorage and mirrored to users/{uid}[field] while signed in.
export function usePersistedList(storageKey, field, mergeFn) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const sync = useRef({ uid: null, ready: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      /* corrupted storage: start empty */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!currentUser) {
      if (sync.current.uid) setItems([]);
      sync.current = { uid: null, ready: false };
      return;
    }
    if (sync.current.uid === currentUser.uid) return;
    const state = { uid: currentUser.uid, ready: false };
    sync.current = state;
    getDoc(doc(db, "users", currentUser.uid))
      .then((snap) => {
        state.ready = true;
        const remote = snap.exists() ? snap.data()[field] : null;
        // Always produce a new array so the save effect pushes local items up too.
        setItems((local) => (Array.isArray(remote) ? mergeFn(remote, local) : [...local]));
      })
      .catch((err) => {
        state.ready = true;
        console.error(`Failed to load ${field}`, err);
      });
  }, [currentUser, field, mergeFn]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
    if (currentUser && sync.current.uid === currentUser.uid && sync.current.ready) {
      setDoc(doc(db, "users", currentUser.uid), { [field]: items }, { merge: true }).catch((err) =>
        console.error(`Failed to save ${field}`, err)
      );
    }
  }, [items, currentUser, field, storageKey, hydrated]);

  return [items, setItems];
}
