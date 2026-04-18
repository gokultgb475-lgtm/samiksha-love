/* ═══════════════════════════════════════════════════
   BOOK + LOVE STORY — script.js
   ═══════════════════════════════════════════════════ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const mobileLike = window.matchMedia('(max-width: 820px)').matches;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* Performance helpers */
let rafScrollId = null;
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
const debouncedResize = debounce(() => { window.dispatchEvent(new CustomEvent('optimizedResize')); }, 200);

const APPLE_EMOJI_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/';
const APPLE_EMOJI_MAP = {
  '\u2764\uFE0F':'2764-fe0f','\u2764':'2764-fe0f',
  '\uD83D\uDC96':'1f496','\uD83D\uDC95':'1f495',
  '\uD83D\uDC97':'1f497','\uD83D\uDC93':'1f493',
  '\uD83D\uDC98':'1f498','\uD83D\uDC9D':'1f49d',
  '\uD83D\uDC9E':'1f49e','\uD83D\uDC9B':'1f49b',
  '\uD83D\uDC9C':'1f49c','\uD83D\uDC9A':'1f49a',
  '\uD83D\uDC99':'1f499','\uD83E\uDE77':'1fa77',
  '\uD83D\uDC8C':'1f48c','\u2728':'2728','\u2B50':'2b50',
  '\uD83C\uDFE0':'1f3e0','\uD83D\uDCD6':'1f4d6','\uD83C\uDFAC':'1f3ac',
  '\uD83D\uDDBC\uFE0F':'1f5bc-fe0f','\uD83D\uDDBC':'1f5bc-fe0f',
  '\u23F3':'23f3','\uD83C\uDF81':'1f381',
  '\uD83C\uDF89':'1f389','\uD83C\uDF8A':'1f38a',
  '\u266A':null,'\u2661':null,'\u2726':null
};

function emojiImg(code, size) {
  const s = size || 20;
  const img = document.createElement('img');
  img.src = `${APPLE_EMOJI_BASE}${code}.png`;
  img.className = 'emoji'; img.draggable = false;
  img.style.cssText = `width:${s}px;height:${s}px;display:inline-block;vertical-align:middle;`;
  return img;
}

/* ── DOM refs ── */
const root = document.documentElement;
const body = document.body;
const bookScene = document.getElementById('book-scene');
const bookWrapper = document.getElementById('book-wrapper');
const bookEl = document.getElementById('book');
const bookCover = document.getElementById('book-cover');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');
const enterBtn = document.getElementById('enter-experience');
const bookAngel = document.getElementById('book-angel');
const angelSpeech = document.getElementById('angel-speech');

const cursorGlow = document.getElementById('cursor-glow');
const heartField = document.getElementById('heart-field');
const sparkleField = document.getElementById('sparkle-field');
const beginButton = document.getElementById('begin-button');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');
const video = document.getElementById('memory-video');
const videoSource = video ? video.querySelector('source') : null;
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
const starfieldCanvas = document.getElementById('starfield');
const starfieldCtx = starfieldCanvas ? starfieldCanvas.getContext('2d') : null;
const tickerTrack = document.getElementById('ticker-track');
const modalHeartRain = document.getElementById('modal-heart-rain');
const loveMeterFill = document.getElementById('love-meter-fill');
const loveMeterGlow = document.getElementById('love-meter-glow');
const loveMeterLabel = document.getElementById('love-meter-label');
const scrollParticleCanvas = document.getElementById('scroll-particle-canvas');
const scrollParticleCtx = scrollParticleCanvas ? scrollParticleCanvas.getContext('2d') : null;

/* ── New DOM refs ── */
const introOverlay = document.getElementById('intro-overlay');
const introSkip = document.getElementById('intro-skip');
const envelopeWrapper = document.getElementById('envelope-wrapper');
const envelopeEl = document.getElementById('envelope');
const letterCardEl = document.getElementById('letter-card-el');
const wishModal = document.getElementById('wish-modal');
const wishGrantBtn = document.getElementById('wish-grant-btn');
const wishResult = document.getElementById('wish-result');
const shareBtn = document.getElementById('share-btn');
const modalSparkleShower = document.getElementById('modal-sparkle-shower');
const finalLoveFill = document.getElementById('final-love-fill');

/* ── State ── */
let bookOpened = false;
let currentPage = 0; // 0 = cover, 1-6 = pages
const TOTAL_PAGES = 6;
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
let trailCounter = 0;
let envelopeOpened = false;

/* ═══════════════════════════════════════════════════
   PERFORMANCE: Pause all animations when tab is hidden
   ═══════════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.documentElement.style.setProperty('--anim-state', 'paused');
    document.body.classList.add('tab-hidden');
  } else {
    document.documentElement.style.setProperty('--anim-state', 'running');
    document.body.classList.remove('tab-hidden');
  }
});

/* ═══════════════════════════════════════════════════
   BOOK LOGIC
   ═══════════════════════════════════════════════════ */
function openBook() {
  if (bookOpened) return;
  bookOpened = true;
  body.classList.add('book-opened');
  bookCover.classList.add('is-flipped');
  currentPage = 1;
  updatePageIndicator();
  updateNavButtons();
  triggerAngelTurn('next');
  updateAngelSpeech();
}

function flipToPage(targetPage) {
  if (targetPage < 1 || targetPage > TOTAL_PAGES) return;
  // Flip pages forward
  if (targetPage > currentPage) {
    for (let i = currentPage; i < targetPage; i++) {
      const pg = document.getElementById(`page-${i}`);
      if (pg) pg.classList.add('is-flipped');
    }
  }
  // Flip pages backward
  if (targetPage < currentPage) {
    for (let i = currentPage - 1; i >= targetPage; i--) {
      const pg = document.getElementById(`page-${i}`);
      if (pg) pg.classList.remove('is-flipped');
    }
  }
  currentPage = targetPage;
  updatePageIndicator();
  updateNavButtons();
}

function nextPage() {
  if (!bookOpened) { openBook(); return; }
  if (currentPage >= TOTAL_PAGES) return;
  const pg = document.getElementById(`page-${currentPage}`);
  if (pg) pg.classList.add('is-flipped');
  currentPage++;
  updatePageIndicator();
  updateNavButtons();
  triggerAngelTurn('next');
  updateAngelSpeech();
}

function prevPage() {
  if (currentPage <= 1) return;
  currentPage--;
  const pg = document.getElementById(`page-${currentPage}`);
  if (pg) pg.classList.remove('is-flipped');
  updatePageIndicator();
  updateNavButtons();
  triggerAngelTurn('back');
  updateAngelSpeech();
}

function updatePageIndicator() {
  if (!pageIndicator) return;
  if (currentPage === 0) pageIndicator.textContent = 'Cover';
  else pageIndicator.textContent = `Page ${currentPage} of ${TOTAL_PAGES}`;
  // Update reading progress bar
  updateBookReadingProgress();
}

function updateBookReadingProgress() {
  const fill = document.getElementById('book-reading-fill');
  if (!fill) return;
  const progress = bookOpened ? (currentPage / TOTAL_PAGES) * 100 : 0;
  fill.style.width = `${progress}%`;
}

function updateNavButtons() {
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= TOTAL_PAGES;
}

function exitBookEnterSite() {
  body.classList.remove('book-phase');
  body.classList.remove('is-locked');
  body.classList.add('site-active');
  startExperience();
  playMusic();
}

/* ═══════════════════════════════════════════════════
   ANGEL PAGE-TURN ANIMATION
   ═══════════════════════════════════════════════════ */
const ANGEL_SPEECH_MESSAGES = [
  'Tap me or the book! ✨',
  'Keep reading! 📖',
  'This one\'s sweet! 💕',
  'Your smile... 😊✨',
  'So beautiful! 💖',
  'Almost there! 🌟',
  'The grand finale! ✨'
];

function triggerAngelTurn(direction) {
  if (!bookAngel) return;
  // Remove previous animation classes
  bookAngel.classList.remove('is-turning', 'is-turning-back');
  // Force reflow to restart animation
  void bookAngel.offsetWidth;
  // Add the appropriate class
  if (direction === 'next') {
    bookAngel.classList.add('is-turning');
  } else {
    bookAngel.classList.add('is-turning-back');
  }
  // Create burst sparkles around angel
  createAngelSparkles();
  // Remove class after animation
  setTimeout(() => {
    bookAngel.classList.remove('is-turning', 'is-turning-back');
  }, 1700);
}

function updateAngelSpeech() {
  if (!angelSpeech || !bookOpened) return;
  const msg = ANGEL_SPEECH_MESSAGES[Math.min(currentPage, ANGEL_SPEECH_MESSAGES.length - 1)];
  angelSpeech.textContent = msg;
  angelSpeech.classList.remove('is-next');
  void angelSpeech.offsetWidth;
  angelSpeech.classList.add('is-next');
}

