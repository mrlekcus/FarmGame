'use strict';
/* 村莊故事的劇情 CG：跟 pet-cg.js 同一種做法，用遊戲同款的 r()／npcArt() 像素畫法即時畫出來，不用任何圖片檔。
   一格畫面 192×108，用 CSS 放大成滿版。每一章一幅 CG（SCG_SC[章數-1]），畫面會動：炊煙、蒸氣、漣漪、燈火、發芽…。
   用在兩個地方：① 布告欄「村莊故事」分頁的回憶相簿（縮圖＋點開重播＋從頭連播）；② 村民的章節對話（接任務／交付後）。
   重播只在本機演，不寫伺服器，也不會再領一次獎勵。
   對白優先用伺服器 story_get 給的 lines／outro；沒有的話才用下面 SCG_FALLBACK。
   打字機效果直接用 pet-cg.js 的 petCgType／petCgSkipType。 */
const SCG_FALLBACK = [
  [{ s: 'oak', t: '葡萄種出來了嗎？自從你進村那天，我就一直惦記著要嚐嚐呢。' }, { s: 'me', t: '剛摘下來的，請嚐嚐。' }, { s: 'oak', t: '嗯～甜得剛剛好。這個村子，就拜託你了。' }],
  [{ s: 'gui', t: '從前祭典的蔬菜湯，我怎麼煮都不是那個味道……' }, { s: 'me', t: '需要什麼材料呢？' }, { s: 'gui', t: '新鮮蔬菜就行。啊，就是這個香氣！' }],
  [{ s: 'li', t: '我的鐵盒掉進池塘了，聽說被老鯉魚叼走了。' }, { s: 'me', t: '我來引牠出來。' }, { s: 'li', t: '哈哈，上鉤了！謝謝你。' }],
  [{ s: 'luo', t: '礦坑深處有個上鎖的鐵箱，坑道得先加固才敢進去。' }, { s: 'me', t: '需要什麼材料？' }, { s: 'luo', t: '有你幫忙，我放心多了。' }],
  [{ s: 'mo', t: '豐收祭快到了，我想用牛奶、雞蛋和南瓜烤祭典糕。' }, { s: 'mo', t: '太好吃了，大家一定會喜歡。' }],
  [{ s: 'oak', t: '村裡要辦一場真正的豐收祭，要把晨露種子交給你。' }, { s: 'me', t: '我會好好照顧牠的。' }, { s: 'oak', t: '雷克斯小村的故事，才正要開始。' }]
];
const sgR = (c, x, y, w, h) => r(c, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
const sgA = (c, a, x, y, w, h) => { g.globalAlpha = Math.max(0, Math.min(1, a)); sgR(c, x, y, w, h); g.globalAlpha = 1; };
const sgS = Math.sin;
function sgPuff(x, y, t, n, sp, col) { for (let i = 0; i < n; i++) { const p = (t * sp + i * (36 / n)) % 36; sgA(col, (1 - p / 36) * .7, x + sgS(p / 5 + i) * 3, y - p, 4 + p / 9, 4 + p / 9); } }
function sgGrass(y) { sgR('#92c98a', 0, y, 192, 108 - y); sgR('#9fd296', 0, y, 192, 2); }
function sgNpc(k, x, y, t) { g.save(); g.translate(x, y); g.scale(3, 3); npcArt(0, 0, k, Math.floor(t * 1.6 + k.length) % 2, t * 1000 + 500); g.restore(); }   // 直接用遊戲裡村民的原畫法，放大 3 倍
const SCG_SC = [
t=>{[['#ffd2b0',0],['#ffe0c0',14],['#fff0d6',28],['#e4f1ea',42]].forEach(([c,y])=>sgR(c,0,y,192,14));sgR('#fff3b0',150,14,14,14);
 for(let x=0;x<192;x++)sgR('#b8dcb2',x,56+sgS(x/17)*4,1,30);sgGrass(76);
 sgR('#d9b690',54,34,80,42);sgR('#f5dfc0',56,36,76,40);for(let i=0;i<14;i++)sgR(i%2?'#e88b99':'#e07a8a',48+i,34-i,92-i*2,1);sgR('#b85c70',48,34,92,2);
 sgR('#a8683a',86,52,18,24);sgR('#c78552',88,54,14,22);sgR('#ffd34d',99,64,2,2);sgR('#8a6a50',116,18,10,18);sgPuff(121,20,t,5,9,'#fff');
 [[66,48],[110,48]].forEach(([x,y])=>{sgR('#8a6a50',x-1,y-1,14,14);sgR('#bfe3f5',x,y,12,12);sgR('#fff',x+5,y,1,12)});
 for(let i=0;i<6;i++){sgR('#8a6a50',12+i*6,60,2,20);}sgR('#7fb878',10,58,40,4);
 for(let i=0;i<6;i++){const s=Math.round(sgS(t*1.5+i));sgR('#8a5ac0',12+i*6+s,64+(i%2)*4,4,4);sgR('#b48ae0',13+i*6+s,64+(i%2)*4,1,1)}
 sgNpc('oak',108,58,t);},
t=>{sgR('#ffe6c8',0,0,192,50);sgR('#fff0d6',0,50,192,10);sgGrass(70);
 sgR('#f3b6c4',10,30,60,42);for(let i=0;i<12;i++)sgR('#d9667f',4+i,30-i,72-i*2,1);sgR('#a8683a',32,52,14,20);sgR('#bfe3f5',50,42,12,12);sgR('#bfe3f5',16,42,10,12);
 sgR('#a8683a',92,74,64,4);sgR('#7a4a28',96,78,4,14);sgR('#7a4a28',148,78,4,14);
 sgR('#5a5a66',104,56,36,20);sgR('#4a4a56',102,54,40,4);sgR('#e8a040',106,56,32,3);
 for(let i=0;i<4;i++){const b=(t*2+i*.7)%1;sgA('#ffd890',1-b,110+i*8,56-b*3,3,2)}
 sgR('#ff9b3a',112,80+(Math.floor(t*6)%2),6,6);sgR('#ffd34d',114,82,2,4);sgPuff(122,52,t,5,7,'#fff');
 sgNpc('gui',140,46,t);},
t=>{sgR('#d2ebf0',0,0,192,40);sgR('#e4f1ea',0,40,192,14);sgR('#a4d39c',0,46,192,16);sgR('#7ec4e8',52,64,140,44);sgR('#92c98a',0,58,56,50);sgR('#7fb878',0,58,56,3);
 for(let i=0;i<8;i++)sgA('#c6e8f8',.8,58+((i*41+t*9)%120),70+i*5,16,1);
 const ph=t%4;if(ph<1){const y=62-sgS(ph*Math.PI)*24,x=108+ph*18;sgR('#ff9b4a',x,y,12,6);sgR('#ff9b4a',x+11,y-2,4,10);sgR('#fff',x+2,y+1,1,1);sgA('#fff',.7*(1-ph),x-4,64,20,1)}
 sgNpc('li',4,44,t);const by=72+sgS(t*2)*1.5;for(let i=0;i<=20;i++){const u=i/20;sgR('#fff',44+u*42,59+u*(by-59)-sgS(u*Math.PI)*6,1,1)}sgR('#e04a4a',84,by,5,5);sgR('#fff',84,by,5,2);},
t=>{sgR('#2a1f2e',0,0,192,108);sgR('#3d2c3e',0,0,192,70);for(let x=0;x<192;x+=16)sgR('#34253a',x,0,1,70);sgR('#8a5a3a',0,78,192,30);
 sgR('#5a4560',40,14,112,66);sgR('#140e18',62,28,68,52);sgR('#7a4a28',56,24,8,56);sgR('#7a4a28',128,24,8,56);sgR('#7a4a28',54,22,84,6);
 const f=0.5+sgS(t*9)*.2+sgS(t*5)*.15;sgA('#ffd34d',.12*f,20,30,50,50);sgA('#ffd34d',.18*f,28,40,34,34);sgR('#5a4a3a',44,52,3,24);sgR('#ffb040',42,46,7,6);sgR('#ffe070',44,44,3,3);
 sgR('#8a5a3a',86,66,22,14);sgR('#6a4228',86,70,22,2);sgR('#ffd34d',94,66,6,14);sgR('#fff6a8',96,70,2,3);
 if(sgS(t*3)>.5){sgR('#fff',104,62,1,5);sgR('#fff',102,64,5,1)}
 sgNpc('luo',140,50,t);
 for(let i=0;i<14;i++)sgA('#c8b8a0',.7,64+(i*9)%64,((t*14+i*13)%60)+20,1,1)},
t=>{sgR('#ffdcbc',0,0,192,40);sgR('#fff0d6',0,40,192,20);sgGrass(72);sgNpc('mo',72,40,t);
 sgR('#8a6a50',0,12,192,1);for(let i=0;i<10;i++){const s=Math.round(sgS(t*2+i)*1),c=['#ff9db8','#ffd34d','#7fb878','#bfe3f5'][i%4];sgR(c,6+i*19,13+Math.round(sgS(i*.7)*2),7,7+s)}
 sgR('#a8683a',20,76,152,6);sgR('#7a4a28',28,82,5,20);sgR('#7a4a28',160,82,5,20);
 sgR('#ff9b3a',32,58,26,18);sgR('#ee8420',44,58,2,18);sgR('#5a9a4a',43,53,5,5);
 sgR('#d9a05a',84,66,38,10);sgR('#c08040',84,72,38,4);sgR('#ffe6b0',88,62,30,4);sgR('#e04a4a',100,60,4,3);sgPuff(103,60,t,4,6,'#fff');
 sgR('#fff',134,62,10,14);sgR('#bfe3f5',135,58,8,4);sgR('#8ac0e0',134,68,10,2);sgR('#fff3d0',152,70,6,6);sgR('#fff3d0',160,71,6,5);sgR('#e8d8b0',152,74,6,2)},
t=>{const p=Math.min(1,t/5);sgR('#ffd2b0',0,0,192,40);sgR('#ffe6c8',0,40,192,30);sgR('#fff0d6',0,60,192,20);
 const sy=80-p*52;sgR('#fff6c0',140,sy-4,26,26);sgR('#fff3b0',143,sy-1,20,20);sgA('#fff3b0',.25,130,sy-14,46,46);
 sgA('#2a2848',(1-p)*.7,0,0,192,108);sgGrass(76);for(let x=0;x<192;x+=6)sgR('#9fd296',x,76+(x%12?0:1),3,1);
 sgR('#a8683a',74,78,44,12);sgR('#8a5a30',74,86,44,4);const h=Math.min(18,t*3.4);
 sgR('#6fb36a',95,78-h,2,h);if(h>6){sgR('#9fd296',89,78-h+2,6,3);sgR('#9fd296',98,78-h+5,6,3)}if(h>14){sgR('#b8e8a0',92,78-h-2,8,4)}
 sgA('#fff6a8',.5+sgS(t*3)*.3,86,56,16,24);sgNpc('oak',24,46,t);
 for(let i=0;i<14;i++){const ph=i*1.7;if(sgS(t*2.4+ph)>.2)sgR(i%2?'#fff6a8':'#fff',(i*47)%192,30+(i*29)%48,1,1)}}
];

/* ---------- 序章「晨光進村」：新玩家第一次進遊戲自動播一次，之後可在布告欄「村莊故事」相簿重看 ---------- */
const SCG_PRO = { title: '晨光進村', lines: [
  { s: '', t: '（清晨。你帶著一個小包袱，走進了雷克斯小村。）' },
  { s: 'oak', t: '哎呀，新面孔！歡迎你來到雷克斯小村。' },
  { s: 'me', t: '我想在這裡開始新的生活。' },
  { s: 'oak', t: '太好了！先到村裡逛逛吧。等你種出葡萄，記得拿來給我嚐嚐！' }
] };
function sgMe(x, y) { try { if (typeof me === 'undefined' || !me) throw 0; g.save(); g.translate(x, y - 18); g.scale(3, 3); drawPlayer(0, 6, 'down', false, 0, myChar()); g.restore(); } catch (e) { sgR('#6a9ac4', x + 12, y + 20, 24, 18); sgR('#ffe3cc', x + 10, y + 2, 28, 22); sgR('#7a4a2a', x + 10, y + 2, 28, 6); } }
function scgPro(t) {
  [['#ffd2b0', 0], ['#ffdcbc', 14], ['#ffe6c8', 28], ['#fff0d6', 42]].forEach(([c, y]) => sgR(c, 0, y, 192, 14));
  sgA('#fff3b0', .3, 146, 12, 22, 22); sgR('#fff3b0', 150, 16, 14, 14);
  [[(t * 2.2) % 240 - 30, 20], [(t * 1.4 + 120) % 240 - 30, 30]].forEach(([x, y]) => { sgA('#fff', .75, x, y, 18, 4); sgA('#fff', .75, x + 4, y - 3, 10, 3); });
  for (let x = 0; x < 192; x++) { sgR('#b8dcb2', x, 52 + sgS(x / 17) * 4, 1, 40); sgR('#a4d39c', x, 64 + sgS(x / 11 + 2) * 3, 1, 40); }
  sgGrass(76);
  for (let i = 0; i < 32; i++) sgR('#e8cfa0', 70 - i * .7, 76 + i, 52 + i * 1.4, 1);
  [[100, 40, 40], [26, 46, 34]].forEach(([x, y, w]) => { sgR('#d9b690', x, y, w, 36); sgR('#f5dfc0', x + 2, y + 2, w - 4, 34); for (let i = 0; i < 12; i++) sgR(i % 2 ? '#e88b99' : '#e07a8a', x - 6 + i, y - i, w + 12 - i * 2, 1); sgR('#b85c70', x - 6, y, w + 12, 2); sgR('#a8683a', x + w / 2 - 8, y + 14, 16, 22); sgR('#ffd34d', x + w / 2 + 4, y + 25, 2, 2); });
  sgR('#8a6a50', 124, 22, 10, 16); sgPuff(129, 24, t, 5, 8, '#fff');
  sgR('#7a4a28', 58, 60, 3, 24); sgR('#7a4a28', 90, 60, 3, 24); sgR('#a8683a', 54, 56, 42, 10); sgR('#fff6d8', 58, 58, 34, 6);
  for (let i = 0; i < 7; i++) sgR('#c0603a', 62 + i * 4, 59, 2, 4);
  const px = Math.min(76, 10 + t * 14); sgMe(px, 58 + (px < 76 ? Math.round(sgS(t * 9)) : 0));
  if (t > 1.5) sgNpc('oak', 114, 56, t);
  for (let i = 0; i < 8; i++) sgA('#ffc2d4', .9, (i * 37 + t * 18) % 200 - 6, (i * 23 + t * 8) % 80 + 10, 2, 1);
}

/* ---------- 出海篇：柴犬船長的四幕劇情（碼頭完工後第一次登船自動播一次，之後可在布告欄相簿或船長選單重看）----------
   畫面都用遊戲自己的圖：boatSide（船）、captainArt（柴犬船長）、npcArt（村民）、drawPlayer（旅人）、drawFish（海魚）、miscIcon（材料）。
   對白格式：{ s: 'cpt'|'me'|村民 key|'' }；s:'me' 加 opts:[[旅人的回應, 船長的回覆], …] 就變成兩個選項，選了才繼續。 */
const SCG_VOY = [
  { title: '謝謝大家', lines: [
    { s: 'cpt', t: '各位旅人，雷克斯號能下水，全靠大家一塊木頭、一塊石頭、一塊銅礦捐出來的。我代表這艘船——謝謝大家！' },
    { s: 'me', opts: [['能幫上忙我很開心。', '你搬的那幾根木頭，我可都記得，汪！'], ['船看起來好棒！', '對吧！每一塊木板，都有你們的名字。']] }
  ] },
  { title: '海上珍魚', lines: [
    { s: 'cpt', t: '海上藏著不少稀有的魚，有的大得像小島，有的一輩子只見得到一次。' },
    { s: '', t: '（水下，一道巨大的魚影緩緩游過。）' },
    { s: 'me', opts: [['真的有那麼稀有嗎？', '有的連我都只聽過傳說。釣到了，記得拿給我看看！'], ['我一定要全部釣到。', '有志氣！圖鑑，就等你來填滿了。']] }
  ] },
  { title: '神秘海域', lines: [
    { s: 'cpt', t: '還有一件事。有時候，船會駛進地圖上沒有的地方。' },
    { s: '', t: '（霧漸漸升起，遠處浮現淡淡的極光。）' },
    { s: 'me', opts: [['那是什麼地方？', '神秘的海域，連魚都和別處不一樣。不是每趟都遇得到，遇到了就是緣分。'], ['聽起來有點危險。', '有我在，船燈不滅，就能平安回來。']] }
  ] },
  { title: '出港', lines: [
    { s: 'cpt', t: '好了，話說完了！準備出發吧。' },
    { s: 'me', opts: [['準備好了！', '好！纜繩解開——雷克斯號，出港！'], ['讓我再看大家一眼。', '去吧，大家都在岸上揮手呢。——纜繩解開，出港！']] },
    { s: '', t: '（船身輕輕離岸，村子的炊煙越來越小。）' }
  ] }
];
const sgBT = document.createElement('canvas'); sgBT.width = 128; sgBT.height = 80;
const sgIT = document.createElement('canvas'); sgIT.width = 16; sgIT.height = 16;
function sgBoat(x, y, t, my) { const old = g; boatSide(sgBT.getContext('2d'), t * 1000, { mystery: !!my }); g = old; g.drawImage(sgBT, Math.round(x), Math.round(y)); }
function sgCap(x, y, t, k) { g.save(); g.translate(x, y); g.scale(k || 3, k || 3); captainArt(0, 0, t * 1000); g.restore(); }
function sgNpcK(k, x, y, t, s) { g.save(); g.translate(x, y); g.scale(s, s); npcArt(0, 0, k, Math.floor(t * 1.6 + k.length) % 2, t * 1000 + 500); g.restore(); }
function sgFish(key, x, y, k, a, glow) { const old = g, c2 = sgIT.getContext('2d'); drawFish(c2, key, false); g = old; if (glow) sgA(glow, .12 * a, x - 6, y - 4, 16 * k + 12, 16 * k * .6 + 8); g.globalAlpha = a; g.drawImage(sgIT, Math.round(x), Math.round(y), 16 * k, 16 * k); g.globalAlpha = 1; }
function sgMat(key, x, y, a) { const old = g; miscIcon(sgIT.getContext('2d'), key); g = old; g.globalAlpha = Math.max(0, a); g.drawImage(sgIT, Math.round(x), Math.round(y)); g.globalAlpha = 1; }
function sgSea(y, c1, c2, sp) { sp = sp || 90; sgR(c1, 0, y, 192, sp - y); sgR(c2, 0, sp, 192, 108 - sp); }   // sp：第二層海色從哪裡開始（要跟 boatSide 的海面對齊＝船的 y＋70）
function sgGull(t, i) { const x = (t * 14 + i * 70) % 230 - 20, y = 14 + i * 10 + sgS(t * 3 + i) * 3, f = Math.floor(t * 4 + i) % 2; sgR('#fff', x, y + f, 3, 1); sgR('#fff', x + 3, y - f, 3, 1); }
function sgDawn(by) { [['#ffd2b0', 0], ['#ffdcbc', 12], ['#ffe6c8', 26], ['#fff0d6', 38]].forEach(([c, y]) => sgR(c, 0, y, 192, 14)); sgA('#fff3b0', .3, 128, 10, 32, 32); sgR('#fff3b0', 136, 18, 16, 16); sgSea(46, '#4aa0e0', '#3a8ac8', 70 + by); }
function sgPier() { sgR('#a8683a', 0, 90, 192, 6); sgR('#8a5a30', 0, 96, 192, 12); }
const SCG_VSC = [
  t => { sgDawn(0);
    for (let i = 0; i < 12; i++) { const x = 4 + i * 16, y = 6 + sgS(i / 1.9) * 3; sgR('#8a6a50', x, y, 16, 1); sgR(['#e8453c', '#ffd34d', '#7fb878', '#8ac0ff'][i % 4], x + 4, y + 1, 6, 5 + Math.round(sgS(t * 3 + i))); }
    sgGull(t, 0); sgBoat(64, 0, t); sgPier();
    [['m:wood', 0], ['m:stone', 1], ['m:copper', 2]].forEach(([k, i]) => { const q = (t * 9 + i * 13) % 40; sgMat(k, 10 + i * 18, 58 - q, 1 - q / 40); });
    [['oak', 100], ['gui', 122], ['mo', 144], ['li', 166]].forEach(([k, x], i) => sgNpcK(k, x, 56 + (sgS(t * 5 + i * 2) > .6 ? -2 : 0), t, 2));
    sgCap(52, 48, t); sgMe(4, 46); },
  t => { sgR('#bfe3f5', 0, 0, 192, 24); sgR('#e4f1ea', 0, 24, 192, 28); sgGull(t, 0); sgGull(t, 1);
    [['#4aa0e0', 52, 8], ['#3a8ac8', 60, 18], ['#2c6aa8', 78, 14], ['#1f4f88', 92, 16]].forEach(([c, y, h]) => sgR(c, 0, y, 192, h));
    for (let i = 0; i < 6; i++) sgA('#bfe6ff', .25, (i * 37 + t * 5) % 192, 80 + (i % 3) * 8, 2, 8);
    sgBoat(26, -10, t);
    sgFish('swordfish', 192 - (t * 14) % 250 + 10, 76, 2, .9, '#bfe6ff');
    sgFish('clownfish', (t * 8) % 230 - 30, 90, 2, .9, '#ffd8a0');
    const gx = (t * 10 + 90) % 230 - 20; sgFish('yellowfin', gx, 70, 1, 1, '#fff3b0'); for (let i = 0; i < 4; i++) if (sgS(t * 6 + i * 1.6) > 0) sgR('#fff', gx + (i * 7) % 16 - 2, 66 + (i * 5) % 10, 1, 1); },
  t => { [['#14203a', 0], ['#1d2c4c', 14], ['#26385a', 28], ['#33496e', 40]].forEach(([c, y]) => sgR(c, 0, y, 192, 14));
    for (let i = 0; i < 16; i++) if (sgS(t * 2 + i * 1.7) > -.3) sgR('#fff', (i * 43) % 192, (i * 17) % 36, 1, 1);
    for (let k = 0; k < 3; k++) for (let x = 0; x < 192; x += 2) sgA(['#7fffd4', '#8ac0ff', '#c8a0ff'][k], .16, x, 8 + k * 7 + sgS(x / 22 + t * .8 + k) * 6, 2, 10);
    sgSea(46, '#2f5f96', '#25507f'); sgFish('ghostwhale', 200 - (t * 9) % 260, 52, 4, .35, '#cfe0ff');
    sgBoat(34, 20, t, true); const f = .6 + sgS(t * 5) * .2; sgA('#ffd34d', .25 * f, 70, 36, 30, 30);
    for (let i = 0; i < 5; i++) { const x = ((i * 60 + t * 9) % 260) - 40; sgA('#cfe0ff', .45, x, 34 + i * 11, 80, 7); sgA('#cfe0ff', .3, x + 20, 38 + i * 11, 60, 5); }
    sgMe(6, 50); },
  t => { const p = Math.min(1, t / 4); [['#ffd2b0', 0], ['#ffdcbc', 12], ['#ffe6c8', 26], ['#fff0d6', 38]].forEach(([c, y]) => sgR(c, 0, y, 192, 14));
    sgA('#fff3b0', .3, 128, 46 - p * 30 - 8, 32, 32); sgR('#fff3b0', 136, 46 - p * 30, 16, 16); sgSea(46, '#4aa0e0', '#3a8ac8', 84);
    for (let i = 0; i < 7; i++) sgA('#fff3b0', .5, 138 + sgS(t * 2 + i) * 4, 50 + i * 5, 12 - i, 1);
    sgGull(t, 0); sgGull(t, 1); sgBoat(60 + Math.max(0, t - 2.5) * 12, 14, t); sgPier();
    if (t < 3) sgR('#e8d8b0', 52, 88, 20 - Math.max(0, t - 2) * 20, 1);
    sgNpcK('oak', 46, 56, t, 2); sgNpcK('gui', 68, 56 + (sgS(t * 6) > .5 ? -2 : 0), t, 2); sgMe(4, 46); }
];

/* ---------- 潛水篇：柴犬船長的舊潛水鏡（第一次按「潛水」自動播一次，之後在船長選單可重看）---------- */
const SCG_DIV = [
  { title: '舊潛水鏡', lines: [
    { s: 'cpt', t: '這副潛水鏡，是我年輕時用的。那時候的海，乾淨得連海底的星星都看得見。' }
  ] },
  { title: '現在的海', lines: [
    { s: '', t: '（水下，垃圾在海裡慢慢飄著。）' },
    { s: 'cpt', t: '可是現在……變成這樣了。漁網、輪胎、瓶瓶罐罐，越積越多。' }
  ] },
  { title: '下水吧', lines: [
    { s: 'cpt', t: '我老了，下不去了。你願意替我，把這片海弄乾淨嗎？' },
    { s: 'me', opts: [['我來幫忙！', '好孩子！潛水鏡借你，下去吧，汪！'], ['我先看看情況。', '好，不急。想下水的時候，隨時來找我，汪！']] },
    { s: '', t: '（柴犬船長把舊潛水鏡，交到你的手上。）' }
  ] }
];
let scgDW = null;
function sgUnder(clean, t, fn) {
  const old = g; if (!scgDW) { scgDW = { clean: OCA.world(true), dirty: OCA.world(false) }; g = old; }
  g.drawImage(clean ? scgDW.clean : scgDW.dirty, -470, -30);
  g.save(); g.translate(-470, -30); try { fn(); } catch (e) { /* 略過 */ } g.restore();
  for (let i = 0; i < 6; i++) { const q = (t * 7 + i * 31) % 90; sgA('#fff', .5 * (1 - q / 90), 20 + (i * 53) % 150 + sgS(t * 2 + i) * 3, 100 - q, 2, 2); }
}
const SCG_DSC = [
  t => { sgDawn(0); sgGull(t, 0); sgBoat(64, 0, t); sgPier(); sgCap(52, 48, t); sgMe(4, 46);
    const f = .5 + sgS(t * 3) * .5; sgR('#2c3566', 91, 54, 11, 7); sgR('#bfe6ff', 92, 55, 9, 5); sgR('#ffd34d', 90, 56, 1, 3); sgR('#ffd34d', 102, 56, 1, 3); sgR('#fff', 94, 56, 2, 1);
    sgA('#fff3b0', .35 * f, 86, 48, 22, 22); sgR('#fff', 104 + Math.round(f * 2), 51, 1, 3); sgR('#fff', 103 + Math.round(f * 2), 52, 3, 1); },
  t => sgUnder(false, t, () => { OCA.tbag(520, 110 + sgS(t * 1.5) * 2, 0); OCA.bottle(590, 120); OCA.tcan(540, 92 + sgS(t * 1.2 + 1) * 2); OCA.tbag(610, 62 + sgS(t * 1.4 + 2) * 2, 0); OCA.cup && OCA.cup(500, 70); }),
  t => sgUnder(true, t, () => { OCA.turtle(520 + Math.sin(t * .8) * 6, 120, 1); try { OCA.diver(560, 70 + Math.round(sgS(t * 2) * 1.5), 'down', Object.assign({}, DEF_CHAR, myChar()), 'base', t); } catch (e) { /* 略過 */ } })
];


/* ---------- 火車篇：貓咪站長的老車站（第一次開站長面板播第 1、2 幕；車站蓋好那一刻播第 3、4 幕；站長面板可重看）---------- */
const SCG_TRN = [
  { title: '荒廢的老車站', lines: [
    { s: '', t: '（黃昏。老車站的鐘，停在很久很久以前的某一刻。）' },
    { s: 'stm', t: '喵……你來了。這座站，以前每天都有火車進站、出站，熱鬧得很。' }
  ] },
  { title: '從前的熱鬧', lines: [
    { s: 'stm', t: '月台上擠滿了旅人，孩子們趴在窗邊數車廂。那時候，我每天吹著哨子，送大家出發。' },
    { s: 'stm', t: '後來鐵軌鏽了，木頭也爛了，就再也沒有火車來了。' },
    { s: 'me', opts: [['我來幫你修好它！', '真的嗎？喵！需要木頭、石頭、銅礦，還有一些金幣。慢慢捐，捐滿了車站就修好了。'], ['我先看看需要什麼。', '好，不急。材料備齊了再來找我，喵。']] }
  ] },
  { title: '一起修車站', lines: [
    { s: '', t: '（你把最後一份材料交到站長手上。叮叮噹噹的敲打聲，在站裡響了一整天。）' },
    { s: 'stm', t: '木頭釘上去了，石頭鋪好了，銅線也接上了……謝謝你。我都快忘記，熱鬧是什麼感覺了。' }
  ] },
  { title: '汽笛再響', lines: [
    { s: '', t: '（夜裡，站燈一盞一盞亮了起來。遠遠地，傳來久違的汽笛聲。）' },
    { s: 'stm', t: '聽見了嗎？火車回來了！現在你可以開自己的團，帶大家一起去抓蟲。' },
    { s: 'stm', t: '歡迎光臨，站長會一直在這裡等你，喵！' }
  ] }
];
function sgBands(cols, h) { cols.forEach((c, i) => sgR(c, 0, i * h, 192, h + 1)); }
function sgStn(x, y, k) { if (typeof STATION_IMG === 'undefined' || !STATION_IMG.width) { sgR('#c05a46', x + 10, y + 30, 70, 30); return; } g.drawImage(STATION_IMG, Math.round(x), Math.round(y), Math.round(STATION_IMG.width * k), Math.round(STATION_IMG.height * k)); }
function sgStm(x, y, t, k) { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(k, k); stationMasterArt(0, 0, t * 1000); g.restore(); }
function sgRails(y) { sgR('#8a7a64', 0, y, 192, 8); for (let x = 0; x < 192; x += 6) sgR('#6a4c30', x, y + 1, 3, 6); sgR('#b8b8c0', 0, y + 1, 192, 2); sgR('#b8b8c0', 0, y + 5, 192, 2); }
function sgLogs(x, y) { for (let i = 0; i < 3; i++) { sgR('#5a3a20', x, y + i * 5, 18, 5); sgR('#8a5a34', x + 1, y + i * 5 + 1, 16, 3); sgR('#d8b070', x + 16, y + i * 5 + 1, 2, 3); } }
function sgRocks(x, y) { [[0, 4, 10], [8, 0, 10], [14, 5, 9]].forEach(([dx, dy, w]) => { sgR('#5a544a', x + dx, y + dy, w, 8); sgR('#8a8478', x + dx + 1, y + dy + 1, w - 2, 6); sgR('#bdb7a8', x + dx + 2, y + dy + 1, 3, 1); }); }
function sgOre(x, y) { [[0, 4, 10], [8, 0, 9]].forEach(([dx, dy, w]) => { sgR('#4a3a2a', x + dx, y + dy, w, 8); sgR('#7a6a5a', x + dx + 1, y + dy + 1, w - 2, 6); sgR('#e8944a', x + dx + 2, y + dy + 2, 3, 3); sgR('#3fae8a', x + dx + 6, y + dy + 4, 2, 2); }); }
function sgBench(x, y) { sgR('rgba(0,0,0,.14)', x, y + 12, 26, 2); sgR('#5a3a20', x, y + 4, 26, 4); sgR('#a8683a', x + 1, y + 5, 24, 2); sgR('#5a3a20', x, y, 26, 3); sgR('#a8683a', x + 1, y + 1, 24, 1); sgR('#5a3a20', x + 2, y + 8, 2, 5); sgR('#5a3a20', x + 22, y + 8, 2, 5); }
function sgLamp(x, y, t) { sgR('#3a3a44', x, y, 2, 26); sgR('#5a4a2a', x - 3, y - 6, 8, 7); sgR('#ffe27a', x - 2, y - 5, 6, 5); sgA('#ffe27a', .08 + .03 * sgS(t * 2 + x), x - 7, y - 9, 16, 16); sgA('#ffe27a', .1, x - 4, y - 6, 10, 10); }
const SCG_TSC = [
  t => { sgBands(['#f3a86a', '#f8bd86', '#fdd09a', '#ffe0b0', '#ffe8c4'], 14); sgR('#ffd890', 150, 38, 16, 16);
    sgR('#9a9a6a', 0, 62, 192, 46); sgR('#aaaa7a', 0, 62, 192, 2); for (let i = 0; i < 192; i += 8) sgR('#8a8a5a', i, 66 + (i % 3), 2, 1);
    sgStn(64, 0, .7); sgR('#8a8a5a', 60, 62, 78, 3);
    sgRails(78); sgR('#8a4a2a', 20, 76, 6, 2); sgR('#8a4a2a', 150, 77, 8, 2);
    [10, 170].forEach(x => sgR('#7a6a5a', x, 40, 2, 24)); [8, 60, 120, 176].forEach(x => { sgR('#7a8a4a', x, 60, 1, 3); sgR('#7a8a4a', x + 2, 59, 1, 4); });
    sgBench(28, 52); sgStm(34, 34, t, 2);
    for (let i = 0; i < 5; i++) { const p = (t * 6 + i * 9) % 40; sgA('#ffe0b0', (1 - p / 40) * .5, 150 + i * 6 + sgS(p / 4 + i) * 3, 60 - p, 2, 2); }
    sgA('#3c1e46', .24, 0, 0, 192, 108); },
  t => { sgBands(['#ffe9b0', '#ffeec0', '#fff4d6', '#fff4d6', '#fff8e4'], 14); [[20, 10], [120, 18]].forEach(([x, y]) => { sgA('#fff', .8, x + ((t * 3) % 8), y + 2, 20, 5); sgA('#fff', .8, x + 4 + ((t * 3) % 8), y, 12, 5); });
    sgR('#dcc890', 0, 64, 192, 44); sgR('#e8d8a0', 0, 64, 192, 2); sgStn(6, 2, .72); sgR('#d8c9a4', 0, 60, 192, 6);
    sgRails(78); sgPuff(121, 54, t, 5, 9, '#fff'); stLoco(104, 58, t * 1000); stCar(166, 60, '#4a6aa8', '#24386a');
    ['#e8694a', '#4a8ae8', '#e8c14a', '#7ac86a', '#c58aff', '#ff9a5a'].forEach((c, i) => { const x = 14 + i * 11, b = Math.round(sgS(t * 3 + i) * 1); sgR('#444', x + 2, 50 + (i % 2) * 2 + b, 6, 9); sgR(c, x + 3, 51 + (i % 2) * 2 + b, 4, 7); sgR('#a86a4a', x + 2, 45 + (i % 2) * 2 + b, 6, 6); sgR('#ffd2b0', x + 3, 46 + (i % 2) * 2 + b, 4, 4); });
    sgStm(58, 46, t, 1); sgA('#c89650', .27, 0, 0, 192, 108); },
  t => { sgBands(['#bfe3f5', '#cdeaf8', '#dcf1fb', '#e4f6ff'], 16); [[30, 12], [140, 8]].forEach(([x, y]) => { sgA('#fff', .85, x + ((t * 2) % 6), y + 2, 20, 5); sgA('#fff', .85, x + 4 + ((t * 2) % 6), y, 12, 5); });
    sgR('#92c98a', 0, 62, 192, 46); sgR('#9fd296', 0, 62, 192, 2); sgStn(64, 0, .7);
    [60, 138].forEach(x => sgR('#a8683a', x, 6, 3, 58)); [14, 30, 46].forEach(y => sgR('#a8683a', 60, y, 81, 2));
    sgLogs(8, 52); sgRocks(166, 56); sgOre(150, 62); sgRails(92);
    sgStm(26, 44, t, 2); sgMe(58, 60);
    const sw = Math.floor(t * 4) % 2; sgR('#8a6a50', 88, 56 - sw * 3, 2, 12); sgR('#666', 84, 54 - sw * 3, 10, 4); sgR('#bbb', 85, 55 - sw * 3, 8, 2);
    if (sw) { sgA('#fff3b0', .8, 92, 64, 3, 3); } },
  t => { sgBands(['#101840', '#1c2260', '#2a2e70', '#3a3a78'], 16); for (let i = 0; i < 40; i++) { const x = Math.floor(hash(i, 3, 301) * 192), y = Math.floor(hash(i, 4, 302) * 50); sgR(Math.sin(t * 2 + i) > 0 ? '#ffffff' : '#c8c8ff', x, y, 1, 1); }
    sgA('#fff6d0', .12, 138, 2, 40, 40); sgR('#fff6d0', 150, 12, 16, 16); sgR('#e8dca8', 153, 15, 4, 3);
    sgR('#2a3a4a', 0, 64, 192, 44); sgR('#3a4a5a', 0, 64, 192, 2); sgStn(14, 0, .7);
    [[30, 36], [38, 36], [66, 36], [74, 36]].forEach(([x, y]) => sgA('#ffe27a', .55, x, y, 6, 9));
    sgRails(78); sgPuff(101, 56, t, 5, 9, '#e8e8f0'); stLoco(90, 58, t * 1000); stCar(152, 60, '#4a6aa8', '#24386a');
    sgA('#fff0aa', .12 + .04 * sgS(t * 3), 76, 66, 12, 8); sgStm(66, 44, t, 1);
    sgLamp(6, 40, t); sgLamp(176, 40, t); }
];

const scgSt = { beat: -1, from: -1, t0: 0 };
let scgPlay = null;   // 重播中：{ q: [{ ch, title, s, t, first }], i, title }
function scgDraw(beat, t) {
  const f = beat === 'pro' ? scgPro : (typeof beat === 'string' && beat[0] === 'v') ? SCG_VSC[+beat.slice(1)] : (typeof beat === 'string' && beat[0] === 'd') ? SCG_DSC[+beat.slice(1)] : (typeof beat === 'string' && beat[0] === 't') ? SCG_TSC[+beat.slice(1)] : SCG_SC[beat];
  if (f) f(t); else { sgR('#ffd2b0', 0, 0, 192, 60); sgGrass(60); }   // 之後新增的章節還沒畫 CG 時，先用一格晨光小村頂著
}
function scgFrame(cv, now) {
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; const old = g; g = c;
  const t = (now - scgSt.t0) / 1000;
  try {
    scgDraw(scgSt.beat, t);
    const vg = c.createRadialGradient(96, 54, 40, 96, 54, 108); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = vg; c.fillRect(0, 0, 192, 108);
    r('#000', 0, 0, 192, 5); r('#000', 0, 103, 192, 5);
    if (scgSt.from !== scgSt.beat) { const a = 1 - Math.min(1, t / 0.45); if (a > 0) { c.globalAlpha = a; r('#000', 0, 0, 192, 108); c.globalAlpha = 1; } }
  } catch (e) { /* 畫不出來就留黑畫面，不影響劇情 */ }
  g = old;
}
function scgRun(cv, beat) {
  if (!cv) return;
  if (scgSt.beat !== beat) { scgSt.from = scgSt.beat; scgSt.beat = beat; scgSt.t0 = performance.now(); }
  const loop = now => { if (!cv.isConnected || !cv.offsetParent) return; scgFrame(cv, now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
function scgThumb(cv, i) {
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; const old = g; g = c;
  try { scgDraw(i, i === 5 ? 4.5 : i === 'pro' ? 5 : (typeof i === 'string' && i[0] === 'v') ? 3.2 : 1.6); r('#000', 0, 0, 192, 4); r('#000', 0, 104, 192, 4); } catch (e) { /* 略過 */ }
  g = old;
}
const scgCanvas = beat => '<canvas data-scg="' + beat + '" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#000;margin-top:8px"></canvas>';
function scgPlaying() { return !!scgPlay; }
function scgReset() { scgPlay = null; scgSt.beat = -1; }
function scgLines(c) { const a = (c.lines || []).concat(c.outro || []).filter(x => x && x.t); return a.length ? a : (SCG_FALLBACK[c.ch - 1] || []); }

/* 回憶相簿：已完成的章節是彩色縮圖，還沒解鎖的變暗剪影 */
function scgAlbumHtml(chs, d) {
  let h = '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0">';
  const st0 = 'border:2px solid var(--edge);border-radius:10px;overflow:hidden;background:#fff;padding:0;font:inherit;color:inherit;text-align:center;line-height:1.3;cursor:pointer';
  h += '<button type="button" data-a="scgplay" data-c="0" style="' + st0 + '"><canvas data-th="pro" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated"></canvas><span style="display:block;font-size:11px;padding:3px 2px">序章<br>' + esc(SCG_PRO.title) + '</span></button>';
  chs.forEach(c => {
    const ok = c.ch <= d, st = 'border:2px solid var(--edge);border-radius:10px;overflow:hidden;background:#fff;padding:0;font:inherit;color:inherit;text-align:center;line-height:1.3';
    const lab = '<span style="display:block;font-size:11px;padding:3px 2px">第 ' + c.ch + ' 章<br>' + (ok ? esc(c.title) : '？？？') + '</span>';
    const cv = '<canvas data-th="' + (c.ch - 1) + '" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated' + (ok ? '' : ';filter:brightness(.3) saturate(.3)') + '"></canvas>';
    h += ok ? '<button type="button" data-a="scgplay" data-c="' + c.ch + '" title="' + esc(c.intro || '') + '" style="' + st + ';cursor:pointer">' + cv + lab + '</button>'
            : '<div style="' + st + '">' + cv + lab + '</div>';
  });
  h += '</div>';
  h += '<button type="button" class="btn wide" data-a="scgplay" data-c="all">▶ 從頭連播</button>';
  const vs = scgVoySeen(), vst = 'border:2px solid var(--edge);border-radius:10px;overflow:hidden;background:#fff;padding:0;font:inherit;color:inherit;text-align:center;line-height:1.3';
  h += '<p class="empty" style="margin:12px 0 2px"><b>出海篇</b>（柴犬船長）</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0">';
  SCG_VOY.forEach((a, i) => {
    const cv = '<canvas data-th="v' + i + '" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated' + (vs ? '' : ';filter:brightness(.3) saturate(.3)') + '"></canvas>', lab = '<span style="display:block;font-size:11px;padding:3px 2px">出海篇 ' + (i + 1) + '<br>' + (vs ? esc(a.title) : '？？？') + '</span>';
    h += vs ? '<button type="button" data-a="scgplay" data-c="v' + i + '" style="' + vst + ';cursor:pointer">' + cv + lab + '</button>' : '<div style="' + vst + '">' + cv + lab + '</div>';
  });
  h += '</div>' + (vs ? '<button type="button" class="btn wide" data-a="scgplay" data-c="voy">▶ 重看出海劇情</button>' : '<small class="empty">第一次登上雷克斯號就會解鎖。</small>');
  return h;
}

/* 重播畫面：上面 CG（章節開頭有標題卡）、下面頭像＋對白（一個字一個字出現） */
function scgPlayHtml() {
  const p = scgPlay, ln = p.q[p.i], last = p.i >= p.q.length - 1, me_ = ln.s === 'me', nq = me_ ? null : NPCS.find(q => q.k === ln.s);
  const name = me_ ? (me ? me.name : '你') : (ln.s === 'cpt' ? '柴犬船長' : ln.s === 'stm' ? '貓咪站長' : nq ? nq.n : '');
  const pic = me_ ? '<canvas width="16" height="22" data-me="1" style="width:48px;height:66px;flex:none;image-rendering:pixelated"></canvas>'
    : ln.s === 'stm' ? '<canvas width="16" height="16" data-stm="1" style="width:48px;height:48px;flex:none;image-rendering:pixelated"></canvas>'
    : ln.s === 'cpt' ? '<canvas width="16" height="16" data-cpt="1" style="width:48px;height:48px;flex:none;image-rendering:pixelated"></canvas>' : nq ? '<canvas width="16" height="20" data-npc="' + nq.k + '" style="width:48px;height:60px;flex:none;image-rendering:pixelated"></canvas>' : '';
  return '<div class="shop-h"><h2>' + (ln.ch ? '第 ' + ln.ch + ' 章：' : (ln.tag ? ln.tag + '：' : '序章：')) + esc(ln.title) + '</h2></div>' +
    '<div style="position:relative;line-height:0"><canvas id="scgcv" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#000"></canvas>' +
    '<div id="scgttl" style="position:absolute;inset:3px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.55);color:#fff;line-height:1.5;opacity:0;pointer-events:none;transition:opacity .5s"></div></div>' +
    '<div class="row" style="align-items:flex-start;margin-top:8px">' + pic + '<div class="meta"><b>' + esc(name) + '</b><small id="scg-txt" data-full="' + esc(ln.opts ? '你想怎麼回應？' : ln.t) + '" style="display:block;margin-top:4px;line-height:1.5;min-height:3em"></small></div></div>' +
    '<small class="empty">' + (p.i + 1) + ' / ' + p.q.length + '</small>' +
    (ln.opts ? ln.opts.map((o, k) => '<button type="button" class="btn wide" data-a="scgpick" data-c="' + k + '">' + esc(o[0]) + '</button>').join('') : '<button type="button" class="btn wide" data-a="scgnext">' + (last ? '完成' : '繼續') + '</button>') +
    '<button type="button" class="btn ghost wide" data-a="scgback">' + (p.auto ? '跳過' : '回到相簿') + '</button>';
}

/* 畫完 innerHTML 之後呼叫：畫縮圖、啟動重播畫面、畫頭像、開始打字 */
function scgAfter(root) {
  root.querySelectorAll('canvas[data-th]').forEach(cv => scgThumb(cv, isNaN(+cv.dataset.th) ? cv.dataset.th : +cv.dataset.th));
  if (!scgPlay) return;
  const ln = scgPlay.q[scgPlay.i];
  scgRun(root.querySelector('#scgcv'), ln.beat || (ln.ch ? ln.ch - 1 : 'pro'));
  root.querySelectorAll('canvas[data-cpt]').forEach(cv => captainPortrait(cv.getContext('2d')));
  root.querySelectorAll('canvas[data-stm]').forEach(cv => stationMasterPortrait(cv.getContext('2d'), Date.now()));
  root.querySelectorAll('canvas[data-npc]').forEach(cv => npcIcon(cv.getContext('2d'), cv.dataset.npc));
  root.querySelectorAll('canvas[data-me]').forEach(cv => { const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 22); g = c2; try { drawPlayer(0, 6, 'down', false, 0, myChar()); } catch (e) { /* 略過 */ } g = ctx; });
  if (scgPlay.title) {
    scgPlay.title = false;
    const o = root.querySelector('#scgttl');
    if (o) { o.innerHTML = '<small style="font-size:12px;letter-spacing:.2em">' + (ln.ch ? '第 ' + ln.ch + ' 章' : (ln.tag || '序章')) + '</small><b style="font-size:20px">' + esc(ln.title) + '</b>'; requestAnimationFrame(() => { o.style.opacity = '1'; }); setTimeout(() => { if (o.isConnected) o.style.opacity = '0'; }, 1500); }
  }
  petCgType(root.querySelector('#scg-txt'));
}

/* 布告欄卡片上的按鈕：處理完回傳 true，由呼叫的人重畫 */
function scgClick(a, c) {
  if (a === 'scgplay' && (c === 'voy' || /^v\d$/.test(c))) { const q = scgVoyQ(c === 'voy' ? -1 : +c.slice(1)); if (!q.length) return true; scgSt.beat = -1; scgPlay = { q, i: 0, title: true }; return true; }
  if (a === 'scgpick') {
    const p = scgPlay, ln = p && p.q[p.i]; if (!ln || !ln.opts || !ln.opts[+c]) return false;
    const o = ln.opts[+c], base = { ch: ln.ch, tag: ln.tag, title: ln.title, beat: ln.beat, first: false };
    p.q.splice(p.i, 1, Object.assign({}, base, { s: 'me', t: o[0] }), Object.assign({}, base, { s: 'cpt', t: o[1] })); p.title = false; return true;
  }
  if (a === 'scgplay') {
    const d = stData ? stData.done | 0 : 0, chs = ((stData && stData.chapters) || []).filter(x => x.ch <= d && (c === 'all' || x.ch === +c)), q = [];
    if (c === 'all' || c === '0') SCG_PRO.lines.forEach((x, j) => q.push({ ch: 0, title: SCG_PRO.title, s: x.s, t: x.t, first: j === 0 }));
    chs.forEach(ch => scgLines(ch).forEach((x, j) => q.push({ ch: ch.ch, title: ch.title, s: x.s || x[0], t: x.t || x[1], first: j === 0 })));
    if (!q.length) return true;
    scgSt.beat = -1; scgPlay = { q, i: 0, title: true }; return true;
  }
  if (a === 'scgnext') {
    if (petCgSkipType()) return false;   // 字還沒出完：先補完，不換句
    const p = scgPlay; if (!p) return true;
    if (p.i < p.q.length - 1) { p.i++; p.title = p.q[p.i].first; } else { const au = p.auto, af = p.after; scgReset(); if (au) { closeBoard(); if (af) af(); return false; } }
    return true;
  }
  if (a === 'scgback') { if (scgPlay && scgPlay.auto) { const af = scgPlay.after; scgReset(); closeBoard(); if (af) af(); return false; } scgReset(); return true; }
  return false;
}

/* 序章首次自動播放：每個帳號只播一次（記在本機）；有別的視窗開著就等一等再播 */
function scgProKey() { return 'dw_pro_' + (typeof authUser !== 'undefined' && authUser ? authUser : (me ? me.username : '')); }
function scgPrologueCheck(n) {
  n = n | 0; if (!me) return;
  let seen = false; try { seen = !!localStorage.getItem(scgProKey()); } catch (e) { /* 略過 */ }
  if (seen) return;
  setTimeout(() => {
    if (!ready || !me || authOpen) return;
    if (paused()) { if (n < 15) scgPrologueCheck(n + 1); return; }
    try { localStorage.setItem(scgProKey(), '1'); } catch (e) { /* 略過 */ }
    bdOpen = true; pressed.length = 0; bdData = null; bdTab = 'story'; scgSt.beat = -1;
    scgPlay = { q: SCG_PRO.lines.map((x, j) => ({ ch: 0, title: SCG_PRO.title, s: x.s, t: x.t, first: j === 0 })), i: 0, title: true, auto: true };
    renderBoard(); bdEl.hidden = false; bdCard.focus();
  }, n ? 2000 : 1500);
}

/* ---------- 出海篇：播放入口 ---------- */
function scgVoyKey() { return 'dw_voy_' + (typeof authUser !== 'undefined' && authUser ? authUser : (me ? me.username : '')); }
function scgVoySeen() { try { return !!localStorage.getItem(scgVoyKey()); } catch (e) { return false; } }
function scgVoyQ(only) {   // only：-1＝四幕全播，0~3＝只播那一幕
  const q = [];
  SCG_VOY.forEach((a, k) => { if (only >= 0 && only !== k) return; a.lines.forEach((x, j) => q.push({ ch: 0, tag: '出海篇', title: a.title, beat: 'v' + k, s: x.s, t: x.t, opts: x.opts, first: j === 0 })); });
  return q;
}
function scgDivKey() { return 'dw_div_' + (typeof authUser !== 'undefined' && authUser ? authUser : (me ? me.username : '')); }
function scgDivSeen() { try { return !!localStorage.getItem(scgDivKey()); } catch (e) { return false; } }
function scgDivQ() {
  const q = [];
  SCG_DIV.forEach((a, k) => a.lines.forEach((x, j) => q.push({ ch: 0, tag: '潛水篇', title: a.title, beat: 'd' + k, s: x.s, t: x.t, opts: x.opts, first: j === 0 })));
  return q;
}
/* 重看（從船長選單）：播完回到布告欄相簿 */
function scgDivOpen(auto, after) {
  bdOpen = true; pressed.length = 0; bdData = null; bdTab = 'story'; scgSt.beat = -1;
  scgPlay = { q: scgDivQ(), i: 0, title: true, auto: !!auto, after: after || null };
  renderBoard(); bdEl.hidden = false; bdCard.focus();
}
/* 第一次按「潛水」：先播這段劇情，播完（或跳過）再下水。回傳 true＝劇情接手了，呼叫的人不用再下水 */
function scgDivCheck(after) {
  if (!me || scgDivSeen()) return false;
  try { localStorage.setItem(scgDivKey(), '1'); } catch (e) { /* 略過：下次還會再播一次 */ }
  scgDivOpen(true, after); return true;
}
function scgVoyOpen(auto) {
  bdOpen = true; pressed.length = 0; bdData = null; bdTab = 'story'; scgSt.beat = -1;
  scgPlay = { q: scgVoyQ(-1), i: 0, title: true, auto: !!auto };
  renderBoard(); bdEl.hidden = false; bdCard.focus();
}
/* 第一次登上雷克斯號：自動播一次（每個帳號一次，記在本機）；有別的視窗開著就等一等 */
function scgVoyCheck(n) {
  n = n | 0; if (!me || scgVoySeen()) return;
  setTimeout(() => {
    if (!ready || !me || authOpen || !voyAboard()) return;
    if (paused()) { if (n < 15) scgVoyCheck(n + 1); return; }
    try { localStorage.setItem(scgVoyKey(), '1'); } catch (e) { /* 略過 */ }
    scgVoyOpen(true);
  }, n ? 2000 : 1200);
}

/* ---------- 火車篇：播放入口（第 1、2 幕＝序；第 3、4 幕＝蓋好；各自只自動播一次，記在本機）---------- */
function scgTrnKey(k) { return 'dw_trn' + k + '_' + (typeof authUser !== 'undefined' && authUser ? authUser : (me ? me.username : '')); }
function scgTrnSeen(k) { try { return !!localStorage.getItem(scgTrnKey(k)); } catch (e) { return false; } }
function scgTrnQ(from, to) {
  const q = [];
  SCG_TRN.forEach((a, k) => { if (k < from || k > to) return; a.lines.forEach((x, j) => q.push({ ch: 0, tag: '火車篇', title: a.title, beat: 't' + k, s: x.s, t: x.t, opts: x.opts, first: j === 0 })); });
  return q;
}
/* from~to：要播哪幾幕（0~3）；auto＝播完自動關掉並呼叫 after（回到站長面板）；跳過／看完都會呼叫 after */
function scgTrnOpen(from, to, after) {
  bdOpen = true; pressed.length = 0; bdData = null; bdTab = 'story'; scgSt.beat = -1;
  scgPlay = { q: scgTrnQ(from, to), i: 0, title: true, auto: true, after: after || null };
  renderBoard(); bdEl.hidden = false; bdCard.focus();
}
/* 第一次開站長面板、車站還沒蓋好：先播序（第 1、2 幕）。回傳 true＝劇情接手了 */
function scgTrnIntro(after) {
  if (!me || scgTrnSeen('a')) return false;
  try { localStorage.setItem(scgTrnKey('a'), '1'); } catch (e) { /* 略過：下次還會再播一次 */ }
  scgTrnOpen(0, 1, after); return true;
}
/* 車站剛蓋好：播第 3、4 幕（每個帳號一次；之後想看從站長面板的「重看劇情」） */
function scgTrnFinale(after) {
  if (!me || scgTrnSeen('b')) return false;
  try { localStorage.setItem(scgTrnKey('b'), '1'); } catch (e) { /* 略過 */ }
  scgTrnOpen(2, 3, after); return true;
}
