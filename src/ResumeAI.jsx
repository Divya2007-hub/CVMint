import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Upload, Zap, FileText, Download, Cpu, Star, Check, ArrowRight,
  Sparkles, Shield, BarChart3, Layers, Code, Brain, Target, ChevronRight,
  Menu, X, Play, TrendingUp, Award, Users
} from "lucide-react";

// ── Tailwind-based colour tokens ──────────────────────────────────────────────
// bg-[#080c18]  primary bg
// purple: #a259ff   cyan: #00d4ff   blue: #3b82f6

// ── Helpers ───────────────────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const GlowButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const base =
    "relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer select-none overflow-hidden group";
  const primary =
    "bg-gradient-to-r from-[#a259ff] to-[#00d4ff] text-white shadow-[0_0_30px_rgba(162,89,255,0.45)] hover:shadow-[0_0_50px_rgba(162,89,255,0.7)] hover:scale-105 active:scale-95";
  const secondary =
    "bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95 backdrop-blur-md";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${base} ${variant === "primary" ? primary : secondary} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-[#c084ff] to-[#38d9ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.button>
  );
};

// ── Floating particles background ─────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    dur: Math.random() * 8 + 6,
    color: i % 3 === 0 ? "#a259ff" : i % 3 === 1 ? "#00d4ff" : "#3b82f6",
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// ── Animated grid ──────────────────────────────────────────────────────────────
const GridBg = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        "linear-gradient(rgba(162,89,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(162,89,255,0.04) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }}
  />
);

