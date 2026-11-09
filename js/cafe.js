'use strict';
/* 咖啡廳（暖木小木屋）—— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   廣場上的紅圈空地蓋了一間咖啡廳（外觀 A），走到門口按動作鍵進入店內（scene = 'cafe'，16×16 格，格局 C：中央走道＋四角雅座）。
   玩法照「咖啡廳玩法討論文件」和 Demo：
   ・店員：從吧台右邊的小門穿上圍裙進操作間（玩家在操作間時，豆豆只負責洗杯和端餐；沒有玩家時豆豆自己接單做飲料），拿食材、磨豆（按住）、咖啡機、烤箱、杯架、洗杯池（按住）、出餐口。煮太久會焦。
   ・顧客：坐高腳椅點餐，也可以坐沙發、圓桌，點歌。
   ・NPC 員工豆豆會自己認領訂單做飲料；NPC 顧客（村民風 6 款）進門、點單、等餐、吃完逛休閒區、離開。
   【結算】伺服器建好 cafe_eco.sql 後：玩家當顧客點餐先扣款（送到＝回收，取消／等太久＝退款）；玩家當店員送出一杯領飲料價格 10% 的薪水（系統發，每天 GMT+8 零點重置、上限 1000 G）。
   【村民客人】村裡的 NPC 偶爾會來店裡當客人、有各自的口頭禪，見 cafe-villagers.js。
   【開幕故事】第一次進店自動播「開張剪綵」CG，之後在穿圍裙確認窗下面按「重看開幕故事」，見 cafe-cg.js。
   伺服器函式不存在時自動維持「試營運」：不扣 G、不發 G。飲料效果只有畫面特效（吃喝動作＋光環），沒有數值加成。
   【多人同步】見 cafe-sync.js：店裡最早開店的人當店長跑模擬，其他人收快照、把操作交給店長代辦；店長離開由 uid 最小的人接手。點唱機的歌也對時到同一個播放位置。 */
const CFW = 16, CFH = 16;
const CFX = 82, CFV = 83, CFG = 84, CFT = 85, CFJ = 86, CFSEAT = 87;   // CFX 擺設／檯面（走不進去） CFV 出餐口 CFG 吧台小門 CFT 高腳椅 CFJ 音樂機 CFSEAT 沙發與圓桌的座位
const CF_MENU = {
  americano: { n: '美式咖啡', p: 80, bn: '喝完冒出速度光環', ic: '👟', aura: 'swift' },
  latte: { n: '拿鐵', p: 120, bn: '喝完冒出愛心光環', ic: '💕', aura: 'heart' },
  pancake: { n: '蜂蜜鬆餅', p: 130, bn: '吃完冒出蝴蝶光環', ic: '🦋', aura: 'bug' }
};
const CF_RECIPE = { americano: '咖啡豆 ×2 → 磨豆機（按住）→ 咖啡機 → 杯子盛起', latte: '咖啡豆磨好 ＋ 牛奶 → 咖啡機 → 杯子盛起', pancake: '麵糰 → 直接放烤箱 → 盤子盛起' };
const CF_NAMES = ['小米', '阿豆', '奶茶', '布丁', '小橘', '麻糬'], CF_KEYS = ['xiaomi', 'adou', 'naicha', 'buding', 'xiaoju', 'mochi'];
const CF_LINES = ['今天的咖啡好香～', '這裡好舒服', '聽說農場的魚今天很好釣', '好想吃鬆餅喔', '你也是常客嗎？', '店員動作好快！', '窗邊的位子最棒了', '等等要去廣場逛逛', '這首音樂好好聽', '我昨天捉到一隻大蝴蝶'];
const CF_SEATS = [2, 4, 6, 8];   // 高腳椅的 x，都在第 7 排；走道是第 8 排
const CF_SPOTS = [   // 休閒區可以坐／站的位置（中心點，格子座標）；dy／sy／rim 是畫坐姿用的偏移
  { k: 'sofa', x: 11.5, y: 2.5, dy: -1, sy: 2, stand: [14, 3], dir: 'down' },
  { k: 'sofa', x: 12.5, y: 2.5, dy: -1, sy: 2, stand: [14, 3], dir: 'down' },
  { k: 'sofa', x: 13.5, y: 2.5, dy: -1, sy: 2, stand: [14, 3], dir: 'down' },
  { k: 'tbl', x: 2.5, y: 10.5, dy: -3, rim: 1, stand: [2, 9], dir: 'right' },
  { k: 'tbl', x: 4.5, y: 10.5, dy: -3, rim: 1, stand: [4, 9], dir: 'left' },
  { k: 'tbl', x: 2.5, y: 13.5, dy: -3, rim: 1, stand: [2, 12], dir: 'right' },
  { k: 'tbl', x: 4.5, y: 13.5, dy: -3, rim: 1, stand: [4, 12], dir: 'left' },
  { k: 'tbl', x: 11.5, y: 10.5, dy: -3, rim: 1, stand: [11, 9], dir: 'right' },
  { k: 'tbl', x: 13.5, y: 10.5, dy: -3, rim: 1, stand: [13, 9], dir: 'left' },
  { k: 'tbl', x: 11.5, y: 13.5, dy: -3, rim: 1, stand: [11, 12], dir: 'right' },
  { k: 'tbl', x: 13.5, y: 13.5, dy: -3, rim: 1, stand: [13, 12], dir: 'left' },
  { k: 'juke', x: 13.5, y: 6.5, stand: [13, 6], dir: 'right' },
  { k: 'plant', x: 1.5, y: 9.5, stand: [1, 9], dir: 'up' }
];
const CF_JUKE = CF_SPOTS.findIndex(q => q.k === 'juke');
const CF_SEAT_TILE = { '11,2': 0, '12,2': 1, '13,2': 2, '11,3': 0, '12,3': 1, '13,3': 2, '2,10': 3, '4,10': 4, '2,13': 5, '4,13': 6, '11,10': 7, '13,10': 8, '11,13': 9, '13,13': 10 };   // 面向這些格子按動作鍵＝坐下
const CF_DEF = [   // 操作間的檯子（縮在左上角：x1~9、第 2~5 排；吧台在第 6 排）
  { k: 'crate', type: 'bean', c: 'b', x: 1, y: 2 }, { k: 'crate', type: 'milk', c: 'm', x: 2, y: 2 }, { k: 'crate', type: 'dough', c: 'd', x: 3, y: 2 },
  { k: 'grind', x: 4, y: 2 }, { k: 'grind', x: 5, y: 2 },
  { k: 'mach', x: 6, y: 2, w: 2, h: 2 }, { k: 'oven', x: 8, y: 2, w: 2, h: 1 },
  { k: 'sink', x: 1, y: 5 }, { k: 'trash', x: 2, y: 5 }, { k: 'rack', x: 3, y: 5 },
  { k: 'serve', x: 4, y: 6 }, { k: 'serve', x: 5, y: 6 }
];
const CF_GATE = { x: 9, y: 6 };   // 吧台小門：外面站 (9,7)、裡面站 (9,5)
const cfkind = Array.from({ length: CFH }, () => Array(CFW).fill(G));
for (let y = 0; y < CFH; y++) for (let x = 0; x < CFW; x++) if (y < 2 || y === CFH - 1 || x === 0 || x === CFW - 1) cfkind[y][x] = BWL;
cfkind[CFH - 1][7] = BX; cfkind[CFH - 1][8] = BX;
{
  const put = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cfkind[y + j][x + i] = k; };
  CF_DEF.forEach(d => put(d.x, d.y, d.w || 1, d.h || 1, d.k === 'serve' ? CFV : CFX));
  for (let x = 1; x <= 9; x++) if (cfkind[6][x] === G) cfkind[6][x] = CFX;   // 吧台
  put(10, 2, 1, 5, CFX);                    // 吧台右邊的隔板
  cfkind[CF_GATE.y][CF_GATE.x] = CFG;
  CF_SEATS.forEach(x => { cfkind[7][x] = CFT; });
  cfkind[8][1] = CFX;                       // 盆栽
  put(11, 2, 3, 2, CFSEAT);                 // 沙發
  put(12, 4, 2, 1, CFX);                    // 茶几
  put(14, 6, 1, 2, CFJ);                    // 音樂機
  [[2, 10], [4, 10], [2, 13], [4, 13], [11, 10], [13, 10], [11, 13], [13, 13]].forEach(([x, y]) => put(x, y, 1, 1, CFSEAT));   // 四張圓桌的椅子
  [[3, 10], [3, 13], [12, 10], [12, 13]].forEach(([x, y]) => put(x, y, 1, 1, CFX));   // 圓桌
  put(14, 8, 1, 1, CFX); put(14, 14, 1, 1, CFX); put(5, 14, 1, 1, CFX);   // 貓窩、暖爐、盆栽
}
CFI.burnt = (x, y) => { CFI.plate(x, y); ob('#3a3030', '#1a1010', x + 3, y + 4, 10, 6); };
const cfDraw = (it, x, y) => { if (!it) return; if (it.t === 'plate') { if (it.dish === 'burnt') CFI.burnt(x, y); else if (it.dish) CFI.dish(x, y, it.dish); else CFI.plate(x, y); } else if (CFI[it.t]) CFI[it.t](x, y); };
const cfBar = (x, y, p, col) => { r('#2b2b33', x, y, 14, 4); r('#fff', x + 1, y + 1, 12, 2); r(col, x + 1, y + 1, Math.max(0, Math.round(12 * Math.min(1, p))), 2); };

