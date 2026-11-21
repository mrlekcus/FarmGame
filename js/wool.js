'use strict';
/* 羊毛縫製與桃子姊姊的劇情 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* 玩家 Lv.8 之後，裁縫鋪多了「🐑 羊毛縫製」：用羊毛換羊毛服飾（只收羊毛，不收 G）。
   帽子 5 個羊毛、衣服 10 個羊毛，每個顏色單獨買；集滿一款的全部顏色拿「收藏家」成就（和一般服飾一樣）。
   款式編號：衣服 27～30（FITS）、帽子 20～23（HATS）；買到的紀錄還是 fc:款式:顏色、ht:款式:顏色，所以衣櫥、穿搭都不用改。
   第一次在 Lv.8 之後走進裁縫鋪，會先演一段小劇情（3 幕畫面）；演完才寫伺服器（wool_story_seen），之後可以「回顧」重看。
   後端：wool_story_get／wool_story_seen／buy_wool_item（見 wool.sql）。 */
const WOOL_FIT = [27, 28, 29, 30], WOOL_HAT = [20, 21, 22, 23];
const WOOL_COST = { fits: 10, hat: 5 }, WOOL_LV = 8;
const WOOL_DESC = {
  27: '白 T 上繞兩圈，右邊垂一條帶流蘇的圍巾',
  28: '肩膀披一圈，下襬有流蘇',
  29: '整件雲朵毛，領口配色，兩顆木釦',
  30: '全身雲朵毛的小綿羊裝，搭小綿羊帽最可愛',
  20: '一圈白雲毛，兩側小羊耳',
  21: '頭帶加兩顆蓬蓬耳罩，冬天專用',
  22: '小帽兩側長出彎彎的羊角，頂上一小撮捲毛',
  23: '頭頂一朵疊三層的大雲朵毛球'
};
let woolSt = null, woolTab = 'fits', woolAt = 0, woolReplay = false, woolBusy = false;
const woolSel = {};
const woolOk = () => !!(me && me.gm) || !!(lv && lv.pl >= WOOL_LV);

/* ---------- 裁縫鋪對話裡的按鈕 ---------- */
function woolTalkBtn() {
  if (!woolOk()) return '';
  return '<button type="button" class="btn wide" data-a="wopen">🐑 羊毛縫製</button>' +
    (woolSt && woolSt.seen ? '<button type="button" class="btn ghost wide" data-a="wreplay">回顧桃子姊姊的小故事</button>' : '');
}
/* 走進裁縫鋪：還沒看過劇情就演（只問一次伺服器，問過就記在本機） */
async function woolOnOpen() {
  if (!woolOk()) return;
  if (!(woolSt && woolSt.seen)) {
    try { woolSt = await enqueue(() => rpc('wool_story_get')); }
    catch (e) { woolSt = { seen: true, offline: true }; }   // 伺服器還沒裝：當作看過，不要卡住店
  }
  if (!syOpen || syKind !== 'fit') return;
  if (woolSt && !woolSt.seen && syStage === 'talk') { woolReplay = false; woolStart(); return; }
  if (syStage === 'talk') renderSty();   // 補上「回顧」按鈕
}

