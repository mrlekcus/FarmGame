'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-24a',
  title: '火車站開通：火車抓蟲團',
  add: [
    '<b>🚂 新玩法「火車抓蟲團」</b>：廣場南邊的紅磚車站，找貓咪站長說話。開團日是星期二、四、六，每人每天最多開 3 次，票價和出海團一樣，一天內依序是第 1、2、3 次的價錢。',
    '<b>怎麼玩</b>：開團後先在車廂集合 5 分鐘，大家按「準備」，站長按「發車」。到站後每人 5 分鐘，拿捕蟲網面向蟲按動作鍵揮網。<b>每個人看到的蟲都是自己的，不用搶</b>；每一站有抓取上限（草原 10、山間 12、夜行 8）。',
    '<b>三個車站</b>：第 1 次開團去草原站，第 2、3 次去山間站，各有自己的蟲，也有只在火車上才抓得到的新蟲。跑到第 4 分鐘時伺服器會抽「神秘路線」，中籤的話會多開 5 分鐘，前往夜行站。',
    '<b>夜行站與傳說蟲</b>：夜行站有月光蛾、發光瓢蟲、藍光螢等夜間蟲，還有三隻傳說蟲（月神蝶、星河螢王、銀月獨角仙），機率很低。有人抓到傳說蟲，全服玩家都會收到提示。',
    '<b>沒蓋車站也能玩</b>：加入別人的團完全免費。想自己開團的人，要先把自己的車站蓋好：捐 <b>木頭 200、石頭 100、銅礦 30、金幣 10000</b>，每樣都可以分次捐，到站長那邊就能看到進度。',
    '<b>一起搭車</b>：車廂和各個車站裡，同一團的人看得到彼此，也能用聊天欄說話。',
    '<b>廣場的火車會真的開走</b>：只要有團出發，廣場車站的火車就會加速開走，全部結束後再倒車回站，所有人看到的時間都一樣。',
    '<b>貓咪站長的故事</b>：第一次找站長會聽到老車站的故事，車站蓋好時還有後半段。想重看，到站長面板按「重看劇情」。',
  ],
  chg: [
  ],
  fix: [
    '車廂內改成藍色車廂風格，而且車廂裡面不會再下雨了；山間站、夜行站、草原站左邊的月台拿掉，鐵軌拉滿整排，火車停在軌道上。',
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
function anHero(h) {
  if (!h) return '';
  const cars = (h.cars || []).map(k => { try { return '<img src="' + bbItemURL(k) + '" alt="" class="an-car">'; } catch (e) { return ''; } }).join('');
  return '<div class="an-hero"><div class="an-hb"><small>' + esc(h.badge || '') + '</small><b>' + esc(h.title || '') + '</b><span>' + esc(h.sub || '') + '</span></div>' +
    '<div class="an-views">' + (h.views || []).map(v => '<figure><img src="' + esc(v[0]) + '" alt=""><figcaption>' + esc(v[1]) + '</figcaption></figure>').join('') + '</div>' +
    '<div class="an-tracks">' + (h.tracks || []).map(v => '<figure><img src="' + esc(v[0]) + '" alt=""><figcaption>' + esc(v[1]) + '</figcaption></figure>').join('') + '</div>' +
    (cars ? '<div class="an-cars">' + cars + '</div>' : '') +
    (h.promo ? '<figure class="an-promo"><img src="' + esc(h.promo[0]) + '" alt=""><figcaption>' + esc(h.promo[1]) + '</figcaption></figure>' : '') +
    '<ul class="an-pts">' + (h.points || []).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>';
}
function anShow() {
  const sec = (cls, name, arr) => arr && arr.length ? '<div class="an-sec"><b class="an-t ' + cls + '">' + name + '</b><ul>' + arr.map(t => '<li>' + t + '</li>').join('') + '</ul></div>' : '';
  const list = sec('new', '✨ 新增', ANNOUNCE.add) + sec('chg', '🔧 調整', ANNOUNCE.chg) + sec('fix', '🐛 修正', ANNOUNCE.fix);
  anEl = document.createElement('div'); anEl.className = 'shop'; anEl.id = 'annc';
  anEl.innerHTML = '<div class="card an-card" tabindex="-1"><div class="shop-h"><h2>📢 更新通告</h2><span class="chip">' + esc(ANNOUNCE.v) + '</span></div>' +
    (ANNOUNCE.hero ? anHero(ANNOUNCE.hero) + '<details class="an-more"><summary>完整更新內容</summary>' + list + '</details>' : (ANNOUNCE.title ? '<p class="an-ver">' + esc(ANNOUNCE.title) + '</p>' : '') + list) +
    '<button type="button" class="btn wide" data-a="ok" style="margin-top:8px">知道了</button></div>';
  $('shop').parentNode.appendChild(anEl);
  anOpen = true; pressed.length = 0;
  anEl.addEventListener('pointerdown', e => e.stopPropagation());
  anEl.addEventListener('click', e => { if (e.target === anEl || e.target.closest('button[data-a="ok"]')) anClose(); });
  const b = anEl.querySelector('button[data-a="ok"]'); if (b) b.focus();
}
setInterval(() => {   // 登入進遊戲、沒有其他視窗開著、不是剛建角色時，這個版本第一次顯示
  if (anOpen || !ANNOUNCE.v || !ready || !me || authOpen || firstTime || paused() || scene === 'boat' || scene === 'train') return;
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
