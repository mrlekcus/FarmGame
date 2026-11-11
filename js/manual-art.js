'use strict';
/* 手冊用的示意圖：用遊戲同款的 r()／ob()／petB()／drawPlayer() 像素畫法即時畫出來，不用上傳任何圖片檔 —— 雷克斯農場。
   所有檔案共用同一個全域範圍，載入順序見 index.html（要在 art/boat.js、art/pet.js、art/character.js、manual.js 之後）。
   mnArtSrc('voyage')／mnArtSrc('pet') 回傳 PNG 網址（只畫一次，之後用快取）；畫失敗回傳 ''，手冊會照常顯示「截圖準備中」。 */
const MN_ART = {}, MN_ART_W = 320, MN_ART_H = 200;
function mnPaint(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  try { g = x; fn(x); } finally { g = ctx; }
  return c;
}
function mnHeart(col, x, y) { r(col, x, y, 2, 1); r(col, x + 3, y, 2, 1); r(col, x, y + 1, 5, 1); r(col, x + 1, y + 2, 3, 1); r(col, x + 2, y + 3, 1, 1); }

/* 出海團：甲板拋竿（畫法和遊戲裡的甲板場景一樣：16×12 格，船長站在甲板上，欄杆外有一條魚線） */
function mnArtVoyage() {
  const DW = 16, DH = 12, WAK = 2, BRLK = 70, BCBK = 71;
  const K2 = Array.from({ length: DH }, () => Array(DW).fill(WAK));
  for (let y = 3; y <= 10; y++) for (let x = 2; x <= 13; x++) K2[y][x] = (x === 2 || x === 13 || y === 3 || y === 10) ? BRLK : 0;
  for (let y = 4; y <= 5; y++) for (let x = 4; x <= 8; x++) K2[y][x] = BCBK;
  K2[5][11] = BCBK; for (let y = 5; y <= 8; y++) K2[y][14] = BCBK;
  const now = 123456;
  const deck = mnPaint(DW * T, DH * T, X => {
    r('#9fd8ff', 0, 0, DW * T, T); r('#bfe6ff', 0, 0, DW * T, T); r('#9fd8ff', 0, T, DW * T, T); r('#3f8fd0', 0, 2 * T, DW * T, (DH - 2) * T);
    for (let i = 0; i < 3; i++) { const cx = ((i * 90 + now / 160) % (DW * T + 40)) - 30; rr('#ffffff', Math.round(cx), 4 + i * 8, 28, 6); rr('#ffffff', Math.round(cx) + 8, 1 + i * 8, 16, 6); }
    for (let ty = 2; ty < DH; ty++) for (let tx = 0; tx < DW; tx++) {
      if (K2[ty][tx] !== WAK) continue;
      const px = tx * T, py = ty * T;
      if ((tx + ty) % 2) r('rgba(255,255,255,.05)', px, py, T, T);
      for (let k = 0; k < 2; k++) {
        const hx = (hash(tx, ty, 11 + k) * 20 + now * 0.0075 * 16 * (k ? 0.7 : 1)) % 20 - 2, hy = 2 + hash(tx, ty, 13 + k) * 11 | 0;
        if (hx >= -2 && hx < 14) r(k ? '#7fc4ee' : '#9ad3f6', px + Math.max(0, Math.round(hx)), py + hy, 3, 1);
      }
    }
    for (let i = 0; i < 6; i++) { const ph = ((now / 700) + i / 6) % 1; X.globalAlpha = 0.7 * (1 - ph); r('#ffffff', Math.round((2 - ph * 2.2) * T), (4 + i % 6) * T + 3 + (i * 7) % 9, 5, 1); }
    X.globalAlpha = 1;
    r('rgba(20,50,90,.28)', 2 * T + 2, 10 * T + 3, 12 * T, 5);
    ob('#8c5b3c', '#5e3a24', 2 * T - 1, 3 * T - 1, 12 * T + 2, 8 * T + 2);
    for (let ty = 3; ty <= 10; ty++) for (let tx = 2; tx <= 13; tx++) {
      if (K2[ty][tx] === BRLK) continue;
      const px = tx * T, py = ty * T;
      r((tx + ty) % 2 ? '#c9a06a' : '#d1aa74', px, py, T, T); r('#a8804a', px, py + 5, T, 1); r('#a8804a', px, py + 11, T, 1);
      if (hash(tx, ty, 17) < 0.5) r('#a8804a', px + 4 + (hash(tx, ty, 19) * 8 | 0), py + (hash(tx, ty, 21) < 0.5 ? 0 : 6), 1, 5);
    }
    for (let ty = 3; ty <= 10; ty++) for (let tx = 2; tx <= 13; tx++) {
      if (K2[ty][tx] !== BRLK) continue;
      const px = tx * T, py = ty * T;
      r('#7a5030', px, py, T, T); r('#a8764a', px + 1, py + 1, T - 2, T - 2); r('#e8d4a8', px, py + (ty === 3 ? T - 5 : 3), T, 2);
      if (tx % 2 === 0 || ty % 2 === 0) { r('#5e3a24', px + 6, py + 2, 4, 12); r('#e8d4a8', px + 6, py + 2, 4, 2); }
    }
    ob('#a8764a', '#5e3a24', 13 * T + 8, 5 * T + 2, 10, 4 * T - 4); ob('#a8764a', '#5e3a24', 14 * T, 5 * T + 8, 12, 4 * T - 16);
    ob('#a8764a', '#5e3a24', 14 * T + 8, 6 * T + 2, 10, 2 * T - 4); r('#e8d4a8', 14 * T + 2, 6 * T + 4, 6, 2 * T - 8);
    { const cx = 4 * T, cy = 4 * T, cw = 5 * T, ch = 2 * T;
      ob('#e8453c', '#a82c26', cx - 2, cy - 4, cw + 4, 15); for (let x = 0; x < cw; x += 8) r('#ff7a6a', cx + x + 1, cy - 2, 3, 1);
      ob('#ffffff', '#9fb3c8', cx, cy + 10, cw, ch - 10);
      [8, 56].forEach(wx => { ob('#8fd3ff', '#5a8fc0', cx + wx, cy + 14, 14, 10); r('#ffffff', cx + wx + 2, cy + 15, 3, 1); });
      ob('#c08a62', '#8c5b3c', cx + 32, cy + 12, 14, 20); r('#ffd34d', cx + 42, cy + 22, 2, 2);
      ob('#7a8590', '#4a5560', cx + 54, cy - 12, 9, 12); r('#e8453c', cx + 54, cy - 8, 9, 3);
      r('#5e3a24', cx + 16, cy - 16, 1, 12); r('#ffd34d', cx + 17, cy - 16, 8, 4); r('#ff8a3a', cx + 17, cy - 13, 8, 1); }
    [[3, 4], [12, 4], [3, 9], [12, 9]].forEach(([tx, ty]) => { const px = tx * T, py = ty * T; r('rgba(60,40,20,.2)', px + 3, py + 12, 10, 2); ob('#ff8a3a', '#c4561a', px + 3, py + 4, 10, 10); r('#ffffff', px + 7, py + 5, 2, 8); r('#ffffff', px + 4, py + 8, 8, 2); });
    ob('#9b6a44', '#5e3a24', 11 * T + 2, 5 * T + 3, 12, 12); r('#5e3a24', 11 * T + 2, 5 * T + 7, 12, 1); r('#5e3a24', 11 * T + 2, 5 * T + 11, 12, 1);
    captainArt(7 * T, 7 * T, 0);                                                 // 柴犬船長站在甲板上
    r('#ffffff', 12 * T + 8, 2 * T + 8, 1, 24); ob('#ff6b6b', '#c84a4a', 12 * T + 5, 4 * T + 6, 6, 5);   // 欄杆外的魚線和浮標
    r('#ffd34d', 13 * T + 2, 2 * T - 6, 4, 9); r('#ffd34d', 13 * T + 3, 2 * T + 5, 2, 2);                // 魚咬鉤的驚嘆號
  });
  return mnPaint(MN_ART_W, MN_ART_H, X => { r('#4aa0e0', 0, 0, MN_ART_W, MN_ART_H); X.drawImage(deck, (MN_ART_W - deck.width) / 2, 4); });
}

