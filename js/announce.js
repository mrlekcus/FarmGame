'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-22g',
  title: '海底世界開放：一起把海洋變乾淨',
  add: [
    '<b>🤿 新玩法「保護海底」</b>：到碼頭找柴犬船長按「潛水」，隨時下水。上面三層是窄窄的潛水通道，穿過沉船層，第 4 層會攤開成一整片大海。',
    '<b>撿垃圾、分類回收</b>：把海底的垃圾撿進回收袋（8 格），浮到水面的船邊分類丟進塑膠、金屬、漁網、其他四個桶子，分對才算。獎勵是守護值，之後會換稱號和裝飾，不給 G。',
    '<b>全服海底清潔度</b>：所有人一起撿，越乾淨珊瑚、魚群、海龜越多。藍洞 20%、沉船墳場 40%、發光洞 70% 才會開放；沒人撿的時候清潔度會慢慢往下掉。',
    '<b>大件垃圾</b>（廢漁網、廢輪胎、纏著海龜的網）要 2 個人以上一起按住才拉得起來，在場的人都有守護值；同一片海最多 20 人，會遇到其他玩家。',
    '<b>回水面</b>：深海平原有橘色浮標，按一下就回到水面。氧氣用完只是被拉回水面，什麼都不會掉。',
    '<b>海洋稱號</b>：守護值到 50 / 150 / 400 / 800 解鎖「海洋小幫手」「撿拾達人」「海灣守護者」「珊瑚之友」；解救 10 隻海龜得「海龜救星」，合力拉起 30 個大件垃圾得「合作潛水員」。稱號會顯示在名字前面，到柴犬船長的「海洋稱號與裝飾」或回收站選要戴哪一個。',
    '<b>潛水裝飾</b>：氣瓶、蛙鞋、面鏡的配色，珊瑚粉、海灣藍、海龜綠、黃金、夜光，用守護值或解救海龜解鎖。',
    '<b>潛水前的小劇情</b>：第一次按「潛水」，柴犬船長會拿出他年輕時的舊潛水鏡，說起以前乾淨的海。看完再下水；想重看，到船長選單按「📖 重看潛水劇情」。',
    '<b>藍洞漂流瓶</b>：清潔度到 20%，中間的藍洞開放，洞底每天有 1 個漂流瓶，每人每天能撿 1 個。先讀船長的 8 張日記，集齊得稱號「船長的老朋友」；之後每天撿到海洋小知識，也有一點守護值。日記可在「海洋稱號與裝飾」裡重看。',
    '<b>藍洞新玩法</b>：洞裡有上升的氣泡流，踩進去會被快速帶回水面，當作回程捷徑；洞口上方偶爾有鯨魚、魔鬼魚游過。',
    '<b>沉船墳場</b>（清潔度 40%）：大件垃圾換成船錨、鐵鍊、艙門，要 3 個人一起拉；清掉殘骸後沉船上會長出珊瑚，拉開的人會撿到「沉船古物」（共 6 件，在稱號與裝飾裡看收藏）。',
    '<b>發光洞</b>（清潔度 70%）：珊瑚平時是暗的，全服每回收一件垃圾就多點亮一點；穿夜光裝備的潛水員會真的發光。亮到一半出現發光魔鬼魚，全亮還有發光鯨，並且能按 📷 拍照留念。',
    '<b>海底生物變多了</b>：新增小丑魚、藍倒吊、蝴蝶魚、河豚、海馬、魟魚、小鯊魚（不咬人）、章魚、螃蟹、海星、海膽、海葵。越乾淨，出現的種類越多，淺層、深海平原、藍洞、沉船墳場各有各的住客。',
    '<b>海洋圖鑑</b>：靠近生物就會記進圖鑑，共 16 種，每種第一次 +4 守護值。在「海洋稱號與裝飾」裡的「📖 海洋圖鑑」可以看，還沒看到的會提示去哪裡找。集滿拿稱號「海洋觀察家」（金色）。',
    '<b>手機潛水改版</b>：畫面鋪滿整個螢幕（直拿、橫拿都是），左半邊按住拖曳就出現搖桿，右下是大動作鈕。電腦版不變。',
    '<b>潛水表情</b>：水裡按右下角的 😊 選表情（嗨、開心、讚、愛心、謝謝、疑問、加油、這裡有垃圾），電腦可以直接按鍵盤 1~8。同一片海的人都看得到，頭上會冒出表情。',
    '<b>全服動態</b>：水裡的左側會顯示有人解救海龜、清掉大件垃圾、拿到新稱號；全服清潔度第一次跨過 20% / 40% / 70% 時，所有人都會看到慶祝畫面。',
  ],
  chg: [
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
