'use strict';
/* 神廟與教堂 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   廣場噴水池右邊並排著教堂（白色鐘樓，門 CHD 一格）和神廟（紅柱金瓦，門 TPD 兩格），位置見 world.js 的 TPB／CHB。
   站在門下面那排面向上按動作鍵進去（scene = 'temple' / 'church'，16×16 格；美術是 art/temple-church.js 的整張底圖，場景裡的擺設用 tcObjs 查）。
   【神廟】籤筒：每天免費求 1 次籤（24 首，後端 tc_draw 抽）｜香爐：10 G 上香，選 6 種表情之一，30 分鐘 buff，其他玩家看得到（沿用外觀 buff 的同步，種類 tp_a／b／c／d／f／j）｜
          打小人：100 G，只能打「想像的對象」（文字只在自己畫面，不送給任何人）｜廟祝、神像：聊天。
   【教堂】神父：每天一句祝福語（前端用日期算，不用後端）｜祈福台：寫祈福卡給好友（每天 3 次，同一人一天一次，對方 +20 G、自己 +5 G，後端 tc_bless）｜
          許願蠟燭：點亮一支（免費，每天重置，後端 tc_candle）。
   【後端】tc_backend.sql。前端只負責畫面，數字以伺服器回傳為準。 */
const TCW = 16, TCH = 16;
const TC_FORT = [   // [等級, 籤詩 4 句, 宜, 忌]
  ['大吉', ['春風入小徑', '魚兒自上鉤', '莫問何時好', '今日處處有'], '釣魚、夾盲盒', '太早收工'],
  ['大吉', ['雲開見暖陽', '田裡長得旺', '手上有好事', '笑著往前闖'], '種田、收成', '偷懶'],
  ['大吉', ['燈火在前方', '朋友在身旁', '想做就去做', '好運自己揚'], '約朋友一起玩', '一個人悶著'],
  ['中吉', ['小事順風行', '大事慢慢成', '別急著比較', '你有自己的程'], '煮一鍋好料', '跟別人比較'],
  ['中吉', ['溪水繞石頭', '走慢也會流', '今天多喝水', '明天有盼頭'], '整理背包', '拖到明天'],
  ['中吉', ['月下一盞茶', '心事漸放下', '好話說出口', '暖意到你家'], '跟人說謝謝', '嘴硬'],
  ['中吉', ['路口有小店', '進去看一看', '驚喜不用找', '它在你眼前'], '逛廣場', '繞遠路'],
  ['中吉', ['飛鳥過屋簷', '喜訊在不遠', '收好小東西', '有人要見面'], '查看信箱', '漏看訊息'],
  ['小吉', ['雲淡風也輕', '事事有點成', '別貪一次滿', '慢火燉得香'], '慢慢來', '一次做太多'],
  ['小吉', ['花開不用催', '時到自然回', '今天先打掃', '好運才肯來'], '打掃佈置', '亂丟東西'],
  ['小吉', ['魚在深水游', '耐心是魚鉤', '等到太陽斜', '一尾就到手'], '釣魚', '沒耐心'],
  ['小吉', ['燈下寫幾行', '心事有方向', '寫給明天的你', '放心去闖蕩'], '訂個小計畫', '熬夜'],
  ['小吉', ['小徑有落葉', '踩著也好聽', '不急著到站', '風景就是賞'], '散步', '趕時間'],
  ['小吉', ['手邊有小財', '別急著花開', '留點給朋友', '好運會回來'], '存一點 G', '亂花錢'],
  ['吉', ['日常平平穩', '事事有個準', '照著節奏走', '自有人來認'], '照表操課', '臨時改計畫'],
  ['吉', ['柴米與炊煙', '平凡也是仙', '今天吃好點', '運氣跟著甜'], '吃一頓好料理', '餓肚子'],
  ['吉', ['風從西邊來', '好消息在載', '往沼澤看看', '有蟲也有財'], '去霧語沼澤', '空手出門'],
  ['吉', ['朋友遞杯茶', '聊聊就開花', '一句關心話', '勝過千萬家'], '找好友聊天', '已讀不回'],
  ['末吉', ['雲遮一小塊', '太陽還在外', '晚點會放晴', '先把事做開'], '先做最難的', '逃避'],
  ['末吉', ['路有點小坡', '慢慢走不累', '今天少抱怨', '明天更有味'], '少說多做', '抱怨'],
  ['末吉', ['果子還沒熟', '別急著去摘', '再等一兩天', '更甜更好看'], '再等一等', '提早收成'],
  ['小凶', ['霧濃看不遠', '腳步放輕點', '小心別衝動', '穩穩也平安'], '檢查再行動', '衝動買東西'],
  ['小凶', ['雨落屋簷下', '正好煮壺茶', '事情先放放', '晴了再出發'], '待在室內', '硬撐'],
  ['小凶', ['路上有小石', '繞過就沒事', '別跟自己嘔氣', '睡飽再說吧'], '早點睡', '鑽牛角尖']
];
const TC_LVC = { 大吉: '#ff5a4a', 中吉: '#ff9b3a', 小吉: '#e0b84a', 吉: '#7ac86a', 末吉: '#5ab8d8', 小凶: '#9a8ac0' };
const TC_BLESS = [
  '今天的你已經很努力，歇一下也沒關係。', '願你釣到的每一條魚，都比想像中大一點。', '願你的田地風調雨順，笑容也是。', '小小的事順利，就是大大的福氣。',
  '願你煮的料理，剛好是最拿手的味道。', '慢慢走，風景也在等你。', '你不用完美，現在的樣子就很好。', '願你遇見的朋友，都剛好有空。',
  '別忘了喝水，也別忘了誇誇自己。', '今天的雲很軟，願你的心事也是。', '願你的背包裝滿想要的東西，再留一格給驚喜。', '有些事不用今天做完，明天的你也很可靠。',
  '願你抽到想要的盲盒，沒抽到的也很有趣。', '夜裡有燈，路上有人，願你不孤單。', '你已經走了很遠，回頭看看，很棒喔。', '願你今天有一個小小的好消息。',
  '平安、健康，還有一點點好運。', '願每個等你的人，都不用等太久。', '笑一個吧，連小雞都會跟著開心。', '願你的好心情會傳染給身邊的人。',
  '你是別人今天的好運，只是你還不知道。', '早安、午安、晚安，都願你睡得安穩、醒得輕鬆。'
];
const TC_EMO = {   // 香火表情（key＝後端的 kind，buff 名稱＝'tp_' + kind）
  a: { n: '香煙繚繞', d: '頭旁邊一直飄著三炷香的輕煙' }, b: { n: '福字紅包', d: '頭旁邊掛著一個紅包' }, c: { n: '蓮花', d: '頭旁邊開著一朵粉色蓮花' },
  d: { n: '金元寶', d: '頭旁邊閃著一個金元寶' }, f: { n: '平安符', d: '頭旁邊掛著一個平安符' }, j: { n: '愛心＋香', d: '頭旁邊一顆愛心，上面冒著一縷香煙' }
};
const TC_CARDS = [['平安', '#6ab0e0'], ['好運', '#ff9b3a'], ['微笑', '#ff7ab8']];
const TC_CANDLE = [['白', '#fff8e8'], ['金', '#ffd34d'], ['粉', '#ff9bb3'], ['藍', '#8fd0ff'], ['綠', '#8fe09a']];
const TC_MONK = ['歡迎光臨。心誠則靈，也要記得多喝水。', '求籤每天一次，免費的。多抽沒有更準喔。', '香爐一次 10 G，上香的人頭上會冒出小記號，一個鐘頭不到就散了。', '打小人只能打心裡的小人，別寫真人的名字喔。', '今天運氣好不好，一半看籤，一半看你。'];
const TC_PRIEST = ['歡迎來到小教堂，願你平安。', '蠟燭點起來，願望就有了一個小小的家。', '你可以為朋友寫一張祈福卡，每天三張。', '安靜地坐一下也很好。', '來，聽聽今天的祝福。'];

