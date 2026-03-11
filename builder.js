/* ================================================================
   RESUME FORGE — builder.js
   7-step wizard · live preview · auto-save · PDF export
   Multi-template support via ?template= URL parameter
   ================================================================ */

// ── TEMPLATE INIT ───────────────────────────────────────────────
const VALID_TEMPLATES = ['classic', 'modern', 'executive', 'creative', 'developer', 'elegant', 'minimalist', 'bold'];
const urlParams = new URLSearchParams(window.location.search);
const selectedTemplate = urlParams.get('template') || localStorage.getItem('rf_template') || 'classic';
if (VALID_TEMPLATES.includes(selectedTemplate)) {
  document.getElementById('resume-preview').setAttribute('data-template', selectedTemplate);
  localStorage.setItem('rf_template', selectedTemplate);
}

// ── THEME TOGGLE ────────────────────────────────────────────────
const themeBtn = document.getElementById('theme-btn');
const MOON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SUN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

let isDark = false; // default: light
themeBtn.innerHTML = SUN; // sun = light mode is active

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeBtn.innerHTML = isDark ? MOON : SUN;
  save();
});

// ── CLEAR BUTTON ────────────────────────────────────────────────
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Clear all data and start fresh?')) {
    localStorage.removeItem('rf_data');
    location.reload();
  }
});

// ================================================================
//  UTILITY HELPERS  (hoisted — used by render functions below)
// ================================================================
function val(id) { return (document.getElementById(id)?.value || '').trim(); }
function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ensureHttp(url) {
  const u = (url || '').trim();
  return u && !/^https?:\/\//.test(u) ? 'https://' + u : u;
}
function fmtUrl(url) {
  return (url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
/** Converts lines starting with •/-/* into <ul><li>. Non-bullet text stays as <p>. */
function fmtDesc(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(l => l.trim());
  // Only apply bullet rendering to lines that actually ARE bullets
  const bulletLines = lines.filter(l => /^[•\-\*]\s/.test(l.trim()));
  const plainLines = lines.filter(l => !/^[•\-\*]\s/.test(l.trim()));
  let out = '';
  if (bulletLines.length) {
    const items = bulletLines.map(l => `<li>${esc(l.trim().replace(/^[•\-\*]\s*/, ''))}</li>`).join('');
    out += `<ul class="rv-bullets">${items}</ul>`;
  }
  if (plainLines.length) {
    out += `<p class="rv-entry-desc">${esc(plainLines.join('\n')).replace(/\n/g, '<br>')}</p>`;
  }
  return out;
}

// ================================================================
//  PHOTO EDITOR — Canvas-based circle crop tool
// ================================================================
let photoDataUrl = '';
let editorImg = null;
let coverZoom = 1;

const PE_SIZE = 300;  // canvas px
const PE_R = 132;  // circle radius px

let es = { zoom: 1, rot: 0, flipH: false, flipV: false, offX: 0, offY: 0, brightness: 1 };

/* Open/close helpers */
function openPhotoEditor() { document.getElementById('photo-modal').classList.add('open'); }
function closePhotoEditor() {
  document.getElementById('photo-modal').classList.remove('open');
  document.getElementById('photo-input').value = '';
}

/* When a file is selected → load into editor */
document.getElementById('photo-input').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      editorImg = img;
      // Compute cover zoom (image fills the circle)
      coverZoom = (PE_R * 2) / Math.min(img.naturalWidth, img.naturalHeight);
      // Reset state
      es = { zoom: coverZoom, rot: 0, flipH: false, flipV: false, offX: 0, offY: 0, brightness: 1 };
      // Sync sliders
      const zSlider = document.getElementById('pc-zoom');
      zSlider.min = (coverZoom * 0.5).toFixed(3);
      zSlider.max = (coverZoom * 4).toFixed(3);
      zSlider.step = (coverZoom * 0.02).toFixed(4);
      zSlider.value = coverZoom;
      document.getElementById('pc-rotate').value = 0;
      document.getElementById('pc-rotate-val').textContent = '0°';
      document.getElementById('pc-brightness').value = 1;
      document.getElementById('pc-flip-h').classList.remove('active');
      document.getElementById('pc-flip-v').classList.remove('active');
      openPhotoEditor();
      drawPhotoCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ── CANVAS RENDERING ─────────────────────────────────────────── */
function drawPhotoCanvas() {
  const canvas = document.getElementById('photo-canvas');
  const ctx = canvas.getContext('2d');
  const cx = PE_SIZE / 2, cy = PE_SIZE / 2;

  ctx.clearRect(0, 0, PE_SIZE, PE_SIZE);

  // ① Gray checkerboard background
  const sq = 14;
  for (let row = 0; row < PE_SIZE; row += sq) {
    for (let col = 0; col < PE_SIZE; col += sq) {
      ctx.fillStyle = ((row / sq + col / sq) % 2 === 0) ? '#e5e7eb' : '#d1d5db';
      ctx.fillRect(col, row, sq, sq);
    }
  }

  if (editorImg) {
    // ② Clip to circle, apply transforms, draw image
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, PE_R, 0, Math.PI * 2);
    ctx.clip();

    ctx.filter = `brightness(${es.brightness})`;
    ctx.translate(cx + es.offX, cy + es.offY);
    ctx.rotate(es.rot * Math.PI / 180);
    ctx.scale(
      es.flipH ? -es.zoom : es.zoom,
      es.flipV ? -es.zoom : es.zoom
    );
    ctx.drawImage(editorImg, -editorImg.naturalWidth / 2, -editorImg.naturalHeight / 2);
    ctx.filter = 'none';
    ctx.restore();
  }

  // ③ Dark vignette outside circle (evenodd rule)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.52)';
  ctx.beginPath();
  ctx.rect(0, 0, PE_SIZE, PE_SIZE);
  ctx.arc(cx, cy, PE_R, 0, Math.PI * 2, true); // counterclockwise = hole
  ctx.fill('evenodd');
  ctx.restore();

  // ④ Circle border ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, PE_R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Blue inner shine
  ctx.beginPath();
  ctx.arc(cx, cy, PE_R - 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(37,99,235,0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ⑤ Center crosshair guide
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12); ctx.stroke();
  ctx.restore();
}

/* ── DRAG TO PAN ─────────────────────────────────────────────── */
let peIsDrag = false, peDragX0 = 0, peDragY0 = 0, peOffX0 = 0, peOffY0 = 0;

const peCanvas = document.getElementById('photo-canvas');

peCanvas.addEventListener('mousedown', e => {
  peIsDrag = true;
  peDragX0 = e.clientX; peDragY0 = e.clientY;
  peOffX0 = es.offX; peOffY0 = es.offY;
});
window.addEventListener('mousemove', e => {
  if (!peIsDrag) return;
  es.offX = peOffX0 + (e.clientX - peDragX0);
  es.offY = peOffY0 + (e.clientY - peDragY0);
  drawPhotoCanvas();
});
window.addEventListener('mouseup', () => { peIsDrag = false; });

// Touch
peCanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  peIsDrag = true;
  peDragX0 = t.clientX; peDragY0 = t.clientY;
  peOffX0 = es.offX; peOffY0 = es.offY;
}, { passive: false });
window.addEventListener('touchmove', e => {
  if (!peIsDrag) return;
  e.preventDefault();
  const t = e.touches[0];
  es.offX = peOffX0 + (t.clientX - peDragX0);
  es.offY = peOffY0 + (t.clientY - peDragY0);
  drawPhotoCanvas();
}, { passive: false });
window.addEventListener('touchend', () => { peIsDrag = false; });

