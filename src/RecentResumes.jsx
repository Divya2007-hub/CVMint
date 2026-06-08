import { useResumeExport } from "./ResumeExporter";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FileText, Download, Trash2, Edit3, MoreHorizontal,
  Clock, TrendingUp, Eye, Copy, Share2,
  CheckCircle, AlertCircle, Zap, Plus, Search,
  ChevronRight, Sparkles, Loader2
} from "lucide-react";
import { getResumes, deleteResume, recordDownload } from "./db";
import { auth } from "./firebase";
import ResumeBuilder from "./ResumeBuilder";

// ── Toast System ───────────────────────────────────────────────────────────────
const TOAST_ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
  warning: "⚠",
};
const TOAST_COLORS = {
  success: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  color: "#10b981" },
  error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   color: "#ef4444" },
  info:    { bg: "rgba(162,89,255,0.12)",  border: "rgba(162,89,255,0.3)",  color: "#a259ff" },
  warning: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  color: "#f59e0b" },
};

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

const ToastContainer = ({ toasts, remove }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
    <AnimatePresence>
      {toasts.map(t => {
        const c = TOAST_COLORS[t.type] || TOAST_COLORS.info;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              pointerEvents: "all",
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 12, minWidth: 260, maxWidth: 340,
              background: c.bg, border: `1px solid ${c.border}`,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 800, color: c.color, flexShrink: 0 }}>
              {TOAST_ICONS[t.type]}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, fontFamily: "'Outfit', sans-serif" }}>
              {t.message}
            </span>
            <button
              onClick={() => remove(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 0, flexShrink: 0 }}
            >✕</button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// ── Delete Confirm Dialog ──────────────────────────────────────────────────────
const DeleteConfirm = ({ resume, onConfirm, onCancel }) => (
  <AnimatePresence>
    {resume && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 201, width: "100%", maxWidth: 400, padding: 24, borderRadius: 20,
            background: "linear-gradient(135deg, #0d1128, #080c18)",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.1)",
          }}
        >
          {/* Icon */}
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Trash2 size={22} color="#ef4444" />
          </div>

          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
            Delete Resume?
          </h3>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            Are you sure you want to delete
          </p>
          <p style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 700, color: "#ef4444", fontFamily: "'Outfit', sans-serif" }}>
            "{resume.title || "Untitled Resume"}"?
          </p>
          <p style={{ margin: "0 0 24px", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif" }}>
            This action cannot be undone.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              style={{ flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(239,68,68,0.3)" }} whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              style={{ flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const atsColor = (score) =>
  score >= 90 ? "#10b981" : score >= 75 ? "#00d4ff" : "#f59e0b";

const statusFor = (score) => {
  if (!score) return "draft";
  if (score >= 85) return "optimized";
  if (score >= 70) return "good";
  return "needs-work";
};

const statusConfig = {
  optimized:    { label: "ATS Ready",  color: "#10b981", icon: CheckCircle },
  good:         { label: "Good",       color: "#00d4ff", icon: TrendingUp },
  "needs-work": { label: "Needs Work", color: "#f59e0b", icon: AlertCircle },
  draft:        { label: "Draft",      color: "#6b7280", icon: FileText },
};

const templateColors = ["#a259ff", "#00d4ff", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
const colorFor = (id = "") => templateColors[id.charCodeAt(0) % templateColors.length];

// ── Shimmer Skeleton ───────────────────────────────────────────────────────────
const ShimmerBlock = ({ className = "", style = {} }) => (
  <div
    className={`relative overflow-hidden rounded-lg ${className}`}
    style={{ background: "rgba(255,255,255,0.06)", ...style }}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      }}
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.07 }}
    className="rounded-2xl overflow-hidden p-5 space-y-4"
    style={{
      background: "rgba(13,17,40,0.75)",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
    }}
  >
    <ShimmerBlock className="w-full rounded-xl" style={{ height: 140 }} />
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <ShimmerBlock className="h-4 w-3/4" />
        <ShimmerBlock className="h-3 w-1/2" />
      </div>
      <ShimmerBlock className="rounded-full flex-shrink-0" style={{ width: 52, height: 52 }} />
    </div>
    <div className="flex items-center justify-between">
      <ShimmerBlock className="h-6 w-24 rounded-lg" />
      <ShimmerBlock className="h-3 w-16" />
    </div>
    <ShimmerBlock className="h-3 w-32" />
    <div className="flex gap-2 pt-1">
      <ShimmerBlock className="flex-1 h-9 rounded-xl" />
      <ShimmerBlock className="flex-1 h-9 rounded-xl" />
      <ShimmerBlock className="h-9 rounded-xl" style={{ width: 36 }} />
    </div>
  </motion.div>
);

const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="space-y-2">
      <ShimmerBlock className="h-6 w-40" />
      <ShimmerBlock className="h-3 w-28" />
    </div>
    <div className="flex items-center gap-2.5">
      <ShimmerBlock className="h-8 w-40 rounded-xl" />
      <ShimmerBlock className="h-8 w-28 rounded-xl" />
    </div>
  </div>
);

