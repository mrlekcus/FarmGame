'use strict';
/* 火車抓蟲團的美術 —— 雷克斯農場。用遊戲自己的 r()／rr()／ob() 畫。
   drawTrainScene(now)：依 tr.sub 畫車廂（藍車廂風）或草原站（野花田風車）；最終素材之後由 Gemini 產出，這裡先用程式畫的版本頂著。
   trainBugPix：火車限定新蟲的圖示（草原 3、山間 4、夜行 7，共 14 種），掛在 art/icons.js 的 bugPix 開頭。
   依賴 js/train.js 的 tr、TRW／TRH／MDW／MDH。 */
const TRAIN_BUG_FLY = { honeybee: 1, windmillbf: 1, maplebf: 1, maplemoth: 1, moonmoth: 1, moonhawk: 1, moongodbf: 1, bluefirefly: 1, starfirefly: 1 };
Object.assign(BUG_FLY, TRAIN_BUG_FLY);   // 蜜蜂和風車蝶會飛（isFlyer 看這張表）

function trainBugPix(key, fr, ox, oy, dim) {
  const DIM = '#cdbfb8', P = (c, x, y, w = 1, h = 1) => r(dim ? DIM : c, ox + x, oy + y, w, h);
  if (key === 'honeybee') {
    P('#cfe8f7', fr ? 3 : 4, 2, 3, 4); P('#cfe8f7', fr ? 10 : 9, 2, 3, 4); P('#9fc0d6', fr ? 3 : 4, 2, 3, 1); P('#9fc0d6', fr ? 10 : 9, 2, 3, 1);
    P('#3a2a1a', 5, 5, 6, 7); P('#f2c230', 6, 5, 4, 7); P('#3a2a1a', 6, 7, 4, 1); P('#3a2a1a', 6, 9, 4, 1);
    P('#3a2a1a', 7, 12); P('#3a2a1a', 6, 4); P('#3a2a1a', 9, 4);
    return true;
  }
  if (key === 'flowerchafer') {
    P('#7a5a1a', 4, 5, 8, 8); P('#3f8f3a', 5, 5, 6, 8); P('#8fd06a', 6, 6, 2, 4); P('#e8c14a', 5, 13, 6, 1);
    P('#7a5a1a', 5, 3, 6, 3); P('#e8c14a', 7, 2, 2, 1); P('#7a5a1a', 3, 8); P('#7a5a1a', 12, 8); P('#7a5a1a', 3, 11); P('#7a5a1a', 12, 11);
    if (fr) { P('#7a5a1a', 2, 9); P('#7a5a1a', 13, 9); }
    return true;
  }
  if (key === 'windmillbf') {
    const wd = fr ? 3 : 5;
    P('#ffffff', 8 - wd - 1, 2, wd + 1, 5); P('#ffffff', 8, 2, wd + 1, 5); P('#ff9ec0', 8 - wd, 7, wd, 4); P('#ff9ec0', 8, 7, wd, 4);
    P('#9ad6ff', 8 - wd + 1, 3, 2, 2); P('#9ad6ff', 8 + wd - 2, 3, 2, 2); P('#c06aa0', 8 - wd - 1, 2, 1, 5); P('#c06aa0', 8 + wd, 2, 1, 5);
    P('#3a2a3a', 7, 3, 2, 8); P('#3a2a3a', 6, 1); P('#3a2a3a', 9, 1);
    return true;
  }
  const bf = (wc, wc2, dot, body, fr, big) => {                       // 蝶／蛾：左右對稱的翅膀，fr 切換拍翅
    const wd = fr ? (big ? 3 : 2) : (big ? 6 : 5), top = big ? 1 : 2, h = big ? 8 : 6;
    P(wc, 8 - wd - 1, top, wd + 1, h); P(wc, 8, top, wd + 1, h); P(wc2, 8 - wd, top + h, wd, 3); P(wc2, 8, top + h, wd, 3);
    if (dot) { P(dot, 8 - wd + 1, top + 2, 2, 2); P(dot, 8 + wd - 2, top + 2, 2, 2); }
    P(body, 7, top + 1, 2, h + 2); P(body, 6, top - 1); P(body, 9, top - 1);
  };
  if (key === 'maplebf') { bf('#e8641e', '#f2b030', '#7a2a0a', '#3a1a0a', fr, false); return true; }
  if (key === 'maplemoth') { bf('#b8321e', '#e8883a', '#ffe08a', '#4a1a0a', fr, true); return true; }
  if (key === 'moonmoth') { bf('#e8f0d8', '#b8d8a8', '#7ab0a0', '#4a5a4a', fr, false); return true; }
  if (key === 'moonhawk') { bf('#8a7ad0', '#d8c8f0', '#fff6c8', '#3a2a5a', fr, true); return true; }
  if (key === 'moongodbf') { bf('#bfe4ff', '#7aa8ff', '#ffffff', '#2a3a6a', fr, true); if (!dim) { r('rgba(190,230,255,.35)', ox + 2, oy + 1, 12, 12); } return true; }
  if (key === 'redstag') {
    P('#5a1410', 4, 6, 8, 8); P('#8a2418', 5, 6, 6, 7); P('#c0402a', 6, 7, 2, 4); P('#5a1410', 5, 4, 6, 3);
    P('#5a1410', 3, 2, 2, 4); P('#5a1410', 11, 2, 2, 4); P('#5a1410', 4, 2); P('#5a1410', 11, 2); P('#5a1410', 3, 8); P('#5a1410', 12, 8); P('#5a1410', 3, 11); P('#5a1410', 12, 11);
    return true;
  }
  if (key === 'rainbowjewel') {
    P('#2a6a3a', 4, 4, 8, 10); P('#2fb8c8', 5, 5, 3, 8); P('#a85ad8', 8, 5, 3, 8); P('#f2c230', 6, 7, 4, 2); P('#e85a7a', 6, 11, 4, 2);
    P('#2a2a2a', 6, 2, 4, 3); P('#2a2a2a', 3, 7); P('#2a2a2a', 12, 7); P('#2a2a2a', 3, 11); P('#2a2a2a', 12, 11);
    return true;
  }
  if (key === 'glowladybug') {
    P('#2a1a4a', 4, 5, 8, 8); P('#7a4ad8', 5, 5, 6, 8); P('#d8f8ff', 6, 6, 2, 2); P('#d8f8ff', 9, 8, 2, 2); P('#d8f8ff', 6, 10, 2, 2);
    P('#2a1a4a', 6, 3, 4, 3); P('#2a1a4a', 7, 5, 1, 8);
    if (!dim) r('rgba(150,220,255,.28)', ox + 2, oy + 3, 12, 12);
    return true;
  }
  if (key === 'bluefirefly') {
    P('#3a3a4a', 6, 3, 4, 8); P('#9ad8ff', 6, 9, 4, 4); P('#e8fbff', 7, 10, 2, 2); P('#cfe8f7', fr ? 3 : 4, 3, 3, 4); P('#cfe8f7', fr ? 10 : 9, 3, 3, 4);
    P('#3a3a4a', 7, 2); P('#3a3a4a', 8, 2);
    if (!dim) r('rgba(120,200,255,.3)', ox + 3, oy + 8, 10, 8);
    return true;
  }
  if (key === 'starfirefly') {
    P('#2a2a5a', 6, 3, 4, 8); P('#ffe27a', 5, 9, 6, 4); P('#fff8d0', 7, 10, 2, 2); P('#e8f0ff', fr ? 2 : 3, 2, 4, 5); P('#e8f0ff', fr ? 10 : 9, 2, 4, 5);
    P('#ffe27a', 7, 0); P('#ffe27a', 6, 1, 4, 1); P('#2a2a5a', 7, 2);
    if (!dim) r('rgba(255,236,150,.32)', ox + 2, oy + 6, 12, 10);
    return true;
  }
  if (key === 'silvermoonbeetle') {
    P('#3a4a6a', 4, 6, 8, 8); P('#cfd8e8', 5, 6, 6, 7); P('#ffffff', 6, 7, 2, 4); P('#3a4a6a', 6, 4, 4, 3);
    P('#cfd8e8', 7, 0, 2, 5); P('#cfd8e8', 5, 1, 2, 1); P('#cfd8e8', 9, 1, 2, 1); P('#3a4a6a', 3, 8); P('#3a4a6a', 12, 8); P('#3a4a6a', 3, 12); P('#3a4a6a', 12, 12);
    if (!dim) r('rgba(220,235,255,.3)', ox + 3, oy + 4, 10, 11);
    return true;
  }
  return false;
}