function createAngelSparkles() {
  if (!bookAngel || prefersReducedMotion) return;
  const rect = bookAngel.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('span');
    spark.className = 'explosion-heart';
    spark.textContent = ['✨', '⭐', '💫', '🌟'][i % 4];
    spark.style.fontSize = '0.8rem';
    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;
    spark.style.setProperty('--explode-x', `${-50 + Math.random() * 100}px`);
    spark.style.setProperty('--explode-y', `${-60 + Math.random() * 50}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1100);
  }
}

/* Angel click handler */
if (bookAngel) {
  bookAngel.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!body.classList.contains('book-phase')) return;
    if (!bookOpened) {
      openBook();
    } else if (currentPage < TOTAL_PAGES) {
      nextPage();
    }
  });
}

/* ═══════════════════════════════════════════════════
   CINEMATIC INTRO OVERLAY
   ═══════════════════════════════════════════════════ */
function dismissIntro() {
  if (!introOverlay) return;
  introOverlay.classList.add('fade-out');
  setTimeout(() => { introOverlay.style.display = 'none'; }, 1300);
}
if (introSkip) introSkip.addEventListener('click', dismissIntro);
// Auto-dismiss after 7 seconds
setTimeout(dismissIntro, 7000);

/* Book event listeners */
function handleBookKey(e) {
  if (!body.classList.contains('book-phase')) return;
  if (e.key === 'Escape') return;
  if (!bookOpened) { openBook(); return; }
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextPage(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevPage(); }
}

document.addEventListener('keydown', handleBookKey);

if (bookScene) {
  bookScene.addEventListener('click', (e) => {
    if (!body.classList.contains('book-phase')) return;
    if (!bookOpened) { openBook(); return; }
    // Don't interfere with button clicks
    if (e.target.closest('.book-nav__btn') || e.target.closest('.book-enter-btn')) return;
    // Click right half = next, left half = prev
    const rect = bookWrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width / 2) nextPage();
    else prevPage();
  });
}

if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevPage(); });
if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextPage(); });
if (enterBtn) enterBtn.addEventListener('click', (e) => { e.stopPropagation(); exitBookEnterSite(); });

/* ═══════════════════════════════════════════════════
   MAIN SITE LOGIC (preserved from original)
   ═══════════════════════════════════════════════════ */
function syncBodyLock() {
  const easterModal = document.getElementById('easter-egg-modal');
  const modalOpen = (surpriseModal && !surpriseModal.hidden) || (lightbox && !lightbox.hidden) || (wishModal && !wishModal.hidden) || (easterModal && !easterModal.hidden);
  body.classList.toggle('is-locked', body.classList.contains('book-phase') || modalOpen);
}

function escapeHtml(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatMultilineText(t) { return escapeHtml(t).replace(/\n/g,'<br>'); }
function formatLetterText(t) {
  return formatMultilineText(t)
    .replace(/Samiksha/g,'<span class="highlight">Samiksha</span>')
    .replace(/❤️/g,'<span class="highlight">❤️</span>')
    .replace(/💖/g,'<span class="highlight">💖</span>')
    .replace(/\bbrighter\b/gi,'<span class="highlight">$&</span>')
    .replace(/\bcherish\b/gi,'<span class="highlight">$&</span>')
    .replace(/\bheart\b/gi,'<span class="highlight">$&</span>')
    .replace(/\bForever\b/gi,'<span class="highlight">$&</span>');
}

function typeText(el, text, opts = {}) {
  const { speed = 40, formatter = formatMultilineText, onFinish = null } = opts;
  if (!el) return;
  if (prefersReducedMotion) { el.classList.remove('typing-caret'); el.innerHTML = formatter(text); if (onFinish) onFinish(); return; }
  const tokens = Array.from(text); let idx = 0;
  el.classList.add('typing-caret'); el.innerHTML = '';
  function step() {
    idx++; el.innerHTML = formatter(tokens.slice(0, idx).join(''));
    if (idx < tokens.length) setTimeout(step, speed);
    else { el.classList.remove('typing-caret'); el.innerHTML = formatter(text); if (onFinish) onFinish(); }
  }
  step();
}

function createHeartParticles() {
  /* Disabled — hearts removed per user request */
  return;
}

function createSparkle() {
  if (!experienceStarted || prefersReducedMotion) return;
  const s = document.createElement('span'); s.className = 'sparkle';
  s.style.left = `${6+Math.random()*88}%`; s.style.top = `${8+Math.random()*78}%`;
  s.style.setProperty('--size', `${4+Math.random()*7}px`);
  s.style.setProperty('--duration', `${2.8+Math.random()*1.8}s`);
  s.style.setProperty('--sparkle-x', `${-18+Math.random()*36}px`);
  sparkleField.appendChild(s);
  setTimeout(() => s.remove(), 4200);
}

function startSparkles() {
  if (sparkleTimer || prefersReducedMotion) return;
  for (let i = 0; i < (mobileLike ? 2 : 4); i++) setTimeout(createSparkle, i*180);
  sparkleTimer = setInterval(createSparkle, mobileLike ? 3000 : 2000);
}

function startExperience() {
  if (experienceStarted) return;
  experienceStarted = true;
  body.classList.add('experience-started');
  if (beginButton) { beginButton.classList.add('is-awake'); beginButton.textContent = 'The Story Is Awake ✨'; }
  startSparkles();
}

function updateMusicUI(playing) {
  body.classList.toggle('music-playing', playing);
  if (musicToggle) musicToggle.setAttribute('aria-label', playing ? 'Pause romantic music' : 'Play romantic music');
  if (musicStatus) musicStatus.textContent = playing ? 'now playing' : (experienceStarted ? 'paused' : 'waiting for your tap');
}

async function playMusic() {
  try {
    startExperience(); musicWasPlayingBeforeVideo = false;
    if (video && !video.paused) video.pause();
    await bgMusic.play(); updateMusicUI(true);
  } catch(e) { updateMusicUI(false); }
}
function pauseMusic() { bgMusic.pause(); updateMusicUI(false); }

function ensureVideoLoaded() {
  if (videoLoaded || !videoSource || !videoSource.dataset.src) return;
  videoSource.src = videoSource.dataset.src; video.load(); videoLoaded = true;
}

function updateVideoUI() {
  if (!video || !videoCard) return;
  const playing = !video.paused && !video.ended;
  videoCard.classList.toggle('is-playing', playing);
  if (videoIcon) videoIcon.textContent = playing ? '❚❚' : '▶';
  if (videoToggle) videoToggle.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

async function toggleVideoPlayback() {
  ensureVideoLoaded();
  try {
    if (video.paused) {
      musicWasPlayingBeforeVideo = !bgMusic.paused;
      if (musicWasPlayingBeforeVideo) bgMusic.pause();
      video.muted = false; video.volume = 1; await video.play();
    } else { video.pause(); }
  } catch(e) { video.controls = true; }
}

function animateCounter() {
  if (counterAnimated) return; counterAnimated = true;
  const days = getDaysTogether(), dur = prefersReducedMotion ? 1 : 1800, st = performance.now();
  function frame(now) {
    const p = Math.min((now-st)/dur, 1), e = 1-Math.pow(1-p, 3), v = Math.floor(days*e);
    if (daysCounter) daysCounter.textContent = String(v).padStart(3,'0');
    if (daysInline) daysInline.textContent = String(v);
    if (p < 1) requestAnimationFrame(frame);
    else { if (daysCounter) daysCounter.textContent = String(days).padStart(3,'0'); if (daysInline) daysInline.textContent = String(days); }
  }
  requestAnimationFrame(frame);
}

function getDaysTogether() { return Math.max(0, Math.floor((Date.now() - new Date('2024-02-14T00:00:00').getTime()) / 86400000)); }
function refreshCounterInstant() { const d=getDaysTogether(); if(daysCounter)daysCounter.textContent=String(d).padStart(3,'0'); if(daysInline)daysInline.textContent=String(d); }

function revealSurprise() {
  surpriseModal.hidden=false;
  body.classList.add('pulse-bg');
  syncBodyLock();
  setTimeout(()=>body.classList.remove('pulse-bg'),1000);
  // Animate final love meter
  if (finalLoveFill) setTimeout(() => finalLoveFill.classList.add('animate'), 200);
  // Sparkle shower
  launchSparkleShower();
}
function closeSurprise() { surpriseModal.hidden=true; syncBodyLock(); }

function createHeartExplosion(x, y) {
  const total = mobileLike ? 14 : 24, codes = ['2764-fe0f','1f496','1f495','1f497'];
  for (let i = 0; i < total; i++) {
    const h = document.createElement('span'); h.className = 'explosion-heart';
    h.appendChild(emojiImg(codes[i%codes.length], 20));
    h.style.left = `${x}px`; h.style.top = `${y}px`;
    h.style.setProperty('--explode-x', `${-120+Math.random()*240}px`);
    h.style.setProperty('--explode-y', `${-170+Math.random()*160}px`);
    document.body.appendChild(h); setTimeout(()=>h.remove(), 1050);
  }
}

function openLightbox(src, cap) { lightbox.hidden=false; lightboxImage.src=src; lightboxCaption.textContent=cap; syncBodyLock(); }
function closeLightbox() { lightbox.hidden=true; lightboxImage.removeAttribute('src'); syncBodyLock(); }

/* ═══════════════════════════════════════════════════
   ENVELOPE OPENING ANIMATION
   ═══════════════════════════════════════════════════ */
function setupEnvelope() {
  if (!envelopeEl || !envelopeWrapper || !letterCardEl) return;
  envelopeEl.addEventListener('click', () => {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelopeEl.classList.add('is-open');
    setTimeout(() => {
      envelopeWrapper.classList.add('is-hidden');
      letterCardEl.style.display = '';
      letterCardEl.style.animation = 'modalPop .8s var(--ease-cinema) both';
      // Draw signature
      const sigPath = document.querySelector('.signature-path');
      if (sigPath) setTimeout(() => sigPath.classList.add('is-drawing'), 500);
      // Trigger letter typing
      if (!letterTyped && letterTyping) {
        letterTyped = true;
        typeText(letterTyping, letterTyping.dataset.text, { speed: 26, formatter: formatLetterText });
      }
    }, 1000);
  });
}

/* ═══════════════════════════════════════════════════
   LIVE TIME BREAKDOWN COUNTER
   ═══════════════════════════════════════════════════ */
function startTimeBreakdown() {
  const startDate = new Date('2024-02-14T00:00:00');
  const tbYears = document.getElementById('tb-years');
  const tbMonths = document.getElementById('tb-months');
  const tbDays = document.getElementById('tb-days');
  const tbHours = document.getElementById('tb-hours');
  const tbMins = document.getElementById('tb-mins');
  const tbSecs = document.getElementById('tb-secs');
  const tbHeartbeats = document.getElementById('tb-heartbeats');
  if (!tbYears) return;

  function update() {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    const hours = now.getHours();
    const mins = now.getMinutes();
    const secs = now.getSeconds();

    if (tbYears) tbYears.textContent = years;
    if (tbMonths) tbMonths.textContent = months;
    if (tbDays) tbDays.textContent = days;
    if (tbHours) tbHours.textContent = String(hours).padStart(2, '0');
    if (tbMins) tbMins.textContent = String(mins).padStart(2, '0');
    if (tbSecs) tbSecs.textContent = String(secs).padStart(2, '0');

    // Heartbeats: avg 72bpm * total minutes together
    const totalMs = now - startDate;
    const totalMins = totalMs / 60000;
    const heartbeats = Math.floor(totalMins * 72 * 2); // both hearts beating
    if (tbHeartbeats) tbHeartbeats.textContent = heartbeats.toLocaleString();
  }
  update();
  setInterval(update, 1000);
}

/* ═══════════════════════════════════════════════════
   WISH MODAL
   ═══════════════════════════════════════════════════ */
const WISHES = [
  '"May every sunrise bring us closer, and every sunset remind us how blessed we are." ✨',
  '"May our love story never have a last page." 💕',
  '"Wishing for a million more laughs, a million more kisses, and a forever with you." 💖',
  '"May the universe always conspire to keep us together." 🌌',
  '"I wish for nothing more than to see your smile every morning." ☀️',
  '"May our hearts always beat in rhythm, today and forever." 💓',
  '"Wishing for endless adventures with the love of my life." 🌟',
  '"May every chapter of our story be more beautiful than the last." 📖'
];

function openWishModal() {
  if (!wishModal) return;
  wishModal.hidden = false;
  if (wishResult) wishResult.hidden = true;
  syncBodyLock();
}
function closeWishModal() {
  if (!wishModal) return;
  wishModal.hidden = true;
  syncBodyLock();
}
function grantWish() {
  if (!wishResult) return;
  const wish = WISHES[Math.floor(Math.random() * WISHES.length)];
  wishResult.textContent = wish;
  wishResult.hidden = false;
  launchConfetti();
}

/* ═══════════════════════════════════════════════════
   SPARKLE SHOWER (Surprise Modal)
   ═══════════════════════════════════════════════════ */
function launchSparkleShower() {
  if (!modalSparkleShower) return;
  const canvas = modalSparkleShower;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || window.innerWidth;
  canvas.height = rect.height || window.innerHeight;

  const particles = [];
  const colors = ['#d6b896', '#a84858', '#dea7a7', '#f8f0ed', '#ffd79a', '#ff8fb6', '#fff'];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 3,
      size: 1 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.5 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.05;
      p.opacity -= 0.003;
      if (p.opacity <= 0 || p.y > canvas.height) continue;
      alive = true;
      const flicker = Math.sin(p.twinkle) * 0.3 + 0.7;
      ctx.globalAlpha = p.opacity * flicker;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      // glow
      ctx.globalAlpha = p.opacity * flicker * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame++;
    if (alive && frame < 300) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   SHARE BUTTON
   ═══════════════════════════════════════════════════ */
function handleShare() {
  const shareData = {
    title: 'Our Love Story ❤️',
    text: 'A digital love story crafted with code, designed with feelings, and dedicated to you. 💖',
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('share-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ Link Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    }).catch(() => {});
  }
}

function updateScrollParallax() {
  const shift = Math.min(window.scrollY * -0.035, 0);
  root.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
  if (scrollProgress) { const sh=document.documentElement.scrollHeight-window.innerHeight; scrollProgress.style.width=`${sh>0?(window.scrollY/sh)*100:0}%`; }
  if (floatingNav) {
    const secs=['home','build-up-section','heartbeat-sync-section','love-meter-section','memory-video-section','gallery-section','love-things-section','letter-section','counter-section','timeline-section','zodiac-section','daily-quote-section','surprise-section'];
    let active=secs[0];
    for (const id of secs) { const el=document.getElementById(id); if(el&&el.getBoundingClientRect().top<=window.innerHeight*.4) active=id; }
    floatingNav.querySelectorAll('.floating-nav__link').forEach(l=>l.classList.toggle('is-active',l.getAttribute('href')===`#${active}`));
  }
}

/* RAF-throttled scroll handler */
function onScrollThrottled() {
  if (rafScrollId) return;
  rafScrollId = requestAnimationFrame(() => {
    updateScrollParallax();
    updateLoveMeter();
    rafScrollId = null;
  });
}

