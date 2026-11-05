'use strict';
/* 寵物領養店的美術：寵物（11 種品種毛色，Q 版大頭風格 B；側視風格 A 保留給之後走路用）、領養店外觀、工地、店內、店員阿喵姊姊 —— 雷克斯農場。
   所有檔案共用同一個全域範圍，載入順序見 index.html（要在 art/style-shop.js 之後）。 */
/* 後端（pet.sql、pet_get 等 RPC）還沒接上之前，用這個開關預覽：true＝領養店已蓋好、可以走進去；false＝顯示工地。
   接上 pet_get 之後改成讀 unlocked，並刪掉這個常數。 */
let petUnlocked = false;   // 由 pet_get 的 unlocked 決定（pet-shop.js 的 petSync）
const petBuilt = () => petUnlocked;
/* 寵物像素圖（候選稿）：沿用遊戲的 r／rr／ob 畫法，16×16 一格。
   風格 A＝側視（和牧場的雞、牛同一種畫法，只會左右翻轉）；風格 B＝Q 版大頭（和玩家角色同一種比例）。 */
const PINK = '#ff9a8a', NOSE = '#3a2a2a';
const PET_LOOKS = [
  { k: 'shiba_red',   sp: 'dog', breed: '柴犬', coat: '赤色', body: '#eba64f', out: '#a8641e', light: '#fff1d6', acc: '#fff1d6', earIn: '#ffd0a8', ear: 'point', tail: 'curl' },
  { k: 'shiba_black', sp: 'dog', breed: '柴犬', coat: '黑色', body: '#4a4452', out: '#241f2c', light: '#f1d5a8', acc: '#e0a35e', earIn: '#8a7080', ear: 'point', tail: 'curl' },
  { k: 'shiba_white', sp: 'dog', breed: '柴犬', coat: '白色', body: '#fffaf0', out: '#b5a994', light: '#ffffff', acc: '#f3e6cf', earIn: '#ffc9c9', ear: 'point', tail: 'curl' },
  { k: 'corgi',       sp: 'dog', breed: '柯基', coat: '黃白', body: '#efaa55', out: '#a8641e', light: '#ffffff', acc: '#ffffff', earIn: '#ffc2d2', ear: 'big', tail: 'nub', short: true },
  { k: 'golden',      sp: 'dog', breed: '黃金獵犬', coat: '金色', body: '#eebd55', out: '#a87820', light: '#fbe6a8', acc: '#fbe6a8', earC: '#d9a030', ear: 'floppy', tail: 'feather', big: true },
  { k: 'cat_orange',  sp: 'cat', breed: '米克斯', coat: '橘色', body: '#f4a64e', out: '#b8651e', light: '#fff0d0', stripe: '#e0852a', earIn: '#ffc2d2', eye: NOSE },
  { k: 'cat_tabby',   sp: 'cat', breed: '米克斯', coat: '虎斑', body: '#bf9f80', out: '#6e5846', light: '#eadcc6', stripe: '#6e5846', earIn: '#e8b0b0', eye: NOSE },
  { k: 'cat_black',   sp: 'cat', breed: '米克斯', coat: '黑色', body: '#403d4a', out: '#1e1c26', light: '#5a5766', earIn: '#8a6a7a', eye: '#ffd34d', pupil: true },
  { k: 'cat_white',   sp: 'cat', breed: '米克斯', coat: '白色', body: '#fffaf0', out: '#b9b0a4', light: '#ffffff', earIn: '#ffc2d2', eye: '#6fb7e8', pupil: true },
  { k: 'calico',      sp: 'cat', breed: '三花貓', coat: '三花', body: '#fffaf0', out: '#b9b0a4', light: '#ffffff', patchA: '#f4a64e', patchB: '#403d4a', earIn: '#ffc2d2', eye: NOSE },
  { k: 'siamese',     sp: 'cat', breed: '暹羅貓', coat: '重點色', body: '#f3e6cf', out: '#8a7560', light: '#fbf3e4', point: '#6b5346', earIn: '#8a6a5a', eye: '#6fb7e8', pupil: true }
];
const petOf = k => PET_LOOKS.find(x => x.k === k);

/* ---- 帽子與項圈（兩種風格共用，傳進來的是已翻轉好的螢幕座標）---- */
function petHatArt(kind, cx, ty) {   // cx：頭頂中心 x，ty：頭頂 y
  if (kind === 'bow') { r('#ff6b8a', cx - 4, ty - 3, 3, 3); r('#ff6b8a', cx + 1, ty - 3, 3, 3); r('#ffc2d2', cx - 3, ty - 3, 1, 1); r('#ffc2d2', cx + 2, ty - 3, 1, 1); r('#d43e63', cx - 1, ty - 2, 2, 2); }
  else if (kind === 'party') { r('#7a5fc0', cx - 3, ty - 1, 6, 1); r('#b79bf0', cx - 2, ty - 2, 4, 1); r('#b79bf0', cx - 1, ty - 4, 2, 2); r('#ffd34d', cx - 2, ty - 2, 1, 1); r('#ffd34d', cx, ty - 3, 1, 1); r('#ff8fa8', cx - 1, ty - 5, 2, 1); }
  else if (kind === 'crown') { r('#b8892a', cx - 4, ty - 1, 8, 1); r('#ffd34d', cx - 4, ty - 3, 8, 2); r('#ffd34d', cx - 4, ty - 5, 2, 2); r('#ffd34d', cx - 1, ty - 5, 2, 2); r('#ffd34d', cx + 2, ty - 5, 2, 2); r('#e0486a', cx - 1, ty - 2, 2, 1); r('#fff6a8', cx - 4, ty - 3, 1, 1); }
  else if (kind === 'straw') { r('#b8892a', cx - 6, ty - 1, 12, 1); r('#f1d27a', cx - 5, ty - 2, 10, 1); r('#f1d27a', cx - 3, ty - 4, 6, 2); r('#d9a066', cx - 3, ty - 3, 6, 1); r('#e0486a', cx - 3, ty - 3, 6, 1); }
  else if (kind === 'beret') { r('#8a2e46', cx - 4, ty - 1, 8, 1); r('#c9456a', cx - 4, ty - 3, 8, 2); r('#c9456a', cx - 3, ty - 4, 6, 1); r('#8a2e46', cx + 1, ty - 5, 1, 1); }
}
function petCollarArt(kind, x, y, w) {   // 項圈：x、y 起點，w 寬
  if (kind === 'red') { r('#d43e63', x, y, w, 1); r('#ff7a96', x, y, w, 0); r('#ffd34d', x + (w >> 1), y + 1, 2, 2); r('#b8892a', x + (w >> 1), y + 2, 2, 1); }
  else if (kind === 'bandana') { r('#4f86d6', x - 1, y, w + 2, 1); r('#4f86d6', x, y + 1, w, 1); r('#4f86d6', x + (w >> 1) - 1, y + 2, 3, 1); r('#4f86d6', x + (w >> 1), y + 3, 1, 1); r('#ffffff', x + 1, y + 1, 1, 1); r('#ffffff', x + w - 2, y + 1, 1, 1); }
  else if (kind === 'star') { r('#7fcf8a', x, y, w, 1); r('#ffd34d', x + (w >> 1) - 1, y, 3, 1); r('#ffd34d', x + (w >> 1), y - 1, 1, 3); r('#fff6a8', x + (w >> 1), y, 1, 1); }
}

