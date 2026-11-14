'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-14i',
  title: '遊戲店開放「夾盲盒機」和「兌換券商店」；廣場新增「福神廟」和「小教堂」',
  add: [
    '<b>夾盲盒機（遊戲店左下角）</b>：店裡左下角的兩台機器現在開放了，左邊是 <b>1號機・街機電玩</b>、右邊是 <b>2號機・糖果甜點</b>，面向機器按動作鍵就能玩。<b>每次夾要 1 個 token</b>。按「夾取」後爪子會自動左右來回掃，看準位置按「停」（電腦可用<b>空白鍵或 Enter</b>）爪子就夾下去，盲盒送進出口後有開盒演出（點一下可以跳過）。',
    '<b>獎品</b>：每台機器各有 12 種獎品（家具、服裝、髮型、帽子），分普通 70%、稀有 28%、傳說 2%。<b>保底</b>：連續 5 次沒中稀有以上，第 6 次必中稀有；連續 30 次沒中傳說，必中傳說。機台畫面下方有保底進度條，按「獎品一覽」可以看這台全部獎品的圖、機率和你有沒有。獎品<b>只能抽、不能賣</b>。',
    '<b>怎麼拿 token</b>：每天最多拿 1 個（凌晨 12 點換日），最多存 10 個。<b>遊戲店的俄羅斯方塊分兩種場</b>：「免費」只跟 Bot 玩、純好玩沒有 token；「付費 1000G」可以連線真人，<b>第一名得 1 個 token</b>。大廳會直接寫「今天還能拿 1 個 token」或「今天已經拿過了」。',
    '<b>兌換券</b>：抽到已經有的獎品會變成兌換券（普通 1 張、稀有 2 張、傳說 4 張）。在機台畫面按「券」進商店：<b>5 張換 1 個 token</b>（每週最多 3 次）；<b>1 張換資源</b>（木頭 8、石頭 4、銅礦 2，每週各有限量）；還有 6 件<b>只能用券換</b>的特別兌換品：投幣存錢筒、爪爪髮夾、盲盒頭套、盲盒沙發、迷你夾娃娃機、盲盒連身裝。',
    '<b>音效</b>：夾盲盒有投幣、夾起、掉落、開盒、揭曉的音效，傳說會有特別華麗的聲音（音量跟遊戲的音樂音量走，調到 0 就靜音）。',
    '<b>福神廟（廣場噴泉右邊，教堂的右側）</b>：走到門口按動作鍵進去。<b>籤筒</b>每天免費求一次籤（24 首，有今日宜忌）；<b>香爐</b>上香 10 G，從 6 種小記號（香煙、福字紅包、蓮花、金元寶、平安符、愛心＋香）選一個，頭旁邊會冒出來，持續 30 分鐘，其他玩家看得到；面向廟下方一排 10 個<b>綠色蒲團</b>按動作鍵可以<b>跪下拜拜</b>（頭上會隨機冒出默念、金光或香煙其中一種，一直維持，其他玩家看得到；再按動作鍵或方向鍵起身）；右邊小桌可以<b>打小人</b>（100 G，只能打想像中的對象，文字只在自己的畫面）。',
    '<b>小教堂（廣場噴泉右邊，福神廟的左側）</b>：<b>神父</b>每天一句祝福語；<b>長椅</b>面向它按動作鍵就能坐下（背對、面向祭壇，頭上隨機冒出小十字、默念或羽毛其中一種，一直維持，其他玩家看得到），再按一次或按方向鍵起身；<b>祈福台</b>可以寫祈福卡給好友（每天 3 次，同一人一天一次，對方收到 20 G、你得到 5 G）；<b>蠟燭架</b>點一支許願蠟燭（免費，每天重置）。',
    '<b>背景音樂</b>：福神廟和小教堂裡面各有自己的背景音樂（音量跟遊戲音樂音量走，調到 0 就靜音）。'
  ],
  chg: [
    '<b>福神廟的背景音樂換了一首新的</b>（音檔名稱不變，更新後重新整理就會聽到）。',
    '<b>廣場的路燈全部拿掉了</b>：噴泉周圍的 6 盞路燈很擋路，已經刪除，走起來順很多。',
    '<b>塔羅屋</b>：從小攤換成一間帳篷屋，搬到廣場噴泉正北邊，沙路也接到了門口；原本攤位和附近的幾棵樹已經移除。進去的方式不變，走到門口按動作鍵。',
    '<b>遊戲店的俄羅斯方塊</b>：原本每場 100 G 改成分「免費」和「付費 1000G」兩種場；免費場只跟 Bot 玩，付費場才能連線真人並有機會拿 token。',
    '<b>遊戲店的夾娃娃機</b>：原本的擺設換成夾盲盒機。',
    '<b>木頭有賣價了</b>：木頭以前賣不出去，現在跟石頭、銅礦一樣可以賣。'
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

/* 設定裡的「更新通告 → 查看」：看過的通告可以隨時再打開 */
{
  const b = $('st-annc');
  if (b) b.addEventListener('click', () => {
    if (anOpen) return;
    if (typeof closeSettings === 'function') closeSettings();
    anShow();
  });
}