/* ---------- 車廂（16×12）：藍車廂風——藍色木牆、奶白窗框、紅窗簾、黃銅吊燈、紅絨長椅、紅地毯，呼應車站旁的藍色車廂 ---------- */
function drawTrainCar(now) {
  const dep = tr.dep > 0 ? Math.min(1, (performance.now() - tr.dep) / 3000) : 0, mv = tr.dep > 0 && dep < 1;
  r('#34508a', -480, -480, TRW * T + 960, TRH * T + 960);
  for (let y = 0; y < TRH; y++) for (let x = 0; x < TRW; x++) {
    const px = x * T, py = y * T;
    if (y < 3) { r(y === 2 ? '#34508a' : '#3f5f9a', px, py, T, T); if (x % 4 === 0) r('#2c4478', px, py, 1, T); }
    else { r((x + y) % 2 ? '#c9a06a' : '#bf9660', px, py, T, T); r('#a98050', px, py + 15, T, 1); }
  }
  r('#f4ecd2', 0, 2 * T + 10, TRW * T, 6);   // 奶白踢腳線
  // 窗戶（上牆）：景色往後捲，發車時捲得快
  for (let i = 0; i < 3; i++) {
    const wx = (2 + i * 5) * T, wy = 4;
    ob('#9fd8ff', '#f4ecd2', wx, wy, 3 * T, 32);
    const sc = ((now / (mv ? 14 : 120)) + i * 40) % (3 * T);
    r('#8fd06a', wx + 1, wy + 24, 3 * T - 2, 7);
    for (let k = 0; k < 3; k++) { const fx = wx + ((k * 24 + 48 - sc) % (3 * T - 6) + (3 * T - 6)) % (3 * T - 6) + 2; r('#4f9a4a', fx, wy + 18, 4, 8); r('#7fb06a', fx + 1, wy + 16, 2, 3); }
    r('#ffffff', wx + 6, wy + 6, 8, 3); r('#ffffff', wx + 28, wy + 10, 9, 3);
    r('#f4ecd2', wx + 3 * T / 2 - 1, wy, 2, 32);
    r('#b8342c', wx - 3, wy - 1, 6, 34); r('#b8342c', wx + 3 * T - 3, wy - 1, 6, 34); r('#8a2420', wx - 3, wy + 17, 6, 16); r('#8a2420', wx + 3 * T - 3, wy + 17, 6, 16);
    r('#f4ecd2', wx - 4, wy - 3, 3 * T + 8, 3);
  }
  // 地毯
  r('#a83a3a', 3 * T, 6 * T - 4, 10 * T, 22); r('#e8c14a', 3 * T, 6 * T - 4, 10 * T, 2); r('#e8c14a', 3 * T, 6 * T + 17, 10 * T, 2);
  for (let x = 3 * T + 6; x < 13 * T; x += 16) r('#e8c14a', x, 6 * T + 4, 4, 4);
  // 長椅（紅絨，走不進去：kind = HB）
  [[2, 4], [2, 8], [11, 4], [11, 8]].forEach(([bx, by]) => {
    const px = bx * T, py = by * T;
    ob('#b8342c', '#6a1a14', px, py + 2, 3 * T, T - 2); r('#d85a4a', px + 2, py + 4, 3 * T - 4, 3); ob('#a02a22', '#6a1a14', px, py - 6, 3 * T, 10);
  });
  // 黃銅吊燈
  [3, 8, 13].forEach(lx => { r('#8a6a20', lx * T + 7, 0, 2, 10); ob('#ffe27a', '#8a6a20', lx * T + 1, 10, 14, 9); r('#fff6c8', lx * T + 5, 16, 6, 2); r('rgba(255,236,150,.12)', lx * T - 8, 20, 32, 26); });
  // 前門（右牆，木門）
  ob('#7a4a28', '#3a2412', (TRW - 1) * T - 2, 6 * T - 4, 18, 28); r('#e8c14a', (TRW - 1) * T + 10, 6 * T + 10, 2, 3);
}

