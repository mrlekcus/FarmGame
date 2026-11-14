'use strict';
/* 夾盲盒機 + 兌換券商店 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   【玩法】每台機器 1 token 夾一次。按「夾取」後爪子自動左右來回掃，按「停」（空白鍵／Enter）爪子就停在那裡夾下去；
   結果由伺服器 bb_pull 決定（跟爪子位置無關，永遠夾得到），爪子抓離它最近的盲盒、送進出口，接著進入開盒演出。
   【開盒演出】盒子搖晃發光（光的顏色＝稀有度）→ 盒蓋彈開光柱 → 剪影轉盤慢慢停下 → 閃白 → 揭曉；點一下／按鍵可跳過到揭曉。
   重複的獎品變兌換券；兌換券可換 token／木頭石頭銅礦／特別兌換品（bb_coupon_to_token、bb_coupon_to_res、bb_special_buy）。
   【入口】遊戲店內左下角兩台機器：左邊 1 號機（街機電玩）、右邊 2 號機（糖果甜點）。見 arcade.js 的 arcadeAct。
   【後端】bb_backend.sql。前端只負責畫面，所有數字以伺服器回傳為準（bbSet）。
   【不用表情符號】系統字型常常沒有表情符號（會顯示成方框），代幣、兌換券、獎品圖全部用像素畫（bbMk 畫在小畫布上）。 */
const bbS = { tokens: 0, coupons: 0, today_claimed: false, wk_tok: 0, wk_wood: 0, wk_stone: 0, wk_copper: 0, pity: { m1: { rare: 0, legend: 0 }, m2: { rare: 0, legend: 0 } } };
function bbSet(r) {
  if (!r || typeof r !== 'object') return;
  ['tokens', 'coupons', 'wk_tok', 'wk_wood', 'wk_stone', 'wk_copper'].forEach(k => { if (typeof r[k] === 'number') bbS[k] = r[k]; });
  if (typeof r.today_claimed === 'boolean') bbS.today_claimed = r.today_claimed;
  if (r.pity && r.pity.m1 && r.pity.m2) bbS.pity = r.pity;
}
const BB_ERR = { no_token: '沒有 token 了：玩付費場拿第一名，或用兌換券換', no_coupon: '兌換券不夠', week_limit: '這個項目本週的額度用完了，下週一重新計算', token_full: 'token 已經滿 10 個了，先用掉再換', already_owned: '這個已經換過了（每人一個）', bad_machine: '沒有這台機器', pool_empty: '機器還沒補貨，請回報 GM' };
const bbErr = e => { const m = String((e && (e.message || e.msg)) || e || ''); for (const k in BB_ERR) if (m.includes(k)) return BB_ERR[k]; return errText(e); };
const BB_MACH = {
  1: { name: '1號機・街機電玩', cols: ['#8f7df0', '#ff9bb3', '#6ab0e0', '#ffb04d', '#7ad26a', '#c07ae8'], kinds: ['gift', 'star', 'neon', 'gift', 'star', 'neon'] },
  2: { name: '2號機・糖果甜點', cols: ['#ff9bb3', '#ffd34d', '#8fe09a', '#c9a8f5', '#ffb04d', '#6ab0e0'], kinds: ['gift', 'neon', 'gift', 'star', 'gift', 'neon'] }
};
const BB_RAR = { common: ['普通', '#9fb0d0', '#ffffff'], rare: ['稀有', '#5ae0ff', '#5ae0ff'], legend: ['傳說', '#ffd34d', '#ffd34d'] };
const BB_RES = [['wood', '木頭', 8, 40], ['stone', '石頭', 4, 20], ['copper', '銅礦', 2, 10]];
const BB_SPECIAL = [['f:bb_piggy', '投幣存錢筒', 60, '家具'], ['ht:18', '爪爪髮夾', 90, '帽子'], ['ht:19', '盲盒頭套', 100, '帽子'], ['f:bb_boxsofa', '盲盒沙發', 110, '家具'], ['f:bb_miniclaw', '迷你夾娃娃機', 120, '家具'], ['fc:26:4', '盲盒連身裝', 130, '服裝']];
const BB_FDIM = { bb_minicab: [1, 2], bb_neonsign: [1, 1], bb_padrug: [2, 2], bb_robotdoll: [1, 1], bb_icelamp: [1, 1], bb_caketable: [2, 1], bb_marshchair: [1, 1], bb_candyrug: [2, 2], bb_piggy: [1, 1], bb_boxsofa: [2, 1], bb_miniclaw: [1, 2] };
const BB_POOL_KEYS = {
  1: ['f:bb_minicab', 'f:bb_neonsign', 'f:bb_padrug', 'f:bb_robotdoll', 'fc:20:8', 'fc:21:7', 'fc:22:10', 'hs:22', 'hs:23', 'ht:12', 'ht:13', 'ht:14'],
  2: ['f:bb_icelamp', 'f:bb_caketable', 'f:bb_marshchair', 'f:bb_candyrug', 'fc:23:1', 'fc:24:5', 'fc:25:10', 'hs:24', 'hs:25', 'ht:15', 'ht:16', 'ht:17']
};

const BB_POOL = {
  1: [['f:bb_minicab', '迷你街機櫃', 'rare', '家具'], ['f:bb_neonsign', '霓虹招牌', 'common', '家具'], ['f:bb_padrug', '手把地毯', 'common', '家具'], ['f:bb_robotdoll', '機器人玩偶', 'legend', '家具'], ['fc:20:8', '街機夾克', 'rare', '服裝'], ['fc:21:7', '機器人裝', 'common', '服裝'], ['fc:22:10', '愛心T恤', 'common', '服裝'], ['hs:22', '方塊頭', 'rare', '髮型'], ['hs:23', '天線丸子', 'common', '髮型'], ['ht:12', '手把髮箍', 'common', '帽子'], ['ht:13', '機器人盔', 'rare', '帽子'], ['ht:14', '霓虹耳機帽', 'legend', '帽子']],
  2: [['f:bb_icelamp', '冰淇淋燈', 'rare', '家具'], ['f:bb_caketable', '蛋糕桌', 'common', '家具'], ['f:bb_marshchair', '棉花糖椅', 'common', '家具'], ['f:bb_candyrug', '糖果地毯', 'legend', '家具'], ['fc:23:1', '馬卡龍裙', 'rare', '服裝'], ['fc:24:5', '草莓圍裙', 'common', '服裝'], ['fc:25:10', '糖霜帽T', 'common', '服裝'], ['hs:24', '棉花糖捲', 'rare', '髮型'], ['hs:25', '莓果雙馬', 'common', '髮型'], ['ht:15', '布丁帽', 'common', '帽子'], ['ht:16', '甜甜圈圈', 'rare', '帽子'], ['ht:17', '蛋糕皇冠', 'legend', '帽子']]
};
const bbOwn = k => { if (typeof inv !== 'object') return false; if ((inv[k] | 0) > 0) return true; return Object.keys(inv).some(i => i.indexOf(k + ':') === 0 && (inv[i] | 0) > 0); };

