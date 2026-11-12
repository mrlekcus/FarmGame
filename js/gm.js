'use strict';
/* 出門選單與 GM 邀請碼 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* ---------- 出門選單（村莊大門） ---------- */
const vmEl = $('vmenu'), vmCard = $('vmcard');
let vmRooms = null, vmSeq = 0;
function renderVMenu() {
  const rooms = vmRooms
    ? '<h3>公開廣場（目前人數）</h3><div class="v-quick">' + vmRooms.map(r => {
        const full = r.n >= r.cap;
        return '<button type="button" class="qbtn" data-a="room" data-k="' + r.k + '"' + (full ? ' disabled' : '') + '>#' + r.k + ' · ' + r.n + '/' + r.cap + (full ? ' 已滿' : r.n ? ' 人' : ' 空') + '</button>';
      }).join('') + '</div>'
    : '';
  vmCard.innerHTML = '<div class="shop-h"><h2>村莊大門</h2></div>' +
    '<p class="empty">廣場上最多 8 個人，可以一起走動、聊天。</p>' +
    '<button type="button" class="btn wide" data-a="public">去公開廣場（自動分配）</button>' + rooms +
    '<button type="button" class="btn wide" data-a="new">建立私人村（只有知道邀請碼的人能進）</button>' +
    '<h3>加入朋友的私人村</h3>' +
    '<div class="gmrow"><input class="nameinput" id="vm-code" type="text" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="6 碼村莊邀請碼"><button type="button" class="btn small" data-a="join">加入</button></div>' +
    '<button type="button" class="btn ghost wide" data-a="close">先不要</button>';
}
async function loadVRooms() {
  const my = ++vmSeq;
  try {
    const list = await rpc('village_rooms');
    if (my !== vmSeq || !vmOpen || !Array.isArray(list)) return;
    vmRooms = list.filter(r => r && Number.isInteger(r.k) && Number.isInteger(r.n) && Number.isInteger(r.cap));
    const code = $('vm-code') ? $('vm-code').value : '';
    renderVMenu(); if ($('vm-code')) $('vm-code').value = code;
  } catch (e) { /* 還沒跑 SQL 補丁就照舊，只是看不到人數 */ }
}
function openVMenu() { vmOpen = true; pressed.length = 0; vmRooms = null; renderVMenu(); vmEl.hidden = false; vmCard.focus(); loadVRooms(); }
function closeVMenu() { vmOpen = false; vmSeq++; vmEl.hidden = true; }
vmCard.addEventListener('click', e => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const a = b.dataset.a;
  if (a === 'close') closeVMenu();
  else if (a === 'public') joinVillage('public');
  else if (a === 'room') joinVillage('room', null, +b.dataset.k);
  else if (a === 'new') joinVillage('private_new');
  else if (a === 'join') joinVillage('private_join', $('vm-code').value);
});

