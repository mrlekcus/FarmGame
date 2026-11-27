'use strict';
/* 盲盒機家具互動 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html（要在 furniture-fx.js、art.js 之後）。
   迷你街機櫃＝玩一場小遊戲（螢幕動畫＋分數泡泡）　　霓虹招牌＝換燈色（粉藍／紫橘／彩虹／關燈）
   手把地毯＝節奏舞步　　機器人玩偶＝嗶嗶說話　　冰淇淋燈＝開關燈　　蛋糕桌＝切蛋糕（每天補回）
   棉花糖椅＝坐下（Q彈）　　糖果地毯＝踩出糖果星星　　投幣存錢筒＝只是互動（不碰金錢）
   盲盒沙發＝雙人座　　迷你夾娃娃機＝自己夾的小遊戲（沒有獎品，純好玩）
   狀態沿用 furniture-fx.js 的做法：只存在這台裝置、朋友在同一間屋子裡看得到（走屋子的即時頻道），不需要改資料庫。 */

const bbxNow = () => performance.now();
const bbxPlay = {}, bbxTalk = {}, bbxDance = {}, bbxPig = {}, bbxTalkTxt = {};   // 家具編號 → 動畫結束的時間
let bbxCandy = [];
const bbxCandyLast = {};
const BBX_KEYS = ['bb_minicab', 'bb_neonsign', 'bb_padrug', 'bb_robotdoll', 'bb_icelamp', 'bb_caketable', 'bb_marshchair', 'bb_candyrug', 'bb_piggy', 'bb_boxsofa', 'bb_miniclaw'];
const _bbx0 = {}; BBX_KEYS.forEach(k => { _bbx0[k] = FURN[k]; });
const bbxId = () => (FXIT && FXIT.id != null ? FXIT.id : null);
const bbxActive = (tbl, id) => id != null && tbl[id] && bbxNow() < tbl[id];
const bbxSnd = (a, v) => { try { if (typeof chime === 'function') chime(a, v || 0.08); } catch (e) { /* 略過 */ } };

/* ---------- 狀態：霓虹招牌的燈色、蛋糕今天被切了幾塊 ---------- */
const bbxNeonM = it => ((fxGet(it) || {}).m | 0) & 3;
const bbxCakeN = it => { const v = fxGet(it); return v && (v.d | 0) === fxDay() ? Math.min(4, v.n | 0) : 0; };
Object.assign(FX_SYNC, { bb_neonsign: 1, bb_icelamp: 1, bb_caketable: 1 });
const _bbxClean0 = fxClean;
fxClean = function (k, s) {
  if (k === 'bb_neonsign') { if (!s || typeof s !== 'object') return null; const m = s.m | 0; return m >= 0 && m <= 3 ? { m } : null; }
  if (k === 'bb_caketable') { if (!s || typeof s !== 'object') return null; const n = s.n | 0, d = s.d | 0; return n >= 0 && n <= 4 && d > 0 ? { d, n } : null; }
  return _bbxClean0(k, s);
};

/* ---------- 迷你街機櫃：螢幕跑打磚塊 ---------- */
FURN.bb_minicab = (px, py, now) => {
  _bbx0.bb_minicab(px, py, now);
  if (!bbxActive(bbxPlay, bbxId())) return;
  const t = bbxNow();
  r('#12182c', px + 3, py + 5, 10, 9);
  ['#ff5fb0', '#5ae0ff', '#ffd34d', '#8fe09a', '#c07ae8'].forEach((c, i) => { if ((Math.floor(t / 700) + i) % 4 !== 0) r(c, px + 4 + i * 2, py + 6, 2, 1); });
  const bx = Math.round(Math.abs(((t / 90) % 14) - 7)), by = Math.round(Math.abs(((t / 120) % 8) - 4));
  r('#ffffff', px + 4 + bx, py + 8 + by, 1, 1);
  r('#5ae0ff', px + 4 + Math.round(2.5 + Math.sin(t / 260) * 2.5), py + 13, 3, 1);
};

