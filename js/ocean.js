'use strict';
/* 海底清潔（自由潛水）—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html（在 ocean-art.js 之後）。
   從柴犬船長的船下水：上面三層是窄窄的潛水通道，第 4 層攤開成 6 個畫面寬的深海平原。
   撿垃圾放進回收袋，回到水面的船邊分類回收；大件垃圾（漁網、輪胎、纏著海龜的網）要 2 人以上一起拉。
   全服清潔度、守護值、分海域、大件垃圾都在伺服器（ocean.sql）；這裡負責畫面、游泳、送出動作，位置用 Realtime 廣播（ocean:<海域>）。 */
const OCN = { VW: 192, VH: 108, SPEED: 46, O2_S: 200, PICK_R: 11, BIG_R: 26, SPAWN: [554, 22], RESPAWN_MS: 600000 };
const OCN_BIG = [[456, 176], [520, 246], [470, 512], [700, 512], [70, 505], [172, 505], [290, 505]];     // 大件垃圾 1～4 號位置（x, 腳底 y）
const OCN_ITEM = { bag: ['🛍', '塑膠袋', 'plastic'], bottle: ['🧴', '寶特瓶', 'plastic'], can: ['🥫', '鋁罐', 'metal'], line: ['🧵', '釣魚線', 'net'], cup: ['🥤', '保麗龍杯', 'other'] };
const OCN_BIN = { plastic: ['🧴', '塑膠'], metal: ['🥫', '金屬'], net: ['🕸', '漁網'], other: ['🗑', '其他'] };
const OCN_BUOY = [[430, 346], [576, 346], [722, 346]];
const OCN_BIGN = { net: '廢漁網', tire: '廢輪胎', turtle: '纏住海龜的漁網', anchor: '沉船船錨', chain: '生鏽鐵鍊', hatch: '沉船艙門' };
const OCN_SCHOOL = [[440, 50, 60, '#ff9a3c', 6, 0], [630, 70, 50, '#ffd84a', 4, 0], [640, 140, 40, '#6fd0ff', 5, 5], [500, 215, 50, '#ffd84a', 4, 10], [520, 400, 120, '#6fd0ff', 7, 0], [700, 380, 90, '#ffd84a', 5, 15], [180, 430, 90, '#ff9a3c', 5, 25], [950, 430, 100, '#6fd0ff', 6, 30], [480, 450, 40, '#ff9a3c', 4, 40]];
const OCN_JELLY = [[580, 226, '#ff9bdf', 10], [576, 430, '#7fe6ff', 20], [620, 490, '#c9a8ff', 20], [120, 430, '#7fe6ff', 40], [880, 430, '#7fe6ff', 70], [1040, 420, '#c9a8ff', 70], [960, 470, '#7fe6ff', 70]];
const OCN_TITLE = { s1: ['#8aa0b8', '海洋小幫手'], s2: ['#3fb070', '撿拾達人'], s3: ['#20a0a8', '海灣守護者'], s4: ['#e0709a', '珊瑚之友'], s5: ['#2f6fe0', '海龜救星'], s6: ['#2f6fe0', '合作潛水員'], s7: ['#8a5ad8', '船長的老朋友'], s8: ['#d9902a', '海洋觀察家'] };
const OCN_TREQ = { s1: '守護值 50', s2: '守護值 150', s3: '守護值 400', s4: '守護值 800', s5: '解救 10 隻海龜', s6: '合力拉起 30 個大件垃圾', s7: '集齊 8 張船長日記', s8: '集滿海洋圖鑑 16 種' };
const OCN_GEAR = { base: ['預設', '免費'], coral: ['珊瑚粉', '守護值 100'], blue: ['海灣藍', '守護值 250'], green: ['海龜綠', '守護值 500'], gold: ['黃金', '守護值 1000'], glow: ['夜光', '解救 10 隻海龜'] };
/* 海洋圖鑑：位元 0~15；hint 是還沒看到時的提示。a＝在哪裡出現（清潔度門檻） */
const OCN_DEX = [
  ['小丑魚', '橘白條紋，喜歡躲在海葵旁邊。', '上面三層的通道裡'], ['藍倒吊', '藍色的身體配黃尾巴。', '清潔度 10% 以上，通道和深海平原'], ['蝴蝶魚', '扁扁的黃色身體，眼睛上有一條黑線。', '清潔度 30% 以上，平原中央'],
  ['河豚', '圓滾滾的，緊張的時候會鼓起來。', '清潔度 40% 以上，深海平原'], ['海馬', '用尾巴勾著東西，在水裡直直地晃。', '藍洞的洞壁邊（清潔度 20%）'], ['魟魚', '像一張會飛的毯子，貼著海底滑過。', '清潔度 45% 以上，深海平原'],
  ['小鯊魚', '不咬人，只是在遠處悠悠地游過。', '清潔度 60% 以上，平原上方'], ['章魚', '躲在洞裡和沉船裡，眼睛圓圓的。', '藍洞底、沉船墳場'], ['螃蟹', '橫著走，貼著海底到處逛。', '海底的地面上'],
  ['海星', '趴在沙地上一動也不動。', '深海平原的地面'], ['海膽', '全身是刺，只能看不能摸。', '深海平原和沉船墳場的地面'], ['海葵', '搖搖擺擺的觸手，是小丑魚的家。', '深海平原的地面'],
  ['熱帶小魚', '一群一群，到處都是。', '任何地方'], ['海龜', '慢慢地游，很有安全感。', '清潔度 25% 以上'], ['水母', '半透明的傘，一收一放。', '清潔度 10% 以上'], ['鮟鱇魚', '頭上掛著小燈，在暗處等著。', '沉船墳場和發光洞（清潔度 40% / 70%）']];
/* 新生物的位置：k＝種類、x,y＝中心、rng＝游動範圍、sp＝速度、c＝清潔度門檻、bit＝圖鑑位元（ground＝貼地） */
const OCN_LIFE = [
  { k: 'clown', bit: 0, x: 470, y: 66, rng: 46, sp: .5, c: 0 }, { k: 'clown', bit: 0, x: 620, y: 106, rng: 40, sp: .45, c: 0 }, { k: 'clown', bit: 0, x: 520, y: 232, rng: 50, sp: .4, c: 5 },
  { k: 'tang', bit: 1, x: 500, y: 160, rng: 55, sp: .35, c: 10 }, { k: 'tang', bit: 1, x: 700, y: 370, rng: 90, sp: .3, c: 30 }, { k: 'tang', bit: 1, x: 400, y: 440, rng: 70, sp: .32, c: 30 },
  { k: 'butterfly', bit: 2, x: 600, y: 395, rng: 80, sp: .28, c: 30 }, { k: 'butterfly', bit: 2, x: 900, y: 410, rng: 60, sp: .3, c: 70 },
  { k: 'puffer', bit: 3, x: 660, y: 450, rng: 90, sp: .22, c: 40 }, { k: 'puffer', bit: 3, x: 250, y: 425, rng: 50, sp: .2, c: 40 },
  { k: 'seahorse', bit: 4, x: 532, y: 508, rng: 0, sp: 0, c: 20 }, { k: 'seahorse', bit: 4, x: 624, y: 500, rng: 0, sp: 0, c: 20 },
  { k: 'ray', bit: 5, x: 480, y: 380, rng: 130, sp: .2, c: 45 }, { k: 'ray', bit: 5, x: 960, y: 455, rng: 70, sp: .18, c: 70 },
  { k: 'shark', bit: 6, x: 576, y: 352, rng: 360, sp: .1, c: 60 },
  { k: 'octopus', bit: 7, x: 576, y: 522, rng: 0, sp: 0, c: 20 }, { k: 'octopus', bit: 7, x: 170, y: 478, rng: 0, sp: 0, c: 40 },
  { k: 'crab', bit: 8, x: 430, y: 0, rng: 40, sp: .5, c: 0, g: 1 }, { k: 'crab', bit: 8, x: 700, y: 0, rng: 50, sp: .45, c: 0, g: 1 }, { k: 'crab', bit: 8, x: 120, y: 0, rng: 30, sp: .5, c: 40, g: 1 }, { k: 'crab', bit: 8, x: 1010, y: 0, rng: 40, sp: .5, c: 70, g: 1 },
  { k: 'starfish', bit: 9, x: 360, y: 0, c: 0, g: 1, col: '#ff7a4a' }, { k: 'starfish', bit: 9, x: 800, y: 0, c: 0, g: 1, col: '#ffd84a' }, { k: 'starfish', bit: 9, x: 880, y: 0, c: 70, g: 1, col: '#ff7a4a' }, { k: 'starfish', bit: 9, x: 60, y: 0, c: 40, g: 1, col: '#ffd84a' },
  { k: 'urchin', bit: 10, x: 400, y: 0, c: 0, g: 1, col: '#5a2a8a' }, { k: 'urchin', bit: 10, x: 740, y: 0, c: 0, g: 1, col: '#2a2a5a' }, { k: 'urchin', bit: 10, x: 205, y: 0, c: 40, g: 1, col: '#5a2a8a' },
  { k: 'anemone', bit: 11, x: 450, y: 0, c: 0, g: 1 }, { k: 'anemone', bit: 11, x: 780, y: 0, c: 0, g: 1 }, { k: 'anemone', bit: 11, x: 840, y: 0, c: 70, g: 1 }];
