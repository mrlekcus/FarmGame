'use strict';
/* 新增圖塊：村莊大門、噴水池、長椅 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* ---------- 新增圖塊：村莊大門、噴水池石緣、長椅 ---------- */
function drawGate(px, py, now) {
  r('#9b6a44', px + 1, py + 3, 2, 13); r('#9b6a44', px + 13, py + 3, 2, 13);
  r('#c98f62', px + 1, py + 3, 1, 13); r('#c98f62', px + 13, py + 3, 1, 13);
  ob('#e8b27a', '#9b6a44', px, py + 1, 16, 4);
  ob('#fff6d8', '#d9a066', px + 4, py + 5, 8, 5);
  r('#ff8fa8', px + 7, py + 6, 2, 2); r('#ff8fa8', px + 6, py + 7, 1, 1); r('#ff8fa8', px + 9, py + 7, 1, 1);
  const w = Math.floor(now / 400) % 2;
  r('#ff8fa8', px + 14, py - 1 + w, 2, 2);
}
/* 塔羅屋（帳篷版，99×85 像素的圖，見 art/temple-church.js 的 tarot_ext）：
   佔廣場 x13–17、y2–4（新座標），門在 x14–16、y4；這裡是舊座標（外面有 translate），所以圖的底邊對 y=34（新座標 80 像素）、中心對 x=168 */
function drawTarotStall(now) {
  const im = typeof tcArt !== 'undefined' ? tcArt.img('tarot_ext') : null;
  if (!im) return;
  ctx.drawImage(im, Math.round(168 - im.width / 2), 34 - im.height);
  const tw = 0.5 + 0.5 * Math.sin(now / 350);   // 招牌星星的光暈
  ctx.globalAlpha = 0.18 + 0.3 * tw; r('#ffe9a8', 168 - 5, 34 - im.height + 2, 10, 8); ctx.globalAlpha = 1;
}
function drawRim(px, py, tx, ty) {
  r('#e9e2d6', px, py, T, T);
  r('#f7f2ea', px, py, T, 2);
  r('#c9c0b2', px, py + T - 2, T, 2);
  r('#d9d1c3', px + 2 + ((tx + ty) % 3) * 3, py + 5, 3, 2);
  r('#d9d1c3', px + 9, py + 10, 3, 2);
}
function drawBoard(px, py) {
  r('rgba(90,60,40,.18)', px + 1, py + 13, 14, 2);
  r('#9b6a44', px + 3, py + 9, 2, 6); r('#9b6a44', px + 11, py + 9, 2, 6);
  ob('#e8b27a', '#9b6a44', px + 1, py + 1, 14, 10);
  r('#fff6dc', px + 3, py + 3, 4, 4); r('#ffd1dc', px + 8, py + 3, 4, 3); r('#cfe8f7', px + 7, py + 7, 5, 3);
  r('#d4688a', px + 4, py + 3, 1, 1); r('#d4688a', px + 10, py + 3, 1, 1); r('#7aa8c8', px + 9, py + 8, 2, 1);
}
function drawBench(px, py, tx, ty) {
  if (scene === 'plaza' && typeof campStumpAt === 'function' && campStumpAt(tx, ty)) { drawCampStump(px, py); return; }   // 露營區的木墩（js/camp.js）
  const rowK = (typeof ty === 'number' && K[ty]) ? K[ty] : null;
  if (rowK && rowK[tx + 1] === BN && rowK[tx - 1] !== BN) return;   // 兩格相連的雙人長椅：由右邊那格一次畫完
  if (rowK && rowK[tx - 1] === BN) {
    const x0 = px - T;
    r('rgba(90,60,40,.18)', x0 + 1, py + 13, 30, 2);
    ob('#e8b27a', '#9b6a44', x0 + 1, py + 4, 30, 4);
    ob('#d9a066', '#9b6a44', x0 + 1, py + 9, 30, 3);
    r('#9b6a44', x0 + 2, py + 12, 2, 3); r('#9b6a44', x0 + 15, py + 12, 2, 3); r('#9b6a44', x0 + 28, py + 12, 2, 3);
    return;
  }
  r('rgba(90,60,40,.18)', px + 1, py + 13, 14, 2);
  ob('#e8b27a', '#9b6a44', px + 1, py + 4, 14, 4);
  ob('#d9a066', '#9b6a44', px + 1, py + 9, 14, 3);
  r('#9b6a44', px + 2, py + 12, 2, 3); r('#9b6a44', px + 12, py + 12, 2, 3);
}