let cf = null;   // 本機模擬的狀態（進店時建立，離開時清掉）
function cfInit() {
  const by = {}, list = [];
  CF_DEF.forEach(d => {
    const s = Object.assign({ pt: -1e9, pp: -1e9, w: 1, h: 1, item: null, prog: 0, items: [], state: 'idle', burn: 0, dish: null, n: 4, d: 0 }, d);
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) by[(s.x + i) + ',' + (s.y + j)] = s;
    list.push(s);
  });
  CF_SPOTS.forEach(s => { s.o = 0; });
  cf = { by, list, hold: null, isBot: false, custs: [], cid: 1, nextC: 3, chatT: 5, now: 0, served: 0, lost: 0, dirty: [], sit: null, ordered: false, oc: null,
    bot: { x: 4.5, y: 4.5, dir: 'down', step: 0, hold: null, steps: [], path: [], w: .4, stuck: 0, moving: false, cur: null, gr: null, ll: -1 }, hudKey: '',
    role: null, hostId: '', hs: 0, holds: {}, peers: [], kp: [], synced: false, nullAt: performance.now(), lastSnap: 0, snapAcc: 0, hAcc: 0, who: null, orderAt: 0, hello: 0, res: {}, oq: 0, odish: '' };
}
const cfWalkable = (x, y) => x >= 0 && y >= 0 && x < CFW && y < CFH && cfkind[y][x] === G;
/* 格子上的最短路徑（廣度優先）：回傳一串格子中心點；已經在目標上回 []；到不了回 null */
function cfRoute(fx, fy, goals, block) {
  const sx = Math.floor(fx), sy = Math.floor(fy), k0 = sx + ',' + sy;
  if (goals.has(k0)) return [];
  const q = [[sx, sy]], pv = {}; pv[k0] = null;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h];
    for (const d of D) {
      const nx = x + d[0], ny = y + d[1], kk = nx + ',' + ny;
      if (kk in pv || !cfWalkable(nx, ny) || (block && block.has(kk))) continue;
      pv[kk] = x + ',' + y;
      if (goals.has(kk)) { const p = []; let k = kk; while (pv[k]) { const a = k.split(',').map(Number); p.unshift([a[0] + .5, a[1] + .5]); k = pv[k]; } return p; }
      q.push([nx, ny]);
    }
  }
  return null;
}
const cfDirTo = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
function cfGo(c, tile, fin) { const p = cfRoute(c.x, c.y, new Set([tile[0] + ',' + tile[1]])); c.path = (p || []).concat(fin ? [fin] : []); }
function cfWalk(c, dt) {
  const q = c.path[0], dx = q[0] - c.x, dy = q[1] - c.y, l = Math.hypot(dx, dy), s = 2.2 * dt;
  c.dir = cfDirTo(dx, dy); c.moving = true; c.step = (c.step || 0) + dt * 8;
  if (l <= s) { c.x = q[0]; c.y = q[1]; c.path.shift(); } else { c.x += dx / l * s; c.y += dy / l * s; }
  if (!c.path.length) c.moving = false;
}
function cfChat(name, txt) { try { addLog(name, txt, false); } catch (e) { /* 略過 */ } }
const cfSay = (t, ms) => { if (cf.isBot) return; if (cf.who) cfTell(cf.who, { t: 'say', m: t, ms: ms || 1800 }); else toast(t, ms || 1800); };

/* ---------- 顧客 ---------- */
function cfSpawn() {
  const free = CF_SEATS.map((x, i) => i).filter(i => !cf.custs.some(c => c.seat === i) && !(cf.sit && cf.sit.kind === 'stool' && cf.sit.i === i) && !cfRemoteSeat(10 + i));
  if (!free.length || cf.custs.filter(c => !c.isPlayer).length >= 7) return;
  const seat = free[Math.floor(Math.random() * free.length)], ks = Object.keys(CF_MENU), n = Math.floor(Math.random() * CF_NAMES.length), vk = cfVRoll();   // vk：這位客人是村民（cafe-villagers.js）
  const c = { id: cf.cid++, name: vk ? CF_VP[vk].n : CF_NAMES[n], key: vk || CF_KEYS[n], seat, x: 8, y: 15.35, dir: 'up', step: 0, moving: true, state: 'in', path: [], dish: vk ? CF_VP[vk].dish : ks[Math.floor(Math.random() * ks.length)], ttl: 70, max: 70, t: 0, line: null, sayT: 0, claim: 0, spot: null, rounds: 0 };
  cf.custs.push(c); if (vk) { cf.vAt = cf.now; cf.vLast = vk; cfVSay(c, 'enter'); }
  cfGo(c, [CF_SEATS[seat], 8], [CF_SEATS[seat] + .5, 7.5]);
}
function cfFreeSpot(c) { if (c.spot) { c.spot.o = 0; c.spot = null; } }
function cfLeave(c) { cfFreeSpot(c); c.seat = -1; c.state = 'out'; cfGo(c, [7, 14], [7.5, 15.5]); }
function cfStartRoam(c) {
  c.seat = -1; cfFreeSpot(c);
  const f = CF_SPOTS.filter((s, i) => !s.o && !cfRemoteSeat(20 + i));
  if (!f.length) { cfLeave(c); return; }
  const s = f[Math.floor(Math.random() * f.length)]; s.o = 1; c.spot = s; c.state = 'roam'; c.rounds++;
  cfGo(c, s.stand, [s.x, s.y]);
}
function cfNextRoam(c) { if (c.rounds < 2 && Math.random() < .6) cfStartRoam(c); else { cfLeave(c); cfVSay(c, 'bye'); } }
function cfArrive(c) {
  if (c.state === 'in') { c.state = 'wait'; if (cfIsV(c)) { cfChat('豆豆', CF_VP[c.key].dd); cfVSay(c, 'order'); } else cfChat(c.name, '我要一杯' + CF_MENU[c.dish].n + (c.dish === 'pancake' ? '（鬆餅）' : '')); }
  else if (c.state === 'roam') { c.t = 7 + Math.random() * 7; if (c.spot.k === 'juke') cfChat(c.name, '來點一首歌 ♪'); }
}
const cfMine = () => cf.custs.find(c => c.isPlayer && c.own === myUid && c.state === 'wait');
const cfSeated = c => c.state === 'wait' || c.state === 'happy' || (c.state === 'roam' && !c.path.length && c.spot && (c.spot.k === 'sofa' || c.spot.k === 'tbl'));

