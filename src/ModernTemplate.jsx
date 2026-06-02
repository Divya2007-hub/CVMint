// ModernTemplate.jsx – Two-column sidebar layout, slate sidebar + white main
import React from "react";

const ACCENT = "#6366f1";
const SIDEBAR_BG = "#0f172a";
const SIDEBAR_TEXT = "#e2e8f0";
const SIDEBAR_MUTED = "#94a3b8";

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 12.5,
    lineHeight: 1.55,
    background: "#fff",
    boxSizing: "border-box",
  },
  sidebar: {
    width: "32%",
    minWidth: 180,
    background: SIDEBAR_BG,
    color: SIDEBAR_TEXT,
    padding: "36px 22px",
    flexShrink: 0,
    boxSizing: "border-box",
  },
  main: {
    flex: 1,
    padding: "36px 30px",
    background: "#fff",
    color: "#1e293b",
    boxSizing: "border-box",
    overflowWrap: "break-word",
  },
  initials: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 14,
    letterSpacing: 1,
  },
  sidebarName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: 3,
  },
  sidebarTitle: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  sidebarSection: {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: ACCENT,
    marginTop: 22,
    marginBottom: 10,
    borderBottom: `1px solid ${ACCENT}44`,
    paddingBottom: 4,
  },
  contactItem: {
    fontSize: 11,
    color: SIDEBAR_MUTED,
    marginBottom: 5,
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    wordBreak: "break-all",
  },
  skillPill: {
    display: "inline-block",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.35)",
    color: "#a5b4fc",
    fontSize: 10.5,
    fontWeight: 600,
    padding: "3px 9px",
    borderRadius: 99,
    marginRight: 5,
    marginBottom: 5,
  },
  mainSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: ACCENT,
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: 4,
    marginTop: 22,
    marginBottom: 14,
  },
  expItem: { marginBottom: 14 },
  expHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expTitle: { fontWeight: 700, fontSize: 13, color: "#0f172a" },
  expSub: { fontSize: 11.5, color: "#64748b" },
  expDate: {
    fontSize: 10.5,
    color: "#6366f1",
    fontWeight: 600,
    whiteSpace: "nowrap",
    marginLeft: 10,
    background: "rgba(99,102,241,0.08)",
    padding: "2px 7px",
    borderRadius: 4,
  },
  expDesc: {
    fontSize: 11.5,
    color: "#374151",
    whiteSpace: "pre-line",
    marginTop: 5,
    lineHeight: 1.65,
  },
  summary: { fontSize: 12.5, color: "#334155", lineHeight: 1.7 },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

export default function ModernTemplate({ resumeData }) {
  const { personal = {}, experience = [], education = [], skills = [] } = resumeData || {};
  const firstName = personal.firstName || "Your";
  const lastName = personal.lastName || "Name";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  const contacts = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

  const skillGroups = SKILL_CATEGORIES.reduce((acc, cat) => {
    const s = skills.filter((sk) => sk.category === cat);
    if (s.length) acc[cat] = s;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      {/* ── Sidebar ── */}
      <div style={S.sidebar}>
        <div style={S.initials}>{initials}</div>
        <div style={S.sidebarName}>{firstName}<br />{lastName}</div>
        {personal.title && <div style={S.sidebarTitle}>{personal.title}</div>}

        {contacts.length > 0 && (
          <>
            <div style={S.sidebarSection}>Contact</div>
            {contacts.map((c, i) => (
              <div key={i} style={S.contactItem}>
                <span>›</span><span>{c}</span>
              </div>
            ))}
          </>
        )}

        {skills.length > 0 && (
          <>
            <div style={S.sidebarSection}>Skills</div>
            {Object.entries(skillGroups).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{cat}</div>
                <div>
                  {items.map((sk) => (
                    <span key={sk.id} style={S.skillPill}>{sk.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {education.length > 0 && (
          <>
            <div style={S.sidebarSection}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{edu.degree}</div>
                <div style={{ fontSize: 11, color: SIDEBAR_MUTED }}>{edu.school}</div>
                {edu.location && <div style={{ fontSize: 10.5, color: "#64748b" }}>{edu.location}</div>}
                {(edu.startDate || edu.endDate) && (
                  <div style={{ fontSize: 10.5, color: "#475569" }}>
                    {edu.startDate}{edu.startDate && edu.endDate ? " – " : ""}{edu.endDate}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Main ── */}
      <div style={S.main}>
        {personal.summary && (
          <>
            <div style={S.mainSectionTitle}>About Me</div>
            <p style={S.summary}>{personal.summary}</p>
          </>
        )}

        {experience.length > 0 && (
          <>
            <div style={S.mainSectionTitle}>Experience</div>
            {experience.map((exp) => (
              <div key={exp.id} style={S.expItem}>
                <div style={S.expHeader}>
                  <div>
                    <div style={S.expTitle}>{exp.title || "Job Title"}</div>
                    <div style={S.expSub}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </div>
                  </div>
                  <div style={S.expDate}>
                    {exp.startDate}{(exp.startDate || exp.endDate) ? " – " : ""}
                    {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
                {exp.description && <div style={S.expDesc}>{exp.description}</div>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
