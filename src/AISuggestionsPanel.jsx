import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getResumes } from "./db";

// ── helpers ────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function resumeToText(resume) {
  if (!resume) return "";
  const lines = [];
  const p = resume.personal || {};
  if (p.firstName || p.lastName) lines.push(`${p.firstName || ""} ${p.lastName || ""}`.trim());
  if (p.title)    lines.push(p.title);
  if (p.summary)  lines.push(`Summary: ${p.summary}`);

  (resume.experience || []).forEach(e => {
    lines.push(`${e.title} at ${e.company} (${e.startDate} – ${e.current ? "Present" : e.endDate})`);
    if (e.description) lines.push(e.description);
  });

  (resume.education || []).forEach(e => {
    lines.push(`${e.degree} – ${e.school} (${e.startDate} – ${e.endDate})`);
    if (e.description) lines.push(e.description);
  });

  const skillNames = (resume.skills || []).map(s => s.name).join(", ");
  if (skillNames) lines.push(`Skills: ${skillNames}`);

  return lines.join("\n");
}

// ── call Gemini API ────────────────────────────────────────────────────────────
async function analyzeWithGemini(resumeText, jobDescription) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the following resume against the job description and return a JSON object with this EXACT structure (no markdown, no extra text — pure JSON only):

{
  "overallScore": <integer 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <integer 0-100>,
    "formatting": <integer 0-100>,
    "relevance": <integer 0-100>,
    "completeness": <integer 0-100>
  },
  "matchedKeywords": [
    { "word": "<keyword>", "frequency": <integer>, "importance": "high"|"medium"|"low" }
  ],
  "missingKeywords": [
    { "word": "<keyword>", "importance": "high"|"medium"|"low", "reason": "<1 sentence why it matters>" }
  ],
  "suggestions": [
    { "category": "Keywords"|"Formatting"|"Content"|"Structure"|"Impact", "tip": "<actionable tip>", "priority": "high"|"medium"|"low" }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "verdict": "<2-3 sentence overall assessment>"
}

Rules:
- matchedKeywords: list keywords from the job description that appear in the resume (max 12)
- missingKeywords: important keywords from the job description NOT in the resume (max 8)
- suggestions: 4-6 specific, actionable improvements (not generic)
- strengths: 2-4 genuine strengths found in the resume
- gaps: 2-3 specific missing elements
- Be honest and precise — not encouraging if the resume is weak

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, animate: shouldAnimate = true }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
  const dash  = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <motion.circle
          cx="55" cy="55" r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={shouldAnimate ? { strokeDashoffset: circ - dash } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          transform="rotate(-90 55 55)"
          style={{ filter: `drop-shadow(0 0 8px ${color}99)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, type: "spring" }}
          style={{ fontSize: size * 0.22, fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: size * 0.09, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Mini bar ───────────────────────────────────────────────────────────────────
function MiniBar({ label, value, color, delay = 0 }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 8px ${color}55` }}
        />
      </div>
    </div>
  );
}

// ── Keyword chip ───────────────────────────────────────────────────────────────
function KeywordChip({ word, importance, found }) {
  const colors = {
    high:   found ? { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  text: "#34d399" }
                  : { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.3)",   text: "#fb7185" },
    medium: found ? { bg: "rgba(0,212,255,0.10)",   border: "rgba(0,212,255,0.25)",  text: "#38bdf8" }
                  : { bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
    low:    found ? { bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.25)", text: "#a5b4fc" }
                  : { bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.2)", text: "#64748b" },
  };
  const c = colors[importance] || colors.low;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 99,
        background: c.bg, border: `1px solid ${c.border}`,
        fontSize: 11.5, fontWeight: 600, color: c.text,
        fontFamily: "monospace", margin: "0 5px 6px 0",
      }}
    >
      {found ? "✓" : "✕"} {word}
    </motion.span>
  );
}

