import { STAFF_ROLES } from "../admin";

// Verifies a Firebase ID token and reads the caller's role from Firestore over REST,
// so API routes can be restricted to staff without a service account.
export async function verifyStaff(request, allowedRoles = STAFF_ROLES) {
  const header = request.headers.get("authorization") || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!idToken) return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!lookup.ok) return null;
  const uid = (await lookup.json()).users?.[0]?.localId;
  if (!uid) return null;

  const profile = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  if (!profile.ok) return null;
  const role = (await profile.json()).fields?.role?.stringValue;

  return allowedRoles.includes(role) ? { uid, role } : null;
}
