'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-15q',
  title: '咖啡廳牌桌、打小人小遊戲和其他調整',
  add: [
    '<b>咖啡廳新增牌桌（UNO 類型牌局）</b>：左下角兩張咖啡桌換成一張綠色牌桌，坐上任一個座位就開始。最多 4 人，空位由電腦補位，真人坐下會接手電腦的牌、離開時換回電腦；30 秒沒出牌會自動幫你抽牌或略過。出牌剩一張前要先按「UNO！」；沒喊的話，其他人（含電腦）在下一位出牌前按「抓！」就能讓他罰抽 2 張，自己也能趕快補喊。目前免費。坐下後要按「準備」，大家都準備好才倒數 3 秒開局（還沒準備時看得到別人陸續坐下），空位才由電腦補。牌桌換成圓形綠絨桌配木椅，牌局畫面也是圓桌加木椅。電腦出牌放慢，輪到誰頂端會有整條橫幅、頭像金色圈圈和思考倒數條。喊 UNO 會有爆炸字幕和音效，抓到沒喊 UNO 的人會出現紅色準星和「GOTCHA!」；牌局畫面右上角可以關掉音效。牌局頭像改成每個玩家自己的角色，修掉輪到誰時畫面一直彈跳。站著點牌桌可以觀戰：看得到每個人的手牌數但看不到內容，觀戰者的角色會站在畫面四角當觀眾，下方顯示觀戰人數。玩家和觀戰者都能按「💬」送表情和快捷話，頭上會冒出泡泡。手機直式、橫式都能玩。',
    '<b>神廟「打小人」變成小遊戲</b>：一次 10 G、不限次數。先選或寫下小人的名字，狂點（或按空白鍵）用拖鞋連打，氣勢打光後蓄力打三下（停在綠色區是暴擊），最後把小人丟進火盆燒掉。玩的時候，同一間神廟裡的人會看到你頭上冒出紙人泡泡。打完可以從三種表情（退散光環、舒爽、小火苗）挑一個，頭上顯示 30 分鐘。',
    '<b>神廟敲木魚</b>：在蒲團上跪著時，再按一次動作鍵會換成敲木魚，之後每按一下敲一次、功德 +1（每天重新計算），身旁有木魚、頭上有「功德 N」牌（超過 999 顯示 999+），敲的時候有木魚聲，旁邊的人看得到也聽得到。要起身按方向鍵。'
  ],
  chg: [
    '<b>換髮型／帽子／眼鏡／衣服</b>：每個款式各自記住自己的顏色。A 衣服選了青色，換去 B 衣服選別的顏色，再換回 A 還是青色；B 的顏色不會影響其他款式（縮圖也是各自的顏色）。',
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