/* ---------- 霓虹招牌：四種燈色 ---------- */
FURN.bb_neonsign = (px, py, now) => {
  const m = FXIT ? bbxNeonM(FXIT) : 0;
  if (m === 0) { _bbx0.bb_neonsign(px, py, now); return; }
  const t = now || 0;
  ob('#12182c', '#0a0e1c', px + 1, py + 3, 14, 9);
  let c1, c2;
  if (m === 1) { const on = bbBlink(t, 4) !== 3; c1 = on ? '#c07ae8' : '#6a4a86'; c2 = on ? '#ffb04d' : '#8a6a3a'; }
  else if (m === 2) { const h = (t / 14) % 360; c1 = 'hsl(' + Math.round(h) + ',90%,62%)'; c2 = 'hsl(' + Math.round((h + 140) % 360) + ',90%,62%)'; }
  else { c1 = '#3a2a44'; c2 = '#26323a'; }
  r(c1, px + 3, py + 5, 4, 1); r(c1, px + 3, py + 5, 1, 4); r(c1, px + 3, py + 8, 4, 1); r(c1, px + 6, py + 7, 1, 2);
  r(c2, px + 9, py + 5, 4, 1); r(c2, px + 9, py + 5, 1, 4); r(c2, px + 12, py + 5, 1, 4); r(c2, px + 9, py + 7, 4, 1);
  r('#8a93a3', px + 4, py + 2, 1, 1); r('#8a93a3', px + 11, py + 2, 1, 1);
};

/* ---------- 手把地毯：跳舞時四個踏板輪流亮 ---------- */
FURN.bb_padrug = (px, py, now) => {
  _bbx0.bb_padrug(px, py, now);
  if (!bbxActive(bbxDance, bbxId())) return;
  const k = Math.floor(bbxNow() / 420) % 4;
  [[13, 4, '#5ae0ff'], [23, 13, '#ff5fb0'], [13, 22, '#ffd34d'], [3, 13, '#8fe09a']].forEach(([dx, dy, c], i) => {
    if (i === k) { r(c, px + dx, py + dy, 6, 6); r('#ffffff', px + dx + 2, py + dy + 2, 2, 2); }
    else { g.globalAlpha = 0.35; r(c, px + dx, py + dy, 6, 6); g.globalAlpha = 1; }
  });
};
let bbxDT = 0;
function bbxDanceGo(id, x, y) {
  clearInterval(bbxDT);
  const hx = pl.x, hy = pl.y, faces = ['up', 'right', 'down', 'left'], words = ['PERFECT!', 'GREAT!', 'COOL!'];
  let n = 0;
  bbxDT = setInterval(() => {
    if (scene !== 'house' || !bbxActive(bbxDance, id) || pose || pl.x !== hx || pl.y !== hy) { clearInterval(bbxDT); return; }   // 走開了、坐下了或時間到就停
    pl.face = faces[n % 4]; lastPosKey = ''; posAcc = 999;
    if (n % 3 === 1) pop(pl.x, pl.y - 0.6, words[(n / 3 | 0) % 3], ['#5ae0ff', '#ff5fb0', '#ffd34d'][(n / 3 | 0) % 3]);
    n++;
  }, 420);
}

/* ---------- 機器人玩偶：眼睛變愛心、說一句話 ---------- */
const BBX_TALK = ['嗶嗶！', '今天抓到蟲了嗎？', '投幣再來一次', '嗶…運算中…', '你今天也很棒', '要不要打電動？', '充電中…', '嗶嗶嗶～好開心'];
FURN.bb_robotdoll = (px, py, now) => {
  _bbx0.bb_robotdoll(px, py, now);
  if (!bbxActive(bbxTalk, bbxId())) return;
  r('#ff5c7a', px + 5, py + 5, 2, 1); r('#ff5c7a', px + 9, py + 5, 2, 1);
  const hy = py - 3 - Math.round((Math.sin(bbxNow() / 180) + 1) * 1.2);
  r('#ff5c7a', px + 5, hy, 2, 1); r('#ff5c7a', px + 9, hy, 2, 1); r('#ff5c7a', px + 5, hy + 1, 6, 1); r('#ff5c7a', px + 6, hy + 2, 4, 1); r('#ff5c7a', px + 7, hy + 3, 2, 1);
};

/* ---------- 冰淇淋燈：開／關 ---------- */
FURN.bb_icelamp = (px, py, now) => {
  _bbx0.bb_icelamp(px, py, now);
  if (!FXIT || fxOn(FXIT, true)) return;
  ob('#cdb8bf', '#a88e96', px + 3, py + 3, 10, 6); ob('#e8e2d8', '#c9bfae', px + 5, py, 6, 5); r('#b0707a', px + 7, py - 2, 2, 2); r('#ffffff', px + 5, py + 4, 1, 1);
};

