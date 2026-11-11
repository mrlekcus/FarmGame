'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-11e',
  title: '手冊新增咖啡廳章節，多人同時在場更順了',
  add: [
    '<b>📖 手冊的出海團與寵物章節有圖了</b>：「出海團」畫出柴犬船長的甲板和拋竿的樣子；「寵物與朋友的寵物」畫出摸朋友的貓、頭上冒愛心的畫面，圖上有編號說明。原本這兩章是空白的。',
    '<b>📖 手冊新增「☕ 咖啡廳」章節</b>：店內全景、操作間導覽（編號跟「穿上圍裙」窗一樣）、美式／拿鐵／蜂蜜鬆餅三張料理流程圖，圖上有編號說明，怎麼點餐、怎麼打工都寫在裡面。'
  ],
  chg: [
    '<b>☕ 「穿上圍裙」窗改用手冊的圖</b>：「操作間導覽」換成操作間特寫圖（編號 1～10 照圖標好），「三道料理怎麼做」換成三張流程圖加編號說明；兩頁都多了「📖 看手冊完整說明」，看完關掉手冊會回到原本那一頁。窗裡和手冊用同一份內容，不會再不一致。',
    '<b>☕ 咖啡廳連線更省流量</b>：店裡畫面沒有變化時，不再一直重複傳送，只保留每秒一次的連線確認；人多、大家同時操作時比較不會塞車。'
  ],
  fix: [
    '<b>咖啡廳 NPC 變隱形、比較卡</b>：修正店裡有三位以上玩家時，NPC 客人和豆豆會突然消失、畫面卡頓的問題。現在大家同時進店、磨豆、洗杯、點餐，NPC 都會穩定留在畫面上。',
    '<b>咖啡廳換店長不再清空客人</b>：多人在店裡、店長交接的瞬間，客人不會再整批消失，會留在畫面上等下一次更新。',
    '<b>體重計點擊用不到</b>：修正在家裡直接點體重計，只會走到它上面、沒有反應的問題。現在點一下會走到旁邊面向它並站上去，跟按動作鍵一樣。'
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
