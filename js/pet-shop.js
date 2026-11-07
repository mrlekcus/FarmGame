/* 寵物店：蓋店（捐材料）→ 領養 → 買飼料／玩具／飯碗 → 照顧。後端是 pet.sql 的 pet_* 函式。
   阿喵姊姊（領養店店員）按動作鍵就會打開這個面板。 */
Object.assign(ERR, {
  pet_locked: '寵物店還在蓋，等你把材料湊齊、付完工錢就能領養囉', pet_built: '寵物店已經蓋好了', pet_item_full: '這種材料已經夠了，換別種吧', pet_daily_full: '今天這種材料捐滿了，明天再來', pet_mat_missing: '材料還沒湊齊',
  pet_not_met: '先走進店裡，和阿喵姊姊聊聊吧', pet_has: '你已經有一隻寵物了，要換的話先送回領養處', pet_none: '你還沒有寵物', pet_owned: '你已經有這個了',
  pet_full: '牠現在吃得很飽，等一下再餵吧', pet_tired: '牠今天玩累了，明天再來吧', pet_no_bowl: '要先買飯碗才能放飼料',
  pet_no_toy: '要先買玩具才能玩', not_gm: '只有 GM 可以這樣做'
});
let petMine = null, petData = null, petBusy = false, petPick = null, petMsg = '';
const PET_NEED_N = { 'm:wood': '木頭', 'm:stone': '石頭', 'm:copper': '銅礦' };
const petEl = document.createElement('div');
petEl.className = 'maker'; petEl.hidden = true; petEl.style.zIndex = 31;
petEl.innerHTML = '<div class="card maker-card" id="petcard" tabindex="-1"></div>';
document.body.appendChild(petEl);
const petCard = petEl.querySelector('#petcard');

function petLookOf(breedKey) { return (typeof petOf === 'function' && petOf(breedKey)) || null; }
function petPaint(root) {   // 把 data-pk 的 canvas 畫上寵物
  root.querySelectorAll('canvas[data-pk]').forEach(cv => {
    const L = petLookOf(cv.dataset.pk), c = cv.getContext('2d'); if (!L) return;
    c.clearRect(0, 0, cv.width, cv.height); g = c;
    try { petB(L, 4, 5, { pose: 'front', now: 0 }); } catch (e) { /* 略過 */ }
    g = ctx;
  });
}
const petCv = k => '<canvas width="24" height="24" data-pk="' + k + '" style="width:72px;height:72px;image-rendering:pixelated;flex:none"></canvas>';

let petCare = false;
async function openPetShop(care) {
  if (care === true) { petBarToggle(); return; }
  if (!ready || !me || paused() || petOpen) return;
  petStoryAt = 0; petReplay = false; petCare = care === true; petOpen = true; pressed.length = 0; petMsg = ''; petPick = null; petData = null;
  petEl.hidden = false; petCard.innerHTML = '<div class="shop-h"><h2>阿喵姊姊的領養店</h2></div><p>讀取中…</p>';
  await petLoad();
}
function closePetShop() { if (petBusy) return; petOpen = false; petEl.hidden = true; refreshHud(); }
async function petLoad() {
  try { petData = await enqueue(() => rpc('pet_get')); }
  catch (e) { toast(errText(e)); closePetShop(); return; }
  petUnlocked = !!petData.unlocked; petMine = petData.pet || null; petRender();
}
const PET_STORY = [
  ['nar', '（早上，阿喵姊姊正在擦窗）'],
  ['npc', '欸，你來得正好。昨晚我聽到門外有沙沙聲，今早門口全是小腳印。'],
  ['npc', '一路排到新蓋好的屋子前……像是牠們早就知道，這裡會有一個家。'],
  ['me', '牠們自己找來的？'],
  ['npc', '嗯。大概是聞到了大家的心意吧。'],
  ['nar', '（門縫下，一隻小爪子悄悄伸了進來）'],
  ['npc', '呵呵，有一隻好像已經等不及了。請進，挑你喜歡的。']
];
let petStoryAt = 0, petReplay = false;   // petReplay：有寵物的玩家按「回顧劇情」，只在本機重演，不寫伺服器
function petRender() {
  const d = petData; if (!d) return;
  const head = '<div class="shop-h"><h2>阿喵姊姊的領養店</h2><span class="chip gold">' + me.coins + ' G</span></div>';
  const say = t => '<div class="row"><canvas width="16" height="16" data-clerk="1" style="width:64px;height:64px;image-rendering:pixelated;flex:none"></canvas><div class="meta"><b>阿喵姊姊</b><small style="display:block;margin-top:4px;line-height:1.5">' + t + '</small></div></div>';
  const care = petCare && d.unlocked && d.pet;
  const close = '<button type="button" class="btn ghost wide" data-pa="close">離開</button>';
  let h = head;
  if (!d.unlocked) {
    h += say(petMsg || '店還在蓋～每天可以捐木頭 50、石頭 50、銅礦 5，材料湊齊再付工錢，就能開張領養囉！');
    const cost = d.cost || 10000; let full = true;
    h += '<div style="display:flex;flex-direction:column;gap:10px">' + Object.keys(d.need).map(k => {
      const need = d.need[k], got = d.have[k] | 0, cap = (d.daily && d.daily[k]) || need, used = (d.today && d.today[k]) | 0, bag = have(k), left = need - got, canToday = Math.max(0, Math.min(cap - used, left)), pct = Math.min(100, Math.round(got / need * 100));
      if (left > 0) full = false;
      const q = Math.min(bag, canToday);
      return '<div><div style="display:flex;justify-content:space-between;font-weight:800"><span>' + (PET_NEED_N[k] || k) + '</span><span>' + got + ' / ' + need + '</span></div>' +
        '<div style="height:12px;border:2px solid var(--edge);border-radius:8px;background:#fff;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:var(--pink)"></div></div>' +
        '<div style="display:flex;gap:8px;align-items:center;margin-top:6px"><small style="flex:1">背包 ' + bag + '　今天已捐 ' + used + ' / ' + cap + '</small>' +
        (left > 0 ? '<button type="button" class="btn" data-pa="give" data-k="' + k + '" data-n="1"' + (q < 1 ? ' disabled' : '') + '>捐 1</button><button type="button" class="btn" data-pa="give" data-k="' + k + '" data-n="all"' + (q < 1 ? ' disabled' : '') + '>捐到上限</button>' : '<b style="color:var(--pink-deep)">已湊齊</b>') +
        '</div></div>';
    }).join('') + '</div>';
    if (full) h += '<button type="button" class="btn wide" data-pa="pay"' + (me.coins < cost ? ' disabled' : '') + '>材料齊了！付 ' + cost + ' G 完成建築</button>';
    else h += '<small style="text-align:center">每種材料每天有捐獻上限，湊齊後再付 ' + cost + ' G 完工，最快要 3 天。</small>';
    if (isGmShop()) h += '<button type="button" class="btn ghost wide" data-pa="gmfinish">GM：直接完工</button>';
    h += close; petCard.innerHTML = h; paintClerk(); return;
  }
  const c = d.cfg;
  if (petReplay || (!d.pet && !d.met && !care)) {   // 第一次進來：先演小劇情（窗外的腳印），演完才開放領養
    const ln = PET_STORY[Math.min(petStoryAt, PET_STORY.length - 1)], last = petStoryAt >= PET_STORY.length - 1;
    if (ln[0] === 'npc') h += say(ln[1]);
    else if (ln[0] === 'me') h += '<div class="row" style="justify-content:flex-end"><div class="meta" style="text-align:right"><b>你</b><small style="display:block;margin-top:4px;line-height:1.5">' + ln[1] + '</small></div></div>';
    else h += '<p style="margin:14px 0;text-align:center;font-style:italic;opacity:.8">' + ln[1] + '</p>';
    h += '<button type="button" class="btn wide" data-pa="story">' + (last ? (petReplay ? '看完了' : '好，去看看牠們') : '繼續 ▶') + '</button>';
    if (!last) h += '<button type="button" class="btn ghost wide" data-pa="storyskip">略過劇情</button>';
    petCard.innerHTML = h; paintClerk(); return;
  }
  if (!d.pet) {   // 領養
    const sel = petPick, L = sel && petLookOf(sel);
    h += say(petMsg || '歡迎～挑一隻喜歡的帶回家吧！領養費 ' + c.adopt + ' G。');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px">' + d.breeds.map(b => {
      const on = sel === b.id;
      return '<button type="button" class="btn ' + (on ? '' : 'ghost') + '" data-pa="pick" data-k="' + b.id + '" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px">' + petCv(b.id) + '<small>' + b.name + '</small></button>';
    }).join('') + '</div>';
    if (sel) h += '<label style="display:flex;gap:8px;align-items:center;font-weight:800">取名字<input id="petname" maxlength="8" placeholder="1～8 字" style="flex:1;min-width:0;padding:8px;border:3px solid var(--edge);border-radius:12px;font:inherit"></label>' +
      '<button type="button" class="btn wide" data-pa="adopt"' + (me.coins < c.adopt ? ' disabled' : '') + '>領養（' + c.adopt + ' G）</button>';
    h += close; petCard.innerHTML = h; paintClerk(); petPaint(petCard); return;
  }
  const p = d.pet, L = petLookOf(p.breed);
  if (!care) h += say(petMsg || (p.fed ? '牠吃得飽飽的～' : '牠肚子餓了，餵點東西吧！'));
  else if (petMsg) h += '<p style="margin:0;text-align:center;font-weight:800">' + petMsg + '</p>';
  const left = Math.max(0, p.fedUntil - srvNow()), fedPct = p.fed ? Math.max(5, Math.min(100, Math.round(left / (12 * 3600000) * 100))) : 4;   // 飽足 12 小時封頂（和寵物資料卡一樣）
  const noFood = have('p:food') < 1;
  h += '<div class="ps-card"><div class="ps-top">' + petCv(p.breed) + '<div class="meta"><b class="ps-name">' + p.name + '</b><small>' + (L ? L.breed + '・' + L.coat : '') + '</small></div></div>' +
    '<div class="ps-stats"><div class="ps-st"><div><span>🍖 飽足</span><span class="' + (p.fed ? '' : 'ps-bad') + '">' + (p.fed ? '約剩 ' + petHrs(p.fedUntil) : '肚子餓了') + '</span></div><div class="bar"><i style="width:' + fedPct + '%;background:#ff8fa8"></i></div></div>' +
    '<div class="ps-st"><div><span>💗 親密</span><span>' + p.bond + '</span></div><div class="bar"><i style="width:' + ((p.bond % 10) * 10 || (p.bond ? 100 : 0)) + '%;background:#ffb04a"></i></div></div></div>' +
    '<div class="ps-foot"><span>飯碗存量 ' + p.bowl + ' / 3</span><span>背包飼料 ' + have('p:food') + '</span></div></div>' +
    '<button type="button" class="btn wide" style="margin:0" data-pa="act" data-k="feed"' + (noFood ? ' disabled' : '') + '>🍖 餵飼料' + (noFood ? '（背包沒有飼料）' : '') + '</button>';
  if (care) { h += close; petCard.innerHTML = h; petPaint(petCard); return; }
  const buyBtn = (n, price) => '<button type="button" class="btn ps-buy" data-pa="buy" data-k="food" data-n="' + n + '"' + (me.coins < price ? ' disabled' : '') + '>×' + n + '<small>' + price + ' G</small></button>';
  h += '<div class="ps-sec">商店</div>' +
    '<div class="ps-food"><div class="ps-sack"><b></b></div><div class="meta"><b>寵物飼料</b><small>耐飽 ' + c.hours + ' 小時；飯碗最多存 3 份，餓了會自己吃</small></div>' + buyBtn(1, c.food) + buyBtn(10, c.food * 10) + '</div>' +
    '<div class="ps-sec">寵物家具<small>擺在家裡：飯碗可倒飼料，玩具牠會自己去玩</small></div>' +
    '<div class="ps-grid">' + PET_GOODS.slice().sort((x, y) => petOwns(x[1]) - petOwns(y[1])).map(([k, key, nm, dim]) => {   // 還沒買的排前面
      const own = petOwns(key), price = c[k], poor = !own && me.coins < price;
      return '<button type="button" class="ps-g' + (own ? ' own' : '') + (poor ? ' poor' : '') + '" data-pa="buy" data-k="' + k + '" data-n="1"' + (own || poor ? ' disabled' : '') + '>' +
        (own ? '<span class="ps-own">✓ 已擁有</span>' : '') + '<span class="ps-ico"><img src="' + petIcon(key, dim) + '" alt=""></span><b>' + nm + '</b><small>' + dim[0] + '×' + dim[1] + '</small>' + (own ? '' : '<span class="ps-price">' + price + ' G</span>') + '</button>';
    }).join('') + '</div>' +
    '<button type="button" class="ps-link" data-pa="replay">回顧劇情</button>' +
    '<button type="button" class="ps-link" data-pa="return">送回領養處</button>' + close;
  petCard.innerHTML = h; paintClerk(); petPaint(petCard);
}
const PET_GOODS = [['bowl', 'petbowl', '木托盤雙碗', [2, 1]], ['toy_a', 'pettoya', '玩具籃', [1, 1]], ['toy_b', 'pettoyb', '貓跳台', [1, 2]], ['toy_c', 'pettoyc', '拔河繩與毛線球', [1, 1]], ['toy_d', 'pettoyd', '條紋隧道', [2, 1]]];
const petOwns = key => !!(petData && petData.owned && petData.owned.includes('f:' + key));
const petOwnsToy = () => PET_GOODS.some(g => g[0] !== 'bowl' && petOwns(g[1]));
const petIconCache = {};
function petIcon(key, dim) {   // 把家具像素圖畫成小圖（商店和寵物列共用）
  if (petIconCache[key]) return petIconCache[key];
  const cv = document.createElement('canvas'); cv.width = dim[0] * 16; cv.height = dim[1] * 16; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const old = g; g = c; try { FURN[key](0, 0, 0); } catch (e) { /* 略過 */ } g = old;
  return (petIconCache[key] = cv.toDataURL());
}
const petHrs = ms => { const m = Math.max(0, Math.round((ms - srvNow()) / 60000)); return Math.floor(m / 60) + ' 小時 ' + (m % 60) + ' 分'; };
function paintClerk() {
  const cv = petCard.querySelector('canvas[data-clerk]'); if (!cv) return;
  const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 16); g = c2;
  try { clerkArt('cl_a', 0, 0, Date.now()); } catch (e) { /* 略過 */ }
  g = ctx;
}
let petCloseAfter = '';
async function petCall(name, args, ok) {
  if (petBusy) return; petBusy = true;
  try {
    const r = await enqueue(() => rpc(name, args));
    if (r && r.inv) Object.assign(inv, r.inv);
    if (r && typeof r.coins === 'number') me.coins = r.coins;
    if (ok) ok(r);
    refreshHud();
  } catch (e) { petMsg = errText(e); toast(petMsg); }
  petBusy = false;
  if (petCloseAfter) {   // 蓋好店：直接關掉面板，不在工地面板裡接著領養；要玩家自己走進店裡找阿喵姊姊
    const msg = petCloseAfter; petCloseAfter = '';
    try { const d = await enqueue(() => rpc('pet_get')); petUnlocked = !!(d && d.unlocked); petMine = (d && d.pet) || null; petSyncAt = Date.now(); } catch (e) { /* 略過 */ }
    closePetShop(); toast(msg); return;
  }
  await petLoad();
}
petCard.addEventListener('click', ev => {
  const b = ev.target.closest('[data-pa]'); if (!b || b.disabled) return;
  const a = b.dataset.pa, k = b.dataset.k, n = b.dataset.n;
  if (a === 'close') closePetShop();
  else if (a === 'replay') { petReplay = true; petStoryAt = 0; petRender(); }
  else if (a === 'story') { if (petStoryAt < PET_STORY.length - 1) { petStoryAt++; petRender(); } else if (petReplay) { petReplay = false; petRender(); } else petCall('pet_meet', {}, () => {}); }
  else if (a === 'storyskip') { if (petReplay) { petReplay = false; petRender(); } else petCall('pet_meet', {}, () => {}); }
  else if (a === 'pick') { petPick = k; petRender(); }
  else if (a === 'give') { const lim = Math.min((petData.need[k] | 0) - (petData.have[k] | 0), ((petData.daily && petData.daily[k]) | 0) - ((petData.today && petData.today[k]) | 0)), q = n === 'all' ? Math.min(have(k), lim) : 1; if (q > 0) petCall('pet_build_give', { p_item: k, p_qty: q }, r => { petMsg = '謝謝你！'; }); }
  else if (a === 'pay') petCall('pet_build_pay', {}, () => { petCloseAfter = '完工啦！寵物店開張了～走進去找阿喵姊姊聊聊吧'; });
  else if (a === 'gmfinish') petCall('pet_gm_finish', {}, () => { petCloseAfter = 'GM 已讓寵物店完工，走進去找阿喵姊姊'; });
  else if (a === 'adopt') {
    const nm = ((petCard.querySelector('#petname') || {}).value || '').trim();
    if (!nm) { petMsg = '先幫牠取個名字吧'; petRender(); return; }
    petCall('pet_adopt', { p_breed: petPick, p_name: nm }, () => { petMsg = nm + ' 成為你的家人了！'; toast('領養成功：' + nm); });
  }
  else if (a === 'buy') petCall('pet_buy', { p_kind: k, p_qty: +n || 1 }, () => { petMsg = '謝謝惠顧～'; });
  else if (a === 'act') petCall('pet_act', { p_kind: k }, () => { petHappy(k); petMsg = { pat: '牠開心地蹭蹭你', feed: '牠大口吃了起來', bowl: '飼料放進碗裡了', play: '玩得好開心！' }[k]; });
  else if (a === 'return') { if (b.dataset.sure) petCall('pet_return', {}, () => { petMsg = '牠被送回領養處了…'; petPick = null; }); else { b.dataset.sure = '1'; b.textContent = '確定要送回嗎？再按一次確認'; } }
});
petEl.addEventListener('keydown', ev => { if (ev.key === 'Escape') closePetShop(); });