/* ---------- 兩間室內的地圖 ---------- */
const tpkind = Array.from({ length: TCH }, () => Array(TCW).fill(G));
const chkind = Array.from({ length: TCH }, () => Array(TCW).fill(G));
const TC_CUSH = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13];   // 神廟蒲團所在的格（第 12 排；中間 7、8 留作走道）
const tcObjs = { temple: new Map(), church: new Map() };
for (const k of [tpkind, chkind]) {
  for (let y = 0; y < TCH; y++) for (let x = 0; x < TCW; x++) if (y < 2 || y === TCH - 1 || x === 0 || x === TCW - 1) k[y][x] = BWL;
  k[TCH - 1][7] = BX; k[TCH - 1][8] = BX;
}
{
  const put = (kind, name, id, x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { kind[y + j][x + i] = TCX; tcObjs[name].set((x + i) + ',' + (y + j), id); } };
  put(tpkind, 'temple', 'altar', 6, 2, 4, 4);      // 神龕＋神像
  put(tpkind, 'temple', 'tube', 2, 8, 1, 2);       // 籤筒
  put(tpkind, 'temple', 'censer', 7, 8, 2, 2);     // 香爐
  put(tpkind, 'temple', 'curse', 12, 8, 1, 1); put(tpkind, 'temple', 'curse', 12, 9, 3, 2);   // 打小人（紙人和矮桌）
  put(tpkind, 'temple', 'monk', 9, 6, 1, 2);       // 廟祝
  for (const cx of TC_CUSH) put(tpkind, 'temple', 'cushion', cx, 12, 1, 1);   // 一排綠蒲團（drawTcRoom 畫）：面向它按動作鍵跪下拜拜
  put(chkind, 'church', 'altar', 6, 2, 4, 3);      // 祭壇
  put(chkind, 'church', 'priest', 10, 4, 1, 2);    // 神父
  put(chkind, 'church', 'bless', 7, 7, 2, 1);      // 祈福台
  put(chkind, 'church', 'pew', 1, 7, 5, 1); put(chkind, 'church', 'pew', 1, 9, 5, 1); put(chkind, 'church', 'pew', 1, 11, 5, 1);
  put(chkind, 'church', 'pew', 10, 7, 5, 1); put(chkind, 'church', 'pew', 10, 9, 5, 1); put(chkind, 'church', 'pew', 10, 11, 5, 1);
  put(chkind, 'church', 'candle', 1, 13, 4, 1);    // 許願蠟燭架
}

