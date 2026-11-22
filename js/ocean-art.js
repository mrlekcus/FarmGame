/* 海底清潔（自由潛水）的繪圖：整張海底地圖（髒／乾淨兩版）、垃圾、生物、潛水員。
   所有檔案共用同一個全域範圍，這裡用 IIFE 包起來，只匯出 OCA，避免和其他檔案的函式撞名。
   呼叫的人要先把全域 g 設成自己的畫布，用完再還原。 */
const OCA = (() => {
let RNG=7; const rnd=()=>{RNG=(RNG*16807)%2147483647;return (RNG-1)/2147483646;};
const rr=(c,x,y,w,h)=>r(c,Math.round(x),Math.round(y),Math.round(w),Math.round(h));
const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255];};
const mixc=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const disc=(c,cx,cy,rad,ry)=>{ry=ry||rad;for(let y=-ry;y<=ry;y++)for(let x=-rad;x<=rad;x++)if(x*x/(rad*rad)+y*y/(ry*ry)<=1.02)rr(c,cx+x,cy+y,1,1);};
function vgrad(y0,y1,stops,x0=0,x1=192){for(let y=y0;y<y1;y++){const p=(y-y0)/(y1-y0);let i=0;while(i<stops.length-2&&p>stops[i+1][0])i++;const [pa,ca]=stops[i],[pb,cb]=stops[i+1];rr(mixc(ca,cb,Math.max(0,Math.min(1,(p-pa)/(pb-pa)))),x0,y,x1-x0,1);}}
function bub(x,y,s){x=Math.round(x);y=Math.round(y);const c='rgba(255,255,255,.75)';if(s<=1){rr(c,x,y,1,1);return;}
 if(s==2){rr(c,x,y,2,1);rr(c,x,y+1,1,1);rr(c,x+1,y+1,1,1);rr('rgba(255,255,255,.35)',x,y+1,2,1);return;}
 rr(c,x+1,y,1,1);rr(c,x,y+1,1,1);rr(c,x+2,y+1,1,1);rr(c,x+1,y+2,1,1);rr('rgba(255,255,255,.9)',x+1,y+1,1,1);}
function bubbles(x,y,n,dx){for(let i=0;i<n;i++){bub(x+Math.sin(i*1.7)*(dx||2),y-i*5-2,i%3==0?3:i%2?2:1);}}
/* ---- 潛水員：遊戲角色＋面鏡＋氣瓶＋蛙鞋 ---- */
let TK='#8a99b0',TK2='#5d6b82',FL='#ff9a3c',FL2='#d9701a',MK='#1d3f6e';
function diver0(px,py,face,ch,sc){sc=sc||1;px=Math.round(px);py=Math.round(py);
 g.save();g.translate(px,py);g.scale(sc,sc);const c={...DEF_CHAR,hat:3,fits:0,...ch};
 const x=0,y=0;
 if(face==='down'){ ob(TK,TK2,x+1,y+9,3,8);ob(TK,TK2,x+12,y+9,3,8);r('#d9534f',x+2,y+8,1,1);r('#d9534f',x+13,y+8,1,1); }
 else if(face==='right'){ ob(TK,TK2,x-2,y+8,5,9);r('#d9534f',x-1,y+7,2,1);r('#cfd8e6',x-1,y+10,1,4); }
 else if(face==='left'){ ob(TK,TK2,x+13,y+8,5,9);r('#d9534f',x+14,y+7,2,1);r('#cfd8e6',x+16,y+10,1,4); }
 drawPlayer(0,0,face,false,0,c);
 /* 蛙鞋 */
 if(face==='down'||face==='up'){ob(FL,FL2,x+2,y+15,5,4);ob(FL,FL2,x+9,y+15,5,4);}
 else if(face==='right'){ob(FL,FL2,x+3,y+15,9,3);r(FL2,x+11,y+16,2,1);}
 else {ob(FL,FL2,x+4,y+15,9,3);r(FL2,x+3,y+16,2,1);}
 /* 面鏡 */
 const gl='rgba(150,230,255,.55)';
 if(face==='down'){r(MK,x+2,y+4,12,1);r(MK,x+2,y+5,1,3);r(MK,x+13,y+5,1,3);r(gl,x+3,y+5,10,3);r('rgba(255,255,255,.7)',x+4,y+5,2,1);
   r('#ffcc33',x+14,y-2,1,9);r('#ff8a1f',x+14,y-3,2,2);r(MK,x+14,y+6,1,2);}
 else if(face==='right'){r(MK,x+7,y+4,8,1);r(MK,x+14,y+5,1,3);r(gl,x+8,y+5,6,3);r('rgba(255,255,255,.7)',x+9,y+5,2,1);r(MK,x+2,y+4,5,1);
   r('#ffcc33',x+4,y-1,1,6);r('#ff8a1f',x+3,y-2,2,2);}
 else if(face==='left'){r(MK,x+1,y+4,8,1);r(MK,x+1,y+5,1,3);r(gl,x+2,y+5,6,3);r('rgba(255,255,255,.7)',x+3,y+5,2,1);r(MK,x+9,y+4,5,1);
   r('#ffcc33',x+11,y-1,1,6);r('#ff8a1f',x+11,y-2,2,2);}
 g.restore();}
