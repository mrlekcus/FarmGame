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

const scgSt = { beat: -1, from: -1, t0: 0 };
let scgPlay = null;   // 重播中：{ q: [{ ch, title, s, t, first }], i, title }
function scgDraw(beat, t) {
  const f = beat === 'pro' ? scgPro : SCG_SC[beat];
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
  try { scgDraw(i, i === 5 ? 4.5 : i === 'pro' ? 5 : 1.6); r('#000', 0, 0, 192, 4); r('#000', 0, 104, 192, 4); } catch (e) { /* 略過 */ }
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
  return h;
}

/* 重播畫面：上面 CG（章節開頭有標題卡）、下面頭像＋對白（一個字一個字出現） */
function scgPlayHtml() {
  const p = scgPlay, ln = p.q[p.i], last = p.i >= p.q.length - 1, me_ = ln.s === 'me', nq = me_ ? null : NPCS.find(q => q.k === ln.s);
  const name = me_ ? (me ? me.name : '你') : (nq ? nq.n : '');
  const pic = me_ ? '<canvas width="16" height="22" data-me="1" style="width:48px;height:66px;flex:none;image-rendering:pixelated"></canvas>'
    : nq ? '<canvas width="16" height="20" data-npc="' + nq.k + '" style="width:48px;height:60px;flex:none;image-rendering:pixelated"></canvas>' : '';
  return '<div class="shop-h"><h2>' + (ln.ch ? '第 ' + ln.ch + ' 章：' : '序章：') + esc(ln.title) + '</h2></div>' +
    '<div style="position:relative;line-height:0"><canvas id="scgcv" width="192" height="108" style="display:block;width:100%;aspect-ratio:16/9;image-rendering:pixelated;border:3px solid var(--edge);border-radius:12px;background:#000"></canvas>' +
    '<div id="scgttl" style="position:absolute;inset:3px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.55);color:#fff;line-height:1.5;opacity:0;pointer-events:none;transition:opacity .5s"></div></div>' +
    '<div class="row" style="align-items:flex-start;margin-top:8px">' + pic + '<div class="meta"><b>' + esc(name) + '</b><small id="scg-txt" data-full="' + esc(ln.t) + '" style="display:block;margin-top:4px;line-height:1.5;min-height:3em"></small></div></div>' +
    '<small class="empty">' + (p.i + 1) + ' / ' + p.q.length + '</small>' +
    '<button type="button" class="btn wide" data-a="scgnext">' + (last ? '完成' : '繼續') + '</button>' +
    '<button type="button" class="btn ghost wide" data-a="scgback">' + (p.auto ? '跳過' : '回到相簿') + '</button>';
}

/* 畫完 innerHTML 之後呼叫：畫縮圖、啟動重播畫面、畫頭像、開始打字 */
function scgAfter(root) {
  root.querySelectorAll('canvas[data-th]').forEach(cv => scgThumb(cv, cv.dataset.th === 'pro' ? 'pro' : +cv.dataset.th));
  if (!scgPlay) return;
  const ln = scgPlay.q[scgPlay.i];
  scgRun(root.querySelector('#scgcv'), ln.ch ? ln.ch - 1 : 'pro');
  root.querySelectorAll('canvas[data-npc]').forEach(cv => npcIcon(cv.getContext('2d'), cv.dataset.npc));
  root.querySelectorAll('canvas[data-me]').forEach(cv => { const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 22); g = c2; try { drawPlayer(0, 6, 'down', false, 0, myChar()); } catch (e) { /* 略過 */ } g = ctx; });
  if (scgPlay.title) {
    scgPlay.title = false;
    const o = root.querySelector('#scgttl');
    if (o) { o.innerHTML = '<small style="font-size:12px;letter-spacing:.2em">' + (ln.ch ? '第 ' + ln.ch + ' 章' : '序章') + '</small><b style="font-size:20px">' + esc(ln.title) + '</b>'; requestAnimationFrame(() => { o.style.opacity = '1'; }); setTimeout(() => { if (o.isConnected) o.style.opacity = '0'; }, 1500); }
  }
  petCgType(root.querySelector('#scg-txt'));
}

/* 布告欄卡片上的按鈕：處理完回傳 true，由呼叫的人重畫 */
function scgClick(a, c) {
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
    if (p.i < p.q.length - 1) { p.i++; p.title = p.q[p.i].first; } else { const au = p.auto; scgReset(); if (au) { closeBoard(); return false; } }
    return true;
  }
  if (a === 'scgback') { if (scgPlay && scgPlay.auto) { scgReset(); closeBoard(); return false; } scgReset(); return true; }
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
