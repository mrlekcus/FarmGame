'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-10c',
  title: '咖啡廳的村民客人現身了',
  add: [],
  chg: [
    '<b>🛒 雜貨攤數量按鈕</b>：買賣視窗的 1、5、10 按鈕改成「直接設成那個數量」（原本是 +1、+5、+10 累加）。想多賣一點可以再按 + 或直接輸入數字。',
    '<b>🧑‍🌾 村民更常來咖啡廳，而且更容易一起來</b>：取消「村民之間至少隔 5 分鐘」的限制。現在店裡一位村民都沒有時，每位新客人約 12% 機會是村民；已經有一位時，約 45% 機會再來第二位；有兩位時還有機會來第三位，店裡最多同時三位村民。人多的時候他們會互相搭話。'
  ],
  fix: [
    '<b>碼頭留言板</b>：換裝置或切回遊戲時會自動重讀最新內容，不再停在舊畫面；讀取失敗會顯示提示；資料刷新時不會點到別張便利貼；自己的留言名字後面會標示「（我）」。',
    '<b>咖啡廳村民看不見</b>：修正村長、婆婆、老鯉叔、阿洛、小茉、桃子姊姊、阿剪師傅、阿杉師傅、米羅走進咖啡廳當客人時，畫面上沒有人影、只看得到對話泡泡和聊天紀錄的問題。現在會用村裡的樣子正常畫出來。'
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
