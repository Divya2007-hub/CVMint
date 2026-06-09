import { Component } from "react";
import { motion } from "framer-motion";

// ── Error Boundary Class Component ─────────────────────────────────────────────
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("CVMint Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;
    const errorMessage = this.state.error?.message || "Unknown error";

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #080c18 0%, #0a0e1f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'Outfit', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(162,89,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(162,89,255,0.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Blobs */}
        <div style={{ position: "fixed", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.06), transparent)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(162,89,255,0.05), transparent)", pointerEvents: "none" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative", zIndex: 1,
            width: "100%", maxWidth: 520,
            background: "rgba(13,17,40,0.9)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 20,
            padding: "36px 32px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(239,68,68,0.1)",
            textAlign: "center",
          }}
        >
          {/* Top error line */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)", borderRadius: 1 }} />

          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⚠️
          </motion.div>

          {/* Logo */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>
              CV<span style={{ background: "linear-gradient(90deg, #a259ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mint</span>
            </span>
          </div>

          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>
            Something went wrong
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            An unexpected error occurred. Your data is safe — try refreshing or going back to the dashboard.
          </p>

          {/* Error message in dev mode */}
          {isDev && (
            <div style={{
              margin: "0 0 24px", padding: "12px 16px", borderRadius: 10, textAlign: "left",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Dev Error
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", wordBreak: "break-all" }}>
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={this.handleReload}
              style={{
                padding: "11px 24px", borderRadius: 10, cursor: "pointer",
                background: "linear-gradient(135deg, #a259ff, #00d4ff)",
                border: "none", color: "white",
                fontSize: 13, fontWeight: 700,
                boxShadow: "0 4px 14px rgba(162,89,255,0.3)",
              }}
            >
              ↺ Reload Page
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={this.handleGoHome}
              style={{
                padding: "11px 24px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13, fontWeight: 600,
              }}
            >
              ← Go Home
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={this.handleReset}
              style={{
                padding: "11px 24px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: 600,
              }}
            >
              Try Again
            </motion.button>
          </div>

          <p style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            If this keeps happening, try clearing your browser cache.
          </p>
        </motion.div>
      </div>
    );
  }
}
