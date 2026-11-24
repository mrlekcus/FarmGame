'use strict';
/* 火車抓蟲團（核心：車廂集合 → 發車動畫 → 草原站抓蟲 → 結算）—— 雷克斯農場。
   後端是獨立的一套 train_* RPC（train_core.sql），不動出海團。伺服器決定誰是成員、什麼時候發車、每個人的蟲名單、能不能抓；
   這裡只負責顯示：名單由伺服器回傳（me.list），客戶端不自己重算種子。
   場景：scene === 'train'，子場景 tr.sub = 'car'（車廂 16×12）／'meadow'（草原站 24×16），切換走 trainGoto（同時換地圖尺寸、清蟲、重設出生點）。
   入口：廣場火車站的門（STD）→ openTrainStation()。畫面元件沿用出海團的 voyHud／voyPanel／voyM／voyCard。
   站點：草原（第 1 次開團）、山間（第 2、3 次）；第 4 分鐘伺服器抽神秘路線，中籤 5:00 全員上車去夜行站。每站的蟲名單在 me.st[站名]。
   還沒做：車廂與站點裡看到其他玩家（沒開網路房間）、全服招募通知（改成在站長那邊看清單）、傳說蟲全服廣播。 */
const TRW = 16, TRH = 12, MDW = 24, MDH = 16;
const trCarK = Array.from({ length: TRH }, (_, y) => Array.from({ length: TRW }, (_, x) => (y < 3 || y === TRH - 1 || x === 0 || x === TRW - 1) ? HB : G));
[[2, 4], [2, 8], [11, 4], [11, 8]].forEach(([bx, by]) => { for (let i = 0; i < 3; i++) trCarK[by][bx + i] = HB; });
const trMdK = Array.from({ length: MDH }, (_, y) => Array.from({ length: MDW }, (_, x) => (x === 0 || y === 0 || x === MDW - 1 || y === MDH - 1) ? TR : G));
for (let y = 1; y <= 4; y++) for (let x = 19; x <= 21; x++) trMdK[y][x] = HB;     // 風車
for (let x = 0; x < MDW; x++) trMdK[MDH - 2][x] = HB;                          // 整排軌道（y14，穿過左右兩邊的樹林，走不進去）
for (let x = 2; x <= 10; x++) trMdK[MDH - 3][x] = HB;                              // 停在軌道上的火車（車頭＋兩節車廂，擋住上面那一排）
const trMtK = Array.from({ length: MDH }, (_, y) => Array.from({ length: MDW }, (_, x) => (x === 0 || y === 0 || x === MDW - 1 || y === MDH - 1) ? TR : G));
[[10, 5], [11, 5], [15, 9], [16, 9], [16, 10], [8, 12], [20, 13], [21, 13], [21, 12]].forEach(([x, y]) => { trMtK[y][x] = HB; });   // 岩石
[[1, 4], [3, 5], [2, 7], [4, 8], [1, 10], [3, 11], [5, 6]].forEach(([x, y]) => { trMtK[y][x] = TR; });   // 左邊原月台位置：楓樹林
for (let x = 0; x < MDW; x++) trMtK[MDH - 2][x] = HB;                          // 整排軌道
for (let x = 2; x <= 10; x++) trMtK[MDH - 3][x] = HB;                              // 停著的火車
const trNtK = Array.from({ length: MDH }, (_, y) => Array.from({ length: MDW }, (_, x) => (x === 0 || y === 0 || x === MDW - 1 || y === MDH - 1) ? TR : G));
[[12, 3], [13, 3], [18, 10], [9, 11]].forEach(([x, y]) => { trNtK[y][x] = HB; });  // 發光石
for (let x = 0; x < MDW; x++) trNtK[MDH - 2][x] = HB;                          // 整排軌道
for (let x = 2; x <= 10; x++) trNtK[MDH - 3][x] = HB;                              // 停著的火車
const TR_STN = { meadow: { name: '草原站', K: trMdK }, mountain: { name: '山間站', K: trMtK }, night: { name: '夜行站', K: trNtK } };
const trIsStn = (sub) => !!TR_STN[sub];
const TR_CAR_SPAWN = [[5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [5, 7], [6, 7]];
const TR_NET_CD = 850;                                                              // 揮網間隔：伺服器是 800 ms，前端留一點餘裕，避免連點被 too_fast 打回而白白損失名額
const tr = { stDone: {}, cur: null, sub: 'car', back: null, busy: false, pollAt: 0, endChecked: 0, dep: 0, crit: [], taken: new Set(), caught: new Set(), netCool: 0, sum: null, info: null, list: [], finishing: false };
const trMk = (h) => { voyCard.innerHTML = h; };
const trAboard = () => !!tr.cur && scene === 'train';
const trIsHost = () => !!tr.cur && tr.cur.host === myUid;
const trBack = () => ({ scene, x: pl.x, y: pl.y });
const TR_TIER = { 1: '第 1 次開團', 2: '第 2 次開團', 3: '第 3 次開團' };
const TR_OPEN_DAYS = '星期二、四、六';
Object.assign(ERR, { train_not_open_day: '火車站只在' + TR_OPEN_DAYS + '開團，今天可以加入別人的團', already_in_train: '你已經在一趟火車抓蟲團裡了', level_locked: '捕蟲等級不夠，這隻抓不到', bad_index: '沒有這隻蟲', not_appeared: '這隻還沒出現', already_caught: '這隻已經抓過了', catch_cap: '這一站你抓到上限了', wrong_station: '已經換站了，等一下',  too_fast: '揮網太快了，慢一點', train_unbuilt: '你還沒把車站蓋好，先去站長那邊捐資（或加入別人的團）', train_already_built: '你的車站已經蓋好了', bad_amount: '捐的數量不對', not_enough_item: '身上的材料不夠', train_pay_not_wired: '火車站的扣款還沒接好（請管理員確認 SQL）', train_refund_not_wired: '火車站的退款還沒接好（請管理員確認 SQL）' });

/* ---------- 進出場景 ---------- */
function trainGoto(sub) {                     // 車廂與站點切換不經過農場：同時換地圖尺寸、清空蟲、重設出生點（地圖尺寸漏改，離開後會停在錯的值）
  tr.sub = sub;
  K = trIsStn(sub) ? TR_STN[sub].K : trCarK; W = trIsStn(sub) ? MDW : TRW; H = trIsStn(sub) ? MDH : TRH; tr.taken = new Set(); tr.built = false; tr.crit = [];
  tr.caught = new Set(((((tr.cur && tr.cur.me && tr.cur.me.st) || {})[sub] || {}).caught || []).map(Number));
  remotes.clear(); critters.length = 0; critSlot = -1; fishing = null; pose = null; pressed.length = 0;
  const idx = Math.max(0, ((tr.cur && tr.cur.members) || []).findIndex(m => m.uid === myUid));
  if (trIsStn(sub)) { pl.x = pl.sx = 3; pl.y = pl.sy = 8 + (idx % 3) - 1; pl.face = 'right'; trBuildCritters(); }
  else { const s = TR_CAR_SPAWN[idx % TR_CAR_SPAWN.length]; pl.x = pl.sx = s[0]; pl.y = pl.sy = s[1]; pl.face = 'up'; tr.crit = []; }
  pl.prog = 1; view.snap = true; fitView(); lastPosKey = ''; lastSendAt = 0; if (net && net.ok) trackSelf();   // 換站＝換世界：馬上告訴同車的人我在哪
}
function enterTrain(v, back) {
  if (!v || !v.id) return;
  if (typeof closeFriendPop === 'function') closeFriendPop();
  quietToFarm(); hideCatch(); cooking = null;
  if (scene === 'plaza' || scene === 'farm') { /* quietToFarm 已經離開廣場 */ }
  tr.cur = v; tr.back = back || { scene: 'plaza' }; tr.dep = 0; tr.finishing = false; tr.busy = false; tr.pollAt = Date.now(); tr.endChecked = 0; tr.sum = null;
  tr.built = false; tr.taken = new Set(); tr.caught = new Set(); tr.mysteryToast = 0;
  scene = 'train'; trainGoto(v.status === 'running' && trIsStn(v.station) ? v.station : 'car');
  remotes.clear(); vLog.innerHTML = ''; logNewHide(); myBubble = null; myShow = null; lastPosKey = ''; posAcc = 0; vPanel.hidden = false; renderVillage(); startNet('train-' + v.id, false);   // 同一趟的人在同一個頻道，看得到彼此、能聊天
  trRender();
  toast(v.status === 'running' ? '回到車上了' : (trIsHost() ? '上車了！等朋友加入，準備好就按「發車」' : '上車了！按「準備」讓站長知道'), 3000);
  if (typeof syncBgm === 'function') syncBgm();
}
function leaveTrain(silent) {
  if (scene !== 'train') { tr.cur = null; return; }
  const back = (tr.back || {}).scene;
  stopNet(); vPanel.hidden = true; myBubble = null; myShow = null;
  tr.cur = null; tr.dep = 0; tr.crit = []; tr.sum = null; voyHud.hidden = true; voyPanel.hidden = true; voyPanel.innerHTML = ''; if (vyOpen) closeVoyModal();
  scene = 'farm'; K = kind; W = BW; H = BH; remotes.clear();
  pl.x = pl.sx = 18; pl.y = pl.sy = 5; pl.prog = 1; pl.face = 'left'; pressed.length = 0; view.snap = true; fitView();
  if (!silent) toast('回到廣場了');
  if (!silent) { plazaSpawn = [STB.x + 3, STB.y + STB.h, 'down']; joinVillage('public'); }
  if (typeof syncBgm === 'function') syncBgm();
}
function trEnded(msg) { if (msg) toast(msg, 3200); if (vyOpen) closeVoyModal(); leaveTrain(); }

/* ---------- 站長：開團、看招募中的團 ---------- */
async function openTrainStation() {
  if (!ready || !me || voy.busy) return;
  if (!sb) { toast('火車站還沒開通'); return; }
  try {
    const [info, list] = await Promise.all([rpc('train_info'), rpc('train_list_open')]);
    tr.info = info; tr.list = Array.isArray(list) ? list : [];
  } catch (e) { toast('火車抓蟲團還沒開通，敬請期待！'); return; }
  if (tr.info && tr.info.station_done === false && typeof scgTrnIntro === 'function' && scgTrnIntro(() => openTrainStation())) return;   // 第一次來、車站還沒蓋好：先看站長講故事
  voy.mode = 'train'; vyOpen = true; pressed.length = 0; renderTrainStation(); voyM.hidden = false; voyCard.focus();
}
function renderTrainStation() {
  const i = tr.info || {}, used = i.used | 0, max = i.daily_max || 3, next = Math.min(used + 1, 3), price = (i.prices || [500, 800, 1000])[next - 1];
  let h = '<h2>火車站</h2><div class="voyport"><canvas id="tr-port" width="16" height="16" style="width:64px;height:64px;image-rendering:pixelated"></canvas><p class="lkline">貓咪站長：「準備好網子了嗎？車廂裡集合，到站抓蟲，每人獨立拿蟲不用搶。」</p></div>';
  const built = i.station_done !== false;
  if (!built) {
    const nd = i.need || {}, hv = i.have || {}, inv_ = (typeof inv !== 'undefined' && inv) || {};
    const rows = [['wood', 'm:wood', '木頭'], ['stone', 'm:stone', '石頭'], ['copper', 'm:copper', '銅礦'], ['coins', null, '金幣']];
    const pct = rows.reduce((a, [k]) => a + Math.min(1, (nd[k] | 0) ? (hv[k] | 0) / (nd[k] | 0) : 1), 0) / rows.length * 100 | 0;
    h += '<div class="trb"><div class="trb-top"><b>車站興建</b><span>整體進度 ' + pct + '%</span></div><div class="trb-bar big"><i style="width:' + pct + '%"></i></div>';
    h += '<p class="trb-tip">要自己捐材料和金幣把車站蓋好，才能「開團」。沒蓋好也可以加入別人的團，一樣抓蟲。</p><div class="trb-grid">';
    h += rows.map(([k, ik, nm]) => {
      const need = nd[k] | 0, got = hv[k] | 0, left = Math.max(0, need - got), own = k === 'coins' ? (me.coins | 0) : (inv_[ik] | 0), can = Math.min(left, own), w = need ? Math.min(100, Math.round(got * 100 / need)) : 100;
      return '<div class="trb-card' + (left ? '' : ' ok') + '"><canvas class="trb-ic" data-ic="' + k + '" width="16" height="16"></canvas><div class="trb-nm">' + nm + '</div>' +
        '<div class="trb-bar"><i style="width:' + w + '%"></i></div><div class="trb-nums">' + got + ' / ' + need + (left ? '<small>身上 ' + own + '</small>' : '') + '</div>' +
        (left ? '<button type="button" class="btn small" data-t="donate" data-k="' + k + '" data-a="' + can + '"' + (can ? '' : ' disabled') + '>' + (can >= left ? '補齊' : can ? '捐 ' + can : '不夠') + '</button>' : '<div class="trb-done">完成</div>') + '</div>';
    }).join('') + '</div></div>';
  } else {
    h += '<p>今天已開 ' + used + '／' + max + ' 次 · 開團日：' + TR_OPEN_DAYS + (i.day_ok ? '' : '（今天不能開，可以加入別人的團）') + '</p>';
    h += '<div class="btnrow"><button type="button" class="btn" data-t="open"' + (!i.day_ok || used >= max ? ' disabled' : '') + '>開團（' + TR_TIER[next] + ' · ' + price + ' G）</button></div>';
  }
  h += '<h3>招募中的團</h3>' + (tr.list.length ? tr.list.map(n => '<div class="v-last"><b>' + esc(n.host_name || '旅人') + '</b> · ' + TR_TIER[n.tier] + ' · ' + n.n + '/' + n.cap + ' 人 · ' + voyFmt(n.lobby_ms - srvNow()) +
    ' <button type="button" class="btn small" data-t="join" data-id="' + esc(n.id) + '">加入（免費）</button></div>').join('') : '<p class="muted">現在沒有人在招募。</p>');
  h += '<div class="btnrow"><button type="button" class="btn ghost" data-t="story">重看劇情</button><button type="button" class="btn ghost" data-t="refresh">重新整理</button><button type="button" class="btn ghost" data-t="close">關閉</button></div>';
  trMk(h);
  const pc = document.getElementById('tr-port'); if (pc && typeof stationMasterPortrait === 'function') stationMasterPortrait(pc.getContext('2d'), Date.now());
  voyCard.querySelectorAll('canvas.trb-ic').forEach(cv => trResIcon(cv.getContext('2d'), cv.dataset.ic));
}
async function trOpenRun() {
  if (voy.busy) return; voy.busy = true; const back = trBack();
  try {
    const v = await rpc('train_open', { p_tier: null, p_name: me.name, p_back: back });
    closeVoyModal(); if (typeof v.price === 'number' && v.price > 0) { me.coins = Math.max(0, me.coins - v.price); refreshHud(); }
    enterTrain(v, back); resync();
  } catch (e) { toast(errText(e)); }
  voy.busy = false;
}
async function trDonate(kind, amt) {
  if (voy.busy || !(amt > 0)) return; voy.busy = true;
  try {
    const r = await rpc('train_donate', { p_kind: kind, p_amt: amt });
    if (kind === 'coins') { me.coins = Math.max(0, me.coins - (r.paid | 0)); refreshHud(); }
    await resync();                                                 // 材料從背包扣掉，重新抓一次存檔狀態
    tr.info = await rpc('train_info'); renderTrainStation();
    if (r.built) { toast('車站蓋好了！現在可以開團了', 3200); if (typeof scgTrnFinale === 'function') { closeVoyModal(); voy.busy = false; if (scgTrnFinale(() => openTrainStation())) return; openTrainStation(); return; } }
    else toast('捐出了 ' + r.paid + (kind === 'coins' ? ' G' : ' 個'), 3200);
  } catch (e) { toast(errText(e)); }
  voy.busy = false;
}
async function trJoinRun(id) {
  if (voy.busy) return; voy.busy = true; const back = trBack();
  try { const v = await rpc('train_join', { p_id: id, p_name: me.name, p_back: back }); closeVoyModal(); enterTrain(v, back); }
  catch (e) { toast(errText(e)); try { tr.list = await rpc('train_list_open'); renderTrainStation(); } catch (e2) { /* 略過 */ } }
  voy.busy = false;
}

/* ---------- 狀態同步（輪詢，伺服器為準）---------- */
async function trSync() {
  const v0 = tr.cur; if (!v0) return; tr.pollAt = Date.now();
  try { const v = await rpc('train_state', { p_id: v0.id }); if (tr.cur && tr.cur.id === v0.id) trApply(v); }
  catch (e) { if (/not_member/.test(String((e && e.message) || e))) trEnded('你已經不在這趟火車團了'); }
}
function trApply(v) {
  if (!v || !tr.cur) return;
  const prev = tr.cur; tr.cur = v;
  const stn = ((v.me && v.me.st) || {})[tr.sub]; if (stn && stn.caught) stn.caught.forEach(i => tr.caught.add(+i));
  if (v.status === 'cancelled') { trEnded(prev.host === myUid ? '火車團已解散，車票已退還' : '站長解散了這趟火車團'); return; }
  if (v.me && v.me.active === false) { trEnded('你已經不在這趟火車團了'); return; }
  if (prev.status === 'lobby' && v.status === 'running' && scene === 'train') { trDepart(v.station); return; }
  if (v.status === 'running' && trIsStn(v.station) && !tr.dep && tr.sub !== v.station) { trDepart(v.station); return; }
  if (v.status === 'running' && v.mystery === true && !tr.mysteryToast && scene === 'train') {
    tr.mysteryToast = 1; toast('汽笛響了！1 分鐘後發車，前往神秘的夜行站', 4200); if (typeof sfxWhistle === 'function') sfxWhistle(); chime([84, 79, 72], 0.1);
  }
  if (v.status === 'done') { trFinish(); return; }
  trRender();
}
function trDepart(to) {                        // 發車動畫約 3 秒（景色捲動、車廂晃動），結束後全員到站；從站點出發（去夜行站）時先回到車廂再播動畫
  to = trIsStn(to) ? to : ((tr.cur && tr.cur.start_station) || 'meadow');
  if (tr.dep) return; if (tr.sub !== 'car') trainGoto('car'); tr.dep = performance.now(); toast(to === 'night' ? '全員上車，出發去夜行站！' : '發車囉！', 2600); chime([72, 79, 84], 0.12);
  if (typeof sfxWhistle === 'function') sfxWhistle();
  setTimeout(() => {
    if (!tr.cur || scene !== 'train') return; tr.dep = 0;
    const dest = (tr.cur.status === 'running' && trIsStn(tr.cur.station)) ? tr.cur.station : to;       // 動畫期間伺服器狀態可能又變了，以最新的為準
    trainGoto(dest); trRender(); toast('到了' + TR_STN[dest].name + '！拿網子抓蟲吧，每人獨立拿蟲不用搶', 3600);
  }, 3000);
}
async function trFinish() {
  if (tr.finishing || !tr.cur) return; tr.finishing = true; const id = tr.cur.id;
  voyHT.textContent = '🚂 結算中…'; voyHB.innerHTML = ''; voyHud.classList.remove('hasb');
  await new Promise(res => setTimeout(res, 2400));   // 結束後約 2.5 秒內伺服器還接受最後一次揮網
  try { tr.sum = await rpc('train_summary', { p_id: id }); } catch (e) { tr.sum = null; }
  if (scene !== 'train') return;
  if (!tr.sum) { toast('火車團結束了'); leaveTrain(); return; }
  voy.mode = 'summary'; vyOpen = true; pressed.length = 0; renderTrainSummary(); voyM.hidden = false; resync();
}
function renderTrainSummary() {
  const s = tr.sum || { rows: [] }, rows = s.rows || [];
  trMk('<h2>火車抓蟲團結算</h2><div class="v-list">' + rows.map((m, i) => '<div class="v-last">' + (i === 0 && m.count > 0 ? '👑 ' : '') + esc(m.name || '旅人') + (m.uid === s.me ? '（你）' : '') + ' · 🐛 ' + (m.count | 0) + ' 隻' + (m.rare ? ' · 稀有以上 ' + m.rare : '') + '</div>').join('') +
    '</div><p class="muted">抓到的蟲已經放進背包，到商店賣掉或放進圖鑑。</p><div class="btnrow"><button type="button" class="btn" data-t="home">回到廣場</button></div>');
}

/* ---------- 車廂面板、倒數 HUD ---------- */
function trRender() {
  const v = tr.cur;
  if (!v || scene !== 'train') { voyPanel.hidden = true; voyHud.hidden = true; return; }
  const host = trIsHost(), mem = v.members || [], lobby = v.status === 'lobby', wait = mem.filter(m => !m.host && !m.ready).length;
  let h = '<div class="v-head"><b>火車抓蟲團</b><span class="v-last">' + esc(v.host_name || '站長') + ' 的團 · ' + (TR_TIER[v.tier] || '') + '</span></div>';
  h += '<div class="v-list">' + mem.map(m => '<span class="pchip' + (m.host ? ' host' : '') + '">' + (m.host ? '👑 ' : '') + esc(m.name || '旅人') + (m.uid === myUid ? '（你）' : '') +
    (lobby && !m.host ? (m.ready ? ' <span class="rdy on">✓</span>' : ' <span class="rdy">…</span>') : '') + (!lobby ? ' <small>🐛' + (m.catches | 0) + '</small>' : '') +
    (lobby && host && !m.host ? '<button type="button" class="pkick" data-t="kick" data-u="' + esc(m.uid) + '" aria-label="踢掉 ' + esc(m.name) + '">✕</button>' : '') + '</span>').join('') + '</div>';
  if (lobby) {
    h += '<p class="voy-note">' + (host ? (wait ? '還有 ' + wait + ' 人沒準備。' : mem.length > 1 ? '大家都準備好了！' : '只有你一個人也可以直接發車。') : '按上方的「準備」，準備好之後等站長發車。') + '</p><div class="v-quick">';
    if (host) h += (wait ? '<button type="button" class="btn small ghost" data-t="kickall">踢掉未準備的人（' + wait + '）</button>' : '') + '<button type="button" class="btn small ghost" data-t="cancel">解散並退票</button>';
    h += '</div>';
  } else h += '<p class="voy-note">用捕蟲網，面向蟲按動作鍵揮網。每人看到自己的蟲，不用搶；抓到上限就不能再抓。</p><div class="v-quick"><button type="button" class="btn small ghost" data-t="leave">' + (tr.leaveAsk > Date.now() ? '再按一次確定離開' : '離開這趟（不退票）') + '</button></div>';
  voyPanel.innerHTML = h; voyPanel.hidden = false; trHud();
}
function trHud() {
  const v = tr.cur; if (!v || scene !== 'train') { voyHud.hidden = true; return; }
  const now = srvNow(); let t;
  if (v.status === 'lobby') t = '🚂 集合中 ' + voyFmt(v.lobby_ms - now) + ' · ' + (v.members || []).length + '/' + (v.cap || 8) + ' 人';
  else if (v.status === 'running') {
    const sn = trIsStn(tr.sub) ? tr.sub : (v.station || v.start_station), cap = (((v.me && v.me.st) || {})[sn] || {}).cap || 10;
    const end = sn === 'night' ? v.ends_ms : v.started_ms + v.run_ms;
    t = '🚂 ' + (TR_STN[sn] ? TR_STN[sn].name : '') + ' ' + voyFmt(Math.max(0, end - now)) + ' · 🐛 ' + tr.caught.size + '/' + cap + (v.mystery === true && sn !== 'night' ? ' · 即將發車' : '');
  }
  else t = '🚂 結算中…';
  if (voyHT.textContent !== t) voyHT.textContent = t;
  let bh = '';
  if (v.status === 'lobby') {
    const mm = (v.members || []).find(m => m.uid === myUid), wait = (v.members || []).filter(m => !m.host && !m.ready).length;
    bh = trIsHost() ? '<button type="button" class="btn small" data-t="start"' + (wait ? ' disabled' : '') + '>發車</button>' :
      '<button type="button" class="btn small" data-t="ready" aria-pressed="' + (mm && mm.ready ? 'true' : 'false') + '">' + (mm && mm.ready ? '取消準備' : '準備') + '</button><button type="button" class="btn small ghost" data-t="leave">離開</button>';
  }
  if (bh !== tr.hbSig) { tr.hbSig = bh; voyHB.innerHTML = bh; voyHud.classList.toggle('hasb', !!bh); }
  voyHud.hidden = false;
}
async function trClick(e) {
  const b = e.target.closest('button[data-t]');
  if (!b) return; const a = b.dataset.t;
  if (a === 'open') { trOpenRun(); return; }
  if (a === 'join') { trJoinRun(b.dataset.id); return; }
  if (a === 'donate') { trDonate(b.dataset.k, +b.dataset.a); return; }
  if (a === 'close') { closeVoyModal(); return; }
  if (a === 'story') { closeVoyModal(); if (typeof scgTrnOpen === 'function') scgTrnOpen(0, (tr.info && tr.info.station_done === false) ? 1 : 3, () => openTrainStation()); return; }
  if (a === 'home') { closeVoyModal(); leaveTrain(); return; }
  if (a === 'refresh') { try { tr.info = await rpc('train_info'); tr.list = await rpc('train_list_open'); renderTrainStation(); } catch (e2) { toast(errText(e2)); } return; }
  const v = tr.cur; if (!v || voy.busy) return; voy.busy = true;
  try {
    if (a === 'ready') { const m = (v.members || []).find(q => q.uid === myUid); trApply(await rpc('train_ready', { p_id: v.id, p_ready: !(m && m.ready) })); }
    else if (a === 'start') trApply(await rpc('train_start', { p_id: v.id }));
    else if (a === 'kick') trApply(await rpc('train_kick', { p_id: v.id, p_uid: b.dataset.u }));
    else if (a === 'kickall') { for (const m of (v.members || []).filter(m => !m.host && !m.ready)) trApply(await rpc('train_kick', { p_id: v.id, p_uid: m.uid })); }
    else if (a === 'cancel') { await rpc('train_cancel', { p_id: v.id }); resync(); trEnded('火車團已解散，車票已退還'); }
    else if (a === 'leave') {
      if (v.status === 'running' && (tr.leaveAsk | 0) < Date.now()) { tr.leaveAsk = Date.now() + 3500; trRender(); setTimeout(() => { if (tr.cur) trRender(); }, 3600); }
      else { await rpc('train_leave', { p_id: v.id }); trEnded(); }
    }
  } catch (err) { toast(errText(err)); if (/voyage_closed|not_member|not_sailing/.test(String((err && err.message) || err))) trSync(); }
  voy.busy = false;
}
voyCard.addEventListener('click', trClick); voyPanel.addEventListener('click', trClick); voyHud.addEventListener('click', trClick);

setInterval(() => {
  const v = tr.cur; if (!v || !ready || scene !== 'train') return;
  const now = srvNow(), t = Date.now();
  if (v.status === 'lobby' && now >= v.lobby_ms + 300 && t - tr.endChecked > 2500) { tr.endChecked = t; trSync(); }
  else if (v.status === 'running' && now >= v.ends_ms + 300 && t - tr.endChecked > 2500) { tr.endChecked = t; trSync(); }
  else if (v.status === 'running' && v.mystery == null && now >= v.mystery_ms + 300 && t - tr.endChecked > 1500) { tr.endChecked = t; trSync(); }                       // 第 4 分鐘抽籤結果
  else if (v.status === 'running' && v.mystery === true && v.station !== 'night' && now >= v.started_ms + v.run_ms + 200 && t - tr.endChecked > 1500) { tr.endChecked = t; trSync(); }   // 5:00 上車去夜行站
  else if (t - tr.pollAt > (v.status === 'lobby' ? 2500 : 6000)) trSync();
  trHud();
}, 500);
document.addEventListener('visibilitychange', () => { if (!document.hidden && tr.cur) trSync(); });

/* ---------- 草原站抓蟲：名單來自伺服器，位置用 hash(seed, i, k) 在草地上決定 ---------- */
function trBuildCritters() {
  tr.crit = [];
  const v = tr.cur, me_ = v && v.me, sd = me_ && me_.st && me_.st[tr.sub]; if (!v || !sd || !Array.isArray(sd.list)) return;
  tr.built = true; const seed = me_.seed | 0;
  sd.list.forEach(it => {
    const i = +it.i; if (tr.caught.has(i) || tr.taken.has(i)) return;
    const key = String(it.key || ''), fly = isFlyer(key), wat = key === 'skater';
    const x0 = 2;                                                                    // 三站都沒有月台了，整片都能放蟲
    let x = x0 + Math.floor(hash(seed, i, 3) * (MDW - x0 - 2)), y = 2 + Math.floor(hash(seed, i, 4) * (MDH - 6));
    for (let n = 0; n < 400 && K[y][x] !== G; n++) { x++; if (x >= MDW - 1) { x = x0; y = y >= MDH - 4 ? 2 : y + 1; } }
    tr.crit.push({ key, i, at: +it.at || 0, fly, wat, x: x + 0.5, y: y + 0.5, tx: x + 0.5, ty: y + 0.5, wait: Math.random() * 1500, ph: Math.random() * 6, on: false });
  });
}
function trUpdate(dt) {
  if (scene !== 'train' || !trIsStn(tr.sub) || !tr.cur) return;
  const el = srvNow() - (tr.cur.started_ms || 0) - (tr.sub === 'night' ? tr.cur.run_ms : 0);
  if (tr.cur.status === 'running' && !tr.crit.length && !tr.built && tr.cur.me && tr.cur.me.st && tr.cur.me.st[tr.sub]) { tr.built = true; trBuildCritters(); }
  tr.crit.forEach(c => {
    if (!c.on) { if (el >= c.at) c.on = true; else return; }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d < 0.06) {
      c.wait -= dt;
      if (c.wait <= 0) {
        const rg = c.fly ? 3 : 1.5;
        for (let n = 0; n < 8; n++) {
          const nx = c.x + (Math.random() * 2 - 1) * rg, ny = c.y + (Math.random() * 2 - 1) * rg, fx = Math.floor(nx), fy = Math.floor(ny);
          if (fx >= 1 && fy >= 1 && fx < MDW - 1 && fy < MDH - 3 && (c.fly || K[fy][fx] === G)) { c.tx = nx; c.ty = ny; break; }
        }
        c.wait = c.fly ? 200 + Math.random() * 900 : 800 + Math.random() * 2500;
      }
    } else { const sp = (c.fly ? 0.0024 : 0.0009) * dt, st = Math.min(sp, d); c.x += dx / d * st; c.y += dy / d * st; }
  });
}
function trainEnts(now, ents) {                // 排進 sky.js 的實體排序（和農場的蟲一樣）
  if (!trIsStn(tr.sub)) return;
  tr.crit.forEach(c => {
    if (!c.on) return;
    const fr = Math.floor(now / (c.fly ? 130 : 260) + c.ph) % 2, bob = c.fly ? Math.round(5 + Math.sin(now / 300 + c.ph) * 2) : 0;
    ents.push({ y: c.y + (c.fly ? 1.2 : 0), draw: () => {
      const px = Math.round(c.x * T) - 8, py = Math.round(c.y * T) - 12;
      if (c.fly) r('rgba(40,70,30,.22)', px + 5, py + 13, 6, 2);
      bugPix(c.key, fr, px, py - bob, false);
    } });
  });
}
function trainAct(x, y) {
  if (catchShown) { hideCatch(); return; }
  if (!tr.cur) return;
  if (tr.dep) return;
  const t = curTool();
  if (tr.sub === 'car') {
    if (K[y] && K[y][x] === HB) pop(x, y, tr.cur.status === 'lobby' ? '等站長發車' : '', '#fff3b0');
    return;
  }
  if (t.id !== 'net') { pop(x, y, '換成捕蟲網才能抓蟲', '#ffb3a8'); return; }
  trSwing(x, y);
}
function trSwing(x, y) {
  const v = tr.cur; if (!v || v.status !== 'running' || Date.now() < tr.netCool) return;
  tr.netCool = Date.now() + TR_NET_CD; netSwing = { x, y, t0: performance.now() };
  const stc = ((v.me && v.me.st) || {})[tr.sub] || {};
  if (tr.caught.size >= (stc.cap || 10)) { pop(x, y, '這一站你抓到上限了', '#ffb3a8'); return; }
  let best = null, bd = buffOn('bug') ? 2.1 : 1.25;
  tr.crit.forEach(c => { if (!c.on) return; const d = Math.hypot(c.x - (x + 0.5), c.y - (y + 0.5)); if (d < bd) { bd = d; best = c; } });
  if (!best) { pop(x, y, '揮空了', '#ffffff'); return; }
  const bg = bugCat.find(q => q.key === best.key);
  if (bg && bugLocked(bg)) { pop(x, y, '捕蟲 Lv.' + bugNeed(bg) + ' 才抓得到', '#ffb3a8'); return; }
  const c0 = best, i = best.i;
  tr.crit.splice(tr.crit.indexOf(best), 1); tr.taken.add(i);
  burst(x, y, 8, ['#ffffff', '#fff6a8'], -1.2, 8);
  enqueue(() => rpc('train_bug_catch', { p_id: v.id, p_i: i, p_station: tr.sub })).then(r_ => {
    if (r_.inv) Object.assign(inv, r_.inv);
    if (r_.result !== 'caught') { tr.taken.delete(i); tr.crit.push(c0); toast('這隻溜走了'); return; }
    tr.caught.add(i); trHud();
    bugLog[r_.bug.key] = r_.n;
    showCatch(r_.bug, r_.first, true);
    qAdd('bug'); refreshHud(); loadLevelSoon();
    starRoll('bug', r_.bug.key).then(s => { catchStarDone(r_.bug.name, s); if (dexOpen) renderDex(); });
  }).catch(e => {
    const m = String((e && e.message) || e);
    if (/too_fast|level_locked/.test(m)) { tr.taken.delete(i); tr.crit.push(c0); }          // 沒抓成：把蟲放回去，不白白損失名額
    else if (/already_caught|catch_cap/.test(m)) { tr.caught.add(i); }
    else if (/not_appeared|bad_index/.test(m)) { tr.taken.delete(i); tr.crit.push(c0); }
    else if (/not_sailing|not_member|wrong_station/.test(m)) { tr.taken.delete(i); if (/wrong_station/.test(m)) tr.crit.push(c0); trSync(); }
    toast(errText(e));
  });
}