// ── Suggestion card ────────────────────────────────────────────────────────────
function SuggestionCard({ tip, category, priority, index }) {
  const priorityStyle = {
    high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.25)" },
    medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
    low:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  };
  const ps = priorityStyle[priority] || priorityStyle.low;
  const icons = { Keywords: "🔑", Formatting: "📐", Content: "✍️", Structure: "🏗️", Impact: "📊" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 14px", borderRadius: 10, marginBottom: 9,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1.3, flexShrink: 0 }}>{icons[category] || "💡"}</span>
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#64748b", fontFamily: "monospace", marginRight: 6,
        }}>{category}</span>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.55 }}>{tip}</p>
      </div>
      <span style={{
        fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, whiteSpace: "nowrap",
        background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color, fontFamily: "monospace",
      }}>{priority}</span>
    </motion.div>
  );
}

// ── Verdict banner ─────────────────────────────────────────────────────────────
function VerdictBanner({ score, verdict }) {
  const band = score >= 80
    ? { label: "Strong Match",   color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  }
    : score >= 60
    ? { label: "Partial Match",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  }
    : { label: "Weak Match",     color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.2)"   };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "14px 18px", borderRadius: 12, marginBottom: 20,
        background: band.bg, border: `1px solid ${band.border}`,
        display: "flex", alignItems: "flex-start", gap: 12,
      }}
    >
      <span style={{
        fontSize: 11, fontWeight: 800, color: band.color,
        background: `${band.color}20`, border: `1px solid ${band.color}40`,
        padding: "2px 9px", borderRadius: 5, flexShrink: 0, fontFamily: "monospace", letterSpacing: "0.06em",
      }}>{band.label}</span>
      <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6 }}>{verdict}</p>
    </motion.div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function AnalyzingSkeleton() {
  const steps = [
    "Parsing resume content…",
    "Extracting keywords…",
    "Matching against job description…",
    "Scoring ATS compatibility…",
    "Generating suggestions…",
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
  const iv = setInterval(() => setCurrent(p => Math.min(p + 1, steps.length - 1)), 900);
  return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 24 }}>
      {/* Spinning ring */}
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#00f5ff",
            borderRightColor: "#8b5cf6",
          }}
        />
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,255,0.15), transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>✦</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>
          Analyzing with Gemini AI
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ margin: 0, fontSize: 12, color: "#00f5ff", fontFamily: "monospace" }}
          >
            {steps[current]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {steps.map((_, i) => (
          <motion.div key={i}
            animate={{ background: i <= current ? "#00f5ff" : "rgba(255,255,255,0.1)", scale: i === current ? 1.3 : 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: 7, height: 7, borderRadius: "50%" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AISuggestionsPanel() {
  const [jobDesc, setJobDesc]     = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumes, setResumes]     = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("keywords");
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Load saved resumes on mount
  useEffect(() => {
  getResumes().then(r => {
    setResumes(r);
    setLoadingResumes(false);
  }).catch(() => setLoadingResumes(false));
  }, []);

  const handleSelectResume = (id) => {
    setSelectedId(id);
    const found = resumes.find(r => r.id === id);
    if (found) setResumeText(resumeToText(found));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError("Please add resume content."); return; }
    if (!jobDesc.trim())    { setError("Please paste a job description."); return; }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await analyzeWithGemini(resumeText.trim(), jobDesc.trim());
      setResult(data);
      setActiveTab("keywords");
    } catch (e) {
      setError("Analysis failed. Check your connection and try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const TABS = ["keywords", "suggestions", "strengths"];
  const scoreColor = result
    ? result.overallScore >= 80 ? "#10b981"
    : result.overallScore >= 60 ? "#f59e0b"
    : "#f43f5e"
    : "#00f5ff";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020509 0%, #060b14 40%, #04080f 100%)",
      padding: "32px 24px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(139,92,246,0.2))",
              border: "1px solid rgba(0,245,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>✦</div>
            <div>
              <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#00f5ff" }}>
                CVMint · Real-time Analysis
              </p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
                ATS Analyzer
              </h1>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: "#475569" }}>
            Paste a job description, select your resume — Gemini AI scores your match in real time.
          </p>
        </motion.div>

        {/* ── Input section ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Resume selector + manual input */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "rgba(13,17,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px", backdropFilter: "blur(12px)" }}
          >
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00f5ff" }}>
              Your Resume
            </p>

            {/* Pick from saved */}
            {!loadingResumes && resumes.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <select
                  value={selectedId}
                  onChange={e => handleSelectResume(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 11.5,
                    fontFamily: "monospace", outline: "none", cursor: "pointer", marginBottom: 6,
                  }}
                >
                  <option value="">— Pick a saved resume —</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title || "Untitled"}</option>
                  ))}
                </select>
                <p style={{ margin: 0, fontSize: 10, color: "#334155" }}>or paste / edit below</p>
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setSelectedId(""); setResult(null); }}
              placeholder={"Paste your resume text here…\n\nOr pick a saved resume above."}
              style={{
                width: "100%", minHeight: 200, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                padding: "10px 12px", color: "#e2e8f0", fontSize: 11.5,
                fontFamily: "monospace", outline: "none", resize: "vertical",
                lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "5px 0 0", fontSize: 10, color: "#334155" }}>
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </motion.div>

          {/* Job description */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "rgba(13,17,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px", backdropFilter: "blur(12px)" }}
          >
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8b5cf6" }}>
              Job Description
            </p>
            <textarea
              value={jobDesc}
              onChange={e => { setJobDesc(e.target.value); setResult(null); }}
              placeholder={"Paste the full job description here…\n\nInclude requirements, responsibilities, and preferred skills for the most accurate analysis."}
              style={{
                width: "100%", minHeight: 230, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                padding: "10px 12px", color: "#e2e8f0", fontSize: 11.5,
                fontFamily: "monospace", outline: "none", resize: "vertical",
                lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "5px 0 0", fontSize: 10, color: "#334155" }}>
              {jobDesc.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </motion.div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#fb7185", fontSize: 12, marginBottom: 14, fontFamily: "monospace" }}>
            ✕ {error}
          </motion.div>
        )}

        {/* Analyze button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.04, boxShadow: loading ? "none" : "0 0 40px rgba(0,245,255,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "13px 36px", borderRadius: 12,
              background: loading
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(139,92,246,0.2))",
              border: `1px solid ${loading ? "rgba(255,255,255,0.08)" : "rgba(0,245,255,0.4)"}`,
              color: loading ? "#475569" : "#00f5ff",
              fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "monospace", letterSpacing: "0.08em",
              boxShadow: loading ? "none" : "0 0 20px rgba(0,245,255,0.15)",
              transition: "all 0.3s",
            }}
          >
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>◈</motion.span>
                Analyzing…
              </>
            ) : (
              <> ✦ &nbsp;Run ATS Analysis</>
            )}
          </motion.button>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "rgba(13,17,40,0.9)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 16, marginBottom: 24, backdropFilter: "blur(12px)" }}
          >
            <AnalyzingSkeleton />
          </motion.div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Score row */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>

                {/* Overall score + breakdown */}
                <div style={{
                  background: "rgba(13,17,40,0.9)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16, padding: "22px", backdropFilter: "blur(12px)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minWidth: 200,
                }}>
                  <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#475569" }}>Overall Score</p>
                  <ScoreRing score={result.overallScore} size={120} />
                  <div style={{ width: "100%" }}>
                    {Object.entries(result.scoreBreakdown).map(([key, val], i) => (
                      <MiniBar
                        key={key}
                        label={key.replace(/([A-Z])/g, " $1").trim()}
                        value={val}
                        color={val >= 80 ? "#10b981" : val >= 60 ? "#f59e0b" : "#f43f5e"}
                        delay={0.3 + i * 0.1}
                      />
                    ))}
                  </div>
                </div>

                {/* Verdict + tabs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <VerdictBanner score={result.overallScore} verdict={result.verdict} />

                  {/* Strengths & gaps quick view */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 12, padding: "14px" }}>
                      <p style={{ margin: "0 0 8px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#10b981" }}>✓ Strengths</p>
                      {result.strengths.map((s, i) => (
                        <p key={i} style={{ margin: "0 0 4px", fontSize: 11.5, color: "#6ee7b7", lineHeight: 1.5 }}>• {s}</p>
                      ))}
                    </div>
                    <div style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.18)", borderRadius: 12, padding: "14px" }}>
                      <p style={{ margin: "0 0 8px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f43f5e" }}>✕ Gaps</p>
                      {result.gaps.map((g, i) => (
                        <p key={i} style={{ margin: "0 0 4px", fontSize: 11.5, color: "#fca5a5", lineHeight: 1.5 }}>• {g}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail tabs */}
              <div style={{ background: "rgba(13,17,40,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", backdropFilter: "blur(12px)" }}>
                {/* Tab bar */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1, padding: "13px", cursor: "pointer",
                        background: activeTab === tab ? "rgba(0,245,255,0.08)" : "transparent",
                        border: "none",
                        borderBottom: activeTab === tab ? "2px solid #00f5ff" : "2px solid transparent",
                        color: activeTab === tab ? "#00f5ff" : "#475569",
                        fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em",
                        fontFamily: "monospace", textTransform: "capitalize",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab === "keywords" ? "🔑 Keywords" : tab === "suggestions" ? "💡 Suggestions" : "⭐ Strengths & Gaps"}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: "20px" }}>
                  <AnimatePresence mode="wait">

                    {activeTab === "keywords" && (
                      <motion.div key="keywords" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                          <div>
                            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#10b981" }}>
                              ✓ Matched Keywords ({result.matchedKeywords.length})
                            </p>
                            <div>
                              {result.matchedKeywords.map((k, i) => (
                                <KeywordChip key={i} word={k.word} importance={k.importance} found={true} />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f43f5e" }}>
                              ✕ Missing Keywords ({result.missingKeywords.length})
                            </p>
                            <div>
                              {result.missingKeywords.map((k, i) => (
                                <div key={i} style={{ marginBottom: 8 }}>
                                  <KeywordChip word={k.word} importance={k.importance} found={false} />
                                  <p style={{ margin: "2px 0 0 4px", fontSize: 10.5, color: "#475569", lineHeight: 1.5 }}>{k.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "suggestions" && (
                      <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8b5cf6" }}>
                          {result.suggestions.length} Actionable Improvements
                        </p>
                        {result.suggestions.map((s, i) => (
                          <SuggestionCard key={i} {...s} index={i} />
                        ))}
                      </motion.div>
                    )}

                    {activeTab === "strengths" && (
                      <motion.div key="strengths" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                          <div>
                            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#10b981" }}>
                              What's Working
                            </p>
                            {result.strengths.map((s, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 8, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                                <span style={{ color: "#10b981", flexShrink: 0 }}>✓</span>
                                <p style={{ margin: 0, fontSize: 12.5, color: "#6ee7b7", lineHeight: 1.55 }}>{s}</p>
                              </motion.div>
                            ))}
                          </div>
                          <div>
                            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f43f5e" }}>
                              What's Missing
                            </p>
                            {result.gaps.map((g, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 8, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.18)" }}>
                                <span style={{ color: "#f43f5e", flexShrink: 0 }}>✕</span>
                                <p style={{ margin: 0, fontSize: 12.5, color: "#fca5a5", lineHeight: 1.55 }}>{g}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

              {/* Re-scan button */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setResult(null)}
                  style={{
                    padding: "8px 22px", borderRadius: 8, cursor: "pointer",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#475569", fontSize: 11.5, fontFamily: "monospace",
                  }}
                >
                  ↺ Clear & Re-analyze
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ textAlign: "center", marginTop: 32, fontSize: 10, color: "#1e293b", fontFamily: "monospace", letterSpacing: "0.1em" }}
        >
          ✦ CVMint ATS · Powered by Gemini AI · Real-time analysis
        </motion.p>
      </div>
    </div>
  );
}