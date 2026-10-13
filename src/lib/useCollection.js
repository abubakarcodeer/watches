"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "./store";
import { db } from "./firebase";
import { toDate } from "./admin";

// Live list of every document in a collection, newest first.
export function useCollection(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
        setState({ data, loading: false, error: null });
      },
      (error) => {
        console.error(`Failed to load ${path}:`, error);
        setState({ data: [], loading: false, error });
      }
    );
  }, [path, enabled]);

  return state;
}
