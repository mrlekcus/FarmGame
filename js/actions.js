'use strict';
/* 動作 —— 雷克斯農場。所有檔案共用同一個全域範圍，載入順序見 index.html。 */
/* ---------- 動作 ---------- */
/* 從面向的那一格開始，沿著面向方向排成一直線的 n 格（鋤頭、水壺升級後一次處理多格） */
function lineTiles(x, y, n) {
  const d = DIRS[pl.face], out = [];
  for (let i = 0; i < n; i++) { const tx = x + d[0] * i, ty = y + d[1] * i; if (tx >= 0 && ty >= 0 && tx < W && ty < H) out.push([tx, ty]); }
  return out;
}
/* 鋤一格：mode = 'till' 只翻還沒翻的草地、'untill' 只把空田翻回草地（多格時由第一格決定，不會一排裡翻來翻去） */
function hoeOne(x, y, mode, loud) {
  if (K[y][x] !== G) return false;
  const key = pk(x, y), p = plots.get(key);
  if (mode === 'till' && !p) {
    if (yardMap.has(key)) { if (loud) pop(x, y, '這格有庭院裝飾，先收回才能翻土', '#ffb3a8'); return false; }   // 田區裡也能擺木欄了：鋤頭不能把有裝飾的格子翻成田
    if (!farmable(x, y)) { if (loud) pop(x, y, '這裡不能耕種', '#ffb3a8'); return false; }
    if (plots.size >= plotCap()) { if (loud) pop(x, y, '田地到上限了（玩家升級會增加）', '#ffb3a8'); return false; }
    plots.set(key, { crop: null, grown: 0, tick: srvNow(), wet: null }); dust(x, y);
    act2('till', { p_x: x, p_y: y }); return true;
  }
  if (mode === 'untill' && p && !p.crop) { plots.delete(key); dust(x, y); act2('untill', { p_x: x, p_y: y }); return true; }
  return false;
}
function canOne(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const p = plots.get(pk(x, y));
  if (!p || isWet(p)) return false;
  settleLocal(p); p.wet = srvNow() + cfg.wet_s * 1000; drops(x, y);
  act2('water', { p_x: x, p_y: y }); qAdd('water'); return true;
}
/* 種一格：回傳 true 代表真的種下去了；多格時只有第一格(loud)會跳出錯誤提示 */
function plantOne(x, y, kk, loud) {
  if (x < 0 || y < 0 || x >= W || y >= H || K[y][x] !== G) return false;
  const p = plots.get(pk(x, y));
  if (!p) { if (loud) pop(x, y, '先用鋤頭翻土', '#ffffff'); return false; }
  if (p.crop) { if (loud) pop(x, y, '這裡已經有作物', '#ffffff'); return false; }
  if (have('s:' + kk) <= 0) { if (loud) pop(x, y, '沒有種子了，去雜貨攤買', '#ffb3a8'); return false; }
  inv['s:' + kk] = have('s:' + kk) - 1;
  p.crop = kk; p.grown = 0; p.tick = srvNow(); p.fert = 0;
  dust(x, y); pop(x, y, '種下' + CROPS[kk].n, '#c9f0a8');
  act2('plant', { p_x: x, p_y: y, p_crop: kk }); qAdd('plant'); return true;
}
/* 收成升級：沿面向方向這一排裡「已經熟了」的格子（第一格不一定要熟） */
function ripeLine(x, y) {
  return lineTiles(x, y, toolN(toolLv.harvest | 0 || 1)).filter(([tx, ty]) => { const q = plots.get(pk(tx, ty)); return q && K[ty][tx] === G && ripeNow(q); });
}
/* 一次收一排：畫面上的 +N、★ 提示合併成一個，不會同時冒出一堆 */
function harvestLine(x, y) {
  const tiles = ripeLine(x, y); if (!tiles.length) return false;
  const bt = { x: tiles[0][0], y: tiles[0][1], left: tiles.length, got: {}, rolls: [] };
  tiles.forEach(([tx, ty]) => harvestOne(tx, ty, plots.get(pk(tx, ty)), bt));
  return true;
}
function harvestSummary(bt) {
  const keys = Object.keys(bt.got); if (!keys.length) return;
  pop(bt.x, bt.y, keys.map(c => '+' + bt.got[c] + ' ' + CROPS[c].n).join('、'), '#fff3b0');
  Promise.all(bt.rolls).then(rs => {
    rs = rs.filter(o => o && o.s); if (!rs.length) return;
    const best = rs.reduce((m, o) => o.s.star > m.s.star ? o : m);
    pop(bt.x, bt.y - 0.7, (rs.length > 1 ? '最高 ' : '') + '★'.repeat(best.s.star), best.s.star >= 5 ? '#ffd23a' : '#f0a020');
    const up = {};
    rs.forEach(o => { if (o.s.up && o.s.star > 1 && (!up[o.c] || o.s.star > up[o.c])) up[o.c] = o.s.star; });
    Object.keys(up).forEach(c => toast(CROPS[c].n + ' ' + starsText(up[c]) + '（' + STAR_N[up[c]] + '）圖鑑新高！', 2200));   // 每種作物只提示一次（取最高星）
    if (dexOpen) renderDex();
  });
}
/* 收一格：熟了才收，回傳 true 代表有收成。bt 是這一排共用的合併資料（單格也走同一條路） */
function harvestOne(x, y, p, bt) {
  if (!ripeNow(p)) return false;
  bt = bt || { x, y, left: 1, got: {}, rolls: [] };
  const c = p.crop, fertUsed = (p.fert | 0) > 0;
  p.crop = null; p.grown = 0; p.tick = srvNow(); p.fert = 0;
  sparkle(x, y, CROPS[c].c);
  const fin = () => { if (--bt.left === 0) harvestSummary(bt); };   // 成功、失敗都要算一次，才不會卡住合併提示
  act2('harvest', { p_x: x, p_y: y }, r => {
    bt.got[c] = (bt.got[c] | 0) + 1;
    if (typeof cropMarkSeen === 'function') cropMarkSeen(c);
    bt.rolls.push(starRoll('crop', c, { perfect: fertUsed }).then(s => ({ c, s })));   // 每格照樣各抽一次星級，只是提示合併
    if (r && r.drop && CROPS[r.drop]) { toast('相鄰的作物雜交了！得到「' + CROPS[r.drop].n + '」種子'); sparkle(x, y, CROPS[r.drop].c); }
    fin();
  }, e => {
    fin();
    if (e && /not_ready/.test(String(e.message || e.code || e))) { noPrecip = true; return true; }   // 悄悄以伺服器為準，不再顯示矛盾的提示
  });
  qAdd('harvest'); return true;
}
function act() {
  if (vfOn) { vfPress(); return; }                 // 出海團拉扯小遊戲：動作鍵＝切換收線
  if (fpOpen()) { closeFriendPop(); return; }   // 互動浮窗開著時再按動作鍵＝收起來
  if (pose) { standUp(); return; }
  if (cooking) { cookAct(); return; }
  const [x, y] = facing();
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  if (scene === 'plaza') {
    const k2 = K[y][x], rp = remoteAt(x, y);
    if (catchShown) { hideCatch(); return; }
    if (fishing) { fishAct(); return; }
    if (k2 === GT) leaveVillage();
    else if (k2 === SWG) { if (!featLocked('swamp', x, y)) enterSwamp(); }
    else if (k2 === SWS) toast('告示牌：霧語小徑（玩家 Lv.' + featNeed.swamp + ' 才能通過）——石拱門後面是一片被霧籠罩的沼澤，有外面看不到的魚和蟲蝶。');
    else if (k2 === SWP) pop(x, y, '古老的石柱', '#ffffff');
    else if (k2 === WA && curTool().id === 'rod') startFish(x, y);
    else if (k2 === WA) pop(x, y, '這是池塘（換成釣竿就能釣魚）', '#cfe8f7');
    else if (k2 === BN) takeBench(x, y);
    else if (rp) openFriendPop(rp);
    else if (k2 === TS) enterLekcus();
    else if (k2 === CFD) enterCafe();
    else if (k2 === GSD) enterArcade();
    else if (k2 === TPD) enterTemple();
    else if (k2 === CHD) enterChurch();
    else if (k2 === CKP) campCook(x, y);
    else if (k2 === CMD) { const o = campAt(x, y); pop(x, y, o ? o.n : '', '#fff3b0'); }
    else if (k2 === CPT) openCaptain();
    else if (k2 === BB) openBuild('');
    else if (k2 === MB) openMsgBoard();
    else if (petRemoteAt(x, y)) petTouchRemote(petRemoteAt(x, y));   // 面向朋友的寵物按動作鍵＝摸摸（放最後：不會擋住門、NPC 和告示牌）
    return;
  }
  if (scene === 'house') {
    if (K[y][x] === GT) { leaveHouse(); return; }
    const rpH = remoteAt(x, y);
    if (rpH) { openFriendPop(rpH); return; }
    const lx = x - RX, ly = y - RY, hit = house && lx >= 0 && lx < RW && ly >= -2 && ly < RH ? itemAtLocal(lx, ly) : null;
    /* 在朋友家碰到任何家具都記給屋主（坐、躺、洗澡、彈琴、照鏡子另外有更詳細的記錄，這裡就不重複） */
    if (visiting && hit && !edit.on && hit.k !== 'piano' && hit.k !== 'mirror' && !BATH_ACT[hit.k] && !(SEAT[hit.k] && !FX_ACT[hit.k])) visitLog('touch', vlName(hit.k) || '家具');
    if (hit && hit.k === 'dtable') openDishTable(hit);
    else if (hit && hit.k === 'petbowl' && !edit.on) { if (visiting) petVisitFeed(hit); else petBowlAct(); }   // 面向飯碗按動作鍵＝倒飼料進去
    else if (hit && /^pettoy/.test(hit.k) && !edit.on) { if (visiting) petVisitPlay(hit); else petPlayAt(hit); }   // 面向玩具按動作鍵＝叫寵物過去玩
    else if (hit && hit.k === 'tv' && !edit.on) openTv(hit);
    else if (hit && hit.k === 'shelf' && !edit.on) shelfAct();   // 書櫃：看圖鑑（朋友家 = 屋主的圖鑑），見 dex-visit.js
    else if (hit && DISP[hit.k]) { if (visiting) visitShowList(hit); else openDisplay(hit.id); }
    else if (hit && hit.k === 'kitchen' && !edit.on) { ckAnchor = { id: hit.id, fx: x, fy: y, at: visiting ? visiting.uid : null }; openKitchen(); }
    else if (hit && STYLER[hit.k] && !edit.on && (!visiting || hit.k === 'mirror')) openMaker(false);
    else if (hit && hit.k === 'piano' && !edit.on) openPiano();
    else if (hit && BATH_ACT[hit.k] && !edit.on) bathAct(hit, x, y);
    else if (hit && ART[hit.k] && !edit.on) openArt(hit);
    else if (hit && FX_ACT[hit.k] && !edit.on) fxAct(hit, x, y);
    else if (hit && SEAT[hit.k] && !edit.on) takeSeat(hit, x, y);
    else if (petRemoteAt(x, y)) petTouchRemote(petRemoteAt(x, y));   // 面向朋友的寵物按動作鍵＝摸摸（家具有功能時以家具優先）
    else if (hit) pop(x, y, (defOf(hit.k) || {}).name || '', '#fff3b0');
    return;
  }
  if (scene === 'boat') { boatAct(x, y); return; }
  if (scene === 'tarot') { const rpT = remoteAt(x, y); if (rpT) { openFriendPop(rpT); return; } lekcusRoomAct(x, y); return; }
  if (scene === 'town') { townAct(x, y); return; }
  if (scene === 'forest') { forestAct(x, y); return; }
  if (scene === 'swamp') { swampAct(x, y); return; }
  if (scene === 'cave') { caveAct(x, y); return; }
  if (scene === 'barn') { barnAct(x, y); return; }
  if (scene === 'stylist') { stylistAct(x, y); return; }
  if (scene === 'cafe') { cafeAct(x, y); return; }
  if (scene === 'arcade') { arcadeAct(x, y); return; }
  if (scene === 'temple' || scene === 'church') { tcAct(x, y); return; }
  const k = K[y][x], key = pk(x, y), p = plots.get(key), t = curTool();
  if (yardMode && scene === 'farm' && !visiting && (grassTile(x, y) || yardMap.has(pk(x, y)))) { yardAct(x, y); return; }   // 庭院佈置模式：動作鍵＝擺放／收回
  if (scene === 'farm' && yardMap.get(key) === 'bench') { takeYardBench(x, y); return; }   // 庭院長椅：面向它按動作鍵坐下，再按一次或按方向鍵起身
  if (k === GT) { openVMenu(); return; }
  if (k === DR) { enterHouse(); return; }
  if (k === SH) { openShop(); return; }
  if (k === BD) { openBoard(); return; }
  if (k === TG) { if (!featLocked('town', x, y)) enterTown(); return; }
  if (k === BR) { enterBarn(); return; }
  if (k === RK) { mineRock(x, y); return; }
  const fgi = yardMap.has(pk(x, y)) ? -1 : fgList.findIndex(f => f.x === x && f.y === y && !forTaken.has(f.slot + ':' + f.i));
  if (fgi >= 0 && !catchShown && !fishing) { takeForage(fgList[fgi]); return; }
  if (catchShown) { hideCatch(); return; }
  if (fishing) { fishAct(); return; }
  if (k === WA) {
    if (t.id === 'rod') { startFish(x, y); return; }
    pop(x, y, t.id === 'can' ? '水壺永遠是滿的' : '這是池塘', '#cfe8f7'); if (t.id === 'can') splash(x, y); return;
  }
  if (k !== G) { if (t.id === 'net') swingNet(x, y); return; }
  if (t.id === 'net' && !ripeNow(p)) { swingNet(x, y); return; }
  /* 第一格熟了就收；第一格還在長、但這一排後面有熟的，也一起收（水壺／肥料要留給它們自己的動作） */
  if (ripeNow(p) || (p && p.crop && t.id !== 'can' && t.id !== 'fert' && ripeLine(x, y).length)) {
    harvestLine(x, y); refreshHud(); return;
  }
  if (t.id === 'none') { pop(x, y, '這格是空的，到背包裝備物品', '#ffffff'); return; }
  if (t.id === 'rod') { pop(x, y, '面向池塘才能釣魚', '#cfe8f7'); return; }
  if (t.id === 'net') { swingNet(x, y); return; }
  if (t.id === 'pick') { pop(x, y, '面向礦石才敲得動', '#ffffff'); return; }
  if (t.id === 'axe') { pop(x, y, '到西邊森林面向樹才砍得動', '#ffffff'); return; }
  if (t.id === 'fert') { fertAct(x, y, p); return; }
  if (t.id === 'hoe') {
    const line = lineTiles(x, y, toolN(toolLv.hoe));
    /* 翻土模式由第一個「沒有作物」的格子決定；第一格有作物時只會往後翻新土，不會把後面的空田翻回草地 */
    const lead = line.find(([tx, ty]) => { const q = plots.get(pk(tx, ty)); return !(q && q.crop); });
    const mode = lead && plots.get(pk(lead[0], lead[1])) ? 'untill' : 'till';
    if (p && p.crop && (!lead || mode === 'untill')) pop(x, y, '還沒長好', '#ffffff');
    else line.forEach(([tx, ty], i) => hoeOne(tx, ty, mode, i === 0));
  } else if (t.id === 'can') {
    if (world().wet) pop(x, y, world().snow ? '下雪天不用澆水' : '下雨天不用澆水', '#cfe8f7');
    else {
      /* 水壺升級：整排掃過去，澆還乾的田，已濕或沒翻的跳過 */
      const line = lineTiles(x, y, toolN(toolLv.can));
      let n = 0; line.forEach(([tx, ty]) => { if (canOne(tx, ty)) n++; });
      if (!n) pop(x, y, line.some(([tx, ty]) => plots.has(pk(tx, ty))) ? '土還是濕的' : '先用鋤頭翻土', line.some(([tx, ty]) => plots.has(pk(tx, ty))) ? '#cfe8f7' : '#ffffff');
    }
  } else {
    const kk = t.crop, line = lineTiles(x, y, toolN(toolLv.seed | 0 || 1));
    const empty = line.filter(([tx, ty]) => { const q = plots.get(pk(tx, ty)); return q && !q.crop && K[ty][tx] === G; });
    if (!empty.length) pop(x, y, p ? '這裡已經有作物' : '先用鋤頭翻土', '#ffffff');
    else if (cropLocked(kk)) pop(x, y, CROPS[kk].n + '需要農耕 Lv.' + CROP_NEED[kk], '#ffb3a8');
    else if (have('s:' + kk) <= 0) pop(x, y, '沒有種子了，去雜貨攤買', '#ffb3a8');
    else {
      /* 撒種子升級：整排裡已翻好、還空著的田都種，已有作物的跳過；種子不夠就種到用完為止 */
      let n = 0;
      line.forEach(([tx, ty]) => { if (plantOne(tx, ty, kk, n === 0 && tx === empty[0][0] && ty === empty[0][1])) n++; });
      if (n) { if (n < empty.length && have('s:' + kk) <= 0) pop(x, y, '種了 ' + n + ' 格，種子用完了', '#ffb3a8'); loadLevelSoon(); }
    }
  }
  refreshHud();
}