/* ---- 海洋生物 ---- */
function fish(x,y,c,dir,s){s=s||1;x=Math.round(x);y=Math.round(y);const o=mixc(c,'#000000',.3),h=mixc(c,'#ffffff',.4);
 if(dir>0){rr(o,x,y,5*s,3*s);rr(c,x,y,5*s-1,3*s-1);rr(c,x-2*s,y-s,2*s,s);rr(c,x-2*s,y+2*s,2*s,s);rr(c,x-s,y,s,3*s);rr(h,x+2*s,y,2*s,s);rr('#1d1d2b',x+4*s-1,y+s-1,1,1);}
 else{rr(o,x,y,5*s,3*s);rr(c,x+1,y,5*s-1,3*s-1);rr(c,x+5*s,y-s,2*s,s);rr(c,x+5*s,y+2*s,2*s,s);rr(c,x+5*s,y,s,3*s);rr(h,x+s,y,2*s,s);rr('#1d1d2b',x+s,y+s-1,1,1);}}
function jelly(x,y,c,t){x=Math.round(x);y=Math.round(y);const a=c;disc('rgba(255,170,220,.85)',x,y,5,4);rr('rgba(0,0,0,0)',x,y,1,1);
 for(let yy=0;yy<5;yy++)rr('#2a1f40',x-6,y+yy,0,0);
 rr('rgba(255,255,255,.55)',x-3,y-3,3,1);
 for(let i=-4;i<=4;i+=2){for(let k=0;k<7;k++)rr('rgba(255,190,235,.75)',x+i+(k%2?0:1)*(i>0?1:0)*0+Math.round(Math.sin(k*.9+i+(t||0))*1),y+4+k,1,1);}
 disc('rgba(255,235,250,.5)',x,y-1,2,1);}
function anglerfish(x,y,t){x=Math.round(x);y=Math.round(y);
 /* 光暈 */
 for(let i=6;i>=1;i--){disc('rgba(255,236,140,'+(0.05+0.045*(7-i))+')',x-14,y-12,i*3);}
 disc('#2c2540',x+2,y,9,6);rr('#3a3158',x-4,y-4,12,3);
 rr('#2c2540',x+10,y-2,6,4);rr('#2c2540',x+14,y-5,3,3);rr('#2c2540',x+14,y+3,3,3);
 /* 牙齒 */ for(let i=0;i<5;i++)rr('#fff',x-6+i*2,y+2,1,2);
 rr('#ffe97a',x-8,y-3,2,2);rr('#1d1d2b',x-5,y-3,2,2);rr('#fff',x-5,y-3,1,1);
 /* 釣竿 */ rr('#3a3158',x-5,y-7,1,3);rr('#3a3158',x-7,y-9,1,2);rr('#3a3158',x-10,y-11,3,1);
 disc('#fff6a8',x-13,y-12,2);rr('#fff',x-14,y-13,1,1);}
function clam(x,y,open,t){x=Math.round(x);y=Math.round(y);
 rr('#8a5a6a',x-1,y+4,11,1);disc('#e6a0b8',x+4,y+2,5,3);disc('#f7c6d4',x+4,y+1,4,2);
 rr('#c7788f',x+1,y+1,1,3);rr('#c7788f',x+4,y,1,4);rr('#c7788f',x+7,y+1,1,3);
 if(open){disc('#fff',x+4,y+1,1);rr('#fffbe0',x+3,y,1,1);}}
function sparkle(x,y,c){x=Math.round(x);y=Math.round(y);c=c||'#fff7b0';rr(c,x,y-2,1,5);rr(c,x-2,y,5,1);rr('#fff',x,y,1,1);}
function starfish(x,y,c){x=Math.round(x);y=Math.round(y);c=c||'#ff8a5a';const o=mixc(c,'#000',.25);
 rr(c,x+2,y,1,5);rr(c,x,y+2,5,1);rr(c,x+1,y+1,3,3);rr(o,x+2,y+2,1,1);rr(c,x,y,1,1);rr(c,x+4,y,1,1);rr(c,x,y+4,1,1);rr(c,x+4,y+4,1,1);}
