'use strict';
/* 遊戲店面（紫色方塊屋）—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   廣場上咖啡廳左邊的空地蓋了一間遊戲店面（外觀見 art/gameshop.js 的 gsExt），走到門口按動作鍵進入店內（scene = 'arcade'，16×16 格，霓虹夜光街機廳）。
   店內兩排街機、每排 4 台，每台旁邊一張高腳椅，共 8 張椅子（一區最多 8 人）。面向空椅子按動作鍵坐下，就會先跳出「選遊戲」小視窗：俄羅斯方塊大亂鬥（tetris.html）或賽車（race.html），都嵌在 iframe 裡。
   店員：機器人「嗶嗶」站在櫃檯後面，面向櫃檯按動作鍵可以聊天。
   【規則】免費場 0G（沒有 token）、付費場 1000 G，兩種場都能連線真人（各自分房，沒坐滿的補 Bot）；付費場第一名得 1 token（每天最多 1 個，由後端 bb_tetris_award 發放）。開局（倒數結束）時才扣；沒坐滿的位置系統補滿。
   【結算】arcade_tetris_enter(p_paid)（付費扣 1000 G、回傳 { coins, log_id }）；函式不存在時維持「試營運」：不扣 G。
   【多人】店內的玩家互相看得到（世界代號 'g'）。坐在椅子上的真人會一起對戰（事件 'gs'，由 tetris.html／race.html 的連線層處理；賽車的訊息帶 g:'race'，這裡依目前玩的遊戲分流）；沒坐滿的位置系統補滿；開局後才坐下的人只能觀戰。 */
const GSW = 16, GSH = 16;
const GS_FEE = 1000;   // 付費場入場費（要跟後端 arcade_cfg 的 tetris_paid 一致；免費場 0G、只跟 Bot）
const GS_SEATS = [[2, 4], [5, 4], [8, 4], [11, 4], [2, 9], [5, 9], [8, 9], [11, 9]];   // 8 張高腳椅（格子座標）
const GS_LINES = ['歡迎光臨！要玩一場嗎？', '坐到椅子上，選「俄羅斯方塊」或「賽車」就能開始。免費場跟 Bot 玩，付費場 1000 G 可以連線真人。', '嗶嗶～今天手感如何？', '兩款付費場拿第一名都有 token，每天最多一個喔！', '空位會有人補上，不用等。', '左下角的夾盲盒機，一個 token 夾一次！', '小心別被打成一排垃圾喔。'];
const gskind = Array.from({ length: GSH }, () => Array(GSW).fill(G));
for (let y = 0; y < GSH; y++) for (let x = 0; x < GSW; x++) if (y < 2 || y === GSH - 1 || x === 0 || x === GSW - 1) gskind[y][x] = BWL;
gskind[GSH - 1][7] = BX; gskind[GSH - 1][8] = BX;
{
  const put = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) gskind[y + j][x + i] = k; };
  [2, 7].forEach(ty => [2, 5, 8, 11].forEach(tx => put(tx - 1, ty, 2, 2, GSM)));   // 街機（每台 2×2 格）
  GS_SEATS.forEach(([x, y]) => { gskind[y][x] = GST; });
  put(1, 11, 4, 2, GSX);                    // 兩台夾娃娃機（第 11~12 排）
  put(10, 12, 4, 1, GSX); put(11, 11, 2, 1, GSX);   // 櫃檯、嗶嗶站的位置
  gskind[9][14] = GSX;                      // 盆栽（左下角那盆已刪）
}
let gs = null;          // 店內狀態：{ sit: null | { x, y, stand: [x, y] } }
let gsEco = null;       // 結算：null 還不知道、true 伺服器有結算、false 沒建（試營運）
let gsLine = 0;
const gsMissing = e => /function|schema cache|PGRST202|404/i.test(String((e && e.message) || e));

