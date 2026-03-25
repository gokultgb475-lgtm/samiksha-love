const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const mobileLike = window.matchMedia('(max-width: 820px)').matches;

// Apple emoji image CDN
const APPLE_EMOJI_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/';
const APPLE_EMOJI_MAP = {
  '\u2764\uFE0F': '2764-fe0f', '\u2764': '2764-fe0f',
  '\u2665\uFE0F': '2665-fe0f', '\u2665': '2665-fe0f',
  '\uD83D\uDC96': '1f496', '\uD83D\uDC95': '1f495',
  '\uD83D\uDC97': '1f497', '\uD83D\uDC93': '1f493',
  '\uD83D\uDC98': '1f498', '\uD83D\uDC9D': '1f49d',
  '\uD83D\uDC9E': '1f49e', '\uD83D\uDC9B': '1f49b',
  '\uD83D\uDC9C': '1f49c', '\uD83D\uDC9A': '1f49a',
  '\uD83D\uDC99': '1f499', '\uD83E\uDE77': '1fa77',
  '\uD83D\uDC8C': '1f48c',
  '\u2728': '2728', '\u2B50': '2b50',
  '\uD83C\uDFE0': '1f3e0', '\uD83D\uDCD6': '1f4d6',
  '\uD83C\uDFAC': '1f3ac',
  '\uD83D\uDDBC\uFE0F': '1f5bc-fe0f', '\uD83D\uDDBC': '1f5bc-fe0f',
  '\u23F3': '23f3', '\uD83C\uDF81': '1f381',
  '\uD83C\uDF89': '1f389', '\uD83C\uDF8A': '1f38a',
  '\u266A': null, '\u2661': null, '\u2726': null
};

function emojiImg(code, size) {
  const s = size || 20;
  const img = document.createElement('img');
  img.src = `${APPLE_EMOJI_BASE}${code}.png`;
  img.className = 'emoji';
  img.draggable = false;
  img.style.width = `${s}px`;
  img.style.height = `${s}px`;
  img.style.display = 'inline-block';
  img.style.verticalAlign = 'middle';
  return img;
}

const root = document.documentElement;
const body = document.body;
const introScreen = document.getElementById('intro-screen');
const introTyping = document.getElementById('intro-typing');
const ambientShell = document.getElementById('ambient-shell');
const heartField = document.getElementById('heart-field');
const sparkleField = document.getElementById('sparkle-field');
const cursorGlow = document.getElementById('cursor-glow');
const cursorRing = document.getElementById('cursor-ring');
const beginButton = document.getElementById('begin-button');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const musicStatus = document.getElementById('music-status');
const videoSection = document.getElementById('memory-video-section');
const video = document.getElementById('memory-video');
const videoSource = video.querySelector('source');
const videoToggle = document.getElementById('video-toggle');
const videoIcon = document.getElementById('video-icon');
const videoCard = document.querySelector('.video-card');
const letterTyping = document.getElementById('letter-typing');
const daysCounter = document.getElementById('days-counter');
const daysInline = document.getElementById('days-inline');
const surpriseButton = document.getElementById('surprise-button');
const surpriseModal = document.getElementById('surprise-modal');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const scrollProgress = document.getElementById('scroll-progress');
const floatingNav = document.getElementById('floating-nav');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;

let experienceStarted = false;
let videoLoaded = false;
let letterTyped = false;
let counterAnimated = false;
let sparkleTimer = null;
let musicWasPlayingBeforeVideo = false;
let targetCursorX = window.innerWidth / 2;
let targetCursorY = window.innerHeight / 2;
let currentCursorX = targetCursorX;
let currentCursorY = targetCursorY;
let cursorAnimating = false;