/* ---------- 操作間：拿放、磨豆、咖啡機、烤箱、出餐 ---------- */
function cfPress(s) {
  const h = cf.hold;
  if (!s) return;
  s.pt = cf.now; if (!cf.isBot) s.pp = cf.now;   // 最後被碰過的時間／最後被玩家碰過的時間（豆豆禮讓玩家、清理沒人管的東西用）
  if (s.k === 'crate') { if (!h) cf.hold = { t: s.type }; else cfSay('手上已經有東西了', 1100); return; }
  if (s.k === 'rack') {
    if (!h) { if (s.n > 0) { s.n--; cf.hold = { t: 'plate', dish: null }; } else cfSay('沒有乾淨杯子了，去洗杯池洗', 1600); }
    else if (h.t === 'plate' && !h.dish) { s.n++; cf.hold = null; }
    return;
  }
  if (s.k === 'trash') { if (!h) return; if (h.t === 'plate') { if (h.dish) { h.dish = null; cfSay('倒掉了', 800); } } else { cf.hold = null; cfSay('丟掉了', 800); } return; }
  if (s.k === 'sink') { if (h && h.t === 'plate' && !h.dish) { s.d++; cf.hold = null; } return; }
  if (s.k === 'serve') {
    if (!h || h.t !== 'plate' || !h.dish) { cfSay('要端裝了飲料的杯盤來', 1400); return; }
    if (h.dish === 'burnt') { cfSay('焦掉的不能上桌！丟垃圾桶', 1600); return; }
    const c = cf.custs.filter(q => q.state === 'wait' && q.dish === h.dish).sort((a, b) => (cf.isBot ? (a.claim ? 0 : 1) - (b.claim ? 0 : 1) : (a.claim ? 1 : 0) - (b.claim ? 1 : 0)) || a.ttl - b.ttl)[0];
    if (!c) { cfSay('沒有人點這個', 1300); return; }
    const M = CF_MENU[h.dish];
    cf.served++; cf.hold = null; cf.dirty.push(5);
    if (!cf.isBot) { if (cf.who) cfTell(cf.who, { t: 'wage', d: h.dish }); else cfWage(h.dish); }
    if (c.isPlayer) {
      c.state = 'gone';
      if (c.own === myUid) { cfPayEnd(true); cf.ordered = false; toast('你的' + M.n + '送到了！', 2000); playEat(h.dish, M.aura); } else { cfTell(c.own, { t: 'srv', d: h.dish }); cfResult(c.own, 's', c.q); }
      return;
    }   // 特效：沿用吃料理的動作和光環，只有畫面效果，沒有數值加成
    c.state = 'happy'; c.t = 3; c.claim = 0;
    if (cfIsV(c)) cfVSay(c, 'thanks'); else cfChat(c.name, ['謝謝！好好喝～', '太棒了！', '剛剛好的溫度！'][cf.served % 3]);
    cfSay('送出一杯' + M.n + ' ' + M.ic, 1500);
    return;
  }
  if (s.k === 'grind') {
    if (!s.item && h) { if (h.t === 'bean') { s.item = h; cf.hold = null; s.prog = 0; } else cfSay('這個不能磨', 1100); }
    else if (s.item && !h) { if (s.item.t === 'gbean') { cf.hold = s.item; s.item = null; } else cfSay('按住動作鍵磨豆', 1100); }
    return;
  }
  if (s.k === 'mach' || s.k === 'oven') {
    const m = s.k === 'mach';
    if (s.state === 'done' || s.state === 'burnt') {
      if (s.state === 'burnt') { if (!h) { s.items = []; s.state = 'idle'; cfSay('清掉焦掉的了', 1000); } else cfSay('手放空才能清', 1200); return; }
      if (h && h.t === 'plate' && !h.dish) { h.dish = s.dish; s.items = []; s.state = 'idle'; s.dish = null; s.prog = 0; } else cfSay('需要空杯盤來盛', 1300);
      return;
    }
    if (s.state === 'cooking') { cfSay('還在做…', 700); return; }
    if (m) {
      if (h && (h.t === 'gbean' || h.t === 'milk')) { if (s.items.length < 2) { s.items.push(h.t); cf.hold = null; if (s.items.length === 2) { s.state = 'cooking'; s.prog = 0; } } else cfSay('滿了', 900); }
      else if (!h && s.items.length) cf.hold = { t: s.items.pop() };
      else if (h) cfSay('豆子要先磨好才能放', 1400);
    } else {
      if (h && h.t === 'dough') { s.items = ['dough']; cf.hold = null; s.state = 'cooking'; s.prog = 0; }
      else if (h) cfSay('烤箱只能烤麵糰', 1200);
    }
  }
}
function cfHoldAct(s, dt) {   // 按住動作鍵：磨豆、洗杯
  const h = cf.hold;
  if (s) { s.pt = cf.now; if (!cf.isBot) s.pp = cf.now; }
  if (s && s.k === 'grind' && s.item && s.item.t === 'bean' && !h) { s.prog += dt / 1.4; if (s.prog >= 1) { s.item = { t: 'gbean' }; s.prog = 0; } return true; }
  if (s && s.k === 'sink' && s.d > 0 && !h) { s.prog += dt / 2; if (s.prog >= 1) { s.prog = 0; s.d--; cf.list.find(q => q.k === 'rack').n++; cfSay('洗好一個杯子', 800); } return true; }
  return false;
}

