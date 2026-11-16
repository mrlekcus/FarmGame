'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-16d',
  title: '牧場可以賣動物、造型收藏家成就、寄信再確認、出海新音樂',
  add: [
    '<b>牧場小屋可以賣動物了</b>：找小茉，視窗下面多了「賣動物」，列出你養的雞、牛、羊，每隻賣買價的一半，賣之前會跳出確認。沒在生產的先賣；如果那隻剛好可以收蛋、奶、毛，會先收進背包再賣，不會吃虧。',
    '<b>髮型、帽子、眼鏡的「收藏家」成就</b>：和衣服一樣，集齊一款的所有顏色就拿到成就（髮型 11 色、帽子 6 色、眼鏡 7 色，共 26 個）。名片多了「造型」分類，沒拿到的會顯示收了幾色；衣櫥選到款式時，顏色下面也會顯示收集進度。以前整款買過的，直接算集滿。'
  ],
  chg: [
    '<b>造型、服裝成就的圖示</b>：不再是一整排同一個表情符號，改成圓章裡的像素小人：髮型、帽子、眼鏡畫戴著那一款的大頭貼，衣服畫穿著那一件的小人，每款顏色都不一樣，沒拿到的是灰色。',
    '<b>寄明信片多了再次確認</b>：按「寄出」後會先問「確定要寄給 某某 嗎？」，顯示要花的金幣和附的禮物，按「確認寄出」才會真的寄；改了收件人、禮物或內容，要重新確認。',
    '<b>出海的背景音樂換新了</b>：上船之後換成海浪聲的新曲子，音檔也壓小了，載入更快。'
  ],
  fix: [
    '<b>寄明信片的輸入框被壓扁</b>：信箱內容較多時，「寫幾句話」的輸入框會縮到只剩一行，現在固定有足夠的高度，可以正常打字。'
  ]
};

const ANN_KEY = 'dw_annc_seen';
let anEl = null;
const anSeen = () => { try { return localStorage.getItem(ANN_KEY) || ''; } catch (e) { return ''; } };
function anClose() {
  if (anEl) { anEl.remove(); anEl = null; }
  anOpen = false;
  try { localStorage.setItem(ANN_KEY, ANNOUNCE.v); } catch (e) { /* 略過：下次登入會再看到一次 */ }
}
function anShow() {
  const sec = (cls, name, arr) => arr && arr.length ? '<div class="an-sec"><b class="an-t ' + cls + '">' + name + '</b><ul>' + arr.map(t => '<li>' + t + '</li>').join('') + '</ul></div>' : '';
  anEl = document.createElement('div'); anEl.className = 'shop'; anEl.id = 'annc';
  anEl.innerHTML = '<div class="card an-card" tabindex="-1"><div class="shop-h"><h2>📢 更新通告</h2><span class="chip">' + esc(ANNOUNCE.v) + '</span></div>' +
    (ANNOUNCE.title ? '<p class="an-ver">' + esc(ANNOUNCE.title) + '</p>' : '') +
    sec('new', '✨ 新增', ANNOUNCE.add) + sec('chg', '🔧 調整', ANNOUNCE.chg) + sec('fix', '🐛 修正', ANNOUNCE.fix) +
    '<button type="button" class="btn wide" data-a="ok" style="margin-top:8px">知道了</button></div>';
  $('shop').parentNode.appendChild(anEl);
  anOpen = true; pressed.length = 0;
  anEl.addEventListener('pointerdown', e => e.stopPropagation());
  anEl.addEventListener('click', e => { if (e.target === anEl || e.target.closest('button[data-a="ok"]')) anClose(); });
  const b = anEl.querySelector('button[data-a="ok"]'); if (b) b.focus();
}
setInterval(() => {   // 登入進遊戲、沒有其他視窗開著、不是剛建角色時，這個版本第一次顯示
  if (anOpen || !ANNOUNCE.v || !ready || !me || authOpen || firstTime || paused() || scene === 'boat') return;
  if (anSeen() === ANNOUNCE.v) return;
  anShow();
}, 1500);

/* 設定裡的「更新通告 → 查看」：看過的通告可以隨時再打開 */
{
  const b = $('st-annc');
  if (b) b.addEventListener('click', () => {
    if (anOpen) return;
    if (typeof closeSettings === 'function') closeSettings();
    anShow();
  });
}
