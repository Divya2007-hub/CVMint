import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap,
  Code, Plus, Trash2, ChevronRight, ChevronLeft, Check,
  FileText, Sparkles, X, Award, Layout
} from "lucide-react";
import { saveResume } from "./db";
import ResumeRenderer from "./ResumeRenderer";
import { auth } from "./firebase";

// ── Constants ──────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "personal",   label: "Personal",   icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education",  label: "Education",  icon: GraduationCap },
  { id: "skills",     label: "Skills",     icon: Code },
  { id: "template",   label: "Template",   icon: Layout },
  { id: "preview",    label: "Preview",    icon: FileText },
];

const EMPTY_EXPERIENCE = {
  id: Date.now(),
  title: "", company: "", location: "", startDate: "", endDate: "",
  current: false, description: "",
};

const EMPTY_EDUCATION = {
  id: Date.now(),
  degree: "", school: "", location: "", startDate: "", endDate: "",
  gpa: "", description: "",
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
  fontFamily: "'Outfit', sans-serif",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 6,
  display: "block",
};

// ── Reusable Field ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", multiline }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle,
    borderColor: focused ? "rgba(162,89,255,0.6)" : "rgba(255,255,255,0.1)",
    background: focused ? "rgba(162,89,255,0.06)" : "rgba(255,255,255,0.05)",
    ...(multiline ? { minHeight: 90, resize: "vertical" } : {}),
  };
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={style} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={style} />
      )}
    </div>
  );
}

// ── Step: Personal ─────────────────────────────────────────────────────────────
function StepPersonal({ data, setData }) {
  const update = (key, val) => setData(p => ({ ...p, [key]: val }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="First Name" value={data.firstName} onChange={v => update("firstName", v)} placeholder="Alex" />
        <Field label="Last Name"  value={data.lastName}  onChange={v => update("lastName", v)}  placeholder="Johnson" />
      </div>
      <Field label="Professional Title" value={data.title}    onChange={v => update("title", v)}    placeholder="Senior Software Engineer" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Email"    value={data.email}    onChange={v => update("email", v)}    placeholder="alex@example.com" type="email" />
        <Field label="Phone"    value={data.phone}    onChange={v => update("phone", v)}    placeholder="+1 (555) 000-0000" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Location"          value={data.location} onChange={v => update("location", v)} placeholder="San Francisco, CA" />
        <Field label="Website / LinkedIn" value={data.website} onChange={v => update("website", v)} placeholder="linkedin.com/in/alexj" />
      </div>
      <Field label="Professional Summary" value={data.summary} onChange={v => update("summary", v)}
        placeholder="Passionate engineer with 5+ years building scalable web applications…" multiline />
    </div>
  );
}

// ── Step: Experience ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, onChange, onDelete, index }) {
  const update = (key, val) => onChange({ ...exp, [key]: val });
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#a259ff", fontFamily: "monospace", letterSpacing: "0.1em" }}>POSITION {index + 1}</span>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Job Title" value={exp.title}   onChange={v => update("title", v)}   placeholder="Software Engineer" />
          <Field label="Company"   value={exp.company} onChange={v => update("company", v)} placeholder="Acme Corp" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Location"   value={exp.location}  onChange={v => update("location", v)}  placeholder="Remote" />
          <Field label="Start Date" value={exp.startDate} onChange={v => update("startDate", v)} placeholder="Jan 2022" />
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="text" value={exp.current ? "Present" : exp.endDate}
              onChange={e => update("endDate", e.target.value)} placeholder="Dec 2024"
              disabled={exp.current} style={{ ...inputStyle, opacity: exp.current ? 0.5 : 1 }} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={exp.current} onChange={e => update("current", e.target.checked)} style={{ accentColor: "#a259ff" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>I currently work here</span>
        </label>
        <Field label="Description" value={exp.description} onChange={v => update("description", v)}
          placeholder={"• Led development of core features…\n• Improved performance by 40%…"} multiline />
      </div>
    </motion.div>
  );
}

function StepExperience({ data, setData }) {
  const addExp    = () => setData(p => ({ ...p, experience: [...p.experience, { ...EMPTY_EXPERIENCE, id: Date.now() }] }));
  const updateExp = (id, val) => setData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? val : e) }));
  const deleteExp = (id) => setData(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AnimatePresence>
        {data.experience.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} index={i} onChange={val => updateExp(exp.id, val)} onDelete={() => deleteExp(exp.id)} />
        ))}
      </AnimatePresence>
      {data.experience.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <Briefcase size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>No experience added yet</p>
        </div>
      )}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addExp}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, cursor: "pointer", background: "rgba(162,89,255,0.08)", border: "1px dashed rgba(162,89,255,0.35)", color: "#a259ff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
        <Plus size={16} /> Add Position
      </motion.button>
    </div>
  );
}

