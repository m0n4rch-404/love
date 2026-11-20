/* ============================================================
   EDIT THIS PART  (or use the link: yoursite/?name=Aisha&from=Ali)
   ============================================================ */
const CONFIG = {
  name: '',    // her name, e.g. 'Aisha'
  sender: ''   // your name, e.g. 'Ali'
};

/* ============================================================ */

const params = new URLSearchParams(location.search);
const NAME   = (params.get('name') || CONFIG.name).trim().slice(0, 30);
const SENDER = (params.get('from') || CONFIG.sender).trim().slice(0, 30);
const N = NAME || 'you';

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);

$('who').textContent = N;
$('centerName').textContent = N;
$('ask').textContent = (NAME ? NAME + ', ' : '') + 'will you be mine?';

/* ---------- canvases ---------- */
let W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2);
const bg = $('bg'), heart = $('heart'), fx = $('fx');
const bctx = bg.getContext('2d'), hctx = heart.getContext('2d'), fctx = fx.getContext('2d');

function fit() {
  W = innerWidth; H = innerHeight;
  for (const [c, x] of [[bg, bctx], [heart, hctx], [fx, fctx]]) {
    c.width = W * DPR; c.height = H * DPR;
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
}
addEventListener('resize', fit);
fit();

/* ---------- floating background hearts ---------- */
const petals = Array.from({ length: 36 }, () => ({
  x: rand(0, W), y: rand(0, H), s: rand(8, 22), v: rand(0.25, 0.9),
  a: rand(0.1, 0.45), o: rand(0, 100)
}));

function drawBg() {
  bctx.clearRect(0, 0, W, H);
  bctx.fillStyle = '#ff8fb1';
  bctx.textAlign = 'center';
  for (const p of petals) {
    p.y -= p.v;
    p.x += Math.sin((p.y + p.o) / 40) * 0.3;
    if (p.y < -30) { p.y = H + 30; p.x = rand(0, W); }
    bctx.globalAlpha = p.a;
    bctx.font = p.s + 'px serif';
    bctx.fillText('♥', p.x, p.y);
  }
  bctx.globalAlpha = 1;
}

/* ---------- the heart made of "I love you" ---------- */
/* Same maths as the Python turtle version:
   x = 16 sin^3(t),  y = 13cos t - 5cos 2t - 2cos 3t - cos 4t
   drawn on 6 layers (scale 11..16), 120 points each. */
const pts = [];
for (let i = 0; i < 120; i++) {
  const t = (i * Math.PI * 2) / 120;
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  for (let s = 11; s < 17; s++) pts.push({ x: x * s, y: y * s });
}

let heartStart = null;
const DRAW_MS = 7000;

function drawHeart(now) {
  const elapsed = now - heartStart;
  const progress = Math.min(1, elapsed / DRAW_MS);
  const eased = 1 - (1 - progress) ** 2;
  const count = Math.floor(pts.length * eased);

  // heartbeat once fully drawn
  const beat = progress < 1 ? 1 : 1 + 0.05 * Math.max(0, Math.sin(elapsed / 1000 * 3.4)) ** 8;

  const p = Math.min((W * 0.9) / 512, (H * 0.78) / 470);
  const fs = Math.max(8, Math.min(18, p * 9));
  const cx = W / 2, cy = H / 2;

  hctx.clearRect(0, 0, W, H);
  hctx.fillStyle = '#ffb6c1';
  hctx.font = `${fs}px Arial, sans-serif`;
  hctx.textAlign = 'center';
  hctx.textBaseline = 'middle';
  for (let k = 0; k < count; k++) {
    const q = pts[k];
    hctx.fillText('I love you', cx + q.x * p * beat, cy - (q.y + 40) * p * beat);
  }
}

/* ---------- confetti hearts ---------- */
let confetti = [];
const COLORS = ['#ff5c8a', '#ff8fb1', '#ffb6c1', '#ffd0dc', '#ff2e63'];

function burst(x, y, n = 60) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(3, 11);
    confetti.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
      s: rand(12, 30), c: COLORS[(Math.random() * COLORS.length) | 0], life: 1
    });
  }
}

function drawFx() {
  fctx.clearRect(0, 0, W, H);
  fctx.textAlign = 'center';
  confetti = confetti.filter((c) => c.life > 0);
  for (const c of confetti) {
    c.vy += 0.16; c.vx *= 0.99;
    c.x += c.vx; c.y += c.vy; c.life -= 0.006;
    fctx.globalAlpha = Math.max(0, c.life);
    fctx.fillStyle = c.c;
    fctx.font = c.s + 'px serif';
    fctx.fillText('♥', c.x, c.y);
  }
  fctx.globalAlpha = 1;
}