/* ── SCROLL TO ZOOM ─────────────────────────────────────────── */
peCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const step = e.deltaY > 0 ? -0.04 : 0.04;
  const delta = coverZoom * step;
  es.zoom = Math.max(+document.getElementById('pc-zoom').min, Math.min(+document.getElementById('pc-zoom').max, es.zoom + delta));
  document.getElementById('pc-zoom').value = es.zoom;
  drawPhotoCanvas();
}, { passive: false });

/* ── ZOOM CONTROLS ──────────────────────────────────────────── */
document.getElementById('pc-zoom').addEventListener('input', function () {
  es.zoom = +this.value; drawPhotoCanvas();
});
document.getElementById('pc-zoom-in').addEventListener('click', () => {
  const sl = document.getElementById('pc-zoom');
  es.zoom = Math.min(+sl.max, es.zoom + coverZoom * 0.08);
  sl.value = es.zoom; drawPhotoCanvas();
});
document.getElementById('pc-zoom-out').addEventListener('click', () => {
  const sl = document.getElementById('pc-zoom');
  es.zoom = Math.max(+sl.min, es.zoom - coverZoom * 0.08);
  sl.value = es.zoom; drawPhotoCanvas();
});

/* ── ROTATE CONTROLS ────────────────────────────────────────── */
document.getElementById('pc-rotate').addEventListener('input', function () {
  es.rot = +this.value;
  document.getElementById('pc-rotate-val').textContent = es.rot + '°';
  drawPhotoCanvas();
});
document.getElementById('pc-rot-left').addEventListener('click', () => {
  es.rot = ((es.rot - 90 + 180) % 360) - 180;
  document.getElementById('pc-rotate').value = es.rot;
  document.getElementById('pc-rotate-val').textContent = es.rot + '°';
  drawPhotoCanvas();
});
document.getElementById('pc-rot-right').addEventListener('click', () => {
  es.rot = ((es.rot + 90 + 180) % 360) - 180;
  document.getElementById('pc-rotate').value = es.rot;
  document.getElementById('pc-rotate-val').textContent = es.rot + '°';
  drawPhotoCanvas();
});