/* 寵物與朋友的寵物：我（左）面向朋友的貓（中）摸牠，朋友（右）在旁邊；我自己的柴犬跟在腳邊。畫在 108×67 再放大三倍 */
function mnArtPet() {
  const sm = mnPaint(108, 67, X => {
    r('#98d681', 0, 0, 108, 67);
    for (let ty = 0; ty < 5; ty++) for (let tx = 0; tx < 7; tx++) if ((tx + ty) % 2) r('#a3dc8b', tx * T, ty * T, T, T);
    r('#e8d4a8', 0, 53, 108, 11); r('#f0e0b8', 0, 55, 108, 2); for (let x = 3; x < 108; x += 14) r('#d9c394', x, 60, 4, 1);   // 小路
    [[8, 6], [34, 4], [64, 8], [98, 5], [14, 46], [84, 47], [102, 38], [58, 44]].forEach(([fx, fy], i) => { r(i % 2 ? '#ffffff' : '#ffd34d', fx, fy, 1, 1); r('#ff9bb3', fx - 1, fy, 1, 1); r('#ff9bb3', fx + 1, fy, 1, 1); r('#ff9bb3', fx, fy - 1, 1, 1); r('#ff9bb3', fx, fy + 1, 1, 1); });
    const me = Object.assign({}, DEF_CHAR, { name: '', hair: 1, outfit: 0, hat: 3 }), fr = Object.assign({}, DEF_CHAR, { name: '', gender: 1, hair: 3, outfit: 1, hat: 3, style: 1 });
    const L1 = petOf('shiba_red'), L2 = petOf('cat_orange');
    petB(L1, 4, 32, { pose: 'front', now: 1000, dir: 1 });                        // 我自己的柴犬跟在腳邊
    drawPlayer(22, 30, 'right', false, 0, me);                                    // 我，面向朋友的貓
    r('rgba(90,60,40,.18)', 46, 47, 12, 2); petB(L2, 44, 29, { pose: 'front', now: 1000, dir: -1, happy: true });   // 朋友的貓：跳起來
    drawPlayer(70, 30, 'left', false, 0, fr);                                     // 朋友
    petEmoDraw('love', 45, 12);                                                   // 貓頭上的愛心氣泡
    [[26, 20, '#ff6f91'], [32, 14, '#ffb3c6'], [20, 12, '#ff9bb3']].forEach(([hx, hy, c]) => mnHeart(c, hx, hy));   // 我頭上冒出的小愛心
  });
  return mnPaint(MN_ART_W, MN_ART_H, X => { X.drawImage(sm, 0, 0, 108, 67, 0, 0, 324, 201); });
}