/* ================= 風格 A：側視 ================= */
function petA(L, px, py, o) {
  o = o || {};
  const dir = o.dir === -1 ? -1 : 1, pose = o.pose || 'stand', fr = o.fr | 0, now = o.now || 0;
  const X = (x, w) => px + (dir > 0 ? x : 16 - x - w);
  const R = (c, x, y, w, h) => r(c, X(x, w), py + y, w, h);
  const OB = (c, out, x, y, w, h) => ob(c, out, X(x, w), py + y, w, h);
  const dog = L.sp === 'dog', body = L.body, out = L.out, light = L.light || body;
  const wag = Math.floor(now / 380) % 2;
  const paw = L.point || light;
  r('rgba(90,60,40,.18)', px + 2, py + 14, 12, 2);
  /* ---------- 睡覺：捲成一團 ---------- */
  if (pose === 'sleep') {
    const br = (now / 900) | 0 ? 1 : 0;
    OB(body, out, 1, 9 + br, 14, 6 - br);
    if (L.patchA) { R(L.patchA, 3, 10 + br, 4, 3); R(L.patchB, 8, 10 + br, 3, 2); }
    if (L.stripe) { R(L.stripe, 4, 10 + br, 1, 2); R(L.stripe, 6, 10 + br, 1, 2); R(L.stripe, 8, 10 + br, 1, 2); }
    OB(L.point || (L.earC && body) || body, out, 9, 6 + br, 7, 7);                             // 頭靠在前腳上
    if (L.point) R(L.point, 11, 8 + br, 4, 4);
    const ear = L.ear === 'floppy' ? 0 : 1;
    OB(L.earC || L.point || body, out, 9, 4 + br, 3, 4);
    if (!L.earC) { OB(L.point || body, out, 13, 4 + br, 3, 4); R(L.earIn, 10, 5 + br, 1, 2); R(L.earIn, 14, 5 + br, 1, 2); }
    if (L.earC) { R(L.earC, 9, 8 + br, 3, 3); }
    R(NOSE, 12, 9 + br, 2, 1); R(NOSE, 15, 9 + br, 1, 1);                                      // 閉眼、鼻子
    R(dog ? light : '#ff9ab0', 14, 10 + br, 1, 1);
    OB(L.point || (dog ? body : body), out, 1, 12, 6, 3); if (L.point) R(L.point, 2, 13, 4, 1);  // 尾巴繞在前面
    return;
  }
  const sit = pose === 'sit';
  const legH = L.short ? 2 : 3, legBot = 15, legTop = legBot - legH;
  /* ---------- 尾巴 ---------- */
  if (dog) {
    if (L.tail === 'curl') { OB(body, out, 0, sit ? 8 : 3 + wag, 3, 5); R(light, 1, sit ? 8 : 3 + wag, 1, 1); }
    else if (L.tail === 'nub') OB(body, out, 1, sit ? 11 : 6 + wag, 2, 3);
    else { OB(L.earC, out, 0, sit ? 10 : 6 + wag, 3, 6); R(light, 1, sit ? 14 : 10 + wag, 1, 1); }
  } else {
    if (sit) { OB(L.point || body, out, 0, 8, 3, 7); R(L.point || L.stripe || L.patchA || light, 0, 8, 3, 1); }
    else { OB(L.point || body, out, 0, 2 + wag, 3, 9); R(L.point ? L.point : (L.stripe || L.patchA || light), 1, 2 + wag, 1, 2); }
  }
  /* ---------- 身體與腿 ---------- */
  let hx, hy;
  if (!sit) {
    const bx = dog ? (L.big ? 1 : 2) : 3, bw = dog ? (L.big ? 11 : 10) : 8, bh = dog ? 6 : 5, bt = legTop - bh + 1;
    const a = pose === 'walk' ? fr : 0;
    [[bx + 1, a], [bx + 3, 1 - a], [bx + bw - 4, 1 - a], [bx + bw - 2, a]].forEach(([lx, up]) => {   // 四隻腳，走路時兩兩交替抬起
      R(L.point || body, lx, legTop, 2, legH - (pose === 'walk' ? up : 0));
      R(out, lx, legTop, 1, legH - (pose === 'walk' ? up : 0));
      R(paw, lx + 1, legBot - 1 - (pose === 'walk' ? up : 0), 1, 1); if (L.sp === 'dog') R(light, lx, legBot - 1 - (pose === 'walk' ? up : 0), 2, 1);
    });
    OB(body, out, bx, bt, bw, bh);
    if (dog) { R(light, bx + 2, bt + bh - 2, bw - 5, 1); if (L.k === 'corgi') { R(light, bx + 1, bt + bh - 3, 3, 2); R(light, bx + bw - 4, bt + bh - 3, 3, 2); } if (L.k === 'golden') R(light, bx + bw - 4, bt + 2, 2, 3); if (L.k === 'shiba_black') R(light, bx + bw - 4, bt + 2, 2, 3); }
    if (L.stripe) { R(L.stripe, bx + 2, bt + 1, 1, 2); R(L.stripe, bx + 4, bt + 1, 1, 3); R(L.stripe, bx + 6, bt + 1, 1, 2); }
    if (L.patchA) { R(L.patchA, bx + 1, bt + 1, 3, 3); R(L.patchB, bx + 5, bt + 1, 3, 2); R(L.patchA, bx + 5, bt + 3, 2, 2); }
    if (L.point) { R(L.point, bx + 6, bt + 1, 2, 2); }
    hx = dog ? (L.short ? 9 : 9) : 9; hy = dog ? (L.short ? 3 : 2) : 3;
    if (L.short) hy = bt - 2;
    if (!L.short && dog) hy = bt - 4; if (!dog) hy = bt - 4;
  } else {
    // 坐姿：身體立起來，前腳伸直，後腳折在前面
    OB(body, out, 3, 6, 7, 8);
    OB(shade(body, 0.94), out, 2, 9, 6, 5);                    // 後腿
    R(L.point || body, 8, 10, 2, 4); R(out, 8, 10, 1, 4); R(L.point || light, 8, 13, 2, 1);
    R(L.point || light, 3, 13, 4, 1);
    if (L.stripe) { R(L.stripe, 4, 7, 1, 2); R(L.stripe, 6, 7, 1, 3); }
    if (L.patchA) { R(L.patchA, 4, 7, 3, 3); R(L.patchB, 6, 11, 2, 2); }
    if (dog) R(light, 7, 9, 2, 3);
    hx = 8; hy = 3;
  }
  /* ---------- 頭 ---------- */
  OB(body, out, hx, hy, 7, 7);
  if (L.point) { R(L.point, hx + 3, hy + 2, 4, 4); }
  if (L.patchA) { R(L.patchB, hx + 1, hy + 1, 3, 3); R(L.patchA, hx + 4, hy, 2, 2); }
  if (L.stripe) { R(L.stripe, hx + 3, hy + 1, 1, 1); R(L.stripe, hx + 5, hy + 1, 1, 1); }
  if (dog) {
    if (L.k === 'corgi') R(light, hx + 4, hy + 1, 1, 3);
    R(light, hx + 3, hy + 3, 3, 3);                                           // 嘴鼻
    R(NOSE, hx + 5, hy + 3, 2, 2);                                              // 鼻頭（探出頭外）
    if (o.happy || pose === 'walk') R('#ff8fa8', hx + 4, hy + 6, 2, 1);          // 舌頭
    if (L.k === 'shiba_black') { R(L.acc, hx + 2, hy + 1, 1, 1); R(L.acc, hx + 4, hy + 1, 1, 1); }
    if (L.k === 'shiba_red') { R(L.acc, hx + 2, hy + 1, 1, 1); }
  } else {
    R(L.point ? L.point : light, hx + 4, hy + 3, 2, 2);
    R('#ff9ab0', hx + 5, hy + 3, 1, 1);                                          // 粉鼻
    R(L.out, hx + 5, hy + 5, 1, 1);
    R('rgba(255,255,255,.7)', hx + 5, hy + 6, 2, 0);
  }
  // 眼睛（貓的眼睛有色，大一點）與腮紅
  if (dog) R(NOSE, hx + 2, hy + 2, 1, 2);
  else { if (L.pupil) { R(L.eye, hx + 2, hy + 2, 2, 2); R(NOSE, hx + 3, hy + 2, 1, 2); R('#ffffff', hx + 2, hy + 2, 1, 1); } else { R(NOSE, hx + 3, hy + 2, 1, 2); R('#ffffff', hx + 3, hy + 2, 0, 0); } }
  R(PINK, hx + 1, hy + 4, 1, 1);
  // 耳朵
  const eb = hy - 2;
  if (dog && L.ear === 'point') { OB(body, out, hx, eb, 3, 4); OB(body, out, hx + 4, eb, 3, 4); R(L.earIn, hx + 1, eb + 1, 1, 2); R(L.earIn, hx + 5, eb + 1, 1, 2); if (L.k === 'shiba_black') { R(out, hx + 1, eb + 1, 1, 2); } }
  else if (dog && L.ear === 'big') { OB(body, out, hx - 1, eb - 1, 4, 5); OB(body, out, hx + 4, eb - 1, 4, 5); R(L.earIn, hx, eb + 1, 2, 2); R(L.earIn, hx + 5, eb + 1, 2, 2); }
  else if (dog && L.ear === 'floppy') { OB(L.earC, out, hx, hy + 1, 3, 6); R(L.earC, hx + 4, hy - 1, 3, 2); R(out, hx + 4, hy - 2, 3, 1); R(L.earC, hx + 4, hy - 1, 3, 1); }
  else { OB(L.point || body, out, hx, eb, 3, 4); OB(L.point || body, out, hx + 4, eb, 3, 4); R(L.earIn, hx + 1, eb + 1, 1, 2); R(L.earIn, hx + 5, eb + 1, 1, 2); if (L.patchA) R(L.patchA, hx, eb, 3, 2); }
  // 項圈與帽子
  if (o.collar) petCollarArt(o.collar, X(hx + 1, 4), py + hy + 6, 4);
  if (o.hat) petHatArt(o.hat, X(hx + 3, 1), py + hy + 1);
}

