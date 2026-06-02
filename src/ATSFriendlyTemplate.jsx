// ATSFriendlyTemplate.jsx – Clean single-column, zero-frills, ATS-optimized
import React from "react";

const ACCENT = "#1d4ed8";

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fff",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    color: "#111",
    fontSize: 12,
    lineHeight: 1.6,
    padding: "40px 48px",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 2px",
    letterSpacing: "-0.3px",
  },
  title: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: 600,
    margin: "0 0 8px",
  },
  contactRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 16px",
    fontSize: 11.5,
    color: "#444",
  },
  divider: {
    height: 2,
    background: ACCENT,
    margin: "16px 0 14px",
  },
  thinDivider: {
    height: 1,
    background: "#e5e7eb",
    margin: "14px 0 12px",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: ACCENT,
    marginBottom: 10,
    marginTop: 18,
  },
  summary: {
    fontSize: 12,
    color: "#222",
    lineHeight: 1.7,
  },
  expRow: {
    marginBottom: 13,
  },
  expTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expTitle: {
    fontWeight: 700,
    fontSize: 12.5,
    color: "#111",
  },
  expDate: {
    fontSize: 11.5,
    color: "#555",
    whiteSpace: "nowrap",
    marginLeft: 10,
  },
  expCompany: {
    fontSize: 12,
    color: "#444",
    marginBottom: 3,
  },
  expDesc: {
    fontSize: 12,
    color: "#333",
    whiteSpace: "pre-line",
    lineHeight: 1.65,
  },
  skillsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 0",
  },
  skillCatRow: {
    display: "flex",
    gap: 8,
    marginBottom: 5,
    width: "100%",
    alignItems: "flex-start",
  },
  skillCatLabel: {
    fontWeight: 700,
    fontSize: 11.5,
    color: "#111",
    minWidth: 120,
    flexShrink: 0,
  },
  skillCatVal: {
    fontSize: 11.5,
    color: "#333",
    lineHeight: 1.5,
  },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

export default function ATSFriendlyTemplate({ resumeData }) {
  const { personal = {}, experience = [], education = [], skills = [] } = resumeData || {};
  const name = [personal.firstName, personal.lastName].filter(Boolean).join(" ") || "Your Name";
  const contacts = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

  const skillGroups = SKILL_CATEGORIES.reduce((acc, cat) => {
    const s = skills.filter((sk) => sk.category === cat);
    if (s.length) acc[cat] = s;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.name}>{name}</h1>
        {personal.title && <p style={S.title}>{personal.title}</p>}
        <div style={S.contactRow}>
          {contacts.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>

      <div style={S.divider} />

      {/* Summary */}
      {personal.summary && (
        <>
          <div style={S.sectionTitle}>Professional Summary</div>
          <p style={S.summary}>{personal.summary}</p>
          <div style={S.thinDivider} />
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <div style={S.sectionTitle}>Work Experience</div>
          {experience.map((exp, i) => (
            <div key={exp.id} style={S.expRow}>
              <div style={S.expTop}>
                <div style={S.expTitle}>{exp.title || "Job Title"}</div>
                <div style={S.expDate}>
                  {exp.startDate}{(exp.startDate || exp.endDate) ? " – " : ""}
                  {exp.current ? "Present" : exp.endDate}
                </div>
              </div>
              <div style={S.expCompany}>
                {exp.company}{exp.location ? ` | ${exp.location}` : ""}
              </div>
              {exp.description && (
                <div style={S.expDesc}>{exp.description}</div>
              )}
            </div>
          ))}
          <div style={S.thinDivider} />
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <div style={S.sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ ...S.expRow }}>
              <div style={S.expTop}>
                <div style={S.expTitle}>{edu.degree || "Degree"}</div>
                <div style={S.expDate}>
                  {edu.startDate}{(edu.startDate || edu.endDate) ? " – " : ""}{edu.endDate}
                </div>
              </div>
              <div style={S.expCompany}>
                {edu.school}{edu.location ? ` | ${edu.location}` : ""}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
              </div>
              {edu.description && <div style={S.expDesc}>{edu.description}</div>}
            </div>
          ))}
          <div style={S.thinDivider} />
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <div style={S.sectionTitle}>Skills</div>
          <div style={S.skillsGrid}>
            {Object.entries(skillGroups).map(([cat, items]) => (
              <div key={cat} style={S.skillCatRow}>
                <span style={S.skillCatLabel}>{cat}:</span>
                <span style={S.skillCatVal}>{items.map((s) => s.name).join(" · ")}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
