import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Sparkles,
  Check, X, AlertCircle, CheckCircle, Zap, Shield,
  FileText, Brain, Target, ChevronRight, Star, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// ─── Design Tokens (matching landing page) ────────────────────────────────────
// bg: #080c18 | primary: #a259ff | accent: #00d4ff | blue: #3b82f6
// font: Outfit

// ─── Shared Background Elements ───────────────────────────────────────────────
const Blobs = ({ variant = "default" }) => {
  const configs = {
    default: [
      { color: "#a259ff", top: "-20%", left: "-10%", w: 600, dur: 12, dx: 30 },
      { color: "#00d4ff", top: "40%", right: "-15%", w: 450, dur: 15, dy: -40 },
      { color: "#3b82f6", bottom: "5%", left: "30%", w: 350, dur: 10, dx: -20 },
    ],
    signin: [
      { color: "#a259ff", top: "-10%", left: "-5%", w: 500, dur: 11, dx: 25 },
      { color: "#00d4ff", bottom: "10%", right: "-10%", w: 400, dur: 14, dy: -30 },
    ],
  };
  const list = configs[variant] || configs.default;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {list.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-[0.14] blur-[110px]"
          style={{
            background: `radial-gradient(circle, ${b.color}, transparent)`,
            width: b.w, height: b.w,
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
          }}
          animate={{ scale: [1, 1.18, 1], x: [0, b.dx || 0, 0], y: [0, b.dy || 0, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
        />
      ))}
    </div>
  );
};

const GridBg = () => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: "linear-gradient(rgba(162,89,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(162,89,255,0.04) 1px,transparent 1px)",
    backgroundSize: "60px 60px",
  }} />
);

const Particles = () => {
  const pts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 2 + 0.8,
    dur: Math.random() * 7 + 5, delay: Math.random() * 4,
    col: i % 3 === 0 ? "#a259ff" : i % 3 === 1 ? "#00d4ff" : "#3b82f6",
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: p.col }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 60, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[260px]"
          style={{
            background: t.type === "success" ? "rgba(16,185,129,0.1)" : t.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(162,89,255,0.1)",
            borderColor: t.type === "success" ? "rgba(16,185,129,0.3)" : t.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(162,89,255,0.3)",
          }}
        >
          {t.type === "success" ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" /> :
           t.type === "error" ? <AlertCircle size={16} className="text-red-400 flex-shrink-0" /> :
           <Sparkles size={16} className="text-[#a259ff] flex-shrink-0" />}
          <span className="text-white/80 text-sm flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white/70 transition-colors ml-1">
            <X size={14} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, add, remove };
};

// ─── Glow Button ──────────────────────────────────────────────────────────────
const GlowButton = ({ children, onClick, variant = "primary", className = "", disabled, loading }) => {
  const base = "relative inline-flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer select-none overflow-hidden group";
  const primary = "bg-gradient-to-r from-[#a259ff] to-[#00d4ff] text-white shadow-[0_0_30px_rgba(162,89,255,0.4)] hover:shadow-[0_0_50px_rgba(162,89,255,0.65)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100";
  const secondary = "bg-white/5 border border-white/12 text-white/80 hover:bg-white/9 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md";

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`${base} ${variant === "primary" ? primary : secondary} ${className}`}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <span className="relative z-10 flex items-center gap-2.5">{children}</span>
      )}
      {variant === "primary" && !disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-[#c084ff] to-[#38d9ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.button>
  );
};