/* ---------- NPC 員工（豆豆）：照 Demo 的步驟表一步一步做 ---------- */
function cfFind(k, t) {
  const l = cf.list.filter(q => q.k === k && (!t || q.type === t));
  if (k === 'grind') return l.find(q => !q.item) || l[0];
  if (k === 'serve') { const blk = cfPlayerBlock(); return l.find(q => !(blk && blk.has(q.x + ',' + (q.y - 1)))) || l[0]; }   // 玩家擋住其中一個出餐口就改用另一個
  return l[0];
}
function cfPlan(d) {
  const gr = [['crate', 'bean'], ['grind'], ['grindH'], ['grind'], ['mach']]; let s;
  if (d === 'americano') s = gr.concat(gr); else if (d === 'latte') s = gr.concat([['crate', 'milk'], ['mach']]); else s = [['crate', 'dough'], ['oven']];
  const m = d === 'pancake' ? 'oven' : 'mach';
  return s.concat([['rack'], ['wait', m], [m], ['serve']]);
}
function cfAsBot(fn) { const h = cf.hold; cf.hold = cf.bot.hold; cf.isBot = true; try { fn(); } finally { cf.bot.hold = cf.hold; cf.hold = h; cf.isBot = false; } }
function cfBotReset(b) { b.steps = []; if (b.cur) b.cur.claim = 0; b.cur = null; b.path = []; b.stuck = 0; b.gr = null; b.pw = 0; }   // 手上的東西留著，下一輪 cfBotTidy 會處理（以前直接丟掉，杯盤會越用越少）
const cfPlayerBlock = () => {
  if (!(cfInKitchen() && !cf.sit) && !cf.kp.length) return null;
  const st = new Set(); if (cfInKitchen() && !cf.sit) { st.add(pl.x + ',' + pl.y); st.add(pl.sx + ',' + pl.sy); }
  cf.kp.forEach(rp => { st.add(rp.tx + ',' + rp.ty); st.add(Math.round(rp.x) + ',' + Math.round(rp.y)); });
  return st;
};   // 玩家站的格子：豆豆繞過去
function cfBotRoute(b, s) {   // 回傳路徑；已經站在旁邊回 []；暫時到不了（被玩家擋住）回 null
  const adj = new Set(), blk = cfPlayerBlock();
  for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const x = s.x + xx + d[0], y = s.y + yy + d[1]; if (cfWalkable(x, y) && x <= 9 && y <= 5 && !(blk && blk.has(x + ',' + y))) adj.add(x + ',' + y); });
  return cfRoute(b.x, b.y, adj, blk);
}
const cfStationIdle = k => cf.list.some(q => q.k === k && (k === 'grind' ? !q.item : q.state === 'idle' && !q.items.length));
const cfCanMake = d => cfFind('rack').n > 0 && (d === 'pancake' ? cfStationIdle('oven') : cfStationIdle('mach') && cfStationIdle('grind'));   // 要用的機器現在是空的才接單（玩家或上一輪留下的東西還在就先等）
/* 豆豆閒下來時先收拾：手上拿的東西、燒焦的、做好沒人拿的、放太久沒人管的半成品 */
const cfStaffOn = () => (cfInKitchen() && !cf.sit) || cf.kp.length > 0;   // 有玩家在操作間打工：豆豆只洗杯和端餐
function cfBotTidy(b) {
  const staff = cfStaffOn();
  const wantC = d => cf.custs.find(q => q.state === 'wait' && !q.claim && q.dish === d);
  if (b.hold) {
    if (b.hold.t === 'plate' && b.hold.dish && b.hold.dish !== 'burnt') { const c = wantC(b.hold.dish); if (c) { c.claim = 1; b.cur = c; b.steps = [['serve']]; return true; } }
    b.steps = b.hold.t === 'plate' ? [['trash'], ['rack']] : [['trash']]; return true;
  }
  const sk = cfFind('sink'), rk = cfFind('rack');
  if (sk.d > 0 && rk.n < 4 && (staff || rk.n < 2 || !cf.custs.some(q => q.state === 'wait' && !q.claim))) { b.wd = sk.d; b.steps = [['wash']]; return true; }   // 髒杯子多了、或閒著沒單：去洗杯
  for (const q of cf.list) {
    if (q.k === 'mach' || q.k === 'oven') {
      if (q.state === 'burnt' && !staff) { b.steps = [[q.k]]; return true; }
      if (q.state === 'done' && (!staff || cf.now - (q.dAt || 0) > 3000)) { const c = wantC(q.dish); if (c) { c.claim = 1; b.cur = c; b.steps = [['rack'], [q.k], ['serve']]; return true; } }
      if (!staff && q.state === 'idle' && q.items.length && cf.now - q.pt > 15000) { b.steps = [['empty', q]]; return true; }
    }
    if (!staff && q.k === 'grind' && q.item && cf.now - q.pt > 15000) { b.steps = [['empty', q]]; return true; }
  }
  return false;
}
function cfBotTick(dt) {
  const b = cf.bot; let T_ = b.steps[0];
  { const st = cfStaffOn(); if (st !== cf.bStaff) { cf.bStaff = st; if (st) { cfBotReset(b); T_ = null; } } }   // 玩家進操作間：豆豆放下手上的單
  if (!T_) {
    b.cur = null;   // 上一張單已經做完了
    if (cfBotTidy(b)) { b.stuck = 0; b.w = .3; T_ = b.steps[0]; }
    else {
      const c = cfStaffOn() ? null : cf.custs.filter(q => q.state === 'wait' && !q.claim && cfCanMake(q.dish)).sort((a, z) => a.ttl - z.ttl)[0];
      if (!c) { b.moving = false; return; }
      c.claim = 1; b.cur = c; b.steps = cfPlan(c.dish); b.stuck = 0; b.w = .4; T_ = b.steps[0];
    }
  }
  if (b.steps.length !== b.ll) { b.ll = b.steps.length; b.stuck = 0; }
  b.stuck += dt;
  if (b.stuck > 25 || (b.cur && b.cur.state !== 'wait')) { cfBotReset(b); return; }
  const kind = T_[0] === 'wait' ? T_[1] : T_[0] === 'grindH' ? 'grind' : T_[0] === 'wash' ? 'sink' : T_[0]; let s;
  if (kind === 'empty') s = T_[1]; else
  if (kind === 'grind') { if (T_[0] === 'grind' && b.hold && b.hold.t === 'bean') { s = cfFind('grind'); b.gr = s; } else s = b.gr; }
  else s = cfFind(kind, kind === 'crate' ? T_[1] : null);
  if (!s) { cfBotReset(b); return; }
  if (T_[0] === 'wait') {
    if (s.state === 'idle' && !s.items.length) { cfBotReset(b); return; }   // 做到一半被人清掉了
    if (s.state === 'done') { b.steps.shift(); return; }
    if (s.state === 'burnt') { b.hold = null; cfFind('rack').n++; b.steps = [[kind]].concat(cfPlan(b.cur.dish)); return; }   // 焦掉：杯子收回、先清機器再重做
  }
  if (cf.now - s.pp < 2500 && cfStaffOn()) { b.stuck -= dt; b.moving = false; return; }   // 玩家剛在用這一台：等一下，不搶
  { const blk = cfPlayerBlock(); if (b.path.length && blk && blk.has(Math.floor(b.path[0][0]) + ',' + Math.floor(b.path[0][1]))) b.path = []; }   // 下一格被玩家站住：重新找路
  if (!b.path.length) {
    const rt = cfBotRoute(b, s);
    if (rt === null) { b.moving = false; b.stuck -= dt * .8; b.pw = (b.pw || 0) + dt; if (b.pw > 20) cfBotReset(b); return; }   // 路被玩家擋住：原地等，最多 20 秒
    b.path = rt;
  }
  b.pw = 0;
  if (b.path.length) {
    const q = b.path[0], dx = q[0] - b.x, dy = q[1] - b.y, l = Math.hypot(dx, dy), sp = 4.4 * dt;
    b.dir = cfDirTo(dx, dy);
    if (l <= sp) { b.x = q[0]; b.y = q[1]; b.path.shift(); } else { b.x += dx / l * sp; b.y += dy / l * sp; }
    b.moving = true; b.step += dt * 8; return;
  }
  b.moving = false;
  b.dir = cfDirTo(s.x + s.w / 2 - b.x, s.y + s.h / 2 - b.y);
  if (T_[0] === 'wait') return;
  if (T_[0] === 'wash') { if (s.d <= 0 || s.d < b.wd) { b.steps.shift(); s.prog = 0; return; } cfAsBot(() => cfHoldAct(s, dt)); return; }
  if (T_[0] === 'empty') { b.w -= dt; if (b.w > 0) return; s.items = []; s.item = null; s.state = 'idle'; s.prog = 0; s.dish = null; s.burn = 0; b.steps.shift(); b.w = .3; return; }
  if (T_[0] === 'grindH') { cfAsBot(() => cfHoldAct(s, dt)); if (s.item && s.item.t === 'gbean') { b.steps.shift(); b.w = .3; } return; }
  b.w -= dt; if (b.w > 0) return;
  cfAsBot(() => cfPress(s)); b.w = .2; b.steps.shift(); b.path = [];
}

