"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "../lib/store";
import { db } from "../lib/firebase";
import { DEFAULT_SETTINGS } from "../lib/config";

const SettingsContext = createContext(DEFAULT_SETTINGS);

export const useSettings = () => useContext(SettingsContext);

// Store-wide settings edited from /admin/settings (settings/store), merged over the defaults.
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "store"),
      (snap) => {
        if (!snap.exists()) return setSettings(DEFAULT_SETTINGS);
        const data = snap.data();
        // Ignore blank fields so a half-filled settings form never empties the storefront.
        const filled = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined));
        setSettings({ ...DEFAULT_SETTINGS, ...filled });
      },
      (err) => console.error("Settings listener error:", err)
    );
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