/* 進小村（和登入後）時讀一次：決定外面看到的是工地還是蓋好的店 */
let petSyncAt = 0;
function petSync(force) {
  if (!me || (!force && Date.now() - petSyncAt < 60000)) return;
  petSyncAt = Date.now();
  enqueue(() => rpc('pet_get')).then(d => { petUnlocked = !!(d && d.unlocked); petMine = (d && d.pet) || null; }).catch(() => {});
}

/* ---------- 跟班寵物：在農場、小村、森林、廣場、自己家跟在玩家後面走 ---------- */
const petFol = { x: 0, y: 0, tr: [], px: -1, py: -1, scene: '', t: 0, still: 0, face: 1, moving: false, happyUntil: 0, nextBubble: 0, goal: null, nextGoal: 0, moveAt: 0, lx: -1, ly: -1, emo: null, fDots: 0, fBall: 0, items: -1, seenR: {} };
const PET_SCENES = { farm: 1, town: 1, forest: 1, plaza: 1, house: 1 };   // 進自己的家也會跟進來（去朋友家也會跟去，朋友看得到）
/* 外出設定（存在伺服器 pets.fmode）：stay 留在家／close 貼身／free 自由走動（預設）。留在家時只有在自己家裡看得到牠 */
const petMode = () => { const m = petMine && petMine.mode; return m === 'stay' || m === 'close' ? m : 'free'; };
function petShown() { return !!(petMine && petUnlocked && ready && PET_SCENES[scene]) && (petMode() !== 'stay' || (scene === 'house' && !visiting)); }
/* 親密等級：用累計親密度算（伺服器只存 bond，等級和才藝解鎖都在前端算）；每升一級學會一個才藝，周圍的人都看得到 */
const PET_LVB = [0, 45, 105, 225, 450, 900, 1350];
const petLvOf = b => { let l = 1; PET_LVB.forEach((v, i) => { if ((b | 0) >= v) l = i + 1; }); return l; };
const PET_TRICKS = [
  { k: 'sit', lv: 2, n: '坐下', ic: '🪑', ms: 3000 }, { k: 'shake', lv: 3, n: '握手', ic: '🤝', ms: 2600 }, { k: 'spin', lv: 4, n: '轉圈圈', ic: '🔄', ms: 2400 },
  { k: 'roll', lv: 5, n: '翻滾', ic: '🤸', ms: 2600 }, { k: 'fire', lv: 6, n: '愛心煙火', ic: '🎆', ms: 3400 }, { k: 'dance', lv: 7, n: '專屬舞蹈', ic: '💃', ms: 5000 }
];
const PET_TRICK_BY = {}; PET_TRICKS.forEach(x => { PET_TRICK_BY[x.k] = x; });
/* 才藝動畫：回傳這一刻的偏移（格）、跳高（像素）、姿勢、朝向；自己和別人的寵物共用。fx 是一次性的閃光 */
function petTrickFrame(f, t) {
  const tr = f.trick; if (!tr) return null;
  const d = PET_TRICK_BY[tr.k], u = t - tr.t0;
  if (!d || u >= d.ms) { f.trick = null; return null; }
  const o = { ox: 0, oy: 0, jump: 0, pose: 'front', dir: 0, emo: null };
  const fx = (times, cols) => { tr.fx = tr.fx | 0; while (tr.fx < times.length && u >= times[tr.fx]) { if (typeof sparkle === 'function') { const a = tr.fx * 1.3; sparkle(f.x + Math.cos(a) * 0.9, f.y - 0.3 + Math.sin(a) * 0.5, cols[tr.fx % cols.length]); } tr.fx++; } };
  o.k = tr.k; o.u = u; o.ms = d.ms;
  if (tr.k === 'sit') { o.oy = 0.04; o.sink = Math.round(Math.min(1, u / 450) * 3 * Math.min(1, (d.ms - u) / 350)); o.emo = u < 1500 ? 'happy' : 'love'; }
  else if (tr.k === 'shake') { o.pose = 'front'; o.emo = 'love'; }
  else if (tr.k === 'spin') { o.pose = 'side'; o.ox = Math.cos(u / 220) * 0.35 - 0.35; o.oy = Math.sin(u / 220) * 0.25; o.dir = Math.floor(u / 180) % 2 ? -1 : 1; o.emo = 'happy'; }
  else if (tr.k === 'roll') { const ph = u / d.ms; o.ox = (ph < 0.5 ? ph : 1 - ph) * 1.6; o.jump = Math.round(Math.abs(Math.sin(u / 330)) * 8); o.pose = 'front'; o.rot = Math.floor(u / 140) % 4; o.mv = ph < 0.5 ? 1 : -1; o.emo = 'happy'; }
  else if (tr.k === 'fire') { o.pose = 'happy'; o.jump = Math.round(Math.abs(Math.sin(u / 200)) * 6); o.emo = 'love'; fx([300, 800, 1300, 1800, 2300, 2800], ['#ff9db8', '#ffd34d', '#ff6f91', '#8fd0ff', '#ffb04a', '#ff9db8']); }
  else if (tr.k === 'dance') { const b = Math.floor(u / 250) % 2; o.pose = b ? 'happy' : 'front'; o.dir = b ? -1 : 1; o.ox = Math.sin(u / 250) * 0.15; o.jump = b ? 3 : 0; o.emo = b ? 'star' : 'happy'; fx([500, 1500, 2500, 3500, 4500], ['#ffd34d', '#ff9db8', '#8fd0ff', '#b6e88a', '#ffb04a']); }
  if (o.emo && (!f.emo || f.emo.until < t + 150)) f.emo = { k: o.emo, at: t, until: t + 900 };
  return o;
}
/* 才藝的畫法（方案 C）：坐下＝壓扁坐在粉紅坐墊上；握手＝舉起前爪迎接伸來的手；翻滾＝真的轉圈＋灰塵；愛心煙火＝愛心往上飄＋天上放煙火。
   變形是把現有寵物圖下移裁切、旋轉 90 度，道具另外畫，所以所有品種都適用。petTrickDraw 畫寵物本身和腳邊的道具，petTrickTop 畫蓋在上面的東西 */
