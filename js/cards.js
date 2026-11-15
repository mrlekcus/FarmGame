/* 咖啡廳牌桌（左側）：坐下就開牌局。牌局畫面在 cardgame.html（iframe），這裡只負責
   ① 開關視窗 ② 把「誰坐在哪個座位」告訴它 ③ 把牌局訊息轉到店內頻道（事件 'cg'）。 */
let ucFrame = null, ucTick = 0;   // cgOpen（視窗開著）宣告在 state.js，paused() 要用
const CG_FIRST = 3;   // CF_SPOTS 裡牌桌座位的起點（共 4 個）
const ucEl = document.createElement('div');
ucEl.id = 'ucbox'; ucEl.hidden = true;
ucEl.style.cssText = 'position:fixed;inset:0;z-index:40;background:#1a0e12';
document.body.appendChild(ucEl);
const ucPost = m => { try { if (ucFrame && ucFrame.contentWindow) ucFrame.contentWindow.postMessage(Object.assign({ cg: 1 }, m), '*'); } catch (e) { /* 略過 */ } };
const ucAvCache = {};
function ucAvatar(ch) {   // 把玩家自己的角色畫成一張小圖，牌局裡的頭像就跟店裡看到的一樣
  try {
    const k = JSON.stringify(ch) || ''; if (ucAvCache[k]) return ucAvCache[k];
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; const o = c.getContext('2d');
    const sg = g; g = o; try { drawPlayer(0, 0, 'down', false, 0, ch); } finally { g = sg; }
    return (ucAvCache[k] = c.toDataURL());
  } catch (e) { return ''; }
}
let ucWatching = false;
const ucWatchSeen = new Map();   // 別人的「我在看牌」心跳（id → 最後一次收到的時間）
function ucRoster() {
  const seats = [null, null, null, null];
  if (cf && cf.sit && cf.sit.kind === 'spot') { const i = CF_SPOTS.indexOf(cf.sit.spot) - CG_FIRST; if (i >= 0 && i < 4) seats[i] = { id: myUid, name: me ? me.name : '你', img: ucAvatar(typeof myChar === 'function' ? myChar() : null) }; }
  remotes.forEach(rp => { const i = (rp.cs | 0) - 20 - CG_FIRST; if (i >= 0 && i < 4 && hereRp(rp) && !seats[i]) seats[i] = { id: rp.id, name: rp.name, img: ucAvatar(rp.char) }; });
  const spec = [], seated = new Set(seats.filter(Boolean).map(q => q.id)), now = performance.now();
  if (ucWatching && !seated.has(myUid)) spec.push({ id: myUid, name: me ? me.name : '你', img: ucAvatar(typeof myChar === 'function' ? myChar() : null) });
  ucWatchSeen.forEach((t, id) => { const rp = remotes.get(id); if (now - t < 6000 && rp && hereRp(rp) && !seated.has(id) && spec.length < 12) spec.push({ id, name: rp.name, img: ucAvatar(rp.char) }); });
  return { seats, spec };
}
function ucSendRoster() { const q = ucRoster(); ucPost({ t: 'roster', me: myUid, seats: q.seats, spec: q.spec }); }
function ucMount(watch) {
  if (cgOpen || scene !== 'cafe' || !cf) return;
  cgOpen = true; ucWatching = !!watch; pressed.length = 0; actHeld = false;
  ucFrame = document.createElement('iframe');
  ucFrame.src = 'cardgame.html?embed=1&v=cg4';
  ucFrame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#1a0e12';
  ucEl.innerHTML = ''; ucEl.appendChild(ucFrame); ucEl.hidden = false;
  clearInterval(ucTick); let n = 0;
  ucTick = setInterval(() => {   // 離座／離開咖啡廳就關；座位名單每半秒同步一次（有人坐下、離開、來看牌）
    if (!cgOpen) { clearInterval(ucTick); return; }
    if (scene !== 'cafe' || !cf || (!cf.sit && !ucWatching)) { closeCards(); return; }
    if (ucWatching && cf.sit) ucWatching = false;
    if (ucWatching && n % 4 === 0) ucSend({ k: 'watch' });   // 每 2 秒告訴大家「我在看牌」
    n++; ucSendRoster();
  }, 500);
}
const openCards = () => { if (cf && cf.sit) ucMount(false); };
const openCardsWatch = () => { if (cf && !cf.sit) ucMount(true); };
function closeCards() {
  if (!cgOpen) return;
  cgOpen = false; ucWatching = false; ucEl.hidden = true; ucEl.innerHTML = ''; ucFrame = null; clearInterval(ucTick); pressed.length = 0; ucWatchSeen.clear();
}
function ucSend(m) {
  if (!net || !net.ok || !m || typeof m !== 'object') return;
  try { if (JSON.stringify(m).length > 6000) return; net.ch.send({ type: 'broadcast', event: 'cg', payload: { i: myUid, m } }); } catch (e) { /* 略過 */ }
}
function onCgMsg(p) {
  if (!p || typeof p !== 'object' || typeof p.i !== 'string' || !UID_RE.test(p.i) || p.i === myUid || scene !== 'cafe' || !ucFrame || !p.m || typeof p.m !== 'object') return;
  if (p.m.k === 'watch') { ucWatchSeen.set(p.i, performance.now()); return; }
  ucPost({ t: 'rx', from: p.i, m: p.m });
}
window.addEventListener('message', e => {
  if (!ucFrame || e.source !== ucFrame.contentWindow) return;
  const d = e.data; if (!d || typeof d !== 'object' || d.cg !== 1) return;
  if (d.t === 'ready') { ucPost({ t: 'init', me: myUid }); ucSendRoster(); }
  else if (d.t === 'tx') ucSend(d.m);
  else if (d.t === 'exit') { closeCards(); if (cf && cf.sit) cafeStand(); }
});