function chest(x,y,glow){x=Math.round(x);y=Math.round(y);
 if(glow)for(let i=7;i>=1;i--)disc('rgba(255,224,120,'+(0.05+0.04*(8-i))+')',x+8,y+4,i*3,i*2);
 ob('#9a6234','#4e2f16',x,y,16,10);rr('#b97a43',x+1,y+1,14,3);rr('#6b4220',x+1,y+5,14,1);
 rr('#ffd34d',x+7,y+3,2,4);rr('#b8892a',x+7,y+6,2,1);rr('#ffd34d',x+1,y,1,10);rr('#ffd34d',x+14,y,1,10);
 rr('#ffe98a',x+2,y+1,3,1);}
function coralB(x,y,c,h){x=Math.round(x);y=Math.round(y);const o=mixc(c,'#000',.28),l=mixc(c,'#fff',.35);
 rr(o,x,y-h,3,h);rr(c,x+1,y-h,1,h);
 const b=Math.floor(h/3);rr(o,x-3,y-b*2-1,3,2);rr(c,x-3,y-b*2-1,2,1);rr(o,x-3,y-b*2-4,2,4);rr(c,x-3,y-b*2-4,1,3);
 rr(o,x+3,y-b-1,3,2);rr(c,x+3,y-b-1,2,1);rr(o,x+5,y-b-4,2,4);rr(c,x+5,y-b-4,1,3);rr(l,x+1,y-h,1,2);rr(l,x-3,y-b*2-4,1,1);rr(l,x+5,y-b-4,1,1);}
function brain(x,y,c,w){x=Math.round(x);y=Math.round(y);const o=mixc(c,'#000',.3),l=mixc(c,'#fff',.35);
 disc(o,x,y,w,Math.round(w*.7));disc(c,x,y-1,w-1,Math.round(w*.7)-1);for(let i=-w+2;i<w-1;i+=3){rr(o,x+i,y-2,1,3);rr(o,x+i+1,y,1,2);}rr(l,x-2,y-3,3,1);}
function fan(x,y,c,h){x=Math.round(x);y=Math.round(y);const o=mixc(c,'#000',.3);
 for(let i=-h;i<=h;i++){const hh=Math.round(h*(1-Math.abs(i)/(h+1))+2);rr(i%2?c:o,x+i,y-hh,1,hh);}rr('#6b4a52',x,y,1,2);}
function kelp(x,y,h,c,ph){x=Math.round(x);y=Math.round(y);c=c||'#2f9e57';const o=mixc(c,'#000',.3);
 for(let i=0;i<h;i++){const dx=Math.round(Math.sin(i*.45+(ph||0))*2);rr(o,x+dx,y-i,3,1);rr(c,x+dx+1,y-i,1,1);if(i%5===3)rr(c,x+dx+(i%2?3:-2),y-i,2,1);}}
function weed(x,y,c){x=Math.round(x);y=Math.round(y);c=c||'#3fbf6a';rr(c,x,y-4,1,4);rr(c,x+2,y-6,1,6);rr(c,x+4,y-3,1,3);rr(mixc(c,'#fff',.3),x+2,y-6,1,1);}
function rock(x,y,w,h,c){x=Math.round(x);y=Math.round(y);c=c||'#7b8794';const o=mixc(c,'#000',.35),l=mixc(c,'#fff',.3);
 disc(o,x+w/2,y+h/2,w/2,h/2);disc(c,x+w/2,y+h/2-1,w/2-1,h/2-1);rr(l,x+3,y+1,Math.max(2,w/3),1);}
function rays(x0,y0,y1,list){list.forEach(([dx,w,a])=>{const c=g;c.fillStyle='rgba(255,255,255,'+a+')';c.beginPath();c.moveTo(x0+dx,y0);c.lineTo(x0+dx+w,y0);c.lineTo(x0+dx+w-22,y1);c.lineTo(x0+dx-22-w*.2,y1);c.closePath();c.fill();});}