/* ---------- 蛋糕桌：切掉的地方露出蛋糕斷面，吃光只剩盤子 ---------- */
FURN.bb_caketable = (px, py, now) => {
  _bbx0.bb_caketable(px, py, now);
  const n = FXIT ? bbxCakeN(FXIT) : 0; if (!n) return;
  if (n >= 4) {
    ob('#fffaf0', '#e6d7c3', px + 2, py + 3, 28, 11); r('#ffffff', px + 4, py + 5, 24, 1);
    r('#ff9bb3', px + 8, py + 8, 2, 1); r('#fff3b0', px + 15, py + 9, 2, 1); r('#ff9bb3', px + 21, py + 7, 1, 1);
    r('#c9ced6', px + 13, py + 6, 1, 4); r('#c9ced6', px + 12, py + 6, 3, 1);
    return;
  }
  const w = [0, 8, 14, 20][n], x0 = px + 30 - w;
  ob('#fffaf0', '#e6d7c3', x0, py + 3, w, 11); r('#f3e3c8', x0 + 1, py + 6, w - 2, 5); r('#e6d7c3', x0 + 1, py + 6, w - 2, 1);
  r('#ff9bb3', x0 + 2, py + 8, 2, 1); r('#ffffff', x0 + 3, py + 4, Math.max(1, w - 6), 1);
};

/* ---------- 棉花糖椅：坐下時被壓扁再彈回來 ---------- */
FURN.bb_marshchair = (px, py, now) => {
  let dy = 0;
  if (FXIT && typeof pose !== 'undefined' && pose && pose.id === FXIT.id && pose.at != null) {
    const k = (bbxNow() - pose.at) / 650;
    if (k < 1) dy = Math.round(Math.sin(k * Math.PI * 3) * 1.4 * (1 - k));
  }
  _bbx0.bb_marshchair(px, py + dy, now);
};

/* ---------- 盲盒沙發：剛坐下時「？」閃一下 ---------- */
FURN.bb_boxsofa = (px, py, now) => {
  _bbx0.bb_boxsofa(px, py, now);
  if (FXIT && typeof pose !== 'undefined' && pose && pose.id === FXIT.id && pose.at != null && bbxNow() - pose.at < 700 && Math.floor(bbxNow() / 120) % 2) {
    r('#fff3b0', px + 6, py + 7, 3, 3); r('#fff3b0', px + 21, py + 7, 3, 3); r('#ffffff', px + 7, py + 8, 1, 1); r('#ffffff', px + 22, py + 8, 1, 1);
  }
};
/* 坐下的人：畫在家具前面，椅面換成棉花糖／紫色盲盒的顏色 */
const _bbxSeated0 = drawSeated;
drawSeated = function (px, py, it, ch, tile) {
  if (it.k !== 'bb_marshchair' && it.k !== 'bb_boxsofa') { _bbxSeated0(px, py, it, ch, tile); return; }
  g.save(); g.beginPath(); g.rect(px - 4, py - 14, 24, 24); g.clip();
  drawPlayer(px, py - 2, 'down', false, 0, ch);
  g.restore();
  if (it.k === 'bb_marshchair') { ob('#ffd1e0', '#e6a8c0', px + 2, py + 8, 12, 6); r('#ffffff', px + 4, py + 9, 3, 1); r('#ffb3c6', px + 4, py + 12, 8, 1); return; }
  const t = tile != null ? tile : (pose ? pose.tile : 0);
  r('#a58cf0', px + 1, py + 10, 14, 3); r('#4a2aa8', px + 1, py + 13, 14, 1);
  r('#ffd34d', t === 0 ? px + 15 : px, py + 10, 1, 4);
};
const _bbxTake0 = takeSeat;
takeSeat = function (it, x, y) {
  if (it.k === 'bb_boxsofa' && !pose) {   // 兩個位子：點到有人的那格就改坐另一格
    if (remoteAt(x, y)) {
      const rc = itemRect(it), alt = rc ? Array.from({ length: rc.w }, (_, i) => RX + rc.x + i).find(ax => !remoteAt(ax, y)) : null;
      if (alt == null) { toast('沙發坐滿了', 1400); return; }
      x = alt;
    }
  }
  const was = pose;
  _bbxTake0(it, x, y);
  if (!was && pose && pose.id === it.id && (it.k === 'bb_marshchair' || it.k === 'bb_boxsofa')) {
    pose.at = bbxNow();
    if (it.k === 'bb_marshchair') pop(x, y - 0.6, '噗～', '#ff9bb3');
    else { sparkle(x, y - 0.4, '#ffd34d'); }
  }
};
const _bbxTaken0 = seatTaken;
seatTaken = function (it) { return it.k === 'bb_boxsofa' ? false : _bbxTaken0(it); };
Object.assign(SEAT, { bb_marshchair: 'sit', bb_boxsofa: 'sit' });