/* ---------- 劇情：桃子姊姊學會用羊毛縫衣服 ---------- */
const WOOL_STORY = [
  ['nar', '（桃子姊姊抱著一大團軟綿綿的羊毛，眼睛亮亮的）'],
  ['npc', '你來啦！我最近跟小茉學會用羊毛縫衣服和帽子了，你摸摸看，是不是很軟？'],
  ['nar', '（縫紉機噠噠響，白色的毛線慢慢變成一件衣服）'],
  ['npc', '看，我做好了！拿羊毛來，我就幫你縫。帽子 5 個羊毛，衣服 10 個羊毛。'],
  ['npc', '你牧場的小綿羊，就拜託你多照顧啦～']
];
const WOOL_BEATS = ['wool1', 'wool1', 'wool2', 'wool3', 'wool3'];
function woolStart() { woolAt = 0; petCgReset(); syStage = 'wstory'; renderSty(); }
async function woolEnd() {
  if (!woolReplay) {
    try { await enqueue(() => rpc('wool_story_seen')); } catch (e) { /* 寫不進去下次進店會再演一次，不影響買東西 */ }
    woolSt = Object.assign(woolSt || {}, { seen: true });
  }
  woolReplay = false; syStage = 'talk'; syLine = '拿羊毛來，我就幫你縫衣服和帽子喔。'; renderSty();
}
function renderWoolStory(head) {
  const n = WOOL_STORY.length, ln = WOOL_STORY[Math.min(woolAt, n - 1)], last = woolAt >= n - 1, tx = esc(ln[1]);
  let h = head + '<canvas id="wlcg" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#000"></canvas>';
  h += '<div style="display:flex;gap:4px;justify-content:center;margin:6px 0">' + WOOL_STORY.map((_, i) => '<i style="width:7px;height:7px;border-radius:50%;background:' + (i <= woolAt ? 'var(--pink)' : '#efe6d6') + '"></i>').join('') + '</div>';
  if (ln[0] === 'npc') h += '<div class="row"><canvas width="16" height="20" data-clerk="1" style="width:64px;height:80px;image-rendering:pixelated;flex:none"></canvas><div class="meta"><b>桃子姊姊</b><small id="wlcg-txt" data-full="' + tx + '" style="display:block;font-size:14px;line-height:1.5;white-space:normal;min-height:3em"></small></div></div>';
  else h += '<p id="wlcg-txt" data-full="' + tx + '" style="margin:10px 0;text-align:center;font-style:italic;opacity:.8;min-height:3em"></p>';
  h += '<button type="button" class="btn wide" data-a="wstory">' + (last ? (woolReplay ? '看完了' : '好，我去找羊毛') : '繼續 ▶') + '</button>';
  if (!last) h += '<button type="button" class="btn ghost wide" data-a="wskip">略過劇情</button>';
  syCard.innerHTML = h;
  const ck = syCard.querySelector('canvas[data-clerk]');
  if (ck) { const c2 = ck.getContext('2d'); c2.clearRect(0, 0, 16, 20); g = c2; try { npcArt(0, 4, 'tao', 0); } catch (e) { /* 略過 */ } g = ctx; }
  petCgStart(document.getElementById('wlcg'), WOOL_BEATS[Math.min(woolAt, WOOL_BEATS.length - 1)]);
  petCgType(document.getElementById('wlcg-txt'));
}