/* ---------- 每幀更新（render.js 的 update 呼叫；dt 單位是毫秒） ---------- */
const cfFacing = () => { const d = DIRS[pl.face]; return [pl.x + d[0], pl.y + d[1]]; };
const cfInKitchen = () => pl.x <= 9 && pl.y <= 5;   // 操作間：左上角 x1~9、第 2~5 排
function cafeTick(dtMs) {
  if (scene !== 'cafe' || !cf) return;
  const dt = Math.min(0.1, dtMs / 1000);
  cf.peers = cfPeers(); cf.kp = cf.peers.filter(rp => rp.tx <= 9 && rp.ty <= 5 && !rp.cs);   // 店裡的其他玩家；kp = 在操作間裡打工的
  cfRoleTick();
  if (cfOpen && !cf.peers.length) return;   // 點餐面板開著時，店裡的時間先停住（店裡有別人時不能停，大家的時間是連在一起的）
  cf.now += dt * 1000;
  if (cf.sit && pressed.length) cafeStand();
  if (cf.sit && cf.sit.kind === 'stool') pl.face = 'up';
  /* 操作間裡按住動作鍵：磨豆、洗杯 */
  const fs = cfInKitchen() && !cf.sit && pl.prog >= 1 ? cf.by[cfFacing().join(',')] : null;
  if (actHeld && fs && !paused() && !cfOpen) {
    if (cf.role === 'host') cfHoldAct(fs, dt);
    else if (cf.role) { cf.hAcc += dt; if (cf.hAcc >= .15) { cfSend({ t: 'hact', x: fs.x, y: fs.y, dt: +cf.hAcc.toFixed(2) }); cf.hAcc = 0; } }
  } else cf.hAcc = 0;
  if (cf.role !== 'host') { cfFolTick(dt); return; }   // 不是店長：只套用店長傳來的畫面
  cfRemoteTick(dt);
  { const bw = cf.bot.steps[0] && cf.bot.steps[0][0] === 'wash'; cf.list.forEach(q => { if (q.k === 'sink' && q !== fs && !bw && cf.now - (q.rt || -1e9) > 400) q.prog = 0; }); }   // 洗到一半離開就歸零（豆豆或別的玩家正在洗時不要歸零）
  cf.list.forEach(q => {
    if (q.k === 'mach' || q.k === 'oven') {
      if (q.state === 'cooking') {
        q.prog += dt / (q.k === 'mach' ? 7 : 6);
        if (q.prog >= 1) {
          q.state = 'done'; q.burn = 0; q.dAt = cf.now;
          const a = q.items.slice().sort().join();
          q.dish = q.k === 'oven' ? 'pancake' : a === 'gbean,gbean' ? 'americano' : a === 'gbean,milk' ? 'latte' : 'burnt';
          if (q.dish === 'burnt') q.state = 'burnt';
          if (cfInKitchen()) toast(q.dish === 'burnt' ? '這杯搭配不對…' : CF_MENU[q.dish].n + '好了！拿杯子來盛', 1600);
        }
      } else if (q.state === 'done') { q.burn += dt / 6; if (q.burn >= 1) { q.state = 'burnt'; if (cfInKitchen()) toast('焦掉了！', 1300); } }
    }
  });
  for (let i = cf.dirty.length - 1; i >= 0; i--) { cf.dirty[i] -= dt; if (cf.dirty[i] <= 0) { cf.dirty.splice(i, 1); cf.list.find(q => q.k === 'sink').d++; } }
  cfBotTick(dt);
  cfJukeTick(dt);
  cf.nextC -= dt; if (cf.nextC <= 0) { cfSpawn(); cf.nextC = 9 + Math.random() * 6; }
  for (let i = cf.custs.length - 1; i >= 0; i--) {
    const c = cf.custs[i];
    if (c.state === 'gone') { cf.custs.splice(i, 1); continue; }
    if (c.isPlayer) {
      if (c.state === 'wait') {
        c.ttl -= dt;
        if (c.ttl <= 0) { c.state = 'gone'; if (c.own === myUid) { cfPayEnd(false); cf.ordered = false; toast('等太久了，這張單作廢了', 2000); } else { cfTell(c.own, { t: 'exp' }); cfResult(c.own, 'e', c.q); } }
      }
      continue;
    }
    if (c.path.length) { cfWalk(c, dt); if (!c.path.length) cfArrive(c); }
    if (c.state === 'roam') { if (!c.path.length) { c.t -= dt; if (c.t <= 0) cfNextRoam(c); } }
    else if (c.state === 'wait') {
      c.ttl -= dt;
      if (c.ttl <= 0) { cfLeave(c); c.line = { txt: '💢', at: performance.now() }; cf.lost++; cfChat(c.name, '等太久了啦…'); }
    } else if (c.state === 'happy' || c.state === 'out') {
      c.t -= dt;
      if (c.state === 'happy' && c.t <= 0) cfStartRoam(c);
      if (c.state === 'out' && !c.path.length) { cf.custs.splice(i, 1); continue; }
    }
  }
  cfVQueueTick();
  cf.chatT -= dt;
  if (cf.chatT <= 0) {
    const sit = cf.custs.filter(c => !c.isPlayer && (c.state === 'wait' || c.state === 'happy' || (c.state === 'roam' && !c.path.length)));
    if (sit.length) {
      const c = sit[Math.floor(Math.random() * sit.length)];
      if (Math.random() < .5 && cfVBanter(sit)) { /* 兩位村民都坐著時，優先讓他們互相搭話 */ }
      else if (cfIsV(c)) cfVSay(c, 'chat');
      else { const ln = CF_LINES[Math.floor(Math.random() * CF_LINES.length)]; c.line = { txt: ln, at: performance.now() }; cfChat(c.name, ln); }
    }
    cf.chatT = 5 + Math.random() * 4;
  }
  CF_ST.rack = cfFind('rack').n; CF_ST.sink = cf.list.find(q => q.k === 'sink').d;
  cfHudTick();
  cfSnapTick(dt);
}

/* ---------- 玩家動作（actions.js 的 act 在 scene === 'cafe' 時呼叫） ---------- */
function cafeAct(x, y) {
  if (!cf) return;
  const rp = remoteAt(x, y); if (rp) { openFriendPop(rp); return; }
  if (cf.sit) { cafeSeatedAct(); return; }
  const k = K[y][x];
  if (k === CFG) {
    if (cfInKitchen()) { pl.x = pl.sx = CF_GATE.x; pl.y = pl.sy = CF_GATE.y + 1; pl.prog = 1; pl.face = 'down'; cf.hold = null; cfSend({ t: 'drop' }); toast('脫下圍裙，回到店裡', 1600); }
    else { cfApronMenu(); return; }
    lastPosKey = ''; posAcc = 999; return;
  }
  if (cfInKitchen()) {
    const s = cf.by[x + ',' + y];
    if (s) { if (cf.role === 'host') cfPress(s); else if (cf.role) cfSend({ t: 'press', x, y }); else toast('正在和店長同步…', 900); } else if (k === BWL) pop(x, y, '牆壁', '#fff3b0');
    return;
  }
  if (k === BX) { leaveCafe(); return; }
  if (k === CFT) { const i = CF_SEATS.indexOf(x); if (i < 0) return; if (cf.custs.some(c => c.seat === i) || cfRemoteSeat(10 + i)) { pop(x, y, '有人坐了', '#fff3b0'); return; } cafeSit({ kind: 'stool', i, x, y, stand: [x, 8] }); cfOrderMenu(); return; }
  if (k === CFSEAT) {
    const i = CF_SEAT_TILE[x + ',' + y];
    if (i == null) return;
    const sp = CF_SPOTS[i];
    if (sp.o || cfRemoteSeat(20 + i)) { pop(x, y, '有人坐了', '#fff3b0'); return; }
    sp.o = 1; cafeSit({ kind: 'spot', spot: sp, stand: sp.stand }); toast('坐下休息中（按方向鍵起身）', 1800); return;
  }
  if (k === CFJ) { cfJukeMenu(); return; }
  if (k === CFV) { pop(x, y, '出餐口：店員把餐點放這裡', '#fff3b0'); return; }
  if (k === CFX) pop(x, y, y === 6 && x <= 9 ? '吧台：想打工就走到右邊的小門穿圍裙' : '', '#fff3b0');
}
const cfSitCode = () => scene === 'cafe' && cf && cf.sit ? (cf.sit.kind === 'stool' ? 10 + cf.sit.i : 20 + CF_SPOTS.indexOf(cf.sit.spot)) : 0;   // 廣播給別人：我坐在哪（10~13 高腳椅、20 以上休閒座位）
function cafeSit(s) { cf.sit = s; if (s.kind === 'stool') { pl.x = pl.sx = s.x; pl.y = pl.sy = s.y; } else { pl.x = pl.sx = Math.floor(s.spot.x); pl.y = pl.sy = Math.floor(s.spot.y); } pl.prog = 1; pl.face = 'up'; pressed.length = 0; cf.ordered = false; lastPosKey = ''; posAcc = 999; }
function cafeStand() {
  const s = cf.sit; if (!s) return;
  if (s.kind === 'spot') s.spot.o = 0;
  cfPayEnd(false);
  if (cf.role === 'host') cf.custs = cf.custs.filter(c => !(c.isPlayer && c.own === myUid));
  cf.ordered = false;   // 站起來就取消還沒送到的單（上面 cfPayEnd 已退款）
  pl.x = pl.sx = s.stand[0]; pl.y = pl.sy = s.stand[1]; pl.prog = 1; cf.sit = null; lastPosKey = ''; posAcc = 999;
}
function cafeSeatedAct() {
  const s = cf.sit;
  if (s.kind === 'stool') { if (!cf.ordered) cfOrderMenu(); else toast('餐點製作中，豆豆正在做…', 1800); return; }
  toast('坐著休息中（按方向鍵起身）', 1400);
}
function enterCafe() {
  if (scene !== 'plaza' || !ready || !me || paused()) return;
  pose = null; scene = 'cafe'; K = cfkind; W = CFW; H = CFH;
  cfInit();
  pl.x = pl.sx = 7; pl.y = pl.sy = CFH - 2; pl.prog = 1; pl.face = 'up'; pressed.length = 0;
  view.snap = true; fitView(); toast('歡迎光臨暖木小木屋咖啡廳'); cfJukeEnter(); cfEcoInit();
  lastPosKey = ''; posAcc = 999; trackSelf(); cfHud.hidden = false;
  cfCgMaybe();   // 第一次進店自動播開幕 CG（cafe-cg.js）
}
function leaveCafe(silent) {
  if (scene !== 'cafe') return;
  cfPayEnd(false); closeCfMenu(); cfJukeLeave(); cfHud.hidden = true; cfHud.innerHTML = ''; cf = null;
  scene = 'plaza'; K = pkind; W = PLW; H = PLH;
  pl.x = pl.sx = CFB.x + 2; pl.y = pl.sy = CFB.y + CFB.h; pl.prog = 1; pl.face = 'down'; pressed.length = 0;
  view.snap = true; fitView(); lastPosKey = ''; posAcc = 999; trackSelf();
  if (!silent) toast('回到廣場了');
}