/* ---------- 糖果地毯：每走一步腳下噴出糖果碎片和星星 ---------- */
FURN.bb_candyrug = (px, py, now) => {
  _bbx0.bb_candyrug(px, py, now);
  const it = FXIT, t = bbxNow();
  if (it && scene === 'house') {
    const rc = itemRect(it), lx = pl.x - RX, ly = pl.y - RY;
    const on = rc && lx >= rc.x && lx < rc.x + rc.w && ly >= rc.y && ly < rc.y + rc.h && !pose, key = lx + ',' + ly;
    if (on && bbxCandyLast[it.id] !== key) {
      bbxCandyLast[it.id] = key;
      const cx = pl.x * T + 8, cy = pl.y * T + 13;
      for (let i = 0; i < 7; i++) bbxCandy.push({ t0: t, x: cx, y: cy, vx: (Math.random() - 0.5) * 16, vy: -3 - Math.random() * 7, c: ['#ff5fb0', '#5ae0ff', '#ffd34d', '#8fe09a', '#ffffff', '#c07ae8'][i % 6], s: i % 3 === 0 ? 2 : 1 });
      if (bbxCandy.length > 80) bbxCandy.splice(0, bbxCandy.length - 80);
    } else if (!on) bbxCandyLast[it.id] = null;
  }
  bbxCandy = bbxCandy.filter(p => t - p.t0 < 800);
  bbxCandy.forEach(p => {
    const a = (t - p.t0) / 800;
    g.globalAlpha = 1 - a;
    const x = Math.round(p.x + p.vx * a), y = Math.round(p.y + p.vy * a * 3 + 18 * a * a);
    if (p.s === 2) { r(p.c, x, y - 1, 1, 3); r(p.c, x - 1, y, 3, 1); } else r(p.c, x, y, 2, 2);
    g.globalAlpha = 1;
  });
};

/* ---------- 投幣存錢筒：只是互動（投一枚裝飾硬幣、眨眼、冒愛心；不扣錢也不存錢） ---------- */
FURN.bb_piggy = (px, py, now) => {
  _bbx0.bb_piggy(px, py, now);
  const id = bbxId(); if (!bbxActive(bbxPig, id)) return;
  const k = 1 - (bbxPig[id] - bbxNow()) / 1800;
  if (k < 0.4) { const cy = py - 6 + Math.round(k / 0.4 * 10); r('#ffd34d', px + 7, cy, 2, 3); r('#b8892a', px + 7, cy, 1, 3); }
  else {
    if (k < 0.75) { r('#ff9bb3', px + 4, py + 8, 3, 1); r('#12182c', px + 4, py + 9, 3, 1); }   // 眨眼
    const hy = py - 3 - Math.round((k - 0.4) * 10);
    r('#ff5c7a', px + 5, hy, 2, 1); r('#ff5c7a', px + 8, hy, 2, 1); r('#ff5c7a', px + 5, hy + 1, 5, 1); r('#ff5c7a', px + 6, hy + 2, 3, 1); r('#ff5c7a', px + 7, hy + 3, 1, 1);
  }
};

