'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-04i',
  title: '碼頭留言板愛心＋留言＋撒種子、收成升級＋作物圖鑑＋★1～★5 品質＋五星慶祝改版＋作物成熟時間＋房屋擴建免等待＋鋤地與成就修正',
  add: [
    '<b>作物成熟時間</b>：農場上每株作物下面多了一條小進度條（綠色＝還在長，金色＝熟了）；面向還沒熟的作物，上面會跳出小卡，顯示名稱、進度百分比、還要多久、預計幾點成熟，還有水夠不夠（土是乾的時候會提醒要澆水）。',
    '<b>留言板愛心點贊</b>：點開碼頭留言板上的便利貼，可以按 ♡ 給它愛心，再按一次取消；每張便利貼每人只能給一顆，牆上每張便利貼的右下角會看到愛心數。',
    '<b>便利貼留言</b>：點開便利貼，下面可以留言回應，每則最多 30 字；每人一天可以留言 3 次，頁面上方會顯示今天還剩幾次。愛心和留言需要玩家 Lv.3 以上，等級還不夠的人可以先看。',
    '<b>撒種子、收成也能升級</b>：到小村村長家（園藝工坊）可以升級「撒種子」和「收成」，Lv.2 一次處理 3 格、Lv.3 一次 5 格（面向的方向排成一直線，和鋤頭、水壺一樣）。撒種子要先翻好土、種子夠才會種滿一排；收成會一次收掉那一排已經熟的作物。',
    '<b>作物圖鑑</b>：圖鑑多了「作物」分頁，收成過的作物會記下成熟時間、賣價和最高星級，農耕等級越高、收成前施過肥，越容易收到高星。',
    '<b>廚房星級</b>：廚房配方卡名稱下方的星星，改成顯示這道料理在圖鑑記錄到的最高品質（灰星＝還沒到），一眼就知道哪道還沒 ★5。',
    '<b>圖鑑品質</b>：釣到魚（含出海）、抓到蟲蝶、煮出料理時，會抽出這次的品質 ★1～★5，圖鑑會記下每一種的最高星。',
    '<b>怎麼出高星</b>：釣魚、捕蟲、烹飪等級越高越容易出高星；煮料理零失誤還有加成。',
    '<b>圖鑑畫面</b>：每一格和詳情都看得到最高星，各分頁上方有「★5 收集」進度。',
    '<b>五星驚喜</b>：每一種魚、蟲、料理第一次達到 ★5 時，畫面會稍微變暗，中間跳出金邊卡片，周圍有星星飄落慶祝一次（3.5 秒後自動關閉，點一下也可以關）。',
    '<b>附近的人看得到</b>：在廣場、船上等多人場景第一次達到 ★5，身上會發金光、頭上跳出「名稱 ★★★★★」，附近的玩家可以按「👏 拍手」，你會收到通知。',
    '<b>新成就</b>：五星釣手、五星捕蟲手、五星廚師、星光圖鑑王。'
  ],
  chg: [
    '<b>房屋擴建不用等了</b>：小村村長家的房屋擴建，不用再等 3 天，材料和金幣夠就可以馬上完成。',
    '<b>五星慶祝改得柔和</b>：不再是黑底加旋轉光芒蓋滿整個畫面，改成變暗不多的小卡片，比較不會嚇到人。',
    '<b>留言板同時可以貼 3 張</b>：自己板上最多同時 3 張（原本 2 張），每天還是可以貼 3 次；便利貼被撕掉或被新的擠掉時，上面的愛心和留言會一起消失。',
    '<b>銀星、金星取消</b>：作物改成跟魚、蟲、料理一樣的 ★1～★5 圖鑑品質，背包裡的作物不分星級、賣價不變；肥料也改成讓收成更容易出高星。',
    '星級只記在圖鑑，不會改變物品原本的顏色；背包物品不分星級，賣價不變。以前釣過、抓過、煮過的，再來一次就會補上星級。'
  ],
  fix: [
    '<b>船上拍手鍵</b>：出海時看到別人第一次 ★5，「👏 拍手」按鈕會出現在上方計時列的下面（以前被計時列蓋住看不到）；就算你正在釣魚（等魚上鉤）也看得到，只有搏鬥、收線的時候才暫時藏起來。',
    '<b>重複的提示</b>：釣到魚、抓到蟲時，星級只會補在捕獲卡片上，不會再另外跳出第二個有星級的提示。',
    '<b>留言板檢舉功能取消</b>：改成愛心點贊，不再有「檢舉」按鈕；不適當的內容請找 GM 處理。',
    '<b>鋤地</b>：修正農場有兩格（以前長樹的位置）用鋤頭鋤不下去、顯示「這裡不能耕種」的問題，現在跟其他草地一樣可以耕種。',
    '<b>料理圖鑑成就</b>：修正「料理圖鑑過半」「料理圖鑑全收集」「烘焙名師」「百份料理」放不上名片置頂格的問題，現在都可以置頂，好友打開你的名片也看得到。',
    '<b>置頂提示</b>：成就沒放上去的時候，名片上會直接說明原因，不會再默默放不上去。'
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