/* ================= 風格 B：Q 版大頭 ================= */
function petB(L, px, py, o) {
  o = o || {};
  const pose = o.pose || 'front', now = o.now || 0, dir = o.dir === -1 ? -1 : 1;
  const dog = L.sp === 'dog', body = L.body, out = L.out, light = L.light || body;
  const wag = Math.floor(now / 380) % 2, blink = Math.floor(now / 1700) % 6 === 0;
  const X = (x, w) => px + (dir > 0 ? x : 16 - x - w);
  const R = (c, x, y, w, h) => r(c, X(x, w), py + y, w, h);
  const OB = (c, out_, x, y, w, h) => ob(c, out_, X(x, w), py + y, w, h);
  r('rgba(90,60,40,.18)', px + 2, py + 14, 12, 2);
  const earsFront = (ty) => {
    if (dog && L.ear === 'point') { OB(body, out, 1, ty - 3, 4, 5); OB(body, out, 11, ty - 3, 4, 5); R(L.earIn, 2, ty - 1, 2, 2); R(L.earIn, 12, ty - 1, 2, 2); if (L.k === 'shiba_black') { R(out, 2, ty - 1, 2, 2); R(out, 12, ty - 1, 2, 2); } }
    else if (dog && L.ear === 'big') { OB(body, out, 0, ty - 4, 5, 7); OB(body, out, 11, ty - 4, 5, 7); R(L.earIn, 1, ty - 2, 3, 4); R(L.earIn, 12, ty - 2, 3, 4); }
    else if (dog && L.ear === 'floppy') { OB(L.earC, out, 0, ty, 3, 8); OB(L.earC, out, 13, ty, 3, 8); }
    else { OB(L.point || body, out, 1, ty - 3, 4, 5); OB(L.point || body, out, 11, ty - 3, 4, 5); R(L.earIn, 2, ty - 1, 2, 2); R(L.earIn, 12, ty - 1, 2, 2); if (L.patchA) { R(L.patchA, 2, ty - 2, 2, 2); R(L.patchB, 12, ty - 2, 2, 2); } }
  };
  if (pose === 'sleep') {
    const br = Math.floor(now / 900) % 2;
    OB(body, out, 1, 8 + br, 14, 7 - br);
    if (L.patchA) { R(L.patchA, 2, 9 + br, 4, 3); R(L.patchB, 10, 9 + br, 4, 3); }
    if (L.stripe) { R(L.stripe, 7, 9 + br, 1, 2); R(L.stripe, 9, 9 + br, 1, 2); R(L.stripe, 5, 9 + br, 1, 2); }
    if (L.point) { R(L.point, 4, 10 + br, 8, 4); }
    if (L.ear === 'floppy') { OB(L.earC, out, 0, 8 + br, 3, 5); OB(L.earC, out, 13, 8 + br, 3, 5); }
    else { OB(L.point || body, out, 2, 5 + br, 4, 4); OB(L.point || body, out, 10, 5 + br, 4, 4); R(L.earIn, 3, 6 + br, 2, 2); R(L.earIn, 11, 6 + br, 2, 2); }
    if (dog) { R(light, 5, 11 + br, 6, 2); }
    R(NOSE, 4, 11 + br, 2, 1); R(NOSE, 10, 11 + br, 2, 1);                       // 閉眼
    R(NOSE, 7, 11 + br, 2, 1); R(PINK, 3, 12 + br, 2, 1); R(PINK, 11, 12 + br, 2, 1);
    R(dog ? body : body, 12, 12 + br, 3, 2); R(out, 12, 14, 3, 1);
    return;
  }
  const side = pose === 'side';
  /* 身體（小小一隻） */
  if (!side) {
    OB(body, out, 5, 10, 6, 5); R(light, 7, 11, 2, 3);
    if (L.patchA) R(L.patchA, 5, 11, 2, 3);
    if (L.point) { R(L.point, 5, 14, 2, 1); R(L.point, 9, 14, 2, 1); } else { R(light, 5, 14, 2, 1); R(light, 9, 14, 2, 1); }
    // 尾巴從右邊探出來
    if (dog) { if (L.tail === 'nub') R(body, 11, 12, 1, 1); else { R(out, 11, 10 + wag, 3, 1); R(body, 11, 11 + wag, 3, 1); R(light, 13, 10 + wag, 1, 1); } }
    else { R(out, 11, 9, 1, 4); R(L.point || body, 12, 9, 1, 4); R(L.point || L.stripe || L.patchA || light, 12, 8, 1, 2); R(out, 12, 8, 1, 1); }
    earsFront(5);
    OB(body, out, 1, 4, 14, 9);                                                       // 大頭
    if (L.patchA) { R(L.patchB, 2, 5, 4, 3); R(L.patchA, 9, 5, 4, 3); R(L.patchA, 7, 4, 2, 1); }
    if (L.point) { R(L.point, 5, 7, 6, 5); R(L.point, 7, 5, 2, 2); }
    if (L.stripe) { R(L.stripe, 6, 5, 1, 2); R(L.stripe, 8, 5, 1, 2); R(L.stripe, 10, 5, 1, 1); R(L.stripe, 5, 5, 1, 1); }
    if (L.k === 'corgi') { R(light, 7, 5, 2, 3); }
    if (dog) {
      rr(light, X(5, 6), py + 8, 6, 4); R(NOSE, 7, 8, 2, 1); R(NOSE, 7, 9, 1, 1); R(NOSE, 8, 9, 1, 1); R(NOSE, 6, 10, 1, 1); R(NOSE, 9, 10, 1, 1);
      if (o.happy) R('#ff8fa8', 7, 10, 2, 2);
      if (L.k === 'shiba_black') { R(L.acc, 4, 5, 2, 1); R(L.acc, 10, 5, 2, 1); }
      if (L.k === 'shiba_red') { R(L.acc, 4, 5, 2, 1); R(L.acc, 10, 5, 2, 1); }
      if (L.k === 'golden') { R(light, 5, 5, 6, 1); }
    } else {
      R(L.point ? L.point : light, 6, 9, 4, 2); R('#ff9ab0', 7, 9, 2, 1);
      R(out, 6, 10, 1, 1); R(out, 9, 10, 1, 1); R(out, 7, 11, 2, 1);
      R(L.point ? '#4a3a32' : 'rgba(120,100,90,.55)', 0, 9, 2, 1); R(L.point ? '#4a3a32' : 'rgba(120,100,90,.55)', 14, 9, 2, 1);   // 鬍鬚
    }
    if (blink) { R(NOSE, 4, 8, 2, 1); R(NOSE, 10, 8, 2, 1); }
    else if (dog || !L.pupil) { R(NOSE, 4, 7, 2, 3); R(NOSE, 10, 7, 2, 3); R('#ffffff', 4, 7, 1, 1); R('#ffffff', 10, 7, 1, 1); }
    else { R(L.eye, 4, 7, 2, 3); R(L.eye, 10, 7, 2, 3); R(NOSE, 5, 7, 1, 3); R(NOSE, 10, 7, 1, 3); R('#ffffff', 4, 7, 1, 1); R('#ffffff', 11, 7, 1, 1); }
    R(PINK, 3, 10, 2, 1); R(PINK, 11, 10, 2, 1);
    if (o.collar) petCollarArt(o.collar, X(5, 6), py + 12, 6);
    if (o.hat) petHatArt(o.hat, X(8, 1), py + 4 - (dog && L.ear !== 'floppy' ? 0 : 0));
  } else {
    // 側面（面向右）：大頭在前，小身體在後
    r('rgba(0,0,0,0)', 0, 0, 0, 0);
    if (dog) { OB(body, out, 0, 10, 8, 5); R(light, 5, 13, 3, 1); if (L.tail === 'nub') R(body, 0, 10, 1, 1); else { R(out, 0, 8 + wag, 1, 3); R(body, 1, 8 + wag, 1, 3); } }
    else { OB(body, out, 0, 10, 8, 5); if (L.stripe) { R(L.stripe, 2, 11, 1, 2); R(L.stripe, 4, 11, 1, 2); } if (L.patchA) { R(L.patchA, 1, 11, 3, 3); R(L.patchB, 5, 11, 2, 2); } R(out, 0, 5 + wag, 1, 6); R(L.point || body, 1, 5 + wag, 1, 6); R(L.point || L.stripe || L.patchA || light, 1, 4 + wag, 1, 2); }
    R(L.point || light, 3, 14, 2, 1); R(L.point || light, 7, 14, 2, 1);
    OB(body, out, 3, 3, 12, 9);
    if (L.point) { R(L.point, 9, 6, 5, 5); }
    if (L.patchA) { R(L.patchB, 4, 4, 4, 3); R(L.patchA, 10, 4, 3, 2); }
    if (L.stripe) { R(L.stripe, 8, 4, 1, 2); R(L.stripe, 10, 4, 1, 2); }
    // 耳朵
    if (dog && L.ear === 'floppy') { OB(L.earC, out, 4, 4, 4, 7); }
    else if (dog && L.ear === 'big') { OB(body, out, 4, 0, 5, 6); OB(body, out, 10, 0, 4, 6); R(L.earIn, 5, 1, 3, 4); }
    else { OB(L.point || body, out, 4, 0, 4, 5); OB(L.point || body, out, 10, 0, 4, 5); R(L.earIn, 5, 2, 2, 2); R(L.earIn, 11, 2, 2, 2); if (L.k === 'shiba_black') { R(out, 5, 2, 2, 2); R(out, 11, 2, 2, 2); } }
    if (dog) { OB(light, out, 11, 7, 5, 4); R(NOSE, 14, 7, 2, 2); R(NOSE, 12, 10, 3, 1); if (o.happy) R('#ff8fa8', 12, 10, 2, 1); }
    else { R(L.point ? L.point : light, 12, 8, 3, 3); R('#ff9ab0', 14, 8, 1, 1); R(out, 13, 10, 1, 1); R(L.point ? '#4a3a32' : 'rgba(120,100,90,.55)', 14, 9, 2, 1); }
    if (blink) R(NOSE, 9, 8, 2, 1);
    else if (dog || !L.pupil) { R(NOSE, 9, 6, 2, 3); R('#ffffff', 9, 6, 1, 1); }
    else { R(L.eye, 9, 6, 2, 3); R(NOSE, 10, 6, 1, 3); R('#ffffff', 9, 6, 1, 1); }
    R(PINK, 8, 9, 2, 1);
    if (o.collar) petCollarArt(o.collar, X(9, 5), py + 12, 5);
    if (o.hat) petHatArt(o.hat, X(8, 1), py + 3);
  }
}
/* 領養店（候選稿）：外觀三款（80×48＝5×3 格）、工地、店員四款（16×16）。畫法沿用遊戲的 r／rr／ob。 */
   // 紅圈位置：小村右下、造型店右邊那片空草地