/* Cursor — OPTIMIZED for speed */
function animateCursor() {
  currentCursorX += (targetCursorX-currentCursorX)*.35;
  currentCursorY += (targetCursorY-currentCursorY)*.35;
  cursorGlow.style.transform = `translate3d(${currentCursorX-11}px,${currentCursorY-11}px,0)`;
  if (Math.abs(targetCursorX-currentCursorX)>.5||Math.abs(targetCursorY-currentCursorY)>.5) requestAnimationFrame(animateCursor);
  else cursorAnimating = false;
}
function createTrailHeart(x,y) {
  const h=document.createElement('span'); h.className='cursor-trail-heart';
  const codes=['2764-fe0f','1f495','1f496'];
  h.appendChild(emojiImg(codes[Math.floor(Math.random()*codes.length)],14));
  h.style.left=`${x-7+(Math.random()*14-7)}px`; h.style.top=`${y-7+(Math.random()*14-7)}px`;
  document.body.appendChild(h); setTimeout(()=>h.remove(),800);
}
function createClickRipple(x,y) {
  const r=document.createElement('span'); r.className='click-ripple';
  r.style.left=`${x}px`; r.style.top=`${y}px`;
  document.body.appendChild(r); setTimeout(()=>r.remove(),700);
  const codes=['2764-fe0f','1f496','1f495'];
  for(let i=0;i<3;i++){const h=document.createElement('span');h.className='explosion-heart';h.appendChild(emojiImg(codes[i%codes.length],18));h.style.left=`${x}px`;h.style.top=`${y}px`;h.style.setProperty('--explode-x',`${-60+Math.random()*120}px`);h.style.setProperty('--explode-y',`${-80+Math.random()*60}px`);document.body.appendChild(h);setTimeout(()=>h.remove(),1200);}
}
function setupCursorGlow() {
  if (!finePointer || prefersReducedMotion || !cursorGlow || isTouchDevice) return;
  cursorGlow.style.willChange = 'transform';
  cursorGlow.innerHTML = ''; cursorGlow.appendChild(emojiImg('2764-fe0f',24));
  document.addEventListener('mousemove', e => {
    targetCursorX=e.clientX; targetCursorY=e.clientY; cursorGlow.style.opacity='1';
    trailCounter++; if(trailCounter%7===0) createTrailHeart(e.clientX,e.clientY);
    if(!cursorAnimating){cursorAnimating=true;requestAnimationFrame(animateCursor);}
  }, {passive:true});
  document.addEventListener('mouseleave',()=>{cursorGlow.style.opacity='0';},{passive:true});
  document.addEventListener('click',e=>{createClickRipple(e.clientX,e.clientY);});
  // Clear will-change after initial setup to free GPU memory
  setTimeout(() => { if(cursorGlow) cursorGlow.style.willChange = 'auto'; }, 5000);
}

function handleReveal(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.transitionDelay = entry.target.dataset.delay || '0s';
    entry.target.classList.add('reveal--visible');
    if (entry.target.id === 'letter-section' && !envelopeOpened) {
      // Don't auto-type the letter — wait for envelope click
    }
    if (entry.target.id === 'counter-section') animateCounter();
    observer.unobserve(entry.target);
  });
}

/* Confetti — optimized particle count */
function launchConfetti() {
  if (!confettiCanvas||!confettiCtx) return;
  confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight;
  const particles=[], colors=['#d6b896','#a84858','#f8f0ed','#dea7a7','#967d8d','#ffd79a','#ff8fb6'];
  const count = mobileLike ? 50 : 80;
  for(let i=0;i<count;i++) particles.push({x:window.innerWidth/2+(Math.random()-.5)*200,y:window.innerHeight/2,vx:(Math.random()-.5)*16,vy:-8-Math.random()*12,size:4+Math.random()*6,color:colors[Math.floor(Math.random()*colors.length)],rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*12,gravity:.18+Math.random()*.08,opacity:1,shape:Math.random()>.5?'rect':'circle'});
  let fc=0;
  function draw(){confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);let alive=false;for(const p of particles){p.x+=p.vx;p.vy+=p.gravity;p.y+=p.vy;p.rotation+=p.rotationSpeed;p.opacity-=.008;p.vx*=.99;if(p.opacity<=0)continue;alive=true;confettiCtx.save();confettiCtx.translate(p.x,p.y);confettiCtx.rotate(p.rotation*Math.PI/180);confettiCtx.globalAlpha=Math.max(0,p.opacity);confettiCtx.fillStyle=p.color;if(p.shape==='rect')confettiCtx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);else{confettiCtx.beginPath();confettiCtx.arc(0,0,p.size/2,0,Math.PI*2);confettiCtx.fill();}confettiCtx.restore();}fc++;if(alive&&fc<200)requestAnimationFrame(draw);else confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);}
  requestAnimationFrame(draw);
}

/* Apple emoji parser */
function parseAppleEmojis(rootEl) {
  const target=rootEl||document.body;
  const keys=Object.keys(APPLE_EMOJI_MAP).filter(k=>APPLE_EMOJI_MAP[k]!==null);
  keys.sort((a,b)=>b.length-a.length);
  const re=new RegExp(keys.map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  function walk(node){
    if(node.nodeType===Node.TEXT_NODE){const t=node.textContent;if(!re.test(t))return;re.lastIndex=0;const f=document.createDocumentFragment();let last=0,m;while((m=re.exec(t))!==null){if(m.index>last)f.appendChild(document.createTextNode(t.slice(last,m.index)));const c=APPLE_EMOJI_MAP[m[0]];if(c)f.appendChild(emojiImg(c,20));else f.appendChild(document.createTextNode(m[0]));last=m.index+m[0].length;}if(last<t.length)f.appendChild(document.createTextNode(t.slice(last)));node.parentNode.replaceChild(f,node);}
    else if(node.nodeType===Node.ELEMENT_NODE){const tag=node.tagName.toLowerCase();if(['script','style','textarea','select','img','canvas','video','audio','source'].includes(tag))return;Array.from(node.childNodes).forEach(walk);}
  }
  walk(target);
}

/* ═══════════════════════════════════════════════════
   STARFIELD CANVAS
   ═══════════════════════════════════════════════════ */
function initStarfield() {
  if (!starfieldCanvas || !starfieldCtx || prefersReducedMotion) return;
  const ctx = starfieldCtx;
  let stars = [];
  let lastDrawTime = 0;
  const FPS_INTERVAL = mobileLike ? 50 : 33; // cap at 20fps mobile, 30fps desktop
  function resize() {
    starfieldCanvas.width = window.innerWidth;
    starfieldCanvas.height = window.innerHeight;
    createStars();
  }
  function createStars() {
    const count = mobileLike ? 30 : 60;
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starfieldCanvas.width,
        y: Math.random() * starfieldCanvas.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }
  function draw(time) {
    // Throttle frame rate
    if (time - lastDrawTime < FPS_INTERVAL) { requestAnimationFrame(draw); return; }
    lastDrawTime = time;
    // Skip rendering if page not visible
    if (document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
    for (const s of stars) {
      const flicker = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.4 + 0.6;
      ctx.globalAlpha = s.alpha * flicker;
      ctx.fillStyle = '#f8f0ed';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      // Glow - skip on mobile for performance
      if (!mobileLike && s.radius > 1) {
        ctx.globalAlpha = s.alpha * flicker * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('optimizedResize', resize);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   CINEMATIC GALLERY SLIDESHOW
   ═══════════════════════════════════════════════════ */
function initGallerySlideshow() {
  const slideshow = document.getElementById('gallery-slideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.gallery-slide');
  const dots = slideshow.querySelectorAll('.gallery-dot');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const counterCurrent = slideshow.querySelector('.gallery-counter__current');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let autoPlayTimer = null;
  let isTransitioning = false;
  const AUTO_PLAY_INTERVAL = 5000;

  function goToSlide(index, direction = 'next') {
    if (isTransitioning || index === currentSlide) return;
    isTransitioning = true;

    // Exit current slide
    slides[currentSlide].classList.remove('is-active');
    slides[currentSlide].classList.add('is-exiting');

    // Enter new slide
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    slides[currentSlide].classList.add('is-active');

    // Update dots
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));

    // Update counter
    if (counterCurrent) counterCurrent.textContent = currentSlide + 1;

    // Add sparkle particles to new slide
    spawnSlideParticles(slides[currentSlide]);

    // Reset auto-play progress bar
    slideshow.classList.remove('is-playing');
    void slideshow.offsetWidth; // force reflow
    slideshow.classList.add('is-playing');

    // Cleanup after transition
    setTimeout(() => {
      slides.forEach(s => s.classList.remove('is-exiting'));
      isTransitioning = false;
    }, 1300);
  }

  function nextSlide() { goToSlide(currentSlide + 1, 'next'); }
  function prevSlide() { goToSlide(currentSlide - 1, 'prev'); }

  function spawnSlideParticles(slide) {
    const particleArea = slide.querySelector('.gallery-slide__particles');
    if (!particleArea || mobileLike) return;
    for (let i = 0; i < 5; i++) {
      const spark = document.createElement('span');
      spark.className = 'gallery-spark';
      spark.textContent = ['✨', '💫', '⭐', '🌟', '✦'][i % 5];
      spark.style.left = `${10 + Math.random() * 80}%`;
      spark.style.bottom = `${5 + Math.random() * 30}%`;
      spark.style.fontSize = `${0.5 + Math.random() * 0.5}rem`;
      spark.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      spark.style.animationDelay = `${Math.random() * 1}s`;
      spark.style.position = 'absolute';
      spark.style.opacity = '0';
      spark.style.animation = `slideParticle ${2.5 + Math.random() * 2}s ease-in-out ${Math.random()}s`;
      particleArea.appendChild(spark);
      setTimeout(() => spark.remove(), 5000);
    }
  }

  // Start auto-play
  function startAutoPlay() {
    stopAutoPlay();
    slideshow.classList.add('is-playing');
    autoPlayTimer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
  }
  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
    slideshow.classList.remove('is-playing');
  }

  // Navigation events
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAutoPlay(); prevSlide(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAutoPlay(); nextSlide(); startAutoPlay(); });
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoPlay();
      goToSlide(parseInt(dot.dataset.slide));
      startAutoPlay();
    });
  });

  // Touch swipe support
  let touchStartX = 0;
  slideshow.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slideshow.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoPlay();
      if (diff > 0) nextSlide(); else prevSlide();
      startAutoPlay();
    }
  }, { passive: true });

  // Keyboard navigation when gallery is visible
  document.addEventListener('keydown', (e) => {
    if (!slideshow.getBoundingClientRect || !body.classList.contains('experience-started')) return;
    const rect = slideshow.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) return;
    if (e.key === 'ArrowRight') { stopAutoPlay(); nextSlide(); startAutoPlay(); }
    if (e.key === 'ArrowLeft') { stopAutoPlay(); prevSlide(); startAutoPlay(); }
  });

  // Pause when not visible
  const visObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startAutoPlay();
      else stopAutoPlay();
    });
  }, { threshold: 0.3 });
  visObs.observe(slideshow);

  // Init first slide particles
  spawnSlideParticles(slides[0]);
}

/* ═══════════════════════════════════════════════════
   LOVE QUOTES TICKER
   ═══════════════════════════════════════════════════ */
function initLoveQuotesTicker() {
  if (!tickerTrack) return;
  const quotes = [
    '"You are my today and all of my tomorrows."',
    '"In your eyes, I found my home."',
    '"Every love story is beautiful, but ours is my favorite."',
    '"I fell in love with the way you touched me without using your hands."',
    '"You are the finest, loveliest, tenderest person I have ever known."',
    '"I look at you and see the rest of my life in front of my eyes."',
    '"My heart is, and always will be, yours."',
    '"You make my heart smile."',
    '"To be your friend was all I ever wanted; to be your lover was all I ever dreamed."',
    '"I knew I loved you before I met you."'
  ];
  // Duplicate for seamless scroll
  const allQuotes = [...quotes, ...quotes];
  tickerTrack.innerHTML = allQuotes.map(q =>
    `<span class="love-quotes-ticker__item">${q}<span class="ticker-heart">♥</span></span>`
  ).join('');
}

/* ═══════════════════════════════════════════════════
   MAGNETIC TILT EFFECT ON CARDS
   ═══════════════════════════════════════════════════ */
