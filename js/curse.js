'use strict';
/* 神廟「打小人」小遊戲（一次 10 G，開局前走後端 tc_curse 扣款；不限次數，沒有排行或其他獎勵）
   流程：選／寫小人名字 → 連打（狂點或按空白鍵把氣勢打光）→ 蓄力一擊 ×3（停在綠色區＝暴擊）→ 丟進火盆燒掉 → 領 30 分鐘表情（三選一）。
   玩的時候別人看得到：位置訊息的同步碼 s = 11，頭上冒出「紙人泡泡」（tcDrawIcons 畫）。
   30 分鐘表情：buff 名稱 cu_a／cu_b／cu_c，存在自己的瀏覽器（localStorage dw_cu_emo），跟著位置訊息的 v 欄位送給別人（見 cooking.js 的 VIS_BUFFS）。 */
let cuPlaying = false;       // 正在玩（sitCode 會變 11）
let cuEmo = null;            // { k:'a'|'b'|'c', until:毫秒時間戳 }
try { const o = JSON.parse(localStorage.getItem('dw_cu_emo') || 'null'); if (o && /^[abc]$/.test(o.k) && +o.until > Date.now()) cuEmo = { k: o.k, until: +o.until }; } catch (e) { /* 略過 */ }
const cuOn = k => !!cuEmo && 'cu_' + cuEmo.k === k && cuEmo.until > Date.now();
const CU_NAMES = ['小人', '壞運', '爛桃花', '討厭鬼', '爛老闆'];
const CU_EMO = [{ k: 'a', n: '退散光環', d: '頭上一圈金光＋小星星' }, { k: 'b', n: '舒爽', d: '頭上冒出一口長氣的小雲' }, { k: 'c', n: '小火苗', d: '一撮小火苗和飄起的紙灰' }];
/* 16×16 的小圖示：x,y 是左上角，draw 用的是傳進來的 2D context */
function cuIcon(c, k, x, y, t) {
  const R = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), w || 1, h || 1); };
  if (k === 'a') {
    R('#ffd34d', 3, 2, 10); R('#ffd34d', 2, 3); R('#ffd34d', 13, 3); R('#fff3b0', 4, 2, 3);
    [[2, 8], [13, 6], [8, 13], [5, 11]].forEach(([px, py], i) => { if ((Math.floor(t / 300) + i) % 2) { R('#fff3b0', px, py, 1, 3); R('#fff3b0', px - 1, py + 1, 3, 1); } });
    R('#ffe9a8', 6, 6, 4, 6); R('#2a2230', 7, 8); R('#2a2230', 9, 8); R('#ff9bb3', 7, 10, 2);
  } else if (k === 'b') {
    const u = Math.floor(t / 400) % 2; R('#ffffff', 3, 7 - u, 6, 4); R('#ffffff', 6, 5 - u, 6, 4); R('#ffffff', 9, 8 - u, 5, 3); R('#d6e4f0', 4, 10 - u, 9);
    R('#ffe9a8', 2, 3, 2, 2); R('#8fe09a', 11, 2, 2, 2); R('#8fe09a', 12, 1, 1, 4); R('#8fe09a', 10, 2, 4, 1);
  } else {
    for (let i = 0; i < 3; i++) { const h = 5 + (Math.floor(t / 200 + i * 2) % 3); R(i % 2 ? '#ffb02a' : '#ff7a2a', 4 + i * 3, 12 - h, 3, h); R('#ffd34d', 5 + i * 3, 14 - h, 1, Math.max(1, h - 3)); }
    R('#666666', 2, 12, 12, 2); const a = Math.floor(t / 250) % 8; R('#9a9a9a', 3 + a, 4 - a / 2); R('#9a9a9a', 12 - a, 6 - a / 2);
  }
}
/* 玩的時候頭上的「紙人泡泡」：px,py = 玩家左上角；hit＝剛打下去（紙人旁邊冒星星） */
function cuBubble(px, py, now) {
  const hit = Math.floor(now / 260) % 2, x = px - 3, y = py - 27;
  const R = (col, a, b, w, h) => { ctx.fillStyle = col; ctx.fillRect(x + a, y + b, w, h); };
  R('#3a2a30', 0, 0, 22, 16); R('#fff3c8', 1, 1, 20, 14); R('#fff3c8', 10, 16, 3, 2); R('#3a2a30', 9, 16, 1, 1); R('#3a2a30', 13, 16, 1, 1); R('#3a2a30', 10, 18, 3, 1);
  const dx = 4, dy = 1 + hit;
  R('#c9a66a', dx + 3, dy, 6, 5); R('#fffbe8', dx + 4, dy + 1, 4, 3); R('#2a2230', dx + 5, dy + 2, 1, 1); R('#2a2230', dx + 7, dy + 2, 1, 1);
  R('#c9a66a', dx + 2, dy + 5, 8, 7); R('#fffbe8', dx + 3, dy + 6, 6, 5); R('#d9453a', dx + 4, dy + 7, 4, 1); R('#d9453a', dx + 5, dy + 9, 2, 1);
  R('#c9a66a', dx, dy + 6, 3, 1); R('#c9a66a', dx + 9, dy + 6, 3, 1);
  if (hit) { R('#ffd34d', 2, 3, 2, 2); R('#ffd34d', 17, 4, 2, 2); R('#fff3b0', 18, 10, 1, 2); }
}

