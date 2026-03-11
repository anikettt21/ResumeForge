// ================================================================
//  TEMPLATE DATA
// ================================================================
const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Clean, ATS-friendly design with blue accents. The timeless choice for corporate and traditional roles.',
    category: ['professional'],
    tags: ['ATS-Friendly', 'Corporate', 'Clean'],
    badge: 'popular',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Contemporary teal tones with rounded elements. Perfect for tech, marketing, and startup roles.',
    category: ['modern', 'professional'],
    tags: ['Contemporary', 'Tech', 'Startup'],
    badge: 'popular',
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    description: 'Sophisticated dark header with gold accents and serif headings. Ideal for senior leadership positions.',
    category: ['professional'],
    tags: ['Leadership', 'Senior', 'Luxury'],
    badge: null,
  },
  {
    id: 'creative',
    name: 'Creative Impact',
    description: 'Bold purple gradients with eye-catching typography. Designed for designers, artists, and creatives.',
    category: ['creative'],
    tags: ['Design', 'Artistic', 'Bold'],
    badge: 'new',
  },
  {
    id: 'developer',
    name: 'Dev Terminal',
    description: 'Monospaced, terminal-inspired layout with green accents. Built by developers, for developers.',
    category: ['creative', 'modern'],
    tags: ['Developer', 'Engineering', 'Code'],
    badge: 'new',
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    description: 'Refined serif typography with centered layout and burgundy accents. For roles that demand sophistication.',
    category: ['professional', 'creative'],
    tags: ['Serif', 'Refined', 'Academic'],
    badge: null,
  },
  {
    id: 'minimalist',
    name: 'Clean Slate',
    description: 'Pure black and white with maximum whitespace. Let your content speak — zero distractions.',
    category: ['minimal', 'professional'],
    tags: ['B&W', 'Whitespace', 'ATS-Safe'],
    badge: null,
  },
  {
    id: 'bold',
    name: 'Bold Statement',
    description: 'Vibrant coral-to-orange gradient header with strong typography. For those who want to be noticed.',
    category: ['creative', 'modern'],
    tags: ['Vibrant', 'Confident', 'Standout'],
    badge: null,
  },
];

// ================================================================
//  SAMPLE RESUME DATA (for previews)
// ================================================================
const SAMPLE = {
  name: 'ALEX MORGAN',
  title: 'Senior Product Designer',
  email: 'alex@morgan.dev',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexmorgan',
  summary: 'Design leader with 6+ years crafting intuitive products for high-growth startups. Specialized in design systems, user research, and cross-functional collaboration. Led redesigns that improved conversion by 40% and user satisfaction scores by 25%.',
  experience: [
    {
      role: 'Lead Product Designer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      date: 'Jan 2022 — Present',
      bullets: [
        'Led the checkout redesign, improving merchant conversion rates by 34%',
        'Built and maintained a component library used across 12 product teams',
        'Mentored 4 junior designers and established design review processes',
      ],
    },
    {
      role: 'UI/UX Designer',
      company: 'Figma',
      location: 'Remote',
      date: 'Mar 2019 — Dec 2021',
      bullets: [
        'Designed collaboration features used by 4M+ daily active users',
        'Created design system documentation adopted by 200+ enterprise teams',
      ],
    },
  ],
  education: [
    {
      degree: 'B.Des — Interaction Design',
      institution: 'California College of the Arts',
      year: '2015 — 2019',
      gpa: '3.9 / 4.0',
    },
  ],
  skills: {
    technical: ['Figma', 'Sketch', 'Adobe CC', 'Framer', 'HTML/CSS'],
    tools: ['Jira', 'Notion', 'Miro', 'Hotjar', 'Mixpanel'],
    soft: ['Leadership', 'User Research', 'Presentations'],
  },
  certifications: ['Google UX Design Certificate — 2023', 'Interaction Design Foundation — 2022'],
};

