'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-02f',
  title: '名片置頂成就改版、家具佈置即時同步、廚房菜單分類、出海準備鍵、新作物圖案',
  add: [
    '<b>烹飪成就</b>：新增「烹飪達人」（烹飪 Lv.5）和「烹飪大師」（烹飪 Lv.10）兩個稱號，在技能分類裡，也可以放到名片置頂格',
    '<b>置頂三格</b>：我的名片上方有 3 個固定格子，點一格選位置，再點下面的成就就能放上去；點格子上的 ✕ 可以取下',
    '<b>已獲得清單</b>：成就預設只列你已經拿到的，不用再一個分類一個分類找；上方的分類按鈕可以篩選，點進去也看得到還沒拿到的成就和進度',
    '<b>最近獲得</b>：剛拿到的成就會列在最上面，點一下就直接放上去',
    '<b>排序</b>：選到已放上去的格子時，可以用「往左／往右」調整順序',
    '<b>自動置頂</b>：打開開關後，新拿到的成就會自動換上第 3 格（設定存在這台裝置上）',
    '<b>佈置即時同步</b>：你在自己家擺家具、搬家具、轉方向、翻面、收起、賣掉，或是畫牆壁地板、搬門、擴建時，在屋子裡的朋友會馬上看到變化，不用再離開重進',
    '<b>廚房菜單分類</b>：左邊多了分類欄（最近煮的、全部、主菜、湯品、飲品、甜點），每道料理是一張卡片，一眼看得到材料夠不夠。另外有「只看能煮的」開關，能煮的料理也會排在前面',
    '<b>最近煮的</b>：廚房會記住你最後煮的那一道，打開廚房它就排在第一個，想再煮一次不用找',
    '<b>村民換種子</b>：找桂花婆婆、小茉、老鯉叔聊天，用採集物換蓮藕、藍莓、霜根的種子（只有當季換得到），三種新作物和七道新料理都靠它'
  ],
  chg: [
    '名片的等級列多了「烹飪」等級，好友看你的名片也看得到',
    '自己的名片不再需要先點分類才能置頂成就，好友看你的名片時畫面不變',
    '朋友待在別人家時，畫面每 15 秒會自動和屋主核對一次，萬一網路掉了一次通知也會補上',
    '<b>出海集合</b>：上船後的「準備」和「離開」（船長是「出發」）搬到畫面上方的倒數膠囊旁邊，直接按就好，不用再看下面的面板',
    '<b>碼頭開團日</b>：柴犬船長只在<b>星期一、三、五</b>開團出海（以 GMT+8 算星期）。其他日子不能開團，但可以加入 GM 招募的團'
  ],
  fix: [
    '在自己家佈置時，朋友要離開再進來才看得到新家具：已修好',
    '藍莓、蓮藕、霜根成熟時畫面都是南瓜：已換成各自的圖案',
    '蓮藕、藍莓種子換到之後種不下去（顯示等級不夠）：已修好，換來的種子不看農耕等級，種得下去',
    '出海成就（初次出海、老水手、海上傳奇、海釣圖鑑全收集、碼頭建設者）放不上置頂格：已修好，現在可以置頂，好友看你的名片也看得到',
    '名片成就列表太長時後面的成就被擠掉、看不到：已修好，整張名片往下捲就能看完全部成就',
    '置頂失敗時，提示只出現在名片最上面、往下捲就看不到：已修好，失敗會直接跳出提示'
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