function trTrackTrain(now) {
  const by = (MDH - 2) * T + 4;
  r('#8a7a64', 0, by, MDW * T, 10); for (let x = 0; x < MDW * T; x += 6) r('#6a4c30', x, by + 1, 3, 8); r('#b8b8c0', 0, by + 2, MDW * T, 2); r('#b8b8c0', 0, by + 6, MDW * T, 2);
  if (typeof stLoco === 'function') { const X0 = 2 * T; stLoco(X0, by - 20, now || 0); stCar(X0 + 57, by - 18, '#4a6aa8', '#24386a'); stCar(X0 + 99, by - 18, '#b0523c', '#5e2418'); r('#444', X0 + 58, by + 8, 4, 2); r('#444', X0 + 98, by + 8, 4, 2); }
}

/* ---------- 草原站（24×16）：滿地野花、風車、陽光；月台在左側 ---------- */
function drawTrainMeadow(now) {
  r('#9bcf6e', -480, -480, MDW * T + 960, MDH * T + 960);
  for (let y = 0; y < MDH; y++) for (let x = 0; x < MDW; x++) {
    const px = x * T, py = y * T, k = K[y][x];
    r((x + y) % 2 ? '#a8d672' : '#9fcf68', px, py, T, T);
    if (y === MDH - 2) continue;                                                      // 整排軌道（下面畫）
    const bed = x >= 1 && x <= 4 && y >= 4 && y <= 12, hv = hash(x, y, 77);          // 左邊原本的月台改成一整片花田
    for (let n = 0; n < (bed ? 2 : 1); n++) {
      if (hash(x, y, 77 + n * 9) < (bed ? 0.8 : 0.28)) { const c = ['#ff7a9a', '#ffd34a', '#ffffff', '#c58aff', '#ff9a5a'][Math.floor(hash(x, y, 78 + n) * 5)], fx = px + 2 + Math.floor(hash(x, y, 79 + n) * 11), fy = py + 3 + Math.floor(hash(x, y, 80 + n) * 9), sw = Math.round(Math.sin(now / 600 + x * 1.3 + y + n) * 0.6); r('#4f9a4a', fx, fy + 3, 1, 3); r(c, fx - 1 + sw, fy, 3, 3); r('#ffe27a', fx + sw, fy + 1, 1, 1); }
    }
    if (k === TR) { drawTree(px, py, x, y); }
  }
  // 風車（右上）
  const wx = 19 * T, wy = 1 * T;
  ob('#e8dcc4', '#8a7a64', wx + 6, wy + 22, 28, 40); r('#c9b79a', wx + 6, wy + 40, 28, 2); ob('#8a4b3a', '#5e2418', wx + 2, wy + 14, 36, 10); ob('#7a4a28', '#3a2412', wx + 15, wy + 48, 10, 14);
  const a = now / 900;
  for (let i = 0; i < 4; i++) { const an = a + i * Math.PI / 2; for (let d = 4; d < 30; d += 2) r(d < 8 ? '#5a3a20' : '#f4f0e6', Math.round(wx + 20 + Math.cos(an) * d) - 1, Math.round(wy + 16 + Math.sin(an) * d) - 1, 3, 3); }
  r('#5a3a20', wx + 18, wy + 14, 5, 5);
  trTrackTrain(now);
  // 太陽光斑
  ctx.globalAlpha = .07; r('#fff6b0', 0, 0, MDW * T, MDH * T); ctx.globalAlpha = 1;
}