/* ---------- 垃圾 ---------- */
function tbag(x,y,t){x=Math.round(x);y=Math.round(y+Math.sin(t||0)*1);disc('rgba(255,255,255,.72)',x,y,4,3);rr('rgba(255,255,255,.85)',x-3,y-6,1,4);rr('rgba(255,255,255,.85)',x+2,y-6,1,4);rr('rgba(255,255,255,.85)',x-3,y-6,6,1);rr('rgba(160,190,210,.6)',x-2,y,3,1);}
function bottle(x,y,c){x=Math.round(x);y=Math.round(y);c=c||'#7fd0ff';rr('#355a78',x-1,y-1,5,9);rr(c,x,y,3,7);rr('#fff',x,y+3,3,2);rr('#fff',x+1,y-3,1,2);rr('#d94a4a',x,y-2,3,1);}
function tcan(x,y){x=Math.round(x);y=Math.round(y);rr('#59606e',x-1,y-1,6,7);rr('#b8c0cc',x,y,4,5);rr('#e0505a',x,y+1,4,2);rr('#8a95a5',x,y,4,1);}
function tire(x,y){disc('#14141b',x,y,6,5);disc('#2e2e3a',x,y,5,4);disc('#14141b',x,y,2,2);}
function cup(x,y){x=Math.round(x);y=Math.round(y);rr('#d8d2c4',x,y,5,1);rr('#fff6e0',x+1,y+1,3,4);rr('#d9a87a',x+1,y+3,3,1);}
function net(x,y,w,h,col){col=col||'rgba(110,200,120,.85)';x=Math.round(x);y=Math.round(y);for(let i=0;i<=h;i+=3){for(let j=0;j<w;j++)if((j+i)%5!=4)rr(col,x+j+Math.round(Math.sin(i*.8)*1.5),y+i,1,1);}
 for(let j=0;j<=w;j+=4)for(let i=0;i<h;i++)if((i+j)%6!=5)rr(col,x+j+Math.round(Math.sin(i*.7)*1.5),y+i,1,1);}
function line(x,y,n){x=Math.round(x);y=Math.round(y);for(let i=0;i<n;i++)rr('rgba(230,240,255,.8)',x+i,y+Math.round(Math.sin(i*.5)*2),1,1);}
function tturtle(x,y,dir){x=Math.round(x);y=Math.round(y);const sh='#7a9a3a',sd='#4e6a22';
 disc(sd,x+6,y+4,7,5);disc(sh,x+6,y+3,6,4);rr('#a6c25a',x+3,y+1,3,1);rr(sd,x+6,y+2,1,4);rr(sd,x+3,y+3,7,1);
 rr('#d9c98a',x+(dir>0?13:-3),y+3,4,3);rr('#1d1d2b',x+(dir>0?15:-1),y+3,1,1);rr('#9bb35a',x+2,y+8,4,2);rr('#9bb35a',x+8,y+8,4,2);rr('#9bb35a',x+1,y-1,3,2);rr('#9bb35a',x+9,y-1,3,2);}
function bleached(x,y,w){x=Math.round(x);y=Math.round(y);for(let i=0;i<w;i+=2){const hh=4+((i*7)%5);rr('#cfc8b8',x+i,y-hh,2,hh);rr('#e6e0d2',x+i,y-hh,1,2);}}
/* ---------- 海底背景 ---------- */
function sea(clean,t){
 if(clean){vgrad(0,108,[[0,'#7fe3ea'],[.35,'#38b6dd'],[.75,'#2a86c4'],[1,'#1a5a9e']]);rays(0,0,80,[[14,10,.10],[60,7,.08],[104,13,.11],[146,8,.08],[176,6,.09]]);}
 else {vgrad(0,108,[[0,'#7a9a86'],[.35,'#587a72'],[.75,'#3e5a58'],[1,'#2a3a3c']]);rays(0,0,60,[[30,6,.04],[120,8,.04]]);
  for(let i=0;i<70;i++){rr('rgba(200,200,160,'+(.12+rnd()*.15)+')',rnd()*192,rnd()*100,1,1);}}
 /* 沙地 */
 for(let y=94;y<108;y++){const p=(y-94)/14;rr(clean?mixc('#f0dca0','#c8a868',p):mixc('#8a8470','#4e4a3c',p),0,y,192,1);}
 for(let x=0;x<192;x+=9){rr(clean?'rgba(255,255,255,.25)':'rgba(0,0,0,.18)',x+((x*3)%5),96+(x%4)*3,3,1);}
}
function reef(clean){
 if(clean){coralB(14,95,'#ff8aa8',10);coralB(22,95,'#ff9a5a',7);fan(34,95,'#b36bd6',9);brain(50,95,'#ffd27a',8);coralB(66,95,'#ff6b8a',11);fan(160,95,'#ffd27a',8);coralB(172,95,'#ff9a5a',9);brain(182,95,'#ff8aa8',7);coralB(128,95,'#b36bd6',8);
  kelp(8,95,22,'#35a860',1);kelp(100,95,18,'#2f9e57',2);kelp(150,95,24,'#35a860',3);weed(42,95);weed(120,95);starfish(78,94,'#ff8a5a');starfish(138,95,'#ffb25a');}
 else{bleached(12,95,14);bleached(40,95,10);bleached(62,95,12);bleached(150,95,14);bleached(176,95,10);kelp(8,95,10,'#5a6a40',1);weed(120,95,'#6a7a4a');rock(90,96,12,5,'#5a5a52');}
}