/* ---------- main loop ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  drawBg();
  if (heartStart !== null) drawHeart(now);
  drawFx();
}
requestAnimationFrame(frame);

/* ---------- story flow ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
}

async function typeInto(el, text, speed = 42) {
  for (const ch of text) { el.textContent += ch; await sleep(speed); }
}

const LINES = [
  `Happy Birthday, ${N}...`,
  'Today the world got a little brighter,',
  'because this is the day you were born.',
  "I wanted to give you something money can't buy,",
  "so I wrote some code to say what I can't say out loud.",
  'Every tiny "I love you" in that heart is a thought of you.',
  'You make my ordinary days feel like my favourite song.',
  "Your smile is the best thing I've ever seen on any screen.",
  "I looked for a bug in my feelings for you, but there isn't one.",
  'So on your special day, I have one question...'
];

let running = false;

async function start() {
  if (running) return;
  running = true;

  // 1. the heart draws itself
  $('heart').classList.remove('dim');
  $('heart').classList.add('show');
  $('center').classList.remove('show');
  show('heartScreen');
  heartStart = performance.now();
  await sleep(5200);
  $('center').classList.add('show');
  await sleep(5000);

  // 2. the letter
  $('heart').classList.add('dim');
  show('letterScreen');
  await sleep(900);
  const letter = $('letter');
  letter.innerHTML = '';
  for (const line of LINES) {
    const p = document.createElement('p');
    letter.appendChild(p);
    await typeInto(p, line, line.startsWith('Hey') ? 70 : 38);
    await sleep(500);
  }
  await sleep(1200);

  // 3. the question
  resetButtons();
  show('askScreen');
  running = false;
}

/* ---------- the Yes / No buttons ---------- */
const yes = $('yes'), no = $('no');
const NO_TEXT = ['No', 'Are you sure?', 'Really?', 'Think again...', 'Wrong button 😉', 'Just say yes ♥'];
let dodges = 0;

function resetButtons() {
  dodges = 0;
  yes.style.transform = '';
  no.textContent = 'No';
  no.style.position = '';
  no.style.left = no.style.top = '';
}

function dodge(e) {
  if (e) { e.preventDefault(); }
  dodges++;
  no.textContent = NO_TEXT[Math.min(dodges, NO_TEXT.length - 1)];
  no.style.position = 'fixed';
  const w = no.offsetWidth, h = no.offsetHeight;
  no.style.left = rand(12, Math.max(13, W - w - 12)) + 'px';
  no.style.top = rand(12, Math.max(13, H - h - 12)) + 'px';
  yes.style.transform = `scale(${Math.min(1 + dodges * 0.18, 2.2)})`;
}
no.addEventListener('pointerenter', dodge);
no.addEventListener('touchstart', dodge, { passive: false });
no.addEventListener('click', dodge);

yes.addEventListener('click', async () => {
  show('yesScreen');
  $('heart').classList.remove('dim');
  const r = yes.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 80);
  for (let i = 0; i < 6; i++) {
    setTimeout(() => burst(rand(W * 0.15, W * 0.85), rand(H * 0.2, H * 0.6), 45), 400 + i * 450);
  }

  $('code').textContent = '';
  $('sign').textContent = '';
  const code = `love = True\nwhile love:\n    print("I love you, ${N}")  # forever`;
  await sleep(600);
  await typeInto($('code'), code, 38);
  await sleep(500);
  if (SENDER) $('sign').textContent = '— ' + SENDER + ' ♥';
});

$('replay').addEventListener('click', () => {
  heartStart = null;
  hctx.clearRect(0, 0, W, H);
  $('heart').classList.remove('show');
  show('intro');
});

/* ---------- birthday cake: blow the candles, then the story starts ---------- */
const cake = $('cake');
let blown = false;

$('start').addEventListener('click', () => {
  blown = false;
  cake.classList.remove('out');
  $('wishHint').textContent = 'Tap the candles and make a wish';
  show('cakeScreen');
});

cake.addEventListener('click', async () => {
  if (blown) return;
  blown = true;
  cake.classList.add('out');
  burst(W / 2, H / 2, 90);
  $('wishHint').textContent = 'Your wish is on its way... ♥';
  await sleep(2600);
  start();
});
