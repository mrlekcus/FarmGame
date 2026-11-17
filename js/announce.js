'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-17g',
  title: '遊戲店新增「賽車」，賽車要用夾盲盒收集',
  hero: {   // 大圖介紹：放在彈窗最上面；清單改收進「完整更新內容」
    badge: 'NEW　遊戲店新玩法',
    title: '街機賽車登場！',
    sub: '8 人同場，沒坐滿的位置由系統車手補上',
    views: [['img/race/view2d.jpg', '2D 俯視'], ['img/race/view3d.jpg', '3D 追尾']],
    tracks: [['img/race/track0.png', '雷克斯草原盃'], ['img/race/track1.png', '霧語沼澤盃'], ['img/race/track2.png', '星空夜流星盃']],
    cars: ['car:pump', 'car:milk', 'car:boat', 'car:cake', 'car:rock'],
    promo: ['img/race/npc-token.png', '每天免費 token：找遊戲店的機器人嗶嗶說話，按「確認」領 1 個'],
    points: ['坐上街機椅子，選「賽車」，按「準備！開賽」', '付費場第一名拿 token；每天找嗶嗶說話也能領 1 個', '新車用夾盲盒抽，火箭車用 200 張券兌換']
  },
  add: [
    '<b>遊戲店多了賽車</b>：坐上街機椅子後，先選「俄羅斯方塊」或「賽車」。賽車最多 8 人同場，沒坐滿的位置由系統車手補上，有人按「準備！開賽」就開始 5 秒倒數。',
    '<b>三條賽道隨機抽</b>：雷克斯草原盃、霧語沼澤盃、星空夜流星盃，每場開賽前用跑馬燈抽出，所有人跑同一條。',
    '<b>免費場和付費場</b>：免費場不扣 G、只是好玩；付費場 1000 G，第一名可得 token（和俄羅斯方塊共用「每天最多 1 個」）。',
    '<b>我的車庫</b>：大廳可以換車，也能切換 2D 俯視或 3D 追尾視角。',
    '<b>新車款要用夾盲盒抽</b>：一開始只有 3 台車。南瓜馬車、牛奶桶車在 1 號夾盲盒機，草莓蛋糕車、水陸小船在 2 號機（南瓜、草莓是傳說，牛奶、小船是稀有）。',
    '<b>火箭車</b>：只能用 200 張兌換券，在夾盲盒機的兌換券商店換。',
    '<b>賽車有背景音樂了</b>：大廳一首，三條賽道各一首，最後一圈音樂會稍微加快。大廳或比賽中按 Esc 都能換歌、調音量，也可以關掉。進賽車時農場自己的音樂會先暫停。',
    '<b>撿道具、漂移</b>：跑道上撿道具打對手，漂移加速；比賽途中離開或斷線，你的車會由系統接手跑完。開局後才坐下的人可以觀戰，下一場再加入。'
  ],
  chg: [
    '<b>坐下後先選遊戲</b>：遊戲店椅子坐下會先跳出選遊戲的小視窗（也可以按 1、2 選，或選「站起來」）。',
    '<b>玩賽車時頭上有小賽車泡泡</b>：同店的人看得到你在玩賽車。',
    '<b>每天免費 token</b>：每天第一次到遊戲店找機器人嗶嗶說話，在對話窗按「確認」可以領 1 個 token（每天 GMT+8 零點重置，持有滿 10 個時先用掉再領）。',
    '<b>重複獎品換到的券變多</b>：普通 3、稀有 6、傳說 12 張。'
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
