'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-09b',
  title: '廣場新開咖啡廳「暖木小木屋」',
  add: [
    '<b>佈置屋子時，頭上會出現小房子泡泡</b>：在自己家打開「布置模式」的時候，頭上會有一個紅屋頂小房子，旁邊的小星星會一閃一閃。同一間屋子裡的人（包括來拜訪的朋友）都看得到，關掉布置模式就消失。',
    '<b>☕ 廣場咖啡廳開張</b>：走到廣場紅圈的小木屋門口按動作鍵進去。坐高腳椅可以點美式咖啡、拿鐵、蜂蜜鬆餅，送到後會有喝下去的光環特效（只有畫面效果，沒有數值加成）；沙發和圓桌可以坐著休息，店員豆豆會幫你做。',
    '<b>當店員打工</b>：從吧台右邊的小門穿上圍裙，自己拿食材、磨豆（按住動作鍵）、用咖啡機和烤箱、洗杯，把餐點放到出餐口。送出一杯領飲料價格 10% 的薪水，每天（GMT+8 零點重置）最多 1000 G。你在操作間時，豆豆只負責洗杯和端餐。',
    '<b>多人一起逛咖啡廳</b>：大家看到同樣的顧客、豆豆和機器，也看得到彼此坐在哪、手上拿什麼，可以一起打工。',
    '<b>🎵 點唱機</b>：點店裡的音樂機可以從 5 首咖啡廳音樂選歌，全店的人聽到同一首、同一個位置。'
  ],
  chg: ['點餐會先扣款，送到才算付費；等太久或中途離開會自動退款。']
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