/* ---------- 點餐面板 ---------- */
const cfEl = document.createElement('div');
cfEl.className = 'maker'; cfEl.hidden = true; cfEl.style.zIndex = 31;
cfEl.innerHTML = '<div class="card maker-card" id="cfcard" tabindex="-1"></div>';
document.body.appendChild(cfEl);
const cfCard = cfEl.querySelector('#cfcard');
function cfOrderMenu() {
  if (cfOpen || !cf || cf.ordering) return;
  cfOpen = true; pressed.length = 0;
  cfEl.hidden = false;
  cfCard.innerHTML = '<div class="shop-h"><h2>🧾 點餐</h2></div><p style="margin:0 0 8px;font-size:13px;line-height:1.5">' + (cfEco === true ? '點餐會先扣款；等太久、中途離開會退款。' : '試營運：先不收費。') + '餐點送到後會出現喝下去的特效。</p>' +
    Object.keys(CF_MENU).map(k => '<button type="button" class="btn wide" data-cf="' + k + '" style="margin:0 0 8px;text-align:left">' + CF_MENU[k].n + '　' + CF_MENU[k].p + ' G　' + CF_MENU[k].ic + CF_MENU[k].bn + '</button>').join('') +
    '<button type="button" class="btn ghost wide" data-cf="close">不點了</button>';
}
function closeCfMenu() { cfOpen = false; cfEl.hidden = true; }

/* ---------- 穿圍裙確認窗（清單式）：先看三道料理的價格、薪水、做法，按「穿上圍裙」才進操作間 ---------- */
function cfApronMenu() {
  if (cfOpen || !cf || cf.ordering) return;
  cfOpen = true; pressed.length = 0; cfEl.hidden = false;
  const eco = cfEco === true;
  const rows = Object.keys(CF_MENU).map(k => {
    const m = CF_MENU[k], pay = Math.round(m.p * 0.1);
    return '<div style="background:#fffaf0;border:2px solid #c9a06a;border-radius:8px;padding:8px;margin:0 0 6px;color:#4a2a10">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;font-weight:700;font-size:14px"><span>' + m.n + '　' + m.p + ' G</span>' +
      '<span style="background:#ffe08a;border:2px solid #b8860b;color:#5a3c00;border-radius:6px;padding:0 6px;font-size:12px;white-space:nowrap">' + (eco ? '薪水 ' + pay + ' G' : '試營運 不發 G') + '</span></div>' +
      '<div style="font-size:12px;color:#7a5a30;margin-top:3px">' + CF_RECIPE[k] + '</div></div>';
  }).join('');
  cfCard.innerHTML = '<div class="shop-h"><h2>🍳 要穿上圍裙打工嗎？</h2></div>' +
    '<p style="margin:0 0 8px;font-size:13px;line-height:1.5">飲料要自己做（磨豆、洗杯要按住動作鍵），豆豆只幫你洗杯和端餐。煮太久會焦。</p>' + rows +
    '<p style="margin:2px 0 8px;font-size:12px;color:#7a5a30">' + (eco ? '送出一杯領飲料價 10% 的薪水，每天最多 ' + ((cf.eco && cf.eco.cap) || 1000) + ' G（GMT+8 零點重置）。' : '試營運：先不發 G。') + '</p>' +
    '<button type="button" class="btn wide" data-cf="apron" style="margin:0 0 8px">穿上圍裙</button>' +
    '<button type="button" class="btn ghost wide" data-cf="close" style="margin:0 0 8px">再想想</button>' +
    '<button type="button" class="btn ghost wide" data-cf="story">📖 重看開幕故事</button>';
}
function cfApronGo() {
  if (!cf || scene !== 'cafe' || cf.sit || cfInKitchen()) return;   // 窗開著時狀態變了（離座、已經在裡面）就不處理
  pl.x = pl.sx = CF_GATE.x; pl.y = pl.sy = CF_GATE.y - 1; pl.prog = 1; pl.face = 'down'; cf.hold = null; cfSend({ t: 'drop' });
  toast('穿上圍裙！飲料要自己做（磨豆、洗杯按住動作鍵），豆豆只幫你洗杯和端餐。' + (cfEco === true ? '送出一杯領飲料價 10% 的薪水，每天最多 ' + ((cf.eco && cf.eco.cap) || 1000) + ' G' : '（試營運：不發 G）'), 4800);
  lastPosKey = ''; posAcc = 999;
}
cfEl.addEventListener('click', e => {
  const sb_ = e.target.closest('[data-song]'); if (sb_ && cf) { closeCfMenu(); cfPickSong(sb_.dataset.song); return; }
  const b = e.target.closest('[data-cf]'); if (!b || !cf) { if (e.target === cfEl) closeCfMenu(); return; }
  const k = b.dataset.cf; closeCfMenu();
  if (k === 'apron') { cfApronGo(); return; }
  if (k === 'story') { cfCgPlay(); return; }
  if (k === 'close' || !CF_MENU[k] || !cf.sit) return;
  const mk = () => {
    cf.ordered = true; cf.orderAt = performance.now(); cf.odish = k; cf.oq++; cfChat('你', '我要一杯' + CF_MENU[k].n);
    if (cf.role === 'host') cfAddPlayerOrder(myUid, '你', cf.sit.i, k, cf.oq); else cfSend({ t: 'order', s: cf.sit.i, d: k, q: cf.oq });
  };
  if (cfEco !== true) { mk(); return; }
  cf.ordering = true;
  rpc('cafe_order', { p_dish: k }).then(r => {
    cfApplyCoins(r);
    if (!cf || !cf.sit) { rpc('cafe_order_done', { p_ok: false }).then(cfApplyCoins).catch(() => {}); return; }   // 付款途中已經離座：退款
    cf.ordering = false; toast('付了 ' + r.price + ' G', 1600); mk();
  }).catch(e => { if (cf) cf.ordering = false; toast(errText(e), 2200); });
});

/* ---------- 點唱機：從 5 首咖啡廳音樂裡選一首（音檔在 bgm/cafe-1.mp3 ~ cafe-5.mp3） ----------
   試營運：選了只有自己聽得到。伺服器端建好 cafe_jukebox_get / cafe_jukebox_set 兩個函式後（見 cafe_jukebox.sql），
   會自動變成「全店共用」：有人點歌，店裡所有人都會換成同一首；函式不存在時自動維持本機模式，不會報錯。 */
