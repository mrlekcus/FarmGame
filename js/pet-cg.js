/* 寵物領養店的劇情 CG：用遊戲同款的 r()／petB() 像素畫法即時畫出來，不用任何圖片檔。
   一格畫面 192×108，用 CSS 放大成滿版。每一句對白對應一格（PET_CG_BEATS），同一格連續出現時畫面接著動，換格時從黑色淡入。
   petCgStart(canvas, beatId) 開始播；petCgType(el) 讓對白一個字一個字出現；petCgSkipType() 按「繼續」時如果字還沒出完，先補完。 */
const PET_CG_BEATS = ['inside', 'trail', 'trail', 'trail', 'shop', 'paw', 'open'];   // 對應 PET_STORY 的每一句
const pcgState = { beat: '', from: '', t0: 0 }, pcgType = { el: null, full: '', at: 0, done: true };
const PCG_PATH = Array.from({ length: 11 }, (_, i) => { const t = i / 10; return [Math.round(4 + t * 90), Math.round(100 - t * 17 + (i % 2 ? 2 : -1))]; });
function pcgRnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function pcgHeart(c, x, y) { r(c, x, y, 1, 1); r(c, x + 2, y, 1, 1); r(c, x, y + 1, 3, 1); r(c, x + 1, y + 2, 1, 1); }
function pcgPaw(x, y, c) { r(c, x, y + 1, 3, 2); r(c, x, y, 1, 1); r(c, x + 2, y, 1, 1); }
function pcgSky(t) {
  ['#ffd2b0', '#ffdcbc', '#ffe6c8', '#fff0d6', '#e4f1ea', '#d2ebf0'].forEach((c, i) => r(c, 0, i * 12, 192, 12));
  const pulse = Math.round(Math.sin(t * 1.6) * 2);
  r('rgba(255,243,176,.3)', 136 - pulse, 12 - pulse, 40 + pulse * 2, 40 + pulse * 2); r('rgba(255,243,176,.5)', 144, 20, 24, 24); r('#fff3b0', 150, 26, 12, 12);
  const cx = (t * 2.2) % 240 - 30; r('rgba(255,255,255,.75)', Math.round(cx), 18, 18, 4); r('rgba(255,255,255,.75)', Math.round(cx) + 4, 15, 10, 3);
  const cx2 = (t * 1.4 + 120) % 240 - 30; r('rgba(255,255,255,.65)', Math.round(cx2), 28, 22, 4);
  for (let x = 0; x < 192; x++) r('#b8dcb2', x, 52 + Math.round(Math.sin(x / 17) * 5 + Math.sin(x / 7) * 2), 1, 40);
  for (let x = 0; x < 192; x++) r('#a4d39c', x, 66 + Math.round(Math.sin(x / 11 + 2) * 3), 1, 40);
  r('#92c98a', 0, 76, 192, 32); r('#9fd296', 0, 80, 192, 2);
  const rn = pcgRnd(11); for (let i = 0; i < 40; i++) r('#7fb878', Math.floor(rn() * 192), 78 + Math.floor(rn() * 28), 1, 2);
}
function pcgHouse(glow) {
  r('#d9b690', 60, 38, 74, 42); r('#f5dfc0', 62, 40, 70, 40); r('#e8cfa8', 62, 40, 70, 2);
  for (let i = 0; i < 14; i++) r(i % 2 ? '#e88b99' : '#e07a8a', 54 + i, 38 - i, 90 - i * 2, 1);
  r('#b85c70', 54, 38, 90, 2);
  r('#a8683a', 88, 54, 18, 26); r('#c78552', 90, 56, 14, 24); r('#ffd34d', 101, 68, 2, 2); r('#7a4a28', 88, 52, 18, 2);
  if (glow > 0) { r('rgba(255,236,170,' + (0.25 + glow * 0.3).toFixed(2) + ')', 86, 52, 22, 28); for (let i = 0; i < 12; i++) r('rgba(255,236,170,' + (0.3 - i * 0.02).toFixed(2) + ')', 88 - i, 80 + i, 18 + i * 2, 1); }
  [[68, 50], [112, 50]].forEach(([x, y]) => { r('#8a6a50', x - 1, y - 1, 14, 14); r('#bfe3f5', x, y, 12, 12); r('#fff', x + 5, y, 1, 12); r('#fff', x, y + 5, 12, 1); r('rgba(255,255,255,.5)', x + 1, y + 1, 4, 3); });
  r('#fff0d6', 90, 42, 14, 6); [92, 96, 100].forEach(x => r('#e07a8a', x, 44, 2, 2));
  r('rgba(0,0,0,.12)', 60, 80, 74, 2);
}
function pcgSparkle(t, n, seed) {
  const rn = pcgRnd(seed); for (let i = 0; i < n; i++) { const x = rn() * 192, y = 20 + rn() * 70, ph = rn() * 6.28; if (Math.sin(t * 2.4 + ph) > 0.2) r(i % 2 ? '#fff6a8' : '#ffffff', Math.floor(x), Math.floor(y), 1, 1); }
}
function pcgInside(t) {   // 第一格：從店外隔著窗戶看阿喵姊姊擦窗（畫面接著下一格的店外）
  r('#f5dfc0', 0, 0, 192, 108); for (let y = 6; y < 96; y += 12) r('#ecd6b6', 0, y, 192, 1);
  r('#8a6a50', 34, 8, 124, 70); r('#ffffff', 38, 12, 116, 62); r('#fff0d0', 40, 14, 112, 58); r('#f3e0c0', 40, 64, 112, 8);
  r('#e8cfa8', 46, 30, 34, 3); r('#a8683a', 46, 33, 34, 2); r('#ff9db8', 52, 22, 6, 8); r('#9fd296', 62, 24, 6, 6); r('#fff3b0', 70, 20, 8, 10);
  r('#8a6a50', 94, 8, 3, 66); r('#8a6a50', 38, 74, 116, 3);
  g.save(); g.translate(100, 22); g.scale(3, 3); clerkArt('cl_a', 0, 0, performance.now()); g.restore();
  const cx = Math.round(112 + Math.sin(t * 2.2) * 9);   // 抹布左右擦、手臂跟著伸
  r('#ffe3cc', cx + 8, 54, 20 - Math.max(0, cx - 112), 3); r('#d9a98e', cx + 8, 57, 20 - Math.max(0, cx - 112), 1);
  r('#ffffff', cx, 49, 9, 8); r('#ffc2d2', cx, 55, 9, 2);
  for (let i = 0; i < 3; i++) r('rgba(255,255,255,' + (0.8 - i * 0.25).toFixed(2) + ')', cx - 3 - i * 4, 52 + i, 2, 1);
  if (Math.floor(t * 4) % 2) { r('#ffffff', cx - 6, 46, 1, 3); r('#ffffff', cx - 7, 47, 3, 1); }
  r('rgba(255,255,255,.55)', 44, 14, 6, 56); r('rgba(255,255,255,.35)', 54, 14, 3, 56); r('rgba(255,255,255,.5)', 144, 14, 4, 56);
  r('#a8683a', 28, 80, 136, 8); r('#7a4a28', 28, 86, 136, 3);
  for (let i = 0; i < 9; i++) { const sw = Math.round(Math.sin(t * 1.5 + i)); r('#7fb878', 34 + i * 14, 76, 3, 5); r(i % 2 ? '#ff9db8' : '#ffd34d', 33 + i * 14, 74 + (sw > 0 ? 0 : 1), 5, 3); }
  r('#92c98a', 0, 92, 192, 16); r('#9fd296', 0, 92, 192, 2);
  for (let i = 0; i < 10; i++) { const ph = (i * 0.37 + t * 0.12) % 1; r('rgba(255,255,255,.8)', Math.round(ph * 192), 20 + (i * 17) % 60, 1, 1); }
}
function pcgDoorInside() {
  r('#3d2c3e', 0, 0, 192, 108); r('#4a3548', 0, 0, 192, 70); for (let x = 0; x < 192; x += 24) r('#43304a', x, 0, 1, 70);
  r('#8a5a3a', 0, 70, 192, 38); for (let y = 74; y < 108; y += 8) r('#7a4a2e', 0, y, 192, 1);
  r('#5c3a22', 66, 0, 60, 70); r('#6a4228', 68, 2, 56, 68); r('#5c3a22', 68, 34, 56, 1); r('#5c3a22', 96, 2, 1, 68); r('#ffd34d', 112, 38, 3, 3);
}
function pcgPawBeat(t) {
  pcgDoorInside();
  const tt = Math.min(1, t / 0.9), ease = tt * tt * (3 - 2 * tt), flick = (Math.floor(t * 3) % 2 === 0) ? 0 : 1;
  r('#fff3c0', 68, 67, 56, 3); r('#ffe9a8', 70, 66, 52, 1);
  for (let i = 0; i < 20; i++) r('rgba(255,236,170,' + (0.42 - i * 0.02).toFixed(2) + ')', 96 - (56 + i * 3) / 2, 70 + i, 56 + i * 3, 1);
  const py = Math.round(80 - ease * 10) - (t > 1.2 ? flick : 0), wig = t > 1.2 ? Math.round(Math.sin(t * 7) * 1.5) : 0;
  r('#fffaf0', 90 + wig, py, 9, 6); r('#fffaf0', 89 + wig, py + 2, 11, 3); r('#b9b0a4', 89 + wig, py + 5, 11, 1);
  r('#ffc2d2', 91 + wig, py + 2, 1, 2); r('#ffc2d2', 94 + wig, py + 1, 1, 2); r('#ffc2d2', 97 + wig, py + 2, 1, 2);
  const rn = pcgRnd(9); for (let i = 0; i < 16; i++) r('rgba(255,243,176,.8)', 70 + Math.floor(rn() * 56), 50 + Math.floor((rn() * 40 + t * 3) % 40), 1, 1);
}
function pcgOpen(t) {
  r('#3d2c3e', 0, 0, 192, 108); r('#4a3548', 0, 0, 192, 74); r('#8a5a3a', 0, 74, 192, 34);
  const dw = Math.round(68 * Math.min(1, t / 0.7)), dx = 96 - Math.round(dw / 2);
  r('#6a4228', 56, 6, 80, 70);
  if (dw > 0) {
    r('#fff3c8', dx, 12, dw, 64); r('#d9efd0', dx, 12, dw, 36); r('#fff0d6', dx, 48, dw, 16); r('#b8dcb2', dx, 52, dw, 24);
    for (let i = 0; i < 30; i++) r('rgba(255,236,170,' + Math.max(0, 0.5 - i * 0.015).toFixed(2) + ')', Math.round(dx - i * 1.4), 76 + i, Math.round(dw + i * 2.8), 1);
  }
  [['shiba_white', 70, 38, 1], ['cat_orange', 94, 40, 1], ['cat_black', 118, 38, -1]].forEach(([k, x, y, d], i) => {
    const at = 0.7 + i * 0.3, a = t - at; if (a < 0) return;
    const hop = a < 0.5 ? Math.round(Math.abs(Math.sin(a * 6.28)) * (10 - a * 16)) : 0, L = petOf(k); if (!L) return;
    g.save(); g.translate(x - 12, y - hop); g.scale(1.6, 1.6); petB(L, 0, 0, { pose: 'front', now: performance.now(), dir: d }); g.restore();
  });
  r('#6a4a5a', 14, 52, 24, 40); r('#6a4a5a', 16, 38, 20, 16); r('#6a4a5a', 14, 30, 6, 10); r('#6a4a5a', 32, 30, 6, 10);
  const rn = pcgRnd(3); for (let i = 0; i < 9; i++) { const ph = rn() * 6; const x = 66 + Math.floor(rn() * 60), y = 16 + Math.floor(rn() * 36) - Math.round(((t - 1) > 0 ? (t - 1) * 3 : 0) % 8); if (t > 0.8) pcgHeart(i % 2 ? '#ff9db8' : '#ffd34d', x, y + Math.round(Math.sin(t * 2 + ph) * 2)); }
}
function pcgDraw(beat, t) {
  if (beat === 'inside') pcgInside(t);
  else if (beat === 'trail') { pcgSky(t); pcgHouse(0); PCG_PATH.forEach(([x, y], i) => { if (t > 0.5 + i * 0.28) pcgPaw(x, y, '#8a6a50'); }); pcgSparkle(t, 14, 21); }
  else if (beat === 'shop') {
    pcgSky(t); pcgHouse(Math.min(1, t / 2)); PCG_PATH.forEach(([x, y]) => pcgPaw(x, y, '#8a6a50'));
    for (let i = 0; i < 6; i++) { const ph = ((t * 0.16) + i / 6) % 1, x = Math.round(8 + ph * 84), y = Math.round(96 - ph * 20 - Math.sin(ph * 9) * 4); pcgHeart(i % 2 ? '#ffb04a' : '#ff9db8', x, y - 6); }
    pcgSparkle(t, 18, 33);
  }
  else if (beat === 'paw') pcgPawBeat(t);
  else pcgOpen(t);
}
function pcgFrame(cv, now) {
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; const old = g; g = c;
  const t = (now - pcgState.t0) / 1000;
  try {
    pcgDraw(pcgState.beat, t);
    const vg = c.createRadialGradient(96, 54, 40, 96, 54, 108); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = vg; c.fillRect(0, 0, 192, 108);
    r('#000', 0, 0, 192, 5); r('#000', 0, 103, 192, 5);
    if (pcgState.from && pcgState.from !== pcgState.beat) { const a = 1 - Math.min(1, t / 0.45); if (a > 0) { c.globalAlpha = a; r('#000', 0, 0, 192, 108); c.globalAlpha = 1; } }
  } catch (e) { /* 畫不出來就留黑畫面，不影響劇情 */ }
  g = old;
}
function petCgStart(cv, beat) {
  if (!cv) return;
  if (pcgState.beat !== beat) { pcgState.from = pcgState.beat; pcgState.beat = beat; pcgState.t0 = performance.now(); }
  const loop = now => { if (!cv.isConnected || !cv.offsetParent) return; pcgFrame(cv, now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
function petCgReset() { pcgState.beat = ''; pcgState.from = ''; }
function petCgType(el) {
  if (!el) { pcgType.done = true; return; }
  pcgType.el = el; pcgType.full = el.dataset.full || ''; pcgType.at = performance.now(); pcgType.done = false; el.textContent = '';
  const chars = [...pcgType.full];
  const tick = now => {
    if (pcgType.el !== el || !el.isConnected) return;
    const n = Math.min(chars.length, Math.floor((now - pcgType.at) / 32));
    el.textContent = chars.slice(0, n).join('');
    if (n < chars.length) requestAnimationFrame(tick); else pcgType.done = true;
  };
  requestAnimationFrame(tick);
}
function petCgSkipType() {
  if (pcgType.done || !pcgType.el || !pcgType.el.isConnected) return false;
  pcgType.el.textContent = pcgType.full; pcgType.done = true; return true;
}
