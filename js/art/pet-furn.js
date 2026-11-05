/* 寵物家具美術：飯碗（木托盤雙碗 2×1）與四款玩具。擺放用 FURN.<key>(px,py,now)，商店圖示用 PETF。
   key 對應商店買到的背包物品 f:petbowl、f:pettoya~d。目錄（尺寸、價錢）要在伺服器的家具目錄加同名的列。 */
/* 寵物家具候選（16px 一格）。draw(px,py,full,now)；full=碗裡有沒有飼料 */
const PETSH = 'rgba(90,60,40,.18)';
const PETF = {};
// 飯碗 A：藍色陶瓷碗（肉球圖案）
PETF.bowlA = (px, py, full) => {
  r(PETSH, px + 2, py + 14, 12, 1);
  ob('#7fb7e8', '#3f6fa0', px + 2, py + 8, 12, 7); r('#5f97c8', px + 3, py + 12, 10, 2);
  r('#fff', px + 7, py + 10, 2, 2); r('#fff', px + 5, py + 9, 1, 1); r('#fff', px + 10, py + 9, 1, 1); r('#fff', px + 6, py + 8, 0, 0);
  ob('#f4efe6', '#3f6fa0', px + 1, py + 6, 14, 3);
  if (full) { rr('#b9803f', px + 3, py + 3, 10, 4); r('#d9a066', px + 4, py + 3, 3, 2); r('#8f5e2c', px + 8, py + 5, 3, 1); r('#d9a066', px + 9, py + 3, 2, 1); }
  else r('#e4dccd', px + 3, py + 7, 10, 1);
};
// 飯碗 B：木托盤雙碗（飼料＋水），寬 2 格
PETF.bowlB = (px, py, full) => {
  r(PETSH, px + 2, py + 14, 28, 1);
  ob('#c99a6a', '#7a5532', px + 1, py + 10, 30, 5); r('#e0b888', px + 2, py + 11, 28, 1); r('#a87848', px + 2, py + 14, 28, 1);
  ob('#f4efe6', '#8a6a4a', px + 3, py + 5, 11, 7); r('#e4dccd', px + 4, py + 6, 9, 1);
  if (full) { rr('#b9803f', px + 4, py + 2, 9, 4); r('#d9a066', px + 5, py + 2, 3, 2); r('#8f5e2c', px + 9, py + 4, 2, 1); }
  ob('#f4efe6', '#8a6a4a', px + 18, py + 5, 11, 7); r('#9bd6f2', px + 19, py + 6, 9, 3); r('#d6f0fb', px + 21, py + 6, 3, 1);
  r('#7a5532', px + 15, py + 7, 2, 4);
};
// 飯碗 C：魚形貓碗
PETF.bowlC = (px, py, full) => {
  r(PETSH, px + 2, py + 14, 12, 1);
  ob('#ffd9a8', '#b8651e', px + 2, py + 8, 12, 7); r('#f0b878', px + 3, py + 12, 10, 2);
  r('#b8651e', px + 7, py + 10, 1, 3); r('#b8651e', px + 9, py + 10, 1, 3); r('#b8651e', px + 5, py + 11, 1, 1); r('#b8651e', px + 11, py + 11, 1, 1);   // 魚骨
  ob('#fff3e0', '#b8651e', px + 1, py + 6, 14, 3);
  if (full) { rr('#8fc0d8', px + 3, py + 3, 3, 4); rr('#8fc0d8', px + 6, py + 2, 3, 5); rr('#a8d6e8', px + 9, py + 3, 3, 4); r('#fff', px + 4, py + 4, 1, 1); r('#fff', px + 10, py + 4, 1, 1); }
};
// 飯碗 D：粉紅愛心碗＋地墊
PETF.bowlD = (px, py, full) => {
  r(PETSH, px + 1, py + 14, 14, 1);
  ob('#ffe3ec', '#d9667f', px + 0, py + 11, 16, 4); r('#ffc2d2', px + 1, py + 12, 14, 1);
  ob('#ff9db8', '#c04870', px + 3, py + 6, 10, 6); r('#e87898', px + 4, py + 10, 8, 1);
  r('#fff', px + 6, py + 8, 1, 1); r('#fff', px + 9, py + 8, 1, 1); r('#fff', px + 7, py + 9, 2, 1);
  ob('#fff0f5', '#c04870', px + 2, py + 5, 12, 2);
  if (full) { rr('#b9803f', px + 4, py + 2, 8, 4); r('#d9a066', px + 5, py + 2, 3, 2); r('#8f5e2c', px + 9, py + 4, 2, 1); }
};
// 玩具 A：編織玩具籃（球、骨頭、小魚）
PETF.toyA = (px, py) => {
  r(PETSH, px + 1, py + 14, 14, 1);
  ob('#e0b070', '#8a5a2c', px + 2, py + 8, 12, 7); r('#c99050', px + 3, py + 10, 10, 1); r('#c99050', px + 3, py + 13, 10, 1);
  ob('#ff7a6c', '#b8403a', px + 3, py + 3, 5, 5); r('#ffd34d', px + 3, py + 5, 5, 1); r('#fff', px + 4, py + 4, 1, 1);
  r('#fff3d6', px + 9, py + 3, 5, 2); ob('#fff3d6', '#b59a6a', px + 8, py + 2, 2, 3); ob('#fff3d6', '#b59a6a', px + 13, py + 2, 2, 3);
  rr('#8fc0d8', px + 9, py + 5, 4, 3); r('#3f6fa0', px + 12, py + 6, 1, 1);
};
// 玩具 B：貓跳台（1×2：高 32）
PETF.toyB = (px, py) => {
  r(PETSH, px + 1, py + 30, 14, 1);
  ob('#cfae7a', '#7a5532', px + 2, py + 25, 12, 6); r('#e8c9a0', px + 3, py + 26, 10, 1);
  ob('#e8d4a8', '#8a6a3c', px + 6, py + 6, 4, 20); for (let i = 0; i < 9; i++) r('#c9a868', px + 6, py + 8 + i * 2, 4, 1);
  ob('#ffb3c6', '#c04870', px + 1, py + 4, 14, 4); r('#ffd0dc', px + 2, py + 5, 12, 1);
  ob('#fff3d6', '#b59a6a', px + 7, py + 14, 6, 4);
  r('#7a5532', px + 3, py + 7, 1, 5); ob('#ff7a6c', '#b8403a', px + 2, py + 11, 3, 3); r('#ffd34d', px + 2, py + 12, 3, 1);
  r('#b59a6a', px + 13, py + 2, 1, 2);
};
// 玩具 C：繩結拔河玩具＋毛線球
PETF.toyC = (px, py) => {
  r(PETSH, px + 1, py + 14, 14, 1);
  ob('#ffe3ec', '#d9667f', px + 1, py + 10, 14, 5); r('#ffc2d2', px + 2, py + 11, 12, 1);
  ob('#fff0d0', '#a8884a', px + 2, py + 6, 3, 3); ob('#ff7a6c', '#b8403a', px + 5, py + 7, 6, 2); ob('#fff0d0', '#a8884a', px + 10, py + 6, 3, 3);
  r('#ffd34d', px + 6, py + 7, 1, 2); r('#ffd34d', px + 9, py + 7, 1, 2);
  rr('#8f7fe0', px + 9, py + 1, 6, 6); r('#b9acf2', px + 10, py + 2, 2, 1); r('#6a5cc0', px + 10, py + 4, 4, 1); r('#6a5cc0', px + 11, py + 6, 3, 1);
  r('#6a5cc0', px + 4, py + 3, 1, 3); r('#6a5cc0', px + 5, py + 2, 4, 1);
};
// 玩具 D：條紋隧道帳篷（2×1：寬 32）
PETF.toyD = (px, py) => {
  r(PETSH, px + 1, py + 14, 30, 1);
  ob('#ffb3a8', '#b8403a', px + 1, py + 3, 30, 12);
  for (let i = 0; i < 6; i++) r('#fff3e0', px + 4 + i * 5, py + 4, 2, 10);
  ob('#5a3a4a', '#3a2030', px + 22, py + 5, 8, 9); r('#3a2030', px + 23, py + 7, 6, 6);
  ob('#8fd3a8', '#3f8a5a', px + 0, py + 12, 6, 3); r('#ffd34d', px + 14, py + 0, 1, 3); r('#ffd34d', px + 13, py + 0, 3, 1);
  rr('#8f7fe0', px + 8, py + 0, 0, 0);
};
const PETF_DIM = { bowlB: [2, 1], toyA: [1, 1], toyB: [1, 2], toyC: [1, 1], toyD: [2, 1] };

if (typeof FURN !== 'undefined') {
  FURN.petbowl = (px, py) => PETF.bowlB(px, py, !!(typeof petMine !== 'undefined' && petMine && petMine.bowl > 0));   // 碗裡有飼料才畫飼料
  FURN.pettoya = (px, py) => PETF.toyA(px, py);
  FURN.pettoyb = (px, py) => PETF.toyB(px, py);
  FURN.pettoyc = (px, py) => PETF.toyC(px, py);
  FURN.pettoyd = (px, py) => PETF.toyD(px, py);
}