// ================================================================
//  RENDER MINI RESUME HTML
// ================================================================
function renderMiniResume(templateId) {
  const s = SAMPLE;
  const hasHeaderBand = ['executive', 'bold'].includes(templateId);

  let headerHTML;
  if (hasHeaderBand) {
    headerHTML = `
      <div class="mr-header-band">
        <div class="mr-header-left">
          <div class="mr-name">${s.name}</div>
          <div class="mr-title">${s.title}</div>
          <div class="mr-contacts">
            <span>${s.email}</span><span>${s.phone}</span><span>${s.location}</span>
          </div>
        </div>
        <img class="mr-photo" src="demo-photo.png" alt="Profile" />
      </div>
    `;
  } else {
    headerHTML = `
      <div class="mr-header-row">
        <div class="mr-header-left">
          <div class="mr-name">${s.name}</div>
          <div class="mr-title">${s.title}</div>
          <div class="mr-contacts">
            <span>${s.email}</span><span>${s.phone}</span><span>${s.location}</span>
          </div>
        </div>
        <img class="mr-photo" src="demo-photo.png" alt="Profile" />
      </div>
      <div class="mr-divider"></div>
    `;
  }

  const expHTML = s.experience.map(e => `
    <div class="mr-entry">
      <div class="mr-entry-header">
        <span class="mr-entry-role">${e.role} — ${e.company}</span>
        <span class="mr-entry-date">${e.date}</span>
      </div>
      <div class="mr-entry-sub">${e.location}</div>
      <div class="mr-entry-text">${e.bullets.map(b => '• ' + b).join('\n')}</div>
    </div>
  `).join('');

  const eduHTML = s.education.map(e => `
    <div class="mr-entry">
      <div class="mr-entry-header">
        <span class="mr-entry-role">${e.degree}</span>
        <span class="mr-entry-date">${e.year}</span>
      </div>
      <div class="mr-entry-sub">${e.institution} · GPA: ${e.gpa}</div>
    </div>
  `).join('');

  const skillPills = [...s.skills.technical, ...s.skills.tools.slice(0, 3)]
    .map(sk => `<span class="mr-pill">${sk}</span>`).join('');

  return `
    <div class="mini-resume tpl-${templateId}">
      ${headerHTML}
      <div class="mr-section">
        <div class="mr-section-head">
          <span class="mr-section-title">SUMMARY</span>
          <div class="mr-section-line"></div>
        </div>
        <div class="mr-entry-text">${s.summary}</div>
      </div>
      <div class="mr-section">
        <div class="mr-section-head">
          <span class="mr-section-title">EXPERIENCE</span>
          <div class="mr-section-line"></div>
        </div>
        ${expHTML}
      </div>
      <div class="mr-section">
        <div class="mr-section-head">
          <span class="mr-section-title">EDUCATION</span>
          <div class="mr-section-line"></div>
        </div>
        ${eduHTML}
      </div>
      <div class="mr-section">
        <div class="mr-section-head">
          <span class="mr-section-title">SKILLS</span>
          <div class="mr-section-line"></div>
        </div>
        <div class="mr-skills">${skillPills}</div>
      </div>
    </div>
  `;
}

// ================================================================
//  RENDER TEMPLATE CARDS
// ================================================================
const gridEl = document.getElementById('templates-grid');
const noResultsEl = document.getElementById('no-results');

