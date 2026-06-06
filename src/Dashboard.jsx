import DashboardHero from "./DashboardHero";
import RecentResumes from "./RecentResumes";
import QuickActions from "./QuickActions";
import AISuggestionsPanel from "./AISuggestionsPanel";
import ActivityTimeline from "./ActivityTimeline";
import TemplatesPage from "./TemplatesPage";
import { ensureUserProfile, subscribeStats, subscribeActivity } from "./db";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Layout, BarChart2, Globe,
  Settings, LogOut, Search, Bell, Menu, X, ChevronRight, Cpu, Activity
} from "lucide-react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ResumeBuilder from "./ResumeBuilder";

// ── Background decorations ─────────────────────────────────────────────────────
const Blobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[120px]"
      style={{ background: "radial-gradient(circle, #a259ff, transparent)", top: "-10%", left: "10%" }}
      animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px]"
      style={{ background: "radial-gradient(circle, #00d4ff, transparent)", bottom: "10%", right: "5%" }}
      animate={{ scale: [1, 1.2, 1], y: [0, -30, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
  </div>
);

const GridBg = () => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{
    backgroundImage: "linear-gradient(rgba(162,89,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(162,89,255,0.03) 1px,transparent 1px)",
    backgroundSize: "60px 60px",
  }} />
);

// ── Nav ────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { id: "resumes",    label: "My Resumes",          icon: FileText },
  { id: "templates",  label: "Templates",           icon: Layout },
  { id: "ats",        label: "ATS Analyzer",        icon: BarChart2 },
  { id: "portfolio",  label: "Portfolio Generator", icon: Globe },
  { id: "activity",   label: "Activity",            icon: Activity },
  { id: "settings",   label: "Settings",            icon: Settings },
];

const Sidebar = ({ active, setActive, collapsed, setCollapsed, mobile, closeMobile, user }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(getAuth());
    navigate("/");
  };
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/5 ${collapsed && !mobile ? "justify-center px-3" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(162,89,255,0.25)]">
          <Cpu size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="font-black text-lg tracking-tight text-white whitespace-nowrap">
            CV<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a259ff] to-[#00d4ff]">Mint</span>
          </motion.span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto text-white/25 hover:text-white/70 transition-colors ${collapsed ? "mx-auto" : ""}`}>
            <ChevronRight size={16} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        )}
        {mobile && (
          <button onClick={closeMobile} className="ml-auto text-white/40 hover:text-white/70">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button key={item.id}
              whileHover={{ x: collapsed && !mobile ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActive(item.id); if (mobile) closeMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive ? "bg-gradient-to-r from-[#a259ff]/20 to-[#00d4ff]/10 border border-[#a259ff]/25" : "hover:bg-white/5 border border-transparent"
              } ${collapsed && !mobile ? "justify-center px-2" : ""}`}>
              {isActive && (
                <motion.div layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-[#a259ff] to-[#00d4ff]" />
              )}
              <Icon size={17} className={`flex-shrink-0 transition-colors ${isActive ? "text-[#a259ff]" : "text-white/35 group-hover:text-white/65"}`} />
              {(!collapsed || mobile) && (
                <span className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-white" : "text-white/45 group-hover:text-white/75"}`}>
                  {item.label}
                </span>
              )}
              {isActive && (!collapsed || mobile) && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a259ff]" />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{user.displayName || "User"}</p>
              <p className="text-white/30 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <motion.button whileHover={{ x: collapsed && !mobile ? 0 : 3 }} whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/35 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all duration-200 group ${collapsed && !mobile ? "justify-center px-2" : ""}`}>
          <LogOut size={17} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Logout</span>}
        </motion.button>
      </div>
    </div>
  );
};

