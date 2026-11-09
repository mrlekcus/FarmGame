'use strict';
/* 咖啡廳美術（外觀 A 暖木小木屋、內部 wood 暖木、店員豆豆、顧客村民風；其餘款式暫留備用）—— 雷克斯農場。用遊戲自己的 r()／rr()／ob() 畫。
   cafeExtA(ox,oy,now,lit) 外觀；cafeRoom(theme,now,cast,lit) 店內整間；cfActor(px,py,key,dir,bob,now,opts) 人物。 */
const CF_MF = { O: ['111','101','101','101','111'], P: ['111','101','111','100','100'], E: ['111','100','111','100','111'], N: ['101','111','111','111','101'] };
function cfText(s, x, y, c) { for (let i = 0; i < s.length; i++) { const gl = CF_MF[s[i]]; if (!gl) continue; gl.forEach((row, j) => { for (let k = 0; k < 3; k++) if (row[k] === '1') r(c, x + i * 4 + k, y + j, 1, 1); }); } }
/* 小咖啡杯圖示（9×9） */
function cfCup(x, y, now, steam) {
  r('#e8c9a0', x, y + 7, 9, 1);
  ob('#fffaf0', '#a8764a', x + 1, y + 3, 6, 5); r('#6a3a20', x + 2, y + 4, 4, 1);
  r('#a8764a', x + 7, y + 4, 1, 1); r('#a8764a', x + 8, y + 5, 1, 2); r('#a8764a', x + 7, y + 7, 1, 1);
  if (steam) { const s = Math.floor((now || 0) / 450) % 3; r('#c9b79a', x + 2 + (s % 2), y - 1, 1, 3); r('#c9b79a', x + 5 - (s % 2), y, 1, 2); }
}
function cfGlow(cx, cy, rad, col, a) { g.globalAlpha = a; for (let i = 3; i >= 1; i--) { r(col, cx - rad * i / 3, cy - rad * i / 3 * .8, rad * 2 * i / 3, rad * 1.6 * i / 3); } g.globalAlpha = 1; }
function cfSmoke(x, y, now) { for (let i = 0; i < 2; i++) { const ph = ((now / 1100) + i / 2) % 1; g.globalAlpha = .8 * (1 - ph); rr('#ffffff', x + Math.round(Math.sin(ph * 6 + i) * 2), y - Math.round(ph * 12), 4, 3); } g.globalAlpha = 1; }
function cfLogWall(x, y, w, h, base, seam, hi, edge) {
  ob(base, edge, x, y, w, h);
  for (let yy = 4; yy < h - 2; yy += 5) { r(seam, x + 1, y + yy, w - 2, 1); r(hi, x + 1, y + yy + 1, w - 2, 1); }
  [x, x + w - 5].forEach(cx => { r(edge, cx, y, 5, h); r('#c98f62', cx + 1, y, 3, h); for (let yy = 3; yy < h - 1; yy += 5) r('#8c5b3c', cx, y + yy, 5, 1); });
}
function cfWindow(wx, wy, w, h, lit, flowers) {
  ob('#ffffff', '#a8764a', wx, wy, w, h); r(lit ? '#fff3b0' : '#ffe9b0', wx + 2, wy + 2, w - 4, h - 4);
  r('#ffffff', wx + (w >> 1) - 1, wy + 2, 2, h - 4); r('#ffffff', wx + 2, wy + (h >> 1) - 1, w - 4, 1);
  r('#ffd34d', wx + 4, wy + 3, 2, 2); r('#a8764a', wx + 5, wy + 2, 1, 1);        // 小吊燈
  r('#fffaf0', wx + w - 8, wy + h - 5, 3, 2); r('#c9584a', wx + w - 8, wy + h - 5, 3, 1); // 杯子
  r('rgba(255,255,255,.65)', wx + 3, wy + 3, 3, 1);
  if (flowers) { rr('#8c5b3c', wx - 1, wy + h - 3, w + 2, 5); [['#ff8fa8', 1], ['#ffd34d', 5], ['#ff8fa8', 9], ['#ffffff', 13], ['#ffd34d', 17]].forEach(([c, o]) => { if (o < w - 2) { r('#6fd06a', wx + o, wy + h - 5, 3, 2); r(c, wx + o + 1, wy + h - 6, 1, 1); } }); }
}
/* ───────── 外觀 A：經典暖木小木屋（赤陶屋頂、煙囪、紅白條紋遮陽棚） ───────── */
function cafeExtA(ox, oy, now, lit) {
  const dx = ox + 40, roof = '#e0865a', ro = '#a8502e', dot = '#f4b08a';
  r('rgba(107,72,72,.16)', ox + 2, oy + 61, 76, 3);
  ob('#c9855a', '#8c5b3c', ox + 56, oy - 6, 10, 16); r('#8c5b3c', ox + 55, oy - 7, 12, 3); r('#e0a070', ox + 57, oy - 4, 2, 8);
  cfSmoke(ox + 59, oy - 8, now);
  cfLogWall(ox + 3, oy + 25, 74, 37, '#d9a56c', '#c08a58', '#e8b27a', '#a8764a');
  ob(roof, ro, ox + 8, oy - 1, 64, 11); ob(roof, ro, ox, oy + 6, 80, 17);
  for (let x = 0; x < 80; x += 8) { rr(ro, ox + x, oy + 19, 8, 5); rr(roof, ox + x + 1, oy + 19, 6, 4); }
  for (let y = 2; y < 17; y += 5) for (let x = (y % 2) * 4 + 4; x < 76; x += 8) { const yy = y + (y > 8 ? 4 : 0); if (yy < 9 && (x < 12 || x > 66)) continue; r(dot, ox + x, oy + yy, 2, 2); }
  ob('#fff0d4', '#a8764a', dx - 13, oy + 4, 26, 14); cfCup(dx - 5, oy + 7, now, true);
  r('#a8764a', dx - 11, oy + 17, 2, 3); r('#a8764a', dx + 9, oy + 17, 2, 3);
  for (let i = 0; i < 16; i++) { const x = ox + 2 + i * 5, c = i % 2 ? '#fffaf0' : '#e8624a'; r(c, x, oy + 25, 5, 6); r(c, x + 1, oy + 31, 3, 1); r(shade(c, .88), x, oy + 25, 5, 1); }
  cfWindow(ox + 8, oy + 34, 19, 18, lit, false); cfWindow(ox + 53, oy + 34, 19, 18, lit, false);
  ob('#b8895a', '#8c5b3c', ox + 11, oy + 52, 10, 10); r('#8c5b3c', ox + 11, oy + 55, 10, 1); r('#8c5b3c', ox + 11, oy + 59, 10, 1);
  r('#6fd06a', ox + 11, oy + 49, 10, 4); r('#ff8fa8', ox + 12, oy + 47, 3, 3); r('#ffd34d', ox + 16, oy + 46, 3, 3); r('#ffffff', ox + 14, oy + 45, 2, 2);
  ob('#3a3a46', '#9b6a44', ox + 57, oy + 48, 12, 14); r('#fffaf0', ox + 59, oy + 51, 8, 1); r('#fffaf0', ox + 59, oy + 54, 5, 1); r('#ffd34d', ox + 59, oy + 57, 3, 3); r('#fffaf0', ox + 63, oy + 58, 4, 1); r('#9b6a44', ox + 58, oy + 61, 1, 2); r('#9b6a44', ox + 67, oy + 61, 1, 2);
  ob('#c08a62', '#8c5b3c', dx - 8, oy + 36, 16, 26); r('#ffe9b0', dx - 6, oy + 38, 12, 9); r('#c08a62', dx - 1, oy + 38, 2, 9); r('#d9a378', dx - 6, oy + 49, 12, 13); r('#c08a62', dx - 6, oy + 55, 12, 1); r('#ffd34d', dx + 4, oy + 54, 2, 2);
  ob('#fffaf0', '#e8624a', dx - 10, oy + 49, 21, 9); cfText('OPEN', dx - 8, oy + 51, '#e8453c');
  [dx - 13, dx + 11].forEach(x => { r('#5e3a24', x + 1, oy + 38, 1, 2); ob('#ffe58a', '#c9971a', x, oy + 40, 3, 5); });
  rr('#c9a37a', dx - 10, oy + 62, 20, 2);
  if (lit) { cfGlow(ox + 17, oy + 43, 15, '#ffe58a', .1); cfGlow(ox + 62, oy + 43, 15, '#ffe58a', .1); cfGlow(dx - 12, oy + 43, 9, '#ffe58a', .15); cfGlow(dx + 12, oy + 43, 9, '#ffe58a', .15); }
}
/* ───────── 外觀 B：A 字木屋＋露臺（深木屋頂、圓閣樓窗、燈串、外帶露臺） ───────── */
const CF_DG = { 0: ['111','101','101','101','111'], 1: ['010','110','010','010','111'], 2: ['111','001','111','100','111'], 3: ['111','001','111','001','111'], 4: ['101','101','111','001','001'], 5: ['111','100','111','001','111'], 6: ['111','100','111','101','111'], 7: ['111','001','001','001','001'], 8: ['111','101','111','101','111'], 9: ['111','101','111','001','111'] };
function cfNum(s, x, y, c) { s = String(s); for (let i = 0; i < s.length; i++) { const gl = CF_DG[s[i]]; if (!gl) continue; gl.forEach((row, j) => { for (let k = 0; k < 3; k++) if (row[k] === '1') r(c, x + i * 4 + k, y + j, 1, 1); }); } }
/* 食材／餐點小圖（16×16，沿用 Demo 的畫法） */
const CFI = {
  bean(x, y) { ob('#6a3a20', '#3a1a10', x + 4, y + 6, 8, 6); r('#3a1a10', x + 7, y + 7, 1, 4); },
  gbean(x, y) { r('#6a3a20', x + 4, y + 9, 8, 3); r('#8a5a3a', x + 5, y + 7, 6, 2); r('#3a1a10', x + 3, y + 11, 10, 1); },
  milk(x, y) { ob('#fff', '#8aa', x + 5, y + 4, 6, 9); r('#6ab0e0', x + 5, y + 7, 6, 2); },
  dough(x, y) { ob('#f5e2b8', '#a98a52', x + 3, y + 7, 10, 5); r('#fff', x + 5, y + 8, 2, 1); },
  plate(x, y) { ob('#fffaf0', '#c9b79a', x + 2, y + 9, 12, 5); },
  dish(x, y, k) { CFI.plate(x, y); if (k === 'pancake') { ob('#e8b46a', '#a8743c', x + 4, y + 6, 8, 3); ob('#f0c47a', '#a8743c', x + 4, y + 4, 8, 3); r('#ffd34d', x + 7, y + 3, 2, 1); } else { ob(k === 'latte' ? '#d9a56a' : '#4a2a1a', '#3a1a10', x + 4, y + 4, 8, 6); r('#fffaf0', x + 12, y + 6, 2, 3); if (k === 'latte') r('#ff8fa8', x + 7, y + 5, 2, 2); } }
};
/* 操作間的檯子（Demo 同款，換成遊戲的暖色外框） */
const CFS = {
  crate(x, y, k) { ob('#c99a5e', '#7a5230', x + 1, y + 5, 14, 10); r('#a87c44', x + 1, y + 9, 14, 1); if (k === 'b') { r('#5a3220', x + 3, y + 2, 3, 3); r('#5a3220', x + 8, y + 3, 3, 3); r('#7a4a30', x + 6, y + 1, 2, 2); } else if (k === 'm') { ob('#fff', '#9ab', x + 4, y + 1, 6, 6); r('#6ab0e0', x + 4, y + 3, 6, 2); } else { ob('#f5e2b8', '#a98a52', x + 3, y + 1, 10, 5); r('#fff', x + 5, y + 2, 2, 1); } },
  grinder(x, y) { ob('#c9ced6', '#7a8590', x + 3, y + 4, 10, 11); ob('#7a4a30', '#4a2a1a', x + 4, y + 1, 8, 5); r('#4a4f59', x + 6, y + 11, 4, 3); r('#fff', x + 5, y + 8, 2, 1); },
  rack(x, y, n) { ob('#d9b98a', '#8a6a3a', x + 1, y + 7, 14, 8); for (let i = 0; i < Math.min(n, 4); i++) ob('#fffaf0', '#c9b79a', x + 3, y + 7 - i * 2, 10, 3); },
  sink(x, y, d) { ob('#c9ced6', '#7a8590', x + 1, y + 6, 14, 9); ob('#8fd3f0', '#4a98c0', x + 3, y + 8, 10, 5); r('#7a8590', x + 7, y + 3, 2, 4); for (let i = 0; i < Math.min(d, 3); i++) ob('#e8e0d0', '#a89a80', x + 4, y + 9 - i, 8, 3); },
  serve(x, y) { ob('#8ad0a0', '#3a8a5a', x + 1, y + 3, 14, 12); r('#fff', x + 3, y + 5, 10, 3); ob('#ffd34d', '#b8892a', x + 6, y + 9, 4, 4); r('#e0486a', x + 7, y + 6, 2, 2); },
  trash(x, y) { ob('#8a8f99', '#4a4f59', x + 3, y + 4, 10, 11); r('#6a6f79', x + 2, y + 3, 12, 2); },
  machine(x, y, acc) { r('rgba(90,60,40,.18)', x + 3, y + 30, 26, 1); ob('#c9ced6', '#6b7580', x + 3, y + 4, 26, 24); ob(acc || '#8a4a3a', '#4a2a1a', x + 5, y + 6, 22, 5); ob('#2b2b33', '#111', x + 10, y + 13, 12, 9); r('#ff6a5a', x + 7, y + 8, 2, 2); r('#6fd06a', x + 23, y + 8, 2, 2); r('#6b7580', x + 8, y + 25, 16, 2); ob('#fffaf0', '#c9b79a', x + 12, y + 22, 4, 3); ob('#fffaf0', '#c9b79a', x + 18, y + 22, 4, 3); },
  oven(x, y) { r('rgba(90,60,40,.18)', x + 3, y + 15, 26, 1); ob('#d9b98a', '#6a4620', x + 2, y + 2, 28, 12); ob('#3a2a30', '#1a1015', x + 5, y + 5, 16, 7); r('#ffd34d', x + 24, y + 5, 3, 2); r('#e0486a', x + 24, y + 9, 3, 2); r('#7a5a3a', x + 6, y + 6, 14, 1); }
};
function cfBubble(cx, cy, dish) { const bx = Math.round(cx - 9), by = Math.round(cy - 30); ob('#fff', '#8a5a4a', bx, by, 18, 15); r('#fff', bx + 7, by + 14, 3, 2); r('#8a5a4a', bx + 8, by + 16, 1, 1); if (dish === '♪') { r('#e0486a', bx + 8, by + 3, 1, 7); r('#e0486a', bx + 9, by + 3, 3, 1); r('#e0486a', bx + 6, by + 9, 3, 3); } else CFI.dish(bx + 1, by - 1, dish); }
/* ---------- 家具 ---------- */
function cfStool(x, y, th) { ob(th.stool, shade(th.stool, .6), x + 3, y + 5, 10, 5); r(shade(th.stool, 1.2), x + 5, y + 6, 6, 1); r('#7a5230', x + 7, y + 10, 2, 4); r('#7a5230', x + 4, y + 14, 8, 1); r('rgba(90,60,40,.2)', x + 3, y + 15, 10, 1); }
function cfSofaBack(x, y, c) { ob(c[0], c[1], x + 2, y + 2, 44, 12); r(c[2], x + 4, y + 4, 40, 2); r(c[1], x + 17, y + 3, 1, 10); r(c[1], x + 31, y + 3, 1, 10); ob(c[0], c[1], x, y + 4, 7, 22); ob(c[0], c[1], x + 41, y + 4, 7, 22); r(c[2], x + 2, y + 6, 3, 2); r(c[2], x + 43, y + 6, 3, 2); }
function cfSofaFront(x, y, c) { ob(c[2], c[1], x + 6, y + 14, 36, 11); r(c[0], x + 8, y + 16, 32, 1); r(c[1], x + 23, y + 15, 1, 9); r('rgba(90,60,40,.2)', x + 2, y + 26, 44, 1); }
function cfTable(x, y, th, dish) { ob(th.tbl, '#8a6a3a', x + 1, y + 4, 14, 10); r(shade(th.tbl, 1.12), x + 3, y + 5, 10, 1); r('#8a6a3a', x + 7, y + 13, 2, 3); if (dish) CFI.dish(x, y - 6, dish); }
function cfChair(x, y, th, back, flip) { ob(th.chair, '#7a5230', x + 3, y + 9, 10, 6); if (back) { ob(th.chair, '#7a5230', flip ? x + 11 : x + 2, y + 2, 3, 9); } }
function cfCoffeeTable(x, y, th) { ob(th.tbl, '#8a6a3a', x + 1, y + 4, 30, 9); r(shade(th.tbl, 1.12), x + 3, y + 5, 26, 1); r('#8a6a3a', x + 3, y + 12, 2, 3); r('#8a6a3a', x + 27, y + 12, 2, 3); CFI.plate(x + 1, y - 4); CFI.plate(x + 15, y - 4); ob('#fffaf0', '#c9b79a', x + 8, y + 1, 5, 4); r('#d9a56a', x + 9, y + 2, 3, 1); }
function cfJuke(x, y, on, now) {
  const cl = ['#ff6a8a', '#ffd34d', '#6fd06a', '#6ab0e0'], f = Math.floor(now / 150);
  ob('#b04a8a', '#5a1a4a', x, y - 2, 16, 32); ob('#2a1a2a', '#5a1a4a', x + 2, y + 1, 12, 11); for (let i = 0; i < 4; i++) r(on ? cl[(i + f) % 4] : '#6a5a6a', x + 3 + i * 3, y + 2, 2, 9);
  r('#ffe08a', x + 4, y + 14, 8, 1); for (let i = 0; i < 3; i++) r('#5a1a4a', x + 4 + i * 3, y + 18 + (i % 2), 2, 2); r('#8a2a6a', x + 1, y + 24, 14, 3); r('rgba(90,60,40,.2)', x + 1, y + 30, 14, 1);
  if (on) { const k = Math.floor(now / 200) % 6; r('#fff', x + 2 + k * 2, y - 8 - k, 2, 2); r('#ffd34d', x + 11 - k, y - 5 - k, 2, 2); }
}
function cfPlant(x, y, big) { r('rgba(90,60,40,.18)', x + 2, y + 15, 12, 1); ob('#c0413d', '#7a2a2a', x + 3, y + 8, 10, 8); r('#d9605a', x + 4, y + 9, 8, 1); r('#4aa84a', x + 7, y + 2, 2, 7); r('#6fd06a', x + 3, y + 4, 4, 4); r('#6fd06a', x + 9, y + 3, 4, 4); r('#6fd06a', x + 6, y - 1, 4, 4); r('#4aa84a', x + 4, y + 6, 2, 1); r('#4aa84a', x + 10, y + 5, 2, 1); if (big) { r('#6fd06a', x + 1, y + 1, 4, 4); r('#6fd06a', x + 11, y, 4, 4); r('#4aa84a', x + 3, y + 2, 1, 2); } }
function cfCat(x, y, now) { ob('#d9a95c', '#8c5b3c', x + 1, y + 7, 14, 8); r('#b88a3c', x + 3, y + 13, 10, 1); const br = Math.floor(now / 900) % 2; ob('#f0a050', '#a8641e', x + 3, y + 5 + br, 10, 7 - br); r('#f0a050', x + 3, y + 3 + br, 3, 3); r('#f0a050', x + 9, y + 3 + br, 3, 3); r('#ffb3c9', x + 4, y + 4 + br, 1, 1); r('#e0852a', x + 6, y + 6 + br, 1, 2); r('#e0852a', x + 8, y + 6 + br, 1, 2); r('#3a2a2a', x + 5, y + 8 + br, 2, 1); r('#3a2a2a', x + 9, y + 8 + br, 2, 1); r('#fff', x + 12, y + 3 - br, 2, 2); }
function cfHangLamp(x, y, th, lit) { r('#5e3a24', x + 3, y, 1, 7); ob(th.lamp, '#b8892a', x, y + 6, 7, 5); r('#fff3b0', x + 2, y + 7, 3, 2); if (lit) { g.globalAlpha = .13; r(th.lamp, x - 7, y + 3, 21, 18); g.globalAlpha = 1; } }
function cfWinBack(x, y, th, i) {
  ob('#ffffff', '#a8764a', x, y, 30, 25); r('#bfe6ff', x + 2, y + 2, 26, 21); r('#e4f5ff', x + 2, y + 2, 26, 7); r('#ffffff', x + 14, y + 2, 2, 21); r('#ffffff', x + 2, y + 12, 26, 1);
  r('#ffffff', x + 5, y + 5, 5, 2); r('#ffffff', x + 7, y + 4, 4, 2); r('#9fdc9f', x + 2, y + 19, 26, 4); r('#7fc48a', x + 4, y + 18, 5, 2); r('#7fc48a', x + 18, y + 17, 6, 3);
  r('rgba(255,255,255,.55)', x + 4, y + 3, 4, 1);
  rr('#9b6a44', x - 2, y + 24, 34, 4);
  th.deco(x, y, i);
}
/* ---------- 主題 ---------- */
const CF_TH = {
  wood: {
    name: '暖木小木屋', stool: '#c0413d', sofa: ['#d9534f', '#7a2a2a', '#e8736e'], tbl: '#e8c88a', chair: '#c99a5e', lamp: '#ffd34d',
    kit: ['#f1e2c4', '#e6d3ae'], cTop: '#a8743c', cFace: '#8a5a3a', cLow: '#6a4620', side: '#a8764a', sideL: '#c98f62', front: '#8c5b3c', acc: '#8a4a3a', rug: ['#c0413d', '#e8736e', '#fff0d4'],
    floor: (px, py, tx, ty) => drawFloorTile(px, py, tx, ty, 0),
    wall(px, py, tx, ty) { r('#d9a56c', px, py, 16, 16); for (let yy = 0; yy < 16; yy++) { const ay = py + yy; if (ay % 5 === 4) r('#c08a58', px, ay, 16, 1); else if (ay % 5 === 0) r('#e8b27a', px, ay, 16, 1); } if (ty === 0) { r('#8c5b3c', px, py, 16, 4); r('#a8764a', px, py + 4, 16, 1); } if (ty === 1) { r('#c98f62', px, py + 10, 16, 6); r('#a8764a', px, py + 10, 16, 1); r('#a8764a', px + 7, py + 11, 1, 5); r('#e8b27a', px, py + 11, 16, 1); } },
    deco(x, y, i) { rr('#c9584a', x - 2, y - 1, 8, 24); rr('#c9584a', x + 24, y - 1, 8, 24); r('#fff0d4', x - 1, y + 4, 6, 1); r('#fff0d4', x + 25, y + 4, 6, 1); r('#fff0d4', x - 1, y + 10, 6, 1); r('#fff0d4', x + 25, y + 10, 6, 1); },
    extra(now, lit) {   // 橫樑上的暖光燈串
      for (let i = 0; i < 24; i++) { const x = 18 + i * 8, sag = Math.round(Math.sin(i / 23 * Math.PI) * 5); r('#5e3a24', x, 6 + sag, 8, 1); }
      for (let i = 0; i < 12; i++) { const x = 20 + i * 16, sag = Math.round(Math.sin((x - 18) / 190 * Math.PI) * 5), on = (i + Math.floor(now / 600)) % 3 !== 0; r(on ? '#ffd34d' : '#e8b84a', x, 7 + sag, 2, 3); r('#fff3b0', x, 7 + sag, 1, 1); if (lit) { g.globalAlpha = .22; r('#ffd34d', x - 2, 5 + sag, 6, 7); g.globalAlpha = 1; } }
      [[3, 10], [208, 13]].forEach(([x, y]) => { r('#5e3a24', x, y, 1, 1); });
    },
    corner(x, y, now, lit) {   // 鑄鐵小暖爐
      r('rgba(90,60,40,.2)', x + 1, y + 15, 14, 1); r('#4a4f59', x + 6, y - 6, 4, 12); r('#6a6f79', x + 6, y - 6, 1, 12);
      ob('#5a606c', '#2a2e36', x + 2, y + 2, 12, 13); r('#7a808c', x + 3, y + 3, 10, 1); ob('#2a1a18', '#1a1010', x + 4, y + 6, 8, 6);
      const f = Math.floor(now / 160) % 3; r('#ff8a3c', x + 5, y + 10 - (f === 0 ? 1 : 0), 3, 2 + (f === 0 ? 1 : 0)); r('#ffd34d', x + 8, y + 10 - (f === 1 ? 1 : 0), 3, 2); r('#fff3b0', x + 7, y + 11, 2, 1);
      r('#8c5b3c', x + 3, y + 14, 10, 2); if (lit) { g.globalAlpha = .16; r('#ff9a3c', x - 8, y - 2, 32, 22); g.globalAlpha = 1; } }
  },
  pastel: {
    name: '奶油粉彩', stool: '#ff8fb0', sofa: ['#8fd9b8', '#4f9e7c', '#b4ecd2'], tbl: '#fff0f4', chair: '#ffb3c6', lamp: '#fff0a0',
    kit: ['#fffaf0', '#ffe3ec'], cTop: '#fff4f8', cFace: '#ffb3c6', cLow: '#e58aa6', side: '#f3b8cb', sideL: '#ffd6e2', front: '#f3b8cb', acc: '#e86a8a', rug: ['#ff9bb3', '#ffd1dc', '#fffaf0'],
    floor: (px, py, tx, ty) => drawFloorTile(px, py, tx, ty, 2),
    wall(px, py, tx, ty) { drawWallTile(px, py, tx, ty, 1); if (ty === 0) { r('#fffaf0', px, py, 16, 3); r('#ffc2d2', px, py + 3, 16, 1); } if (ty === 1) { r('#fffaf0', px, py + 10, 16, 6); r('#ffc2d2', px, py + 10, 16, 1); r('#ffe3ec', px + 7, py + 11, 1, 5); r('#ffe3ec', px, py + 13, 16, 1); } },
    extra(now, lit) {   // 三角旗串
      const cols = ['#ff8fb0', '#fff0a0', '#8fe0c0', '#a8d8f0'];
      for (let i = 0; i < 28; i++) { const x = 16 + i * 7, sag = Math.round(Math.sin(i / 27 * Math.PI) * 4); r('#c9889c', x, 4 + sag, 7, 1); const c = cols[i % 4]; r(c, x + 1, 5 + sag, 5, 1); r(c, x + 2, 6 + sag, 3, 1); r(c, x + 3, 7 + sag, 1, 1); }
    },
    corner(x, y, now) {   // 氣球與蛋糕架
      r('rgba(90,60,40,.2)', x + 1, y + 15, 14, 1);
      [['#ff8fb0', 1, -12], ['#fff0a0', 7, -16], ['#8fe0c0', 12, -11]].forEach(([c, ox, oy2]) => { r('#c9889c', x + ox + 1, y + oy2 + 8, 1, 14 - oy2 - 8 + 8); ob(c, shade(c, .75), x + ox - 2, y + oy2, 6, 8); r('#ffffff', x + ox - 1, y + oy2 + 1, 1, 2); });
      ob('#ffd1dc', '#c9889c', x + 2, y + 11, 12, 4); r('#fffaf0', x + 4, y + 8, 8, 3); r('#ff8fa8', x + 7, y + 6, 2, 2); }
    ,
    deco(x, y, i) { r('#ff8fb0', x - 2, y - 2, 34, 5); for (let k = 0; k < 8; k++) { rr('#ff8fb0', x - 2 + k * 4, y + 2, 4, 4); } r('#ffffff', x - 1, y - 1, 32, 1); [[x + 3, y + 8], [x + 22, y + 11]].forEach(([a, b]) => { r('#ff6b8a', a, b, 3, 2); r('#ff6b8a', a + 1, b + 2, 1, 1); r('#ff6b8a', a + 1, b - 1, 1, 1); }); },
  },
  forest: {
    name: '森林綠意', stool: '#6fb87a', sofa: ['#e8b84a', '#a8801a', '#f4d27a'], tbl: '#f0dcb4', chair: '#9fcfa0', lamp: '#fff0a0',
    kit: ['#f4fff0', '#d6f2e3'], cTop: '#d9b88a', cFace: '#8fc48f', cLow: '#5f9a6a', side: '#7fb08a', sideL: '#a8dcb0', front: '#5f9a6a', acc: '#4f9a62', rug: ['#4f9a62', '#8fd09a', '#f4fff0'],
    floor: (px, py, tx, ty) => drawFloorTile(px, py, tx, ty, 1),
    wall(px, py, tx, ty) { drawWallTile(px, py, tx, ty, 3); if (ty === 0) { r('#a8dcb0', px, py, 16, 3); r('#7fb08a', px, py + 3, 16, 1); } if (ty === 1) { r('#d9b88a', px, py + 10, 16, 6); r('#b8895a', px, py + 10, 16, 1); r('#c9a37a', px + 7, py + 11, 1, 5); r('#e8cfa0', px, py + 11, 16, 1); } },
    extra(now, lit) {   // 垂掛的藤蔓與小燈
      for (let i = 0; i < 14; i++) { const x = 16 + i * 14 + ((i * 5) % 6), l = 5 + ((i * 7) % 12); r('#4aa84a', x, 4, 1, l); r('#6fd06a', x + 1, 6 + (i % 3), 2, 1); r('#6fd06a', x - 1, 9 + (i % 4), 2, 1); if (l > 9) r('#6fd06a', x + 1, 4 + l - 2, 2, 2); }
      for (let i = 0; i < 10; i++) { const x = 22 + i * 19; r(((i + Math.floor(now / 600)) % 2) ? '#fff0a0' : '#ffe08a', x, 22 + (i % 2) * 2, 2, 2); }
    },
    corner(x, y, now) {   // 大盆栽樹
      r('rgba(90,60,40,.2)', x + 1, y + 15, 14, 1); ob('#c9955f', '#7a5230', x + 3, y + 8, 10, 8); r('#e0b080', x + 4, y + 9, 8, 1);
      r('#7a5230', x + 7, y - 14, 2, 23); ob('#4aa84a', '#2f7a3a', x - 1, y - 24, 10, 10); ob('#6fd06a', '#3a9a4a', x + 6, y - 20, 11, 10); ob('#4aa84a', '#2f7a3a', x + 2, y - 12, 12, 9); r('#a8f0a8', x + 1, y - 22, 3, 1); r('#a8f0a8', x + 9, y - 18, 3, 1); r('#ff8fa8', x + 4, y - 16, 2, 2); r('#ffd34d', x + 11, y - 12, 2, 2); },
    deco(x, y, i) { r('#4aa84a', x - 2, y - 2, 34, 3); for (let k = 0; k < 9; k++) { const l = 3 + ((k * 7) % 9); r('#4aa84a', x - 1 + k * 4, y, 2, l); r('#6fd06a', x + k * 4, y + 1, 2, l - 2); } r('#ffd34d', x + 8, y + 6, 2, 2); r('#ff8fa8', x + 20, y + 9, 2, 2); },
  }
};
/* ---------- 房間 ---------- */
const CF_T = 16;
const CF_ST = { rack: 4, sink: 2 };   // 杯架剩幾個乾淨杯、洗杯池有幾個髒杯（cafe.js 每幀更新）
/* 咖啡廳店內格局 C：中央走道＋四角雅座（16×16），操作間縮在左上角 x1~9、第 2~5 排，吧台第 6 排，高腳椅第 7 排 */
const CF_C = { W: 16, H: 16, stools: [2, 4, 6, 8],
    items: [
      { t: 'rug', x: 5, y: 9, w: 6, h: 5 },
      { t: 'sofa', x: 11, y: 2 }, { t: 'coffee', x: 12, y: 4 }, { t: 'juke', x: 14, y: 6 },
      { t: 'tbl', x: 3, y: 10, dish: 'latte' }, { t: 'tbl', x: 3, y: 13, dish: 'pancake' }, { t: 'tbl', x: 12, y: 10, dish: 'americano' }, { t: 'tbl', x: 12, y: 13, dish: 'latte' },
      { t: 'plant', x: 1, y: 8 }, { t: 'cat', x: 14, y: 8 }, { t: 'corner', x: 14, y: 14 }, { t: 'plant', x: 5, y: 14 }
    ] };
