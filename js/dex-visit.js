'use strict';
/* 書櫃（看圖鑑）—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   朋友到你家按書櫃 → 看你的圖鑑：解鎖了哪些、每種最高幾星，可以和自己的對照，點進去看怎麼取得（畫面是 dex.js 的 renderDex，資料換成朋友的 dexSrc）。
   你自己按書櫃 → 打開自己的圖鑑，最上面有「開放給朋友看」的開關。
   伺服器：dex_visit(p_uid)、dex_share_set(p_open)，見 shelf-dex.sql。伺服器只給「解鎖了哪些」和「最高星」，不給數量。 */
let dexVisitBusy = false;
const DEX_ID = /^[A-Za-z0-9_\-]{1,40}$/, DEX_STAR_KEY = /^(fish|bug|dish|crop):[A-Za-z0-9_\-]{1,40}$/;
function dexKeys(m) {   // 伺服器給「key 陣列」或「key → 數字」都可以，一律變成 { key: 1 }；只收長得像 key 的
  const o = {};
  if (Array.isArray(m)) m.forEach(k => { if (typeof k === 'string' && DEX_ID.test(k)) o[k] = 1; });
  else if (m && typeof m === 'object') Object.keys(m).forEach(k => { if (DEX_ID.test(k) && (m[k] === true || +m[k] > 0)) o[k] = 1; });
  return o;
}
function dexStars(m) {   // 'fish:carp' -> 1～5
  const o = {};
  if (m && typeof m === 'object') Object.keys(m).forEach(k => { const n = Math.max(0, Math.min(5, +m[k] | 0)); if (DEX_STAR_KEY.test(k) && n > 0) o[k] = n; });
  return o;
}
const dexErr = e => /Could not find the function|schema cache/i.test(String((e && (e.message || e.msg)) || e || '')) ? '書櫃的圖鑑功能還沒開通（伺服器要先更新）' : errText(e);
/* 書櫃按動作鍵：在朋友家 = 看屋主的圖鑑；在自己家 = 自己的圖鑑＋開放開關 */
function shelfAct() { if (visiting) openDexVisit(visiting.uid, visiting.name); else openDexOwn(); }
async function openDexVisit(uid, name) {
  if (!ready || !me || authOpen || paused() || dexVisitBusy) return;
  dexVisitBusy = true;
  try {
    const r = await withTimeout(rpc('dex_visit', { p_uid: uid }), 12000);
    if (scene !== 'house' || !visiting || String(visiting.uid) !== String(uid) || paused()) return;   // 等的時候已經離開或開了別的視窗
    const nm = clean(name || (r && r.name) || '朋友', 8) || '朋友';
    if (!r || typeof r !== 'object' || r.open === false) { toast(nm + ' 沒有開放圖鑑'); return; }
    dexSrc = { uid, name: nm, fish: dexKeys(r.fish), bug: dexKeys(r.bug), cook: dexKeys(r.cook), star: dexStars(r.star) };
    dexShelf = null; dexMiss = false; dexTab = 'fish'; dexOpen = true; pressed.length = 0;
    renderDex(); dexEl.hidden = false; dexCard.focus();
  } catch (e) { toast(dexErr(e)); }
  finally { dexVisitBusy = false; }
}
async function openDexOwn() {
  if (!ready || !me || authOpen || paused() || dexVisitBusy) return;
  openDex();
  if (!dexOpen) return;
  dexVisitBusy = true;
  try {
    const r = await withTimeout(rpc('dex_visit', { p_uid: myUid }), 8000);
    if (dexOpen && !dexSrc && r && typeof r.open === 'boolean') { dexShelf = { open: r.open, busy: false }; renderDex(); }
  } catch (e) { /* 伺服器還沒更新：就只打開自己的圖鑑，沒有開關 */ }
  dexVisitBusy = false;
}
async function dexShareToggle() {
  if (!dexShelf || dexShelf.busy) return;
  const next = !dexShelf.open, sh = dexShelf;
  sh.busy = true; renderDex();
  try {
    const r = await withTimeout(rpc('dex_share_set', { p_open: next }), 10000);
    sh.open = r && typeof r.open === 'boolean' ? r.open : next;
    toast(sh.open ? '朋友現在可以在書櫃看你的圖鑑' : '已關閉，朋友看不到你的圖鑑');
  } catch (e) { toast(dexErr(e)); }
  sh.busy = false;
  if (dexOpen && dexShelf === sh) renderDex();
}
