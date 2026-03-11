# ResumeForge — Free Resume Template Marketplace & Builder

A complete, free-to-use resume platform where users can browse premium templates, preview them in full detail, and build professional resumes — all in the browser with zero sign-up.

🔗 **Live**: [View on GitHub Pages](https://anikettt21.github.io/potential-fiesta/)

---

## ✨ What It Does

### 1. Browse Templates
Land on a clean, minimal marketplace showcasing **8 professionally designed** resume templates. Each card renders a live CSS-powered mini-preview with real sample data — no screenshots, no placeholders.

### 2. Preview & Compare
Click any template to open a full-size preview modal. Compare designs side-by-side using category filters (Professional, Creative, Modern, Minimal) or search by keyword.

### 3. Build Your Resume
Select a template and jump straight into a **7-step guided builder**:
1. **Personal Info** — Name, title, contact details, links
2. **Summary** — Professional summary with character counter
3. **Work Experience** — Multiple entries with bullet-point formatting
4. **Projects** — Project showcase with tech stack tags and live URLs
5. **Education** — Degrees, institutions, GPA
6. **Skills** — Technical skills, tools, and soft skills with tag previews
7. **Extras** — Certifications, awards, volunteer work

### 4. Export to PDF
One-click PDF export via the browser's print dialog. The print stylesheet strips all UI chrome and outputs a clean A4 document — works across Chrome, Firefox, Safari, and Edge.

---

## 🎨 8 Resume Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Classic Professional** | Blue accents, clean layout | Corporate, traditional roles |
| **Modern Minimal** | Teal/emerald, contemporary | Tech, startups, marketing |
| **Executive Suite** | Dark navy header, gold accents, serif | Senior leadership, C-suite |
| **Creative Impact** | Purple-pink gradient, bold typography | Designers, artists, creatives |
| **Dev Terminal** | Green monospace, code-inspired | Developers, engineers |
| **Elegant Serif** | Burgundy, Playfair Display, centered | Academics, consultants |
| **Clean Slate** | Pure black & white, maximum whitespace | Minimalists, any role |
| **Bold Statement** | Coral-orange gradient header | Sales, entrepreneurship |

---

## 🛠️ Key Features

- **Live Preview** — See your resume update in real-time as you type
- **Auto-Save** — Progress saves to localStorage automatically; never lose your work
- **Profile Photo Editor** — Upload, crop, zoom, rotate, flip, and adjust brightness — all in-browser with canvas
- **Demo Profile Photo** — Placeholder photo shown by default; automatically hidden from PDF if not replaced
- **Dark/Light Mode** — Toggle theme in the builder
- **Mobile Responsive** — Full builder experience on phones with swipeable form/preview tabs
- **ATS-Friendly Output** — Clean HTML structure ensures compatibility with applicant tracking systems
- **No Backend Required** — 100% client-side; works from a static file server or GitHub Pages

---

## 📦 Project Structure

```
├── index.html       # Marketplace landing page (template browsing & preview)
├── style.css        # Marketplace styles (minimal light theme)
├── script.js        # Marketplace logic (cards, filters, search, modal)
├── builder.html     # Resume builder (7-step wizard + live preview)
├── builder.css      # Builder styles (form, preview, photo editor, print, 8 template themes)
├── builder.js       # Builder logic (wizard, repeatable entries, auto-save, PDF, photo editor)
├── demo-photo.png   # Default profile photo placeholder
└── README.md        # This file
```

---

## ⚡ How to Use

### Option 1 — Direct (No Setup)
Open `index.html` in any modern browser. That's it. No build tools, no dependencies, no server.

### Option 2 — Local Server
```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

### Option 3 — GitHub Pages
Fork → Settings → Pages → Deploy from `main` branch → Your site is live.

---

## 🔄 User Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Landing Page   │────▶│  Preview Modal    │────▶│   Builder       │
│                  │     │                  │     │                 │
│  • Browse 8      │     │  • Full-size     │     │  • 7-step form  │
│    templates     │     │    template view │     │  • Live preview │
│  • Filter/search │     │  • "Use This     │     │  • Photo editor │
│  • Category tabs │     │    Template" CTA │     │  • Auto-save    │
│                  │     │                  │     │  • Export PDF    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 🧰 Technology

| Layer | Tech |
|-------|------|
| **Structure** | Semantic HTML5 |
| **Styling** | Vanilla CSS3 with custom properties |
| **Logic** | ES6+ JavaScript (zero dependencies) |
| **Fonts** | Inter, Space Grotesk, Playfair Display, JetBrains Mono |
| **Icons** | Inline SVG (no external libraries) |
| **Storage** | localStorage (auto-save) |
| **Photo Editing** | Canvas 2D API |
| **PDF Export** | Browser print with custom `@media print` stylesheet |

---

## 📱 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |
| Mobile Chrome/Safari | ✅ |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built by [Aniket Gade](https://github.com/anikettt21)** · Pune, India