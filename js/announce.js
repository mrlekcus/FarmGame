'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-05a',
  title: '廣場露營烹飪區：篝火吊鍋、切菜料理檯、烤肉架、露營木墩，在廣場也能煮菜',
  add: [
    '<b>廣場露營烹飪區</b>：廣場左下角新增露營區，有篝火吊鍋、切菜料理檯、烤肉架三個烹飪工具，旁邊還有帳篷和提燈。',
    '<b>露營木墩</b>：帳篷旁邊有 3 個木墩，面向它按動作鍵就能坐下，朋友也看得到你坐在哪；按方向鍵或動作鍵起身。可以三個人並排坐著聊天。',
    '<b>在廣場煮菜</b>：走到烹飪工具旁邊，面向它按動作鍵，就會打開料理選單；煮法跟家裡的廚房灶台一樣（按住加熱、進綠區放開，共三段），不用自己家裡有灶台。',
    '<b>煮菜的規則一樣</b>：需要的烹飪等級、材料、經驗和圖鑑品質都和在家煮一樣；走開或移動就會取消，材料不會消耗。'
  ],
  chg: [
    '<b>廣場左下角的樹</b>：為了放露營區，這一區原本的 5 棵樹移走了，其他地方的樹不變。'
  ],
  fix: []
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