function floorFill(w,h,fl,sand,deep){for(let x=0;x<w;x++){const fy=Math.round(fl(x));for(let y=fy;y<h;y++){const p=Math.min(1,(y-fy)/50);const c=y-fy<2?mixc(sand,'#ffffff',.25):mixc(mixc(sand,deep,Math.min(1,y/h*1.1)),'#000',p*.25);rr(c,x,y,1,1);}}}
function scatter(x0,x1,fl,step,fn){for(let x=x0;x<x1;x+=step+Math.floor(rnd()*step)){fn(x,Math.round(fl(x)),rnd());}}
function boatTop(x,y){rr('#8a5a34',x,y+5,52,6);rr('#a9744a',x+2,y+6,48,2);rr('#5a3a1e',x+4,y+10,44,2);rr('#fff',x+18,y-3,18,8);rr('#7fb2f0',x+21,y,5,4);rr('#7fb2f0',x+28,y,5,4);rr('#ff6b6b',x+16,y-4,22,2);rr('#5a3a1e',x+40,y-7,1,12);rr('#ff9bb3',x+41,y-7,6,4);}
function wreck(x,y){ob('#6b4a35','#2f1e12',x,y-15,44,15);for(let i=x+2;i<x+42;i+=5)rr('#2f1e12',i,y-13,1,12);rr('#4e3626',x+22,y-37,3,22);rr('#4e3626',x+14,y-31,18,2);rr('#cdbf9a',x+15,y-29,10,10);rr('#2f1e12',x-4,y-19,8,5);rr('#1d1d2b',x+7,y-9,3,3);rr('#1d1d2b',x+17,y-9,3,3);rr('#1d1d2b',x+27,y-9,3,3);}

