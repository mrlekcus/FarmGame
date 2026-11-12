'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-12c',
  title: '雜貨攤加入每日收購飽和（補償 3000 G 到信箱領）；寵物玩具不再被擠到玩不了；送禮修正',
  add: [
    '<b>💰 信箱可以收到金幣</b>：有些信會附「💰 附贈金幣」，打開信按「領取」才會入帳；沒領的信不能刪除。',
    '<b>🎁 這次的補償</b>：為了感謝大家體諒收購新制度，全服每人補償 <b>3000 G</b>，已經寄到信箱。按 M 打開信箱，打開「收購新制度」那封信，按「領取」就會入帳。'
  ],
  chg: [
    '<b>🛒 雜貨攤加入「每日收購飽和」</b>：每一種東西，每天前 10 個原價收購，第 11～20 個 6 折，第 21 個起 3 折，每天凌晨 0 點重置。所有賣給雜貨攤的東西都適用：作物、料理、魚、蟲、採集物、雞蛋、羊毛、牛奶、石頭和礦石…（以前只有魚、蟲、採集物，而且是 5／10）。',
    '<b>🛒 不受影響的</b>：交布告欄委託、做料理、送禮都不會降價。每種東西各自計算，蘿蔔賣滿 20 個不會影響番茄；「全部賣出」也一樣照這個算。',
    '<b>🛒 商店會顯示還能賣幾個</b>：每種東西旁邊有「原價 ×N／6 折 ×N／3 折」的標籤；背包存貨很多的話，建議分幾天慢慢賣，比一次全賣划算。',
    '<b>🐾 寵物玩具的動作變小了</b>：玩具籃、貓跳台、拔河繩與毛線球、條紋隧道的所有玩法，現在都縮在玩具旁邊那一格裡，不會再跑到好幾格外。房間小、玩具旁邊只剩一點空位也玩得到。',
    '<b>🐾 寵物找位置更有彈性</b>：牠會依序找玩具的右邊、左邊、下面、上面哪一格走得到，動作也會跟著左右翻轉；四周都被擋住時，就直接待在玩具那一格上玩，不會再說「走不到這個玩具旁邊」。',
    '<b>🐾 條紋隧道的玩法改了</b>：「鑽隧道」改成從自己站的那一邊鑽進去、再從同一邊出來；「衝出隧道」也是衝到站的那一格；旁邊完全沒空位時，只做「躲貓貓」，躲在隧道後面探頭。',
    '<b>🎁 稀有、傳說的魚和蟲蝶不能當禮物送</b>：名片送禮和信箱附禮物的選單都看不到它們了，作物還是都可以送。',
    '<b>🎁 信箱附禮物和名片送禮改成一起算</b>：每天最多 3 份，兩邊加起來算；以前各算各的，等於可以送到 6 份。'
  ],
  fix: [
    '<b>寵物玩具玩不到</b>：修正家裡空間有限時，寵物因為站不到位置、或動作範圍太大而一直玩不到玩具（自己在家玩、你按動作叫牠玩、朋友來訪陪牠玩都一樣）。',
    '<b>自由走動時寵物玩到一半被打斷</b>：寵物設定成「自由走動」（或待在家）時，你走動不會再讓牠正在玩的玩具、正在做的把戲中斷，會讓牠做完。設定成「貼身」時還是會馬上跟著你。',
    '<b>沒送禮卻說「今天已經送 3 份」</b>：信箱附禮物以前是用「過去 24 小時」算，跟名片送禮的「每天」不一致，昨晚送的也會擋到今天。現在統一照每天重置算。',
    '<b>信箱附禮物帶著舊的選擇</b>：選過的禮物用完或賣掉後，下拉雖然跳回「不附禮物」，寄出時卻還偷偷附上，現在會一起清掉。'
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
