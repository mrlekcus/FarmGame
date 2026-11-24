'use strict';
/* 火車站外觀（紅磚鐘塔站，112×96，佔 7×6 格；Python 畫好轉成 data URI）—— 雷克斯農場廣場。畫法見 drawStationBldg（js/world.js 的 STB 是位置）。 */
const STATION_IMG = new Image(); let stationOk = false;
STATION_IMG.onload = () => { stationOk = true; };
STATION_IMG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABgCAYAAADFNvbQAAAFH0lEQVR42u1cz2sUSRj9EvrgIQyNqLPGYDSEsIcwxCDDhpUcVvCQk+7KXsWDLCu7SlhFHOJpJdmgElxE9F8Qf9xyEBQ27LJLkKhDDkuQyWaZqNEgwzCHHALjIZlhujPdXdVTX3dVz3un6Z7qmvrqdb169U11EwEAAABAe6LDlIb2f3W+6j43MDyqrP6lhTnH8Zt/7hrRN5ZJd5tKwvzqdpMJAhViKDPIWv+r/KJR/WEcgaZ1MDc60QUgEACBQFvMgSa5Q6wDfXBhsL861veF0jpnC+/p98U3HZBQABIqgtVyBeyZTOCBVJfS+l6vV+BCARAItIuEuh1kGKh2siCwBRMz8/dDqevHR04nwgglwsR4GZDxkdO+5IrUgTkQAIEACIQLTWImBiZGcxPjNjNuxwoTozlklxYYgSARIxCAiYGJSZqJ4awDBCqC22lCQqn1ZxkGhkdZdlJX7pwkjn8VcvcWq8SwEXlpYY7tWQuLkzyundT9guWGfkltteFWOdZd39t9UeUg0eIkL24TM0QpbcwKF4mWKbLpkNA5sT0xtZEnUvb1eoW93dtQSqJlimyGkVAdH5xRPRI7TZLNpGBgeLTpA6uxjMCoZNMtoWTgs4cccmqZIptuCeUwJlE/e6hCTi1TZTMpG3tbJdEyRTYTKqEty6llimwmxYWqHomdcJtmu1PLFNl0SyiHidEhNlk5tUyRTbeEcpgYXd6AISOnnZBNs+W0Q/b1VjpgrPKUpd7ZrhNakuk3ErX+Q/fP6f+87k+W38tR8987duUQJeIlBxcG+6vfZvrqx2ulMqXtlPD1suW//MGib67asXbQ86kS/Xt/M5J4iYge5wtSL1uQHoFrpbLvsez1vgTSbi3u8sY2c8ZLUWRiRO4orjv1+VSp/rnZyOT6PqhtSuP9f52wL5TwdBJA2FaoHEGGhvv7RBAoOimrmOx1NDGc8UZuYtyT8eN8of65J7OLiIiK+Y36ua8P7qG0nQos17hUaTQWceGvBmPh116ZuDwhaWKUS+jtZxNERHRj/Kbj+OLx69Ll/pj+FOjucvMv6MjhfaHa+nL5A01mj0YeF0wMAALb1oVGkYmRzXy8XP7AalDiMnbRZ2ICJuD6taLlBDIZk9mjnvNg796t8FY+bkrNfzsyJQLGIm2nhONSmYlpKZntxjy99b0+S91S5URTUdwEBrW3t9RFaTslHJcfgezJbD8U8xs7XNjlmUt1F5bNyJXTBUHt7T3YFVtcoUxMbv4F3INCtNKfoU1MmAlZ5WTPbT6iNmdh4wltYtJ2Kt7JXhGE6o/AnInWgXUg/o3wRy1lVMsFeqWQRMvpAl3jUkpgsyVGo/Oq6XxQOd1Qa+9aqUzp7ce2m7XXHddaqUzZTLc+BPZkdtE8vaWT2e6tNY9NRCXezAf3nhLu9viVX7G3dpfX+zOKEXj56uH65xtTy00nZu7dW6rMjVcdUbV/hSo7+hPJbCK6NtEndI7wbwQAAhnw6/WC0Lm2XEa4ddprko7THOiaidlR3g4374UmsJjfoCi31muTiWFqf21J4uhjKkBCMQcCIBBo4z0x7ZKJ0fbpJFOgZSwqNvbmzn9fbf52iAVoVgTw6v/Juw86hEfgd6fGaH/PAce53+Z+dGwf1wnNthb27u323Xaoayw//XzOcfyuuEqPnszKS+i74qrj+MzMhJYBnwn4/vhZs0agu9/hQrGMAEAgAAIBEEhtk4nxsq0AGfWmpgF0kRZYgoQCAAAAgBOfAQwQ/8yGGfwkAAAAAElFTkSuQmCC';
/* 火車站下面的鐵軌（y19，x1~14）和停著的三節列車：紅車廂、藍車廂、綠色蒸汽火車頭（頭朝右，煙囪會冒煙）。畫在建築圖之後。 */
function stCar(x, y, col, dk) {
  ob(col, dk, x + 2, y + 8, 40, 16); r('#fdf3c8', x + 7, y + 11, 8, 6); r('#fdf3c8', x + 18, y + 11, 8, 6); r('#fdf3c8', x + 29, y + 11, 8, 6); r(dk, x + 2, y + 19, 40, 1);
  [8, 30].forEach(wx => { ob('#444', '#111', x + wx, y + 22, 8, 8); r('#bbb', x + wx + 3, y + 25, 2, 2); });
  r('#8a7a64', x, y + 26, 3, 2); r('#8a7a64', x + 41, y + 26, 3, 2);
}
function stLoco(x, y, now) {   // 經典蒸汽車頭，車頭朝左（圓頭燈、排障器在左邊，駕駛室在右邊）
  ob('#3f8a54', '#1e4a2c', x + 8, y + 12, 34, 12);
  ob('#2a2a2a', '#111', x + 2, y + 12, 7, 12); r('#ffe27a', x + 3, y + 15, 4, 5);
  ob('#333', '#111', x + 12, y + 4, 8, 9); r('#555', x + 10, y + 2, 12, 3);
  ob('#e8c14a', '#8a6a20', x + 24, y + 6, 6, 6);
  ob('#c8443a', '#6e2420', x + 40, y + 4, 19, 20); r('#6e2420', x + 38, y + 2, 23, 3); r('#fdf3c8', x + 45, y + 9, 9, 6);
  r('#555', x, y + 26, 8, 2); r('#555', x + 2, y + 24, 6, 2); r('#555', x + 4, y + 22, 4, 2);
  r('#e8c14a', x + 8, y + 18, 34, 1);
  [12, 26, 44].forEach(wx => { ob('#444', '#111', x + wx, y + 23, 8, 8); r('#bbb', x + wx + 3, y + 26, 2, 2); });
  for (let i = 0; i < 3; i++) { const ph = ((now / 1400) + i / 3) % 1; g.globalAlpha = .85 * (1 - ph); r('#f2f2f2', x + 14 - Math.round(ph * 6), y - Math.round(ph * 14), 5 - (ph > .6 ? 1 : 0), 4 - (ph > .6 ? 1 : 0)); }
  g.globalAlpha = 1;
}
function drawStationBldg(now, dark) {
  if (!stationOk) return;
  const by = (STB.y + STB.h + 1) * T + 4;   // 鐵軌（10px 高）的上緣
  r('rgba(107,72,72,.14)', STB.x * T + 3, (STB.y + STB.h) * T - 3, STB.w * T - 6, 3);
  r('#d8c9a4', STB.x * T, (STB.y + STB.h) * T, STB.w * T, T);   // 門前走道
  ctx.drawImage(STATION_IMG, STB.x * T, (STB.y + STB.h) * T - STATION_IMG.height);
  const X0 = 2 * T, ex = 12 * T;   // 鐵軌從地圖最左邊（穿過原本的那棵樹）一路鋪到最後一節車廂後面；車頭和兩節車廂中間有連結桿
  r('#8a7a64', 0, by, ex, 10);
  for (let x = 0; x < ex; x += 6) r('#6a4c30', x, by + 1, 3, 8);
  r('#b8b8c0', 0, by + 2, ex, 2); r('#b8b8c0', 0, by + 6, ex, 2);
  r('#9a7a4a', T, by - 3, T, 16); r('#7a5a30', T, by - 3, T, 1); r('#7a5a30', T, by + 12, T, 1); for (let x = T + 2; x < 2 * T; x += 5) r('#6a4a28', x, by - 3, 1, 16);   // 平交道木板
  stLoco(X0, by - 20, now || 0);
  stCar(X0 + 57, by - 18, '#4a6aa8', '#24386a'); stCar(X0 + 99, by - 18, '#b0523c', '#5e2418');
  r('#444', X0 + 58, by + 8, 4, 2); r('#444', X0 + 98, by + 8, 4, 2);
  if (dark > 0.15) {                                          // 夜間點燈：窗戶、鐘面、門旁兩盞燈、車頭燈；傍晚慢慢亮起來（和其他建築的窗光同一個曲線）
    const a = clamp((dark - 0.15) / 0.35, 0, 1), ox = STB.x * T, oy = (STB.y + STB.h) * T - STATION_IMG.height;
    [[19, 56], [29, 56], [73, 56], [83, 56]].forEach(([wx, wy]) => winGlow(ox + wx, oy + wy, 9, 12, a));
    winGlow(ox + 49, oy + 18, 13, 13, a * 0.8);
    [[13, 70], [97, 70]].forEach(([lx, ly]) => { r('rgba(255,217,138,' + (0.16 * a).toFixed(3) + ')', ox + lx - 6, oy + ly - 4, 20, 20); r('rgba(255,217,138,' + (0.3 * a).toFixed(3) + ')', ox + lx - 2, oy + ly, 12, 10); });
    r('rgba(255,236,170,' + (0.22 * a).toFixed(3) + ')', X0 - 14, by - 6, 22, 16); r('rgba(255,236,170,' + (0.32 * a).toFixed(3) + ')', X0 - 6, by - 4, 12, 10);   // 車頭燈
  }
}

