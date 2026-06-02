// ResumeRenderer.jsx – Live preview panel with template picker + PDF export
import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Loader2, Check, ChevronLeft, ChevronRight,
  Sparkles, Lock, Star, Zap
} from "lucide-react";
import { TEMPLATE_REGISTRY, getTemplate } from "./templateRegistry";

// ── PDF export ─────────────────────────────────────────────────────────────────
async function exportToPDF(containerRef, filename = "resume.pdf") {
  // Dynamically import heavy libs only when needed
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const el = containerRef.current;
  if (!el) throw new Error("No element to export");

  const canvas = await html2canvas(el, {
    scale: 2.5,           // crisp at retina
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio  = canvas.width / canvas.height;
  const imgH   = pageW / ratio;

  // If content is longer than one page, tile across multiple pages
  let y = 0;
  while (y < imgH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH, undefined, "FAST");
    y += pageH;
  }

  pdf.save(filename);
}

// ── Template Thumbnail Card ────────────────────────────────────────────────────
function TemplateThumbnail({ template, selected, onClick }) {
  const { name, thumbnail, atsScore, premium } = template;
  const isSelected = selected === template.id;

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        position: "relative",
        background: isSelected
          ? "rgba(162,89,255,0.12)"
          : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${isSelected ? "rgba(162,89,255,0.6)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: "10px",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 0.2s, background 0.2s",
        boxShadow: isSelected ? "0 0 18px rgba(162,89,255,0.25)" : "none",
        fontFamily: "'Outfit', sans-serif",
        width: "100%",
      }}
    >
      {/* Mini visual preview */}
      <div
        style={{
          height: 68,
          borderRadius: 6,
          marginBottom: 8,
          overflow: "hidden",
          position: "relative",
          background: thumbnail.style === "split"
            ? `linear-gradient(90deg, ${thumbnail.accentB} 38%, #fff 38%)`
            : thumbnail.style === "bold"
            ? `linear-gradient(180deg, ${thumbnail.accentB} 28%, #fafafa 28%)`
            : "#fff",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Simulated content lines */}
        <div style={{ padding: "8px 9px", display: "flex", flexDirection: "column", gap: 4 }}>
          {thumbnail.style === "split" ? (
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: "36%", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ height: 8, width: "80%", borderRadius: 2, background: `${thumbnail.accent}` }} />
                <div style={{ height: 4, width: "60%", borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
                <div style={{ height: 3, width: "90%", borderRadius: 2, background: "rgba(255,255,255,0.15)", marginTop: 4 }} />
                <div style={{ height: 3, width: "75%", borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, paddingTop: 2 }}>
                <div style={{ height: 4, width: "85%", borderRadius: 2, background: `${thumbnail.accent}55` }} />
                <div style={{ height: 3, width: "70%", borderRadius: 2, background: "#e5e7eb" }} />
                <div style={{ height: 3, width: "90%", borderRadius: 2, background: "#e5e7eb" }} />
                <div style={{ height: 3, width: "60%", borderRadius: 2, background: "#e5e7eb" }} />
              </div>
            </div>
          ) : thumbnail.style === "bold" ? (
            <>
              <div style={{ height: 6, width: "55%", borderRadius: 2, background: "#fff" }} />
              <div style={{ height: 3, width: "35%", borderRadius: 2, background: `${thumbnail.accent}88` }} />
              <div style={{ height: 3, marginTop: 6, width: "90%", borderRadius: 2, background: "#e5e7eb" }} />
              <div style={{ height: 3, width: "75%", borderRadius: 2, background: "#e5e7eb" }} />
            </>
          ) : (
            <>
              <div style={{ height: 7, width: "50%", borderRadius: 2, background: `${thumbnail.accentB}` }} />
              <div style={{ height: 2, width: "100%", borderRadius: 1, background: thumbnail.accent, marginTop: 2, marginBottom: 4 }} />
              <div style={{ height: 3, width: "85%", borderRadius: 2, background: "#d1d5db" }} />
              <div style={{ height: 3, width: "70%", borderRadius: 2, background: "#d1d5db" }} />
              <div style={{ height: 3, width: "90%", borderRadius: 2, background: "#d1d5db" }} />
            </>
          )}
        </div>
        {/* ATS badge */}
        <div style={{
          position: "absolute", bottom: 5, right: 5,
          fontSize: 8, fontWeight: 800,
          color: atsScore >= 95 ? "#10b981" : atsScore >= 88 ? "#00d4ff" : "#f59e0b",
          background: "rgba(0,0,0,0.55)",
          padding: "1px 5px",
          borderRadius: 3,
          backdropFilter: "blur(4px)",
        }}>
          ATS {atsScore}%
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11.5, fontWeight: 700, color: isSelected ? "#c084ff" : "#e2e8f0",
        }}>
          {name}
        </span>
        {premium && (
          <span style={{
            fontSize: 8.5, fontWeight: 800, color: "#f59e0b",
            background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
            padding: "1px 5px", borderRadius: 4,
          }}>
            PRO
          </span>
        )}
      </div>

      {isSelected && (
        <motion.div
          layoutId="selectedCheck"
          style={{
            position: "absolute", top: 7, right: 7,
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
}

// ── Export Button ──────────────────────────────────────────────────────────────
function ExportButton({ onExport, exporting, done }) {
  return (
    <motion.button
      whileHover={{ scale: exporting || done ? 1 : 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onExport}
      disabled={exporting || done}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 20px",
        borderRadius: 10,
        cursor: exporting || done ? "not-allowed" : "pointer",
        background: done
          ? "linear-gradient(135deg, #10b981, #059669)"
          : "linear-gradient(135deg, #a259ff, #00d4ff)",
        border: "none",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        boxShadow: "0 0 20px rgba(162,89,255,0.35)",
        opacity: exporting ? 0.8 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {exporting ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={15} />
          </motion.div>
          Generating PDF…
        </>
      ) : done ? (
        <><Check size={15} /> Downloaded!</>
      ) : (
        <><Download size={15} /> Export PDF</>
      )}
    </motion.button>
  );
}

// ── Main ResumeRenderer Component ──────────────────────────────────────────────
/**
 * Props:
 *   resumeData   – { personal, experience, education, skills }
 *   templateId   – string id, controlled externally (optional)
 *   onTemplateChange – callback(id) when user picks a template
 *   compact      – boolean, hide sidebar (embed mode)
 */
export default function ResumeRenderer({
  resumeData,
  templateId: externalId,
  onTemplateChange,
  compact = false,
}) {
  const [internalId, setInternalId]   = useState("classic");
  const [exporting, setExporting]     = useState(false);
  const [exportDone, setExportDone]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom]               = useState(0.85);
  const previewRef = useRef(null);

  const activeId = externalId ?? internalId;

  const handleSelect = useCallback((id) => {
    setInternalId(id);
    onTemplateChange?.(id);
  }, [onTemplateChange]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportDone(false);
    try {
      await exportToPDF(previewRef, "cvmint-resume.pdf");
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

  const { component: TemplateComponent } = getTemplate(activeId);

  const ZOOM_STEPS = [0.55, 0.7, 0.85, 1.0, 1.15];
  const zoomIdx = ZOOM_STEPS.findIndex((z) => z === zoom);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        background: "rgba(8,12,24,0.5)",
        fontFamily: "'Outfit', system-ui, sans-serif",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Template Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && !compact && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 188, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "rgba(10,14,31,0.95)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={13} style={{ color: "#a259ff" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Templates
                </span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
              {TEMPLATE_REGISTRY.map((tmpl) => (
                <TemplateThumbnail
                  key={tmpl.id}
                  template={tmpl}
                  selected={activeId}
                  onClick={() => handleSelect(tmpl.id)}
                />
              ))}
            </div>
            {/* ATS score indicator */}
            <div style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
            }}>
              <div style={{ fontSize: 9.5, color: "#475569", marginBottom: 5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                ATS Score
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #10b981, #00d4ff)" }}
                    animate={{ width: `${getTemplate(activeId).atsScore}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>
                  {getTemplate(activeId).atsScore}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{
          height: 50,
          background: "rgba(10,14,31,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          flexShrink: 0,
        }}>
          {/* Sidebar toggle */}
          {!compact && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 7,
                padding: "5px 8px",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
              }}
            >
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </motion.button>
          )}

          {/* Template name chip */}
          <div style={{
            fontSize: 11.5, fontWeight: 600,
            color: "#94a3b8",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "4px 10px",
            borderRadius: 6,
          }}>
            {getTemplate(activeId).name}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => setZoom(ZOOM_STEPS[Math.max(0, zoomIdx - 1)])}
              disabled={zoomIdx === 0}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 5, padding: "3px 7px", cursor: "pointer",
                color: zoomIdx === 0 ? "#334155" : "#64748b", fontSize: 12, fontWeight: 600,
              }}
            >−</button>
            <span style={{ fontSize: 11, color: "#475569", minWidth: 38, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, zoomIdx + 1)])}
              disabled={zoomIdx === ZOOM_STEPS.length - 1}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 5, padding: "3px 7px", cursor: "pointer",
                color: zoomIdx === ZOOM_STEPS.length - 1 ? "#334155" : "#64748b", fontSize: 12, fontWeight: 600,
              }}
            >+</button>
          </div>

          {/* Export button */}
          <ExportButton onExport={handleExport} exporting={exporting} done={exportDone} />
        </div>

        {/* Scrollable preview canvas */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "28px 24px",
            background: "#0d1020",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* A4 paper shadow wrapper */}
          <div
            style={{
              width: 794,            // A4 px at 96dpi
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              flexShrink: 0,
              marginBottom: `calc(${(zoom - 1) * 100}% - ${(1 - zoom) * 500}px)`, // compensate scale shrink
            }}
          >
            <div
              style={{
                boxShadow: "0 8px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)",
                borderRadius: 4,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {/* This div is what we screenshot for PDF */}
              <div
                ref={previewRef}
                style={{
                  width: 794,
                  minHeight: 1123,    // A4 height at 96dpi
                  background: "#fff",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <TemplateComponent resumeData={resumeData} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
