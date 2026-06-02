// MinimalTemplate.jsx – Swiss-grid inspired, typographic hierarchy, stark whitespace
import React from "react";

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: "#111",
    fontSize: 12,
    lineHeight: 1.6,
    padding: "44px 50px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "3px solid #111",
  },
  nameBlock: {},
  name: {
    fontSize: 36,
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-1.5px",
    lineHeight: 1,
    margin: "0 0 6px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 12,
    fontWeight: 400,
    color: "#666",
    letterSpacing: "0.06em",
    margin: 0,
    textTransform: "uppercase",
  },
  contactBlock: {
    textAlign: "right",
    fontSize: 11,
    color: "#444",
    lineHeight: 1.9,
  },
  row: {
    display: "flex",
    gap: 0,
    marginBottom: 20,
  },
  labelCol: {
    width: 130,
    flexShrink: 0,
    paddingTop: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#999",
    lineHeight: 1,
  },
  valueCol: {
    flex: 1,
    borderLeft: "1.5px solid #e5e7eb",
    paddingLeft: 20,
  },
  summary: {
    fontSize: 12.5,
    color: "#222",
    lineHeight: 1.8,
    margin: 0,
  },
  expItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "1px solid #f0f0f0",
  },
  expItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottom: "none",
  },
  expTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: "#111",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  expDate: {
    fontWeight: 400,
    fontSize: 10.5,
    color: "#999",
    letterSpacing: "0.04em",
  },
  expSub: {
    fontSize: 11.5,
    color: "#666",
    marginBottom: 4,
  },
  expDesc: {
    fontSize: 11.5,
    color: "#333",
    whiteSpace: "pre-line",
    lineHeight: 1.65,
    marginTop: 4,
  },
  skillsBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  skillRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },
  skillCat: {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#aaa",
    minWidth: 90,
    flexShrink: 0,
  },
  skillDots: {
    display: "flex",
    flexWrap: "wrap",
    gap: "3px 8px",
  },
  skillName: {
    fontSize: 11.5,
    color: "#222",
    fontWeight: 500,
  },
  eduItem: {
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eduLeft: {},
  eduDegree: { fontWeight: 700, fontSize: 12.5, color: "#111" },
  eduMeta: { fontSize: 11, color: "#666" },
  eduDate: { fontSize: 10.5, color: "#999", whiteSpace: "nowrap", marginLeft: 10 },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];

function Row({ label, children }) {
  return (
    <div style={S.row}>
      <div style={S.labelCol}>
        <div style={S.label}>{label}</div>
      </div>
      <div style={S.valueCol}>{children}</div>
    </div>
  );
}

export default function MinimalTemplate({ resumeData }) {
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
        <div style={S.nameBlock}>
          <h1 style={S.name}>{name}</h1>
          {personal.title && <p style={S.title}>{personal.title}</p>}
        </div>
        {contacts.length > 0 && (
          <div style={S.contactBlock}>
            {contacts.map((c, i) => (
              <div key={i}>{c}</div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {personal.summary && (
        <Row label="Profile">
          <p style={S.summary}>{personal.summary}</p>
        </Row>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Row label="Experience">
          {experience.map((exp, i) => (
            <div
              key={exp.id}
              style={i === experience.length - 1 ? S.expItemLast : S.expItem}
            >
              <div style={S.expTitle}>
                <span>{exp.title || "Job Title"}</span>
                <span style={S.expDate}>
                  {exp.startDate}{(exp.startDate || exp.endDate) ? " – " : ""}
                  {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <div style={S.expSub}>
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </div>
              {exp.description && <div style={S.expDesc}>{exp.description}</div>}
            </div>
          ))}
        </Row>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Row label="Education">
          {education.map((edu) => (
            <div key={edu.id} style={S.eduItem}>
              <div style={S.eduLeft}>
                <div style={S.eduDegree}>{edu.degree || "Degree"}</div>
                <div style={S.eduMeta}>
                  {edu.school}{edu.location ? ` · ${edu.location}` : ""}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                </div>
                {edu.description && (
                  <div style={{ ...S.expDesc, marginTop: 2 }}>{edu.description}</div>
                )}
              </div>
              <div style={S.eduDate}>
                {edu.startDate}{(edu.startDate || edu.endDate) ? " – " : ""}{edu.endDate}
              </div>
            </div>
          ))}
        </Row>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Row label="Skills">
          <div style={S.skillsBlock}>
            {Object.entries(skillGroups).map(([cat, items]) => (
              <div key={cat} style={S.skillRow}>
                <span style={S.skillCat}>{cat}</span>
                <div style={S.skillDots}>
                  {items.map((sk, i) => (
                    <span key={sk.id} style={S.skillName}>
                      {sk.name}{i < items.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Row>
      )}
    </div>
  );
}