const PET_HEART3 = ['x.x', 'xxx', '.x.'];
function petHeart3(c, x, y) { PET_HEART3.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'x') r(c, x + i, y + j, 1, 1); })); }
function petTrickDraw(L, bx, by, jump, pose, now, dir, trk) {
  const k = trk && trk.k, u = trk ? trk.u : 0, a0 = g.globalAlpha;
  if (k === 'sit') {
    g.save(); g.beginPath(); g.rect(bx - 8, by - 40, 32, 40 + 14); g.clip();
    petB(L, bx, by + (trk.sink | 0), { pose, now, dir });
    g.restore();
    r('#d9667f', bx + 1, by + 12, 14, 4); r('#ff9db8', bx + 2, by + 11, 12, 4); r('#ffc2d4', bx + 3, by + 11, 6, 1); r('#ffffff', bx, by + 13, 2, 1); r('#ffffff', bx + 14, by + 13, 2, 1);
    return;
  }
  if (k === 'roll') {
    const sx = trk.mv || 1;
    // 灰塵（落在身後地面）和速度線
    for (let i = 0; i < 5; i++) {
      const ph = ((u / 260) + i * 0.37) % 1, x = bx + 8 - sx * (5 + i * 5 + ph * 3), y = by + 12 + (i % 2);
      g.globalAlpha = Math.max(0, 0.95 - i * 0.16 - ph * 0.2); r('#ffffff', Math.round(x), y, i < 2 ? 3 : 2, i < 2 ? 3 : 2);
    }
    g.globalAlpha = a0;
    for (let i = 0; i < 3; i++) { const len = 6 - i; r('rgba(255,255,255,.85)', sx > 0 ? bx - 4 - len - i * 2 : bx + 20 + i * 2, by + 4 + i * 3 - jump, len, 1); }
    const cx = bx + 8, cy = by - jump + 9;
    g.save(); g.translate(cx, cy); g.rotate((trk.rot | 0) * Math.PI / 2); g.translate(-cx, -cy);
    petB(L, bx, by - jump, { pose, now, dir: sx });
    g.restore();
    return;
  }
  if (k === 'shake') {
    petB(L, bx, by, { pose, now, dir, happy: true });
    // 舉起的前爪（朝臉的那一側，上下揮動）
    const pawUp = u < 500 ? u / 500 : u > trk.ms - 500 ? Math.max(0, (trk.ms - u) / 500) : 1, wave = u > 1100 && u < trk.ms - 500 ? Math.round(Math.abs(Math.sin(u / 120)) * 2) : 0;
    const px_ = dir > 0 ? bx + 13 : bx - 2, py_ = by + 11 - Math.round(pawUp * 4) - wave;
    if (pawUp > 0.15) { r(L.out, px_, py_, 4, 5); r(L.body, px_ + 1, py_ + 1, 2, 3); r(L.light || L.body, px_ + 1, py_ + 3, 2, 1); }
    return;
  }
  petB(L, bx, by - jump, { pose, now, dir });
}
function petTrickTop(trk, bx, by, jump, dir) {
  if (!trk) return;
  const k = trk.k, u = trk.u, a0 = g.globalAlpha;
  if (k === 'shake') {
    const ease = z => z * z * (3 - 2 * z), T1 = 700, T2 = trk.ms - 650;
    const far = 30, near = 16, off = u < T1 ? far - (far - near) * ease(u / T1) : u > T2 ? near + (far - near) * ease(Math.min(1, (u - T2) / 600)) : near + (u > 1100 ? Math.round(Math.abs(Math.sin(u / 120)) * 1) : 0);
    const hx = dir > 0 ? bx + 8 + off : bx + 8 - off - 5, hy = by + 8;
    const sl = dir > 0 ? hx + 5 : hx - 24;
    r('#ff9db8', sl, hy + 1, 24, 4); r('#e0668a', sl, hy + 4, 24, 1);   // 袖子
    r('#8a5a4a', hx, hy, 5, 5); r('#ffd9b8', hx + 1, hy + 1, 3, 3); r('#ffd9b8', dir > 0 ? hx - 1 : hx + 5, hy + 1, 1, 2);   // 手
    if (u > T1 && u < T2 + 300) {   // 碰到時冒閃光
      const fl = Math.floor(u / 140) % 2, cx = dir > 0 ? hx - 2 : hx + 7;
      r('#fff6a8', cx, by + 4 - fl, 1, 3); r('#fff6a8', cx - 1, by + 5 - fl, 3, 1); r('#ffd34d', cx + (fl ? 3 : -4), by + 7, 1, 1); r('#ffd34d', cx + (fl ? -3 : 3), by + 3, 1, 1);
    }
    return;
  }
  if (k === 'fire') {
    const cols = ['#ff9db8', '#ffd34d', '#8fd0ff', '#ff6f91'], ox = [-12, 10, -2, 14], oy = [0, 4, 10, -2];
    for (let i = 0; i < 4; i++) {
      const a = u - (300 + i * 650); if (a < 0 || a > 1200) continue;
      const q = a / 1200, rad = 3 + q * 13, cx = bx + 8 + ox[i], cy = by - 22 - oy[i];
      g.globalAlpha = Math.max(0, 1 - q * q);
      for (let n = 0; n < 12; n++) { const an = n / 12 * 6.2832 + i; r(cols[(i + (n % 2)) % 4], Math.round(cx + Math.cos(an) * rad), Math.round(cy + Math.sin(an) * rad), 2, 2); }
      if (q < 0.35) petHeart3(cols[(i + 3) % 4], cx - 1, cy - 1);
      g.globalAlpha = a0;
    }
    for (let i = 0; i < 4; i++) {   // 往上飄的小愛心
      const ph = ((u / 1500) + i / 4) % 1, x = bx + 6 + Math.round(Math.sin(ph * 6 + i * 2) * 9), y = by - 4 - Math.round(ph * 26);
      g.globalAlpha = Math.max(0, 1 - ph); petHeart3(i % 2 ? '#ffb04a' : '#ff9db8', x, y); g.globalAlpha = a0;
    }
  }
}
/* 自由走動：在主人附近逛，每隔幾秒挑一個新的點；跑遠了就快步追上 */
function petFreeStep(f, t, dt, cx, cy, radius) {
  const dist = Math.hypot(cx - f.x, cy - f.y); let sp = 2.4;
  if (dist > radius + 2) { f.wx = cx; f.wy = cy; f.wNext = t + 1500; sp = 5.2; }
  else if (f.wx == null || (!f.moving && t > f.wNext) || Math.hypot(f.wx - cx, f.wy - cy) > radius + 1.5) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * 6.283, rr = 1 + Math.random() * (radius - 1), x = Math.round(cx + Math.cos(a) * rr), y = Math.round(cy + Math.sin(a) * rr);
      if (!(x === Math.round(cx) && y === Math.round(cy)) && walkable(x, y)) { f.wx = x; f.wy = y; break; }
    }
    f.wNext = t + 2500 + Math.random() * 4500;
  }
  if (f.wx == null) { f.moving = false; return; }
  const dx = f.wx - f.x, dy = f.wy - f.y, d = Math.hypot(dx, dy);
  f.moving = d > 0.06;
  if (f.moving) { const st = Math.min(d, sp * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; }
}
let petTrickAt = 0;
function petDoTrick(k) {
  const d = PET_TRICK_BY[k]; if (!d || !petMine) return;
  if (petLvOf(petMine.bond) < d.lv) { toast('親密 Lv.' + d.lv + ' 才學得會'); return; }
  if (!petShown()) { toast('寵物現在不在你身邊'); return; }
  const now = Date.now(); if (now - petTrickAt < 8000) { toast('牠剛表演完，休息一下吧'); return; }
  petTrickAt = now; petFol.wel = null; petFol.goal = null; petFol.trick = { k, t0: now, fx: 0 };
  petBcast('ptk', { i: myUid, k });
  petBarClose();
}
function onPetTrick(p) {   // 'ptk'：同一個地方的朋友的寵物在表演才藝
  if (!p || typeof p.i !== 'string' || typeof p.k !== 'string' || p.i === myUid || !PET_TRICK_BY[p.k]) return;
  const rp = remotes.get(p.i); if (!rp || !hereRp(rp)) return;
  const f = petRFol[p.i]; if (!f || !petPub[p.i] || f.trick) return;
  f.trick = { k: p.k, t0: Date.now(), fx: 0, rx: rp.x, ry: rp.y };
}
function petEmote(k, ms) { const t = Date.now(); petFol.emo = { k, at: t, until: t + (ms || 2200) }; }
function petHappy(kind) {
  petFol.happyUntil = Date.now() + 2600;
  petEmote(kind === 'feed' || kind === 'bowl' ? 'yum' : kind === 'play' ? 'happy' : 'love', 2400);
  if (petShown() && typeof sparkle === 'function') sparkle(petFol.x, petFol.y - 0.4, '#ff9db8');
  if (kind === 'pat') petTouchSend(myUid);   // 自己摸摸：同一個地方的朋友也看到牠開心跳一下、飄愛心
}
function petBondCheck(oldB, newB) {
  const lo = petLvOf(oldB), ln = petLvOf(newB), nm = (petMine && petMine.name) || '牠';
  if (ln > lo) {   // 升級：學會新才藝
    const tk = PET_TRICKS.find(x => x.lv === ln);
    setTimeout(() => { petEmote('star', 3200); toast('親密升到 Lv.' + ln + '！' + nm + (tk ? '學會了「' + tk.n + '」，到寵物資料卡看看' : '')); }, 2500);
  } else if (Math.floor(newB / 10) > Math.floor(oldB / 10)) setTimeout(() => petEmote('star', 3200), 2500);
}
const petLerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
/* 上線迎接：4 種動作隨機挑一種（衝過來撲、原地蹦跳、睡醒、繞圈），每次登入第一次看到寵物時演 */
let petWelSeen = false;
const PET_WEL_DUR = 3300;
function petWelFrame(f, t) {
  const w = f.wel, u = t - w.t0; if (u >= PET_WEL_DUR) return null;
  const rx = Math.max(0, pl.x - 1), ry = pl.y, o = { x: rx, y: ry, pose: 'front', face: 1, emo: null, jump: 0 };
  const ease = k => Math.max(0, Math.min(1, k));
  if (w.v === 0) {          // A 衝過來撲
    if (u < 1700) { const k = ease(u / 1700); o.x = rx - 5 * (1 - k); o.pose = 'side'; if (u < 1100) o.emo = 'alert'; }
    else { o.emo = 'love'; o.jump = u < 2300 ? Math.round(Math.abs(Math.sin((u - 1700) / 110)) * 4) : 0; }
  } else if (w.v === 1) {   // B 原地蹦跳
    if (u < 800) o.emo = 'alert';
    else if (u < 2500) { o.emo = 'happy'; o.jump = Math.round(Math.abs(Math.sin((u - 800) / 220)) * 6); }
    else o.emo = 'love';
  } else if (w.v === 2) {   // C 睡醒迎接
    if (u < 1100) o.pose = 'sleep';
    else if (u < 1900) o.emo = 'alert';
    else if (u < 2700) o.emo = 'happy';
    else o.emo = 'love';
  } else {                  // D 繞著你轉一圈
    if (u < 2500) { const a = Math.PI + (u / 2500) * Math.PI * 2, R = 1.8 - 0.8 * ease((u - 1800) / 700); o.x = pl.x + Math.cos(a) * R; o.y = pl.y + Math.sin(a) * R * 0.8; o.pose = 'side'; o.face = Math.cos(a - 0.01) > Math.cos(a) ? 1 : -1; o.face = -Math.sin(a) >= 0 ? 1 : -1; if (u < 800) o.emo = 'alert'; }
    else o.emo = 'love';
  }
  o.x = Math.max(0, o.x); o.y = Math.max(0, o.y);
  return o;
}
function petFollowEnts(now, ents) {
  if (!petShown()) { if (me && ready && !petMine) petSync(); return; }
  const f = petFol, t = Date.now(), dt = Math.min(100, t - (f.t || t)); f.t = t;
  if (f.scene !== scene || f.px < 0) {
    f.scene = scene; f.x = pl.x; f.y = pl.y; f.tr = []; f.px = pl.x; f.py = pl.y; f.nextBubble = t + 30000; f.goal = null; f.items = -1; f.seenR = {};
    f.nextGoal = t + 15000; f.moveAt = t; f.still = t; petEmote('alert', 1800);
  }
  if (!petWelSeen) { petWelSeen = true; f.wel = { v: Math.floor(Math.random() * 4), t0: t }; }
  if (f.wel) {
    const w = petWelFrame(f, t), Lw = petLookOf(petMine.breed);
    if (w && Lw) {
      f.x = w.x; f.y = w.y; f.px = pl.x; f.py = pl.y; f.tr = []; f.still = t; f.nextGoal = t + 15000; f.moveAt = t; f.lx = pl.x; f.ly = pl.y;
      const bx = Math.round(w.x * T), by = Math.round(w.y * T);
      ents.push({ y: w.y + 0.01, draw: () => petB(Lw, bx, by - w.jump, { pose: w.pose, now, dir: w.face }) });
      if (w.emo) { const age = t - f.wel.t0; ents.push({ y: w.y + 6, draw: () => petEmoDraw(w.emo, bx + 1, by - 15 - w.jump + Math.round(Math.sin(age / 260))) }); }
      return;
    }
    f.wel = null; f.x = Math.max(0, pl.x - 1); f.y = pl.y; f.tr = []; f.still = t;
  }
  if (pl.x !== f.px || pl.y !== f.py) { f.tr.push([f.px, f.py]); if (f.tr.length > 2) f.tr.shift(); f.px = pl.x; f.py = pl.y; }
  if (pl.x !== f.lx || pl.y !== f.ly) { f.lx = pl.x; f.ly = pl.y; f.moveAt = t; f.goal = null; f.trick = null; f.nextGoal = Math.max(f.nextGoal || 0, t + 15000); f.fDots = f.fBall = 0; }
  const gl = petHomeGoal(f, t);
  let play = null;
  if (gl && gl.at) {
    play = petPlayFrame(f, gl, t);
    if (play.done) { if (gl.noReward) petEmote('sweat', 2800); f.goal = null; f.nextGoal = t + 25000 + Math.random() * 25000; play = null; f.still = t; }
  }
  const trk = !play ? petTrickFrame(f, t) : null;
  if (!play && !trk) {
    if (!gl && petMode() !== 'close') {   // 自由走動（留在家時在家裡也一樣）
      petFreeStep(f, t, dt, pl.x, pl.y, 3);
      if (f.moving) { f.still = t; f.fDots = f.fBall = 0; }
    } else {
      const tg = gl ? [gl.x, gl.y] : petFeetSpot();   // 貼身：緊貼在玩家身後一格
      const dx = tg[0] - f.x, dy = tg[1] - f.y, d = Math.hypot(dx, dy);
      f.moving = d > 0.05;
      if (gl && !f.moving) { petGoalArrive(f, gl, t); }
      if (f.moving) { const st = Math.min(d, 5.2 * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; f.still = t; f.fDots = f.fBall = 0; }
    }
  } else { f.moving = false; if (trk) f.still = t; }
  /* 表情：餓了、閒置、好奇 */
  const busy = f.emo && f.emo.until > t;
  if (t > f.nextBubble) {
    f.nextBubble = t + 45000;
    if (petMine.fedUntil < srvNow() && !busy) petEmote('hungry', 2600);
    if (t - petSyncAt > 300000) petSync(true);
  }
  const idle = t - f.still;
  if (!play && !f.moving && !busy) {
    if (idle > 5000 && !f.fDots) { f.fDots = 1; petEmote('dots', 2200); }
    else if (idle > 12000 && idle < 20000 && !f.fBall) { f.fBall = 1; petEmote('ball', 2600); }
  }
  petCuriousCheck(f, t);
  const L = petLookOf(petMine.breed); if (!L) return;
  const sleeping = !play && !trk && !f.moving && idle > 20000;
  if (sleeping && (!f.emo || f.emo.until < t + 300)) petEmote('sleepy', 900);
  const pose = trk ? trk.pose : t < f.happyUntil ? 'happy' : f.moving ? 'side' : sleeping ? 'sleep' : 'front';
  let bx = Math.round(f.x * T), by = Math.round(f.y * T);
  if (play) { bx = play.px; by = play.py; }
  if (trk) { bx += Math.round(trk.ox * T); by += Math.round(trk.oy * T); }
  ents.push({ y: play ? play.sortY : f.y + 0.01, draw: () => {
    if (play) { play.draw(L, now); return; }
    const jump = trk ? trk.jump : t < f.happyUntil ? Math.round(Math.abs(Math.sin((f.happyUntil - t) / 110)) * 5) : 0;
    if (trk) petTrickDraw(L, bx, by, jump, pose, now, trk.dir ? trk.dir : f.face, trk);
    else petB(L, bx, by - jump, { pose, now, dir: f.face });
  } });
  if (trk && (trk.k === 'shake' || trk.k === 'fire')) ents.push({ y: f.y + 5, draw: () => petTrickTop(trk, bx, by, trk.jump, trk.dir ? trk.dir : f.face) });
  if (f.emo && f.emo.until > t) {
    const e = f.emo, age = t - e.at, bob = Math.round(Math.sin(age / 260)), pop_ = age < 160 ? 3 : 0;
    ents.push({ y: f.y + 6, draw: () => { petEmoDraw(e.k, bx + 1, by - 15 + bob + pop_); } });
  }
}
/* 好奇：有新朋友走近、或家裡多了新家具 */
function petCuriousCheck(f, t) {
  if (typeof remotes !== 'undefined' && typeof syncScene === 'function' && syncScene()) {
    remotes.forEach((rp, id) => { if (hereRp(rp) && !f.seenR[id] && Math.hypot(rp.x - f.x, rp.y - f.y) < 4) { f.seenR[id] = 1; petEmote('curious', 2400); } });
  }
  if (scene === 'house' && house && house.items) {
    if (f.items >= 0 && house.items.length > f.items) petEmote('curious', 2400);
    f.items = house.items.length;
  }
}
/* ---------- 寵物資料卡（右邊快捷列的「🐾 寵物」鈕開啟；寵物本身不再吃動作鍵和點擊，不會擋到門和其他東西） ---------- */
(function () {
  const st = document.createElement('style');
  st.textContent = `
  #petbar{position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(300px,calc(100vw - 24px));background:var(--panel,#fff8f0);border:3px solid var(--edge,#8a5a4a);border-radius:18px;box-shadow:0 4px 0 var(--edge,#8a5a4a);display:flex;flex-direction:column;gap:8px;padding:12px 14px;font-weight:700;font-size:13px}
  #petbar .pb-h{display:flex;gap:10px;align-items:center}
  #petbar .pb-r{display:flex;justify-content:space-between;gap:8px}
  #petbar .pb-acts{display:flex;gap:8px}
  #petbar .pb-acts .pb-b{flex:1;width:auto;display:flex;gap:6px;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:inherit}
  #petbar .pb-b small{position:static;background:none;color:inherit;border:0;font-size:13px;padding:0}
  #petbar[hidden],.dockbtn[hidden],.imi[hidden]{display:none!important}
  #petbar .pb-pt{width:68px;height:68px;border-radius:12px;background:#dff0c8;border:2px solid var(--edge,#8a5a4a);flex:none;image-rendering:pixelated}
  #petbar .pb-m{flex:1;min-width:0;font-weight:800;font-size:13px;line-height:1.35}
  #petbar .pb-m small{display:block;font-weight:600;opacity:.75}
  #petbar .pb-bar{height:9px;border:2px solid var(--edge,#8a5a4a);border-radius:6px;background:#fff;overflow:hidden;margin:3px 0}
  #petbar .pb-bar i{display:block;height:100%;background:var(--pink,#ff8fa8);transition:width .4s}
  #petbar .pb-b{position:relative;width:44px;height:44px;border-radius:12px;background:#ffe3ec;border:3px solid var(--edge,#8a5a4a);display:grid;place-items:center;flex:none;padding:0;cursor:pointer}
  #petbar .pb-b img{width:28px;height:28px;image-rendering:pixelated;object-fit:contain}
  #petbar .pb-b small{position:absolute;right:-6px;bottom:-6px;background:#7fb7e8;color:#fff;border:2px solid var(--edge,#8a5a4a);border-radius:9px;font-size:10px;font-weight:800;padding:0 4px;line-height:13px}
  #petbar .pb-b:disabled{filter:grayscale(1);opacity:.5;cursor:default}
  #petbar .pb-b:active:not(:disabled){transform:translateY(2px)}
  #petbar .pb-x{position:absolute;right:10px;top:6px;border:0;background:none;font-size:18px;font-weight:800;opacity:.6;cursor:pointer;padding:0 2px}
  `;
  document.head.appendChild(st);
})();
(function () {
  const st = document.createElement('style');
  st.textContent = `
  #petbar{max-height:calc(100vh - 24px);overflow-y:auto}
  #petbar .pb-sec{font-weight:800;font-size:13px;margin-top:4px}#petbar .pb-sec small{font-weight:600;opacity:.65;font-size:11px}
  #petbar .pb-seg{display:flex;gap:6px}
  #petbar .pb-seg button{flex:1;font:700 12px/1.2 inherit;font-family:inherit;padding:7px 2px;border:2px solid var(--edge,#8a5a4a);border-radius:12px;background:#fff;color:inherit;cursor:pointer}
  #petbar .pb-seg button small{display:block;font-weight:600;font-size:10px;opacity:.7;margin-top:2px}
  #petbar .pb-seg button.on{background:var(--pink,#ff8fa8);color:#fff}
  #petbar .pb-tr{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  #petbar .pb-tr button{font:700 12px/1.2 inherit;font-family:inherit;padding:7px 2px;border:2px solid #f0dcc8;border-radius:12px;background:#fff;color:inherit;cursor:pointer}
  #petbar .pb-tr button small{display:block;font-weight:600;font-size:10px;opacity:.7}
  #petbar .pb-tr button:disabled{opacity:.45;filter:grayscale(1);cursor:default}
  `;
  document.head.appendChild(st);
})();
const petBar = document.createElement('div'); petBar.id = 'petbar'; petBar.hidden = true; document.body.appendChild(petBar);
let petBarOn = false, petBarTimer = 0, petBarBusy = false;
const petBIcons = {};
function petBIcon(k) {
  if (petBIcons[k]) return petBIcons[k];
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const old = g; g = c;
  try {
    if (k === 'pat') ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'].forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') r(y < 2 && x === 1 ? '#ffd0dc' : '#ff6f91', 4 + x, 4 + y, 1, 1); }));
    else if (k === 'feed') PETF.bowlA(0, 0, 1);
    else if (k === 'play') { ob('#ff7a6c', '#b8403a', 3, 3, 10, 10); r('#ffd34d', 3, 7, 10, 2); r('#fff', 5, 5, 2, 2); }
    else if (k === 'bowl') PETF.bowlD(0, 0, 1);
  } catch (e) { /* 略過 */ }
  g = old; return (petBIcons[k] = cv.toDataURL());
}
function petBarPos() {
  const hb = document.getElementById('hotbar'), rc = hb && hb.getBoundingClientRect ? hb.getBoundingClientRect() : null;
  const low = rc && rc.height > 0 && rc.top > innerHeight * 0.55;
  petBar.style.bottom = (low ? Math.round(innerHeight - rc.top + 8) : 18) + 'px';
}
function petBarRender() {
  const d = petData, p = d && d.pet; if (!p) { petBarClose(); return; }
  const L = petLookOf(p.breed), left = Math.max(0, p.fedUntil - srvNow()), pct = Math.min(100, Math.round(left / (12 * 3600000) * 100));
  const bag = have('p:food');
  const btn = (a, ic, n, dis, tip) => '<button type="button" class="pb-b" data-b="' + a + '"' + (dis ? ' disabled' : '') + '><img src="' + petBIcon(ic) + '" alt="">' + tip + (n != null ? ' <small>' + n + '</small>' : '') + '</button>';
  petBar.innerHTML = '<button type="button" class="pb-x" data-b="x" aria-label="關閉">✕</button>' +
    '<div class="pb-h"><canvas class="pb-pt" width="24" height="24" data-pk="' + p.breed + '"></canvas><div class="pb-m" style="font-size:16px">' + p.name + '<small><span style="color:#d9667f">♥</span> 親密 ' + p.bond + '</small></div></div>' +
    '<div><div class="pb-r"><span>飽足</span><span>' + (left > 0 ? petHrs(p.fedUntil) : '肚子餓了！') + '</span></div><div class="pb-bar"><i style="width:' + pct + '%"></i></div></div>' +
    (function () { const lv = petLvOf(p.bond), nx = PET_LVB[lv], pv = PET_LVB[lv - 1], pc = nx ? Math.round((p.bond - pv) / (nx - pv) * 100) : 100;
      return '<div><div class="pb-r"><span>♥ 親密 Lv.' + lv + '</span><span>' + (nx ? p.bond + ' / ' + nx : '已滿級') + '</span></div><div class="pb-bar"><i style="width:' + pc + '%;background:#ffb04a"></i></div></div>'; })() +
    '<div class="pb-r"><span>飯碗</span><span>' + p.bowl + ' / 3 份</span></div>' +
    '<div class="pb-r"><span>今天可得親密</span><span>摸摸 ' + p.patLeft + '・玩耍 ' + p.playLeft + '</span></div>' +
    '<div class="pb-acts">' + btn('pat', 'pat', p.patLeft, p.patLeft < 1, '摸摸') + btn('feed', 'feed', bag, bag < 1, '餵食') + '</div>' +
    '<div class="pb-sec">🐾 外出時</div><div class="pb-seg">' + [['stay', '🏠 留在家', '只在家裡'], ['close', '🐾 貼身', '緊跟在後'], ['free', '🌿 自由走動', '在你附近逛']].map(m => '<button type="button" data-b="mode:' + m[0] + '" class="' + (petMode() === m[0] ? 'on' : '') + '">' + m[1] + '<small>' + m[2] + '</small></button>').join('') + '</div>' +
    '<div class="pb-sec">🎪 才藝<small> 身邊的人都看得到</small></div><div class="pb-tr">' + PET_TRICKS.map(x => { const ok = petLvOf(p.bond) >= x.lv; return '<button type="button" data-b="trick:' + x.k + '"' + (ok ? '' : ' disabled') + '>' + x.ic + ' ' + x.n + (ok ? '' : '<small>Lv.' + x.lv + '</small>') + '</button>'; }).join('') + '</div>';
  petPaint(petBar);
}
async function petBarOpen() {
  if (!ready || !me || paused()) return;
  try { petData = await enqueue(() => rpc('pet_get')); petMine = petData.pet || null; } catch (e) { toast(errText(e)); return; }
  if (!petMine) { toast('你還沒有寵物'); return; }
  petBarOn = true; petBar.hidden = false; petBarRender();
  clearInterval(petBarTimer); petBarTimer = setInterval(() => { if (!petBarOn) petBarClose(); else petBarRender(); }, 30000);
}
function petBarClose() { petBarOn = false; petBar.hidden = true; clearInterval(petBarTimer); }
function petBarToggle() { if (petBarOn) petBarClose(); else petBarOpen(); }
addEventListener('keydown', e => { if (e.key === 'Escape' && petBarOn) petBarClose(); });
petBar.addEventListener('pointerdown', e => e.stopPropagation());
petBar.addEventListener('click', async e => {
  const b = e.target.closest('[data-b]'); if (!b || b.disabled || petBarBusy) return;
  const k = b.dataset.b; if (k === 'x') { petBarClose(); return; }
  if (/^trick:/.test(k)) { petDoTrick(k.slice(6)); return; }
  if (/^mode:/.test(k)) {   // 外出設定：存到伺服器，其他玩家也看得到一致的結果
    const m = k.slice(5); if (m === petMode()) return;
    petBarBusy = true;
    try {
      const r = await enqueue(() => rpc('pet_set_mode', { p_mode: m }));
      const nm = (r && r.mode) || m; if (petMine) petMine.mode = nm; if (petData && petData.pet) petData.pet.mode = nm;
      toast(nm === 'stay' ? '牠會留在家裡等你' : nm === 'close' ? '牠會緊跟在你身後' : '牠會在你附近自由走動');
    } catch (er) { const msg = String(er && er.message); toast(/does not exist|PGRST202|42883/.test(msg) ? '這個設定還沒開放' : errText(er)); }
    petBarBusy = false; petBarRender(); return;
  }
  petBarBusy = true;
  try {
    const ob_ = petMine ? petMine.bond : 0;
    const r = await enqueue(() => rpc('pet_act', { p_kind: k }));
    if (r && r.inv) Object.assign(inv, r.inv);
    petData.pet = r.pet; petMine = r.pet; petHappy(k); petBondCheck(ob_, r.pet.bond); refreshHud(); petBarClose();   // 按完就關，才看得到寵物的動作
  } catch (er) { toast(errText(er)); if (k === 'pat' && /pet_tired/.test(String(er && er.message))) petEmote('angry', 2600); }
  petBarBusy = false; if (petBarOn) petBarRender();
});

