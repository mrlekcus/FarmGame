'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-19g',
  title: '玩家 Lv.10 可以再領養第二隻寵物',
  add: [
    '<b>第二隻寵物</b>：玩家 Lv.10 起，到寵物店的寵物資料卡按「再領養一隻」，狗或貓都可以（領養費同第一隻，也可以兩隻同品種）。',
    '<b>兩隻各自獨立</b>：各自有名字、飽足、飯碗存量、親密度和每天的摸摸／玩耍次數；資料卡和寵物列上方可以切換要看哪一隻，也可以單獨改名、送回領養處。',
    '<b>兩隻都會跟著你</b>：在農場、小村、家裡都一起跟班；在家時兩隻會各自去玩玩具，不會擠同一個。朋友看到你時，也會看到你的兩隻寵物。',
    '<b>外出模式各自設定</b>：留在家、貼身、自由走動，兩隻可以分開選（在寵物列選好要設定的那一隻再按模式）。',
    '<b>朋友來家裡、才藝、互動也有第二隻</b>：你不在線時兩隻都會在家等朋友；第二隻表演才藝朋友看得到；聞一聞、追逐、傳球兩隻都會參加。',
    '<b>飯碗和玩具兩隻共用</b>：倒飼料時會倒給飯碗存量比較少的那一隻；面向玩具按動作鍵，會叫比較閒的那一隻過去玩。'
  ],
  chg: [
    '<b>第二隻要先擴建寵物店</b>：Lv.10 後再進寵物店，阿喵姊姊會說明店裡太擠；捐 100 木頭和 100 石頭擴建完成，才能領第二隻（有新劇情，也可以在店裡「回顧擴建劇情」重看）。',
    '<b>寵物衣帽間</b>：進寵物店會有新劇情；捐 100 木頭解鎖後，可以買帽子（草帽、小皇冠、巫師帽）和衣服（紅披風、條紋毛衣、黃雨衣），每件 500 G。每隻寵物各戴一頂帽子、穿一件衣服，在寵物店或寵物列都能換，朋友也看得到。',
    '<b>寵物玩具和飯碗每款只能買一個</b>：買了就是解鎖，不能賣回去（佈置時不會出現「賣出」）；衣服和帽子也是每件買一次，兩隻寵物可以穿同一件。',
    '<b>寵物店分頁整理</b>：分成「照顧、玩具、服飾、其他」四頁，不用在一長串裡找東西。',
    '<b>餵食、摸摸後寵物列不再自動關閉</b>，可以連續操作；朋友摸你的第二隻，你這邊的第二隻也會開心。'
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
