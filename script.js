const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileLike = window.matchMedia('(max-width: 820px)').matches;

const loader = document.getElementById('page-loader');
const heartField = document.getElementById('heart-field');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const musicStatus = document.getElementById('music-status');
const heroTyping = document.getElementById('hero-typing');
const letterTyping = document.getElementById('letter-typing');
const daysCounter = document.getElementById('days-counter');
const daysInline = document.getElementById('days-inline');
const video = document.getElementById('memory-video');
const videoToggle = document.getElementById('video-toggle');
const videoIcon = document.getElementById('video-icon');
const videoCard = document.querySelector('.video-card');
const surpriseButton = document.getElementById('surprise-button');
const surpriseModal = document.getElementById('surprise-modal');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');

let audioLockedByUser = false;
let heroTyped = false;
let letterTyped = false;
let counterAnimated = false;

function syncBodyLock() {
  const shouldLock = !surpriseModal.hidden || !lightbox.hidden;
  document.body.classList.toggle('is-locked', shouldLock);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightLoveWords(text) {
  return escapeHtml(text)
    .replace(/❤️/g, '<span class="highlight">❤️</span>')
    .replace(/\bforever\b/gi, '<span class="highlight">$&</span>')
    .replace(/\blove\b/gi, '<span class="highlight">$&</span>');
}

function typeText(element, text, options = {}) {
  const {
    speed = 42,
    onFinish = null,
    formatter = null
  } = options;

  if (!element) {
    return;
  }

  if (prefersReducedMotion) {
    element.classList.remove('typing-caret');
    element.innerHTML = formatter ? formatter(text) : escapeHtml(text);
    if (onFinish) {
      onFinish();
    }
    return;
  }

  const chars = Array.from(text);
  let index = 0;
  element.classList.add('typing-caret');
  element.innerHTML = '';

  const tick = () => {
    index += 1;
    const current = chars.slice(0, index).join('');
    element.innerHTML = formatter ? formatter(current) : escapeHtml(current);

    if (index < chars.length) {
      window.setTimeout(tick, speed);
    } else {
      element.classList.remove('typing-caret');
      if (formatter) {
        element.innerHTML = formatter(text);
      }
      if (onFinish) {
        onFinish();
      }
    }
  };

  tick();
}

function createHearts() {
  const count = mobileLike ? 10 : 18;
  const icons = ['❤', '♡', '♥'];

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = icons[index % icons.length];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.7 + Math.random() * 1.1}rem`;
    heart.style.setProperty('--scale', (0.7 + Math.random() * 1.2).toFixed(2));
    heart.style.setProperty('--opacity', (0.2 + Math.random() * 0.5).toFixed(2));
    heart.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
    heart.style.animationDuration = `${12 + Math.random() * 18}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    heartField.appendChild(heart);
  }
}

function updateMusicUI(isPlaying) {
  musicToggle.classList.toggle('is-paused', !isPlaying);
  musicIcon.textContent = isPlaying ? '❚❚' : '♪';
  musicStatus.textContent = isPlaying ? 'now playing' : 'tap to play';
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause romantic music' : 'Play romantic music');
}

async function playMusic() {
  try {
    if (!video.paused) {
      video.pause();
    }
    await bgMusic.play();
    updateMusicUI(true);
  } catch (error) {
    updateMusicUI(false);
  }
}

function pauseMusic(markUserChoice = false) {
  if (markUserChoice) {
    audioLockedByUser = true;
  }
  bgMusic.pause();
  updateMusicUI(false);
}

musicToggle.addEventListener('click', async () => {
  audioLockedByUser = !bgMusic.paused;
  if (bgMusic.paused) {
    audioLockedByUser = false;
    await playMusic();
  } else {
    pauseMusic(true);
  }
});

bgMusic.addEventListener('play', () => updateMusicUI(true));
bgMusic.addEventListener('pause', () => updateMusicUI(false));

