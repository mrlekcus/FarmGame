'use strict';
/* 圖鑑 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* ---------- 圖鑑（魚類收集，隨時可開） ---------- */
const dexEl = $('dexm'), dexCard = $('dexcard');
let dexTab = 'fish', dexBusy = false;
let dexSel = null;   // 目前點開詳情的 { bug: bool, key }
/* 淡水魚出沒條件（和 SQL fish 表一致：時段、天氣、季節、地點、等級）；伺服器有回傳同名欄位時以伺服器為準 */
const FISH_COND = {
  amberfish: ['any', 'any', 'autumn,winter', 'forest', 5], bass: ['dusk', 'any', 'autumn,winter', 'any', 1], boot: ['any', 'any', 'any', 'any', 1],
  carp: ['day', 'any', 'any', 'any', 1], catfish: ['night', 'any', 'summer,autumn', 'any', 1], crucian: ['any', 'any', 'any', 'any', 1],
  eel: ['any', 'rain', 'summer,autumn', 'any', 1], koi: ['day', 'clear', 'spring,summer', 'any', 1], maplefish: ['any', 'any', 'autumn', 'forest', 5],
  minnow: ['any', 'any', 'any', 'any', 1], moonfish: ['night', 'clear', 'autumn,winter', 'any', 1], mosstrout: ['any', 'any', 'spring,summer', 'forest', 5],
  rainbow: ['any', 'rain', 'spring,autumn', 'any', 1], sunfish: ['day', 'clear', 'summer', 'any', 1], tilapia: ['dawn', 'any', 'spring,summer', 'any', 1]
};
const FISH_SZ = { amberfish: '15～35 cm', bass: '25～60 cm', boot: '20～35 cm', carp: '30～80 cm', catfish: '30～110 cm', crucian: '10～30 cm', eel: '40～100 cm', koi: '40～90 cm', maplefish: '12～30 cm', minnow: '4～10 cm', moonfish: '50～120 cm', mosstrout: '18～40 cm', rainbow: '20～60 cm', sunfish: '10～25 cm', tilapia: '15～40 cm' };
const DEX_PH = { dawn: ['清晨', '🌅', '05～08 點', [[5, 8]]], day: ['白天', '☀️', '08～17 點', [[8, 17]]], dusk: ['黃昏', '🌇', '17～20 點', [[17, 20]]], night: ['夜晚', '🌙', '20～05 點', [[20, 24], [0, 5]]] };
const DEX_SEA4 = ['spring', 'summer', 'autumn', 'winter'];
function dexCond(f, isBug) {
  const d = isBug ? [] : (FISH_COND[f.key] || []);
  return { phase: f.phase || d[0] || 'any', weather: f.weather || d[1] || 'any', seasons: f.seasons || d[2] || 'any', zone: f.zone || d[3] || 'any', lv: +(f.min_lv || d[4] || 1) };
}
/* 圖鑑格子上的小標示：四個小方塊 = 春夏秋冬（亮的是會出現的季節）＋時段／天氣小圖示 */
function dexMini(f, isBug) {
  if (!isBug && habitatOf(f) !== 'fresh') return '';
  const c = dexCond(f, isBug), on = c.seasons === 'any' ? DEX_SEA4 : c.seasons.split(',');
  const sq = c.seasons === 'any' ? '' : DEX_SEA4.map(x => '<b class="' + (on.includes(x) ? 'on' : '') + '"></b>').join('');
  const ic = (DEX_PH[c.phase] ? DEX_PH[c.phase][1] : '') + (c.weather === 'rain' ? '🌧' : c.weather === 'clear' ? '☀' : '');
  return sq || ic ? '<span class="dxmini">' + sq + (ic ? '<i>' + ic + '</i>' : '') + '</span>' : '';
}
/* ---------- 圖鑑品質 1～5 星：只記在圖鑑（最高星），背包物品不分星級、賣價不變 ---------- */
const STAR_N = ['', '普通', '不錯', '優良', '極品', '傳說'];
const starKey = (kind, key) => kind + ':' + key;
const starBest = (kind, key) => starLog[starKey(kind, key)] | 0;
const starsHtml = (n, tot) => { n = Math.max(0, Math.min(5, n | 0)); tot = tot || 5; let o = ''; for (let i = 1; i <= tot; i++) o += '<s class="' + (i <= n ? 'on' : '') + '">★</s>'; return '<span class="stars" aria-label="' + n + ' 星">' + o + '</span>'; };
const starsText = n => '★'.repeat(Math.max(0, Math.min(5, n | 0))) + '☆'.repeat(5 - Math.max(0, Math.min(5, n | 0)));
/* 釣到／抓到／煮出後，請伺服器擲這一次的星級（伺服器擲骰，只收等級當加成），回傳 { star, best, up }；舊伺服器沒有這個函式就當作沒有星級 */
async function starRoll(kind, key, opt) {
  const o = opt || {}, L = kind === 'fish' ? (lv && +lv.fish) : kind === 'bug' ? (lv && +lv.bug) : kind === 'crop' ? (lv && +lv.farm) : (lv && +lv.cook);
  try {
    const r = await rpc('star_roll', { p_kind: kind, p_key: key, p_lv: Math.max(1, Math.min(12, L | 0 || 1)), p_perfect: !!o.perfect });
    if (!r || !r.star) return null;
    const k = starKey(kind, key), prev = starLog[k] | 0;
    starLog[k] = Math.max(prev, r.best | 0 || r.star | 0);
    const res = { star: r.star | 0, best: starLog[k], up: (r.star | 0) > prev, first5: (r.star | 0) >= 5 && prev < 5 };
    if (res.first5) { setTimeout(() => starFive(kind, key), 500); sendStar5(kind, key); }   // 第一次達到 ★5：全螢幕驚喜（先讓釣到／煮出的彈窗出現）
    return res;
  } catch (e) { return null; }
}
const starToast = (name, s) => { if (s) toast(name + ' ' + starsText(s.star) + '（' + STAR_N[s.star] + '）' + (s.up && s.star > 1 ? ' 圖鑑新高！' : '')); };
/* 圖鑑某一類裡，集到幾種 ★5、幾種有星級紀錄 */
function starCount(kind, keys) { let five = 0, any = 0; keys.forEach(k => { const b = starBest(kind, k); if (b > 0) any++; if (b >= 5) five++; }); return { five, any, tot: keys.length }; }
/* 第一次把某一種做到 ★5：全螢幕金色光芒（點一下或 4 秒後自動關閉）；每一種只會出現一次 */
let star5El = null, star5T = 0;
function starFive(kind, key) {
  if (star5El) closeStarFive();
  const name = kind === 'crop' ? (CROPS[key] ? CROPS[key].n : key) : (typeof itemName === 'function' ? itemName(kind + ':' + key) : key);
  const el = document.createElement('div'); el.className = 'star5'; el.setAttribute('role', 'dialog');
  el.innerHTML = '<div class="s5rays"></div><div class="s5glow"></div><div class="s5stars">★★★★★</div>' +
    '<div class="s5box"><canvas width="16" height="16"></canvas></div><div class="s5name">' + esc(name) + '　傳說！</div><div class="s5sub">圖鑑第一次達到 ★5　點一下繼續</div>';
  document.body.appendChild(el); star5El = el;
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  if (kind === 'fish') drawFish(g, key, false); else if (kind === 'bug') drawBug(g, key, false); else if (kind === 'crop') cropIcon(g, key); else dishIcon(g, key);
  el.addEventListener('pointerdown', e => { e.stopPropagation(); closeStarFive(); });
  clearTimeout(star5T); star5T = setTimeout(closeStarFive, 4000);
  try { if (navigator.vibrate) navigator.vibrate([40, 50, 40, 50, 80]); } catch (_) {}
}
function closeStarFive() { clearTimeout(star5T); if (star5El) { star5El.remove(); star5El = null; } }

