// templateRegistry.js – Central source of truth for all resume templates
import ClassicTemplate     from "./ClassicTemplate";
import ModernTemplate      from "./ModernTemplate";
import ATSFriendlyTemplate from "./ATSFriendlyTemplate";
import CreativeTemplate    from "./CreativeTemplate";
import MinimalTemplate     from "./MinimalTemplate";
import DivyaTemplate       from "./DivyaTemplate";

/**
 * Each entry describes a template available in CVMint.
 * Add new templates here — the UI auto-discovers them.
 */
export const TEMPLATE_REGISTRY = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless serif layout. Trusted by executives & academics.",
    component: ClassicTemplate,
    thumbnail: {
      accent: "#b8860b",
      accentB: "#1a1a2e",
      style: "serif",
    },
    atsScore: 88,
    tags: ["professional", "traditional", "serif"],
    premium: false,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Two-column sidebar with dark panel. Perfect for tech roles.",
    component: ModernTemplate,
    thumbnail: {
      accent: "#6366f1",
      accentB: "#0f172a",
      style: "split",
    },
    atsScore: 91,
    tags: ["tech", "sidebar", "dark"],
    premium: false,
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Single-column, parser-safe layout. Maximum recruiter reach.",
    component: ATSFriendlyTemplate,
    thumbnail: {
      accent: "#1d4ed8",
      accentB: "#e5e7eb",
      style: "minimal",
    },
    atsScore: 99,
    tags: ["ats", "clean", "simple"],
    premium: false,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Editorial bold design. Stand out in creative industries.",
    component: CreativeTemplate,
    thumbnail: {
      accent: "#f97316",
      accentB: "#6366f1",
      style: "bold",
    },
    atsScore: 82,
    tags: ["design", "bold", "creative"],
    premium: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Swiss-grid typographic hierarchy. Quiet confidence.",
    component: MinimalTemplate,
    thumbnail: {
      accent: "#111",
      accentB: "#999",
      style: "swiss",
    },
    atsScore: 95,
    tags: ["minimal", "swiss", "clean"],
    premium: false,
  },
  {
    id: "divya",
    name: "Sharp",
    description: "Clean single-column with bold underlined sections. Project-forward layout ideal for developers.",
    component: DivyaTemplate,
    thumbnail: {
      accent: "#1a1a2e",
      accentB: "#1a1a2e",
      style: "serif",
    },
    atsScore: 97,
    tags: ["developer", "clean", "projects", "ats"],
    premium: false,
  },
];

/** Look up a template entry by id. Falls back to Classic. */
export function getTemplate(id) {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) ?? TEMPLATE_REGISTRY[0];
}