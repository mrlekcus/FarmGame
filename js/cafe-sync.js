'use strict';
/* 咖啡廳多人同步 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html（在 cafe.js 之後）。
   做法：店裡「最早開店的那個人」當店長（host），只有店長跑模擬（顧客、豆豆、機器、計時）；
   其他人是跟隨者（fol），每 0.25 秒收一次店長的快照（snap）來畫畫面，自己的操作（按檯子、按住磨豆／洗杯、點餐）用訊息交給店長代辦。
   店長離開或掉線，剩下的人裡面 uid 最小的接手（用手上最後一份快照繼續跑）。
   全部走 Realtime 廣播事件 'cf'，payload.t 是訊息類型；收到的一律當作不可信資料先檢查。 */
const cfPeers = () => { const a = []; remotes.forEach(rp => { if (hereRp(rp)) a.push(rp); }); return a; };
const cfRemoteSeat = code => !!cf && cf.peers.some(rp => rp.cs === code);
function cfSend(o) {
  if (!net || !net.ok || !cf) return;
  try { net.ch.send({ type: 'broadcast', event: 'cf', payload: Object.assign({ i: myUid }, o) }); } catch (e) { /* 略過 */ }
}
const cfTell = (to, o) => { if (to && to !== myUid) cfSend(Object.assign({ to }, o)); };
const cfNm = (v, a, b, d) => (typeof v === 'number' && isFinite(v)) ? Math.min(b, Math.max(a, v)) : d;
const cfIn = (v, a, b, d) => (typeof v === 'number' && isFinite(v)) ? Math.min(b, Math.max(a, Math.round(v))) : d;
const cfR2 = v => Math.round(v * 100) / 100;
const CF_STS = ['in', 'wait', 'happy', 'roam', 'out'], CF_STN = ['idle', 'cooking', 'done', 'burnt'], CF_DIRS = ['up', 'down', 'left', 'right'];
function cfCleanHold(h) {
  if (!h || typeof h !== 'object') return null;
  const t = h.t; if (t !== 'bean' && t !== 'milk' && t !== 'dough' && t !== 'gbean' && t !== 'plate') return null;
  if (t !== 'plate') return { t };
  return { t, dish: (h.dish === 'burnt' || CF_MENU[h.dish]) ? h.dish : null };
}

/* ---------- 店長／跟隨者 ---------- */
function cfRoleTick() {
  const nowp = performance.now();
  if (cf.role === 'fol') {
    const gone = !cf.peers.some(rp => rp.id === cf.hostId);
    if (nowp - cf.lastSnap > 4500 || (gone && nowp - cf.lastSnap > 2000)) { cf.role = null; cf.hostId = ''; cf.nullAt = nowp; }
  }
  if (!cf.role) {
    if (!cf.peers.length) { cfBecomeHost(); return; }
    if (nowp - (cf.hello || 0) > 1500) { cf.hello = nowp; cfSend({ t: 'hello' }); }
    const waited = nowp - cf.nullAt, lowest = [myUid].concat(cf.peers.map(r => r.id)).sort()[0];
    if ((lowest === myUid && waited > (cf.synced ? 700 : 3500)) || waited > 9000) cfBecomeHost();
  }
}
function cfBecomeHost() {
  const had = cf.synced;
  cf.role = 'host'; cf.hostId = myUid; cf.hs = Date.now(); cf.snapAcc = 0; cf.res = cf.res || {};
  if (had) cfRehome();
}
function cfYield() {   // 有更早開店的人：我退成跟隨者，丟掉自己的模擬，等他的快照
  cf.role = 'fol'; cf.hold = null; cf.holds = {}; cf.custs = []; cf.bot.hold = null; cf.bot.sync = 0; cf.synced = false; cf.hudKey = '';
  CF_SPOTS.forEach(s => { s.o = 0; });
}
/* 接手：快照裡的顧客沒有路徑，重新幫他們找路 */
function cfRehome() {
  CF_SPOTS.forEach(s => { s.o = 0; });
  cf.custs = cf.custs.filter(c => c.state !== 'gone' && (!c.isPlayer || (c.own === myUid ? !!cf.sit : cf.peers.some(rp => rp.id === c.own))));
  cf.custs.forEach(c => {
    c.path = []; c.moving = false; c.claim = 0; c.t = 5; delete c.tx; delete c.ty;
    if (c.isPlayer) { c.born = cf.now; return; }
    if (c.state === 'in') cfGo(c, [CF_SEATS[Math.max(0, c.seat)], 8], [CF_SEATS[Math.max(0, c.seat)] + .5, 7.5]);
    else if (c.state === 'roam') { if (c.spot) { c.spot.o = 1; if (Math.hypot(c.x - c.spot.x, c.y - c.spot.y) > .1) cfGo(c, c.spot.stand, [c.spot.x, c.spot.y]); } else cfLeave(c); }
    else if (c.state === 'out') cfGo(c, [7, 14], [7.5, 15.5]);
  });
  cf.cid = cf.custs.reduce((m, c) => Math.max(m, c.id), 0) + 1; cf.nextC = 4; cf.chatT = 5; cf.dirty = [];
  const b = cf.bot; cfBotReset(b); b.moving = false; b.sync = 0;
  cf.list.forEach(s => { if (s.k === 'mach' || s.k === 'oven') s.dAt = cf.now; });
}

