// TemplatesPage.jsx – Full gallery of all resume templates with live preview modal
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Check, Sparkles, X, ZoomIn, Download,
  Star, Zap, Shield, Eye, ChevronRight, Lock
} from "lucide-react";
import { TEMPLATE_REGISTRY } from "./templateRegistry";
import ResumeRenderer from "./ResumeRenderer";

// ── Sample resume data to hydrate template previews ───────────────────────────
const SAMPLE_RESUME = {
  personal: {
    firstName: "Alex",
    lastName: "Johnson",
    title: "Senior Software Engineer",
    email: "alex@example.com",
    phone: "+1 (555) 012-3456",
    location: "San Francisco, CA",
    website: "linkedin.com/in/alexj",
    summary:
      "Passionate full-stack engineer with 6+ years designing and shipping scalable web platforms. Proven track record leading cross-functional teams, improving system performance, and delivering AI-powered products used by millions.",
  },
  experience: [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Stripe",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description:
        "• Architected event-driven microservices handling 2M+ transactions/day\n• Led team of 6 engineers to ship Stripe Tax globally in 14 countries\n• Reduced p99 latency by 38% via database query optimisation",
    },
    {
      id: 2,
      title: "Software Engineer",
      company: "Vercel",
      location: "Remote",
      startDate: "Mar 2020",
      endDate: "Dec 2021",
      current: false,
      description:
        "• Built Next.js edge runtime reducing cold-start times by 60%\n• Shipped collaborative deployment previews used by 400k+ developers",
    },
  ],
  education: [
    {
      id: 1,
      degree: "B.S. Computer Science",
      school: "MIT",
      location: "Cambridge, MA",
      startDate: "2016",
      endDate: "2020",
      gpa: "3.9",
      description: "Dean's List · ACM ICPC Finalist",
    },
  ],
  skills: [
    { id: 1,  name: "TypeScript",   category: "Technical" },
    { id: 2,  name: "React",        category: "Technical" },
    { id: 3,  name: "Node.js",      category: "Technical" },
    { id: 4,  name: "Go",           category: "Technical" },
    { id: 5,  name: "PostgreSQL",   category: "Technical" },
    { id: 6,  name: "English",      category: "Languages" },
    { id: 7,  name: "Spanish",      category: "Languages" },
    { id: 8,  name: "AWS",          category: "Tools & Platforms" },
    { id: 9,  name: "Docker",       category: "Tools & Platforms" },
    { id: 10, name: "Kubernetes",   category: "Tools & Platforms" },
    { id: 11, name: "Leadership",   category: "Soft Skills" },
    { id: 12, name: "Communication", category: "Soft Skills" },
  ],
};

// ── ATS score color helper ─────────────────────────────────────────────────────
function atsColor(score) {
  if (score >= 95) return "#10b981";
  if (score >= 88) return "#00d4ff";
  return "#f59e0b";
}

