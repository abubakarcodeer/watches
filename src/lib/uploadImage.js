"use client";

import { auth, isFirebaseConfigured } from "./firebase";

// Uploads through /api/upload (ImgBB); the route checks the caller is an admin or manager.
export async function uploadImage(file) {
  if (!isFirebaseConfigured) throw new Error("Uploads need Firebase. In demo mode, paste an image URL instead.");
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in again");

  const body = new FormData();
  body.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
  return data.url;
}