const CF_SONGS = [
  { id: 'cafe1', n: '陽光爵士', by: 'Alex Morgan', len: '3:06' },
  { id: 'cafe2', n: '慵懶 Lofi', by: 'Zephira Music', len: '2:28' },
  { id: 'cafe3', n: '午後輕咖啡', by: 'Aurec', len: '1:49' },
  { id: 'cafe4', n: '法式咖啡館', by: 'Andriih', len: '2:12' },
  { id: 'cafe5', n: '爵士沙龍', by: 'Alex Morgan', len: '2:20' }
];
let cfEco = null;   // 結算：null 還不知道、true 伺服器有結算、false 沒建（試營運）
const cfMissing = e => /function|schema cache|PGRST202|404/i.test(String((e && e.message) || e));
const cfApplyCoins = r => { if (r && typeof r.coins === 'number' && me) { me.coins = r.coins; try { refreshHud(); } catch (e) { /* 略過 */ } } };
function cfEcoInit() {
  if (cfEco === false) return;
  rpc('cafe_info').then(r => {
    cfEco = true; if (cf) cf.eco = r; cfApplyCoins(r);
    if (r && r.refund > 0) toast('上次沒結清的點餐已退款 +' + r.refund + ' G', 2600);
  }).catch(e => { if (cfMissing(e)) { cfEco = false; if (cf) toast('試營運：不扣 G、不發 G', 2400); } });
}
/* 點餐單結清：ok = 送到了（錢回收）；!ok = 取消或等太久（退款） */
function cfPayEnd(ok) {
  if (cfEco !== true || !cf || !cf.ordered) return;
  rpc('cafe_order_done', { p_ok: !!ok }).then(r => { cfApplyCoins(r); if (!ok && r && r.refund > 0) toast('點餐已退款 +' + r.refund + ' G', 2200); }).catch(() => { /* 下次進店會自動退 */ });
}
/* 店員送出一杯：領薪水 */
function cfWage(dish) {
  if (cfEco !== true) return;
  rpc('cafe_serve', { p_dish: dish }).then(r => {
    cfApplyCoins(r); if (cf && cf.eco) cf.eco.today = r.today;
    if (r.wage > 0) toast('+' + r.wage + ' G　今天打工 ' + r.today + ' / ' + r.cap, 2000);
    else toast('今天的打工收入已達上限 ' + r.cap + ' G', 2400);
  }).catch(e => { if (!/cafe_too_fast/.test(String((e && e.message) || e))) toast(errText(e), 2000); });
}
let cfJukeSrv = null, cfJukeHold = 0;   // 伺服器點唱機：null 還不知道、true 可用、false 沒建（用本機模式）
const cfSongName = id => (CF_SONGS.find(q => q.id === id) || {}).n || '';
function cfJukeMenu() {
  if (cfOpen || !cf) return;
  cfOpen = true; pressed.length = 0; cfEl.hidden = false;
  cfCard.innerHTML = '<div class="shop-h"><h2>🎵 點唱機</h2></div><p style="margin:0 0 8px;font-size:13px;line-height:1.5">' + (cfJukeSrv ? '點的歌全店的人都聽得到。' : '試營運：先免費，只有你聽得到。') + '</p>' +
    CF_SONGS.map(q => '<button type="button" class="btn wide" data-song="' + q.id + '" style="margin:0 0 8px;text-align:left">' + (cfSong === q.id ? '▶ ' : '') + q.n + '　<small style="opacity:.7">' + q.by + '・' + q.len + '</small></button>').join('') +
    '<button type="button" class="btn ghost wide" data-song="none" style="margin:0 0 8px">' + (cfSong ? '不放歌（回到廣場音樂）' : '✓ 目前：廣場音樂') + '</button>' +
    '<button type="button" class="btn ghost wide" data-cf="close">關閉</button>';
}
function cfPickSong(id) {
  if (id === 'none') id = '';
  if (id === cfSong) return;
  cfSong = id; cfJukeHold = performance.now() + 4000;
  try { localStorage.setItem('dewfarm_cafe_song', id); } catch (e) { /* 略過 */ }
  if (id && !musicOn) { musicOn = true; syncMusicUI(); }
  syncBgm();
  if (id) {
    toast('♪ 播放《' + cfSongName(id) + '》', 2200); cfChat('你', '點了《' + cfSongName(id) + '》♪');
    if (cf && cf.now - (cf.lastSong || -1e9) > 20000) { cf.lastSong = cf.now; if (cf.role === 'host') cfBoost(); else cfSend({ t: 'boost' }); toast('♪ 《' + cfSongName(id) + '》客人心情變好，耐心 +10 秒', 2600); }
  } else toast('點唱機停了，回到廣場音樂', 1800);
  if (id && Bgm) Bgm.seek(id, 0);   // 剛點的歌從頭開始放
  const t0 = performance.now();
  if (cfJukeSrv !== false) rpc('cafe_jukebox_set', { p_song: id, p_name: me && me.name || '' }).then(r => { cfJukeSrv = true; cfJukeAlign(r, t0); cfSend({ t: 'song' }); }).catch(e => {
    const m = String(e && e.message || e);
    if (/function|schema cache|PGRST202|404/i.test(m)) cfJukeSrv = false; else toast(errText(e), 2200);
  });
}
/* 對時：伺服器回傳「這首歌已經放了幾秒（elapsed）」，扣掉來回網路時間的一半，讓所有人聽到同一個位置 */
function cfJukeAlign(r, t0) {
  if (!cfSong || !r || typeof r.elapsed !== 'number' || !isFinite(r.elapsed) || r.elapsed < 0 || !Bgm) return;
  Bgm.seek(cfSong, r.elapsed + (performance.now() - t0) / 2000, performance.now());
}
function cfJukeFetch() {
  const t0 = performance.now();
  rpc('cafe_jukebox_get').then(r => {
    cfJukeSrv = true;
    if (!cf || performance.now() < cfJukeHold) return;
    const id = r && CF_SONGS.some(q => q.id === r.song) ? r.song : '';
    if (id !== cfSong) {
      cfSong = id; syncBgm();
      if (id) toast('♪ ' + ((r && r.name) || '有人') + ' 點了《' + cfSongName(id) + '》', 2400);
    }
    cfJukeAlign(r, t0);
  }).catch(e => { if (/function|schema cache|PGRST202|404/i.test(String(e && e.message || e))) cfJukeSrv = false; });
}
function cfJukeEnter() { if (cf) cf.jT = 0; syncBgm(); }
function cfJukeLeave() { /* 離開店：bgmName 會自動回到廣場那首 */ }
function cfJukeTick(dt) { if (cfJukeSrv === false) return; cf.jT = (cf.jT == null ? 0 : cf.jT) - dt; if (cf.jT <= 0) { cf.jT = 12; cfJukeFetch(); } }

/* ---------- 上方的訂單小票 ---------- */
const cfHud = document.createElement('div');
cfHud.id = 'cfhud'; cfHud.hidden = true;
cfHud.style.cssText = 'position:fixed;left:8px;top:8px;display:flex;gap:6px;z-index:15;pointer-events:none;max-width:calc(100vw - 16px);overflow:hidden';
document.body.appendChild(cfHud);
const cfDishCv = {};
function cfDishCanvas(k) { if (cfDishCv[k]) return cfDishCv[k]; const c = document.createElement('canvas'); c.width = c.height = 16; const o = g; g = c.getContext('2d'); CFI.dish(0, 0, k); g = o; return (cfDishCv[k] = c); }
function cfHudTick() {
  { const rc = cv.getBoundingClientRect(); cfHud.style.left = Math.round(rc.left + 8) + 'px'; cfHud.style.top = Math.round(rc.top + 8) + 'px'; cfHud.style.maxWidth = Math.max(60, Math.round(rc.width - 16)) + 'px'; }
  const w = cf.custs.filter(c => c.state === 'wait'), ids = w.map(c => c.id).join();
  if (cf.hudKey !== ids) {
    cf.hudKey = ids; cfHud.innerHTML = '';
    w.forEach(c => {
      const d = document.createElement('div'); d.dataset.id = c.id;
      d.style.cssText = 'background:#fff8e8;color:#5a3a30;border:3px solid #8a5a4a;border-radius:8px;padding:3px 4px;display:flex;flex-direction:column;align-items:center;gap:2px;width:60px;box-shadow:0 3px 0 #8a5a4a;font:800 11px/1.2 "Noto Sans TC",system-ui,sans-serif';
      const cn = document.createElement('canvas'); cn.width = cn.height = 16; cn.style.cssText = 'width:28px;height:28px;image-rendering:pixelated'; cn.getContext('2d').drawImage(cfDishCanvas(c.dish), 0, 0);
      const sp = document.createElement('span'); sp.textContent = (c.isPlayer ? (c.own === myUid ? '★' : '☆') : '') + CF_MENU[c.dish].n;
      const bar = document.createElement('div'); bar.style.cssText = 'width:100%;height:6px;background:#fff;border:2px solid #8a5a4a;border-radius:4px;overflow:hidden';
      bar.innerHTML = '<i style="display:block;height:100%;background:#6fd06a"></i>';
      d.appendChild(cn); d.appendChild(sp); d.appendChild(bar); cfHud.appendChild(d);
    });
  }
  [...cfHud.children].forEach(d => {
    const c = w.find(q => q.id == d.dataset.id); if (!c) return;
    const p = c.ttl / c.max, i = d.querySelector('i');
    i.style.width = Math.round(p * 100) + '%'; i.style.background = p < .25 ? '#f06a6a' : p < .55 ? '#ffd34d' : '#6fd06a';
    d.style.background = p < .25 ? '#ffe0e0' : '#fff8e8';
  });
}

