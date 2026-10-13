// Data layer for client code. With Firebase connected every function is the Firestore SDK one.
// Until then (demo mode) the same calls read and write a small database kept in this browser's
// localStorage, so the storefront and the dashboard work end to end on sample data.
import * as fs from "firebase/firestore";
import { isFirebaseConfigured } from "./firebase";
import { demoSeed } from "../data/demo";

const KEY = "watchshop-demo-db";
const listeners = new Set();
let cache = null; // { [collectionPath]: { [docId]: data } }

function load() {
  if (typeof window === "undefined") return {};
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY));
  } catch {
    cache = null;
  }
  if (!cache) {
    cache = demoSeed();
    persist();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (err) {
    console.error("Demo data could not be saved:", err);
  }
}

function emit() {
  persist();
  listeners.forEach((fn) => fn());
}

// Another tab (e.g. the store opened from the dashboard) changed the data: reload and notify.
if (typeof window !== "undefined" && !isFirebaseConfigured) {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    cache = null;
    listeners.forEach((fn) => fn());
  });
}

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const newId = () => Array.from({ length: 20 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");

// Applies serverTimestamp()/increment() markers and drops undefined fields, like Firestore does on write.
function resolve(data, previous = {}) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value?.__demo === "timestamp") out[key] = new Date().toISOString();
    else if (value?.__demo === "increment") out[key] = (Number(previous[key]) || 0) + value.by;
    else out[key] = clone(value);
  }
  return out;
}

const docSnap = (path, id) => {
  const data = load()[path]?.[id];
  return { id, exists: () => data !== undefined, data: () => clone(data) };
};

const matches = (data, { field, op, value }) => {
  const actual = data[field];
  if (op === "==") return actual === value;
  if (op === "!=") return actual !== value;
  if (op === ">") return actual > value;
  if (op === ">=") return actual >= value;
  if (op === "<") return actual < value;
  if (op === "<=") return actual <= value;
  if (op === "in") return value.includes(actual);
  if (op === "array-contains") return Array.isArray(actual) && actual.includes(value);
  return true;
};

const querySnap = ({ path, filters = [] }) => {
  const docs = Object.entries(load()[path] || {})
    .filter(([, data]) => filters.every((f) => matches(data, f)))
    .map(([id]) => docSnap(path, id));
  return { docs, size: docs.length, empty: docs.length === 0 };
};

function write(ref, data, { merge = false, mustExist = false } = {}) {
  const db = load();
  const previous = db[ref.path]?.[ref.id];
  if (mustExist && previous === undefined) return; // updating a document that was deleted: nothing to do
  db[ref.path] = { ...db[ref.path], [ref.id]: merge && previous ? { ...previous, ...resolve(data, previous) } : resolve(data, previous) };
}

function remove(ref) {
  const db = load();
  if (!db[ref.path]) return;
  const { [ref.id]: _removed, ...rest } = db[ref.path];
  db[ref.path] = rest;
}

const demo = {
  doc: (_db, path, id) => ({ __demo: "doc", path, id }),
  collection: (_db, path) => ({ __demo: "collection", path }),
  query: (ref, ...filters) => ({ __demo: "query", path: ref.path, filters: [...(ref.filters || []), ...filters.filter((f) => f?.field)] }),
  where: (field, op, value) => ({ field, op, value }),
  serverTimestamp: () => ({ __demo: "timestamp" }),
  increment: (by) => ({ __demo: "increment", by }),

  getDoc: async (ref) => docSnap(ref.path, ref.id),
  getDocs: async (ref) => querySnap(ref),
  setDoc: async (ref, data, options) => {
    write(ref, data, options);
    emit();
  },
  updateDoc: async (ref, data) => {
    write(ref, data, { merge: true, mustExist: true });
    emit();
  },
  deleteDoc: async (ref) => {
    remove(ref);
    emit();
  },
  addDoc: async (ref, data) => {
    const created = { __demo: "doc", path: ref.path, id: newId() };
    write(created, data);
    emit();
    return created;
  },
  writeBatch: () => {
    const ops = [];
    const batch = {
      set: (ref, data, options) => (ops.push(() => write(ref, data, options)), batch),
      update: (ref, data) => (ops.push(() => write(ref, data, { merge: true, mustExist: true })), batch),
      delete: (ref) => (ops.push(() => remove(ref)), batch),
      commit: async () => {
        ops.forEach((op) => op());
        emit();
      },
    };
    return batch;
  },
  onSnapshot: (ref, next) => {
    const notify = () => next(ref.__demo === "doc" ? docSnap(ref.path, ref.id) : querySnap(ref));
    listeners.add(notify);
    // Firestore delivers the first snapshot asynchronously too.
    const timer = setTimeout(notify, 0);
    return () => {
      clearTimeout(timer);
      listeners.delete(notify);
    };
  },
};

const pick = (name) => (isFirebaseConfigured ? fs[name] : demo[name]);

export const doc = pick("doc");
export const collection = pick("collection");
export const query = pick("query");
export const where = pick("where");
export const serverTimestamp = pick("serverTimestamp");
export const increment = pick("increment");
export const getDoc = pick("getDoc");
export const getDocs = pick("getDocs");
export const setDoc = pick("setDoc");
export const updateDoc = pick("updateDoc");
export const deleteDoc = pick("deleteDoc");
export const addDoc = pick("addDoc");
export const writeBatch = pick("writeBatch");
export const onSnapshot = pick("onSnapshot");

// Dashboard "Reset demo data": back to the original sample catalogue and orders.
export function resetDemoData() {
  if (isFirebaseConfigured || typeof window === "undefined") return;
  cache = demoSeed();
  emit();
}