/* ---------- 啟動與登出（由 voyageInit／voyageStop 呼叫）---------- */
function trainInit() {
  if (!sb || !myUid) return;
  rpc('train_mine').then(v => { if (v && v.id && scene !== 'train') enterTrain(v, v.me && v.me.back ? v.me.back : { scene: 'plaza' }); }).catch(() => { /* 伺服器還沒裝火車團就略過 */ });
}
function trainStop() {
  if (scene === 'train') leaveTrain(true);
  tr.cur = null; if (vyOpen && voy.mode === 'train') closeVoyModal();
}

/* ---------- 傳說蟲全服廣播：每 20 秒問一次伺服器有沒有新的（第一次只記下目前進度，不重播舊的）---------- */
const trFeed = { last: null, fail: 0 };
const TR_STN_NAME = { meadow: '草原站', mountain: '山間站', night: '夜行站' };
async function trFeedPoll() {
  if (!ready || !sb || !me || document.hidden || trFeed.fail >= 3) return;
  try {
    const first = trFeed.last === null, r = await rpc('train_feed_since', { p_after: trFeed.last });
    trFeed.last = r.last | 0; trFeed.fail = 0;
    if (first) return;
    (r.rows || []).slice(-3).forEach(x => {
      const msg = '✨ ' + String(x.name || '旅人').slice(0, 8) + ' 在' + (TR_STN_NAME[x.station] || '火車') + '抓到了傳說的「' + String(x.bug || '蟲').slice(0, 8) + '」！';
      toast(msg, 5200); if (typeof addSys === 'function' && typeof vLog !== 'undefined' && vLog) addSys(msg); if (typeof chime === 'function') chime([79, 84, 88, 91], 0.09);
    });
  } catch (e) { trFeed.fail++; /* 伺服器還沒裝這段就略過 */ }
}
setInterval(trFeedPoll, 20000); setTimeout(trFeedPoll, 5000);