function initMagneticTilt() {
  if (!finePointer || prefersReducedMotion) return;
  const tiltCards = document.querySelectorAll('.story-panel, .letter-card, .counter-card, .finale-card, .hero__content');
  tiltCards.forEach(card => {
    // Add shine layer
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    card.style.position = 'relative';
    card.appendChild(shine);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      shine.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      shine.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      shine.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      shine.style.opacity = '0';
    });
  });
}

/* ═══════════════════════════════════════════════════
   HEART RAIN IN SURPRISE MODAL
   ═══════════════════════════════════════════════════ */
function createModalHeartRain() {
  if (!modalHeartRain) return;
  modalHeartRain.innerHTML = '';
  const hearts = ['❤️', '💕', '💖', '💗'];
  const count = mobileLike ? 10 : 20;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'rain-heart';
    h.textContent = hearts[i % hearts.length];
    h.style.left = `${Math.random() * 100}%`;
    h.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
    h.style.animationDuration = `${3 + Math.random() * 4}s`;
    h.style.animationDelay = `${Math.random() * 2}s`;
    modalHeartRain.appendChild(h);
  }
}

/* ═══════════════════════════════════════════════════
   STAGGER REVEAL OBSERVER
   ═══════════════════════════════════════════════════ */
function initStaggerObserver() {
  const staggerContainers = document.querySelectorAll('.story-grid, .anniversary-countdown__grid');
  staggerContainers.forEach(container => {
    container.classList.add('stagger-children');
    Array.from(container.children).forEach(child => child.classList.add('stagger-item'));
  });
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        staggerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.stagger-children').forEach(c => staggerObs.observe(c));
}

/* ═══════════════════════════════════════════════════
   BUTTON RIPPLE EFFECT
   ═══════════════════════════════════════════════════ */
function initButtonRipple() {
  document.querySelectorAll('.button, .book-enter-btn, .book-nav__btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'button-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ═══════════════════════════════════════════════════
   LOVE METER (scroll progress heart)
   ═══════════════════════════════════════════════════ */
function updateLoveMeter() {
  if (!loveMeterFill || !loveMeterGlow) return;
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  const pct = sh > 0 ? Math.min(100, Math.round((window.scrollY / sh) * 100)) : 0;
  loveMeterFill.style.height = `${pct}%`;
  loveMeterGlow.style.height = `${pct}%`;
  if (loveMeterLabel) loveMeterLabel.textContent = `${pct}%`;
}

/* ═══════════════════════════════════════════════════
   SCROLL-TRIGGERED PARTICLE BURSTS
   ═══════════════════════════════════════════════════ */
let scrollParticles = [];
let scrollParticleRAF = null;

function initScrollParticles() {
  if (!scrollParticleCanvas || !scrollParticleCtx || prefersReducedMotion) return;
  function resize() {
    scrollParticleCanvas.width = window.innerWidth;
    scrollParticleCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('optimizedResize', resize);

  function draw() {
    scrollParticleCtx.clearRect(0, 0, scrollParticleCanvas.width, scrollParticleCanvas.height);
    for (let i = scrollParticles.length - 1; i >= 0; i--) {
      const p = scrollParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.life -= 0.012;
      p.vx *= 0.99;
      if (p.life <= 0) { scrollParticles.splice(i, 1); continue; }
      scrollParticleCtx.globalAlpha = p.life;
      scrollParticleCtx.fillStyle = p.color;
      scrollParticleCtx.beginPath();
      scrollParticleCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      scrollParticleCtx.fill();
      // glow
      scrollParticleCtx.globalAlpha = p.life * 0.2;
      scrollParticleCtx.beginPath();
      scrollParticleCtx.arc(p.x, p.y, p.size * p.life * 3, 0, Math.PI * 2);
      scrollParticleCtx.fill();
    }
    scrollParticleCtx.globalAlpha = 1;
    if (scrollParticles.length > 0) {
      scrollParticleRAF = requestAnimationFrame(draw);
    } else {
      scrollParticleRAF = null;
    }
  }

  // Burst particles at section reveal
  const sectionIds = ['build-up-section', 'memory-video-section', 'gallery-section', 'love-things-section', 'letter-section', 'counter-section', 'zodiac-section', 'surprise-section'];
  const burstTriggered = new Set();
  const burstObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !burstTriggered.has(entry.target.id)) {
        burstTriggered.add(entry.target.id);
        const rect = entry.target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + 80;
        const colors = ['#d6b896', '#a84858', '#dea7a7', '#f8f0ed', '#967d8d'];
        const burstCount = mobileLike ? 12 : 20;
        for (let i = 0; i < burstCount; i++) {
          scrollParticles.push({
            x: cx + (Math.random() - 0.5) * 200,
            y: cy + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1,
            size: 2 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1
          });
        }
        if (!scrollParticleRAF) scrollParticleRAF = requestAnimationFrame(draw);
      }
    });
  }, { threshold: 0.2 });
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) burstObs.observe(el);
  });
}

/* ═══════════════════════════════════════════════════
   SECTION EMOJI RAIN
   ═══════════════════════════════════════════════════ */
function initSectionEmojiRain() {
  if (prefersReducedMotion || mobileLike) return;
  const sectionEmojis = {
    'build-up-section': ['✨', '⭐', '💫'],
    'memory-video-section': ['🎬', '🌟', '✨'],
    'gallery-section': ['🖼️', '🌸', '🌺'],
    'love-things-section': ['💖', '💝', '✨'],
    'letter-section': ['💌', '❤️', '💕'],
    'counter-section': ['⏳', '💖', '💓'],
    'zodiac-section': ['✨', '⭐', '🌟'],
    'surprise-section': ['🎁', '🎉', '🎊']
  };
  const count = mobileLike ? 6 : 12;
  Object.entries(sectionEmojis).forEach(([sectionId, emojis]) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const rain = document.createElement('div');
    rain.className = 'section-emoji-rain';
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('span');
      drop.className = 'emoji-drop';
      drop.textContent = emojis[i % emojis.length];
      drop.style.left = `${5 + Math.random() * 90}%`;
      drop.style.top = `${Math.random() * -10}%`;
      drop.style.fontSize = `${0.6 + Math.random() * 0.8}rem`;
      drop.style.animationDuration = `${6 + Math.random() * 6}s`;
      drop.style.animationDelay = `${Math.random() * 5}s`;
      rain.appendChild(drop);
    }
    section.style.position = 'relative';
    section.insertBefore(rain, section.firstChild);
  });
}

/* ═══════════════════════════════════════════════════
   LIVE ANNIVERSARY COUNTDOWN
   ═══════════════════════════════════════════════════ */
function startAnniversaryCountdown() {
  const anniDays = document.getElementById('anni-days');
  const anniHours = document.getElementById('anni-hours');
  const anniMins = document.getElementById('anni-mins');
  const anniSecs = document.getElementById('anni-secs');
  if (!anniDays) return;

  function getNextAnniversary() {
    const now = new Date();
    let year = now.getFullYear();
    let anni = new Date(year, 1, 14); // Feb 14
    if (now >= anni) anni = new Date(year + 1, 1, 14);
    return anni;
  }

  function update() {
    const now = new Date();
    const target = getNextAnniversary();
    const diff = target - now;
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (anniDays) anniDays.textContent = d;
    if (anniHours) anniHours.textContent = String(h).padStart(2, '0');
    if (anniMins) anniMins.textContent = String(m).padStart(2, '0');
    if (anniSecs) anniSecs.textContent = String(s).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

/* ═══════════════════════════════════════════════════
   SMOOTH SCROLL HIDE for scroll indicator
   ═══════════════════════════════════════════════════ */
function updateScrollIndicator() {
  const indicator = document.getElementById('scroll-indicator');
  if (!indicator) return;
  if (window.scrollY > 100) {
    indicator.style.opacity = '0';
    indicator.style.pointerEvents = 'none';
  }
}

/* ═══════════════════════════════════════════════════
   THINGS I LOVE ABOUT YOU — Typewriter Carousel
   ═══════════════════════════════════════════════════ */
const LOVE_THINGS = [
  "The way your eyes light up when you laugh",
  "How you make every ordinary moment feel magical",
  "Your voice when you say my name",
  "The way you care about the little things",
  "Your courage to love deeply and fearlessly",
  "How you always know exactly what to say",
  "The warmth of your hand in mine",
  "Your beautiful smile that heals everything",
  "The way you see beauty in everything around you",
  "How you make me want to be a better person",
  "Your kindness — it's the most beautiful thing about you",
  "The feeling of home when I'm with you",
  "How you turn my worst days into the best ones",
  "Your silly laugh that makes my heart skip",
  "The way you believe in us, even when things are hard"
];

function initLoveThingsCarousel() {
  const textEl = document.getElementById('love-things-text');
  const numEl = document.getElementById('love-thing-num');
  const progressFill = document.getElementById('love-things-progress-fill');
  const prevBtn = document.getElementById('love-things-prev');
  const nextBtn = document.getElementById('love-things-next');
  if (!textEl) return;

  let currentIndex = 0;
  let typeTimer = null;
  let autoTimer = null;
  let isTyping = false;
  const AUTO_INTERVAL = 6000;

  function typeLoveThing(text, callback) {
    if (isTyping && typeTimer) clearInterval(typeTimer);
    isTyping = true;
    textEl.innerHTML = '';
    textEl.classList.add('typing-caret');
    
    if (prefersReducedMotion) {
      textEl.innerHTML = text;
      textEl.classList.remove('typing-caret');
      isTyping = false;
      if (callback) callback();
      return;
    }

    let idx = 0;
    typeTimer = setInterval(() => {
      idx++;
      textEl.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        clearInterval(typeTimer);
        textEl.classList.remove('typing-caret');
        isTyping = false;
        if (callback) callback();
      }
    }, 35);
  }

  function showThing(index) {
    currentIndex = ((index % LOVE_THINGS.length) + LOVE_THINGS.length) % LOVE_THINGS.length;
    if (numEl) numEl.textContent = String(currentIndex + 1).padStart(2, '0');
    
    // Reset progress
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      void progressFill.offsetWidth;
      progressFill.style.transition = `width ${AUTO_INTERVAL}ms linear`;
      progressFill.style.width = '100%';
    }
    
    typeLoveThing(LOVE_THINGS[currentIndex]);
  }

  function nextThing() {
    clearInterval(autoTimer);
    showThing(currentIndex + 1);
    autoTimer = setInterval(() => showThing(currentIndex + 1), AUTO_INTERVAL);
  }
  function prevThing() {
    clearInterval(autoTimer);
    showThing(currentIndex - 1);
    autoTimer = setInterval(() => showThing(currentIndex + 1), AUTO_INTERVAL);
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevThing(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextThing(); });

  // Start when visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showThing(0);
        autoTimer = setInterval(() => showThing(currentIndex + 1), AUTO_INTERVAL);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('love-things-section');
  if (section) obs.observe(section);
}

/* ═══════════════════════════════════════════════════
   FLOATING LOVE NOTES
   ═══════════════════════════════════════════════════ */
function initFloatingLoveNotes() {
  const container = document.getElementById('floating-love-notes');
  if (!container || prefersReducedMotion || mobileLike) return;

  const notes = [
    "You are my sunshine",
    "Forever & always",
    "My heart is yours",
    "You complete me",
    "Love beyond words",
    "My favorite person",
    "Dream come true",
    "Meant to be",
    "Written in the stars",
    "My forever love",
    "Better together",
    "You are magic",
    "My brightest star",
    "Endlessly yours"
  ];

  function spawnNote() {
    if (!experienceStarted) return;
    const note = document.createElement('span');
    note.className = 'love-note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    
    const fromLeft = Math.random() > 0.5;
    const startY = 20 + Math.random() * 60; // vh
    const dur = 18 + Math.random() * 14;
    
    note.style.setProperty('--start-x', fromLeft ? '-250px' : '100vw');
    note.style.setProperty('--start-y', `${startY}vh`);
    note.style.setProperty('--end-x', fromLeft ? '110vw' : '-250px');
    note.style.setProperty('--end-y', `${startY - 15 + Math.random() * 30}vh`);
    note.style.setProperty('--note-duration', `${dur}s`);
    note.style.setProperty('--note-rotate', `${-5 + Math.random() * 10}deg`);
    
    container.appendChild(note);
    setTimeout(() => note.remove(), dur * 1000 + 500);
  }

  // Spawn periodically
  setInterval(spawnNote, 15000);
  // Initial batch
  setTimeout(spawnNote, 3000);
  setTimeout(spawnNote, 6000);
}