// ── Gradient blobs ─────────────────────────────────────────────────────────────
const Blobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
      style={{ background: "radial-gradient(circle, #a259ff, transparent)", top: "-15%", left: "-10%" }}
      animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
      style={{ background: "radial-gradient(circle, #00d4ff, transparent)", top: "30%", right: "-10%" }}
      animate={{ scale: [1, 1.2, 1], y: [0, -40, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
      style={{ background: "radial-gradient(circle, #3b82f6, transparent)", bottom: "0%", left: "40%" }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />
  </div>
);

// ── Floating Resume Mockup ─────────────────────────────────────────────────────
const ResumeMockup = () => (
  <motion.div
    animate={{ y: [0, -12, 0], rotate: [2, 3, 2] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    className="relative w-full max-w-sm mx-auto"
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#a259ff]/30 to-[#00d4ff]/30 blur-2xl" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
      {/* header bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center text-white font-bold text-sm">AJ</div>
        <div>
          <div className="h-2.5 w-28 rounded bg-gradient-to-r from-[#a259ff] to-[#00d4ff] mb-1.5" />
          <div className="h-1.5 w-20 rounded bg-white/20" />
        </div>
        <motion.div
          className="ml-auto px-2 py-1 rounded-md text-[10px] font-semibold text-[#00d4ff] border border-[#00d4ff]/30 bg-[#00d4ff]/10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ATS 98%
        </motion.div>
      </div>
      {/* Section blocks */}
      {["Experience", "Skills", "Education"].map((section, i) => (
        <div key={section} className="mb-3">
          <div className="h-1.5 w-16 rounded bg-gradient-to-r from-[#a259ff] to-[#00d4ff] mb-2 opacity-80" />
          <div className="space-y-1.5">
            {[0.9, 0.7, i < 2 ? 0.8 : 0.6].map((w, j) => (
              <motion.div
                key={j}
                className="h-1.5 rounded bg-white/15"
                style={{ width: `${w * 100}%` }}
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 + j * 0.15 }}
              />
            ))}
          </div>
        </div>
      ))}
      {/* AI badge */}
      <motion.div
        className="absolute -top-3 -right-3 bg-gradient-to-br from-[#a259ff] to-[#00d4ff] rounded-xl px-3 py-1.5 text-white text-[10px] font-bold shadow-lg flex items-center gap-1"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Sparkles size={10} /> AI Enhanced
      </motion.div>
    </div>
  </motion.div>
);

// ── Navbar ─────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Features", "How It Works", "Templates", "Pricing"];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#080c18]/80 backdrop-blur-xl border-b border-white/5 shadow-xl" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center shadow-[0_0_15px_rgba(162,89,255,0.5)]">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">AI</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/auth")} className="text-sm text-white/60 hover:text-white transition-colors">Sign in</button>
          <GlowButton onClick={() => navigate("/auth")} className="!py-2 !px-5 !text-xs">Get Started Free</GlowButton>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white/70 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#080c18]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3">
              {links.map((l) => (
                <a key={l} href="#" className="block text-white/70 hover:text-white py-1">
                  {l}
                </a>
              ))}
              <GlowButton onClick={() => navigate("/auth")} className="w-full justify-center mt-2">Get Started Free</GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ── Hero ───────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  return (
  <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#080c18]">
    <Blobs />
    <GridBg />
    <Particles />

    <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 w-full">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-8 backdrop-blur-sm"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Powered by Claude AI · Trusted by 50,000+ professionals
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white mb-6"
          >
            Turn Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] via-[#7b6cff] to-[#00d4ff]">
              LinkedIn PDF
            </span>{" "}
            Into a Stunning Resume
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg text-white/50 leading-relaxed mb-10 max-w-xl"
          >
          CVMint transforms your LinkedIn export into a polished, ATS-optimised resume in under 30 seconds. Powered by AI, designed by experts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <GlowButton onClick={() => navigate("/auth")}>
              <Upload size={16} />
              Upload LinkedIn PDF
            </GlowButton>
            <GlowButton variant="secondary">
              <Play size={14} />
              See Demo
            </GlowButton>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex items-center gap-4 mt-10"
          >
            <div className="flex -space-x-2">
              {["#a259ff", "#00d4ff", "#f59e0b", "#10b981", "#ef4444"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#080c18] flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-[#f59e0b] text-[#f59e0b]" />)}
              </div>
              <p className="text-xs text-white/40">Loved by 50,000+ job seekers</p>
            </div>
          </motion.div>
        </div>

        {/* Right: mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResumeMockup />
        </motion.div>
      </div>
    </div>
  </section>
  );
};

// ── Trusted By ─────────────────────────────────────────────────────────────────
const TrustedBy = () => {
  const brands = [
    { name: "Notion", icon: <Layers size={20} /> },
    { name: "Stripe", icon: <Zap size={20} /> },
    { name: "Linear", icon: <Target size={20} /> },
    { name: "Vercel", icon: <Code size={20} /> },
    { name: "Figma", icon: <Brain size={20} /> },
    { name: "Supabase", icon: <Shield size={20} /> },
  ];
  return (
    <section className="py-16 bg-[#080c18] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <FadeUp>
          <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-10">Trusted by teams at</p>
        </FadeUp>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {brands.map((b, i) => (
            <FadeUp key={b.name} delay={i * 0.07}>
              <motion.div
                whileHover={{ scale: 1.08, y: -3 }}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-white/3 border border-white/5 cursor-pointer group transition-colors hover:border-white/15 hover:bg-white/6"
              >
                <span className="text-white/30 group-hover:text-white/70 transition-colors">{b.icon}</span>
                <span className="text-[11px] text-white/25 group-hover:text-white/55 transition-colors font-medium">{b.name}</span>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Features ───────────────────────────────────────────────────────────────────
const features = [
  { icon: <Brain size={24} />, title: "AI Resume Generation", desc: "Claude AI rewrites and enhances your experience with powerful, impact-driven language.", color: "#a259ff" },
  { icon: <Shield size={24} />, title: "ATS Optimization", desc: "Score 95%+ on every applicant tracking system with our intelligent keyword engine.", color: "#00d4ff" },
  { icon: <Download size={24} />, title: "Instant PDF Export", desc: "One-click export to pixel-perfect PDF. Looks flawless in every reader and printer.", color: "#f59e0b" },
  { icon: <Layers size={24} />, title: "Multiple Templates", desc: "12 premium templates designed by senior designers at top tech companies.", color: "#10b981" },
  { icon: <Code size={24} />, title: "Portfolio Generator", desc: "Auto-generate a stunning personal portfolio page from your resume data.", color: "#ef4444" },
  { icon: <Target size={24} />, title: "Smart Skill Detection", desc: "AI automatically identifies and highlights your most marketable technical skills.", color: "#3b82f6" },
];

const FeatureCard = ({ feature, i }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-white/20"
    >
      {/* glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}22, transparent 70%)` }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
        style={{ background: `${feature.color}18`, color: feature.color, boxShadow: `0 0 20px ${feature.color}30` }}
      >
        {feature.icon}
      </div>
      <h3 className="text-white font-semibold mb-2 text-base">{feature.title}</h3>
      <p className="text-white/45 text-sm leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
};

const Features = () => (
  <section className="py-28 bg-[#080c18] relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#a259ff]/40 to-transparent" />
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <FadeUp className="text-center mb-16">
        <p className="text-xs text-[#a259ff] uppercase tracking-widest mb-4 font-semibold">Everything You Need</p>
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
          Supercharged with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">AI Features</span>
        </h2>
        <p className="text-white/45 text-base max-w-xl mx-auto">From generation to optimization — every tool you need to land interviews faster.</p>
      </FadeUp>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => <FeatureCard key={f.title} feature={f} i={i} />)}
      </div>
    </div>
  </section>
);

// ── How It Works ───────────────────────────────────────────────────────────────
const steps = [
  { icon: <Upload size={28} />, num: "01", title: "Upload LinkedIn PDF", desc: "Export your LinkedIn profile as PDF and drop it in. Takes 10 seconds.", color: "#a259ff" },
  { icon: <Brain size={28} />, num: "02", title: "AI Extracts & Enhances", desc: "Our AI parses your data and rewrites every bullet with impact-driven language.", color: "#00d4ff" },
  { icon: <Download size={28} />, num: "03", title: "Download Your Resume", desc: "Choose your template, preview the result, and export a beautiful PDF instantly.", color: "#10b981" },
];

const HowItWorks = () => (
  <section className="py-28 bg-[#060919] relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 50%, rgba(162,89,255,0.06), transparent)" }} />
    <div className="max-w-6xl mx-auto px-5 md:px-10">
      <FadeUp className="text-center mb-16">
        <p className="text-xs text-[#00d4ff] uppercase tracking-widest mb-4 font-semibold">Simple Process</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Ready in Under 60 Seconds</h2>
        <p className="text-white/40 max-w-lg mx-auto text-sm">Three effortless steps from LinkedIn export to interview-ready resume.</p>
      </FadeUp>

      <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-start">
        {/* connector line */}
        <div className="hidden md:block absolute top-14 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#a259ff]/40 via-[#00d4ff]/40 to-[#10b981]/40" />

        {steps.map((s, i) => (
          <FadeUp key={s.num} delay={i * 0.18} className="flex-1 relative">
            <div className="flex flex-col items-center text-center px-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative w-28 h-28 rounded-2xl flex items-center justify-center mb-6 z-10"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, boxShadow: `0 0 30px ${s.color}20` }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <span
                  className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}88)` }}
                >
                  {i + 1}
                </span>
              </motion.div>
              <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

// ── Resume Preview Section ─────────────────────────────────────────────────────
const templates = [
  { name: "Modern", accent: "#a259ff", lines: [0.85, 0.65, 0.75, 0.55, 0.7, 0.45] },
  { name: "Minimal", accent: "#00d4ff", lines: [0.9, 0.6, 0.8, 0.5, 0.65, 0.4] },
  { name: "Developer", accent: "#10b981", lines: [0.75, 0.7, 0.6, 0.8, 0.55, 0.65] },
];

const ResumePreview = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="py-28 bg-[#080c18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 80%, rgba(0,212,255,0.05), transparent)" }} />
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <FadeUp className="text-center mb-16">
          <p className="text-xs text-[#10b981] uppercase tracking-widest mb-4 font-semibold">12 Premium Templates</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Beautiful Templates,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#10b981]">Instantly</span>
          </h2>
        </FadeUp>

        {/* Tab switcher */}
        <div className="flex justify-center gap-2 mb-12">
          {templates.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => setActive(i)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                active === i ? "text-white shadow-lg" : "text-white/40 bg-white/4 hover:text-white/70"
              }`}
              style={active === i ? { background: `${t.accent}25`, border: `1px solid ${t.accent}50`, color: t.accent } : { border: "1px solid transparent" }}
            >
              {t.name}
            </motion.button>
          ))}
        </div>

        {/* Preview cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <motion.div
              key={t.name}
              whileHover={{ scale: 1.04, y: -8 }}
              onClick={() => setActive(i)}
              className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                border: `1px solid ${active === i ? t.accent + "50" : "rgba(255,255,255,0.06)"}`,
                boxShadow: active === i ? `0 0 40px ${t.accent}25` : "none",
              }}
            >
              <div className="bg-white/4 backdrop-blur-sm p-5">
                {/* Mock header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}66)` }} />
                  <div>
                    <div className="h-2 w-20 rounded mb-1" style={{ background: t.accent + "80" }} />
                    <div className="h-1.5 w-14 rounded bg-white/15" />
                  </div>
                </div>
                {t.lines.map((w, j) => (
                  <motion.div
                    key={j}
                    className="h-1.5 rounded mb-2"
                    style={{ width: `${w * 100}%`, background: j === 0 ? t.accent + "60" : "rgba(255,255,255,0.12)" }}
                    animate={active === i ? { opacity: [0.6, 1, 0.6] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, delay: j * 0.2 }}
                  />
                ))}
              </div>
              {active === i && (
                <motion.div
                  layoutId="activeOverlay"
                  className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white"
                  style={{ background: t.accent }}
                >
                  Selected
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── AI Features Showcase ───────────────────────────────────────────────────────
const ATSMeter = ({ score }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-3">
      {[{ label: "ATS Score", val: score, color: "#00d4ff" }, { label: "Keyword Match", val: 87, color: "#a259ff" }, { label: "Readability", val: 94, color: "#10b981" }].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/50">{item.label}</span>
            <span className="font-bold" style={{ color: item.color }}>{item.val}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${item.val}%` } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AIShowcase = () => {
  const bullets = [
    { before: "Worked on features", after: "Engineered 12 high-impact features, reducing load time by 40%" },
    { before: "Helped team", after: "Led cross-functional team of 8 engineers to deliver $2M product on schedule" },
  ];
  return (
    <section className="py-28 bg-[#060919] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <FadeUp className="text-center mb-16">
          <p className="text-xs text-[#a259ff] uppercase tracking-widest mb-4 font-semibold">AI Intelligence</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            AI That Actually{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">Understands</span> You
          </h2>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bullet rewriter */}
          <FadeUp delay={0.1}>
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Brain size={18} className="text-[#a259ff]" />
                <span className="text-white font-semibold text-sm">AI Bullet Rewriter</span>
              </div>
              <div className="space-y-4">
                {bullets.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/8 border border-red-500/15">
                      <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/45 text-xs">{b.before}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[#00d4ff]/8 border border-[#00d4ff]/15">
                      <Check size={14} className="text-[#00d4ff] mt-0.5 flex-shrink-0" />
                      <span className="text-white text-xs leading-relaxed">{b.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* ATS dashboard */}
          <FadeUp delay={0.2}>
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#00d4ff]" />
                  <span className="text-white font-semibold text-sm">ATS Analysis</span>
                </div>
                <motion.span
                  className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#10b981]"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  98
                </motion.span>
              </div>
              <ATSMeter score={98} />
              <div className="space-y-2">
                {["Add 'TypeScript' to skills section", "Include quantified metrics in 2 bullets", "Add certifications section"].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/50 p-2 rounded-lg bg-white/3">
                    <TrendingUp size={12} className="text-[#10b981] flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
};

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer @ Google", text: "CVMint completely transformed my job search. I uploaded my LinkedIn and had a stunning resume in 2 minutes. Got 3 interviews in a week.", rating: 5, color: "#a259ff" },
  { name: "Marcus Williams", role: "Product Manager @ Stripe", text: "The ATS optimization is insane. My response rate jumped from 8% to 47% after switching to a CVMint resume. Worth every penny.", rating: 5, color: "#00d4ff" },
  { name: "Priya Patel", role: "Data Scientist @ OpenAI", text: "I was skeptical but wow. The AI rewrote my bullets in a way that actually sounds like me, just... better. Highly recommend.", rating: 5, color: "#10b981" },
];

const Testimonials = () => (
  <section className="py-28 bg-[#080c18] relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-5 md:px-10">
      <FadeUp className="text-center mb-16">
        <p className="text-xs text-[#f59e0b] uppercase tracking-widest mb-4 font-semibold">Social Proof</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Loved by Professionals</h2>
      </FadeUp>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <FadeUp key={t.name} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white/4 backdrop-blur-xl rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-300 group"
              style={{ boxShadow: `0 0 0 0 ${t.color}` }}
            >
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={13} className="fill-[#f59e0b] text-[#f59e0b]" />)}
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}66)` }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/35 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

// ── Pricing ────────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Free", price: "$0", period: "forever",
    features: ["3 resume exports/month", "2 templates", "Basic ATS check", "PDF export"],
    cta: "Get Started", highlight: false, color: "#6b7280",
  },
  {
    name: "Pro", price: "$12", period: "/month",
    features: ["Unlimited exports", "All 12 templates", "Full ATS optimization", "AI bullet rewriting", "Portfolio generator", "Priority support"],
    cta: "Start Free Trial", highlight: true, color: "#a259ff",
    badge: "Most Popular",
  },
  {
    name: "Team", price: "$39", period: "/month",
    features: ["Everything in Pro", "5 team seats", "Custom branding", "API access", "Analytics dashboard", "Dedicated support"],
    cta: "Contact Sales", highlight: false, color: "#00d4ff",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
  <section className="py-28 bg-[#060919] relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(162,89,255,0.06), transparent)" }} />
    <div className="max-w-5xl mx-auto px-5 md:px-10">
      <FadeUp className="text-center mb-16">
        <p className="text-xs text-[#a259ff] uppercase tracking-widest mb-4 font-semibold">Simple Pricing</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Invest in Your Career</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">Start free. Upgrade when you're ready to unlock the full power of AI-driven resume building.</p>
      </FadeUp>
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p, i) => (
          <FadeUp key={p.name} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -6 }}
              className="relative flex flex-col rounded-2xl p-6 h-full transition-all duration-300"
              style={{
                background: p.highlight ? "linear-gradient(135deg, rgba(162,89,255,0.1), rgba(0,212,255,0.05))" : "rgba(255,255,255,0.03)",
                border: `1px solid ${p.highlight ? "#a259ff50" : "rgba(255,255,255,0.08)"}`,
                boxShadow: p.highlight ? "0 0 60px rgba(162,89,255,0.15)" : "none",
              }}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold text-white bg-gradient-to-r from-[#a259ff] to-[#00d4ff] shadow-lg whitespace-nowrap">
                  {p.badge}
                </div>
              )}
              <div className="mb-6">
                <p className="text-white/50 text-sm mb-2">{p.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">{p.price}</span>
                  <span className="text-white/35 text-sm mb-1">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={14} style={{ color: p.color }} className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <GlowButton onClick={() => navigate("/auth")} variant={p.highlight ? "primary" : "secondary"} className="w-full justify-center">
                {p.cta}
              </GlowButton>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
  );
};

// ── Final CTA ──────────────────────────────────────────────────────────────────
const FinalCTA = () => {
  const navigate = useNavigate();
  return (
  <section className="py-32 bg-[#080c18] relative overflow-hidden">
    <Blobs />
    <GridBg />
    <Particles />
    <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 text-center">
      <FadeUp>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-8">
          <Award size={12} className="text-[#f59e0b]" />
          Join 50,000+ professionals
        </div>
        <h2 className="text-4xl md:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
          Build Your Resume{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] via-[#7b6cff] to-[#00d4ff]">
            in Seconds
          </span>
        </h2>
        <p className="text-white/40 text-base max-w-xl mx-auto mb-10">
          Stop spending hours on formatting. Let AI do the heavy lifting — you focus on getting the job.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <GlowButton onClick={() => navigate("/auth")} className="!px-10 !py-4 !text-base">
            <Upload size={18} />
            Upload LinkedIn PDF — It's Free
          </GlowButton>
          <GlowButton variant="secondary" className="!px-8 !py-4 !text-base">
            <Users size={18} />
            View Testimonials
          </GlowButton>
        </div>
      </FadeUp>
    </div>
  </section>
  );
};

// ── Footer ─────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-[#060919] border-t border-white/5 py-12">
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <div className="grid md:grid-cols-4 gap-10 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-base text-white">
              Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">AI</span>
            </span>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">The world's most advanced AI-powered resume builder. Designed for ambitious professionals.</p>
        </div>
        {[
          { title: "Product", links: ["Features", "Templates", "Pricing", "Changelog"] },
          { title: "Resources", links: ["Blog", "Docs", "Career Tips", "Support"] },
          { title: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-white/30 text-sm hover:text-white/70 transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/25 text-xs">© 2025 CVMint. All rights reserved.</p>
        <div className="flex items-center gap-4">
          {[
            { href: "#", svg: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.5 4.4 9 4.5-.9-4.2 4-6.5 7-3.8 1.1 0 3-1.2 3-1.2z"/> },
            { href: "#", svg: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S9 17.44 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></> },
            { href: "#", svg: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></> },
          ].map((item, i) => (
            <motion.a key={i} href={item.href} whileHover={{ scale: 1.15, y: -2 }} className="text-white/25 hover:text-white/70 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.svg}
              </svg>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ── App ────────────────────────────────────────────────────────────────────────
export default function ResumeAILanding() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", background: "#080c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080c18; }
        ::-webkit-scrollbar-thumb { background: #a259ff44; border-radius: 99px; }
      `}</style>
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <ResumePreview />
      <AIShowcase />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}