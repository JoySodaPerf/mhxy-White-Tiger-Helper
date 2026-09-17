/* 白虎堂跑商助手 - 主逻辑 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const STORE_KEY = 'paoshangLedger_v1';

  /* ========== 状态 ========== */
  let ledger = loadLedger();
  let activeRegion = DATA.regions[0].id;
  let ledgerType = 'buy';
  let selectedGoods = null; // {regionId, good}

  /* ========== 打折率计算 ========== */
  const STEP = 300;

  // 生成 300 一档的价格列表
  function priceTiers(good) {
    const [lo, hi] = good.priceRange;
    const start = Math.ceil(lo / STEP) * STEP;
    const tiers = [];
    for (let p = start; p <= hi; p += STEP) {
      tiers.push(p);
    }
    return tiers.length ? tiers : [lo, hi];
  }

  // 打折率（现价/原价，百分比）
  function discRate(price, standard) {
    return Math.round((price / standard) * 1000) / 10;
  }

  function cellClass(rate) {
    if (rate < 80) return 'lt80';
    if (rate < 90) return '_8to9';
    if (rate < 100) return '_9to10';
    return 'over10';
  }

  /* ========== 渲染地图选择 ========== */
  function renderRegionChips() {
    const wrap = $('#regionChips');
    wrap.innerHTML = DATA.regions.map((r) => `
      <button class="chip ${r.id === activeRegion ? 'active' : ''}" data-region="${r.id}">
        ${r.name} <span class="tag">${r.shortName}</span>
      </button>
    `).join('');
    wrap.querySelectorAll('.chip').forEach((c) => {
      c.addEventListener('click', () => {
        activeRegion = c.dataset.region;
        renderRegionChips();
        renderGoods();
      });
    });
  }

  /* ========== 渲染商品列表 ========== */
  function renderGoods() {
    const region = DATA.regions.find((r) => r.id === activeRegion);
    const list = $('#goodsList');
    list.innerHTML = `${renderRegionIntro(region)}${region.goods.map(renderGood).join('')}`;
    // 绑定点击价格
    $$('.price-cell', list).forEach((cell) => {
      cell.addEventListener('click', () => {
        const goodIdx = +cell.dataset.good;
        const price = +cell.dataset.price;
        openModal(region, region.goods[goodIdx], price);
      });
    });
  }

  function renderRegionIntro(region) {
    const merch = region.merchants.map((m) => m).join('　');
    return `<div class="region-hd"><h2>${region.name} <span style="font-size:12px;color:var(--text-dim);font-weight:500">${region.shortName}</span></h2>
      <div class="merchant">${merch}</div></div>`;
  }

  function renderGood(good, idx) {
    const tiers = priceTiers(good);
    const std = good.standardPrice;
    const cells = tiers.map((p) => {
      const rate = discRate(p, std);
      const cls = cellClass(rate);
      const isBest = p === Math.min.apply(null, tiers);
      return `<div class="price-cell ${cls} ${isBest ? 'best-cell' : ''}" data-good="${idx}" data-price="${p}">
        ${isBest ? '<span class="best">★</span>' : ''}
        <div class="p">${p}</div>
        <div class="d">${rate}%</div>
      </div>`;
    }).join('');
    const sellInfo = good.recommendedSell.join('、');
    return `<div class="goods-card">
      <div class="goods-top">
        <div class="goods-name">${good.name}<span class="cat">${good.category}</span></div>
        <div class="goods-price">
          <div class="std">原价 <b>${std}</b></div>
          <div class="limit">限购 ${fmt(good.buyLimit)}</div>
        </div>
      </div>
      <div class="goods-notes">${good.notes}<br><span class="sell">推荐卖往：${sellInfo}</span></div>
      <div class="price-grid">${cells}</div>
      <div class="copy-hint">点击价格 → 填入记账本</div>
    </div>`;
  }

  /* ========== 价格弹窗（填入记账本） ========== */
  function openModal(region, good, price) {
    selectedGoods = { regionId: region.id, good };
    const mask = $('#modalMask');
    $('#modalTitle').textContent = `${region.name} · ${good.name} · ${price}银两`;
    $('#modalBody').innerHTML = `
      <div class="form-grid">
        <div class="form-row"><label>地图</label><select id="mRegion" class="field">${regionOptions(region.id)}</select></div>
        <div class="form-row"><label>商品</label><select id="mGoods" class="field">${goodOptions(region.id)}</select></div>
      </div>
      <div class="form-grid" style="margin-top:10px;">
        <div class="form-row"><label>单价</label><input id="mPrice" type="number" value="${price}" class="field" inputmode="numeric"></div>
        <div class="form-row"><label>数量</label><input id="mQty" type="number" value="1" class="field" inputmode="numeric"></div>
      </div>
      <div class="form-grid" style="margin-top:10px;">
        <button class="submit-btn" id="mBuy">记买入</button>
        <button class="submit-btn" id="mSell" style="background:linear-gradient(135deg,#22c55e,#16a34a);">记售出</button>
      </div>`;
    mask.classList.remove('hidden');

    const mRegion = $('#mRegion');
    const mGoods = $('#mGoods');
    mRegion.addEventListener('change', () => {
      mGoods.innerHTML = goodOptions(mRegion.value);
    });
    $('#mBuy').addEventListener('click', () => fillFromModal('buy'));
    $('#mSell').addEventListener('click', () => fillFromModal('sell'));
  }

  function fillFromModal(type) {
    const regionId = $('#mRegion').value;
    const goodsName = $('#mGoods').value;
    const price = +$('#mPrice').value;
    const qty = +$('#mQty').value || 1;
    // 售出仅允许已有库存
    if (type === 'sell') {
      const err = validateSell(goodsName, qty);
      if (err) { toast(err, true); return; }
    }
    // 切到记账页并填入
    setTab('ledger');
    window._prefill = { type, regionId, goodsName, price, qty };
    $('#modalMask').classList.add('hidden');
    fillLedgerForm();
  }

  function regionOptions(sel) {
    return DATA.regions.map((r) => `<option value="${r.id}" ${r.id === sel ? 'selected' : ''}>${r.name}</option>`).join('');
  }
  function goodOptions(regionId) {
    const r = DATA.regions.find((x) => x.id === regionId);
    return r.goods.map((g) => `<option>${g.name}</option>`).join('');
  }

  /* ========== 路线 & 奖励 ========== */
  function renderInfo() {
    const routes = DATA.recommendedRoutes.map((r) => `
      <div class="route">
        <div class="rt">${r.name}<span class="time">⏱ ${r.time}</span></div>
        <div class="path">${r.route}</div>
        <div class="desc">${r.description}</div>
      </div>`).join('');
    $('#routes').innerHTML = routes;

    $('#rewardsBody').innerHTML = DATA.levelRewards.map((r) => `
      <tr>
        <td><b>${r.level}</b></td>
        <td>${fmt(r.initialFund)}</td>
        <td>${fmt(r.targetFund)}</td>
        <td>${fmt(r.exp)}</td>
        <td>${r.contribution}</td>
        <td>${r.prosperity}</td>
      </tr>`).join('');
  }

  /* ========== 记账本 ========== */
  function loadLedger() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLedger() {
    localStorage.setItem(STORE_KEY, JSON.stringify(ledger));
  }

  function fillLedgerForm() {
    if (!window._prefill) return;
    const p = window._prefill;
    setLedgerType(p.type);
    $('#fRegion').value = p.regionId;
    syncGoodsOptions();
    $('#fGoods').value = p.goodsName;
    $('#fPrice').value = p.price;
    $('#fQty').value = p.qty;
    window._prefill = null;
  }

  function setLedgerType(t) {
    ledgerType = t;
    $$('#typeSeg button').forEach((b) => {
      const on = b.dataset.type === t;
      b.classList.toggle('active', on);
    });
    $('#submitEntry').style.background = t === 'buy'
      ? 'linear-gradient(135deg, var(--gold-2), var(--gold))'
      : 'linear-gradient(135deg, #22c55e, #16a34a)';
    syncGoodsOptions();
  }

  // 各商品库存汇总（购入-售出，与顺序无关）
  function computeStock() {
    const map = {};
    for (const e of ledger) {
      if (!map[e.goods]) map[e.goods] = { goods: e.goods, buyQty: 0, buyCost: 0, sellQty: 0 };
      if (e.type === 'buy') { map[e.goods].buyQty += e.qty; map[e.goods].buyCost += e.price * e.qty; }
      else { map[e.goods].sellQty += e.qty; }
    }
    for (const g in map) map[g].qty = map[g].buyQty - map[g].sellQty;
    return map;
  }
  function stockOf(goods) { return (computeStock()[goods] || { qty: 0 }).qty; }

  /* 表单联动：购入=对应地图全部商品；售出=仅在库商品，数量不超过可用库存 */
  function syncGoodsOptions() {
    const type = ledgerType;
    const avail = computeStock();
    const $g = $('#fGoods');
    if (type === 'buy') {
      const r = DATA.regions.find((x) => x.id === $('#fRegion').value);
      const cur = $g.value;
      $g.innerHTML = r.goods.map((g) => `<option>${g.name}</option>`).join('');
      if (r.goods.some((g) => g.name === cur)) $g.value = cur;
    } else {
      const stocked = Object.values(avail).filter((s) => s.qty > 0);
      if (!stocked.length) {
        $g.innerHTML = `<option value="" disabled selected>— 暂无库存商品 —</option>`;
      } else {
        const cur = $g.value;
        $g.innerHTML = stocked.map((s) => `<option>${s.goods}</option>`).join('');
        if (stocked.some((s) => s.goods === cur)) $g.value = cur;
      }
    }
    updateQtyHint();
  }

  // 数量上限提示
  function updateQtyHint() {
    const el = $('#qtyHint');
    if (ledgerType === 'buy') {
      $('#fQty').max = '';
      if (el) el.textContent = '';
    } else {
      const max = stockOf($('#fGoods').value);
      $('#fQty').max = max;
      if (el) el.textContent = max > 0 ? '可用库存：<b>' + max + '</b> 件' : '当前无此商品库存，无法售出';
    }
  }

  function fillRegionSelect() {
    $('#fRegion').innerHTML = DATA.regions.map((r) => `<option value="${r.id}">${r.name}</option>`).join('');
    $('#fRegion').addEventListener('change', syncGoodsOptions);
    $('#fGoods').addEventListener('change', updateQtyHint);
  }

  // 售出前校验库存
  function validateSell(goods, qty) {
    const max = stockOf(goods);
    if (max <= 0) return '该商品当前没有库存，无法售出';
    if (qty > max) return '超出可用库存：最多可售 ' + max + ' 件';
    return null;
  }

  function addEntry(entry) {
    if (entry.type === 'sell') {
      const err = validateSell(entry.goods, +entry.qty);
      if (err) { toast(err, true); return false; }
    }
    const region = DATA.regions.find((r) => r.id === entry.regionId);
    ledger.unshift({
      type: entry.type,
      regionId: entry.regionId,
      regionName: region ? region.name : entry.regionName,
      goods: entry.goods,
      price: +entry.price,
      qty: +entry.qty,
      note: entry.note || '',
      ts: Date.now()
    });
    saveLedger();
    renderLedger();
    syncGoodsOptions();
    return true;
  }

  /* 当前库存概览 */
  function renderStock() {
    const box = $('#stockBox');
    if (!box) return;
    const avail = Object.values(computeStock()).filter((s) => s.qty > 0);
    if (!avail.length) {
      box.innerHTML = `<div class="stock-empty">暂无库存商品，先点【购入】录入库存</div>`;
      return;
    }
    const rows = avail.map((s) => {
      const avg = s.buyQty > 0 ? Math.round(s.buyCost / s.buyQty) : 0;
      return `<div class="stock-row">
        <span class="s-name">${s.goods}</span>
        <span class="s-qty">×${s.qty}</span>
        <span class="s-avg">≈${avg}/件</span>
      </div>`;
    }).join('');
    box.innerHTML = `<div class="stock-hd">当前库存 <span class="s-count">${avail.reduce((a, b) => a + b.qty, 0)} 件 / ${avail.length} 种</span></div><div class="stock-body">${rows}</div>`;
  }

  function renderLedger() {
    const wrap = $('#entryList');
    if (!ledger.length) {
      wrap.innerHTML = `<div class="empty"><div class="big">📒</div>暂无流水<br>点击底部按钮或用语音录入</div>`;
    } else {
      wrap.innerHTML = ledger.map((e, i) => {
        const isBuy = e.type === 'buy';
        const total = e.price * e.qty;
        const time = new Date(e.ts).toLocaleString('zh-CN', { hour12: false });
        return `<div class="entry">
          <div class="dir ${isBuy ? 'buy' : 'sell'}">${isBuy ? '买入' : '售出'}</div>
          <div class="body">
            <div class="t1">${regionName(e.regionId, e.regionName)} · ${e.goods} <span class="qty">×${e.qty}</span></div>
            <div class="t2">${time}${e.note ? ' · ' + e.note : ''}</div>
          </div>
          <div class="price ${isBuy ? 'buy' : 'sell'}">${total}两</div>
          <button class="del" data-idx="${i}">✕</button>
        </div>`;
      }).join('');
      wrap.querySelectorAll('.del').forEach((d) => {
        d.addEventListener('click', () => {
          ledger.splice(+d.dataset.idx, 1);
          saveLedger();
          renderLedger();
          syncGoodsOptions();
        });
      });
    }
    renderLedgerSum();
    renderStock();
  }

  function renderLedgerSum() {
    // 利润按 售出均价-购入成本 估算（同一商品）
    const buyMap = {}; const sellMap = {};
    for (const e of ledger) {
      const m = e.type === 'buy' ? buyMap : sellMap;
      if (!m[e.goods]) m[e.goods] = { total: 0, qty: 0 };
      m[e.goods].total += e.price * e.qty; m[e.goods].qty += e.qty;
    }
    let net = 0;
    for (const g in sellMap) {
      if (buyMap[g]) {
        const buyAvg = buyMap[g].total / buyMap[g].qty;
        const sellQty = Math.min(sellMap[g].qty, buyMap[g].qty);
        net += (sellMap[g].total / sellMap[g].qty - buyAvg) * sellQty;
      }
    }
    const el = $('#netSum');
    el.textContent = (net >= 0 ? '+' : '') + Math.round(net);
    el.classList.toggle('neg', net < 0);
  }

  function regionName(id, fallback) {
    const r = DATA.regions.find((x) => x.id === id);
    return r ? r.name : (fallback || '');
  }

  /* ========== 语音录入 ========== */
  let recognition = null;
  function initVoice() {
    const w = window;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      $('#voiceBtn').title = '当前浏览器不支持语音识别';
      return;
    }
    recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    $('#voiceBtn').addEventListener('click', () => {
      if (!recognition) { toast('此浏览器不支持语音，请使用Chrome/Edge'); return; }
      const btn = $('#voiceBtn');
      if (btn.classList.contains('listening')) { recognition.stop(); return; }
      btn.classList.add('listening');
      btn.textContent = '⏹ 正在听...';
      $('#voiceStatus').textContent = '请说：例如“长安买佛珠3个6000”或“北俱卖人参2个8000”…';
      try { recognition.start(); } catch (e) {}
    });

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join('');
      voiceStatus('识别：' + text);
      parseVoice(text);
    };
    recognition.onerror = (e) => {
      voiceStatus('语音识别出错：' + (e.error || ''));
      resetVoiceBtn();
    };
    recognition.onend = resetVoiceBtn;
  }

  function resetVoiceBtn() {
    $('#voiceBtn').classList.remove('listening');
    $('#voiceBtn').textContent = '🎤 语音录入';
  }
  function voiceStatus(t) { $('#voiceStatus').textContent = t || ''; }

  function parseVoice(text) {
    const region = matchRegion(text);
    const type = /买|收|购|进/.test(text) ? 'buy' : 'sell';
    // 商品名后可能跟数量
    let goods = null;
    const allGoods = DATA.regions.flatMap((r) => r.goods.map((g) => g.name));
    goods = allGoods.find((g) => text.includes(g));
    const prices = (text.match(/\d{3,5}/g) || []).map(Number);
    const qtyMatch = text.match(/(\d+)\s*(个|件|车|箱)/);
    const qty = qtyMatch ? +qtyMatch[1] : 1;

    if (!goods) { toast('未能识别商品名，请手动选择'); return; }
    const regionId = region ? region.id : (type === 'buy' ? 'changan' : 'beiju');
    const price = prices[0] || '';
    if (prices.length >= 2) {
      // 视为 “买入价 + 卖出价”
      showVoicePreview(type, regionId, goods, { buy: prices[0], sell: prices[1], qty });
      return;
    }
    window._prefill = { type, regionId, goodsName: goods, price, qty };
    setTab('ledger');
    fillLedgerForm();
    toast('已填入：' + (type === 'buy' ? '买入' : '售出') + ' ' + goods + ' 单价' + price);
  }

  function showVoicePreview(type, regionId, goods, nums) {
    selectedGoods = { regionId, good: { name: goods } };
    const mask = $('#modalMask');
    $('#modalTitle').textContent = `语音识别结果 · ${goods}`;
    $('#modalBody').innerHTML = `
      <div class="form-grid">
        <div class="form-row"><label>买入地图</label><select id="vBuyRegion" class="field">${regionOptions('changan')}</select></div>
        <div class="form-row"><label>卖出地图</label><select id="vSellRegion" class="field">${regionOptions('beiju')}</select></div>
      </div>
      <div class="form-grid" style="margin-top:10px;">
        <div class="form-row"><label>买入单价</label><input id="vBuyPrice" type="number" value="${nums.buy}" class="field"></div>
        <div class="form-row"><label>卖出单价</label><input id="vSellPrice" type="number" value="${nums.sell}" class="field"></div>
      </div>
      <div class="form-row" style="margin-top:10px;"><label>数量</label><input id="vQty" type="number" value="${nums.qty}" class="field"></div>
      <button class="submit-btn" style="margin-top:10px;" id="vSave">记入两笔流水</button>`;
    mask.classList.remove('hidden');
    $('#vSave').addEventListener('click', () => {
      const br = $('#vBuyRegion').value, sr = $('#vSellRegion').value;
      const bp = +$('#vBuyPrice').value, sp = +$('#vSellPrice').value, q = +$('#vQty').value || 1;
      addEntry({ type: 'buy', regionId: br, goods, price: bp, qty: q });
      addEntry({ type: 'sell', regionId: sr, goods, price: sp, qty: q });
      mask.classList.add('hidden');
      setTab('ledger');
      toast('已记入买入+售出两笔');
    });
  }

  function matchRegion(text) {
    const map = { 长安: 'changan', 地府: 'difu', 北俱: 'beiju', 傲来: 'aolai', 长寿: 'changshou' };
    for (const k in map) { if (text.includes(k)) return { id: map[k], name: k }; }
    return null;
  }

  /* ========== Tab 切换 ========== */
  function setTab(tab) {
    $$('.tab-btn, .tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $('#view-price').classList.toggle('hidden', tab !== 'price');
    $('#view-ledger').classList.toggle('hidden', tab !== 'ledger');
  }

  /* ========== Toast ========== */
  function toast(msg, isError) {
    const wrap = $('#toastWrap');
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' toast-error' : '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function fmt(n) {
    return n == null ? '' : (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : String(n));
  }

  /* ========== 初始化 ========== */
  function init() {
    // 隐藏类默认定义
    const style = document.createElement('style');
    style.textContent = '.hidden{display:none !important;}';
    document.head.appendChild(style);

    renderRegionChips();
    renderGoods();
    renderInfo();
    fillRegionSelect();
    syncGoodsOptions();
    initVoice();
    renderLedger();

    // 事件绑定
    $$('#typeSeg button').forEach((b) => b.addEventListener('click', () => setLedgerType(b.dataset.type)));
    $('#submitEntry').addEventListener('click', () => {
      const regionId = $('#fRegion').value;
      const goods = $('#fGoods').value;
      const price = +$('#fPrice').value;
      const qty = +$('#fQty').value || 1;
      const note = $('#fNote').value.trim();
      if (!price) { toast('请填写单价'); return; }
      const ok = addEntry({ type: ledgerType, regionId, goods, price, qty, note });
      if (!ok) { $('#fQty').max = stockOf(goods); return; }
      $('#fPrice').value = ''; $('#fNote').value = ''; $('#fQty').value = 1;
      toast('已记录' + (ledgerType === 'buy' ? '买入' : '售出'));
    });
    const closeModal = () => $('#modalMask').classList.add('hidden');
    $('#modalMask').addEventListener('click', (e) => {
      if (e.target.id === 'modalMask') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    $$('.tabs button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

    // PWA：注册 + 新版本提示
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // 检测到新 Service Worker（有新版本）
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 已有旧版本在控制 → 后台已有新版，等待用户刷新
              showUpdateBanner(reg);
            }
          });
        });
      }).catch(() => {});

      // 新 SW 接管页面时，自动刷新一次以应用新版本
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }

  /* ========== 新版本提示 ========== */
  function showUpdateBanner(reg) {
    const banner = $('#updateBanner');
    if (!banner) return;
    banner.classList.remove('hidden');
    $('#updateBtn').addEventListener('click', () => {
      reg.waiting && reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      // 若 waiting 不存在，直接刷新
      if (!reg.waiting) window.location.reload();
    });
    // 也监听 sw 已更新消息时隐藏
  }

  document.addEventListener('DOMContentLoaded', init);
})();