function syncBodyLock() {
  const modalOpen = !surpriseModal.hidden || !lightbox.hidden;
  body.classList.toggle('is-locked', body.classList.contains('intro-active') || modalOpen);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultilineText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function formatLetterText(text) {
  return formatMultilineText(text)
    .replace(/Samiksha/g, '<span class="highlight">Samiksha</span>')
    .replace(/❤️/g, '<span class="highlight">❤️</span>')
    .replace(/💖/g, '<span class="highlight">💖</span>')
    .replace(/\bbrighter\b/gi, '<span class="highlight">$&</span>')
    .replace(/\bcherish\b/gi, '<span class="highlight">$&</span>')
    .replace(/\bheart\b/gi, '<span class="highlight">$&</span>')
    .replace(/\bForever\b/gi, '<span class="highlight">$&</span>');
}

function typeText(element, text, options = {}) {
  const {
    speed = 40,
    formatter = formatMultilineText,
    onFinish = null
  } = options;

  if (!element) {
    return;
  }

  if (prefersReducedMotion) {
    element.classList.remove('typing-caret');
    element.innerHTML = formatter(text);
    if (onFinish) {
      onFinish();
    }
    return;
  }

  const tokens = Array.from(text);
  let index = 0;
  element.classList.add('typing-caret');
  element.innerHTML = '';

  function step() {
    index += 1;
    element.innerHTML = formatter(tokens.slice(0, index).join(''));
    if (index < tokens.length) {
      window.setTimeout(step, speed);
    } else {
      element.classList.remove('typing-caret');
      element.innerHTML = formatter(text);
      if (onFinish) {
        onFinish();
      }
    }
  }

  step();
}

function createHeartParticles() {
  const total = mobileLike ? 12 : 20;
  const heartCodes = ['2764-fe0f', '1f496', '1f495'];

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    const sz = Math.round(14 + Math.random() * 18);
    heart.appendChild(emojiImg(heartCodes[index % heartCodes.length], sz));
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty('--scale', (0.75 + Math.random() * 1.25).toFixed(2));
    heart.style.setProperty('--opacity', (0.2 + Math.random() * 0.5).toFixed(2));
    heart.style.setProperty('--drift-x', `${-70 + Math.random() * 140}px`);
    heart.style.animationDuration = `${14 + Math.random() * 18}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    heartField.appendChild(heart);
  }
}

function createSparkle() {
  if (!experienceStarted || prefersReducedMotion) {
    return;
  }

  const sparkle = document.createElement('span');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${6 + Math.random() * 88}%`;
  sparkle.style.top = `${8 + Math.random() * 78}%`;
  sparkle.style.setProperty('--size', `${4 + Math.random() * 7}px`);
  sparkle.style.setProperty('--duration', `${2.8 + Math.random() * 1.8}s`);
  sparkle.style.setProperty('--sparkle-x', `${-18 + Math.random() * 36}px`);
  sparkleField.appendChild(sparkle);
  window.setTimeout(() => sparkle.remove(), 4200);
}

function startSparkles() {
  if (sparkleTimer || prefersReducedMotion) {
    return;
  }

  for (let index = 0; index < (mobileLike ? 3 : 5); index += 1) {
    window.setTimeout(createSparkle, index * 180);
  }

  sparkleTimer = window.setInterval(createSparkle, mobileLike ? 1500 : 950);
}

function startExperience() {
  if (experienceStarted) {
    return;
  }

  experienceStarted = true;
  body.classList.add('experience-started');
  beginButton.classList.add('is-awake');
  beginButton.textContent = 'The Story Is Awake ✨';
  startSparkles();
}

function updateMusicUI(isPlaying) {
  body.classList.toggle('music-playing', isPlaying);
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause romantic music' : 'Play romantic music');
  musicStatus.textContent = isPlaying ? 'now playing' : (experienceStarted ? 'paused' : 'waiting for your tap');
}

async function playMusic() {
  try {
    startExperience();
    musicWasPlayingBeforeVideo = false;
    if (!video.paused) {
      video.pause();
    }
    await bgMusic.play();
    updateMusicUI(true);
  } catch (error) {
    updateMusicUI(false);
  }
}

function pauseMusic() {
  bgMusic.pause();
  updateMusicUI(false);
}

function ensureVideoLoaded() {
  if (videoLoaded || !videoSource.dataset.src) {
    return;
  }

  videoSource.src = videoSource.dataset.src;
  video.load();
  videoLoaded = true;
}

function updateVideoUI() {
  const isPlaying = !video.paused && !video.ended;
  videoCard.classList.toggle('is-playing', isPlaying);
  videoIcon.textContent = isPlaying ? '❚❚' : '▶';
  videoToggle.setAttribute('aria-label', isPlaying ? 'Pause our memory video' : 'Play our memory video');
}

async function toggleVideoPlayback() {
  ensureVideoLoaded();

  try {
    if (video.paused) {
      musicWasPlayingBeforeVideo = !bgMusic.paused;
      if (musicWasPlayingBeforeVideo) {
        bgMusic.pause();
      }
      video.muted = false;
      video.volume = 1;
      await video.play();
    } else {
      video.pause();
    }
  } catch (error) {
    video.controls = true;
  }
}

function animateCounter() {
  if (counterAnimated) {
    return;
  }

  counterAnimated = true;
  const days = getDaysTogether();
  const duration = prefersReducedMotion ? 1 : 1800;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(days * eased);
    daysCounter.textContent = String(value).padStart(3, '0');
    daysInline.textContent = String(value);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      daysCounter.textContent = String(days).padStart(3, '0');
      daysInline.textContent = String(days);
    }
  }

  requestAnimationFrame(frame);
}