/* ---------- 店長端：代辦別人的操作 ---------- */
function cfAddPlayerOrder(uid, name, seat, dish, q) {
  if (!(seat >= 0 && seat < CF_SEATS.length) || !CF_MENU[dish]) return false;
  if (cf.custs.some(c => c.isPlayer && c.own === uid && c.state === 'wait')) return true;
  if (cf.custs.some(c => c.seat === seat && c.state !== 'gone')) return false;
  cf.custs.push({ id: cf.cid++, name, isPlayer: 1, own: uid, q: q | 0, seat, x: CF_SEATS[seat] + .5, y: 7.5, path: [], state: 'wait', dish, ttl: 90, max: 90, t: 0, claim: 0, born: cf.now });
  cf.snapAcc = 0;
  return true;
}
function cfBoost() {
  if (cf.now - (cf.lastBoost || -1e9) < 15000) return;
  cf.lastBoost = cf.now; cf.custs.forEach(c => { if (c.state === 'wait') c.ttl = Math.min(c.max, c.ttl + 10); });
}
function cfAsRemote(uid, fn) {
  const h0 = cf.hold, before = JSON.stringify(cf.holds[uid] || null);
  cf.hold = cf.holds[uid] || null; cf.who = uid;
  try { fn(); } finally { if (cf.hold) cf.holds[uid] = cf.hold; else delete cf.holds[uid]; cf.hold = h0; cf.who = null; }
  const after = JSON.stringify(cf.holds[uid] || null);
  if (after !== before) cfTell(uid, { t: 'hold', h: cf.holds[uid] || null });
  cf.snapAcc = Math.min(cf.snapAcc, .1);
}
function cfRemoteTick() {
  Object.keys(cf.holds).forEach(u => { if (!cf.peers.some(rp => rp.id === u)) delete cf.holds[u]; });
  cf.custs.forEach(c => {   // 別人的單：人不在座位上了就作廢（他那邊已經自己退款）
    if (!c.isPlayer || c.own === myUid || c.state !== 'wait') return;
    const rp = cf.peers.find(r => r.id === c.own);
    if (!rp || (cf.now - (c.born || 0) > 2500 && rp.cs !== 10 + c.seat)) c.state = 'gone';
  });
  Object.keys(cf.res).forEach(u => { if (cf.now - cf.res[u].at > 12000) delete cf.res[u]; });
}
function cfResult(uid, r, q) { cf.res[uid] = { r, q: q | 0, at: cf.now }; }

