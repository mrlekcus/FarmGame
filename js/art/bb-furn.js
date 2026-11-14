'use strict';
/* 夾盲盒獎品家具美術 —— 雷克斯農場。key 對應背包 f:bb_xxx，目錄（尺寸、放置層）在 bb_furniture.sql。
   用法同其他家具：FURN.<key>(px, py, now)，一格 16px；尺寸：minicab 1×2、neonsign 1×1（牆）、padrug 2×2（地毯）、robotdoll 1×1、
   icelamp 1×1、caketable 2×1、marshchair 1×1、candyrug 2×2（地毯）、piggy 1×1、boxsofa 2×1、miniclaw 1×2。 */
const BBSH = 'rgba(90,60,40,.18)';
const bbBlink = (now, n) => Math.floor((now || 0) / 500) % n;
FURN.bb_minicab = (px, py, now) => {                     // 迷你街機櫃（1×2）
  r(BBSH, px + 1, py + 31, 14, 1);
  ob('#e0486a', '#7a1f3a', px + 1, py + 2, 14, 29); r('#ff8fb0', px + 2, py + 3, 12, 1);
  ob('#12182c', '#0a0e1c', px + 3, py + 5, 10, 9);
  const b = bbBlink(now, 3);
  r('#5ae0ff', px + 4, py + 6, 4, 1); r('#ff5fb0', px + 4 + b, py + 8, 2, 2); r('#ffd34d', px + 9, py + 11, 3, 1); r('#8fe09a', px + 5, py + 12, 2, 1);
  ob('#b84a6a', '#7a1f3a', px + 2, py + 16, 12, 5); r('#ff5c7a', px + 4, py + 17, 3, 3); r('#ffd34d', px + 9, py + 18, 2, 2); r('#5ae0ff', px + 12, py + 17, 1, 2);
  r('#7a1f3a', px + 3, py + 24, 10, 6); r('#5a1428', px + 5, py + 26, 6, 4);
  r('#ffd34d', px + 1, py + 1, 14, 1);
};
FURN.bb_neonsign = (px, py, now) => {                    // 霓虹招牌（牆）：「GAME」風格的閃爍招牌
  const on = bbBlink(now, 4) !== 3;
  ob('#12182c', '#0a0e1c', px + 1, py + 3, 14, 9);
  const c1 = on ? '#ff5fb0' : '#a03070', c2 = on ? '#5ae0ff' : '#2f7a90';
  r(c1, px + 3, py + 5, 4, 1); r(c1, px + 3, py + 5, 1, 4); r(c1, px + 3, py + 8, 4, 1); r(c1, px + 6, py + 7, 1, 2);
  r(c2, px + 9, py + 5, 4, 1); r(c2, px + 9, py + 5, 1, 4); r(c2, px + 12, py + 5, 1, 4); r(c2, px + 9, py + 7, 4, 1);
  r('#8a93a3', px + 4, py + 2, 1, 1); r('#8a93a3', px + 11, py + 2, 1, 1);
};
FURN.bb_padrug = (px, py) => {                           // 手把地毯（2×2）：黑色地毯上一支大手把
  ob('#2a2a52', '#12182c', px + 1, py + 1, 30, 30); r('#3a3a72', px + 2, py + 2, 28, 1);
  ob('#5ae0ff', '#2f7a90', px + 3, py + 3, 26, 1); ob('#ff5fb0', '#a03070', px + 3, py + 28, 26, 1);
  ob('#8a93a3', '#4a4f5c', px + 7, py + 11, 18, 10);
  r('#12182c', px + 9, py + 14, 5, 1); r('#12182c', px + 11, py + 12, 1, 5);
  ob('#ff5c7a', '#a02840', px + 18, py + 13, 3, 3); ob('#ffd34d', '#b8892a', px + 21, py + 16, 3, 3);
};
FURN.bb_robotdoll = (px, py, now) => {                   // 機器人玩偶（嗶嗶的小玩偶，眼睛會閃）
  r(BBSH, px + 2, py + 15, 12, 1);
  const on = bbBlink(now, 5) !== 4;
  r('#7a8590', px + 7, py, 2, 3); r('#ff5c7a', px + 6, py - 1, 4, 2);
  ob('#c9ced6', '#7a8590', px + 3, py + 3, 10, 6); ob('#12182c', '#0a0e1c', px + 4, py + 4, 8, 3);
  r(on ? '#5ae0ff' : '#2f7a90', px + 5, py + 5, 2, 1); r(on ? '#5ae0ff' : '#2f7a90', px + 9, py + 5, 2, 1);
  ob('#c9ced6', '#7a8590', px + 4, py + 9, 8, 5); r('#ff5fb0', px + 7, py + 11, 2, 1); r('#8a93a3', px + 2, py + 10, 2, 3); r('#8a93a3', px + 12, py + 10, 2, 3);
  r('#7a8590', px + 5, py + 14, 2, 1); r('#7a8590', px + 9, py + 14, 2, 1);
};
FURN.bb_icelamp = (px, py, now) => {                     // 冰淇淋燈：甜筒造型的檯燈，晚上有暖暖的光
  r(BBSH, px + 3, py + 15, 10, 1);
  r('#e8b06a', px + 6, py + 8, 4, 7); r('#c9854a', px + 6, py + 10, 4, 1); r('#c9854a', px + 7, py + 12, 2, 1); r('#c9854a', px + 7, py + 14, 2, 1);
  ob('#ff9bb3', '#d4688a', px + 3, py + 3, 10, 6); ob('#fffaf0', '#e6d7c3', px + 5, py, 6, 5);
  r('#e0486a', px + 7, py - 2, 2, 2); r('#ffffff', px + 5, py + 4, 1, 1); r('#ffe28a', px + 10, py + 6, 1, 1);
  r('#fff3b0', px + 7, py + 2, 2, 1);
};
FURN.bb_caketable = (px, py) => {                        // 蛋糕桌（2×1）：圓圓的蛋糕做的矮桌
  r(BBSH, px + 2, py + 15, 28, 1);
  ob('#fffaf0', '#e6d7c3', px + 2, py + 3, 28, 11); ob('#ff9bb3', '#d4688a', px + 2, py + 2, 28, 4);
  for (let i = 0; i < 6; i++) r('#ff9bb3', px + 4 + i * 5, py + 6, 2, 2 + (i % 2));
  r('#e0486a', px + 5, py, 2, 2); r('#e0486a', px + 15, py, 2, 2); r('#e0486a', px + 25, py, 2, 2);
  r('#fff3b0', px + 6, py + 10, 3, 1); r('#fff3b0', px + 18, py + 10, 3, 1); r('#e6d7c3', px + 2, py + 13, 28, 1);
};
FURN.bb_marshchair = (px, py) => {
  r(BBSH, px + 2, py + 15, 12, 1);
  ob('#fffaf0', '#e6d7c3', px + 3, py + 2, 10, 8); ob('#ffd1e0', '#e6a8c0', px + 2, py + 8, 12, 6);
  r('#ffffff', px + 5, py + 3, 3, 1); r('#ffb3c6', px + 4, py + 11, 8, 1); r('#e6a8c0', px + 6, py + 6, 4, 1);
};
FURN.bb_candyrug = (px, py) => {                         // 糖果地毯（2×2）：糖果紙造型，兩端扭結
  ob('#ff9bb3', '#d4688a', px + 5, py + 6, 22, 20);
  for (let i = 0; i < 5; i++) { r('#ffffff', px + 7 + i * 4, py + 7, 2, 18); }
  r('#ffd34d', px + 5, py + 6, 22, 1); r('#ffd34d', px + 5, py + 25, 22, 1);
  ob('#ff9bb3', '#d4688a', px + 1, py + 10, 5, 12); ob('#ff9bb3', '#d4688a', px + 26, py + 10, 5, 12);
  r('#d4688a', px + 2, py + 13, 3, 1); r('#d4688a', px + 2, py + 16, 3, 1); r('#d4688a', px + 27, py + 13, 3, 1); r('#d4688a', px + 27, py + 16, 3, 1);
  r('#5ae0ff', px + 10, py + 12, 2, 2); r('#ffd34d', px + 20, py + 18, 2, 2); r('#8fe09a', px + 15, py + 21, 2, 2);
};
FURN.bb_piggy = (px, py, now) => {                       // 投幣存錢筒：粉紅小豬，頭頂有投幣孔
  r(BBSH, px + 2, py + 15, 12, 1);
  ob('#ff9bb3', '#d4688a', px + 2, py + 5, 12, 9); ob('#ff9bb3', '#d4688a', px + 12, py + 7, 3, 4);
  r('#e0486a', px + 14, py + 8, 1, 1); r('#ffd1e0', px + 4, py + 6, 3, 1);
  r('#12182c', px + 6, py + 5, 4, 1); r('#12182c', px + 5, py + 8, 1, 1);
  r('#d4688a', px + 3, py + 13, 2, 2); r('#d4688a', px + 10, py + 13, 2, 2); ob('#ff9bb3', '#d4688a', px + 3, py + 3, 3, 3);
  if (bbBlink(now, 4) === 0) { r('#ffd34d', px + 7, py + 1, 2, 3); r('#b8892a', px + 7, py + 1, 1, 3); }
};
FURN.bb_boxsofa = (px, py) => {                          // 盲盒沙發（2×1）：紫色盲盒做的長沙發，有金色緞帶和「？」
  r(BBSH, px + 1, py + 15, 30, 1);
  ob('#8a6ae0', '#4a2aa8', px + 1, py + 1, 30, 7); ob('#a58cf0', '#4a2aa8', px + 3, py + 6, 26, 8);
  r('#ffd34d', px + 15, py + 1, 2, 13); r('#ffd34d', px + 3, py + 10, 26, 1);
  r('#ffffff', px + 6, py + 7, 2, 1); r('#ffffff', px + 8, py + 8, 1, 1); r('#ffffff', px + 7, py + 9, 1, 1); r('#ffffff', px + 22, py + 7, 2, 1); r('#ffffff', px + 24, py + 8, 1, 1); r('#ffffff', px + 23, py + 9, 1, 1);
  r('#4a2aa8', px + 3, py + 14, 2, 2); r('#4a2aa8', px + 27, py + 14, 2, 2);
};
FURN.bb_miniclaw = (px, py, now) => {                    // 迷你夾娃娃機（1×2）：爪子會左右晃
  r(BBSH, px + 1, py + 31, 14, 1);
  ob('#ff8fb0', '#b84a6a', px + 1, py + 2, 14, 29); r('#e0486a', px + 2, py + 3, 12, 2);
  ob('#e8f6ff', '#7a8590', px + 3, py + 6, 10, 12); r('#a9bfd8', px + 4, py + 14, 8, 3);
  r('#8a6ae0', px + 4, py + 12, 3, 3); r('#ffa83c', px + 8, py + 13, 3, 2); r('#3cc89a', px + 6, py + 10, 2, 2);
  const sw = [0, 1, 2, 1][Math.floor((now || 0) / 400) % 4];
  r('#c9ced6', px + 4, py + 6, 8, 1); r('#7a8590', px + 6 + sw, py + 7, 1, 3); r('#e0486a', px + 5 + sw, py + 10, 3, 1); r('#c9ced6', px + 5 + sw, py + 11, 1, 1); r('#c9ced6', px + 7 + sw, py + 11, 1, 1);
  ob('#b84a6a', '#7a1f3a', px + 2, py + 19, 12, 5); r('#ff5c7a', px + 4, py + 20, 3, 3); r('#ffd34d', px + 9, py + 21, 2, 2);
  r('#12182c', px + 9, py + 26, 4, 3); r('#ffd34d', px + 9, py + 29, 4, 1);
};