/* ---------- 按動作鍵 ---------- */
const BBX_ACT = {
  bb_minicab(hit, x, y) {
    if (bbxActive(bbxPlay, hit.id)) { pop(x, y, '遊戲中！', '#fff3b0'); return; }
    bbxPlay[hit.id] = bbxNow() + 4500;
    const sc = (10 + Math.floor(Math.random() * 90)) * 10;
    fxSend({ id: hit.id, a: 'play' });
    pop(x, y, 'START!', '#5ae0ff'); bbxSnd([72, 79, 84]);
    setTimeout(() => { if (scene === 'house') { pop(x, y, 'SCORE ' + sc, '#ffd34d'); sparkle(x, y, '#ffd34d'); bbxSnd([84, 88, 91], 0.09); } }, 4500);
  },
  bb_neonsign(hit, x, y) {
    const m = (bbxNeonM(hit) + 1) & 3;
    fxSet(hit, { m }); fxSend({ id: hit.id, s: fxGet(hit) });
    pop(x, y, ['粉藍閃爍', '紫橘', '彩虹', '關燈'][m], ['#ff9bd0', '#c9a8f5', '#ffe08a', '#cfd2d8'][m]); if (m < 3) sparkle(x, y, ['#ff5fb0', '#c07ae8', '#5ae0ff'][m]);
  },
  bb_padrug(hit, x, y) {
    if (pose || fishing || cooking) return;
    if (remoteAt(x, y)) { toast('這裡已經有人了', 1400); return; }
    if ((defOf(hit.k) || {}).layer !== 'floor') { pl.x = pl.sx = x; pl.y = pl.sy = y; }   // 地毯是平的，走上去跳；萬一目錄把它當成擋路家具就在原地跳
    pl.prog = 1; pressed.length = 0; lastPosKey = ''; posAcc = 999; trackSelf();
    bbxDance[hit.id] = bbxNow() + 6000; fxSend({ id: hit.id, a: 'dance' });
    bbxDanceGo(hit.id, x, y); bbxSnd([76, 79, 83, 88]);
  },
  bb_robotdoll(hit, x, y) {
    const t = BBX_TALK[Math.floor(Math.random() * BBX_TALK.length)];
    bbxTalk[hit.id] = bbxNow() + 2800; fxSend({ id: hit.id, a: 'talk' });
    pop(x, y, t, '#5ae0ff'); bbxSnd([88, 84, 91], 0.07);
  },
  bb_icelamp(hit, x, y) {
    const on = !fxOn(hit, true); fxSet(hit, Object.assign({}, fxGet(hit), { on }));
    pop(x, y, on ? '亮了' : '關燈', '#fff3b0'); if (on) sparkle(x, y, '#ff9bb3');
    fxSend({ id: hit.id, s: fxGet(hit) });
  },
  bb_caketable(hit, x, y) {
    const n = bbxCakeN(hit);
    if (n >= 4) { toast('蛋糕被吃光了，明天桌上又會有新的', 2600); return; }
    fxSet(hit, { d: fxDay(), n: n + 1 }); fxSend({ id: hit.id, s: fxGet(hit) });
    pop(x, y, ['好好吃！', '再來一口～', '甜甜的～', '最後一口！'][n], '#ffd9e2'); sparkle(x, y, '#ff8fa8'); bbxSnd([79, 84], 0.07);
  },
  bb_piggy(hit, x, y) {
    if (bbxActive(bbxPig, hit.id)) return;
    bbxPig[hit.id] = bbxNow() + 1800; fxSend({ id: hit.id, a: 'oink' });
    pop(x, y, '哼哼～', '#ffb3c6'); bbxSnd([84, 79], 0.07);
  },
  bb_miniclaw(hit, x, y) { bbClawOpen(hit, x, y); }
};
Object.keys(BBX_ACT).forEach(k => { FX_ACT[k] = 1; });
const _bbxAct0 = fxAct;
fxAct = function (hit, x, y) {
  const f = BBX_ACT[hit.k];
  if (!f) { _bbxAct0(hit, x, y); return; }
  if (typeof hit.id !== 'number' || !isFinite(hit.id)) { toast('家具還在存檔，等一下再試', 1800); return; }
  f(hit, x, y);
};
const _bbxHint0 = fxHint;
fxHint = function (hit) {
  if (BBX_ACT[hit.k]) {
    if (edit.on) return '';
    return {
      bb_minicab: '：按動作鍵玩一場', bb_neonsign: '：按動作鍵換招牌燈色', bb_padrug: '：按動作鍵跳舞', bb_robotdoll: '：按動作鍵跟牠說話',
      bb_icelamp: '：按動作鍵' + (fxOn(hit, true) ? '關燈' : '開燈'), bb_caketable: '：按動作鍵切一塊蛋糕', bb_piggy: '：按動作鍵投幣', bb_miniclaw: '：按動作鍵玩夾娃娃'
    }[hit.k] || '';
  }
  return _bbxHint0(hit);
};