/* ---------- 狀態（以後端為準） ---------- */
let tcS = { fort: -1, candle: -1, curse_n: 0, bless_left: 3, buff: null, until: 0 };
let tcView = '', tcBusy = false, tcNote = '', tcPick = 'a', tcCard = 0, tcTo = '', tcCurseTxt = '', tcLine = 0;
let tcMissing = false;   // 後端還沒裝 SQL
const tcMiss = e => /function|schema cache|PGRST202|404/i.test(String((e && e.message) || e));
const TC_ERR = { tc_bless_limit: '今天的 3 次祈福用完了，明天再來', tc_bless_dup: '今天已經為這位朋友祈福過了', not_friend: '只能為好友祈福', gift_self: '不能為自己寫祈福卡', bad_kind: '選項不對' };
const tcErr = e => { const m = String((e && (e.message || e.msg)) || e || ''); for (const k in TC_ERR) if (m.includes(k)) return TC_ERR[k]; return errText(e); };
function tcApply(r) {
  if (!r || typeof r !== 'object') return;
  if (typeof r.fort === 'number') tcS.fort = r.fort;
  if (typeof r.candle === 'number') tcS.candle = r.candle;
  if (typeof r.curse_n === 'number') tcS.curse_n = r.curse_n;
  if (typeof r.bless_left === 'number') tcS.bless_left = r.bless_left;
  if ('buff' in r) { tcS.buff = typeof r.buff === 'string' && /^tp_[abcdfj]$/.test(r.buff) ? r.buff : null; tcS.until = tcS.buff ? +r.until || 0 : 0; tcKeep(); }
  if (typeof r.coins === 'number' && me) { me.coins = r.coins; try { refreshHud(); } catch (e) { /* 略過 */ } }
}
/* 香火 buff 放進 buffs（吃料理的 buff 也放在這裡，同一個圓環和外觀同步）；get_state 會把 buffs 整個換掉，換完要補回來 */
function tcKeep() {
  Object.keys(buffs).forEach(k => { if (k.indexOf('tp_') === 0) delete buffs[k]; });
  if (tcS.buff && tcS.until > srvNow()) buffs[tcS.buff] = tcS.until;
  try { updateBuffChip(); } catch (e) { /* 略過 */ }
}
async function tcSync() {
  if (tcMissing || !ready || !me) return;
  try {
    const r = await rpc('tc_state'); tcApply(r);
    const got = Array.isArray(r.got) ? r.got.slice(0, 20) : [];
    if (got.length) {
      if (me) me.coins = (me.coins | 0) + 20 * got.length; try { refreshHud(); } catch (e) { /* 略過 */ }
      const g0 = got[0], nm = clean(g0 && g0.n, 8) || '好友', cd = TC_CARDS[intIn(g0 && g0.c, 0, 2, 0)][0];
      toast(nm + ' 為你祈福了（「' + cd + '」卡）' + (got.length > 1 ? '，一共 ' + got.length + ' 張' : '') + '，收到 ' + 20 * got.length + ' G', 4600); chime([76, 81, 88], 0.12);
    }
  } catch (e) { if (tcMiss(e)) tcMissing = true; }
}

/* ---------- 進出 ---------- */
function tcEnter(which) {
  if (scene !== 'plaza' || !ready || !me || paused()) return;
  pose = null; scene = which; K = which === 'temple' ? tpkind : chkind; W = TCW; H = TCH;
  pl.x = pl.sx = 7; pl.y = pl.sy = TCH - 2; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  view.snap = true; fitView(); toast(which === 'temple' ? '福神廟：求籤、上香、打小人' : '小教堂：祈福、許願、聽聽祝福語');
  lastPosKey = ''; posAcc = 999; trackSelf(); tcSync();
}
function tcLeave(which, silent) {
  if (scene !== which) return;
  tcClose();
  const B = which === 'temple' ? TPB : CHB;
  scene = 'plaza'; K = pkind; W = PLW; H = PLH;
  pl.x = pl.sx = B.x + 2; pl.y = pl.sy = B.y + B.h; pl.prog = 1; pl.face = 'down'; pressed.length = 0;
  view.snap = true; fitView(); lastPosKey = ''; posAcc = 999; trackSelf();
  if (!silent) toast('回到廣場了');
}
const enterTemple = () => tcEnter('temple'), enterChurch = () => tcEnter('church');
const leaveTemple = s => tcLeave('temple', s), leaveChurch = s => tcLeave('church', s);