/* 小圖示 */
function pawArt(x, y, c, s) {   // 肉球：s=1 小（7×6）、s=2 大
  if (s === 2) { rr(c, x + 3, y + 5, 6, 5); r(c, x, y + 3, 3, 3); r(c, x + 3, y, 3, 4); r(c, x + 6, y, 3, 4); r(c, x + 9, y + 3, 3, 3); }
  else { rr(c, x + 2, y + 3, 4, 3); r(c, x, y + 2, 2, 2); r(c, x + 2, y, 2, 2); r(c, x + 4, y, 2, 2); r(c, x + 6, y + 2, 2, 2); }
}
function boneArt(x, y, c, o) { r(o, x + 1, y + 1, 10, 3); r(c, x + 1, y + 2, 10, 1); r(o, x, y, 3, 3); r(o, x, y + 2, 3, 3); r(o, x + 9, y, 3, 3); r(o, x + 9, y + 2, 3, 3); r(c, x + 1, y + 1, 1, 1); r(c, x + 1, y + 3, 1, 1); r(c, x + 10, y + 1, 1, 1); r(c, x + 10, y + 3, 1, 1); }
function stepRows(cx, y0, rows, w0, dw, col, out) {   // 往下逐列變寬的三角形（屋頂、貓耳用），外框一格
  for (let i = 0; i < rows; i++) {
    const w = w0 + dw * i, x = cx - (w >> 1);
    r(out, x, y0 + i, w, 1);
    if (i > 0 && w > 2) r(col, x + 1, y0 + i, w - 2, 1);
  }
  const wl = w0 + dw * (rows - 1); r(out, cx - (wl >> 1), y0 + rows - 1, wl, 1);
}
function peek(L, x, y, now) { petB(L, x, y, { pose: 'front', now: now || 1000 }); }   // 窗裡探頭的小寵物