/* ---------- 快照 ---------- */
function cfSnap() {
  const nowp = performance.now(), b = cf.bot, rs = {}, ph = {};
  Object.keys(cf.res).forEach(u => { rs[u] = [cf.res[u].r, cf.res[u].q]; });
  Object.keys(cf.holds).forEach(u => { ph[u] = cf.holds[u]; });
  return {
    t: 'snap', hs: cf.hs,
    st: cf.list.map(s => [s.state, cfR2(s.prog), cfR2(s.burn), s.dish || 0, s.n, s.d, s.item ? s.item.t : 0, s.items.join(',')]),
    b: [cfR2(b.x), cfR2(b.y), b.dir, b.moving ? 1 : 0, b.hold || 0],
    cu: cf.custs.filter(c => c.state !== 'gone').map(c => ({ id: c.id, nm: c.name, k: c.key || '', s: c.seat, x: cfR2(c.x), y: cfR2(c.y), d: c.dir || 'down', st: CF_STS.indexOf(c.state), di: c.dish, tt: Math.round(c.ttl * 10) / 10, mx: c.max, ow: c.own || 0, q: c.q || 0, sp: c.spot ? CF_SPOTS.indexOf(c.spot) : -1, mv: c.path && c.path.length ? 1 : 0, rd: c.rounds || 0, ln: c.line && nowp - c.line.at < 5000 ? c.line.txt : 0 })),
    o: CF_SPOTS.map(s => s.o ? 1 : 0), ph, rs
  };
}
function cfSnapTick(dt) {
  if (!cf.peers.length) return;
  cf.snapAcc -= dt;
  if (cf.snapAcc > 0) return;
  cf.snapAcc = .25; cfSend(cfSnap());
}
function cfOnSnap(p) {
  if (typeof p.hs !== 'number' || !isFinite(p.hs)) return;
  if (cf.role && p.i !== cf.hostId && !(p.hs < cf.hs || (p.hs === cf.hs && p.i < cf.hostId))) return;   // 比較晚開店的店長：不理他，他會自己退下來
  if (cf.role === 'host') cfYield();
  cf.role = 'fol'; cf.hostId = p.i; cf.hs = p.hs; cf.lastSnap = performance.now();
  if (!Array.isArray(p.st) || p.st.length !== cf.list.length || !Array.isArray(p.cu)) return;
  cf.list.forEach((s, i) => {
    const a = p.st[i]; if (!Array.isArray(a)) return;
    const old = s.state;
    s.state = CF_STN.includes(a[0]) ? a[0] : 'idle'; s.prog = cfNm(a[1], 0, 1, 0); s.burn = cfNm(a[2], 0, 1, 0);
    s.dish = a[3] && (CF_MENU[a[3]] || a[3] === 'burnt') ? a[3] : null; s.n = cfIn(a[4], 0, 9, 0); s.d = cfIn(a[5], 0, 60, 0);
    s.item = a[6] === 'bean' || a[6] === 'gbean' ? { t: a[6] } : null;
    s.items = typeof a[7] === 'string' && a[7] ? a[7].split(',').filter(t => t === 'gbean' || t === 'milk' || t === 'dough').slice(0, 2) : [];
    if (old === 'cooking' && (s.state === 'done' || s.state === 'burnt') && cfInKitchen() && !cf.sit) toast(s.state === 'burnt' ? '這杯搭配不對…' : CF_MENU[s.dish].n + '好了！拿杯子來盛', 1600);
  });
  const bb = p.b, b = cf.bot;
  if (Array.isArray(bb)) {
    b.tx = cfNm(bb[0], 0, CFW, b.x); b.ty = cfNm(bb[1], 0, CFH, b.y);
    if (!b.sync) { b.x = b.tx; b.y = b.ty; b.sync = 1; }
    b.dir = CF_DIRS.includes(bb[2]) ? bb[2] : 'down'; b.moving = !!bb[3]; b.hold = cfCleanHold(bb[4]);
  }
  const old = new Map(cf.custs.map(c => [c.id, c])), nu = [];
  p.cu.slice(0, 16).forEach(a => { try {
    if (!a || typeof a !== 'object') return;
    const id = cfIn(a.id, 0, 1e9, -1), st = CF_STS[cfIn(a.st, 0, 4, -1)]; if (id < 0 || !st) return;
    let c = old.get(id);
    const tx = cfNm(a.x, 0, CFW, 8), ty = cfNm(a.y, 0, CFH, 8);
    if (!c) c = { id, x: tx, y: ty, step: 0, line: null, lnTxt: null, path: [] };
    c.tx = tx; c.ty = ty; c.name = clean(a.nm, 8) || '客人'; c.key = CF_KEYS.includes(a.k) || CF_VKEYS.includes(a.k) ? a.k : CF_KEYS[0];
    c.seat = cfIn(a.s, -1, CF_SEATS.length - 1, -1); c.dir = CF_DIRS.includes(a.d) ? a.d : 'down'; c.state = st;
    c.dish = CF_MENU[a.di] ? a.di : 'americano'; c.ttl = cfNm(a.tt, 0, 300, 0); c.max = cfNm(a.mx, 1, 300, 70);
    c.own = typeof a.ow === 'string' && UID_RE.test(a.ow) ? a.ow : 0; c.isPlayer = c.own ? 1 : 0; c.q = cfIn(a.q, 0, 1e9, 0);
    c.spot = a.sp >= 0 && a.sp < CF_SPOTS.length ? CF_SPOTS[a.sp] : null; c.rounds = cfIn(a.rd, 0, 9, 0);
    c.moving = !!a.mv; c.path = a.mv ? [[0, 0]] : [];
    if (typeof a.ln === 'string' && a.ln) { if (a.ln !== c.lnTxt) { c.lnTxt = a.ln; c.line = { txt: clean(a.ln, 40), at: performance.now() }; } } else c.lnTxt = null;
    nu.push(c);
  } catch (e) { /* 這一位資料有問題就略過，其他人照常更新 */ } });
  cf.custs = nu;
  CF_SPOTS.forEach((s, i) => { s.o = (Array.isArray(p.o) && p.o[i] ? 1 : 0) || (cf.sit && cf.sit.spot === s ? 1 : 0); });
  const ph = {};
  if (p.ph && typeof p.ph === 'object') Object.keys(p.ph).forEach(u => { if (UID_RE.test(u) && u !== myUid) { const h = cfCleanHold(p.ph[u]); if (h) ph[u] = h; } });
  cf.holds = ph; cf.synced = true;
  const r = p.rs && p.rs[myUid];
  if (cf.ordered && Array.isArray(r) && r[1] === cf.oq) cfFinishOrder(r[0]);
}
/* 自己的單結果：s 送到了、e 等太久、x 被拒絕 */
function cfFinishOrder(r) {
  if (!cf || !cf.ordered) return;
  cfPayEnd(r === 's'); cf.ordered = false;   // 要先結清再清旗標（cfPayEnd 看 cf.ordered）
  if (r === 's') { const M = CF_MENU[cf.odish]; if (M) { toast('你的' + M.n + '送到了！', 2000); playEat(cf.odish, M.aura); } }
  else if (r === 'e') toast('等太久了，這張單作廢了', 2000);
  else toast('這個位子剛被別人用了，已退款', 2200);
}
function cfFolTick(dt) {
  if (!cf.role) { cfHudTick(); return; }
  const k = Math.min(1, dt * 10), b = cf.bot;
  cf.custs.forEach(c => {
    if (c.tx == null) return;
    const dx = c.tx - c.x, dy = c.ty - c.y;
    if (Math.hypot(dx, dy) > 3) { c.x = c.tx; c.y = c.ty; } else { c.x += dx * k; c.y += dy * k; }
    if (c.moving) c.step = (c.step || 0) + dt * 8;
    if (c.state === 'wait') c.ttl = Math.max(0, c.ttl - dt);
  });
  if (b.tx != null) { b.x += (b.tx - b.x) * k; b.y += (b.ty - b.y) * k; if (b.moving) b.step += dt * 8; }
  cf.list.forEach(q => {   // 兩次快照之間，進度條自己先走
    if (q.state === 'cooking') q.prog = Math.min(.999, q.prog + dt / (q.k === 'mach' ? 7 : 6));
    else if (q.state === 'done') q.burn = Math.min(.999, q.burn + dt / 6);
  });
  if (cf.ordered && !cfMine() && performance.now() - cf.orderAt > 7000) cfFinishOrder('e');   // 店長那邊找不到這張單（店長掉線、訊息掉了）：退款
  CF_ST.rack = cfFind('rack').n; CF_ST.sink = cf.list.find(q => q.k === 'sink').d;
  cfHudTick();
}