/* ---------- 廣場上的火車：有團出發就開走，全部結束後倒車回站（時間用伺服器的，大家看到的一樣）---------- */
const trPz = { away: false, dep: 0, end: 0, back: 0, at: 0, stale: true, fail: 0, whistle: 0 };
const TR_PZ_D = 2 * 16 + 175 + 12, TR_PZ_MS = 5000;             // 整列車（車頭＋兩節）開出鐵軌要走的距離、動畫長度
function trPlazaDx() {                                            // 回傳車身的水平位移；null = 不在站（整列車不畫）
  const t = srvNow();
  const arrive = (t0) => {
    const p = (t - t0) / TR_PZ_MS; if (p < 0 || p >= 1) return 0;
    if (trPz.whistle !== t0 && p < 0.25) { trPz.whistle = t0; if (typeof sfxWhistle === 'function') sfxWhistle(); }
    return -TR_PZ_D * (1 - p) * (1 - p);
  };
  if (trPz.away) {
    if (t < trPz.end || !trPz.end) {
      const p = (t - trPz.dep) / TR_PZ_MS; if (p >= 1) return null; if (p <= 0) return 0;
      if (trPz.whistle !== trPz.dep && p < 0.25) { trPz.whistle = trPz.dep; if (typeof sfxWhistle === 'function') sfxWhistle(); }
      return -TR_PZ_D * p * p;
    }
    return arrive(trPz.end);                                      // 最後一團結束了：不用等下一次輪詢，直接倒車進站
  }
  return trPz.back ? arrive(trPz.back) : 0;
}
async function trPlazaPoll() {
  if (scene !== 'plaza') { trPz.stale = true; return; }
  if (!ready || !sb || trPz.fail >= 3 || document.hidden) return;
  if (!trPz.stale && Date.now() - trPz.at < 4000) return;
  try {
    const r = await rpc('train_plaza'); trPz.at = Date.now(); trPz.stale = false; trPz.fail = 0;
    trPz.away = !!r.away; trPz.dep = r.depart_ms | 0; trPz.end = r.end_ms | 0; trPz.back = r.back_ms | 0;
  } catch (e) { trPz.fail++; /* 伺服器還沒裝這段：火車就一直停在站裡 */ }
}
setInterval(trPlazaPoll, 1000);

