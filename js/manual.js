'use strict';
/* 遊戲手冊 —— 雷克斯農場。章節目錄 → 點進去看「截圖＋編號標註＋說明」。所有檔案共用同一個全域範圍，載入順序見 index.html。
   截圖放在 img/manual/<章節 id>.jpg；img 寫成 'art:xxx' 的是用程式畫的示意圖（manual-art.js，出海團、寵物）。沒有截圖時會顯示「截圖準備中」，標註說明還是看得到。
   標註 marks 的 x、y 是百分比（0～100，左上角為 0,0）。想量座標：在瀏覽器主控台輸入 localStorage.mn_dev = 1 再重新整理，
   手冊裡點截圖會跳出該點的 x、y，直接抄進下面的 marks。 */
const MN = [
  { id: 'farm', ic: '🌱', n: '種田與澆水', c: '#e6f6ec', e: '#bfe5cb',
    d: '作物依真實時間成長（蘿蔔約 30 分鐘），關掉遊戲也會繼續長。晴天要澆水；下雨和下雪會自動澆水。成熟後面向作物按「動作」收成。',
    shots: [{ img: 'farm', marks: [{ x: 52, y: 21, t: '粉紅角框是你面向的那一格，動作鍵就作用在這一格' }, { x: 56, y: 71, t: '目前拿著的工具：這裡是鋤頭（1 號格）。面向草地按動作就能翻土' }, { x: 24, y: 70, t: '浮動搖桿：手按在左半邊畫面任何地方就會出現，拖著走動（電腦用方向鍵或 WASD）' }, { x: 81, y: 73, t: '動作鍵：翻土、播種、澆水、收成都按它' }] },
    { img: 'farm2', marks: [{ x: 56, y: 80, t: '換成種子：左上角數字是快捷列格子，×84 是持有數量' }, { x: 50, y: 29, t: '面向田，按動作播種；成熟後同樣面向它按動作收成' }, { x: 58, y: 94, t: '選單上的數字，是好友、信箱、任務的通知加總' }] }] },
  { id: 'fish', ic: '🎣', n: '釣魚', c: '#e4f1fb', e: '#b9dcf2',
    d: '選「釣竿」，面向池塘按「動作」拋竿；看到紅色驚嘆號時馬上再按一次拉竿，太早或太慢魚會跑掉。釣到的魚會記進圖鑑。',
    shots: [{ img: 'fish', marks: [{ x: 63, y: 32, t: '站在池塘邊，面向水面（粉紅角框落在水上）' }, { x: 55, y: 80, t: '先選好釣竿（這裡在快捷列 4 號格）' }, { x: 81, y: 82, t: '按動作拋竿；出現紅色驚嘆號時，馬上再按一次拉竿' }, { x: 81, y: 55, t: '水邊的蟲，用捕蟲網抓，抓到會記進圖鑑' }] }] },
  { id: 'voyage', ic: '⛵', n: '出海團', c: '#e4f1fb', e: '#b9dcf2',
    d: '廣場右下角的柴犬船長可以開團：第 1／2／3 次要付 500／800／1000 G（一天最多 3 次），客人免費加入，最多 8 人。集合 5 分鐘，船長按出發（所有客人要先按準備）。航行 5 分鐘，站在欄杆邊面向海面按動作鍵拋竿，魚咬鉤後進入拉扯：按住收線，張力維持在綠區讓進度填滿，魚猛拉前會有警告，張力爆表線就斷了。第 4 分鐘會抽一次神秘路線（多 5 分鐘），小航海和遠洋 10%、第 3 次的大航海 30%。每趟每 5 分鐘最多釣 10 條，傳說魚會公告全服。',
    shots: [{ img: 'art:voyage', marks: [{ x: 72, y: 37, t: '站在欄杆邊面向海面（粉紅角框落在水上），按動作鍵拋竿' }, { x: 76, y: 15, t: '出現黃色驚嘆號就是魚咬鉤了，再按動作進入拉扯：按住收線，張力維持在綠區' }, { x: 48, y: 62, t: '柴犬船長和客人都在甲板上，最多 8 人；船艙和浮球是裝飾，走不進去' }] }] },
  { id: 'house', ic: '🏠', n: '回家布置', c: '#fff3d6', e: '#f2dc9c',
    d: '走到房子門前按「動作」進屋，可換牆面和地板、擺家具。家具要到小村右上角的家具店買，每天上架的都不一樣。',
    shots: [{ img: 'house', marks: [{ x: 50, y: 57, t: '大門：走到粉紅門墊上，面向門按動作就能進屋布置' }] }] },
  { id: 'cook', ic: '🍳', n: '做料理', c: '#fdeee4', e: '#f3c9ad',
    d: '家裡擺一台「廚房灶台」，走到旁邊按「動作」打開廚房。共三段：按住「動作」加熱，指針進到綠區就放開。失誤太多會煮糊，走開就取消，材料不會消耗。做好的料理可以吃（有加成）、賣錢或交委託。',
    shots: [{ img: 'cook', marks: [{ x: 58, y: 21, t: '火候錶：按住「動作」加熱，指針進到綠區就放開' }, { x: 21, y: 70, t: '站在灶台旁，面向它按動作，打開廚房選料理' }] }] },
  { id: 'shop', ic: '🛒', n: '雜貨攤', c: '#fff3d6', e: '#f2dc9c',
    d: '農場上方小路旁的柴犬雜貨攤：買種子、賣作物和魚。數量可直接點 1、5、10 設成那個數量（也可以按「全賣」）；每種東西最多持有 999 個。庭院裝飾和工具升級要到小村的村長家。',
    shots: [{ img: 'shop', marks: [{ x: 47, y: 58, t: '柴犬雜貨攤：站在攤位前面，面向它按動作' }] }] },
  { id: 'village', ic: '🏘️', n: '雷克斯小村', c: '#fbe8f0', e: '#f2bfd2',
    d: '農場左邊（西邊）的大門通往小村，村裡有居民、布告欄和旅行商人。頭上有黃色「！」的居民有故事要告訴你，走近按「動作」對話。',
    shots: [{ img: 'village', marks: [{ x: 69, y: 28, t: '頭上有黃色「！」的居民，有故事要告訴你，走近按動作' }, { x: 4, y: 76, t: '布告欄' }] }] },
  { id: 'board', ic: '📋', n: '布告欄與委託', c: '#e6f6ec', e: '#bfe5cb',
    d: '布告欄每週更新一次委託，交付作物或料理可得金幣，還能拿玩家經驗。「故事」分頁會記錄劇情進度，並提示下一位該去找誰；已完成的章節會變成一張張回憶 CG，點開就能重看，也可以從頭連播。',
    shots: [{ img: 'board', marks: [{ x: 31, y: 73, t: '小村的布告欄：站在旁邊，面向它按動作，看本週委託和故事進度' }] }] },
  { id: 'barn', ic: '🐔', n: '動物牧場', c: '#f3ecdc', e: '#e0d2b0',
    d: 'Lv.2 解鎖：走進農場上方的穀倉，飼料槽餵乾草、收成籃收蛋奶毛。買動物和乾草要到小村牧場小屋找小茉（養雞，牛 Lv.3、羊 Lv.5）。',
    shots: [{ img: 'barn', marks: [{ x: 38, y: 40, t: '穀倉大門：沿著小路走到門前，面向大門按動作進去' }] }] },
  { id: 'merchant', ic: '🧳', n: '旅行商人', c: '#fdeee4', e: '#f3c9ad',
    d: '米羅只在週五、六、日出現。今天的商品有稀有種子和商人專屬家具；「高價收購」每天收一種東西，價格是原價的 1.6 倍，有每日上限。',
    shots: [{ img: 'merchant', marks: [{ x: 58, y: 65, t: '商人攤位' }, { x: 79, y: 66, t: '米羅：面向他或攤位按動作，看今天賣什麼、收什麼' }] }] },
  { id: 'tools', ic: '🧰', n: '工具與快捷列', c: '#e4f1fb', e: '#b9dcf2',
    d: '工具有鋤頭、水壺、釣竿、捕蟲網、鎬子、斧頭。庭院佈置改成右側功能列的「🏡 庭院」按鈕。快捷列有 1～6 號格、分三組，換法在背包裡。鎬子可敲礦石（Lv.4 解鎖山洞）；「肥料」讓收成更容易出高星（作物圖鑑的品質 ★1～★5），特定作物能雜交出新品種；庭院佈置能在農場擺裝飾（Lv.2 解鎖）。',
    shots: [{ img: 'bag', marks: [{ x: 74, y: 17, t: '快捷列分成第 1、2、3 組，點這裡切換' }, { x: 96, y: 24, t: '換快捷列的方法：先點下面的工具或種子，再點上面的格子放進去' }, { x: 96, y: 33, t: '快捷列的 1～6 號格，就是遊戲畫面下方那一排' }, { x: 96, y: 49, t: '工具：鋤頭、水壺、釣竿、捕蟲網、鎬子、庭院佈置' }, { x: 96, y: 80, t: '種子：下面有持有數量和成熟時間' }] },
    { img: 'tools', marks: [{ x: 15, y: 46, t: '選到的工具有粉紅框，這是 1 號格的鋤頭' }, { x: 75, y: 46, t: '種子也能放進快捷列，右下角是持有數量' }, { x: 88, y: 46, t: '「組 1/3」：點它切換快捷列的組別' }, { x: 27, y: 17, t: '野外的蟲（瓢蟲），用捕蟲網抓，抓到會記進圖鑑' }] }] },
  { id: 'dock', ic: '📱', n: '選單與好友', c: '#f3ecdc', e: '#e0d2b0',
    d: '手機上點畫面下方的「選單」，就會跳出這一排按鈕：背包、好友、信箱、圖鑑、任務、等級、名片、設定、聊天表情、手冊。電腦版放在畫面右邊，可以收起來。可以拜訪好友的家，也能在他的餐桌上吃東西。',
    shots: [{ img: 'dock', marks: [{ x: 7, y: 8.3, t: '背包' }, { x: 30.7, y: 8.3, t: '好友：拜訪好友的家，也能在他的餐桌上吃東西' }, { x: 54.3, y: 8.3, t: '信箱：寄、收明信片（寄 1～10 金幣）' }, { x: 78, y: 8.3, t: '圖鑑：魚和蟲' }, { x: 7, y: 40.5, t: '任務（有新通知時，右上角會出現數字）' }, { x: 30.7, y: 40.5, t: '等級與解鎖' }, { x: 54.3, y: 40.5, t: '名片' }, { x: 78, y: 40.5, t: '設定' }, { x: 7, y: 72.7, t: '聊天表情' }, { x: 30.7, y: 72.7, t: '手冊：就是你現在看的這一本' }] }] },
  { id: 'pet', ic: '🐾', n: '寵物與朋友的寵物', c: '#fdeee6', e: '#f5cdb8',
    d: '右邊快捷列的「🐾 寵物」資料卡可以摸摸、餵食自己的寵物，自己摸摸時，同一個地方的朋友也會看到牠開心跳一下、飄愛心。面向朋友的寵物按動作鍵，就能摸摸牠：寵物會跳起來飄愛心，你頭上也會冒小愛心，在場的人都看得到。摸朋友的寵物只有表情和愛心，不會增加親密度，也沒有次數限制。',
    shots: [{ img: 'art:pet', marks: [{ x: 48, y: 52, t: '朋友的寵物：面向牠按動作鍵就能摸摸，牠會跳起來飄愛心（只有表情，不增加親密度）' }, { x: 24, y: 22, t: '摸的時候你頭上也會冒小愛心，在場的人都看得到' }, { x: 11, y: 57, t: '自己的寵物：右邊快捷列的「🐾 寵物」資料卡可以摸摸、餵食' }] }] },
  { id: 'plaza', ic: '⛲', n: '廣場', c: '#fbe8f0', e: '#f2bfd2',
    d: '農場右邊的大門通往廣場，能聊天、釣魚、交朋友。',
    shots: [{ img: 'plaza', marks: [{ x: 50, y: 63, t: '廣場中央的噴水池' }, { x: 50, y: 7, t: '紫色水晶球帳篷' }, { x: 92, y: 98, t: '聊天按鈕，跟廣場上的人說話' }] }] },
  { id: 'cafe', ic: '☕', n: '咖啡廳', c: '#f3ecdc', e: '#e0d2b0',
    d: '廣場上的暖木小木屋咖啡廳，走到門口按「動作」進店。想吃喝：面向高腳椅按動作坐下點餐（美式 80 G、拿鐵 120 G、蜂蜜鬆餅 130 G），點餐先扣款，送到才算數，中途離開會退款；送到後會有喝下去的光環特效，還會得到 15 分鐘的效果：美式咖啡＝走路變快、拿鐵＝釣魚運氣變好、蜂蜜鬆餅＝捕蟲網變大；同一種再喝會續杯累加，最多累積 60 分鐘（試營運時只有特效）。沙發和圓桌可以坐下休息，點唱機有 10 首歌可以點，點一首 100 G（停歌免費），點的歌全店同步。想打工：從吧台右邊的小門穿上圍裙進操作間，自己磨豆、煮咖啡、烤鬆餅（磨豆和洗杯要按住動作鍵，煮太久會焦），端到出餐口送出一杯，就領飲料價 10% 的薪水，每天最多 1000 G（GMT+8 零點重置）。第一次進店會自動播開幕故事，之後可以在穿圍裙窗口重看。',
    tip: '用完的髒杯子丟進 7 洗杯池，按住動作鍵洗乾淨（豆豆也會幫忙）。焦掉的要空手面對機器清掉。放錯東西丟 8 垃圾桶。',
    shots: [{ img: 'art:cafe', marks: [{ x: 41, y: 6, t: '菜單黑板：美式 80 G、拿鐵 120 G、蜂蜜鬆餅 130 G' }, { x: 40, y: 47, t: '高腳椅：面向空椅子按動作坐下，跳出點餐窗；點餐先扣款，送到才算數，中途離開會退款' }, { x: 20, y: 66, t: '圓桌和沙發：坐下休息用（按方向鍵起身），不必點餐' }, { x: 90, y: 43, t: '點唱機：面向它按動作點歌（一首 100 G），全店聽同一首，客人耐心 +10 秒' }, { x: 59, y: 41, t: '吧台小門：想打工，走到這扇門穿上圍裙進操作間' }, { x: 28, y: 27, t: '操作間：店員做飲料的地方，沒有玩家時由豆豆自己接單' }] },
    { img: 'art:cafekit', marks: [{ x: 13.6, y: 17.3, t: '咖啡豆箱：拿咖啡豆' }, { x: 22.7, y: 17.3, t: '牛奶箱：拿牛奶' }, { x: 31.8, y: 17.3, t: '麵糰箱：拿麵糰' }, { x: 45.5, y: 16.5, t: '磨豆機：放豆、按住動作鍵磨' }, { x: 63.6, y: 23, t: '咖啡機：放磨好的豆和牛奶' }, { x: 81.8, y: 15.4, t: '烤箱：放麵糰烤鬆餅' }, { x: 13.6, y: 63.5, t: '洗杯池：放髒杯子、按住洗' }, { x: 22.7, y: 63.5, t: '垃圾桶：丟掉拿錯的東西' }, { x: 31.8, y: 63.5, t: '杯架：拿乾淨的杯子' }, { x: 45.5, y: 78.8, t: '出餐口：端飲料放這裡送客人' }] },
    { img: 'art:cafeam', marks: [{ x: 20.6, y: 17, t: '咖啡豆箱：拿咖啡豆（一次一個）' }, { x: 35.0, y: 17, t: '磨豆機：放進去按住動作鍵磨，磨好再按一下拿起' }, { x: 49.4, y: 17, t: '咖啡機：放進磨好的豆，放滿 2 份自動開始煮' }, { x: 63.7, y: 17, t: '杯架：拿乾淨的杯子' }, { x: 78.1, y: 17, t: '面對咖啡機按動作，用杯子盛起（太久會焦）' }, { x: 92.5, y: 17, t: '出餐口：端過去送客人' }] },
    { img: 'art:cafela', marks: [{ x: 20.6, y: 17, t: '咖啡豆箱：拿咖啡豆' }, { x: 35.0, y: 17, t: '磨豆機：磨 1 份豆（按住動作鍵）' }, { x: 49.4, y: 17, t: '咖啡機：放進磨好的豆' }, { x: 63.7, y: 17, t: '牛奶箱：拿牛奶，也放進咖啡機，兩樣到齊就開始煮' }, { x: 78.1, y: 17, t: '杯架：拿杯子，煮好盛起' }, { x: 92.5, y: 17, t: '出餐口：端過去送客人' }] },
    { img: 'art:cafepa', marks: [{ x: 20.6, y: 17, t: '麵糰箱：拿麵糰' }, { x: 35.0, y: 17, t: '烤箱：直接放進去，自動開始烤' }, { x: 49.4, y: 17, t: '杯架：拿盤子，烤好立刻盛起（太久會焦）' }, { x: 63.7, y: 17, t: '出餐口：端過去送客人' }] }] },
];
const mnSrc = img => /^art:/.test(img) ? (typeof mnArtSrc === 'function' ? mnArtSrc(img.slice(4)) : '') : 'img/manual/' + img + '.jpg';   // art:xxx ＝ 用程式畫的示意圖（manual-art.js），其他是 img/manual 裡的截圖
const mnEl = $('mnm'), mnCard = $('mncard');
let mnCh = -1, mnFrom = null;   // mnFrom：從別的視窗（例如咖啡廳穿圍裙窗）跳進來時，關掉手冊要做的事
function openManual(i, from) {
  if (!ready || !me || authOpen || mnOpen) return;
  if (paused()) return;
  mnFrom = typeof from === 'function' ? from : null;
  mnOpen = true; pressed.length = 0; mnCh = typeof i === 'number' ? i : -1; renderManual(); mnEl.hidden = false; mnCard.focus();
}
function closeManual() { mnOpen = false; mnEl.hidden = true; const f = mnFrom; mnFrom = null; if (f) f(); }
/* 一張「截圖＋編號標註＋編號說明」。手冊和咖啡廳「穿上圍裙」窗共用同一份 shots 資料與這兩個函式，改內容只要改 MN。 */
function mnShotHTML(sh, c) {
  const pins = sh.marks.map((m, k) => '<i class="mn-pin" style="left:' + m.x + '%;top:' + m.y + '%">' + (k + 1) + '</i>').join('');
  return '<div class="mn-shotw"><div class="mn-shot" style="border-color:' + c.e + '"><img src="' + mnSrc(sh.img) + '" alt="' + esc(c.n) + '截圖">' + pins + '<span class="mn-miss">截圖準備中</span></div></div>' +
    '<ol class="mn-leg">' + sh.marks.map((m, k) => '<li><i>' + (k + 1) + '</i><span>' + esc(m.t) + '</span></li>').join('') + '</ol>';
}
function mnWireImgs(root) {
  root.querySelectorAll('img').forEach(im => {
    const done = ok => {
      const box = im.closest('.mn-shot, .mn-th'); if (!box) return;
      box.classList.toggle(ok ? 'ok' : 'no', true);
      if (ok && im.naturalWidth < 500) im.classList.add('px');
      if (ok && box.classList.contains('mn-shot')) box.style.width = Math.min(im.naturalWidth * 3, 560) + 'px';
    };
    if (im.complete) done(im.naturalWidth > 0);
    im.addEventListener('load', () => done(true)); im.addEventListener('error', () => done(false));
  });
}
const mnDev = () => { try { return localStorage.getItem('mn_dev') === '1'; } catch (e) { return false; } };
function renderManual() {
  if (mnCh < 0) {
    mnCard.innerHTML = '<div class="shop-h"><h2>遊戲手冊</h2></div><p class="empty">想看哪一章？</p>' +
      '<div class="mn-grid">' + MN.map((c, i) =>
        '<button type="button" class="mn-tile" data-a="open" data-i="' + i + '" style="background:' + c.c + ';border-color:' + c.e + '">' +
        '<span class="mn-th">' + (c.shots[0] ? '<img src="' + mnSrc(c.shots[0].img) + '" alt="" loading="lazy">' : '') + '<b>' + c.ic + '</b></span><span class="mn-tn">' + esc(c.n) + '</span></button>').join('') + '</div>' +
      '<div class="mn-foot"><button type="button" class="btn ghost" data-a="close">關閉</button></div>';
  } else {
    const c = MN[mnCh];
    const shots = c.shots.map(sh => mnShotHTML(sh, c)).join('');
    mnCard.innerHTML = '<div class="shop-h"><button type="button" class="btn small" data-a="back">‹ 目錄</button><h2>' + esc(c.ic + ' ' + c.n) + '</h2><span class="mn-pg">' + (mnCh + 1) + '/' + MN.length + '</span></div>' +
      shots + '<p class="mn-d">' + esc(c.d) + '</p>' + (c.tip ? '<p class="mn-d">' + esc(c.tip) + '</p>' : '') +
      '<div class="mn-foot"><button type="button" class="btn small"' + (mnCh <= 0 ? ' disabled' : '') + ' data-a="prev">‹ 上一章</button><button type="button" class="btn ghost" data-a="close">關閉</button><button type="button" class="btn small"' + (mnCh >= MN.length - 1 ? ' disabled' : '') + ' data-a="next">下一章 ›</button></div>';
  }
  mnWireImgs(mnCard);
  mnCard.scrollTop = 0;
}
mnCard.addEventListener('click', e => {
  const sh = e.target.closest('.mn-shot');
  if (sh && mnDev() && !e.target.closest('button')) {
    const r = sh.getBoundingClientRect();
    toast('x: ' + Math.round((e.clientX - r.left) / r.width * 100) + '　y: ' + Math.round((e.clientY - r.top) / r.height * 100), 4000); return;
  }
  const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return;
  const a = b.dataset.a;
  if (a === 'close') closeManual();
  else if (a === 'open') { mnCh = +b.dataset.i; renderManual(); }
  else if (a === 'back') { mnCh = -1; renderManual(); }
  else if (a === 'prev') { mnCh = Math.max(0, mnCh - 1); renderManual(); }
  else if (a === 'next') { mnCh = Math.min(MN.length - 1, mnCh + 1); renderManual(); }
});
mnEl.addEventListener('click', e => { if (e.target === mnEl) closeManual(); });