/* ---------- 劇情畫面（192×108）：用遊戲同款的 r()／ob()／npcArt()／drawPlayer() 即時畫 ---------- */
const wlR = (c, x, y, w, h) => r(c, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
const WL_W = '#fffaf0', WL_WO = '#d8cdb8', WL_WS = '#ece3d0';
function wlTao(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); npcArt(0, 0, 'tao', Math.floor(t * 1.6) % 2, t * 1000 + 500); g.restore(); }
function wlRoom() {
  wlR('#ffe9ef', 0, 0, 192, 108); for (let x = 0; x < 192; x += 8) wlR('#ffdde7', x, 0, 2, 70);
  wlR('#f3c9d6', 0, 60, 192, 3); wlR('#c08a62', 0, 72, 192, 36); for (let y = 76; y < 108; y += 8) wlR('#a8683a', 0, y, 192, 1);
}
function wlShelf(x, y, w) {
  wlR('#8a6a50', x, y, w, 2); const cs = ['#ff9bb3', '#8fc8f4', '#ffd27a', '#b79bf0', '#8fe09a'];
  for (let i = 0; i < Math.floor(w / 9); i++) { wlR(cs[i % 5], x + 2 + i * 9, y - 9, 7, 9); wlR('rgba(255,255,255,.45)', x + 3 + i * 9, y - 8, 2, 7); }
}
function wlCounter(x, w) { wlR('#c08a62', x, 58, w, 14); wlR('#a8683a', x, 70, w, 5); wlR('#e8cfa8', x, 58, w, 2); }
function wlCloud(x, y, s) {
  const n = [[0, 2, 6, 4], [3, 0, 6, 4], [6, 2, 6, 4], [2, 3, 8, 3]];
  n.forEach(([a, b, w, h]) => wlR(WL_WO, x + a * s - 1, y + b * s - 1, w * s + 2, h * s + 2));
  n.forEach(([a, b, w, h]) => wlR(WL_W, x + a * s, y + b * s, w * s, h * s)); wlR(WL_WS, x + 2 * s, y + 3 * s, 2 * s, s);
}
function wlYarn(x, y, c, k) {
  wlR(shade(c, .75), x - 1, y - 1, k + 2, k + 2); wlR(c, x, y, k, k); wlR(shade(c, 1.25), x + 1, y + 1, 2, 1);
  wlR(shade(c, .8), x + 1, y + k - 2, k - 2, 1); wlR(shade(c, .85), x + k - 3, y + 2, 1, k - 3);
}
function wlSceneBasket(t) {   // ① 桃子姊姊抱著一籃羊毛，毛屑慢慢飄
  wlRoom(); wlShelf(8, 32, 60); wlR('#8fc8f4', 128, 14, 46, 32); wlR('#bfe3f5', 131, 17, 40, 26); wlR('#fff', 150, 17, 2, 26);
  wlCounter(30, 132); wlTao(70, 24, 3, t); wlCloud(34, 40, 4); wlCloud(124, 44, 3);
  for (let i = 0; i < 6; i++) { const p = (t * .5 + i / 6) % 1; wlR(WL_W, 40 + i * 17 + Math.sin(t * 2 + i) * 3, 56 - p * 30, 2, 2); }
  wlYarn(100, 52, '#ff9bb3', 8); wlYarn(112, 54, '#8fc8f4', 7);
}
function wlSceneSew(t) {   // ② 縫紉機噠噠響，白色羊毛布從機器底下滑出來
  wlRoom(); wlShelf(8, 32, 60); wlCounter(10, 172); wlTao(26, 22, 3, t);
  wlR('#9aa3b2', 98, 44, 50, 14); wlR('#c5ccd8', 100, 46, 46, 4); wlR('#7a8494', 130, 36, 16, 10); wlR('#9aa3b2', 132, 38, 12, 6); wlR('#444', 100, 58, 50, 2);
  const ny = Math.round(Math.sin(t * 14) * 2); wlR('#cfd5df', 138, 46 + ny, 1, 10);
  wlR(WL_W, 92, 55, 26, 4); wlR(WL_WO, 92, 58, 26, 1); for (let i = 0; i < 5; i++) wlR(WL_WS, 96 + i * 5, 55, 2, 2);
  wlR('#ff6b8a', 146, 40, 3, 3); wlR('#ffd34d', 70, 52, 4, 6);
  for (let i = 0; i < 4; i++) wlR('#fff', 150 + i * 3, 34 - ((t * 10 + i * 4) % 10), 1, 1);
  wlR('#ff9bb3', 124, 34, 4, 4);
}
function wlScenePose(t) {   // ③ 人台穿著小綿羊連身裝＋小綿羊帽，桃子姊姊伸手介紹
  wlRoom(); wlR('#ffd9e4', 60, 8, 72, 64); wlR('#fff', 64, 12, 64, 56); wlR('rgba(191,227,245,.8)', 64, 12, 64, 56); wlR('#fff', 68, 16, 6, 40);
  g.save(); g.translate(76, 36); g.scale(3.2, 3.2);
  try { drawPlayer(0, 0, 'down', false, 0, { ...DEF_CHAR, hat: 20, hatc: 5, fits: 30, outfit: 2, style: 1, hair: 2 }); } catch (e) { /* 略過 */ }
  g.restore();
  wlTao(14, 26, 3.2, t); wlR('#ffe3cc', 50, 52, 10, 3);
  for (let i = 0; i < 10; i++) { const a = t * 2 + i, rx = 96 + Math.cos(a) * 40, ry = 40 + Math.sin(a * 1.3) * 22; if (Math.sin(t * 4 + i * 2) > -.2) { wlR('#fff6a8', rx, ry, 2, 2); wlR('#fff', rx + 1, ry, 1, 1); } }
  wlR('#8a6a50', 150, 62, 30, 2);
}
function woolCgDraw(beat, t) {   // pet-cg.js 的 pcgDraw 會先問這裡
  if (beat === 'wool1') { wlSceneBasket(t); return true; }
  if (beat === 'wool2') { wlSceneSew(t); return true; }
  if (beat === 'wool3') { wlScenePose(t); return true; }
  return false;
}