/* ---------- GM：邀請碼 ---------- */
const gmEl = $('gm'), gmCard = $('gmcard');
let gmList = [], gmNew = [];   // gmBc：等待再按一次確認的全服信 {key, msg, n}
function renderGM() {
  const fresh = gmNew.length
    ? '<h3>剛產生的邀請碼</h3><div class="offer">' + gmNew.map(c => '<p class="codebox">' + esc(c) + '</p>').join('') + '</div><button type="button" class="btn small" data-a="copyall">全部複製</button>'
    : '';
  const rows = gmList.length ? gmList.map(i => {
    const used = !!i.used_by;
    return '<div class="row"><div class="meta"><b class="codebox">' + esc(i.code) + '</b><small>' +
      (used ? '已由 ' + esc(i.used_by) + ' 使用' : '未使用') + (i.note ? ' · ' + esc(i.note) : '') + ' · ' + fmtTime(i.created) + '</small></div>' +
      (used ? '' : '<button type="button" class="btn small" data-a="copy" data-c="' + esc(i.code) + '">複製</button> <button type="button" class="btn small ghost" data-a="revoke" data-c="' + esc(i.code) + '">作廢</button>') + '</div>';
  }).join('') : '<p class="empty">還沒有邀請碼。</p>';
  gmCard.innerHTML = '<div class="shop-h"><h2>GM 邀請碼</h2></div>' +
    '<h3>發金幣</h3><div class="gmrow"><input class="nameinput" id="gm-gu" type="text" maxlength="16" placeholder="玩家帳號（不用加 @）" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="玩家帳號"><input class="num gm-amt" id="gm-ga" type="number" min="1" max="1000000" value="1000" aria-label="金幣數量"><button type="button" class="btn small" data-a="grant">發送</button></div><p class="gm-msg" id="gm-gmsg" aria-live="polite"></p>' +
    '<p class="empty">每組邀請碼只能讓一個人註冊一次。</p>' +
    '<div class="gmrow"><input class="num" id="gm-n" type="number" min="1" max="20" value="1" aria-label="數量"><input class="nameinput" id="gm-note" type="text" maxlength="30" placeholder="備註（例如給誰）"><button type="button" class="btn small" data-a="make">產生</button></div>' +
    fresh + '<h3>最近的邀請碼</h3>' + rows + '<button type="button" class="btn ghost wide" data-a="close">關閉</button>';
}
async function loadGM() {
  try { gmList = await rpc('gm_list_invites') || []; } catch (e) { toast(errText(e)); }
  renderGM();
}
function openGM() { gmOpen = true; pressed.length = 0; gmNew = []; renderGM(); gmEl.hidden = false; loadGM(); }
function closeGM() { gmOpen = false; gmEl.hidden = true; }
gmCard.addEventListener('click', async e => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const a = b.dataset.a, c = b.dataset.c;
  try {
    if (a === 'close') closeGM();
    else if (a === 'make') {
      gmNew = await rpc('gm_create_invites', { p_count: Math.max(1, Math.min(20, parseInt($('gm-n').value, 10) || 1)), p_note: $('gm-note').value || null });
      await loadGM();
    } else if (a === 'copy') copyText(c);
    else if (a === 'copyall') copyText(gmNew.join('\n'));
    else if (a === 'revoke') { await rpc('gm_revoke_invite', { p_code: c }); gmNew = gmNew.filter(x => x !== c); await loadGM(); }
    else if (a === 'grant') {
      const msgEl = $('gm-gmsg');
      const say = (t, ok) => { msgEl.textContent = t; msgEl.className = 'gm-msg ' + (ok ? 'ok' : 'err'); };
      const u = ($('gm-gu').value || '').trim().replace(/^@/, '');
      const n = Math.floor(+$('gm-ga').value);
      if (!u) { say('請輸入玩家帳號', false); return; }
      if (!(n >= 1 && n <= 1000000)) { say('金幣數量要在 1 到 1,000,000 之間', false); return; }
      b.disabled = true; say('發送中…', true);
      try {
        await rpc('gm_grant_coins', { p_username: u, p_amount: n });
        say('已發送 ' + n + ' G 給 @' + u, true);
        try { await enqueue(async () => { applyState(await rpc('get_state')); refreshHud(); }); } catch (e2) {}
      } catch (er) {
        const m = String((er && (er.message || er.msg)) || er || '');
        const code = String((er && er.code) || '');
        if (/Could not find the function|PGRST202/i.test(m + ' ' + code)) say('找不到 gm_grant_coins 函式（可能還沒建，或 Supabase 還沒重新載入）。詳細：' + m.slice(0, 160), false);
        else if (Object.keys(ERR).some(k => m.includes(k))) say(errText(er), false);
        else say('發生錯誤：' + m.slice(0, 220) + (code ? '（' + code + '）' : ''), false);
      } finally { b.disabled = false; }
    }
  } catch (err) { toast(errText(err)); }
});
$('gmbtn').addEventListener('click', () => { if (ready && me && me.gm) openGM(); });