function getDaysTogether() {
  const startDate = new Date('2024-02-14T00:00:00');
  return Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 86400000));
}

function refreshCounterInstant() {
  const days = getDaysTogether();
  daysCounter.textContent = String(days).padStart(3, '0');
  daysInline.textContent = String(days);
}

function revealSurprise() {
  surpriseModal.hidden = false;
  body.classList.add('pulse-bg');
  syncBodyLock();
  window.setTimeout(() => body.classList.remove('pulse-bg'), 1000);
}

function closeSurprise() {
  surpriseModal.hidden = true;
  syncBodyLock();
}

function createHeartExplosion(originX, originY) {
  const total = mobileLike ? 22 : 36;
  const heartCodes = ['2764-fe0f', '1f496', '1f495', '1f497'];

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'explosion-heart';
    heart.appendChild(emojiImg(heartCodes[index % heartCodes.length], 20));
    heart.style.left = `${originX}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty('--explode-x', `${-120 + Math.random() * 240}px`);
    heart.style.setProperty('--explode-y', `${-170 + Math.random() * 160}px`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1050);
  }
}

function openLightbox(src, caption) {
  lightbox.hidden = false;
  lightboxImage.src = src;
  lightboxCaption.textContent = caption;
  syncBodyLock();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute('src');
  syncBodyLock();
}

function updateScrollParallax() {
  const shift = Math.min(window.scrollY * -0.035, 0);
  root.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);

  // Scroll progress bar
  if (scrollProgress) {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }

  // Back to top button visibility
  if (backToTop) {
    if (window.scrollY > window.innerHeight) {
      backToTop.hidden = false;
    } else {
      backToTop.hidden = true;
    }
  }

  // Floating nav active state
  if (floatingNav) {
    const sections = ['home', 'build-up-section', 'memory-video-section', 'gallery-section', 'letter-section', 'counter-section', 'surprise-section'];
    let activeId = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        activeId = id;
      }
    }
    floatingNav.querySelectorAll('.floating-nav__link').forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
    });
  }
}

function animateCursor() {
  currentCursorX += (targetCursorX - currentCursorX) * 0.18;
  currentCursorY += (targetCursorY - currentCursorY) * 0.18;

  cursorGlow.style.transform = `translate(${currentCursorX - 11}px, ${currentCursorY - 11}px)`;

  if (Math.abs(targetCursorX - currentCursorX) > 0.2 || Math.abs(targetCursorY - currentCursorY) > 0.2) {
    requestAnimationFrame(animateCursor);
  } else {
    cursorAnimating = false;
  }
}

let trailCounter = 0;

function createTrailHeart(x, y) {
  const heart = document.createElement('span');
  heart.className = 'cursor-trail-heart';
  const heartCodes = ['2764-fe0f', '1f495', '1f496'];
  heart.appendChild(emojiImg(heartCodes[Math.floor(Math.random() * heartCodes.length)], 14));
  heart.style.left = `${x - 7 + (Math.random() * 14 - 7)}px`;
  heart.style.top = `${y - 7 + (Math.random() * 14 - 7)}px`;
  document.body.appendChild(heart);
  window.setTimeout(() => heart.remove(), 800);
}

function createClickRipple(x, y) {
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 700);

  // Also spawn some mini hearts on click
  const clickHeartCodes = ['2764-fe0f', '1f496', '1f495', '1f497'];
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement('span');
    heart.className = 'explosion-heart';
    heart.appendChild(emojiImg(clickHeartCodes[i % clickHeartCodes.length], 18));
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty('--explode-x', `${-60 + Math.random() * 120}px`);
    heart.style.setProperty('--explode-y', `${-80 + Math.random() * 60}px`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1200);
  }
}

function setupCursorGlow() {
  if (!finePointer || prefersReducedMotion) {
    return;
  }

  // Set the cursor element to an Apple-style heart emoji image
  cursorGlow.innerHTML = '';
  cursorGlow.appendChild(emojiImg('2764-fe0f', 24));
  cursorGlow.style.pointerEvents = 'none';

  document.addEventListener('mousemove', event => {
    targetCursorX = event.clientX;
    targetCursorY = event.clientY;
    cursorGlow.style.opacity = '1';

    // Leave a trail every few moves
    trailCounter++;
    if (trailCounter % 4 === 0) {
      createTrailHeart(event.clientX, event.clientY);
    }

    const offsetX = ((event.clientX / window.innerWidth) - 0.5) * 18;
    const offsetY = ((event.clientY / window.innerHeight) - 0.5) * 14;
    root.style.setProperty('--parallax-x', `${offsetX.toFixed(2)}px`);
    root.style.setProperty('--parallax-y', `${offsetY.toFixed(2)}px`);

    if (!cursorAnimating) {
      cursorAnimating = true;
      requestAnimationFrame(animateCursor);
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });

  // Click ripple effect
  document.addEventListener('click', event => {
    createClickRipple(event.clientX, event.clientY);
  });
}

function handleReveal(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }

    const delay = entry.target.dataset.delay || '0s';
    entry.target.style.transitionDelay = delay;
    entry.target.classList.add('reveal--visible');

    if (entry.target.id === 'letter-section' && !letterTyped) {
      letterTyped = true;
      typeText(letterTyping, letterTyping.dataset.text, {
        speed: 26,
        formatter: formatLetterText
      });
    }

    if (entry.target.id === 'counter-section') {
      animateCounter();
    }

    observer.unobserve(entry.target);
  });
}

function startIntroSequence() {
  typeText(introTyping, introTyping.dataset.text, {
    speed: 42,
    formatter: text => escapeHtml(text)
  });

  const delay = prefersReducedMotion ? 450 : 3000;
  window.setTimeout(() => {
    body.classList.remove('intro-active');
    body.classList.add('intro-complete');
    introScreen.classList.add('is-hidden');
    syncBodyLock();
  }, delay);
}

beginButton.addEventListener('click', async () => {
  await playMusic();
});

musicToggle.addEventListener('click', async () => {
  if (bgMusic.paused) {
    await playMusic();
  } else {
    pauseMusic();
  }
});

bgMusic.addEventListener('play', () => updateMusicUI(true));
bgMusic.addEventListener('pause', () => updateMusicUI(false));

videoToggle.addEventListener('click', toggleVideoPlayback);
video.addEventListener('click', () => {
  if (mobileLike && video.paused) {
    toggleVideoPlayback();
  }
});

video.addEventListener('play', () => {
  updateVideoUI();
});

video.addEventListener('pause', async () => {
  updateVideoUI();
  if (musicWasPlayingBeforeVideo && experienceStarted) {
    musicWasPlayingBeforeVideo = false;
    await playMusic();
  }
});

video.addEventListener('ended', async () => {
  updateVideoUI();
  if (musicWasPlayingBeforeVideo && experienceStarted) {
    musicWasPlayingBeforeVideo = false;
    await playMusic();
  }
});

surpriseButton.addEventListener('click', event => {
  const rect = event.currentTarget.getBoundingClientRect();
  createHeartExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
  launchConfetti();
  revealSurprise();
});

document.querySelectorAll('[data-close-surprise]').forEach(node => {
  node.addEventListener('click', closeSurprise);
});

document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('click', () => {
    openLightbox(card.dataset.lightboxSrc, card.dataset.lightboxCaption);
  });
});

document.querySelectorAll('[data-close-lightbox]').forEach(node => {
  node.addEventListener('click', closeLightbox);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLightbox();
    closeSurprise();
  }
});

const revealObserver = new IntersectionObserver(handleReveal, {
  threshold: mobileLike ? 0.1 : 0.18
});

document.querySelectorAll('.reveal').forEach(node => {
  if (!node.classList.contains('reveal--visible')) {
    revealObserver.observe(node);
  }
});

const videoLoadObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }
    ensureVideoLoaded();
    videoLoadObserver.disconnect();
  });
}, { rootMargin: '280px 0px' });

videoLoadObserver.observe(videoSection);

window.addEventListener('scroll', updateScrollParallax, { passive: true });
window.addEventListener('resize', updateScrollParallax, { passive: true });

// Confetti effect
function launchConfetti() {
  if (!confettiCanvas || !confettiCtx) return;

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#d6b896', '#a84858', '#f8f0ed', '#dea7a7', '#967d8d', '#ffd79a', '#ff8fb6'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: -8 - Math.random() * 12,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.18 + Math.random() * 0.08,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let frameCount = 0;
  function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.006;
      p.vx *= 0.99;

      if (p.opacity <= 0) continue;
      alive = true;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;

      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    }

    frameCount++;
    if (alive && frameCount < 300) {
      requestAnimationFrame(drawConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  requestAnimationFrame(drawConfetti);
}

// Back to top button
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Parse all emojis in the DOM and replace with Apple/iOS emoji images
function parseAppleEmojis(rootEl) {
  const target = rootEl || document.body;
  const emojiKeys = Object.keys(APPLE_EMOJI_MAP).filter(k => APPLE_EMOJI_MAP[k] !== null);
  // Sort longest first so multi-codepoint emojis match before single ones
  emojiKeys.sort((a, b) => b.length - a.length);
  const emojiRegex = new RegExp(emojiKeys.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

  function walkNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!emojiRegex.test(text)) return;
      emojiRegex.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let match;
      while ((match = emojiRegex.exec(text)) !== null) {
        if (match.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        }
        const code = APPLE_EMOJI_MAP[match[0]];
        if (code) {
          frag.appendChild(emojiImg(code, 20));
        } else {
          frag.appendChild(document.createTextNode(match[0]));
        }
        last = match.index + match[0].length;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'textarea', 'select', 'img', 'canvas', 'video', 'audio', 'source'].includes(tag)) return;
      Array.from(node.childNodes).forEach(walkNode);
    }
  }

  walkNode(target);
}

window.addEventListener('load', () => {
  createHeartParticles();
  setupCursorGlow();
  updateMusicUI(false);
  updateVideoUI();
  updateScrollParallax();
  startIntroSequence();
  parseAppleEmojis();
  window.setInterval(() => {
    if (counterAnimated) {
      refreshCounterInstant();
    }
  }, 60000);
});
