'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-27a',
  title: '盲盒家具有互動了、火車抓蟲團更順手',
  add: [
    '<b>盲盒機家具全部能互動了</b>：站在家具前按動作鍵。<b>迷你街機櫃</b>玩一場小遊戲、<b>霓虹招牌</b>換燈色（夜晚牆上會發光）、<b>手把地毯</b>走上去跳舞、<b>機器人玩偶</b>跟你說話、<b>冰淇淋燈</b>開關燈、<b>蛋糕桌</b>切蛋糕（每天補回）、<b>投幣存錢筒</b>投幣冒愛心（純裝飾，不碰金錢）。',
    '<b>能坐、能玩的盲盒家具</b>：<b>棉花糖椅</b>坐下會Q彈、<b>盲盒沙發</b>可以兩個人一起坐、<b>糖果地毯</b>走在上面會噴出糖果和星星、<b>迷你夾娃娃機</b>可以自己操作爪子夾娃娃（沒有獎品，純好玩）。同一間屋子的朋友也看得到燈色、蛋糕和各種動畫。',
    '<b>火車專屬背景音樂</b>：車廂和三個車站共用一首輕鬆的旅行音樂。',
    '<b>開團通知</b>：有人開火車團時，右上角會跳出招募卡片，可以直接按「加入」，跟出海團一樣。',
  ],
  chg: [
  ],
  fix: [
    '修正車廂和車站裡看不到其他玩家、聊天沒反應的問題；聊天頻道連不上時會自動重試並提示。',
    '修正第一次跟貓咪站長說話時劇情畫面卡住，以及重新進遊戲後直接跳到捐資源畫面、沒看到劇情的問題。',
    '山間站、夜行站、草原站左邊的月台已拿掉，鐵軌拉滿整排。',
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