/* ---------- 山間站（24×16）：暖橘黃昏、楓樹、落葉、岩石；月台在左側 ---------- */
function trMaple(px, py, x, y) {
  const c = [['#c8321e', '#e8641e'], ['#e8801e', '#f2b030'], ['#a82a1a', '#d8501e']][Math.floor(hash(x, y, 91) * 3)];
  r('#5a3a20', px + 6, py + 8, 4, 9); r('rgba(0,0,0,.14)', px, py + 15, 16, 3);
  r(c[0], px - 3, py - 6, 22, 14); r(c[1], px - 1, py - 8, 18, 10); r(c[0], px + 1, py - 10, 14, 5); r(c[1], px + 3, py - 3, 6, 4);
}
function drawTrainMountain(now) {
  r('#c9a05a', -480, -480, MDW * T + 960, MDH * T + 960);
  for (let y = 0; y < MDH; y++) for (let x = 0; x < MDW; x++) {
    const px = x * T, py = y * T, k = K[y][x];
    r((x + y) % 2 ? '#c9a05a' : '#bf9650', px, py, T, T);
    if (y === MDH - 2) continue;
    const hv = hash(x, y, 177);
    if (hv < (x >= 1 && x <= 5 && y >= 4 && y <= 12 ? 0.55 : 0.3)) { const c = ['#c8321e', '#e8801e', '#f2b030', '#a82a1a'][Math.floor(hash(x, y, 178) * 4)], fx = px + 2 + Math.floor(hash(x, y, 179) * 11), fy = py + 3 + Math.floor(hash(x, y, 180) * 9); r(c, fx, fy, 3, 2); r(c, fx + 1, fy - 1, 1, 1); }
    if (k === HB) {
      r('rgba(0,0,0,.18)', px, py + 12, T, 4); r('#8a8478', px + 1, py + 2, 14, 12); r('#a8a294', px + 2, py + 2, 10, 5); r('#6a645a', px + 1, py + 11, 14, 3); r('#bdb7a8', px + 4, py + 3, 3, 2);
    }
    if (k === TR) trMaple(px, py, x, y);
  }
  for (let i = 0; i < 14; i++) {                      // 飄落的楓葉
    const t = (now / 40 + i * 53) % 400, fx = (i * 37 + Math.sin(now / 700 + i) * 12 + t * 0.35) % (MDW * T), fy = (t / 400) * MDH * T;
    r(['#c8321e', '#e8801e', '#f2b030'][i % 3], Math.round(fx), Math.round(fy), 3, 2);
  }
  trTrackTrain(now);
  ctx.globalAlpha = .14; r('#ff8a2a', 0, 0, MDW * T, MDH * T); ctx.globalAlpha = 1;
}

