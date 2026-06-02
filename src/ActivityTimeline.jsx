import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { subscribeActivity } from "./db";
import { Loader2 } from "lucide-react";

// ── Tag config ─────────────────────────────────────────────────────────────────
const TAG_CONFIG = {
  CREATE:  { color: "#00f5ff", rgb: "0, 245, 255",   icon: "✦", badge: "New",    pulse: false },
  EXPORT:  { color: "#a78bfa", rgb: "167, 139, 250",  icon: "↓", badge: null,     pulse: false },
  SCORE:   { color: "#10b981", rgb: "16, 185, 129",   icon: "↑", badge: null,     pulse: false },
  PUBLISH: { color: "#f59e0b", rgb: "245, 158, 11",   icon: "◉", badge: "Live",   pulse: true  },
  DELETE:  { color: "#ef4444", rgb: "239, 68, 68",    icon: "✕", badge: null,     pulse: false },
  DEFAULT: { color: "#64748b", rgb: "100, 116, 139",  icon: "·", badge: null,     pulse: false },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return "Just now";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)   return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  if (!date) return "Today";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Connector line ─────────────────────────────────────────────────────────────
function ConnectorLine({ color, rgb, isLast, animate: shouldAnimate }) {
  return (
    <div style={{ position: "absolute", left: 19, top: 44, bottom: isLast ? "auto" : 0, height: isLast ? 0 : "calc(100% - 44px)", width: 2, overflow: "hidden" }}>
      {!isLast && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(${rgb}, 0.12)` }} />
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={shouldAnimate ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(${rgb}, 0.7) 0%, rgba(${rgb}, 0.15) 100%)`, transformOrigin: "top" }}
          />
          <motion.div
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 1 }}
            style={{ position: "absolute", top: 0, left: -1, width: 4, height: 20, background: `linear-gradient(180deg, transparent, ${color}, transparent)`, borderRadius: 2, filter: "blur(1px)" }}
          />
        </>
      )}
    </div>
  );
}

// ── Node dot ───────────────────────────────────────────────────────────────────
function NodeDot({ color, rgb, pulse, icon, animate: shouldAnimate }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 40, zIndex: 2 }}>
      {pulse && (
        <>
          <motion.div animate={{ scale: [1, 2.2], opacity: [0.4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, top: 4, left: 4, width: 32, height: 32, borderRadius: "50%", background: `rgba(${rgb}, 0.25)` }} />
          <motion.div animate={{ scale: [1, 1.7], opacity: [0.3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            style={{ position: "absolute", inset: 0, top: 4, left: 4, width: 32, height: 32, borderRadius: "50%", border: `1px solid rgba(${rgb}, 0.5)` }} />
        </>
      )}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={shouldAnimate ? { scale: 1, rotate: 0 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, rgba(${rgb}, 0.3), rgba(${rgb}, 0.08))`, border: `1.5px solid rgba(${rgb}, 0.6)`, boxShadow: `0 0 12px rgba(${rgb}, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color, fontWeight: 800, top: 4, left: 4 }}>
        {icon}
      </motion.div>
    </div>
  );
}

// ── Meta pill ──────────────────────────────────────────────────────────────────
function MetaPill({ label, value, color, rgb }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: `rgba(${rgb}, 0.06)`, border: `1px solid rgba(${rgb}, 0.15)` }}>
      <span style={{ fontSize: 10, color: `rgba(${rgb}, 0.6)`, fontFamily: "monospace", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

// ── Single timeline entry ──────────────────────────────────────────────────────
function TimelineEntry({ activity, index, isLast }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [expanded, setExpanded] = useState(false);

  const cfg = TAG_CONFIG[activity.tag] || TAG_CONFIG.DEFAULT;
  const { color, rgb, icon, badge, pulse } = cfg;
  const ts = activity.createdAt?.toDate?.() ?? null;

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", gap: 0, paddingBottom: isLast ? 0 : 32 }}>
      <ConnectorLine color={color} rgb={rgb} isLast={isLast} animate={inView} />
      <NodeDot color={color} rgb={rgb} pulse={pulse} icon={icon} animate={inView} />

      <motion.div
        initial={{ opacity: 0, x: 28, filter: "blur(4px)" }}
        animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.55, delay: index * 0.08 + 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ flex: 1, marginLeft: 16 }}
      >
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            position: "relative", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(15,15,28,0.95) 0%, rgba(10,10,20,0.9) 100%)",
            border: `1px solid rgba(${rgb}, 0.18)`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)`,
            backdropFilter: "blur(12px)", overflow: "hidden", cursor: "pointer",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb}, 0.5)`; e.currentTarget.style.boxShadow = `0 0 28px rgba(${rgb}, 0.18), inset 0 1px 0 rgba(255,255,255,0.06)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `rgba(${rgb}, 0.18)`; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)`; }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, rgba(${rgb}, 0.5) 50%, transparent 100%)` }} />

          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", fontFamily: "'Courier New', monospace", color, padding: "2px 7px", borderRadius: 4, background: `rgba(${rgb}, 0.12)`, border: `1px solid rgba(${rgb}, 0.25)` }}>
                    {activity.tag || "EVENT"}
                  </span>
                  {badge && (
                    <motion.span
                      animate={pulse ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", fontFamily: "monospace", color, padding: "2px 7px", borderRadius: 4, background: `rgba(${rgb}, 0.15)`, border: `1px solid rgba(${rgb}, 0.35)` }}>
                      {badge}
                    </motion.span>
                  )}
                </div>
                <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
                  {activity.event}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activity.detail || "—"}
                </p>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>
                  {timeAgo(ts)}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: "#334155", fontFamily: "monospace" }}>
                  {ts ? `${formatDate(ts)}, ${formatTime(ts)}` : ""}
                </p>
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#475569" }}>▾</motion.span>
              </div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid rgba(${rgb}, 0.12)`, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ts && <MetaPill label="Time"  value={formatTime(ts)}    color={color} rgb={rgb} />}
                    {ts && <MetaPill label="Date"  value={formatDate(ts)}    color={color} rgb={rgb} />}
                    <MetaPill label="Event" value={activity.event || "—"} color={color} rgb={rgb} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Live indicator ─────────────────────────────────────────────────────────────
function LiveIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.8)" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", fontFamily: "monospace", letterSpacing: "0.1em" }}>LIVE</span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterTag, setFilterTag]   = useState("ALL");

  // Real-time subscription
  useEffect(() => {
    const unsub = subscribeActivity((data) => {
      setActivities(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const allTags = ["ALL", ...Object.keys(TAG_CONFIG).filter(t => t !== "DEFAULT")];

  const filtered = filterTag === "ALL"
    ? activities
    : activities.filter(a => a.tag === filterTag);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={28} color="#a259ff" />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #020509 0%, #060b14 40%, #04080f 100%)", padding: "36px 24px", fontFamily: "'Inter', -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Grid texture */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `radial-gradient(rgba(0,245,255,0.04) 1px, transparent 1px)`, backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -300, right: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -300, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(0,245,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#00f5ff" }}>◈</div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#334155", fontFamily: "monospace", textTransform: "uppercase" }}>CVMint · Dashboard</p>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Activity Timeline</h1>
              </div>
            </div>
            <LiveIndicator />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#334155", fontFamily: "monospace" }}>
            {activities.length} event{activities.length !== 1 ? "s" : ""} · All times local
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {allTags.map(tag => {
            const active = filterTag === tag;
            const cfg = TAG_CONFIG[tag] || TAG_CONFIG.DEFAULT;
            const color = tag === "ALL" ? "#64748b" : cfg.color;
            const rgb   = tag === "ALL" ? "100,116,139" : cfg.rgb;
            return (
              <motion.button key={tag} onClick={() => setFilterTag(tag)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "6px 14px", borderRadius: 7, border: active ? `1px solid rgba(${rgb}, 0.5)` : "1px solid rgba(255,255,255,0.07)", background: active ? `rgba(${rgb}, 0.12)` : "rgba(255,255,255,0.02)", color: active ? color : "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "monospace", transition: "all 0.18s", boxShadow: active ? `0 0 12px rgba(${rgb}, 0.15)` : "none" }}>
                {tag}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
            <p style={{ fontSize: 14, fontFamily: "monospace" }}>No activity yet. Create a resume to get started!</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={filterTag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {filtered.map((activity, index) => (
                <TimelineEntry key={activity.id} activity={activity} index={index} isLast={index === filtered.length - 1} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer stats */}
        {activities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.45 }} style={{ marginTop: 36 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Total Events",    value: activities.length,                                           color: "#00f5ff", rgb: "0,245,255" },
                { label: "Creates",         value: activities.filter(a => a.tag === "CREATE").length,           color: "#10b981", rgb: "16,185,129" },
                { label: "Exports",         value: activities.filter(a => a.tag === "EXPORT").length,           color: "#a78bfa", rgb: "167,139,250" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
                  style={{ padding: "14px 16px", borderRadius: 12, background: `linear-gradient(135deg, rgba(${stat.rgb}, 0.07) 0%, rgba(10,10,20,0.8) 100%)`, border: `1px solid rgba(${stat.rgb}, 0.18)`, textAlign: "center", backdropFilter: "blur(8px)" }}>
                  <p style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: "'Courier New', monospace", letterSpacing: "-0.02em" }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <p style={{ marginTop: 24, textAlign: "center", fontSize: 10, color: "#1e293b", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              ◈ CVMINT · ACTIVITY LOG · AUTO-SYNCED
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}