function cafeRoom(thKey, now, cast, lit) {
  const L = CF_C, th = CF_TH[thKey], T_ = 16, W_ = L.W, H_ = L.H, DX = W_ / 2 - 1;
  for (let ty = 0; ty < H_; ty++) for (let tx = 0; tx < W_; tx++) {
    const px = tx * T_, py = ty * T_;
    if (ty < 2) th.wall(px, py, tx, ty);
    else if (ty === H_ - 1) { r(th.front, px, py, T_, T_); r(th.sideL, px, py, T_, 2); r(shade(th.front, .85), px + 7, py + 4, 1, 12); }
    else if (tx === 0 || tx === W_ - 1) { r(th.side, px, py, T_, T_); r(th.sideL, tx === 0 ? px + 11 : px, py, 5, T_); r(shade(th.side, .85), tx === 0 ? px : px + 15, py, 1, T_); }
    else if (tx <= 9 && ty <= 5) r((tx + ty) % 2 ? th.kit[0] : th.kit[1], px, py, T_, T_);
    else if (tx <= 9 && ty === 6) r(th.kit[(tx + ty) % 2], px, py, T_, T_);
    else th.floor(px, py, tx, ty);
  }
  // 燈串（跟著房間寬度）
  { const n = W_ * 2; for (let i = 0; i < n; i++) { const x = 18 + i * 8, sag = Math.round(Math.sin(i / (n - 1) * Math.PI) * 5); if (x < W_ * T_ - 14) r('#5e3a24', x, 6 + sag, 8, 1); }
    for (let i = 0; i < W_ - 2; i++) { const x = 20 + i * 16, sag = Math.round(Math.sin((x - 18) / (W_ * T_ - 34) * Math.PI) * 5), on = (i + Math.floor(now / 600)) % 3 !== 0; if (x < W_ * T_ - 20) { r(on ? '#ffd34d' : '#e8b84a', x, 7 + sag, 2, 3); r('#fff3b0', x, 7 + sag, 1, 1); } } }
  r('rgba(60,40,30,.18)', 16, 32, (W_ - 2) * T_, 3);
  // 地毯
  ob(th.rug[0], shade(th.rug[0], .7), 2 * T_ + 4, 3 * T_ + 2, 5 * T_ - 8, 2 * T_ - 4); r(th.rug[1], 2 * T_ + 7, 3 * T_ + 5, 5 * T_ - 14, 1);
  L.items.filter(i => i.t === 'rug').forEach(i => { const px = i.x * T_, py = i.y * T_; ob(th.rug[0], shade(th.rug[0], .7), px + 2, py + 4, i.w * T_ - 4, i.h * T_ - 8); r(th.rug[1], px + 5, py + 7, i.w * T_ - 10, 1); r(th.rug[1], px + 5, py + i.h * T_ - 11, i.w * T_ - 10, 1); for (let k = 0; k < i.w * 2 - 2; k++) r(th.rug[2], px + 8 + k * 8, py + i.h * T_ - 9, 3, 2); });
  // 門墊
  ob('#c9584a', '#7a2a2a', DX * T_ + 1, (H_ - 2) * T_ + 3, 2 * T_ - 2, 12); for (let i = 0; i < 4; i++) r('#fffaf0', DX * T_ + 5 + i * 6, (H_ - 2) * T_ + 7, 3, 2);
  // 後牆：窗、菜單黑板、時鐘
  cfWinBack(1 * T_ + 1, 3, th, 0);
  ob('#3a3a46', '#9b6a44', 4 * T_ + 5, 3, 4 * T_ + 6, 25); r('#9b6a44', 4 * T_ + 6, 2, 1, 2); r('#9b6a44', 4 * T_ + 66, 2, 1, 2);
  [['americano', '80'], ['latte', '120'], ['pancake', '130']].forEach(([k, p], i) => { const bx = 4 * T_ + 8 + i * 22; CFI.dish(bx - 3, 3, k); cfNum(p, bx + (p.length === 2 ? 3 : 1), 19, '#fffaf0'); });
  r('#fffaf0', 4 * T_ + 8, 4, 12, 1);
  for (let wx = 12; wx + 2 < W_ - 1; wx += 4) cfWinBack(wx * T_ + 1, 3, th, wx % 2);
  ob('#fffaf0', '#8c5b3c', (W_ - 1) * T_ - 14, 5, 12, 12); r('#3a2a3a', (W_ - 1) * T_ - 9, 7, 1, 5); r('#3a2a3a', (W_ - 1) * T_ - 9, 11, 3, 1);
  cfHangLamp(3 * T_ + 12, 0, th, lit); cfHangLamp(8 * T_ + 5, 0, th, lit); cfHangLamp(13 * T_ + 5, 0, th, lit);
  const E = []; const add = (y, f) => E.push({ y, f });
  // 操作間（縮小版）
  [[1, 'b'], [2, 'm'], [3, 'd']].forEach(([x, k]) => add(3 * T_, () => CFS.crate(x * T_, 2 * T_, k)));
  [4, 5].forEach(x => add(3 * T_, () => CFS.grinder(x * T_, 2 * T_)));
  add(4 * T_, () => CFS.machine(6 * T_, 2 * T_, th.acc)); add(3 * T_, () => CFS.oven(8 * T_, 2 * T_));
  add(6 * T_, () => CFS.sink(1 * T_, 5 * T_, CF_ST.sink)); add(6 * T_, () => CFS.rack(3 * T_, 5 * T_, CF_ST.rack)); add(6 * T_, () => CFS.trash(2 * T_, 5 * T_));
  // 吧台（第 6 排）＋右邊的隔板（第 10 欄）
  add(6 * T_ + 1, () => {
    for (let x = 1; x <= 9; x++) { const px = x * T_, py = 6 * T_; r(th.cFace, px, py + 2, T_, 14); r(th.cTop, px, py, T_, 3); r(shade(th.cTop, 1.15), px, py, T_, 1); r(th.cLow, px, py + 13, T_, 3); r(shade(th.cFace, .88), px + 7, py + 4, 1, 8); }
    CFS.serve(4 * T_, 6 * T_); CFS.serve(5 * T_, 6 * T_);
    ob('#fffaf0', '#c9b79a', 7 * T_ + 2, 6 * T_ - 5, 11, 5); r('#e8c88a', 7 * T_ + 3, 6 * T_ - 4, 9, 2); r('#ff8fa8', 7 * T_ + 6, 6 * T_ - 7, 3, 2);
    ob('#ffd34d', '#b8892a', 3 * T_ + 8, 6 * T_ - 3, 4, 3);
    const gx = 9 * T_, gy = 6 * T_; ob('#c08a62', '#7a5230', gx + 1, gy + 2, 14, 13); r('#d9a378', gx + 3, gy + 4, 4, 9); r('#d9a378', gx + 9, gy + 4, 4, 9); ob('#fffaf0', '#a8764a', gx + 5, gy - 6, 6, 7); r('#e0486a', gx + 7, gy - 4, 2, 2);   // 吧台小門＋圍裙
  });
  add(7 * T_ + 1, () => { for (let y = 2; y <= 6; y++) { const px = 10 * T_, py = y * T_; r(th.cFace, px, py, T_, T_); r(th.cTop, px, py, 4, T_); r(shade(th.cTop, 1.15), px, py, 1, T_); r(th.cLow, px + 12, py, 4, T_); r(shade(th.cFace, .88), px + 7, py + 3, 1, 10); } r(th.cTop, 10 * T_, 2 * T_ - 2, T_, 3); });
  // 高腳椅
  L.stools.forEach(x => add(7 * T_ + 16, () => cfStool(x * T_, 7 * T_, th)));
  // 擺設
  L.items.forEach(i => {
    const px = i.x * T_, py = i.y * T_;
    if (i.t === 'sofa') { add(py + 10, () => cfSofaBack(px, py, th.sofa)); add(py + 2 * T_ + 8, () => cfSofaFront(px, py + 0, th.sofa)); }
    else if (i.t === 'coffee') add(py + T_ + 4, () => cfCoffeeTable(px, py + 4, th));
    else if (i.t === 'tbl') add(py + 12, () => { cfChair(px - T_, py, th, true, false); cfChair(px + T_, py, th, true, true); cfTable(px, py, th, i.dish); });
    else if (i.t === 'juke') add(py + 2 * T_, () => cfJuke(px, py, cast.some(c => c.juke), now));
    else if (i.t === 'plant') add(py + T_, () => cfPlant(px, py, true));
    else if (i.t === 'cat') add(py + T_, () => cfCat(px + 8, py, now));
    else if (i.t === 'corner') add(py + T_, () => th.corner(px, py - 2, now, lit));
  });
  cast.forEach(c => { const px = c.x * T_, py = c.y * T_ + (c.dy || 0); add(c.y * T_ + T_ + (c.sy || 0), () => { cfActor(px, py, c.k, c.dir || 'down', c.bob != null ? c.bob : (Math.floor(now / 600 + c.x) % 2), now, c.o); if (c.bubble) cfBubble(px + 8, py + 8, c.bubble); if (c.rimY) r(th.rimC || th.stool, px + 3, py + c.rimY, 10, 3); }); });
  E.sort((a, b) => a.y - b.y).forEach(e => e.f());
  L.items.filter(i => i.t === 'sofa').forEach(i => cfSofaFront(i.x * T_, i.y * T_, th.sofa));
  // 前牆窗與門
  [2, W_ - 4].forEach(tx => { ob('#ffffff', '#a8764a', tx * T_ + 1, (H_ - 1) * T_ + 2, 30, 12); r(lit ? '#ffe9b0' : '#bfe6ff', tx * T_ + 3, (H_ - 1) * T_ + 4, 26, 8); r('#ffffff', tx * T_ + 15, (H_ - 1) * T_ + 4, 2, 8); });
  { const dy = (H_ - 1) * T_; ob('#fff0d4', '#8c5b3c', DX * T_ + 1, dy - 1, 2 * T_ - 2, T_ + 1); r('#c08a62', DX * T_ + 3, dy + 1, 11, 14); r('#d9a378', DX * T_ + 4, dy + 2, 4, 12); r('#d9a378', DX * T_ + 9, dy + 2, 4, 12); r('#ffd34d', (DX + 1) * T_ - 1, dy + 8, 2, 2); }
  if (lit) { g.globalAlpha = .1; r('#1a2050', 0, 0, W_ * T_, H_ * T_); g.globalAlpha = 1; }
}
const CF_OUT = 'rgba(90,60,40,.55)', cfHi = c => shade(c, 1.18), cfLo = c => shade(c, .82);
const CF_H = { x: 3, y: 2, w: 10, h: 8 }, CF_B = { x: 4, y: 9, w: 8, h: 6 };
function cfKit(px, py, bob) { return { R: (c, x, y, w, h) => r(c, px + x, py + y + bob, w, h), R0: (c, x, y, w, h) => r(c, px + x, py + y, w, h), OB: (c, e, x, y, w, h) => ob(c, e, px + x, py + y + bob, w, h) }; }
function cfEye(K, x, ey, bl) { if (bl) K.R('#3a2a3a', x, ey + 1, 2, 1); else { K.R('#3a2a3a', x, ey, 2, 3); K.R('#ffffff', x, ey, 1, 1); K.R('#8a6a8a', x + 1, ey + 2, 1, 1); } }
function cfFace(K, dir, bl, mouth) {
  const H = CF_H, ey = H.y + 3; if (dir === 'up') return;
  if (dir === 'down') { cfEye(K, H.x + 2, ey, bl); cfEye(K, H.x + H.w - 4, ey, bl); K.R('#ff9ab0', H.x + 1, ey + 3, 1, 1); K.R('#ff9ab0', H.x + H.w - 2, ey + 3, 1, 1); if (mouth !== false) K.R('#e0607a', H.x + H.w / 2 - 1, ey + 3, 2, 1); }
  else { const L = dir === 'left'; cfEye(K, L ? H.x + 1 : H.x + H.w - 3, ey, bl); cfEye(K, L ? H.x + 5 : H.x + H.w - 7, ey, bl); K.R('#ff9ab0', L ? H.x + 3 : H.x + H.w - 4, ey + 3, 1, 1); if (mouth !== false) K.R('#e0607a', L ? H.x + 1 : H.x + H.w - 3, ey + 3, 2, 1); }
}
function cfHold(K, o, skin) {
  const B = CF_B; if (!o || !o.hold) return;
  if (o.hold === 'cup') { K.R(skin, B.x + B.w, B.y + 1, 1, 2); K.OB('#fffaf0', '#a8764a', B.x + B.w, B.y - 1, 4, 4); K.R('#6a3a20', B.x + B.w + 1, B.y, 2, 1); K.R('#fffaf0', B.x + B.w + 1, B.y - 3, 1, 1); }
  if (o.hold === 'tray') { K.R(skin, B.x + B.w, B.y + 1, 1, 2); K.R('#c9ced6', B.x + B.w - 1, B.y, 6, 1); K.OB('#fffaf0', '#c9b79a', B.x + B.w, B.y - 3, 4, 3); K.R('#d9a56a', B.x + B.w + 1, B.y - 2, 2, 1); }
  if (o.hold === 'pot') { K.R(skin, B.x + B.w, B.y + 2, 1, 2); K.OB('#c9ced6', '#7a8590', B.x + B.w, B.y - 2, 4, 5); K.R('#7a8590', B.x + B.w + 4, B.y - 1, 1, 2); K.R('#4a4f59', B.x + B.w, B.y - 3, 4, 1); }
}
/* ---------- 村民風（人類） ---------- */
function cfHairBase(K, hc, dir) {
  const H = CF_H, hs = cfLo(hc), R = K.R;
  if (dir === 'up') { R(hc, H.x, H.y, H.w, H.h - 1); R(hs, H.x + 1, H.y + 5, H.w - 2, 1); R(cfHi(hc), H.x + 2, H.y + 1, 3, 1); return; }
  if (dir === 'left' || dir === 'right') { const L = dir === 'left'; R(hc, H.x, H.y, H.w, 2); R(hc, L ? H.x + H.w - 5 : H.x, H.y, 5, H.h - 2); R(hc, L ? H.x : H.x + H.w - 1, H.y, 1, 3); R(hs, L ? H.x + H.w - 5 : H.x, H.y + 5, 5, 1); R(cfHi(hc), H.x + 2, H.y, 3, 1); return; }
  R(hc, H.x, H.y, H.w, 2); R(hc, H.x, H.y, 1, H.h - 3); R(hc, H.x + H.w - 1, H.y, 1, H.h - 3); R(hs, H.x + 1, H.y + 2, 2, 1); R(hc, H.x + H.w - 4, H.y + 2, 3, 1); R(hs, H.x + 4, H.y + 2, H.w - 8, 1); R(cfHi(hc), H.x + 2, H.y, 3, 1);
}
function cfHairExtra(K, s, dir) {
  const H = CF_H, hc = s.hair, hs = cfLo(hc), R = K.R, OB = K.OB, st = s.hs, side = dir === 'left' || dir === 'right', L = dir === 'left';
  const lk = (x, y, w, h) => { if (side) { R(hc, L ? H.x + H.w - 2 : H.x - 1 + 0, y, 2, h); } else { R(hc, H.x - 1, y, 2, h); R(hc, H.x + H.w - 1, y, 2, h); } };
  if (st === 'bob') { lk(0, H.y + 3, 2, 5); R(hs, H.x - 1, H.y + 6, 2, 1); if (!side) R(hs, H.x + H.w - 1, H.y + 6, 2, 1); }
  if (st === 'twin') { lk(0, H.y + 3, 2, 7); if (!side) { R(hs, H.x - 1, H.y + 8, 2, 1); R(hs, H.x + H.w - 1, H.y + 8, 2, 1); } R(s.rib || '#ff6b8a', H.x - 1, H.y + 1, 3, 3); if (!side) R(s.rib || '#ff6b8a', H.x + H.w - 2, H.y + 1, 3, 3); R('#ffd34d', H.x, H.y + 2, 1, 1); }
  if (st === 'spiky') { R(hc, H.x + 1, H.y - 2, 2, 2); R(hc, H.x + 4, H.y - 3, 2, 3); R(hc, H.x + 7, H.y - 2, 2, 2); R(cfHi(hc), H.x + 4, H.y - 3, 1, 1); R(hc, H.x - 1, H.y + 1, 1, 2); R(hc, H.x + H.w, H.y + 1, 1, 2); }
  if (st === 'bun') { OB(hc, hs, H.x + 3, H.y - 4, 4, 4); R(cfHi(hc), H.x + 4, H.y - 3, 1, 1); }
  if (st === 'pony') { const x = side ? (L ? H.x + H.w : H.x - 2) : H.x + H.w; R(hc, x, H.y + 1, 2, 6); R(hs, x, H.y + 5, 2, 1); R(s.rib || '#ffd34d', x, H.y + 1, 2, 1); }
  if (st === 'curly') { OB(hc, hs, H.x - 1, H.y - 2, H.w + 2, 4); R(hc, H.x - 1, H.y + 1, 2, 5); R(hc, H.x + H.w - 1, H.y + 1, 2, 5); R(hs, H.x - 1, H.y + 5, 2, 1); R(hs, H.x + H.w - 1, H.y + 5, 2, 1); R(cfHi(hc), H.x + 2, H.y - 1, 3, 1); }
}
function cfHuman(px, py, s, dir, bob, now, o) {
  const K = cfKit(px, py, bob), { R, R0, OB } = K, H = CF_H, B = CF_B, bl = (now % 3800) > 3650, skin = s.skin || '#ffe3cc', ey = H.y + 3, cx = B.x + B.w / 2;
  R0('rgba(90,60,40,.2)', 3, 14, 10, 2); R0('rgba(90,60,40,.12)', 2, 14, 12, 2);
  R0(s.shoe || '#6a4a3a', B.x + 1, 14, 2, 1); R0(s.shoe || '#6a4a3a', B.x + B.w - 3, 14, 2, 1);
  OB(s.cloth, CF_OUT, B.x, B.y, B.w, B.h); R(cfHi(s.cloth), B.x + 1, B.y + 1, B.w - 2, 1); R(cfLo(s.cloth), B.x + 1, B.y + B.h - 2, B.w - 2, 1);
  R(skin, B.x - 1, B.y + 2, 1, 3); R(skin, B.x + B.w, B.y + 2, 1, 3);
  if (s.body) s.body(K, dir, cx);
  cfHold(K, o, skin);
  OB(skin, CF_OUT, H.x, H.y, H.w, H.h); if (dir !== 'up') R(cfHi(skin), H.x + 2, H.y + 1, 2, 1);
  cfHairBase(K, s.hair, dir); cfHairExtra(K, s, dir);
  cfFace(K, dir, bl, !s.stache);
  if (s.face) s.face(K, dir, ey);
  if (s.head) s.head(K, dir, ey);
}
const cfGlasses = (c) => (K, dir, ey) => { if (dir === 'up') return; const H = CF_H, R = K.R; const ex = dir === 'down' ? [H.x + 2, H.x + H.w - 4] : dir === 'left' ? [H.x + 1, H.x + 5] : [H.x + H.w - 3, H.x + H.w - 7]; ex.forEach(x => { R(c, x - 1, ey - 1, 4, 1); R(c, x - 1, ey, 1, 1); R(c, x + 2, ey, 1, 1); }); if (dir === 'down') { R(c, ex[0] + 2, ey, 5, 1); R(c, H.x, ey, 1, 1); R(c, H.x + H.w - 1, ey, 1, 1); } };
const cfBeanie = (c, pom) => (K, dir) => { const H = CF_H; K.OB(c, cfLo(c), H.x - 1, H.y - 2, H.w + 2, 5); K.R(cfHi(c), H.x + 1, H.y - 1, 3, 1); K.R('#fffaf0', H.x - 1, H.y + 1, H.w + 2, 1); if (pom) { K.R('#fffaf0', H.x + H.w / 2 - 1, H.y - 4, 3, 3); } };
const CF_NPCS = {
  /* ===== 店員 ===== */
  doudou: { type: 'human', name: '豆豆', hair: '#7a4a3a', hs: 'bun', rib: '#ff9bb3', cloth: '#fffaf0',
    body(K, dir, cx) { const B = CF_B; K.R('#8c5b3c', B.x + 1, B.y + 2, B.w - 2, B.h - 2); K.R('#a8764a', B.x + 1, B.y + 2, B.w - 2, 1); K.R('#8c5b3c', B.x + 1, B.y, 1, 2); K.R('#8c5b3c', B.x + B.w - 2, B.y, 1, 2); if (dir !== 'up') { K.R('#fffaf0', cx - 2, B.y + 4, 4, 2); K.R('#e0486a', cx, B.y + 4, 1, 1); } K.R('#e8624a', B.x + 2, B.y, B.w - 4, 1); },
    head(K) { const H = CF_H; K.R('#ff9bb3', H.x, H.y + 2, H.w, 1); K.OB('#ff6b8a', '#d4688a', H.x + H.w - 4, H.y - 1, 4, 3); K.R('#ffd34d', H.x + H.w - 3, H.y, 1, 1); } },
  doushu: { type: 'human', name: '豆叔', hair: '#7a6a62', hs: 'short', cloth: '#6a9ac4', stache: true,
    body(K, dir, cx) { const B = CF_B; K.R('#5e3a24', B.x + 1, B.y + 2, B.w - 2, B.h - 2); K.R('#7a4a30', B.x + 1, B.y + 2, B.w - 2, 1); K.R('#fffaf0', B.x + 1, B.y, 1, 2); K.R('#fffaf0', B.x + B.w - 2, B.y, 1, 2); if (dir !== 'up') { K.R('#ffd34d', cx - 1, B.y + 4, 2, 1); } },
    face(K, dir, ey) { const H = CF_H; if (dir === 'up') return; if (dir === 'down') { K.R('#4a3a3a', H.x + 2, ey + 3, H.w - 4, 1); K.R('#4a3a3a', H.x + 1, ey + 4, 2, 1); K.R('#4a3a3a', H.x + H.w - 3, ey + 4, 2, 1); } else { const L = dir === 'left'; K.R('#4a3a3a', L ? H.x : H.x + H.w - 5, ey + 3, 5, 1); } cfGlasses('#d9a03a')(K, dir, ey); },
    head(K) { const H = CF_H; K.OB('#a8423a', '#7a2a24', H.x - 1, H.y - 3, H.w + 2, 5); K.R('#c9584a', H.x + 1, H.y - 2, 3, 1); K.R('#7a2a24', H.x + 5, H.y - 5, 2, 2); K.R('#7a2a24', H.x - 1, H.y + 1, H.w + 2, 1); } },
  shiba: { type: 'animal', name: '柴柴', fur: '#e8a860', light: '#fff0d0', ear: 'point', cloth: '#fffaf0', tail: 'curl', nose: '#3a2a2a',
    body(K, dir, cx) { const B = CF_B; K.R('#fffaf0', B.x + 1, B.y + 2, B.w - 2, B.h - 2); K.R('#e8e0d0', B.x + 1, B.y + 2, B.w - 2, 1); K.R('#e0486a', B.x + 1, B.y, B.w - 2, 2); K.R('#b8322a', B.x + 1, B.y + 1, B.w - 2, 1); K.R('#e0486a', B.x + B.w - 2, B.y + 2, 1, 3); K.R('#b8322a', B.x + B.w - 2, B.y + 4, 1, 1); },
    head(K) { const H = CF_H; K.OB('#fffaf0', '#c9bfb0', H.x + 1, H.y - 2, H.w - 2, 3); K.R('#e8e0d0', H.x + 2, H.y - 1, 2, 1); } },
  bear: { type: 'animal', name: '熊熊', fur: '#b98a62', light: '#e8c9a0', ear: 'round', cloth: '#7fc48a', tail: 'nub', nose: '#3a2a2a',
    body(K, dir, cx) { const B = CF_B; K.R('#fffaf0', B.x + 1, B.y + 2, B.w - 2, B.h - 2); K.R('#4f9a62', B.x + 1, B.y + 2, B.w - 2, B.h - 2); K.R('#7fc48a', B.x + 1, B.y + 2, B.w - 2, 1); K.R('#fffaf0', B.x + 1, B.y, 1, 2); K.R('#fffaf0', B.x + B.w - 2, B.y, 1, 2); if (dir !== 'up') { K.R('#ffd34d', cx - 1, B.y + 4, 2, 1); } K.R('#e0486a', cx - 2, B.y, 4, 1); K.R('#e0486a', cx - 1, B.y + 1, 2, 1); },
    head(K) { } },
  /* ===== 顧客：村民風 ===== */
  xiaomi: { type: 'human', name: '小米', hair: '#5a3a30', hs: 'bob', cloth: '#e07a8a', rib: '#fffaf0', head(K) { const H = CF_H; K.OB('#fffaf0', '#d9c3a0', H.x + 1, H.y, 3, 2); K.R('#ff8fa8', H.x + 2, H.y, 1, 1); } },
  adou: { type: 'human', name: '阿豆', hair: '#e8c040', hs: 'spiky', cloth: '#6ab0e0', shoe: '#4a5a88', skin: '#f6c9a0', body(K, dir, cx) { const B = CF_B; K.R('#fffaf0', cx - 1, B.y + 1, 2, B.h - 3); } },
  naicha: { type: 'human', name: '奶茶', hair: '#c9a37a', hs: 'twin', rib: '#ffffff', cloth: '#8fd08a', shoe: '#5a4a38', skin: '#ffe3cc', body(K, dir, cx) { const B = CF_B; K.R('#fffaf0', B.x + 1, B.y + 1, B.w - 2, 2); K.R('#6fb87a', B.x + 1, B.y + 3, B.w - 2, 1); } },
  buding: { type: 'human', name: '布丁', hair: '#3a2a3a', hs: 'short', cloth: '#ffd27a', skin: '#e3ab7f', face: cfGlasses('#8a5a30'), head: cfBeanie('#ff8fa8', true), body(K, dir, cx) { const B = CF_B; K.R('#e8a838', B.x + 1, B.y + 3, B.w - 2, 1); K.R('#e8a838', B.x + 1, B.y + 5, B.w - 2, 1); } },
  xiaoju: { type: 'human', name: '小橘', hair: '#c0503a', hs: 'pony', rib: '#ffd34d', cloth: '#f0b050', shoe: '#5a4a88', skin: '#ffe3cc', head(K) { const H = CF_H; K.R('#ffd34d', H.x, H.y + 2, H.w, 1); } },
  mochi: { type: 'human', name: '麻糬', hair: '#e9e4de', hs: 'bun', cloth: '#c9a8f5', skin: '#ffe3cc', head(K) { const H = CF_H; K.OB('#ff9bb3', '#d4688a', H.x + H.w - 4, H.y - 1, 4, 3); K.R('#ffffff', H.x + H.w - 3, H.y, 1, 1); }, body(K, dir, cx) { const B = CF_B; K.R('#fffaf0', cx - 1, B.y, 2, 2); } },
  /* ===== 顧客：動物風 ===== */
  rabbit: { type: 'animal', name: '小白兔', fur: '#fffaf0', light: '#ffe3ec', outline: '#b9b0a4', ear: 'long', cloth: '#ff9bb3', nose: '#ff8fa8', tail: 'puff' },
  cat: { type: 'animal', name: '橘貓', fur: '#f0a04a', light: '#fff0d0', outline: '#a8641e', ear: 'point', cloth: '#6ab0e0', stripe: '#e0852a', whisk: true, nose: '#ff8fa8', tail: 'long' },
  sheep: { type: 'animal', name: '小綿羊', fur: '#fffaf0', light: '#fffaf0', outline: '#c9bfb0', ear: 'sheep', cloth: '#8fd3c0', nose: '#3a2a2a', tail: 'puff' },
  duck: { type: 'animal', name: '小鴨', fur: '#ffe066', light: '#ffe066', outline: '#c9a21c', ear: 'tuft', beak: true, cloth: '#7ab0e8', nose: '#3a2a2a', tail: 'duck' },
  fox: { type: 'animal', name: '小狐狸', fur: '#e8873a', light: '#fffaf0', outline: '#a8501e', ear: 'point', cloth: '#8fc48f', cheeks: true, nose: '#3a2a2a', tail: 'fox' },
  penguin: { type: 'animal', name: '企鵝', fur: '#3a3a4a', light: '#fffaf0', outline: '#1c1c28', ear: 'none', beak: true, belly: true, cloth: '#fffaf0', scarf: '#e0486a', nose: '#3a2a2a', tail: 'none', face2: true }
};
/* ---------- 動物風 ---------- */
function cfAnimal(px, py, s, dir, bob, now, o) {
  const K = cfKit(px, py, bob), { R, R0, OB } = K, H = CF_H, B = CF_B, bl = (now % 3800) > 3650, ey = H.y + 3, cx = B.x + B.w / 2, fur = s.fur, out = s.outline || CF_OUT, side = dir === 'left' || dir === 'right', L = dir === 'left', wag = Math.floor(now / 450) % 2;
  R0('rgba(90,60,40,.2)', 3, 14, 10, 2); R0('rgba(90,60,40,.12)', 2, 14, 12, 2);
  // 尾巴（身體後面）
  const tx = side ? (L ? B.x + B.w - 1 : B.x - 3) : B.x + B.w - 1;
  if (s.tail === 'curl') { R(fur, tx, B.y + 1 + wag, 3, 3); R(s.light, tx + 1, B.y + wag, 2, 1); R(cfLo(fur), tx + 2, B.y + 1 + wag, 1, 2); }
  if (s.tail === 'long') { R(fur, tx, B.y + 1, 2, 5); R(s.stripe, tx, B.y + 2, 2, 1); R(s.stripe, tx, B.y + 4, 2, 1); R(fur, tx + (wag ? 1 : 0), B.y - 1, 2, 3); }
  if (s.tail === 'fox') { R('#a8501e', tx - 1, B.y + 1, 5, 6); R(fur, tx, B.y, 4, 6); R('#fffaf0', tx + 1, B.y + 5, 3, 2); }
  if (s.tail === 'puff') { R('#fffaf0', tx, B.y + 3, 3, 3); R('#e8e0d0', tx + 1, B.y + 5, 2, 1); }
  if (s.tail === 'duck') { R(fur, tx, B.y + 2, 3, 2); R(out, tx + 1, B.y + 1, 1, 1); }
  if (s.tail === 'nub') { R(fur, tx, B.y + 3, 2, 2); }
  R0(s.foot || (s.beak ? '#ff9a3a' : cfLo(fur)), B.x + 1, 14, 2, 1); R0(s.foot || (s.beak ? '#ff9a3a' : cfLo(fur)), B.x + B.w - 3, 14, 2, 1);
  // 身體
  if (s.belly) { OB(fur, CF_OUT, B.x, B.y, B.w, B.h); R(s.light, B.x + 2, B.y + 1, B.w - 4, B.h - 2); R(fur, B.x - 1, B.y + 1, 1, 4); R(fur, B.x + B.w, B.y + 1, 1, 4); }
  else { OB(s.cloth, CF_OUT, B.x, B.y, B.w, B.h); R(cfHi(s.cloth), B.x + 1, B.y + 1, B.w - 2, 1); R(cfLo(s.cloth), B.x + 1, B.y + B.h - 2, B.w - 2, 1); R(fur, B.x - 1, B.y + 2, 1, 3); R(fur, B.x + B.w, B.y + 2, 1, 3); }
  if (s.body) s.body(K, dir, cx);
  if (s.scarf) { R(s.scarf, B.x + 1, B.y - 1, B.w - 2, 2); R(cfLo(s.scarf), B.x + 1, B.y, B.w - 2, 1); R(s.scarf, B.x + B.w - 3, B.y + 1, 2, 3); }
  cfHold(K, o, fur);
  // 耳朵（頭後面）
  const earF = (x, y, w, h, inn) => { OB(fur, out, x, y, w, h); if (inn) R(inn, x + 1, y + 1, Math.max(1, w - 2), Math.max(1, h - 2)); };
  if (s.ear === 'point') { earF(H.x, H.y - 3, 4, 5, dir === 'up' ? null : '#ffb3c9'); earF(H.x + H.w - 4, H.y - 3, 4, 5, dir === 'up' ? null : '#ffb3c9'); }
  if (s.ear === 'round') { earF(H.x - 1, H.y - 2, 4, 4, dir === 'up' ? null : s.light); earF(H.x + H.w - 3, H.y - 2, 4, 4, dir === 'up' ? null : s.light); }
  if (s.ear === 'long') { earF(H.x + 1, H.y - 7, 3, 8, dir === 'up' ? null : '#ffb3c9'); earF(H.x + H.w - 4, H.y - 7, 3, 8, dir === 'up' ? null : '#ffb3c9'); }
  // 頭
  if (s.ear === 'sheep') { OB('#fffaf0', '#c9bfb0', H.x - 1, H.y - 2, H.w + 2, 6); R('#fffaf0', H.x - 1, H.y + 2, 3, 5); R('#fffaf0', H.x + H.w - 2, H.y + 2, 3, 5); R('#c9bfb0', H.x - 1, H.y + 6, 3, 1); R('#c9bfb0', H.x + H.w - 2, H.y + 6, 3, 1); OB('#f2d9bf', '#b8956f', H.x + 1, H.y + 3, H.w - 2, H.h - 3); OB('#d9b898', '#a88a6a', H.x - 2, H.y + 3, 3, 3); OB('#d9b898', '#a88a6a', H.x + H.w - 1, H.y + 3, 3, 3); }
  else { OB(fur, out === CF_OUT ? CF_OUT : out, H.x, H.y, H.w, H.h); if (dir !== 'up') R(cfHi(fur), H.x + 2, H.y + 1, 2, 1); }
  if (s.ear === 'tuft') { R(fur, H.x + 4, H.y - 3, 1, 3); R(fur, H.x + 6, H.y - 2, 1, 2); R(out, H.x + 4, H.y - 4, 1, 1); }
  if (s.stripe && dir !== 'up') { R(s.stripe, H.x + 4, H.y, 1, 2); R(s.stripe, H.x + 6, H.y, 1, 2); R(s.stripe, H.x + 2, H.y + 1, 1, 1); R(s.stripe, H.x + 7, H.y + 1, 1, 1); }
  if (dir === 'up') { if (s.ear === 'sheep') { R('#fffaf0', H.x, H.y + 1, H.w, H.h - 2); } return; }
  // 口鼻
  const mx = dir === 'down' ? H.x + 3 : L ? H.x : H.x + H.w - 5, mw = dir === 'down' ? H.w - 6 : 5;
  if (s.ear === 'sheep') { R('#e8b898', H.x + 4, ey + 2, 2, 1); R('#b8856a', H.x + 4, ey + 3, 2, 1); }
  else if (s.beak) { R('#ff9a3a', dir === 'down' ? H.x + 3 : mx, ey + 2, dir === 'down' ? 4 : 5, 2); R('#e0782a', dir === 'down' ? H.x + 3 : mx, ey + 3, dir === 'down' ? 4 : 5, 1); if (s.face2) { R(s.light, H.x + 1, H.y + 3, 2, 5); R(s.light, H.x + H.w - 3, H.y + 3, 2, 5); } }
  else { R(s.light, mx, ey + 1, mw, 4); if (s.cheeks) { R('#fffaf0', H.x, ey + 2, 3, 3); R('#fffaf0', H.x + H.w - 3, ey + 2, 3, 3); } R(s.nose || '#3a2a2a', dir === 'down' ? H.x + 4 : (L ? H.x : H.x + H.w - 2), ey + 1, 2, 1); R('#3a2a2a', dir === 'down' ? H.x + 4 : (L ? H.x + 1 : H.x + H.w - 3), ey + 3, 1, 1); R('#3a2a2a', dir === 'down' ? H.x + 5 : (L ? H.x + 2 : H.x + H.w - 4), ey + 3, 1, 1); }
  // 眼睛
  if (dir === 'down') { cfEye(K, H.x + 2, ey - (s.ear === 'sheep' ? 0 : 0), bl); cfEye(K, H.x + H.w - 4, ey, bl); if (!s.beak) { R('#ff9ab0', H.x + 1, ey + 3, 1, 1); R('#ff9ab0', H.x + H.w - 2, ey + 3, 1, 1); } }
  else { cfEye(K, L ? H.x + 1 : H.x + H.w - 3, ey, bl); cfEye(K, L ? H.x + 5 : H.x + H.w - 7, ey, bl); }
  if (s.whisk && dir === 'down') { R('#c9a37a', H.x - 1, ey + 2, 2, 1); R('#c9a37a', H.x + H.w - 1, ey + 2, 2, 1); R('#c9a37a', H.x - 1, ey + 4, 2, 1); R('#c9a37a', H.x + H.w - 1, ey + 4, 2, 1); }
  if (s.head) s.head(K, dir, ey);
}
function cfActor(px, py, key, dir, bob, now, o) { const s = CF_NPCS[key]; if (!s) return; (s.type === 'animal' ? cfAnimal : cfHuman)(px, py, s, dir || 'down', bob || 0, now || 0, o || {}); }
