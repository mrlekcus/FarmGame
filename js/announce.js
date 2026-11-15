'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-15f',
  title: '商店數量、衣櫥轉向、牧場音樂和 NPC 新造型',
  add: [],
  chg: [
    '<b>商店買賣的數量</b>：數量一開始是 0，下面的 1／5／10 按一次就加上去（按 10 就是 +10），「最大」還是直接設成上限，旁邊新增「清空」可以一鍵把數量歸 0。',
    '<b>衣櫥轉向左右</b>：以前整張圖轉過去會變成上下疊的抽屜，很奇怪；現在轉向時會變成一扇門開一條縫，看得到裡面掛著彩色衣服（轉向的兩個方向，開的門左右相反）。',
    '<b>牧場小屋（雞舍、牛羊那間）</b>：裡面的背景音樂改成跟農場一樣。',
    '<b>NPC 新造型</b>：遊戲店的機器人嗶嗶換成愛心螢幕的新款；神廟的廟祝換成瓜皮帽、馬褂、掛念珠的白鬍老爺爺；教堂的神父換成白袍紫帶、頭上有小光環。'
  ],
  fix: [
    '<b>俄羅斯方塊看不到其他玩家</b>：改成免費／付費後，免費場完全不連線，大家互相看不到；現在兩種場都會連線，同一種場的真人會一起對戰（免費場沒有 token），免費、付費按鈕上還會顯示有幾個人。',
    '<b>俄羅斯方塊觀戰</b>：觀戰者（包括自己被淘汰後）現在也算「對戰中」，剛進來的人才看得到這場並能旁觀，不會再誤開第二場；不同種場的對局也不會互相串到。'
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

/* 設定裡的「更新通告 → 查看」：看過的通告可以隨時再打開 */
{
  const b = $('st-annc');
  if (b) b.addEventListener('click', () => {
    if (anOpen) return;
    if (typeof closeSettings === 'function') closeSettings();
    anShow();
  });
}