/* ---------- 進出 ---------- */
function enterArcade() {
  if (scene !== 'plaza' || !ready || !me || paused()) return;
  pose = null; scene = 'arcade'; K = gskind; W = GSW; H = GSH;
  gs = { sit: null };
  pl.x = pl.sx = 7; pl.y = pl.sy = GSH - 2; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  view.snap = true; fitView(); toast('歡迎光臨遊戲店！面向椅子按動作鍵坐下玩');
  lastPosKey = ''; posAcc = 999; trackSelf();
}
function leaveArcade(silent) {
  if (scene !== 'arcade') return;
  closeTetris(); gs = null;
  scene = 'plaza'; K = pkind; W = PLW; H = PLH;
  pl.x = pl.sx = GSB.x + 2; pl.y = pl.sy = GSB.y + GSB.h; pl.prog = 1; pl.face = 'down'; pressed.length = 0;
  view.snap = true; fitView(); lastPosKey = ''; posAcc = 999; trackSelf();
  if (!silent) toast('回到廣場了');
}

/* ---------- 玩家動作（actions.js 的 act 在 scene === 'arcade' 時呼叫） ---------- */
function arcadeAct(x, y) {
  if (!gs) return;
  const rp = remoteAt(x, y); if (rp) { openFriendPop(rp); return; }
  if (gs.sit) { openPicker(); return; }
  const k = K[y][x];
  if (k === BX) { leaveArcade(); return; }
  if (k === GST) { gsSit(x, y); return; }
  if (k === GSM) { pop(x, y, '街機：坐旁邊的椅子就能玩', '#fff3b0'); return; }
  if (k === GSX) {
    if (y >= 11 && y <= 12 && x >= 10 && x <= 13) { gsClerk(); return; }
    if (x <= 4 && y >= 11 && y <= 12) { openBB(x <= 2 ? 1 : 2); return; }   // 左邊 1 號機（街機電玩）、右邊 2 號機（糖果甜點）
    pop(x, y, '', '#fff3b0');
  }
}
function gsSit(x, y) {
  const st = [[0, 1], [0, -1], [-1, 0], [1, 0]].map(([dx, dy]) => [x + dx, y + dy]).find(([a, b]) => walkable(a, b));
  pl.x = pl.sx = x; pl.y = pl.sy = y; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  gs.sit = { x, y, stand: st || [x, y + 1] };
  lastPosKey = ''; posAcc = 999;
  openPicker();
}
function gsStand() {
  const s = gs && gs.sit; if (!s) return;
  closeTetris();
  pl.x = pl.sx = s.stand[0]; pl.y = pl.sy = s.stand[1]; pl.prog = 1; gs.sit = null; lastPosKey = ''; posAcc = 999;
}
function arcadeTick() {
  if (!gs || gsOpen) return;
  if (gs.sit && pressed.length) gsStand();
  if (gs.sit) pl.face = 'up';
}

/* 坐著玩的時候頭上一直有方塊泡泡（別人看得到）；起身、關掉遊戲或離開店內就消失 */
setInterval(() => {
  const on = ready && me && scene === 'arcade' && gs && gs.sit && gsOpen && gsFrame;
  if (on) { if (gs.kind === 'race') raceEmote(); else tetrisEmote(); } else if (myEmo && (myEmo.id === 'tetris' || myEmo.id === 'race')) myEmo = null;
}, 1500);

