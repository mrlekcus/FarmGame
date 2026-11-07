'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-08',
  title: '阿喵姊姊的劇情變成動態畫面；寵物才藝表演更明顯；名片可以看還沒解鎖的成就條件',
  add: [
    '<b>阿喵姊姊的劇情變成動態畫面</b>：第一次走進領養店（或按「回顧劇情」）時，對白上面會有一整幅像素 CG：從店外隔著窗戶看她擦窗的早晨、門口一個個冒出來的小腳印、飄向店門的愛心、門縫下伸進來的小爪子，最後門打開，白色柴犬、橘貓和黑貓探出頭。對白也會一個字一個字出現，按「繼續」可以直接補完這一句。劇情內容沒變。',
    '<b>名片可以看還沒解鎖的成就條件</b>：我的名片最下面的按鈕換成「未解鎖成就條件」，點開會依分類列出還沒拿到的成就、要怎麼拿，有數字可以算的（技能等級、釣到幾條魚、圖鑑收集、出海趟數、服裝收藏等）還會顯示進度條。原本的「等級與解鎖說明」移到這一頁最下面。'
  ],
  chg: [
    '<b>寵物才藝表演更明顯</b>：坐下會壓扁坐在粉紅坐墊上；握手會舉起前爪，迎接一隻伸過來的手，碰到時冒閃光；翻滾會整隻真的轉圈，還揚起灰塵；愛心煙火會在天上放出彩色煙火，並有小愛心往上飄。身邊的朋友看到的也一樣。',
    '<b>成就「玩家滿級」改名「玩家 Lv.10」</b>：之後玩家等級上限會再提高，所以改成直接寫等級，不會再誤會 Lv.10 就是最高。拿到的人不受影響，條件一樣是玩家等級達到 10。'
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