/* ═══════════════════════════════════════════════════
   DYNAMIC MOOD GRADIENT
   ═══════════════════════════════════════════════════ */
function initMoodGradient() {
  const moodEl = document.getElementById('mood-gradient');
  if (!moodEl) return;

  const sectionMoods = {
    'home': ['rgba(168,72,88,.06)', 'rgba(214,184,150,.04)'],
    'build-up-section': ['rgba(150,125,141,.08)', 'rgba(168,72,88,.05)'],
    'memory-video-section': ['rgba(100,60,100,.08)', 'rgba(168,72,88,.06)'],
    'gallery-section': ['rgba(214,184,150,.07)', 'rgba(168,72,88,.04)'],
    'love-things-section': ['rgba(200,80,120,.08)', 'rgba(214,184,150,.06)'],
    'letter-section': ['rgba(168,72,88,.09)', 'rgba(150,125,141,.05)'],
    'counter-section': ['rgba(214,184,150,.08)', 'rgba(168,72,88,.06)'],
    'zodiac-section': ['rgba(100,80,150,.08)', 'rgba(214,184,150,.06)'],
    'surprise-section': ['rgba(168,72,88,.1)', 'rgba(214,184,150,.08)']
  };

  function updateMood() {
    const sections = Object.keys(sectionMoods);
    let activeSection = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
        activeSection = id;
      }
    }
    const [c1, c2] = sectionMoods[activeSection];
    moodEl.style.setProperty('--mood-color-1', c1);
    moodEl.style.setProperty('--mood-color-2', c2);
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateMood);
  }, { passive: true });
  updateMood();
}

/* ═══════════════════════════════════════════════════
   HEARTBEAT VISUALIZER
   ═══════════════════════════════════════════════════ */
function initHeartbeatVisualizer() {
  const canvas = document.getElementById('heartbeat-visualizer');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let running = false;
  let phase = 0;

  function resize() {
    const rect = canvas.parentElement;
    canvas.width = Math.min(500, rect ? rect.clientWidth * 0.9 : 500);
    canvas.height = 80;
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;

    // Create gradient for the line
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(168,72,88,.2)');
    grad.addColorStop(0.3, 'rgba(168,72,88,.7)');
    grad.addColorStop(0.5, 'rgba(214,184,150,.9)');
    grad.addColorStop(0.7, 'rgba(168,72,88,.7)');
    grad.addColorStop(1, 'rgba(168,72,88,.2)');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 4 + phase;
      let y = mid;

      // Heartbeat pattern: flat → spike → dip → flat
      const pos = (t % (Math.PI * 2)) / (Math.PI * 2);
      if (pos > 0.35 && pos < 0.4) {
        y = mid - 25 * Math.sin((pos - 0.35) / 0.05 * Math.PI);
      } else if (pos > 0.4 && pos < 0.45) {
        y = mid + 15 * Math.sin((pos - 0.4) / 0.05 * Math.PI);
      } else if (pos > 0.5 && pos < 0.55) {
        y = mid - 12 * Math.sin((pos - 0.5) / 0.05 * Math.PI);
      } else {
        y = mid + Math.sin(t * 3) * 1.5;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow effect
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;

    phase += 0.03;
    requestAnimationFrame(draw);
  }

  // Start when section is visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !running) {
        running = true;
        resize();
        requestAnimationFrame(draw);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    });
  }, { threshold: 0.2 });
  const section = document.getElementById('counter-section');
  if (section) obs.observe(section);
  window.addEventListener('optimizedResize', resize);
}

/* ═══════════════════════════════════════════════════
   SHOOTING STARS
   ═══════════════════════════════════════════════════ */
function initShootingStars() {
  const canvas = document.getElementById('shooting-stars-canvas');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let stars = [];
  let running = false;

  function resize() {
    const footer = canvas.parentElement;
    if (!footer) return;
    canvas.width = footer.offsetWidth;
    canvas.height = footer.offsetHeight + 100;
  }

  function spawnStar() {
    if (stars.length > 6) return;
    stars.push({
      x: Math.random() * canvas.width * 0.8,
      y: Math.random() * canvas.height * 0.3,
      len: 40 + Math.random() * 80,
      speed: 3 + Math.random() * 5,
      angle: Math.PI / 6 + Math.random() * 0.3,
      opacity: 0.6 + Math.random() * 0.4,
      life: 1,
      trail: []
    });
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.008;
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > s.len / 2) s.trail.shift();

      if (s.life <= 0 || s.x > canvas.width || s.y > canvas.height) {
        stars.splice(i, 1);
        continue;
      }

      // Draw trail
      if (s.trail.length > 1) {
        const trailGrad = ctx.createLinearGradient(
          s.trail[0].x, s.trail[0].y,
          s.x, s.y
        );
        trailGrad.addColorStop(0, 'transparent');
        trailGrad.addColorStop(0.5, `rgba(214,184,150,${s.life * 0.3})`);
        trailGrad.addColorStop(1, `rgba(255,255,255,${s.life * s.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        for (let j = 0; j < s.trail.length; j++) {
          if (j === 0) ctx.moveTo(s.trail[j].x, s.trail[j].y);
          else ctx.lineTo(s.trail[j].x, s.trail[j].y);
        }
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.life * s.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,184,150,${s.life * 0.15})`;
        ctx.fill();
      }
    }

    // Randomly spawn
    if (Math.random() < 0.015) spawnStar();

    requestAnimationFrame(draw);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !running) {
        running = true;
        resize();
        requestAnimationFrame(draw);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    });
  }, { threshold: 0.1 });
  const footer = document.getElementById('footer-section');
  if (footer) obs.observe(footer);
  window.addEventListener('optimizedResize', resize);
}

/* ═══════════════════════════════════════════════════
   CINEMATIC LIGHT LEAK CANVAS
   ═══════════════════════════════════════════════════ */
