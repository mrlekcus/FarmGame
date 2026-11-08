'use strict';
/* 村民：像素圖與對話 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* ---------- 村民：像素圖與對話 ---------- */
const NPC_LOOK = {   // 頭髮色、衣服色（每位村民的配件在 npcArt 裡各自畫）
  oak:  { hair: '#f4f4f4', cloth: '#6fa56f' },
  gui:  { hair: '#cfcfd6', cloth: '#f2a3b8' },
  li:   { hair: '#7a6a5a', cloth: '#6a9ac4' },
  luo:  { hair: '#5a3a2a', cloth: '#e8873a' },
  mo:   { hair: '#a06a3a', cloth: '#7ab0e8' },
  tao:  { hair: '#7a4a3a', cloth: '#ff9bb3' },
  jian: { hair: '#2f2a33', cloth: '#8fd3c0' },
  mu:   { hair: '#7a5a3a', cloth: '#c9955f' }
};
/* 旅行商人 米羅（捲毯背包客，精緻版）：背包頂上綁花紋地毯捲、紅帽插白羽毛、紅圍巾；
   畫法和新村民一樣——衣服有亮暗面、眼睛有高光、有腮紅和手腳，每 3.8 秒眨一次眼。 */
function miloArt(px, py, bob, now) {
  if (now == null) now = Date.now();
  const o = 'rgba(90,60,40,.55)', bl = (now % 3800) > 3650, cloth = '#6a9ac4', hc = '#3a2a2a';
  const H = { x: 3, y: 2, w: 10, h: 8 }, B = { x: 4, y: 9, w: 8, h: 6 };
  const R = (c, x, y, w, h) => r(c, px + x, py + y + bob, w, h), R0 = (c, x, y, w, h) => r(c, px + x, py + y, w, h), OB = (f, e, x, y, w, h) => ob(f, e, px + x, py + y + bob, w, h);
  const hi = c => shade(c, 1.18), lo = c => shade(c, .82);
  R0('rgba(90,60,40,.2)', 3, 14, 10, 2); R0('rgba(90,60,40,.12)', 2, 14, 12, 2);
  // 背包＋地毯捲（在身體後面）
  OB('#b05a4a', '#7a3428', 0, 6, 5, 9); R('#d27a68', 1, 7, 1, 6);
  OB('#e8c070', '#a8802a', -1, 3, 7, 4); R('#c9584a', 0, 4, 5, 1); R('#6a9ac4', 0, 5, 5, 1); R('#fff1b8', 1, 4, 1, 1); R('#7a3428', 2, 3, 1, 4); R('#b4b8c4', 1, 12, 2, 2);
  // 腳、身體（亮面＋暗面）、手
  R0('#6a4a3a', B.x + 1, 14, 2, 1); R0('#6a4a3a', B.x + B.w - 3, 14, 2, 1);
  OB(cloth, o, B.x, B.y, B.w, B.h); R(hi(cloth), B.x + 1, B.y + 1, B.w - 2, 1); R(lo(cloth), B.x + 1, B.y + B.h - 2, B.w - 2, 1);
  R('#ffe3cc', B.x - 1, B.y + 2, 1, 3); R('#ffe3cc', B.x + B.w, B.y + 2, 1, 3);
  // 紅圍巾、背帶
  R('#c9584a', B.x + 1, B.y, B.w - 2, 1); R('#a8423a', B.x + 1, B.y + 1, 2, 1); R('#7a3428', B.x + 1, B.y + 1, 1, B.h - 2);
  // 頭、頭髮
  OB('#ffe3cc', o, H.x, H.y, H.w, H.h); R(hi('#ffe3cc'), H.x + 2, H.y + 1, 2, 1);
  R(hc, H.x, H.y, H.w, 2); R(hc, H.x, H.y, 1, H.h - 3); R(hc, H.x + H.w - 1, H.y, 1, H.h - 3); R(hi(hc), H.x + 2, H.y, 3, 1);
  // 臉：眼睛有高光、腮紅、嘴
  [H.x + 2, H.x + H.w - 4].forEach(x => { if (bl) R('#3a2a3a', x, H.y + 4, 2, 1); else { R('#3a2a3a', x, H.y + 3, 2, 3); R('#ffffff', x, H.y + 3, 1, 1); R('#8a6a8a', x + 1, H.y + 5, 1, 1); } });
  R('#ff9ab0', H.x + 1, H.y + 6, 1, 1); R('#ff9ab0', H.x + H.w - 2, H.y + 6, 1, 1); R('#e0607a', H.x + 4, H.y + 6, 2, 1);
  // 紅帽＋白羽毛
  OB('#c9584a', '#8a2e26', H.x, H.y - 3, H.w, 4); R('#e8806f', H.x + 2, H.y - 2, 3, 1); R('#8a2e26', H.x - 1, H.y + 1, H.w + 2, 1); R('#ffffff', H.x + H.w - 1, H.y - 4, 1, 3); R('#ffffff', H.x + H.w, H.y - 3, 1, 2);
}
/* 村民像素圖（16×16，精緻版）：衣服有亮暗面、眼睛有高光、有腮紅和手腳，每 3.8 秒眨一次眼；招牌配件——
   村長橡果帽＋鬍子＋拐杖、婆婆髮髻花＋眼鏡、老鯉叔草帽＋釣竿、阿洛礦燈帽＋鎬子、小茉蝴蝶結＋牛奶、
   桃子姊姊雙蝴蝶結＋捲尺＋剪刀、阿剪師傅側分瀏海＋剪刀、阿杉師傅綠帽＋大鬍子＋鎚子。
   店員（桃子、阿剪、阿杉）和頭像小圖（npcIcon）都走這支。 */