/* ---------- 俄羅斯方塊大亂鬥（嵌入 tetris.html） ---------- */
let gsFrame = null;   // gsOpen（面板開著）宣告在 state.js，paused() 要用
const gsEl = document.createElement('div');
gsEl.id = 'gsbox'; gsEl.hidden = true;
gsEl.style.cssText = 'position:fixed;inset:0;z-index:40;background:#0e1222';
document.body.appendChild(gsEl);
function gsCars() {   // 賽車車庫：玩家在夾盲盒抽到／用券換到的車（inventory 的 car:<id>）；免費的 3 台由賽車頁自己給
  const ids = []; try { Object.keys(inv || {}).forEach(k => { if (k.indexOf('car:') === 0 && (inv[k] | 0) > 0) ids.push(k.slice(4)); }); } catch (e) { /* 略過 */ }
  return ids;
}
/* 跟嗶嗶說話：開對話窗。每天第一次按「確認」領 1 個免費 token（後端 bb_npc_daily，每天 GMT+8 零點重置） */
let gsDailyTried = '', gsNpcEl = null;
const gsDay = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
function gsClerkPaint(cv) {   // 全身嗶嗶＋開心瞇眼＋手拿 token
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  const SK = '#5a6a80';
  GS_ROBO.forEach(q => { const happy = q[1] >= 6 && q[1] <= 8 && q[3] !== SK && (q[3] === '#5ae0ff' || q[3] === '#c8f6ff' || q[3] === '#1d2a3a') && q[0] !== 7 && q[0] !== 8; c.fillStyle = happy ? SK : q[3]; c.fillRect(q[0] + 2, q[1], q[2], 1); });
  c.fillStyle = '#5ae0ff'; [[4, 8], [5, 7], [6, 7], [7, 8], [9, 8], [10, 7], [11, 7], [12, 8]].forEach(p => c.fillRect(p[0] + 2, p[1], 1, 1));
  c.fillStyle = '#ff9bb3'; c.fillRect(5, 9, 2, 1); c.fillRect(13, 9, 2, 1);
  c.fillStyle = '#b8892a'; c.fillRect(17, 14, 6, 8); c.fillRect(16, 15, 8, 6); c.fillStyle = '#ffd34d'; c.fillRect(18, 15, 4, 6); c.fillRect(17, 16, 6, 4); c.fillStyle = '#fff3b0'; c.fillRect(18, 16, 2, 1);
}
function gsClerkClose() {
  if (!gsNpcEl) return;
  gsNpcEl.remove(); gsNpcEl = null; gsNpcOpen = false; pressed.length = 0; actHeld = false;
  removeEventListener('keydown', gsClerkKey, true);
}
function gsClerkKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); gsClerkClose(); } }
function gsClerk() {
  if (gsNpcOpen || !ready) return;
  const canClaim = gsEco !== false && gsDailyTried !== gsDay();
  gsNpcEl = document.createElement('div'); gsNpcEl.className = 'shop'; gsNpcEl.id = 'gsnpc';
  gsNpcEl.innerHTML = '<div class="card" tabindex="-1" style="max-width:340px"><div class="shop-h"><h2>嗶嗶</h2><span class="chip">遊戲店店員</span></div>' +
    '<div style="text-align:center;margin:8px 0 4px"><canvas width="26" height="24" style="width:156px;height:144px;image-rendering:pixelated;background:#e9f3ff;border-radius:10px"></canvas></div>' +
    '<p id="gsnpc-t" style="line-height:1.6;margin:6px 0 10px;text-align:center"></p><div id="gsnpc-b" style="display:flex;gap:8px"></div></div>';
  $('shop').parentNode.appendChild(gsNpcEl);
  gsNpcOpen = true; pressed.length = 0; actHeld = false;
  gsNpcEl.addEventListener('pointerdown', e => e.stopPropagation());
  addEventListener('keydown', gsClerkKey, true);
  gsClerkPaint(gsNpcEl.querySelector('canvas'));
  const txt = gsNpcEl.querySelector('#gsnpc-t'), bx = gsNpcEl.querySelector('#gsnpc-b');
  const btn = (label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + cls; b.style.flex = '1'; b.textContent = label; b.onclick = fn; bx.appendChild(b); return b; };
  const done = (t, chat) => { txt.textContent = t; bx.innerHTML = ''; if (chat) btn('聊聊', 'ghost', () => done('嗶嗶：' + GS_LINES[gsLine++ % GS_LINES.length], true)); btn('離開', '', gsClerkClose).focus(); };
  if (!canClaim) { done('嗶嗶：' + GS_LINES[gsLine++ % GS_LINES.length], true); return; }
  txt.textContent = '嗶嗶：今天也來啦！要領今天的免費 token 嗎？';
  const ok = btn('確認', '', async () => {
    ok.disabled = true;
    try {
      const r = await rpc('bb_npc_daily'); gsDailyTried = gsDay(); bbSet(r); gsPostTok();
      done('嗶嗶：送你 1 個 token，拿去夾盲盒吧～（現在有 ' + (bbS.tokens | 0) + ' 個）', true);
    } catch (e) {
      const m = String((e && (e.message || e.msg)) || e || '');
      if (m.includes('token_full')) done('嗶嗶：token 已經滿 10 個啦，先用掉再來領今天的吧！', false);
      else if (m.includes('already_claimed')) { gsDailyTried = gsDay(); done('嗶嗶：今天已經領過囉，明天再來！', true); }
      else done('嗶嗶：機器好像在打瞌睡，等一下再試試。', false);
    }
  });
  btn('離開', 'ghost', gsClerkClose); ok.focus();
}
function gsPost(m) { try { if (gsFrame && gsFrame.contentWindow) gsFrame.contentWindow.postMessage(m, '*'); } catch (e) { /* 略過 */ } }
/* 坐下後先選要玩哪一款：俄羅斯方塊大亂鬥／賽車（都是 8 人、沒坐滿的位置系統補上） */
const GS_GAMES = [
  { k: 'tetris', ic: '🧱', n: '俄羅斯方塊', d: '大亂鬥 · 8 人對戰' },
  { k: 'race', ic: '🏎️', n: '賽車', d: '8 人同場 · 撿道具、漂移' }
];
function openPicker() {
  if (!gs || !gs.sit) return;
  if (gsOpen && gsFrame) return;
  gsOpen = true; pressed.length = 0; actHeld = false; gsFrame = null;
  gsEl.innerHTML = ''; gsEl.hidden = false;
  const w = document.createElement('div');
  w.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;font-family:inherit;color:#fff';
  w.innerHTML = '<div style="font-size:22px;font-weight:800;letter-spacing:.08em">要玩哪一款？</div>' +
    '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">' + GS_GAMES.map((g, i) =>
      '<button type="button" data-g="' + g.k + '" style="width:min(42vw,200px);min-width:140px;border:4px solid #8a6cff;background:#1a1f3a;color:#fff;border-radius:18px;padding:18px 10px;font:inherit;font-weight:800;cursor:pointer;box-shadow:0 5px 0 #4b3a9a">' +
      '<div style="font-size:44px;line-height:1.2">' + g.ic + '</div><div style="font-size:19px;margin-top:6px">' + g.n + '</div><div style="font-size:12px;font-weight:700;color:#b9b4e6;margin-top:4px">' + g.d + '</div>' +
      '<div style="font-size:11px;color:#8d89b8;margin-top:6px">按 ' + (i + 1) + '</div></button>').join('') + '</div>' +
    '<button type="button" data-g="stand" style="border:3px solid #55597a;background:transparent;color:#cfd2ee;border-radius:999px;padding:8px 22px;font:inherit;font-weight:800;cursor:pointer">站起來</button>';
  w.addEventListener('click', e => { const b = e.target.closest('button[data-g]'); if (!b) return; gsPickDone(b.dataset.g); });
  gsEl.appendChild(w);
}
function gsPickDone(k) {
  if (k === 'stand') { gsStand(); return; }
  if (k === 'tetris' || k === 'race') { gsOpen = false; openGame(k); }
}
addEventListener('keydown', e => {
  if (!gsOpen || gsFrame || !gs || !gs.sit) return;
  if (e.key === '1') gsPickDone('tetris'); else if (e.key === '2') gsPickDone('race'); else if (e.key === 'Escape') gsStand(); else return;
  e.preventDefault();
});
function openTetris() { openGame('tetris'); }
function openGame(kind) {
  if (gsOpen || !gs) return;
  gsOpen = true; pressed.length = 0; actHeld = false; gs.kind = kind;
  gsFrame = document.createElement('iframe');
  gsFrame.src = kind === 'race' ? 'race.html?embed=1&v=rc1' : 'tetris.html?embed=1&v=tt2';
  gsFrame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#0e1222';
  gsFrame.setAttribute('allow', 'fullscreen');
  gsEl.innerHTML = ''; gsEl.appendChild(gsFrame); gsEl.hidden = false;
}
function closeTetris() {
  if (!gsOpen) return;
  gsOpen = false; gsEl.hidden = true; gsEl.innerHTML = ''; gsFrame = null; pressed.length = 0;
  try { refreshHud(); } catch (e) { /* 略過 */ }
}
const gsCoins = () => (me && typeof me.coins === 'number') ? me.coins : 0;
/* 開局請款：有伺服器函式就扣 100 G；沒建就是試營運（不扣） */
let gsLogId = 0;
async function gsCharge(paid) {
  if (gsEco !== false) {
    try {
      const r = await rpc('arcade_tetris_enter', { p_paid: !!paid });
      gsLogId = (r && typeof r.log_id === 'number') ? r.log_id : 0;
      gsEco = true;
      if (r && typeof r.coins === 'number' && me) { me.coins = r.coins; try { refreshHud(); } catch (e) { /* 略過 */ } }
      return { ok: true, v: gsCoins(), trial: false, logId: gsLogId };
    } catch (e) {
      if (!gsMissing(e)) {
        const code = String((e && e.message) || '').trim();
        return { ok: false, v: gsCoins(), trial: false, msg: ERR[code] || '現在不能開局：' + code.slice(0, 60) };   // 把伺服器回的錯誤訊息一起顯示，方便查（例如表名或欄位名不對）
      }
      gsEco = false; toast('試營運：遊戲店不扣 G', 2400);
    }
  }
  return { ok: true, v: gsCoins(), trial: true };
}
/* 把「今天還能不能拿 token」告訴 iframe 的大廳（先向後端問最新的一次） */
const gsPostTok = () => gsPost({ t: 'tt-tok', claimed: !!bbS.today_claimed, tokens: bbS.tokens | 0 });
async function gsTok() { try { bbSet(await rpc('bb_state')); gsPostTok(); } catch (e) { /* 後端沒裝就不顯示 */ } }
/* 賽車熟練度／塗裝：資料存後端 race_car（沒裝 SQL 就整個功能靜默關閉，不影響比賽） */
let gsCosOk = true;
async function gsGarage() {
  if (!gsCosOk) return;
  try { const r = await rpc('race_garage'); gsPost({ t: 'tt-garage', cars: (r && r.cars) || {} }); }
  catch (e) { if (gsMissing(e)) gsCosOk = false; }
}
async function gsXp(logId, car) {   // 付費場跑完 +1 經驗（後端用 log 驗證，同一場只算一次）
  if (!gsCosOk || !logId || gsEco !== true) return;
  try { const r = await rpc('race_xp_add', { p_log_id: logId, p_car: car }); gsPost({ t: 'tt-xp-res', ok: true, car: r.car, xp: r.xp, lv: r.lv, up: !!r.up, cars: r.cars }); }
  catch (e) { if (gsMissing(e)) gsCosOk = false; gsPost({ t: 'tt-xp-res', ok: false }); }
}
async function gsCosSave(d) {
  if (!gsCosOk) return;
  try { const r = await rpc('race_car_set', { p_car: String(d.car), p_color: String(d.c), p_sticker: String(d.k), p_flame: String(d.f), p_spark: String(d.s) }); gsPost({ t: 'tt-garage', cars: r.cars, saved: true }); }
  catch (e) { if (gsMissing(e)) gsCosOk = false; gsPost({ t: 'tt-garage', cars: null, err: String((e && e.message) || '').slice(0, 40) }); }
}
/* 付費場拿第一名 → 請後端發 token（後端每天最多發 1 個、持有滿 10 不發） */
async function gsAward(logId) {
  if (!logId || gsEco !== true) return;
  try {
    const r = await rpc('bb_tetris_award', { p_log_id: logId });
    if (r && typeof r.tokens === 'number') bbSet(r);
    const msg = r && r.granted ? '獲得 1 個 token！' : (r && r.tokens >= 10 ? 'token 已滿 10 個' : '今天的 token 已經領過了');
    gsPost({ t: 'tt-award', msg }); gsPostTok(); toast(msg, 2600);
  } catch (e) { gsPost({ t: 'tt-award', msg: '' }); }
}
/* 真人連線：iframe 裡的對戰程式只管邏輯，訊息由這裡轉到店內頻道（事件 'gs'）；收到別人的再轉進 iframe */
const gsSeatIdx = () => (gs && gs.sit) ? GS_SEATS.findIndex(([x, y]) => x === gs.sit.x && y === gs.sit.y) : -1;
function gsSend(m) {
  if (!net || !net.ok || !m || typeof m !== 'object') return;
  try { if (JSON.stringify(m).length > 6000) return; net.ch.send({ type: 'broadcast', event: 'gs', payload: { i: myUid, m } }); } catch (e) { /* 略過 */ }
}
function onGsMsg(p) {
  if (!p || typeof p !== 'object' || typeof p.i !== 'string' || !UID_RE.test(p.i) || p.i === myUid || scene !== 'arcade' || !gsFrame || !p.m || typeof p.m !== 'object') return;
  if ((p.m.g === 'race') !== (gs && gs.kind === 'race')) return;   // 賽車和俄羅斯方塊各聽各的
  gsPost({ t: 'tt-in', from: p.i, m: p.m });
}
window.addEventListener('message', e => {
  if (!gsFrame || e.source !== gsFrame.contentWindow) return;
  const d = e.data; if (!d || typeof d !== 'object') return;
  if (d.t === 'tt-ready') { gsTok(); gsPost({ t: 'tt-cars', ids: gsCars() }); gsGarage(); gsPost({ t: 'tt-mus', on: !!musicOn, vol: +musicVol || 0 }); gsPost({ t: 'tt-bal', v: gsCoins(), trial: gsEco === false, fee: GS_FEE }); gsPost({ t: 'tt-me', net: !!(net && net.ok), uid: myUid, name: me ? me.name : '', seat: Math.max(0, gsSeatIdx()) }); }
  else if (d.t === 'tt-net') gsSend(d.m);
  else if (d.t === 'tt-fee') gsCharge(!!d.paid).then(r => gsPost({ t: 'tt-fee-res', ok: r.ok, v: r.v, trial: r.trial, msg: r.msg, logId: r.logId || 0 }));
  else if (d.t === 'tt-win') gsAward(+d.logId | 0);
  else if (d.t === 'tt-xp') gsXp(+d.logId | 0, String(d.car || ''));
  else if (d.t === 'tt-cos') gsCosSave(d);
  else if (d.t === 'tt-exit') closeTetris();
});

/* ---------- 畫面 ---------- */
function drawGameBldg(now, lit) {
  const ox = GSB.x * T, oy = GSB.y * T;
  gsExt(ox, oy, now, lit);
}
function drawArcadeRoom(now) {
  if (!gs) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#12182c'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore();
  r('#12182c', 0, 0, W * T, H * T);
  gsRoom(now, [{ k: 'robo', x: 11.5, y: 10.8, dir: 'down', bob: Math.floor(now / 600) % 2 }], darkness(world().min) > 0.35);
}
const arcadeSeatedNow = () => scene === 'arcade' && !!gs && !!gs.sit;
function arcadeDrawSeated(ch, now) {
  const px = Math.round(gs.sit.x * T), py = Math.round(gs.sit.y * T - 3);
  drawPlayerFx(px, py, 'up', false, 0, ch, null);
  nameTag(ch.name, px + 8, py - 5, '#ffffff');
}