/* ---------- 羊毛專區 ---------- */
const woolOwn = (isH, i, c) => isH ? lookHave('hat', i, c) : fcHave(i, c);
function renderWoolShop(head, cur) {
  const wl = have('a:wool'), isH = woolTab === 'hat', ids = isH ? WOOL_HAT : WOOL_FIT, cost = isH ? WOOL_COST.hat : WOOL_COST.fits;
  const pal = isH ? HATCOL : OUTFITS, NC = pal.length, names = isH ? HATS : FITS, kd = isH ? 'h' : 'f';
  const tab = (k, n) => '<button type="button" class="cb" data-a="wtab" data-c="' + k + '" aria-pressed="' + (woolTab === k) + '">' + n + '</button>';
  const rows = ids.map(i => {
    let n = 0; for (let c = 0; c < NC; c++) if (woolOwn(isH, i, c)) n++;
    const key = kd + i, sel = woolSel[key] != null ? woolSel[key] : 0, own = woolOwn(isH, i, sel);
    const now = isH ? (cur.hat === i && cur.hatc === sel) : (cur.fits === i && cur.outfit === sel);
    const act = now ? '<small>目前穿著</small>' : '<button type="button" class="btn small" data-a="' + (own ? 'wwear' : 'wbuy') + '" data-k="' + kd + '" data-i="' + i + '" data-c="' + sel + '"' + (woolBusy || (!own && wl < cost) ? ' disabled' : '') + '>' + (own ? '穿上' : '🧶 ' + cost + ' 買並穿上') + '</button>';
    const sws = pal.map((pc, ci) => '<button type="button" class="sw fsw' + (woolOwn(isH, i, ci) ? ' own' : '') + '" data-a="wpick" data-k="' + kd + '" data-i="' + i + '" data-c="' + ci + '" aria-pressed="' + (ci === sel) + '" style="--c:' + pc + ';width:22px;height:22px;border-width:2px"></button>').join('');
    return '<div class="row" style="align-items:flex-start"><canvas width="16" height="22" data-wi="' + i + '" data-wc="' + sel + '" style="width:48px;height:66px;image-rendering:pixelated;flex:none"></canvas>' +
      '<div class="meta"><b>' + esc(names[i]) + '</b><small>' + esc(WOOL_DESC[i] || '') + '</small><small>🧶 ' + cost + ' 個 · 已收集 ' + n + '/' + NC + (n >= NC ? ' ✅' : '') + '</small>' +
      '<div class="sws" style="gap:5px;margin:6px 0;flex-wrap:wrap">' + sws + '</div>' + act + '</div></div>';
  }).join('');
  syCard.innerHTML = head + '<div class="chip" style="margin:0 0 6px;display:inline-block">🧶 羊毛 ' + wl + ' 個</div>' +
    '<div class="tabs2">' + tab('fits', '👕 衣服') + tab('hat', '🎩 帽子') + '</div>' +
    '<p style="margin:6px 0;font-size:12px;opacity:.7">只收羊毛，不收 G。羊毛從牧場的小綿羊來：餵乾草，再用收成籃收。每個顏色單獨買，集滿一款的 ' + NC + ' 種顏色會得到收藏家成就。</p>' + rows +
    '<button type="button" class="btn ghost wide" data-a="talk">回去跟桃子姊姊說話</button><button type="button" class="btn ghost wide" data-a="close">關閉</button>';
  syCard.querySelectorAll('canvas[data-wi]').forEach(cv => {
    const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 22); g = c2;
    const i = +cv.dataset.wi, c = +cv.dataset.wc;
    try { drawPlayer(0, 6, 'down', false, 0, isH ? { ...cur, hat: i, hatc: c } : { ...cur, fits: i, outfit: c }); } catch (e) { /* 略過 */ }
    g = ctx;
  });
}

/* ---------- 按鈕處理：回傳 true 代表這顆按鈕是我處理的 ---------- */
async function woolAction(a, b) {
  if (a === 'wopen') { if (!woolOk()) return true; syStage = 'wool'; renderSty(); return true; }
  if (a === 'wtab') { woolTab = b.dataset.c === 'hat' ? 'hat' : 'fits'; renderSty(); return true; }
  if (a === 'wpick') { woolSel[b.dataset.k + b.dataset.i] = +b.dataset.c; renderSty(); return true; }
  if (a === 'wreplay') { woolReplay = true; woolStart(); return true; }
  if (a === 'wskip') { await woolEnd(); return true; }
  if (a === 'wstory') {
    if (petCgSkipType()) return true;   // 字還沒出完：先補完，不換句
    if (woolAt < WOOL_STORY.length - 1) { woolAt++; renderSty(); } else await woolEnd();
    return true;
  }
  if (a === 'wbuy' || a === 'wwear') {
    const isH = b.dataset.k === 'h', i = +b.dataset.i, c = +b.dataset.c;
    woolBusy = true; renderSty();
    try {
      let got = null;
      if (a === 'wbuy') {
        const r_ = await enqueue(() => rpc('buy_wool_item', { p_kind: isH ? 'hat' : 'fits', p_idx: i, p_col: c }));
        if (r_.inv) Object.assign(inv, r_.inv);
        got = r_.ach || null;
      }
      const look = {}; const cur = myChar(); for (const k in LIMIT) look[k] = cur[k];
      if (isH) { look.hat = i; look.hatc = c; } else { look.fits = i; look.outfit = c; }
      await enqueue(() => rpc('set_look', { p_name: me.name, p_look: look }));
      me.look = look;
      const A = got && ACH.find(x => x.id === got);
      toast(A ? '🎉 獲得成就：' + A.n : a === 'wbuy' ? '縫好了，已經穿上' : '換好了', A ? 3800 : 2200);
    } catch (err) { toast(errText(err)); await resync(); }
    woolBusy = false;
    if (syOpen) renderSty();
    refreshHud();
    return true;
  }
  return false;
}