// ─── Glow Input ───────────────────────────────────────────────────────────────
const GlowInput = ({ icon, label, type = "text", value, onChange, error, placeholder, rightEl }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {/* left icon */}
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? "text-[#a259ff]" : "text-white/25"}`}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-white/4 border rounded-xl py-3.5 pl-10 pr-10 text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
          style={{
            borderColor: error ? "rgba(239,68,68,0.5)" : focused ? "rgba(162,89,255,0.6)" : "rgba(255,255,255,0.08)",
            boxShadow: focused ? (error ? "0 0 0 3px rgba(239,68,68,0.12)" : "0 0 0 3px rgba(162,89,255,0.12), 0 0 20px rgba(162,89,255,0.08)") : "none",
            background: focused ? "rgba(162,89,255,0.06)" : "rgba(255,255,255,0.04)",
          }}
        />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400 flex items-center gap-1.5"
          >
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Left Panel Illustration ──────────────────────────────────────────────────
const LeftPanel = ({ mode }) => {
  const stats = [
    { label: "Resumes Built", val: "2.1M+", color: "#a259ff" },
    { label: "ATS Score Avg", val: "96%", color: "#00d4ff" },
    { label: "Interviews Landed", val: "87%", color: "#10b981" },
  ];

  const features = [
    { icon: <Brain size={14} />, text: "AI-powered bullet enhancement" },
    { icon: <Shield size={14} />, text: "ATS optimization engine" },
    { icon: <FileText size={14} />, text: "12 premium templates" },
    { icon: <Zap size={14} />, text: "Instant PDF export" },
  ];

  return (
    <div className="relative flex flex-col justify-between h-full p-10 xl:p-14 overflow-hidden">
      {/* Decorative glow orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-20 blur-[80px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #a259ff, transparent)", top: "10%", right: "-10%" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-15 blur-[70px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #00d4ff, transparent)", bottom: "15%", left: "-5%" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Top: logo area */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center shadow-[0_0_20px_rgba(162,89,255,0.5)]">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            CV<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">Mint</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7 }}
            className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3"
          >
            {mode === "signin" ? (
              <>Welcome<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">back.</span></>
            ) : (
              <>Your dream job<br />starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">here.</span></>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-white/40 text-sm leading-relaxed max-w-xs"
          >
            {mode === "signin"
              ? "Sign in to continue building career-defining resumes powered by AI."
              : "Join 50,000+ professionals who landed their dream jobs with AI-crafted resumes."}
          </motion.p>
        </div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="space-y-3 mb-10"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-[#a259ff]/15 border border-[#a259ff]/20 flex items-center justify-center text-[#a259ff]">
                {f.icon}
              </div>
              <span className="text-white/50 text-sm">{f.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        className="grid grid-cols-3 gap-3"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
            className="bg-white/4 border border-white/8 rounded-xl p-3 text-center"
          >
            <div className="text-lg font-black mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-white/30 leading-tight">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating mini resume card */}
      <motion.div
        className="absolute bottom-24 right-6 xl:right-10 w-36"
        animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center text-white text-[8px] font-bold">AJ</div>
            <div>
              <div className="h-1.5 w-14 rounded bg-gradient-to-r from-[#a259ff] to-[#00d4ff] mb-1" />
              <div className="h-1 w-10 rounded bg-white/15" />
            </div>
          </div>
          {[0.9, 0.7, 0.8].map((w, j) => (
            <motion.div key={j} className="h-1 rounded mb-1 bg-white/12"
              style={{ width: `${w * 100}%` }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: j * 0.3 }}
            />
          ))}
          <motion.div
            className="mt-2 text-center text-[9px] font-bold text-[#00d4ff] border border-[#00d4ff]/30 rounded-md py-0.5"
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
          >
            ATS 98%
          </motion.div>
        </div>
      </motion.div>

      {/* Testimonial chip */}
      <motion.div
        className="absolute top-1/3 -right-2 xl:right-2"
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }}
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 w-44">
          <div className="flex gap-0.5 mb-1.5">
            {[...Array(5)].map((_, j) => <Star key={j} size={9} className="fill-[#f59e0b] text-[#f59e0b]" />)}
          </div>
          <p className="text-white/55 text-[10px] leading-relaxed mb-2">"Got 4 interviews in one week after using CVMint!"</p>
          <p className="text-white/30 text-[10px] font-medium">— Sarah K., Google</p>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = ({ text }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-white/8" />
    <span className="text-white/25 text-xs px-1">{text}</span>
    <div className="flex-1 h-px bg-white/8" />
  </div>
);

// ─── Google Button ────────────────────────────────────────────────────────────
const GoogleBtn = ({ onClick, loading }) => (
  <motion.button
    whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.25)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-white/5 border border-white/10 text-white/75 text-sm font-semibold hover:bg-white/8 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <motion.div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/70"
        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      />
    ) : (
      <>
        {/* Google SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </>
    )}
  </motion.button>
);

// ─── Checkbox ─────────────────────────────────────────────────────────────────
const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div
      onClick={() => onChange(!checked)}
      className="w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200"
      style={{
        background: checked ? "linear-gradient(135deg, #a259ff, #00d4ff)" : "rgba(255,255,255,0.04)",
        borderColor: checked ? "transparent" : "rgba(255,255,255,0.15)",
        boxShadow: checked ? "0 0 12px rgba(162,89,255,0.4)" : "none",
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={10} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <span className="text-white/45 text-xs group-hover:text-white/65 transition-colors">{label}</span>
  </label>
);

// ─── Password Strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const getStrength = (p) => {
    if (!p) return { score: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "#ef4444" },
      { score: 2, label: "Fair", color: "#f59e0b" },
      { score: 3, label: "Good", color: "#3b82f6" },
      { score: 4, label: "Strong", color: "#10b981" },
    ];
    return levels[s];
  };
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i} className="flex-1 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ backgroundColor: i <= score ? color : "rgba(255,255,255,0.08)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      {label && <p className="text-[11px]" style={{ color }}>{label} password</p>}
    </div>
  );
};

// ─── Firebase error → human-readable message ──────────────────────────────────
const firebaseError = (code) => {
  const map = {
    "auth/user-not-found":       "No account found with this email.",
    "auth/wrong-password":       "Incorrect password. Please try again.",
    "auth/invalid-credential":   "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/too-many-requests":    "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] || "Something went wrong. Please try again.";
};

// ─── Sign In Page ─────────────────────────────────────────────────────────────
const SignInPage = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toasts, add: addToast, remove } = useToasts();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast("Welcome back! Redirecting…", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      addToast(firebaseError(err.code), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      addToast("Signed in with Google!", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      addToast(firebaseError(err.code), "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} remove={remove} />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        {/* Card glow ring */}
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#a259ff]/30 to-[#00d4ff]/20 blur-sm" />
          <div className="relative bg-[#0d1128]/80 backdrop-blur-2xl border border-white/8 rounded-2xl p-8 md:p-9 shadow-2xl">

            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a259ff]/12 border border-[#a259ff]/20 text-[#a259ff] text-xs font-semibold mb-4"
              >
                <Sparkles size={11} /> Welcome back
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="text-2xl font-black text-white mb-1.5"
              >
                Sign in to CVMint
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
                className="text-white/35 text-sm"
              >
                Don't have an account?{" "}
                <button onClick={onSwitch} className="text-[#a259ff] hover:text-[#c084ff] font-semibold transition-colors">
                  Sign up free
                </button>
              </motion.p>
            </div>

            {/* Google */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GoogleBtn onClick={handleGoogle} loading={googleLoading} />
            </motion.div>

            <Divider text="or continue with email" />

            {/* Form */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            >
              <GlowInput
                icon={<Mail size={15} />}
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                error={errors.email}
                placeholder="you@example.com"
              />

              <GlowInput
                icon={<Lock size={15} />}
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                error={errors.password}
                placeholder="••••••••"
                rightEl={
                  <button onClick={() => setShowPw(!showPw)} className="text-white/25 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
                <button className="text-xs text-[#00d4ff] hover:text-[#38d9ff] transition-colors font-medium">
                  Forgot password?
                </button>
              </div>

              <GlowButton onClick={handleSubmit} loading={loading} className="mt-2">
                {!loading && <><ChevronRight size={16} /> Sign In</>}
              </GlowButton>
            </motion.div>

            {/* Terms note */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="text-white/20 text-[11px] text-center mt-5 leading-relaxed"
            >
              By signing in, you agree to our{" "}
              <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">Terms of Service</span>
              {" "}and{" "}
              <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─── Sign Up Page ─────────────────────────────────────────────────────────────
const SignUpPage = ({ onSwitch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toasts, add: addToast, remove } = useToasts();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords don't match";
    if (!agree) e.agree = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name.trim() });
      addToast("Account created! Welcome to CVMint 🎉", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      addToast(firebaseError(err.code), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      addToast("Account created with Google!", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      addToast(firebaseError(err.code), "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} remove={remove} />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#00d4ff]/25 to-[#a259ff]/20 blur-sm" />
          <div className="relative bg-[#0d1128]/80 backdrop-blur-2xl border border-white/8 rounded-2xl p-8 md:p-9 shadow-2xl">

            {/* Header */}
            <div className="mb-7">
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4ff]/12 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold mb-4"
              >
                <Zap size={11} /> Free forever — no credit card needed
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="text-2xl font-black text-white mb-1.5"
              >
                Create your account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
                className="text-white/35 text-sm"
              >
                Already have an account?{" "}
                <button onClick={onSwitch} className="text-[#a259ff] hover:text-[#c084ff] font-semibold transition-colors">
                  Sign in
                </button>
              </motion.p>
            </div>

            {/* Google */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GoogleBtn onClick={handleGoogle} loading={googleLoading} />
            </motion.div>

            <Divider text="or sign up with email" />

            {/* Form */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            >
              <GlowInput
                icon={<User size={15} />}
                label="Full name"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                error={errors.name}
                placeholder="Alex Johnson"
              />
              <GlowInput
                icon={<Mail size={15} />}
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                error={errors.email}
                placeholder="you@example.com"
              />
              <div>
                <GlowInput
                  icon={<Lock size={15} />}
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  error={errors.password}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button onClick={() => setShowPw(!showPw)} className="text-white/25 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
              </div>
              <GlowInput
                icon={<Lock size={15} />}
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
                error={errors.confirm}
                placeholder="Re-enter password"
                rightEl={
                  <button onClick={() => setShowConfirm(!showConfirm)} className="text-white/25 hover:text-white/60 transition-colors">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Terms checkbox */}
              <div>
                <Checkbox
                  checked={agree}
                  onChange={v => { setAgree(v); setErrors(p => ({ ...p, agree: "" })); }}
                  label={
                    <span>I agree to the <span className="text-[#a259ff] hover:text-[#c084ff] cursor-pointer transition-colors">Terms of Service</span> and <span className="text-[#a259ff] hover:text-[#c084ff] cursor-pointer transition-colors">Privacy Policy</span></span>
                  }
                />
                <AnimatePresence>
                  {errors.agree && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-red-400 flex items-center gap-1 mt-1.5">
                      <AlertCircle size={11} />{errors.agree}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <GlowButton onClick={handleSubmit} loading={loading} className="mt-1">
                {!loading && <><Sparkles size={15} /> Create Free Account</>}
              </GlowButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─── Auth Navbar ──────────────────────────────────────────────────────────────
const AuthNav = () => {
  const navigate = useNavigate();
  return (
  <motion.div
    initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-16 bg-[#080c18]/70 backdrop-blur-xl border-b border-white/5"
  >
    {/* Logo */}
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center shadow-[0_0_15px_rgba(162,89,255,0.45)]">
        <Cpu size={15} className="text-white" />
      </div>
      <span className="font-black text-lg tracking-tight text-white">
        CV<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">Mint</span>
      </span>
    </div>

    {/* Back to home */}
    <motion.button
      onClick={() => navigate("/")}
      whileHover={{ x: -3 }}
      className="flex items-center gap-2 text-sm text-white/45 hover:text-white/80 transition-colors group"
    >
      <ArrowLeft size={15} className="group-hover:text-[#a259ff] transition-colors" />
      Back to home
    </motion.button>
  </motion.div>
  );
};

// ─── Main Auth App ─────────────────────────────────────────────────────────────
export default function ResumeAIAuth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  return (
    <div className="min-h-screen bg-[#080c18]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080c18; }
        ::-webkit-scrollbar-thumb { background: #a259ff44; border-radius: 99px; }
      `}</style>

      <AuthNav />

      {/* Full-page layout */}
      <div className="min-h-screen flex">

        {/* ── Left Panel (desktop only) ────────────────────────────────────── */}
        <div className="hidden lg:block w-[46%] xl:w-[42%] relative bg-[#07091a] border-r border-white/5 overflow-hidden">
          <Blobs />
          <GridBg />
          <Particles />
          <div className="relative z-10 h-full pt-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full"
              >
                <LeftPanel mode={mode} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Panel (auth form) ──────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Background effects (visible on mobile too) */}
          <div className="absolute inset-0">
            <Blobs variant="signin" />
            <GridBg />
            <Particles />
          </div>

          {/* Centered form */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-24">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {mode === "signin" ? (
                  <SignInPage key="signin" onSwitch={() => setMode("signup")} />
                ) : (
                  <SignUpPage key="signup" onSwitch={() => setMode("signin")} />
                )}
              </AnimatePresence>

              {/* Mode toggle pills (visible on mobile) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex lg:hidden justify-center gap-2 mt-6"
              >
                {["signin", "signup"].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: mode === m ? "linear-gradient(135deg, rgba(162,89,255,0.2), rgba(0,212,255,0.12))" : "transparent",
                      border: `1px solid ${mode === m ? "rgba(162,89,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                      color: mode === m ? "#c084ff" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}