/* ============ 外觀 A：藍色小屋（藍屋頂、肉球招牌、兩扇櫥窗裡有狗貓探頭）============ */
function petShopA(ox, oy, now, lit) {
  const dx = ox + 40;
  r('rgba(107,72,72,.16)', ox + 2, oy + 46, 76, 3);
  ob('#fff6e4', '#d9b88a', ox + 2, oy + 20, 76, 28);
  for (let y = 25; y < 46; y += 5) r('#f6e8cc', ox + 4, oy + y, 72, 1);
  ob('#7ec8ea', '#4a93bd', ox + 8, oy - 2, 64, 10);
  ob('#7ec8ea', '#4a93bd', ox, oy + 5, 80, 17);
  for (let x = 0; x < 80; x += 8) { rr('#4a93bd', ox + x, oy + 19, 8, 5); rr('#7ec8ea', ox + x + 1, oy + 19, 6, 4); }
  for (let y = 9; y < 18; y += 5) for (let x = (y % 2) * 4 + 4; x < 76; x += 8) r('#cdeefb', ox + x, oy + y, 2, 2);
  ob('#fffaf0', '#c9a37a', dx - 13, oy + 7, 26, 13);                                   // 招牌
  pawArt(dx - 6, oy + 9, '#e0786a', 2);
  r('#e0786a', dx - 10, oy + 14, 2, 1); r('#e0786a', dx + 8, oy + 14, 2, 1);
  [[ox + 5, 'shiba_red'], [ox + 53, 'cat_orange']].forEach(([wx, k], i) => {
    ob('#ffffff', '#a8764a', wx, oy + 23, 22, 21); r(lit ? '#fff3b0' : '#ffeebb', wx + 2, oy + 25, 18, 16);
    r(i ? '#ffd1dc' : '#bfe6ff', wx + 2, oy + 25, 18, 5);
    peek(petOf(k), wx + 3, oy + 25, now);
    rr('#c08a62', wx - 1, oy + 41, 24, 4);
    r('#ff8fa8', wx + 1, oy + 40, 2, 2); r('#ffc857', wx + 6, oy + 40, 2, 2); r('#ff8fa8', wx + 12, oy + 40, 2, 2); r('#ffc857', wx + 17, oy + 40, 2, 2);
  });
  ob('#c08a62', '#8c5b3c', dx - 6, oy + 32, 12, 16); r('#d9a378', dx - 4, oy + 34, 8, 14); r('#ffd34d', dx + 2, oy + 41, 2, 2);
  ob('#fffaf0', '#8c5b3c', dx - 3, oy + 35, 6, 5); pawArt(dx - 3, oy + 36, '#e0786a', 1);
  r('#ff8fa8', dx - 9, oy + 46, 3, 2); r('#ffd34d', dx + 6, oy + 46, 3, 2);
}
/* ============ 工地（蓋好之前顯示；stage 0 剛動工、1 立起木架、2 快完工）============ */
function petSite(ox, oy, now, stage) {
  const dx = ox + 40;
  r('rgba(107,72,72,.16)', ox + 2, oy + 46, 76, 3);
  ob('#e0c08a', '#a8764a', ox + 3, oy + 28, 74, 20);
  for (let i = 0; i < 9; i++) r('#c9a06a', ox + 8 + (i * 17) % 62, oy + 31 + (i * 7) % 12, 3, 1);
  const wood = '#c08a58', woodD = '#8c5b3c';
  if (stage >= 1) {
    [ox + 8, ox + 38, ox + 68].forEach(x => { r(woodD, x, oy + 14, 4, 33); r(wood, x, oy + 14, 3, 33); });
    r(woodD, ox + 8, oy + 14, 64, 4); r(wood, ox + 8, oy + 14, 64, 3);
    r(woodD, ox + 8, oy + 30, 64, 3); r(wood, ox + 8, oy + 30, 64, 2);
  }
  if (stage >= 2) {
    for (let i = 0; i <= 31; i++) { const y = oy + 14 - Math.round(i * 13 / 31); r(woodD, ox + 9 + i, y, 3, 3); r(wood, ox + 9 + i, y, 3, 2); r(woodD, ox + 70 - i, y, 3, 3); r(wood, ox + 70 - i, y, 3, 2); }
    r(woodD, dx - 1, oy, 3, 14); r(wood, dx - 1, oy, 2, 14);
    ob('#fff6e4', '#d9b88a', ox + 8, oy + 18, 24, 12); ob('#fff6e4', '#d9b88a', ox + 48, oy + 18, 24, 12);
    r('#ffe0b0', dx - 2, oy - 2, 5, 3);
  }
  // 木板堆（左）、石頭堆（右）、銅礦
  for (let i = 0; i < 4; i++) { ob('#e8b27a', '#9b6a44', ox + 6, oy + 38 + i * 2 - 2, 20, 4); r('#c98f62', ox + 8 + i * 3, oy + 38 + i * 2 - 1, 1, 2); }
  ob('#c9c3b8', '#8d877c', ox + 54, oy + 38, 8, 7); ob('#d9d3c8', '#8d877c', ox + 62, oy + 40, 9, 6); ob('#b8b2a6', '#8d877c', ox + 58, oy + 34, 8, 6);
  ob('#e89a62', '#a8561e', ox + 70, oy + 42, 6, 5); r('#ffd0a0', ox + 71, oy + 43, 1, 1);
  // 告示牌
  r('#9b6a44', dx - 8, oy + 40, 2, 7); r('#9b6a44', dx + 6, oy + 40, 2, 7);
  ob('#fff3b0', '#b8892a', dx - 13, oy + 31, 26, 12);
  r('#8c5b3c', dx - 10, oy + 36, 7, 2); r('#7a8590', dx - 7, oy + 33, 5, 3); r('#8c5b3c', dx - 5, oy + 33, 1, 7);   // 槌子
  r('#c08a58', dx + 1, oy + 33, 4, 2); r('#c9c3b8', dx + 6, oy + 33, 4, 2); r('#e89a62', dx + 11, oy + 33, 2, 2);
  r('#d9b88a', dx + 1, oy + 38, 12, 3); r('#7fcf8a', dx + 1, oy + 38, 3 + stage * 3, 3);                           // 進度條
  // 警示三角錐
  [[ox + 2, oy + 40], [ox + 74, oy + 36]].forEach(([x, y]) => { r('#ff8a3a', x + 1, y, 3, 1); r('#ff8a3a', x, y + 1, 5, 2); r('#ffffff', x + 1, y + 1, 3, 1); r('#ff8a3a', x - 1, y + 3, 7, 1); r('#7a4a2a', x - 1, y + 4, 7, 1); });
}