function initLightLeaks() {
  const canvas = document.getElementById('light-leak-canvas');
  if (!canvas || prefersReducedMotion || mobileLike) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let leaks = [];
  let phase = 0;

  function spawnLeak() {
    if (leaks.length > 3) return;
    const isGold = Math.random() > 0.4;
    leaks.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      radius: 100 + Math.random() * 250,
      alpha: 0,
      maxAlpha: 0.03 + Math.random() * 0.04,
      fadeIn: true,
      speed: 0.0003 + Math.random() * 0.0005,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.15,
      color: isGold ? [214, 184, 150] : [168, 72, 88]
    });
  }

  function draw() {
    if (!experienceStarted || document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = leaks.length - 1; i >= 0; i--) {
      const l = leaks[i];
      l.x += l.driftX;
      l.y += l.driftY;

      if (l.fadeIn) {
        l.alpha += l.speed * 2;
        if (l.alpha >= l.maxAlpha) l.fadeIn = false;
      } else {
        l.alpha -= l.speed;
        if (l.alpha <= 0) { leaks.splice(i, 1); continue; }
      }

      const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius);
      grad.addColorStop(0, `rgba(${l.color[0]},${l.color[1]},${l.color[2]},${l.alpha})`);
      grad.addColorStop(0.5, `rgba(${l.color[0]},${l.color[1]},${l.color[2]},${l.alpha * 0.4})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    phase++;
    if (phase % 300 === 0) spawnLeak();
    requestAnimationFrame(draw);
  }

  window.addEventListener('optimizedResize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  spawnLeak();
  setTimeout(spawnLeak, 2000);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   SPOTLIGHT TEXT — Word-by-word glow on hero title
   ═══════════════════════════════════════════════════ */
function initSpotlightText() {
  const titleEl = document.getElementById('hero-title');
  if (!titleEl || prefersReducedMotion) return;

  const text = titleEl.textContent.trim();
  const words = text.split(/\s+/);
  titleEl.innerHTML = words.map(w =>
    `<span class="spotlight-word">${w}</span>`
  ).join(' ');

  const wordSpans = titleEl.querySelectorAll('.spotlight-word');
  let currentLit = 0;

  function lightNext() {
    if (!experienceStarted) { setTimeout(lightNext, 500); return; }

    wordSpans.forEach(s => s.classList.remove('is-lit'));

    // Light up 2-3 adjacent words at a time
    const count = Math.min(3, wordSpans.length);
    for (let i = 0; i < count; i++) {
      const idx = (currentLit + i) % wordSpans.length;
      wordSpans[idx].classList.add('is-lit');
    }

    currentLit = (currentLit + 1) % wordSpans.length;
    setTimeout(lightNext, 800);
  }

  setTimeout(lightNext, 2000);
}

/* ═══════════════════════════════════════════════════
   ZODIAC CONSTELLATION CANVAS
   ═══════════════════════════════════════════════════ */
function initZodiacStars() {
  const canvas = document.getElementById('zodiac-stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let stars = [];
  let running = false;
  let constellationLines = [];

  function resize() {
    const card = canvas.parentElement;
    if (!card) return;
    canvas.width = card.offsetWidth;
    canvas.height = card.offsetHeight;
    generateStars();
  }

  function generateStars() {
    stars = [];
    constellationLines = [];
    const count = Math.floor(canvas.width * canvas.height / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.3 + Math.random() * 1.2,
        twinkleSpeed: 0.005 + Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: 0.2 + Math.random() * 0.5
      });
    }

    // Create a few constellation "lines" by connecting nearby stars
    const brightStars = stars.filter(s => s.radius > 0.8).slice(0, 12);
    for (let i = 0; i < brightStars.length - 1; i++) {
      const a = brightStars[i];
      const b = brightStars[i + 1];
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      if (dist < 200) {
        constellationLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
  }

  let frame = 0;
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw constellation lines
    ctx.strokeStyle = 'rgba(214,184,150,.06)';
    ctx.lineWidth = 0.5;
    constellationLines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    });

    // Draw stars with twinkle
    stars.forEach(s => {
      const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.baseAlpha + twinkle * 0.3;
      if (alpha <= 0) return;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214,184,150,${Math.max(0, alpha)})`;
      ctx.fill();

      // Glow on bright stars
      if (s.radius > 0.9 && alpha > 0.4) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,184,150,${alpha * 0.08})`;
        ctx.fill();
      }
    });

    frame++;
    requestAnimationFrame(draw);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !running) {
        running = true;
        resize();
        requestAnimationFrame(draw);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    });
  }, { threshold: 0.15 });
  const section = document.getElementById('zodiac-section');
  if (section) obs.observe(section);
  window.addEventListener('optimizedResize', () => { if (running) resize(); });
}

/* ── Wire up events ── */
if (beginButton) beginButton.addEventListener('click', async () => { await playMusic(); });
if (musicToggle) musicToggle.addEventListener('click', async () => { bgMusic.paused ? await playMusic() : pauseMusic(); });
if (bgMusic) { bgMusic.addEventListener('play', () => updateMusicUI(true)); bgMusic.addEventListener('pause', () => updateMusicUI(false)); }
if (videoToggle) videoToggle.addEventListener('click', toggleVideoPlayback);
if (video) {
  video.addEventListener('click', () => { if(mobileLike&&video.paused) toggleVideoPlayback(); });
  video.addEventListener('play', updateVideoUI);
  video.addEventListener('pause', async () => { updateVideoUI(); if(musicWasPlayingBeforeVideo&&experienceStarted){musicWasPlayingBeforeVideo=false;await playMusic();} });
  video.addEventListener('ended', async () => { updateVideoUI(); if(musicWasPlayingBeforeVideo&&experienceStarted){musicWasPlayingBeforeVideo=false;await playMusic();} });
}
if (surpriseButton) surpriseButton.addEventListener('click', e => { const r=e.currentTarget.getBoundingClientRect(); createHeartExplosion(r.left+r.width/2,r.top+r.height/2); launchConfetti(); launchFireworks(); createModalHeartRain(); revealSurprise(); });
document.querySelectorAll('[data-close-surprise]').forEach(n => n.addEventListener('click', closeSurprise));
document.querySelectorAll('[data-close-wish]').forEach(n => n.addEventListener('click', closeWishModal));
document.querySelectorAll('[data-close-easter]').forEach(n => n.addEventListener('click', closeEasterEgg));
if (wishGrantBtn) wishGrantBtn.addEventListener('click', grantWish);
if (shareBtn) shareBtn.addEventListener('click', handleShare);
const wishNavBtn = document.getElementById('wish-nav-btn');
if (wishNavBtn) wishNavBtn.addEventListener('click', (e) => { e.preventDefault(); openWishModal(); });
/* Gallery cards removed — slideshow handles navigation */
document.querySelectorAll('[data-close-lightbox]').forEach(n => n.addEventListener('click', closeLightbox));
document.addEventListener('keydown', e => { if(e.key==='Escape'){closeLightbox();closeSurprise();closeWishModal();closeEasterEgg();} });

const revealObserver = new IntersectionObserver(handleReveal, { threshold: mobileLike ? 0.1 : 0.18 });
document.querySelectorAll('.reveal').forEach(n => { if(!n.classList.contains('reveal--visible')) revealObserver.observe(n); });

if (video) {
  const vlo = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting){ensureVideoLoaded();vlo.disconnect();} }); }, { rootMargin: '280px 0px' });
  const vs = document.getElementById('memory-video-section');
  if (vs) vlo.observe(vs);
}

window.addEventListener('scroll', () => {
  onScrollThrottled();
  updateScrollIndicator();
  updateBackToTop();
}, { passive: true });
window.addEventListener('resize', () => {
  debouncedResize();
  onScrollThrottled();
}, { passive: true });

/* ═══════════════════════════════════════════════════
   UPGRADE 1: FIREWORKS CANVAS
   ═══════════════════════════════════════════════════ */
function launchFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const rockets = [];
  const sparks = [];
  const colors = ['#d6b896', '#a84858', '#dea7a7', '#ff8fb6', '#ffd79a', '#f8f0ed', '#967d8d'];

  function spawnRocket() {
    rockets.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight,
      targetY: window.innerHeight * (0.15 + Math.random() * 0.35),
      speed: 4 + Math.random() * 4,
      life: 1,
      trail: []
    });
  }

  function explode(x, y) {
    const count = mobileLike ? 25 : 50;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 1 + Math.random() * 4;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 1 + Math.random() * 2,
        gravity: 0.02 + Math.random() * 0.02
      });
    }
  }

  let frame = 0;
  function draw() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Draw rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y -= r.speed;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();

      // Draw trail
      for (let j = 0; j < r.trail.length; j++) {
        const t = r.trail[j];
        ctx.globalAlpha = j / r.trail.length * 0.6;
        ctx.fillStyle = '#d6b896';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (r.y <= r.targetY) {
        explode(r.x, r.y);
        rockets.splice(i, 1);
      }
    }

    // Draw sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.vx *= 0.99;
      s.life -= 0.015;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }

      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalAlpha = s.life * 0.15;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    frame++;

    // Spawn rockets in waves
    if (frame < 60 && frame % 12 === 0) spawnRocket();
    if (frame < 90 && frame % 18 === 0) spawnRocket();

    if (frame < 250 && (rockets.length > 0 || sparks.length > 0 || frame < 90)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  spawnRocket();
  setTimeout(spawnRocket, 300);
  setTimeout(spawnRocket, 600);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   UPGRADE 2: MUSIC VISUALIZER
   ═══════════════════════════════════════════════════ */
function initMusicVisualizer() {
  /* Disabled — visualizer canvas is hidden for clean player look */
  return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let audioCtx, analyser, source, dataArray, connected = false;
  let running = false;

  function connectAudio() {
    if (connected) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source = audioCtx.createMediaElementSource(bgMusic);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      connected = true;
    } catch (e) {
      // Fallback: fake visualizer with random bars
      connected = false;
    }
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.offsetWidth;
    canvas.height = 20;
  }

  function drawFake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barCount = 20;
    const barWidth = canvas.width / barCount;
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
    grad.addColorStop(0, 'rgba(168,72,88,.6)');
    grad.addColorStop(1, 'rgba(214,184,150,.3)');
    ctx.fillStyle = grad;

    const time = Date.now() * 0.005;
    for (let i = 0; i < barCount; i++) {
      const h = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * canvas.height * 0.8;
      ctx.fillRect(i * barWidth + 1, canvas.height - h, barWidth - 2, h);
    }
  }

  function draw() {
    if (!running) return;
    resize();

    if (connected && analyser) {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = dataArray.length;
      const barWidth = canvas.width / barCount;
      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, 'rgba(168,72,88,.6)');
      grad.addColorStop(1, 'rgba(214,184,150,.3)');
      ctx.fillStyle = grad;

      for (let i = 0; i < barCount; i++) {
        const h = (dataArray[i] / 255) * canvas.height;
        ctx.fillRect(i * barWidth + 1, canvas.height - h, barWidth - 2, h);
      }
    } else {
      drawFake();
    }

    requestAnimationFrame(draw);
  }

  bgMusic.addEventListener('play', () => {
    connectAudio();
    running = true;
    resize();
    requestAnimationFrame(draw);
  });
  bgMusic.addEventListener('pause', () => { running = false; });
  bgMusic.addEventListener('ended', () => { running = false; });
}

/* ═══════════════════════════════════════════════════
   UPGRADE 3: DAILY LOVE QUOTE
   ═══════════════════════════════════════════════════ */
function initDailyLoveQuote() {
  const textEl = document.getElementById('daily-quote-text');
  const dateEl = document.getElementById('daily-quote-date');
  if (!textEl) return;

  const dailyQuotes = [
    "Samiksha, you are the reason my heart learned to beat in a rhythm called love.",
    "Every morning I wake up grateful that you exist in my world, Samiksha.",
    "If I could give you one thing, it would be the ability to see yourself through my eyes.",
    "You are my favorite notification, my favorite chapter, my favorite everything.",
    "Samiksha, loving you is like breathing — I just can't stop.",
    "In a world full of temporary things, you are my forever, Samiksha.",
    "My love for you is a journey — starting at forever and ending at never.",
    "You're not just my girlfriend, you're my best friend, my soulmate, my everything.",
    "Samiksha, with you I've found the peace I never knew I was searching for.",
    "Every love song makes sense when I think of you.",
    "You are the poetry I always wanted to write but never could find the words.",
    "Samiksha, you turned my ordinary world into an extraordinary adventure.",
    "I didn't know what true happiness was until you held my hand.",
    "You are my today, my tomorrow, and all of my forever.",
    "With you, even silence speaks volumes of love.",
    "Samiksha, you are my favorite place to go when my mind searches for peace.",
    "Every moment with you is a moment I treasure.",
    "You're the kind of beautiful that makes the stars jealous.",
    "Samiksha, being loved by you has made me unstoppable.",
    "If I had to choose between breathing and loving you, I'd use my last breath to say I love you.",
    "You are my sun, my moon, and all my stars.",
    "Samiksha, there are not enough words to tell you how much you mean to me.",
    "I love how your smile heals everything wrong in my world.",
    "Every second with you is a gift I never want to return.",
    "Samiksha, you are the missing piece I didn't know my life was waiting for.",
    "My heart skips a beat every time I see your name on my screen.",
    "You are not just my love story — you are my greatest story.",
    "Samiksha, I fall more in love with you every single day.",
    "You make my heart feel things my words can never express.",
    "If love is an ocean, you are my favorite shore.",
    "Samiksha, you are the beautiful reason my heart keeps singing."
  ];

  // Pick quote based on day of year
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const quoteIndex = dayOfYear % dailyQuotes.length;

  textEl.textContent = dailyQuotes[quoteIndex];

  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

/* ═══════════════════════════════════════════════════
   UPGRADE 4: NIGHT/DAY MOOD SYSTEM
   ═══════════════════════════════════════════════════ */
function initTimeMoodSystem() {
  const hour = new Date().getHours();
  body.classList.remove('time-night', 'time-golden', 'time-day');
  if (hour >= 20 || hour < 6) {
    body.classList.add('time-night');
  } else if ((hour >= 6 && hour < 8) || (hour >= 17 && hour < 20)) {
    body.classList.add('time-golden');
  } else {
    body.classList.add('time-day');
  }
}

/* ═══════════════════════════════════════════════════
   UPGRADE 5: DOUBLE-TAP LOVE BURST
   ═══════════════════════════════════════════════════ */
function initDoubleTapLoveBurst() {
  const container = document.getElementById('double-tap-container');
  if (!container) return;

  let lastTapTime = 0;
  const DOUBLE_TAP_DELAY = 300;

  function createLoveBurst(x, y) {
    // Big heart
    const heart = document.createElement('span');
    heart.className = 'double-tap-heart';
    heart.textContent = '❤️';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);

    // Ring effect
    const ring = document.createElement('span');
    ring.className = 'double-tap-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    container.appendChild(ring);
    setTimeout(() => ring.remove(), 800);

    // Mini hearts burst
    for (let i = 0; i < 6; i++) {
      const mini = document.createElement('span');
      mini.className = 'explosion-heart';
      mini.textContent = ['❤️', '💖', '💕', '💗', '✨', '💫'][i];
      mini.style.left = `${x}px`;
      mini.style.top = `${y}px`;
      mini.style.setProperty('--explode-x', `${-80 + Math.random() * 160}px`);
      mini.style.setProperty('--explode-y', `${-120 + Math.random() * 80}px`);
      document.body.appendChild(mini);
      setTimeout(() => mini.remove(), 1200);
    }

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  }

  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      const touch = e.changedTouches[0];
      createLoveBurst(touch.clientX, touch.clientY);
      lastTapTime = 0;
    } else {
      lastTapTime = now;
    }
  }, { passive: true });

  // Also handle double-click on desktop
  if (finePointer) {
    document.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, a, input, .book-nav, .gallery-nav, .modal')) return;
      createLoveBurst(e.clientX, e.clientY);
    });
  }
}

/* ═══════════════════════════════════════════════════
   UPGRADE 6: STORY TIMELINE SCROLL ANIMATION
   ═══════════════════════════════════════════════════ */
function initTimelineAnimation() {
  const timeline = document.getElementById('love-timeline');
  const lineFill = document.getElementById('timeline-line-fill');
  if (!timeline || !lineFill) return;

  function updateTimeline() {
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top > vh || rect.bottom < 0) return;

    const progress = Math.min(1, Math.max(0,
      (vh - rect.top) / (rect.height + vh * 0.3)
    ));
    lineFill.style.height = `${progress * 100}%`;
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateTimeline);
  }, { passive: true });
  updateTimeline();
}

/* ═══════════════════════════════════════════════════
   UPGRADE 7: SPECIAL DATE ALERTS
   ═══════════════════════════════════════════════════ */
function initSpecialDateAlerts() {
  const banner = document.getElementById('special-date-banner');
  const textEl = document.getElementById('special-date-text');
  const closeBtn = document.getElementById('special-date-close');
  if (!banner || !textEl) return;

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const startDate = new Date('2024-02-14');
  const daysSince = Math.floor((now - startDate) / 86400000);
  const monthsSince = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

  let message = '';

  // Anniversary
  if (month === 2 && day === 14) {
    const years = now.getFullYear() - 2024;
    message = years === 0
      ? '💕 Happy Valentine\'s Day & Our Love Day, Samiksha! 💕'
      : `💕 Happy ${years === 1 ? '1st' : years === 2 ? '2nd' : years === 3 ? '3rd' : years + 'th'} Anniversary, Samiksha! ${years} year${years > 1 ? 's' : ''} of pure love! 💕`;
  }
  // Monthiversary (14th of each month)
  else if (day === 14 && monthsSince > 0) {
    message = `✨ Happy ${monthsSince} month${monthsSince > 1 ? 's' : ''} together, Samiksha! Every month with you is a blessing! ✨`;
  }
  // 100/200/300/500/1000 day milestones
  else if ([100, 200, 300, 365, 500, 730, 1000].includes(daysSince)) {
    message = `🎉 Wow! ${daysSince} days of loving you, Samiksha! Every single day has been magical! 🎉`;
  }
  // Valentine's Day
  else if (month === 2 && day === 13) {
    message = '💝 Tomorrow is our special day! Get ready for something beautiful, Samiksha! 💝';
  }

  if (message) {
    textEl.textContent = message;
    banner.hidden = false;
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        banner.style.animation = 'bannerSlideIn .5s var(--ease-cinema) reverse forwards';
        setTimeout(() => { banner.hidden = true; }, 500);
      });
    }
  }
}

/* ═══════════════════════════════════════════════════
   UPGRADE 8: BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════ */
function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  if (window.scrollY > 600 && !body.classList.contains('book-phase')) {
    btn.hidden = false;
  } else {
    btn.hidden = true;
  }
}

function initBackToTop() {
  /* Disabled per user request - pink heart back to top button is removed */
  return;
}

/* ═══════════════════════════════════════════════════
   UPGRADE 9: KONAMI CODE EASTER EGG
   ═══════════════════════════════════════════════════ */
function initKonamiCode() {
  const easterModal = document.getElementById('easter-egg-modal');
  if (!easterModal) return;

  // Secret code: ↑ ↑ ↓ ↓ ← → ← → then "love"
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  let konamiIndex = 0;

  // Also detect typing "iloveyou"
  let loveBuffer = '';
  const LOVE_CODE = 'iloveyou';

  document.addEventListener('keydown', (e) => {
    // Konami
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex >= konamiSequence.length) {
        konamiIndex = 0;
        openEasterEgg();
      }
    } else {
      konamiIndex = 0;
    }

    // Love code
    if (e.key.length === 1) {
      loveBuffer += e.key.toLowerCase();
      if (loveBuffer.length > LOVE_CODE.length) loveBuffer = loveBuffer.slice(-LOVE_CODE.length);
      if (loveBuffer === LOVE_CODE) {
        loveBuffer = '';
        openEasterEgg();
      }
    }
  });
}

function openEasterEgg() {
  const modal = document.getElementById('easter-egg-modal');
  if (!modal) return;
  modal.hidden = false;
  syncBodyLock();
  launchConfetti();
  launchFireworks();
}

function closeEasterEgg() {
  const modal = document.getElementById('easter-egg-modal');
  if (!modal) return;
  modal.hidden = true;
  syncBodyLock();
}

/* ═══════════════════════════════════════════════════
   UPGRADE 10: PWA SERVICE WORKER
   ═══════════════════════════════════════════════════ */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

/* ═══════════════════════════════════════════════════
   UPGRADE 11: ENHANCED PARALLAX DEPTH
   ═══════════════════════════════════════════════════ */
function initEnhancedParallax() {
  if (prefersReducedMotion || mobileLike) return;

  const depthLayers = document.querySelectorAll('.hero__depth-layer');
  if (!depthLayers.length) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    depthLayers.forEach((layer, i) => {
      const depth = (i + 1) * 8;
      layer.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   UPGRADE 12: GALLERY LIGHTBOX SWIPE (Mobile)
   ═══════════════════════════════════════════════════ */
function initLightboxSwipe() {
  if (!lightbox) return;
  let startX = 0;
  const slides = document.querySelectorAll('.gallery-slide');
  let currentLBIndex = 0;

  lightbox.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      // Find next/prev image
      const imgs = Array.from(slides).map(s => {
        const img = s.querySelector('.gallery-slide__image');
        return img ? img.src : '';
      }).filter(Boolean);

      const currentSrc = lightboxImage.src;
      currentLBIndex = imgs.indexOf(currentSrc);

      if (diff > 0 && currentLBIndex < imgs.length - 1) {
        currentLBIndex++;
      } else if (diff < 0 && currentLBIndex > 0) {
        currentLBIndex--;
      }

      if (imgs[currentLBIndex]) {
        lightboxImage.style.transition = 'opacity .3s';
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
          lightboxImage.src = imgs[currentLBIndex];
          lightboxImage.style.opacity = '1';
        }, 300);
      }
    }
  }, { passive: true });
}

/* 3D Scroll Depth — REMOVED per user request */
function init3DScrollDepth() { /* disabled */ }

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: ROSE PETAL RAIN
   ═══════════════════════════════════════════════════ */
function initRosePetalRain() {
  const canvas = document.getElementById('rose-petal-canvas');
  if (!canvas || prefersReducedMotion || mobileLike) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let petals = [];
  const petalColors = [
    'rgba(168,72,88,.25)', 'rgba(222,167,167,.2)', 'rgba(200,100,120,.18)',
    'rgba(214,184,150,.15)', 'rgba(180,80,100,.2)'
  ];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnPetal() {
    if (petals.length > 15) return;
    petals.push({
      x: Math.random() * canvas.width,
      y: -20,
      size: 6 + Math.random() * 10,
      speedY: 0.3 + Math.random() * 0.8,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: 0.3 + Math.random() * 0.4
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    // Rose petal shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(p.size * 0.3, -p.size * 0.6, p.size * 0.8, -p.size * 0.4, p.size * 0.5, 0);
    ctx.bezierCurveTo(p.size * 0.8, p.size * 0.4, p.size * 0.3, p.size * 0.6, 0, 0);
    ctx.fill();

    // Inner vein
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = p.opacity * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p.size * 0.4, 0);
    ctx.stroke();

    ctx.restore();
  }

  function draw() {
    if (!experienceStarted || document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.5;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 30) {
        petals.splice(i, 1);
        continue;
      }
      drawPetal(p);
    }

    // Spawn new petals periodically
    if (Math.random() < 0.02) spawnPetal();

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('optimizedResize', resize);
  // Initial petals
  for (let i = 0; i < 5; i++) {
    spawnPetal();
    petals[petals.length - 1].y = Math.random() * canvas.height;
  }
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: HEART CONSTELLATION
   ═══════════════════════════════════════════════════ */
function initHeartConstellation() {
  const canvas = document.getElementById('heart-constellation-canvas');
  if (!canvas || prefersReducedMotion || mobileLike) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let points = [];
  let connections = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateHeartPoints();
  }

  function generateHeartPoints() {
    points = [];
    connections = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 50;
    const scale = Math.min(canvas.width, canvas.height) * 0.15;

    // Heart parametric equation
    const numPoints = 30;
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      const x = cx + scale * 16 * Math.pow(Math.sin(t), 3) / 16;
      const y = cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;

      points.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        baseX: x,
        baseY: y,
        radius: 0.8 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        driftPhase: Math.random() * Math.PI * 2
      });
    }

    // Connect adjacent points
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      connections.push([i, next]);
      // Skip connections
      if (i % 3 === 0 && i + 3 < points.length) {
        connections.push([i, i + 3]);
      }
    }
  }

  let frame = 0;
  function draw() {
    if (!experienceStarted || document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update points with gentle drift
    points.forEach(p => {
      p.driftPhase += 0.003;
      p.x = p.baseX + Math.sin(p.driftPhase) * 3;
      p.y = p.baseY + Math.cos(p.driftPhase * 0.7) * 3;
    });

    // Draw connections
    connections.forEach(([a, b]) => {
      const pa = points[a];
      const pb = points[b];
      const twinkleA = Math.sin(frame * pa.twinkleSpeed + pa.twinklePhase);
      const alpha = 0.03 + twinkleA * 0.015;

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = `rgba(214,184,150,${Math.max(0, alpha)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw points
    points.forEach(p => {
      const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
      const alpha = 0.15 + twinkle * 0.15;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214,184,150,${Math.max(0, alpha)})`;
      ctx.fill();

      // Glow for brighter stars
      if (p.radius > 1.2 && alpha > 0.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,72,88,${alpha * 0.1})`;
        ctx.fill();
      }
    });

    frame++;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('optimizedResize', resize);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: HEARTBEAT SYNC ANIMATION
   ═══════════════════════════════════════════════════ */
function initHeartbeatSync() {
  const bpmText = document.getElementById('bpm-sync-text');
  if (!bpmText) return;

  const messages = [
    '72 BPM — perfectly in sync 💓',
    'Beating together since Feb 14, 2024',
    'Two hearts, one beautiful rhythm',
    'Synchronized by love ∞'
  ];

  let msgIndex = 0;
  function updateBPM() {
    bpmText.style.opacity = '0';
    setTimeout(() => {
      bpmText.textContent = messages[msgIndex];
      bpmText.style.opacity = '1';
      bpmText.style.transition = 'opacity .8s cubic-bezier(0.16,1,0.3,1)';
      msgIndex = (msgIndex + 1) % messages.length;
    }, 400);
  }

  // Start when visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateBPM();
        setInterval(updateBPM, 4000);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('heartbeat-sync-section');
  if (section) obs.observe(section);
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: LOVE COMPATIBILITY METER
   ═══════════════════════════════════════════════════ */
function initLoveCompatibility() {
  const fillEl = document.getElementById('love-compat-fill');
  const numberEl = document.getElementById('love-compat-number');
  const verdictEl = document.getElementById('love-compat-verdict');
  if (!fillEl || !numberEl) return;

  const TARGET_PERCENT = 99;
  const CIRCUMFERENCE = 534; // 2 * PI * 85
  let animated = false;

  function animateCompat() {
    if (animated) return;
    animated = true;

    // Animate the ring
    const targetOffset = CIRCUMFERENCE - (CIRCUMFERENCE * TARGET_PERCENT / 100);
    fillEl.style.strokeDashoffset = targetOffset;

    // Animate the number
    const dur = 2500;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(TARGET_PERCENT * eased);
      numberEl.textContent = value;
      if (progress < 1) requestAnimationFrame(frame);
      else {
        numberEl.textContent = TARGET_PERCENT;
        if (verdictEl) {
          verdictEl.textContent = '✨ Soulmate Match — Written in the Stars ✨';
          verdictEl.style.animation = 'infinityPulse 2s ease-in-out infinite';
        }
      }
    }
    requestAnimationFrame(frame);

    // Animate trait bars
    document.querySelectorAll('.love-compat__trait-fill').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = `${bar.dataset.width}%`;
      }, 500 + i * 200);
    });
  }

  // Trigger when visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(animateCompat, 300);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('love-meter-section');
  if (section) obs.observe(section);
}

