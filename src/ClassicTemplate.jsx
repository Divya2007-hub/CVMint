// ClassicTemplate.jsx – Timeless serif layout, navy + gold accents
import React from "react";

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fff",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#1a1a2e",
    fontSize: 13,
    lineHeight: 1.55,
    boxSizing: "border-box",
    padding: "48px 52px",
  },
  header: {
    textAlign: "center",
    marginBottom: 26,
    paddingBottom: 20,
    borderBottom: "2.5px solid #1a1a2e",
  },
  name: {
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  jobTitle: {
    fontSize: 14,
    color: "#b8860b",
    fontStyle: "italic",
    letterSpacing: "0.04em",
    margin: "0 0 10px",
    fontFamily: "'Georgia', serif",
  },
  contactRow: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "6px 18px",
    fontSize: 11.5,
    color: "#444",
    fontFamily: "'Georgia', serif",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#1a1a2e",
    borderBottom: "1.5px solid #b8860b",
    paddingBottom: 4,
    marginTop: 22,
    marginBottom: 12,
  },
  summary: {
    fontSize: 13,
    color: "#333",
    lineHeight: 1.7,
    fontStyle: "italic",
  },
  expItem: { marginBottom: 14 },
  expHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expTitle: { fontWeight: 700, fontSize: 13.5, color: "#1a1a2e" },
  expCompany: { fontSize: 12.5, color: "#555", fontStyle: "italic" },
  expDate: { fontSize: 11.5, color: "#888", whiteSpace: "nowrap", marginLeft: 12 },
  expDesc: {
    fontSize: 12.5,
    color: "#333",
    whiteSpace: "pre-line",
    marginTop: 4,
    lineHeight: 1.6,
  },
  eduItem: { marginBottom: 12 },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "6px 0" },
  skillCat: {
    display: "flex",
    gap: 8,
    alignItems: "baseline",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  skillCatLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#1a1a2e",
    minWidth: 110,
    fontFamily: "'Georgia', serif",
  },
  skillCatVal: { fontSize: 12.5, color: "#333" },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

export default function ClassicTemplate({ resumeData }) {
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
        {personal.title && <p style={S.jobTitle}>{personal.title}</p>}
        {contacts.length > 0 && (
          <div style={S.contactRow}>
            {contacts.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {personal.summary && (
        <>
          <div style={S.sectionTitle}>Professional Summary</div>
          <p style={S.summary}>{personal.summary}</p>
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <div style={S.sectionTitle}>Professional Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} style={S.expItem}>
              <div style={S.expHeader}>
                <div>
                  <div style={S.expTitle}>{exp.title || "Job Title"}</div>
                  <div style={S.expCompany}>
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </div>
                </div>
                <div style={S.expDate}>
                  {exp.startDate}
                  {(exp.startDate || exp.endDate) && " – "}
                  {exp.current ? "Present" : exp.endDate}
                </div>
              </div>
              {exp.description && <div style={S.expDesc}>{exp.description}</div>}
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <div style={S.sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={S.eduItem}>
              <div style={S.expHeader}>
                <div>
                  <div style={S.expTitle}>{edu.degree || "Degree"}</div>
                  <div style={S.expCompany}>
                    {edu.school}
                    {edu.location ? ` · ${edu.location}` : ""}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </div>
                </div>
                <div style={S.expDate}>
                  {edu.startDate}
                  {(edu.startDate || edu.endDate) && " – "}
                  {edu.endDate}
                </div>
              </div>
              {edu.description && <div style={S.expDesc}>{edu.description}</div>}
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <div style={S.sectionTitle}>Skills</div>
          {Object.entries(skillGroups).map(([cat, items]) => (
            <div key={cat} style={S.skillCat}>
              <span style={S.skillCatLabel}>{cat}:</span>
              <span style={S.skillCatVal}>{items.map((s) => s.name).join(", ")}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