/* ---------- 朋友在同一間屋子按的動作：動畫也看得到 ---------- */
const _bbxOnFx0 = onFx;
onFx = function (p) {
  _bbxOnFx0(p);
  if (!p || p.i === myUid || scene !== 'house' || !house || !p.a) return;
  const it = house.items.find(x => x.id === +p.id); if (!it) return;
  const n = bbxNow();
  if (p.a === 'play' && it.k === 'bb_minicab') bbxPlay[it.id] = n + 4500;
  else if (p.a === 'dance' && it.k === 'bb_padrug') bbxDance[it.id] = n + 6000;
  else if (p.a === 'talk' && it.k === 'bb_robotdoll') bbxTalk[it.id] = n + 2800;
  else if (p.a === 'oink' && it.k === 'bb_piggy') bbxPig[it.id] = n + 1800;
};

/* ---------- 夜晚的光：冰淇淋燈暖粉光、霓虹招牌彩色光（跟檯燈同一套光暈） ---------- */
const _bbxLight0 = drawHouseLight;
drawHouseLight = function (now, w, dark) {
  _bbxLight0(now, w, dark);
  if (scene !== 'house' || !house || edit.on) return;
  const dim = Math.max(dark * 0.36, w.wet ? 0.14 : 0);
  if (dim <= 0.01) return;
  const k = Math.min(1, Math.max(0.4, dim / 0.3));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  house.items.forEach(it => {
    let col, rad;
    if (it.k === 'bb_icelamp') { if (!fxOn(it, true)) return; col = '255,160,196'; rad = 34; }
    else if (it.k === 'bb_neonsign') { const m = bbxNeonM(it); if (m === 3) return; col = m === 0 ? (Math.floor(now / 500) % 2 ? '255,95,176' : '90,224,255') : m === 1 ? '190,120,232' : ['255,95,176', '255,224,90', '90,224,255', '143,224,154'][Math.floor(now / 600) % 4]; rad = 26; }
    else return;
    const rc = itemRect(it); if (!rc) return;
    const cx = Math.round((RX + rc.x + rc.w / 2) * T), cy = Math.round((RY + rc.y + rc.h / 2) * T) + (it.k === 'bb_icelamp' ? -3 : 2);
    ctx.fillStyle = 'rgba(' + col + ',' + (0.05 * k).toFixed(3) + ')';
    for (let q = rad; q > 6; q -= 5) { ctx.beginPath(); ctx.arc(cx, cy, q, 0, 7); ctx.fill(); }
  });
  ctx.restore();
};

/* ---------- 迷你夾娃娃機：自己夾的小遊戲（沒有獎品，純好玩） ----------
   方向鍵／按鈕移動爪子，空白鍵／「放下」夾取。借用出海團那個彈出視窗（voyM／voyCard）。 */