/* ═══════════════════════════════════════════════════
   MAIN INITIALIZATION
   ═══════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  /* Critical path — run immediately */
  setupCursorGlow();
  updateMusicUI(false);
  updateVideoUI();
  updateScrollParallax();
  updateNavButtons();
  initTimeMoodSystem();

  /* High priority — run on next frame */
  requestAnimationFrame(() => {
    createHeartParticles();
    parseAppleEmojis();
    initStarfield();
    initButtonRipple();
    initGallerySlideshow();
    setupEnvelope();
    startTimeBreakdown();
    initLoveThingsCarousel();
    initMoodGradient();
    initSpotlightText();
    initDailyLoveQuote();
    initSpecialDateAlerts();
    initMusicVisualizer();
    initHeartbeatSync();
    initLoveCompatibility();
  });

  /* Low priority — defer to idle time */
  const deferInit = () => {
    initMagneticTilt();
    initStaggerObserver();
    initScrollParticles();
    initSectionEmojiRain();
    startAnniversaryCountdown();
    initFloatingLoveNotes();
    initHeartbeatVisualizer();
    initShootingStars();
    initLightLeaks();
    initZodiacStars();
    initDoubleTapLoveBurst();
    initTimelineAnimation();
    initBackToTop();
    initKonamiCode();
    initEnhancedParallax();
    initLightboxSwipe();
    init3DScrollDepth();
    initRosePetalRain();
    initHeartConstellation();
    initLoveFireflies();
    initCinematicSectionGlow();
    initLoveWhispers();
    initMagneticLoveAura();
    initScrollTriggeredHeartBurst();
    initAuroraBorealis();
    initCursorLoveTrail();
    initScrollProgressHearts();
    initFloatingLovePoems();
    initEnchantedCardTilt();
    registerServiceWorker();
    setInterval(() => { if(counterAnimated) refreshCounterInstant(); }, 60000);
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferInit, { timeout: 2000 });
  } else {
    setTimeout(deferInit, 500);
  }
});

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: LOVE FIREFLIES
   Magical glowing particles that float across the screen
   ═══════════════════════════════════════════════════ */