/* ── BRIGHTNESS ─────────────────────────────────────────────── */
document.getElementById('pc-brightness').addEventListener('input', function () {
  es.brightness = +this.value; drawPhotoCanvas();
});

/* ── FLIP ───────────────────────────────────────────────────── */
document.getElementById('pc-flip-h').addEventListener('click', function () {
  es.flipH = !es.flipH; this.classList.toggle('active', es.flipH); drawPhotoCanvas();
});
document.getElementById('pc-flip-v').addEventListener('click', function () {
  es.flipV = !es.flipV; this.classList.toggle('active', es.flipV); drawPhotoCanvas();
});

/* ── RESET ──────────────────────────────────────────────────── */
document.getElementById('pc-reset').addEventListener('click', () => {
  es = { zoom: coverZoom, rot: 0, flipH: false, flipV: false, offX: 0, offY: 0, brightness: 1 };
  document.getElementById('pc-zoom').value = coverZoom;
  document.getElementById('pc-rotate').value = 0;
  document.getElementById('pc-rotate-val').textContent = '0°';
  document.getElementById('pc-brightness').value = 1;
  document.getElementById('pc-flip-h').classList.remove('active');
  document.getElementById('pc-flip-v').classList.remove('active');
  drawPhotoCanvas();
});

/* ── CANCEL ─────────────────────────────────────────────────── */
document.getElementById('photo-modal-close').addEventListener('click', closePhotoEditor);
document.getElementById('pc-cancel').addEventListener('click', closePhotoEditor);
// Click backdrop to close
document.getElementById('photo-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('photo-modal')) closePhotoEditor();
});

/* ── APPLY — export circle-cropped PNG ──────────────────────── */
document.getElementById('pc-apply').addEventListener('click', () => {
  const OUT = 280;  // output image size in px
  const expCanvas = document.createElement('canvas');
  expCanvas.width = expCanvas.height = OUT;
  const ectx = expCanvas.getContext('2d');
  const ecx = OUT / 2;
  const scale = OUT / (PE_R * 2); // scale from editor coords to export px

  // Clip to full circle
  ectx.beginPath();
  ectx.arc(ecx, ecx, ecx, 0, Math.PI * 2);
  ectx.clip();

  // Replicate transforms
  ectx.filter = `brightness(${es.brightness})`;
  ectx.translate(ecx + es.offX * scale, ecx + es.offY * scale);
  ectx.rotate(es.rot * Math.PI / 180);
  ectx.scale(
    es.flipH ? -es.zoom * scale : es.zoom * scale,
    es.flipV ? -es.zoom * scale : es.zoom * scale
  );
  if (editorImg) {
    ectx.drawImage(editorImg, -editorImg.naturalWidth / 2, -editorImg.naturalHeight / 2);
  }
  ectx.filter = 'none';

  photoDataUrl = expCanvas.toDataURL('image/png');

  // Update thumbnail in form
  document.getElementById('photo-thumb').innerHTML =
    `<img src="${photoDataUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;

  // Update resume preview
  const rvPhoto = document.getElementById('rv-photo');
  rvPhoto.src = photoDataUrl;
  rvPhoto.style.display = 'block';
  rvPhoto.removeAttribute('data-placeholder');

  // Update remove button text
  document.getElementById('photo-remove-btn').textContent = 'Remove';

  closePhotoEditor();
  save();
});

/* ── REMOVE PHOTO ──────────────────────────────────────────────── */
document.getElementById('photo-remove-btn').addEventListener('click', () => {
  // Clear stored photo data
  photoDataUrl = '';

  // Reset thumbnail to default camera icon
  document.getElementById('photo-thumb').innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>`;

  // Hide photo entirely from resume preview
  const rvPhoto = document.getElementById('rv-photo');
  rvPhoto.src = '';
  rvPhoto.style.display = 'none';
  rvPhoto.removeAttribute('data-placeholder');

  // Clear file input
  document.getElementById('photo-input').value = '';

  save();
});