/* 發光洞：12 盞珊瑚燈，全服每回收 1 件亮一點（OCN_GLOW_MAX 件＝全亮）；亮到一半出現發光魔鬼魚，全亮出現發光鯨 */
const OCN_GLOW_MAX = 2400;
const OCN_LAMP = [[830, 492], [872, 480], [912, 495], [952, 472], [992, 494], [1032, 478], [1072, 497], [1108, 484], [852, 428], [962, 414], [1062, 404], [1124, 438]];
/* 沉船墳場：每清掉 6 件沉船殘骸，兩艘沉船上多長出 2 叢珊瑚（最多 8 叢） */
const OCN_WCORAL = [[118, 486, '#ff8aa8', 7], [142, 486, '#ffb25a', 6], [236, 487, '#b36bd6', 7], [258, 487, '#ff8aa8', 6], [128, 486, '#7fe3ea', 5], [246, 487, '#ffd27a', 5], [150, 486, '#ff6b8a', 8], [270, 487, '#7fffd4', 6]];
const OCN_RELIC = [['銹蝕的銅鈴', '船上掛過的小鈴，敲一下還有悶悶的聲音。'], ['古老的羅盤', '指針還會動，只是不再指北。'], ['破損的航海地圖', '墨跡暈開了，只剩半座島。'], ['青銅小酒杯', '杯底刻著看不懂的花紋。'], ['珊瑚色玻璃珠', '在水裡看，像一顆小小的夕陽。'], ['舊懷錶', '停在三點十分，不知道是哪一天。']];
/* 藍洞的上升氣泡流：踩進去會被帶到洞口上方的浮標高度，當作回程捷徑 */
const OCN_COL = [552, 600];
/* 藍洞的漂流瓶：每人每天 1 個。日記沒讀完先給日記（共 8 張，集齊得稱號），讀完後給輪替的海洋小知識（共 20 則，順序要跟伺服器一致：伺服器只回第幾則） */
const OCN_BOTTLE = [[576, 522]];
const OCN_DIARY = [
  '第一次下水那天，海水清得像玻璃。我在淺灘撿到一個貝殼，以為自己找到了全世界的寶藏。',
  '我有個潛水的夥伴，是一隻老海龜。牠總在藍洞口等我，我們一起看光從水面灑下來，像一根根金色的柱子。',
  '那些年，我們每天都潛水。海草林裡的魚多到數不清，沉船旁邊的珊瑚開得像花園。',
  '後來船越來越多，岸上的東西也越來越多。有一天，我把掛在海草上的塑膠袋拿掉；過幾天，又掛上了新的。',
  '垃圾越來越多，魚越來越少。老海龜有一次被漁網纏住，我花了一整個下午才救牠出來。牠沒有怪我，只是看了我很久。',
  '那之後，我的腿一天比一天沒力氣，下不去深的地方了。我把潛水鏡收起來，告訴自己：海的事，就交給年輕人吧。',
  '可是我每天還是坐在船頭看著海。看久了才明白，我不是在等海變乾淨，我是在等一個願意下水的人。',
  '今天，我看見有人撈起了一個瓶子。如果你讀到這裡，謝謝你。汪！這片海，現在也是你的海了。'
];
const OCN_TIPS = [
  '塑膠袋在水裡飄起來很像水母，海龜常常把它當成食物吃下去。',
  '被丟棄的漁網叫「幽靈漁網」，會在海裡繼續纏住生物，持續很多年。',
  '鋁罐回收再製，比重新開採鋁礦製造省下很多能源，所以丟對桶很重要。',
  '珊瑚是動物，不是植物；牠鮮豔的顏色來自住在身體裡的藻類。',
  '海草林是魚寶寶的育兒室，很多小魚就是在裡面長大的。',
  '保麗龍被海浪打碎後，會變成很難撿回來的小碎片。',
  '小於 5 毫米的塑膠碎片叫微塑膠，連很深的海和很遠的極地都找得到。',
  '釣魚線又細又透明，海鳥和海龜很容易被它纏住。',
  '地球上有很大一部分的氧氣，是海裡的浮游植物製造的。',
  '大多數水母不會主動攻擊人，只是跟著海流漂。',
  '鯨魚的歌聲可以在海裡傳得很遠很遠。',
  '玻璃瓶可以一再回收，再製之後品質也不會變差。',
  '有些海龜可以活超過五十年，一輩子都在同一片大海裡旅行。',
  '珊瑚礁只佔海底很小的面積，卻是許多海洋生物的家。',
  '深海有些生物會自己發光，這叫做生物發光。',
  '寶特瓶洗乾淨再回收，才比較容易被重新做成新的東西。',
  '垃圾分類丟對，回收的東西才不會被弄髒而白白浪費。',
  '魚群一起游動，可以讓每一隻魚都比較不容易被天敵抓到。',
  '海浪把岸上的垃圾帶進海裡，所以在岸邊撿垃圾也是保護海洋。',
  '你今天撿起的每一件垃圾，都少了一次傷害海洋生物的機會。'
];
const ocnPill = k => OCN_TITLE[k] ? '<span class="octt" style="background:' + OCN_TITLE[k][0] + '">' + OCN_TITLE[k][1] + '</span>' : '';
let ocnTitleMap = {}, ocnFeedSeen = 0, ocnBanner = 0;
const ocnTitleOfName = n => ocnTitleMap[n] || (typeof clean === 'function' ? ocnTitleMap[clean(n, 8)] : null) || null;
async function ocnLoadTitleMap() { try { const m = await rpc('ocean_title_map'); if (m && typeof m === 'object') { const o = {}; Object.keys(m).forEach(k => { o[k] = m[k]; if (typeof clean === 'function') { const c = clean(k, 8); if (c) o[c] = m[k]; } }); if (me && me.name) { if (ocnMyTitle) { o[me.name] = ocnMyTitle; const c = typeof clean === 'function' ? clean(me.name, 8) : ''; if (c) o[c] = ocnMyTitle; } } ocnTitleMap = o; } } catch (e) { /* 伺服器還沒裝第二階段：不影響其他玩法 */ } }
let ocnMyTitle = null;
function ocnNoteName() { if (me && me.name) rpc('ocean_note_name', { p_name: me.name }).then(t => { ocnMyTitle = t || null; return ocnLoadTitleMap(); }).catch(() => { /* 還沒裝第五階段：略過 */ }); }
function oceanInit() { if (!sb || !myUid) return; ocnNoteName(); ocnLoadTitleMap(); clearInterval(oceanInit.t); oceanInit.t = setInterval(() => { if (!document.hidden) ocnLoadTitleMap(); }, 90000); }
Object.assign(ERR, {
  ocean_locked: '這個還沒解鎖',
  ocean_bottle_taken: '這個漂流瓶今天已經撿過了，明天再來',
  ocean_bottle_locked: '藍洞還沒開放',
  ocean_not_in: '你還沒下水', ocean_bad_kind: '這個垃圾不能這樣放', ocean_bag_full: '回收袋滿了，先回水面的船邊回收', ocean_too_fast: '慢一點，一個一個撿',
  ocean_no_item: '袋子裡沒有這個垃圾', ocean_bad_slot: '沒有這個大件垃圾', ocean_cleared: '這個已經被清掉了'
});

let ocnRun = null, ocnMode = '', ocnBusy = false, ocnOff = 0, ocnPollAt = 0, ocnPeopleAt = 0, ocnPeople = new Map(), ocnCh = null, ocnChTok = 0, ocnSel = '', ocnWorld = null, ocnTrash = [], ocnTrashKey = '';
/* 表情：按右下的 😊 選一個，或按鍵盤 1~8；2.8 秒內同一片海的人都看得到 */
const OCN_EMO = [['👋', '嗨'], ['😄', '開心'], ['👍', '讚'], ['❤️', '愛心'], ['🙏', '謝謝'], ['❓', '疑問'], ['🎉', '加油'], ['🗑️', '這裡有垃圾']];
const ocnG = { on: false, raf: 0, last: 0, x: 0, y: 0, vx: 0, vy: 0, face: 'right', o2: 100, keys: {}, act: false, actEdge: false, others: new Map(), emo: new Map(), emoAt: 0, sendAt: 0, hold: null, pullAt: 0, bub: [], pop: [], spot: null, cam: [0, 0], picked: {}, pickAt: 0, leaving: false };
const ocnMk = (tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; return e; };
const ocnClean = () => ocnRun ? ocnRun.clean / 100 : 0;
const ocnNow = () => Date.now() + ocnOff;

/* ---------- 畫面元件 ---------- */
const ocnM = ocnMk('div', 'ocnm', 'maker'); ocnM.hidden = true; ocnM.style.zIndex = 1400;
const ocnCard = ocnMk('div', 'ocncard', 'card maker-card'); ocnCard.tabIndex = -1; ocnM.appendChild(ocnCard);
document.body.appendChild(ocnM);
const ocnGame = ocnMk('div', 'ocng'); ocnGame.hidden = true;
ocnGame.innerHTML =
  '<div class="ocg-wrap"><canvas id="ocnc" width="192" height="108"></canvas>' +
  '<div class="och ocn-o2">💧 氧氣 <b id="ocn-o2t"></b><div class="ocbar"><i id="ocn-o2i"></i></div></div>' +
  '<div class="och ocn-bag">🧺 回收袋 <b id="ocn-bagt"></b><div class="ocbar y"><i id="ocn-bagi"></i></div></div>' +
  '<div class="och ocn-cl">🌊 <span class="ocn-lbl">全服海底</span>清潔度 <b id="ocn-clt"></b><div class="ocbar g"><i id="ocn-cli"></i></div><small id="ocn-sub"></small></div>' +
  '<button type="button" class="och ocn-leave" id="ocn-leave">回船上</button>' +
  '<div class="ocprompt" id="ocn-prompt" hidden></div>' +
  '<div class="ochold" id="ocn-hold" hidden><i id="ocn-holdi"></i></div>' +
  '<div class="ocpad" id="ocn-pad"><button type="button" data-k="up">▲</button><button type="button" data-k="left">◀</button><button type="button" data-k="down">▼</button><button type="button" data-k="right">▶</button></div>' +
  '<div class="ocemo-pal" id="ocn-epal" hidden>' + OCN_EMO.map((e, i) => '<button type="button" data-e="' + i + '" title="' + e[1] + '">' + e[0] + '</button>').join('') + '</div>' +
  '<button type="button" class="ocemo-btn ocphoto-btn" id="ocn-pbtn" hidden aria-label="拍照">📷</button>' +
  '<button type="button" class="ocemo-btn" id="ocn-ebtn" aria-label="表情">😊</button>' +
  '<div class="ocstick" id="ocn-stick" hidden><i></i></div><div class="ochint" id="ocn-hint" hidden>左半邊按住拖曳，就能游動</div>' +
  '<button type="button" class="ocact" id="ocn-act">動作</button></div>';
document.body.appendChild(ocnGame);
const ocnCv = ocnGame.querySelector('#ocnc'), ocnCtx = ocnCv.getContext('2d'); ocnCtx.imageSmoothingEnabled = false;

/* ---------- 入口 ---------- */
function oceanCapBtn() { return '<button type="button" class="btn wide" data-a="ocean">🤿 潛水（保護海底）</button><button type="button" class="btn ghost wide" data-a="oceanwear">🏷️ 海洋稱號與裝飾</button>' + (typeof scgDivSeen === 'function' && scgDivSeen() ? '<button type="button" class="btn ghost wide" data-a="divstory">📖 重看潛水劇情</button>' : ''); }
async function oceanOpen() {
  if (!ready || !me || ocnBusy) return;
  ocnBusy = true;
  try {
    const st = await rpc('ocean_enter'); ocnApply(st); ocnFeedSeen = st.feed_head | 0; ocnNoteName(); await ocnLoadPeople(); ocnLoadTitleMap();
    ocnBusy = false; ocnStart();
  } catch (e) { ocnBusy = false; toast(errText(e)); }
}
function ocnApply(st) { ocnRun = st; ocnOff = (+st.now || Date.now()) - Date.now(); }
async function ocnLoadPeople() { try { const l = await rpc('ocean_people'); ocnPeople = new Map((l || []).map(p => [p.uid, p])); } catch (e) { /* 略過 */ } ocnPeopleAt = performance.now(); }