/* ---------- 第一次 ★5：附近的玩家也看得到（頭上星光氣泡＋金光環星星），而且可以幫你拍手 ----------
   只在同步的場景（廣場、塔羅、船、有網路的屋子）才會廣播；農場、森林只有自己看得到。 */
const S5_MS = 4500, S5_CLAP_MS = 8000;
let myS5 = null;
const s5Label = (kind, key) => {
  const c = kind === 'crop' ? (CROPS[key] ? { name: CROPS[key].n } : null) : kind === 'fish' ? fishCat.find(x => x.key === key) : kind === 'bug' ? bugCat.find(x => x.key === key) : recipes.find(x => x.key === key);
  return c ? String(c.name || '').slice(0, 6) : '';
};
function sendStar5(kind, key) {
  const label = s5Label(kind, key); if (!label) return;
  myS5 = { at: performance.now(), label };
  if (syncScene() && net && net.ok) {
    try { net.ch.send({ type: 'broadcast', event: 'st5', payload: { i: myUid, k: 's', d: kind, e: key } }); } catch (e) { /* 略過 */ }
  }
}
let lastClapToast = 0, claps5 = 0;
function onStar5(p) {
  if (!p || typeof p !== 'object' || p.i === myUid) return;
  const rp = typeof p.i === 'string' ? remotes.get(p.i) : null;
  if (!rp || !hereRp(rp)) return;
  if (p.k === 's') {   // 有人第一次 ★5：只認得圖鑑裡有的東西
    if (!['fish', 'bug', 'dish', 'crop'].includes(p.d) || typeof p.e !== 'string') return;
    const label = s5Label(p.d, p.e); if (!label) return;
    rp.s5 = { at: performance.now(), label, clapped: false };
  } else if (p.k === 'c' && p.to === myUid && myS5 && performance.now() - myS5.at < 60000) {   // 有人幫我拍手
    claps5++;
    const t = Date.now();
    if (t - lastClapToast > 500) { lastClapToast = t; toast('👏 ' + clean(rp.name || '', 8) + ' 幫你拍手！（' + claps5 + '）', 2200); }
  }
}
/* 畫：金光環＋繞著轉的星星＋頭上氣泡（cx, cy = 角色中心；py = 角色上緣） */
function s5Fx(s, px, py, now) {
  const age = now - s.at; if (age < 0 || age > S5_MS) return;
  const fade = age > 3500 ? (S5_MS - age) / 1000 : Math.min(1, age / 200);
  const cx = px + 8, cy = py + 9;
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 16);
  g.addColorStop(0, 'rgba(255,236,150,.95)'); g.addColorStop(.5, 'rgba(255,214,90,.45)'); g.addColorStop(1, 'rgba(255,214,90,0)');
  ctx.globalAlpha = .75 * fade; ctx.fillStyle = g; ctx.fillRect(cx - 16, cy - 16, 32, 32);
  ctx.globalAlpha = fade;
  for (let k = 0; k < 6; k++) {
    const an = now / 420 + k * Math.PI / 3, rr = 9 + Math.sin(now / 250 + k) * 2, rise = ((age / 40 + k * 9) % 24);
    const x = Math.round(cx + Math.cos(an) * rr), y = Math.round(cy + Math.sin(an) * rr * .8 - rise * .4);
    r('#ffd34d', x, y, 2, 2); r('#fff6cf', x, y, 1, 1);
    if (k % 2) { r('#ffd34d', x - 1, y, 1, 1); r('#ffd34d', x + 2, y, 1, 1); }
  }
  const txt = s.label + ' ', stars = '★★★★★';
  ctx.font = '800 6px "Chiron GoRound TC", "Noto Sans TC", sans-serif'; ctx.textAlign = 'left';
  const w1 = ctx.measureText(txt).width, w2 = ctx.measureText(stars).width, w = Math.round(w1 + w2 + 8);
  const bx = Math.round(cx - w / 2), by = Math.round(py - 22 + Math.sin(now / 200));
  ob('#ffffff', '#f0a020', bx, by, w, 11);
  r('#f0a020', Math.round(cx) - 1, by + 11, 3, 1); r('#ffffff', Math.round(cx), by + 10, 1, 1);
  ctx.textBaseline = 'middle'; ctx.fillStyle = '#8e5bd0'; ctx.fillText(txt, bx + 4, by + 6);
  ctx.fillStyle = '#f0a020'; ctx.fillText(stars, bx + 4 + w1, by + 6);
  ctx.restore();
}
function drawStar5(now, rx, ry) {
  if (myS5 && now - myS5.at <= S5_MS) s5Fx(myS5, Math.round(rx * T), Math.round(ry * T), now);
  if (!syncScene()) return;
  remotes.forEach(rp => {
    if (!rp.s5 || !hereRp(rp)) return;
    const px = Math.round(rp.x * T), py = Math.round(rp.y * T);
    s5Fx(rp.s5, px, py, now);
    if (now - rp.s5.at <= S5_MS) nameTag(rp.name, px + 8, py - 5, '#ffd34d');   // 名字變金色
  });
}
/* 「拍手」按鈕：附近有人剛達到 ★5 的時候出現幾秒，點一下頭上冒出 👏，對方會收到通知 */
let cheer5El = null, cheer5Rp = null;
function updateCheer5() {
  if (!cheer5El) {
    const base = $('cheer'); if (!base) return;
    cheer5El = document.createElement('button'); cheer5El.type = 'button'; cheer5El.className = 'cheer'; cheer5El.id = 'cheer5'; cheer5El.hidden = true;
    base.after(cheer5El);
    cheer5El.addEventListener('click', () => {
      const rp = cheer5Rp; if (!rp || !rp.s5 || rp.s5.clapped) return;
      rp.s5.clapped = true; cheer5El.hidden = true;
      doEmote('e', 'clap');
      if (syncScene() && net && net.ok) { try { net.ch.send({ type: 'broadcast', event: 'st5', payload: { i: myUid, k: 'c', to: rp.id } }); } catch (e) { /* 略過 */ } }
    });
  }
  const now = performance.now(); let hit = null;
  if (syncScene() && !cooking && !fishing) remotes.forEach(rp => {
    const s = rp.s5;
    if (!s || s.clapped || !hereRp(rp) || now - s.at > S5_CLAP_MS) return;
    if (Math.abs(rp.tx - pl.x) + Math.abs(rp.ty - pl.y) > 14) return;
    if (!hit || s.at > hit.s5.at) hit = rp;
  });
  cheer5Rp = hit;
  cheer5El.hidden = !hit;
  if (hit) cheer5El.textContent = '👏 為 ' + clean(hit.name || '', 8) + ' 拍手';
}
const dexN = n => n >= 999 ? '999+' : n;   // 圖鑑上的數量最多顯示 999+（伺服器也只記到 999）
const dexdEl = document.createElement('div');
dexdEl.className = 'maker dexd'; dexdEl.hidden = true; dexdEl.innerHTML = '<div class="card maker-card dexdc" tabindex="-1"></div>';
dexEl.after(dexdEl);
const dexdCard = dexdEl.firstChild;
function closeDexDetail() { dexSel = null; dexdEl.hidden = true; }
/* 點開某一格：只有解鎖過（釣到／抓到過）的才看得到所有資料 */
function openDexDetail(key, isBug) {
  const cat = isBug ? bugCat : fishCat, log = isBug ? bugLog : fishLog, f = cat.find(x => x.key === key);
  if (!f || !((log[key] | 0) > 0)) return;
  dexSel = { bug: isBug, key };
  const rc = RARITY[f.rarity] || ['', '#a8a0a0'], n = log[key] | 0, sea = !isBug && habitatOf(f) !== 'fresh';
  const c = dexCond(f, isBug), rec = !isBug && fishRec[key] ? fishRec[key].best : 0;
  const cm = !isBug && f.min_cm !== undefined ? f.min_cm + '～' + f.max_cm + ' cm' : (!isBug && FISH_SZ[key] ? FISH_SZ[key] : '');
  const head = '<div class="dxh"><canvas width="16" height="16" ' + (isBug ? 'data-bug' : 'data-fish') + '="' + esc(key) + '"></canvas><div><div class="dxn">' + esc(f.name) +
    '<span class="dxt" style="color:' + rc[1] + ';border-color:' + rc[1] + '">' + rc[0] + '</span></div><small>' + f.price + ' G' + (cm ? ' · ' + cm : '') + ' · ' + (isBug ? '抓到' : '釣到') + ' ×' + dexN(n) + (rec ? ' · 最大 ' + rec + ' cm' : '') + '</small></div></div>';
  let rows = '';
  if (sea) {
    rows = '<div class="dxr"><span>地點</span><span class="dxch">' + (habitatOf(f) === 'mystery' ? '神秘路線限定' : '出海團的海釣') + '</span></div>';
  } else {
    const on = c.seasons === 'any' ? DEX_SEA4 : c.seasons.split(','), p = DEX_PH[c.phase];
    const seg = p ? p[3].map(a => '<div style="left:' + (a[0] / 24 * 100) + '%;width:' + ((a[1] - a[0]) / 24 * 100) + '%"></div>').join('') : '<div style="left:0;width:100%"></div>';
    const zone = isBug ? (c.zone === 'forest' ? '只在森林' : '農場、森林') : (c.zone === 'forest' ? '森林池塘、廣場魚池' : '農場池塘、森林池塘、廣場魚池');
    rows = '<div class="dxr"><span>季節</span><div class="dxsq">' + DEX_SEA4.map(x => '<div class="' + (on.includes(x) ? 'on' : '') + '">' + SEA_SHORT[x] + '</div>').join('') + '</div></div>' +
      '<div class="dxr"><span>時間</span><div style="flex:1"><div class="dxbar">' + seg + '</div><div class="dxtk"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div><small>' + (p ? p[0] + ' ' + p[2] : '全天都可以') + '</small></div></div>' +
      '<div class="dxr"><span>天氣</span><span class="dxch">' + ({ rain: '雨天才有', clear: '晴天才有' }[c.weather] || '晴雨都可以') + '</span></div>' +
      '<div class="dxr"><span>地點</span><span class="dxch">' + zone + '</span></div>' +
      (c.lv > 1 ? '<div class="dxr"><span>等級</span><span class="dxch">Lv.' + c.lv + ' 以上</span></div>' : '');
  }
  const sb = starBest(isBug ? 'bug' : 'fish', key);
  rows = '<div class="dxr"><span>品質</span><div style="flex:1">' + (sb ? starsHtml(sb) + ' <small>最高 ★' + sb + '・' + STAR_N[sb] + '</small>' : '<small>還沒有品質紀錄（再' + (isBug ? '抓' : '釣') + '一次就會記下）</small>') + '</div></div>' + rows;
  dexdCard.innerHTML = head + rows + '<button type="button" class="btn ghost wide" data-a="dclose">關閉</button>';
  dexdEl.hidden = false; dexdCard.focus();
  dexdCard.querySelectorAll('canvas[data-fish]').forEach(cv => drawFish(cv.getContext('2d'), cv.dataset.fish, false));
  dexdCard.querySelectorAll('canvas[data-bug]').forEach(cv => drawBug(cv.getContext('2d'), cv.dataset.bug, false));
}
/* ---------- 料理圖鑑：煮過的料理才看得到名字和效果（煮過的次數存在伺服器 cook_log） ---------- */
const dishDone = k => (cookLog[k] | 0) > 0 || have('dish:' + k) > 0;
function dexTabsHtml() {
  return '<div class="v-quick" style="margin:6px 0">' + [['fish', '淡水'], ['sea', '海釣'], ['bug', '蟲與蝴蝶'], ['dish', '料理'], ['crop', '作物']].map(([k, n]) =>
    '<button type="button" class="chipbtn" data-a="tab" data-c="' + k + '" aria-pressed="' + (dexTab === k ? 'true' : 'false') + '">' + n + '</button>').join('') + '</div>';
}
function renderDishDex() {
  const list = recipes.slice().sort((a, b) => (a.price - b.price) || (a.key < b.key ? -1 : 1));
  const found = list.filter(rc => dishDone(rc.key)).length, total = list.reduce((t, rc) => t + (cookLog[rc.key] | 0), 0);
  const cells = list.map(rc => {
    const n = cookLog[rc.key] | 0, ok = dishDone(rc.key), T_ = ckTier(rc);
    return '<div class="dexc ' + (ok ? 'yes' : 'no') + '"' + (ok ? ' role="button" tabindex="0" data-d="' + esc(rc.key) + '" data-r="1"' : '') + ' style="' + (ok ? 'border-color:#f0b27a' : '') + '">' +
      '<canvas width="16" height="16" data-dish="' + esc(rc.key) + '"' + (ok ? '' : ' data-dim="1"') + '></canvas>' +
      '<small><b>' + (ok ? esc(rc.name) : '？？？') + '</b></small>' +
      (ok ? '<small style="color:#a8744a">' + rc.price + ' G' + (rc.buff ? ' · ' + (BUFF_I[rc.buff] || '') + ' ' + (rc.min | 0) + '分' : '') + '</small><small>煮過 ×' + dexN(Math.max(n, 1)) + '</small>' + (starBest('dish', rc.key) ? starsHtml(starBest('dish', rc.key)) : '<span class="stars none">☆☆☆☆☆</span>')
          : '<small style="color:#bdada5">還沒煮過</small><small style="color:#bdada5">烹飪 Lv.' + T_ + '</small>') + '</div>';
  }).join('');
  dexCard.innerHTML = '<div class="shop-h"><h2>料理圖鑑</h2><span class="chip">' + found + '/' + list.length + '</span></div>' + dexTabsHtml() +
    '<div class="row"><div class="meta" style="min-width:0"><b>我的料理紀錄</b><small>累計煮出 ' + total + ' 份 · 煮過一次就會解鎖名字、材料和 buff</small></div></div>' +
    (function () { const c_ = starCount('dish', list.map(x => x.key)); return '<div class="row"><div class="meta" style="min-width:0"><b>料理品質</b><small>★5 收集 ' + c_.five + '/' + c_.tot + ' · 有星級紀錄 ' + c_.any + '/' + c_.tot + '（煮的時候零失誤、烹飪等級越高越容易出高星）</small></div></div>'; })() +
    '<div class="row"><div class="meta" style="min-width:0"><b>圖鑑成就</b><small>集滿一半、全收集、所有甜點烘焙都煮過、累計 100 份，都有名片成就</small></div></div>' +
    (list.length ? '<div class="dex" style="grid-template-columns:repeat(auto-fill,minmax(92px,1fr))">' + cells + '</div>' : '<p class="empty">還沒有食譜。</p>') +
    '<button type="button" class="btn ghost wide" data-a="close">關閉</button>';
  dexCard.querySelectorAll('canvas[data-dish]').forEach(cv => { dishIcon(cv.getContext('2d'), cv.dataset.dish); if (cv.dataset.dim) cv.style.filter = 'brightness(0) opacity(.3)'; });
}
function openDishDetail(key) {
  const rc = recipes.find(x => x.key === key); if (!rc || !dishDone(key)) return;
  dexSel = { dish: true, key };
  const n = Math.max(cookLog[key] | 0, 1), ing = Object.keys(rc.ing || {}).map(k => esc(itemName(k)) + ' ×' + rc.ing[k]).join('、');
  const bf = rc.buff ? '<div class="dxr"><span>效果</span><span class="dxch">' + (BUFF_I[rc.buff] || '') + ' ' + esc(BUFF_N[rc.buff] || rc.buff) + ' · ' + (rc.min | 0) + ' 分鐘</span></div>' +
    '<div class="dxr"><span></span><span style="font-size:12px;color:#8a7468">' + esc(BUFF_D[rc.buff] || '') + '</span></div>' : '';
  dexdCard.innerHTML = '<div class="dxh"><canvas width="16" height="16" data-dish="' + esc(key) + '"></canvas><div><div class="dxn">' + esc(rc.name) + '</div><small>' + rc.price + ' G · 煮過 ×' + dexN(n) + '</small></div></div>' +
    '<div class="dxr"><span>品質</span><div style="flex:1">' + (starBest('dish', key) ? starsHtml(starBest('dish', key)) + ' <small>最高 ★' + starBest('dish', key) + '・' + STAR_N[starBest('dish', key)] + '</small>' : '<small>還沒有品質紀錄（再煮一次就會記下）</small>') + '</div></div>' +
    '<div class="dxr"><span>材料</span><span class="dxch">' + ing + '</span></div>' + bf +
    '<div class="dxr"><span>難度</span><span class="dxch">烹飪 Lv.' + ckTier(rc) + '</span></div>' +
    (rc.descr ? '<p class="empty" style="margin:6px 0">' + esc(rc.descr) + '</p>' : '') +
    '<button type="button" class="btn ghost wide" data-a="dclose">關閉</button>';
  dexdEl.hidden = false; dexdCard.focus();
  dexdCard.querySelectorAll('canvas[data-dish]').forEach(cv => dishIcon(cv.getContext('2d'), cv.dataset.dish));
}
/* ---------- 作物圖鑑：收成過（或手上有）的作物才看得到名字；收成時抽出品質 ★1～★5，圖鑑記下每一種的最高星 ---------- */
const CROP_SEEN_KEY = 'rexCropSeen';
let cropSeen = {};
try { cropSeen = JSON.parse(localStorage.getItem(CROP_SEEN_KEY) || '{}') || {}; } catch (e) { cropSeen = {}; }
function cropMarkSeen(k) { if (cropSeen[k]) return; cropSeen[k] = 1; try { localStorage.setItem(CROP_SEEN_KEY, JSON.stringify(cropSeen)); } catch (e) { /* 略過 */ } }
const cropFound = k => starBest('crop', k) > 0 || have('c:' + k) > 0 || !!cropSeen[k];
function renderCropDex() {
  const list = ALLK.filter(k => CROPS[k]);
  const found = list.filter(cropFound).length;
  const cells = list.map(k => {
    const ok = cropFound(k), c = CROPS[k], sb = starBest('crop', k);
    return '<div class="dexc ' + (ok ? 'yes' : 'no') + '"' + (ok ? ' role="button" tabindex="0" data-d="' + esc(k) + '" data-r="2"' : '') + ' style="' + (ok ? 'border-color:' + c.c : '') + '">' +
      '<canvas width="16" height="16" data-crop="' + esc(k) + '"' + (ok ? '' : ' data-dim="1"') + '></canvas>' +
      '<small><b>' + (ok ? esc(c.n) : '？？？') + '</b></small>' +
      (ok ? '<small style="color:#a8744a">' + cropPrice(k) + ' G · ' + fmtDur(growSec(k)) + '</small>' + (sb ? starsHtml(sb) : '<span class="stars none">☆☆☆☆☆</span>')
          : '<small style="color:#bdada5">還沒收成過</small><small style="color:#bdada5">' + (c.hy ? '雜交作物' : '雜貨攤有種子') + '</small>') + '</div>';
  }).join('');
  const c_ = starCount('crop', list);
  dexCard.innerHTML = '<div class="shop-h"><h2>作物圖鑑</h2><span class="chip">' + found + '/' + list.length + '</span></div>' + dexTabsHtml() +
    '<div class="row"><div class="meta" style="min-width:0"><b>作物品質</b><small>★5 收集 ' + c_.five + '/' + c_.tot + ' · 有星級紀錄 ' + c_.any + '/' + c_.tot + '（農耕等級越高、收成前施過肥，越容易收到高星）</small></div></div>' +
    '<div class="dex" style="grid-template-columns:repeat(auto-fill,minmax(92px,1fr))">' + cells + '</div>' +
    '<button type="button" class="btn ghost wide" data-a="close">關閉</button>';
  dexCard.querySelectorAll('canvas[data-crop]').forEach(cv => { cropIcon(cv.getContext('2d'), cv.dataset.crop); if (cv.dataset.dim) cv.style.filter = 'brightness(0) opacity(.3)'; });
}
function openCropDetail(key) {
  const c = CROPS[key]; if (!c || !cropFound(key)) return;
  dexSel = { crop: true, key };
  const sb = starBest('crop', key);
  dexdCard.innerHTML = '<div class="dxh"><canvas width="16" height="16" data-crop="' + esc(key) + '"></canvas><div><div class="dxn">' + esc(c.n) + '</div><small>' + cropPrice(key) + ' G · ' + fmtDur(growSec(key)) + '成熟</small></div></div>' +
    '<div class="dxr"><span>品質</span><div style="flex:1">' + (sb ? starsHtml(sb) + ' <small>最高 ★' + sb + '・' + STAR_N[sb] + '</small>' : '<small>還沒有品質紀錄（再收成一次就會記下）</small>') + '</div></div>' +
    '<div class="dxr"><span>成熟</span><span class="dxch">' + fmtDur(growSec(key)) + '（晴天要澆水，雨雪天免澆）</span></div>' +
    '<div class="dxr"><span>種子</span><span class="dxch">' + (c.hy ? '雜交或和村民交換' : '雜貨攤 ' + c.buy + ' G') + '</span></div>' +
    '<p class="empty" style="margin:6px 0">農耕等級越高、收成前先施肥，越容易收到高星。星級只記在圖鑑，背包裡的作物不分星級、賣價不變。</p>' +
    '<button type="button" class="btn ghost wide" data-a="dclose">關閉</button>';
  dexdEl.hidden = false; dexdCard.focus();
  dexdCard.querySelectorAll('canvas[data-crop]').forEach(cv => cropIcon(cv.getContext('2d'), cv.dataset.crop));
}
function renderDex() {
  if (dexTab === 'dish') { renderDishDex(); return; }
  if (dexTab === 'crop') { renderCropDex(); return; }
  const isBug = dexTab === 'bug', isSea = dexTab === 'sea';
  const cat = isBug ? bugCat : fishCat.filter(f => (habitatOf(f) !== 'fresh') === isSea), log = isBug ? bugLog : fishLog;   // 淡水／海釣兩個分頁（海釣 = 出海團的魚）
  const found = cat.filter(f => (log[f.key] | 0) > 0).length;
  const order = { legend: 0, rare: 1, uncommon: 2, common: 3, junk: 4 };
  const list = cat.slice().sort((a, b) => (order[a.rarity] - order[b.rarity]) || (b.price - a.price));
  const dat = isBug ? 'data-bug' : 'data-fish';
  const cells = list.map(f => {
    const n = log[f.key] | 0, rc = RARITY[f.rarity] || ['', '#a8a0a0'];
    const hint = !n ? '還沒抓到' : '';
    const sn = f.seasons && f.seasons !== 'any' ? ' ' + f.seasons.split(',').map(x => SEA_SHORT[x]).join('') + '季' : '';
    const when = !n && (isBug || sn) ? '<small style="color:#bdada5">' + (isBug ? ({ any: '', dawn: '清晨', day: '白天', dusk: '黃昏', night: '夜晚' }[f.phase] || '') + ({ any: '', rain: ' 雨天', clear: ' 晴天' }[f.weather] || '') : '') + sn + '</small>' : '';
    return '<div class="dexc' + (n ? ' yes' : ' no') + '"' + (n ? ' role="button" tabindex="0" data-d="' + esc(f.key) + '" data-b="' + (isBug ? 1 : 0) + '"' : '') + ' style="' + (n ? 'border-color:' + rc[1] : '') + '"><canvas width="16" height="16" ' + dat + '="' + esc(f.key) + '"' + (n ? '' : ' data-dim="1"') + '></canvas>' +
      '<small><b>' + (n ? esc(f.name) : '？？？') + '</b></small><small style="color:' + (n ? rc[1] : '#bdada5') + '">' + (n ? rc[0] + ' · ' + f.price + 'G' : (isBug ? '還沒抓到' : habitatOf(f) === 'mystery' ? '神秘路線限定' : '還沒釣到')) + '</small>' +
      (n ? '<small>' + (isBug ? '抓到' : '釣到') + ' ×' + dexN(n) + (!isBug && fishRec[f.key] ? ' · 最大 ' + fishRec[f.key].best + ' cm' : '') + '</small>' + (starBest(isBug ? 'bug' : 'fish', f.key) ? starsHtml(starBest(isBug ? 'bug' : 'fish', f.key)) : '<span class="stars none">☆☆☆☆☆</span>') + dexMini(f, isBug) : when) + '</div>';
  }).join('');
  const tabs = '<div class="v-quick" style="margin:6px 0">' + [['fish', '淡水'], ['sea', '海釣'], ['bug', '蟲與蝴蝶'], ['dish', '料理'], ['crop', '作物']].map(([k, n]) =>
    '<button type="button" class="chipbtn" data-a="tab" data-c="' + k + '" aria-pressed="' + (dexTab === k ? 'true' : 'false') + '">' + n + '</button>').join('') + '</div>';
  /* 收集獎勵：集滿 30% / 60% / 100% 各領一次（要和 SQL 的 dex_claim 一致） */
  const tot = cat.length, thr = [Math.ceil(tot * 0.3), Math.ceil(tot * 0.6), tot], REW = [150, 400, 1500];
  const claimed = dexClaims[dexTab] | 0;
  let reached = 0; thr.forEach((t, i) => { if (tot > 0 && found >= t) reached = i + 1; });
  let pend = 0; for (let t = claimed; t < reached; t++) pend += REW[t];
  const miles = isSea ? '<div class="row"><div class="meta" style="min-width:0"><b>海釣圖鑑</b><small>全部集滿可得成就「海釣圖鑑全收集」（神秘路線的魚只在神秘路線出現）</small></div></div>' : '<div class="row" style="flex-wrap:wrap;gap:6px"><div class="meta" style="min-width:0"><b>收集獎勵</b><small>' + thr.map((t, i) =>
    (i < claimed ? '✓ ' : '') + t + ' 種 ' + REW[i] + ' G').join(' ／ ') + '</small></div>' +
    (pend && !isSea ? '<button type="button" class="btn" data-a="claim" data-c="' + dexTab + '"' + (dexBusy ? ' disabled' : '') + '>領取 ' + pend + ' G</button>' : '') + '</div>';
  const sc_ = starCount(isBug ? 'bug' : 'fish', cat.map(x => x.key));
  let recRow = '<div class="row"><div class="meta" style="min-width:0"><b>' + (isBug ? '蟲蝶' : '魚') + '品質</b><small>★5 收集 ' + sc_.five + '/' + sc_.tot + ' · 有星級紀錄 ' + sc_.any + '/' + sc_.tot + '（' + (isBug ? '捕蟲等級越高越容易抓到高星' : '釣魚等級越高越容易釣到高星') + '）</small></div></div>';
  if (!isBug) {
    const total = cat.reduce((t, f) => t + (fishLog[f.key] | 0), 0);
    let bk = null; Object.keys(fishRec).forEach(k => { if (cat.some(f => f.key === k) && (!bk || fishRec[k].best > fishRec[bk].best)) bk = k; });
    const bf = bk && cat.find(f => f.key === bk);
    recRow += '<div class="row"><div class="meta" style="min-width:0"><b>我的釣魚紀錄</b><small>累計釣到 ' + total + ' 條' + (bf ? ' · 最大紀錄：' + esc(bf.name) + ' ' + fishRec[bk].best + ' cm' : '') + '</small></div></div>';
  }
  dexCard.innerHTML = '<div class="shop-h"><h2>' + (isBug ? '蟲蝶圖鑑' : isSea ? '海釣圖鑑' : '魚類圖鑑') + '</h2><span class="chip">' + found + '/' + cat.length + '</span></div>' + tabs + miles + recRow +
    (cat.length ? '<div class="dex" style="grid-template-columns:repeat(auto-fill,minmax(92px,1fr))">' + cells + '</div>' : '<p class="empty">還沒有資料。</p>') +
    '<button type="button" class="btn ghost wide" data-a="close">關閉</button>';
  dexCard.querySelectorAll('canvas[data-fish]').forEach(cv => drawFish(cv.getContext('2d'), cv.dataset.fish, !!cv.dataset.dim));
  dexCard.querySelectorAll('canvas[data-bug]').forEach(cv => drawBug(cv.getContext('2d'), cv.dataset.bug, !!cv.dataset.dim));
}
function openDex() { if (!ready || !me || authOpen || paused()) return; dexOpen = true; pressed.length = 0; renderDex(); dexEl.hidden = false; dexCard.focus(); }
function closeDex() { dexOpen = false; dexEl.hidden = true; closeDexDetail(); }
function dexOpenFrom(el) { if (!el) return; if (el.dataset.r === '2') openCropDetail(el.dataset.d); else if (el.dataset.r) openDishDetail(el.dataset.d); else openDexDetail(el.dataset.d, el.dataset.b === '1'); }
dexCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const el = e.target.closest('.dexc[data-d]'); if (el) { e.preventDefault(); dexOpenFrom(el); } } });
dexdEl.addEventListener('click', e => { if (e.target === dexdEl || e.target.closest('button[data-a=dclose]')) closeDexDetail(); });
dexCard.addEventListener('click', e => {
  const cell = e.target.closest('.dexc[data-d]');
  if (cell) { dexOpenFrom(cell); return; }
  const t = e.target.closest('button[data-a=tab]');
  if (t) { dexTab = t.dataset.c; renderDex(); return; }
  const cl = e.target.closest('button[data-a=claim]');
  if (cl && !dexBusy) {
    dexBusy = true; renderDex();
    enqueue(() => rpc('dex_claim', { p_kind: cl.dataset.c })).then(r => {
      if (typeof r.coins === 'number') me.coins = r.coins;
      Object.assign(dexClaims, r.claims || {});
      toast('收集獎勵 +' + r.earned + ' G！'); refreshHud();
    }).catch(err => { toast(errText(err)); resync(); }).finally(() => { dexBusy = false; if (dexOpen) renderDex(); });
    return;
  }
  if (e.target.closest('button[data-a=close]')) closeDex();
});
dexEl.addEventListener('click', e => { if (e.target === dexEl) closeDex(); });
