// ── db.js  ─  Firestore service layer for CVMint ──────────────────────────────
import {
  getFirestore,
  doc, collection,
  getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, onSnapshot,
  increment,
} from "firebase/firestore";
import app, { auth } from "./firebase";

export const db = getFirestore(app);

// ── helpers ───────────────────────────────────────────────────────────────────
const uid = () => {
  const id = auth.currentUser?.uid;
  if (!id) throw new Error("User not authenticated");
  return id;
};
const resumesCol  = () => collection(db, "users", uid(), "resumes");
const activityCol = () => collection(db, "users", uid(), "activity");
const statsDoc    = () => doc(db, "users", uid(), "meta", "stats");
const profileDoc  = () => doc(db, "users", uid());

// ── USER PROFILE ──────────────────────────────────────────────────────────────
export async function ensureUserProfile(user) {
  const ref = profileDoc();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName || "",
      email: user.email || "",
      createdAt: serverTimestamp(),
      plan: "free",
    });
    await setDoc(statsDoc(), {
      resumeCount: 0,
      avgAts: 0,
      downloads: 0,
      portfolioViews: 0,
    });
  }
}

export async function getUserProfile() {
  const snap = await getDoc(profileDoc());
  return snap.exists() ? snap.data() : null;
}

// ── RESUMES ───────────────────────────────────────────────────────────────────
/**
 * Save (create or overwrite) a resume document.
 * Returns the resume id.
 */
export async function saveResume(resumeData, existingId = null) {
  const payload = {
    ...resumeData,
    updatedAt: serverTimestamp(),
  };

  if (existingId) {
    const ref = doc(resumesCol(), existingId);
    await updateDoc(ref, payload);
    return existingId;
  }

  payload.createdAt = serverTimestamp();
  const ref = await addDoc(resumesCol(), payload);

  // bump stats
  await updateDoc(statsDoc(), { resumeCount: increment(1) }).catch(() => {});

  // log activity
  await logActivity({
    event: "Resume Created",
    detail: `${resumeData.title || "Untitled"} · ${resumeData.subtitle || ""}`,
    tag: "CREATE",
  });

  return ref.id;
}

/** Fetch all resumes for the current user, newest first. */
export async function getResumes() {
  const q = query(resumesCol(), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Fetch a single resume. */
export async function getResume(id) {
  const snap = await getDoc(doc(resumesCol(), id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Delete a resume. */
export async function deleteResume(id) {
  await deleteDoc(doc(resumesCol(), id));
  await updateDoc(statsDoc(), { resumeCount: increment(-1) }).catch(() => {});
  await logActivity({ event: "Resume Deleted", detail: id, tag: "DELETE" });
}

/** Increment download count and log activity. */
export async function recordDownload(resumeTitle) {
  await updateDoc(statsDoc(), { downloads: increment(1) }).catch(() => {});
  await logActivity({
    event: "PDF Exported",
    detail: `${resumeTitle || "Resume"}.pdf`,
    tag: "EXPORT",
  });
}

/** Update the ATS score for a resume and recalculate the average. */
export async function updateAtsScore(resumeId, score) {
  await updateDoc(doc(resumesCol(), resumeId), { atsScore: score });

  // recalculate average across all resumes
  const resumes = await getResumes();
  const scores = resumes.map(r => r.atsScore).filter(Boolean);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  await updateDoc(statsDoc(), { avgAts: avg }).catch(() => {});

  await logActivity({
    event: "ATS Score Updated",
    detail: `Score: ${score}`,
    tag: "SCORE",
  });
}

// ── STATS ─────────────────────────────────────────────────────────────────────
export async function getStats() {
  const snap = await getDoc(statsDoc());
  return snap.exists() ? snap.data() : { resumeCount: 0, avgAts: 0, downloads: 0, portfolioViews: 0 };
}

/** Subscribe to real-time stats changes. Returns unsubscribe fn. */
export function subscribeStats(callback) {
  return onSnapshot(statsDoc(), snap => {
    callback(snap.exists() ? snap.data() : { resumeCount: 0, avgAts: 0, downloads: 0, portfolioViews: 0 });
  });
}

// ── ACTIVITY ──────────────────────────────────────────────────────────────────
/**
 * Log an activity entry.
 * tag: "CREATE" | "EXPORT" | "SCORE" | "PUBLISH" | "DELETE"
 */
export async function logActivity({ event, detail, tag }) {
  await addDoc(activityCol(), {
    event,
    detail,
    tag,
    createdAt: serverTimestamp(),
  });
}

/** Fetch latest N activity entries. */
export async function getActivity(limitN = 20) {
  const q = query(activityCol(), orderBy("createdAt", "desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Subscribe to real-time activity. Returns unsubscribe fn. */
export function subscribeActivity(callback, limitN = 20) {
  const q = query(activityCol(), orderBy("createdAt", "desc"), limit(limitN));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}