/* ---------- 地形、碰撞、區域 ---------- */
function ocnLocked(x, y) { const c = ocnClean(); return (Math.abs(x - 576) <= 62 && y >= 468 && c < 20) || (x < 332 && y > 330 && c < 40) || (x > 800 && y > 330 && c < 70); }
function ocnSolid(x, y) {
  const G = OCA.G, l = x - 4, r_ = x + 4, t = y - 6, b = y + 6, c = ocnClean();
  if (t < 14) return true;
  if (l < G.wl(t) + 2 || r_ > G.wr(t) - 2) return true;
  for (const a of G.LEDGES) if (r_ > a[0] && l < a[0] + a[2] && b > a[1] && t < a[1] + 9) return true;
  let fy = G.fl(x); if (c >= 20 && Math.abs(x - 576) <= 56) fy = 538;
  if (b > fy) return true;
  if (c < 40 && l < 330 && b > 330) return true;
  if (c < 70 && r_ > 800 && b > 330) return true;
  if (c < 20 && x > 514 && x < 638 && b > 470) return true;
  return false;
}

/* ---------- 小垃圾：每個人各自的一份（用帳號＋日期當種子），清潔度越高越少 ---------- */
function ocnRng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function ocnGenTrash() {
  const day = Math.floor((Date.now() + 8 * 3600e3) / 86400e3), key = myUid + ':' + day; if (key === ocnTrashKey) return; ocnTrashKey = key;
  let h = 7; for (const ch of key) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  const rnd = ocnRng(h), G = OCA.G, out = [], pick = a => a[Math.floor(rnd() * a.length)];
  for (let i = 0; i < 38; i++) { const x = 30 + rnd() * 1090; if (x > 505 && x < 650) continue; const t = pick(['bottle', 'can', 'cup', 'bottle', 'can']), fy = G.fl(x); out.push({ type: t, x, y: fy - (t === 'bottle' ? 8 : t === 'can' ? 6 : 5) }); }
  for (let i = 0; i < 22; i++) { const a = pick(G.LEDGES), x = a[0] + 6 + rnd() * (a[2] - 12), t = pick(['bottle', 'can', 'cup', 'bag']); out.push({ type: t, x, y: a[1] - (t === 'bottle' ? 8 : t === 'can' ? 6 : 5) }); }
  for (let i = 0; i < 26; i++) { const ch = rnd() < .5; const x = ch ? G.L + 14 + rnd() * 356 : 345 + rnd() * 440, y = ch ? 30 + rnd() * 250 : 345 + rnd() * 130; const t = rnd() < .7 ? 'bag' : 'line'; if (ocnLocked(x, y)) continue; out.push({ type: t, x, y, float: true, ph: rnd() * 6 }); }
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  out.forEach((o, i) => { o.id = i; o.ord = i / out.length; }); ocnTrash = out;
  try { ocnG.picked = JSON.parse(localStorage.getItem('ocn_pk_' + myUid) || '{}'); } catch (e) { ocnG.picked = {}; }
}
function ocnTrashLive() {
  const c = ocnClean() / 100, keep = 0.2 + 0.8 * (1 - c), now = Date.now();
  return ocnTrash.filter(o => o.ord < keep && !(ocnG.picked[o.id] && now - ocnG.picked[o.id] < OCN.RESPAWN_MS) && !ocnLocked(o.x, o.y));
}

/* ---------- 打開／關閉遊戲 ---------- */
function ocnStart() {
  ocnMode = 'game'; ocnG.on = true; ocnOpen = true; ocnM.hidden = true; pressed.length = 0; ocnFit();
  if (!ocnWorld) { const pg = g; ocnWorld = { clean: OCA.world(true), dirty: OCA.world(false) }; g = pg; }
  ocnGenTrash();
  Object.assign(ocnG, { x: OCN.SPAWN[0], y: OCN.SPAWN[1], vx: 0, vy: 0, face: 'right', o2: 100, keys: {}, act: false, actEdge: false, hold: null, pullAt: 0, bub: [], pop: [], spot: null, last: performance.now(), sendAt: 0, leaving: false });
  ocnStickEnd(); ocnG.others.clear(); ocnG.emo.clear(); (function () { let used = false; try { used = !!localStorage.getItem('dw_ocn_stick'); } catch (er) { /* 略過 */ } ocnHintEl.hidden = used || !ocnGame.classList.contains('ocg-touch'); })(); ocnEPal && (ocnEPal.hidden = true); ocnOpenChannel(ocnRun.sea); ocnGame.hidden = false;
  cancelAnimationFrame(ocnG.raf); ocnG.raf = requestAnimationFrame(ocnFrame); ocnPollAt = 0;
  toast('下水了！把垃圾撿起來，到水面的船邊分類回收。', 4200);
}
/* 手機（觸控）：畫面鋪滿整個螢幕，直拿看窄一點、橫拿看寬一點；電腦維持 16:9。畫面大小變了（轉向）就重算 */
function ocnFit() {
  const touch = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
  ocnGame.classList.toggle('ocg-touch', touch);
  let vw = 192, vh = 108;
  if (touch) { const w = window.innerWidth, h = window.innerHeight, ps = Math.max(3, Math.min(w, h) / (w > h ? 90 : 108)); vw = Math.max(96, Math.round(w / ps)); vh = Math.max(72, Math.round(h / ps)); }
  if (OCN.VW !== vw || OCN.VH !== vh) { OCN.VW = vw; OCN.VH = vh; ocnCv.width = vw; ocnCv.height = vh; ocnCtx.imageSmoothingEnabled = false; }
}
window.addEventListener('resize', () => { if (ocnG.on) ocnFit(); });
function ocnStop() { ocnG.on = false; cancelAnimationFrame(ocnG.raf); ocnGame.hidden = true; ocnCloseChannel(); ocnG.keys = {}; ocnG.act = false; if (ocnM.hidden) ocnOpen = false; }
async function ocnLeave() {
  if (ocnG.leaving) return; ocnG.leaving = true;
  ocnStop(); ocnOpen = false; try { await rpc('ocean_leave'); } catch (e) { /* 略過 */ }
  ocnG.leaving = false; try { await resync(); } catch (e) { /* 略過 */ }
}

/* ---------- Realtime：位置廣播 ---------- */
function ocnOpenChannel(sea) {
  if (!sb || !myUid) return; ocnCloseChannel();
  const tok = ++ocnChTok, ch = sb.channel('ocean:' + sea, { config: { broadcast: { self: false, ack: false } } }); ocnCh = ch;
  ch.on('broadcast', { event: 'p' }, m => {
    const p = m && m.payload; if (!p || p.u === myUid || tok !== ocnChTok) return;
    let o = ocnG.others.get(p.u); if (!o) { o = { x: +p.x, y: +p.y }; ocnG.others.set(p.u, o); ocnPeopleAt = 0; }
    o.tx = +p.x; o.ty = +p.y; o.face = p.f === 'l' ? 'left' : p.f === 'd' ? 'down' : 'right'; o.at = performance.now();
  }).on('broadcast', { event: 'e' }, m => {
    const p = m && m.payload; if (!p || p.u === myUid || tok !== ocnChTok) return; const k = p.k | 0; if (k < 0 || k >= OCN_EMO.length) return;
    ocnG.emo.set(p.u, { k, until: performance.now() + 2800 });
  }).subscribe();
}
function ocnSendEmo(k) {
  const now = performance.now(); if (!ocnG.on || k < 0 || k >= OCN_EMO.length || now - ocnG.emoAt < 900) return;
  ocnG.emoAt = now; ocnG.emo.set('me', { k, until: now + 2800 });
  if (ocnCh) { try { ocnCh.send({ type: 'broadcast', event: 'e', payload: { u: myUid, k } }); } catch (e) { /* 略過 */ } }
  document.getElementById('ocn-epal').hidden = true;
}
function ocnCloseChannel() { ocnChTok++; if (ocnCh) { try { sb.removeChannel(ocnCh); } catch (e) { /* 略過 */ } ocnCh = null; } }