/* ---------- 地圖幾何（遊戲邏輯也要用）---------- */
const GW = 1152, GH = 540, GL = 384, GR = 768;
const wl = y => y < 290 ? GL : Math.max(14, GL - (y - 290) * Math.min(1, (y - 290) / 28) * 8.5 + Math.sin(y * .1) * 3);
const wr = y => GW - wl(y);
const fl = x => (x < 300 || x > 800) ? 500 + Math.sin(x * .05) * 5 : 512 + Math.sin(x * .06) * 4;
const LEDGES = [[GL, 96, 210], [GL + 170, 176, GR - GL - 170], [GL, 246, 230]];   // [x, y, w]（高度 9）
function world(clean) {
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const pg = g, c2 = cv.getContext('2d'); g = c2; c2.imageSmoothingEnabled = false; RNG = clean ? 131 : 137;
  rr(clean ? '#2a3248' : '#262a30', 0, 0, GW, GH);
  for (let i = 0; i < 500; i++) rr('rgba(255,255,255,' + (.03 + rnd() * .05) + ')', rnd() * GW, rnd() * GH, 3, 2);
  const cols = clean ? ['#7fe3ea', '#38b6dd', '#1f5aa0', '#10316a'] : ['#7a9a86', '#5a8078', '#46686c', '#2c3f46'];
  for (let y = 12; y < GH; y++) { const p = y / GH, c = p < .3 ? mixc(cols[0], cols[1], p / .3) : p < .6 ? mixc(cols[1], cols[2], (p - .3) / .3) : mixc(cols[2], cols[3], (p - .6) / .4); rr(c, wl(y), y, wr(y) - wl(y), 1); }
  vgrad(0, 12, [[0, '#a9defa'], [1, '#e6f6ff']], GL, GR);
  for (let y = 14; y < GH; y++) { const c = mixc('#8a99b8', '#1a2038', Math.min(1, y / GH * 1.2)); rr(c, wl(y) - 2, y, 2, 1); rr(c, wr(y), y, 2, 1); }
  if (clean) rays(GL, 12, 150, [[30, 10, .10], [130, 8, .08], [250, 12, .09]]);
  else for (let i = 0; i < 160; i++) rr('rgba(200,200,160,' + (.1 + rnd() * .12) + ')', GL + rnd() * 384, 12 + rnd() * 270, 1, 1);
  for (let x = GL; x < GR; x += 5) rr('#e9fbff', x, 12, 3, 1);
  boatTop(GL + 160, 3);
  const sand = clean ? '#e9d59a' : '#8a8470', led = (x0, x1, y, t) => { for (let k = 0; k < t; k++) rr(mixc(k < 2 ? (clean ? '#e9d59a' : '#9a9680') : '#6e7d96', '#10182e', Math.min(.9, (y + k) / GH)), x0, y + k, x1 - x0, 1); };
  LEDGES.forEach(a => led(a[0], a[0] + a[2], a[1], 9));
  const reefPick = (x, y, q) => { if (!clean) { bleached(x, y, 6); return; } [() => coralB(x, y, '#ff8aa8', 8), () => brain(x, y, '#ffd27a', 7), () => fan(x, y, '#b36bd6', 8)][Math.floor(q * 3)](); };
  scatter(GL + 10, GL + 200, x => 96, 10, reefPick);
  scatter(GL + 180, GR - 8, x => 176, 6, (x, y, q) => kelp(x, y, (clean ? 18 : 8) + q * (clean ? 26 : 8), clean ? (q > .5 ? '#35a860' : '#2f9e57') : '#5a6a40', Math.floor(q * 4)));
  wreck(GL + 60, 246);
  for (let x = Math.round(wl(499)); x < wr(499); x++) { const fy = Math.round(fl(x)); for (let y = fy; y < GH; y++) rr(mixc(sand, '#1b2030', (y - fy) / (GH - fy)), x, y, 1, 1); }
  for (let y = 470; y < GH; y++) { const rw = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 470) / 70) ** 2)) * 60); rr(mixc('#0b1740', '#02050f', (y - 470) / 70), 576 - rw, y, rw * 2, 1); }
  if (clean) disc('rgba(120,240,255,.2)', 576, 500, 50, 26);
  wreck(110, Math.round(fl(130))); wreck(230, Math.round(fl(250)));
  scatter(30, 330, fl, 14, (x, y) => weed(x, y, clean ? '#2f9e57' : '#6a7a4a'));
  scatter(330, 800, fl, 16, (x, y, q) => { if (x > 510 && x < 642) return; if (clean) { q > .5 ? coralB(x, y, '#ff9a5a', 7) : weed(x, y); } else bleached(x, y, 5); });
  for (let i = 0; i < 120; i++) rr('rgba(120,240,255,' + (.3 + rnd() * .5) + ')', 800 + rnd() * 320, 380 + rnd() * 150, 1, 1);
  scatter(810, 1120, fl, 12, (x, y) => coralB(x, y, clean ? '#8a4aa8' : '#6a5a74', 7));
  g = pg; return cv;
}
/* 潛水裝飾：氣瓶、氣瓶陰影、蛙鞋、蛙鞋陰影、面鏡 */
const GEARS = { base: ['#8a99b0', '#5d6b82', '#ff9a3c', '#d9701a', '#1d3f6e'], coral: ['#ff9bb3', '#d9648a', '#ff7aa0', '#c24a78', '#7a2a52'], blue: ['#5aa8ff', '#2f6fc4', '#4a8ae0', '#2a5aa0', '#1d3f6e'],
  green: ['#6fcf7a', '#3a9a52', '#4fb860', '#2f8a46', '#1f5a30'], gold: ['#ffd34d', '#c89a20', '#ffc233', '#c8901a', '#7a5a10'], glow: ['#8ff0ff', '#3ab8d8', '#b79bff', '#7a5ac8', '#3a2a7a'] };
