'use strict';
/* 咖啡廳開幕 CG「開張剪綵」—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html（在 cafe.js 之後）。
   跟 story-cg.js／pet-cg.js 同一種做法：用遊戲自己的 cafeExtA／cafeRoom／cfActor／npcArt／drawPlayer 即時畫出來，不用任何圖片檔。
   一格畫面 192×108，用 CSS 放大成滿版。三幕：① 屋外村民聚在門口 ② 店內大家入座 ③ 特寫：第一杯。對白一個字一個字出現（petCgType）。
   ・第一次進咖啡廳自動播放一次（記在這台瀏覽器）；之後在「穿上圍裙」確認窗下面按「重看開幕故事」。
   ・只在本機演，不寫伺服器，沒有任何獎勵。
   ・播放中借用 cfOpen 讓遊戲暫停（paused() 會看它），結束或略過時放開。 */
const CFCG_KEY = 'dewfarm_cafe_cg_seen';
const CFCG_SC = [
  { cap: '屋外：村民聚在門口', lines: [{ s: 'oak', t: '暖木小木屋，今天正式開張！' }, { s: 'doudou', t: '謝謝大家來捧場，我緊張到手都在抖。' }] },
  { cap: '店內：大家入座', lines: [{ s: 'gui', t: '這個香味，比我年輕時的廚房還棒。' }, { s: 'mo', t: '我要吃鬆餅！' }] },
  { cap: '特寫：第一杯', lines: [{ s: 'oak', t: '這杯就當村子送的賀禮，請你收下。' }, { s: 'doudou', t: '歡迎光臨，以後也請多多關照。' }] }
];
const CFCG_NAME = { oak: '村長', gui: '婆婆', mo: '小茉', doudou: '豆豆' };