// ── Step: Education ────────────────────────────────────────────────────────────
function EducationCard({ edu, onChange, onDelete, index }) {
  const update = (key, val) => onChange({ ...edu, [key]: val });
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff", fontFamily: "monospace", letterSpacing: "0.1em" }}>EDUCATION {index + 1}</span>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Degree" value={edu.degree} onChange={v => update("degree", v)} placeholder="B.S. Computer Science" />
          <Field label="School" value={edu.school} onChange={v => update("school", v)} placeholder="MIT" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Location"   value={edu.location}  onChange={v => update("location", v)}  placeholder="Cambridge, MA" />
          <Field label="Start Year" value={edu.startDate} onChange={v => update("startDate", v)} placeholder="2018" />
          <Field label="End Year"   value={edu.endDate}   onChange={v => update("endDate", v)}   placeholder="2022" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 14 }}>
          <Field label="GPA (optional)"   value={edu.gpa}         onChange={v => update("gpa", v)}         placeholder="3.8" />
          <Field label="Notes (optional)" value={edu.description} onChange={v => update("description", v)} placeholder="Honors, Dean's List, relevant coursework…" />
        </div>
      </div>
    </motion.div>
  );
}

function StepEducation({ data, setData }) {
  const addEdu    = () => setData(p => ({ ...p, education: [...p.education, { ...EMPTY_EDUCATION, id: Date.now() }] }));
  const updateEdu = (id, val) => setData(p => ({ ...p, education: p.education.map(e => e.id === id ? val : e) }));
  const deleteEdu = (id) => setData(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AnimatePresence>
        {data.education.map((edu, i) => (
          <EducationCard key={edu.id} edu={edu} index={i} onChange={val => updateEdu(edu.id, val)} onDelete={() => deleteEdu(edu.id)} />
        ))}
      </AnimatePresence>
      {data.education.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <GraduationCap size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>No education added yet</p>
        </div>
      )}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addEdu}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, cursor: "pointer", background: "rgba(0,212,255,0.08)", border: "1px dashed rgba(0,212,255,0.35)", color: "#00d4ff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
        <Plus size={16} /> Add Education
      </motion.button>
    </div>
  );
}