/* ---------- 別人的寵物：同一個世界（廣場、家裡）看得到彼此的寵物 ---------- */
const petPub = {}, petRFol = {};
let petPubAt = 0, petPubBusy = false, petRT = 0;
function petPubRefresh(ids) {
  if (petPubBusy || !ids.length || Date.now() - petPubAt < 30000) return;
  petPubBusy = true; petPubAt = Date.now();
  rpc('pet_public_many', { p_uids: ids }).then(d => { Object.keys(petPub).forEach(k => delete petPub[k]); Object.assign(petPub, d || {}); }).catch(() => {}).then(() => { petPubBusy = false; });
}
function petRemoteEnts(now, ents) {
  if (!me || !syncScene() || scene === 'tarot' || scene === 'boat') return;
  const list = []; remotes.forEach(rp => { if (hereRp(rp)) list.push(rp); });
  if (!list.length) return;
  petPubRefresh(list.map(rp => rp.id));
  const t = Date.now(), dt = Math.min(100, t - (petRT || t)); petRT = t;
  list.forEach(rp => {
    const pb = petPub[rp.id]; if (!pb) return;
    const md = pb.mode === 'stay' || pb.mode === 'close' ? pb.mode : 'free';
    if (md === 'stay' && !(scene === 'house' && visiting && String(visiting.uid) === String(rp.id))) return;   // 留在家的寵物只在牠家裡看得到
    const L = petLookOf(pb.breed); if (!L) return;
    let f = petRFol[rp.id];
    if (!f || f.w !== rp.w) f = petRFol[rp.id] = { x: rp.x, y: rp.y, face: 1, still: t, w: rp.w };
    const dx = rp.x - f.x, dy = rp.y - f.y, d = Math.hypot(dx, dy);
    const trk = petTrickFrame(f, t);
    if (f.trick && Math.hypot(rp.x - f.trick.rx, rp.y - f.trick.ry) > 0.6) f.trick = null;   // 主人走開了就中斷
    if (trk) { f.moving = false; f.still = t; }
    else if (md === 'close') {
      const near = 1.15, stopAt = 1.0;   // 貼身：緊貼不離
      f.moving = d > near;
      if (f.moving) { const st = Math.min(d - stopAt, 5.2 * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; f.still = t; }
    } else { petFreeStep(f, t, dt, rp.x, rp.y, 3); if (f.moving) f.still = t; }
    const happy = t < (f.happyUntil || 0);
    if (happy) f.still = t;
    const pose = trk ? trk.pose : happy ? 'happy' : f.moving ? 'side' : t - f.still > 20000 ? 'sleep' : 'front';
    const jump = trk ? trk.jump : happy ? Math.round(Math.abs(Math.sin((f.happyUntil - t) / 110)) * 5) : 0;
    const bx = Math.round((f.x + (trk ? trk.ox : 0)) * T), by = Math.round((f.y + (trk ? trk.oy : 0)) * T);
    ents.push({ y: f.y + 0.01, draw: () => { if (trk) petTrickDraw(L, bx, by, jump, pose, now, trk.dir ? trk.dir : f.face, trk); else petB(L, bx, by - jump, { pose, now, dir: f.face }); } });
    if (trk && (trk.k === 'shake' || trk.k === 'fire')) ents.push({ y: f.y + 5, draw: () => petTrickTop(trk, bx, by, jump, trk.dir ? trk.dir : f.face) });
    if (f.emo && f.emo.until > t) {
      const e = f.emo, age = t - e.at, bob = Math.round(Math.sin(age / 260)), pop_ = age < 160 ? 3 : 0;
      ents.push({ y: f.y + 6, draw: () => { petEmoDraw(e.k, bx + 1, by - 15 - jump + bob + pop_); } });
    }
  });
}
/* ---------- 朋友摸寵物：面向別人的寵物按動作鍵，大家都看得到（只有表情和愛心，不加親密度、沒有次數限制） ---------- */
let petTouchAt = 0;
function petTouchSend(owner) {
  try { if (syncScene() && net && net.ok) net.ch.send({ type: 'broadcast', event: 'ptp', payload: { i: myUid, to: owner } }); } catch (e) { /* 略過 */ }
}
function petRemoteAt(x, y) {   // 這一格上有沒有別人的寵物（玩家本人站在這格時以玩家為優先，呼叫端先判斷）
  if (!me || !syncScene() || scene === 'tarot' || scene === 'boat') return null;
  let hit = null;
  remotes.forEach(rp => {
    if (!hereRp(rp) || !petPub[rp.id]) return;
    const f = petRFol[rp.id]; if (!f || f.w !== rp.w) return;
    if (Math.round(f.x) === x && Math.round(f.y) === y) hit = rp;
  });
  if (!hit && petHW && petHW.vis && petHW.f && Math.round(petHW.f.x) === x && Math.round(petHW.f.y) === y) hit = { id: petHW.uid, host: 1 };   // 屋主不在線、在家等待的寵物
  return hit;
}
function petShowTouched(f, t) {
  f.happyUntil = t + 2400; f.still = t;
  f.emo = { k: 'love', at: t, until: t + 2400 };
  if (typeof sparkle === 'function') sparkle(f.x, f.y - 0.4, '#ff9db8');
}
function petTouchRemote(rp) {
  if (!ready || !me || !rp) return;
  const now = performance.now(); if (now - petTouchAt < 700) return;   // 只擋連按，不限每天次數
  petTouchAt = now;
  const f = rp.host ? (petHW && petHW.f) : petRFol[rp.id]; if (f) petShowTouched(f, Date.now());
  myEmo = { id: 'heart', at: now };   // 自己頭上也冒小愛心
  petTouchSend(rp.id);
  if (visiting && String(rp.id) === String(visiting.uid)) petVisitTouchLog(rp.host ? (petHW && petHW.pb) : petPub[rp.id]);
}
function onPetTouch(p) {
  if (!p || typeof p !== 'object' || typeof p.i !== 'string' || typeof p.to !== 'string') return;
  const from = remotes.get(p.i); if (!from || !hereRp(from)) return;
  const t = Date.now();
  if (p.to === myUid) { if (petShown()) { petFol.happyUntil = t + 2400; petFol.still = t; petEmote('love', 2400); if (typeof sparkle === 'function') sparkle(petFol.x, petFol.y - 0.4, '#ff9db8'); } }
  else if (petHW && petHW.vis && petHW.f && String(petHW.uid) === p.to) petShowTouched(petHW.f, t);   // 屋主不在線：大家都看到等待中的寵物被摸
  else { const o = remotes.get(p.to), f = petRFol[p.to]; if (!o || !f || !hereRp(o)) return; petShowTouched(f, t); }
  if (p.i !== p.to) from.emo = { id: 'heart', at: performance.now() };   // 摸的人頭上冒小愛心
}

/* ---------- 去朋友家 ----------
   自己的寵物跟著去：跟隨 A（跟著走）／B（坐腳邊），大家看到的一樣，每半小時隨機換一次。
   屋主不在線時，屋主的寵物在家等待：A 角落的小墊子睡覺／B 飯碗玩具旁打盹／C 門墊旁看門（隨機），訪客一進門就跑去迎接。
   朋友互動：面向寵物按動作鍵＝摸摸；面向玩具＝陪玩；面向飯碗＝餵點心（用自己的飼料，要伺服器的 pet_visit_feed）。 */
const petHash = s => { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const petVisitMode = uid => petHash(uid + '|' + worldKey() + '|' + Math.floor(Date.now() / 1800000)) % 2 ? 'feet' : 'walk';
function petFeetSpot() {   // 玩家身後一格（走不到就貼在玩家那格）
  const o = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[pl.face] || [0, 1];
  const x = pl.x + o[0], y = pl.y + o[1];
  return walkable(x, y) ? [x, y] : [pl.x, pl.y];
}
let petHW = null, petFeedBusy = false, petVLAt = 0, petPlayAtT = 0;
function petEmoteOn(f, k, ms) { const t = Date.now(); f.emo = { k, at: t, until: t + (ms || 2200) }; }
function petHostPb() { return (petHW && petHW.vis && petHW.pb) || (visiting && petPub[visiting.uid]) || null; }
function petHostSpot(seed) {   // 等待的位置：有飯碗／玩具才有「玩具旁」可選；否則在 小墊子（角落）和 門墊旁 之間隨機
  const its = ((house && house.items) || []).filter(i => /^pet(toy|bowl)/.test(i.k));
  const kinds = ['bed', 'door']; if (its.length) kinds.push('play');
  const type = kinds[seed % kinds.length];
  if (type === 'play') { const gl = petMakeGoal(its[(seed >> 3) % its.length]); if (gl) return { type, x: gl.x, y: gl.y }; }
  if (type === 'bed') {
    const c = [[RX + RW - 1, RY + 1], [RX, RY + 1], [RX + RW - 1, RY + RH - 2], [RX, RY + RH - 2]];
    for (let i = 0; i < 4; i++) { const q = c[(i + seed) % 4]; if (walkable(q[0], q[1])) return { type, x: q[0], y: q[1] }; }
  }
  const d = [[RX + DX + 2, RY + RH - 1], [RX + DX - 1, RY + RH - 1], [RX + DX + 2, RY + RH - 2], [RX + DX - 1, RY + RH - 2]];
  for (let i = 0; i < d.length; i++) if (walkable(d[i][0], d[i][1])) return { type: 'door', x: d[i][0], y: d[i][1] };
  return null;
}
function petBcast(event, payload) { try { if (net && net.ok && net.ch) net.ch.send({ type: 'broadcast', event, payload }); } catch (e) { /* 略過 */ } }
function petHostEnts(now, ents) {
  if (!visiting || scene !== 'house' || !ready || !me || !house) { petHW = null; return; }
  const hid = visiting.uid, t = Date.now();
  if (!petHW || petHW.v !== visiting) {
    const W0 = petHW = { uid: hid, v: visiting, since: t, vis: false, pb: null, spot: null, f: null, wel: null, welDone: false, sent: false, seed: petHash(hid + '|' + Math.floor(t / 1800000)) };
    rpc('pet_public_many', { p_uids: [hid] }).then(d => { W0.pb = (d && d[hid]) || false; }).catch(() => { W0.pb = false; });
  }
  const W = petHW, hp = remotes.get(hid), online = !!(hp && hereRp(hp));
  if (t - W.since < 2500 || !net || !net.ok) return;   // 剛進門先等一下，確認屋主在不在線
  if (!W.sent) { W.sent = true; petBcast('pwl', { i: myUid, h: hid }); }   // 通知屋子裡的人：有訪客進門了（屋主在線，他的寵物會自己歡迎）
  if (online) { W.vis = false; W.f = null; W.wel = null; return; }
  if (!W.pb) return;
  const L = petLookOf(W.pb.breed); if (!L) return;
  if (!W.f) {
    const sp = petHostSpot(W.seed); if (!sp) return;
    W.spot = sp; W.f = { x: sp.x, y: sp.y, face: 1, still: t, w: worldKey(), nextEmo: t + 3000 }; W.vis = true;
    if (!W.welDone) { W.welDone = true; W.wel = { to: myUid, t0: t }; }
  }
  const f = W.f, dt = Math.min(100, t - (W.t || t)); W.t = t;
  let tg = [W.spot.x, W.spot.y], stop = 0.05, play = null;
  if (W.wel) {   // 迎接：跑到訪客旁邊，跳起來冒愛心，再回去
    const who = W.wel.to === myUid ? pl : remotes.get(W.wel.to);
    if (!who || t - W.wel.t0 > 12000) W.wel = null;
    else {
      tg = [who.x, who.y]; stop = 1.05;
      if (!W.wel.at && Math.hypot(who.x - f.x, who.y - f.y) < 1.5) { W.wel.at = t; petShowTouched(f, t); }
      if (W.wel.at && t - W.wel.at > 3000) W.wel = null;
    }
  }
  const gl = !W.wel ? f.goal : null;
  if (gl) {   // 朋友叫牠去玩玩具／吃點心
    if (!gl.at) {
      if (Math.hypot(gl.x - f.x, gl.y - f.y) < 0.06) { gl.at = t; gl.px0 = Math.round(f.x * T); gl.py0 = Math.round(f.y * T); petEmoteOn(f, gl.k === 'petbowl' ? 'yum' : 'happy', 2400); }
      else tg = [gl.x, gl.y];
    }
    if (gl.at) { play = petPlayFrame(f, gl, t); if (play.done) { f.goal = null; play = null; f.still = t; } }
  }
  if (!play) {
    const dx = tg[0] - f.x, dy = tg[1] - f.y, d = Math.hypot(dx, dy), lim = stop > 0.1 ? 1.0 : 0;
    f.moving = d > stop;
    if (f.moving) { const st = Math.min(d - lim, 5.2 * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; f.still = t; }
  } else f.moving = false;
  if (!play && !f.moving && !W.wel && t > f.nextEmo) { f.nextEmo = t + 5000 + Math.random() * 3000; petEmoteOn(f, W.spot.type === 'door' ? 'dots' : 'sleepy', 2200); }
  const happy = t < (f.happyUntil || 0);
  const sleeping = !play && !f.moving && !W.wel && !happy && W.spot.type !== 'door' && t - f.still > 2500;
  const pose = happy ? 'happy' : f.moving ? 'side' : sleeping ? 'sleep' : 'front';
  const jump = happy ? Math.round(Math.abs(Math.sin((f.happyUntil - t) / 110)) * 5) : 0;
  let bx = Math.round(f.x * T), by = Math.round(f.y * T);
  if (play) { bx = play.px; by = play.py; }
  if (W.spot.type === 'bed') { const sx = W.spot.x * T, sy = W.spot.y * T; ents.push({ y: W.spot.y + 0.005, draw: () => { r('#b9704a', sx - 3, sy + 9, 22, 7); r('#e8b894', sx - 2, sy + 8, 20, 6); } }); }
  ents.push({ y: play ? play.sortY : f.y + 0.01, draw: () => { if (play) { play.draw(L, now); return; } petB(L, bx, by - jump, { pose, now, dir: f.face }); } });
  if (f.emo && f.emo.until > t) {
    const e = f.emo, age = t - e.at, bob = Math.round(Math.sin(age / 260)), pop_ = age < 160 ? 3 : 0;
    ents.push({ y: f.y + 6, draw: () => { petEmoDraw(e.k, bx + 1, by - 15 - jump + bob + pop_); } });
  }
}
function onPetWelcome(p) {   // 'pwl'：有訪客進屋
  if (!p || typeof p.i !== 'string' || typeof p.h !== 'string' || p.i === myUid) return;
  const from = remotes.get(p.i); if (!from || !hereRp(from)) return;
  const t = Date.now();
  if (p.h === myUid) { if (!visiting && scene === 'house' && petShown()) { petFol.happyUntil = t + 2600; petFol.still = t; petEmote('alert', 900); setTimeout(() => petEmote('love', 2400), 900); } return; }   // 我是屋主：寵物歡迎來訪的朋友
  const W = petHW; if (W && W.vis && String(W.uid) === p.h && !W.wel) W.wel = { to: p.i, t0: t };   // 屋主不在線：等待的寵物跑去迎接新來的人
}
function petApplyGoal(hid, it) {   // 叫屋主的寵物去玩玩具／吃飯碗：屋主在線由屋主那邊演，不在線由訪客這邊演
  if (!house || !it || !/^pet(toy|bowl)/.test(it.k)) return false;
  const gl = petMakeGoal(it); if (!gl) return false;
  const t = Date.now();
  if (String(hid) === String(myUid) && !visiting) { if (!petShown() || petFol.goal) return false; petFol.goal = gl; petFol.nextGoal = t + 25000; petFol.fDots = petFol.fBall = 1; petEmote('alert', 1200); return true; }
  const W = petHW; if (W && W.vis && W.f && String(W.uid) === String(hid) && !W.f.goal && !W.wel) { W.f.goal = gl; petEmoteOn(W.f, 'alert', 1200); return true; }
  return false;
}
function onPetGoal(p) {   // 'pgl'
  if (!p || typeof p.i !== 'string' || typeof p.h !== 'string' || p.i === myUid) return;
  const from = remotes.get(p.i); if (!from || !hereRp(from)) return;
  const it = house && house.items && house.items.find(x => String(x.id) === String(p.id));
  if (it) petApplyGoal(p.h, it);
}
function petVisitTouchLog(pb) { if (!visiting || Date.now() - petVLAt < 300000) return; petVLAt = Date.now(); visitLog('other', '摸了' + ((pb && pb.name) || '寵物')); }
function petVisitPlay(it) {   // 在朋友家面向玩具按動作鍵：陪牠玩
  if (!visiting) return;
  const pb = petHostPb(); if (!pb) { toast('這間屋子的主人還沒有寵物'); return; }
  const now = Date.now(); if (now - petPlayAtT < 3000) return; petPlayAtT = now;
  petBcast('pgl', { i: myUid, h: visiting.uid, id: it.id });
  petApplyGoal(visiting.uid, it);
  toast((pb.name || '牠') + '跑去玩了'); visitLog('other', '陪' + (pb.name || '牠') + '玩');
}
async function petVisitFeed(it) {   // 在朋友家面向飯碗按動作鍵：倒一份點心（用自己的飼料）
  if (!visiting || petFeedBusy) return;
  const pb = petHostPb(); if (!pb) { toast('這間屋子的主人還沒有寵物'); return; }
  petFeedBusy = true;
  try {
    const r_ = await enqueue(() => rpc('pet_visit_feed', { p_owner: visiting.uid }));
    if (r_ && r_.inv) Object.assign(inv, r_.inv);
    toast('把點心倒進' + (pb.name || '牠') + '的碗裡了'); refreshHud();
    petBcast('pgl', { i: myUid, h: visiting.uid, id: it.id });
    petApplyGoal(visiting.uid, it);
    visitLog('other', '餵了' + (pb.name || '牠') + '點心');
  } catch (er) {
    const m = String(er && er.message);
    toast(/not_enough_items/.test(m) ? '背包裡沒有飼料，到寵物店買吧' : /pet_fed_today|pet_visit_cap/.test(m) ? '今天已經餵過牠了，明天再來吧' : /does not exist|PGRST202|42883/.test(m) ? '餵點心還沒開放' : errText(er));
  }
  petFeedBusy = false;
}

/* 家裡的飯碗：面向它按動作鍵，把背包的飼料倒進去（碗最多存 3 份，餓了寵物會自己吃） */
async function petBowlAct() {
  if (!petMine) { toast('你還沒有寵物，先到領養店領養一隻吧'); return; }
  if (petBarBusy) return; petBarBusy = true;
  try {
    const r = await enqueue(() => rpc('pet_act', { p_kind: 'bowl' }));
    if (r && r.inv) Object.assign(inv, r.inv);
    petMine = r.pet; if (petData) petData.pet = r.pet;
    const ob2 = petMine ? petMine.bond : 0; toast('飼料倒進飯碗了（' + r.pet.bowl + '/3）'); petHappy('bowl'); petBondCheck(ob2, r.pet.bond); refreshHud();
  } catch (er) { toast(have('p:food') < 1 && /not_enough_items/.test(String(er && er.message)) ? '背包裡沒有飼料，到寵物店買吧' : errText(er)); }
  petBarBusy = false; if (petBarOn) petBarRender();
}
/* 在自己家裡，寵物閒著時會自己跑去玩玩具、逛飯碗；每種玩具有自己的玩法 */
function petHomeGoal(f, t) {
  if (scene !== 'house' || visiting || !house || !house.items || !petMine) { f.goal = null; return null; }
  if (f.goal) return f.goal;
  if (t < f.nextGoal || t - f.moveAt < 4000) return null;
  const its = house.items.filter(i => /^pet(toy|bowl)/.test(i.k));
  f.nextGoal = t + 20000 + Math.random() * 25000;
  if (!its.length) return null;
  return (f.goal = petMakeGoal(its[Math.floor(Math.random() * its.length)]));
}
/* 依家具建立「去玩」的目標（隨機挑一種動作）；走不到就回傳 null */
function petMakeGoal(it) {
  const d = dimsOf(it.k, it.r | 0); if (!d) return null;
  const tx = RX + it.x, ty = RY + it.y, gy = ty + d.h - 1, v = 1 + Math.floor(Math.random() * 3);
  let gx, gyy;
  if (it.k === 'pettoyd' && v === 2) { gx = tx; gyy = gy; }        // 躲貓貓：躲在隧道後面，不必走得進去
  else if (it.k === 'pettoyb' || it.k === 'petbowl') { gx = tx; gyy = gy + 1; }   // 貓跳台、飯碗：站在正下方
  else { gx = tx + d.w; gyy = gy; }                                // 其他：站在右邊
  if (!(it.k === 'pettoyd' && v === 2) && !walkable(gx, gyy)) return null;
  return { x: gx, y: gyy, k: it.k, v, at: 0, ox: tx * T, oy: ty * T, w: d.w, h: d.h, gy: gy };
}
/* 面向玩具按動作鍵：叫寵物馬上過去玩 */
function petPlayAt(it) {
  if (!petMine) { toast('你還沒有寵物，先到領養店領養一隻吧'); return; }
  if (!petShown()) return;
  if (petFol.goal) { toast(petMine.name + '正在玩呢'); return; }
  const gl = petMakeGoal(it);
  if (!gl) { toast(petMine.name + '走不到這個玩具旁邊，換個位置擺吧'); return; }
  petFol.goal = gl; petFol.nextGoal = Date.now() + 25000; petFol.fDots = petFol.fBall = 1;
  petEmote('alert', 1200);
}
function petGoalArrive(f, gl, t) {
  if (gl.at) return;
  gl.at = t; gl.px0 = Math.round(f.x * T); gl.py0 = Math.round(f.y * T);
  if (gl.k === 'petbowl') { petEmote('yum', 2400); return; }
  if (petMine && petMine.playLeft > 0) {
    petEmote('happy', 2400);
    const ob_ = petMine.bond;
    enqueue(() => rpc('pet_act', { p_kind: 'play' })).then(r => { petMine = r.pet; if (petData) petData.pet = r.pet; petBondCheck(ob_, r.pet.bond); if (petBarOn) petBarRender(); }).catch(() => {});
  } else { gl.noReward = true; petEmote('happy', 2400); }   // 今天的親密度次數用完：照樣玩，只是不加親密度，玩完冒汗
}
/* ---------- 四種玩具 × 三種動作（每次隨機挑一種） ---------- */
function petXf(L, px, py, o) {   // 可變形的寵物：rot 只用 90 度倍數（像素不糊），sx／sy 做拉長壓扁
  o = o || {}; const cx = px + 8, cy = py + (o.rot ? 10 : 14);
  g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot * Math.PI / 180); g.scale(o.sx || 1, o.sy || 1); g.translate(-cx, -cy);
  petB(L, px, py, { pose: o.pose || 'front', dir: o.dir || 1, now: o.now || 0, happy: !!o.happy }); g.restore();
}
function petOutside(x0, x1, fn) {   // 只畫隧道範圍以外的部分（在隧道裡面就被遮住）
  g.save(); g.beginPath(); g.rect(-9999, -9999, 9999 + x0 + 1, 19998); g.clip(); fn(); g.restore();
  g.save(); g.beginPath(); g.rect(x1 - 1, -9999, 9999, 19998); g.clip(); fn(); g.restore();
}
function petKf(a, u, step) {   // 關鍵格之間做平滑插值，回傳每個欄位
  const i = Math.max(0, Math.min(a.length - 1, u / step)), i0 = Math.floor(i), i1 = Math.min(a.length - 1, i0 + 1), k = i - i0;
  return a[i0].map((v, j) => v + (a[i1][j] - v) * k);
}
const petSpk = (x, y) => { r('#ffe680', x, y - 1, 1, 3); r('#ffe680', x - 1, y, 3, 1); };
const PET_DUR = { pettoya: [0, 5200, 5200, 5000], pettoyb: [0, 5400, 5200, 5400], pettoyc: [0, 4800, 5000, 5000], pettoyd: [0, 5000, 5400, 4200], petbowl: [0, 2800, 2800, 2800] };
const PET_BALL = (x, y) => { r('rgba(90,60,40,.18)', x, y + 5, 5, 1); ob('#ff7a6c', '#b8403a', x, y, 5, 5); r('#ffd34d', x, y + 2, 5, 1); };
const PET_YARN = (x, y, sq) => { ob('#8f7fe0', '#6a5cc0', x, y + sq, 6, 6); r('#b9acf2', x + 1, y + 1 + sq, 2, 1); };
function petPlayFrame(f, gl, t) {
  const u = t - gl.at, base = gl.gy * T, ox = gl.ox, oy = gl.oy, v = gl.v || 1, dur = gl.short ? 1600 : (PET_DUR[gl.k] || [0, 4000, 4000, 4000])[v];
  if (u > dur) return { done: true };
  const R_ = { done: false, sortY: f.y + 0.01 };
  const put = (px, py, draw, face) => { f.x = px / T; if (face) f.face = face; return Object.assign(R_, { px, py, draw }); };
  const still = (px, py) => put(px, py, (L, now) => { petB(L, px, py, { pose: 'front', now, dir: f.face }); });
  if (gl.short || gl.k === 'petbowl') return still(gl.px0, gl.py0 + (gl.k === 'petbowl' ? (Math.floor(u / 300) % 2) : 0));
  const AP = 500;   // 走到定位／離開用的過場（毫秒）
  const tween = (S, mid, end) => {   // 前 AP：從原位走到起點；最後 AP：走回去（end 為空就不走回）
    if (u < AP) { const px = Math.round(petLerp(gl.px0, S[0], u / AP)), py = Math.round(petLerp(gl.py0, S[1], u / AP)); return put(px, py, (L, now) => { petB(L, px, py, { pose: 'side', now, dir: S[0] >= gl.px0 ? 1 : -1 }); }, S[0] >= gl.px0 ? 1 : -1); }
    if (end && u > dur - AP) { const k = (u - (dur - AP)) / AP, px = Math.round(petLerp(end[0], gl.px0, k)), py = Math.round(petLerp(end[1], gl.py0, k)); return put(px, py, (L, now) => { petB(L, px, py, { pose: 'side', now, dir: gl.px0 >= end[0] ? 1 : -1 }); }); }
    return mid(u - AP);
  };
  /* ===== 玩具籃 ===== */
  if (gl.k === 'pettoya') {
    if (v === 1) {   // 叼球甩頭
      const S = [ox + 18, base];
      return tween(S, uu => {
        const sh = uu < 1400 ? 0 : [1, -1, 1, -1][Math.floor(uu / 220) % 4], px = S[0] + sh, mx = px - 2, my = base + 8;
        const k = Math.max(0, Math.min(1, (uu - 600) / 600)), bx = Math.round(uu < 600 ? ox + 3 : petLerp(ox + 3, mx, k)), by = Math.round(uu < 600 ? base + 3 : petLerp(base + 3, my, k));
        return put(px, S[1], (L, now) => { petB(L, px, S[1], { pose: 'side', now, dir: -1 }); PET_BALL(bx, by); if (uu > 1500 && sh > 0) petSpk(px - 6, base - 2); }, -1);
      }, S);
    }
    if (v === 2) {   // 追球
      return (() => {
        const ph = u / 700, bx = Math.round(ox + T * gl.w + 4 + 24 * (0.5 - 0.5 * Math.cos(ph))), dir = Math.sin(ph) >= 0 ? 1 : -1, px = bx - 11 * dir;
        return put(px, base, (L, now) => { petB(L, px, base, { pose: 'side', now, dir }); PET_BALL(bx, base + 9); }, dir);
      })();
    }
    const S = [ox + 22, base];   // 翻肚打滾
    return tween(S, uu => {
      const k = Math.floor(uu / 700) % 6, rot = [0, 90, 180, 180, 270, 0][k];
      return put(S[0], S[1], (L, now) => { petXf(L, S[0], S[1], { pose: 'front', rot, happy: k > 1, now }); if (k === 2 || k === 3) { petSpk(S[0] - 4, base - 4); petSpk(S[0] + 18, base - 2); } });
    }, S);
  }
  /* ===== 貓跳台（1×2） ===== */
  if (gl.k === 'pettoyb') {
    if (v === 1) {   // 爬上頂層，坐著，再爬下來
      const tx = ox + 2, ty = oy - 10; let px, py, pose = 'front';
      if (u < 1000) { px = petLerp(gl.px0, tx, u / 1000); py = petLerp(gl.py0, ty, u / 1000); pose = 'side'; }
      else if (u < 4400) { px = tx; py = ty; }
      else { px = petLerp(tx, gl.px0, (u - 4400) / 1000); py = petLerp(ty, gl.py0, (u - 4400) / 1000); pose = 'side'; }
      px = Math.round(px); py = Math.round(py);
      const dir = u < 1000 ? (tx >= gl.px0 ? 1 : -1) : u < 4400 ? -1 : (gl.px0 >= tx ? 1 : -1);
      return put(px, py, (L, now) => { petB(L, px, py, { pose, now, dir }); }, dir);
    }
    if (v === 2) {   // 抓柱磨爪
      const S = [ox + 12, base - 1];
      return tween(S, uu => {
        const k = Math.floor(uu / 350) % 6, py_ = oy + [10, 13, 16, 13, 10, 13][k];
        return put(S[0], S[1], (L, now) => { petXf(L, S[0], S[1], { pose: 'side', dir: -1, sy: 1.12, now }); r('#fff3d6', ox + 10, py_, 2, 2); if (k % 2 === 0) { r('rgba(255,255,255,.8)', ox + 9, py_ + 3, 1, 1); r('rgba(255,255,255,.8)', ox + 8, py_ + 5, 1, 1); } }, -1);
      }, S);
    }
    const KF = [[-18, 16], [-10, 8], [2, 0], [12, 0], [14, 10], [16, 16]], PS = ['front', 'side', 'front', 'side', 'side', 'front'], PD = [1, 1, 1, -1, -1, -1];   // 跳上跳下
    const S = [ox + KF[0][0], base];
    return tween(S, uu => {
      const sp = 650, k = petKf(KF, uu, sp), idx = Math.min(5, Math.floor(uu / sp)), arc = Math.sin(Math.PI * ((uu / sp) % 1)) * (uu < 5 * sp ? 6 : 0);
      const px = Math.round(ox + k[0]), py = Math.round(oy + k[1] - arc);
      return put(px, py, (L, now) => { petB(L, px, py, { pose: PS[idx], dir: PD[idx], now }); }, PD[idx]);
    }, [ox + KF[5][0], base]);
  }
  /* ===== 拔河繩與毛線球 ===== */
  if (gl.k === 'pettoyc') {
    if (v === 1) {   // 拔河
      const k = Math.floor(u / 350) % 6, dx = [0, 2, 3, 2, 3, 1][k], px = ox + 26 + dx;
      return put(px, base, (L, now) => {
        petB(L, px, base, { pose: 'side', now, dir: -1 });
        const x1 = ox + 14, y1 = base + 8, x2 = px + 2, y2 = base + 7 + (k % 2), n = Math.max(1, x2 - x1);
        for (let i = 0; i <= n; i++) r('#ff7a6c', x1 + i, Math.round(y1 + (y2 - y1) * i / n), 1, 1);
        r('rgba(120,90,70,.6)', px + 16, base + 4, 3, 1); r('rgba(120,90,70,.6)', px + 17, base + 7, 4, 1); r('rgba(120,90,70,.6)', px + 16, base + 10, 3, 1);
      }, -1);
    }
    if (v === 2) {   // 撲毛線球
      const S = [ox + 22, base];
      return tween(S, uu => {
        const k = Math.floor(uu / 500) % 6, F = [[0.78, 0], [0.78, 0], [1.15, -9], [1.1, -14], [0.8, 0], [1, 0]][k];
        return put(S[0], S[1], (L, now) => { PET_YARN(ox + 34, base + 8, k >= 4 ? 1 : 0); petXf(L, S[0], S[1], { pose: 'side', dir: 1, sy: F[0], now }); if (k === 4) { petSpk(ox + 38, base + 4); petSpk(ox + 30, base + 6); } }, 1);
      }, S);
    }
    const KP = [[12, 20], [18, 26], [26, 34], [34, 42], [28, 34], [20, 26]];   // 滾毛線球：[寵物 x, 球 x]
    const S = [ox + KP[0][0], base];
    return tween(S, uu => {
      const sp = 650, k = petKf(KP, uu % (5 * sp), sp), px = Math.round(ox + k[0]), bx = Math.round(ox + k[1]), dir = (uu % (5 * sp)) < 3 * sp ? 1 : -1;
      return put(px, base, (L, now) => { for (let i = 0; i <= bx - (ox + 16); i++) r('#8f7fe0', ox + 16 + i, base + 10 + Math.round(2 * i / Math.max(1, bx - ox - 16)), 1, 1); PET_YARN(bx, base + 9, 0); petB(L, px, base, { pose: 'side', now, dir }); }, dir);
    }, [ox + KP[0][0], base]);
  }
  /* ===== 條紋隧道（2×1） ===== */
  if (gl.k === 'pettoyd') {
    if (v === 2) {   // 躲貓貓
      const k = Math.floor(u / 900) % 6, hh = [14, 9, 3, 3, 9, 14][k], px = ox + 20, py = oy - 10 + hh;
      return Object.assign(put(px, py, (L, now) => {
        g.save(); g.beginPath(); g.rect(px - 4, oy - 26, 24, 34); g.clip(); petB(L, px, py, { pose: 'front', now, happy: k === 3 }); g.restore();
      }, 1), { sortY: gl.gy + 0.005 });
    }
    if (v === 1) {   // 鑽進去從另一頭出來
      const KF = [[32, 1], [24, 1], [14, 1], [2, 1], [-12, 1], [-16, 1]];
      return (() => {
        const k = petKf(KF, Math.min(u, 4999), 800), px = Math.round(ox + k[0]), done = u > 4300;
        return put(px, base, (L, now) => { petOutside(ox, ox + T * gl.w, () => petB(L, px, base, { pose: done ? 'front' : 'side', dir: -1, now, happy: done })); }, -1);
      })();
    }
    // 衝出隧道
    if (u < 700) return put(ox + 10, base, () => { r('#ffe680', ox + 14, base - 6, 1, 3); r('#ffe680', ox + 14, base - 2, 1, 1); });
    const KD = [[22, 0, 1.1, 1], [34, -2, 1.25, 0.9], [42, -10, 1.15, 0.95], [42, 0, 0.9, 1.1], [40, 0, 1, 1]];
    const k = petKf(KD, Math.min(u - 700, 3999), 700), px = Math.round(ox + k[0]), py = Math.round(base + k[1]), late = u > 2600;
    return put(px, py, (L, now) => {
      petOutside(ox, ox + T * gl.w, () => petXf(L, px, py, { pose: late ? 'front' : 'side', dir: 1, sx: k[2], sy: k[3], happy: late, now }));
      if (u > 700 && u < 2300) { r('rgba(120,90,70,.6)', ox - 6, base + 4, 3, 1); r('rgba(120,90,70,.6)', ox - 5, base + 7, 4, 1); r('rgba(120,90,70,.6)', ox - 6, base + 10, 3, 1); }
      if (u > 3800) petSpk(ox + 58, base - 2);
    }, 1);
  }
  return { done: true };
}

/* 快捷列的寵物鈕：有寵物才顯示 */
setInterval(() => { const on = !!petMine; document.querySelectorAll('[data-k="pet"]').forEach(b => { if (b.hidden === on) b.hidden = !on; }); }, 1500);