/* ---------- 玩家動作（actions.js 的 act 在這兩個場景呼叫） ---------- */
function tcAct(x, y) {
  const rp = remoteAt(x, y); if (rp) { openFriendPop(rp); return; }
  if (!tcObjs[scene]) return;
  if (K[y][x] === BX) { tcLeave(scene); return; }
  const o = tcObjs[scene].get(x + ',' + y); if (!o) return;
  if (scene === 'temple') {
    if (o === 'tube') tcShow('fort');
    else if (o === 'censer') tcShow('incense');
    else if (o === 'curse') { tcCurseTxt = ''; tcShow('curse'); }
    else if (o === 'monk') pop(x, y, '廟祝：' + TC_MONK[tcLine++ % TC_MONK.length], '#ffe9a8');
    else if (o === 'altar') pop(x, y, '福神像：心誠則靈', '#ffe9a8');
    else if (o === 'cushion') tcKneel(x, y);
  } else {
    if (o === 'priest') tcShow('word');
    else if (o === 'bless') tcShow('bless');
    else if (o === 'candle') tcShow('candle');
    else if (o === 'altar') pop(x, y, '祭壇：安靜地待一會兒吧', '#e8e0ff');
    else if (o === 'pew') tcSitPew(x, y);
  }
}
/* 長椅：面向它按動作鍵就坐上去（用「坐地上」那套姿勢，別的玩家看得到；再按動作鍵或方向鍵起身） */
function tcSitPew(x, y) {
  if (pose || fishing) return;
  if (remoteAt(x, y)) { toast('這個位子已經有人坐了', 1400); return; }
  pose = { type: 'sit', ground: true, pew: true, em: Math.floor(Math.random() * 3), ox: pl.x, oy: pl.y, face0: pl.face, tile: 0, t: 0 };
  pl.x = pl.sx = x; pl.y = pl.sy = y; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  lastPosKey = ''; posAcc = 999; trackSelf();
}
/* 畫坐在教堂長椅上的人：背對、面向祭壇，頭和肩膀露在椅背上面，椅背蓋住腰以下；頭上隨機一種表情（em 0 小十字 / 1 默念 / 2 羽毛），別人同步碼 s = 8 + em */
function tcPewDraw(px, py, ch, em, now) {
  const t = now || 0;
  ctx.save(); ctx.beginPath(); ctx.rect(px - 8, py - 24, 32, 32); ctx.clip(); drawPlayer(px, py - 4, 'up', false, 0, ch); ctx.restore();
  const ey = py + 2;
  if (em === 0) {
    const f = Math.floor(t / 400) % 2; r('#fff7d6', px + 5, ey - 24, 6, 9); r('#ffffff', px + 7, ey - 27, 2, 15); r('#ffffff', px + 4, ey - 21, 8, 2); r('#ffe9a8', px + 7, ey - 22 + f, 2, 1);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 500 + i * 2); r('#ffe9a8', px - 2 + i * 9, ey - 26 + (i % 2) * 3, 2, 2); } ctx.globalAlpha = 1;
  } else if (em === 1) {
    const f = Math.floor(t / 350) % 3; r('#ffffff', px + 2, ey - 24, 14, 8); r('#c9b8a0', px + 2, ey - 24, 14, 1); r('#c9b8a0', px + 2, ey - 17, 14, 1); r('#ffffff', px + 5, ey - 16, 3, 2);
    for (let i = 0; i <= f; i++) r('#8a6a4a', px + 5 + i * 3, ey - 21, 2, 2);
  } else {
    for (let i = 0; i < 3; i++) { const ph = ((t / 1100) + i / 3) % 1; ctx.globalAlpha = 1 - ph * 0.8; const X = px + 2 + i * 5 + Math.round(Math.sin(ph * 6 + i) * 3), Y = ey - 14 - Math.round(ph * 14); r('#ffffff', X, Y, 3, 1); r('#cfdcff', X + 1, Y + 1, 2, 1); r('#ffffff', X + 2, Y - 1, 1, 1); }
    ctx.globalAlpha = 1;
  }
}
/* 蒲團：跪下拜拜（面向神像），頭上隨機冒一種表情一直維持，再按動作鍵或方向鍵起身。
   別人看得到：同步碼 s = 5 + 表情編號（5 默念、6 金光、7 香煙），見 village.js 的 sitCode / rp.kn */
