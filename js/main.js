// Copy email, active nav link, one-video-at-a-time playback, thumbnail swap, scroll reveal.
document.documentElement.classList.add('js');

const EMAIL = 'meghmenghani@gmail.com';
const toast = document.getElementById('toast');
let toastTimer;

document.querySelectorAll('.js-copy-email').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    } catch {
      // Clipboard blocked (file:// or old browser): open the mail client instead.
      location.href = `mailto:${EMAIL}`;
    }
  });
});

const navLinks = document.querySelectorAll('.menubar-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.hash === `#${e.target.id}`));
  });
}, { rootMargin: '-30% 0px -60% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

// Only one video plays at a time. Videos side by side take turns: when one clip
// ends, the next visible one starts. Hovering a video switches to it.
// Reduced motion: nothing autoplays, videos get native controls instead.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ratios = new Map();
const MIN = 0.4;
let current = null;

function setCurrent(v) {
  if (current === v) return;
  if (current) current.pause();
  current = v;
  if (v) v.play().catch(() => {});
}
const visible = () => [...ratios].filter(([, r]) => r > MIN).map(([v]) => v)
  .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

const videoSpy = new IntersectionObserver(entries => {
  entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
  const max = Math.max(0, ...ratios.values());
  if (current && (ratios.get(current) || 0) >= Math.max(MIN, max - 0.01)) return;
  let best = null;
  ratios.forEach((r, v) => { if (r > MIN && r === max) best = best || v; });
  setCurrent(best);
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });

function onEnded(e) {
  const v = e.target, list = visible();
  const next = list[(list.indexOf(v) + 1) % list.length] || v;
  if (next === v) { v.currentTime = 0; v.play().catch(() => {}); }
  else { v.currentTime = 0; setCurrent(next); }
}

function watchVideo(v) {
  if (reduceMotion) { v.controls = true; v.loop = true; return; }
  v.loop = false;
  v.addEventListener('ended', onEnded);
  const fig = v.closest('figure');
  fig.classList.add('has-video');
  v.addEventListener('play', () => fig.classList.add('is-playing'));
  v.addEventListener('pause', () => fig.classList.remove('is-playing'));
  fig.addEventListener('mouseenter', () => {
    if ((ratios.get(v) || 0) > MIN && v.isConnected) setCurrent(v);
  });
  fig.addEventListener('click', () => { if (v.isConnected) setCurrent(v); });
  videoSpy.observe(v);
}
function unwatch(el) {
  if (el.tagName !== 'VIDEO') return;
  el.pause();
  videoSpy.unobserve(el);
  ratios.delete(el);
  if (current === el) current = null;
}
document.querySelectorAll('video').forEach(watchVideo);
// The showreel autoplays on load; track it so the next video pauses it.
if (!reduceMotion) current = document.querySelector('video[autoplay]');

// Thumbnail strips: swap the main shot (image, or video if the thumb has data-video).
document.querySelectorAll('.thumbs').forEach(strip => strip.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const thumb = btn.querySelector('img');
  const video = btn.dataset.video;
  const el = document.createElement(video ? 'video' : 'img');
  if (video) Object.assign(el, { src: video, poster: thumb.src, muted: true, loop: true, playsInline: true });
  else Object.assign(el, { src: thumb.src, alt: thumb.alt });
  el.className = 'js-main';
  const old = strip.previousElementSibling.querySelector('.js-main');
  unwatch(old);
  old.replaceWith(el);
  el.closest('figure').classList.toggle('has-video', !!video);
  el.closest('figure').classList.remove('is-playing');
  if (video) { watchVideo(el); if (!reduceMotion) setCurrent(el); }
  strip.querySelector('.is-active')?.classList.remove('is-active');
  btn.classList.add('is-active');
}));

const revealer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealer.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));