// ── Template Card ──────────────────────────────────────────────────────────────
function TemplateCard({ template, onPreview, onUse, index }) {
  const [hovered, setHovered] = useState(false);
  const { name, description, thumbnail, atsScore, premium, tags } = template;
  const color = atsColor(atsScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: "relative",
        background: "rgba(13,17,40,0.8)",
        border: `1px solid ${hovered ? "rgba(162,89,255,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: hovered ? "0 20px 60px rgba(162,89,255,0.15), 0 0 0 1px rgba(162,89,255,0.2)" : "none",
      }}
    >
      {/* Hover top line */}
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #a259ff, #00d4ff)",
          transformOrigin: "left",
        }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* PRO badge */}
      {premium && (
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(245,158,11,0.15)",
          border: "1px solid rgba(245,158,11,0.35)",
          borderRadius: 6, padding: "3px 8px",
          fontSize: 9.5, fontWeight: 800, color: "#f59e0b",
          letterSpacing: "0.08em",
          fontFamily: "'Outfit', sans-serif",
        }}>
          <Lock size={9} /> PRO
        </div>
      )}

      {/* Thumbnail preview */}
      <div
        style={{
          height: 180,
          background: thumbnail.style === "split"
            ? `linear-gradient(90deg, ${thumbnail.accentB} 36%, #f8f8f8 36%)`
            : thumbnail.style === "bold"
            ? `linear-gradient(180deg, ${thumbnail.accentB} 28%, #fafafa 28%)`
            : "#f9fafb",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => onPreview(template)}
      >
        {/* Simulated resume layout */}
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 5 }}>
          {thumbnail.style === "split" ? (
            <div style={{ display: "flex", gap: 12 }}>
              {/* Sidebar */}
              <div style={{ width: "34%", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: thumbnail.accent, opacity: 0.9, marginBottom: 4 }} />
                <div style={{ height: 7, width: "85%", borderRadius: 2, background: thumbnail.accent }} />
                <div style={{ height: 3.5, width: "65%", borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
                <div style={{ height: 1, width: "90%", background: `${thumbnail.accent}40`, margin: "5px 0" }} />
                {[0.85, 0.7, 0.9, 0.65, 0.75].map((w, i) => (
                  <div key={i} style={{ height: 3, width: `${w * 100}%`, borderRadius: 1.5, background: "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
              {/* Main */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: 4, width: "80%", borderRadius: 2, background: `${thumbnail.accent}70` }} />
                <div style={{ height: 1.5, width: "100%", background: `${thumbnail.accent}40`, margin: "3px 0" }} />
                {[0.9, 0.75, 0.85, 0.6, 0.8, 0.7, 0.5].map((w, i) => (
                  <div key={i} style={{ height: 3, width: `${w * 100}%`, borderRadius: 1.5, background: "#d1d5db" }} />
                ))}
              </div>
            </div>
          ) : thumbnail.style === "bold" ? (
            <>
              <div style={{ height: 10, width: "50%", borderRadius: 2, background: "#fff", opacity: 0.95 }} />
              <div style={{ height: 4, width: "30%", borderRadius: 2, background: `${thumbnail.accent}cc` }} />
              <div style={{ height: 1.5, width: "70%", borderRadius: 1, background: "rgba(255,255,255,0.3)", margin: "3px 0" }} />
              <div style={{ height: 2, background: "#e5e7eb", margin: "6px 0 4px" }} />
              {[0.85, 0.7, 0.9, 0.65, 0.75, 0.55].map((w, i) => (
                <div key={i} style={{ height: 3, width: `${w * 100}%`, borderRadius: 1.5, background: i < 2 ? `${thumbnail.accent}70` : "#d1d5db" }} />
              ))}
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ height: thumbnail.style === "swiss" ? 10 : 8, width: 120, borderRadius: 2, background: thumbnail.accentB }} />
                  <div style={{ height: 3.5, width: 80, borderRadius: 2, background: thumbnail.accent }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
                  {[50, 70, 55].map((w, i) => (
                    <div key={i} style={{ height: 2.5, width: w, borderRadius: 1.5, background: "#c4cad3" }} />
                  ))}
                </div>
              </div>
              <div style={{ height: thumbnail.style === "swiss" ? 2 : 1.5, background: thumbnail.accent, margin: "6px 0 5px", borderRadius: 1 }} />
              {[0.85, 0.7, 0.9, 0.65, 0.78, 0.55].map((w, i) => (
                <div key={i} style={{ height: 3, width: `${w * 100}%`, borderRadius: 1.5, background: i === 0 ? `${thumbnail.accent}70` : "#d1d5db" }} />
              ))}
            </>
          )}
        </div>

        {/* Hover overlay */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => onPreview(template)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8, padding: "8px 14px",
              color: "#fff", fontSize: 12, fontWeight: 600,
              cursor: "pointer", backdropFilter: "blur(8px)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <Eye size={13} /> Preview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => onUse(template.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, #a259ff, #00d4ff)",
              border: "none", borderRadius: 8, padding: "8px 14px",
              color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <Sparkles size={13} /> Use This
          </motion.button>
        </motion.div>

        {/* ATS score chip */}
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "3px 8px",
          backdropFilter: "blur(6px)",
        }}>
          <Shield size={9} style={{ color }} />
          <span style={{ fontSize: 9.5, fontWeight: 800, color, fontFamily: "'Outfit', sans-serif" }}>
            ATS {atsScore}%
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
            {name}
          </h3>
          {/* Star rating (static) */}
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10} style={{ color: "#f59e0b", fill: i <= 4 ? "#f59e0b" : "transparent" }} />
            ))}
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, color: "#475569", lineHeight: 1.5, fontFamily: "'Outfit', sans-serif" }}>
          {description}
        </p>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em",
              color: "#64748b", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "2px 7px", borderRadius: 4,
              fontFamily: "'Outfit', sans-serif",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Use button */}
      <div style={{ padding: "0 16px 14px" }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUse(template.id)}
          style={{
            width: "100%", padding: "9px", borderRadius: 9,
            background: hovered ? "linear-gradient(135deg, #a259ff, #00d4ff)" : "rgba(162,89,255,0.1)",
            border: `1px solid ${hovered ? "transparent" : "rgba(162,89,255,0.25)"}`,
            color: hovered ? "#fff" : "#a259ff",
            fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.25s",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: hovered ? "0 0 20px rgba(162,89,255,0.35)" : "none",
          }}
        >
          Use Template <ChevronRight size={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose, onUse }) {
  if (!template) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 1050,
            height: "88vh",
            background: "linear-gradient(135deg, #0a0e1f, #080c18)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
          }}
        >
          {/* Modal header */}
          <div style={{
            padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #a259ff, #00d4ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ZoomIn size={14} style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Template Preview
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
                {template.name}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              {/* ATS score */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 7, padding: "5px 10px",
              }}>
                <Shield size={11} style={{ color: "#10b981" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", fontFamily: "'Outfit', sans-serif" }}>
                  ATS {template.atsScore}%
                </span>
              </div>
              {/* Use button */}
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 25px rgba(162,89,255,0.5)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { onUse(template.id); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 18px", borderRadius: 9,
                  background: "linear-gradient(135deg, #a259ff, #00d4ff)",
                  border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 0 18px rgba(162,89,255,0.3)",
                }}
              >
                <Sparkles size={13} /> Use This Template
              </motion.button>
              {/* Close */}
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <X size={15} />
              </motion.button>
            </div>
          </div>

          {/* Renderer */}
          <div style={{ flex: 1, overflow: "hidden", padding: "16px" }}>
            <ResumeRenderer
              resumeData={SAMPLE_RESUME}
              templateId={template.id}
              compact={true}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Filter Pills ───────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "all",         label: "All Templates" },
  { id: "minimal",     label: "Minimal" },
  { id: "tech",        label: "Tech / Dev" },
  { id: "ats",         label: "ATS 95%+" },
  { id: "creative",    label: "Creative" },
  { id: "free",        label: "Free" },
];