/* ---------- 興建面板：資源小圖示（16×16 像素）與樣式 ---------- */
function trResIcon(c, k) {
  const R = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); }; c.clearRect(0, 0, 16, 16);
  if (k === 'wood') { R('#5a3a20', 1, 5, 14, 8); R('#8a5a34', 2, 6, 12, 6); R('#a8703e', 2, 6, 12, 2); R('#d8b070', 1, 6, 3, 6); R('#8a5a34', 2, 7, 1, 4); R('#6a4424', 6, 9, 7, 1); R('#5a3a20', 3, 3, 10, 3); R('#8a5a34', 4, 4, 8, 2); R('#d8b070', 3, 4, 2, 2); }
  else if (k === 'stone') { R('#6a645a', 2, 6, 12, 8); R('#8a8478', 3, 5, 10, 8); R('#a8a294', 4, 5, 6, 3); R('#bdb7a8', 5, 6, 2, 1); R('#6a645a', 3, 12, 10, 2); }
  else if (k === 'copper') { R('#5a4a3a', 2, 6, 12, 8); R('#7a6a5a', 3, 5, 10, 8); R('#c8743a', 4, 6, 3, 3); R('#e8944a', 5, 6, 1, 1); R('#c8743a', 9, 8, 3, 3); R('#e8944a', 10, 8, 1, 1); R('#3fae8a', 6, 11, 2, 2); R('#5a4a3a', 3, 12, 10, 2); }
  else { R('#8a6a20', 3, 2, 10, 12); R('#8a6a20', 2, 4, 12, 8); R('#e8c14a', 3, 3, 10, 10); R('#e8c14a', 2, 5, 12, 6); R('#fff0a0', 4, 4, 3, 2); R('#c89a2a', 7, 5, 2, 6); R('#c89a2a', 6, 5, 4, 1); R('#c89a2a', 6, 10, 4, 1); }
}
(function () {
  const st = document.createElement('style');
  st.textContent = '.trb{display:block;margin:6px 0}.trb-top{display:flex;justify-content:space-between;align-items:baseline;font-size:15px;margin-bottom:4px}.trb-top span{font-size:12px;color:var(--muted)}' +
    '.trb-bar{height:8px;border-radius:999px;background:#f3e4d4;overflow:hidden;border:1px solid #ecd2bc}.trb-bar i{display:block;height:100%;background:linear-gradient(#ffb36b,#ff8f4a);border-radius:999px;transition:width .4s}.trb-bar.big{height:14px;border-width:2px}' +
    '.trb-tip{margin:8px 0;font-size:12.5px;line-height:1.55;color:var(--muted)}.trb-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.trb-card{display:grid;grid-template-columns:34px 1fr;grid-template-areas:"ic nm" "bar bar" "nums nums" "btn btn";gap:4px 8px;align-items:center;border:2px solid #f0dcc8;border-radius:12px;background:#fff;padding:8px}' +
    '.trb-card.ok{border-color:#9ad6a4;background:#f4fbf3}.trb-ic{grid-area:ic;width:32px;height:32px;image-rendering:pixelated;background:#fff6e8;border-radius:8px;border:2px solid #f3dcc2}' +
    '.trb-nm{grid-area:nm;font-weight:800;font-size:14px}.trb-card .trb-bar{grid-area:bar}.trb-nums{grid-area:nums;font-size:12.5px;display:flex;justify-content:space-between;color:#6b4848}.trb-nums small{color:var(--muted);font-size:11px}' +
    '.trb-card .btn{grid-area:btn;width:100%}.trb-done{grid-area:btn;text-align:center;font-weight:800;font-size:13px;color:#2f9d54}' +
    '@media(max-width:420px){.trb-grid{grid-template-columns:1fr}}';
  document.head.appendChild(st);
})();
