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
  const modalOpen = (surpriseModal && !surpriseModal.hidden) || (lightbox && !lightbox.hidden);
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
  const total = mobileLike ? 8 : 14;
  const codes = ['2764-fe0f','1f496','1f495'];
  for (let i = 0; i < total; i++) {
    const h = document.createElement('span'); h.className = 'heart-particle';
    const sz = Math.round(14 + Math.random()*18);
    h.appendChild(emojiImg(codes[i%codes.length], sz));
    h.style.left = `${Math.random()*100}%`;
    h.style.setProperty('--scale', (0.75+Math.random()*1.25).toFixed(2));
    h.style.setProperty('--opacity', (0.2+Math.random()*0.5).toFixed(2));
    h.style.setProperty('--drift-x', `${-70+Math.random()*140}px`);
    h.style.animationDuration = `${14+Math.random()*18}s`;
    h.style.animationDelay = `${Math.random()*10}s`;
    heartField.appendChild(h);
  }
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
  sparkleTimer = setInterval(createSparkle, mobileLike ? 2000 : 1200);
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
    const secs=['home','build-up-section','memory-video-section','gallery-section','letter-section','counter-section','surprise-section'];
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
    const count = mobileLike ? 40 : 100;
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
  const sectionIds = ['build-up-section', 'memory-video-section', 'gallery-section', 'letter-section', 'counter-section', 'surprise-section'];
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
    'letter-section': ['💌', '❤️', '💕'],
    'counter-section': ['⏳', '💖', '💓'],
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
if (surpriseButton) surpriseButton.addEventListener('click', e => { const r=e.currentTarget.getBoundingClientRect(); createHeartExplosion(r.left+r.width/2,r.top+r.height/2); launchConfetti(); createModalHeartRain(); revealSurprise(); });
document.querySelectorAll('[data-close-surprise]').forEach(n => n.addEventListener('click', closeSurprise));
document.querySelectorAll('[data-close-wish]').forEach(n => n.addEventListener('click', closeWishModal));
if (wishGrantBtn) wishGrantBtn.addEventListener('click', grantWish);
if (shareBtn) shareBtn.addEventListener('click', handleShare);
const wishNavBtn = document.getElementById('wish-nav-btn');
if (wishNavBtn) wishNavBtn.addEventListener('click', (e) => { e.preventDefault(); openWishModal(); });
/* Gallery cards removed — slideshow handles navigation */
document.querySelectorAll('[data-close-lightbox]').forEach(n => n.addEventListener('click', closeLightbox));
document.addEventListener('keydown', e => { if(e.key==='Escape'){closeLightbox();closeSurprise();closeWishModal();} });

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
}, { passive: true });
window.addEventListener('resize', () => {
  debouncedResize();
  onScrollThrottled();
}, { passive: true });

window.addEventListener('load', () => {
  /* Critical path — run immediately */
  setupCursorGlow();
  updateMusicUI(false);
  updateVideoUI();
  updateScrollParallax();
  updateNavButtons();

  /* High priority — run on next frame */
  requestAnimationFrame(() => {
    createHeartParticles();
    parseAppleEmojis();
    initStarfield();
    initLoveQuotesTicker();
    initButtonRipple();
    initGallerySlideshow();
    setupEnvelope();
    startTimeBreakdown();
  });

  /* Low priority — defer to idle time */
  const deferInit = () => {
    initMagneticTilt();
    initStaggerObserver();
    initScrollParticles();
    initSectionEmojiRain();
    startAnniversaryCountdown();
    setInterval(() => { if(counterAnimated) refreshCounterInstant(); }, 60000);
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferInit, { timeout: 2000 });
  } else {
    setTimeout(deferInit, 500);
  }
});
