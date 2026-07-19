/* ═══════════════════════════════════════════════════════════════════
   SAMIKSHA LOVE — JavaScript ❤️ ENHANCED
   Extra love effects: click hearts, heartbeat monitor, typewriter,
   constellation, love meter, polaroids, emotion ripples
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
//  CUSTOM CURSOR — Heart-themed
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

  // Click pulse
  document.addEventListener('mousedown', () => {
    ring.classList.add('is-clicking');
    setTimeout(() => ring.classList.remove('is-clicking'), 500);
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
//  CLICK HEART BURST (Click anywhere)
// ─────────────────────────────────────────
(function initHeartBurst() {
  const canvas = $('#heart-burst-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const HEART_SYMBOLS = ['❤', '♥', '💕', '✦', '★'];
  const COLORS = ['#c94a6a','#c9a84c','#e8c96d','#f0dfa0','#8c2035'];

  class HeartParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1.5, 6);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = rand(0.02, 0.04);
      this.size = rand(12, 22);
      this.symbol = HEART_SYMBOLS[randInt(0, HEART_SYMBOLS.length - 1)];
      this.color = COLORS[randInt(0, COLORS.length - 1)];
      this.rotation = rand(0, Math.PI * 2);
      this.rotSpeed = rand(-0.1, 0.1);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.12;
      this.vx *= 0.98;
      this.alpha -= this.decay;
      this.rotation += this.rotSpeed;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.font = `${this.size}px serif`;
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillText(this.symbol, -this.size * 0.3, this.size * 0.3);
      ctx.restore();
    }
    get alive() { return this.alpha > 0; }
  }

  let particles = [];

  function spawnBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      particles.push(new HeartParticle(x, y));
    }
  }

  document.addEventListener('click', (e) => {
    spawnBurst(e.clientX, e.clientY, 16);
  });

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter(p => p.alive);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    raf(loop);
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
      r: rand(0.2, 1.4),
      alpha: rand(0.1, 0.7),
      speed: rand(0.002, 0.008),
      phase: rand(0, Math.PI * 2),
      isRose: Math.random() < 0.1, // 10% are pink
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.isRose
        ? `rgba(201,74,106,${a})`
        : `rgba(201,168,76,${a})`;
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
//  AMBIENT HEARTBEAT LINE (bottom of screen)
// ─────────────────────────────────────────
(function initAmbientHeartbeat() {
  const canvas = $('#heartbeat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let offset = 0;

  function drawEKG() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201, 74, 106, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(201, 74, 106, 0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const mid = H / 2;
    const beatWidth = 200;

    for (let x = -beatWidth; x < W + beatWidth; x++) {
      const localX = (x + offset) % beatWidth;
      let y = mid;

      if (localX < 60) {
        y = mid;
      } else if (localX < 65) {
        y = mid - 4;
      } else if (localX < 70) {
        y = mid + 18;
      } else if (localX < 78) {
        y = mid - 30;
      } else if (localX < 85) {
        y = mid + 8;
      } else if (localX < 90) {
        y = mid;
      } else {
        y = mid;
      }

      if (x === -beatWidth) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    offset = (offset + 1.2) % beatWidth;
    raf(drawEKG);
  }

  drawEKG();
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
      const isHeart = Math.random() < 0.3;
      return {
        x: rand(0, W), y: rand(H * 0.3, H),
        vx: rand(-0.3, 0.3), vy: rand(-0.8, -0.3),
        r: rand(1, 3),
        alpha: rand(0.2, 0.6),
        life: 0, maxLife: rand(120, 300),
        isHeart,
      };
    }

    resize();
    window.addEventListener('resize', resize);
    pts = Array.from({ length: 100 }, mkPt);

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
        ctx.fillStyle = p.isHeart
          ? `rgba(201,74,106,${a})`
          : `rgba(201,168,76,${a})`;
        ctx.fill();
      }
      raf(loop);
    })();
  })();

  function openExperience() {
    curtainL.classList.add('is-open');
    curtainR.classList.add('is-open');

    setTimeout(() => {
      screen.classList.add('is-hidden');
      main.classList.add('is-visible');
      initPetalRain(petals);
      initFloatingHearts();
      initScrollAnimations();
      initTypewriter();
      initHeartbeatMonitor();
      initConstellationCanvas();
      initLoveConstellationBackground();
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

  function drawPetal(ctx, x, y, w, h, angle, alpha, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.5);
    if (hue === 'gold') {
      g.addColorStop(0, 'rgba(201,168,76,0.9)');
      g.addColorStop(0.6, 'rgba(139,105,20,0.7)');
      g.addColorStop(1, 'rgba(80,55,5,0.3)');
    } else {
      g.addColorStop(0, 'rgba(180, 40, 70, 0.9)');
      g.addColorStop(0.6, 'rgba(140, 20, 50, 0.7)');
      g.addColorStop(1, 'rgba(100, 10, 30, 0.3)');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function mkPetal() {
    return {
      x: rand(-50, W + 50),
      y: rand(-150, -50),
      w: rand(8, 20), h: rand(14, 32),
      angle: rand(0, Math.PI * 2),
      rot: rand(-0.025, 0.025),
      vy: rand(0.8, 2.2),
      vx: rand(-0.8, 0.8),
      alpha: rand(0.4, 0.9),
      swing: rand(0.01, 0.03),
      swingPhase: rand(0, Math.PI * 2),
      t: 0,
      hue: Math.random() < 0.2 ? 'gold' : 'rose',
    };
  }

  for (let i = 0; i < 40; i++) {
    const p = mkPetal();
    p.y = rand(0, H);
    petals.push(p);
  }

  let active = true;
  (function loop() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.t++;
      p.x += p.vx + Math.sin(p.t * p.swing + p.swingPhase) * 0.6;
      p.y += p.vy;
      p.angle += p.rot;
      if (p.y > H + 60) { petals[i] = mkPetal(); }
      drawPetal(ctx, p.x, p.y, p.w, p.h, p.angle, p.alpha, p.hue);
    }
    raf(loop);
  })();
}

// ─────────────────────────────────────────
//  FLOATING HEARTS (enhanced)
// ─────────────────────────────────────────
function initFloatingHearts() {
  const container = $('#floating-hearts');
  if (!container) return;

  const symbols = ['❤️','💕','💖','💗','💝','🌹','✨','💫','⭐','💞','🌸','✦'];

  function spawnHeart() {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = symbols[randInt(0, symbols.length - 1)];
    const left   = rand(3, 97);
    const dur    = rand(8, 18);
    const delay  = rand(0, 4);
    const drift  = rand(-80, 80) + 'px';
    const size   = rand(0.8, 1.8);
    el.style.cssText = `
      left: ${left}%;
      --duration: ${dur}s;
      --delay: ${delay}s;
      --drift: ${drift};
      font-size: ${size}rem;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay) * 1000);
  }

  for (let i = 0; i < 20; i++) setTimeout(spawnHeart, i * 800);
  setInterval(spawnHeart, 1400);
}

// ─────────────────────────────────────────
//  LOVE CONSTELLATION BACKGROUND
// ─────────────────────────────────────────
function initLoveConstellationBackground() {
  const canvas = $('#love-constellation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Random star nodes that connect
  const nodes = Array.from({ length: 25 }, () => ({
    x: rand(0, W), y: rand(0, H),
    vx: rand(-0.05, 0.05), vy: rand(-0.05, 0.05),
    r: rand(0.5, 1.5),
    alpha: rand(0.3, 0.8),
  }));

  let t = 0;
  (function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // Move nodes slowly
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const a = (1 - dist / 180) * 0.15;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const flicker = n.alpha * (0.6 + 0.4 * Math.sin(t * 0.02 + n.x));
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${flicker})`;
      ctx.fill();
    }

    raf(loop);
  })();
}

// ─────────────────────────────────────────
//  TYPEWRITER EFFECT (Love Letter)
// ─────────────────────────────────────────
function initTypewriter() {
  const el = $('#typewriter-text');
  if (!el) return;

  const messages = [
    "You walked into my life softly, like the first note of a song that you know will become your favorite...",
    "Every time I look at you, I see someone who makes the ordinary world feel extraordinary...",
    "You are not just someone I love. You are the person who makes me feel like I have come home.",
    "If I could write a thousand letters, they would all say the same thing — you are my greatest joy.",
    "In every version of my story, in every world that could exist, I would choose you. Always.",
  ];

  let msgIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 60;

  function type() {
    const msg = messages[msgIdx];

    if (!isDeleting) {
      el.textContent = msg.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx >= msg.length) {
        isDeleting = true;
        delay = 40;
        setTimeout(type, 2800); // pause before deleting
        return;
      }
    } else {
      el.textContent = msg.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx <= 0) {
        isDeleting = false;
        delay = 60;
        msgIdx = (msgIdx + 1) % messages.length;
      }
    }

    setTimeout(type, isDeleting ? 25 : delay);
  }

  setTimeout(type, 800);
}

// ─────────────────────────────────────────
//  HEARTBEAT MONITOR CANVAS
// ─────────────────────────────────────────
function initHeartbeatMonitor() {
  const canvas = $('#hb-monitor-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = 80;
  }
  resize();

  let offset = 0;
  let beat = false;
  let beatIntensity = 0;

  // Animate BPM number
  const bpmEl = $('#hb-bpm');
  setInterval(() => {
    beat = true;
    beatIntensity = 1;
    if (bpmEl) {
      bpmEl.style.transform = 'scale(1.2)';
      setTimeout(() => { bpmEl.style.transform = ''; }, 200);
    }
  }, 833); // ~72bpm

  // Interactive beat button
  const btn = $('#heartbeat-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      btn.classList.add('is-beating');
      // Rapid fire beats
      for (let i = 0; i < 5; i++) {
        setTimeout(() => { beat = true; beatIntensity = 1.5; }, i * 200);
      }
      setTimeout(() => btn.classList.remove('is-beating'), 1200);
    });
  }

  (function drawMonitor() {
    ctx.clearRect(0, 0, W, H);

    // Background glow
    if (beatIntensity > 0) {
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
      grd.addColorStop(0, `rgba(201,74,106,${beatIntensity * 0.08})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      beatIntensity = Math.max(0, beatIntensity - 0.03);
    }

    // Draw EKG waveform
    ctx.strokeStyle = '#c94a6a';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#c94a6a';
    ctx.shadowBlur = beat ? 15 : 5;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const beatW = 120; // width of one heartbeat cycle
    const mid = H * 0.55;

    for (let x = 0; x < W; x++) {
      const localX = (x + offset) % beatW;
      let y = mid;

      if (localX < 30) {
        y = mid;
      } else if (localX < 35) {
        y = mid - 3;
      } else if (localX < 40) {
        y = mid + 8;
      } else if (localX < 46) {
        y = mid - (beat ? 42 : 38);
        if (localX === 43) beat = false;
      } else if (localX < 52) {
        y = mid + 15;
      } else if (localX < 58) {
        y = mid - 8;
      } else if (localX < 62) {
        y = mid;
      } else {
        y = mid;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Scan line effect
    ctx.strokeStyle = 'rgba(201,74,106,0.4)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();
    ctx.setLineDash([]);

    offset = (offset + 1.5) % beatW;
    raf(drawMonitor);
  })();
}

// ─────────────────────────────────────────
//  CONSTELLATION CANVAS (section)
// ─────────────────────────────────────────
function initConstellationCanvas() {
  const canvas = $('#const-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = 200;
  }
  resize();

  // Star positions forming heart shape
  function heartPoint(t, scale) {
    const x = scale * 16 * Math.pow(Math.sin(t), 3);
    const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: W/2 + x, y: H/2 + y };
  }

  const numStars = 30;
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    const t = (i / numStars) * Math.PI * 2;
    const pt = heartPoint(t, 7);
    stars.push({
      x: pt.x,
      y: pt.y,
      r: rand(1, 2.5),
      phase: rand(0, Math.PI * 2),
      drawn: false,
    });
  }

  // Also name stars
  const nameStars = [];
  const names = ['G', 'o', 'k', 'u', 'l', '♥', 'S', 'a', 'm', 'i', 'k', 's', 'h', 'a'];
  const spacing = W / (names.length + 1);
  names.forEach((ch, i) => {
    nameStars.push({
      x: spacing * (i + 1),
      y: H * 0.85,
      label: ch,
      r: ch === '♥' ? 3 : 1.5,
    });
  });

  let drawProgress = 0;
  let t = 0;

  (function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);

    drawProgress = Math.min(1, drawProgress + 0.008);
    const visibleCount = Math.floor(drawProgress * stars.length);

    // Draw connections (heart outline)
    if (visibleCount > 1) {
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const s = stars[i];
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      if (visibleCount === stars.length) ctx.closePath();
      ctx.stroke();
    }

    // Draw stars
    for (let i = 0; i < visibleCount; i++) {
      const s = stars[i];
      const flicker = 0.6 + 0.4 * Math.sin(t * 0.05 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * flicker, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${flicker})`;
      ctx.shadowColor = 'rgba(201,168,76,0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw name stars
    ctx.font = '11px Cinzel, serif';
    ctx.textAlign = 'center';
    for (const s of nameStars) {
      const flicker = 0.5 + 0.5 * Math.sin(t * 0.03 + s.x);
      if (s.label === '♥') {
        ctx.fillStyle = `rgba(201,74,106,${flicker})`;
        ctx.font = '14px serif';
        ctx.shadowColor = 'rgba(201,74,106,0.8)';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(245,234,216,${flicker * 0.7})`;
        ctx.font = '11px Cinzel, serif';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(s.label, s.x, s.y);
      ctx.shadowBlur = 0;

      // Dots
      ctx.beginPath();
      ctx.arc(s.x, s.y - 14, s.r * flicker, 0, Math.PI * 2);
      ctx.fillStyle = s.label === '♥' ? `rgba(201,74,106,${flicker})` : `rgba(201,168,76,${flicker})`;
      ctx.fill();
    }

    // Connecting line between name stars
    ctx.strokeStyle = 'rgba(201,168,76,0.15)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    nameStars.forEach((s, i) => {
      if (i === 0) ctx.moveTo(s.x, s.y - 14);
      else ctx.lineTo(s.x, s.y - 14);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    raf(loop);
  })();
}

// ─────────────────────────────────────────
//  SCROLL ANIMATIONS (IntersectionObserver)
// ─────────────────────────────────────────
function initScrollAnimations() {
  // Chapter frames
  const frames = $$('.chapter-frame');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  frames.forEach((el) => observer.observe(el));

  // Love letter
  const letterFrame = $('.love-letter-frame');
  if (letterFrame) {
    const lo = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        letterFrame.classList.add('is-visible');
        lo.unobserve(letterFrame);
      }
    }, { threshold: 0.15 });
    lo.observe(letterFrame);
  }

  // Heartbeat section
  const hbSection = $('.heartbeat-inner');
  if (hbSection) {
    const ho = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        hbSection.classList.add('is-visible');
        ho.unobserve(hbSection);
      }
    }, { threshold: 0.15 });
    ho.observe(hbSection);
  }

  // Love oath section
  const oathContent = $('.love-oath-content');
  if (oathContent) {
    const oo = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        oathContent.classList.add('is-visible');
        oo.unobserve(oathContent);
      }
    }, { threshold: 0.1 });
    oo.observe(oathContent);
  }

  // Oath cards individual stagger
  const oathCards = $$('.oath-card');
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  oathCards.forEach(el => cardObs.observe(el));

  // Polaroids
  const polaroids = $$('.polaroid');
  const polObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        polObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  polaroids.forEach(el => polObs.observe(el));

  // Constellation section
  const constSection = $('.constellation-content');
  if (constSection) {
    const co = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        constSection.classList.add('is-visible');
        co.unobserve(constSection);
      }
    }, { threshold: 0.15 });
    co.observe(constSection);
  }

  // Love meter (finale)
  const loveMeterFill = $('#love-meter-fill');
  const loveMeterGlow = $('.love-meter-glow');
  const finaleSection = $('#finale');
  if (finaleSection && loveMeterFill) {
    let meterTriggered = false;
    const fObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !meterTriggered) {
        meterTriggered = true;
        setTimeout(() => {
          loveMeterFill.style.width = '100%';
          if (loveMeterGlow) loveMeterGlow.classList.add('active');
        }, 600);
      }
    }, { threshold: 0.2 });
    fObs.observe(finaleSection);
  }

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
//  FIREWORKS / SPARKLES (Finale) — Enhanced
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
    [160,120,50],[180,50,80],[201,74,106],
    [255,180,200],[255,220,100],
  ];

  const HEART_CHARS = ['♥', '★', '✦', '❤'];

  class Particle {
    constructor(x, y) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1, 6);
      this.x = x; this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = rand(0.012, 0.022);
      const c = COLORS[randInt(0, COLORS.length - 1)];
      this.color = `rgb(${c[0]},${c[1]},${c[2]})`;
      this.r = rand(1.5, 4);
      this.trail = [];
      this.isHeart = Math.random() < 0.12;
      this.heartChar = HEART_CHARS[randInt(0, HEART_CHARS.length - 1)];
      this.size = rand(10, 18);
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();
      this.x  += this.vx;
      this.y  += this.vy;
      this.vy += 0.07;
      this.vx *= 0.98;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      if (this.isHeart) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.font = `${this.size}px serif`;
        ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `,${this.alpha})`);
        ctx.fillText(this.heartChar, this.x, this.y);
        ctx.restore();
        return;
      }
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
      explode(W * x, H * y, 110);
    }, delay);
  });

  const intervalId = setInterval(() => {
    resize();
    explode(rand(W * 0.15, W * 0.85), rand(H * 0.2, H * 0.7), 80);
  }, 2200);

  let running = true;
  (function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter(p => p.alive);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    raf(loop);
  })();

  setTimeout(() => { running = false; clearInterval(intervalId); }, 40000);
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
    // Also parallax the big heart slightly
    const heroHeart = $('.hero-big-heart');
    if (heroHeart) {
      heroHeart.style.transform = `translate(${mx * 4}px, ${my * 4}px)`;
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
    setInterval(() => {
      if (Math.random() < 0.3) {
        lk.style.opacity = rand(0.1, 0.7).toString();
        setTimeout(() => lk.style.opacity = '', 400);
      }
    }, 3000 + i * 1500);
  });
})();

// ─────────────────────────────────────────
//  EMOTION RIPPLE on scroll
// ─────────────────────────────────────────
(function initEmotionRipple() {
  let lastY = window.scrollY;
  let rippleTimeout;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const delta = Math.abs(currentY - lastY);
    lastY = currentY;

    if (delta > 30) {
      clearTimeout(rippleTimeout);
      rippleTimeout = setTimeout(() => {
        // Create ripple element
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3);
          pointer-events: none;
          z-index: 9950;
          animation: scroll-ripple 1s ease-out forwards;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
      }, 100);
    }
  });

  // Add CSS for scroll ripple
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scroll-ripple {
      from { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
      to   { transform: translate(-50%, -50%) scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────
//  HERO NAME — letter-by-letter glow
// ─────────────────────────────────────────
(function initHeroNameEffect() {
  const heroName = $('#hero-name');
  if (!heroName) return;

  const name = 'Samiksha';
  heroName.innerHTML = name.split('').map((ch, i) =>
    `<span style="display:inline-block;animation:letter-shimmer 3s ease-in-out ${i*0.15}s infinite">${ch}</span>`
  ).join('');

  const style = document.createElement('style');
  style.textContent = `
    @keyframes letter-shimmer {
      0%, 100% { color: #e8c96d; text-shadow: 0 0 40px rgba(201,168,76,0.3); }
      50%       { color: #f5ead8; text-shadow: 0 0 80px rgba(232,201,109,0.8), 0 0 120px rgba(201,74,106,0.2); }
    }
  `;
  document.head.appendChild(style);
})();