function renderCards(filter = 'all', search = '') {
  let filtered = TEMPLATES;
  if (filter !== 'all') {
    filtered = filtered.filter(t => t.category.includes(filter));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.category.some(c => c.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = '';
    noResultsEl.classList.remove('hidden');
    return;
  }
  noResultsEl.classList.add('hidden');

  gridEl.innerHTML = filtered.map(t => {
    const badgeHTML = t.badge
      ? `<span class="tpl-card-badge ${t.badge}">${t.badge === 'popular' ? '★ Popular' : '✦ New'}</span>`
      : '';
    const tagsHTML = t.tags.map(tag => `<span class="tpl-tag">${tag}</span>`).join('');

    return `
      <div class="tpl-card" data-id="${t.id}">
        <div class="tpl-preview-wrap" id="preview-${t.id}">
          ${renderMiniResume(t.id)}
          <div class="tpl-card-overlay">
            <button class="tpl-overlay-btn preview" onclick="openPreview('${t.id}'); event.stopPropagation();">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
            <a class="tpl-overlay-btn use" href="builder.html?template=${t.id}" onclick="event.stopPropagation();">
              Use Template
            </a>
          </div>
        </div>
        <div class="tpl-card-info">
          <div class="tpl-card-top">
            <div class="tpl-card-name">${t.name}</div>
            ${badgeHTML}
          </div>
          <div class="tpl-card-desc">${t.description}</div>
          <div class="tpl-card-tags">${tagsHTML}</div>
        </div>
      </div>
    `;
  }).join('');

  // Scale mini-resumes to fit their containers
  requestAnimationFrame(scalePreviews);
}

function scalePreviews() {
  document.querySelectorAll('.tpl-preview-wrap').forEach(wrap => {
    const mini = wrap.querySelector('.mini-resume');
    if (!mini) return;
    const wrapW = wrap.offsetWidth;
    const scale = wrapW / 600; // mini-resume is 600px wide
    mini.style.transform = `scale(${scale})`;
  });
}

// ================================================================
//  FILTER & SEARCH
// ================================================================
let currentFilter = 'all';

document.querySelectorAll('.mp-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mp-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderCards(currentFilter, document.getElementById('search-input').value);
  });
});

const searchInput = document.getElementById('search-input');
let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    renderCards(currentFilter, searchInput.value);
  }, 200);
});

function clearSearch() {
  searchInput.value = '';
  renderCards(currentFilter, '');
  searchInput.focus();
}

// ================================================================
//  PREVIEW MODAL
// ================================================================
const modalEl = document.getElementById('preview-modal');
const modalBody = document.getElementById('preview-modal-body');
const modalName = document.getElementById('preview-modal-name');
const modalDesc = document.getElementById('preview-modal-desc');
const modalUseBtn = document.getElementById('preview-use-btn');

function openPreview(templateId) {
  const tpl = TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;

  modalName.textContent = tpl.name;
  modalDesc.textContent = tpl.description;
  modalUseBtn.href = `builder.html?template=${tpl.id}`;
  modalBody.innerHTML = renderMiniResume(tpl.id);

  // Scale for modal (larger)
  const mini = modalBody.querySelector('.mini-resume');
  mini.style.position = 'relative';
  mini.style.width = '680px';
  mini.style.padding = '44px 48px';

  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Scale to fit modal
  requestAnimationFrame(() => {
    const bodyW = modalBody.offsetWidth - 64; // minus padding
    const scale = Math.min(bodyW / 680, 1);
    if (scale < 1) {
      mini.style.transformOrigin = 'top center';
      mini.style.transform = `scale(${scale})`;
      mini.style.marginBottom = `-${680 * 1.36 * (1 - scale)}px`;
    }
  });
}

function closePreview() {
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('preview-close-btn').addEventListener('click', closePreview);
modalEl.addEventListener('click', e => {
  if (e.target === modalEl) closePreview();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalEl.classList.contains('open')) closePreview();
});

// ── Card click → open preview ──
document.addEventListener('click', e => {
  const card = e.target.closest('.tpl-card');
  if (!card) return;
  // Don't open preview if clicking "Use Template" link
  if (e.target.closest('.tpl-overlay-btn.use')) return;
  openPreview(card.dataset.id);
});

// ================================================================
//  INIT
// ================================================================
renderCards();

// Rescale on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scalePreviews, 100);
});

// Smooth header background on scroll
window.addEventListener('scroll', () => {
  const header = document.getElementById('mp-header');
  if (window.scrollY > 40) {
    header.style.background = 'rgba(255,255,255,0.95)';
  } else {
    header.style.background = 'rgba(255,255,255,0.88)';
  }
});