async function tryAutoplayMusic() {
  if (prefersReducedMotion) {
    return;
  }

  try {
    await bgMusic.play();
    updateMusicUI(true);
  } catch (error) {
    updateMusicUI(false);
  }
}

function unlockAudioAfterInteraction() {
  if (!bgMusic.paused || audioLockedByUser) {
    return;
  }
  playMusic();
}

window.addEventListener('pointerdown', unlockAudioAfterInteraction, { once: true });
window.addEventListener('keydown', unlockAudioAfterInteraction, { once: true });

function updateVideoUI() {
  const playing = !video.paused && !video.ended;
  videoCard.classList.toggle('is-playing', playing);
  videoIcon.textContent = playing ? '❚❚' : '▶';
  videoToggle.setAttribute('aria-label', playing ? 'Pause video memory' : 'Play video memory');
}

async function toggleVideo() {
  try {
    if (video.paused) {
      pauseMusic(false);
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

videoToggle.addEventListener('click', toggleVideo);
video.addEventListener('click', () => {
  if (mobileLike && video.paused) {
    toggleVideo();
  }
});
video.addEventListener('play', updateVideoUI);
video.addEventListener('pause', updateVideoUI);
video.addEventListener('ended', updateVideoUI);

function animateCounter() {
  if (counterAnimated) {
    return;
  }

  counterAnimated = true;
  const startDate = new Date('2024-02-14T00:00:00');
  const today = new Date();
  const diffDays = Math.max(0, Math.floor((today - startDate) / 86400000));
  const duration = prefersReducedMotion ? 1 : 1800;
  const start = performance.now();

  const frame = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(diffDays * eased);
    daysCounter.textContent = String(value).padStart(3, '0');
    daysInline.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      daysCounter.textContent = String(diffDays).padStart(3, '0');
      daysInline.textContent = diffDays;
    }
  };

  requestAnimationFrame(frame);
}

function revealSurprise() {
  surpriseModal.hidden = false;
  syncBodyLock();
}

function closeSurprise() {
  surpriseModal.hidden = true;
  syncBodyLock();
}

function createHeartExplosion(originX, originY) {
  const total = mobileLike ? 18 : 30;
  const icons = ['❤', '♥', '♡', '💖'];

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'explosion-heart';
    heart.textContent = icons[index % icons.length];
    heart.style.left = `${originX}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty('--x', `${-90 + Math.random() * 180}px`);
    heart.style.setProperty('--y', `${-120 + Math.random() * 120}px`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 950);
  }
}

surpriseButton.addEventListener('click', event => {
  const rect = event.currentTarget.getBoundingClientRect();
  createHeartExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
  revealSurprise();
});

document.querySelectorAll('[data-close-surprise]').forEach(node => {
  node.addEventListener('click', closeSurprise);
});

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

function handleReveal(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add('reveal--visible');

    if (entry.target.id === 'letter-section' && !letterTyped) {
      letterTyped = true;
      typeText(letterTyping, letterTyping.dataset.text, {
        speed: 26,
        formatter: highlightLoveWords
      });
    }

    if (entry.target.id === 'counter-section') {
      animateCounter();
    }

    observer.unobserve(entry.target);
  });
}

const revealObserver = new IntersectionObserver(handleReveal, {
  threshold: mobileLike ? 0.12 : 0.2
});

document.querySelectorAll('.reveal').forEach(section => {
  if (!section.classList.contains('reveal--visible')) {
    revealObserver.observe(section);
  }
});

window.addEventListener('load', () => {
  createHearts();
  updateMusicUI(false);

  if (!heroTyped) {
    heroTyped = true;
    typeText(heroTyping, heroTyping.dataset.text, { speed: 58, formatter: highlightLoveWords });
  }

  window.setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  }, prefersReducedMotion ? 40 : 900);

  tryAutoplayMusic();
  updateVideoUI();
});
