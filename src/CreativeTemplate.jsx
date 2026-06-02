// CreativeTemplate.jsx – Editorial bold layout with left accent bar + color blocks
import React from "react";

const PRIMARY = "#0d1117";
const ACCENT1 = "#f97316";   // orange
const ACCENT2 = "#6366f1";   // indigo
const MUTED   = "#6b7280";

const S = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fafafa",
    fontFamily: "'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif",
    color: PRIMARY,
    fontSize: 12.5,
    lineHeight: 1.6,
    padding: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  topBand: {
    background: PRIMARY,
    padding: "32px 40px 28px",
    position: "relative",
    overflow: "hidden",
  },
  topBandAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 200,
    height: "100%",
    background: `linear-gradient(135deg, ${ACCENT1}22, ${ACCENT2}33)`,
    pointerEvents: "none",
  },
  nameRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 4,
  },
  firstName: {
    fontSize: 34,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-1px",
    lineHeight: 1,
  },
  lastName: {
    fontSize: 34,
    fontWeight: 200,
    color: ACCENT1,
    letterSpacing: "-1px",
    lineHeight: 1,
  },
  titleBadge: {
    display: "inline-block",
    background: `${ACCENT1}22`,
    border: `1px solid ${ACCENT1}55`,
    color: ACCENT1,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "3px 12px",
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 14,
  },
  contactBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 20px",
    fontSize: 11,
    color: "#94a3b8",
  },
  contactItem: { display: "flex", alignItems: "center", gap: 5 },
  body: {
    flex: 1,
    display: "flex",
    gap: 0,
  },
  leftBar: {
    width: 5,
    background: `linear-gradient(180deg, ${ACCENT1}, ${ACCENT2})`,
    flexShrink: 0,
    borderRadius: "0 0 0 0",
  },
  content: {
    flex: 1,
    padding: "28px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  sectionWrap: {
    marginBottom: 22,
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: "#e5e7eb",
  },
  summary: {
    fontSize: 12.5,
    color: "#374151",
    lineHeight: 1.75,
    borderLeft: `3px solid ${ACCENT1}`,
    paddingLeft: 14,
    fontStyle: "italic",
  },
  expGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  expCard: {
    background: "#fff",
    borderRadius: 6,
    padding: "12px 14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    borderLeft: `3px solid ${ACCENT2}`,
  },
  expTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expTitle: {
    fontWeight: 800,
    fontSize: 13,
    color: PRIMARY,
  },
  expMeta: {
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  expDateChip: {
    fontSize: 10,
    fontWeight: 700,
    color: ACCENT2,
    background: `${ACCENT2}14`,
    border: `1px solid ${ACCENT2}30`,
    padding: "2px 8px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    marginLeft: 10,
  },
  expDesc: {
    fontSize: 11.5,
    color: "#4b5563",
    whiteSpace: "pre-line",
    marginTop: 6,
    lineHeight: 1.65,
  },
  eduCard: {
    background: "#fff",
    borderRadius: 6,
    padding: "10px 14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    borderLeft: `3px solid ${ACCENT1}`,
    marginBottom: 10,
  },
  skillsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  skillGroup: {
    background: "#fff",
    borderRadius: 6,
    padding: "8px 12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flex: "1 1 180px",
  },
  skillGroupTitle: {
    fontSize: 9.5,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: ACCENT1,
    marginBottom: 6,
  },
  skillPills: { display: "flex", flexWrap: "wrap", gap: "4px" },
  skillPill: {
    fontSize: 10.5,
    fontWeight: 600,
    color: ACCENT2,
    background: `${ACCENT2}10`,
    border: `1px solid ${ACCENT2}25`,
    padding: "2px 8px",
    borderRadius: 99,
  },
};

const SKILL_CATEGORIES = ["Technical", "Languages", "Tools & Platforms", "Soft Skills"];
const SECTION_COLORS = [ACCENT1, ACCENT2, "#10b981", "#f59e0b"];

function SectionHeader({ label, color, index }) {
  return (
    <div style={S.sectionHead}>
      <div style={{ ...S.sectionDot, background: color || SECTION_COLORS[index % 4] }} />
      <div style={{ ...S.sectionLabel, color: color || SECTION_COLORS[index % 4] }}>{label}</div>
      <div style={S.sectionLine} />
    </div>
  );
}

export default function CreativeTemplate({ resumeData }) {
  const { personal = {}, experience = [], education = [], skills = [] } = resumeData || {};
  const firstName = personal.firstName || "Your";
  const lastName  = personal.lastName  || "Name";
  const contacts  = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean);

  const skillGroups = SKILL_CATEGORIES.reduce((acc, cat) => {
    const s = skills.filter((sk) => sk.category === cat);
    if (s.length) acc[cat] = s;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      {/* Top Band */}
      <div style={S.topBand}>
        <div style={S.topBandAccent} />
        <div style={S.nameRow}>
          <span style={S.firstName}>{firstName}</span>
          <span style={S.lastName}>{lastName}</span>
        </div>
        {personal.title && <div style={S.titleBadge}>{personal.title}</div>}
        <div style={S.contactBar}>
          {contacts.map((c, i) => (
            <div key={i} style={S.contactItem}>
              <span style={{ color: ACCENT1, fontSize: 9 }}>◆</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>
        <div style={S.leftBar} />
        <div style={S.content}>

          {/* Summary */}
          {personal.summary && (
            <div style={S.sectionWrap}>
              <SectionHeader label="Profile" color={ACCENT1} index={0} />
              <p style={S.summary}>{personal.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={S.sectionWrap}>
              <SectionHeader label="Experience" color={ACCENT2} index={1} />
              <div style={S.expGrid}>
                {experience.map((exp) => (
                  <div key={exp.id} style={S.expCard}>
                    <div style={S.expTop}>
                      <div>
                        <div style={S.expTitle}>{exp.title || "Job Title"}</div>
                        <div style={S.expMeta}>
                          {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                        </div>
                      </div>
                      <div style={S.expDateChip}>
                        {exp.startDate}{(exp.startDate || exp.endDate) ? " – " : ""}
                        {exp.current ? "Present" : exp.endDate}
                      </div>
                    </div>
                    {exp.description && <div style={S.expDesc}>{exp.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={S.sectionWrap}>
              <SectionHeader label="Education" color="#10b981" index={2} />
              {education.map((edu) => (
                <div key={edu.id} style={S.eduCard}>
                  <div style={S.expTop}>
                    <div>
                      <div style={S.expTitle}>{edu.degree || "Degree"}</div>
                      <div style={S.expMeta}>
                        {edu.school}{edu.location ? ` · ${edu.location}` : ""}
                        {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                      </div>
                    </div>
                    <div style={{ ...S.expDateChip, color: "#10b981", background: "#10b98114", border: "1px solid #10b98130" }}>
                      {edu.startDate}{(edu.startDate || edu.endDate) ? " – " : ""}{edu.endDate}
                    </div>
                  </div>
                  {edu.description && <div style={S.expDesc}>{edu.description}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={S.sectionWrap}>
              <SectionHeader label="Skills" color="#f59e0b" index={3} />
              <div style={S.skillsWrap}>
                {Object.entries(skillGroups).map(([cat, items]) => (
                  <div key={cat} style={S.skillGroup}>
                    <div style={S.skillGroupTitle}>{cat}</div>
                    <div style={S.skillPills}>
                      {items.map((sk) => (
                        <span key={sk.id} style={S.skillPill}>{sk.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
