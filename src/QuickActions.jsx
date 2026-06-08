import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, BarChart2, Globe,
  ChevronRight, Zap, CheckCircle, ArrowUpRight,
  FileText, Brain, Target, Cpu
} from "lucide-react";

// ── Action definitions ─────────────────────────────────────────────────────────
const ACTIONS = [
  {
    id: "upload",
    title: "Upload LinkedIn PDF",
    subtitle: "Import your profile",
    desc: "Drop your LinkedIn export and let AI transform it into a polished, ATS-optimised resume in under 30 seconds.",
    icon: Upload,
    glowIcon: Cpu,
    color: "#a259ff",
    colorB: "#7b6cff",
    tag: "Most Popular",
    tagColor: "#a259ff",
    steps: ["Export LinkedIn PDF", "AI parses data", "Resume generated"],
    stat: { val: "30s", label: "avg. time" },
  },
  {
    id: "generate",
    title: "Generate Resume",
    subtitle: "Start from scratch",
    desc: "Answer a few smart questions and watch AI craft a compelling, personalised resume tailored to your target role.",
    icon: Sparkles,
    glowIcon: Brain,
    color: "#00d4ff",
    colorB: "#0ea5e9",
    tag: "AI Powered",
    tagColor: "#00d4ff",
    steps: ["Fill in details", "AI writes content", "Download PDF"],
    stat: { val: "96%", label: "avg ATS score" },
  },
  {
    id: "ats",
    title: "Analyze ATS Score",
    subtitle: "Instant optimization",
    desc: "Upload any resume and get a detailed ATS breakdown with keyword gaps, formatting fixes, and actionable suggestions.",
    icon: BarChart2,
    glowIcon: Target,
    color: "#10b981",
    colorB: "#059669",
    tag: "Instant",
    tagColor: "#10b981",
    steps: ["Upload resume", "AI scans content", "Get full report"],
    stat: { val: "2x", label: "more interviews" },
  },
  {
    id: "portfolio",
    title: "Create Portfolio",
    subtitle: "Personal website",
    desc: "Auto-generate a stunning portfolio site from your resume data. One click to publish and share your professional story.",
    icon: Globe,
    glowIcon: FileText,
    color: "#f59e0b",
    colorB: "#d97706",
    tag: "New",
    tagColor: "#f59e0b",
    steps: ["Sync resume data", "Choose template", "Publish online"],
    stat: { val: "5min", label: "to publish" },
  },
];

// ── Step indicator ─────────────────────────────────────────────────────────────
const Steps = ({ steps, color, visible }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex items-center gap-1.5"
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
          >
            {i + 1}
          </div>
          <span className="text-[10px] text-white/40 whitespace-nowrap">{step}</span>
        </motion.div>
        {i < steps.length - 1 && (
          <ChevronRight size={9} className="text-white/15 flex-shrink-0" />
        )}
      </div>
    ))}
  </div>
);

