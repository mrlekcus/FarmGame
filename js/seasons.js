'use strict';
/* 四季資訊 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   季節本身的算法在 js/data.js 的 seasonAt（每 7 天換一季，春→夏→秋→冬，GMT+8 午夜換）。這裡只負責「讓玩家知道」：
   1. HUD 的季節標籤：顯示還剩幾天，最後一天變色、改寫「明天換○」，點一下打開四季日曆（ui.js 的 updateClock 更新文字）
   2. 四季日曆：現在這一季加後面三季，一輪 28 天，點一季看那一季的作物和魚蟲
   3. 換季通知：換季後第一次進遊戲彈一次（寫下一季的作物和魚蟲有什麼變化）；換季前一天進遊戲先跳一則小提示
   全都用時間算出來，不用伺服器、不增加流量；「看過了沒」記在玩家自己的瀏覽器。 */
const seaEl = $('seam'), seaCard = $('seacard');
const SEA_COL = { spring: '#8ac860', summer: '#f2b84b', autumn: '#d9873c', winter: '#b9d0de' };
const SEA_SEEN = 'dw_sea_seen', SEA_WARN = 'dw_sea_warn';
let seaMode = 'cal', seaPick = null;   // cal＝四季日曆；change＝換季通知；seaPick：日曆下面正在看哪一季

function seaNow(ms) {
  const day = Math.floor(((ms === undefined ? srvNow() : ms) + 8 * 3600000) / 86400000), wk = Math.floor(day / 7);
  return { day, wk, key: SEASONS[wk % 4], start: wk * 7, left: wk * 7 + 7 - day };   // left：含今天，1～7
}
const seaDate = d => { const t = new Date(d * 86400000); return (t.getUTCMonth() + 1) + '/' + t.getUTCDate(); };
const seaNext = k => SEASONS[(SEASONS.indexOf(k) + 1) % 4], seaPrev = k => SEASONS[(SEASONS.indexOf(k) + 3) % 4];
const seaLs = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
const seaLsSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) { /* 略過：下次登入再看到一次 */ } };

/* ---------- 每一季有什麼（全部用現成的資料表算：作物 cropCfg、淡水魚／蟲 dexCond） ---------- */
const seaHas = (sn, s) => !!sn && sn !== 'any' && sn.split(',').includes(s);
function seaItems(s) {   // 這一季「才有／才加成」的東西；全年都有的不列
  const crops = Object.keys(CROPS).filter(k => seaHas((cropCfg[k] || {}).seasons, s)).map(k => ({ key: k, name: CROPS[k].n }));
  const pick = (cat, bug) => cat.filter(f => (bug || habitatOf(f) === 'fresh') && seaHas(dexCond(f, bug).seasons, s)).map(f => ({ key: f.key, name: f.name }));
  return { crop: crops, fish: pick(fishCat, false), bug: pick(bugCat, true) };
}
function seaDiff(s) {   // 和上一季比：新出現／離開
  const a = seaItems(s), b = seaItems(seaPrev(s)), d = {};
  ['crop', 'fish', 'bug'].forEach(t => {
    d[t] = { add: a[t].filter(x => !b[t].some(y => y.key === x.key)), del: b[t].filter(x => !a[t].some(y => y.key === x.key)) };
  });
  return d;
}
const seaNames = arr => arr.length ? arr.map(x => esc(x.name)).join('、') : '（沒有）';
function seaBlock(s, withDiff) {
  const it = seaItems(s), loaded = Object.keys(cropCfg).length > 0;
  if (!loaded) return '<p class="empty">資料讀取中…</p>';
  let h = '<div class="sea-row"><b>當季作物（賣價 +25%）</b><span>' + seaNames(it.crop) + '</span></div>' +
    '<div class="sea-row"><b>這季才釣得到的魚</b><span>' + seaNames(it.fish) + '</span></div>' +
    '<div class="sea-row"><b>這季才有的蟲</b><span>' + seaNames(it.bug) + '</span></div>';
  if (withDiff) {
    const d = seaDiff(s), line = (lab, t) => (d[t].add.length || d[t].del.length)
      ? '<div class="sea-row"><b>' + lab + '</b><span>' + (d[t].add.length ? '<em class="up">新增</em> ' + seaNames(d[t].add) : '') + (d[t].add.length && d[t].del.length ? '<br>' : '') + (d[t].del.length ? '<em class="dn">離開</em> ' + seaNames(d[t].del) : '') + '</span></div>' : '';
    const ch = line('作物', 'crop') + line('魚', 'fish') + line('蟲', 'bug');
    h += '<div class="sea-chg"><b>和' + SEA_SHORT[seaPrev(s)] + '天比，有這些變化</b>' + (ch || '<div class="sea-row"><span>作物和魚蟲都沒有變化</span></div>') + '</div>';
  }
  return h;
}