/* ---------- 畫面 ---------- */
function drawCafeBldg(now, lit) {
  const ox = CFB.x * T, oy = CFB.y * T;
  r('rgba(107,72,72,.16)', ox + 2, oy + CFB.h * T - 2, CFB.w * T - 4, 3);
  cafeExtA(ox, oy, now, lit);
}
function cfCast(now) {
  const out = [], b = cf.bot;
  out.push({ k: 'doudou', x: b.x - .5, y: b.y - .5, dir: b.dir, bob: b.moving ? Math.floor(b.step) % 2 : Math.floor(now / 600) % 2, o: b.hold && b.hold.t === 'plate' ? { hold: b.hold.dish ? 'tray' : 'cup' } : {} });
  cf.custs.forEach(c => {
    if (c.isPlayer) return;
    if (c.seat >= 0 && !c.path.length && (c.state === 'wait' || c.state === 'happy')) { out.push({ k: c.key, x: CF_SEATS[c.seat], y: 7, dy: -5, rimY: 12, bob: Math.floor(now / 600 + c.id) % 2, bubble: c.state === 'wait' ? c.dish : null }); return; }
    if (c.state === 'roam' && !c.path.length && c.spot) {
      const s = c.spot, o = { k: c.key, x: s.x - .5, y: s.y - .5, dir: s.dir, bob: Math.floor(now / 600 + c.id) % 2 };
      if (s.dy) o.dy = s.dy; if (s.sy) o.sy = s.sy; if (s.rim) o.rimY = 12;
      if (s.k === 'juke') { o.juke = 1; o.bubble = '♪'; }
      out.push(o); return;
    }
    out.push({ k: c.key, x: c.x - .5, y: c.y - .5, dir: c.dir || 'down', bob: c.moving ? Math.floor(c.step || 0) % 2 : 0 });
  });
  if (cfSong) out.push({ k: 'xiaomi', x: -9, y: -9, juke: 1 });   // 不會畫出來，只讓音樂機亮燈
  return out;
}
function drawCafeRoom(now) {
  if (!cf) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#3b2a1e'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore();
  r('#3b2a1e', 0, 0, W * T, H * T);
  const lit = darkness(world().min) > 0.35;
  cafeRoom('wood', now, cfCast(now), lit);
  /* 檯子上的東西 */
  cf.list.forEach(s => {
    const x = s.x * T, y = s.y * T;
    if (s.k === 'grind') { if (s.item) { cfDraw(s.item, x, y - 4); if (s.prog > 0) cfBar(x + 1, y - 5, s.prog, '#8a5a3a'); } }
    else if (s.k === 'sink') { if (s.prog > 0) cfBar(x + 1, y - 2, s.prog, '#6ec0f0'); }
    else if (s.k === 'mach' || s.k === 'oven') {
      const m = s.k === 'mach', bx = x + 9, by = y + (m ? 10 : -4);
      if (m) s.items.forEach((t, i) => CFI[t](x + 7 + i * 7 - 4, y + 8)); else if (s.items.length && s.state === 'cooking') CFI.dough(x + 8, y - 3);
      if (s.state === 'cooking') { cfBar(bx, by, s.prog, '#ffb347'); if (m) { const f = Math.floor(now / 450) % 3; r('rgba(255,255,255,.8)', x + 14 + f, y + 6 - (f % 2), 1, 2); r('rgba(255,255,255,.5)', x + 17 - f, y + 3, 1, 2); } }
      if (s.state === 'done') { CFI.dish(x + 8, y + (m ? -5 : -9), s.dish); cfBar(bx, by, 1 - s.burn, s.burn > .6 ? '#f06a6a' : '#ffd34d'); }
      if (s.state === 'burnt') { CFI.burnt(x + 8, y + (m ? -5 : -9)); const k = Math.floor(now / 200) % 3; r('rgba(60,50,50,.8)', x + 12 + k, y + (m ? 2 : -3), 2, 3); }
    }
  });
  /* NPC 的手持物、耐心條、說話泡泡 */
  const b = cf.bot; if (b.hold) cfDraw(b.hold, Math.round(b.x * T - 8), Math.round(b.y * T - 24));
  cf.custs.forEach(c => {
    if (c.isPlayer) return;
    if (c.state === 'wait') { const p = c.ttl / c.max; cfBar(Math.round(c.x * T - 7), Math.round(c.y * T + 9), p, p < .25 ? '#f06a6a' : p < .55 ? '#ffd34d' : '#6fd06a'); }
    if (c.state === 'happy') r('#ff6a8a', Math.round(c.x * T - 1), Math.round(c.y * T - 14), 3, 2);
    if (c.line && now - c.line.at < 6000) bubble(c.line, Math.round(c.x * T), Math.round(c.y * T) - (c.state === 'wait' || c.state === 'happy' ? 37 : 9), now);
  });
  /* 面向的檯子描一圈白框 */
  if (cfInKitchen() && !cf.sit && pl.prog >= 1) { const f = cfFacing(), s = cf.by[f.join(',')]; if (s) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1; g.strokeRect(s.x * T + .5, s.y * T + .5, s.w * T - 1, s.h * T - 1); } }
}
function cafeEnts(now, ents) {
  if (!cf) return;
  const e = pl.prog, rx = pl.sx + (pl.x - pl.sx) * e, ry = pl.sy + (pl.y - pl.sy) * e;
  if (cf.hold && !cf.sit) ents.push({ y: ry + .01, draw: () => cfDraw(cf.hold, Math.round(rx * T), Math.round(ry * T - 16)) });
  { const oc = cfMine(); if (cf.sit && cf.ordered && oc && oc.state === 'wait') ents.push({ y: 99, draw: () => cfBubble(Math.round(pl.x * T) + 8, Math.round(pl.y * T) - 5 + 8 - 9, oc.dish) }); }
  cf.peers.forEach(rp => {   // 別的玩家：手上拿的東西、坐著點餐的泡泡
    const h = cf.holds[rp.id];
    if (h && !rp.cs) ents.push({ y: rp.y + .01, draw: () => cfDraw(h, Math.round(rp.x * T), Math.round(rp.y * T - 16)) });
    if (rp.cs) { const oc = cf.custs.find(c => c.isPlayer && c.own === rp.id && c.state === 'wait'); if (oc) ents.push({ y: 99, draw: () => cfBubble(Math.round(rp.tx * T) + 8, Math.round(rp.ty * T) - 5 + 8 - 9, oc.dish) }); }
  });
}
const cafeSeatedNow = () => scene === 'cafe' && !!cf && !!cf.sit;
function cafeDrawSeated(ch, now) {
  const s = cf.sit, sp = s.kind === 'stool' ? { x: s.x + .5, y: 7.5, dy: -5, rim: 1, dir: 'down' } : s.spot;
  const px = Math.round((sp.x - .5) * T), py = Math.round((sp.y - .5) * T + (sp.dy || 0));
  drawPlayerFx(px, py, sp.dir || 'down', false, 0, ch, null);
  if (sp.rim) r(CF_TH.wood.rimC || CF_TH.wood.stool, px + 3, py + 12, 10, 3);
  if (sp.k === 'sofa') cfSofaFront(11 * T, 2 * T, CF_TH.wood.sofa);
  { const fx = animFx(anim, now); if (fx && fx.eat) drawEatFx(px, py, fx.eat); }   // 坐著喝完也有光環
  nameTag(ch.name, px + 8, py - 5, '#ffffff');
}
