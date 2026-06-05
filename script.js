// ===================================
// LOADER
// ===================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    document.body.style.overflow = 'visible';
    initAnimations();
  }, 2200);
});
document.body.style.overflow = 'hidden';

// ===================================
// CURSOR
// ===================================
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  if (trail) { trail.style.left = trailX + 'px'; trail.style.top = trailY + 'px'; }
  requestAnimationFrame(animateTrail);
}
animateTrail();

// ===================================
// NAVBAR
// ===================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
});

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

hamburger.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => navLinksContainer.classList.remove('open'));
});

// ===================================
// THEME TOGGLE
// ===================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
let isDark = true;

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
});

// ===================================
// TYPED TEXT
// ===================================
const typedStrings = [
  'Computer Science Student',
  'AI Enthusiast',
  'Machine Learning Learner',
  'Future Software Engineer',
  'Problem Solver',
  'GATE Aspirant'
];
let typedIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typed-text');

function typeText() {
  const current = typedStrings[typedIndex];
  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  let speed = isDeleting ? 60 : 100;
  if (!isDeleting && charIndex === current.length) {
    speed = 2000; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typedIndex = (typedIndex + 1) % typedStrings.length;
    speed = 400;
  }
  setTimeout(typeText, speed);
}
typeText();

// ===================================
// HERO CANVAS — PARTICLES
// ===================================
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      if (mouse.x) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 100) {
          this.x -= dx * 0.015; this.y -= dy * 0.015;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 183, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(110,231,183,${0.06 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

// ===================================
// COUNTER ANIMATION
// ===================================
function animateCounters() {
  const counters = document.querySelectorAll('.counter, .stat-num[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isFloat = !Number.isInteger(target);
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ===================================
// SKILL BAR ANIMATIONS
// ===================================
function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

// ===================================
// VANILLA TILT (Project Cards)
// ===================================
function initTilt() {
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
      max: 8, speed: 400, glare: true,
      'max-glare': 0.08, perspective: 1000
    });
  }
}

// ===================================
// MAGNETIC BUTTONS
// ===================================
function initMagnetic() {
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ===================================
// CARD GLOW MOUSE EFFECT
// ===================================
function initCardGlow() {
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, var(--accent-glow), transparent 60%)`;
      }
    });
  });
}

// ===================================
// GITHUB API
// ===================================
async function fetchGitHub() {
  const username = 'soniabhayprakash-code';
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    const data = await res.json();
    if (data.public_repos !== undefined) {
      document.getElementById('gh-repos').textContent = data.public_repos;
      document.getElementById('gh-followers').textContent = data.followers;
      document.getElementById('gh-following').textContent = data.following;
    }

    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    const repos = await repoRes.json();
    const grid = document.getElementById('ghRepos');
    if (repos && repos.length > 0) {
      grid.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="gh-repo-card glass-card">
          <div class="card-glow"></div>
          <div class="gh-repo-name">
            <i class="fas fa-book"></i> ${repo.name}
          </div>
          <p class="gh-repo-desc">${repo.description || 'No description available.'}</p>
          <div class="gh-repo-meta">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            ${repo.language ? `<span><i class="fas fa-circle" style="color:var(--accent);font-size:0.5rem"></i> ${repo.language}</span>` : ''}
          </div>
        </a>
      `).join('');
      // Re-init glow for new cards
      initCardGlow();
    } else {
      grid.innerHTML = `<div class="gh-loading">No public repositories found. <a href="https://github.com/${username}" target="_blank" style="color:var(--accent)">View Profile →</a></div>`;
    }
  } catch {
    document.getElementById('ghRepos').innerHTML = `<div class="gh-loading">Could not load repositories. <a href="https://github.com/${username}" target="_blank" style="color:var(--accent)">Visit GitHub →</a></div>`;
  }
}

// ===================================
// CONTACT FORM
// ===================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
    btn.disabled = true;

    const formData = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value
    };

    try {
      // Try backend API first
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showStatus('success', '✓ Message sent! I\'ll get back to you soon.');
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Graceful fallback
      showStatus('success', '✓ Message received! (Demo mode — backend connects via Node.js)');
      form.reset();
    }

    btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Message</span>';
    btn.disabled = false;
  });

  function showStatus(type, msg) {
    status.className = 'form-status ' + type;
    status.textContent = msg;
    setTimeout(() => status.className = 'form-status', 5000);
  }
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ===================================
// AOS INIT
// ===================================
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
  }
}

// ===================================
// YEAR
// ===================================
document.getElementById('year').textContent = new Date().getFullYear();

// ===================================
// MAIN INIT
// ===================================
function initAnimations() {
  initHeroCanvas();
  animateCounters();
  animateSkillBars();
  initTilt();
  initMagnetic();
  initCardGlow();
  fetchGitHub();
  initContactForm();
  initSmoothScroll();
  initAOS();
}