// ================================================================
//  STEP WIZARD
// ================================================================
const STEPS = [
  { label: 'Personal Info', desc: 'Start with your basic contact details to build your header.' },
  { label: 'Summary', desc: 'Write a short, impactful professional summary (3–4 sentences).' },
  { label: 'Work Experience', desc: 'List your work history, most recent first. Focus on achievements.' },
  { label: 'Projects', desc: 'Showcase your best personal, freelance, or open-source projects.' },
  { label: 'Education', desc: 'Add your educational background, most recent first.' },
  { label: 'Skills', desc: 'List your technical skills, tools, and soft skills.' },
  { label: 'Extras', desc: 'Optional: certifications, awards, and volunteer work.' },
];
let currentStep = 1;

// Build segment indicators
const stepsRow = document.getElementById('steps-row');
STEPS.forEach((s, i) => {
  const seg = document.createElement('div');
  seg.className = 'step-segment' + (i === 0 ? ' active' : '');
  seg.title = s.label;
  stepsRow.appendChild(seg);
});

// BUG FIX: split goToStep into internal (_goToStep, no save) and public (goToStep, with save)
// This prevents restore() → goToStep() → save() → overwrite loop
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> ${esc(msg)}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function _goToStep(n) {
  if (n < 1 || n > STEPS.length) return;

  // Mobile UX: Show toast if moving forward and on a small screen
  if (n > currentStep && window.innerWidth <= 780) {
    showToast('Changes added to preview');
  }

  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
  currentStep = n;
  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
  updateStepUI();
  updateNavButtons();
  document.querySelector('.form-column').scrollTop = 0;
}
function goToStep(n) {
  _goToStep(n);
  save();
}

function updateStepUI() {
  const s = STEPS[currentStep - 1];
  document.getElementById('step-title').textContent = `Step ${currentStep}: ${s.label}`;
  document.getElementById('step-desc').textContent = s.desc;
  document.getElementById('step-num').textContent = currentStep;
  // Update segments
  document.querySelectorAll('.step-segment').forEach((seg, i) => {
    seg.classList.remove('active', 'done');
    if (i + 1 === currentStep) seg.classList.add('active');
    else if (i + 1 < currentStep) seg.classList.add('done');
  });
}

function updateNavButtons() {
  const back = document.getElementById('nav-back');
  const next = document.getElementById('nav-next');
  const gen = document.getElementById('nav-generate');
  back.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  if (currentStep === STEPS.length) {
    next.classList.add('hidden');
    gen.classList.remove('hidden');
  } else {
    next.classList.remove('hidden');
    gen.classList.add('hidden');
  }
}