/* ============ 店員（16×16；和 npcArt 同一種畫法）============ */
const CLERKS = [
  { k: 'cl_a', n: '阿喵姊姊', d: '戴貓耳髮箍、圍著圍裙的人類店員（親切、最接近現有村民）' },
  { k: 'cl_b', n: '阿牧哥', d: '戴綠色鴨舌帽的寵物管理員，肩上掛著牽繩' },
  { k: 'cl_c', n: '小橘店長', d: '穿圍裙的橘貓店長（和柴犬船長同一類「動物 NPC」）' },
  { k: 'cl_d', n: '棉棉', d: '粉紅圍裙的白兔店員，領養處的助手' }
];
function clerkArt(key, px, py, now) {
  const bob = Math.floor(now / 600) % 2, wag = Math.floor(now / 450) % 2, o = 'rgba(90,60,40,.55)';
  r('rgba(90,60,40,.18)', px + 3, py + 14, 10, 2);
  if (key === 'cl_a') {   // 大眼睛雙馬尾貓耳：會眨眼、馬尾左右甩
    const bl = (now % 3800) > 3650, R = (c, x, y, w, h) => r(c, px + x, py + y, w, h), OB = (c, oc, x, y, w, h) => ob(c, oc, px + x, py + y, w, h);
    OB('#8fd3c0', o, 4, 9 + bob, 8, 6); OB('#fffaf0', '#f0dcc4', 5, 10 + bob, 6, 5); R('#ff9bb3', 7, 12 + bob, 2, 2); R('#ff9bb3', 6, 11 + bob, 1, 1); R('#ff9bb3', 9, 11 + bob, 1, 1);
    R('#7a4a3a', 1 + wag, 7 + bob, 2, 4); R('#7a4a3a', 13 - wag, 7 + bob, 2, 4); R('#ff8fa8', 1 + wag, 6 + bob, 2, 1); R('#ff8fa8', 13 - wag, 6 + bob, 2, 1);
    OB('#ffe3cc', o, 3, 2 + bob, 10, 8); R('#7a4a3a', 3, 2 + bob, 10, 2); R('#7a4a3a', 3, 2 + bob, 1, 6); R('#7a4a3a', 12, 2 + bob, 1, 6); R('#7a4a3a', 6, 4 + bob, 4, 1);
    OB('#ff8fa8', '#d4688a', 3, -1 + bob, 3, 4); OB('#ff8fa8', '#d4688a', 10, -1 + bob, 3, 4); R('#ffffff', 4, bob, 1, 2); R('#ffffff', 11, bob, 1, 2);
    if (bl) { R('#3a2a3a', 5, 6 + bob, 2, 1); R('#3a2a3a', 9, 6 + bob, 2, 1); }
    else { R('#3a2a3a', 5, 5 + bob, 2, 3); R('#3a2a3a', 9, 5 + bob, 2, 3); R('#ffffff', 5, 5 + bob, 1, 1); R('#ffffff', 9, 5 + bob, 1, 1); R('#8a6a8a', 6, 7 + bob, 1, 1); R('#8a6a8a', 10, 7 + bob, 1, 1); }
    R('#ff9ab0', 4, 8 + bob, 1, 1); R('#ff9ab0', 11, 8 + bob, 1, 1); R('#e0607a', 7, 8 + bob, 2, 1);
  } else if (key === 'cl_b') {
    ob('#c9955f', o, px + 4, py + 9 + bob, 8, 6);
    r('#fffaf0', px + 6, py + 10 + bob, 4, 5); r('#8c5b3c', px + 6, py + 10 + bob, 4, 1);
    ob('#ffe0c4', o, px + 4, py + 3 + bob, 8, 7);
    r('#5a3a2a', px + 4, py + 4 + bob, 8, 1); r('#5a3a2a', px + 4, py + 4 + bob, 1, 4); r('#5a3a2a', px + 11, py + 4 + bob, 1, 4);
    r('#4a3a3a', px + 6, py + 7 + bob, 1, 1); r('#4a3a3a', px + 9, py + 7 + bob, 1, 1); r('#e8947a', px + 7, py + 9 + bob, 2, 1);
    r('#e8947a', px + 5, py + 8 + bob, 1, 1); r('#e8947a', px + 10, py + 8 + bob, 1, 1);
    ob('#7fc48a', '#4f9a62', px + 4, py + bob, 8, 4); r('#4f9a62', px + 4, py + 3 + bob, 9, 1); r('#4f9a62', px + 12, py + 4 + bob, 2, 1); r('#fffaf0', px + 7, py + 1 + bob, 2, 2);
    r('#d9667f', px + 12, py + 9 + bob, 1, 5); r('#d9667f', px + 13, py + 12 + bob, 1, 2); r('#ffd34d', px + 12, py + 14 + bob, 2, 1);   // 牽繩
  } else if (key === 'cl_c') {
    const oc = '#a8641e';
    ob('#f0a04a', oc, px + 12, py + 9 + wag, 3, 3); r('#fff0d0', px + 13, py + 9 + wag, 1, 1);
    ob('#fffaf0', '#d9b88a', px + 4, py + 9 + bob, 8, 6); r('#ff9bb3', px + 4, py + 9 + bob, 8, 1); r('#e0486a', px + 7, py + 11 + bob, 2, 2); r('#ff8fa8', px + 7, py + 10 + bob, 2, 1);
    r('#f0a04a', px + 3, py + 14, 2, 1); r('#f0a04a', px + 11, py + 14, 2, 1);
    r('#f0a04a', px + 3, py + 1 + bob, 3, 3); r('#f0a04a', px + 10, py + 1 + bob, 3, 3); r('#ffb3c9', px + 4, py + 2 + bob, 1, 2); r('#ffb3c9', px + 11, py + 2 + bob, 1, 2);
    ob('#f0a04a', oc, px + 3, py + 3 + bob, 10, 7);
    r('#e0852a', px + 7, py + 3 + bob, 1, 2); r('#e0852a', px + 5, py + 4 + bob, 1, 1); r('#e0852a', px + 10, py + 4 + bob, 1, 1);
    r('#fff0d0', px + 5, py + 7 + bob, 6, 3);
    r('#3a2a2a', px + 5, py + 5 + bob, 1, 2); r('#3a2a2a', px + 10, py + 5 + bob, 1, 2); r('#ff8fa8', px + 7, py + 7 + bob, 2, 1); r('#3a2a2a', px + 7, py + 8 + bob, 1, 1); r('#3a2a2a', px + 8, py + 8 + bob, 1, 1);
    r('#ffffff', px + 1, py + 7 + bob, 2, 0); r('#c9a37a', px + 1, py + 7 + bob, 2, 1); r('#c9a37a', px + 13, py + 7 + bob, 2, 1);   // 鬍鬚
    ob('#ffd34d', '#b8892a', px + 9, py + 10 + bob, 3, 2);                                // 名牌
  } else {   // cl_d 白兔
    ob('#ff9bb3', o, px + 4, py + 9 + bob, 8, 6); r('#fffaf0', px + 5, py + 10 + bob, 6, 5); r('#ff9bb3', px + 5, py + 10 + bob, 6, 1); r('#ffd1dc', px + 7, py + 12 + bob, 2, 2);
    r('#fffaf0', px + 3, py + 14, 2, 1); r('#fffaf0', px + 11, py + 14, 2, 1);
    ob('#fffaf0', '#b9b0a4', px + 4, py - 2 + bob, 3, 6); ob('#fffaf0', '#b9b0a4', px + 9, py - 2 + bob + 1, 3, 6); r('#ffb3c9', px + 5, py + bob, 1, 3); r('#ffb3c9', px + 10, py + 1 + bob, 1, 3);
    ob('#fffaf0', '#b9b0a4', px + 3, py + 3 + bob, 10, 7);
    r('#4a3a3a', px + 5, py + 6 + bob, 1, 2); r('#4a3a3a', px + 10, py + 6 + bob, 1, 2); r('#ffffff', px + 5, py + 6 + bob, 1, 1); r('#ffffff', px + 10, py + 6 + bob, 1, 1);
    r('#ff8fa8', px + 7, py + 8 + bob, 2, 1); r('#4a3a3a', px + 7, py + 9 + bob, 1, 1); r('#4a3a3a', px + 8, py + 9 + bob, 1, 1);
    r('#ffb3b3', px + 4, py + 8 + bob, 2, 1); r('#ffb3b3', px + 10, py + 8 + bob, 2, 1);
    r('#e0486a', px + 6, py + 3 + bob, 4, 1); r('#e0486a', px + 5, py + 2 + bob, 2, 2); r('#e0486a', px + 9, py + 2 + bob, 2, 2);   // 蝴蝶結
  }
}