/* ---------- 互動點 ---------- */
function ocnSpots() {
  const out = [], r = ocnRun;
  ocnTrashLive().forEach(o => { const y = o.float ? o.y + Math.sin(performance.now() / 700 + o.ph) * 1.5 : o.y; out.push({ id: 't' + o.id, kind: 'tap', x: o.x + 1, y: y + 3, rad: OCN.PICK_R, t: o }); });
  ((r && r.big) || []).forEach(b => { if (!b.cleared) { const p = OCN_BIG[b.slot - 1]; if (p && !ocnLocked(p[0], p[1] - 8)) out.push({ id: 'b' + b.slot, kind: 'hold', x: p[0], y: p[1] - 10, rad: OCN.BIG_R, b }); } });
  OCN_BUOY.forEach((p, i) => out.push({ id: 'buoy' + i, kind: 'tap', x: p[0], y: p[1], rad: 14 }));
  if (r && ocnClean() >= 20) OCN_BOTTLE.forEach((p, i) => { if (!((r.me.bmask | 0) & (1 << i))) out.push({ id: 'btl' + i, kind: 'tap', x: p[0], y: p[1], rad: 14, bi: i }); });
  if (ocnG.y < 30) out.push({ id: 'boat', kind: 'tap', x: ocnG.x, y: ocnG.y, rad: 99 });
  return out;
}
function ocnBagN() { const b = (ocnRun && ocnRun.me && ocnRun.me.bag) || {}; return Object.keys(b).reduce((s, k) => s + (b[k] | 0), 0); }
function ocnSpotText(s) {
  if (s.t) return ocnBagN() >= ocnRun.bag_max ? '🧺 回收袋滿了，先回水面的船邊回收' : '✋ 撿起' + OCN_ITEM[s.t.type][1];
  if (s.b) { const need = s.b.need || ocnRun.need, n = s.b.pullers; return (OCN_BIGN[s.b.kind] || '大件垃圾') + '：要 ' + need + ' 個人一起按住拉' + (ocnG.hold && ocnG.hold.id === s.id ? '（' + n + ' / ' + need + (n < need ? '，等隊友…' : '') + '）' : '，按住動作'); }
  if (s.id.startsWith('buoy')) return '🎈 浮標：按一下回到水面（氧氣補滿）';
  if (s.id.startsWith('btl')) return '✋ 撿起漂流瓶';
  if (s.id === 'boat') return ocnBagN() ? '♻ 回收分類（袋子裡有 ' + ocnBagN() + ' 個）' : '♻ 回收站：袋子是空的，下去撿一些吧';
  return '';
}
async function ocnAct(s) {
  try {
    if (s.t) {
      if (performance.now() - ocnG.pickAt < 600) return; ocnG.pickAt = performance.now();
      const r = await rpc('ocean_pick', { p_kind: s.t.type }); ocnRun.me.bag = r.bag; ocnG.picked[s.t.id] = Date.now();
      try { localStorage.setItem('ocn_pk_' + myUid, JSON.stringify(ocnG.picked)); } catch (e) { /* 略過 */ }
      ocnG.pop.push({ x: s.t.x, y: s.t.y, a: 0 });
    } else if (s.id.startsWith('btl')) {
      if (performance.now() - ocnG.pickAt < 600) return; ocnG.pickAt = performance.now();
      const r = await rpc('ocean_bottle', { p_slot: s.bi + 1 }); ocnRun.me.bmask = r.bmask; ocnRun.me.diary = r.diary; ocnRun.me.guardian = r.guardian;
      ocnG.pop.push({ x: OCN_BOTTLE[s.bi][0], y: OCN_BOTTLE[s.bi][1], a: 0 }); ocnOpenRead(r);
    } else if (s.id.startsWith('buoy')) { ocnG.x = OCN.SPAWN[0]; ocnG.y = OCN.SPAWN[1]; ocnG.vx = ocnG.vy = 0; ocnG.o2 = 100; toast('浮上水面了'); }
    else if (s.id === 'boat') ocnOpenSort();
  } catch (e) { toast(errText(e) + '〔' + String((e && (e.message || e.msg)) || e).slice(0, 80) + '〕', 5000); console.warn('ocean', e); }
}
async function ocnPull(s) {
  try {
    const r = await rpc('ocean_pull', { p_slot: s.b.slot });
    if (r.cleared) { ocnG.hold = null; ocnG.act = false; toast(r.kind === 'turtle' ? '🐢 海龜得救了！守護值 +' + r.guardian : '拉起來了！守護值 +' + r.guardian, 3600); ocnPollAt = 0; }
  } catch (e) { toast(errText(e)); ocnPollAt = 0; }
}

/* ---------- 每一格 ---------- */
function ocnFrame(now) {
  if (!ocnG.on) return;
  const dt = Math.min(0.1, (now - ocnG.last) / 1000); ocnG.last = now;
  try { ocnUpdate(dt, now); ocnDraw(now); } catch (e) { console.error(e); g = ctx; }
  ocnG.raf = requestAnimationFrame(ocnFrame);
}
function ocnRelicToast(a, b) { for (let i = 0; i < OCN_RELIC.length; i++) if (!(a & (1 << i)) && (b & (1 << i))) toast('🏺 撿到沉船古物：' + OCN_RELIC[i][0], 4200); }
function ocnUpdate(dt, now) {
  const r = ocnRun; if (!r) return;
  if (now - ocnPollAt > 1500 && !ocnG.leaving) {
    ocnPollAt = now;
    rpc('ocean_state').then(st => { if (ocnG.on) { const r0 = (ocnRun && ocnRun.me && ocnRun.me.relics) | 0; ocnApply(st); ocnCheckFeed(st); ocnRelicToast(r0, st.me.relics | 0); if (me && me.name && st.me.title) { ocnTitleMap[me.name] = st.me.title; ocnMyTitle = st.me.title; } } }).catch(e => { if (String(e && e.message || e).includes('ocean_not_in')) rpc('ocean_enter').then(st => ocnApply(st)).catch(() => {}); });
  }
  if (now - ocnPeopleAt > 6000) { ocnPeopleAt = now; ocnLoadPeople(); }
  const k = ocnG.keys; let ax = (k.right ? 1 : 0) - (k.left ? 1 : 0), ay = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (ax && ay) { ax *= .707; ay *= .707; }
  ocnG.vx += (ax * OCN.SPEED - ocnG.vx) * Math.min(1, dt * 7); ocnG.vy += (ay * OCN.SPEED - ocnG.vy) * Math.min(1, dt * 7);
  if (ocnClean() >= 20 && ocnG.y > 350 && ocnG.y < 535 && OCN_COL.some(cx => Math.abs(ocnG.x - cx) <= 9)) ocnG.vy += (-88 - ocnG.vy) * Math.min(1, dt * 4);
  const stuck = ocnSolid(ocnG.x, ocnG.y), nx = ocnG.x + ocnG.vx * dt, ny = ocnG.y + ocnG.vy * dt;
  if (stuck || !ocnSolid(nx, ocnG.y)) ocnG.x = nx; else ocnG.vx = 0;
  if (stuck || !ocnSolid(ocnG.x, ny)) ocnG.y = ny; else ocnG.vy = 0;
  if (ax) ocnG.face = ax > 0 ? 'right' : 'left';
  if (ocnG.y < 26) ocnG.o2 = Math.min(100, ocnG.o2 + dt * 40); else ocnG.o2 -= dt * 100 / OCN.O2_S;
  if (ocnG.o2 <= 0) { ocnG.o2 = 100; ocnG.x = OCN.SPAWN[0]; ocnG.y = OCN.SPAWN[1]; ocnG.vx = ocnG.vy = 0; toast('氧氣用完了，被拉回水面（東西都還在）', 3200); }
  let best = null, bd = 1e9;
  ocnSpots().forEach(s => { const d = Math.hypot(ocnG.x - s.x, ocnG.y - s.y); if (d <= s.rad && d < bd) { best = s; bd = d; } });
  ocnG.spot = best; const edge = ocnG.actEdge; ocnG.actEdge = false;
  if (best && best.kind === 'tap' && edge) ocnAct(best);
  if (best && best.kind === 'hold' && ocnG.act) {
    if (!ocnG.hold || ocnG.hold.id !== best.id) { ocnG.hold = { id: best.id, t0: now }; ocnG.pullAt = 0; }
    if (now - ocnG.pullAt > 1800) { ocnG.pullAt = now; ocnPull(best); }
  } else ocnG.hold = null;
  ocnG.others.forEach((o, u) => { if (now - o.at > 6000) { ocnG.others.delete(u); return; } o.x += (o.tx - o.x) * Math.min(1, dt * 10); o.y += (o.ty - o.y) * Math.min(1, dt * 10); });
  if (ocnCh && now - ocnG.sendAt > 120) { ocnG.sendAt = now; try { ocnCh.send({ type: 'broadcast', event: 'p', payload: { u: myUid, x: Math.round(ocnG.x * 10) / 10, y: Math.round(ocnG.y * 10) / 10, f: ocnG.face === 'left' ? 'l' : 'r' } }); } catch (e) { /* 略過 */ } }
  { const pb = document.getElementById('ocn-pbtn'); if (pb) pb.hidden = !(ocnClean() >= 70 && ocnG.x > 800 && ocnG.y > 330 && ocnGlowFrac() >= .5); }
  if (Math.random() < dt * 3) ocnG.bub.push({ x: ocnG.x + (ocnG.face === 'left' ? -3 : 3), y: ocnG.y - 8, a: 0 });
  ocnG.bub.forEach(b => { b.y -= dt * 14; b.a += dt; }); ocnG.bub = ocnG.bub.filter(b => b.a < 1.6 && b.y > 14);
  ocnG.pop.forEach(p => p.a += dt); ocnG.pop = ocnG.pop.filter(p => p.a < .8);
  ocnHud();
}

