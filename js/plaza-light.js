'use strict';
/* 廣場早晚光影（方案 B）—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* 路燈（大件，不能走過去）、夜裡的光暈、早晨的霧與斜光與小鳥、傍晚天光、夜晚暗角、螢火蟲。
   光暈和路燈只在 plaza 場景出現。 */
const PL_LAMPS = [];   // 路燈已全部拿掉（原本 6 盞：[9,4] [11,4] [9,10] [11,10] [7,6] [13,8]，舊座標），會擋路
const PL_BLK = new Set(PL_LAMPS.map(a => a[0] + ',' + a[1]));
const plBlocked = (x, y) => scene === 'plaza' && PL_BLK.has((x - PXO) + ',' + (y - PYO));
const plCache = {};   // 光暈不會動，先畫在圖上，每一幀只用透明度貼一次
const plHash = (a, b, c) => { const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return n - Math.floor(n); };   // 固定的假亂數（螢火蟲位置）
function plDisc(g, cx, cy, rad, rgb, a) {   // 疊 6 層由大到小的半透明圓盤，邊緣比較柔
  for (let k = 0; k < 6; k++) {
    const rr = Math.round(rad * (1 - k * 0.16));
    g.fillStyle = 'rgba(' + rgb + ',' + (a * 0.075).toFixed(3) + ')';
    for (let dy = -rr; dy <= rr; dy++) { const dx = Math.floor(Math.sqrt(rr * rr - dy * dy + 0.5)); g.fillRect(Math.round(cx) - dx, Math.round(cy) + dy, 2 * dx + 1, 1); }
  }
}
function plBuild() {
  const cv2 = document.createElement('canvas'); cv2.width = PLW * T; cv2.height = PLH * T;   // 整張新地圖大小；裡面照舊座標畫（左邊的東西座標會是負的），所以先位移
  const g = cv2.getContext('2d'), R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  g.translate(PXO * T, PYO * T);
  PL_LAMPS.forEach(a => { plDisc(g, a[0] * T + 8, a[1] * T + 4, 22, '255,214,120', 1.3); R('#ffe9a0', a[0] * T + 5, a[1] * T + 2, 6, 3); });
  plDisc(g, 145, 4, 22, '150,170,255', 1.1);   // 塔羅屋水晶球
  plDisc(g, 125, -12, 14, '255,176,90', 0.8); plDisc(g, 207, -12, 14, '255,176,90', 0.8);   // 塔羅屋兩盞燈籠
  plDisc(g, 224, 36, 18, '255,200,120', 0.7);
  return cv2;
}
/* 路燈本體：畫在夜色濾鏡之前（會跟著變暗） */
function drawPlazaLamps(now) {
  PL_LAMPS.forEach(a => {
    const px = a[0] * T, py = a[1] * T;
    r('rgba(60,40,20,.2)', px + 5, py + 14, 7, 2);
    r('#5a4a5a', px + 7, py + 5, 2, 10); r('#3a2e44', px + 5, py + 14, 6, 2);
    r('#3a2e44', px + 4, py + 1, 8, 1); r('#3a2e44', px + 5, py + 5, 6, 1);
    r('#a8b4c8', px + 5, py + 2, 6, 3);
  });
}
/* 光影：畫在夜色濾鏡之後 */
function drawPlazaLight(now, w, dark) {
  const m = w.min, wet = w.wet;
  const warmHour = Math.max(0, 1 - Math.abs(m - 1110) / 100);
  const morning = m >= 330 && m < 600 ? 1 - (m - 330) / 270 : 0;
  const lampA = clamp((dark - 0.02) / 0.35, 0, 1);
  const WP = W * T, HP = H * T, FX = PXO * T, FY = PYO * T;   // FX、FY：舊廣場座標換成現在地圖的位移
  if (dark > 0) r('rgba(14,10,52,' + (0.26 * dark).toFixed(3) + ')', 0, 0, WP, HP);   // 夜再深一點，燈才亮得出來
  if (lampA > 0.02) {
    if (!plCache[0]) plCache[0] = plBuild();
    ctx.globalAlpha = lampA; ctx.drawImage(plCache[0], 0, 0); ctx.globalAlpha = 1;
  }
  /* 早晨 */
  if (morning > 0 && !wet) {
    r('rgba(255,200,120,' + (0.14 * morning).toFixed(3) + ')', 0, 0, WP, HP);
    for (let i = 0; i < 7; i++) { const t = Math.floor(now / 300 + i * 3) % 4; if (t < 2) r('#ffffff', FX + 163 + ((i * 7) % 11), FY + 112 + ((i * 5) % 14), 1, 1); }   // 噴水池閃亮
    for (let i = 0; i < 4; i++) {   // 晨霧
      const y0 = FY + 118 + i * 24 + Math.sin(now / 2400 + i) * 3;
      for (let x = 0; x < WP; x += 4) { const a = (0.16 + 0.10 * Math.sin(x * 0.05 + i * 2 + now / 3000)) * morning; if (a > 0.02) r('rgba(255,255,255,' + a.toFixed(3) + ')', x, Math.round(y0 + Math.sin(x * 0.03 + i) * 3), 4, 5); }
    }
    ctx.fillStyle = 'rgba(255,238,170,' + (0.22 * morning).toFixed(3) + ')';   // 斜射陽光
    [[30, 60], [120, 50], [210, 45], [300, 55], [390, 50], [480, 45]].filter(a => a[0] < WP).forEach(a => { const x0 = a[0], wd = a[1]; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + wd * 0.45, 0); ctx.lineTo(x0 + wd * 0.45 + 110, HP); ctx.lineTo(x0 + 110 - wd * 0.2, HP); ctx.closePath(); ctx.fill(); });
    for (let i = 0; i < 3; i++) {   // 小鳥
      const bx = Math.round(((now / 40 + i * 110) % (WP + 60)) - 30), by = Math.round(30 + i * 28 + Math.sin(now / 260 + i) * 3), f = Math.floor(now / 200 + i) % 2;
      r('#5a4a5a', bx, by + f, 1, 1); r('#5a4a5a', bx + 1, by + 1 - f, 1, 1); r('#5a4a5a', bx + 2, by + f, 1, 1);
    }
  }
  /* 傍晚天光 */
  if (warmHour > 0.05) {
    const gr = ctx.createLinearGradient(0, 0, 0, HP); gr.addColorStop(0, 'rgba(255,120,100,' + (0.22 * warmHour).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,120,100,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, WP, HP);
  }
  if (dark <= 0.15) return;
  /* 夜晚：暗角、噴水池月光 */
  for (let i = 0; i < 6; i++) {
    const a = (0.05 * dark).toFixed(3), c = 'rgba(8,6,40,' + a + ')';
    r(c, 0, 0, WP, 6 + i * 6); r(c, 0, HP - 6 - i * 6, WP, 6 + i * 6); r(c, 0, 0, 6 + i * 8, HP); r(c, WP - 6 - i * 8, 0, 6 + i * 8, HP);
  }
  plDisc(ctx, FX + 168, FY + 120, 14, '190,210,255', dark * 0.8);
  for (let i = 0; i < 6; i++) { const t = Math.floor(now / 260 + i * 2) % 5; if (t < 2) r('#ffffff', FX + 163 + ((i * 7) % 11), FY + 114 + ((i * 5) % 12), 1, 1); }
  /* 螢火蟲（黃） */
  const n = Math.round(14 * WP * HP / (BW * T * BH * T)), rgb = '255,242,122', core = '255,250,170';
  for (let i = 0; i < n; i++) {
    const x = 20 + plHash(i, 5, 2) * (WP - 40) + Math.sin(now / 1000 + i) * 7, y = 30 + plHash(i, 6, 3) * (HP - 64) + Math.sin(now / 720 + i * 2) * 5, pu = 0.5 + 0.5 * Math.sin(now / 350 + i * 1.7);
    plDisc(ctx, x, y, 5, rgb, dark * (0.4 + pu * 0.8));
    r('rgba(' + core + ',' + (0.5 + pu * 0.5).toFixed(2) + ')', Math.round(x), Math.round(y), 1, 1);
  }
}