const BBC = { x: 96, dir: 0, ph: 'idle', L: 6, plush: [], got: null, held: null, msg: '', wins: 0, tries: 0, hit: null, tx: 0, ty: 0, tm: 0, ctrl: 0 };
const BBC_COL = [['#ff9bb3', '#d4688a'], ['#8fe09a', '#4f9e7c'], ['#ffd34d', '#b8892a'], ['#8a6ae0', '#4a2aa8'], ['#ffa83c', '#b8601a'], ['#5ae0ff', '#2f7a90']];
const BBC_FLOOR = 88, BBC_CHUTE = 26;
function bbClawFill() {
  const used = BBC.plush.map(p => p.x);
  while (BBC.plush.length < 6) {
    let x, tries = 0; do { x = 50 + Math.floor(Math.random() * 130); tries++; } while (used.some(u => Math.abs(u - x) < 18) && tries < 30);
    used.push(x); BBC.plush.push({ x, c: BBC_COL[Math.floor(Math.random() * BBC_COL.length)], k: Math.floor(Math.random() * 3) });
  }
}
function bbClawOpen(hit, x, y) {
  if (typeof vyOpen !== 'undefined' && vyOpen) return;
  Object.assign(BBC, { x: 96, dir: 0, ph: 'idle', L: 6, plush: [], got: null, held: null, msg: '', hit: { x, y }, wins: 0, tries: 0 });
  bbClawFill();
  voy.mode = 'claw'; vyOpen = true; pressed.length = 0;
  voyCard.innerHTML = '<h2>迷你夾娃娃機</h2>' +
    '<canvas id="bbclawcv" width="192" height="108" style="display:block;width:100%;max-width:420px;margin:0 auto;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#12182c"></canvas>' +
    '<p class="empty" id="bbclawmsg" style="text-align:center;margin:6px 0">方向鍵（或按鈕）移動，空白鍵（或「放下」）夾取。沒有獎品，純粹好玩。</p>' +
    '<div class="v-quick" style="justify-content:center"><button type="button" class="btn" data-a="bbc-l">◀ 左</button><button type="button" class="btn" data-a="bbc-go">放下</button><button type="button" class="btn" data-a="bbc-r">右 ▶</button></div>' +
    '<button type="button" class="btn ghost wide" data-a="bbc-x">不玩了</button>';
  voyM.hidden = false; voyCard.focus();
  clearInterval(BBC.tm); BBC.tm = setInterval(bbClawTick, 33);
}
function bbClawStop() {
  clearInterval(BBC.tm); BBC.tm = 0;
  if (BBC.wins > 0 && scene === 'house' && BBC.hit) { pop(BBC.hit.x, BBC.hit.y, '夾到了！', '#2f9d54'); sparkle(BBC.hit.x, BBC.hit.y, '#ffd34d'); }
}
function bbClawGo() {
  if (BBC.ph !== 'idle') return;
  BBC.ph = 'down'; BBC.tries++; BBC.dir = 0;
}
function bbClawTick() {
  if (!(vyOpen && voy.mode === 'claw')) { bbClawStop(); return; }
  const cv = document.getElementById('bbclawcv'); if (!cv) return;
  if (BBC.ph === 'idle') BBC.x = Math.max(18, Math.min(180, BBC.x + BBC.dir * 2.4));
  else if (BBC.ph === 'down') { BBC.L += 2.4; if (BBC.L >= BBC_FLOOR - 24) {
    BBC.L = BBC_FLOOR - 24; BBC.ph = 'grab'; BBC.tm2 = performance.now();
    const near = BBC.plush.filter(p => Math.abs(p.x - BBC.x) <= 9).sort((a, b) => Math.abs(a.x - BBC.x) - Math.abs(b.x - BBC.x))[0];
    BBC.target = near && Math.random() < 0.72 ? near : null; BBC.slip = !!BBC.target && Math.random() < 0.25;
  } }
  else if (BBC.ph === 'grab') { if (performance.now() - BBC.tm2 > 450) { BBC.ph = 'up'; if (BBC.target) { BBC.held = BBC.target; BBC.plush = BBC.plush.filter(p => p !== BBC.target); } } }
  else if (BBC.ph === 'up') {
    BBC.L -= 2.4;
    if (BBC.held && BBC.slip && BBC.L < 40) { BBC.slip = false; BBC.plush.push({ x: BBC.x, c: BBC.held.c, k: BBC.held.k }); BBC.held = null; BBC.msg = '滑掉了～'; }
    if (BBC.L <= 6) { BBC.L = 6; BBC.ph = 'carry'; if (!BBC.held && !BBC.msg) BBC.msg = '可惜～'; }
  }
  else if (BBC.ph === 'carry') {
    if (BBC.held) { BBC.x -= 2.6; if (BBC.x <= BBC_CHUTE) { BBC.x = BBC_CHUTE; BBC.ph = 'drop'; BBC.dropY = 20; } }
    else { BBC.x += (96 - BBC.x) * 0.1; if (Math.abs(BBC.x - 96) < 3) BBC.ph = 'idle'; }
  }
  else if (BBC.ph === 'drop') {
    BBC.dropY += 3.2;
    if (BBC.dropY >= BBC_FLOOR - 14) { BBC.wins++; BBC.msg = '夾到了！'; BBC.held = null; bbClawFill(); BBC.ph = 'carry'; }
  }
  const m = document.getElementById('bbclawmsg'); if (m && BBC.msg) { m.textContent = BBC.msg + '（已夾到 ' + BBC.wins + ' 隻，試了 ' + BBC.tries + ' 次）'; }
  bbClawDraw(cv);
}
function bbClawPlush(x, y, p) {   // 一隻小娃娃：熊、兔、圓球
  const c = p.c; ob(c[0], c[1], x - 5, y + 2, 10, 8);
  if (p.k === 0) { r(c[1], x - 5, y, 3, 3); r(c[1], x + 2, y, 3, 3); }
  else if (p.k === 1) { r(c[1], x - 4, y - 4, 2, 6); r(c[1], x + 2, y - 4, 2, 6); }
  else { r('#ffffff', x - 3, y + 3, 2, 1); }
  r('#12182c', x - 3, y + 5, 1, 1); r('#12182c', x + 2, y + 5, 1, 1); r('#ffffff', x - 4, y + 3, 1, 1);
}
function bbClawDraw(cv) {
  const c2 = cv.getContext('2d'); c2.imageSmoothingEnabled = false; const old = g; g = c2;
  try {
    r('#1c2340', 0, 0, 192, 108);
    for (let i = 0; i < 14; i++) r('#2a3560', 8 + i * 13, 4, 1, 1);
    ob('#e8f6ff', '#7a8590', 6, 10, 180, 84); r('#d4e8f6', 8, 12, 176, 78); r('#a9bfd8', 8, BBC_FLOOR, 176, 3);
    ob('#12182c', '#5a1428', 8, BBC_FLOOR - 18, 36, 20); r('#e0486a', 14, BBC_FLOOR - 12, 24, 1); r('#ffd34d', 22, BBC_FLOOR - 8, 8, 1); r('#ffd34d', 26, BBC_FLOOR - 10, 1, 3);
    BBC.plush.forEach(p => bbClawPlush(p.x, BBC_FLOOR - 11, p));
    r('#8a93a3', 8, 14, 176, 2);
    r('#c9ced6', BBC.x - 5, 12, 10, 5); r('#e0486a', BBC.x - 2, 13, 4, 2);
    const yb = 16 + BBC.L; r('#7a8590', Math.round(BBC.x), 17, 1, Math.round(BBC.L));
    const open = BBC.ph === 'idle' || BBC.ph === 'down' || BBC.ph === 'drop' || (BBC.ph === 'carry' && !BBC.held) ? 5 : 2;
    r('#e0486a', Math.round(BBC.x) - open, Math.round(yb), 2, 5); r('#e0486a', Math.round(BBC.x) + open - 1, Math.round(yb), 2, 5); r('#c9ced6', Math.round(BBC.x) - 1, Math.round(yb) - 1, 3, 2);
    if (BBC.held && BBC.ph !== 'drop') bbClawPlush(Math.round(BBC.x), Math.round(yb) + 2, BBC.held);
    if (BBC.ph === 'drop' && BBC.held) bbClawPlush(Math.round(BBC.x), Math.round(BBC.dropY), BBC.held);
    if (BBC.ph === 'idle') { r('rgba(255,255,255,.25)', Math.round(BBC.x), 22, 1, BBC_FLOOR - 24); }
  } catch (e) { /* 略過 */ } finally { g = old; }
}
voyCard.addEventListener('pointerdown', e => {
  if (voy.mode !== 'claw') return;
  const b = e.target.closest('button[data-a]'); if (!b) return;
  if (b.dataset.a === 'bbc-l') BBC.dir = -1; else if (b.dataset.a === 'bbc-r') BBC.dir = 1;
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => voyCard.addEventListener(ev, () => { if (voy.mode === 'claw') BBC.dir = 0; }, true));
voyCard.addEventListener('click', e => {
  if (voy.mode !== 'claw') return;
  const b = e.target.closest('button[data-a]'); if (!b) return;
  if (b.dataset.a === 'bbc-go') { BBC.msg = ''; bbClawGo(); }
  else if (b.dataset.a === 'bbc-x') closeVoyModal();
});
window.addEventListener('keydown', e => {
  if (!(typeof vyOpen !== 'undefined' && vyOpen && voy.mode === 'claw')) return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { BBC.dir = -1; }
  else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { BBC.dir = 1; }
  else if (e.key === ' ' || e.key === 'Enter') { BBC.msg = ''; bbClawGo(); }
  else if (e.key === 'Escape') { closeVoyModal(); }
  else return;
  e.preventDefault(); e.stopPropagation();
}, true);
window.addEventListener('keyup', e => {
  if (!(typeof vyOpen !== 'undefined' && vyOpen && voy.mode === 'claw')) return;
  if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) { BBC.dir = 0; e.preventDefault(); e.stopPropagation(); }
}, true);