/* ---------- 畫 ---------- */
function ocnDraw(now) {
  const G = OCA.G, t = now / 1000, r = ocnRun, c = ocnClean();
  const cx = Math.max(0, Math.min(G.W - OCN.VW, Math.round(ocnG.x - OCN.VW / 2))), cy = Math.max(0, Math.min(G.H - OCN.VH, Math.round(ocnG.y - OCN.VH / 2)));
  const pg = g; g = ocnCtx; ocnCtx.clearRect(0, 0, OCN.VW, OCN.VH); ocnCtx.save(); ocnCtx.translate(-cx, -cy);
  ocnCtx.drawImage(ocnWorld.clean, 0, 0);
  const da = Math.max(0, 1 - c / 80); if (da > .01) { ocnCtx.globalAlpha = da; ocnCtx.drawImage(ocnWorld.dirty, 0, 0); ocnCtx.globalAlpha = 1; }
  /* 還沒開放的區域：霧黑 */
  ocnCtx.fillStyle = 'rgba(3,6,20,.72)';
  if (c < 40) ocnCtx.fillRect(14, 330, 318, G.H - 330);
  if (c < 70) ocnCtx.fillRect(800, 330, G.W - 814, G.H - 330);
  if (c < 20) { ocnCtx.beginPath(); ocnCtx.ellipse(576, 505, 62, 40, 0, 0, 7); ocnCtx.fill(); }
  /* 浮標 */
  OCN_BUOY.forEach((p, i) => { const y = p[1] + Math.sin(t * 1.5 + i) * 1.5; OCA.rr('rgba(255,255,255,.4)', p[0], p[1] - 90, 1, 90); OCA.disc('#ff7a3c', Math.round(p[0]), Math.round(y), 4); OCA.rr('#fff', Math.round(p[0]) - 2, Math.round(y) - 2, 2, 1); });
  /* 藍洞的漂流瓶 */
  if (c >= 20) OCN_BOTTLE.forEach((p, i) => { if ((ocnRun.me.bmask | 0) & (1 << i)) return; const by = Math.round(p[1] + Math.sin(t * 1.6 + i * 2) * 1.5), gl = .22 + .1 * Math.sin(t * 3 + i);
    ocnCtx.fillStyle = 'rgba(190,245,255,' + gl.toFixed(2) + ')'; ocnCtx.beginPath(); ocnCtx.arc(p[0], by, 9, 0, 7); ocnCtx.fill();
    OCA.rr('#a8e8ff', p[0] - 2, by - 3, 5, 8); OCA.rr('#e8fbff', p[0] - 1, by - 2, 1, 5); OCA.rr('#b0743c', p[0] - 1, by - 5, 3, 2); OCA.rr('#fff4cf', p[0], by - 1, 2, 4); });
  /* 沉船上長出來的珊瑚 */
  if (c >= 40) { const nw = Math.min(OCN_WCORAL.length, Math.floor(((r && r.wreck) | 0) / 3) * 2 + (((r && r.wreck) | 0) > 0 ? 0 : 0)); for (let i = 0; i < nw; i++) { const w = OCN_WCORAL[i]; OCA.coralB(w[0], w[1], w[2], w[3] + Math.round(Math.sin(t + i))); } }
  /* 藍洞：上升氣泡流 */
  if (c >= 20) OCN_COL.forEach((bx, k) => { for (let i = 0; i < 9; i++) { const ph = (t * .55 + i / 9 + k * .37) % 1, y = 530 - ph * 190; if (y < 350) continue; ocnCtx.strokeStyle = 'rgba(220,250,255,.75)'; ocnCtx.fillStyle = 'rgba(220,250,255,.18)'; ocnCtx.beginPath(); ocnCtx.arc(bx + Math.sin(t * 3 + i * 2) * 4, Math.round(y), (i % 3) ? 2 : 3, 0, 7); ocnCtx.fill(); ocnCtx.stroke(); } ocnCtx.fillStyle = 'rgba(170,230,255,.10)'; ocnCtx.fillRect(bx - 8, 350, 16, 180); });
  /* 洞口上方偶爾游過的大型生物（約每 70 秒一次，純氣氛） */
  if (c >= 20) { const T = 70, ph = (t % T) / 24; if (ph < 1) { const whale = Math.floor(t / T) % 2 === 0, dir = Math.floor(t / T) % 4 < 2 ? 1 : -1, x = dir > 0 ? 330 + ph * 520 : 850 - ph * 520, y = 300 + Math.sin(ph * 6) * 6; ocnDrawBig(x, y, dir, whale, 0); } }
  /* 生物 */
  OCN_SCHOOL.forEach((s, i) => { if (c < s[5]) return; for (let k = 0; k < s[4]; k++) { const x = s[0] + Math.sin(t * .4 + k * 1.3 + i) * s[2], dir = Math.cos(t * .4 + k * 1.3 + i) > 0 ? 1 : -1; const fy = s[1] + Math.sin(t + k * 2) * 6 + (k % 3) * 5; OCA.fish(x, fy, s[3], dir); ocnSee(12, x, fy); } });
  if (c >= 25) { const tx = Math.round(640 + Math.sin(t * .2) * 60); OCA.turtle(tx, 150, Math.cos(t * .2) > 0 ? 1 : -1); ocnSee(13, tx, 150); }
  if (c >= 50) { const tx = Math.round(520 + Math.sin(t * .15) * 120); OCA.turtle(tx, 420, Math.cos(t * .15) > 0 ? 1 : -1); ocnSee(13, tx, 420); }
  OCN_JELLY.forEach((j, i) => { if (c >= j[3]) { const jx = j[0] + Math.sin(t * .8 + i) * 8, jy = j[1] + Math.cos(t * 1.1 + i * 2) * 5; OCA.jelly(jx, jy, j[2], t); ocnSee(14, jx, jy); } });
  ocnDrawLife(t, c);
  if (c >= 70) { OCA.anglerfish(960, 498, t); ocnSee(15, 960, 498); } if (c >= 40) { OCA.anglerfish(120, 470, t); ocnSee(15, 120, 470); }
  /* 發光洞：平時暗，珊瑚燈由全服進度點亮 */
  if (c >= 70) ocnGlowCave(t);
  /* 大件垃圾 */
  ((r && r.big) || []).forEach(b => {
    const p = OCN_BIG[b.slot - 1]; if (!p || b.cleared) return;
    if (b.kind === 'tire') { OCA.tire(p[0], p[1] - 5); OCA.tire(p[0] + 8, p[1] - 9); OCA.tire(p[0] - 7, p[1] - 3); }
    else if (b.kind === 'anchor') { const x = p[0], y = p[1]; OCA.rr('#5a5f66', x - 2, y - 30, 4, 28); OCA.rr('#5a5f66', x - 9, y - 26, 18, 3); OCA.rr('#8a9098', x - 2, y - 30, 1, 28); OCA.rr('#5a5f66', x - 12, y - 8, 4, 4); OCA.rr('#5a5f66', x - 10, y - 4, 20, 3); OCA.rr('#5a5f66', x + 8, y - 8, 4, 4); OCA.rr('#7a4a2a', x - 4, y - 33, 8, 3); }
    else if (b.kind === 'chain') { for (let i = 0; i < 9; i++) { const x = p[0] - 14 + i * 3.5, y = p[1] - 4 - Math.sin(i * .7) * 7; OCA.rr('#7a4a2a', Math.round(x), Math.round(y), 4, 3); OCA.rr('#a8643a', Math.round(x), Math.round(y), 2, 1); } }
    else if (b.kind === 'hatch') { const x = p[0], y = p[1]; OCA.rr('#4e3626', x - 14, y - 24, 28, 22); OCA.rr('#6b4a35', x - 12, y - 22, 24, 18); for (let i = 0; i < 4; i++) OCA.rr('#2f1e12', x - 10 + i * 6, y - 22, 1, 18); OCA.rr('#7a8088', x - 2, y - 15, 4, 4); OCA.rr('#5a5f66', x - 14, y - 24, 28, 1); }
    else { OCA.net(p[0] - 13, p[1] - 28, 28, 26, 'rgba(110,200,120,.9)'); if (b.kind === 'turtle') OCA.turtle(p[0] - 7, p[1] - 20, 1); }
    if (b.pullers > 0) OCA.rr('rgba(255,230,120,.5)', p[0] - 14, p[1] - 30, 30, 1);
  });
  /* 小垃圾 */
  ocnTrashLive().forEach(o => {
    const y = o.float ? o.y + Math.sin(t * 1.4 + o.ph) * 1.5 : o.y, x = Math.round(o.x);
    if (o.type === 'bag') OCA.tbag(x, y, t + o.ph); else if (o.type === 'bottle') OCA.bottle(x, Math.round(y)); else if (o.type === 'can') OCA.tcan(x, Math.round(y)); else if (o.type === 'cup') OCA.cup(x, Math.round(y)); else OCA.line(x - 6, Math.round(y), 13);
  });
  ocnG.pop.forEach(p => { OCA.sparkle(p.x, p.y - p.a * 12, '#fff7b0'); });
  ocnG.bub.forEach(b => OCA.bub(b.x + Math.sin(b.a * 6) * 1.5, b.y, b.a < .8 ? 2 : 1));
  /* 玩家 */
  const lookOf = u => Object.assign({}, DEF_CHAR, (ocnPeople.get(u) || {}).look || {}, { hat: 3 });
  ocnG.others.forEach((o, u) => OCA.diver(Math.round(o.x - 8), Math.round(o.y - 10 + Math.sin(t * 2 + o.x)), o.face, lookOf(u), (ocnPeople.get(u) || {}).gear, t));
  const moving = Math.abs(ocnG.vx) + Math.abs(ocnG.vy) > 6;
  OCA.diver(Math.round(ocnG.x - 8), Math.round(ocnG.y - 10 + (moving ? 0 : Math.sin(t * 2))), moving || ocnG.face === 'left' ? ocnG.face : 'down', Object.assign({}, DEF_CHAR, (me && me.look) || {}, { hat: 3 }), r && r.me && r.me.gear, t);
  ocnCtx.restore();
  const dark = Math.max(0, Math.min(.3, (ocnG.y - 160) / 900)); if (dark > 0) { ocnCtx.fillStyle = 'rgba(0,6,26,' + dark.toFixed(2) + ')'; ocnCtx.fillRect(0, 0, OCN.VW, OCN.VH); }
  if (ocnG.o2 < 25 && Math.sin(t * 8) > 0) { ocnCtx.fillStyle = 'rgba(255,0,0,.1)'; ocnCtx.fillRect(0, 0, OCN.VW, OCN.VH); }
  g = pg === ocnCtx ? ctx : pg; ocnG.cam = [cx, cy]; ocnTags(cx, cy);
}
const ocnTagEls = new Map();
/* 新生物：游動、爬行、定點；走近就記進圖鑑 */
let ocnDexBusy = 0;
function ocnSee(bit, x, y) {
  if (!ocnRun || !ocnRun.me || (ocnRun.me.dex >> bit) & 1 || ocnDexBusy > performance.now()) return;
  if (Math.hypot(x - ocnG.x, y - ocnG.y) > 44) return;
  ocnDexBusy = performance.now() + 1500;
  rpc('ocean_dex', { p_bit: bit }).then(r => {
    if (!ocnRun || !ocnRun.me) return; ocnRun.me.dex = r.dex; ocnRun.me.guardian = r.guardian;
    if (r.new) { let n = 0; for (let i = 0; i < 16; i++) if ((r.dex >> i) & 1) n++; toast('📖 圖鑑新增：' + OCN_DEX[bit][0] + '（' + n + ' / 16）　守護值 +4' + (r.dex === 65535 ? '　🎉 集滿了！獲得稱號「海洋觀察家」' : ''), 4200); }
    ocnDexBusy = 0;
  }).catch(() => { ocnDexBusy = performance.now() + 20000; });
}
function ocnDrawLife(t, c) {
  const L = OCA.LIFE, G = OCA.G;
  OCN_LIFE.forEach((o, i) => {
    if (c < o.c) return;
    let x = o.x, y = o.y, dir = 1;
    if (o.g) {
      if (o.rng) { x = o.x + Math.sin(t * o.sp * .6 + i) * o.rng; dir = Math.cos(t * o.sp * .6 + i) > 0 ? 1 : -1; }
      y = (Math.abs(x - 576) <= 56 && c >= 20 ? 538 : G.fl(x));
      if (o.k === 'crab') { y -= 4; L.crab(x, y, dir, t * (o.rng ? 1 : 0)); }
      else if (o.k === 'starfish') { y -= 2; L.starfish(x, y, o.col); }
      else if (o.k === 'urchin') { y -= 3; L.urchin(x, y, o.col); }
      else { y -= 2; L.anemone(x, y, t); if (o.x < 800 || c >= 70) { L.clown(x + Math.sin(t * .8 + i) * 4, y - 14 + Math.sin(t * 1.6 + i), Math.cos(t * .8 + i) > 0 ? 1 : -1, t); ocnSee(0, x, y - 14); } }
      ocnSee(o.bit, x, y); return;
    }
    if (o.rng) { x = o.x + Math.sin(t * o.sp + i * 1.7) * o.rng; dir = Math.cos(t * o.sp + i * 1.7) > 0 ? 1 : -1; y = o.y + Math.sin(t * .9 + i) * 5; }
    else y = o.y + Math.sin(t * 1.1 + i) * 3;
    x = Math.round(x); y = Math.round(y);
    if (o.k === 'seahorse') { L.seahorse(x, y - 4, 1, t); ocnSee(o.bit, x, y); return; }
    if (o.k === 'octopus') { L.octopus(x, y, 1, t); ocnSee(o.bit, x, y); return; }
    L[o.k](x, y, dir, t); ocnSee(o.bit, x, y);
  });
}
const ocnDark = document.createElement('canvas'); ocnDark.width = 356; ocnDark.height = 216; const ocnDarkX = ocnDark.getContext('2d');
function ocnGlowFrac() { return Math.min(1, ((ocnRun && ocnRun.glow) | 0) / OCN_GLOW_MAX); }
function ocnDrawBig(x, y, dir, whale, glow) {
  const L = whale ? 64 : 40, col = glow ? 'rgba(150,245,255,.9)' : 'rgba(10,30,60,.5)', col2 = glow ? 'rgba(230,255,255,.95)' : 'rgba(10,30,60,.38)';
  const f = Math.sin(performance.now() / 500) * 3; ocnCtx.fillStyle = col; ocnCtx.beginPath();
  if (whale) { ocnCtx.ellipse(x, y, L / 2, 11, 0, 0, 7); ocnCtx.fill(); ocnCtx.beginPath(); ocnCtx.moveTo(x - dir * L / 2, y); ocnCtx.lineTo(x - dir * (L / 2 + 14), y - 9 + f); ocnCtx.lineTo(x - dir * (L / 2 + 14), y + 9 + f); ocnCtx.fill(); ocnCtx.fillStyle = col2; ocnCtx.beginPath(); ocnCtx.ellipse(x + dir * 6, y + 5, L / 3, 4, 0, 0, 7); ocnCtx.fill(); }
  else { ocnCtx.moveTo(x + dir * L / 2, y); ocnCtx.quadraticCurveTo(x, y - 20 + f, x - dir * L / 2, y - 2); ocnCtx.quadraticCurveTo(x - dir * 6, y + 4, x - dir * L / 2, y + 2); ocnCtx.quadraticCurveTo(x, y + 14 - f, x + dir * L / 2, y); ocnCtx.fill(); ocnCtx.fillRect(x - dir * L / 2 - dir * 12, y - 1, 12, 1); }
  if (glow) { ocnCtx.fillStyle = col2; ocnCtx.fillRect(Math.round(x + dir * 4), Math.round(y - 2), 2, 2); }
}
function ocnGlowCave(t) {
  const fr = ocnGlowFrac(), lit = Math.floor(fr * OCN_LAMP.length), X0 = 800, Y0 = 330;
  OCN_LAMP.forEach((l, i) => { const on = i < lit, c = ['#7fe3ea', '#b36bd6', '#ff8aa8', '#7fffd4'][i % 4]; OCA.coralB(l[0], l[1], on ? c : '#3a4a68', 9 + (i % 3) * 2); });
  const d = ocnDarkX; d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, 356, 216); d.fillStyle = 'rgba(2,4,18,.66)'; d.fillRect(0, 0, 356, 216); d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, rad, a) => { const gr = d.createRadialGradient(x - X0, y - Y0, 2, x - X0, y - Y0, rad); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.beginPath(); d.arc(x - X0, y - Y0, rad, 0, 7); d.fill(); };
  OCN_LAMP.forEach((l, i) => { if (i < lit) hole(l[0], l[1] - 6, 34 + Math.sin(t * 2 + i) * 2, .9); });
  if (ocnRun && ocnRun.me && ocnRun.me.gear === 'glow') hole(ocnG.x, ocnG.y, 46, .95);
  ocnG.others.forEach((o, u) => { if ((ocnPeople.get(u) || {}).gear === 'glow') hole(o.x, o.y, 46, .95); });
  d.globalCompositeOperation = 'source-over'; ocnCtx.drawImage(ocnDark, X0, Y0);
  if (fr >= .5) ocnDrawBig(840 + ((t * 8) % 260), 380 + Math.sin(t) * 8, 1, false, 1);
  if (fr >= 1) ocnDrawBig(1040 - ((t * 5) % 220), 440 + Math.sin(t * .7) * 6, -1, true, 1);
}
function ocnTags(cx, cy) {
  const wrap = ocnGame.querySelector('.ocg-wrap'), k = wrap.clientWidth / OCN.VW, used = new Set();
  const put = (id, name, x, y, mine, tk) => { used.add(id); let e = ocnTagEls.get(id); if (!e) { e = ocnMk('div', '', 'octag' + (mine ? ' me' : '')); wrap.appendChild(e); ocnTagEls.set(id, e); } const hh = ocnPill(tk) + esc(name); if (e.dataset.h !== hh) { e.dataset.h = hh; e.innerHTML = hh; } e.style.left = ((x - cx) * k) + 'px'; e.style.top = ((y - cy - 13) * k) + 'px'; };
  put('me', (me && (me.name || (me.look && me.look.name))) || '我', ocnG.x, ocnG.y, true, ocnRun && ocnRun.me && ocnRun.me.title);
  ocnG.others.forEach((o, u) => put(u, (ocnPeople.get(u) || {}).name || '潛水員', o.x, o.y, false, (ocnPeople.get(u) || {}).title));
  ocnTagEls.forEach((e, id) => { if (id.slice(0, 2) !== 'e:' && !used.has(id)) { e.remove(); ocnTagEls.delete(id); } });
  const nowp = performance.now(), pos = id => id === 'me' ? [ocnG.x, ocnG.y] : (ocnG.others.get(id) ? [ocnG.others.get(id).x, ocnG.others.get(id).y] : null);
  ocnG.emo.forEach((em, id) => {
    const p = pos(id), key = 'e:' + id; let e = ocnTagEls.get(key);
    if (nowp > em.until || !p) { ocnG.emo.delete(id); if (e) { e.remove(); ocnTagEls.delete(key); } return; }
    if (!e) { e = ocnMk('div', '', 'ocemo'); wrap.appendChild(e); ocnTagEls.set(key, e); e.dataset.k = ''; }
    if (e.dataset.k !== String(em.k + ':' + em.until)) { e.dataset.k = em.k + ':' + em.until; e.textContent = OCN_EMO[em.k][0]; e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; }
    e.style.left = ((p[0] - cx) * k) + 'px'; e.style.top = ((p[1] - cy - 13) * k - 20) + 'px'; used.add(key);
  });
}
function ocnHud() {
  const r = ocnRun, set = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; };
  set('ocn-o2t', Math.max(0, Math.round(ocnG.o2)) + '%'); document.getElementById('ocn-o2i').style.width = Math.max(0, ocnG.o2) + '%'; document.getElementById('ocn-o2i').className = ocnG.o2 < 25 ? 'low' : '';
  const n = ocnBagN(); set('ocn-bagt', n + ' / ' + r.bag_max); document.getElementById('ocn-bagi').style.width = Math.min(100, n / r.bag_max * 100) + '%';
  set('ocn-clt', (r.clean / 100).toFixed(1) + '%'); document.getElementById('ocn-cli').style.width = (r.clean / 100) + '%';
  set('ocn-sub', '🛡 守護值 ' + r.me.guardian + '　👥 這片海 ' + r.online + '/' + r.cap + '　🐢 全服已救 ' + r.rescued);
  const pr = document.getElementById('ocn-prompt'), s = ocnG.spot; const txt = s ? ocnSpotText(s) : '';
  if (txt) { if (pr.textContent !== txt) pr.textContent = txt; pr.hidden = false; } else pr.hidden = true;
  const hd = document.getElementById('ocn-hold');
  if (ocnG.hold && s && s.b) { hd.hidden = false; document.getElementById('ocn-holdi').style.width = Math.min(100, s.b.pullers / (s.b.need || r.need) * 100) + '%'; } else hd.hidden = true;
}