/* ---------- GM：全服補償信（獨立視窗，比邀請碼面板寬） ---------- */
const gmbEl = $('gmb'), gmbCard = $('gmbcard');
let gmBc = null, gmbMsg = '', gmbAmt = 3000, gmbNote = '';   // gmBc：等待再按一次確認的全服信 {key, msg, n}
function renderGMB() {
  gmbCard.innerHTML = '<div class="shop-h"><h2>GM 全服補償信</h2></div>' +
    '<p class="empty">寄給所有玩家（GM 帳號不會收到）。每位玩家收到一封信，金幣要在信箱按「領取」才入帳。</p>' +
    '<label class="mllab" for="gmb-m">信件內容（最多 200 字）</label><textarea class="nameinput mltext" id="gmb-m" maxlength="200" rows="6" placeholder="例如：收購新制度上線，補償 3000 G 已寄到信箱，打開信按「領取」就入帳，感謝體諒！"></textarea>' +
    '<small class="empty" id="gmb-cnt"></small>' +
    '<label class="mllab" for="gmb-a">每人補償金幣（填 0 = 只寄通知，不附金幣）</label>' +
    '<div class="gmrow"><input class="num gm-amt" id="gmb-a" type="number" min="0" max="1000000" inputmode="numeric"><button type="button" class="btn" data-a="bcast">' + (gmBc ? '確定發送給全服？再按一次' : '寄給全服') + '</button>' + (gmBc ? '<button type="button" class="btn ghost" data-a="bcancel">取消</button>' : '') + '</div>' +
    '<p class="gm-msg" id="gmb-msg" aria-live="polite"></p>' +
    '<button type="button" class="btn ghost wide" data-a="close">關閉</button>';
  $('gmb-m').value = gmbMsg; $('gmb-a').value = gmbAmt; gmbCount();
}
function gmbCount() { const el = $('gmb-cnt'); if (el) el.textContent = gmbMsg.length + ' / 200 字'; }
function openGMB() { gmbOpen = true; pressed.length = 0; gmBc = null; renderGMB(); gmbEl.hidden = false; gmbCard.focus(); }
function closeGMB() { gmbOpen = false; gmBc = null; gmbEl.hidden = true; }
gmbCard.addEventListener('input', e => {
  if (e.target.id === 'gmb-m') { gmbMsg = e.target.value; gmbCount(); }
  else if (e.target.id === 'gmb-a') gmbAmt = e.target.value;
  if (gmBc && (e.target.id === 'gmb-m' || e.target.id === 'gmb-a')) { gmBc = null; renderGMB(); const el = $(e.target.id); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }   // 內容或金額一改就要重新確認
});
gmbEl.addEventListener('click', e => { if (e.target === gmbEl) closeGMB(); });
gmbCard.addEventListener('click', async e => {
  const b = e.target.closest('button[data-a]');
  if (!b || b.disabled) return;
  const a = b.dataset.a;
  if (a === 'close') { closeGMB(); return; }
  if (a === 'bcancel') { gmBc = null; renderGMB(); return; }
  if (a !== 'bcast') return;
  const say = (t, ok) => { const el = $('gmb-msg'); el.textContent = t; el.className = 'gm-msg ' + (ok ? 'ok' : 'err'); };
  const msg = gmbMsg.trim(), n = Math.floor(+gmbAmt);
  if (!msg) { say('請先寫信件內容', false); return; }
  if (!(n >= 0 && n <= 1000000)) { say('金幣數量要在 0 到 1,000,000 之間', false); return; }
  if (!gmBc) {   // 第一次按：先進入確認狀態
    gmBc = { key: 'bc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10), msg, n };
    renderGMB(); say('將寄給每位玩家：' + n + ' G。確認無誤請再按一次。', true); return;
  }
  b.disabled = true; say('發送中…', true);
  const bc = gmBc;
  try {
    const r = await rpc('gm_mail_all', { p_key: bc.key, p_msg: bc.msg, p_coins: bc.n });
    gmBc = null; gmbMsg = ''; renderGMB(); say('已寄出 ' + (r && r.sent) + ' 封（每人 ' + bc.n + ' G）。', true);
  } catch (er) {
    const m = String((er && (er.message || er.msg)) || er || '');
    if (/Could not find the function|PGRST202/i.test(m + ' ' + String((er && er.code) || ''))) say('找不到 gm_mail_all 函式：請先在 Supabase 執行 sql/gm_mail_broadcast.sql。', false);
    else if (/already_sent/.test(m)) { gmBc = null; renderGMB(); say('這一批已經發送過了（沒有重複發）。', true); }
    else say(errText(er), false);
    b.disabled = false;
  }
});
$('gmbbtn').addEventListener('click', () => { if (ready && me && me.gm) openGMB(); });