/* ============ 店內（10×8 格＝160×128）：櫃檯在 (3~5,4)，店員站 (4,3)，門在 (4~5,7)；四隻候選寵物在左右兩個角落 ============ */
const ROOM_T = 16;
const ROOM_CAND = {   // 每個版本今天的 4 隻候選（狗 2＋貓 2，對應 shelter_slots）
  wood:   ['shiba_red', 'corgi', 'cat_orange', 'calico'],
  sky:    ['golden', 'shiba_black', 'siamese', 'cat_white'],
  forest: ['shiba_white', 'corgi', 'cat_black', 'cat_tabby']
};
function roomPet(sty, k, tx, ty, pose, dir, now, dy) {
  const L = petOf(k), x = tx * ROOM_T, y = ty * ROOM_T + (dy || 0);
  if (sty === 'B') petB(L, x, y, { pose: pose === 'sit' ? 'front' : pose, now });
  else petA(L, x, y, { pose, dir, now });
}
function bedArt(px, py, col, out) { ob(col, out, px + 1, py + 8, 14, 7); r(shade(col, 1.12), px + 3, py + 9, 10, 1); }
function basketArt(px, py) { ob('#d9a95c', '#8c5b3c', px + 1, py + 7, 14, 8); for (let x = 3; x < 14; x += 3) r('#b88a3c', px + x, py + 9, 1, 5); r('#b88a3c', px + 1, py + 11, 14, 1); }
function shelfPlank(x, y, w, col, out) { r(out, x, y, w, 3); r(col, x, y, w, 2); r('rgba(90,60,40,.15)', x, y + 3, w, 2); }
function foodBag(x, y, c, o) { ob(c, o, x, y, 9, 11); r('#ffffff', x + 2, y + 2, 5, 3); pawArt(x + 1, y + 6, o, 0); r(c, x + 1, y + 6, 7, 3); r(o, x + 3, y + 7, 3, 2); r('#ffffff', x + 3, y + 7, 1, 1); }
function canArt(x, y, c) { ob(c, '#7a8590', x, y, 6, 6); r('#ffffff', x + 1, y + 2, 4, 2); r('#7a8590', x + 1, y, 4, 1); }
function ballArt(x, y, c) { ob(c, shade(c, 0.75), x, y, 6, 6); r('#ffffff', x + 1, y + 1, 1, 1); r(shade(c, 0.75), x + 1, y + 3, 4, 1); }
function leashArt(x, y, c, len) { r('#8c5b3c', x, y, 3, 1); r(c, x + 1, y + 1, 1, len); r('#c9c3b8', x, y + len, 3, 2); }
function petRoom(theme, now, clerkKey, sty) {
  const T = ROOM_T, cand = ROOM_CAND[theme];
  const TH = {
    wood:   { wall: '#ffeccc', wallD: '#d9a56c', fa: '#e8c79a', fb: '#dfb98a', ctop: '#e8b27a', cside: '#9b6a44' },
    sky:    { wall: '#dff3fc', wallD: '#9fcfe8', fa: '#f6fcff', fb: '#dcecf6', ctop: '#ffffff', cside: '#9fb8c8' },
    forest: { wall: '#d6efcf', wallD: '#7fb888', fa: '#d3a974', fb: '#c79c68', ctop: '#c98f62', cside: '#8c5b3c' }
  }[theme];
  styleRoomBase(TH.wall, TH.wallD, TH.fa, TH.fb);
  const bob = Math.floor(now / 600) % 2;
  /* ---- 後牆 ---- */
  if (theme === 'wood') {
    for (let x = 0; x < 160; x += 16) r('#f6dcae', x + 7, 0, 1, 44);
    r('#c9a070', 0, 30, 160, 16); for (let x = 0; x < 160; x += 8) r('#b88a58', x, 30, 1, 14); r('#e8c79a', 0, 30, 160, 2);        // 木頭護牆板
    shelfPlank(8, 24, 56, '#c08a58', '#8c5b3c'); shelfPlank(96, 24, 56, '#c08a58', '#8c5b3c'); shelfPlank(8, 40, 56, '#c08a58', '#8c5b3c'); shelfPlank(96, 40, 56, '#c08a58', '#8c5b3c');
    foodBag(12, 12, '#e0786a', '#9b3f3a'); foodBag(23, 12, '#6fa8e0', '#3f6fae'); foodBag(34, 12, '#7fcf8a', '#3f8a5a'); canArt(47, 18, '#ffd34d'); canArt(54, 18, '#ff9bb3');
    ballArt(12, 34, '#ff8a6a'); boneArt(22, 35, '#ffffff', '#c9a37a'); canArt(40, 34, '#6fa8e0'); canArt(47, 34, '#7fcf8a'); canArt(54, 34, '#ffd34d');
    [100, 108, 116].forEach((x, i) => leashArt(x, 12, ['#e0486a', '#4f86d6', '#7fcf8a'][i], 9)); ballArt(128, 18, '#b79bf0'); boneArt(138, 19, '#ffe9a8', '#c9a37a');
    ob('#fffaf0', '#c9a37a', 100, 32, 50, 7); for (let i = 0; i < 4; i++) { r(['#ff9bb3', '#9fd9c0', '#ffd34d', '#b79bf0'][i], 103 + i * 12, 34, 8, 3); }
    ob('#fff6dc', '#9b6a44', 70, 6, 20, 20); pawArt(75, 11, '#e0786a', 2); r('#e0786a', 72, 21, 16, 1);
  } else if (theme === 'sky') {
    [[10, 6, 22], [22, 10, 14], [92, 4, 20], [104, 9, 26], [130, 5, 18]].forEach(([x, y, w]) => { rr('#ffffff', x, y, w, 6); rr('#ffffff', x + 4, y - 3, w - 8, 5); });
    [[60, 8], [84, 14], [146, 20], [40, 30]].forEach(([x, y]) => { r('#ffe9a8', x, y, 1, 3); r('#ffe9a8', x - 1, y + 1, 3, 1); });
    r('#bfe3f4', 0, 30, 160, 16); for (let x = 0; x < 160; x += 16) r('#9fcfe8', x, 30, 1, 16); r('#ffffff', 0, 30, 160, 2);
    ob('#e8c79a', '#8c5b3c', 6, 6, 56, 34); r('#f6dcae', 8, 8, 52, 30);                                                              // 領養布告板
    [[11, 11, '#ffd1dc'], [26, 11, '#cfe8f7'], [41, 11, '#ffe9a8'], [18, 24, '#d7f0d0'], [34, 24, '#e6d6fb']].forEach(([x, y, c]) => { ob('#fffaf0', '#c9a37a', x, y, 13, 12); r(c, x + 2, y + 2, 9, 7); pawArt(x + 3, y + 3, '#ffffff', 0); r('#e0486a', x + 6, y - 1, 1, 2); });
    ob('#bfe6ff', '#6a9ac4', 100, 8, 44, 28); r('#8fd0f0', 102, 20, 40, 14); r('#f6dcae', 102, 31, 40, 3);                                  // 魚缸
    [[108, 22, '#ff9a4a'], [124, 26, '#ffd34d'], [132, 18, '#ff6b8a']].forEach(([x, y, c], i) => { r(c, x, y, 4, 2); r(c, x + (i % 2 ? -1 : 4), y, 1, 2); r('#3a2a2a', x + (i % 2 ? 0 : 3), y, 1, 1); });
    r('#5fbf6a', 106, 26, 2, 7); r('#5fbf6a', 138, 25, 2, 8); r('#ffffff', 113, 12, 1, 1); r('#ffffff', 115, 15, 1, 1);
    shelfPlank(100, 40, 44, '#ffffff', '#9fb8c8'); ballArt(104, 34, '#ff8a6a'); canArt(116, 34, '#6fa8e0'); canArt(124, 34, '#ffd34d'); boneArt(131, 35, '#ffffff', '#9fb8c8');
    ob('#fffaf0', '#9fb8c8', 70, 6, 20, 20); pawArt(75, 11, '#6fa8e0', 2);
  } else {
    for (let y = 4; y < 44; y += 9) for (let x = (y % 2) * 8 + 4; x < 156; x += 16) { r('#bfe3b8', x, y, 3, 2); r('#a8d4a0', x + 1, y + 1, 2, 2); }
    r('#b88a58', 0, 30, 160, 16); for (let x = 0; x < 160; x += 6) r('#a8764a', x, 30, 1, 14); r('#d9b27c', 0, 30, 160, 2);
    ob('#bfe6ff', '#8c5b3c', 10, 6, 28, 22); r('#8c5b3c', 23, 6, 2, 22); r('#8c5b3c', 10, 16, 28, 2); r('#9fe0b0', 12, 20, 11, 6); r('#5fbf6a', 14, 14, 6, 6);        // 窗
    for (let i = 0; i < 4; i++) { r('#5fbf6a', 46 + i * 4, 4, 1, 8 + (i % 2) * 4); r('#7fd08a', 45 + i * 4, 10 + (i % 2) * 4, 3, 2); }          // 垂吊植物
    r('#8c5b3c', 44, 2, 18, 2); ob('#c08a62', '#8c5b3c', 48, 0, 10, 2);
    [100, 112, 124, 136].forEach((x, i) => { r('#8c5b3c', x, 10, 5, 1); r(['#e0486a', '#4f86d6', '#7fcf8a', '#ffd34d'][i], x + 2, 11, 1, 6); r('#c9c3b8', x + 1, 17, 3, 2); });   // 牽繩掛架
    r('#8c5b3c', 96, 8, 48, 3);
    ob('#fff6dc', '#8c5b3c', 68, 6, 24, 18); pawArt(74, 10, '#4f9a62', 2); r('#4f9a62', 72, 20, 16, 1);
  }
  /* ---- 櫃檯 ---- */
  styleCounter(TH.ctop, TH.cside, () => {
    ob('#ffe9a8', '#c9a37a', 3 * T + 3, 4 * T - 1, 6, 5); r('#c9a37a', 3 * T + 4, 4 * T - 2, 4, 1); boneArt(3 * T + 3, 4 * T - 4, '#ffffff', '#c9a37a');   // 骨頭餅乾罐
    ob('#fffaf0', '#c9a37a', 4 * T + 8, 4 * T, 7, 3); r('#ffd34d', 5 * T + 3, 4 * T - 2, 3, 2); r('#b8892a', 5 * T + 4, 4 * T, 1, 1);               // 登記簿與鈴
    ob('#fffaf0', '#c9a37a', 5 * T + 7, 4 * T, 7, 4); pawArt(5 * T + 8, 4 * T + 0, '#e0786a', 0);
  });
  /* ---- 兩個角落：四隻候選 ---- */
  const pens = theme === 'sky';
  if (theme === 'forest') {
    // 狗：藤籃；貓：牆上的貓跳台木板
    basketArt(1 * T, 4 * T); basketArt(1 * T, 6 * T - 2); basketArt(2 * T + 2, 5 * T + 8);
    r('#8c5b3c', 0, 4 * T - 1, 3 * T, 2); r('#8c5b3c', 3 * T - 2, 4 * T - 1, 2, 3 * T);
    [[96, 26], [124, 26]].forEach(([x, y]) => { shelfPlank(x, y, 30, '#c08a58', '#8c5b3c'); });
    shelfPlank(110, 56, 36, '#c08a58', '#8c5b3c'); r('#8c5b3c', 126, 59, 3, 14); shelfPlank(110, 72, 36, '#c08a58', '#8c5b3c');
    roomPet(sty, cand[0], 1, 4, 'sit', 1, now, -1); roomPet(sty, cand[1], 1, 6, 'sleep', 1, now, -3);
    roomPet(sty, cand[2], 7, 1, 'sit', -1, now, 7 - 16 + 8); roomPet(sty, cand[3], 8, 3, 'sit', -1, now, 0);
    // 貓跳台
    r('#8c5b3c', 7 * T + 6, 4 * T - 8, 3, 3 * T); ob('#d9a95c', '#8c5b3c', 7 * T, 4 * T - 12, 16, 5); ob('#d9a95c', '#8c5b3c', 8 * T - 4, 5 * T + 4, 16, 5);
  } else {
    const bedCol = theme === 'wood' ? ['#ff9bb3', '#d4688a'] : ['#9fd0f0', '#4f86d6'];
    if (pens) { r('rgba(159,184,200,.0)', 0, 0, 0, 0); }
    bedArt(1 * T, 4 * T, bedCol[0], bedCol[1]); bedArt(1 * T, 6 * T - 2, shade(bedCol[0], 0.95), bedCol[1]);
    basketArt(8 * T, 4 * T); basketArt(8 * T, 6 * T - 2);
    roomPet(sty, cand[0], 1, 4, 'sit', 1, now, -1); roomPet(sty, cand[1], 1, 6, 'sleep', 1, now, -3);
    roomPet(sty, cand[2], 8, 4, 'sit', -1, now, -1); roomPet(sty, cand[3], 8, 6, 'sleep', -1, now, -3);
    if (theme === 'wood') { r('#c9984a', 7 * T + 6, 5 * T - 4, 4, 10); ob('#d9a95c', '#8c5b3c', 7 * T + 2, 5 * T + 4, 12, 4); r('#e0786a', 7 * T + 4, 5 * T - 6, 8, 3); }   // 貓抓柱
    if (pens) {
      const fence = (x, y, w, h) => { ob('#ffffff', '#9fb8c8', x, y, w, h); };
      for (let i = 0; i < 3; i++) { r('#ffffff', 3 * T - 3, 4 * T + i * 16, 2, 14); r('#9fb8c8', 3 * T - 3, 4 * T + i * 16, 1, 14); r('#ffffff', 7 * T + 1, 4 * T + i * 16, 2, 14); r('#9fb8c8', 7 * T + 1, 4 * T + i * 16, 1, 14); }
      fence(0 + T, 4 * T - 2, 2 * T, 2); fence(7 * T + 2, 4 * T - 2, 2 * T - 2, 2);
    }
  }
  /* ---- 門口地墊 ---- */
  ob('#ffb3c9', '#d4688a', 4 * T + 2, 6 * T + 3, 2 * T - 4, 12); pawArt(5 * T - 6, 6 * T + 5, '#ffffff', 1);
  styleDoor();
  clerkArt(clerkKey, 4 * T, 3 * T, now);
}

/* ---------- 接到遊戲裡 ---------- */
const PS = 80;   // 領養店的門（雷克斯小村 (27,14)，站在 (27,15) 面向上）
function drawPetBldg(b, now, lit) {
  if (petBuilt()) petShopA(b.x * T, b.y * T, now, lit); else petSite(b.x * T, b.y * T, now, 1);
}
function drawPetRoom(now) { petRoom('sky', now, 'cl_a', 'B'); }