/* ---------- 像素圖：畫在小畫布上（用遊戲原本的 r／rr／ob，g 是目前的畫布） ---------- */
function bbMk(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const old = g; g = c.getContext('2d');
  try { fn(); } catch (e) { /* 畫不出來就留空白 */ } finally { g = old; }
  return c;
}
const bbIcoCache = {};
function bbIco(name) {   // 回傳 data URL
  if (bbIcoCache[name]) return bbIcoCache[name];
  let c;
  if (name === 'coin') c = bbMk(10, 10, () => { rr('#b8892a', 0, 0, 10, 10); rr('#ffd34d', 1, 1, 8, 8); r('#fff3b0', 2, 2, 2, 1); r('#b8892a', 4, 3, 2, 5); r('#b8892a', 3, 3, 4, 1); });
  else if (name === 'ticket') c = bbMk(14, 8, () => { ob('#ffd34d', '#b8892a', 0, 0, 14, 8); r('#b8892a', 9, 2, 1, 4); r('#fff3b0', 2, 2, 5, 1); });
  else if (name === 'wood') c = bbMk(18, 12, () => { ob('#b98a62', '#7a5a3a', 1, 2, 16, 8); r('#d9aa80', 2, 3, 14, 1); ob('#e0b88a', '#7a5a3a', 0, 2, 4, 8); r('#7a5a3a', 1, 5, 2, 2); });
  else if (name === 'stone') c = bbMk(18, 12, () => { ob('#b4b8c4', '#6a6e7a', 2, 3, 14, 8); ob('#c8ccd6', '#6a6e7a', 5, 1, 8, 4); r('#e4e8f0', 6, 2, 2, 1); });
  else if (name === 'copper') c = bbMk(18, 12, () => { ob('#d98a52', '#8a4a1c', 2, 3, 14, 8); ob('#e8a070', '#8a4a1c', 5, 1, 8, 4); r('#ffc89a', 6, 2, 2, 1); r('#7ad26a', 10, 6, 2, 2); });
  return (bbIcoCache[name] = c.toDataURL());
}
const bbImg = (name, h) => '<img src="' + bbIco(name) + '" alt="" style="height:' + (h || 16) + 'px;image-rendering:pixelated;vertical-align:-3px">';
/* 獎品圖：家具用家具本身的畫法，帽子／髮型／衣服用角色穿上去的樣子 */
const bbItemCache = {};
function bbItemCanvas(key) {
  if (bbItemCache[key]) return bbItemCache[key];
  const p = key.split(':'); let c;
  if (p[0] === 'f') { const d = BB_FDIM[p[1]] || [1, 1], fn = FURN[p[1]]; c = bbMk(d[0] * 16, d[1] * 16 + 4, () => { if (fn) fn(0, 2, 0); }); }
  else {
    const ch = Object.assign({}, DEF_CHAR, { hat: 3, hair: 0, style: 0, outfit: 0, fits: 0 });
    if (p[0] === 'ht') ch.hat = +p[1];
    if (p[0] === 'hs') { ch.style = +p[1]; ch.hair = 3; }
    if (p[0] === 'fc') { ch.fits = +p[1]; ch.outfit = +p[2]; }
    c = bbMk(24, 30, () => drawPlayer(4, 10, 'down', false, 0, ch));
  }
  c = bbCrop(c);
  return (bbItemCache[key] = c);
}
function bbCrop(c) {
  try {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return c;
    const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, -x0, -y0); return o;
  } catch (e) { return c; }
}
const bbItemURL = key => bbItemCanvas(key).toDataURL();
const bbSilCache = {};
function bbSil(key, dark) {
  const k = key + (dark || ''); if (bbSilCache[k]) return bbSilCache[k];
  const s = bbItemCanvas(key), c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
  const x = c.getContext('2d'); x.drawImage(s, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = dark || 'rgba(8,12,28,.94)'; x.fillRect(0, 0, c.width, c.height);
  return (bbSilCache[k] = c);
}

/* ---------- 盲盒本體（和設計圖同一套畫法） ---------- */
const BB_Q = ['111', '001', '011', '000', '010'];
function bbGlyph(rows, c, x, y, u) { rows.forEach((row, j) => { for (let k = 0; k < row.length; k++) if (row[k] === '1') r(c, x + k * u, y + j * u, u, u); }); }
function bbBox(x, y, kind, col, u) {
  u = u || 1; const W = 18 * u;
  if (kind === 'gift') {
    const body = col, lid = shade(col, 0.8), dk = shade(col, 0.45);
    ob(lid, dk, x, y, W, 5 * u); ob(body, dk, x + u, y + 4 * u, 16 * u, 12 * u);
    r('#ffd34d', x + 8 * u, y + u, 2 * u, 4 * u); r('#ffd34d', x + 8 * u, y + 5 * u, 2 * u, 10 * u);
    r('#ffd34d', x + 5 * u, y - u, 4 * u, 2 * u); r('#ffd34d', x + 10 * u, y - u, 4 * u, 2 * u); r('#fff3b0', x + 3 * u, y + 6 * u, 3 * u, u);
  } else if (kind === 'star') {
    const dk = '#0e0b2b'; ob('#3f3d94', dk, x, y, W, 5 * u); ob('#2b2a6a', dk, x + u, y + 4 * u, 16 * u, 12 * u);
    [[3, 6], [14, 7], [4, 13], [13, 12], [15, 2], [2, 2]].forEach(([a, b]) => r('#ffd34d', x + a * u, y + b * u, u, u));
    bbGlyph(BB_Q, '#ffd34d', x + 7 * u, y + 7 * u, u);
  } else {
    const dk = '#04342c'; ob('#1f8f6e', dk, x, y, W, 5 * u); ob('#3ac79a', dk, x + u, y + 4 * u, 16 * u, 12 * u);
    r('#ff7ab8', x + u, y + 4 * u, 16 * u, 2 * u); r('#ff7ab8', x + u, y + 14 * u, 16 * u, 2 * u); ob('#f4c0d1', dk, x + 6 * u, y + u, 6 * u, 3 * u);
    bbGlyph(BB_Q, '#ffffff', x + 7 * u, y + 7 * u, u);
  }
  r('rgba(255,255,255,.35)', x + 2 * u, y + 5 * u, 4 * u, u);
}
/* 夾娃娃機外殼（畫在 180×200 的邏輯畫布上，座標沿用設計圖，整體往上平移 30） */
const BB_GL = 24, BB_GR = 156;
function bbCabinet() {
  r('#1e2840', 0, 30, 180, 200);
  [[8, 48, '#5ae0ff'], [168, 60, '#ff7ab8'], [6, 120, '#ff7ab8'], [172, 130, '#5ae0ff'], [10, 190, '#5ae0ff'], [170, 196, '#ff7ab8']].forEach(([x, y, c]) => { r(c, x, y - 2, 1, 5); r(c, x - 2, y, 5, 1); });
  r('rgba(0,0,0,.28)', 16, 226, 148, 4);
  ob('#ff8fb0', '#b84a6a', 14, 36, 152, 190); ob('#e0486a', '#b84a6a', 20, 30, 140, 12);
  for (let i = 0; i < 148; i += 8) { r(['#ffd34d', '#5ae0ff'][(i / 8) % 2], 18 + i, 44, 3, 2); r(['#5ae0ff', '#ffd34d'][(i / 8) % 2], 18 + i, 222, 3, 2); }
  ob('#e8f6ff', '#7a8590', 22, 48, 136, 112);
  for (let y = 50; y < 158; y += 6) r(shade('#dcefff', 1 - ((y - 50) / 108) * 0.12), 24, y, 132, 6);
  [[30, 70], [50, 92], [120, 66], [140, 100], [100, 84], [34, 110]].forEach(([x, y]) => { r('#ffffff', x, y - 2, 1, 5); r('#ffffff', x - 2, y, 5, 1); });
  r('#a9bfd8', 24, 142, 132, 16); r('#c9dbee', 24, 142, 132, 1); r('#c9ced6', 24, 50, 132, 4); r('#7a8590', 24, 54, 132, 1);
  r('rgba(255,255,255,.43)', 26, 56, 4, 60); r('rgba(255,255,255,.24)', 32, 56, 2, 40);
  ob('#2a2a3a', '#14141e', 120, 148, 34, 10); r('#0e0e1e', 123, 150, 28, 5); r('#ffd34d', 120, 158, 34, 1);   // 玻璃底板上的出口洞
  ob('#2a2a3a', '#14141e', 120, 166, 34, 22); r('#0e0e1e', 123, 169, 28, 14); r('#ffd34d', 122, 189, 30, 2);   // 出口
  ob('#e0486a', '#b84a6a', 22, 164, 92, 52); r('#ff8fb0', 24, 166, 88, 2);
  ob('#3a3a52', '#1b1b30', 34, 196, 18, 10); r('#7a7f8c', 42, 182, 3, 14); ob('#ff5c7a', '#b83a56', 37, 170, 14, 14); r('#ffb3c9', 39, 172, 4, 3);
  ob('#ffd34d', '#b8892a', 64, 182, 16, 16); r('#fff3b0', 66, 184, 5, 2); ob('#6ab0e0', '#2f6c9a', 86, 186, 12, 12); r('#bff3ff', 88, 188, 3, 2);
  r('#222222', 60, 204, 50, 2);
  for (let i = 0; i < 6; i++) r(['#5ae0ff', '#ff7ab8'][i % 2], 62 + i * 8, 170, 5, 2);
  ob('#2a2a3a', '#14141e', 124, 196, 26, 16); r('#0e0e1e', 130, 202, 14, 3); r('#ffd34d', 132, 203, 10, 1);
  r('#b84a6a', 22, 226, 12, 8); r('#b84a6a', 146, 226, 12, 8);
}


/* ---------- 音效（WebAudio 即時合成，沒有任何音檔；音量跟著遊戲的音樂音量，音樂音量 0 就靜音） ---------- */
let bbAC = null;
function bbAudio() {
  try { if (typeof musicVol === 'number' && musicVol <= 0) return null; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; bbAC = bbAC || new AC(); if (bbAC.state === 'suspended') bbAC.resume(); return bbAC; } catch (e) { return null; }
}
const bbVol = () => (typeof musicVol === 'number' ? Math.max(0.3, musicVol / 100) : 0.7);
const bbHz = m => 440 * Math.pow(2, (m - 69) / 12);
function bbTone(m, t0, dur, type, vol, slide) {   // m＝MIDI 音高；slide＝結束時的音高
  const ac = bbAudio(); if (!ac) return;
  const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime + 0.01 + (t0 || 0), v = (vol || 0.12) * bbVol();
  o.type = type || 'square'; o.frequency.setValueAtTime(bbHz(m), t); if (slide != null) o.frequency.exponentialRampToValueAtTime(bbHz(slide), t + dur);
  gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(gn); gn.connect(ac.destination); o.start(t); o.stop(t + dur + 0.03);
}
function bbNoise(t0, dur, vol, f0, f1) {   // 濾波雜訊（咻、砰、沙沙）
  const ac = bbAudio(); if (!ac) return;
  const n = Math.max(1, Math.floor(ac.sampleRate * dur)), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain(), t = ac.currentTime + 0.01 + (t0 || 0);
  src.buffer = buf; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0 || 800, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime((vol || 0.15) * bbVol(), t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fl); fl.connect(gn); gn.connect(ac.destination); src.start(t); src.stop(t + dur + 0.02);
}
function bbSnd(n, a) {
  try {
    if (n === 'click') bbTone(84, 0, 0.06, 'square', 0.07);
    else if (n === 'coin') { bbTone(83, 0, 0.08, 'square', 0.1); bbTone(88, 0.08, 0.3, 'square', 0.1); }
    else if (n === 'bounce') bbTone(72, 0, 0.05, 'triangle', 0.05);
    else if (n === 'stop') { bbTone(60, 0, 0.09, 'square', 0.14); bbNoise(0, 0.06, 0.12, 2400, 1200); }
    else if (n === 'down') { bbNoise(0, 0.5, 0.09, 1800, 500); bbTone(76, 0, 0.5, 'triangle', 0.06, 52); }
    else if (n === 'grab') { bbNoise(0, 0.08, 0.2, 500, 300); bbTone(48, 0, 0.14, 'square', 0.1); bbTone(55, 0.06, 0.1, 'square', 0.08); }
    else if (n === 'up') bbTone(52, 0, 0.55, 'triangle', 0.07, 70);
    else if (n === 'miss') { bbTone(64, 0, 0.12, 'square', 0.09); bbTone(56, 0.12, 0.25, 'square', 0.09); }
    else if (n === 'drop') { bbTone(79, 0, 0.5, 'sine', 0.08, 55); }
    else if (n === 'thump') { bbNoise(0, 0.18, 0.28, 300, 90); bbTone(45, 0, 0.2, 'sine', 0.22, 33); }
    else if (n === 'rumble') bbNoise(0, 0.14, 0.08 + (a || 0) * 0.14, 120 + (a || 0) * 260, 90);
    else if (n === 'pop') { bbNoise(0, 0.2, 0.22, 3000, 700); bbTone(60, 0, 0.18, 'square', 0.16, 84); bbTone(88, 0.06, 0.3, 'triangle', 0.14); }
    else if (n === 'tick') bbTone(94 - (a || 0) * 6, 0, 0.035, 'square', 0.08 + (a || 0) * 0.04);
    else if (n === 'flash') { bbNoise(0, 0.35, 0.25, 6000, 1500); [84, 91, 96].forEach((m, i) => bbTone(m, i * 0.05, 0.3, 'triangle', 0.1)); }
    else if (n === 'common') { bbTone(72, 0, 0.14, 'square', 0.12); bbTone(79, 0.11, 0.32, 'square', 0.12); }
    else if (n === 'rare') { [72, 76, 79, 84].forEach((m, i) => bbTone(m, i * 0.09, 0.3, 'square', 0.11)); bbTone(91, 0.4, 0.55, 'triangle', 0.13); }
    else if (n === 'legend') {
      [60, 64, 67, 72, 76, 79, 84, 88, 91, 96].forEach((m, i) => { bbTone(m, i * 0.075, 0.45, 'square', 0.09); bbTone(m + 12, i * 0.075 + 0.02, 0.35, 'triangle', 0.06); });
      [72, 76, 79, 84].forEach(m => bbTone(m, 0.85, 1.3, 'triangle', 0.12)); bbNoise(0.8, 1.0, 0.1, 7000, 2500);
    } else if (n === 'dup') { bbTone(76, 0, 0.1, 'triangle', 0.1); bbTone(83, 0.09, 0.1, 'triangle', 0.1); bbTone(88, 0.18, 0.25, 'triangle', 0.1); }
    else if (n === 'cash') { bbTone(88, 0, 0.07, 'square', 0.1); bbTone(95, 0.07, 0.07, 'square', 0.1); bbTone(100, 0.14, 0.3, 'square', 0.1); }
    else if (n === 'err') bbTone(50, 0, 0.18, 'sawtooth', 0.08);
  } catch (e) { /* 沒有音效也沒關係 */ }
}

/* ---------- 狀態 ---------- */
let bbMach = 1, bbView = 'machine', bbTab = 'ex', bbSel = 'ht:19', bbBusy = false, bbRaf = 0;
let bbRv = null;   // 開盒演出：{ r（伺服器結果）, t0, done, parts, strip, ... }
const bbM = { ph: 'idle', cx: 72, headY: 64, sp: 0, t0: 0, from: 0, boxes: [], hold: null, res: null, err: null, fall: 0, tgt: 0, pick: null };
const BB_LO = 28, BB_HI = 132, BB_REST = 64, BB_SWEEP_MS = 2200;
const bbEl = document.createElement('div');
bbEl.id = 'bbbox'; bbEl.hidden = true;
bbEl.style.cssText = 'position:fixed;inset:0;z-index:41;background:#12182c;overflow:auto;-webkit-overflow-scrolling:touch;font-family:inherit;color:#fffaf0';
document.body.appendChild(bbEl);
{
  const st = document.createElement('style');
  st.textContent = `
  #bbbox *{box-sizing:border-box}
  #bbbox .bbw{max-width:480px;margin:0 auto;padding:10px 12px 18px;display:flex;flex-direction:column;gap:10px}
  #bbbox .bbhud{display:flex;gap:8px}
  #bbbox .bbhud>div{flex:1;background:#0e1222;border:3px solid #5ae0ff;padding:6px 8px;font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;justify-content:center}
  #bbbox .bbhud>div+div{border-color:#ff7ab8}
  #bbbox .bbhud>div.cp{border-color:#3cc89a}
  #bbbox .bbtab{display:flex;gap:8px}
  #bbbox button{font:inherit;color:#fffaf0;cursor:pointer;border:3px solid #0a0e1c;background:#6a4fe0;padding:9px 6px;font-weight:700;font-size:15px;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:6px}
  #bbbox button:disabled{opacity:.45;cursor:default}
  #bbbox .bbtab button{flex:1;background:#2a3656;color:#9fb0d0}
  #bbbox .bbtab button.on{background:#ff7ab8;color:#fffaf0}
  #bbbox canvas{width:100%;image-rendering:pixelated;display:block;background:#1e2840}
  #bbbox .bbpity{background:#0e1222;border:3px solid #ffd34d;padding:8px 10px;font-size:13px;display:flex;flex-direction:column;gap:5px}
  #bbbox .bbpity>div{display:flex;justify-content:space-between;color:#fff3b0;font-weight:700}
  #bbbox .seg{display:flex;gap:3px}
  #bbbox .seg i{flex:1;height:9px;background:#2a3656;display:block}
  #bbbox .seg.r i.on{background:#ffd34d}
  #bbbox .seg.l i.on{background:#ff7ab8}
  #bbbox .bbrow{display:flex;gap:8px}
  #bbbox .bbrow button{flex:1}
  #bbbox .bbgo{background:#ff7ab8;flex:2;font-size:18px;padding:12px 6px}
  #bbbox .bbgo.stop{background:#ffd34d;color:#12182c;font-size:22px}
  #bbbox .bbcp{background:#1f8a6a}
  #bbbox .bbcard{background:#12182c;border:3px solid #5ae0ff;padding:10px;display:flex;align-items:center;gap:10px}
  #bbbox .bbcard.y{border-color:#ffd34d}
  #bbbox .bbcard .tx{flex:1;font-size:14px;line-height:1.5}
  #bbbox .bbcard .tx b{font-size:16px}
  #bbbox .bbcard .tx small{color:#9fe1cb;display:block}
  #bbbox .bbgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
  #bbbox .sp{background:#0f3a30;border:3px solid #3cc89a;padding:8px 4px;text-align:center;font-size:13px;cursor:pointer;display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:flex-end;min-height:116px}
  #bbbox .sp.sel{border-color:#ffd34d}
  #bbbox .sp.own{opacity:.5}
  #bbbox .sp .pr{background:#ffd34d;color:#12182c;font-weight:700;padding:2px 8px;display:flex;align-items:center;gap:4px}
  #bbbox .hint{text-align:center;color:#9fb0d0;font-size:12px}
  #bbbox .rvw{max-width:480px;margin:0 auto;padding:6px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:8px}
  #bbbox .rvw canvas{width:auto;height:min(76vh,780px);aspect-ratio:9/16;max-width:100%;cursor:pointer}
  #bbbox .rvb{display:flex;gap:8px;width:100%;max-width:360px}
  #bbbox .rvb button{flex:1}
  `;
  document.head.appendChild(st);
}
const bbSeg = (n, tot, cls) => '<div class="seg ' + cls + '">' + Array.from({ length: tot }, (_, i) => '<i class="' + (i < n ? 'on' : '') + '"></i>').join('') + '</div>';
const bbHud = () => '<div class="bbhud"><div>' + bbImg('coin', 18) + ' 今日 ' + (bbS.today_claimed ? 1 : 0) + '/1</div><div>' + bbImg('coin', 18) + ' 持有 ' + bbS.tokens + '/10</div></div>';
const bbCv = (id, w, h, S) => { const c = $(id); if (!c) return null; if (c.width !== w * S) { c.width = w * S; c.height = h * S; } const x = c.getContext('2d'); x.setTransform(S, 0, 0, S, 0, 0); x.imageSmoothingEnabled = false; return x; };

function openBB(m) {
  if (bbOpen || !ready) return;
  bbMach = m === 2 ? 2 : 1; bbView = 'machine'; bbRv = null; bbBusy = false; bbOpen = true; pressed.length = 0; actHeld = false;
  bbReset(); bbEl.hidden = false; bbRender(); bbLoad();
}
function closeBB() {
  if (!bbOpen) return;
  bbOpen = false; bbEl.hidden = true; bbEl.innerHTML = ''; cancelAnimationFrame(bbRaf); bbRaf = 0; bbRv = null; pressed.length = 0;
  try { refreshHud(); } catch (e) { /* 略過 */ }
}
async function bbLoad() {
  try { bbSet(await rpc('bb_state')); if (bbOpen && !bbBusy && bbView !== 'reveal') bbRender(); }
  catch (e) { const miss = /function|schema cache|PGRST202|404/i.test(String(e && e.message)); if (bbOpen) { toast(miss ? '夾盲盒還沒開放' : bbErr(e)); if (miss) closeBB(); } }
}

/* ---------- 夾娃娃機畫面 ---------- */
function bbReset() {
  const M = BB_MACH[bbMach], b = [];
  for (let i = 0; i < 5; i++) b.push({ x: 26 + i * 19, y: 127 + (i % 2), k: M.kinds[i % 6], c: M.cols[i % 6], on: true });
  for (let i = 0; i < 4; i++) b.push({ x: 36 + i * 19, y: 112, k: M.kinds[(i + 2) % 6], c: M.cols[(i + 3) % 6], on: true });
  for (let i = 0; i < 3; i++) b.push({ x: 46 + i * 23, y: 97, k: M.kinds[(i * 2 + 1) % 6], c: M.cols[(i * 2 + 1) % 6], on: true });
  Object.assign(bbM, { ph: 'idle', cx: 72, headY: BB_REST, sp: 0, hold: null, res: null, err: null, boxes: b, pick: null });
}
const bbEase = p => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
const bbLerp = (a, b, p) => a + (b - a) * p;
let bbCabCv = null, bbCabMach = 0;
function bbDrawMachine(now) {
  const x = bbCv('bbcv', 180, 200, 3); if (!x) return;
  if (!bbCabCv || bbCabMach !== bbMach) {
    bbCabCv = document.createElement('canvas'); bbCabCv.width = 540; bbCabCv.height = 600; const cx_ = bbCabCv.getContext('2d');
    cx_.setTransform(3, 0, 0, 3, 0, -90); cx_.imageSmoothingEnabled = false;
    const old = g; g = cx_; bbCabinet(); g = old; bbCabMach = bbMach;
  }
  x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(bbCabCv, 0, 0); x.setTransform(3, 0, 0, 3, 0, -90);
  const old = g; g = x;
  try {
    const M = bbM;
    bbStep(now);
    M.boxes.forEach(b => { if (b.on) bbBox(b.x, b.y, b.k, b.c, 1); });
    r('rgba(0,0,0,.18)', Math.round(M.cx) - 3, 156, 20, 3);
    const cx = Math.round(M.cx), hy = Math.round(M.headY);
    if (M.fall > 0) { const f = M.fall; x.save(); x.beginPath(); x.rect(0, 30, 180, 128); x.clip(); bbBox(cx - 3, f, M.hold ? M.hold.k : 'gift', M.hold ? M.hold.c : '#8f7df0', 1); x.restore(); }
    else if (M.hold) bbBox(cx - 3, hy + 14, M.hold.k, M.hold.c, 1);
    ob('#c9ced6', '#7a8590', cx - 6, 52, 24, 7); r('#e0486a', cx + 4, 54, 4, 3);
    r('#7a8590', cx + 5, 59, 2, hy - 59);
    ob('#e0486a', '#7a1f3a', cx, hy, 12, 7);
    const sp = Math.round(M.sp);
    r('#c9ced6', cx - 2 - sp, hy + 7, 2, 12); r('#c9ced6', cx - 2 - sp, hy + 17, 5, 2); r('#c9ced6', cx + 12 + sp, hy + 7, 2, 12); r('#c9ced6', cx + 9 + sp, hy + 17, 5, 2);
    if (M.ph === 'sweep') { r('#ffd34d', cx + 5, 50, 2, 2); }
    ob('#2a2a3a', '#14141e', 120, 148, 34, 10); r('#0e0e1e', 123, 150, 28, 5); r('#ffd34d', 120, 158, 34, 1);
    // 「按停」提示
    x.setTransform(3, 0, 0, 3, 0, -90);
  } finally { g = old; }
  x.setTransform(1, 0, 0, 1, 0, 0);
}
/* 狀態機：sweep → drop → grip → lift →（等伺服器）→ move → release → 進入開盒演出 */
function bbStep(now) {
  const M = bbM, el = now - M.t0;
  if (M.ph === 'sweep') {
    const u = ((el / BB_SWEEP_MS) + M.from) % 2, t = u < 1 ? u : 2 - u, dir = u < 1 ? 1 : -1; if (M.dir && dir !== M.dir) bbSnd('bounce'); M.dir = dir; M.cx = BB_LO + (BB_HI - BB_LO) * t;
  } else if (M.ph === 'drop') {
    const p = bbEase(el / 560); M.headY = bbLerp(BB_REST, M.tgt, p); M.sp = bbLerp(0, 7, p);
    if (el >= 560) bbGo('grip', now);
  } else if (M.ph === 'grip') {
    M.sp = bbLerp(7, 3, bbEase(el / 260));
    if (el >= 260) { if (M.pick) { M.hold = { x: M.pick.x, k: M.pick.k, c: M.pick.c }; M.pick.on = false; } bbGo('lift', now); }
  } else if (M.ph === 'lift') {
    M.headY = bbLerp(M.tgt, BB_REST, bbEase(el / 620)); if (el >= 620) bbGo(M.res ? 'move' : 'wait', now);
  } else if (M.ph === 'wait') {
    if (M.err) bbGo('back', now); else if (M.res) bbGo('move', now);
  } else if (M.ph === 'move') {
    M.cx = bbLerp(M.cx0, 131, bbEase(el / 700)); if (el >= 700) { M.fall = M.headY + 14; bbGo('release', now); }
  } else if (M.ph === 'release') {
    M.sp = bbLerp(3, 8, bbEase(el / 200)); M.fall = Math.min(160, M.fall + 0.5 + el * 0.012);
    if (M.fall >= 152) { M.hold = null; M.fall = 0; bbGo('gone', now); bbStartReveal(M.res); }
  } else if (M.ph === 'back') {
    const p = bbEase(el / 600); M.headY = bbLerp(M.tgt || BB_REST, BB_REST, p); M.sp = bbLerp(M.sp, 0, p);
    if (M.hold) { M.hold = null; if (M.pick) M.pick.on = true; }
    if (el >= 620) { M.ph = 'idle'; M.headY = BB_REST; M.sp = 0; bbBusy = false; if (bbOpen && bbView === 'machine') bbRender(); }
  }
}
function bbGo(ph, now) {
  bbM.ph = ph; bbM.t0 = now; if (ph === 'move') bbM.cx0 = bbM.cx;
  if (ph === 'sweep') bbM.dir = 0;
  else if (ph === 'grip') bbSnd(bbM.pick ? 'grab' : 'miss');
  else if (ph === 'lift') bbSnd('up');
  else if (ph === 'release') bbSnd('drop');
  else if (ph === 'gone') bbSnd('thump');
  else if (ph === 'back') bbSnd('err');
}
function bbMachLoop(now) {
  if (!bbOpen || bbView !== 'machine') return;
  bbDrawMachine(now); bbRaf = requestAnimationFrame(bbMachLoop);
}
function bbBtnState() {
  const b = bbEl.querySelector('[data-a="pull"]'); if (!b) return;
  const ph = bbM.ph;
  b.className = 'bbgo' + (ph === 'sweep' ? ' stop' : '');
  b.disabled = !(ph === 'sweep' || (ph === 'idle' && bbS.tokens >= 1 && !bbBusy));
  b.innerHTML = ph === 'sweep' ? '停！夾下去' : ph === 'idle' ? '夾取 ' + bbImg('coin', 18) + '1' : '夾取中…';
}
function bbMainAct() {
  if (bbView !== 'machine') return;
  if (bbM.ph === 'idle') {
    if (bbBusy || bbS.tokens < 1) { if (bbS.tokens < 1) toast(BB_ERR.no_token); return; }
    bbM.from = (bbM.cx - BB_LO) / (BB_HI - BB_LO); bbGo('sweep', performance.now()); bbSnd('coin'); bbBtnState();
  } else if (bbM.ph === 'sweep') bbStop();
}
async function bbStop() {
  const M = bbM, now = performance.now();
  bbBusy = true; M.cx = Math.round(M.cx); M.res = null; M.err = null;
  const live = M.boxes.filter(b => b.on), mid = M.cx + 6;
  live.sort((a, b) => (Math.abs(a.x + 9 - mid) - Math.abs(b.x + 9 - mid)) || (a.y - b.y));
  const pick = live[0]; M.pick = pick || null; M.tgt = pick ? pick.y - 9 : 100;
  bbSnd('stop'); bbGo('drop', now); bbSnd('down'); bbBtnState();
  rpc('bb_pull', { p_machine: bbMach }).then(res => { M.res = res; }, e => { M.err = e; toast(bbErr(e)); });
}

/* ---------- 開盒演出（全程約 5～7 秒，點一下／按鍵跳到揭曉） ---------- */
function bbStartReveal(res) {
  const rar = res.rarity, ra = BB_RAR[rar] || BB_RAR.common;
  const pool = BB_POOL_KEYS[bbMach].filter(k => k !== res.item), strip = [], N = 14;
  for (let i = 0; i < N; i++) { let k; do { k = pool[Math.floor(Math.random() * pool.length)]; } while (i && k === strip[i - 1]); strip.push(k); }
  strip[N - 3] = res.item;
  const shake = { common: 900, rare: 1400, legend: 2200 }[rar] || 900;
  bbRv = { r: res, rar, col: ra[2], t0: performance.now(), strip, N, tIdx: N - 3, A: shake, B: shake + 700, C: shake + 700 + 2300, D: shake + 700 + 2300 + 260, done: false, parts: [], lastP: 0, skipped: false };
  bbView = 'reveal'; bbSet(res); if (!res.duplicate && typeof inv === 'object') inv[res.item] = (inv[res.item] | 0) + 1;
  cancelAnimationFrame(bbRaf);
  bbEl.innerHTML = '<div class="rvw"><canvas id="bbrv" width="540" height="960"></canvas><div class="rvb" id="rvb" style="visibility:hidden"><button data-a="ok">確定</button><button class="bbgo" data-a="again" id="rvagain">再夾一次</button></div><div class="hint">點一下畫面或按空白鍵可以跳過</div></div>';
  bbRaf = requestAnimationFrame(bbRvLoop);
}
function bbRvSkip() { const v = bbRv; if (!v) return; if (!v.skipped && performance.now() - v.t0 < v.D) { v.t0 = performance.now() - v.D - 5; v.skipped = true; } }
function bbPart(v, x, y, col, n, spread, up) {
  for (let i = 0; i < n; i++) v.parts.push({ x: x + (Math.random() - 0.5) * spread, y, vx: (Math.random() - 0.5) * 0.6, vy: up ? -0.3 - Math.random() * 0.9 : (Math.random() - 0.7) * 1.6, c: Array.isArray(col) ? col[(Math.random() * col.length) | 0] : col, l: 0, max: 700 + Math.random() * 600, g: up ? -0.002 : 0.004 });
}
function bbRvLoop(now) {
  const v = bbRv; if (!bbOpen || !v || bbView !== 'reveal') return;
  const x = bbCv('bbrv', 180, 320, 3); if (!x) { bbRaf = requestAnimationFrame(bbRvLoop); return; }
  const t = now - v.t0, dt = Math.min(50, now - (v.lastP || now)); v.lastP = now;
  const old = g; g = x;
  try { bbRvDraw(x, v, t, dt); } finally { g = old; }
  if (t >= v.D + 500 && !v.done) { v.done = true; const b = $('rvb'); if (b) b.style.visibility = 'visible'; const a = $('rvagain'); if (a) { a.disabled = bbS.tokens < 1; a.innerHTML = '再夾一次 ' + bbImg('coin', 18) + '1'; } }
  bbRaf = requestAnimationFrame(bbRvLoop);
}
function bbText(x, s, px, py, size, col, al, bold) {
  x.font = (bold ? 'bold ' : '') + size + 'px ' + (bbText.ff || (bbText.ff = getComputedStyle(document.body).fontFamily || 'sans-serif'));
  x.textAlign = al || 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, px, py);
}
function bbRvDraw(x, v, t, dt) {
  const col = v.col, rar = v.rar, rr_ = v.r;
  if (t < v.A && !v.skipped && (!v.lastR || t - v.lastR > 130)) { v.lastR = t; bbSnd('rumble', Math.min(1, t / v.A)); }
  if (t >= v.A && !v.sPop && !v.skipped) { v.sPop = 1; bbSnd('pop'); }
  if (t >= v.C && !v.sFlash && !v.skipped) { v.sFlash = 1; bbSnd('flash'); }
  if (t >= v.D && !v.sFan) { v.sFan = 1; bbSnd(rar); if (rr_.duplicate) setTimeout(() => bbSnd('dup'), rar === 'legend' ? 1300 : 700); }
  r('#14183a', 0, 0, 180, 320);
  const spin = t / 3000;
  for (let i = 0; i < 14; i++) {   // 背景光芒（慢慢轉）
    const a = i * (Math.PI / 7) + spin, c = i % 2 ? 'rgba(255,122,184,.10)' : 'rgba(122,106,240,.10)';
    x.fillStyle = c; x.beginPath(); x.moveTo(90, 160); x.lineTo(90 + 400 * Math.cos(a), 160 + 400 * Math.sin(a)); x.lineTo(90 + 400 * Math.cos(a + 0.22), 160 + 400 * Math.sin(a + 0.22)); x.fill();
  }
  const bx = 54, by = 118;
  if (t < v.B) {   // 搖晃發光 → 開蓋
    const shakeP = Math.min(1, t / v.A), amp = (rar === 'legend' ? 4 : rar === 'rare' ? 3 : 2) * shakeP + 0.3;
    const dx = t < v.A ? Math.round(Math.sin(t / 38) * amp) : 0, dy = t < v.A ? Math.round(Math.cos(t / 55) * amp * 0.5) : 0;
    const gl = 16 + shakeP * 34 + Math.sin(t / 90) * 3;
    x.globalAlpha = 0.10 + shakeP * 0.16; x.fillStyle = col; x.beginPath(); x.arc(90, 150, gl + 18, 0, 7); x.fill();
    x.globalAlpha = 0.18 + shakeP * 0.2; x.beginPath(); x.arc(90, 150, gl, 0, 7); x.fill(); x.globalAlpha = 1;
    if (t < v.A) {
      if (Math.random() < (rar === 'legend' ? 0.9 : rar === 'rare' ? 0.5 : 0.2)) bbPart(v, 90, 190, rar === 'legend' ? ['#ffd34d', '#fff3b0', '#ff7ab8', '#5ae0ff'] : col, 1, 50, true);
      bbBox(bx + dx, by + dy, 'gift', '#8f7df0', 4);
      if (shakeP > 0.7) { r('rgba(255,255,255,' + (0.15 + 0.25 * Math.sin(t / 50) * Math.sin(t / 50)) + ')', bx + dx, by + dy, 72, 64); }
    } else {   // 蓋子彈開、光柱
      const p = (t - v.A) / 700, lift = bbEase(p) * 70;
      x.fillStyle = 'rgba(255,243,176,' + (0.45 * (1 - p * 0.4)) + ')'; x.beginPath(); x.moveTo(bx + 12, by + 16); x.lineTo(bx + 60, by + 16); x.lineTo(bx + 120, 0); x.lineTo(bx - 60, 0); x.fill();
      ob('#8f7df0', shade('#8f7df0', 0.45), bx + 4, by + 16, 64, 48); r('#ffd34d', bx + 32, by + 20, 8, 40);
      ob(shade('#8f7df0', 0.8), shade('#8f7df0', 0.45), bx, by - lift, 72, 20); r('#ffd34d', bx + 32, by - lift + 4, 8, 16);
      if (Math.random() < 0.6) bbPart(v, 90, by + 10, ['#fff3b0', col], 1, 50, true);
    }
  } else if (t < v.D) {   // 轉盤：剪影快速轉動 → 慢下來 → 框變稀有度色 → 閃白
    const p = Math.min(1, (t - v.B) / 2300), ep = 1 - Math.pow(1 - p, 3.2), slot = 66, pos = v.tIdx * ep;
    const fc = p > 0.62 ? col : '#ffd34d';
    ob('#0e1222', fc, 10, 104, 160, 100);
    x.save(); x.beginPath(); x.rect(12, 106, 156, 96); x.clip();
    for (let i = 0; i < v.N; i++) {
      const cx = 90 + (i - pos) * slot; if (cx < -40 || cx > 220) continue;
      const k = v.strip[i], c = bbSil(k), sc = i === v.tIdx && p > 0.97 ? 3 : 2.4;
      const w = c.width * sc, h = c.height * sc;
      x.imageSmoothingEnabled = false; x.drawImage(c, Math.round(cx - w / 2), Math.round(154 - h / 2), w, h);
    }
    if (p < 0.8) { x.fillStyle = 'rgba(255,255,255,' + 0.10 * (1 - p) + ')'; for (let yy = 108; yy < 200; yy += 7) x.fillRect(12, yy, 156, 2); }
    x.restore();
    const tick = Math.floor(pos + 0.5); if (tick !== v.lastTick) { v.lastTick = tick; if (!v.skipped) bbSnd('tick', ep); }
    r(fc, 86, 98, 8, 4); r(fc, 87, 102, 6, 2); r(fc, 86, 206, 8, 4); r(fc, 87, 204, 6, 2);
    bbText(x, p < 0.62 ? '嗒嗒嗒嗒…' : '嗒…　嗒…', 90, 80, 9, fc, 'center', true);
    if (t > v.C) {   // 閃白
      const q = (t - v.C) / 260; const c = bbItemCanvas(rr_.item), sc = 3; x.imageSmoothingEnabled = false;
      x.drawImage(c, Math.round(90 - c.width * sc / 2), Math.round(154 - c.height * sc / 2), c.width * sc, c.height * sc);
      x.globalAlpha = 1 - q * 0.9; x.fillStyle = '#ffffff'; x.fillRect(0, 0, 180, 320); x.globalAlpha = 1;
    }
  } else {   // 揭曉
    const q = (t - v.D) / 1000, pop = q < 0.45 ? bbEase(q / 0.45) * 1.15 : 1.15 - Math.min(0.15, (q - 0.45) * 0.5);
    const rays = rar === 'legend' ? 16 : rar === 'rare' ? 12 : 8, rc = rar === 'legend' ? ['rgba(255,92,122,.22)', 'rgba(255,211,77,.26)', 'rgba(90,224,255,.22)', 'rgba(143,224,154,.22)'] : [rar === 'rare' ? 'rgba(90,224,255,.22)' : 'rgba(255,255,255,.16)'];
    for (let i = 0; i < rays; i++) {
      const a = i * (2 * Math.PI / rays) - t / 1800; x.fillStyle = rc[i % rc.length];
      x.beginPath(); x.moveTo(90, 120); x.lineTo(90 + 300 * Math.cos(a), 120 + 300 * Math.sin(a)); x.lineTo(90 + 300 * Math.cos(a + 0.2), 120 + 300 * Math.sin(a + 0.2)); x.fill();
    }
    x.globalAlpha = 0.28; x.fillStyle = col; x.beginPath(); x.arc(90, 120, 58 + Math.sin(t / 200) * 3, 0, 7); x.fill(); x.globalAlpha = 1;
    if (!v.burst) { v.burst = true; bbPart(v, 90, 120, ['#ff7ab8', '#5ae0ff', '#ffd34d', '#8fe09a', col], rar === 'legend' ? 70 : rar === 'rare' ? 40 : 18, 20, false); }
    const c = bbItemCanvas(rr_.item), k = (rr_.item.charAt(0) === 'f' ? 4.2 : 3.3) * Math.max(0.1, pop); x.imageSmoothingEnabled = false;
    x.drawImage(c, Math.round(90 - c.width * k / 2), Math.round(120 - c.height * k / 2), Math.round(c.width * k), Math.round(c.height * k));
    bbText(x, '拆開盲盒！', 90, 22, 11, '#ffd34d', 'center', true);
    if (rar === 'legend') bbText(x, 'LEGEND!', 90, 40, 14 + Math.round(Math.sin(t / 120) * 1), ['#fff3b0', '#ffd34d', '#ff9bb3'][Math.floor(t / 120) % 3], 'center', true);
    const ra = BB_RAR[rar] || BB_RAR.common;
    ob(ra[1], '#0a0e1c', 40, 190, 100, 15); bbText(x, ra[0] + '  ' + rr_.kind, 90, 197.5, 8, '#12182c', 'center', true);
    bbText(x, rr_.name, 90, 220, 13, '#ffffff', 'center', true);
    if (rr_.duplicate) {
      bbText(x, '已擁有', 90, 238, 9, '#ff9bb3', 'center', true);
      ob('#ffd34d', '#b8892a', 44, 247, 92, 18); r('#b8892a', 100, 251, 1, 10);
      bbText(x, '兌換券 +' + rr_.coupon_gain, 90, 256, 9, '#12182c', 'center', true);
    } else bbText(x, '已放入背包', 90, 242, 9, '#9fe1cb', 'center', true);
    bbText(x, (rr_.pityMsg || '') + '持有 token ' + bbS.tokens + ' / 10', 90, 284, 6.5, '#fff3b0', 'center', false);
    if (rar === 'legend' && t - v.D < 450) { x.globalAlpha = 0.8 * (1 - (t - v.D) / 450); x.fillStyle = '#fff3b0'; x.fillRect(0, 0, 180, 320); x.globalAlpha = 1; }
  }
  // 粒子
  for (let i = v.parts.length - 1; i >= 0; i--) {
    const p = v.parts[i]; p.l += dt; p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.vy += p.g * dt; if (p.l > p.max) { v.parts.splice(i, 1); continue; }
    x.globalAlpha = 1 - p.l / p.max; r(p.c, Math.round(p.x), Math.round(p.y), 2, 2); x.globalAlpha = 1;
  }
}

