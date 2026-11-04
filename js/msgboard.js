'use strict';
/* 碼頭留言板 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   廣場棧橋南邊的大木板（世界裡的 MB，座標見 js/world.js）：全服玩家共用 12 張便利貼，
   一人一天 3 張、每張最多 20 字、自己板上最多同時 3 張；新的貼上去，最舊的被擠掉。
   可以給別人的便利貼點愛心（每張一人一顆，再按取消），每人一天可留言 3 次（每則最多 30 字）。
   一切規則都在伺服器（msgboard.sql / msgboard-v2.sql），這裡只負責畫和操作。 */
const MB_MAX = 12, MB_LEN = 20, MB_CLEN = 30, MB_MINE = 3, MB_REFRESH = 5 * 60 * 1000;
const MB_COLS = ['#ffe27a', '#ffb3c7', '#a9d4ff', '#b8ecb0'];
const MB_JX = [0, 1, -1, 0, 1, 0, -1, 1, 0, -1, 1, 0], MB_JY = [0, -1, 0, 1, 0, -1, 1, 0, -1, 0, 0, 1];
const mbEl = $('mbm'), mbCard = $('mbcard');
let mbData = null, mbAt = 0, mbLoading = false, mbSel = -1, mbColor = 0, mbBusy = false, mbText = '', mbCText = '', mbErr = '', mbInfo = '';
const mbCom = {};   // 便利貼 id → 留言陣列（點開才向伺服器要）
let mbGullAt = -1e9, mbFloatAt = -1e9;   // 海鷗飛過、舊便利貼漂走的動畫起點（performance.now）

const mbMaxId = d => d && d.notes && d.notes.length ? Math.max(...d.notes.map(n => n.id)) : 0;
function mbApply(d, own) {
  const prev = mbData, pm = mbMaxId(prev), nm = mbMaxId(d);
  mbData = d; mbAt = Date.now();
  if (prev && nm > pm) {   // 有新的便利貼：海鷗飛過；板子滿了就有一張舊的漂走
    const now = performance.now();
    if (!own) mbGullAt = now;
    if (prev.notes.length >= MB_MAX) mbFloatAt = now;
  }
}
async function mbLoad() {
  if (mbLoading) return;
  mbLoading = true; mbAt = Date.now();
  try { mbApply(await rpc('msg_list'), false); } catch (e) { mbAt = Date.now() - MB_REFRESH + 60000; }   // 失敗就一分鐘後再試
  mbLoading = false;
  if (mbOpen) mbRender();
}

async function mbLoadCom(id) {
  try {
    const r = await rpc('msg_comments', { p_id: id });
    mbCom[id] = (r && r.comments) || [];
  } catch (e) { if (!mbCom[id]) mbCom[id] = []; }
  const sn = mbData && mbData.notes[mbSel];
  if (mbOpen && sn && sn.id === id) mbRender();
}

