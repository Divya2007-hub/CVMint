// ResumeExporter.jsx
import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ── Minimal resume renderer (mirrors ResumePreviewDoc in ResumeBuilder) ────────
// Renders full resume from Firestore data shape
function ResumeDocument({ resume }) {
  const personal = resume.personal || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  const name = [personal.firstName, personal.lastName].filter(Boolean).join(" ")
    || resume.title
    || "Resume";

  const contacts = [
    personal.email, personal.phone, personal.location, personal.website,
  ].filter(Boolean);

  const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];
  const skillGroups = SKILL_CATEGORIES.reduce((acc, cat) => {
    const s = skills.filter(sk => sk.category === cat);
    if (s.length) acc[cat] = s;
    return acc;
  }, {});

  return (
    <div
      id="resume-export-target"
      style={{
        width: 794,           // A4 width at 96dpi
        minHeight: 1123,      // A4 height at 96dpi
        background: "#fff",
        padding: "48px 52px",
        color: "#1e293b",
        fontFamily: "'Georgia', serif",
        fontSize: 13,
        lineHeight: 1.6,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 18, borderBottom: "2px solid #1e293b" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "#0f172a", fontFamily: "'Georgia', serif" }}>
          {name}
        </h1>
        {personal.title && (
          <p style={{ fontSize: 14, color: "#6366f1", fontWeight: 600, margin: "0 0 8px", fontFamily: "sans-serif" }}>
            {personal.title}
          </p>
        )}
        {contacts.length > 0 && (
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontFamily: "sans-serif" }}>
            {contacts.join("  •  ")}
          </p>
        )}
      </div>

      {/* Summary */}
      {personal.summary && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={sectionHeadStyle}>Summary</h2>
          <p style={{ margin: 0, color: "#334155", lineHeight: 1.7 }}>{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={sectionHeadStyle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={exp.id || i} style={{ marginBottom: i < experience.length - 1 ? 14 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 14, color: "#0f172a" }}>{exp.title || "Job Title"}</p>
                  <p style={{ margin: "2px 0 0", color: "#475569", fontSize: 13, fontFamily: "sans-serif" }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "sans-serif", whiteSpace: "nowrap", marginLeft: 16 }}>
                  {exp.startDate}{(exp.startDate || exp.endDate) && " — "}{exp.current ? "Present" : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <div style={{ marginTop: 6, color: "#334155", whiteSpace: "pre-line", fontSize: 13 }}>
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={sectionHeadStyle}>Education</h2>
          {education.map((edu, i) => (
            <div key={edu.id || i} style={{ marginBottom: i < education.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 14, color: "#0f172a" }}>{edu.degree || "Degree"}</p>
                  <p style={{ margin: "2px 0 0", color: "#475569", fontSize: 13, fontFamily: "sans-serif" }}>
                    {edu.school}{edu.location ? ` · ${edu.location}` : ""}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "sans-serif", whiteSpace: "nowrap", marginLeft: 16 }}>
                  {edu.startDate}{(edu.startDate || edu.endDate) && " — "}{edu.endDate}
                </p>
              </div>
              {edu.description && (
                <p style={{ marginTop: 4, color: "#334155", fontSize: 13 }}>{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 style={sectionHeadStyle}>Skills</h2>
          {Object.entries(skillGroups).map(([cat, catSkills]) => (
            <div key={cat} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", fontFamily: "sans-serif", minWidth: 120 }}>
                {cat}:
              </span>
              <span style={{ color: "#334155", fontSize: 13 }}>
                {catSkills.map(s => s.name).join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sectionHeadStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#6366f1",
  marginBottom: 10,
  fontFamily: "sans-serif",
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: 4,
};

// ── Hook: useResumeExport ──────────────────────────────────────────────────────
export function useResumeExport() {
  const [exporting, setExporting] = useState(null); // holds resume id while exporting
  const [pendingResume, setPendingResume] = useState(null);
  const resolveRef = useRef(null);

  const exportResume = useCallback((resume) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPendingResume(resume);
      setExporting(resume.id);
    });
  }, []);

  const handleRendered = useCallback(async () => {
    const el = document.getElementById("resume-export-target");
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pageWidth / (imgWidth / 2); // divide by scale factor
      const scaledHeight = (imgHeight / 2) * ratio;

      // Multi-page support
      if (scaledHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, scaledHeight);
      } else {
        let yOffset = 0;
        let remainingHeight = scaledHeight;
        let pageIndex = 0;

        while (remainingHeight > 0) {
          if (pageIndex > 0) pdf.addPage();
          const sliceHeight = Math.min(pageHeight, remainingHeight);
          pdf.addImage(
            imgData,
            "PNG",
            0,
            -yOffset,
            pageWidth,
            scaledHeight
          );
          yOffset += pageHeight;
          remainingHeight -= sliceHeight;
          pageIndex++;
        }
      }

      const filename = `${(pendingResume?.title || "resume").replace(/\s+/g, "_")}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setPendingResume(null);
      setExporting(null);
      resolveRef.current?.();
      resolveRef.current = null;
    }
  }, [pendingResume]);

  // Portal: renders hidden resume off-screen, triggers export once mounted
  const ExportPortal = useCallback(() => {
    if (!pendingResume) return null;

    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <ResumeDocumentWithCallback
          resume={pendingResume}
          onReady={handleRendered}
        />
      </div>,
      document.body
    );
  }, [pendingResume, handleRendered]);

  return { exportResume, exporting, ExportPortal };
}

// Renders the doc and fires onReady after mount
function ResumeDocumentWithCallback({ resume, onReady }) {
  const fired = useRef(false);

  // useEffect isn't available here so we use a ref trick with a tiny timeout
  const ref = useCallback((node) => {
    if (node && !fired.current) {
      fired.current = true;
      // Give browser a frame to paint before capturing
      setTimeout(onReady, 100);
    }
  }, [onReady]);

  return (
    <div ref={ref}>
      <ResumeDocument resume={resume} />
    </div>
  );
}