function tcKneel(x, y) {
  if (pose || fishing) return;
  if (remoteAt(x, y)) { toast('這個蒲團已經有人在拜了', 1400); return; }
  pose = { type: 'sit', ground: true, kneel: true, em: Math.floor(Math.random() * 3), ox: pl.x, oy: pl.y, face0: pl.face, tile: 0, t: 0 };
  pl.x = pl.sx = x; pl.y = pl.sy = y; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  lastPosKey = ''; posAcc = 999; trackSelf(); toast('心裡默默許願…（再按動作鍵起身）', 1800);
}
/* 畫跪拜的人：px,py = 蒲團那一格的左上角；em 0 默念… / 1 金光閃閃 / 2 香煙裊裊 */
function tcKneelDraw(px, py, ch, em, now) {
  const y = py - 4, t = now || 0, PANT = '#4a6fa5', SH = '#6b4a35';
  if (em === 1) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.ellipse(px + 8, y + 4, 11, 13, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.save(); ctx.beginPath(); ctx.rect(px - 8, y - 20, 32, 31); ctx.clip(); drawPlayer(px, y + 3, 'up', false, 0, ch); ctx.restore();
  r(PANT, px + 3, y + 10, 10, 3); r(SH, px + 3, y + 13, 4, 2); r(SH, px + 9, y + 13, 4, 2);
  const ey = y + 10;
  if (em === 0) {
    const f = Math.floor(t / 350) % 3; r('#ffffff', px + 2, ey - 17, 14, 8); r('#c9b8a0', px + 2, ey - 17, 14, 1); r('#c9b8a0', px + 2, ey - 10, 14, 1); r('#ffffff', px + 5, ey - 9, 3, 2);
    for (let i = 0; i <= f; i++) r('#8a6a4a', px + 5 + i * 3, ey - 14, 2, 2);
  } else if (em === 1) {
    const f = Math.floor(t / 300) % 2, st = (X, Y, c) => { r(c, X + 1, Y, 1, 3); r(c, X, Y + 1, 3, 1); };
    st(px - 2, ey - 14 + f, '#fff3b0'); st(px + 14, ey - 8 - f, '#ffe066'); st(px + 7, ey - 22, '#fff3b0'); r('#ffffff', px + 8, ey - 21 + f, 1, 1);
  } else {
    for (let i = 0; i < 3; i++) { const ph = ((t / 900) + i / 3) % 1; ctx.globalAlpha = 0.8 * (1 - ph); r('#ffffff', px + 7 + Math.round(Math.sin(ph * 7 + i * 2) * 3), ey - 9 - Math.round(ph * 18), 2, 2); }
    ctx.globalAlpha = 1; r('#c0392b', px + 7, ey - 14, 1, 5); r('#e8c98a', px + 7, ey - 9, 1, 2);
  }
}
const templeAct = tcAct, churchAct = tcAct;

/* ---------- 面板 ---------- */
const tcEl = document.createElement('div');
tcEl.id = 'tcbox'; tcEl.hidden = true;
document.body.appendChild(tcEl);
{
  const st = document.createElement('style');
  st.textContent = `
  #tcbox{position:fixed;inset:0;z-index:42;background:rgba(10,6,20,.72);display:flex;align-items:center;justify-content:center;padding:10px;font-family:inherit}
  #tcbox[hidden]{display:none}
  #tcbox *{box-sizing:border-box}
  #tcbox .tcc{width:min(94vw,400px);max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch;border:4px solid #0a0e1c;padding:12px;display:flex;flex-direction:column;gap:10px;color:#fffaf0;box-shadow:0 0 0 3px var(--ac)}
  #tcbox .tcc.tp{background:#4a1f16;--ac:#ffd34d}
  #tcbox .tcc.ch{background:#262c58;--ac:#c9a8f5}
  #tcbox h3{margin:0;font-size:18px;color:var(--ac);text-align:center}
  #tcbox p{margin:0;font-size:14px;line-height:1.6;text-align:center}
  #tcbox .sub{font-size:12px;color:#d8c8b0;text-align:center}
  #tcbox button{font:inherit;color:#fffaf0;cursor:pointer;border:3px solid #0a0e1c;background:#c8352b;padding:10px 8px;font-weight:700;font-size:15px;touch-action:manipulation}
  #tcbox .ch button{background:#6a4fe0}
  #tcbox button.ghost{background:#3a3a52;color:#c8cade}
  #tcbox button.go{background:#e0a020;color:#2a1608}
  #tcbox .ch button.go{background:#ff7ab8;color:#fffaf0}
  #tcbox button:disabled{opacity:.45;cursor:default}
  #tcbox .row{display:flex;gap:8px}
  #tcbox .row>*{flex:1}
  #tcbox .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
  #tcbox .opt{background:#2a120c;border:3px solid #7a4a2a;padding:8px 4px;text-align:center;font-size:12px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px;min-height:84px;cursor:pointer;color:#fffaf0}
  #tcbox .ch .opt{background:#161a3a;border-color:#4a4a8a}
  #tcbox .opt.sel{border-color:var(--ac);background:#5a2a1a}
  #tcbox .ch .opt.sel{background:#3a3a7a}
  #tcbox .opt img{image-rendering:pixelated;height:48px;width:auto;display:block}
  #tcbox .opt .sw{width:26px;height:26px;border:3px solid #0a0e1c}
  #tcbox .fort{background:#f6e7c8;color:#4a2a1a;border:4px solid #6b2d1e;padding:12px;text-align:center;display:flex;flex-direction:column;gap:6px}
  #tcbox .fort .lv{font-size:34px;font-weight:900;letter-spacing:6px}
  #tcbox .fort .po{font-size:17px;line-height:1.9;letter-spacing:2px}
  #tcbox .fort .yj{font-size:13px;display:flex;justify-content:space-around;border-top:2px dashed #b8946a;padding-top:6px}
  #tcbox .word{background:#f4f0ff;color:#2a2a5a;border:4px solid #8a86c0;padding:16px 12px;text-align:center;font-size:16px;line-height:1.9}
  #tcbox input[type=text]{font:inherit;width:100%;padding:9px;border:3px solid #0a0e1c;background:#fff6e0;color:#3a1a10;font-size:16px}
  #tcbox .chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
  #tcbox .chips span{background:#2a120c;border:2px solid #7a4a2a;padding:4px 10px;font-size:13px;cursor:pointer}
  #tcbox .fl{display:flex;flex-direction:column;gap:6px;max-height:190px;overflow:auto}
  #tcbox .fl .opt{min-height:0;flex-direction:row;justify-content:flex-start;padding:9px 12px;font-size:14px}
  #tcbox canvas{width:100%;image-rendering:pixelated;background:#2a120c;border:3px solid #0a0e1c;display:block}
  #tcbox .shake{animation:tcsh .12s linear infinite}
  @keyframes tcsh{0%{transform:translate(-3px,1px) rotate(-3deg)}50%{transform:translate(3px,-1px) rotate(3deg)}100%{transform:translate(-3px,1px) rotate(-3deg)}}
  `;
  document.head.appendChild(st);
}
const tcTh = () => scene === 'church' ? 'ch' : 'tp';
const tcImgTag = (k, h) => { const d = TC_DATA[k]; return d ? '<img src="' + d[2] + '" alt="" style="height:' + (h || 48) + 'px">' : ''; };
function tcShow(v) { if (!ready || !me) return; tcView = v; tcNote = ''; tcOpen = true; pressed.length = 0; actHeld = false; tcEl.hidden = false; tcRender(); if (!tcMissing) tcSync().then(() => { if (tcOpen && tcView === v && !tcBusy) tcRender(); }); }
function tcClose() { if (!tcOpen) return; tcOpen = false; tcBusy = false; tcEl.hidden = true; tcEl.innerHTML = ''; pressed.length = 0; clearInterval(tcAnimTm); }
const tcMin = () => Math.max(0, Math.ceil((tcS.until - srvNow()) / 60000));
function tcFortHtml(i) {
  const f = TC_FORT[i]; if (!f) return '';
  return '<div class="fort"><div class="lv" style="color:' + (TC_LVC[f[0]] || '#c83030') + '">' + f[0] + '</div><div class="po">' + f[1].map(esc).join('<br>') + '</div><div class="yj"><span>宜　' + esc(f[2]) + '</span><span>忌　' + esc(f[3]) + '</span></div></div>';
}
function tcRender() {
  if (!tcOpen) return;
  const th = tcTh(), coins = me ? me.coins | 0 : 0;
  let h = '';
  const close = '<button type="button" class="ghost" data-a="close">離開</button>';
  const miss = tcMissing ? '<p class="sub">這裡還沒開放（後端還沒設定）</p>' : '';
  if (tcView === 'fort') {
    h = '<h3>籤筒</h3>';
    if (tcS.fort >= 0) h += '<p class="sub">今天已經求過了，這是你今天的籤</p>' + tcFortHtml(tcS.fort);
    else h += '<p>把心裡的事默念一遍，搖一搖籤筒。<br>每天免費求一次。</p><div class="row"><button type="button" class="go" data-a="draw"' + (tcBusy || tcMissing ? ' disabled' : '') + '>' + (tcBusy ? '喀啦喀啦…' : '求籤（免費）') + '</button></div>';
    h += miss + (tcNote ? '<p class="sub">' + esc(tcNote) + '</p>' : '') + close;
  } else if (tcView === 'incense') {
    const on = tcS.buff && tcS.until > srvNow();
    h = '<h3>香爐</h3><p>上一炷香 <b>10 G</b>，頭旁邊會冒出你選的小記號，持續 30 分鐘，其他玩家看得到。</p>' +
      '<div class="grid">' + Object.keys(TC_EMO).map(k => '<div class="opt' + (tcPick === k ? ' sel' : '') + '" data-a="pick" data-k="' + k + '">' + tcImgTag('em_' + k, 48) + esc(TC_EMO[k].n) + '</div>').join('') + '</div>' +
      '<p class="sub">' + esc(TC_EMO[tcPick].d) + (on ? '<br>目前：' + esc(TC_EMO[tcS.buff.slice(3)].n) + '，還剩 ' + tcMin() + ' 分鐘（再上香會重新計 30 分鐘）' : '') + '</p>' +
      '<div class="row"><button type="button" class="go" data-a="burn"' + (tcBusy || tcMissing || coins < 10 ? ' disabled' : '') + '>' + (tcBusy ? '上香中…' : coins < 10 ? 'G 不夠' : '上香 10 G') + '</button></div>' +
      miss + (tcNote ? '<p class="sub">' + esc(tcNote) + '</p>' : '') + close;
  } else if (tcView === 'curse') {
    h = '<h3>打小人</h3><p>寫下一個<b>想像中</b>的小人（例如：拖延症、壞心情、加班），拿拖鞋拍它。<br>一次 <b>100 G</b>，只是出氣。</p>' +
      '<input type="text" id="tccu" maxlength="8" placeholder="想打誰？（最多 8 字）" value="' + esc(tcCurseTxt) + '">' +
      '<div class="chips">' + ['拖延症', '壞心情', '加班', '失眠', '賴床'].map(t => '<span data-a="chip" data-t="' + t + '">' + t + '</span>').join('') + '</div>' +
      '<p class="sub">請不要寫真人的名字。文字只會出現在你的畫面，不會傳給任何人。</p>' +
      '<canvas id="tccv" width="128" height="80"></canvas>' +
      '<div class="row"><button type="button" class="go" data-a="curse"' + (tcBusy || tcMissing || coins < 100 ? ' disabled' : '') + '>' + (tcBusy ? '啪啪啪…' : coins < 100 ? 'G 不夠' : '開打（100 G）') + '</button></div>' +
      '<p class="sub">今天已經打了 ' + tcS.curse_n + ' 次</p>' + miss + (tcNote ? '<p class="sub">' + esc(tcNote) + '</p>' : '') + close;
  } else if (tcView === 'word') {
    const d = sellDayNow(), hsh = String(myUid || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7), line = TC_BLESS[Math.abs(d * 7 + hsh) % TC_BLESS.length];
    h = '<h3>神父</h3><p class="sub">' + esc(TC_PRIEST[tcLine++ % TC_PRIEST.length]) + '</p><div class="word">' + esc(line) + '</div><p class="sub">今天的祝福語（每天換一句）</p>' + close;
  } else if (tcView === 'bless') {
    const fl = (typeof fr === 'object' && fr && Array.isArray(fr.friends)) ? fr.friends : [];
    h = '<h3>祈福台</h3><p>寫一張祈福卡給好友。對方會收到 <b>20 G</b>，你也得到 5 G。<br>每天 3 次，同一個人一天一次。</p>' +
      '<div class="grid">' + TC_CARDS.map((c, i) => '<div class="opt' + (tcCard === i ? ' sel' : '') + '" data-a="card" data-i="' + i + '"><span class="sw" style="background:' + c[1] + '"></span>' + c[0] + '</div>').join('') + '</div>' +
      (fl.length ? '<div class="fl">' + fl.slice(0, 60).map(f => '<div class="opt' + (tcTo === f.uid ? ' sel' : '') + '" data-a="to" data-u="' + esc(f.uid) + '">' + esc(f.name) + '</div>').join('') + '</div>' : '<p class="sub">你還沒有好友。先在廣場和別人互相加好友吧</p>') +
      '<p class="sub">' + (fl.length && !tcTo ? '先點一位好友，再按送出。' : '') + '今天還能祈福 ' + tcS.bless_left + ' 次</p>' +
      '<div class="row"><button type="button" class="go" data-a="send"' + (tcBusy || tcMissing || !tcTo || tcS.bless_left < 1 ? ' disabled' : '') + '>' + (tcBusy ? '送出中…' : '送出祈福卡') + '</button></div>' +
      miss + (tcNote ? '<p class="sub">' + esc(tcNote) + '</p>' : '') + close;
  } else if (tcView === 'candle') {
    h = '<h3>許願蠟燭</h3><p>點亮一支蠟燭，在心裡許一個願。<br>蠟燭每天重置，免費。</p>' +
      '<div class="grid">' + TC_CANDLE.map((c, i) => '<div class="opt' + (tcS.candle === i ? ' sel' : '') + '" data-a="light" data-i="' + i + '"><span class="sw" style="background:' + c[1] + '"></span>' + c[0] + '色</div>').join('') + '</div>' +
      '<p class="sub">' + (tcS.candle >= 0 ? '今天點的是' + TC_CANDLE[tcS.candle][0] + '色蠟燭，想換顏色可以再點一次' : '今天還沒點蠟燭') + '</p>' + miss + (tcNote ? '<p class="sub">' + esc(tcNote) + '</p>' : '') + close;
  }
  tcEl.innerHTML = '<div class="tcc ' + th + '">' + h + '</div>';
  if (tcView === 'curse') tcCurseDraw(0);
}
let tcAnimTm = 0, tcAud = null;
function tcBeep(f, d, type, vol) {
  try {
    tcAud = tcAud || new (window.AudioContext || window.webkitAudioContext)();
    const o = tcAud.createOscillator(), gn = tcAud.createGain(), t = tcAud.currentTime;
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f * 0.5), t + d);
    gn.gain.setValueAtTime(vol || 0.07, t); gn.gain.exponentialRampToValueAtTime(0.0008, t + d);
    o.connect(gn); gn.connect(tcAud.destination); o.start(t); o.stop(t + d);
  } catch (e) { /* 略過 */ }
}
/* 打小人的小動畫：紙人（肚子上寫著文字）被拖鞋啪啪啪打。t＝第幾幀（0＝靜止） */
function tcCurseDraw(t) {
  const c = $('tccv'); if (!c) return; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  x.clearRect(0, 0, 128, 80); R('#3a1a12', 0, 62, 128, 18); R('#4a2a1a', 0, 62, 128, 2);
  const hit = t > 0 ? Math.floor(t / 4) % 2 === 1 : false, sq = hit ? 3 : 0, sh = hit ? ((t % 3) - 1) * 2 : 0;
  const px = 52 + sh, py = 18 + sq;
  R('#ffffff', px + 8, py, 16, 14); R('#14141e', px + 12, py + 5, 2, 2); R('#14141e', px + 18, py + 5, 2, 2); R('#c83030', px + 14, py + 10, 4, 2);
  R('#ffffff', px + 10, py + 14, 12, 20 - sq); R('#ffffff', px, py + 16, 32, 5); R('#ffffff', px + 8, py + 32 - sq, 5, 12); R('#ffffff', px + 19, py + 32 - sq, 5, 12);
  R('#d0d0d8', px + 10, py + 24 - sq, 12, 1);
  const tx = tcCurseTxt ? tcCurseTxt.slice(0, 4) : '';
  if (tx) { x.fillStyle = '#c83030'; x.font = 'bold 8px sans-serif'; x.textAlign = 'center'; x.fillText(tx, px + 16, py + 28 - sq); }
  if (t > 0) {   // 拖鞋
    const up = !hit, sy = up ? 2 : 14, sxx = 72;
    R('#e86aa0', sxx, sy, 26, 12); R('#7a2a50', sxx, sy, 26, 1); R('#7a2a50', sxx, sy + 11, 26, 1); R('#ffd1e0', sxx + 4, sy + 3, 14, 4);
    if (hit) { x.fillStyle = '#ffd34d'; x.font = 'bold 10px sans-serif'; x.textAlign = 'center'; x.fillText('啪!', 44, 14); R('#ffd34d', 40, 18, 2, 4); R('#ffd34d', 60, 20, 2, 4); }
  }
}
function tcCurseAnim() {
  let t = 1; clearInterval(tcAnimTm);
  tcAnimTm = setInterval(() => {
    tcCurseDraw(t++);
    if (t % 4 === 1 && Math.floor(t / 4) % 2 === 1) tcBeep(180 + (t % 5) * 20, 0.09, 'square', 0.08);
    if (t > 34) { clearInterval(tcAnimTm); tcCurseDraw(0); }
  }, 70);
}
tcEl.addEventListener('click', async e => {
  const b = e.target.closest('[data-a]'); if (!b) { if (e.target === tcEl && !tcBusy) tcClose(); return; }
  const a = b.dataset.a;
  if (a === 'close') { if (!tcBusy) tcClose(); return; }
  if (b.disabled || tcBusy) return;
  if (a === 'pick') { tcPick = b.dataset.k; tcRender(); return; }
  if (a === 'card') { tcCard = +b.dataset.i | 0; tcRender(); return; }
  if (a === 'to') { tcTo = b.dataset.u; tcRender(); return; }
  if (a === 'chip') { tcCurseTxt = b.dataset.t; const i = $('tccu'); if (i) i.value = tcCurseTxt; tcCurseDraw(0); return; }
  tcBusy = true; tcNote = ''; tcRender();
  try {
    if (a === 'draw') {
      await new Promise(r => setTimeout(r, 900));
      tcApply(await rpc('tc_draw')); chime([72, 76, 79, 84], 0.12);
    } else if (a === 'burn') {
      const k = tcPick, r = await enqueue(() => rpc('tc_burn', { p_kind: k })); tcApply(r);
      chime([79, 84], 0.1); tcNote = '上香完成，' + TC_EMO[k].n + ' 持續 30 分鐘'; toast('上香了：' + TC_EMO[k].n + '（30 分鐘）');
    } else if (a === 'curse') {
      const i = $('tccu'); tcCurseTxt = clean(i ? i.value : tcCurseTxt, 8);
      const r = await enqueue(() => rpc('tc_curse')); tcApply(r); tcBusy = false; tcRender(); tcCurseAnim();
      tcNote = '啪啪啪！' + (tcCurseTxt ? tcCurseTxt + ' ' : '') + '晦氣打掉了'; setTimeout(() => { if (tcOpen && tcView === 'curse') { tcRender(); } }, 2600); return;
    } else if (a === 'send') {
      const r = await enqueue(() => rpc('tc_bless', { p_to: tcTo, p_card: tcCard, p_name: me ? me.name : '' })); tcApply(r);
      const f = fr.friends.find(x => x.uid === tcTo); chime([76, 81, 88], 0.12); tcNote = '已送出給 ' + (f ? f.name : '好友') + '，你得到 5 G'; toast(tcNote); tcTo = '';
    } else if (a === 'light') {
      tcApply(await rpc('tc_candle', { p_color: +b.dataset.i | 0 })); chime([72, 79], 0.1); tcNote = '蠟燭亮起來了';
    }
  } catch (err) { if (tcMiss(err)) { tcMissing = true; tcNote = ''; } else tcNote = tcErr(err); }
  tcBusy = false; tcRender();
});
tcEl.addEventListener('input', e => { if (e.target && e.target.id === 'tccu') tcCurseTxt = e.target.value.slice(0, 8); });
document.addEventListener('keydown', e => { if (tcOpen && e.key === 'Escape' && !tcBusy) { e.preventDefault(); tcClose(); } }, true);

