'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-06f',
  title: '旅行商人米羅換新造型；電視轉向不再倒過來；沙發、跑步機轉向後也能用；村民全面換上精緻新造型；寵物領養店介面重做；修正在門口一直按到寵物；朋友可以摸你的寵物',
  add: [
    '<b>朋友可以摸你的寵物</b>：在廣場或家裡，面向朋友的寵物按動作鍵就能摸摸牠。寵物會開心跳起來、飄出愛心，你頭上也冒小愛心，附近的朋友都看得到。你自己在資料卡按「摸摸」時，朋友也會看到寵物跳一下、飄愛心。朋友摸只有表情和愛心，不會增加親密度，也沒有次數限制。'
  ],
  chg: [
    '<b>旅行商人米羅和他的攤位換新造型</b>：米羅換成和村民一樣精緻的畫法——衣服有亮暗面、眼睛有高光會眨眼、有腮紅，背包上的地毯捲加了花紋，還多了一條紅圍巾；攤位的遮陽篷有了亮暗面和波浪邊，桌上擺著地毯捲和小罐子。商人視窗裡的頭像也一起換了。',
    '<b>電視轉向不再倒過來</b>：以前電視轉 180 度會整台上下顛倒。現在轉 180 度會看到電視的背面（有散熱孔和小燈），轉 90／270 度會變成側面，螢幕朝左或朝右。轉過去之後不會顯示頻道畫面，但還是可以按動作鍵換頻道、也看得到朋友換的頻道；螢幕會依頻道閃出不同顏色的光（卡通粉藍、烹飪暖橘、釣魚水藍、天氣依晴雨變色、今日情報藍），並在螢幕前面灑一層淡淡的光。',
    '<b>沙發、跑步機轉向後也能用</b>：以前家具轉過方向，沙發和跑步機就不能坐、不能用。現在人會跟著家具的方向——沙發面向電視（轉 180 度）就背對你坐，側放（轉 90／270 度）就側著坐，兩個人還是可以並排；跑步機橫放時，人站在跑步帶正中間，臉朝控制台的方向往前跑（控制台在左就朝左、在右就朝右）。朋友和來拜訪的人也看得到。其他站著用的器材（沙包、壺鈴、深蹲架）和淋浴間、體重計還是要轉回原位才能用。',
    '<b>村民新造型</b>：小村和森林的 5 位村民，以及造型店、裁縫鋪、家具店的 3 位師傅，全部重新畫過，細緻度和阿喵姊姊一樣——衣服有亮暗面、眼睛有高光和腮紅、有手和腳，還會偶爾眨眼。每個人有自己的招牌配件：橡果村長戴橡果帽、留白鬍子、拄拐杖；桂花婆婆髮髻上別著花、戴眼鏡；老鯉叔戴草帽、扛釣竿；阿洛戴礦燈安全帽、拿鎬子；小茉綁藍蝴蝶結、拿牛奶瓶；桃子姊姊綁粉紅雙蝴蝶結、頸上掛捲尺；阿剪師傅有側分瀏海、拿剪刀；阿杉師傅戴綠帽、留大鬍子、拿鎚子。',
    '<b>領養店介面重做</b>：寵物狀態變成資訊卡，有飽足和親密的進度條、飯碗存量和背包飼料數；飼料是一列商品，旁邊直接按 ×1、×10 購買；寵物家具改成帶圖的卡片，還沒買的排前面，買過的標「✓ 已擁有」，錢不夠的價格會變紅。「送回領養處」縮成下方小字，不容易誤按。領養店裡的「摸摸」按鈕拿掉了（摸摸請用右邊快捷列的「🐾 寵物」資料卡）。',
    '<b>自己寵物的互動集中到資料卡</b>：面向自己的寵物按動作鍵、或用手指點自己的寵物，都不會再有反應；摸摸、餵食都在「🐾 寵物」資料卡裡。',
    '<b>對話與店鋪頭像</b>：配合新造型，村民對話視窗和店鋪店員的頭像畫布加高了一點，帽子和髮髻不會再被切掉。'
  ],
  fix: [
    '<b>門口一直按到寵物</b>：以前寵物跟在身邊時，站在門口、面向門按動作鍵，常常按到寵物而進不了門（點門也一樣）。現在寵物不會再擋住動作鍵和點擊，可以順利進門、對話和互動。'
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
