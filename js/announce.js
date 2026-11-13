'use strict';
/* 更新通告 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   每次更新只要改下面這一份 ANNOUNCE：v 換成新的版本代號（一個新字串就會讓大家再看到一次），三塊內容各寫幾行。
   玩家每個版本只會自動看到一次（按「知道了」後記在自己的瀏覽器），新通告會直接蓋掉舊的，不保留歷史。
   同一天的多次更新：內容全部保留、新的接在後面，只換 v 的字尾（b → c → d…）；隔天才整份重寫。
   不想彈窗時：把 v 設成 ''。 */
const ANNOUNCE = {
  v: '2026-11-13f',
  title: '廣場新開「遊戲店」（咖啡廳左邊的紫色方塊屋），店裡有 8 台街機和店員機器人嗶嗶，坐上椅子就能玩「俄羅斯方塊大亂鬥」（每場 100 G，純好玩沒有獎勵）',
  add: [
    '<b>🎮 廣場新開「遊戲店」</b>：咖啡廳左邊多了一間紫色像素方塊屋，屋頂上有一隻大手把。站在門口下面的大路上、面向門按動作鍵就能進去。<b>跟咖啡廳一樣是連線場景</b>：同在店裡的人看得到彼此、可以聊天比表情（店裡和廣場各聊各的）。',
    '<b>🕹️ 店內是霓虹夜光的街機廳</b>：兩排街機各 4 台，每台旁邊一張粉紅高腳椅，一共 <b>8 張椅子（一區最多 8 人）</b>。面向空椅子按動作鍵就會坐下並開啟遊戲；按任何方向鍵就起身離開座位。',
    '<b>🤖 店員機器人「嗶嗶」</b>：站在櫃檯後面，面向櫃檯按動作鍵會跟你說話。',
    '<b>🧱 俄羅斯方塊大亂鬥</b>：8 人同場、最後活下來的人獲勝。消行會把「垃圾行」打給對手，你被打到時左邊的紅色條會累積，自己消行可以先抵銷。<b>預設自動鎖定「上一個打你的人」</b>，也可以點上方對手的頭像換目標。玩法包含暫存、預覽下三個、鬼影落點、連擊與連續四排加成、全消加成。',
    '<b>🪑 開局流程</b>：按「準備」後倒數 5 秒，<b>同在店裡坐在椅子上的真人會一起打</b>（大家都按「準備」就同一場），沒坐滿的位置會自動補滿。<b>開局之後才坐下的人只能觀戰，等下一場再加入</b>；打輸了也可以留下來看完比賽。<b>每場入場費 100 G，倒數結束、正式開局時才扣</b>（倒數中取消不扣）；金幣不夠會提示「金幣不足」。<b>沒有任何獎勵、排行榜和稱號</b>，純粹好玩的金幣消耗。',
    '<b>📱 手機和電腦都能玩</b>：手機用手勢加左轉、暫存、直落三顆按鈕操作（橫放、直放都可以）；電腦用方向鍵（↑／X 右轉、Z 左轉、空白直落、C 暫存）。',
    '<b>🧸 夾娃娃機（預告）</b>：店裡左下角有兩台夾娃娃機，目前只是擺設，之後會開放。'
  ],
  chg: [
    '<b>👥 好友列表排序</b>：現在在線的好友排最前面，其餘依「最後上線時間」由近到遠排列。',
    '<b>📢 更新通告可以重看</b>：看過的通告現在能在「設定 → 更新通告 → 查看」隨時再打開。',
    '<b>🧱 俄羅斯方塊有打擊感了</b>：落地、直落、消行、被打到、擊倒都加了音效、畫面震動和爆裂特效（手機還會震動）。直落有殘影和塵土；消行會白閃爆開並頓一下，連續四排最誇張；打出去的攻擊會變成光彈飛向對手、命中時對手頭像會抖；被打到時紅條會震、盤面會被頂起來；方塊快鎖定時會漸漸變亮提醒。畫面左下角（手機在左上角）的 🔊 可以關掉音效和震動。',
    '<b>廣場擺設小調整</b>：遊戲店蓋在咖啡廳左邊的空地上，原本那裡的一張長椅已拆除，通往霧語沼澤的告示牌往左挪了一格；遊戲店正下方左邊的那張長椅也一起拆除了。',
    '<b>📱 俄羅斯方塊手機操作改成手勢</b>：<b>在螢幕任何位置都能滑</b>——左右滑動移動方塊、點一下右轉、往下滑下壓、快速往下甩直落（點上方對手頭像仍是換目標）；另外保留「左轉、暫存、直落」三顆大按鈕。手機直放時方塊盤放大了很多，橫放也稍微放大。<b>暫停功能已取消</b>，電腦的 P、Esc 也不再暫停。'
  ],
  fix: []
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