function npcArt(px, py, key, bob, now) {
  if (key === 'milo') { miloArt(px, py, bob, now); return; }
  if (now == null) now = Date.now();
  const L = NPC_LOOK[key] || NPC_LOOK.oak, o = 'rgba(90,60,40,.55)', bl = (now % 3800) > 3650;   // bl：每 3.8 秒眨一次眼
  const H = { x: 3, y: 2, w: 10, h: 8 };
  const B = { x: 4, y: 9, w: 8, h: 6 };
  const R = (c, x, y, w, h) => r(c, px + x, py + y + bob, w, h), OB = (c, oc, x, y, w, h) => ob(c, oc, px + x, py + y + bob, w, h), R0 = (c, x, y, w, h) => r(c, px + x, py + y, w, h);
  const hi = c => shade(c, 1.18), lo = c => shade(c, .82);
  R0('rgba(90,60,40,.2)', 3, 14, 10, 2); R0('rgba(90,60,40,.12)', 2, 14, 12, 2);
  // 腳
  R0('#6a4a3a', B.x + 1, 14, 2, 1); R0('#6a4a3a', B.x + B.w - 3, 14, 2, 1);
  // 身體（亮面＋暗面）
  OB(L.cloth, o, B.x, B.y, B.w, B.h); R(hi(L.cloth), B.x + 1, B.y + 1, B.w - 2, 1); R(lo(L.cloth), B.x + 1, B.y + B.h - 2, B.w - 2, 1);
  // 手
  R('#ffe3cc', B.x - 1, B.y + 2, 1, 3); R('#ffe3cc', B.x + B.w, B.y + 2, 1, 3);
  // 身體裝飾（在頭之前）
  const cx = B.x + B.w / 2;
  if (key === 'oak') { R('#4f8a4f', B.x + 1, B.y + 1, 2, B.h - 2); R('#4f8a4f', B.x + B.w - 3, B.y + 1, 2, B.h - 2); R('#fffaf0', cx - 1, B.y, 2, 2); R('#ffd34d', cx, B.y + 3, 1, 1); R('#b98a52', B.x + B.w + 1, B.y - 1, 1, 8); R('#8c5b3c', B.x + B.w, B.y - 2, 2, 1); }
  if (key === 'gui') { R('#fffaf0', B.x + 1, B.y + 2, B.w - 2, B.h - 3); R('#ff9bb3', cx - 1, B.y + 3, 2, 1); R('#e78aa6', B.x, B.y, B.w, 1); R('#b58a6a', B.x + B.w + 1, B.y - 1, 1, 8); R('#d9b38a', B.x + B.w, B.y - 2, 2, 1); }
  if (key === 'li') { R('#3f6f9f', B.x + 1, B.y + 2, 2, 2); R('#3f6f9f', B.x + B.w - 3, B.y + 2, 2, 2); R('#fffaf0', cx, B.y, 1, B.h - 1); R('#8c5b3c', B.x + B.w + 1, B.y - 4, 1, 11); R('#fff', B.x + B.w + 2, B.y - 4, 1, 5); R('#ff8a5a', B.x + B.w + 2, B.y + 1, 2, 1); }
  if (key === 'luo') { R('#b8651f', B.x + 1, B.y, 1, B.h - 1); R('#b8651f', B.x + B.w - 2, B.y, 1, B.h - 1); R('#ffd34d', B.x + 1, B.y + 2, 1, 1); R('#ffd34d', B.x + B.w - 2, B.y + 2, 1, 1); R('#8c5b3c', B.x + B.w + 1, B.y - 2, 1, 8); R('#b4b8c4', B.x + B.w - 1, B.y - 3, 4, 1); R('#b4b8c4', B.x + B.w + 2, B.y - 2, 1, 1); }
  if (key === 'mo') { R('#fffaf0', B.x + 1, B.y + 1, B.w - 2, B.h - 2); R('#ffd7e2', B.x + 1, B.y + 1, B.w - 2, 1); R('#ffffff', B.x + B.w + 1, B.y + 3, 2, 3); R('#cfe6f5', B.x + B.w + 1, B.y + 2, 2, 1); }
  if (key === 'tao') { R('#ffd34d', B.x, B.y, B.w, 1); R('#c9a21c', B.x + 1, B.y, 1, 1); R('#c9a21c', B.x + 3, B.y, 1, 1); R('#fffaf0', cx - 1, B.y + 2, 2, 2); R('#ff6b8a', cx - 1, B.y + 2, 2, 1); R('#d0d6e0', B.x + B.w + 1, B.y + 1, 1, 3); R('#d0d6e0', B.x + B.w + 2, B.y + 1, 1, 3); }
  if (key === 'jian') { R('#5bb7a0', B.x + 1, B.y + 1, 2, B.h - 2); R('#5bb7a0', B.x + B.w - 3, B.y + 1, 2, B.h - 2); R('#fffaf0', cx - 1, B.y, 2, 2); R('#ff9bb3', B.x + B.w + 1, B.y + 1, 1, 2); R('#d0d6e0', B.x + B.w + 2, B.y - 1, 1, 3); R('#d0d6e0', B.x + B.w, B.y - 1, 1, 3); R('#e86a7a', B.x + B.w + 1, B.y + 2, 1, 1); }
  if (key === 'mu') { R('#8c5b3c', B.x + 1, B.y + 2, B.w - 2, B.h - 3); R('#6b4428', B.x + 1, B.y + 2, B.w - 2, 1); R('#ffd34d', cx - 1, B.y + 3, 2, 1); R('#8c5b3c', B.x + B.w + 1, B.y, 1, 6); R('#b4b8c4', B.x + B.w, B.y - 1, 3, 2); }
  // 頭
  OB('#ffe3cc', o, H.x, H.y, H.w, H.h);
  R(hi('#ffe3cc'), H.x + 2, H.y + 1, 2, 1);
  // 頭髮
  const hc = L.hair, hs = lo(hc);
  R(hc, H.x, H.y, H.w, 2); R(hc, H.x, H.y, 1, H.h - 3); R(hc, H.x + H.w - 1, H.y, 1, H.h - 3);
  R(hs, H.x + 1, H.y + 2, 2, 1); R(hc, H.x + H.w - 4, H.y + 2, 3, 1); R(hs, H.x + 4, H.y + 2, H.w - 8, 1);
  R(hi(hc), H.x + 2, H.y, 3, 1);
  // 臉
  const ex = [H.x + 2, H.x + H.w - 4], ey = H.y + 3;
  const glass = key === 'gui', 
        eye = x => { if (bl) R('#3a2a3a', x, ey + 1, 2, 1); else { R('#3a2a3a', x, ey, 2, 3); R('#ffffff', x, ey, 1, 1); R('#8a6a8a', x + 1, ey + 2, 1, 1); } };
  eye(ex[0]); eye(ex[1]);
  R('#ff9ab0', H.x + 1, ey + 3, 1, 1); R('#ff9ab0', H.x + H.w - 2, ey + 3, 1, 1);
  R('#e0607a', H.x + H.w / 2 - 1, ey + 3, 2, 1);
  // 臉部/頭部裝飾
  if (key === 'oak') { R('#fff', H.x + 2, ey + 3, H.w - 4, 2); R('#e8e8ee', H.x + 3, ey + 4, H.w - 6, 1); R('#e0607a', H.x + H.w / 2 - 1, ey + 3, 2, 1);
    OB('#8c5b3c', '#5e3a24', H.x - 1, H.y - 3, H.w + 2, 4); R('#a8764f', H.x + 1, H.y - 2, 2, 1); R('#a8764f', H.x + 5, H.y - 2, 2, 1); R('#a8764f', H.x + 9, H.y - 2, 2, 1); R('#5e3a24', H.x + H.w / 2 - 1, H.y - 4, 2, 1); R('#7fc48a', H.x + H.w / 2 + 1, H.y - 4, 2, 1); }
  if (key === 'gui') { OB(hc, '#9a9aa8', H.x + 3, H.y - 3, H.w - 6, 4); R('#ff9bb3', H.x + H.w - 4, H.y - 2, 2, 2); R('#ffd34d', H.x + H.w - 4, H.y - 2, 1, 1);
    [ex[0], ex[1]].forEach(x => { R('#b9886a', x - 1, ey - 1, 4, 1); R('#b9886a', x - 1, ey + 3, 4, 1); R('#b9886a', x - 1, ey, 1, 3); R('#b9886a', x + 2, ey, 1, 3); }); R('#b9886a', ex[0] + 3, ey + 1, ex[1] - ex[0] - 4, 1); }
  if (key === 'li') { R('#9a8a7a', H.x + 3, ey + 4, 1, 1); R('#9a8a7a', H.x + H.w - 4, ey + 4, 1, 1);
    OB('#e8c872', '#b8932a', H.x - 3, H.y - 1, H.w + 6, 3); OB('#f2d98a', '#b8932a', H.x + 1, H.y - 4, H.w - 2, 4); R('#d9667f', H.x + 1, H.y - 1, H.w - 2, 1); R('#fff1b8', H.x + 3, H.y - 3, 2, 1); }
  if (key === 'luo') { R('#6a5a4a', H.x + 1, ey + 3, 2, 1); R('#6a5a4a', H.x + H.w - 3, ey + 4, 2, 1);
    OB('#ffc83d', '#b8892a', H.x - 1, H.y - 3, H.w + 2, 5); R('#ffe58a', H.x + 2, H.y - 2, 3, 1); R('#fff6a8', H.x + H.w / 2 - 1, H.y - 4, 2, 2); R('rgba(255,246,168,.45)', H.x + H.w / 2 - 2, H.y - 5, 4, 1); R('#b8892a', H.x - 1, H.y + 1, H.w + 2, 1); }
  if (key === 'mo') { R('#7ab0e8', H.x + 1, H.y + 1, 3, 2); R('#7ab0e8', H.x + H.w - 4, H.y + 1, 3, 2); R('#5a90c8', H.x + 2, H.y + 1, 1, 1); R('#5a90c8', H.x + H.w - 3, H.y + 1, 1, 1);
    R(hc, H.x - 1, H.y + 3, 2, 5); R(hc, H.x + H.w - 1, H.y + 3, 2, 5); R(hs, H.x - 1, H.y + 6, 2, 1); R(hs, H.x + H.w - 1, H.y + 6, 2, 1); R('#ffffff', H.x + H.w / 2 - 1, H.y - 1, 2, 1); }
  if (key === 'tao') { OB('#ff6b8a', '#d4688a', H.x - 1, H.y - 1, 4, 4); OB('#ff6b8a', '#d4688a', H.x + H.w - 3, H.y - 1, 4, 4); R('#ffd34d', H.x + 1, H.y, 1, 1); R('#ffd34d', H.x + H.w - 2, H.y, 1, 1);
    R(hc, H.x - 1, H.y + 3, 2, 6); R(hc, H.x + H.w - 1, H.y + 3, 2, 6); R(hs, H.x - 1, H.y + 7, 2, 1); R(hs, H.x + H.w - 1, H.y + 7, 2, 1); }
  if (key === 'jian') { R(hc, H.x + 1, H.y - 2, H.w - 2, 2); R(hc, H.x + 3, H.y - 3, H.w - 5, 1); R(hi(hc), H.x + 4, H.y - 3, 3, 1); R(hc, H.x + H.w - 2, H.y - 1, 2, 4); R('#e8e8f0', H.x + 1, H.y - 1, 1, 1); R('#8fd3c0', H.x + 2, H.y - 2, 1, 1); }
  if (key === 'mu') { OB('#7fc48a', '#4f9a62', H.x, H.y - 2, H.w, 4); R('#4f9a62', H.x, H.y + 1, H.w + 2, 1); R('#a8dcb0', H.x + 2, H.y - 1, 3, 1); R('#fffaf0', H.x + H.w / 2 - 1, H.y - 1, 2, 2);
    R(hc, H.x + 1, ey + 3, H.w - 2, 3); R(hs, H.x + 2, ey + 5, H.w - 4, 1); R('#e0607a', H.x + H.w / 2 - 1, ey + 3, 2, 1); }
}
function drawNpc(px, py, key, now) {
  const bob = Math.floor(now / 600 + key.charCodeAt(0)) % 2;
  npcArt(px, py, key, bob, now);
}
/* 頭上的「！」要在房子、樹之後才畫，不然會被屋頂蓋住 */
function drawNpcMark(px, py, key, now) {
  const t = storyTarget();
  if (t && t.npc === key && plv() >= t.pl) {
    const by = py - 10 + Math.round(Math.sin(now / 250) * 1.5);
    r('#ffffff', px + 4, by - 1, 8, 10);                       // 白色底，冬天的淡紫色地面上才看得清楚
    ob('#ffd34d', '#b87a00', px + 5, by, 6, 8);
    r('#7a4a00', px + 7, by + 1, 2, 3); r('#7a4a00', px + 7, by + 5, 2, 2);
  }
}
/* 目前該找誰：以伺服器的章節表為準（story_get），還沒讀到時才用本地的對照表 */
function storyTarget() {
  const d = stData && stData.done != null ? stData.done | 0 : storyDone | 0;
  if (stData && Array.isArray(stData.chapters) && stData.chapters.length) {
    const c = stData.chapters.find(x => x.ch === d + 1);
    return c ? { npc: c.npc, pl: c.pl | 0 } : null;
  }
  return d < NPC_CH.length ? { npc: NPC_CH[d], pl: CH_PL[d] } : null;
}
/* 頭像小圖：村民的帽子、髮髻會往上突出，所以畫布高 20，往下挪 4 格再畫（米羅還是 16×16 的舊畫法，不挪） */
function npcIcon(c2d, key) { const h = c2d.canvas.height; g = c2d; g.clearRect(0, 0, 16, h); npcArt(0, h > 16 && key !== 'milo' ? 4 : 0, key, 0); g = ctx; }
const dgEl = $('dgm'), dgCard = $('dgcard');
let dg = null, dgBusy = false;
async function openNpc(i) {
  if (i < 0 || !ready || !me || authOpen || paused() || dgOpen) return;
  const nq = NPCS[i];
  dgOpen = true; pressed.length = 0; dg = { npc: nq, lines: [], i: 0, mode: 'chat', cur: null };
  renderDlg(); dgEl.hidden = false; dgCard.focus();
  try { stData = await rpc('story_get'); } catch (e) { toast(errText(e)); closeDlg(); return; }
  const d = stData.done | 0, chs = stData.chapters || [], cur = chs.find(c => c.ch === d + 1);
  if (cur && cur.npc === nq.k) {
    if (plv() < cur.pl) dg.lines = [{ s: nq.k, t: '再多歷練一下吧，等你到玩家 Lv.' + cur.pl + '，我再把這件事託付給你。' }];
    else { dg.mode = 'quest'; dg.cur = cur; dg.lines = cur.lines; }
  } else {
    const T = NPC_TALK[nq.k], mine = chs.some(c => c.npc === nq.k && c.ch <= d);
    const pool = !cur ? T.end : mine ? T.after : T.idle;
    dg.lines = [{ s: nq.k, t: pool[Math.floor(srvNow() / 86400000) % pool.length] }];
  }
  dg.i = 0; if (dgOpen) renderDlg();
}
function closeDlg() { dgOpen = false; dgEl.hidden = true; dg = null; scgSt.beat = -1; }
function renderDlg() {
  if (!dg) return;
  if (!dg.lines.length) { dgCard.innerHTML = '<p class="empty">讀取中…</p>'; return; }
  const ln = dg.lines[dg.i], last = dg.i >= dg.lines.length - 1, me_ = ln.s === 'me';
  const sp = me_ ? { k: null, n: me ? me.name : '我' } : (NPCS.find(q => q.k === ln.s) || dg.npc);
  let btn = '';
  const dis = dgBusy ? ' disabled' : '';
  if (!last) btn = '<button type="button" class="btn wide" data-a="next">下一句</button>';
  else if (dg.mode === 'quest') {
    const cur = dg.cur, need = Object.keys(cur.need).map(k => esc(itemName(k)) + ' ' + Math.min(have(k), cur.need[k]) + '/' + cur.need[k]).join('、');
    const ok = Object.keys(cur.need).every(k => have(k) >= cur.need[k]);
    const rw = cur.coins + ' G' + Object.keys(cur.items || {}).map(k => '、' + esc(itemName(k)) + ' ×' + cur.items[k]).join('');
    btn = '<div class="v-quick"><small class="empty">需要：' + need + '<br>獎勵：' + rw + '</small></div>' +
      '<button type="button" class="btn wide" data-a="give"' + (dgBusy || !ok ? ' disabled' : '') + '>' + (ok ? '交付' : '材料還不夠') + '</button>' +
      '<button type="button" class="btn ghost wide" data-a="close">等一下再來</button>';
  } else btn = (dg.mode === 'chat' && SEED_NPC[dg.npc.k] ? '<button type="button" class="btn wide" data-a="seed"' + dis + '>用採集物換種子</button>' : '') +
    '<button type="button" class="btn' + (dg.mode === 'chat' && SEED_NPC[dg.npc.k] ? ' ghost' : '') + ' wide" data-a="close">' + (dg.mode === 'outro' ? '完成' : '再見') + '</button>';
  dgCard.innerHTML = '<div class="shop-h"><h2>' + esc(sp.n) + '</h2>' + (dg.mode === 'quest' ? '<span class="chip">第 ' + dg.cur.ch + ' 章：' + esc(dg.cur.title) + '</span>' : '') + '</div>' +
    (dg.cur && (dg.mode === 'quest' || dg.mode === 'outro') ? scgCanvas(dg.cur.ch - 1) : '') +   // 章節對話：上面多一幅劇情 CG（js/story-cg.js）
    '<div style="display:flex;gap:12px;align-items:flex-start;margin:8px 0">' +
    (me_ ? '<canvas width="16" height="22" data-me="1" style="width:64px;height:88px;flex:none;image-rendering:pixelated"></canvas>' : '<canvas width="16" height="20" data-npc="' + sp.k + '" style="width:64px;height:80px;flex:none;image-rendering:pixelated"></canvas>') +
    '<p style="margin:0;font-size:16px;line-height:1.7;min-height:80px">' + esc(ln.t) + '</p></div>' +
    '<small class="empty">' + (dg.i + 1) + ' / ' + dg.lines.length + '</small>' + btn;
  dgCard.querySelectorAll('canvas[data-npc]').forEach(cv => npcIcon(cv.getContext('2d'), cv.dataset.npc));
  dgCard.querySelectorAll('canvas[data-me]').forEach(cv => { const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 22); g = c2; try { drawPlayer(0, 6, 'down', false, 0, myChar()); } catch (e) { /* 略過 */ } g = ctx; });
  const scv = dgCard.querySelector('canvas[data-scg]'); if (scv) scgRun(scv, +scv.dataset.scg);
}
dgCard.addEventListener('click', async e => {
  const b = e.target.closest('button[data-a]'); if (!b || b.disabled || !dg) return;
  const a = b.dataset.a;
  if (a === 'close') { closeDlg(); return; }
  if (a === 'next') { dg.i++; renderDlg(); return; }
  if (a === 'seed') { const k = dg.npc.k; closeDlg(); openSeedTrade(k); return; }
  if (a === 'give') {
    dgBusy = true; renderDlg();
    try {
      const r = await enqueue(() => rpc('story_submit'));
      if (r.inv) Object.assign(inv, r.inv);
      if (typeof r.coins === 'number') me.coins = r.coins;
      storyDone = r.done | 0;
      toast('故事過關！+' + r.earned + ' G' + Object.keys(r.items || {}).map(k => '、' + itemName(k) + ' ×' + r.items[k]).join(''));
      const cur = dg && dg.cur;
      stData = await rpc('story_get');
      if (dg && cur) { dg.mode = 'outro'; dg.lines = cur.outro && cur.outro.length ? cur.outro : [{ s: cur.npc, t: '謝謝你！' }]; dg.i = 0; }
    } catch (err) { toast(errText(err)); await resync(); }
    dgBusy = false; if (dgOpen) renderDlg(); refreshHud(); loadLevelSoon();
  }
});
dgEl.addEventListener('click', e => { if (e.target === dgEl && !dgBusy) closeDlg(); });
