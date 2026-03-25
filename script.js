const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const mobileLike = window.matchMedia('(max-width: 820px)').matches;

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
  const icons = ['❤', '♥', '♡'];

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = icons[index % icons.length];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.7 + Math.random() * 1.15}rem`;
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
  musicIcon.textContent = isPlaying ? '❚❚' : '♪';
  musicStatus.textContent = isPlaying ? 'now playing' : (experienceStarted ? 'paused' : 'waiting for your tap');
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause romantic music' : 'Play romantic music');
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
  const icons = ['❤', '♥', '♡', '💖'];

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'explosion-heart';
    heart.textContent = icons[index % icons.length];
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
}

function animateCursor() {
  currentCursorX += (targetCursorX - currentCursorX) * 0.16;
  currentCursorY += (targetCursorY - currentCursorY) * 0.16;

  cursorGlow.style.transform = `translate(${currentCursorX - 38}px, ${currentCursorY - 38}px)`;
  cursorRing.style.transform = `translate(${currentCursorX - 19}px, ${currentCursorY - 19}px)`;

  if (Math.abs(targetCursorX - currentCursorX) > 0.2 || Math.abs(targetCursorY - currentCursorY) > 0.2) {
    requestAnimationFrame(animateCursor);
  } else {
    cursorAnimating = false;
  }
}

function setupCursorGlow() {
  if (!finePointer || prefersReducedMotion) {
    return;
  }

  document.addEventListener('mousemove', event => {
    targetCursorX = event.clientX;
    targetCursorY = event.clientY;
    cursorGlow.style.opacity = '1';
    cursorRing.style.opacity = '1';

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
    cursorRing.style.opacity = '0';
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

window.addEventListener('load', () => {
  createHeartParticles();
  setupCursorGlow();
  updateMusicUI(false);
  updateVideoUI();
  updateScrollParallax();
  startIntroSequence();
  window.setInterval(() => {
    if (counterAnimated) {
      refreshCounterInstant();
    }
  }, 60000);
});
