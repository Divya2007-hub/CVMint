// DivyaTemplate.jsx – Clean single-column, project-forward, bold section headers
// Inspired by a real resume layout — no personal data included
import React from "react";

const ACCENT = "#1a1a2e";   // near-black headers
const LINK   = "#1d4ed8";   // blue for links/highlights

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fff",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    color: "#111",
    fontSize: 12,
    lineHeight: 1.55,
    padding: "36px 48px",
    boxSizing: "border-box",
  },

  // ── Header ──
  header: {
    textAlign: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    color: ACCENT,
    margin: "0 0 5px",
    letterSpacing: "0.01em",
  },
  contactRow: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "3px 10px",
    fontSize: 11,
    color: "#333",
  },
  contactSep: {
    color: "#999",
  },

  // ── Section ──
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: ACCENT,
    borderBottom: "1.5px solid #111",
    paddingBottom: 2,
    marginBottom: 8,
  },

  // ── Education ──
  eduRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  eduLeft: { flex: 1 },
  eduSchool: { fontWeight: 700, fontSize: 12, color: "#111" },
  eduDegree: { fontSize: 11.5, color: "#222", marginTop: 1 },
  eduLocation: { fontSize: 11, color: "#555" },
  eduDate: {
    fontSize: 11,
    color: "#444",
    whiteSpace: "nowrap",
    marginLeft: 12,
    textAlign: "right",
  },
  coursework: {
    fontSize: 11,
    color: "#333",
    marginTop: 4,
    lineHeight: 1.5,
  },

  // ── Skills ──
  skillRow: {
    display: "flex",
    gap: 6,
    marginBottom: 4,
    fontSize: 11.5,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  skillLabel: {
    fontWeight: 700,
    color: "#111",
    minWidth: 110,
    flexShrink: 0,
  },
  skillVal: { color: "#222" },

  // ── Projects ──
  projectItem: { marginBottom: 11 },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 4,
  },
  projectTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: "#111",
  },
  projectTechDate: {
    fontSize: 11,
    color: "#555",
    fontStyle: "italic",
  },
  projectDate: {
    fontSize: 11,
    color: "#555",
    whiteSpace: "nowrap",
    marginLeft: 8,
  },
  projectDesc: {
    fontSize: 11.5,
    color: "#222",
    whiteSpace: "pre-line",
    marginTop: 3,
    lineHeight: 1.6,
  },

  // ── Experience ──
  expItem: { marginBottom: 11 },
  expHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 2,
  },
  expTitle: { fontWeight: 700, fontSize: 12, color: "#111" },
  expCompany: { fontSize: 11.5, color: "#333" },
  expDate: { fontSize: 11, color: "#555", whiteSpace: "nowrap", marginLeft: 8 },
  expDesc: {
    fontSize: 11.5,
    color: "#222",
    whiteSpace: "pre-line",
    marginTop: 3,
    lineHeight: 1.6,
  },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

// Map categories to label names matching the resume style
const SKILL_LABELS = {
  "Technical":         "Languages",
  "Languages":         "Frontend",
  "Tools & Platforms": "Tools & Platforms",
  "Soft Skills":       "Concepts",
};

export default function DivyaTemplate({ resumeData }) {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = [],
  } = resumeData || {};

  const name = [personal.firstName, personal.lastName].filter(Boolean).join(" ") || "Your Name";

  // Build contact line segments
  const contacts = [
    personal.location,
    personal.email,
    personal.website,
    personal.phone,
  ].filter(Boolean);

  // Group skills by category
  const skillGroups = SKILL_CATEGORIES.reduce((acc, cat) => {
    const s = skills.filter((sk) => sk.category === cat);
    if (s.length) acc[cat] = s;
    return acc;
  }, {});

  // Split experience into "projects" (entries with no company or tagged as project)
  // and regular experience — we use the same experience array but render projects
  // (entries where company is empty or starts with "#") in the Projects section
  const projects   = experience.filter((e) => !e.company || e.company.startsWith("#"));
  const jobs       = experience.filter((e) =>  e.company && !e.company.startsWith("#"));

  // If user hasn't tagged anything, show all in Experience and nothing in Projects
  const hasProjects = projects.length > 0;

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <h1 style={S.name}>{name}</h1>
        {contacts.length > 0 && (
          <div style={S.contactRow}>
            {contacts.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={S.contactSep}>|</span>}
                <span>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Education ── */}
      {education.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id}>
              <div style={S.eduRow}>
                <div style={S.eduLeft}>
                  <div style={S.eduSchool}>{edu.school || "University"}</div>
                  <div style={S.eduDegree}>{edu.degree || "Degree"}</div>
                  {edu.location && <div style={S.eduLocation}>{edu.location}</div>}
                </div>
                <div style={S.eduDate}>
                  {edu.startDate && edu.endDate
                    ? `${edu.startDate} – ${edu.endDate}`
                    : edu.startDate || edu.endDate || ""}
                </div>
              </div>
              {edu.description && (
                <div style={S.coursework}>– {edu.description}</div>
              )}
              {edu.gpa && (
                <div style={{ ...S.coursework, marginTop: 2 }}>GPA: {edu.gpa}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Technical Skills ── */}
      {skills.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Technical Skills</div>
          {Object.entries(skillGroups).map(([cat, items]) => (
            <div key={cat} style={S.skillRow}>
              <span style={S.skillLabel}>{SKILL_LABELS[cat] || cat}:</span>
              <span style={S.skillVal}>{items.map((s) => s.name).join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Projects (experience entries with no company) ── */}
      {hasProjects && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} style={S.projectItem}>
              <div style={S.projectHeader}>
                <span style={S.projectTitle}>{proj.title || "Project Title"}</span>
                <span style={S.projectTechDate}>
                  {proj.location ? proj.location : ""}
                  {proj.location && (proj.startDate || proj.endDate) ? " | " : ""}
                  {proj.startDate}
                  {proj.startDate && (proj.current || proj.endDate) ? " – " : ""}
                  {proj.current ? "Present" : proj.endDate}
                </span>
              </div>
              {proj.description && (
                <div style={S.projectDesc}>{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Experience ── */}
      {(hasProjects ? jobs : experience).length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Experience</div>
          {(hasProjects ? jobs : experience).map((exp) => (
            <div key={exp.id} style={S.expItem}>
              <div style={S.expHeader}>
                <div>
                  <div style={S.expTitle}>{exp.title || "Job Title"}</div>
                  <div style={S.expCompany}>
                    {exp.company}
                    {exp.location ? ` | ${exp.location}` : ""}
                  </div>
                </div>
                <div style={S.expDate}>
                  {exp.startDate}
                  {(exp.startDate || exp.endDate) ? " – " : ""}
                  {exp.current ? "Present" : exp.endDate}
                </div>
              </div>
              {exp.description && (
                <div style={S.expDesc}>{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Summary (shown last as "Profile" if present) ── */}
      {personal.summary && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Profile</div>
          <p style={{ margin: 0, fontSize: 11.5, color: "#222", lineHeight: 1.65 }}>
            {personal.summary}
          </p>
        </div>
      )}

    </div>
  );
}