/* ---------- 世界裡的板子 ---------- */
function drawMsgBoard(now) {
  if (me && ready && !mbLoading && (!mbData || Date.now() - mbAt > MB_REFRESH)) mbLoad();
  const x0 = MB_X * T, yb = (MB_Y + MB_H) * T;
  r('rgba(60,40,20,.25)', x0 + 2, yb - 4, 62, 3);
  r('#6b4a2a', x0 + 6, yb - 14, 4, 14); r('#6b4a2a', x0 + 54, yb - 14, 4, 14);
  r('#8a5a36', x0, yb - 46, 64, 38); r('#a9744a', x0, yb - 46, 64, 2);
  r('#d9b27c', x0 + 3, yb - 43, 58, 32);
  const notes = mbData ? mbData.notes : [];
  for (let i = 0; i < MB_MAX; i++) {
    const c = i % 4, rw = (i / 4) | 0, nx = x0 + 4 + c * 14 + 1 + MB_JX[i], ny = yb - 43 + 1 + rw * 10 + MB_JY[i], n = notes[i];
    if (!n) { r('rgba(120,80,40,.22)', nx + 1, ny + 1, 9, 6); continue; }
    r(MB_COLS[n.c | 0] || MB_COLS[0], nx, ny, 11, 8);
    r('rgba(90,60,30,.5)', nx + 2, ny + 3, 7, 1); r('rgba(90,60,30,.5)', nx + 2, ny + 5, 5, 1);
    r('#c4403a', nx + 5, ny - 1, 2, 2);
    if (n.mine) { r('#e0a21a', nx + 8, ny, 3, 3); r('#fff3b0', nx + 9, ny + 1, 1, 1); }
  }
  /* 舊便利貼被擠掉：從板子右邊漂到海面上 */
  const ft = now - mbFloatAt;
  if (ft >= 0 && ft < 9000) {
    const p = ft / 9000, fx = x0 + 68 + p * 70, fy = yb - 36 + Math.round(Math.sin(now / 400) * 1.5);
    g.globalAlpha = 1 - Math.max(0, (p - 0.7) / 0.3);
    r('rgba(0,0,0,.12)', fx, fy + 9, 12, 2); r('#ffe27a', fx, fy, 12, 8); r('rgba(90,60,30,.45)', fx + 2, fy + 3, 7, 1); r('rgba(90,60,30,.45)', fx + 2, fy + 5, 5, 1);
    g.globalAlpha = 1;
  }
  /* 海鷗：有新留言時飛過，平常每 50 秒也路過一次 */
  const gt = now - mbGullAt, it = now % 50000;
  const gp = gt >= 0 && gt < 7000 ? gt / 7000 : (it < 7000 ? it / 7000 : -1);
  if (gp >= 0) {
    const gx = Math.round(x0 - 90 + gp * 260), gy = yb - 70 + Math.round(Math.sin(now / 330) * 3), up = Math.floor(now / 180) % 2;
    r('#ffffff', gx, gy, 4, 2); r('#f3b04a', gx + 4, gy, 1, 1);
    if (up) { r('#ffffff', gx - 3, gy - 2, 3, 1); r('#ffffff', gx + 4, gy - 2, 3, 1); } else { r('#ffffff', gx - 3, gy + 1, 3, 1); r('#ffffff', gx + 4, gy + 1, 3, 1); }
  }
}