/* 咖啡廳：直接用 art/cafe.js 的 cafeRoom()／cfActor()／CFS／CFI 畫出店內（只用 6 款一般客人），不用截圖 */
function mnCafeRoom() {
  const st = (k, x, d) => ({ k, x, y: 7, dy: -5, rimY: 12, bob: 0, bubble: d }), sit = (k, x, y, dir) => ({ k, x, y, dir, dy: -3, rimY: 12, bob: 0 });
  const me = Object.assign({}, DEF_CHAR, { name: '', hair: 1, outfit: 0, hat: 3 });
  return mnPaint(256, 256, () => {
    r('#3b2a1e', 0, 0, 256, 256);
    cafeRoom('wood', 1000, [
      { k: 'doudou', x: 5, y: 4, dir: 'down', bob: 0, o: { hold: 'cup' } },
      st('xiaomi', 2, 'latte'), st('xiaoju', 4, 'americano'), st('adou', 8, 'pancake'),
      { k: 'mochi', x: 11, y: 2, dir: 'down', dy: -1, sy: 2, bob: 0 },
      sit('naicha', 2, 10, 'right'), sit('buding', 4, 10, 'left'),
      { k: 'xiaomi', x: -9, y: -9, juke: 1 }
    ], false);
    drawPlayer(7 * 16, 13 * 16, 'up', false, 0, me);
  });
}
function mnCafeKit() {   // 操作間特寫：只留豆豆，編號對應「穿上圍裙」窗的導覽地圖
  const room = mnPaint(256, 256, () => { r('#3b2a1e', 0, 0, 256, 256); cafeRoom('wood', 1000, [{ k: 'doudou', x: 5, y: 4, dir: 'down', bob: 0, o: { hold: 'cup' } }], false); });
  return mnPaint(176, 104, X => { X.drawImage(room, 0, 24, 176, 104, 0, 0, 176, 104); });
}
function mnCafeFlow(dish, seq) {   // 料理流程：左邊成品，右邊依序要走過的檯子
  const cell = (cx, cy, fn) => { ob('#fff8ea', '#e0c9a0', cx - 19, cy - 19, 38, 38); fn(); };
  const ST = {
    bean: (cx, cy) => cell(cx, cy, () => CFS.crate(cx - 8, cy - 8, 'b')), milk: (cx, cy) => cell(cx, cy, () => CFS.crate(cx - 8, cy - 8, 'm')),
    dough: (cx, cy) => cell(cx, cy, () => CFS.crate(cx - 8, cy - 8, 'd')), grind: (cx, cy) => cell(cx, cy, () => CFS.grinder(cx - 8, cy - 8)),
    mach: (cx, cy) => cell(cx, cy, () => CFS.machine(cx - 16, cy - 17, '#8a4a3a')), oven: (cx, cy) => cell(cx, cy, () => CFS.oven(cx - 16, cy - 8)),
    rack: (cx, cy) => cell(cx, cy, () => CFS.rack(cx - 8, cy - 8, 4)), serve: (cx, cy) => cell(cx, cy, () => CFS.serve(cx - 8, cy - 8))
  };
  const arrow = (x, y) => { r('#d98a3a', x, y - 3, 1, 7); r('#d98a3a', x + 1, y - 2, 1, 5); r('#d98a3a', x + 2, y - 1, 1, 3); r('#d98a3a', x + 3, y, 1, 1); };
  return mnPaint(320, 64, () => {
    r('#fdf3df', 0, 0, 320, 64); r('#f3e2bd', 0, 62, 320, 2);
    ob('#ffe9b8', '#e0b668', 6, 12, 40, 40); CFI.dish(18, 23, dish); r('#fffaf0', 10, 42, 32, 1);
    let x = 66; seq.forEach((k, i) => { ST[k](x, 32); if (i < seq.length - 1) arrow(x + 22, 32); x += 46; });
  });
}
const MN_CAFE = {
  cafe: () => mnCafeRoom(), cafekit: () => mnCafeKit(),
  cafeam: () => mnCafeFlow('americano', ['bean', 'grind', 'mach', 'rack', 'mach', 'serve']),
  cafela: () => mnCafeFlow('latte', ['bean', 'grind', 'mach', 'milk', 'rack', 'serve']),
  cafepa: () => mnCafeFlow('pancake', ['dough', 'oven', 'rack', 'serve'])
};
function mnArtSrc(id) {
  if (id in MN_ART) return MN_ART[id];
  let src = '';
  try { const c = id === 'voyage' ? mnArtVoyage() : id === 'pet' ? mnArtPet() : MN_CAFE[id] ? MN_CAFE[id]() : null; if (c) src = c.toDataURL('image/png'); } catch (e) { src = ''; }
  MN_ART[id] = src; return src;
}
