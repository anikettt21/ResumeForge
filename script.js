// ── PARTICLES ──
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const PARTICLE_COUNT = 60;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function getAccentColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? '108, 142, 255' : '76, 110, 245';
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.4 + 0.1,
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const c = getAccentColor();

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c}, ${p.alpha})`;
    ctx.fill();

    p.x += p.dx; p.y += p.dy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${c}, ${0.08 * (1 - dist / 120)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── CURSOR SPOTLIGHT ──
const spotlight = document.getElementById('spotlight');
document.addEventListener('mousemove', e => {
  spotlight.style.left = e.clientX + 'px';
  spotlight.style.top = e.clientY + 'px';
});

// ── THEME TOGGLE ──
const themeBtn = document.getElementById('theme-btn');
let isDark = true;
themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
});

// ── TYPEWRITER ──
const taglines = [
  'Building full-stack products fast using AI-assisted development.',
  'Shipped a live SaaS, multiple web apps, and tools that reach real users.',
  'Turning ideas into live products — rapidly and reliably.',
];
let tIdx = 0, cIdx = 0, deleting = false;
const taglineEl = document.getElementById('tagline');

function typeWriter() {
  const full = taglines[tIdx];
  if (!deleting) {
    cIdx++;
    taglineEl.innerHTML = full.slice(0, cIdx) + '<span class="typewriter-cursor"></span>';
    if (cIdx === full.length) {
      deleting = true;
      setTimeout(typeWriter, 2200);
      return;
    }
  } else {
    cIdx--;
    taglineEl.innerHTML = full.slice(0, cIdx) + '<span class="typewriter-cursor"></span>';
    if (cIdx === 0) {
      deleting = false;
      tIdx = (tIdx + 1) % taglines.length;
    }
  }
  setTimeout(typeWriter, deleting ? 28 : 46);
}
typeWriter();

// ── SCROLL ANIMATIONS ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── ANIMATED COUNTERS ──
const counters = document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.ceil(target / 30);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + '+';
        if (current >= target) clearInterval(timer);
      }, 40);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

// ── SKILL BAR ANIMATION ──
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.prof-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
      barObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-card').forEach(card => barObs.observe(card));

// ── ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[data-section="${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObs.observe(s));

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}
