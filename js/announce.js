'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-05h',
  title: '寵物系統上線：領養狗狗、貓咪，寵物家具、表情和玩具動作；廣場新增露營烹飪區',
  add: [
    '<b>寵物領養店</b>：小村右邊新增寵物領養店。一開始是工地，每位玩家各自蓋自己的寵物店：要湊木頭 150、石頭 150、銅礦 15，每天最多捐木頭 50、石頭 50、銅礦 5，材料齊了再付 10000 G 完工，最快要 3 天，進屋找阿喵姊姊就能領養。',
    '<b>領養寵物</b>：有 11 種外觀可選——柴犬（赤、黑、白）、柯基、黃金獵犬，以及橘貓、虎斑、黑貓、白貓、三花貓、暹羅貓。領養費 1000 G，取個 1～8 個字的名字，一人一隻，也可以送回領養處。',
    '<b>跟班寵物</b>：領養後牠會跟在你身後，在農場、小村、森林、廣場和自己家裡都看得到；站著不動太久還會睡著。在廣場和別人家，大家也看得到彼此的寵物。',
    '<b>上線迎接</b>：每次上線，寵物會馬上出現在你身邊並迎接你，四種動作隨機一種——遠處衝過來撲、原地蹦蹦跳、睡醒驚喜、繞著你轉一圈。修正：以前要走到小村寵物才會出現。',
    '<b>阿喵姊姊新造型</b>：領養店店員換成大眼睛雙馬尾的可愛造型，會眨眼、馬尾會甩動。',
    '<b>領養前小劇情</b>：寵物店蓋好後，第一次進屋找阿喵姊姊說話，會先演一小段「窗外的腳印」劇情（只演一次，可略過），演完才開放領養。',
    '<b>照顧寵物</b>：右邊快捷列有一顆「🐾 寵物」鈕（領養後才會出現，手機在 ☰ 選單裡），點開中間跳出資料卡（按摸摸或餵食後資料卡會自動關閉，方便看牠的反應）：親密度、飽足條、飯碗份數、今天還能得幾次親密，下面有摸摸、餵食兩顆鈕。點寵物本身只會讓牠開心一下，不會再誤彈出視窗。電腦版右邊的快捷列也改成一顆「☰ 選單」鈕，點開是三欄的四方小窗，選完自動收起。摸摸每天 5 次、玩耍每天 3 次有親密度，飽足 12 小時封頂。',
    '<b>寵物飼料</b>：到寵物店購買，一份 10 G，耐飽 6 小時，放在背包裡。直接餵牠，或倒進家裡的飯碗。',
    '<b>寵物家具</b>：寵物店新賣五件家具，買了放進背包，再擺進自己家裡：木托盤雙碗 300 G、玩具籃 500 G、貓跳台 800 G、拔河繩與毛線球 600 G、條紋隧道 800 G。',
    '<b>飯碗</b>：在家裡面向飯碗按動作鍵，把背包的飼料倒進去（最多存 3 份），牠餓了會自己去吃。',
    '<b>玩具動作</b>：牠在家閒著會自己跑去玩玩具，面向玩具按動作鍵也能叫牠馬上過去。每種玩具有 3 種玩法，隨機發動：玩具籃（叼球甩頭、追球、翻肚打滾）、貓跳台（爬上頂層、抓柱磨爪、跳上跳下）、拔河繩與毛線球（拔河、撲毛線球、滾毛線球）、條紋隧道（鑽隧道、躲貓貓、衝出隧道）。每天前 3 次玩耍會增加親密度，之後牠還是會玩，只是不再加親密度，玩完會冒汗表示累了。',
    '<b>寵物表情</b>：頭上會冒出 12 種表情氣泡——愛心、好吃、肚子餓、想睡、開心、驚訝、好奇、玩累了、不爽、想玩、親密升級、發呆。',
    '<b>廣場露營烹飪區</b>：廣場左下角新增露營區，有篝火吊鍋、切菜料理檯、烤肉架三個烹飪工具，旁邊還有帳篷和提燈。',
    '<b>露營木墩</b>：帳篷旁邊有 3 個木墩，面向它按動作鍵就能坐下，朋友也看得到你坐在哪；按方向鍵或動作鍵起身。可以三個人並排坐著聊天。',
    '<b>在廣場煮菜</b>：走到烹飪工具旁邊，面向它按動作鍵，就會打開料理選單；煮法跟家裡的廚房灶台一樣（按住加熱、進綠區放開，共三段），不用自己家裡有灶台。需要的烹飪等級、材料、經驗和圖鑑品質都和在家煮一樣；走開或移動就會取消，材料不會消耗。'
  ],
  chg: [
    '<b>小村右邊的樹</b>：為了蓋寵物領養店，領養店旁邊原本的 1 棵樹移走了。',
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