/* ---------- 回收分類 ---------- */
function ocnIcon(type) {
  const c = document.createElement('canvas'); c.width = 14; c.height = 14; c.className = 'ocico'; const x = c.getContext('2d'), pg = g; g = x; x.imageSmoothingEnabled = false;
  x.fillStyle = '#9fd8ec'; x.fillRect(0, 0, 14, 14);
  try { if (type === 'bag') OCA.tbag(7, 7, 0); else if (type === 'bottle') OCA.bottle(5, 3); else if (type === 'can') OCA.tcan(5, 4); else if (type === 'cup') OCA.cup(4, 5); else OCA.line(0, 7, 14); } catch (e) { /* 略過 */ }
  g = pg === x ? ctx : pg; return c;
}
function ocnOpenSort() { ocnMode = 'sort'; ocnOpen = true; pressed.length = 0; ocnM.hidden = false; ocnG.keys = {}; ocnG.act = false; ocnRenderSort(); ocnCard.focus(); }
function ocnCloseSort() { ocnM.hidden = true; ocnMode = ocnG.on ? 'game' : ''; if (!ocnG.on) ocnOpen = false; }
function ocnRenderSort() {
  const r = ocnRun, bag = r.me.bag || {}, types = Object.keys(OCN_ITEM).filter(k => (bag[k] | 0) > 0);
  if (!types.includes(ocnSel)) ocnSel = types[0] || '';
  let h = '<div class="shop-h"><h2>♻ 回收站</h2><span class="chip">🛡 守護值 ' + r.me.guardian + '</span></div>';
  h += '<p class="empty">先點袋子裡的垃圾，再點它該丟的桶子。分對才算，分錯會退回。<br>全服清潔度 <b>' + (r.clean / 100).toFixed(1) + '%</b></p>';
  h += types.length ? '<div class="ocitems">' + types.map(k => '<button type="button" class="ocitem' + (k === ocnSel ? ' on' : '') + '" data-i="' + k + '"><span class="ocic" data-t="' + k + '"></span>' + OCN_ITEM[k][1] + ' ×' + bag[k] + '</button>').join('') + '</div>' : '<p class="empty">袋子是空的。</p>';
  h += '<div class="ocbins">' + Object.keys(OCN_BIN).map(b => '<button type="button" class="ocbinb b-' + b + '" data-b="' + b + '"' + (!ocnSel || ocnBusy ? ' disabled' : '') + '><span>' + OCN_BIN[b][0] + '</span>' + OCN_BIN[b][1] + '</button>').join('') + '</div>';
  h += '<p class="empty" style="margin-top:6px">塑膠：袋子、瓶子　金屬：鋁罐　漁網：釣魚線　其他：保麗龍杯</p><button type="button" class="btn ghost wide" data-a="wear">🏷️ 稱號與裝飾</button><button type="button" class="btn ghost wide" data-a="close">回到海裡</button>';
  ocnCard.innerHTML = h; ocnCard.querySelectorAll('.ocic').forEach(e => e.appendChild(ocnIcon(e.dataset.t)));
}
/* 漂流瓶讀信、日記本 */
function ocnOpenRead(r) {
  ocnMode = 'read'; ocnOpen = true; pressed.length = 0; ocnM.hidden = false; ocnG.keys = {}; ocnG.act = false;
  const d = r.kind === 'diary';
  let h = '<div class="shop-h"><h2>' + (d ? '📖 船長日記　第 ' + (r.n + 1) + ' 張' : '🌊 海洋小知識') + '</h2><span class="chip">🛡 +' + r.gain + '</span></div>';
  h += '<p style="line-height:1.8;font-size:15px;margin:10px 4px;white-space:pre-wrap">' + esc(d ? OCN_DIARY[r.n] || '' : OCN_TIPS[r.n] || '') + '</p>';
  if (d) h += '<p class="empty">日記 ' + r.diary + ' / 8' + (r.diary >= 8 ? '　🎉 集齊了！獲得稱號「船長的老朋友」' : '') + '</p>';
  else h += '<p class="empty">今天的漂流瓶還沒撿完的話，藍洞裡還有。</p>';
  h += '<button type="button" class="btn wide" data-a="rclose">收起來</button>';
  ocnCard.innerHTML = h; ocnCard.focus();
}
function ocnOpenDex() {
  ocnMode = 'diary'; const m = (ocnWear && ocnWear.dex) | 0; let n = 0; for (let i = 0; i < 16; i++) if ((m >> i) & 1) n++;
  let h = '<div class="shop-h"><h2>📖 海洋圖鑑</h2><span class="chip">' + n + ' / 16</span></div><p class="empty">靠近生物就會記進圖鑑，每種第一次 +4 守護值；集滿 16 種拿稱號「海洋觀察家」。</p><div class="ocdex">';
  h += OCN_DEX.map((d, i) => ((m >> i) & 1) ? '<div class="ocdx"><span class="ocdc" data-i="' + i + '"></span><b>' + d[0] + '</b><small>' + d[1] + '</small></div>' : '<div class="ocdx lock"><span class="ocdc q">？</span><b>？？？</b><small>' + d[2] + '</small></div>').join('');
  h += '</div><button type="button" class="btn ghost wide" data-a="wearback">返回</button>'; ocnCard.innerHTML = h;
  ocnCard.querySelectorAll('.ocdc[data-i]').forEach(e => { const i = +e.dataset.i, c = document.createElement('canvas'); c.width = 40; c.height = 28; const x = c.getContext('2d'), pg = g; g = x; x.imageSmoothingEnabled = false;
    const bg = x.createLinearGradient(0, 0, 0, 28); bg.addColorStop(0, '#5ec6d6'); bg.addColorStop(1, '#2a6cae'); x.fillStyle = bg; x.fillRect(0, 0, 40, 28);
    try { const L = OCA.LIFE; ({ 0: () => L.clown(20, 14, 1, 1), 1: () => L.tang(20, 14, 1, 1), 2: () => L.butterfly(20, 14, 1, 1), 3: () => L.puffer(20, 14, 1, 1), 4: () => L.seahorse(18, 10, 1, 1), 5: () => L.ray(22, 14, 1, 1), 6: () => L.shark(26, 14, 1, 1), 7: () => L.octopus(20, 12, 1, 1), 8: () => L.crab(20, 16, 1, 0), 9: () => L.starfish(20, 15, '#ff7a4a'), 10: () => L.urchin(20, 15, '#5a2a8a'), 11: () => L.anemone(20, 22, 1), 12: () => { OCA.fish(12, 8, '#ff9a3c', 1); OCA.fish(22, 15, '#ffd84a', 1); OCA.fish(14, 20, '#6fd0ff', 1); }, 13: () => OCA.turtle(20, 14, 1), 14: () => OCA.jelly(20, 9, '#ff9bdf', 1), 15: () => OCA.anglerfish(22, 16, 1) })[i](); } catch (err) { /* 略過 */ }
    g = pg === x ? ctx : pg; e.appendChild(c); });
  ocnCard.focus();
}
function ocnOpenRelics() {
  ocnMode = 'diary'; const m = (ocnWear && ocnWear.relics) | 0, n = OCN_RELIC.filter((_, i) => m & (1 << i)).length;
  let h = '<div class="shop-h"><h2>🏺 沉船古物</h2><span class="chip">' + n + ' / ' + OCN_RELIC.length + '</span></div><p class="empty">沉船墳場（清潔度 40% 開放）的殘骸要 3 個人一起拉，拉開後每個人都會撿到一件古物，重複的會換成守護值。</p>';
  h += OCN_RELIC.map((x, i) => (m & (1 << i)) ? '<p style="line-height:1.6;font-size:14px;margin:6px 2px">🏺 <b>' + x[0] + '</b>　' + x[1] + '</p>' : '<p style="margin:6px 2px;opacity:.5">🔒 ？？？</p>').join('');
  h += '<button type="button" class="btn ghost wide" data-a="wearback">返回</button>'; ocnCard.innerHTML = h; ocnCard.focus();
}
function ocnOpenDiary() {
  ocnMode = 'diary'; const n = (ocnWear && ocnWear.diary) | 0;
  let h = '<div class="shop-h"><h2>📖 船長日記</h2><span class="chip">' + n + ' / 8</span></div>';
  h += n ? OCN_DIARY.slice(0, n).map((t, i) => '<p style="line-height:1.7;font-size:14px;margin:6px 2px"><b>第 ' + (i + 1) + ' 張</b>　' + esc(t) + '</p>').join('') : '<p class="empty">還沒有日記。藍洞（清潔度 20% 開放）裡的漂流瓶會有。</p>';
  h += '<button type="button" class="btn ghost wide" data-a="wearback">返回</button>';
  ocnCard.innerHTML = h; ocnCard.focus();
}
ocnCard.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b || ocnBusy) return;
  if (b.dataset.a === 'close') { ocnCloseSort(); return; }
  if (b.dataset.a === 'wear') { ocnOpenWear(); return; }
  if (b.dataset.a === 'rclose') { ocnCloseSort(); return; }
  if (b.dataset.a === 'diary') { ocnOpenDiary(); return; }
  if (b.dataset.a === 'relics') { ocnOpenRelics(); return; }
  if (b.dataset.a === 'dex') { ocnOpenDex(); return; }
  if (b.dataset.a === 'wearback') { ocnMode = 'wear'; ocnRenderWear(); return; }
  if (b.dataset.a === 'back') { if (ocnG.on) { ocnMode = 'sort'; ocnRenderSort(); } else ocnCloseSort(); return; }
  if (b.dataset.t !== undefined || b.dataset.g !== undefined) { ocnWearPick(b); return; }
  if (b.dataset.i) { ocnSel = b.dataset.i; ocnRenderSort(); return; }
  if (b.dataset.b && ocnSel) {
    ocnBusy = true;
    try {
      const r = await rpc('ocean_sort', { p_item: ocnSel, p_bin: b.dataset.b }); ocnRun.me.bag = r.bag;
      if (r.ok) { ocnRun.me.guardian = r.guardian; ocnRun.clean = r.clean; toast('分對了！守護值 +1（今天 ' + r.today + ' 個）', 1800); } else { toast('分錯了，退回袋子裡', 1800); ocnCard.classList.add('shake'); setTimeout(() => ocnCard.classList.remove('shake'), 400); }
    } catch (err) { toast(errText(err) + '〔' + String((err && (err.message || err.msg)) || err).slice(0, 80) + '〕', 5000); console.warn('ocean', err); }
    ocnBusy = false; ocnRenderSort();
  }
});
ocnM.addEventListener('pointerdown', e => { if (e.target === ocnM) ocnCloseSort(); });

