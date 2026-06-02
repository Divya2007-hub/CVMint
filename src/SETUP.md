# CVMint Template System – Setup Guide

## 1. Install PDF export dependencies

```bash
npm install html2canvas jspdf
```

These are imported **dynamically inside `ResumeRenderer.jsx`** (only loaded when the user
clicks "Export PDF"), so they don't bloat the initial bundle.

---

## 2. File placement

Copy every file into your `src/` folder (same directory as `main.jsx`):

| File | Purpose |
|------|---------|
| `ClassicTemplate.jsx`    | Timeless serif layout |
| `ModernTemplate.jsx`     | Two-column sidebar |
| `ATSFriendlyTemplate.jsx`| ATS-safe single column |
| `CreativeTemplate.jsx`   | Editorial bold design |
| `MinimalTemplate.jsx`    | Swiss-grid typography |
| `templateRegistry.js`    | Central template map + helpers |
| `ResumeRenderer.jsx`     | Live preview + template picker + PDF export |
| `TemplatesPage.jsx`      | Dashboard templates gallery |
| `ResumeBuilder.jsx`      | Updated builder (replaces original) |
| `Dashboard.jsx`          | Updated dashboard (replaces original) |

---

## 3. What changed

### `ResumeBuilder.jsx`
- Added **Step 5 – Template** (visual template picker grid)
- **Step 6 – Preview** now renders the real `ResumeRenderer` (live, zoomable, exportable)
- Accepts `initialTemplateId` prop so Dashboard can pre-select a template
- Modal widens automatically on the preview step

### `Dashboard.jsx`
- `templates` route now renders `<TemplatesPage>` (was a placeholder)
- `onSelectTemplate(id)` callback opens the builder with that template pre-selected
- `builderTemplate` state threaded through to `<ResumeBuilder initialTemplateId={…}>`

---

## 4. Adding new templates

1. Create `MyTemplate.jsx` that accepts `{ resumeData }` and returns a styled div
2. Add an entry to `TEMPLATE_REGISTRY` in `templateRegistry.js`
3. Done — the gallery, picker, and renderer auto-discover it

---

## 5. Architecture overview

```
templateRegistry.js          ← single source of truth
      │
      ├── ClassicTemplate.jsx
      ├── ModernTemplate.jsx
      ├── ATSFriendlyTemplate.jsx
      ├── CreativeTemplate.jsx
      └── MinimalTemplate.jsx

ResumeRenderer.jsx           ← renders any template + handles PDF export
      │
      ├── used inside ResumeBuilder (Step 6 – Preview)
      └── used inside TemplatesPage (PreviewModal)

TemplatesPage.jsx            ← gallery + filter + preview modal
Dashboard.jsx                ← routes templates → TemplatesPage
ResumeBuilder.jsx            ← 6-step wizard with template step + live preview
```

---

## 6. PDF export – how it works

`ResumeRenderer` dynamically imports `html2canvas` + `jsPDF` only when the user
clicks "Export PDF". It:

1. Screenshots the 794px-wide A4 preview div at 2.5× scale (retina-crisp)
2. Fits the image into A4 pages, adding extra pages if content overflows
3. Saves `cvmint-resume.pdf`

No server-side rendering required — fully browser-based.
