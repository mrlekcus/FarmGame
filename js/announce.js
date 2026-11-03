'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-03a',
  title: '蛇梯棋刪除、四季日曆與換季通知、碼頭留言板、萬聖節活動結束',
  add: [
    '<b>四季日曆與換季通知</b>：畫面上方的季節標籤會顯示這一季還剩幾天，最後一天變成「明天換○」；點一下標籤打開四季日曆，一輪 28 天，點哪一季就看那一季的當季作物（賣價 +25%）和只在這一季出現的魚、蟲。每次換季後第一次進遊戲會彈出通知，告訴你和上一季比有哪些作物、魚蟲新增或離開；換季前一天也會先提醒。冬天從 11/12 開始。',
    '<b>碼頭留言板</b>：廣場棧橋南邊多了一塊大木板，全服玩家共用 12 張便利貼。走到板子左右兩側按動作鍵，可以看大家的留言，也能自己貼一張（玩家 Lv.3 以上）',
    '<b>留言規則</b>：每人每天 3 張（每天 0 點換日，GMT+8）、每張最多 20 字、板上自己最多同時 2 張。板子滿了，新的貼上去，最舊的會被海風吹走；自己的便利貼有金色小星，可以撕掉（次數照算）；不當的留言可以檢舉'
  ],
  chg: [
    '<b>蛇梯棋刪除</b>：廣場左上角的蛇梯棋已經移除，那塊地方變回一般草地。',
    '<b>萬聖節活動結束</b>：廣場上的南瓜小徑、糖果攤和魔女鍋都已撤下，萬聖節的糖果、材料和三道活動料理也一併清除。謝謝大家一起度過這個萬聖節！'
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