/* ---------- 全服動態與里程碑 ---------- */
const ocnFeedBox = ocnMk('div', 'ocn-feed', 'ocfeed'); ocnGame.querySelector('.ocg-wrap').appendChild(ocnFeedBox);
const ocnBannerEl = ocnMk('div', 'ocn-banner', 'ocbanner'); ocnBannerEl.hidden = true; ocnGame.querySelector('.ocg-wrap').appendChild(ocnBannerEl);
const OCN_MS = { 20: '🕳 藍洞開放了，大家一起去看看吧', 40: '🚢 沉船墳場開放了，大家一起去看看吧', 70: '✨ 發光洞開放了，大家一起去看看吧' };
function ocnFeedLine(f) {
  if (f.kind === 'rescue') return '🐢 <b>' + esc(f.a) + '</b> 救出了一隻海龜！';
  if (f.kind === 'big') return '🕸 <b>' + esc(f.a) + '</b> 一起清掉了' + (OCN_BIGN[f.b] || '大件垃圾');
  if (f.kind === 'title') return '🏷 <b>' + esc(f.a) + '</b> 拿到稱號「' + ((OCN_TITLE[f.b] || [])[1] || '') + '」';
  return '';
}
function ocnCheckFeed(st) {
  if ((st.feed_head | 0) <= ocnFeedSeen) return;
  const after = ocnFeedSeen; ocnFeedSeen = st.feed_head | 0;
  rpc('ocean_feed', { p_after: after }).then(list => (list || []).forEach(f => {
    if (f.kind === 'milestone') { ocnBannerEl.innerHTML = '🎉 全服海底清潔度突破 ' + f.n + '%！<br><small>' + (OCN_MS[f.n] || '') + '</small>'; ocnBannerEl.hidden = false; clearTimeout(ocnBanner); ocnBanner = setTimeout(() => { ocnBannerEl.hidden = true; }, 7000); return; }
    const h = ocnFeedLine(f); if (!h) return;
    const e = ocnMk('div', '', 'ocfl'); e.innerHTML = h; ocnFeedBox.appendChild(e); while (ocnFeedBox.children.length > 4) ocnFeedBox.firstChild.remove();
    setTimeout(() => e.remove(), 14000);
  })).catch(() => {});
}

