const fs = require('fs');

const TEMPLATE_COLORS = {
    azure: { accent: '#3b82f6', light: '#eff6ff', border: '#bfdbfe', text: '#1e40af', layout: 'sidebar-left' },
    sunset: { accent: '#f59e0b', light: '#fffbeb', border: '#fde68a', text: '#b45309', headerBg: 'linear-gradient(135deg, #f59e0b, #ec4899)', layout: 'centered' },
    nordic: { accent: '#64748b', light: '#f8fafc', border: '#cbd5e1', text: '#334155', layout: 'classic-serif' },
    emerald: { accent: '#059669', light: '#ecfdf5', border: '#a7f3d0', text: '#065f46', layout: 'boxed' },
    midnight: { accent: '#06b6d4', light: '#0f172a', border: '#1e293b', text: '#06b6d4', dark: true, layout: 'centered' },
    coral: { accent: '#f43f5e', light: '#fff1f2', border: '#fecdd3', text: '#be123c', layout: 'timeline' },
    slate: { accent: '#64748b', light: '#f8fafc', border: '#e2e8f0', text: '#475569', layout: 'sidebar-left' },
    lavender: { accent: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', layout: 'classic-serif' },
    ruby: { accent: '#dc2626', light: '#fef2f2', border: '#fecaca', text: '#b91c1c', layout: 'centered' },
    ocean: { accent: '#0284c7', light: '#f0f9ff', border: '#bae6fd', text: '#0369a1', headerBg: 'linear-gradient(135deg, #1e3a5f, #0d9488)', layout: 'sidebar-right' },
    monochrome: { accent: '#1a1a1a', light: '#f5f5f5', border: '#d4d4d4', text: '#262626', layout: 'timeline' },
    amber: { accent: '#d97706', light: '#fffbeb', border: '#fcd34d', text: '#92400e', layout: 'boxed' },
    ivy: { accent: '#166534', light: '#f0fdf4', border: '#86efac', text: '#14532d', layout: 'classic-serif' },
    pastel: { accent: '#ec4899', light: '#fdf2f8', border: '#fbcfe8', text: '#be185d', layout: 'centered' },
    graphite: { accent: '#374151', light: '#f3f4f6', border: '#9ca3af', text: '#1f2937', layout: 'timeline' },
    sakura: { accent: '#f472b6', light: '#fdf2f8', border: '#f9a8d4', text: '#be185d', layout: 'sidebar-left' },
    bronze: { accent: '#a16207', light: '#fefce8', border: '#fde047', text: '#854d0e', layout: 'centered' },
    neon: { accent: '#22c55e', light: '#0a0a0a', border: '#1a1a1a', text: '#22c55e', dark: true, layout: 'timeline' },
    swiss: { accent: '#ef4444', light: '#ffffff', border: '#e5e7eb', text: '#1a1a1a', layout: 'bold' },
    royal: { accent: '#4338ca', light: '#eef2ff', border: '#c7d2fe', text: '#3730a3', headerBg: 'linear-gradient(135deg, #312e81, #1e1b4b)', layout: 'centered' },
    sage: { accent: '#65a30d', light: '#f7fee7', border: '#bef264', text: '#4d7c0f', layout: 'classic-serif' },
    metro: { accent: '#2563eb', light: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', layout: 'timeline' },
    ivory: { accent: '#92400e', light: '#fffbf0', border: '#fbbf24', text: '#78350f', layout: 'classic-serif' },
    pixel: { accent: '#8b5cf6', light: '#faf5ff', border: '#c4b5fd', text: '#7c3aed', layout: 'bold' },
    charcoal: { accent: '#525252', light: '#fafafa', border: '#a3a3a3', text: '#404040', layout: 'boxed' },
    citrus: { accent: '#84cc16', light: '#f7fee7', border: '#a3e635', text: '#4d7c0f', layout: 'sidebar-left' },
    blueprint: { accent: '#2563eb', light: '#eff6ff', border: '#93c5fd', text: '#1e40af', layout: 'timeline' },
    rose: { accent: '#e11d48', light: '#fff1f2', border: '#fda4af', text: '#be123c', layout: 'classic-serif' },
    timber: { accent: '#78350f', light: '#fef3c7', border: '#d97706', text: '#713f12', layout: 'boxed' },
    aurora: { accent: '#7c3aed', light: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9', headerBg: 'linear-gradient(135deg, #7c3aed, #06b6d4)', layout: 'centered' },
    concrete: { accent: '#6b7280', light: '#f9fafb', border: '#d1d5db', text: '#4b5563', layout: 'sidebar-left' },
    vineyard: { accent: '#7f1d1d', light: '#fef2f2', border: '#fca5a5', text: '#991b1b', layout: 'classic-serif' },
    prism: { accent: '#8b5cf6', light: '#faf5ff', border: '#ddd6fe', text: '#6d28d9', layout: 'timeline' },
    snowfall: { accent: '#94a3b8', light: '#ffffff', border: '#e2e8f0', text: '#64748b', layout: 'centered' },
    mahogany: { accent: '#78350f', light: '#fffbeb', border: '#d97706', text: '#713f12', layout: 'boxed' },
    electric: { accent: '#3b82f6', light: '#0c1929', border: '#1e3a5f', text: '#60a5fa', dark: true, layout: 'timeline' },
    bamboo: { accent: '#16a34a', light: '#f0fdf4', border: '#86efac', text: '#166534', layout: 'classic-serif' },
    steel: { accent: '#6b7280', light: '#f3f4f6', border: '#9ca3af', text: '#374151', layout: 'sidebar-right' },
    peach: { accent: '#fb923c', light: '#fff7ed', border: '#fed7aa', text: '#c2410c', layout: 'centered' },
    horizon: { accent: '#0ea5e9', light: '#f0f9ff', border: '#7dd3fc', text: '#0284c7', layout: 'timeline' },
    garnet: { accent: '#be123c', light: '#fff1f2', border: '#fda4af', text: '#9f1239', headerBg: 'linear-gradient(135deg, #881337, #d4a017)', layout: 'centered' },
    mosaic: { accent: '#8b5cf6', light: '#faf5ff', border: '#c4b5fd', text: '#7c3aed', layout: 'boxed' },
    glacier: { accent: '#0891b2', light: '#ecfeff', border: '#a5f3fc', text: '#0e7490', layout: 'sidebar-left' },
    terracotta: { accent: '#c2410c', light: '#fff7ed', border: '#fb923c', text: '#9a3412', layout: 'classic-serif' },
    papercut: { accent: '#d946ef', light: '#fdf4ff', border: '#f0abfc', text: '#a21caf', layout: 'sidebar-right' },
    granite: { accent: '#374151', light: '#111827', border: '#374151', text: '#9ca3af', dark: true, layout: 'timeline' },
    mint: { accent: '#10b981', light: '#ecfdf5', border: '#6ee7b7', text: '#047857', layout: 'boxed' },
    crimson: { accent: '#dc2626', light: '#fef2f2', border: '#f87171', text: '#b91c1c', headerBg: 'linear-gradient(135deg, #dc2626, #450a0a)', layout: 'centered' },
    sand: { accent: '#a16207', light: '#fefdf5', border: '#e5d5a0', text: '#854d0e', layout: 'classic-serif' },
    carbon: { accent: '#ef4444', light: '#18181b', border: '#27272a', text: '#ef4444', dark: true, layout: 'sidebar-left' },
    lilac: { accent: '#a78bfa', light: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed', layout: 'centered' },
    dusk: { accent: '#6366f1', light: '#eef2ff', border: '#a5b4fc', text: '#4f46e5', headerBg: 'linear-gradient(135deg, #312e81, #f97316)', layout: 'classic-serif' },

    // also redefine earlier ones missing layouts:
    classic: { accent: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', layout: 'classic-serif' },
    modern: { accent: '#10b981', light: '#ecfdf5', border: '#a7f3d0', text: '#064e3b', layout: 'timeline' },
    executive: { accent: '#1e293b', light: '#f8fafc', border: '#cbd5e1', text: '#0f172a', layout: 'centered' },
    creative: { accent: '#f43f5e', light: '#fff1f2', border: '#fecdd3', text: '#9f1239', layout: 'sidebar-left' },
    developer: { accent: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6', layout: 'bold' },
    elegant: { accent: '#b45309', light: '#fffbeb', border: '#fde68a', text: '#78350f', layout: 'classic-serif' },
    minimalist: { accent: '#475569', light: '#f8fafc', border: '#e2e8f0', text: '#334155', layout: 'centered' },
    bold: { accent: '#eab308', light: '#fefce8', border: '#fef08a', text: '#713f12', layout: 'boxed' },
};

let miniCss = '';
let builderCss = '';

const getLayoutStyles = (prefix, b, id, c, layout) => {
    let styles = '';
    // prefix is '.mini-resume.tpl-xxx' or '.resume-paper[data-template="xxx"]'

    if (layout === 'centered') {
        styles += `${prefix} { text-align: center; }\n`;
        styles += `${prefix} .rv-contacts, ${prefix} .mr-contacts { justify-content: center; flex-wrap: wrap; }\n`;
        styles += `${prefix} .rv-section-title, ${prefix} .mr-section-title { text-align: center; display: inline-block; }\n`;
        styles += `${prefix} .rv-section-line, ${prefix} .mr-section-line { margin: 8px auto 16px; width: 60px; }\n`;
        styles += `${prefix} .rv-skills-pill, ${prefix} .mr-pill { justify-content: center; }\n`;
        styles += `${prefix} #rv-skills-block, ${prefix} .mr-skills { justify-content: center; }\n`;
    }

    if (layout === 'timeline') {
        styles += `${prefix} .rv-list, ${prefix} .mr-section-exp, ${prefix} .mr-section-edu { border-left: 2px solid ${c.border}; padding-left: 20px; margin-left: 10px; }\n`;
        styles += `${prefix} .rv-entry, ${prefix} .mr-entry { position: relative; }\n`;
        styles += `${prefix} .rv-entry::before, ${prefix} .mr-entry::before { content: ''; position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; background: ${c.accent}; border-radius: 50%; box-shadow: 0 0 0 3px ${c.light}; }\n`;
        // For builder only
        if (b) {
            styles += `${prefix} .rv-entry::before { left: -25px; }\n`;
        } else {
            styles += `${prefix} .mr-entry::before { left: -25px; width: 8px; height: 8px; top: 2px; }\n`;
        }
    }

    if (layout === 'classic-serif') {
        styles += `${prefix} { font-family: 'Playfair Display', serif; }\n`;
        styles += `${prefix} .rv-name, ${prefix} .mr-name { font-family: 'Playfair Display', serif; letter-spacing: 1px; font-weight: 800; }\n`;
        styles += `${prefix} .rv-section-title, ${prefix} .mr-section-title { font-family: 'Playfair Display', serif; border-bottom: 2px solid ${c.accent}; padding-bottom: 4px; }\n`;
        styles += `${prefix} .rv-section-line, ${prefix} .mr-section-line { display: none; }\n`;
    }

    if (layout === 'boxed') {
        styles += `${prefix} .rv-section, ${prefix} .mr-section { background: ${c.light}; border: 1px solid ${c.border}; padding: 20px; border-radius: 8px; margin-bottom: 20px; }\n`;
        if (!b) { // mini
            styles += `${prefix} .mr-section { padding: 12px; margin-bottom: 12px; border-radius: 6px; }\n`;
        }
        styles += `${prefix} .rv-section-line, ${prefix} .mr-section-line { display: none; }\n`;
    }

    if (layout === 'bold') {
        styles += `${prefix} .rv-name, ${prefix} .mr-name { text-transform: uppercase; font-size: 3rem; letter-spacing: -1px; }\n`;
        if (!b) { styles += `${prefix} .mr-name { font-size: 1.8rem; }\n`; }
        styles += `${prefix} .rv-section-title, ${prefix} .mr-section-title { font-size: 1.5rem; text-transform: uppercase; font-weight: 900; background: ${c.accent}; color: #fff !important; padding: 4px 12px; border-radius: 4px; display: inline-block; }\n`;
        if (!b) { styles += `${prefix} .mr-section-title { font-size: 1rem; padding: 2px 8px; }\n`; }
        styles += `${prefix} .rv-section-line, ${prefix} .mr-section-line { display: none; }\n`;
    }

    // Custom sidebar layouts utilizing Grid
    if (layout === 'sidebar-left') {
        styles += `${prefix} { display: grid; grid-template-columns: 28% 1fr; gap: 0 40px; align-items: start; }\n`;
        if (!b) { styles += `${prefix} { gap: 0 16px; }\n`; }
        // Builder mappings
        if (b) {
            styles += `${prefix} .rv-header { grid-column: 1 / -1; grid-row: 1; }\n`;
            styles += `${prefix} .rv-contacts { grid-column: 1; grid-row: 2; border-right: 1px solid ${c.border}; padding-right: 20px; padding-bottom: 20px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }\n`;
            styles += `${prefix} .rv-contact-item { justify-content: flex-start; width: 100%; word-break: break-all; }\n`;
            styles += `${prefix} .rv-header-line { display: none; }\n`;
            styles += `${prefix} #rv-skills-section { grid-column: 1; grid-row: 3 / 8; padding-right: 20px; border-right: 1px solid ${c.border}; height: 100%; }\n`;
            styles += `${prefix} .rv-skills-row { flex-direction: column; align-items: flex-start; gap: 6px; }\n`;
            styles += `${prefix} .rv-skills-cat { min-width: auto; }\n`;

            styles += `${prefix} #rv-summary-section { grid-column: 2; grid-row: 2; }\n`;
            styles += `${prefix} #rv-exp-section { grid-column: 2; grid-row: 3; }\n`;
            styles += `${prefix} #rv-projects-section { grid-column: 2; grid-row: 4; }\n`;
            styles += `${prefix} #rv-edu-section { grid-column: 2; grid-row: 5; }\n`;
            styles += `${prefix} #rv-extras-section { grid-column: 2; grid-row: 6; }\n`;
        } else {
            styles += `${prefix} .mr-header-row, ${prefix} .mr-header-band { grid-column: 1 / -1; }\n`;
            styles += `${prefix} .mr-divider { display: none; }\n`;
            styles += `${prefix} .mr-section-summary { grid-column: 2; grid-row: 2; }\n`;
            styles += `${prefix} .mr-section-exp { grid-column: 2; grid-row: 3; }\n`;
            styles += `${prefix} .mr-section-edu { grid-column: 2; grid-row: 4; }\n`;
            styles += `${prefix} .mr-section-skills { grid-column: 1; grid-row: 2 / 5; border-right: 1px solid ${c.border}; padding-right: 12px; }\n`;
        }
    }

    if (layout === 'sidebar-right') {
        styles += `${prefix} { display: grid; grid-template-columns: 1fr 28%; gap: 0 40px; align-items: start; }\n`;
        if (!b) { styles += `${prefix} { gap: 0 16px; }\n`; }
        if (b) {
            styles += `${prefix} .rv-header { grid-column: 1 / -1; grid-row: 1; }\n`;
            styles += `${prefix} .rv-contacts { grid-column: 2; grid-row: 2; border-left: 1px solid ${c.border}; padding-left: 20px; padding-bottom: 20px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }\n`;
            styles += `${prefix} .rv-contact-item { justify-content: flex-start; width: 100%; word-break: break-all; }\n`;
            styles += `${prefix} .rv-header-line { display: none; }\n`;
            styles += `${prefix} #rv-skills-section { grid-column: 2; grid-row: 3 / 8; padding-left: 20px; border-left: 1px solid ${c.border}; height: 100%; }\n`;
            styles += `${prefix} .rv-skills-row { flex-direction: column; align-items: flex-start; gap: 6px; }\n`;
            styles += `${prefix} .rv-skills-cat { min-width: auto; }\n`;

            styles += `${prefix} #rv-summary-section { grid-column: 1; grid-row: 2; }\n`;
            styles += `${prefix} #rv-exp-section { grid-column: 1; grid-row: 3; }\n`;
            styles += `${prefix} #rv-projects-section { grid-column: 1; grid-row: 4; }\n`;
            styles += `${prefix} #rv-edu-section { grid-column: 1; grid-row: 5; }\n`;
            styles += `${prefix} #rv-extras-section { grid-column: 1; grid-row: 6; }\n`;
        } else {
            styles += `${prefix} .mr-header-row, ${prefix} .mr-header-band { grid-column: 1 / -1; }\n`;
            styles += `${prefix} .mr-divider { display: none; }\n`;
            styles += `${prefix} .mr-section-summary { grid-column: 1; grid-row: 2; }\n`;
            styles += `${prefix} .mr-section-exp { grid-column: 1; grid-row: 3; }\n`;
            styles += `${prefix} .mr-section-edu { grid-column: 1; grid-row: 4; }\n`;
            styles += `${prefix} .mr-section-skills { grid-column: 2; grid-row: 2 / 5; border-left: 1px solid ${c.border}; padding-left: 12px; }\n`;
        }
    }

    return styles;
};

for (const [id, c] of Object.entries(TEMPLATE_COLORS)) {
    const isDark = c.dark || false;
    const layout = c.layout || 'default';

    // -- MINI RESUME (style.css) --
    miniCss += `\n/* ── Template ${id} ── */\n`;
    miniCss += `.mini-resume.tpl-${id} .mr-title { color: ${isDark ? c.accent : c.text}; }\n`;
    miniCss += `.mini-resume.tpl-${id} .mr-divider { background: ${c.accent}; }\n`;
    miniCss += `.mini-resume.tpl-${id} .mr-section-title { color: ${isDark ? c.text : c.accent}; }\n`;
    miniCss += `.mini-resume.tpl-${id} .mr-section-line { background: ${c.accent}; }\n`;
    miniCss += `.mini-resume.tpl-${id} .mr-pill { color: ${c.text}; background: ${isDark ? 'transparent' : c.light}; border: 1px solid ${c.border}; }\n`;

    if (isDark) {
        miniCss += `.mini-resume.tpl-${id} { background: ${c.light}; color: ${c.text}; }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-entry-role { color: ${c.accent}; }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-entry-date, .mini-resume.tpl-${id} .mr-entry-sub, .mini-resume.tpl-${id} .mr-entry-text { color: rgba(255,255,255,0.7); }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-contacts { color: rgba(255,255,255,0.6); }\n`;
    }

    if (c.headerBg) {
        miniCss += `.mini-resume.tpl-${id} { padding-top: 0; }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-header-band { background: ${c.headerBg}; color: #fff; padding: 28px 40px 20px; margin: 0 -40px 12px; }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-photo { border-color: rgba(255,255,255,0.3); }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-name { color: #fff; }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-title { color: rgba(255,255,255,0.85); }\n`;
        miniCss += `.mini-resume.tpl-${id} .mr-contacts { color: rgba(255,255,255,0.8); }\n`;
    }

    miniCss += getLayoutStyles(`.mini-resume.tpl-${id}`, false, id, c, layout);


    // -- FULL BUILDER (builder.css) --
    let b = `.resume-paper[data-template="${id}"]`;

    builderCss += `\n/* ── Template ${id} ── */\n`;
    if (isDark) {
        builderCss += `${b} { background: ${c.light}; color: ${c.text}; }\n`;
        builderCss += `${b} .rv-title { color: ${c.accent}; }\n`;
        builderCss += `${b} .rv-header-line { background: ${c.accent}; opacity: 0.5; }\n`;
        builderCss += `${b} .rv-section-title { color: ${c.text}; }\n`;
        builderCss += `${b} .rv-section-line { background: ${c.accent}; opacity: 0.4; }\n`;
        builderCss += `${b} .rv-contact-item { color: rgba(255,255,255,0.7); }\n`;
        builderCss += `${b} .rv-contact-item:hover { color: #fff; }\n`;
        builderCss += `${b} .rv-entry-title { color: ${c.accent}; }\n`;
        builderCss += `${b} .rv-entry-desc { color: rgba(255,255,255,0.8); }\n`;
        builderCss += `${b} .rv-entry-sub { color: rgba(255,255,255,0.6); }\n`;
        builderCss += `${b} .rv-entry-date { color: rgba(255,255,255,0.5); }\n`;
        builderCss += `${b} .rv-skills-pill { background: transparent; color: ${c.text}; border-color: ${c.border}; }\n`;
        builderCss += `${b} .rv-entry-tag { background: transparent; color: ${c.text}; border-color: ${c.border}; }\n`;
    } else {
        if (c.headerBg) {
            builderCss += `${b} .rv-header { background: ${c.headerBg}; color: #fff; margin: -50px -50px 24px; padding: 50px 50px 30px; border-radius: 6px 6px 0 0; }\n`;
            builderCss += `${b} .rv-title { color: rgba(255,255,255,0.85); }\n`;
            builderCss += `${b} .rv-contact-item { color: rgba(255,255,255,0.8); }\n`;
            builderCss += `${b} .rv-contact-item:hover { color: #fff; }\n`;
            builderCss += `${b} .rv-header-line { display: none; }\n`;
        } else {
            builderCss += `${b} .rv-title { color: ${c.accent}; }\n`;
            builderCss += `${b} .rv-header-line { background: ${c.accent}; }\n`;
        }

        builderCss += `${b} .rv-section-title { color: ${c.text}; }\n`;
        builderCss += `${b} .rv-section-line { background: ${c.accent}; opacity: 0.2; }\n`;
        builderCss += `${b} .rv-contact-item:hover { color: ${c.accent}; }\n`;
        builderCss += `${b} .rv-skills-pill { background: ${c.light}; color: ${c.text}; border-color: ${c.border}; }\n`;
        builderCss += `${b} .rv-entry-tag { background: ${c.light}; color: ${c.text}; border-color: ${c.border}; }\n`;
    }

    builderCss += getLayoutStyles(b, true, id, c, layout);
}

fs.appendFileSync('style.css', '\\n/* ================================================================\\n   GENERATED TEMPLATES \\n   ================================================================ */\\n' + miniCss);
fs.appendFileSync('builder.css', '\\n/* ================================================================\\n   GENERATED TEMPLATES \\n   ================================================================ */\\n' + builderCss);
console.log('Appended layout CSS to files.');
