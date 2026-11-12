'use strict';
/* 廣場左下角的露營烹飪區 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。
   位置與可互動的格子定義在 js/world.js（CAMP、CKP、CMD）。
   篝火吊鍋、切菜料理檯、烤肉架：面向它按動作鍵開廚房菜單，煮法和家裡灶台一樣（火候小遊戲）；帳篷和提燈只是裝飾。
   伺服器的 cook 要收 p_plaza = true（在廣場煮、不用自己家裡有灶台），見 camp.sql。 */

/* 木墩：位置在 js/world.js 的 CAMP（seat: true），用長椅的坐法（takeBench）。 */
/* 面向廣場上的烹飪工具按動作鍵：記下站位，開廚房菜單 */
function campCook(x, y) {
  const o = campAt(x, y); if (!o || !o.cook) return;
  ckAnchor = { id: 'camp:' + o.k, fx: x, fy: y, at: null, plaza: true };
  openKitchen();
}
/* 沼澤的蘆葦頂炊棚：位置在 js/world.js 的 SWAMP_COOK（SWC 格子）；煮法跟廣場露營區一樣（伺服器同樣收 p_plaza = true） */
function swampCook(x, y) {
  ckAnchor = { id: 'camp:' + SWAMP_COOK.k, fx: x, fy: y, at: null, plaza: true };
  openKitchen();
}
/* 目前場景裡、烹飪用的那一台（廣場露營區或沼澤炊棚）；id 是 'camp:' + k */
const cookObjById = id => CAMP.find(q => 'camp:' + q.k === id) || ('camp:' + SWAMP_COOK.k === id ? SWAMP_COOK : null);
const cpSh = (x, y, w) => r('rgba(90,60,40,.18)', x, y, w, 1);
function cpFire(x, y, now, w, big) {
  const f = Math.floor(now / 120) % 3;
  r('#ff8a3c', x, y - (f === 0 ? 1 : 0) - (big ? 2 : 0), w, 2 + (big ? 2 : 0)); r('#ffd34d', x + w, y - (f === 1 ? 1 : 0) - (big ? 2 : 0), w - 1, 2 + (big ? 2 : 0)); r('#ff8a3c', x + w * 2 - 1, y - (f === 2 ? 1 : 0), w - 1, 2);
}
function cpSteam(x, y, now) {
  const s = Math.floor(now / 450) % 3;
  r('rgba(255,255,255,.8)', x + s, y - (s % 2), 1, 2); r('rgba(255,255,255,.55)', x + 3 - s, y + 1 - ((s + 1) % 2), 1, 1); r('rgba(255,255,255,.4)', x + 1 + s, y - 4, 1, 1);
}
function cpPot(x, y, now, big) {   // 篝火吊鍋（2×2）
  cpSh(x + 4, y + 30, 24);
  for (let i = 0; i < 7; i++) ob('#a9a9b3', '#6b6b78', x + 4 + (i * 3.4 | 0), y + 25 + (i % 2), 4, 4);
  r('#7a4e2c', x + 15, y + 3, 2, 8);
  for (let i = 0; i < 20; i++) { r('#7a4e2c', x + 16 - (i * 0.4 | 0) - 1, y + 4 + i, 2, 1); r('#7a4e2c', x + 16 + (i * 0.4 | 0), y + 4 + i, 2, 1); }
  r('#4a4a55', x + 16, y + 8, 1, 5); ob('#4a4a55', '#2b2b33', x + 9, y + 12, 14, 9); r('#e8a05a', x + 11, y + 13, 10, 2);
  cpFire(x + 11, y + 26, now, 3, big); cpSteam(x + 13, y + 9, now);
}
function cpTable(x, y, now, big) {   // 切菜料理檯（2×1）
  cpSh(x + 2, y + 15, 28); r('#8a5a34', x + 3, y + 11, 2, 4); r('#8a5a34', x + 27, y + 11, 2, 4);
  ob('#d8a86a', '#8a5a34', x + 1, y + 5, 30, 8); r('#ecc88e', x + 1, y + 6, 30, 1);
  ob('#f6e7bf', '#b89a64', x + 4, y + 4, 11, 6); ob('#f08a3c', '#a04a1c', x + 6, y + 5, 6, 2); r('#6fbf5a', x + 12, y + 5, 2, 2);
  r('#d8d8e2', x + 14, y + 3 - (big && Math.floor(now / 130) % 2 ? 1 : 0), 5, 1); r('#8a5a34', x + 19, y + 3 - (big && Math.floor(now / 130) % 2 ? 1 : 0), 2, 1);
  ob('#fafcff', '#8aa0c0', x + 21, y + 4, 7, 6); r('#7fd08a', x + 22, y + 4, 5, 2); r('#e8584a', x + 24, y + 4, 2, 1);
}
function cpGrill(x, y, now, big) {   // 烤肉架（2×1）
  cpSh(x + 3, y + 15, 26); r('#3b3b46', x + 4, y + 10, 2, 5); r('#3b3b46', x + 26, y + 10, 2, 5);
  ob('#55555f', '#2b2b33', x + 2, y + 6, 28, 6); const o = Math.floor(now / (big ? 110 : 200)) % 2;
  for (let i = 0; i < 9; i++) r((i + o) % 2 ? '#ff7a3c' : '#ffc24d', x + 4 + i * 3, y + 8, 2, 2);
  const col = ['#b0623a', '#6fbf5a', '#e8584a', '#b0623a', '#f0c04a'];
  for (let i = 0; i < 5; i++) { r('#c9a67a', x + 4 + i * 5, y + 3, 1, 5); r(col[i], x + 3 + i * 5, y + 4, 3, 2); }
  cpSteam(x + 10, y + 2, now); cpSteam(x + 22, y + 1, now + 300);
}
function cpShed(x, y, now, big) {   // 蘆葦頂炊棚（2×2）：四根木柱、茅草頂、棚下一座泥磚灶，吊著鍋鏟和乾辣椒
  cpSh(x + 2, y + 31, 28);
  r('#7a4e2c', x + 3, y + 9, 2, 22); r('#7a4e2c', x + 27, y + 9, 2, 22); r('#a8764a', x + 3, y + 9, 1, 22);
  for (let i = 0; i < 9; i++) r(i % 2 ? '#c9b46a' : '#d8c47a', x + 1, y + 1 + i, 30, 1);
  r('#a8924a', x + 1, y + 9, 30, 2); for (let i = 0; i < 15; i++) r('#b09a52', x + 2 + i * 2, y + 11 + (i % 3), 1, 2);
  r('#8a7438', x + 1, y + 1, 30, 1);
  ob('#9a7a58', '#5a4430', x + 8, y + 22, 16, 9); ob('#2a1c14', '#4a3624', x + 12, y + 25, 8, 6);
  const f = Math.floor(now / (big ? 90 : 130)) % 3, u = big ? 1 : 0;
  r('#ff8a3c', x + 13, y + 28 - (f === 0 ? 1 : 0) - u, 3, 3 + u); r('#ffd34d', x + 16, y + 28 - (f === 1 ? 1 : 0) - u, 3, 3 + u);
  ob('#4a4a55', '#2b2b33', x + 10, y + 16, 12, 7); r('#e8a05a', x + 11, y + 17, 10, 1);
  r('#d8d8e2', x + 6, y + 13, 1, 6); r('#8a5a34', x + 5, y + 18, 3, 2);
  r('#e8584a', x + 24, y + 13, 2, 4); r('#e8584a', x + 26, y + 13, 1, 3); r('#6fbf5a', x + 24, y + 12, 1, 1);
  cpSteam(x + 14, y + 14, now);
}
function drawSwampCook(now) {   // 沼澤的炊棚（在 art/swamp.js 的 drawSwampProps 裡呼叫）；正在煮的時候火燒旺一點
  cpShed(SWAMP_COOK.x * T, SWAMP_COOK.y * T, now, !!(cooking && cooking.plaza && cooking.scene === 'swamp' && cooking.phase === 'heat'));
}
function cpTent(x, y) {   // 帳篷（2×2，裝飾）
  cpSh(x + 2, y + 30, 28);
  for (let i = 0; i < 22; i++) { const w = 2 + (i * 1.3 | 0); r(i % 6 < 3 ? '#5fae6a' : '#4a9657', x + 16 - (w >> 1), y + 6 + i, w, 1); }
  r('#3a7a48', x + 15, y + 6, 2, 22); ob('#2b3a2c', '#1e2a20', x + 11, y + 17, 10, 11); r('#d8a86a', x + 15, y + 17, 1, 11);
  r('#c9a05a', x + 16, y + 3, 1, 4); r('#e8584a', x + 17, y + 3, 4, 2); r('#8a5a34', x + 2, y + 28, 1, 3); r('#8a5a34', x + 29, y + 28, 1, 3);
}
function cpLantern(x, y, now) {   // 提燈（1×1，裝飾；夜晚亮一點）
  r('#7a4e2c', x + 7, y + 10, 2, 5); ob('#ffd34d', '#b8803a', x + 5, y + 4, 6, 6); r('#ffffff', x + 7, y + 6, 1, 2);
}
/* 木墩（1×1，可以坐）：站著時畫整個木墩；有人坐的時候由 drawBenchSeated 畫人，再把木墩前緣蓋回去 */
function drawCampStump(px, py) {
  cpSh(px + 3, py + 14, 10); ob('#b98a52', '#7a4e2c', px + 3, py + 6, 10, 8); ob('#e8c48a', '#9b6a44', px + 3, py + 4, 10, 4); r('#c9a062', px + 6, py + 5, 4, 1);
}
function drawCampStumpFront(px, py) {
  ob('#b98a52', '#7a4e2c', px + 3, py + 10, 10, 5); r('#e8c48a', px + 4, py + 10, 8, 1);
}
/* 整區一起畫（在地圖格子畫完之後、人物之前）；正在煮的那一台火會燒旺一點 */
function drawPlazaCamp(now) {
  const busy = cooking && cooking.plaza ? cooking.itId : '';
  CAMP.forEach(o => {
    if (o.seat) return;   // 木墩在地圖格子裡畫（drawBench）
    const x = o.x * T, y = o.y * T, big = busy === 'camp:' + o.k && cooking.phase === 'heat';
    if (o.k === 'pot') cpPot(x, y, now, big); else if (o.k === 'table') cpTable(x, y, now, busy === 'camp:table');
    else if (o.k === 'grill') cpGrill(x, y, now, big); else if (o.k === 'tent') cpTent(x, y); else cpLantern(x, y, now);
  });
}