/* ---------- 稱號與裝飾（名片）---------- */
let ocnWear = null;
async function ocnOpenWear() {
  if (!ready || !me) return;
  ocnMode = 'wear'; ocnOpen = true; pressed.length = 0; ocnM.hidden = false; ocnG.keys = {}; ocnG.act = false; ocnCard.innerHTML = '<p class="empty">讀取中…</p>';
  try { ocnWear = await rpc('ocean_me'); } catch (e) { toast(errText(e)); ocnWear = null; }
  ocnRenderWear(); ocnCard.focus();
}
function ocnRenderWear() {
  const w = ocnWear; if (!w) { ocnCard.innerHTML = '<p class="empty">讀取失敗。</p><button type="button" class="btn ghost wide" data-a="back">返回</button>'; return; }
  let h = '<div class="shop-h"><h2>🏷️ 稱號與裝飾</h2><span class="chip">🛡 守護值 ' + w.guardian + '</span></div>';
  h += '<p class="empty"><b>稱號</b>（顯示在名字前面；點已解鎖的來戴，再點一次取消，沒選就戴最高的）</p><div class="ocwtl">';
  h += Object.keys(OCN_TITLE).map(k => { const has = (w.titles || []).includes(k); return '<button type="button" class="ocw' + (has ? '' : ' lock') + (w.title === k ? ' on' : '') + '" data-t="' + k + '"' + (has ? '' : ' disabled') + '><span class="octt" style="background:' + OCN_TITLE[k][0] + '">' + OCN_TITLE[k][1] + '</span><small>' + (has ? '已解鎖' : '🔒 ' + OCN_TREQ[k]) + '</small></button>'; }).join('');
  h += '</div><p class="empty" style="margin-top:8px"><b>潛水裝飾</b>（只換顏色，水裡和廣場上的潛水員都看得到）</p><div class="ocwgl">';
  h += Object.keys(OCN_GEAR).map(k => { const has = (w.gears || []).includes(k); return '<button type="button" class="ocw' + (has ? '' : ' lock') + (w.gear === k ? ' on' : '') + '" data-g="' + k + '"' + (has ? '' : ' disabled') + '><span class="ocwv" data-g="' + k + '"></span><b>' + OCN_GEAR[k][0] + '</b><small>' + (has ? '已解鎖' : '🔒 ' + OCN_GEAR[k][1]) + '</small></button>'; }).join('');
  h += '</div><button type="button" class="btn ghost wide" data-a="diary">📖 船長日記（' + ((w.diary | 0)) + ' / 8）</button><button type="button" class="btn ghost wide" data-a="dex">📖 海洋圖鑑（' + (() => { let n = 0; for (let i = 0; i < 16; i++) if (((w.dex | 0) >> i) & 1) n++; return n; })() + ' / 16）</button><button type="button" class="btn ghost wide" data-a="relics">🏺 沉船古物（' + OCN_RELIC.filter((_, i) => (w.relics | 0) & (1 << i)).length + ' / ' + OCN_RELIC.length + '）</button><button type="button" class="btn ghost wide" data-a="back">' + (ocnG.on ? '返回' : '關閉') + '</button>';
  ocnCard.innerHTML = h;
  ocnCard.querySelectorAll('.ocwv').forEach(e => { const c = document.createElement('canvas'); c.width = 28; c.height = 30; c.className = 'ocwc'; const x = c.getContext('2d'), pg = g; g = x; x.imageSmoothingEnabled = false;
    const bg = x.createLinearGradient(0, 0, 0, 30); bg.addColorStop(0, '#7fe3ea'); bg.addColorStop(1, '#2a86c4'); x.fillStyle = bg; x.fillRect(0, 0, 28, 30);
    try { OCA.diver(6, 5, 'down', Object.assign({}, DEF_CHAR, (me && me.look) || {}, { hat: 3 }), e.dataset.g, 0); } catch (err) { /* 略過 */ } g = pg === x ? ctx : pg; e.appendChild(c); });
}
async function ocnWearPick(b) {
  if (ocnBusy || !ocnWear) return; ocnBusy = true;
  try {
    const t = b.dataset.t !== undefined ? (ocnWear.title === b.dataset.t ? '' : b.dataset.t) : (ocnWear.title || ''), gr = b.dataset.g !== undefined ? b.dataset.g : ocnWear.gear;
    const r = await rpc('ocean_set', { p_title: t, p_gear: gr }); ocnWear.title = r.title; ocnWear.gear = r.gear;
    if (ocnRun && ocnRun.me) { ocnRun.me.title = r.title; ocnRun.me.gear = r.gear; } if (me && me.name) { if (r.title) { ocnTitleMap[me.name] = r.title; ocnMyTitle = r.title; } else { delete ocnTitleMap[me.name]; ocnMyTitle = null; ocnNoteName(); } }
  } catch (e) { toast(errText(e)); }
  ocnBusy = false; ocnRenderWear();
}

/* ---------- 輸入 ---------- */
const OCN_KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
const ocnIsAct = k => k === ' ' || k === 'e' || k === 'E' || k === 'Enter' || k === 'z' || k === 'Z';
window.addEventListener('keydown', e => {
  if (!ocnOpen) return; const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'SELECT' || tg === 'TEXTAREA') return;
  if (ocnMode === 'sort' || ocnMode === 'wear' || ocnMode === 'read' || ocnMode === 'diary') { if (e.key === 'Escape') { ocnCloseSort(); e.stopImmediatePropagation(); } return; }
  if (!ocnG.on) return;
  if (OCN_KEYS[e.key]) { ocnG.keys[OCN_KEYS[e.key]] = true; e.preventDefault(); e.stopImmediatePropagation(); }
  else if (ocnIsAct(e.key)) { if (!e.repeat) ocnG.actEdge = true; ocnG.act = true; e.preventDefault(); e.stopImmediatePropagation(); }
  else if (e.key >= '1' && e.key <= '8' && !e.repeat) { ocnSendEmo(+e.key - 1); e.preventDefault(); e.stopImmediatePropagation(); }
  else if (e.key === 'Escape') { ocnLeave(); e.stopImmediatePropagation(); }
}, true);
window.addEventListener('keyup', e => { if (!ocnG.on) return; if (OCN_KEYS[e.key]) ocnG.keys[OCN_KEYS[e.key]] = false; else if (ocnIsAct(e.key)) ocnG.act = false; }, true);
window.addEventListener('blur', () => { ocnG.keys = {}; ocnG.act = false; });
ocnGame.querySelector('#ocn-pad').addEventListener('pointerdown', e => { const b = e.target.closest('button[data-k]'); if (!b) return; ocnG.keys[b.dataset.k] = true; b.setPointerCapture && b.setPointerCapture(e.pointerId); e.preventDefault(); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => ocnGame.querySelector('#ocn-pad').addEventListener(ev, e => { const b = e.target.closest('button[data-k]'); if (b) ocnG.keys[b.dataset.k] = false; }));
const ocnActBtn = ocnGame.querySelector('#ocn-act');
ocnActBtn.addEventListener('pointerdown', e => { ocnG.actEdge = true; ocnG.act = true; e.preventDefault(); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => ocnActBtn.addEventListener(ev, () => { ocnG.act = false; }));
/* 浮動搖桿：手機上，在左半邊任何地方按住拖曳，搖桿就出現在手指下 */
const ocnStickEl = ocnGame.querySelector('#ocn-stick'), ocnHintEl = ocnGame.querySelector('#ocn-hint');
let ocnJ = null;
function ocnStickKeys(k) { ocnG.keys.left = !!k.left; ocnG.keys.right = !!k.right; ocnG.keys.up = !!k.up; ocnG.keys.down = !!k.down; }
function ocnStickEnd() { ocnJ = null; ocnStickEl.hidden = true; ocnStickKeys({}); }
ocnGame.addEventListener('pointerdown', e => {
  if (!ocnG.on || !ocnGame.classList.contains('ocg-touch') || e.pointerType === 'mouse' || ocnJ) return;
  if (e.target.closest('button,.ocemo-pal')) return;
  const rc = ocnGame.getBoundingClientRect(); if (e.clientX - rc.left > rc.width * .55) return;
  const wr = ocnGame.querySelector('.ocg-wrap').getBoundingClientRect();
  ocnJ = { id: e.pointerId, ox: e.clientX, oy: e.clientY, R: Math.max(40, Math.min(60, Math.min(rc.width, rc.height) * .13)) };
  ocnStickEl.style.width = ocnStickEl.style.height = ocnJ.R * 2 + 'px'; ocnStickEl.style.left = (e.clientX - wr.left) + 'px'; ocnStickEl.style.top = (e.clientY - wr.top) + 'px';
  ocnStickEl.firstChild.style.transform = 'translate(-50%,-50%)'; ocnStickEl.hidden = false; ocnHintEl.hidden = true;
  try { localStorage.setItem('dw_ocn_stick', '1'); } catch (er) { /* 略過 */ }
  try { ocnGame.setPointerCapture(e.pointerId); } catch (er) { /* 略過 */ }
  e.preventDefault();
});
ocnGame.addEventListener('pointermove', e => {
  if (!ocnJ || e.pointerId !== ocnJ.id) return;
  let dx = e.clientX - ocnJ.ox, dy = e.clientY - ocnJ.oy; const d = Math.hypot(dx, dy), R = ocnJ.R;
  if (d > R) { dx *= R / d; dy *= R / d; }
  ocnStickEl.firstChild.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))';
  const dead = R * .32, ax = Math.abs(dx), ay = Math.abs(dy);
  ocnStickKeys({ left: dx < -dead && ax > ay * .4, right: dx > dead && ax > ay * .4, up: dy < -dead && ay > ax * .4, down: dy > dead && ay > ax * .4 });
  e.preventDefault();
});
['pointerup', 'pointercancel'].forEach(ev => ocnGame.addEventListener(ev, e => { if (ocnJ && e.pointerId === ocnJ.id) ocnStickEnd(); }));
const ocnEPal = ocnGame.querySelector('#ocn-epal');
ocnGame.querySelector('#ocn-pbtn').addEventListener('click', () => {
  const sc = 4, c = document.createElement('canvas'); c.width = ocnCv.width * sc; c.height = ocnCv.height * sc; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(ocnCv, 0, 0, c.width, c.height);
  x.font = 'bold ' + (10 * sc) + 'px sans-serif'; x.fillStyle = 'rgba(255,255,255,.85)'; x.textAlign = 'right'; x.fillText('雷克斯農場・發光洞 ' + new Date().toLocaleDateString(), c.width - 8 * sc, c.height - 6 * sc);
  const a = document.createElement('a'); a.download = 'glow-cave.png'; a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); toast('📷 已拍下，存成圖片了', 2600);
});
ocnGame.querySelector('#ocn-ebtn').addEventListener('click', () => { ocnEPal.hidden = !ocnEPal.hidden; });
ocnEPal.addEventListener('click', e => { const b = e.target.closest('button[data-e]'); if (b) ocnSendEmo(+b.dataset.e); });
ocnGame.querySelector('#ocn-leave').addEventListener('click', () => ocnLeave());
