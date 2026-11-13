'use strict';
/* 遊戲店美術（外觀：紫色像素方塊屋；店內：街機排排站 霓虹夜光；店員：機器人）—— 雷克斯農場。用遊戲自己的 r()／rr()／ob() 畫。
   依賴 art/cafe.js 的 cfKit／cfHuman／CF_NPCS／cfNum／cfHi／cfLo／CF_H／CF_B。
   gsExt(ox,oy,now,lit) 外觀（80×64）；gsRoom(now,cast,lit) 店內 16×16 格；店員用 cfActor(px,py,'robo',dir,bob,now) */
const GS_MF = { G: ['111','100','101','101','111'], A: ['111','101','111','101','101'], M: ['101','111','111','101','101'], E: ['111','100','111','100','111'], O: ['111','101','101','101','111'], P: ['111','101','111','100','100'], N: ['101','111','111','111','101'], C: ['111','100','100','100','111'], I: ['111','010','010','010','111'], S: ['111','100','111','001','111'], L: ['100','100','100','100','111'], Y: ['101','101','010','010','010'], H: ['101','101','111','101','101'], R: ['110','101','110','101','101'], B: ['110','101','110','101','110'], D: ['110','101','101','101','110'], U: ['101','101','101','101','111'], '1': ['010','110','010','010','111'] };
function gsText(s, x, y, c) { for (let i = 0; i < s.length; i++) { const gl = GS_MF[s[i]]; if (!gl) continue; gl.forEach((row, j) => { for (let k = 0; k < 3; k++) if (row[k] === '1') r(c, x + i * 4 + k, y + j, 1, 1); }); } }
function gsGlow(cx, cy, rad, col, a) { g.globalAlpha = a; for (let i = 3; i >= 1; i--) r(col, cx - rad * i / 3, cy - rad * i / 3 * .8, rad * 2 * i / 3, rad * 1.6 * i / 3); g.globalAlpha = 1; }
/* ───────── 外觀：像素方塊屋（紫／薄荷／晴空橘），屋頂是大遊戲手把 ───────── */
const GS_EXT = {
  violet: { name: '紫色方塊屋', wall: '#9a80f4', wallD: '#4b35a8', roof: '#6a4fe0', roofD: '#33238a', roofL: '#a98cff', accent: '#ff7ab8', door: '#5ee0b5', pad: '#f3f3fa' }
};
function gsPad(x, y, now, th) {
  const bl = Math.floor(now / 500) % 2;
  ob(th.pad, '#5a5a78', x, y, 36, 17); r('#ffffff', x + 2, y + 1, 32, 1);
  ob('#e4e4f2', '#5a5a78', x - 3, y + 9, 10, 9); ob('#e4e4f2', '#5a5a78', x + 29, y + 9, 10, 9);
  r('#3a3a52', x + 6, y + 7, 9, 3); r('#3a3a52', x + 9, y + 4, 3, 9);
  ob('#ff5c7a', '#b83a56', x + 23, y + 4, 5, 5); ob('#ffd34d', '#b8892a', x + 28, y + 8, 5, 5);
  r(bl ? '#6fd06a' : '#9fe0a0', x + 17, y + 4, 3, 2); r('#3a3a52', x + 15, y + 9, 3, 2); r('#3a3a52', x + 19, y + 9, 3, 2);
}
function gsExt(ox, oy, now, lit) {
  const th = GS_EXT.violet, dx = ox + 40, f = Math.floor(now / 350);
  r('rgba(107,72,72,.16)', ox + 2, oy + 61, 76, 3);
  gsPad(ox + 22, oy - 9, now, th);
  for (let i = 0; i < 8; i++) { const x = ox + 3 + i * 9; ob(th.roof, th.roofD, x, oy + 12, 8, 8); r(th.roofL, x + 1, oy + 13, 5, 1); rr(th.roofL, x + 2, oy + 10, 4, 3); }
  ob(th.wall, th.wallD, ox + 3, oy + 19, 74, 43);
  for (let y = oy + 26; y < oy + 60; y += 7) { r(shade(th.wall, .9), ox + 4, y, 72, 1); const off = ((y - oy) / 7 | 0) % 2 * 9; for (let x = ox + 8 + off; x < ox + 76; x += 18) r(shade(th.wall, .9), x, y - 6, 1, 6); }
  r(th.roofL, ox + 4, oy + 20, 72, 1);
  ob(th.roof, th.roofD, ox, oy + 17, 80, 6); r(th.roofL, ox + 2, oy + 18, 76, 1);
  for (let x = ox + 3; x < ox + 78; x += 8) { r(th.roofD, x, oy + 22, 6, 1); }
  ob('#24243a', th.accent, dx - 19, oy + 25, 38, 13);
  ob('#ffd34d', '#b8892a', dx - 16, oy + 28, 5, 5); r('#fff3b0', dx - 15, oy + 29, 1, 1); ob('#ffd34d', '#b8892a', dx + 11, oy + 28, 5, 5); r('#fff3b0', dx + 12, oy + 29, 1, 1);
  gsText('GAME', dx - 8, oy + 28, '#ffd34d');
  for (let i = 0; i < 9; i++) r((i + f) % 2 ? th.accent : shade(th.accent, .7), dx - 17 + i * 4, oy + 39, 3, 1);
  [ox + 8, ox + 52].forEach((wx, wi) => {
    ob('#2a2a3a', th.wallD, wx, oy + 41, 20, 18); r('#1b1b30', wx + 2, oy + 43, 16, 14);
    [[wx + 3, '#e0457b', 0], [wx + 11, '#3aa0e8', 1]].forEach(([cx, col, k]) => {
      ob(col, shade(col, .55), cx, oy + 45, 7, 12); r(['#bff3ff', '#ffe9a8', '#ffb3c9', '#b8f5c8'][(f + k + wi) % 4], cx + 1, oy + 47, 5, 3); r('#fffaf0', cx + 2, oy + 53, 1, 1); r('#ffd34d', cx + 4, oy + 53, 1, 1);
    });
    r('rgba(255,255,255,.35)', wx + 3, oy + 43, 3, 1);
  });
  ob(th.door, shade(th.door, .6), dx - 8, oy + 40, 16, 22); r('#dffcf3', dx - 6, oy + 42, 12, 8); r(th.door, dx - 1, oy + 42, 2, 8); r(shade(th.door, 1.15), dx - 6, oy + 52, 12, 1); r('#ffd34d', dx + 4, oy + 54, 2, 2);
  ob('#fffaf0', th.accent, dx - 10, oy + 51, 21, 9); gsText('OPEN', dx - 8, oy + 53, shade(th.accent, .8));
  [dx - 14, dx + 12].forEach(x => { r('#5e3a24', x + 1, oy + 40, 1, 2); ob('#ffe58a', '#c9971a', x, oy + 42, 3, 5); });
  rr('#c9a37a', dx - 10, oy + 62, 20, 2);
  ob('#8c5b3c', '#5e3a24', ox + 2, oy + 54, 5, 8); r('#6fd06a', ox + 1, oy + 50, 7, 5); r('#ff8fa8', ox + 3, oy + 48, 3, 3); r('#ffd34d', ox + 5, oy + 47, 2, 2);
  ob('#8c5b3c', '#5e3a24', ox + 73, oy + 54, 5, 8); r('#6fd06a', ox + 72, oy + 50, 7, 5); r('#ffd34d', ox + 74, oy + 48, 3, 3); r('#ff8fa8', ox + 73, oy + 47, 2, 2);
  if (lit) { [ox + 18, ox + 62].forEach(x => gsGlow(x, oy + 50, 15, '#a8d8ff', .12)); gsGlow(dx - 12, oy + 46, 9, '#ffe58a', .15); gsGlow(dx + 14, oy + 46, 9, '#ffe58a', .15); }
}
/* ───────── 店內：街機排排站（16×16 格，8 張凳子） ───────── */
const GS_T = 16;
const GS_TH = {
  neon: { name: '霓虹夜光', fl: ['#2b3a52', '#334560'], wl: ['#1e2840', '#2a3656'], wtop: '#12182c', neon: ['#ff5fb0', '#5ae0ff'], stool: '#ff7ab8', cab: ['#e0457b', '#3aa0e8', '#f2b134', '#5cc77a'], cnt: ['#6a4a8a', '#8a64b0', '#4a3068'], rug: ['#7a3aa8', '#b06ad8', '#e8d0ff'], front: '#1b2236', sideC: '#1b2236', dark: true }
};
function gsFloor(th, px, py, tx, ty, key) {
  r(th.fl[(tx + ty) % 2], px, py, GS_T, GS_T);
  if (key === 'wood') { const ln = '#c99a6a'; r(ln, px, py + 3, 16, 1); r(ln, px, py + 7, 16, 1); r(ln, px, py + 11, 16, 1); r(ln, px, py + 15, 16, 1); r(ln, px + ((tx * 5 + ty * 3) % 12) + 2, py, 1, 3); r(ln, px + ((tx * 7 + ty) % 12) + 1, py + 4, 1, 3); r(ln, px + ((tx + ty * 5) % 12) + 2, py + 8, 1, 3); r(ln, px + ((tx * 3 + ty * 7) % 12) + 1, py + 12, 1, 3); r(th.fl[0], px, py, 16, 0); }
  else if (key === 'neon') { r('rgba(120,170,255,.10)', px, py, 16, 1); r('rgba(120,170,255,.10)', px, py, 1, 16); if ((tx * 3 + ty * 5) % 7 === 0) r('rgba(255,255,255,.18)', px + 5, py + 6, 1, 1); }
  else { r('rgba(255,255,255,.45)', px + 2, py + 2, 3, 1); }
}
function gsWall(th, px, py, tx, ty, key) {
  r(th.wl[0], px, py, 16, 16);
  if (key === 'candy') { if (ty === 1) { r('#ffbfd0', px, py + 10, 16, 6); } [[3, 3], [11, 9]].forEach(([a, b]) => { rr('#fffaf0', px + a + ((tx % 2) ? 1 : 0), py + b, 3, 3); }); }
  else if (key === 'wood') { for (let yy = 0; yy < 16; yy++) { const ay = py + yy; if (yy % 5 === 4) r('#c08a58', px, ay, 16, 1); else if (yy % 5 === 0) r('#e8b27a', px, ay, 16, 1); } }
  else { r(th.wl[1], px, py + 8, 16, 1); if ((tx + ty) % 2) r(th.wl[1], px + 4, py + 2, 8, 2); }
  if (ty === 0) { r(th.wtop, px, py, 16, 4); r(shade(th.wtop, 1.3), px, py + 4, 16, 1); }
  if (ty === 1) { r(shade(th.wl[0], .85), px, py + 14, 16, 2); r(shade(th.wl[0], 1.12), px, py + 13, 16, 1); }
}
function gsCab(x, y, col, now, k) {
  const f = Math.floor(now / 300), c = col, d = shade(col, .55);
  r('rgba(60,40,60,.22)', x + 3, y + 31, 26, 1);
  ob(c, d, x + 2, y + 5, 28, 26); ob(shade(c, .8), d, x + 5, y, 22, 8);
  r('#fff3b0', x + 8, y + 2, 16, 3); r(c, x + 11, y + 2, 2, 3); r(c, x + 18, y + 2, 2, 3); r(c, x + 14, y + 3, 4, 1);
  ob('#1d1d33', '#0e0e1e', x + 6, y + 10, 20, 12);
  if (k % 4 === 0) { const sh = f % 4; [0, 1].forEach(row => [0, 1, 2, 3].forEach(i => { const bx = x + 8 + i * 4 + (sh < 2 ? sh : 4 - sh) - 1; r(row ? '#ff7ab8' : '#8fe0ff', bx, y + 12 + row * 3, 3, 2); })); r('#6fd06a', x + 14 + (f % 3) - 1, y + 19, 4, 2); r('#6fd06a', x + 15 + (f % 3) - 1, y + 18, 2, 1); }
  else if (k % 4 === 1) { [[8, 18], [9, 18], [10, 18], [10, 17], [10, 16], [11, 16], [12, 16], [13, 16], [13, 15]].forEach(([a, b]) => r('#6fd06a', x + a, y + b - 4 + (f % 2), 1, 1)); r('#ff5c7a', x + 20, y + 13, 2, 2); r('#6fd06a', x + 14, y + 16 + (f % 2), 1, 1); }
  else if (k % 4 === 2) { r('#ffffff', x + 8, y + 13 + (f % 3), 1, 4); r('#ffffff', x + 23, y + 17 - (f % 3), 1, 4); r('#ffd34d', x + 12 + (f * 2) % 8, y + 14 + (f % 4), 2, 2); r('#4a4a6a', x + 16, y + 11, 1, 10); }
  else { r('#5a5a7a', x + 7, y + 11, 18, 10); r('#ffffff', x + 15, y + 12 + (f % 2), 1, 2); r('#ffffff', x + 15, y + 16 + (f % 2), 1, 2); r('#ff5c7a', x + 12 + (f % 2) * 4, y + 17, 3, 3); r('#ffd34d', x + 8, y + 12, 2, 2); }
  r('rgba(255,255,255,.3)', x + 8, y + 11, 4, 1);
  r(shade(c, 1.2), x + 4, y + 23, 24, 5); r(d, x + 4, y + 28, 24, 1);
  r('#222', x + 9, y + 24, 1, 3); rr('#ff5c7a', x + 8, y + 22, 3, 3); rr('#ffd34d', x + 16, y + 25, 3, 2); rr('#6ab0e0', x + 21, y + 25, 3, 2); rr('#6fd06a', x + 25, y + 25, 3, 2);
  r('#222', x + 13, y + 29, 6, 2); r('#ffd34d', x + 15, y + 29, 2, 1);
}
function gsStool(x, y, th) { ob(th.stool, shade(th.stool, .6), x + 3, y + 5, 10, 5); r(shade(th.stool, 1.25), x + 5, y + 6, 6, 1); r('#7a7f8c', x + 7, y + 10, 2, 4); r('#5a606c', x + 4, y + 14, 8, 1); r('rgba(60,40,60,.2)', x + 3, y + 15, 10, 1); }
function gsClaw(x, y, now) {
  const f = Math.floor(now / 500) % 2;
  r('rgba(60,40,60,.22)', x + 2, y + 31, 28, 1); ob('#ff8fb0', '#b84a6a', x + 1, y + 3, 30, 28); ob('#e0486a', '#b84a6a', x + 4, y, 24, 5);
  ob('#e8f6ff', '#7a8590', x + 4, y + 7, 24, 15); [['#ffd34d', 7], ['#8fe0ff', 13], ['#ff9bb3', 19]].forEach(([c, ox2]) => { ob(c, shade(c, .7), x + ox2, y + 15, 6, 6); r('#3a2a3a', x + ox2 + 1, y + 17, 1, 1); r('#3a2a3a', x + ox2 + 4, y + 17, 1, 1); });
  r('#7a8590', x + 15, y + 8, 2, 3 + f); r('#c9ced6', x + 13, y + 11 + f, 6, 2); r('#7a8590', x + 12, y + 13 + f, 2, 1); r('#7a8590', x + 18, y + 13 + f, 2, 1);
  r('#fff', x + 5, y + 8, 2, 4); rr('#ffd34d', x + 7, y + 24, 4, 3); r('#222', x + 20, y + 24, 1, 3); rr('#ff5c7a', x + 19, y + 22, 3, 3); r('#222', x + 12, y + 28, 8, 3);
}
function gsPlant(x, y) { cfPlant(x, y, true); }
function gsCounter(x, y, th) {
  for (let i = 0; i < 4; i++) { const px = x + i * 16; r(th.cnt[1], px, y + 2, 16, 14); r(th.cnt[0], px, y, 16, 3); r(shade(th.cnt[0], 1.2), px, y, 16, 1); r(th.cnt[2], px, y + 13, 16, 3); r(shade(th.cnt[1], .88), px + 7, y + 4, 1, 8); }
  ob('#ffd34d', '#b8892a', x + 4, y - 7, 11, 8); r('#fff3b0', x + 6, y - 5, 3, 1); gsText('1', x + 11, y - 5, '#8a6012');
  ob('#fffaf0', '#c9b79a', x + 24, y - 4, 7, 4); r('#ffd34d', x + 26, y - 3, 3, 1);
  ob('#c9ced6', '#7a8590', x + 40, y - 8, 14, 9); r('#2b2b33', x + 42, y - 6, 10, 4); r('#6fd06a', x + 43, y - 5, 3, 1); r('#ffd34d', x + 48, y - 5, 2, 1);
}
function gsTV(x, y, now) {
  const f = Math.floor(now / 500) % 2;
  ob('#2a2a3a', '#14141e', x, y, 56, 24); r('#1b1b30', x + 2, y + 2, 52, 20);
  gsText('HI SCORE', x + 11, y + 4, f ? '#ffd34d' : '#fff3b0');
  [['1', '#ff7ab8', 12], ['2', '#5ae0ff', 17]].forEach(([n, c, yy]) => { r(c, x + 5, y + yy - 1 + (n === '1' ? 0 : 1), 3, 1); r('#fffaf0', x + 11, y + yy, 22, 1); r('#fffaf0', x + 36, y + yy, 12, 1); });
  r('rgba(255,255,255,.25)', x + 4, y + 3, 4, 1); r('#14141e', x + 24, y + 24, 8, 2);
}
function gsRoom(now, cast, lit) {
  const th = GS_TH.neon, key = 'neon', T_ = GS_T, W_ = 16, H_ = 16, DX = 7, f = Math.floor(now / 400);
  for (let ty = 0; ty < H_; ty++) for (let tx = 0; tx < W_; tx++) {
    const px = tx * T_, py = ty * T_;
    if (ty < 2) gsWall(th, px, py, tx, ty, key);
    else if (ty === H_ - 1) { r(th.front, px, py, T_, T_); r(shade(th.front, 1.25), px, py, T_, 2); r(shade(th.front, .85), px + 7, py + 4, 1, 12); }
    else if (tx === 0 || tx === W_ - 1) { r(th.sideC, px, py, T_, T_); r(shade(th.sideC, 1.25), tx === 0 ? px + 11 : px, py, 5, T_); r(shade(th.sideC, .8), tx === 0 ? px : px + 15, py, 1, T_); }
    else gsFloor(th, px, py, tx, ty, key);
  }
  r('rgba(30,20,40,.2)', 16, 32, 14 * T_, 3);
  for (let i = 0; i < 14; i++) { const on = (i + f) % 3; r(on ? th.neon[i % 2] : shade(th.neon[i % 2], .6), 20 + i * 16, 5, 12, 2); r('rgba(255,255,255,.5)', 22 + i * 16, 5, 3, 1); }
  if (lit || th.dark) { for (let i = 0; i < 7; i++) gsGlow(26 + i * 32, 7, 12, th.neon[i % 2], .08); }
  ob('#12121f', th.neon[0], 104, 8, 48, 14); gsText('ARCADE', 107, 12, '#ffd34d'); r(th.neon[1], 106, 20, 44, 1);
  gsTV(176, 3, now);
  [[22, '#ff7ab8'], [64, '#5ae0ff']].forEach(([x, c], i) => { ob(shade(c, 1.1), shade(c, .6), x, 7, 20, 20); ob('#fffaf0', shade(c, .7), x + 3, 10, 14, 14); [[5, 14], [11, 14]].forEach(([a, b]) => r(c, x + a, y0(b), 3, 3)); r(c, x + 5, 12, 10, 1); });
  function y0(b) { return b + 4; }
  ob('#fffaf0', '#8c5b3c', 226, 8, 14, 14); r('#3a2a3a', 233, 10, 1, 6); r('#3a2a3a', 233, 15, 4, 1);
  ob(th.rug[0], shade(th.rug[0], .65), 3 * T_ + 4, 5 * T_ + 2, 10 * T_ - 8, 2 * T_ - 4); r(th.rug[1], 3 * T_ + 8, 5 * T_ + 6, 10 * T_ - 16, 1); r(th.rug[1], 3 * T_ + 8, 7 * T_ - 8, 10 * T_ - 16, 1);
  for (let i = 0; i < 9; i++) { const sx = 3 * T_ + 14 + i * 14; r(th.rug[2], sx, 6 * T_ - 1, 4, 2); r(th.rug[1], sx + 1, 6 * T_ - 3, 2, 2); r(th.rug[1], sx + 1, 6 * T_ + 1, 2, 2); }
  ob('#c9584a', '#7a2a2a', DX * T_ + 1, (H_ - 2) * T_ + 3, 2 * T_ - 2, 12); for (let i = 0; i < 4; i++) r('#fffaf0', DX * T_ + 5 + i * 6, (H_ - 2) * T_ + 7, 3, 2);
  const E = [], add = (y, fn) => E.push({ y, f: fn });
  const cx = [2, 5, 8, 11];
  [[2, 0], [7, 4]].forEach(([ty, k0]) => cx.forEach((tx, i) => { const col = th.cab[(i + (ty > 4 ? 2 : 0)) % 4]; add((ty + 2) * T_, () => gsCab(tx * T_ - 8 + 0, ty * T_, col, now, k0 + i)); add((ty + 2) * T_ + 20, () => gsStool((tx) * T_ - 0, (ty + 2) * T_ + 2, th)); }));
  add(13 * T_, () => gsClaw(1 * T_, 11 * T_)); add(13 * T_ + 1, () => gsClaw(3 * T_, 11 * T_));
  add(13 * T_, () => gsCounter(10 * T_, 12 * T_, th)); add(15 * T_, () => gsPlant(14 * T_ - 8, 9 * T_));
  (cast || []).forEach(c => { const px = c.x * T_, py = c.y * T_ + (c.dy || 0); add(c.y * T_ + T_ + (c.sy || 0), () => { cfActor(px, py, c.k, c.dir || 'down', c.bob != null ? c.bob : (Math.floor(now / 600 + c.x) % 2), now, c.o); }); });
  E.sort((a, b) => a.y - b.y).forEach(e => e.f());
  [2, W_ - 4].forEach(tx => { ob('#ffffff', '#a8764a', tx * T_ + 1, (H_ - 1) * T_ + 2, 30, 12); r(lit ? '#ffe9b0' : '#bfe6ff', tx * T_ + 3, (H_ - 1) * T_ + 4, 26, 8); r('#ffffff', tx * T_ + 15, (H_ - 1) * T_ + 4, 2, 8); });
  { const dy = (H_ - 1) * T_; ob('#fff0d4', '#8c5b3c', DX * T_ + 1, dy - 1, 2 * T_ - 2, T_ + 1); r('#c08a62', DX * T_ + 3, dy + 1, 11, 14); r('#d9a378', DX * T_ + 4, dy + 2, 4, 12); r('#d9a378', DX * T_ + 9, dy + 2, 4, 12); r('#ffd34d', (DX + 1) * T_ - 1, dy + 8, 2, 2); }
  if (th.dark) { g.globalAlpha = .1; r('#1a2050', 0, 0, W_ * T_, H_ * T_); g.globalAlpha = 1; }
}
/* ───────── 店員 ───────── */
CF_NPCS.robo = { type: 'human', name: '機器人', hair: '#8fa0b8', hs: 'none', skin: '#dfe6f0', cloth: '#b8c4d6', shoe: '#6b7a90',
  body(K, dir, cx) { const B = CF_B; if (dir !== 'up') { K.OB('#2a2a3a', '#14141e', cx - 2, B.y + 1, 4, 4); K.R('#ffd34d', cx - 1, B.y + 2, 2, 2); } K.R('#8fa0b8', B.x + 1, B.y, 1, 2); K.R('#8fa0b8', B.x + B.w - 2, B.y, 1, 2); },
  head(K, dir) { const H = CF_H; K.R('#6b7a90', H.x + H.w / 2 - 1, H.y - 3, 1, 3); K.OB('#ff5c7a', '#b83a56', H.x + H.w / 2 - 2, H.y - 5, 3, 3);
    K.OB('#dfe6f0', '#8fa0b8', H.x, H.y, H.w, H.h);
    if (dir !== 'up') { K.R('#1d2a3a', H.x + 1, H.y + 2, H.w - 2, 5); if (dir === 'down') { K.R('#5ae0ff', H.x + 2, H.y + 3, 2, 3); K.R('#5ae0ff', H.x + H.w - 4, H.y + 3, 2, 3); K.R('#5ae0ff', H.x + 4, H.y + 6, 2, 1); } else { const L = dir === 'left'; K.R('#5ae0ff', L ? H.x + 1 : H.x + H.w - 3, H.y + 3, 2, 3); K.R('#5ae0ff', L ? H.x + 5 : H.x + H.w - 7, H.y + 3, 2, 3); } K.R('#ff9bb3', H.x, H.y + 5, 1, 2); K.R('#ff9bb3', H.x + H.w - 1, H.y + 5, 1, 2); }
    K.R('rgba(255,255,255,.5)', H.x + 2, H.y + 1, 3, 1); } };
