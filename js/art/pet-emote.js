/* 寵物表情氣泡（白色圓氣泡）：8×8 像素圖示 */
const PET_EM = [
  { k: 'love', n: '愛心', when: '被摸摸、親密度上升', p: ['.xx.xx..', 'xwxxxxx.', 'xxxxxxx.', '.xxxxx..', '..xxx...', '...x....'], c: { x: '#ff6f91', w: '#ffd0dc' } },
  { k: 'yum', n: '好吃', when: '吃飼料時', p: ['..mmm...', '.mmmmm..', '.mmmmm..', '..mmmw..', '...www..', '....wbw.', '.....bb.'], c: { m: '#c0643a', w: '#fff3d6', b: '#d8c8a8' } },
  { k: 'hungry', n: '肚子餓', when: '飽足時間用完、碗裡沒飼料', p: ['........', '.d....d.', 'bbbbbbbb', 'b......b', '.b....b.', '..bbbb..'], c: { b: '#3f6fa0', d: '#7fb7e8' } },
  { k: 'sleepy', n: '想睡', when: '站著不動 20 秒以上', p: ['zzzz.zz.', '..z...z.', '.z...zz.', 'zzzz....', '........', '........'], c: { z: '#7a8fe0' } },
  { k: 'happy', n: '開心', when: '玩玩具、心情好', p: ['...xxx..', '...x..x.', '...x....', '...x....', '.xxx....', 'xxxx....', '.xx.....'], c: { x: '#ffb347' } },
  { k: 'alert', n: '驚訝', when: '主人突然回來、被嚇到', p: ['..xx....', '..xx....', '..xx....', '..xx....', '........', '..xx....'], c: { x: '#ff5a5a' } },
  { k: 'curious', n: '好奇', when: '看到新家具、新朋友', p: ['.xxxx...', 'xx..xx..', '....xx..', '...xx...', '..xx....', '........', '..xx....'], c: { x: '#58a8ff' } },
  { k: 'sweat', n: '玩累了', when: '今天玩玩具的次數用完', p: ['...x....', '..xx....', '..xxx...', '.xxxx...', '.xwxx...', '..xx....'], c: { x: '#7fd3ff', w: '#e6f8ff' } },
  { k: 'angry', n: '不爽', when: '一直被摸太多次', p: ['x.x..x.x', '.xx..xx.', 'x.x..x.x', '........'], c: { x: '#ff5a5a' } },
  { k: 'ball', n: '想玩', when: '主人在家、閒著沒事', p: ['..xxxx..', '.xxxxxx.', '.wwwwww.', '.xxxxxx.', '..xxxx..'], c: { x: '#ff7a6c', w: '#ffd34d' } },
  { k: 'star', n: '親密升級', when: '親密度跨過 10 的倍數', p: ['...x....', '...x....', 'xxxxxxx.', '.xxxxx..', '..xxx...', '.xx.xx..', '.x...x..'], c: { x: '#ffd34d' } },
  { k: 'dots', n: '發呆', when: '站著放空', p: ['........', '........', 'x..x..x.', '........'], c: { x: '#8a7a70' } },
];

const PET_EMO = {}; PET_EM.forEach(e => { PET_EMO[e.k] = e; });
/* ox, oy＝氣泡左上角（世界像素）；氣泡 14×13 加底下一個小尾巴 */
function petEmoDraw(k, ox, oy) {
  const e = PET_EMO[k]; if (!e) return;
  rr('#d9667f', ox, oy, 14, 13); rr('#ffffff', ox + 1, oy + 1, 12, 11); r('#d9667f', ox + 3, oy + 12, 3, 2); r('#ffffff', ox + 4, oy + 12, 1, 1);
  e.p.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') r(e.c[ch] || e.c.x, ox + 3 + x, oy + 2 + y, 1, 1); }));
}