/* ---------- 畫面 ---------- */
function drawTcBldg() {   // 廣場上的兩棟外觀
  const t = tcArt.img('temple_ext'), c = tcArt.img('church_ext');
  if (t) {
    r('rgba(107,72,72,.14)', TPB.x * T + 3, (TPB.y + TPB.h) * T - 3, TPB.w * T - 6, 3);
    ctx.drawImage(t, TPB.x * T, (TPB.y + TPB.h) * T - t.height);
  }
  if (c) { r('rgba(107,72,72,.14)', CHB.x * T + 3, (CHB.y + CHB.h) * T - 3, CHB.w * T - 6, 3); ctx.drawImage(c, CHB.x * T + 1, (CHB.y + CHB.h) * T - c.height); }
}
function drawTcRoom(now) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#12182c'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore();
  r('#12182c', 0, 0, W * T, H * T);
  const im = tcArt.img(scene === 'temple' ? 'temple_in' : 'church_in');
  if (im) ctx.drawImage(im, 0, 0);
  if (scene === 'temple') {   // 一排綠蒲團
    for (const cx of TC_CUSH) {
      const X = cx * 16 + 8, Y = 192 + 11;
      ctx.fillStyle = '#3f7f4a'; ctx.beginPath(); ctx.ellipse(X, Y, 7.5, 4.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#5aa866'; ctx.beginPath(); ctx.ellipse(X, Y - 1, 6, 3, 0, 0, 7); ctx.fill(); r('#e0b24a', X - 1, Y - 2, 2, 2);
    }
  }
  if (scene === 'temple') {   // 香爐的煙
    for (let i = 0; i < 5; i++) { const ph = (now / 260 + i * 1.7) % 6, a = 1 - ph / 6; ctx.globalAlpha = a * 0.7; r('#ffffff', 124 + Math.round(Math.sin(now / 500 + i) * 2) + i % 2 * 3, 144 - Math.round(ph * 5), 2, 2); }
    ctx.globalAlpha = 1;
  } else if (tcS.candle >= 0) {   // 自己今天點的蠟燭：在蠟燭架上亮一朵彩色火光
    const c = TC_CANDLE[tcS.candle][1], cx = 29 + tcS.candle * 10, f = Math.floor(now / 160) % 2;
    ctx.globalAlpha = 0.28; r(c, cx - 5, 192, 12, 14); ctx.globalAlpha = 1;
    r(c, cx, 199 - f, 2, 3 + f); r('#ffffff', cx, 201, 1, 1);
  }
}
/* 香火 buff 的小圖示：自己和同一處的其他玩家頭旁邊（左邊，不蓋到右邊的表情泡泡），畫在夜色之後 */
function tcDrawIcons(now) {
  const one = (kinds, px, py) => {
    const k = (kinds || []).find(x => x.indexOf('tp_') === 0); if (!k) return;
    const im = tcArt.img('em_' + k.slice(3)); if (!im) return;
    const bob = Math.round(Math.sin(now / 380 + px)), w = im.width, h = im.height;
    ctx.drawImage(im, Math.round(px - w + 3), Math.round(py + 9 - h + bob));
  };
  if (!ready || !me) return;
  one(Object.keys(buffs).filter(k => k.indexOf('tp_') === 0 && buffOn(k)), Math.round((pl.sx + (pl.x - pl.sx) * pl.prog) * T), Math.round((pl.sy + (pl.y - pl.sy) * pl.prog) * T));
  if (syncScene()) remotes.forEach(rp => { if (rp.bv && rp.bv.length && hereRp(rp)) one(rp.bv, Math.round(rp.x * T), Math.round(rp.y * T)); });
}