/* ---------- 面板 ---------- */
function openMsgBoard() {
  if (!ready || !me || authOpen || paused() || mbOpen) return;
  mbOpen = true; pressed.length = 0; mbSel = -1; mbErr = ''; mbInfo = ''; mbRender(); mbEl.hidden = false; mbCard.focus();
  mbLoad();
}
function closeMsgBoard() { mbOpen = false; mbEl.hidden = true; }
const mbAgo = ts => {
  const s = Math.max(0, Math.floor((srvNow() - ts) / 1000));
  if (s < 60) return '剛剛';
  if (s < 3600) return Math.floor(s / 60) + ' 分鐘前';
  if (s < 86400) return Math.floor(s / 3600) + ' 小時前';
  return Math.floor(s / 86400) + ' 天前';
};
function mbRender() {
  const d = mbData, notes = d ? d.notes : [], left = d ? d.left | 0 : 0, minpl = d ? d.minpl | 0 : 3, locked = plv() < minpl;
  let h = '<div class="shop-h"><h2>碼頭留言板</h2><span class="chip gold">' + (d ? '今天還能貼 ' + left + ' 張・留言 ' + (d.cleft | 0) + ' 次' : '讀取中…') + '</span></div>';
  h += '<div class="mbg">';
  for (let i = 0; i < MB_MAX; i++) {
    const n = notes[i];
    if (!n) { h += '<div class="mbn blank"></div>'; continue; }
    h += '<button type="button" class="mbn' + (i === mbSel ? ' sel' : '') + '" style="background:' + (MB_COLS[n.c | 0] || MB_COLS[0]) + ';transform:rotate(' + [-3, 2, -1, 3, 2, -2, 3, -1, -3, 1, -2, 2][i] + 'deg)" data-a="sel" data-c="' + i + '">' + esc(n.t) + (n.mine ? '<s></s>' : '') + ((n.likes | 0) > 0 ? '<em class="mbh">♥' + (n.likes | 0) + '</em>' : '') + '</button>';
  }
  h += '</div>';
  const sn = notes[mbSel];
  if (sn) {
    const cms = mbCom[sn.id], liked = !!sn.liked;
    h += '<div class="mbd" style="background:' + (MB_COLS[sn.c | 0] || MB_COLS[0]) + '"><div style="font-size:16px;margin-bottom:6px;word-break:break-all">' + esc(sn.t) + '</div><small>' + esc(sn.name) + '　' + mbAgo(sn.ts) + '</small></div>' +
      '<div class="v-quick" style="margin-bottom:6px">' + (locked ? '<span class="mblk">♥ ' + (sn.likes | 0) + '</span>' : '<button type="button" class="btn small mblike' + (liked ? ' on' : ' ghost') + '" data-a="like" data-c="' + sn.id + '"' + (mbBusy ? ' disabled' : '') + '>' + (liked ? '♥' : '♡') + ' ' + (sn.likes | 0) + '</button>') +
      (sn.mine ? '<button type="button" class="btn small" data-a="tear" data-c="' + sn.id + '"' + (mbBusy ? ' disabled' : '') + '>撕掉（次數照算）</button>' : '') +
      (me && me.gm ? '<button type="button" class="btn small ghost" data-a="gmdel" data-c="' + sn.id + '">GM：移除</button><button type="button" class="btn small ghost" data-a="gmmute" data-c="' + sn.id + '">GM：禁言作者 24 小時</button>' : '') + '</div>';
    h += '<div class="mbcm">' + (cms == null ? '<p class="empty">留言讀取中…</p>' : cms.length ? cms.map(m => '<div class="mbc"><b>' + esc(m.name) + '</b>' + esc(m.t) + '<small>' + mbAgo(m.ts) + '</small>' + (me && me.gm ? '<button type="button" class="mbx" data-a="gmcdel" data-c="' + m.id + '" aria-label="GM：移除留言">✕</button>' : '') + '</div>').join('') : '<p class="empty">還沒有留言。</p>') + '</div>';
    if (!locked) h += '<div class="mbform"><input type="text" id="mbcin" maxlength="' + MB_CLEN + '" placeholder="留言（最多 ' + MB_CLEN + ' 字，今天還能留 ' + (d ? d.cleft | 0 : 0) + ' 次）" value="' + esc(mbCText) + '"><button type="button" class="btn small" data-a="comment" data-c="' + sn.id + '"' + (mbBusy ? ' disabled' : '') + '>留言</button></div>';
  } else h += '<p class="empty">點一張便利貼看完整內容。板子滿了，新的貼上去，最舊的那張會被海風吹走。</p>';
  if (locked) h += '<p class="empty">玩家 Lv.' + minpl + ' 才能留言，現在可以先看大家貼了什麼。</p>';
  else {
    h += '<div class="mbform"><input type="text" id="mbin" maxlength="' + MB_LEN + '" placeholder="寫點什麼（最多 ' + MB_LEN + ' 字）" value="' + esc(mbText) + '"><button type="button" class="btn small" data-a="post"' + (mbBusy ? ' disabled' : '') + '>貼上去</button></div>' +
      '<div class="mbsws"><span>顏色</span>' + MB_COLS.map((c, i) => '<button type="button" class="mbsw' + (i === mbColor ? ' on' : '') + '" style="background:' + c + '" data-a="color" data-c="' + i + '" aria-label="便利貼顏色 ' + (i + 1) + '"></button>').join('') + '</div>' +
      '<p class="empty">你板上最多同時 ' + MB_MINE + ' 張（現在 ' + (d ? d.mine | 0 : 0) + ' 張）；撕掉也會用掉一次。</p>';
  }
  if (mbErr) h += '<p class="empty" style="color:#d4504a">' + esc(mbErr) + '</p>';
  else if (mbInfo) h += '<p class="empty">' + esc(mbInfo) + '</p>';
  mbCard.innerHTML = h + '<div class="v-quick" style="margin-top:6px"><button type="button" class="btn ghost" data-a="refresh">重新整理</button><button type="button" class="btn ghost" data-a="close">離開</button></div>';
}
mbCard.addEventListener('input', e => {
  if (!e.target) return;
  if (e.target.id === 'mbin') { mbText = clean(e.target.value, MB_LEN); if (mbErr) { mbErr = ''; } }
  else if (e.target.id === 'mbcin') { mbCText = clean(e.target.value, MB_CLEN); if (mbErr) { mbErr = ''; } }
});
mbCard.addEventListener('click', async e => {
  const b = e.target.closest('button[data-a]');
  if (!b || b.disabled) return;
  const a = b.dataset.a, c = b.dataset.c;
  mbErr = ''; mbInfo = '';
  if (a === 'close') { closeMsgBoard(); return; }
  if (a === 'sel') { mbSel = +c; mbCText = ''; mbRender(); const sn = mbData && mbData.notes[mbSel]; if (sn) mbLoadCom(sn.id); return; }
  if (a === 'color') { mbColor = +c; mbRender(); return; }
  if (a === 'refresh') { mbInfo = '重新整理中…'; mbRender(); await mbLoad(); mbInfo = ''; if (mbOpen) mbRender(); return; }
  if (mbBusy) return;
  if (a === 'post') {
    const t = clean(mbText, MB_LEN).trim();
    if (!t) { mbErr = '先寫點內容再貼'; mbRender(); return; }
    mbBusy = true; mbRender();
    try {
      mbApply(await enqueue(() => rpc('msg_post', { p_text: t, p_color: mbColor })), true);
      mbText = ''; mbSel = 0; mbFloatAt = performance.now(); toast('貼好了！');
    } catch (err) { mbErr = errText(err); }
    mbBusy = false; if (mbOpen) mbRender(); return;
  }
  if (a === 'like') {
    mbBusy = true; mbRender();
    try { mbApply(await enqueue(() => rpc('msg_like', { p_id: +c })), true); }
    catch (err) { mbErr = errText(err); }
    mbBusy = false; if (mbOpen) mbRender(); return;
  }
  if (a === 'comment') {
    const t = clean(mbCText, MB_CLEN).trim();
    if (!t) { mbErr = '先寫點內容再留言'; mbRender(); return; }
    mbBusy = true; mbRender();
    try {
      const r = await enqueue(() => rpc('msg_comment', { p_id: +c, p_text: t }));
      if (r && r.comments) mbCom[+c] = r.comments;
      if (r && r.notes) mbApply(r, true);
      mbCText = ''; toast('留言了！');
    } catch (err) { mbErr = errText(err); }
    mbBusy = false; if (mbOpen) mbRender(); return;
  }
  if (a === 'tear' || a === 'gmdel' || a === 'gmmute' || a === 'gmcdel') {
    mbBusy = true; mbRender();
    try {
      const fn = a === 'tear' ? 'msg_tear' : a === 'gmdel' ? 'gm_msg_remove' : a === 'gmcdel' ? 'gm_msg_comment_remove' : 'gm_msg_mute';
      const r = await enqueue(() => rpc(fn, a === 'gmmute' ? { p_id: +c, p_hours: 24 } : { p_id: +c }));
      if (r && r.notes) { mbApply(r, true); if (a !== 'gmcdel') mbSel = -1; }
      if (a === 'gmcdel') { const sn = mbData && mbData.notes[mbSel]; if (sn) { delete mbCom[sn.id]; mbLoadCom(sn.id); } }
      mbInfo = a === 'tear' ? '已撕掉' : '已處理';
    } catch (err) { mbErr = errText(err); }
    mbBusy = false; if (mbOpen) mbRender();
  }
});