document.getElementById('nav-next').addEventListener('click', () => {
  if (currentStep < STEPS.length) goToStep(currentStep + 1);
});
document.getElementById('nav-back').addEventListener('click', () => {
  if (currentStep > 1) goToStep(currentStep - 1);
});
document.getElementById('nav-generate').addEventListener('click', () => {
  switchTab('preview');
  document.getElementById('resume-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

updateStepUI();
updateNavButtons();

// ================================================================
//  REPEATABLE ENTRIES
// ================================================================

// ── WORK EXPERIENCE ─────────────────────────────────────────────
let expData = [{}];
function renderExperienceList() {
  const list = document.getElementById('experience-list');
  list.innerHTML = '';
  expData.forEach((exp, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-card-header">
        <div class="entry-card-label">Experience ${expData.length > 1 ? i + 1 : ''}</div>
        ${expData.length > 1 ? `<button type="button" class="entry-remove" data-i="${i}" title="Remove">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : ''}
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label">Job Title</label>
          <input class="field-input" type="text" data-field="jobTitle" data-i="${i}" value="${esc(exp.jobTitle || '')}" placeholder="e.g. Senior Engineer" />
        </div>
        <div class="field-group">
          <label class="field-label">Company</label>
          <input class="field-input" type="text" data-field="company" data-i="${i}" value="${esc(exp.company || '')}" placeholder="e.g. Tech Corp" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label">Location</label>
          <input class="field-input" type="text" data-field="expLocation" data-i="${i}" value="${esc(exp.expLocation || '')}" placeholder="San Francisco, CA / Remote" />
        </div>
        <div class="field-group">
          <label class="field-label">Duration</label>
          <input class="field-input" type="text" data-field="duration" data-i="${i}" value="${esc(exp.duration || '')}" placeholder="Jan 2022 — Present" />
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Achievements &amp; Responsibilities</label>
        <p class="field-hint">Start each line with • or - for bullet points</p>
        <textarea class="field-textarea" rows="4" data-field="expDesc" data-i="${i}" placeholder="• Architected and shipped X, reducing Y by Z%&#10;• Led a team of N to deliver project ahead of schedule">${esc(exp.expDesc || '')}</textarea>
      </div>
    `;
    const removeBtn = card.querySelector('.entry-remove');
    // BUG FIX: read index from dataset at click-time, not from captured `i` (stale closure)
    if (removeBtn) removeBtn.addEventListener('click', function () {
      const idx = +this.dataset.i;
      expData.splice(idx, 1); renderExperienceList(); renderPreview(); save();
    });
    card.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        expData[+el.dataset.i][el.dataset.field] = el.value;
        renderPreview(); save();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('add-experience').addEventListener('click', () => {
  // BUG FIX: was missing renderPreview() and save() after adding entry
  expData.push({}); renderExperienceList(); renderPreview(); save();
});
renderExperienceList();

// ── PROJECTS ────────────────────────────────────────────────────
let projData = [{}];
function renderProjectList() {
  const list = document.getElementById('projects-list');
  list.innerHTML = '';
  projData.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-card-header">
        <div class="entry-card-label">Project ${projData.length > 1 ? i + 1 : ''}</div>
        ${projData.length > 1 ? `<button type="button" class="entry-remove" data-i="${i}" title="Remove">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : ''}
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label">Project Name</label>
          <input class="field-input" type="text" data-field="projName" data-i="${i}" value="${esc(proj.projName || '')}" placeholder="e.g. TaskFlow SaaS" />
        </div>
        <div class="field-group">
          <label class="field-label">Status</label>
          <input class="field-input" type="text" data-field="projStatus" data-i="${i}" value="${esc(proj.projStatus || '')}" placeholder="Live / In Dev / Open Source" />
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Live / Demo URL</label>
        <input class="field-input" type="url" data-field="projUrl" data-i="${i}" value="${esc(proj.projUrl || '')}" placeholder="https://yourproject.vercel.app" />
      </div>
      <div class="field-group">
        <label class="field-label">Tech Stack (comma-separated)</label>
        <input class="field-input" type="text" data-field="projTech" data-i="${i}" value="${esc(proj.projTech || '')}" placeholder="React, Node.js, MongoDB, Vercel" />
      </div>
      <div class="field-group">
        <label class="field-label">Description</label>
        <textarea class="field-textarea" rows="3" data-field="projDesc" data-i="${i}" placeholder="What does it do? What problem does it solve?">${esc(proj.projDesc || '')}</textarea>
      </div>
    `;
    const removeBtn = card.querySelector('.entry-remove');
    if (removeBtn) removeBtn.addEventListener('click', function () {
      const idx = +this.dataset.i;
      projData.splice(idx, 1); renderProjectList(); renderPreview(); save();
    });
    card.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        projData[+el.dataset.i][el.dataset.field] = el.value;
        renderPreview(); save();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('add-project').addEventListener('click', () => {
  projData.push({}); renderProjectList(); renderPreview(); save();
});
renderProjectList();

// ── EDUCATION ───────────────────────────────────────────────────
let eduData = [{}];
function renderEducationList() {
  const list = document.getElementById('education-list');
  list.innerHTML = '';
  eduData.forEach((edu, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-card-header">
        <div class="entry-card-label">Education ${eduData.length > 1 ? i + 1 : ''}</div>
        ${eduData.length > 1 ? `<button type="button" class="entry-remove" data-i="${i}" title="Remove">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : ''}
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label">Degree / Qualification</label>
          <input class="field-input" type="text" data-field="degree" data-i="${i}" value="${esc(edu.degree || '')}" placeholder="e.g. B.Tech — Computer Science" />
        </div>
        <div class="field-group">
          <label class="field-label">Year / Duration</label>
          <input class="field-input" type="text" data-field="eduYear" data-i="${i}" value="${esc(edu.eduYear || '')}" placeholder="2022 – 2026" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label">Institution</label>
          <input class="field-input" type="text" data-field="institution" data-i="${i}" value="${esc(edu.institution || '')}" placeholder="e.g. IIT Bombay" />
        </div>
        <div class="field-group">
          <label class="field-label">GPA / Score (optional)</label>
          <input class="field-input" type="text" data-field="gpa" data-i="${i}" value="${esc(edu.gpa || '')}" placeholder="8.5 / 10" />
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Achievements / Coursework (optional)</label>
        <textarea class="field-textarea" rows="2" data-field="eduDesc" data-i="${i}" placeholder="Dean's List, Relevant Coursework: Data Structures, Algorithms">${esc(edu.eduDesc || '')}</textarea>
      </div>
    `;
    const removeBtn = card.querySelector('.entry-remove');
    if (removeBtn) removeBtn.addEventListener('click', function () {
      const idx = +this.dataset.i;
      eduData.splice(idx, 1); renderEducationList(); renderPreview(); save();
    });
    card.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        eduData[+el.dataset.i][el.dataset.field] = el.value;
        renderPreview(); save();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('add-education').addEventListener('click', () => {
  eduData.push({}); renderEducationList(); renderPreview(); save();
});
renderEducationList();

// ── CERTIFICATIONS ──────────────────────────────────────────────
let certData = [];
function renderCertList() {
  const list = document.getElementById('certifications-list');
  list.innerHTML = '';
  certData.forEach((cert, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card'; card.style.padding = '14px 16px';
    card.innerHTML = `
      <div class="entry-card-header" style="margin-bottom:10px">
        <div class="entry-card-label">Cert ${i + 1}</div>
        <button type="button" class="entry-remove" data-i="${i}" title="Remove">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="form-grid-2" style="margin-bottom:10px">
        <div class="field-group" style="margin-bottom:0">
          <input class="field-input" type="text" data-field="certName" data-i="${i}" value="${esc(cert.certName || '')}" placeholder="Certificate Name" />
        </div>
        <div class="field-group" style="margin-bottom:0">
          <input class="field-input" type="text" data-field="certIssuer" data-i="${i}" value="${esc(cert.certIssuer || '')}" placeholder="Issuer (e.g. Google, AWS)" />
        </div>
      </div>
      <div class="field-group" style="margin-bottom:0">
        <input class="field-input" type="text" data-field="certYear" data-i="${i}" value="${esc(cert.certYear || '')}" placeholder="Year (e.g. 2024)" />
      </div>
    `;
    card.querySelector('.entry-remove').addEventListener('click', function () {
      const idx = +this.dataset.i;
      certData.splice(idx, 1); renderCertList(); renderPreview(); save();
    });
    card.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        certData[+el.dataset.i][el.dataset.field] = el.value;
        renderPreview(); save();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('add-certification').addEventListener('click', () => {
  certData.push({}); renderCertList(); renderPreview(); save();
});

// ================================================================
//  SIMPLE INPUT LIVE BINDING
// ================================================================
const simpleInputIds = [
  'f-name', 'f-title', 'f-email', 'f-phone', 'f-location',
  'f-linkedin', 'f-github', 'f-website', 'f-summary',
  'f-tech-skills', 'f-tools', 'f-soft-skills', 'f-languages',
  'f-awards', 'f-volunteer'
];
simpleInputIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { renderPreview(); save(); });
});

// Summary char counter
const summaryEl = document.getElementById('f-summary');
const summaryCount = document.getElementById('summary-char');
summaryEl.addEventListener('input', () => {
  summaryCount.textContent = `${summaryEl.value.length} / 600 characters`;
});

// Tag previews
function wireTagPreview(inputId, previewId) {
  const el = document.getElementById(inputId);
  const pr = document.getElementById(previewId);
  if (!el || !pr) return;
  const update = () => {
    const tags = el.value.split(',').map(t => t.trim()).filter(Boolean);
    pr.innerHTML = tags.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('');
  };
  el.addEventListener('input', update); update();
}
wireTagPreview('f-tech-skills', 'tech-tags-preview');
wireTagPreview('f-tools', 'tools-tags-preview');
wireTagPreview('f-soft-skills', 'soft-tags-preview');

// ================================================================
//  LIVE PREVIEW
// ================================================================
// (val / esc / ensureHttp / fmtUrl / fmtDesc are hoisted to top of file)

// SVG icons (compact)
const IC_MAIL = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const IC_PHONE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.69 13.5a19.5 19.5 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.79h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 6 6l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const IC_LOC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const IC_LINK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const IC_GLOBE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

function renderPreview() {
  // ── Name + Title ──
  const name = val('f-name') || 'YOUR NAME';
  const title = val('f-title') || 'Your Job Title';
  document.getElementById('rv-name').textContent = name.toUpperCase();
  document.getElementById('rv-title').textContent = title;

  // ── Contacts ──
  const email = val('f-email'), phone = val('f-phone');
  const loc = val('f-location'), li = val('f-linkedin');
  const gh = val('f-github'), ws = val('f-website');
  const contacts = [];
  if (email) contacts.push({ ic: IC_MAIL, text: email, href: `mailto:${email}` });
  if (phone) contacts.push({ ic: IC_PHONE, text: phone, href: `tel:${phone}` });
  if (loc) contacts.push({ ic: IC_LOC, text: loc, href: null });
  if (li) contacts.push({ ic: IC_LINK, text: fmtUrl(li), href: ensureHttp(li) });
  if (gh) contacts.push({ ic: IC_LINK, text: fmtUrl(gh), href: ensureHttp(gh) });
  if (ws) contacts.push({ ic: IC_GLOBE, text: fmtUrl(ws), href: ensureHttp(ws) });
  document.getElementById('rv-contacts').innerHTML = contacts.map(c =>
    c.href
      ? `<a class="rv-contact-item" href="${esc(c.href)}" target="_blank" rel="noopener">${c.ic} ${esc(c.text)}</a>`
      : `<span class="rv-contact-item">${c.ic} ${esc(c.text)}</span>`
  ).join('');

  // ── Summary ──
  const sum = val('f-summary');
  const sumSection = document.getElementById('rv-summary-section');
  const sumEl = document.getElementById('rv-summary');
  if (sum) {
    sumEl.textContent = sum;
    sumEl.style.fontStyle = '';
    sumEl.style.color = '';
    sumSection.style.display = '';
  } else {
    // BUG FIX: hide summary section entirely when empty rather than showing placeholder
    sumSection.style.display = 'none';
  }

  // ── Work Experience ──
  const expEl = document.getElementById('rv-exp-list');
  const expItems = expData.filter(e => e.jobTitle || e.company);
  if (expItems.length === 0) {
    expEl.innerHTML = '<p class="rv-placeholder">Work experience will appear here.</p>';
  } else {
    expEl.innerHTML = expItems.map(e => `
      <div class="rv-entry">
        <div class="rv-entry-header">
          <div class="rv-entry-title">${esc(e.jobTitle || '')}${e.jobTitle && e.company ? ' — ' : ''}${esc(e.company || '')}</div>
          ${e.duration ? `<span class="rv-entry-date">${esc(e.duration)}</span>` : ''}
        </div>
        ${e.expLocation ? `<div class="rv-entry-sub">${esc(e.expLocation)}</div>` : ''}
        ${fmtDesc(e.expDesc)}
      </div>
    `).join('');
  }

  // ── Projects ──
  const projEl = document.getElementById('rv-projects-list');
  const projItems = projData.filter(p => p.projName);
  if (projItems.length === 0) {
    projEl.innerHTML = '<p class="rv-placeholder">Projects will appear here.</p>';
  } else {
    projEl.innerHTML = projItems.map(p => `
      <div class="rv-entry">
        <div class="rv-entry-header">
          <div class="rv-entry-title">${esc(p.projName)}${p.projStatus ? `<span style="font-size:0.74rem;color:#10b981;font-weight:600;margin-left:8px">${esc(p.projStatus)}</span>` : ''}</div>
          ${p.projUrl ? `<a class="rv-entry-url" href="${esc(ensureHttp(p.projUrl))}" target="_blank" rel="noopener">${fmtUrl(p.projUrl)}</a>` : ''}
        </div>
        ${p.projDesc ? `<p class="rv-entry-desc">${esc(p.projDesc)}</p>` : ''}
        ${p.projTech ? `<div class="rv-entry-tags">${p.projTech.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="rv-entry-tag">${esc(t)}</span>`).join('')}</div>` : ''}
      </div>
    `).join('');
  }

  // ── Education ──
  const eduEl = document.getElementById('rv-edu-list');
  const eduItems = eduData.filter(e => e.degree || e.institution);
  if (eduItems.length === 0) {
    eduEl.innerHTML = '<p class="rv-placeholder">Education will appear here.</p>';
  } else {
    eduEl.innerHTML = eduItems.map(e => `
      <div class="rv-entry">
        <div class="rv-entry-header">
          <div class="rv-entry-title">${esc(e.degree || '')}</div>
          ${e.eduYear ? `<span class="rv-entry-date">${esc(e.eduYear)}</span>` : ''}
        </div>
        <div class="rv-entry-sub">${esc(e.institution || '')}${e.gpa ? ` &nbsp;·&nbsp; GPA: ${esc(e.gpa)}` : ''}</div>
        ${e.eduDesc ? fmtDesc(e.eduDesc) : ''}
      </div>
    `).join('');
  }

  // ── Skills ──
  const techSkills = val('f-tech-skills'), toolSkills = val('f-tools');
  const softSkills = val('f-soft-skills'), langs = val('f-languages');
  const skillsEl = document.getElementById('rv-skills-block');
  const rows = [];
  if (techSkills) rows.push({ cat: 'Technical', tags: techSkills });
  if (toolSkills) rows.push({ cat: 'Tools & Platforms', tags: toolSkills });
  if (softSkills) rows.push({ cat: 'Soft Skills', tags: softSkills });
  if (langs) rows.push({ cat: 'Languages', tags: langs });
  if (rows.length === 0) {
    skillsEl.innerHTML = '<p class="rv-placeholder">Skills will appear here.</p>';
  } else {
    skillsEl.innerHTML = rows.map(r => `
      <div class="rv-skills-row">
        <div class="rv-skills-cat">${esc(r.cat)}</div>
        <div class="rv-skills-tags">${r.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="rv-skills-pill">${esc(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  // ── Extras ──
  const extrasSection = document.getElementById('rv-extras-section');
  const extrasBlock = document.getElementById('rv-extras-block');
  const awards = val('f-awards');
  const volunteer = val('f-volunteer');
  const certItems = certData.filter(c => c.certName);
  let extrasHTML = '';
  if (certItems.length) extrasHTML += `<div class="rv-extras-item"><strong>Certifications:</strong> ${certItems.map(c => `${esc(c.certName)}${c.certIssuer ? ` (${esc(c.certIssuer)})` : ''}${c.certYear ? ` — ${esc(c.certYear)}` : ''}`).join(' · ')}</div>`;
  if (awards) extrasHTML += `<div class="rv-extras-item"><strong>Awards:</strong> ${esc(awards).replace(/\n/g, '<br>')}</div>`;
  if (volunteer) extrasHTML += `<div class="rv-extras-item"><strong>Volunteer:</strong> ${esc(volunteer).replace(/\n/g, '<br>')}</div>`;
  extrasBlock.innerHTML = extrasHTML;
  extrasSection.style.display = extrasHTML ? '' : 'none';
}

// ================================================================
//  LOCAL STORAGE
// ================================================================
function save() {
  const data = {
    theme: document.documentElement.getAttribute('data-theme'),
    step: currentStep,
    photo: photoDataUrl,
    inputs: {},
    exp: expData, proj: projData, edu: eduData, certs: certData,
  };
  simpleInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) data.inputs[id] = el.value;
  });
  try { localStorage.setItem('rf_data', JSON.stringify(data)); } catch (e) { }
}

function restore() {
  const raw = localStorage.getItem('rf_data');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    // Theme
    if (data.theme) {
      isDark = data.theme === 'dark';
      document.documentElement.setAttribute('data-theme', data.theme);
      themeBtn.innerHTML = isDark ? MOON : SUN;
    }
    // Photo
    if (data.photo) {
      photoDataUrl = data.photo;
      const thumb = document.getElementById('photo-thumb');
      thumb.innerHTML = `<img src="${photoDataUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
      const rvPhoto = document.getElementById('rv-photo');
      rvPhoto.src = photoDataUrl; rvPhoto.style.display = 'block';
      rvPhoto.removeAttribute('data-placeholder');
      document.getElementById('photo-remove-btn').textContent = 'Remove';
    }
    // Simple inputs
    if (data.inputs) simpleInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && data.inputs[id] !== undefined) el.value = data.inputs[id];
    });
    // Repeatable
    if (data.exp && data.exp.length) { expData = data.exp; renderExperienceList(); }
    if (data.proj && data.proj.length) { projData = data.proj; renderProjectList(); }
    if (data.edu && data.edu.length) { eduData = data.edu; renderEducationList(); }
    if (data.certs && data.certs.length) { certData = data.certs; renderCertList(); }
    // Step (BUG FIX: use internal _goToStep that skips save() to avoid restore→save loop)
    if (data.step >= 1 && data.step <= STEPS.length) _goToStep(data.step);
    // Tag previews (BUG FIX: call wireTagPreview directly, not via input event dispatch which triggers save)
    wireTagPreview('f-tech-skills', 'tech-tags-preview');
    wireTagPreview('f-tools', 'tools-tags-preview');
    wireTagPreview('f-soft-skills', 'soft-tags-preview');
    // Char counter
    summaryCount.textContent = `${summaryEl.value.length} / 600 characters`;
    renderPreview();
  } catch (e) { console.warn('Restore failed', e); }
}

restore();
renderPreview();

// ================================================================
//  MOBILE TAB SWITCHER
// ================================================================
function switchTab(tab) {
  const formCol = document.getElementById('form-column');
  const prevCol = document.getElementById('preview-column');
  const tabForm = document.getElementById('tab-form');
  const tabPrev = document.getElementById('tab-preview');
  if (tab === 'form') {
    formCol.classList.remove('tab-hidden'); prevCol.classList.remove('tab-visible');
    tabForm.classList.add('active'); tabPrev.classList.remove('active');
  } else {
    formCol.classList.add('tab-hidden'); prevCol.classList.add('tab-visible');
    tabPrev.classList.add('active'); tabForm.classList.remove('active');
  }
}