/* ---------- 畫面 ---------- */
function bbRender() {
  if (!bbOpen) return;
  cancelAnimationFrame(bbRaf); bbRaf = 0;
  const top = '<div class="bbw">';
  if (bbView === 'machine') {
    const p = bbS.pity['m' + bbMach];
    bbEl.innerHTML = top + bbHud() + '<div class="bbtab"><button data-a="m1" class="' + (bbMach === 1 ? 'on' : '') + '">1號機 街機電玩</button><button data-a="m2" class="' + (bbMach === 2 ? 'on' : '') + '">2號機 糖果甜點</button></div>' +
      '<canvas id="bbcv" width="540" height="600"></canvas>' +
      '<div class="bbpity"><div><span>稀有保底</span><span>' + Math.min(5, p.rare) + ' / 5</span></div>' + bbSeg(Math.min(5, p.rare), 5, 'r') +
      '<div><span>傳說保底</span><span>' + Math.min(30, p.legend) + ' / 30</span></div>' + bbSeg(Math.min(30, p.legend), 30, 'l') + '</div>' +
      '<button data-a="dex" style="background:#8f7df0">獎品一覽</button><div class="bbrow"><button class="bbcp" data-a="shop">' + bbImg('ticket', 16) + ' 券 ' + bbS.coupons + '</button><button class="bbgo" data-a="pull">夾取</button></div>' +
      '<div class="hint">空白鍵／Enter：夾取、停　←→：換機器　Esc：離開</div>' +
      '<button data-a="leave" style="background:#2a3656">離開</button></div>';
    bbBtnState(); bbRaf = requestAnimationFrame(bbMachLoop);
  } else if (bbView === 'dex') {
    bbEl.innerHTML = top + bbDexHtml() + '<div class="hint">Esc／空白鍵：返回</div><button data-a="dexback" style="background:#6a4fe0">返回</button></div>';
  } else if (bbView === 'shop') {
    bbEl.innerHTML = top + '<div class="bbhud"><div style="color:#ffd34d">兌換券商店</div><div class="cp">' + bbImg('ticket', 16) + ' ' + bbS.coupons + '</div></div>' +
      '<div class="bbtab"><button data-a="tex" class="' + (bbTab === 'ex' ? 'on' : '') + '">兌換</button><button data-a="tsp" class="' + (bbTab === 'sp' ? 'on' : '') + '">特別兌換品</button></div>' +
      (bbTab === 'ex' ? bbExHtml() : bbSpHtml()) +
      '<div class="bbcard y" style="justify-content:center;font-weight:700">持有 token ' + bbS.tokens + '/10 ・ 兌換券 ' + bbS.coupons + ' 張</div>' +
      '<div class="hint">←→：換分頁　Esc：回夾盲盒機</div>' +
      '<button data-a="back" style="background:#6a4fe0">回夾盲盒機</button></div>';
  }
}
function bbDexHtml() {
  const L = BB_POOL[bbMach], own = L.filter(p => bbOwn(p[0])).length;
  let h = '<div class="bbhud"><div style="color:#ffd34d">' + BB_MACH[bbMach].name + '</div><div class="cp">已收集 ' + own + '/12</div></div>';
  [['legend', '2%'], ['rare', '28%'], ['common', '70%']].forEach(([rk, pc]) => {
    const ra = BB_RAR[rk]; h += '<div style="color:' + ra[1] + ';font-weight:700;font-size:15px;margin-top:2px">' + ra[0] + '　' + pc + '</div>';
    L.filter(p => p[2] === rk).forEach(p => {
      const c = bbItemCanvas(p[0]), s = Math.min(3, 46 / Math.max(c.width, c.height));
      const o = bbOwn(p[0]);
      h += '<div class="bbcard" style="border-color:' + ra[1] + ';padding:6px 10px"><div style="width:48px;height:44px;display:flex;align-items:center;justify-content:center"><img src="' + bbItemURL(p[0]) + '" alt="" style="width:' + Math.round(c.width * s) + 'px;height:' + Math.round(c.height * s) + 'px;image-rendering:pixelated"></div><div class="tx"><b>' + p[1] + '</b><small style="color:#9fb0d0">' + p[3] + '</small></div><span style="font-weight:700;color:' + (o ? '#8fe09a' : '#9fb0d0') + '">' + (o ? '已擁有' : '未擁有') + '</span></div>';
    });
  });
  return h;
}
function bbExHtml() {
  let h = '<div class="bbcard y"><div class="tx"><b>' + bbImg('coin', 18) + ' 換 token</b><small>5 券 = 1 token ・ 本週 ' + bbS.wk_tok + ' / 3</small></div><button data-a="c2t"' + (bbS.coupons < 5 || bbS.wk_tok >= 3 || bbS.tokens >= 10 ? ' disabled' : '') + '>兌換</button></div>' +
    '<div style="text-align:center;color:#9fe1cb;font-size:14px">用券換資源 ・ 每週限量</div>';
  BB_RES.forEach(([k, n, rate, cap]) => {
    const used = bbS['wk_' + k];
    h += '<div class="bbcard"><div class="tx"><b>' + bbImg(k, 20) + ' ' + n + '</b><small>1 券 = ' + rate + ' 個 ・ 本週 ' + used + ' / ' + cap + '</small></div><button data-a="res" data-k="' + k + '"' + (bbS.coupons < 1 || used + rate > cap ? ' disabled' : '') + '>兌換</button></div>';
  });
  return h;
}
function bbSpHtml() {
  const own = k => (typeof have === 'function' ? have(k) : 0) > 0;
  const sel = BB_SPECIAL.find(x => x[0] === bbSel) || BB_SPECIAL[0];
  const im = k => { const c = bbItemCanvas(k), s = Math.min(3, 64 / Math.max(c.width, c.height)); return '<img src="' + bbItemURL(k) + '" alt="" style="width:' + Math.round(c.width * s) + 'px;height:' + Math.round(c.height * s) + 'px;image-rendering:pixelated">'; };
  return '<div class="bbgrid">' + BB_SPECIAL.map(x => '<div class="sp' + (x[0] === sel[0] ? ' sel' : '') + (own(x[0]) ? ' own' : '') + '" data-a="sel" data-k="' + x[0] + '">' + im(x[0]) + '<div>' + x[1] + '</div>' + (own(x[0]) ? '<div class="pr" style="background:#5a6a8a;color:#fff">已兌換</div>' : '<div class="pr">' + bbImg('ticket', 12) + ' ' + x[2] + '</div>') + '</div>').join('') + '</div>' +
    '<div class="bbcard y"><div class="tx"><b>' + sel[1] + '</b><br>' + sel[3] + ' ・ ' + sel[2] + ' 券<small>只能用券換，每人一個</small></div><button data-a="spbuy" data-k="' + sel[0] + '" style="background:#ff7ab8"' + (own(sel[0]) || bbS.coupons < sel[2] ? ' disabled' : '') + '>兌換</button></div>';
}
async function bbCall(name, args, okMsg) {
  if (bbBusy) return; bbBusy = true;
  try {
    const r_ = await rpc(name, args);
    bbSet(r_);
    if (r_ && r_.inv && typeof inv === 'object') Object.assign(inv, r_.inv);
    if (r_ && r_.item && typeof inv === 'object') inv[r_.item] = Math.max(1, inv[r_.item] | 0);
    bbSnd('cash'); toast(typeof okMsg === 'function' ? okMsg(r_) : okMsg);
  } catch (e) { bbSnd('err'); toast(bbErr(e)); }
  bbBusy = false; if (bbOpen) bbRender();
}
function bbBackToMachine() { bbRv = null; bbView = 'machine'; bbBusy = false; bbReset(); bbRender(); }
bbEl.addEventListener('click', e => {
  if (e.target.id === 'bbrv') { bbRvSkip(); return; }
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  const a = b.dataset.a, k = b.dataset.k; b.blur(); if (a !== 'pull') bbSnd('click');
  if (a === 'm1' || a === 'm2') { if (!bbBusy && bbM.ph === 'idle') { bbMach = a === 'm2' ? 2 : 1; bbReset(); bbRender(); } }
  else if (a === 'pull') bbMainAct();
  else if (a === 'ok') bbBackToMachine();
  else if (a === 'again') { bbBackToMachine(); if (bbS.tokens >= 1) bbMainAct(); }
  else if (a === 'shop') { if (bbM.ph === 'idle') { bbView = 'shop'; bbRender(); } }
  else if (a === 'dex') { if (bbM.ph === 'idle') { bbView = 'dex'; bbRender(); } }
  else if (a === 'dexback') { bbView = 'machine'; bbRender(); }
  else if (a === 'back') { bbView = 'machine'; bbRender(); }
  else if (a === 'leave') { if (bbM.ph === 'idle' || bbM.ph === 'sweep') closeBB(); }
  else if (a === 'tex') { bbTab = 'ex'; bbRender(); }
  else if (a === 'tsp') { bbTab = 'sp'; bbRender(); }
  else if (a === 'sel') { bbSel = k; bbRender(); }
  else if (a === 'c2t') bbCall('bb_coupon_to_token', {}, '5 券換到 1 個 token');
  else if (a === 'res') bbCall('bb_coupon_to_res', { p_res: k, p_coupons: 1 }, r_ => '換到 ' + r_.units + ' 個' + (BB_RES.find(x => x[0] === k) || [0, ''])[1]);
  else if (a === 'spbuy') bbCall('bb_special_buy', { p_item: k }, r_ => '換到「' + r_.name + '」！');
});
/* 鍵盤：空白鍵／Enter＝夾取、停、跳過、確定；←→＝換機器或分頁；Esc＝返回或離開 */
document.addEventListener('keydown', e => {
  if (!bbOpen) return;
  const k = e.key; if (!['Escape', ' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(k)) return;
  e.preventDefault(); e.stopPropagation(); if (e.repeat) return;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  if (bbView === 'reveal') {
    if (!bbRv) return;
    if (!bbRv.done) bbRvSkip();
    else if (k === ' ' || k === 'Enter') { bbBackToMachine(); if ((k === ' ' || k === 'Enter') && bbS.tokens >= 1 && false) bbMainAct(); }
    else if (k === 'Escape') bbBackToMachine();
    return;
  }
  if (bbView === 'dex') { if (k === 'Escape' || k === ' ' || k === 'Enter') { bbView = 'machine'; bbRender(); } return; }
  if (bbView === 'shop') {
    if (k === 'Escape') { bbView = 'machine'; bbRender(); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { bbTab = 'ex'; bbRender(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { bbTab = 'sp'; bbRender(); }
    return;
  }
  if (k === 'Escape') { if (bbM.ph === 'idle' || bbM.ph === 'sweep') closeBB(); }
  else if (k === ' ' || k === 'Enter') bbMainAct();
  else if (bbM.ph === 'idle' && !bbBusy) { bbMach = (k === 'ArrowLeft' || k === 'a' || k === 'A') ? 1 : 2; bbReset(); bbRender(); }
}, true);