const cgR = (c, x, y, w, h) => r(c, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
const cgA = (c, a, x, y, w, h) => { g.globalAlpha = Math.max(0, Math.min(1, a)); cgR(c, x, y, w, h); g.globalAlpha = 1; };
function cgMe(px, py, face) { try { drawPlayer(px, py, face || 'up', false, 0, myChar()); } catch (e) { /* 角色畫不出來就略過 */ } }
function cgTree(x, y) { cgR('rgba(60,90,60,.22)', x + 1, y + 17, 14, 3); cgR('#8a5a3a', x + 6, y + 13, 4, 7); ob('#5aab62', '#3d8048', x, y, 16, 15); cgR('#7cc884', x + 3, y + 3, 5, 2); cgR('#7cc884', x + 2, y + 6, 2, 3); }
function cgConfetti(t, n, h) { const col = ['#ff8fa8', '#ffd34d', '#6ab0e0', '#8fd08a', '#fffaf0']; for (let i = 0; i < n; i++) { const p = (t * (10 + (i % 4) * 3) + i * 29) % h; cgR(col[i % 5], (i * 37 + Math.sin(t * 2 + i) * 4) % 192, p, 2, 2); } }

/* 第 1 幕　屋外：村民聚在門口、豆豆站在門口的彩帶後面 */
function cgScene1(t) {
  const now = t * 1000;
  for (let y = 0; y < 88; y += 16) for (let x = 0; x < 192; x += 16) cgR(((x + y) / 16) % 2 ? '#94c98c' : '#a2d49a', x, y, 16, 16);
  cgR('#e6cf9f', 0, 88, 192, 20); cgR('#d9bf8a', 0, 88, 192, 1);
  for (let x = 6; x < 192; x += 32) cgR('#f0e0b8', x, 98, 16, 2);
  cgTree(8, 12); cgTree(166, 20); cgTree(12, 62); cgTree(160, 66);
  cafeExtA(56, 10, now, false);
  cfActor(88, 56, 'doudou', 'down', Math.floor(now / 500) % 2, now, {});
  // 剪綵的紅彩帶與兩端的蝴蝶結
  cgR('#e8453c', 74, 69, 44, 3); cgR('#ff8a7a', 74, 69, 44, 1); cgR('#c0302a', 74, 71, 44, 1);
  [[70, 66], [114, 66]].forEach(([x, y]) => { ob('#e8453c', '#a8262a', x, y, 8, 6); cgR('#ffd34d', x + 3, y + 2, 2, 2); cgR('#e8453c', x + 1, y + 6, 2, 5); cgR('#e8453c', x + 5, y + 6, 2, 5); });
  const bob = k => Math.floor(t * 1.6 + k) % 2;
  npcArt(44, 76, 'oak', bob(0), now); npcArt(64, 76, 'gui', bob(1), now);
  cgMe(88, 76, 'up');
  npcArt(112, 76, 'li', bob(2), now); npcArt(132, 76, 'mo', bob(3), now);
  cgConfetti(t, 22, 90);
}

/* 第 2 幕　店內：四位村民坐到高腳椅上 */
function cgScene2(t) {
  const now = t * 1000;
  g.save(); g.translate(-16, -34);
  cafeRoom('wood', now, [{ k: 'doudou', x: 4, y: 4, dir: 'down', bob: Math.floor(now / 600) % 2 }], false);
  const who = ['oak', 'gui', 'li', 'mo'];
  who.forEach((k, i) => { const x = CF_SEATS[i] * 16; cfStool(x, 112, CF_TH.wood); });
  who.forEach((k, i) => { const x = CF_SEATS[i] * 16; npcArt(x, 100, k, Math.floor(t * 1.4 + i) % 2, now); });
  g.restore();
}

/* 第 3 幕　特寫：豆豆在吧台後面、村長在前面（放大 4 倍） */
function cgScene3(t) {
  const now = t * 1000, S = 4;
  for (let y = 0; y < 108; y += 16) for (let x = 0; x < 192; x += 16) cgR(((x + y) / 16) % 2 ? '#f0e0c0' : '#e6d2a8', x, y, 16, 16);
  cgR('#e8d8b8', 0, 0, 192, 4);
  g.save(); g.scale(S, S);
  CFS.grinder(3, 2); ob('#fffaf0', '#c9b79a', 38, 4, 7, 3); cgR('#ff8fa8', 40, 3, 3, 1);
  cfActor(16, 1, 'doudou', 'down', Math.floor(now / 600) % 2, now, { hold: 'cup' });
  // 吧台
  cgR('#b87a3a', 0, 13, 48, 2); cgR('#d49a52', 0, 13, 48, 1); cgR('#8a5a3a', 0, 15, 48, 7); cgR('#7a4a2a', 0, 21, 48, 1);
  for (let x = 4; x < 48; x += 12) cgR('#7a4a2a', x, 16, 1, 4);
  CFS.serve(6, 11); CFS.serve(26, 11);
  // 地板
  for (let y = 22; y < 27; y++) for (let x = 0; x < 48; x += 8) cgR((x / 8 + y) % 2 ? '#e0b080' : '#d9a56c', x, y, 8, 1);
  cgR('#b88a50', 0, 22, 48, 1);
  // 遞上的第一杯
  npcArt(16, 11, 'oak', Math.floor(t * 1.2) % 2, now);
  cfCup(33, 10 + Math.round(Math.sin(t * 3)), now, true);
  for (let i = 0; i < 4; i++) { const ph = (t * .8 + i * .25) % 1; cgA('#fff6a8', 1 - ph, 33 + i * 3 - 2 + Math.sin(ph * 6 + i) * 2, 9 - ph * 7, 1, 1); }
  g.restore();
  cgA('#fff6c0', .12 + Math.sin(t * 2) * .05, 0, 0, 192, 108);
}
const CFCG_DRAW = [cgScene1, cgScene2, cgScene3];

let cgSt = { sc: -1, from: -1, t0: 0 }, cgPlay = null, cgEl = null, cgKey = null;
function cgFrame(cv, now) {
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; const old = g; g = c;
  const t = (now - cgSt.t0) / 1000;
  try {
    c.save(); CFCG_DRAW[cgSt.sc](t); c.restore();
    const vg = c.createRadialGradient(96, 54, 40, 96, 54, 108); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = vg; c.fillRect(0, 0, 192, 108);
    r('#000', 0, 0, 192, 5); r('#000', 0, 103, 192, 5);
    if (cgSt.from !== cgSt.sc) { const a = 1 - Math.min(1, t / 0.45); if (a > 0) { c.globalAlpha = a; r('#000', 0, 0, 192, 108); c.globalAlpha = 1; } }
  } catch (e) { try { c.restore(); } catch (e2) { /* 略過 */ } }
  g = old;
}
function cgRun(cv, sc) {
  if (!cv) return;
  if (cgSt.sc !== sc) { cgSt.from = cgSt.sc; cgSt.sc = sc; cgSt.t0 = performance.now(); }
  const loop = now => { if (!cv.isConnected || cgEl === null) return; cgFrame(cv, now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
function cgPortrait(cv, s) {
  const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 22); const old = g; g = c2;
  try { if (s === 'doudou') cfActor(0, 2, 'doudou', 'down', 0, 0, {}); else npcArt(0, 4, s, 0); } catch (e) { /* 略過 */ }
  g = old;
}
function cgView() {
  const p = cgPlay, ln = p.q[p.i], last = p.i >= p.q.length - 1;
  const root = cgEl.querySelector('.card');
  root.innerHTML = '<div class="shop-h"><h2>☕ 開張剪綵</h2><button type="button" class="btn ghost" data-a="skip">略過</button></div>' +
    '<canvas id="cfcg-cv" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#000;margin-top:8px"></canvas>' +
    '<small class="empty">第 ' + (ln.sc + 1) + ' 幕　' + esc(CFCG_SC[ln.sc].cap) + '</small>' +
    '<div class="row" style="align-items:flex-start;margin-top:4px"><canvas id="cfcg-pic" width="16" height="22" style="width:48px;height:66px;flex:none;image-rendering:pixelated"></canvas>' +
    '<div class="meta"><b>' + esc(CFCG_NAME[ln.s] || '') + '</b><small id="cfcg-txt" data-full="' + esc(ln.t) + '" style="display:block;margin-top:4px;line-height:1.5;min-height:3em"></small></div></div>' +
    '<button type="button" class="btn wide" data-a="next">' + (last ? '完成' : '繼續') + '</button>';
  cgRun(root.querySelector('#cfcg-cv'), ln.sc);
  cgPortrait(root.querySelector('#cfcg-pic'), ln.s);
  petCgType(root.querySelector('#cfcg-txt'));
}
function cgClose() {
  if (cgKey) { document.removeEventListener('keydown', cgKey, true); cgKey = null; }
  if (cgEl) { cgEl.remove(); cgEl = null; }
  cgPlay = null; cgSt = { sc: -1, from: -1, t0: 0 };
  cfOpen = false; pressed.length = 0;
}
function cgNext() {
  if (!cgPlay) return;
  if (petCgSkipType()) return;   // 字還沒出完：先補完，不換句
  if (cgPlay.i < cgPlay.q.length - 1) { cgPlay.i++; cgView(); } else cgClose();
}
function cfCgPlay() {
  if (cgEl || scene !== 'cafe') return;
  const q = []; CFCG_SC.forEach((s, sc) => s.lines.forEach(l => q.push({ sc, s: l.s, t: l.t })));
  cfOpen = true; pressed.length = 0; cgPlay = { q, i: 0 };
  cgEl = document.createElement('div'); cgEl.className = 'shop'; cgEl.id = 'cfcg'; cgEl.style.zIndex = 40;
  cgEl.innerHTML = '<div class="card" tabindex="-1" style="max-width:560px;width:100%"></div>';
  $('shop').parentNode.appendChild(cgEl);
  cgEl.addEventListener('pointerdown', e => e.stopPropagation());
  cgEl.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (!b) return; if (b.dataset.a === 'skip') cgClose(); else cgNext(); });
  cgKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cgClose(); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); cgNext(); } };
  document.addEventListener('keydown', cgKey, true);
  cgView();
}
/* 第一次進咖啡廳自動播放（進店後等一下，免得跟歡迎提示擠在一起） */
function cfCgMaybe() {
  let seen = ''; try { seen = localStorage.getItem(CFCG_KEY) || ''; } catch (e) { /* 讀不到就當沒看過 */ }
  if (seen) return;
  setTimeout(() => {
    if (scene !== 'cafe' || cgEl || cfOpen || !ready || !me || paused()) return;
    try { localStorage.setItem(CFCG_KEY, '1'); } catch (e) { /* 略過：下次進店會再播一次 */ }
    cfCgPlay();
  }, 900);
}
