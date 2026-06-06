import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FileText, TrendingUp, Download, Globe, Plus, Sparkles,
  ArrowUpRight, ChevronRight
} from "lucide-react";

// ── Animated counter ───────────────────────────────────────────────────────────
const useCounter = (target, duration = 1.8, inView) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, inView]);
  return display;
};

const MiniParticles = ({ color }) => {
  const pts = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    s: Math.random() * 2 + 1,
    dur: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {pts.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: color }}
          animate={{ y: [0, -14, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const STAT_DEFS = [
  {
    id: "resumeCount",
    label: "Total Resumes",
    suffix: "",
    sub: "Your resume library",
    icon: FileText,
    color: "#a259ff",
    trend: "your collection",
    maxVal: 20,
  },
  {
    id: "avgAts",
    label: "Avg ATS Score",
    suffix: "%",
    sub: "Across all resumes",
    icon: TrendingUp,
    color: "#00d4ff",
    trend: "average score",
    maxVal: 100,
  },
  {
    id: "downloads",
    label: "Downloads",
    suffix: "",
    sub: "PDF exports total",
    icon: Download,
    color: "#10b981",
    trend: "total exports",
    maxVal: 50,
  },
  {
    id: "portfolioViews",
    label: "Portfolio Views",
    suffix: "",
    sub: "Unique visitors",
    icon: Globe,
    color: "#f59e0b",
    trend: "profile views",
    maxVal: 500,
  },
];

const StatCard = ({ def, value = 0, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCounter(value, 1.6 + index * 0.1, inView);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group cursor-default rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,17,40,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 20%, ${def.color}18, transparent 65%)` }}
      />
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${def.color}60, transparent)` }}
      />
      <MiniParticles color={def.color} />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-5">
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${def.color}14`, color: def.color, boxShadow: `0 0 10px ${def.color}18` }}
            whileHover={{ scale: 1.1, boxShadow: `0 0 18px ${def.color}30` }}
            transition={{ duration: 0.2 }}
          >
            <def.icon size={19} strokeWidth={1.8} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <ArrowUpRight size={10} />
            {def.trend}
          </motion.div>
        </div>

        <div className="mb-1">
          <div className="flex items-end gap-0.5">
            <motion.span className="text-3xl font-black text-white tabular-nums leading-none">
              {count}
            </motion.span>
            {def.suffix && (
              <span className="text-xl font-black mb-0.5" style={{ color: def.color }}>
                {def.suffix}
              </span>
            )}
          </div>
        </div>

        <p className="text-white font-semibold text-sm mb-1">{def.label}</p>
        <p className="text-white/30 text-[11px]">{def.sub}</p>

        <div className="mt-4 h-0.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${def.color}, ${def.color}55)` }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${Math.min((value / def.maxVal) * 100, 100)}%` } : {}}
            transition={{ duration: 1.2, delay: 0.5 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Hero Card ──────────────────────────────────────────────────────────────────
export const HeroCard = ({ user, onCreateResume, stats }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const mottos = [
    "Your next opportunity is one resume away.",
    "Land more interviews with AI-optimized resumes.",
    "Turn your experience into interview invitations.",
  ];
  const motto = mottos[new Date().getDay() % mottos.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden group"
      style={{ minHeight: 180 }}
    >
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #0f0825 0%, #0a1628 50%, #071420 100%)",
      }} />

      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-[0.12] blur-[90px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #a259ff, transparent)", top: "-30%", left: "-5%" }}
        animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-[0.08] blur-[80px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #00d4ff, transparent)", bottom: "-20%", right: "10%" }}
        animate={{ scale: [1, 1.15, 1], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(162,89,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(162,89,255,0.05) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-xs font-semibold"
            style={{ background: "rgba(162,89,255,0.1)", borderColor: "rgba(162,89,255,0.25)", color: "#c084ff" }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#a259ff]"
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            AI-Powered Resume Builder
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight"
          >
            {greeting},{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #a259ff, #00d4ff)" }}>
              {firstName}
            </span>{" "}
            👋
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45 }}
            className="text-white/45 text-sm max-w-md leading-relaxed"
          >
            {motto}
          </motion.p>

          {/* Live stats row from Firestore */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-4 mt-4"
          >
            {[
              { label: "Resumes",   val: stats?.resumeCount ?? "—", color: "#a259ff" },
              { label: "Avg ATS",   val: stats?.avgAts ? `${stats.avgAts}%` : "—", color: "#00d4ff" },
              { label: "Downloads", val: stats?.downloads ?? "—", color: "#10b981" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-px h-3 bg-white/10" />}
                <span className="font-black text-sm" style={{ color: s.color }}>{s.val}</span>
                <span className="text-white/30 text-xs">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(162,89,255,0.35)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onCreateResume}
            className="relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden group/btn"
            style={{
              background: "linear-gradient(135deg, #a259ff, #00d4ff)",
              boxShadow: "0 4px 14px rgba(162,89,255,0.25)",
            }}
          >
            <motion.div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(135deg, #c084ff, #38d9ff)" }} />
            <Plus size={16} className="relative z-10" />
            <span className="relative z-10">Create Resume</span>
            <motion.div className="relative z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronRight size={14} />
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white/70 hover:text-white transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Sparkles size={14} className="text-[#a259ff]" />
            AI Enhance Existing
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(162,89,255,0.4), rgba(0,212,255,0.3), transparent)" }} />
    </motion.div>
  );
};

// ── Stats Grid ─────────────────────────────────────────────────────────────────
export const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {STAT_DEFS.map((def, i) => (
      <StatCard key={def.id} def={def} value={stats?.[def.id] ?? 0} index={i} />
    ))}
  </div>
);

// ── Default export ─────────────────────────────────────────────────────────────
export default function DashboardHero({ user, onCreateResume, stats }) {
  return (
    <div className="space-y-5" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
      <HeroCard user={user} onCreateResume={onCreateResume} stats={stats} />
      <StatsGrid stats={stats} />
    </div>
  );
}