/* ---------- 貓咪站長（廣場上的 NPC，16×16；橘虎斑貓、藍站長帽、藍背心、尾巴會搖、呼吸動畫）---------- */
function stationMasterArt(px, py, now) {
  const bob = Math.floor(now / 600) % 2, wag = Math.floor(now / 500) % 2, o = '#a8641e', fur = '#f0a04a';
  r('rgba(90,60,40,.18)', px + 3, py + 14, 10, 2);
  ob(fur, o, px + 12, py + 8 + wag, 3, 5); r(o, px + 13, py + 10 + wag, 1, 1); r('#fff0d0', px + 13, py + 8 + wag, 1, 1);   // 尾巴
  ob('#3b5b98', '#243a66', px + 4, py + 9 + bob, 8, 6); r('#ffffff', px + 7, py + 9 + bob, 2, 2); r('#243a66', px + 7, py + 11 + bob, 1, 4);
  [[6, 11], [6, 13], [9, 11], [9, 13]].forEach(([x, y]) => r('#ffd34d', px + x, py + y + bob, 1, 1));                          // 金釦子
  r(fur, px + 3, py + 14, 2, 1); r(fur, px + 11, py + 14, 2, 1);
  r(fur, px + 3, py + 1 + bob, 2, 3); r(fur, px + 11, py + 1 + bob, 2, 3); r('#ff9a8a', px + 4, py + 2 + bob, 1, 1); r('#ff9a8a', px + 11, py + 2 + bob, 1, 1);   // 尖耳朵
  ob(fur, o, px + 3, py + 3 + bob, 10, 7);
  r('#d8822e', px + 5, py + 3 + bob, 1, 2); r('#d8822e', px + 8, py + 3 + bob, 1, 1); r('#d8822e', px + 10, py + 3 + bob, 1, 2);   // 虎斑
  r('#fff0d0', px + 5, py + 7 + bob, 6, 3); r('#fff0d0', px + 7, py + 6 + bob, 2, 1); r('#e87a7a', px + 7, py + 7 + bob, 2, 1);
  r('#2a2a2a', px + 5, py + 5 + bob, 1, 2); r('#2a2a2a', px + 10, py + 5 + bob, 1, 2);
  r('#ff9a8a', px + 4, py + 7 + bob, 1, 1); r('#ff9a8a', px + 11, py + 7 + bob, 1, 1); r('rgba(255,255,255,.8)', px + 2, py + 7 + bob, 1, 1); r('rgba(255,255,255,.8)', px + 13, py + 7 + bob, 1, 1);
  ob('#2e4e90', '#1a2e5a', px + 4, py + bob, 8, 4); r('#1a2e5a', px + 3, py + 3 + bob, 10, 1); r('#ffd34d', px + 7, py + 1 + bob, 2, 2);   // 站長帽
}
function drawStationMaster(px, py, now) { stationMasterArt(px, py, now); }
function stationMasterPortrait(c2d, now) { g = c2d; c2d.clearRect(0, 0, 16, 16); stationMasterArt(0, 1, now || 0); g = ctx; }