// ── Step: Skills ───────────────────────────────────────────────────────────────
const categoryColors = {
  "Technical":        { bg: "rgba(162,89,255,0.12)", border: "rgba(162,89,255,0.3)",  text: "#c084ff" },
  "Languages":        { bg: "rgba(0,212,255,0.12)",  border: "rgba(0,212,255,0.3)",   text: "#38bdf8" },
  "Tools & Platforms":{ bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)",  text: "#34d399" },
  "Soft Skills":      { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#fbbf24" },
};

function StepSkills({ data, setData }) {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Technical");
  const [focused, setFocused] = useState(false);

  const addSkill = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setData(p => ({ ...p, skills: [...p.skills, { id: Date.now(), name: trimmed, category }] }));
    setInput("");
  };
  const removeSkill = (id) => setData(p => ({ ...p, skills: p.skills.filter(s => s.id !== id) }));

  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = data.skills.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Add Skill</label>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="e.g. React, Python, Figma…"
            style={{ ...inputStyle, borderColor: focused ? "rgba(162,89,255,0.6)" : "rgba(255,255,255,0.1)", background: focused ? "rgba(162,89,255,0.06)" : "rgba(255,255,255,0.05)" }} />
        </div>
        <div style={{ minWidth: 160 }}>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {SKILL_CATEGORIES.map(c => <option key={c} value={c} style={{ background: "#0d1128" }}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSkill}
            style={{ padding: "11px 18px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg, #a259ff, #00d4ff)", border: "none", color: "white", fontWeight: 700, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <Plus size={16} />
          </motion.button>
        </div>
      </div>

      {SKILL_CATEGORIES.map(cat => grouped[cat].length > 0 && (
        <div key={cat}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: categoryColors[cat].text, marginBottom: 10, textTransform: "uppercase" }}>{cat}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <AnimatePresence>
              {grouped[cat].map(skill => (
                <motion.span key={skill.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: categoryColors[cat].bg, border: `1px solid ${categoryColors[cat].border}`, color: categoryColors[cat].text, fontSize: 13, fontWeight: 600 }}>
                  {skill.name}
                  <button onClick={() => removeSkill(skill.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, opacity: 0.7 }}>
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {data.skills.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#475569" }}>
          <Code size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Type a skill and press Enter or click +</p>
        </div>
      )}
    </div>
  );
}

// ── Step: Template Picker ──────────────────────────────────────────────────────
// Import registry lazily to avoid circular deps at top level
import { TEMPLATE_REGISTRY } from "./templateRegistry";

const TEMPLATE_ATS_COLORS = {
  99: "#10b981", 95: "#10b981", 91: "#00d4ff", 88: "#00d4ff", 82: "#f59e0b",
};

function StepTemplate({ templateId, setTemplateId, data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: "rgba(162,89,255,0.06)", border: "1px solid rgba(162,89,255,0.18)",
        borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <Layout size={15} style={{ color: "#a259ff", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
          Choose a template — your data auto-fills. Switch anytime without losing content.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {TEMPLATE_REGISTRY.map(tmpl => {
          const selected = templateId === tmpl.id;
          const atsColor = TEMPLATE_ATS_COLORS[tmpl.atsScore] || "#f59e0b";
          return (
            <motion.button
              key={tmpl.id}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTemplateId(tmpl.id)}
              style={{
                background: selected ? "rgba(162,89,255,0.12)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${selected ? "rgba(162,89,255,0.55)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12, padding: 12, cursor: "pointer", textAlign: "left",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: selected ? "0 0 20px rgba(162,89,255,0.2)" : "none",
                transition: "all 0.2s", position: "relative",
              }}
            >
              {/* Thumbnail */}
              <div style={{
                height: 80, borderRadius: 7, marginBottom: 10, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: tmpl.thumbnail.style === "split"
                  ? `linear-gradient(90deg, ${tmpl.thumbnail.accentB} 36%, #f8f8f8 36%)`
                  : tmpl.thumbnail.style === "bold"
                  ? `linear-gradient(180deg, ${tmpl.thumbnail.accentB} 30%, #fafafa 30%)`
                  : "#f9fafb",
                position: "relative",
              }}>
                <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                  {tmpl.thumbnail.style === "split" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ width: "34%", display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ height: 9, width: "85%", borderRadius: 2, background: tmpl.thumbnail.accent }} />
                        <div style={{ height: 3, width: "65%", borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
                        {[0.9,0.7,0.8].map((w,i) => <div key={i} style={{ height: 2.5, width: `${w*100}%`, borderRadius: 1, background: "rgba(255,255,255,0.18)", marginTop: i===0?4:0 }} />)}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ height: 4, width: "80%", borderRadius: 2, background: `${tmpl.thumbnail.accent}60` }} />
                        {[0.9,0.7,0.85,0.6].map((w,i) => <div key={i} style={{ height: 2.5, width: `${w*100}%`, borderRadius: 1, background: "#d1d5db" }} />)}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ height: tmpl.thumbnail.style==="bold" ? 8 : 6, width: "52%", borderRadius: 2, background: tmpl.thumbnail.style==="bold" ? "#fff" : tmpl.thumbnail.accentB }} />
                      {tmpl.thumbnail.style !== "bold" && <div style={{ height: 2, width: "100%", borderRadius: 1, background: tmpl.thumbnail.accent, margin: "2px 0 4px" }} />}
                      {[0.85,0.7,0.9,0.65].map((w,i) => <div key={i} style={{ height: 2.5, width: `${w*100}%`, borderRadius: 1, background: tmpl.thumbnail.style==="bold" ? "rgba(255,255,255,0.4)" : "#d1d5db", marginTop: i===0 && tmpl.thumbnail.style==="bold" ? 6 : 0 }} />)}
                    </>
                  )}
                </div>
                {/* ATS badge */}
                <div style={{
                  position: "absolute", bottom: 5, right: 5,
                  fontSize: 8.5, fontWeight: 800, color: atsColor,
                  background: "rgba(0,0,0,0.6)", padding: "1px 6px", borderRadius: 3,
                }}>ATS {tmpl.atsScore}%</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: selected ? "#c084ff" : "#e2e8f0" }}>{tmpl.name}</span>
                {tmpl.premium && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", padding: "1px 5px", borderRadius: 4 }}>PRO</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 10.5, color: "#64748b", lineHeight: 1.4 }}>{tmpl.description}</p>

              {selected && (
                <motion.div layoutId="builderCheck"
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "linear-gradient(135deg, #a259ff, #00d4ff)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Check size={10} color="#fff" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step: Preview (full ResumeRenderer) ───────────────────────────────────────
function StepPreview({ data, templateId, onTemplateChange }) {
  const resumeData = {
    personal:   data.personal,
    experience: data.experience,
    education:  data.education,
    skills:     data.skills,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: 10, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <Check size={15} style={{ color: "#10b981", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: "#6ee7b7" }}>
          Looking great! Use the template sidebar to switch styles, zoom to inspect, or export to PDF.
        </p>
      </div>
      <div style={{ height: 560, borderRadius: 12, overflow: "hidden" }}>
        <ResumeRenderer
          resumeData={resumeData}
          templateId={templateId}
          onTemplateChange={onTemplateChange}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ResumeBuilder({ onClose, initialTemplateId = "classic" }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [data, setData] = useState({
    personal:   { firstName: "", lastName: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
    experience: [],
    education:  [],
    skills:     [],
  });

  const setSection = (key) => (updater) =>
    setData(p => ({ ...p, [key]: typeof updater === "function" ? updater(p[key]) : updater }));

  const handleSave = async () => {
  setSaving(true);
  try {
    const { getAuth } = await import("firebase/auth");
    const currentUser = getAuth().currentUser;
    
    if (!currentUser) {
      alert("You must be logged in to save.");
      setSaving(false);
      return;
    }

    const firstName = data.personal.firstName || "Untitled";
    const lastName  = data.personal.lastName || "";
    const payload = {
      title:      data.personal.title || `${firstName} ${lastName}`.trim() || "My Resume",
      subtitle:   data.personal.location || "",
      template:   templateId,
      atsScore:   null,
      personal:   data.personal,
      experience: data.experience,
      education:  data.education,
      skills:     data.skills,
    };

    console.log("Saving with uid:", currentUser.uid);
    await saveResume(payload);
    setSaved(true);
    setTimeout(() => { onClose?.(); }, 1200);
  } catch (e) {
    console.error("Save failed:", e.message);
    alert("Save failed: " + e.message);
    setSaving(false);
  }
};

  // Each step receives the props it needs
  const stepProps = [
    { data: data.personal, setData: setSection("personal") },          // 0 Personal
    { data, setData },                                                   // 1 Experience
    { data, setData },                                                   // 2 Education
    { data, setData },                                                   // 3 Skills
    { templateId, setTemplateId, data },                                 // 4 Template
    { data, templateId, onTemplateChange: setTemplateId },              // 5 Preview
  ];

  const StepComponents = [
    StepPersonal, StepExperience, StepEducation, StepSkills, StepTemplate, StepPreview
  ];
  const CurrentStep = StepComponents[step];

  // Preview step needs more space — expand modal
  const isPreview = step === STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: "100%",
          maxWidth: isPreview ? 1100 : 780,
          maxHeight: "92vh",
          background: "linear-gradient(135deg, #0a0e1f 0%, #080c18 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          transition: "max-width 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #a259ff, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} style={{ color: "white" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>CVMint</p>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>Resume Builder</h2>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 4 }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 5, flexShrink: 0 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done   = i < step;
            return (
              <motion.button key={s.id} onClick={() => setStep(i)} whileHover={{ scale: 1.03 }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 8px", borderRadius: 8, cursor: "pointer", background: active ? "rgba(162,89,255,0.15)" : done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: active ? "1px solid rgba(162,89,255,0.4)" : done ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.07)", color: active ? "#c084ff" : done ? "#34d399" : "#475569", fontSize: 11.5, fontWeight: 600, fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}>
                {done ? <Check size={12} /> : <Icon size={12} />}
                <span style={{ display: "inline" }}>{s.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isPreview ? "16px 20px" : "24px 28px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <CurrentStep {...stepProps[step]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, cursor: step === 0 ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: step === 0 ? "#334155" : "#94a3b8", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={15} /> Back
          </motion.button>

          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "#a259ff" : i < step ? "#10b981" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg, #a259ff, #00d4ff)", border: "none", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 20px rgba(162,89,255,0.3)" }}>
              Next <ChevronRight size={15} />
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: saved ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={saving || saved}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, cursor: saving || saved ? "not-allowed" : "pointer", background: saved ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #a259ff, #00d4ff)", border: "none", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 20px rgba(162,89,255,0.3)", opacity: saving ? 0.8 : 1 }}>
              {saving && !saved && (
                <motion.div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                  animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
              )}
              {saved ? <><Check size={15} /> Saved!</> : saving ? "Saving…" : <><Sparkles size={15} /> Save Resume</>}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}