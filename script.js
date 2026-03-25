/* ═══════════════════════════════════════════════════
   BOOK + LOVE STORY — script.js
   ═══════════════════════════════════════════════════ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const mobileLike = window.matchMedia('(max-width: 820px)').matches;

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
const bookPrompt = document.getElementById('book-prompt');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');
const enterBtn = document.getElementById('enter-experience');

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
}

function prevPage() {
  if (currentPage <= 1) return;
  currentPage--;
  const pg = document.getElementById(`page-${currentPage}`);
  if (pg) pg.classList.remove('is-flipped');
  updatePageIndicator();
  updateNavButtons();
}

function updatePageIndicator() {
  if (!pageIndicator) return;
  if (currentPage === 0) pageIndicator.textContent = 'Cover';
  else pageIndicator.textContent = `Page ${currentPage} of ${TOTAL_PAGES}`;
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
  const total = mobileLike ? 12 : 20;
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
  for (let i = 0; i < (mobileLike ? 3 : 5); i++) setTimeout(createSparkle, i*180);
  sparkleTimer = setInterval(createSparkle, mobileLike ? 1500 : 950);
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

function revealSurprise() { surpriseModal.hidden=false; body.classList.add('pulse-bg'); syncBodyLock(); setTimeout(()=>body.classList.remove('pulse-bg'),1000); }
function closeSurprise() { surpriseModal.hidden=true; syncBodyLock(); }

function createHeartExplosion(x, y) {
  const total = mobileLike ? 22 : 36, codes = ['2764-fe0f','1f496','1f495','1f497'];
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

/* Cursor */
function animateCursor() {
  currentCursorX += (targetCursorX-currentCursorX)*.18;
  currentCursorY += (targetCursorY-currentCursorY)*.18;
  cursorGlow.style.transform = `translate(${currentCursorX-11}px,${currentCursorY-11}px)`;
  if (Math.abs(targetCursorX-currentCursorX)>.2||Math.abs(targetCursorY-currentCursorY)>.2) requestAnimationFrame(animateCursor);
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
  const codes=['2764-fe0f','1f496','1f495','1f497'];
  for(let i=0;i<6;i++){const h=document.createElement('span');h.className='explosion-heart';h.appendChild(emojiImg(codes[i%codes.length],18));h.style.left=`${x}px`;h.style.top=`${y}px`;h.style.setProperty('--explode-x',`${-60+Math.random()*120}px`);h.style.setProperty('--explode-y',`${-80+Math.random()*60}px`);document.body.appendChild(h);setTimeout(()=>h.remove(),1200);}
}
function setupCursorGlow() {
  if (!finePointer || prefersReducedMotion || !cursorGlow) return;
  cursorGlow.innerHTML = ''; cursorGlow.appendChild(emojiImg('2764-fe0f',24));
  document.addEventListener('mousemove', e => {
    targetCursorX=e.clientX; targetCursorY=e.clientY; cursorGlow.style.opacity='1';
    trailCounter++; if(trailCounter%4===0) createTrailHeart(e.clientX,e.clientY);
    const ox=((e.clientX/window.innerWidth)-.5)*18, oy=((e.clientY/window.innerHeight)-.5)*14;
    root.style.setProperty('--parallax-x',`${ox.toFixed(2)}px`);
    root.style.setProperty('--parallax-y',`${oy.toFixed(2)}px`);
    if(!cursorAnimating){cursorAnimating=true;requestAnimationFrame(animateCursor);}
  });
  document.addEventListener('mouseleave',()=>{cursorGlow.style.opacity='0';});
  document.addEventListener('click',e=>{createClickRipple(e.clientX,e.clientY);});
}

function handleReveal(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.transitionDelay = entry.target.dataset.delay || '0s';
    entry.target.classList.add('reveal--visible');
    if (entry.target.id === 'letter-section' && !letterTyped) {
      letterTyped = true;
      typeText(letterTyping, letterTyping.dataset.text, { speed: 26, formatter: formatLetterText });
    }
    if (entry.target.id === 'counter-section') animateCounter();
    observer.unobserve(entry.target);
  });
}

/* Confetti */
function launchConfetti() {
  if (!confettiCanvas||!confettiCtx) return;
  confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight;
  const particles=[], colors=['#d6b896','#a84858','#f8f0ed','#dea7a7','#967d8d','#ffd79a','#ff8fb6'];
  for(let i=0;i<120;i++) particles.push({x:window.innerWidth/2+(Math.random()-.5)*200,y:window.innerHeight/2,vx:(Math.random()-.5)*16,vy:-8-Math.random()*12,size:4+Math.random()*6,color:colors[Math.floor(Math.random()*colors.length)],rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*12,gravity:.18+Math.random()*.08,opacity:1,shape:Math.random()>.5?'rect':'circle'});
  let fc=0;
  function draw(){confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);let alive=false;for(const p of particles){p.x+=p.vx;p.vy+=p.gravity;p.y+=p.vy;p.rotation+=p.rotationSpeed;p.opacity-=.006;p.vx*=.99;if(p.opacity<=0)continue;alive=true;confettiCtx.save();confettiCtx.translate(p.x,p.y);confettiCtx.rotate(p.rotation*Math.PI/180);confettiCtx.globalAlpha=Math.max(0,p.opacity);confettiCtx.fillStyle=p.color;if(p.shape==='rect')confettiCtx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);else{confettiCtx.beginPath();confettiCtx.arc(0,0,p.size/2,0,Math.PI*2);confettiCtx.fill();}confettiCtx.restore();}fc++;if(alive&&fc<300)requestAnimationFrame(draw);else confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);}
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
if (surpriseButton) surpriseButton.addEventListener('click', e => { const r=e.currentTarget.getBoundingClientRect(); createHeartExplosion(r.left+r.width/2,r.top+r.height/2); launchConfetti(); revealSurprise(); });
document.querySelectorAll('[data-close-surprise]').forEach(n => n.addEventListener('click', closeSurprise));
document.querySelectorAll('.gallery-card').forEach(c => c.addEventListener('click', () => openLightbox(c.dataset.lightboxSrc, c.dataset.lightboxCaption)));
document.querySelectorAll('[data-close-lightbox]').forEach(n => n.addEventListener('click', closeLightbox));
document.addEventListener('keydown', e => { if(e.key==='Escape'){closeLightbox();closeSurprise();} });

const revealObserver = new IntersectionObserver(handleReveal, { threshold: mobileLike ? 0.1 : 0.18 });
document.querySelectorAll('.reveal').forEach(n => { if(!n.classList.contains('reveal--visible')) revealObserver.observe(n); });

if (video) {
  const vlo = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting){ensureVideoLoaded();vlo.disconnect();} }); }, { rootMargin: '280px 0px' });
  const vs = document.getElementById('memory-video-section');
  if (vs) vlo.observe(vs);
}

window.addEventListener('scroll', updateScrollParallax, { passive: true });
window.addEventListener('resize', updateScrollParallax, { passive: true });

/* ── Init ── */
window.addEventListener('load', () => {
  createHeartParticles();
  setupCursorGlow();
  updateMusicUI(false);
  updateVideoUI();
  updateScrollParallax();
  updateNavButtons();
  parseAppleEmojis();
  setInterval(() => { if(counterAnimated) refreshCounterInstant(); }, 60000);
});
