'use strict';
/* 咖啡廳的村民客人 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html（在 cafe.js 之後）。
   村裡的 NPC（村長、婆婆、老鯉叔、阿洛、小茉、桃子姊姊、阿剪師傅、阿杉師傅、旅行商人米羅）偶爾會走進咖啡廳當客人：
   ・外觀直接用村裡的原畫法（art/cafe.js 的 cfActor 遇到村民 key 會改用 npcArt），多人同步的快照也認得這些 key。
   ・每位村民有固定愛點的餐點、各自的口頭禪；進門、點餐、吃完、閒聊、離開都有不同的話。
   ・兩位村民同時在店裡時，偶爾會互相搭話（A 說完，過幾秒 B 回一句）。
   ・出現的頻率：店裡沒村民時，每次有新客人約 8% 機會是村民（至少隔 5 分鐘）；店裡已經有一位時，約 25% 機會再來第二位（至少隔 15 秒，且優先挑有搭話台詞的）；同時最多兩位，也不會連續是同一人。
   ・只是客人，跟其他 NPC 客人一樣不付錢；店員送餐的薪水照舊。對白每句請控制在 30 字內（多人同步時會被截在 40 字）。 */
const CF_VP = {
  oak: { n: '橡果村長', dish: 'americano', dd: '村長大人，今天也來視察嗎？',
    enter: ['我來視察一下，順便喝杯咖啡。', '這間店是我剪的綵，我得常來看看。'],
    order: ['一杯美式，不加糖，我是大人了。', '美式。要最苦的，才有開會的精神。'],
    thanks: ['嗯，苦得剛好……咳，好苦。', '這杯比村民大會還提神。'],
    chat: ['村裡要是在這開會，沒人想散會。', '剪綵那天，我的手抖了三次。', '我的帽子沒歪吧？', '這個位子，視野最適合偷懶。'],
    bye: ['我回去開會了，別想我。', '村子還在等我，先走啦。'] },
  gui: { n: '桂花婆婆', dish: 'pancake', dd: '婆婆來啦，鬆餅馬上好！',
    enter: ['這個香味，把我從家裡勾出來了。', '來來來，婆婆也來嚐嚐年輕人的店。'],
    order: ['來份鬆餅，蜂蜜要多一點。', '鬆餅一份，要比我孫子的手藝甜。'],
    thanks: ['嗯，蜂蜜放得剛剛好。', '外酥內軟，有我年輕時的味道。'],
    chat: ['現在的年輕人，都愛喝黑黑的水。', '想當年我的鬆餅，整條街都聞得到。', '豆豆啊，圍裙別綁太緊。', '小茉的牛奶最新鮮，記得跟她訂。'],
    bye: ['婆婆走囉，記得好好吃飯。', '鬆餅很好吃，明天還要來。'] },
  li: { n: '老鯉叔', dish: 'americano', dd: '老鯉叔，今天釣到大魚了嗎？',
    enter: ['剛從池塘過來，一身魚腥味，別介意。', '路過，進來暖暖手。'],
    order: ['給我最濃的，釣魚要熬夜。', '美式，越燙越好。'],
    thanks: ['嗯！跟魚上鉤一樣痛快！', '這杯下肚，連老鯉魚都不怕了。'],
    chat: ['我釣過的魚，比這個杯子還大。', '聽說池塘的老鯉魚今天心情不錯。', '你說咖啡能當魚餌嗎？', '釣魚的訣竅是，什麼都不想。'],
    bye: ['魚在等我，先走了。', '改天我釣條大的送來。'] },
  luo: { n: '阿洛', dish: 'latte', dd: '阿洛，今天礦坑還順利嗎？',
    enter: ['挖了一整天礦，渾身都是灰。', '先說好，我會把椅子坐黑。'],
    order: ['拿鐵，要熱的，礦坑裡太冷了。', '來杯拿鐵，奶多一點。'],
    thanks: ['暖到骨頭裡了。', '這比坑道裡的火把還暖。'],
    chat: ['坑道裡也該放一台咖啡機。', '我的安全帽呢？哦，戴著。', '礦石敲起來的聲音，比音樂好聽。', '那個鐵箱到底裝了什麼？'],
    bye: ['礦坑在叫我，走了。', '下次帶塊閃亮的礦給你。'] },
  mo: { n: '小茉', dish: 'pancake', dd: '小茉，今天的牛奶也是你送的嗎？',
    enter: ['我來偷看鬆餅怎麼做！', '牧場忙完啦，來犒賞自己。'],
    order: ['我要吃鬆餅！', '鬆餅鬆餅，還要淋很多蜂蜜！'],
    thanks: ['好好吃！我回去也要烤。', '甜甜的，心情都飛起來了。'],
    chat: ['豆豆的拿鐵，用的是我家的牛奶喔。', '我家的牛今天又偷吃了南瓜。', '祭典糕我一定要烤得更好。', '偷偷告訴你，我最愛這裡的鬆餅。'],
    bye: ['牛兒在等我，掰掰！', '明天我多送一桶牛奶來。'] },
  tao: { n: '桃子姊姊', dish: 'latte', dd: '桃子姊姊，今天是來量尺寸的嗎？',
    enter: ['我來看看豆豆圍裙的針腳。', '店休一下，換我來當客人。'],
    order: ['拿鐵，拉花要可愛一點。', '一杯拿鐵，我看看今天畫什麼。'],
    thanks: ['愛心拉得真勻，像縫線一樣。', '好喝，心情也被縫好了。'],
    chat: ['這件圍裙的領口，我能改得更可愛。', '咖啡漬最難洗，記得先泡冷水。', '婆婆的針腳，我到現在還追不上。', '誰要訂新衣服，我這裡排得很快。'],
    bye: ['布料在叫我，先回去了。', '圍裙破了記得找我。'] },
  jian: { n: '阿剪師傅', dish: 'americano', dd: '阿剪師傅，今天也要一杯美式？',
    enter: ['剪了一天頭髮，脖子快斷了。', '我來看看，店裡有沒有人需要整理。'],
    order: ['美式，越簡單越好。', '一杯美式，我不挑。'],
    thanks: ['嗯，乾淨俐落，我喜歡。', '這杯比剪刀還俐落。'],
    chat: ['蒸氣對瀏海不太好，大家小心喔。', '豆豆這個丸子頭，我給九十分。', '換個造型，連心情都會跟著換。', '我看誰頭髮亂，手就癢。'],
    bye: ['下一位客人在等，先走啦。', '想換造型，隨時來找我。'] },
  mu: { n: '阿杉師傅', dish: 'pancake', dd: '阿杉師傅，您做的高腳椅好舒服！',
    enter: ['來看看我做的椅子，被坐得怎麼樣。', '木屑都拍乾淨了，應該不會弄髒。'],
    order: ['鬆餅，我手上有木屑，你別介意。', '一份鬆餅，要切厚一點。'],
    thanks: ['嗯，鬆軟的程度，像剛刨好的木板。', '好吃，比我的手藝還細膩。'],
    chat: ['這張高腳椅是我做的，坐起來還行吧？', '圓桌有一點點不平，我下次來修。', '吧台的木紋，我挑了整整三天。', '有人想訂新家具，明天上架。'],
    bye: ['工坊的木頭在等我，先走。', '椅子鬆了就喊我，隨時來修。'] },
  milo: { n: '米羅', dish: 'latte', dd: '米羅，今天扛了什麼好東西來？',
    enter: ['路過，進來歇歇腳。', '山那邊的路好長，先喝一杯再走。'],
    order: ['拿鐵，我要帶一杯上路。', '一杯拿鐵，熱熱的最好。'],
    thanks: ['有它，路再遠也不怕。', '這杯，是我今年喝過最好的。'],
    chat: ['山那邊的咖啡豆，比這裡貴三倍。', '我走過很多地方，這裡的鬆餅最像家。', '背包裡的地毯，隨時可以鋪給你坐。', '下次帶新的豆子來，保證香。'],
    bye: ['下次帶新豆子給你。', '山在等我，後會有期。'] }
};
const CF_VKEYS = Object.keys(CF_VP);
const CF_VPAIR = {   // 'A>B'：A 對 B 說的話；兩位同時在店裡才會用到，A 說完過幾秒 B 若有回話就接著說
  'oak>gui': '婆婆，今天的鬆餅，有沒有多給我一塊？', 'gui>oak': '村長，你的咖啡見底了，開會別睡著。',
  'oak>li': '老鯉叔，上次那條大魚到底多大？', 'li>oak': '村長，你的帽子借我當魚簍好不好？',
  'li>mo': '小茉，你家牛奶可以拿來釣魚嗎？', 'mo>li': '老鯉叔，你身上有魚腥味耶！',
  'tao>gui': '婆婆，這杯敬你，謝謝你教我縫紉。', 'gui>tao': '桃子啊，那件歪針腳的我可看見了。',
  'jian>mu': '阿杉，你做的椅子，我幫你剪個頭髮吧？', 'mu>jian': '阿剪，你的剪刀借我削木頭好不好？',
  'luo>milo': '米羅，下次幫我帶條新的安全繩。', 'milo>luo': '阿洛，礦坑裡有賣咖啡豆的好貨嗎？',
  'mo>tao': '桃子姊姊，我的牧場圍裙破了，幫我補！', 'tao>mo': '小茉，你圍裙上有牛奶漬喔。',
  'oak>mu': '阿杉，咖啡廳的屋頂是你蓋的吧？', 'mu>oak': '村長，這回的工錢別再用南瓜抵了。',
  'gui>milo': '米羅，下回帶點好線給我。', 'milo>gui': '婆婆，你上次的鬆餅我還在想。'
};
const cfIsV = c => !!c && !!CF_VP[c.key];
const cfPickOf = a => a[Math.floor(Math.random() * a.length)];
/* 村民說一句話：頭上冒泡泡，也寫進聊天紀錄。kind：enter／order／thanks／chat／bye */
function cfVSay(c, kind) {
  const p = CF_VP[c && c.key]; if (!p || !p[kind] || !p[kind].length) return false;
  const t = cfPickOf(p[kind]); c.line = { txt: t, at: performance.now() }; cfChat(c.name, t); return true;
}
function cfVPick() {
  let ok = CF_VKEYS.filter(k => k !== cf.vLast && !cf.custs.some(c => c.key === k));
  const here = cf.custs.find(cfIsV);   // 店裡已經有一位時，優先找「有搭話台詞」的另一位來，這樣一定聊得起來
  if (here) { const pair = ok.filter(k => CF_VPAIR[here.key + '>' + k] || CF_VPAIR[k + '>' + here.key]); if (pair.length) ok = pair; }
  return ok.length ? cfPickOf(ok) : null;
}
/* 抽不抽村民：店裡沒村民時，隔 5 分鐘以上、約 8% 機會來第一位；店裡已經有一位時，隔 15 秒以上、約 25% 機會再來第二位（同時最多兩位） */
function cfVRoll() {
  const n = cf.custs.filter(cfIsV).length, since = cf.vAt == null ? 1e9 : cf.now - cf.vAt;
  if (n >= 2) return null;
  if (n === 1 ? (since < 15000 || Math.random() >= .25) : (since < 300000 || Math.random() >= .08)) return null;
  return cfVPick();
}
/* 店裡有兩位以上村民時互相搭話；成功回 true */
function cfVBanter(sit) {
  const vs = sit.filter(cfIsV); if (vs.length < 2) return false;
  const a = cfPickOf(vs), others = vs.filter(o => o !== a && CF_VPAIR[a.key + '>' + o.key]); if (!others.length) return false;
  const b = cfPickOf(others), t = CF_VPAIR[a.key + '>' + b.key];
  a.line = { txt: t, at: performance.now() }; cfChat(a.name, t);
  const back = CF_VPAIR[b.key + '>' + a.key]; if (back) cf.vq = { c: b, t: back, at: cf.now + 2600 };
  return true;
}
function cfVQueueTick() {
  const q = cf.vq; if (!q || cf.now < q.at) return;
  cf.vq = null; if (!cf.custs.includes(q.c) || q.c.state === 'out' || q.c.state === 'gone') return;
  q.c.line = { txt: q.t, at: performance.now() }; cfChat(q.c.name, q.t);
}