function diverG(px, py, face, ch, gear, t) {
  const k = GEARS[gear] || GEARS.base; TK = k[0]; TK2 = k[1]; FL = k[2]; FL2 = k[3]; MK = k[4];
  px = Math.round(px); py = Math.round(py);
  if (gear === 'glow') disc('rgba(150,240,255,.2)', px + 8, py + 10, 13, 15);
  diver0(px, py, face, ch);
  if (gear === 'gold' && Math.sin((t || 0) * 3) > 0) sparkle(px + 15, py + 2);
  const b = GEARS.base; TK = b[0]; TK2 = b[1]; FL = b[2]; FL2 = b[3]; MK = b[4];
}
/* ---- 新增海洋生物（圖鑑用）：朝右畫、朝左自動鏡射 ---- */
const LIFE=(()=>{
/* 以朝右的圖樣畫，朝左自動鏡射：P(dx,dy,w,h,c) 的 dx 以魚的中心為 0 */
const mk=(x,y,dir,fn)=>fn((dx,dy,w,h,c)=>{const X=dir>0?x+dx:x-dx-w+1;rr(c,X,y+dy,w,h);});
function clown(x,y,dir,t){mk(x,y,dir,P=>{const o='#c2501a',c='#ff8a2a',w='#fff8ee',k='#2b2b3a';
 P(-5,-3,10,7,o);P(-4,-4,8,7,c);P(-5,-2,2,5,c);P(5,-2,2,4,c);P(6,-1,2,2,c); // 身體+尾
 P(-4,-4,2,7,w);P(-3,-4,1,7,k);P(1,-4,2,7,w);P(0,-4,1,7,k);P(5,-2,1,4,w);
 P(2,-1,1,1,k);P(-1,-5,3,1,c);P(-1,4,3,1,c);});}
function tang(x,y,dir,t){mk(x,y,dir,P=>{const b='#2f6fe0',d='#1a3f94',l='#6fb2ff',k='#14142a',yl='#ffd84a';
 P(-6,-4,11,9,d);P(-5,-5,10,9,b);P(-6,-3,9,6,b);P(-3,-5,6,1,l);
 P(5,-3,3,7,yl);P(8,-4,1,9,yl);P(-4,-6,8,1,d);P(-3,4,6,1,d);
 P(2,-2,1,1,k);P(-5,0,6,1,k);P(-2,-3,5,1,'#4a8cf0');});}
function butterfly(x,y,dir,t){mk(x,y,dir,P=>{const y1='#ffe04a',o='#d9a420',k='#1d1d2b',w='#fff8ee';
 P(-5,-6,9,12,o);P(-4,-7,8,12,y1);P(4,-3,3,5,y1);P(7,-2,1,3,w);P(-6,-3,2,6,y1);
 P(2,-4,1,9,k);P(-1,-7,1,12,'#fffbe0');P(3,-3,1,1,k);P(4,-1,2,1,k);P(-3,-5,5,1,w);});}
function puffer(x,y,dir,t){const e=Math.sin(t*3)>0?1:0;mk(x,y,dir,P=>{const c='#f4d9a0',d='#c79a58',w='#fff4d8',k='#2b2b3a';
 P(-5,-5,11,11,d);P(-4,-6,10,11,c);P(-6,-3,13,7,c);P(-4,2,8,3,w);
 P(8,-1,1,3,d);P(7,-2,2,1,c);P(7,2,2,1,c);P(-2,-8,1,2,d);P(2,-8,1,2,d);P(-6,-1,1,1,d);P(6,-6,1,1,d);P(-6,4,1,1,d);P(6,4,1,1,d);P(0,6,1,1,d);
 P(3,-2,2,2,'#fff');P(4,-2,1,2,k);P(5,2,2,1,d);P(0,-4,1,1,d);P(-3,-1,1,1,d);P(-1,1,1,1,d);P(-4,3,1,1,d);
 P(-3,0,1,2+e,c);});}
function seahorse(x,y,dir,t){const b=Math.round(Math.sin(t*2)*1);mk(x,y+b,dir,P=>{const c='#ffb23c',d='#b86a14',k='#1d1d2b';
 P(0,-8,4,3,c);P(3,-7,3,1,c);P(5,-7,1,2,d);P(-1,-6,1,1,d);P(1,-7,1,1,k);   // 頭+吻
 P(-1,-5,4,3,c);P(-1,-2,5,5,c);P(0,3,3,4,c);P(-1,3,1,3,d);P(0,7,2,2,c);P(-1,8,1,2,c);P(-2,9,2,1,c); // 身+尾
 P(-3,-3,1,3,'#ffd27a');P(3,-1,1,3,'#ffd27a');P(0,-3,3,1,d);P(0,0,3,1,d);P(0,3,3,1,d);P(-2,-6,1,2,'#ffd27a');});}
function ray(x,y,dir,t){const f=Math.round(Math.sin(t*2));mk(x,y,dir,P=>{const c='#8fa4c8',d='#566a90',w='#e8eefc',k='#1d1d2b';
 P(-9,-1+f,4,2,d);P(-8,-2,16,4,c);P(-6,-3,12,6,c);P(-4,-4,8,8,c);P(-9,f,3,1,c);P(8,0,2,1,c);   // 翅
 P(-4,-1,8,2,d);P(-2,2,4,2,w);P(10,0,6,1,d);P(2,-2,1,1,k);P(4,-2,1,1,k);});}
function shark(x,y,dir,t){const f=Math.round(Math.sin(t*2));mk(x,y,dir,P=>{const c='#7c8ca8',d='#4e5c78',w='#e6ecf6',k='#14142a';
 P(-14,-3,24,7,c);P(-11,-4,18,9,c);P(10,-2,5,5,c);P(-12,3,22,2,w);P(-4,-8,4,5,d);P(-3,-9,2,1,d);   // 背鰭
 P(-18,-6+f,4,4,d);P(-17,-3,4,6,d);P(-16,2,4,4+f,d);P(-5,4,5,3,d);                                  // 尾
 P(7,-2,1,1,k);P(10,2,3,1,k);P(11,1,1,1,w);P(8,0,1,2,d);});}
function crab(x,y,dir,t){const s=Math.round(Math.sin(t*5));mk(x,y,dir,P=>{const c='#e0502a',d='#8a2c14',l='#ff8a5a',k='#1d1d2b';
 P(-5,-3,10,5,d);P(-4,-4,8,5,c);P(-3,-4,6,1,l);P(-4,-6,1,3,c);P(3,-6,1,3,c);P(-4,-7,1,1,k);P(3,-7,1,1,k);
 P(-8,-5+s,3,3,c);P(-9,-6+s,2,2,l);P(5,-5-s,3,3,c);P(7,-6-s,2,2,l);
 P(-6,1,2,1,d);P(-7,2+s,1,2,d);P(4,1,2,1,d);P(6,2-s,1,2,d);P(-3,2,1,2,d);P(2,2,1,2,d);});}
function octopus(x,y,dir,t){const w=Math.sin(t*2);mk(x,y,dir,P=>{const c='#c06ad8',d='#7a3a94',l='#e6a8f4',k='#1d1d2b';
 P(-5,-8,10,8,c);P(-4,-9,8,2,c);P(-3,-9,3,1,l);P(-5,-1,10,2,d);
 P(-2,-4,2,2,'#fff');P(2,-4,2,2,'#fff');P(-1,-3,1,1,k);P(3,-3,1,1,k);
 for(let i=0;i<4;i++){const ox=-5+i*3;for(let k2=0;k2<6;k2++)P(ox+Math.round(Math.sin(k2*.8+i+w*2)*1.2),1+k2,2,1,k2%3==2?l:c);}});}
function starfish(x,y,c){c=c||'#ff7a4a';const d=mixc(c,'#000',.3),l=mixc(c,'#fff',.4);
 rr(d,x-1,y-1,3,3,d);rr(c,x,y-1,1,3);rr(c,x-1,y,3,1);rr(c,x,y-3,1,2);rr(c,x,y+2,1,2);rr(c,x-3,y,2,1);rr(c,x+2,y,2,1);rr(l,x,y,1,1);
 rr(c,x-3,y-2,1,1);rr(c,x+3,y-2,1,1);rr(c,x-3,y+2,1,1);rr(c,x+3,y+2,1,1);}
function urchin(x,y,c){c=c||'#5a2a8a';const l=mixc(c,'#fff',.45);disc(c,x,y,3,3);disc(mixc(c,'#000',.3),x,y+1,2,2);
 [[-6,0],[6,0],[0,-6],[-4,-4],[4,-4],[-5,2],[5,2]].forEach(a=>rr(l,x+a[0],y+a[1],1,1));[[-4,-1],[4,-1],[0,-4],[-3,-3],[3,-3]].forEach(a=>rr(c,x+a[0],y+a[1],1,1));}
function anemone(x,y,t){const cs=['#ff6aa8','#ff9ad0','#ffd0e8'];for(let i=-5;i<=5;i++){const h=5+(Math.abs(i)<3?3:0),sw=Math.round(Math.sin(t*2+i)*1.2);for(let k=0;k<h;k++)rr(cs[(k+i+9)%3],x+i+(k>2?sw:0),y-k,1,1);}rr('#9a3a68',x-6,y,13,2);}
return{clown,tang,butterfly,puffer,seahorse,ray,shark,crab,octopus,starfish,urchin,anemone};})();
return { GEARS, world, G: { W: GW, H: GH, L: GL, R: GR, wl, wr, fl, LEDGES }, diver: diverG, fish, jelly, anglerfish, turtle: tturtle, bub, bubbles, sparkle, starfish, tbag, bottle, tcan, tire, cup, net, line, disc, rr, mixc,
  wreck, coralB, LIFE };
})();