/* ---------- 遊戲畫面 ---------- */
const cuEl = document.createElement('div');
cuEl.id = 'cubox'; cuEl.hidden = true;
cuEl.innerHTML = '<div id="cuw"><canvas id="cuc" width="128" height="96"></canvas><div id="cutag" class="cuh"></div><div id="cucombo" class="cuh"></div><div id="cumsg" class="cuh"></div><div id="cuhint" class="cuh"></div><div id="cuhp"><div id="cuhpf"></div></div><button type="button" id="cuexit">離開</button>' +
  '<div id="cures" hidden><h3 id="curt"></h3><p>這次不給金幣，但可以領 <b>30 分鐘表情</b>（三選一，別人看得到；再領會換掉舊的、重新計時）</p><div id="cuemo"></div><div id="cubtns"><button type="button" class="go" id="cuget">領取並再打一次（10 G）</button><button type="button" id="cubye">領取並離開</button></div></div></div>';
document.body.appendChild(cuEl);
{
  const st = document.createElement('style');
  st.textContent = `#cubox{position:fixed;inset:0;z-index:60;background:#120a0e;display:flex;align-items:center;justify-content:center;font-family:inherit;user-select:none;-webkit-user-select:none;touch-action:manipulation}
  #cubox[hidden]{display:none}#cubox *{box-sizing:border-box}
  #cuw{position:relative;width:min(100vw,calc(100vh*4/3),900px);aspect-ratio:4/3;background:#000;border:3px solid #ffd34d;border-radius:6px;overflow:hidden;color:#ffe9a8}
  #cuc{width:100%;height:100%;image-rendering:pixelated;display:block}
  .cuh{position:absolute;pointer-events:none;font-weight:700;text-shadow:0 2px 0 #000}
  #cutag{left:50%;top:6%;transform:translateX(-50%);background:#12182c;border:2px solid #ffe9a8;padding:.2em .8em;font-size:clamp(11px,2.6vw,22px);white-space:nowrap}
  #cucombo{left:3%;top:20%;font-size:clamp(14px,4vw,34px);color:#ffd34d}
  #cumsg{left:50%;top:44%;transform:translate(-50%,-50%);font-size:clamp(18px,6vw,52px);color:#fff;opacity:0;transition:opacity .15s;white-space:nowrap}
  #cuhint{left:50%;bottom:3%;transform:translateX(-50%);font-size:clamp(11px,2.6vw,20px);color:#bff3ff;white-space:nowrap}
  #cuhp{position:absolute;left:20%;right:20%;bottom:11%;height:3.2%;background:#12182c;border:2px solid #ffe9a8}#cuhp[hidden]{display:none}#cuhpf{height:100%;background:#ff5c5c;width:100%}
  #cuexit{position:absolute;right:2%;top:2%;font:inherit;font-weight:700;font-size:clamp(11px,2.4vw,16px);background:#2a3656;color:#ffe9a8;border:2px solid #ffe9a8;border-radius:6px;padding:.2em .7em;cursor:pointer}
  #cures{position:absolute;inset:0;background:rgba(18,10,14,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4vmin;text-align:center;padding:3%}#cures[hidden]{display:none}
  #cures h3{margin:0;font-size:clamp(18px,5vw,40px);color:#ffd34d}#cures p{margin:0;font-size:clamp(11px,2.5vw,18px);color:#e8d6b0}
  #cuemo{display:flex;gap:10px}#cuemo .e{display:flex;flex-direction:column;align-items:center;gap:4px;background:#2a3656;color:#ffe9a8;border:2px solid #ffe9a8;border-radius:6px;padding:.4em .7em;cursor:pointer;font-weight:700;font-size:clamp(11px,2.6vw,17px)}
  #cuemo .e.on{background:#ffd34d;color:#12182c}#cuemo .e canvas{width:min(14vw,72px);height:min(14vw,72px);image-rendering:pixelated;background:#3a2a30;border-radius:6px}#cuemo .e small{font-weight:400;font-size:.75em}
  #cubtns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}#cubtns button{font:inherit;font-weight:700;font-size:clamp(13px,3vw,20px);background:#2a3656;color:#ffe9a8;border:2px solid #ffe9a8;border-radius:6px;padding:.4em 1.1em;cursor:pointer}#cubtns .go{background:#7fd08a;color:#12182c;border-color:#0a0e1c}`;
  document.head.appendChild(st);
}
const cuQ = id => document.getElementById(id);
const cuCv = cuQ('cuc'), cg = cuCv.getContext('2d'); cg.imageSmoothingEnabled = false;
const cR = (c, x, y, w, h) => { cg.fillStyle = c; cg.fillRect(Math.round(x), Math.round(y), w, h); };
const cOB = (f, o, x, y, w, h) => { cR(o, x, y, w, h); cR(f, x + 1, y + 1, w - 2, h - 2); };
let cuSt = 'off', cuT = 0, cuHp = 100, cuCombo = 0, cuLast = 0, cuShake = 0, cuShoeT = -9, cuParts = [], cuGauge = 0, cuDir = 1, cuStrike = 0, cuStT = 0, cuFly = 0, cuFlash = 0, cuGsp = 1.2, cuName = '小人', cuRaf = 0, cuPick = 'a', cuEmoT = 0;
function cuSay(s, ms) { const m = cuQ('cumsg'); m.textContent = s; m.style.opacity = 1; clearTimeout(cuSay.t); cuSay.t = setTimeout(() => { m.style.opacity = 0; }, ms || 500); }
function cuSnd(f, d, ty, v, s) { try { tcBeep(f, d || .06, ty || 'square', v || .05); } catch (e) { /* 略過 */ } }
function cuBurst(x, y, n, cols, sp, gv) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = Math.random() * (sp || 1.6) + .3; cuParts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .8, gv: gv == null ? .08 : gv, l: 20 + Math.random() * 16, c: cols[i % cols.length], s: Math.random() < .4 ? 1 : 2 }); } }
function cuBg() {
  cR('#5a2a22', 0, 0, 128, 26); cR('#7a3a2c', 0, 22, 128, 4);
  for (let i = 0; i < 128; i += 16) { cR('#c7332e', i + 6, 0, 4, 22); cR('#ffd34d', i + 6, 0, 4, 2); }
  for (let y = 26; y < 96; y += 8) cR((y / 8 | 0) % 2 ? '#b98a55' : '#c99a63', 0, y, 128, 8);
  for (let x = 0; x < 128; x += 16) cR('#9a6e3a', x, 26, 1, 70);
  cOB('#7a1a1a', '#ffd34d', 50, 3, 28, 10); const f = (cuT / 12 | 0) % 2; cR('#ffb02a', 16, 12 - f, 2, 3); cR('#ffb02a', 108, 12 - f, 2, 3);
}
function cuTable() { cOB('#7a4a2a', '#3a2214', 34, 74, 60, 8); cR('#9a6a3a', 35, 75, 58, 2); }
function cuDoll(x, y, o) {
  o = o || {}; const c = o.burn ? '#8a7a60' : '#fff3c8', e = '#c9a66a';
  if (o.rot) { cg.save(); cg.translate(x + 6, y + 10); cg.rotate(o.rot); cg.translate(-6, -10); x = 0; y = 0; }
  cOB(c, e, x + 3, y, 6, 6); cR('#2a2230', x + 4, y + 2, 1, 2); cR('#2a2230', x + 7, y + 2, 1, 2); cR('#d9453a', x + 5, y + 4, 2, 1);
  cOB(c, e, x + 2, y + 6, 8, 9); cOB(c, e, x, y + 7, 3, 2); cOB(c, e, x + 9, y + 7, 3, 2); cOB(c, e, x + 3, y + 15, 2, 5); cOB(c, e, x + 7, y + 15, 2, 5); cR('#d9453a', x + 4, y + 8, 4, 1); cR('#d9453a', x + 5, y + 10, 2, 3);
  if (o.dmg) { cR('#2a2230', x + 3, y + 2, 3, 1); cR('#d9453a', x + 8, y + 7, 1, 5); }
  if (o.rot) cg.restore();
}
function cuShoe(x, y, rot) { cg.save(); cg.translate(x + 8, y + 3); cg.rotate(rot); cg.translate(-8, -3); cOB('#e8e2d2', '#5a3a2a', 0, 0, 16, 6); cR('#d9453a', 3, -2, 8, 3); cR('#d9453a', 4, -3, 6, 1); cR('#b83a2a', 1, 4, 14, 1); cg.restore(); }
function cuBrazier(x, y, fire) { cOB('#3a3a4a', '#14141e', x, y, 22, 12); cR('#5a5a6a', x + 2, y + 2, 18, 2); if (fire) for (let i = 0; i < 5; i++) { const h = 6 + ((cuT / 5 + i * 3) % 5 | 0) + fire * 3; cR(i % 2 ? '#ffb02a' : '#ff7a2a', x + 2 + i * 4, y - h, 4, h); cR('#ffd34d', x + 3 + i * 4, y - h + 3, 2, Math.max(1, h - 4)); } }
function cuHit() {
  if (cuSt !== 'tap') return; const n = performance.now(); cuCombo = (n - cuLast < 450) ? cuCombo + 1 : 1; cuLast = n;
  const dmg = 3 + Math.min(cuCombo, 30) * .35; cuHp = Math.max(0, cuHp - dmg); cuShoeT = cuT; cuShake = 5;
  cuBurst(64, 56, 6, ['#ffd34d', '#fff3b0', '#ff9bb3']); cuSnd(180 + Math.min(cuCombo, 20) * 14, .05, 'square', .06);
  cuQ('cuhpf').style.width = cuHp + '%'; cuQ('cucombo').textContent = cuCombo > 1 ? cuCombo + ' 連擊' : '';
  if (cuHp <= 0) { cuSt = 'to2'; cuStT = cuT; cuQ('cuhint').textContent = ''; cuSay('小人氣勢散了…', 900); cuSnd(300, .4, 'sawtooth', .06); }
}
const CU_ZONE = { g0: .38, g1: .62, c0: .47, c1: .53 };
function cuStartCharge() { cuSt = 'charge'; cuStrike = 0; cuGauge = 0; cuDir = 1; cuGsp = 1.3; cuQ('cuhint').textContent = '按一下（或空白鍵）停下力度！綠色區＝暴擊'; cuQ('cucombo').textContent = '第 1 / 3 下'; cuQ('cuhp').hidden = true; }
function cuStop() {
  if (cuSt !== 'charge') return; const v = cuGauge; let q, sc;
  if (v >= CU_ZONE.c0 && v <= CU_ZONE.c1) { q = '暴擊！！'; sc = 3; } else if (v >= CU_ZONE.g0 && v <= CU_ZONE.g1) { q = '好重！'; sc = 2; } else { q = '普通'; sc = 1; }
  cuStrike++; cuShoeT = cuT; cuShake = sc * 5 + 4; cuFlash = sc * 3; cuBurst(64, 56, 10 * sc, ['#ffd34d', '#fff3b0', '#ff5c5c', '#ffffff'], 1.4 + sc * .5);
  cuSay(q, 700); cuSnd(120 + sc * 60, .18, 'square', .08); if (sc === 3) cuSnd(900, .25, 'triangle', .06);
  cuQ('cucombo').textContent = cuStrike < 3 ? '第 ' + (cuStrike + 1) + ' / 3 下' : '';
  if (cuStrike >= 3) { cuSt = 'tear'; cuStT = cuT; cuQ('cuhint').textContent = ''; } else { cuGauge = 0; cuDir = 1; cuGsp += .35; }
}
const cuPress = () => { if (cuSt === 'tap') cuHit(); else if (cuSt === 'charge') cuStop(); };
function cuLoop() {
  if (cuSt === 'off') return;
  cuT++; cg.save(); if (cuShake > 0) { cg.translate((Math.random() - .5) * cuShake * .5, (Math.random() - .5) * cuShake * .5); cuShake--; }
  cuBg();
  if (cuSt === 'tap' || cuSt === 'to2') {
    cuTable(); cuDoll(58, 54 + (cuShake > 0 ? 1 : 0), { dmg: cuHp < 50 });
    const k = cuT - cuShoeT; cuShoe(68 + (k < 7 ? -2 : 0), k < 7 ? (38 + k * 2.4) : 34, k < 7 ? (k < 3 ? -.9 : .1) : -.5);
    if (cuSt === 'to2' && cuT - cuStT > 50) cuStartCharge();
  } else if (cuSt === 'charge') {
    cuTable(); cuDoll(41, 54); cuGauge += cuDir * cuGsp / 60; if (cuGauge >= 1) { cuGauge = 1; cuDir = -1; } if (cuGauge <= 0) { cuGauge = 0; cuDir = 1; }
    cOB('#12182c', '#ffe9a8', 20, 30, 88, 8); cR('#ff5c5c', 21, 31, 86, 6); cR('#7fd08a', 21 + CU_ZONE.g0 * 86, 31, (CU_ZONE.g1 - CU_ZONE.g0) * 86, 6); cR('#ffd34d', 21 + CU_ZONE.c0 * 86, 31, (CU_ZONE.c1 - CU_ZONE.c0) * 86, 6); cR('#fff', 20 + cuGauge * 86, 28, 2, 12);
    const k = cuT - cuShoeT; cuShoe(14, k < 8 ? (52 + k * 1.5) : 56, k < 8 ? -.1 : -.4); cuBrazier(84, 64, .3);
  } else if (cuSt === 'tear') {
    cuTable(); cuDoll(41, 54, { dmg: 1 }); if (cuT - cuStT > 30) { cuSt = 'fly'; cuFly = 0; } cuShoe(14, 56, -.4); cuBrazier(84, 64, .3);
  } else if (cuSt === 'fly') {
    cuFly++; const p = Math.min(1, cuFly / 55), x = 41 + p * 47, y = 54 - Math.sin(p * 3.14) * 30 - p * 2;
    cuTable(); cuDoll(x, y, { dmg: 1, rot: p * 6.28 * 1.5, burn: p > .9 }); cuBrazier(84, 64, .6 + p);
    if (p >= 1) { cuSt = 'burn'; cuStT = cuT; cuBurst(94, 60, 30, ['#ff7a2a', '#ffb02a', '#ffd34d', '#555555'], 1.6, -.02); cuSnd(220, .7, 'sawtooth', .05); cuSay(cuName + ' 退散！', 1400); }
  } else if (cuSt === 'burn') {
    cuBrazier(84, 64, 1.4); const k = cuT - cuStT; if (k % 4 === 0) cuBurst(94, 56, 2, ['#ff7a2a', '#ffd34d', '#666666'], .8, -.03); if (k > 95) cuFinish();
  } else cuBrazier(84, 64, .5);
  cuParts = cuParts.filter(p => (p.l -= 1) > 0); cuParts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.gv; cR(p.c, p.x, p.y, p.s, p.s); });
  if (cuFlash > 0) { cg.globalAlpha = Math.min(.5, cuFlash / 10); cR('#fff', 0, 0, 128, 96); cg.globalAlpha = 1; cuFlash--; }
  cg.restore(); cuRaf = requestAnimationFrame(cuLoop);
}
/* ---------- 結束：領 30 分鐘表情 ---------- */
function cuFinish() {
  cuSt = 'end'; cuQ('cuhint').textContent = ''; cuQ('cucombo').textContent = ''; cuQ('curt').textContent = cuName + ' 退散！'; cuQ('cures').hidden = false; cuDrawEmo();
  clearInterval(cuEmoT); cuEmoT = setInterval(() => { if (!cuQ('cures').hidden) cuDrawEmoIcons(); }, 120);
}
function cuDrawEmo() {
  const box = cuQ('cuemo'); box.innerHTML = '';
  CU_EMO.forEach(e => { const d = document.createElement('div'); d.className = 'e' + (e.k === cuPick ? ' on' : ''); d.innerHTML = '<canvas width="16" height="16" data-k="' + e.k + '"></canvas><span>' + e.n + '</span><small>' + e.d + '</small>'; d.onclick = () => { cuPick = e.k; cuDrawEmo(); cuSnd(660, .1, 'triangle', .06); }; box.appendChild(d); });
  cuDrawEmoIcons();
}
function cuDrawEmoIcons() { cuQ('cuemo').querySelectorAll('canvas').forEach(c => { const x = c.getContext('2d'); x.clearRect(0, 0, 16, 16); cuIcon(x, c.dataset.k, 0, 0, performance.now()); }); }
function cuClaim() {
  cuEmo = { k: cuPick, until: Date.now() + 30 * 60000 };
  try { localStorage.setItem('dw_cu_emo', JSON.stringify(cuEmo)); } catch (e) { /* 略過 */ }
  lastSendAt = 0; try { toast('領到表情「' + CU_EMO.find(e => e.k === cuPick).n + '」，30 分鐘', 2400); } catch (e) { /* 略過 */ }
}
/* ---------- 開始／離開 ---------- */
function cuReset() {
  cuHp = 100; cuCombo = 0; cuStrike = 0; cuParts = []; cuShake = 0; cuFly = 0; cuSt = 'tap'; cuQ('cuhp').hidden = false; cuQ('cuhpf').style.width = '100%';
  cuQ('cuhint').textContent = '狂點畫面！（或狂按空白鍵）'; cuQ('cutag').textContent = '小人：' + cuName; cuQ('cucombo').textContent = ''; cuQ('cures').hidden = true; clearInterval(cuEmoT);
}
function cuStart(name) {
  cuName = (name || '小人').replace(/[<>]/g, '').slice(0, 8) || '小人'; tcClose(); cuEl.hidden = false; cuPlaying = true; cuReset();
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  pressed.length = 0; actHeld = false; lastPosKey = ''; posAcc = 999; try { trackSelf(); } catch (e) { /* 略過 */ }
  cancelAnimationFrame(cuRaf); cuLoop();
}
function cuQuit() {
  if (!cuPlaying && cuEl.hidden) return;
  cuPlaying = false; cuSt = 'off'; cancelAnimationFrame(cuRaf); clearInterval(cuEmoT); cuEl.hidden = true; pressed.length = 0; actHeld = false; lastPosKey = ''; posAcc = 999; try { trackSelf(); } catch (e) { /* 略過 */ }
}
cuQ('cuexit').onclick = cuQuit;
/* 開打要付 10 G：走後端 tc_curse（扣款），成功才開局 */
async function cuPay() {
  try { const r = await enqueue(() => rpc('tc_curse')); tcApply(r); return true; }
  catch (e) { try { toast(tcMiss(e) ? '神廟後端還沒安裝（請先執行 tc_patch1.sql）' : tcErr(e), 3000); } catch (e2) { /* 略過 */ } return false; }
}
let cuBusy = false;
cuQ('cuget').onclick = async () => { if (cuBusy) return; cuBusy = true; const ok = await cuPay(); cuBusy = false; if (!ok) return; cuClaim(); cuStart(cuName); };
cuQ('cubye').onclick = () => { cuClaim(); cuQuit(); };
cuCv.addEventListener('pointerdown', e => { e.preventDefault(); cuPress(); });
document.addEventListener('keydown', e => {
  if (cuEl.hidden) return;
  if (e.code === 'Space') { e.preventDefault(); e.stopPropagation(); if (!e.repeat || cuSt === 'tap') cuPress(); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cuQuit(); }
}, true);