function matchFilter(tmpl, filter) {
  if (filter === "all")      return true;
  if (filter === "minimal")  return tmpl.tags.includes("minimal") || tmpl.tags.includes("swiss") || tmpl.tags.includes("simple");
  if (filter === "tech")     return tmpl.tags.includes("tech") || tmpl.tags.includes("sidebar");
  if (filter === "ats")      return tmpl.atsScore >= 95;
  if (filter === "creative") return tmpl.tags.includes("creative") || tmpl.tags.includes("bold");
  if (filter === "free")     return !tmpl.premium;
  return true;
}

// ── Main TemplatesPage ─────────────────────────────────────────────────────────
export default function TemplatesPage({ onSelectTemplate }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filtered = TEMPLATE_REGISTRY.filter(t => matchFilter(t, activeFilter));

  const handleUse = (templateId) => {
    onSelectTemplate?.(templateId);
  };

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 6 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <motion.div
                style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(180deg, #a259ff, #00d4ff)" }}
                animate={{ scaleY: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#e2e8f0" }}>Resume Templates</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              {TEMPLATE_REGISTRY.length} professionally designed templates · Click any to preview with real data
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(162,89,255,0.08)", border: "1px solid rgba(162,89,255,0.2)",
            borderRadius: 10, padding: "7px 12px",
          }}>
            <Zap size={13} style={{ color: "#a259ff" }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#a259ff" }}>AI-Optimised Layouts</span>
          </div>
        </div>
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}
      >
        {FILTERS.map(f => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveFilter(f.id)}
            style={{
              padding: "7px 16px", borderRadius: 10, cursor: "pointer",
              fontSize: 12.5, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              background: activeFilter === f.id
                ? "linear-gradient(135deg, rgba(162,89,255,0.25), rgba(0,212,255,0.15))"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeFilter === f.id ? "rgba(162,89,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: activeFilter === f.id ? "#c084ff" : "rgba(255,255,255,0.35)",
              boxShadow: activeFilter === f.id ? "0 0 14px rgba(162,89,255,0.2)" : "none",
              transition: "all 0.2s",
            }}
          >
            {f.label}
            {f.id === "ats" && (
              <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "1px 5px", borderRadius: 3 }}>
                {TEMPLATE_REGISTRY.filter(t => t.atsScore >= 95).length}
              </span>
            )}
          </motion.button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#334155", alignSelf: "center" }}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* Cards grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((tmpl, i) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              index={i}
              onPreview={setPreviewTemplate}
              onUse={handleUse}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}
        >
          <Layout size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>No templates match this filter.</p>
        </motion.div>
      )}

      {/* Bottom promo strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: 36,
          padding: "20px 28px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(162,89,255,0.08), rgba(0,212,255,0.06))",
          border: "1px solid rgba(162,89,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", marginBottom: 3 }}>
            Want more templates?
          </div>
          <div style={{ fontSize: 12.5, color: "#64748b" }}>
            Upgrade to CVMint Pro for exclusive designs, custom colour themes, and unlimited exports.
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(162,89,255,0.5)" }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 22px", borderRadius: 10,
            background: "linear-gradient(135deg, #a259ff, #00d4ff)",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 0 20px rgba(162,89,255,0.3)",
          }}
        >
          <Sparkles size={14} /> Upgrade to Pro
        </motion.button>
      </motion.div>

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUse}
        />
      )}
    </div>
  );
}
