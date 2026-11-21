'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-21g',
  title: '海底世界開放：一起把海洋變乾淨',
  hero: {
    badge: 'NEW', bg: 'linear-gradient(135deg,#3fb7c9,#2f6fe0)', title: '🤿 保護海底', sub: '隨時潛水・撿垃圾・一起把海洋變乾淨',
    promo: ['img/announce/ocean-reef.png', '全服一起撿，珊瑚和海龜越來越多'],
    points: ['到碼頭找柴犬船長按「潛水」', '撿垃圾、回收，換守護值、稱號和裝飾', '大件垃圾要 2 人以上合力拉起']
  },
  add: [
    '<b>🤿 新玩法「保護海底」</b>：到碼頭找柴犬船長按「潛水」，隨時下水。上面三層是窄窄的潛水通道，穿過沉船層，第 4 層會攤開成一整片大海。',
    '<b>撿垃圾、分類回收</b>：把海底的垃圾撿進回收袋（8 格），浮到水面的船邊分類丟進塑膠、金屬、漁網、其他四個桶子，分對才算。獎勵是守護值，之後會換稱號和裝飾，不給 G。',
    '<b>全服海底清潔度</b>：所有人一起撿，越乾淨珊瑚、魚群、海龜越多。藍洞 20%、沉船墳場 40%、發光洞 70% 才會開放；沒人撿的時候清潔度會慢慢往下掉。',
    '<b>大件垃圾</b>（廢漁網、廢輪胎、纏著海龜的網）要 2 個人以上一起按住才拉得起來，在場的人都有守護值；同一片海最多 20 人，會遇到其他玩家。',
    '<b>回水面</b>：深海平原有橘色浮標，按一下就回到水面。氧氣用完只是被拉回水面，什麼都不會掉。',
    '<b>海洋稱號</b>：守護值到 50 / 150 / 400 / 800 解鎖「海洋小幫手」「撿拾達人」「海灣守護者」「珊瑚之友」；解救 10 隻海龜得「海龜救星」，合力拉起 30 個大件垃圾得「合作潛水員」。稱號會顯示在名字前面，到柴犬船長的「海洋稱號與裝飾」或回收站選要戴哪一個。',
    '<b>潛水裝飾</b>：氣瓶、蛙鞋、面鏡的配色，珊瑚粉、海灣藍、海龜綠、黃金、夜光，用守護值或解救海龜解鎖。',
    '<b>潛水前的小劇情</b>：第一次按「潛水」，柴犬船長會拿出他年輕時的舊潛水鏡，說起以前乾淨的海。看完再下水；想重看，到船長選單按「📖 重看潛水劇情」。',
    '<b>潛水表情</b>：水裡按右下角的 😊 選表情（嗨、開心、讚、愛心、謝謝、疑問、加油、這裡有垃圾），電腦可以直接按鍵盤 1~8。同一片海的人都看得到，頭上會冒出表情。',
    '<b>全服動態</b>：水裡的左側會顯示有人解救海龜、清掉大件垃圾、拿到新稱號；全服清潔度第一次跨過 20% / 40% / 70% 時，所有人都會看到慶祝畫面。',
    '<b>裁縫鋪新增「🐑 羊毛縫製」</b>（玩家 Lv.8 開放）：用羊毛換羊毛服飾，只收羊毛，不收 G。第一次進裁縫鋪，桃子姊姊有一段小故事要跟你說。',
    '<b>4 件羊毛衣服</b>（每個顏色 10 個羊毛）：羊毛圍巾、羊毛披肩、羊羔毛外套、小綿羊連身裝。',
    '<b>4 頂羊毛帽子</b>（每個顏色 5 個羊毛）：小綿羊帽、毛絨耳罩帽、羊角捲毛帽、雲朵毛球帽。每款都有收藏家成就，集滿所有顏色就能拿。',
    '<b>甜菜、玉米、蜜瓜有料理了</b>：甜菜濃湯、甜菜蛋糕、玉米濃湯、烤玉米、蜜瓜冰沙、蜜瓜布丁，到廚房煮煮看。'
  ],
  chg: [
    '羊毛現在有用處了：牧場的小綿羊餵乾草後會產羊毛，用收成籃收，不用全部拿去賣。',
    '<b>寵物店的「回顧劇情」改成大按鈕</b>：領養店「其他」分頁裡，第一次相遇、擴建、衣帽間三段劇情各有一顆大按鈕，手機上更好按。'
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
