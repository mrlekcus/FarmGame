'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-07g',
  title: '寵物會跟你去朋友家；你不在線時寵物在家等朋友、迎接和互動；領養店要走進去才能領養',
  add: [
    '<b>寵物跟你去朋友家</b>：拜訪朋友時，你的寵物會一起進屋，同一間屋子裡的人都看得到。每隔一陣子會隨機換一種跟法：有時跟在你身後慢慢走，有時乖乖坐在你腳邊。',
    '<b>你下線後，寵物在家等朋友</b>：你不在線時，朋友來拜訪會看到你的寵物在家等著，位置每次隨機：角落的小墊子上睡覺、趴在飯碗或玩具旁打盹（家裡要有飯碗或玩具）、或坐在門墊旁看門。朋友一進門，牠就跑過去迎接，跳起來冒愛心；你在線時，朋友來拜訪，你的寵物也會開心迎接。',
    '<b>朋友可以和你的寵物互動</b>：面向寵物按動作鍵＝摸摸（牠會跳起來冒愛心，大家都看得到）；面向玩具按動作鍵＝陪牠玩，牠會跑去玩那個玩具；面向飯碗按動作鍵＝倒一份點心（用你自己背包裡的飼料），牠會跑去吃。屋主之後可以在「訪客記錄」看到誰摸了、陪玩或餵過牠。',
    '<b>領養店新增「回顧劇情」</b>：之前有些朋友因為 bug 直接領養了寵物，沒看到阿喵姊姊的小故事。現在走進領養店，按最下面的「回顧劇情」就能重看一次，不影響你的寵物，想看幾次都可以。',
    '<b>賣出清單顯示收購飽和</b>：魚、蟲、採集物的右邊多了一顆標籤，告訴你今天還能賣幾個原價（綠）、現在是 6 折還剩幾個（黃），或已經 3 折（紅，整列變淡），方便你挑值得賣的。凌晨 0 點重置。',
    '<b>寵物親密等級和才藝</b>：親密度現在分成 Lv.1～Lv.7，每升一級寵物學會一個新才藝：坐下、握手、轉圈圈、翻滾、愛心煙火、專屬舞蹈。在寵物資料卡點才藝，牠會當場表演，身邊的朋友都看得到。等級要靠每天慢慢照顧累積，最高級要長期陪伴。',
    '<b>寵物外出設定</b>：寵物資料卡可以選「留在家」、「貼身」（緊跟在身後）、「自由走動」（在你附近逛）。選留在家，牠只會在家裡等你。'
  ],
  chg: [
    '<b>領養店要走進去才能領養</b>：以前寵物店一完工，工地視窗就直接變成領養畫面。現在付完工錢後視窗會關起來，提示你「走進去找阿喵姊姊聊聊」。走進店裡、站到阿喵姊姊前面按動作鍵，第一次會先聽她說完一小段故事（門外的小腳印），聽完才能挑寵物領養。看過故事之後就不會再演，隨時可以按「略過劇情」。已經領養過的人不受影響。',
    '<b>領養店門口提示</b>：寵物店蓋好之後，門口的提示改成「按動作鍵走進去，找阿喵姊姊聊聊」。',
    '<b>寵物才藝表演更明顯</b>：坐下會壓扁坐在粉紅坐墊上；握手會舉起前爪，迎接一隻伸過來的手，碰到時冒閃光；翻滾會整隻真的轉圈，還揚起灰塵；愛心煙火會在天上放出彩色煙火，並有小愛心往上飄。身邊的朋友看到的也一樣。'
  ],
  fix: [
    '<b>五星成就可以置頂了</b>：五星釣手、五星捕蟲手、五星廚師、星光圖鑑王以前拿到了卻放不到名片的置頂格，現在可以放了，朋友看你的名片也看得到。'
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