// ── Animated background pattern ────────────────────────────────────────────────
const CardPattern = ({ color, hovered }) => (
  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
    {/* Corner glow */}
    <motion.div
      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
      style={{ background: `radial-gradient(circle, ${color}18, transparent)` }}
      animate={{ scale: hovered ? 1.4 : 1, opacity: hovered ? 0.7 : 0.25 }}
      transition={{ duration: 0.5 }}
    />
    {/* Bottom glow */}
    <motion.div
      className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl"
      style={{ background: `radial-gradient(circle, ${color}12, transparent)` }}
      animate={{ scale: hovered ? 1.3 : 1, opacity: hovered ? 0.5 : 0.15 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    />
    {/* Grid lines */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    />
    {/* Shimmer sweep */}
    <motion.div
      className="absolute inset-y-0 w-1/2 opacity-0"
      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)" }}
      animate={hovered ? { left: ["-50%", "150%"], opacity: [0, 1, 0] } : { left: "-50%", opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    />
  </div>
);

// ── Floating particles inside card ────────────────────────────────────────────
const CardParticles = ({ color, active }) => {
  const pts = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 70,
    s: Math.random() * 2 + 1,
    dur: Math.random() * 3 + 2.5,
    delay: Math.random() * 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {pts.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: color }}
          animate={active ? { y: [0, -12, 0], opacity: [0.2, 0.7, 0.2] } : { opacity: 0 }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// ── Single Action Card ─────────────────────────────────────────────────────────
const ActionCard = ({ action, index }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = action.icon;
  const GlowIcon = action.glowIcon;

  const handleClick = async () => {
    setClicked(true);
    await new Promise(r => setTimeout(r, 1200));
    setClicked(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative rounded-2xl cursor-pointer overflow-hidden"
      style={{
        background: "rgba(13,17,40,0.80)",
        border: `1px solid ${hovered ? action.color + "40" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(24px)",
        boxShadow: hovered
          ? `0 16px 40px ${action.color}15, 0 0 0 1px ${action.color}20, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "0 4px 16px rgba(0,0,0,0.15)",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      <CardPattern color={action.color} hovered={hovered} />
      <CardParticles color={action.color} active={hovered} />

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-8 right-8 h-px"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: `linear-gradient(90deg, transparent, ${action.color}80, transparent)` }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          {/* Icon cluster */}
          <div className="relative">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${action.color}22, ${action.colorB}12)`,
                border: `1px solid ${action.color}30`,
              }}
              animate={{
                boxShadow: hovered
                  ? `0 0 18px ${action.color}35, 0 0 36px ${action.color}12`
                  : `0 0 8px ${action.color}15`,
              }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.15 : 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon size={24} style={{ color: action.color }} strokeWidth={1.8} />
              </motion.div>
            </motion.div>
            {/* Floating sub-icon */}
            <motion.div
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `${action.color}20`, border: `1px solid ${action.color}35` }}
              animate={{ scale: hovered ? 1.1 : 1, opacity: hovered ? 1 : 0.6 }}
              transition={{ duration: 0.3 }}
            >
              <GlowIcon size={11} style={{ color: action.color }} />
            </motion.div>
          </div>

          {/* Tag + stat */}
          <div className="flex flex-col items-end gap-2">
            <motion.div
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{
                background: `${action.tagColor}15`,
                border: `1px solid ${action.tagColor}30`,
                color: action.tagColor,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {action.tag}
            </motion.div>
            <div className="text-right">
              <div className="text-lg font-black" style={{ color: action.color }}>{action.stat.val}</div>
              <div className="text-[9px] text-white/25">{action.stat.label}</div>
            </div>
          </div>
        </div>

        {/* Title & desc */}
        <div className="mb-4">
          <h3 className="text-white font-black text-base mb-0.5 leading-tight">{action.title}</h3>
          <p className="text-xs font-semibold mb-2" style={{ color: action.color + "cc" }}>{action.subtitle}</p>
          <p className="text-white/35 text-xs leading-relaxed">{action.desc}</p>
        </div>

        {/* Steps */}
        <div className="mb-5">
          <Steps steps={action.steps} color={action.color} visible={inView} />
        </div>

        {/* CTA button */}
        <motion.div
          className="relative flex items-center justify-between px-4 py-3 rounded-xl overflow-hidden"
          style={{
            background: hovered
              ? `linear-gradient(135deg, ${action.color}30, ${action.colorB}18)`
              : `${action.color}12`,
            border: `1px solid ${hovered ? action.color + "45" : action.color + "22"}`,
            transition: "background 0.3s ease, border-color 0.3s ease",
          }}
          animate={{ boxShadow: hovered ? `0 0 20px ${action.color}25` : "none" }}
        >
          <span className="text-sm font-bold text-white relative z-10">
            {clicked ? "Opening…" : "Get Started"}
          </span>

          <AnimatePresence mode="wait">
            {clicked ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white"
                style={{ borderTopColor: action.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <motion.div
                key="arrow"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="flex items-center gap-1"
              >
                <motion.div
                  animate={{ x: hovered ? 3 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ArrowUpRight size={16} style={{ color: action.color }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            className="w-1 h-4 rounded-full"
            style={{ background: "linear-gradient(180deg, #a259ff, #00d4ff)" }}
            animate={{ scaleY: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <h2 className="text-white font-black text-xl">Quick Actions</h2>
        </div>
        <p className="text-white/30 text-xs ml-3">Jump straight into what matters most</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold ml-3 sm:ml-0"
        style={{
          background: "rgba(162,89,255,0.08)",
          border: "1px solid rgba(162,89,255,0.2)",
          color: "#a259ff",
        }}
      >
        <Zap size={11} />
        AI-powered actions
      </motion.div>
    </motion.div>
  );
};

// ── Main export ────────────────────────────────────────────────────────────────
export default function QuickActions() {
  return (
    <div className="space-y-5" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>   
      <SectionHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {ACTIONS.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} />
        ))}
      </div>
    </div>
  );
}