/* 寵物店：蓋店（捐材料）→ 領養 → 買飼料／玩具／飯碗 → 照顧。後端是 pet.sql 的 pet_* 函式。
   阿喵姊姊（領養店店員）按動作鍵就會打開這個面板。 */
Object.assign(ERR, {
  pet_locked: '寵物店還在蓋，等你把材料湊齊、付完工錢就能領養囉', pet_built: '寵物店已經蓋好了', pet_item_full: '這種材料已經夠了，換別種吧', pet_daily_full: '今天這種材料捐滿了，明天再來', pet_mat_missing: '材料還沒湊齊',
  pet_has: '你已經有一隻寵物了，要換的話先送回領養處', pet_none: '你還沒有寵物', pet_owned: '你已經有這個了',
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
  petStoryAt = 0; petCare = care === true; petOpen = true; pressed.length = 0; petMsg = ''; petPick = null; petData = null;
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
let petStoryAt = 0;
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
  if (!d.pet && !d.met && !care) {   // 第一次進來：先演小劇情（窗外的腳印），演完才開放領養
    const ln = PET_STORY[Math.min(petStoryAt, PET_STORY.length - 1)], last = petStoryAt >= PET_STORY.length - 1;
    if (ln[0] === 'npc') h += say(ln[1]);
    else if (ln[0] === 'me') h += '<div class="row" style="justify-content:flex-end"><div class="meta" style="text-align:right"><b>你</b><small style="display:block;margin-top:4px;line-height:1.5">' + ln[1] + '</small></div></div>';
    else h += '<p style="margin:14px 0;text-align:center;font-style:italic;opacity:.8">' + ln[1] + '</p>';
    h += '<button type="button" class="btn wide" data-pa="story">' + (last ? '好，去看看牠們' : '繼續 ▶') + '</button>';
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
  h += '<div class="row">' + petCv(p.breed) + '<div class="meta"><b>' + p.name + '</b><small style="display:block">' + (L ? L.breed + '・' + L.coat : '') + '</small>' +
    '<small style="display:block">' + (p.fed ? '飽足中・約剩 ' + petHrs(p.fedUntil) : '肚子餓了') + '　飯碗存量 ' + p.bowl + '　親密 ' + p.bond + '</small></div></div>';
  const q = (a, t, dis) => '<button type="button" class="btn" data-pa="' + a + '"' + (dis ? ' disabled' : '') + '>' + t + '</button>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    q('act', '摸摸（今天剩 ' + p.patLeft + '）', p.patLeft < 1).replace('data-pa="act"', 'data-pa="act" data-k="pat"') +
    q('act', '餵飼料（背包 ' + have('p:food') + '）', have('p:food') < 1).replace('data-pa="act"', 'data-pa="act" data-k="feed"') + '</div>';
  if (care) { h += close; petCard.innerHTML = h; petPaint(petCard); return; }
  h += '<div class="shop-h"><h2 style="font-size:18px">商店</h2></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    '<button type="button" class="btn" data-pa="buy" data-k="food" data-n="1"' + (me.coins < c.food ? ' disabled' : '') + '>飼料 ×1　' + c.food + ' G</button>' +
    '<button type="button" class="btn" data-pa="buy" data-k="food" data-n="10"' + (me.coins < c.food * 10 ? ' disabled' : '') + '>飼料 ×10　' + c.food * 10 + ' G</button></div>' +
    '<div class="shop-h"><h2 style="font-size:16px">寵物家具</h2><small>擺在家裡：飯碗可倒飼料，玩具牠會自己去玩</small></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">' + PET_GOODS.map(([k, key, nm, dim]) => {
      const own = petOwns(key), price = c[k];
      return '<button type="button" class="btn ' + (own ? 'ghost' : '') + '" data-pa="buy" data-k="' + k + '" data-n="1" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px"' + (own || me.coins < price ? ' disabled' : '') + '>' +
        '<img src="' + petIcon(key, dim) + '" style="height:' + 28 * dim[1] + 'px;image-rendering:pixelated"><b>' + nm + '</b><small>' + dim[0] + '×' + dim[1] + '　' + (own ? '已擁有' : price + ' G') + '</small></button>';
    }).join('') + '</div>' +
    '<small>飼料耐飽 ' + c.hours + ' 小時；飯碗最多存 3 份，餓了會自己吃。</small>' +
    '<button type="button" class="btn ghost wide" data-pa="return">送回領養處</button>' + close;
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
async function petCall(name, args, ok) {
  if (petBusy) return; petBusy = true;
  try {
    const r = await enqueue(() => rpc(name, args));
    if (r && r.inv) Object.assign(inv, r.inv);
    if (r && typeof r.coins === 'number') me.coins = r.coins;
    if (ok) ok(r);
    refreshHud();
  } catch (e) { petMsg = errText(e); toast(petMsg); }
  petBusy = false; await petLoad();
}
petCard.addEventListener('click', ev => {
  const b = ev.target.closest('[data-pa]'); if (!b || b.disabled) return;
  const a = b.dataset.pa, k = b.dataset.k, n = b.dataset.n;
  if (a === 'close') closePetShop();
  else if (a === 'story') { if (petStoryAt < PET_STORY.length - 1) { petStoryAt++; petRender(); } else petCall('pet_meet', {}, () => {}); }
  else if (a === 'storyskip') petCall('pet_meet', {}, () => {});
  else if (a === 'pick') { petPick = k; petRender(); }
  else if (a === 'give') { const lim = Math.min((petData.need[k] | 0) - (petData.have[k] | 0), ((petData.daily && petData.daily[k]) | 0) - ((petData.today && petData.today[k]) | 0)), q = n === 'all' ? Math.min(have(k), lim) : 1; if (q > 0) petCall('pet_build_give', { p_item: k, p_qty: q }, r => { petMsg = '謝謝你！'; }); }
  else if (a === 'pay') petCall('pet_build_pay', {}, () => { petMsg = '完工啦！寵物店開張～'; });
  else if (a === 'gmfinish') petCall('pet_gm_finish', {}, () => { petMsg = 'GM 已讓寵物店完工'; });
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
const PET_SCENES = { farm: 1, town: 1, forest: 1, plaza: 1, house: 1 };   // 進自己的家也會跟進來（去別人家時不顯示，改畫對方的寵物）
function petShown() { return !!(petMine && petUnlocked && ready && PET_SCENES[scene] && !visiting); }
function petEmote(k, ms) { const t = Date.now(); petFol.emo = { k, at: t, until: t + (ms || 2200) }; }
function petHappy(kind) {
  petFol.happyUntil = Date.now() + 2600;
  petEmote(kind === 'feed' || kind === 'bowl' ? 'yum' : kind === 'play' ? 'happy' : 'love', 2400);
  if (petShown() && typeof sparkle === 'function') sparkle(petFol.x, petFol.y - 0.4, '#ff9db8');
}
function petBondCheck(oldB, newB) { if (Math.floor(newB / 10) > Math.floor(oldB / 10)) setTimeout(() => petEmote('star', 3200), 2500); }
/* 命中範圍放寬：面向的那一格（或點的那一格）離寵物不到 1.3 格就算，而且寵物要在玩家身邊 2.5 格內 */
function petAtTile(x, y) { return petShown() && Math.hypot(petFol.x - x, petFol.y - y) < 1.3 && Math.hypot(petFol.x - pl.x, petFol.y - pl.y) < 2.5; }
function petTapped(tx, ty) { return petShown() && Math.hypot(petFol.x - tx, petFol.y - ty) < 1.1; }
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
  if (pl.x !== f.lx || pl.y !== f.ly) { f.lx = pl.x; f.ly = pl.y; f.moveAt = t; f.goal = null; f.nextGoal = Math.max(f.nextGoal || 0, t + 15000); f.fDots = f.fBall = 0; }
  const gl = petHomeGoal(f, t);
  let play = null;
  if (gl && gl.at) {
    play = petPlayFrame(f, gl, t);
    if (play.done) { if (gl.noReward) petEmote('sweat', 2800); f.goal = null; f.nextGoal = t + 25000 + Math.random() * 25000; play = null; f.still = t; }
  }
  if (!play) {
    const tg = gl ? [gl.x, gl.y] : f.tr.length ? f.tr[0] : [pl.x, pl.y];
    const dx = tg[0] - f.x, dy = tg[1] - f.y, d = Math.hypot(dx, dy);
    f.moving = d > 0.05;
    if (gl && !f.moving) { petGoalArrive(f, gl, t); }
    if (f.moving) { const st = Math.min(d, 5.2 * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; f.still = t; f.fDots = f.fBall = 0; }
    else if (f.tr.length > 1 && t - f.still > 1500) f.tr.shift();   // 玩家停下來後，牠慢慢靠過來
    if (Math.round(f.x) === pl.x && Math.round(f.y) === pl.y && !f.moving && f.tr.length) f.tr = [];
  } else f.moving = false;
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
  const sleeping = !play && !f.moving && idle > 20000;
  if (sleeping && (!f.emo || f.emo.until < t + 300)) petEmote('sleepy', 900);
  const pose = t < f.happyUntil ? 'happy' : f.moving ? 'side' : sleeping ? 'sleep' : 'front';
  let bx = Math.round(f.x * T), by = Math.round(f.y * T);
  if (play) { bx = play.px; by = play.py; }
  ents.push({ y: play ? play.sortY : f.y + 0.01, draw: () => {
    if (play) { play.draw(L, now); return; }
    const jump = t < f.happyUntil ? Math.round(Math.abs(Math.sin((f.happyUntil - t) / 110)) * 5) : 0;
    petB(L, bx, by - jump, { pose, now, dir: f.face });
  } });
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
/* ---------- 底部寵物列（點寵物或面向牠按動作鍵） ---------- */
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
    '<div class="pb-r"><span>飯碗</span><span>' + p.bowl + ' / 3 份</span></div>' +
    '<div class="pb-r"><span>今天可得親密</span><span>摸摸 ' + p.patLeft + '・玩耍 ' + p.playLeft + '</span></div>' +
    '<div class="pb-acts">' + btn('pat', 'pat', p.patLeft, p.patLeft < 1, '摸摸') + btn('feed', 'feed', bag, bag < 1, '餵食') + '</div>';
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
    const L = petLookOf(pb.breed); if (!L) return;
    let f = petRFol[rp.id];
    if (!f || f.w !== rp.w) f = petRFol[rp.id] = { x: rp.x, y: rp.y, face: 1, still: t, w: rp.w };
    const dx = rp.x - f.x, dy = rp.y - f.y, d = Math.hypot(dx, dy);
    f.moving = d > 1.15;
    if (f.moving) { const st = Math.min(d - 1.0, 5.2 * dt / 1000); f.x += dx / d * st; f.y += dy / d * st; if (Math.abs(dx) > 0.05) f.face = dx < 0 ? -1 : 1; f.still = t; }
    const pose = f.moving ? 'side' : t - f.still > 20000 ? 'sleep' : 'front';
    ents.push({ y: f.y + 0.01, draw: () => { petB(L, Math.round(f.x * T), Math.round(f.y * T), { pose, now, dir: f.face }); } });
  });
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
