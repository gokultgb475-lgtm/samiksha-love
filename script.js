/* ═══════════════════════════════════════════════════════════════════
   SAMIKSHA LOVE — JavaScript
   Handles: Intro, Cursor, Stars, Petals, Fireworks, Scroll animations
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const raf = requestAnimationFrame;

function lerp(a, b, t) { return a + (b - a) * t; }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

// ─────────────────────────────────────────
//  CUSTOM CURSOR
// ─────────────────────────────────────────
(function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Interactive elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches('button, a, [role="button"]')) {
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.matches('button, a, [role="button"]')) {
      ring.classList.remove('is-hovering');
    }
  });

  (function animRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf(animRing);
  })();
})();

// ─────────────────────────────────────────
//  STARFIELD CANVAS
// ─────────────────────────────────────────
(function initStarfield() {
  const canvas = $('#starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n) {
    return Array.from({ length: n }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.2, 1.2),
      alpha: rand(0.1, 0.7),
      speed: rand(0.002, 0.008),
      phase: rand(0, Math.PI * 2),
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${a})`;
      ctx.fill();
    }
    raf(drawStars);
  }

  resize();
  window.addEventListener('resize', () => { resize(); stars = createStars(200); });
  stars = createStars(200);
  raf(drawStars);
})();

// ─────────────────────────────────────────
//  INTRO SCREEN
// ─────────────────────────────────────────
(function initIntro() {
  const screen  = $('#intro-screen');
  const btnBegin = $('#intro-begin-btn');
  const curtainL = $('#curtain-left');
  const curtainR = $('#curtain-right');
  const main     = $('#main-experience');
  const petals   = $('#petals-canvas');

  if (!screen || !btnBegin) return;

  // Particle system on intro canvas
  (function initIntroParticles() {
    const c   = $('#intro-particles');
    if (!c) return;
    const ctx = c.getContext('2d');
    let W, H, pts = [];

    function resize() {
      W = c.width  = window.innerWidth;
      H = c.height = window.innerHeight;
    }

    function mkPt() {
      return {
        x: rand(0, W), y: rand(H * 0.3, H),
        vx: rand(-0.3, 0.3), vy: rand(-0.8, -0.3),
        r: rand(1, 3),
        alpha: rand(0.2, 0.6),
        life: 0, maxLife: rand(120, 300),
      };
    }

    resize();
    window.addEventListener('resize', resize);
    pts = Array.from({ length: 80 }, mkPt);

    let t = 0;
    (function loop() {
      t++;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.maxLife) { pts[i] = mkPt(); continue; }
        const prog = p.life / p.maxLife;
        const a    = p.alpha * Math.sin(prog * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${a})`;
        ctx.fill();
      }
      raf(loop);
    })();
  })();

  function openExperience() {
    // Open curtains
    curtainL.classList.add('is-open');
    curtainR.classList.add('is-open');

    setTimeout(() => {
      screen.classList.add('is-hidden');
      main.classList.add('is-visible');
      initPetalRain(petals);
      initFloatingHearts();
      initScrollAnimations();
    }, 1400);
  }

  btnBegin.addEventListener('click', openExperience);
})();

// ─────────────────────────────────────────
//  ROSE PETAL RAIN
// ─────────────────────────────────────────
function initPetalRain(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, petals = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Draw a simple stylized petal shape
  function drawPetal(ctx, x, y, w, h, angle, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    // Gradient fill
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.5);
    g.addColorStop(0, 'rgba(180, 40, 70, 0.9)');
    g.addColorStop(0.6, 'rgba(140, 20, 50, 0.7)');
    g.addColorStop(1, 'rgba(100, 10, 30, 0.3)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function mkPetal() {
    return {
      x: rand(-50, W + 50),
      y: rand(-150, -50),
      w: rand(8, 18), h: rand(14, 30),
      angle: rand(0, Math.PI * 2),
      rot: rand(-0.025, 0.025),
      vy: rand(0.8, 2),
      vx: rand(-0.6, 0.6),
      alpha: rand(0.4, 0.85),
      swing: rand(0.01, 0.03),
      swingPhase: rand(0, Math.PI * 2),
      t: 0,
    };
  }

  for (let i = 0; i < 30; i++) {
    const p = mkPetal();
    p.y = rand(0, H); // scatter vertically at start
    petals.push(p);
  }

  let active = true;
  (function loop() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.t++;
      p.x += p.vx + Math.sin(p.t * p.swing + p.swingPhase) * 0.5;
      p.y += p.vy;
      p.angle += p.rot;
      if (p.y > H + 60) { petals[i] = mkPetal(); }
      drawPetal(ctx, p.x, p.y, p.w, p.h, p.angle, p.alpha);
    }
    raf(loop);
  })();
}

// ─────────────────────────────────────────
//  FLOATING HEARTS
// ─────────────────────────────────────────
function initFloatingHearts() {
  const container = $('#floating-hearts');
  if (!container) return;

  const symbols = ['❤️','💕','💖','💗','💝','🌹','✨'];

  function spawnHeart() {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = symbols[randInt(0, symbols.length - 1)];
    const left   = rand(5, 95);
    const dur    = rand(7, 16);
    const delay  = rand(0, 4);
    const drift  = rand(-60, 60) + 'px';
    el.style.cssText = `
      left: ${left}%;
      --duration: ${dur}s;
      --delay: ${delay}s;
      --drift: ${drift};
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay) * 1000);
  }

  // Spawn continuously
  for (let i = 0; i < 12; i++) setTimeout(spawnHeart, i * 1200);
  setInterval(spawnHeart, 1800);
}

// ─────────────────────────────────────────
//  SCROLL ANIMATIONS (IntersectionObserver)
// ─────────────────────────────────────────
function initScrollAnimations() {
  const frames = $$('.chapter-frame');
  if (!frames.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  frames.forEach((el) => observer.observe(el));

  // Smooth scroll on CTA
  const cta = $('#scroll-cta');
  if (cta) {
    cta.addEventListener('click', () => {
      $('#chapter-1').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Finale fireworks on scroll
  const finale = $('#finale');
  if (finale) {
    let fireworksStarted = false;
    const finaleObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fireworksStarted) {
        fireworksStarted = true;
        initFireworks($('#fireworks-canvas'));
      }
    }, { threshold: 0.2 });
    finaleObserver.observe(finale);
  }

  // Replay
  const replayBtn = $('#replay-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ─────────────────────────────────────────
//  FIREWORKS / SPARKLES (Finale)
// ─────────────────────────────────────────
function initFireworks(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();

  const COLORS = [
    [201,168,76],[232,201,109],[240,223,160],
    [200,80,100],[255,200,180],[255,255,220],
    [160,120,50],[180,50,80]
  ];

  class Particle {
    constructor(x, y) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1, 5);
      this.x = x; this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = rand(0.012, 0.025);
      const c = COLORS[randInt(0, COLORS.length - 1)];
      this.color = `rgb(${c[0]},${c[1]},${c[2]})`;
      this.r = rand(1.5, 3.5);
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 5) this.trail.shift();
      this.x  += this.vx;
      this.y  += this.vy;
      this.vy += 0.06; // gravity
      this.vx *= 0.98;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = this.alpha * (i / this.trail.length) * 0.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `,${a})`);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `,${this.alpha})`);
      ctx.fill();
    }
    get alive() { return this.alpha > 0; }
  }

  let particles = [];

  function explode(x, y, n = 80) {
    for (let i = 0; i < n; i++) particles.push(new Particle(x, y));
  }

  // Scheduled bursts
  const schedule = [
    { delay:  400, x: 0.5,  y: 0.35 },
    { delay:  900, x: 0.25, y: 0.45 },
    { delay: 1400, x: 0.75, y: 0.4  },
    { delay: 1900, x: 0.6,  y: 0.55 },
    { delay: 2400, x: 0.35, y: 0.3  },
    { delay: 3000, x: 0.5,  y: 0.25 },
    { delay: 3500, x: 0.2,  y: 0.6  },
    { delay: 4000, x: 0.8,  y: 0.5  },
    { delay: 4600, x: 0.5,  y: 0.4  },
  ];

  schedule.forEach(({ delay, x, y }) => {
    setTimeout(() => {
      resize();
      explode(W * x, H * y, 100);
    }, delay);
  });

  // Random ongoing bursts
  const intervalId = setInterval(() => {
    resize();
    explode(rand(W * 0.15, W * 0.85), rand(H * 0.2, H * 0.7), 70);
  }, 2000);

  let running = true;
  (function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter(p => p.alive);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    raf(loop);
  })();

  // Stop after 30 seconds
  setTimeout(() => { running = false; clearInterval(intervalId); }, 30000);
}

// ─────────────────────────────────────────
//  PARALLAX on mouse move
// ─────────────────────────────────────────
(function initParallax() {
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  (function loop() {
    const heroArch = $('.hero-arch');
    if (heroArch) {
      heroArch.style.transform = `translate(calc(-50% + ${mx * 8}px), calc(-50% + ${my * 8}px))`;
    }
    raf(loop);
  })();
})();

// ─────────────────────────────────────────
//  LETTERBOX on chapter entry
// ─────────────────────────────────────────
(function initLetterbox() {
  const bars = $$('.letterbox');
  const hero = $('#hero');
  if (!hero || !bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    const onHero = entries[0].isIntersecting;
    bars.forEach(b => b.classList.toggle('active', !onHero));
  }, { threshold: 0.3 });

  observer.observe(hero);
})();

// ─────────────────────────────────────────
//  LIGHT LEAKS — random flashes
// ─────────────────────────────────────────
(function initLightLeakFlicker() {
  const leaks = $$('.light-leak');
  leaks.forEach((lk, i) => {
    const baseDelay = i * 4;
    lk.style.animationDelay = `${baseDelay}s`;
    // Random extra flicker
    setInterval(() => {
      if (Math.random() < 0.3) {
        lk.style.opacity = rand(0.1, 0.6).toString();
        setTimeout(() => lk.style.opacity = '', 400);
      }
    }, 3000 + i * 1500);
  });
})();