const SkeletonFilters = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {[60, 80, 70, 80, 65].map((w, i) => (
      <ShimmerBlock key={i} className="h-7 rounded-xl" style={{ width: w }} />
    ))}
  </div>
);

const SkeletonLoading = () => (
  <div className="space-y-5">
    <SkeletonHeader />
    <SkeletonFilters />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {[0, 1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)}
    </div>
  </div>
);

// ── Resume thumbnail ───────────────────────────────────────────────────────────
const ResumeThumbnail = ({ resume, color, hovered }) => {
  const lines = [
    { w: 0.6, h: 6, isHeader: true },
    { w: 0.85, h: 2 }, { w: 0.7, h: 2 }, { w: 0.55, h: 2 },
    { w: 0.5, h: 6, isHeader: true },
    { w: 0.8, h: 2 }, { w: 0.65, h: 2 }, { w: 0.75, h: 2 }, { w: 0.6, h: 2 },
    { w: 0.5, h: 6, isHeader: true },
    { w: 0.7, h: 2 }, { w: 0.55, h: 2 },
  ];
  return (
    <div className="relative w-full h-full bg-white/[0.03] rounded-xl overflow-hidden p-3 flex flex-col gap-1.5">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 8px)" }} />
      {lines.map((line, i) => (
        <motion.div key={i} className="rounded-full flex-shrink-0"
          style={{
            width: `${line.w * 100}%`, height: line.h,
            background: line.isHeader
              ? `linear-gradient(90deg, ${color}, ${color}66)`
              : "rgba(255,255,255,0.12)",
          }}
          animate={hovered ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.7 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: `radial-gradient(circle at 50% 30%, ${color}15, transparent 70%)` }}
      />
    </div>
  );
};

// ── Dropdown ───────────────────────────────────────────────────────────────────
const DropdownMenu = ({ open, onClose, onDeleteRequest, onDuplicate, onShare }) => (
  <AnimatePresence>
    {open && (
      <>
        <div className="fixed inset-0 z-30" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -8 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-10 right-0 z-40 w-44 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(13,17,40,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
        >
          {[
            { icon: Copy,   label: "Duplicate", action: onDuplicate, color: "#a259ff" },
            { icon: Share2, label: "Share Link", action: onShare,    color: "#00d4ff" },
            { icon: Trash2, label: "Delete",     action: onDeleteRequest, color: "#ef4444", danger: true },
          ].map((item) => (
            <motion.button key={item.label}
              whileHover={{ backgroundColor: item.danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)" }}
              onClick={() => { item.action?.(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors">
              <item.icon size={14} style={{ color: item.color }} />
              <span className="text-sm font-medium" style={{ color: item.danger ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── ATS Ring ───────────────────────────────────────────────────────────────────
const ATSRing = ({ score, size = 52 }) => {
  const color = score ? atsColor(score) : "#6b7280";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = ((score || 0) / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <motion.circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>
          {score || "—"}
        </span>
      </div>
    </div>
  );
};

// ── Resume Card ────────────────────────────────────────────────────────────────
const ResumeCard = ({ resume, index, onDelete, exportResume, onEdit, onDeleteRequest, toast }) => {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const color = colorFor(resume.id);
  const status = statusConfig[statusFor(resume.atsScore)];
  const StatusIcon = status.icon;

  const handleDeleteConfirmed = async () => {
    setDeleted(true);
    try {
      await deleteResume(resume.id);
      toast?.("Resume deleted successfully", "success");
    } catch (e) {
      console.error("Delete failed", e);
      toast?.("Failed to delete resume", "error");
      setDeleted(false);
    }
    setTimeout(() => onDelete(resume.id), 350);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportResume(resume);
      await recordDownload(resume.title);
      toast?.("Resume exported as PDF!", "success");
    } catch (e) {
      console.error("Export failed", e);
      toast?.("Export failed. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const lastEdited = resume.updatedAt?.toDate
    ? timeAgo(resume.updatedAt.toDate())
    : resume.createdAt?.toDate
    ? timeAgo(resume.createdAt.toDate())
    : "Just now";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={deleted ? { opacity: 0, scale: 0.9, y: -10 } : inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: deleted ? 0.3 : 0.55, delay: deleted ? 0 : index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className="relative group rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "rgba(13,17,40,0.75)",
        border: `1px solid ${hovered ? color + "35" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(20px)",
        transition: "border-color 0.3s ease",
        boxShadow: hovered ? `0 20px 60px ${color}18, 0 0 0 1px ${color}20` : "none",
      }}
    >
      <motion.div className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}
        style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }} />
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 60%)` }} />

      <div className="relative p-5">
        <div className="w-full mb-4 rounded-xl overflow-hidden border border-white/6"
          style={{ height: 140, background: "rgba(255,255,255,0.02)" }}>
          <ResumeThumbnail resume={resume} color={color} hovered={hovered} />
        </div>

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-white font-bold text-sm leading-tight mb-0.5 truncate">
              {resume.title || "Untitled Resume"}
            </h3>
            <p className="text-white/35 text-xs truncate">
              {resume.subtitle || "—"}
            </p>
          </div>
          <ATSRing score={resume.atsScore} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: `${status.color}12`, border: `1px solid ${status.color}25` }}>
            <StatusIcon size={10} style={{ color: status.color }} />
            <span className="text-[10px] font-semibold" style={{ color: status.color }}>{status.label}</span>
          </div>
          <div className="flex items-center gap-1 text-white/25 text-[10px]">
            <Clock size={9} />
            {lastEdited}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-white/30 text-[11px] font-medium">
              {resume.template || "Custom"} Template
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="flex items-center gap-1 text-[#a259ff] text-[10px] font-semibold"
          >
            <Sparkles size={9} /> AI Ready
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => onEdit(resume)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{ background: `linear-gradient(135deg, ${color}28, ${color}15)`, border: `1px solid ${color}30` }}>
            <Edit3 size={12} /> Edit
          </motion.button>

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white/65 hover:text-white transition-all duration-200 bg-white/5 border border-white/8 hover:bg-white/9">
            {downloading ? (
              <motion.div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/80"
                animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
            ) : <Download size={12} />}
            {downloading ? "Exporting…" : "Export"}
          </motion.button>

          <div className="relative">
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 bg-white/4 border border-white/8 hover:bg-white/8 transition-all duration-200">
              <MoreHorizontal size={14} />
            </motion.button>
            <DropdownMenu open={menuOpen} onClose={() => setMenuOpen(false)}
              onDeleteRequest={() => onDeleteRequest(resume)} onDuplicate={() => {}} onShare={() => {}} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ onCreateResume }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "rgba(162,89,255,0.1)" }}
      animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <FileText size={26} className="text-[#a259ff]" />
    </motion.div>
    <h3 className="text-white font-bold text-lg mb-2">No resumes yet</h3>
    <p className="text-white/30 text-sm mb-6 max-w-xs">
      Upload your LinkedIn PDF or start from scratch to create your first AI-powered resume.
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onCreateResume}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
      style={{ background: "linear-gradient(135deg, #a259ff, #00d4ff)", boxShadow: "0 4px 14px rgba(162,89,255,0.3)" }}>
      <Plus size={15} /> Create Your First Resume
    </motion.button>
  </motion.div>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)  return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function RecentResumes({ onCreateResume, externalSearch }) {
  const { exportResume, ExportPortal } = useResumeExport();
  const { toasts, add: addToast, remove: removeToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResumes();
      setResumes(data);
    } catch (e) {
      console.error("Failed to load resumes", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        load();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [load]);

  useEffect(() => {
    if (externalSearch !== undefined) setSearch(externalSearch);
  }, [externalSearch]);

  const filters = [
    { id: "all",          label: "All" },
    { id: "optimized",    label: "ATS Ready" },
    { id: "good",         label: "Good" },
    { id: "needs-work",   label: "Needs Work" },
    { id: "draft",        label: "Draft" },
  ];

  const filtered = resumes.filter(r => {
    const matchSearch = (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
                        (r.subtitle || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || statusFor(r.atsScore) === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id) => setResumes(prev => prev.filter(r => r.id !== id));

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setResumes(prev => prev.filter(r => r.id !== id));
    try {
      await deleteResume(id);
      addToast("Resume deleted successfully", "success");
    } catch (e) {
      console.error("Delete failed", e);
      addToast("Failed to delete resume", "error");
      load();
    }
  };

  // ── Skeleton while loading ──
  if (loading) {
    return (
      <div style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
        <SkeletonLoading />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <ExportPortal />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <motion.div ref={headerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-black text-xl mb-0.5">Recent Resumes</h2>
          <p className="text-white/30 text-xs">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""} · {resumes.filter(r => statusFor(r.atsScore) === "optimized").length} ATS-ready
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? "text-[#a259ff]" : "text-white/25"}`} />
            <input value={search} onChange={e => { setSearch(e.target.value); }}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search resumes…"
              className="bg-white/4 border rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-white/20 outline-none transition-all duration-300 w-40"
              style={{
                borderColor: searchFocused ? "rgba(162,89,255,0.5)" : "rgba(255,255,255,0.08)",
                boxShadow: searchFocused ? "0 0 0 3px rgba(162,89,255,0.1)" : "none",
                background: searchFocused ? "rgba(162,89,255,0.06)" : "rgba(255,255,255,0.04)",
              }} />
          </div>
          <motion.button whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateResume}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #a259ff, #00d4ff)", boxShadow: "0 4px 12px rgba(162,89,255,0.3)" }}>
            <Plus size={13} /> New Resume
          </motion.button>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <motion.button key={f.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(f.id)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: filter === f.id ? "linear-gradient(135deg, rgba(162,89,255,0.25), rgba(0,212,255,0.15))" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.id ? "rgba(162,89,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f.id ? "#c084ff" : "rgba(255,255,255,0.35)",
              boxShadow: filter === f.id ? "0 0 12px rgba(162,89,255,0.2)" : "none",
            }}>
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({resumes.filter(r => statusFor(r.atsScore) === f.id).length})
              </span>
            )}
          </motion.button>
        ))}
        <span className="ml-auto text-white/20 text-xs">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* Cards Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((resume, i) => (
              <ResumeCard key={resume.id} resume={resume} index={i} onDelete={handleDelete} exportResume={exportResume} onEdit={setEditingResume} onDeleteRequest={setDeleteTarget} toast={addToast} />
            ))
          ) : (
            <EmptyState key="empty" onCreateResume={onCreateResume} />
          )}
        </AnimatePresence>
      </motion.div>

      {resumes.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex justify-center pt-2">
          <motion.button whileHover={{ x: 4 }}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#a259ff] transition-colors duration-200 font-medium">
            View all resumes <ChevronRight size={13} />
          </motion.button>
        </motion.div>
      )}

      {/* Edit Resume Modal */}
      <AnimatePresence>
        {editingResume && (
          <ResumeBuilder
            initialData={editingResume}
            existingId={editingResume.id}
            initialTemplateId={editingResume.template || "classic"}
            onClose={() => {
              setEditingResume(null);
              addToast("Resume saved successfully!", "success");
              load();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <DeleteConfirm
        resume={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}