function initLoveFireflies() {
  if (prefersReducedMotion || mobileLike) return;

  const container = document.createElement('div');
  container.className = 'love-fireflies';
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:0;transition:opacity 2s var(--ease-cinema);';
  document.body.appendChild(container);

  // Show after experience starts
  const showFireflies = () => {
    if (experienceStarted) container.style.opacity = '0.8';
  };
  const checkInterval = setInterval(() => {
    if (experienceStarted) { showFireflies(); clearInterval(checkInterval); }
  }, 500);

  const fireflyCount = 12;
  const colors = [
    'rgba(214,184,150,.6)',
    'rgba(168,72,88,.4)',
    'rgba(222,167,167,.5)',
    'rgba(255,215,154,.4)',
    'rgba(255,143,182,.35)'
  ];

  for (let i = 0; i < fireflyCount; i++) {
    const fly = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = 15 + Math.random() * 25;
    const delay = Math.random() * 15;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const driftX = -100 + Math.random() * 200;
    const driftY = -80 + Math.random() * 160;

    fly.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${startX}%;top:${startY}%;
      border-radius:50%;
      background:${color};
      box-shadow:0 0 ${size * 3}px ${color}, 0 0 ${size * 8}px ${color.replace(/[\d.]+\)$/, '0.15)')};
      animation:fireflyDrift ${duration}s ease-in-out ${delay}s infinite alternate,
                fireflyGlow ${3 + Math.random() * 4}s ease-in-out ${delay}s infinite;
      opacity:0;
    `;
    fly.style.setProperty('--drift-x', `${driftX}px`);
    fly.style.setProperty('--drift-y', `${driftY}px`);
    container.appendChild(fly);
  }
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: CINEMATIC SECTION GLOW
   Sections emit a soft bloom when they enter the viewport
   ═══════════════════════════════════════════════════ */
function initCinematicSectionGlow() {
  if (prefersReducedMotion) return;

  const allSections = document.querySelectorAll('.section');
  allSections.forEach(section => {
    // Create glow element
    const glow = document.createElement('div');
    glow.className = 'cinematic-section-glow';
    glow.style.cssText = `
      position:absolute;
      left:50%;top:50%;
      width:80%;height:80%;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:radial-gradient(ellipse, rgba(168,72,88,.04), rgba(214,184,150,.02), transparent 70%);
      filter:blur(60px);
      pointer-events:none;
      z-index:-1;
      opacity:0;
      transition:opacity 1.5s var(--ease-cinema);
    `;
    section.style.position = 'relative';
    section.insertBefore(glow, section.firstChild);
  });

  // Intersection observer to trigger glow
  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const glow = entry.target.querySelector('.cinematic-section-glow');
      if (glow) {
        glow.style.opacity = entry.isIntersecting ? '1' : '0';
      }
    });
  }, { threshold: 0.2, rootMargin: '-10% 0px' });

  allSections.forEach(s => glowObserver.observe(s));
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: LOVE WHISPERS
   Hovering over special elements shows floating whisper text
   ═══════════════════════════════════════════════════ */
function initLoveWhispers() {
  if (!finePointer || prefersReducedMotion) return;

  const whispers = [
    'I love you ❤️', 'Forever yours 💕', 'My everything ✨',
    'You are my world 🌍', 'Always & forever 💖', 'My heart beats for you 💓',
    'You complete me 🌹', 'Endlessly yours ∞', 'My soulmate 💫',
    'My favorite hello 👋', 'My hardest goodbye 😢', 'Pure magic ✨'
  ];

  const targets = document.querySelectorAll('.story-panel, .heartbeat-sync-card, .love-compat-card, .zodiac-card, .love-things-card, .daily-quote-card, .finale-card');

  targets.forEach(el => {
    let cooldown = false;
    el.addEventListener('mouseenter', (e) => {
      if (cooldown) return;
      cooldown = true;
      setTimeout(() => { cooldown = false; }, 3000);

      const whisper = whispers[Math.floor(Math.random() * whispers.length)];
      const span = document.createElement('span');
      span.className = 'love-whisper';
      span.textContent = whisper;

      const rect = el.getBoundingClientRect();
      span.style.cssText = `
        position:fixed;
        left:${rect.left + rect.width / 2}px;
        top:${rect.top - 10}px;
        transform:translateX(-50%) translateY(0);
        font-family:"Playfair Display",serif;
        font-style:italic;
        font-size:0.85rem;
        color:var(--gold);
        opacity:0;
        pointer-events:none;
        z-index:70;
        white-space:nowrap;
        text-shadow:0 0 20px rgba(214,184,150,.4);
        animation:whisperFloat 2.5s var(--ease-cinema) forwards;
      `;
      document.body.appendChild(span);
      setTimeout(() => span.remove(), 2800);
    });
  });
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: MAGNETIC LOVE AURA
   The hero section gets a breathing, reactive gradient
   ═══════════════════════════════════════════════════ */
function initMagneticLoveAura() {
  if (prefersReducedMotion || !finePointer) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const aura = document.createElement('div');
  aura.className = 'love-aura';
  aura.setAttribute('aria-hidden', 'true');
  aura.style.cssText = `
    position:absolute;
    inset:-100px;
    border-radius:50%;
    background:radial-gradient(ellipse at var(--aura-x, 50%) var(--aura-y, 50%),
      rgba(168,72,88,.08) 0%,
      rgba(214,184,150,.04) 30%,
      transparent 60%);
    pointer-events:none;
    z-index:0;
    opacity:0;
    transition:opacity 2s var(--ease-cinema);
    filter:blur(40px);
  `;
  hero.style.position = 'relative';
  hero.insertBefore(aura, hero.firstChild);

  // Show after experience starts
  const checkAura = setInterval(() => {
    if (experienceStarted) {
      aura.style.opacity = '1';
      clearInterval(checkAura);
    }
  }, 500);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    aura.style.setProperty('--aura-x', `${x}%`);
    aura.style.setProperty('--aura-y', `${y}%`);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: SCROLL-TRIGGERED HEART BURST
   Hearts burst out when scrolling past section dividers
   ═══════════════════════════════════════════════════ */
function initScrollTriggeredHeartBurst() {
  if (prefersReducedMotion) return;

  const separators = document.querySelectorAll('.glow-separator');
  const codes = ['2764-fe0f', '1f496', '1f495', '1f497'];

  const burstObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.dataset.bursted) return;
      entry.target.dataset.bursted = 'true';

      const rect = entry.target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const burstCount = mobileLike ? 4 : 8;

      for (let i = 0; i < burstCount; i++) {
        const heart = document.createElement('span');
        heart.className = 'explosion-heart';
        const code = codes[i % codes.length];
        heart.appendChild(emojiImg(code, 16));
        heart.style.left = `${cx}px`;
        heart.style.top = `${cy}px`;
        heart.style.setProperty('--explode-x', `${-80 + Math.random() * 160}px`);
        heart.style.setProperty('--explode-y', `${-70 + Math.random() * 40}px`);
        heart.style.fontSize = '0.8rem';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
      }
    });
  }, { threshold: 0.5 });

  separators.forEach(s => burstObserver.observe(s));
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: AURORA BOREALIS
   Beautiful gradient waves in the background
   ═══════════════════════════════════════════════════ */
function initAuroraBorealis() {
  /* Disabled — HTML already has aurora-backdrop with the same effect.
     Having two aurora layers doubles GPU cost for no visual gain. */
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: CURSOR LOVE TRAIL
   Hearts and sparkles follow cursor movement
   ═══════════════════════════════════════════════════ */
function initCursorLoveTrail() {
  if (!finePointer || prefersReducedMotion || mobileLike) return;

  let lastTrailTime = 0;
  const trailSymbols = ['♥', '✦', '♡', '·', '✧'];
  const trailColors = [
    'rgba(214,184,150,.5)',
    'rgba(168,72,88,.4)',
    'rgba(222,167,167,.45)'
  ];

  document.addEventListener('mousemove', (e) => {
    if (!experienceStarted || document.hidden) return;
    const now = Date.now();
    if (now - lastTrailTime < 150) return;
    lastTrailTime = now;

    const particle = document.createElement('span');
    const sym = trailSymbols[Math.floor(Math.random() * trailSymbols.length)];
    const color = trailColors[Math.floor(Math.random() * trailColors.length)];
    const size = 8 + Math.random() * 8;

    particle.textContent = sym;
    particle.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;font-size:${size}px;color:${color};pointer-events:none;z-index:65;animation:cursorTrailAnim 1s var(--ease-cinema) forwards;text-shadow:0 0 8px ${color};`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1050);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: SCROLL PROGRESS HEARTS
   ═══════════════════════════════════════════════════ */
function initScrollProgressHearts() {
  if (prefersReducedMotion) return;

  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  const heartMarker = document.createElement('span');
  heartMarker.textContent = '💖';
  heartMarker.style.cssText = 'position:absolute;right:-8px;top:-6px;font-size:14px;filter:drop-shadow(0 0 6px rgba(168,72,88,.6));animation:progressHeartBeat 1s ease-in-out infinite;z-index:201;transition:opacity .3s;opacity:0;';
  progressBar.style.position = 'relative';
  progressBar.style.overflow = 'visible';
  progressBar.appendChild(heartMarker);

  let lastScrollPct = 0;
  window.addEventListener('scroll', () => {
    if (!experienceStarted) return;
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    heartMarker.style.opacity = pct > 0.02 ? '1' : '0';
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: FLOATING LOVE POEMS
   ═══════════════════════════════════════════════════ */
function initFloatingLovePoems() {
  if (prefersReducedMotion || mobileLike) return;

  const poems = [
    '"In your eyes, I found my home" ✨',
    '"Every love story is beautiful, but ours is my favorite" 💕',
    '"You are my today and all my tomorrows" 🌹',
    '"Two hearts, one soul" ♥',
    '"You had me at hello" 💖',
    '"My heart is and always will be yours" 🌙',
  ];

  let poemIndex = 0;
  let idleTimer = null;

  function showPoem() {
    if (!experienceStarted || document.hidden) return;
    const poem = poems[poemIndex % poems.length];
    poemIndex++;

    const el = document.createElement('div');
    el.textContent = poem;
    const side = Math.floor(Math.random() * 2);
    const yPos = 20 + Math.random() * 60;

    el.style.cssText = `position:fixed;${side === 0 ? 'left:3%' : 'right:3%'};top:${yPos}%;font-family:"Playfair Display",serif;font-style:italic;font-size:clamp(0.75rem,1.5vw,0.9rem);color:rgba(214,184,150,.3);pointer-events:none;z-index:5;max-width:220px;text-align:${side === 0 ? 'left' : 'right'};line-height:1.6;animation:poemFloat 8s var(--ease-cinema) forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 8500);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showPoem, 25000);
  }

  document.addEventListener('mousemove', resetIdleTimer, { passive: true });
  document.addEventListener('scroll', resetIdleTimer, { passive: true });
  resetIdleTimer();
}

/* ═══════════════════════════════════════════════════
   ROMANTIC UPGRADE: ENCHANTED CARD TILT
   ═══════════════════════════════════════════════════ */
function initEnchantedCardTilt() {
  if (!finePointer || prefersReducedMotion || mobileLike) return;

  const cards = document.querySelectorAll('.story-panel, .zodiac-card, .love-things-card, .heartbeat-sync-card, .love-compat-card, .daily-quote-card, .timeline-item__card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -5;
      const tiltY = (x - 0.5) * 5;

      card.style.transform = `translateY(-5px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) scale(1.01)`;
      card.style.setProperty('--glow-x', `${x * 100}%`);
      card.style.setProperty('--glow-y', `${y * 100}%`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
}