/* ---------- 收訊息 ---------- */
function onCafeMsg(p) {
  if (!p || typeof p !== 'object' || typeof p.i !== 'string' || !UID_RE.test(p.i) || p.i === myUid || !cf || scene !== 'cafe') return;
  if (p.to && p.to !== myUid) return;
  const t = p.t;
  if (t === 'song') { setTimeout(() => { if (cf && cfJukeSrv !== false) cfJukeFetch(); }, 500); return; }   // 有人換歌：馬上去伺服器對時
  if (t === 'snap') { if (!p.to || p.to === myUid) cfOnSnap(p); return; }
  if (t === 'hello') { if (cf.role === 'host') cf.snapAcc = 0; return; }
  if (cf.role === 'host') {   // 店長：代辦別人的操作
    const rp = remotes.get(p.i); if (!rp || !hereRp(rp)) return;
    if (t === 'drop') { delete cf.holds[p.i]; return; }
    if (t === 'order') { if (!cfAddPlayerOrder(p.i, rp.name, cfIn(p.s, 0, 3, -1), p.d, p.q)) cfTell(p.i, { t: 'deny' }); return; }
    if (t === 'boost') { cfBoost(); return; }
    if (t === 'press' || t === 'hact') {
      const x = cfIn(p.x, 0, CFW - 1, -1), y = cfIn(p.y, 0, CFH - 1, -1), s = cf.by[x + ',' + y];
      if (!s || rp.tx > 9 || rp.ty > 5 || rp.cs) return;                       // 要在操作間裡、而且站在檯子旁邊
      if (Math.abs(rp.tx - x) + Math.abs(rp.ty - y) > 2) return;
      if (t === 'press') { const nw = performance.now(); if (nw - (rp.cfAt || 0) < 60) return; rp.cfAt = nw; cfAsRemote(p.i, () => cfPress(s)); }
      else { const dt = cfNm(p.dt, 0, .5, 0); s.rt = cf.now; cfAsRemote(p.i, () => cfHoldAct(s, dt)); }
    }
    return;
  }
  if (p.i !== cf.hostId) return;   // 以下是店長傳給我的
  if (t === 'hold') cf.hold = cfCleanHold(p.h);
  else if (t === 'say') { if (typeof p.m === 'string') toast(clean(p.m, 40), cfNm(p.ms, 600, 4000, 1800)); }
  else if (t === 'srv') cfFinishOrder('s');
  else if (t === 'exp') cfFinishOrder('e');
  else if (t === 'deny') cfFinishOrder('x');
  else if (t === 'wage') { if (CF_MENU[p.d]) cfWage(p.d); }
}

/* ---------- 畫別人 ---------- */
function cafeDrawRemote(rp, now) {
  const c = rp.cs;
  const sp = c >= 20 ? CF_SPOTS[c - 20] : c >= 10 && c - 10 < CF_SEATS.length ? { x: CF_SEATS[c - 10] + .5, y: 7.5, dy: -5, rim: 1, dir: 'down' } : null;
  if (!sp) return false;
  const px = Math.round((sp.x - .5) * T), py = Math.round((sp.y - .5) * T + (sp.dy || 0));
  drawPlayerFx(px, py, sp.dir || 'down', false, 0, rp.char, animFx(rp.anim, now));
  if (sp.rim) r(CF_TH.wood.rimC || CF_TH.wood.stool, px + 3, py + 12, 10, 3);
  if (sp.k === 'sofa') cfSofaFront(11 * T, 2 * T, CF_TH.wood.sofa);
  nameTag(rp.name, px + 8, py - 5, '#fff3b0');
  return true;
}