function timeAgoNotif(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const Topbar = ({ openMobile, active, user, onSearch }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    setQuery("");
    onSearch?.("");
  }, [active]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  // Pull real notifications from activity log
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeActivity((activities) => {
      setNotifs(activities.slice(0, 5).map(a => ({
        id: a.id,
        text: a.detail ? `${a.event} — ${a.detail}` : a.event,
        time: a.createdAt?.toDate ? timeAgoNotif(a.createdAt.toDate()) : "Just now",
        dot: a.tag === "CREATE" ? "#10b981"
           : a.tag === "EXPORT" ? "#a259ff"
           : a.tag === "SCORE"  ? "#00d4ff"
           : a.tag === "DELETE" ? "#ef4444"
           : "#64748b",
      })));
    });
    return unsub;
  }, [user]);

  const pageTitle = NAV_ITEMS.find(n => n.id === active)?.label || "Dashboard";

  return (
    <div className="sticky top-0 z-30 flex items-center gap-4 px-5 md:px-6 h-16 bg-[#080c18]/80 backdrop-blur-xl border-b border-white/5">
      <button onClick={openMobile} className="lg:hidden text-white/40 hover:text-white transition-colors flex-shrink-0">
        <Menu size={20} />
      </button>
      <div className="hidden md:block">
        <h1 className="text-white font-bold text-base">{pageTitle}</h1>
      </div>
      <div className="flex-1 max-w-sm ml-auto md:ml-6">
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? "text-[#a259ff]" : "text-white/25"}`} />
          <input value={query} onChange={handleQueryChange}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Search resumes, templates..."
            className="w-full bg-white/4 border rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-white/20 outline-none transition-all duration-300"
            style={{
              borderColor: searchFocused ? "rgba(162,89,255,0.5)" : "rgba(255,255,255,0.07)",
              boxShadow: searchFocused ? "0 0 0 3px rgba(162,89,255,0.1)" : "none",
              background: searchFocused ? "rgba(162,89,255,0.06)" : "rgba(255,255,255,0.04)",
            }} />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-white/45 hover:text-white hover:bg-white/8 transition-all duration-200">
            <Bell size={16} />
            {notifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#a259ff]" />
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-72 bg-[#0d1128]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Notifications</span>
                    <span className="text-[10px] text-[#a259ff] font-semibold">{notifs.length} new</span>
                  </div>
                  {notifs.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer border-b border-white/4 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                      <div>
                        <p className="text-white/75 text-xs leading-relaxed">{n.text}</p>
                        <p className="text-white/25 text-[10px] mt-0.5">{n.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <motion.div whileHover={{ scale: 1.05 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#a259ff] to-[#00d4ff] flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-[0_2px_8px_rgba(162,89,255,0.2)]">
          {(user?.displayName || user?.email || "U")[0].toUpperCase()}
        </motion.div>
      </div>
    </div>
  );
};

// ── Dashboard content ──────────────────────────────────────────────────────────
const DashboardContent = ({ user, onCreateResume, stats, refreshResumes, searchQuery }) => (
  <div className="space-y-8">
    <DashboardHero user={user} onCreateResume={onCreateResume} stats={stats} />
    <QuickActions onCreateResume={onCreateResume} />
    <RecentResumes onCreateResume={onCreateResume} externalSearch={searchQuery} />
  </div>
);

const PlaceholderPage = ({ title, icon: Icon, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: `${color}15`, color, boxShadow: `0 0 30px ${color}25` }}>
      <Icon size={28} />
    </div>
    <h2 className="text-white font-black text-2xl mb-2">{title}</h2>
    <p className="text-white/35 text-sm max-w-xs">This section is coming soon. We're building something amazing.</p>
    <motion.div className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
      style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)`, border: `1px solid ${color}30` }}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
      Coming Soon
    </motion.div>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [active, setActive]             = useState("dashboard");
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [user, setUser]                 = useState(null);
  const [showBuilder, setShowBuilder]   = useState(false);
  const [builderTemplate, setBuilderTemplate] = useState("classic");
  const [stats, setStats]               = useState(null);
  const [refreshResumes, setRefreshResumes] = useState(0);
  const [searchQuery, setSearchQuery]   = useState("");
  const navigate = useNavigate();

  // Auth guard + profile bootstrap
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (u) => {
      if (!u) { navigate("/auth"); return; }
      setUser(u);
      await ensureUserProfile(u);
    });
    return unsub;
  }, [navigate]);

  // Subscribe to real-time stats once user is ready
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeStats(setStats);
    return unsub;
  }, [user]);

  const handleBuilderClose = useCallback(() => {
  setShowBuilder(false);
  setRefreshResumes(r => r + 1); // keep this for other purposes
  }, []);

  // Called from TemplatesPage when user clicks "Use Template"
  const handleSelectTemplate = useCallback((templateId) => {
    setBuilderTemplate(templateId);
    setShowBuilder(true);
  }, []);

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return (
          <DashboardContent
            user={user}
            onCreateResume={() => { setBuilderTemplate("classic"); setShowBuilder(true); }}
            stats={stats}
            refreshResumes={refreshResumes}
            searchQuery={searchQuery}
          />
        );
      case "resumes":
        return <RecentResumes onCreateResume={() => { setBuilderTemplate("classic"); setShowBuilder(true); }} externalSearch={searchQuery} />;
      case "templates":
        return <TemplatesPage onSelectTemplate={handleSelectTemplate} />;
      case "ats":
        return <AISuggestionsPanel />;
      case "portfolio":
        return <PlaceholderPage title="Portfolio Generator" icon={Globe}    color="#f59e0b" />;
      case "activity":
        return <ActivityTimeline />;
      case "settings":
        return <PlaceholderPage title="Settings"            icon={Settings} color="#6b7280" />;
      default:
        return (
          <DashboardContent
            user={user}
            onCreateResume={() => { setBuilderTemplate("classic"); setShowBuilder(true); }}
            stats={stats}
            refreshResumes={refreshResumes}
          />
        );
    }
  };

  const SIDEBAR_W = collapsed ? "72px" : "220px";

  return (
    <div className="min-h-screen bg-[#080c18]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>
      <Blobs />
      <GridBg />

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: SIDEBAR_W }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-[#0a0e1f]/90 backdrop-blur-xl border-r border-white/5 overflow-hidden">
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed}
          mobile={false} closeMobile={() => {}} user={user} />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0a0e1f]/98 backdrop-blur-xl border-r border-white/8 lg:hidden">
              <Sidebar active={active} setActive={setActive} collapsed={false} setCollapsed={() => {}}
                mobile={true} closeMobile={() => setMobileOpen(false)} user={user} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ marginLeft: `clamp(0px, (100vw - 1024px) * 9999, ${collapsed ? "72px" : "220px"})` }}
      >
        <Topbar openMobile={() => setMobileOpen(true)} active={active} user={user} onSearch={setSearchQuery} />
        <main className="flex-1 p-5 md:p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Resume builder modal — passes initial template */}
      <AnimatePresence>
        {showBuilder && (
          <ResumeBuilder
            initialTemplateId={builderTemplate}
            onClose={handleBuilderClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}