/* ---------- 面板 ---------- */
function seaRender() {
  const n = seaNow();
  let h;
  if (seaMode === 'change') {
    const k = n.key, nx = seaNext(k);
    h = '<div class="shop-h"><h2>' + SEASON_N[k] + '來了！</h2><span class="chip" style="background:' + SEA_COL[k] + '">' + seaDate(n.start) + '～' + seaDate(n.start + 6) + '</span></div>' +
      '<p class="sea-sub">這一季一共 7 天，今天是第 ' + (8 - n.left) + ' 天。下一季：' + SEASON_N[nx] + '（' + seaDate(n.start + 7) + ' 開始）。</p>' + seaBlock(k, true) +
      '<div class="v-quick" style="margin-top:10px"><button type="button" class="btn" data-a="ok">知道了</button><button type="button" class="btn ghost" data-a="cal">看四季日曆</button></div>';
  } else {
    const pick = seaPick || n.key, pi = (SEASONS.indexOf(pick) - SEASONS.indexOf(n.key) + 4) % 4, ps = n.start + pi * 7;
    h = '<div class="shop-h"><h2>四季日曆</h2><span class="chip" style="background:' + SEA_COL[n.key] + '">' + SEASON_N[n.key] + '　' + (n.left === 1 ? '最後一天' : '剩 ' + n.left + ' 天') + '</span></div>' +
      '<div class="sea-cal">';
    for (let i = 0; i < 4; i++) {
      const k = SEASONS[(n.wk + i) % 4], st = n.start + i * 7;
      h += '<button type="button" class="sea-lab' + (k === pick ? ' on' : '') + '" data-a="pick" data-c="' + k + '">' + SEA_SHORT[k] + '</button>';
      for (let d = 0; d < 7; d++) {
        const day = st + d, cls = day < n.day ? ' past' : day === n.day ? ' now' : '';
        h += '<i class="' + cls.trim() + '" style="background:' + SEA_COL[k] + '">' + new Date(day * 86400000).getUTCDate() + '</i>';
      }
    }
    h += '</div><p class="sea-sub">一輪 28 天，每 7 天換一季，午夜 0 點換（GMT+8）。點左邊的字看那一季。</p>' +
      '<div class="sea-det" style="border-color:' + SEA_COL[pick] + '"><div class="sea-dh"><b>' + SEASON_N[pick] + '</b><span>' + seaDate(ps) + '～' + seaDate(ps + 6) + (pick === n.key ? '（現在）' : '') + '</span></div>' + seaBlock(pick, true) + '</div>' +
      '<div class="v-quick" style="margin-top:10px"><button type="button" class="btn ghost" data-a="ok">離開</button></div>';
  }
  seaCard.innerHTML = h;
}
function seaOpenPanel(mode) {
  if (!ready || !me || authOpen || paused() || seaOpen) return false;
  seaOpen = true; pressed.length = 0; seaMode = mode; seaPick = null; seaRender(); seaEl.hidden = false; seaCard.focus();
  return true;
}
const openSeasons = () => seaOpenPanel('cal');
function closeSeasons() {
  if (seaMode === 'change') seaLsSet(SEA_SEEN, seaNow().wk);
  seaOpen = false; seaEl.hidden = true;
}
seaCard.addEventListener('click', e => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const a = b.dataset.a;
  if (a === 'ok') closeSeasons();
  else if (a === 'cal') { seaLsSet(SEA_SEEN, seaNow().wk); seaMode = 'cal'; seaPick = null; seaRender(); }
  else if (a === 'pick') { seaPick = b.dataset.c; seaRender(); }
});
seaEl.addEventListener('pointerdown', e => e.stopPropagation());
$('sn').addEventListener('click', openSeasons); $('wxs').addEventListener('click', openSeasons);

/* ---------- 換季通知（ui.js 的 updateClock 在時間有變時呼叫） ---------- */
function seaTick() {
  if (!ready || !me || paused()) return;   // 有視窗開著（含更新通告）就先等，關掉後下一次再檢查
  const n = seaNow();
  if (seaLs(SEA_SEEN) !== String(n.wk)) { seaOpenPanel('change'); return; }
  if (n.left === 1 && seaLs(SEA_WARN) !== String(n.wk)) {
    seaLsSet(SEA_WARN, n.wk);
    toast('明天換成' + SEASON_N[seaNext(n.key)] + '了，點上面的季節標籤看會有什麼變化', 4500);
  }
}
