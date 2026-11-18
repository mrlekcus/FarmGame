'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-18a',
  title: '寵物店新增 4 款玩具，玩具可以重複購買',
  add: [
    '<b>4 款新玩具</b>（狗貓都能玩）：啾啾小鴨、藍色飛盤、肉球磨爪板、泡泡機，都是 1×1，在寵物店的「寵物家具」買，擺在自己家裡，寵物閒著就會自己去玩。',
    '<b>每款 3 種玩法，隨機挑一種</b>：小鴨＝叼起來甩／啃咬／踩到啾啾叫；飛盤＝叼著小跑／頂在頭上／繞著打轉；磨爪板＝站起來磨爪／躺著抓／蹭臉；泡泡機＝追泡泡／咬泡泡／被泡泡嚇一跳。面向玩具按動作鍵，也能叫寵物馬上過去玩。'
  ],
  chg: [
    '<b>玩具可以重複購買</b>：買過的玩具不會再被鎖住，想擺幾個就買幾個，商店會顯示「已有 ×幾個」。飯碗還是一人一個。'
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
