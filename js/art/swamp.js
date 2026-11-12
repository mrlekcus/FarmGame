'use strict';
/* 霧語沼澤的畫法：5 種新魚、5 種新蟲蝶的像素圖，石拱門、石柱、告示牌、岩石、蘆葦、睡蓮、蘑菇，還有飄動的霧 —— 雷克斯農場。
   所有檔案共用同一個全域範圍，載入順序見 index.html（要在 art/icons.js 之後）。全部用程式畫，不需要外部圖檔。
   魚蟲的圖用字元畫：每個字母對應 pal 裡的一種顏色，'.' 是透明；畫布 16×16，圖會自動置中。 */

const SWAMP_BUG = {
  morpho: { m: 'sq', pal: {'#4a3030': 'a', '#1a2f6a': 'b', '#3a8cff': 'c', '#bfe4ff': 'd', '#2a6ad8': 'e'},
    rows: ['...a....a...', '....a..a....', '.bbbb..bbbb.', 'bbccbaabccbb', 'bccdcaacdccb', 'bbccbaabccbb', '.bbbbaabbbb.', '..bbbaabbb..', '.bbedaadebb.', '.bbebaabebb.', '..bbbaabbb..', '............', '...b....b...', '...b....b...'] },
  mothlune: { m: 'sq', pal: {'#4a3030': 'a', '#6a7aa8': 'b', '#eef2ff': 'c', '#ffe9a0': 'd'},
    rows: ['...a....a...', '....a..a....', '............', '.bbbbaabbbb.', 'bbccbaabccbb', 'bcdccaaccdcb', 'bccccaaccccb', 'bbccbaabccbb', '.bbbbaabbbb.', '.....aa.....', '............', '...b....b...', '...b....b...'] },
  damsel: { m: 'bob', pal: {'#a8d0f0': 'a', '#e8f4ff': 'b', '#2a8ae0': 'c', '#1a3a6a': 'd', '#5fb8ff': 'e'},
    rows: ['..aaaa..aaaa.', '..bbbb..bbbb.', '.............', '..bbbb..bbbc.', 'dceeeeeeeeccd', 'c..........cc'] },
  skater: { m: 'legs', pal: {'#4a3a2a': 'a', '#6a5a44': 'b', '#2a1a0a': 'c', '#bff0fd': 'd'},
    rows: ['..aaa....aaa..', '.....abbacc...', '.....aaaa.....', '..aaa....aaa..', '.a..a....a..a.', '..............', 'ddd........ddd', '....dddddd....'] },
  stickbug: { m: 'legs', pal: {'#4a6a2a': 'a', '#a0d46a': 'b', '#8fc25a': 'c', '#5a8a3a': 'd', '#7fae4a': 'e'},
    rows: ['............aa', '.............a', '...........a..', '.........bbaa.', '.......ccc....', '.....ccc..d...', '...eed.d..d...', '.eed.d.d..d...', '.d.d.d.d..d...', '.d.d...d..d...', 'aa..aa.aa.aa..'] },
  wintermoth: { m: 'sq', pal: {'#4a3a30': 'a', '#8a8070': 'b', '#b8ae98': 'c', '#6a6050': 'd'},
    rows: ['...a....a...', '....a..a....', '............', '.bbbbaabbbb.', 'bbccbaabccbb', 'bcddcaacddcb', 'bccdcaacdccb', 'bbccbaabccbb', '.bbbbaabbbb.', '.....aa.....', '............', '...d....d...', '...d....d...'] },
  snowflea: { m: 'legs', pal: {'#2a2a3a': 'a', '#5a5a78': 'b', '#ffffff': 'c', '#cfe6f6': 'd'},
    rows: ['....a.a.', '.aabbbb.', 'abbbbbba', '.a.aa.a.', 'd.c..c.d', '..d..d..'] },
  icefly: { m: 'legs', pal: {'#1a2a4a': 'a', '#3a5a8a': 'b', '#9ff0ff': 'c', '#ffffff': 'd', '#4ac8e8': 'e'},
    rows: ['..a....a..', '...a..a...', '..bbbbbb..', '.bbbbbbbb.', '.bbbbbbbb.', '..aaaaaa..', '..aeccea..', '..ecddce..', '...ecce...', '....ee....'] },
};
const SWAMP_FISH = {
  mudloach: { pal: {'#5e4a2a': 'a', '#8f7648': 'b', '#b59a6a': 'c', '#7a6038': 'd', '#ffffff': 'e', '#7a4a4a': 'f'},
    rows: ['a...............', 'aa..aaaaaaaaa...', 'abaacdcdcdcccef.', 'abaaccccccccca..', 'aa..aadadaaaa..a', 'a..............a'] },
  lampfish: { pal: {'#1d2f6a': 'a', '#ff6b6b': 'b', '#3a5fb0': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#5ff0ff': 'f'},
    rows: ['a.........', 'aa..aaaaa.', 'abaaccccde', 'abaffffffa', 'aa..aaaaa.', 'a.........'] },
  lotuscarp: { pal: {'#ff8fa8': 'a', '#b4506c': 'b', '#ffb3c6': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#fff0f4': 'f', '#ff7a9a': 'g'},
    rows: ['......aaa....', '......bbb....', 'b...bbcccbb..', 'bb.bcdcccdcb.', 'babccccdcccde', 'babccccccccb.', 'bb.bffgffffb.', 'b...bbfffbb..', '......bbb....'] },
  swamppike: { pal: {'#222c18': 'a', '#2a3420': 'b', '#4a5a3a': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#8a8a5a': 'f'},
    rows: ['........a......', 'a..aababcbaaaa.', 'aaacbcbcbcbccde', 'aaaccccccccccca', 'a..aafaafaaaaa.', '........a......'] },
  mistdragon: { pal: {'#8a5a14': 'a', '#f0c860': 'b', '#ffe9a0': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#fff6c8': 'f'},
    rows: ['.....aaaaaaa....', 'a.aaabcbbbcbaaa.', 'aabbcbbbcbbbbbde', 'aabbbbbbbbbcbbba', 'a.aaacfffcffaaa.', '.....aaaaaaa....'] },
  sunmedaka: { pal: {'#8a7428': 'a', '#d8b84a': 'b', '#f4e08a': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#6ac0f0': 'f'},
    rows: ['....bb....', 'a..aaaaaa.', 'abaaccccde', 'abaaffffca', 'aa..aaaaa.', 'a.........'] },
  snakehead: { pal: {'#3a2a20': 'a', '#6a4a30': 'b', '#8a6a44': 'c', '#ffffff': 'd', '#7a4a4a': 'e', '#c8a870': 'f'},
    rows: ['....aaaaaaaa...', 'a..abbcbbcbaaa.', 'aaabcbbcbbcccde', 'aaaccccccccccca', 'a..aaffffffaa..', '...............'] },
};

/* ---------- 魚：用 drawFish 內建的 draw 掛鉤（icons.js 的 FISH_ART[key].draw） ---------- */
function swampPaint(S, fr, ox, oy, col, mode) {
  const rows = S.rows, h = rows.length, w = rows[0].length;
  const bx = ox + ((16 - w) >> 1), by = oy + ((16 - h) >> 1);
  const cx = (w - 1) / 2;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    let sx = 0;
    if (mode === 'legs' && y >= h - 2) sx = fr ? 1 : 0;            // 水黽：水面的漣漪一圈一圈
    if (mode === 'sway' && y < 4) sx = fr ? -1 : 0;                  // 竹節蟲：頭和前腳左右晃
    for (let x = 0; x < w; x++) {
      let src = x;
      if (mode === 'sq' && fr) { src = Math.round(cx + (x - cx) / 0.62); if (src < 0 || src >= w) continue; }   // 蝶的翅膀拍下去：往中間縮
      const ch = row[src];
      if (ch === '.' || !ch) continue;
      r(col(S.pal ? swampPal(S, ch) : '#000'), bx + x + sx, by + y, 1, 1);
    }
  }
}
const swampPal = (S, ch) => { for (const c in S.pal) if (S.pal[c] === ch) return c; return '#000000'; };
Object.keys(SWAMP_FISH).forEach(k => { FISH_ART[k] = { draw: col => swampPaint(SWAMP_FISH[k], 0, 0, 0, col, '') }; });
/* 蟲蝶：icons.js 的 bugPix 一開頭會先問這裡（有登記的就由這裡畫） */
function swampBugPix(key, fr, ox, oy, dim) {
  const S = SWAMP_BUG[key]; if (!S) return false;
  const DIM = '#cdbfb8';
  swampPaint(S, fr, ox, oy, c => dim ? DIM : c, S.m === 'bob' ? '' : S.m);
  return true;
}

/* ---------- 地圖零件 ---------- */
/* 石柱（SWP）：上下相連的石柱只有最上面有柱帽、最下面有柱腳 */
function drawSwampPillar(px, py, tx, ty) {
  const up = K[ty - 1] && K[ty - 1][tx] === SWP, dn = K[ty + 1] && K[ty + 1][tx] === SWP;
  r('rgba(70,80,70,.20)', px + 2, py + 14, 13, 2);
  const y0 = up ? 0 : 3, y1 = dn ? 16 : 14;
  r('#8d877c', px + 3, py + y0, 10, y1 - y0);
  r('#c9c3b8', px + 4, py + y0, 7, y1 - y0);
  r('#e6e1d6', px + 4, py + y0, 2, y1 - y0);
  r('#a9a397', px + 10, py + y0, 2, y1 - y0);
  if (!up) { ob('#d9d4c8', '#8d877c', px + 1, py + 1, 14, 4); r('#f2eee4', px + 3, py + 2, 8, 1); }
  if (!dn) { ob('#c9c3b8', '#8d877c', px + 2, py + 13, 12, 3); }
  for (let i = 0; i < 3; i++) { const mx = px + 4 + ((tx * 3 + ty * 5 + i * 4) % 7), my = py + y0 + 3 + ((tx + ty * 2 + i * 5) % Math.max(1, y1 - y0 - 6)); r('#7fa86a', mx, my, 2, 1); r('#a8cf8e', mx, my - 1, 1, 1); }
  if (!dn) { r('#7fa86a', px + 4, py + 12, 4, 1); r('#a8cf8e', px + 5, py + 11, 2, 1); r('#7fa86a', px + 10, py + 12, 2, 1); }
}
/* 霧語小徑的入口（SWG）：沙路上浮著一層淡淡的光霧和幾顆飄動的小光點 */
function drawSwampArch(px, py, tx, ty, now) {
  r('rgba(220,240,235,.28)', px, py, T, T);
  r('rgba(220,240,235,.22)', px + 2, py + 1, T - 4, T - 2);
  for (let i = 0; i < 4; i++) {
    const a = now / (900 + i * 170) + i * 1.9, x = px + 3 + i * 3 + Math.round(Math.sin(a) * 2), y = py + 12 - ((now / (60 + i * 11) + i * 7) % 12);
    ctx.globalAlpha = 0.45 + 0.4 * Math.abs(Math.sin(a * 1.3));
    r('#f4fff0', x, Math.round(y), 1, 1); r('#cfeedd', x + 1, Math.round(y), 1, 1);
    ctx.globalAlpha = 1;
  }
}
/* 告示牌（SWS）：木樁上一塊木牌 */
function drawSwampSign(px, py, now) {
  r('rgba(70,80,60,.20)', px + 3, py + 14, 11, 2);
  r('#8c5b3c', px + 7, py + 8, 2, 7); r('#a8764a', px + 7, py + 8, 1, 7);
  ob('#e8c48a', '#8c5b3c', px + 1, py + 2, 14, 8);
  r('#c9965f', px + 2, py + 3, 12, 1); r('#fff0c8', px + 2, py + 8, 12, 1);
  r('#7a8a5a', px + 4, py + 5, 8, 1); r('#7a8a5a', px + 5, py + 7, 5, 1);
  r('#7fa86a', px + 12, py + 9, 2, 1);
}
/* 岩石（SWR） */
function drawSwampRock(px, py, tx, ty) {
  r('rgba(70,80,70,.22)', px + 1, py + 13, 14, 3);
  ob('#b4b8c4', '#6f7384', px + 2, py + 5, 12, 9);
  r('#d9dce6', px + 4, py + 6, 5, 2); r('#8d91a2', px + 9, py + 10, 4, 3);
  r('#7fa86a', px + 3, py + 12, 4, 2); r('#a8cf8e', px + 4, py + 11, 2, 1); r('#7fa86a', px + 10, py + 6, 2, 1);
}
/* 水：在原本的水上蓋一層青綠，岸邊的沙變成泥色，睡蓮用 swampProps 另外畫 */
function drawSwampWater(px, py, tx, ty, now) {
  drawWater(px, py, tx, ty, now);
  r('rgba(56,110,96,.30)', px, py, T, T);
  r('rgba(30,70,60,.12)', px, py + 9, T, 7);
}
/* 蘆葦（香蒲）：一叢三根，隨風輕輕擺 */
function swampReed(px, py, i, now) {
  const sw = Math.round(Math.sin(now / 700 + i * 1.7));
  r('rgba(70,80,60,.18)', px + 3, py + 14, 10, 2);
  [[4, 12, 7], [8, 14, 10], [11, 11, 8]].forEach(([x, h, v], k) => {
    const o = k === 1 ? sw : -sw;
    r('#5f8a4a', px + x, py + 15 - h + 2, 1, h - 2); r('#7fae5f', px + x + 1, py + 15 - h + 4, 1, h - 6);
    r('#8c5b3c', px + x + (k === 1 ? sw : 0) - 0, py + 15 - h, 2, 4); r('#c9965f', px + x + (k === 1 ? sw : 0), py + 15 - h, 1, 3);
    r('#5f8a4a', px + x + o, py + 15 - h - 2, 1, 2);
  });
}
function swampMush(px, py) {
  r('rgba(70,80,60,.22)', px + 4, py + 13, 9, 2);
  r('#f3e8d6', px + 7, py + 9, 3, 4); ob('#e8453c', '#a8281e', px + 4, py + 5, 9, 5);
  r('#ffffff', px + 6, py + 6, 2, 1); r('#ffffff', px + 10, py + 7, 1, 1);
}
function swampLily(px, py, i, now) {
  const bob = Math.round(Math.sin(now / 900 + i * 2));
  ob('#9fe8a6', '#5fb870', px + 3, py + 5 + bob, 9, 7); r('#86d6f3', px + 8, py + 5 + bob, 3, 2);
  if (i % 2 === 0) { r('#ffb3c6', px + 5, py + 6 + bob, 3, 3); r('#ffffff', px + 6, py + 7 + bob, 1, 1); r('#ffd34d', px + 6, py + 6 + bob, 1, 1); }
}
/* 沼澤上的零件（蘆葦、蘑菇、睡蓮）：位置由地圖決定，第一次畫的時候算好 */
let swampDeco = null;
function swampBuildDeco() {
  const d = { reed: [], mush: [], lily: [] };
  for (let y = 1; y < SWH - 1; y++) for (let x = 1; x < SWW - 1; x++) {
    if (skind[y][x] === G) {
      let nearW = false;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (skind[y + j] && skind[y + j][x + i] === WA) nearW = true;
      if (nearW && hash(x, y, 61) < 0.42) d.reed.push([x, y]);
      else if (!nearW && hash(x, y, 62) < 0.03) d.reed.push([x, y]);
    }
  }
  SWAMP_MUSH.forEach(q => d.mush.push(q));
  SWAMP_LILY.forEach(q => d.lily.push(q));
  return d;
}
function drawSwampProps(now) {
  if (!swampDeco) swampDeco = swampBuildDeco();
  swampDeco.lily.forEach(([x, y], i) => swampLily(x * T, y * T, i, now));
  swampDeco.mush.forEach(([x, y]) => swampMush(x * T, y * T));
  swampDeco.reed.forEach(([x, y], i) => swampReed(x * T, y * T, i, now));
  drawSwampCook(now);   // 蘆葦頂炊棚（可以做料理）
}
/* 霧：幾條淡淡的白霧帶慢慢飄過，貼近水面的地方特別濃（夜裡和下雨天另外有自己的濾鏡） */
function drawSwampMist(now) {
  const W_ = SWW * T, H_ = SWH * T;
  for (let i = 0; i < 6; i++) {
    const sp = 0.004 + i * 0.0013, x0 = ((now * sp + i * 97) % (W_ + 120)) - 120, y0 = 22 + i * 34 + Math.sin(now / 2400 + i * 2.3) * 5;
    ctx.globalAlpha = 0.10 + 0.04 * Math.sin(now / 1700 + i);
    r('#eaf6f1', Math.round(x0), Math.round(y0), 120, 6); r('#eaf6f1', Math.round(x0 + 14), Math.round(y0 - 3), 88, 3); r('#eaf6f1', Math.round(x0 + 24), Math.round(y0 + 6), 70, 3);
  }
  ctx.globalAlpha = 0.07; r('#dff1ec', 0, 4 * T, W_, 7 * T);
  ctx.globalAlpha = 1;
}