/* ---------- 夜行站（24×16）：紫夜、大月亮、發光藍花；三站中唯一的冷色調 ---------- */
function drawTrainNight(now) {
  r('#2c2458', -480, -480, MDW * T + 960, MDH * T + 960);
  const fl = [];
  for (let y = 0; y < MDH; y++) for (let x = 0; x < MDW; x++) {
    const px = x * T, py = y * T, k = K[y][x];
    r((x + y) % 2 ? '#3a2f70' : '#342a66', px, py, T, T);
    if (y === MDH - 2) continue;
    if (hash(x, y, 277) < 0.3) fl.push([px + 2 + Math.floor(hash(x, y, 279) * 11), py + 3 + Math.floor(hash(x, y, 280) * 9), hash(x, y, 281) * 6]);
    if (k === HB) { r('rgba(0,0,0,.25)', px, py + 12, T, 4); r('#4a7ad8', px + 4, py + 1, 8, 13); r('#8ac8ff', px + 6, py + 1, 3, 9); r('#2a4a98', px + 4, py + 11, 8, 3); }
    if (k === TR) { r('rgba(0,0,0,.25)', px, py + 15, 16, 3); r('#2a1c4a', px + 6, py + 8, 4, 9); r('#3a2a70', px - 3, py - 6, 22, 14); r('#4a3a90', px - 1, py - 8, 18, 10); r('#5a4aa8', px + 3, py - 3, 5, 3); }
  }
  // 大月亮（右上）與星星
  const mx = 19 * T + 12, my = 2 * T + 8;
  r('rgba(255,246,200,.10)', mx - 40, my - 40, 80, 80); r('rgba(255,246,200,.14)', mx - 30, my - 30, 60, 60);
  for (let dy = -20; dy <= 20; dy++) { const w = Math.floor(Math.sqrt(400 - dy * dy)); r('#fff6d0', mx - w, my + dy, w * 2, 1); }
  r('#e8dca8', mx - 8, my - 6, 6, 5); r('#e8dca8', mx + 4, my + 4, 5, 4); r('#e8dca8', mx - 2, my + 10, 4, 3);
  for (let i = 0; i < 26; i++) { const sx = Math.floor(hash(i, 3, 301) * MDW * T), sy = Math.floor(hash(i, 4, 302) * MDH * T * 0.6); if (Math.hypot(sx - mx, sy - my) < 26) continue; r(Math.sin(now / 500 + i) > 0 ? '#ffffff' : '#a8a8e8', sx, sy, 1, 1); }
  trTrackTrain(now);
  for (let y = 4; y <= 12; y++) for (let x = 1; x <= 5; x++) fl.push([x * T + 2 + Math.floor(hash(x, y, 283) * 11), y * T + 3 + Math.floor(hash(x, y, 284) * 9), hash(x, y, 285) * 6]);   // 原月台位置：發光花海
  ctx.globalAlpha = .22; r('#0a0628', 0, 0, MDW * T, MDH * T); ctx.globalAlpha = 1;
  // 發光藍花（在暗色濾鏡之後畫，才會亮）
  fl.forEach(([fx, fy, ph]) => {
    const g = 0.5 + 0.5 * Math.sin(now / 700 + ph);
    r('rgba(110,190,255,' + (0.10 + g * 0.12).toFixed(2) + ')', fx - 4, fy - 3, 9, 9); r('#2a6a8a', fx, fy + 3, 1, 3); r(g > 0.5 ? '#bfe8ff' : '#7ac0ff', fx - 1, fy, 3, 3); r('#ffffff', fx, fy + 1, 1, 1);
  });
}

function drawTrainScene(now) {
  if (tr.sub === 'meadow') drawTrainMeadow(now); else if (tr.sub === 'mountain') drawTrainMountain(now); else if (tr.sub === 'night') drawTrainNight(now); else drawTrainCar(now);
}
