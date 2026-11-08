'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-08e',
  title: '阿喵姊姊的劇情變成動態畫面；村莊故事有 CG，可以在布告欄重播；寵物才藝表演更明顯；名片可以看還沒解鎖的成就條件；書櫃可以看朋友的圖鑑；衣櫥可以存 3 套穿搭',
  add: [
    '<b>阿喵姊姊的劇情變成動態畫面</b>：第一次走進領養店（或按「回顧劇情」）時，對白上面會有一整幅像素 CG：從店外隔著窗戶看她擦窗的早晨、門口一個個冒出來的小腳印、飄向店門的愛心、門縫下伸進來的小爪子，最後門打開，白色柴犬、橘貓和黑貓探出頭。對白也會一個字一個字出現，按「繼續」可以直接補完這一句。劇情內容沒變。',
    '<b>名片可以看還沒解鎖的成就條件</b>：我的名片最下面的按鈕換成「未解鎖成就條件」，點開會依分類列出還沒拿到的成就、要怎麼拿，有數字可以算的（技能等級、釣到幾條魚、圖鑑收集、出海趟數、服裝收藏等）還會顯示進度條。原本的「等級與解鎖說明」移到這一頁最下面。',
    '<b>村莊故事有劇情 CG，也可以重播</b>：跟村長、桂花婆婆、老鯉叔、阿洛、小茉的章節對話，上面會多一幅動態像素 CG（炊煙、湯鍋蒸氣、池塘漣漪、礦坑燈火、烤糕香氣、種子發芽）。布告欄的「村莊故事」分頁變成回憶相簿：完成的章節是彩色縮圖，點哪章就重看哪章，也能按「從頭連播」；還沒解鎖的章節是暗色剪影。重播只是回味，不會再領一次獎勵，劇情內容也沒變。',
    '<b>書櫃可以看朋友的圖鑑</b>：到朋友家按書櫃的動作鍵，會打開他的圖鑑，看得到他解鎖了哪些魚、蟲蝶、料理和作物，還有每一種的最高星級。朋友有、你還沒有的會標「你還沒有」，也可以只看這些；點進去能看到怎麼取得（時間、季節、天氣、地點、材料等），自己的狀況會寫在最下面。在自己家按書櫃是打開自己的圖鑑，最上面可以選要不要開放給朋友看，預設開放，朋友看不到你的數量。',
    '<b>衣櫥多了「穿搭」分頁</b>：衣櫥（也包括鏡子和左上角的外觀按鈕）裡可以存 3 套穿搭，包含髮型、髮色、帽子、眼鏡、衣服和衣服顏色，不含性別和膚色。「穿上」會先套到預覽，按「完成」才真的換裝；還沒買到的款式照舊不能穿。'
  ],
  chg: [
    '<b>寵物才藝表演更明顯</b>：坐下會壓扁坐在粉紅坐墊上；握手會舉起前爪，迎接一隻伸過來的手，碰到時冒閃光；翻滾會整隻真的轉圈，還揚起灰塵；愛心煙火會在天上放出彩色煙火，並有小愛心往上飄。身邊的朋友看到的也一樣。',
    '<b>成就「玩家滿級」改名「玩家 Lv.10」</b>：之後玩家等級上限會再提高，所以改成直接寫等級，不會再誤會 Lv.10 就是最高。拿到的人不受影響，條件一樣是玩家等級達到 10。'
  ],
  fix: [
    '<b>雜貨攤賣東西不會再彈回最上面</b>：以前賣掉一種東西後，清單會跳回最頂端、選取也跳到第一項（要賣下面的東西得一直重新捲）。現在清單會停在原本的位置，賣光的那一項會自動選到它的下一項，可以連續往下賣。',
    '<b>手機上快捷列圖示、魚缸裡的魚偶爾暫時消失</b>：手機切到別的 App、轉向或記憶體吃緊時，會把小圖回收掉，造成快捷列變空、魚缸的魚不見，過一陣子才又出現。現在回到遊戲、轉向時會立刻重畫，平常也會自動補畫，不會再空白。東西本來就沒有真的不見。'
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
