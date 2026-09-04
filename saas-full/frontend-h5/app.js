/* 力企云 · 惠企政策 H5 —— 零构建单页，调用后端 /app-api/liqi/*（同源反代） */
(function () {
  'use strict';

  // ---------- API 封装 ----------
  var TOKEN_KEY = 'liqi_h5_token';
  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    headers['tenant-id'] = '1';
    var tk = localStorage.getItem(TOKEN_KEY);
    if (tk) headers['Authorization'] = 'Bearer ' + tk;
    return fetch('/app-api' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.code === 0) return j.data;
      var err = { code: j.code, msg: j.msg || '请求失败' };
      if (j.code === 401) { localStorage.removeItem(TOKEN_KEY); }
      throw err;
    });
  }
  function qs(obj) {
    var p = [];
    Object.keys(obj).forEach(function (k) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') p.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
    });
    return p.length ? '?' + p.join('&') : '';
  }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // 时间格式化：兼容后端 LocalDateTime 序列化为时间戳(ms) 或字符串
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(v) {
    if (v == null || v === '') return '';
    if (typeof v === 'number') {
      var d = new Date(v);
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
        ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }
    return String(v).replace('T', ' ').slice(0, 16);
  }
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }
  function needLogin() { toast('请先在「我的」登录后再操作'); }

  // SSE 流式请求（AI 助手）：onDelta(文本增量)、onDone()
  function ssePost(path, body, onDelta, onDone) {
    var headers = { 'Content-Type': 'application/json' };
    headers['tenant-id'] = '1';
    var tk = localStorage.getItem(TOKEN_KEY);
    if (tk) headers['Authorization'] = 'Bearer ' + tk;
    fetch('/app-api' + path, { method: 'POST', headers: headers, body: JSON.stringify(body) })
      .then(function (r) {
        var reader = r.body.getReader();
        var dec = new TextDecoder('utf-8');
        var buf = '';
        function pump() {
          reader.read().then(function (res) {
            if (res.done) { onDone && onDone(); return; }
            buf += dec.decode(res.value, { stream: true });
            var parts = buf.split('\n\n');
            buf = parts.pop();
            parts.forEach(function (evt) {
              evt.split('\n').forEach(function (line) {
                if (line.indexOf('data:') === 0) {
                  var data = line.slice(5).replace(/^\s/, '');
                  if (data === '[DONE]') { onDone && onDone(); return; }
                  onDelta && onDelta(data);
                }
              });
            });
            pump();
          });
        }
        pump();
      }).catch(function () { onDone && onDone(); });
  }
  var _unread = 0;
  function refreshUnread() {
    if (!localStorage.getItem(TOKEN_KEY)) { _unread = 0; return; }
    api('/liqi/message/unread-count').then(function (n) { _unread = n || 0; }).catch(function () {});
  }

  // ---------- 路由 ----------
  var TABS = [
    { h: '#/home', icon: '🏠', name: '首页' },
    { h: '#/policy', icon: '📋', name: '政策' },
    { h: '#/message', icon: '🔔', name: '消息' },
    { h: '#/mine', icon: '👤', name: '我的' }
  ];
  var PAGE_TITLES = {
    '#/home': '力企云 · 惠企政策', '#/policy': '政策查询',
    '#/message': '消息', '#/mine': '我的', '#/detail': '政策详情', '#/apply': '政策申报',
    '#/subscribe': '订阅推送设置', '#/favorite': '我的收藏', '#/myapply': '我的申报',
    '#/enterprise': '园区企业', '#/login': '登录', '#/bind': '绑定我的企业',
    '#/match': '智能匹配', '#/ai-match': 'AI 智能匹配', '#/ai': 'AI 政策助手', '#/live': '专家直播大讲堂',
    '#/company-check': '企业获批查询'
  };

  function go(hash) { location.hash = hash; }
  window.addEventListener('hashchange', route);

  function route() {
    var hash = location.hash || '#/home';
    var path = hash.split('?')[0];
    var app = document.getElementById('app');
    var title = PAGE_TITLES[path] || '力企云';
    var showTab = ['#/home', '#/policy', '#/message', '#/mine'].indexOf(path) >= 0;
    var showBack = !showTab;
    app.innerHTML =
      '<div class="navbar">' +
        (showBack ? '<div class="back" onclick="history.back()">‹</div>' : '<div style="width:26px"></div>') +
        '<div class="title">' + esc(title) + '</div><div class="right"></div>' +
      '</div>' +
      '<div class="page" id="page"></div>' +
      (showTab ? '<div class="tabbar">' + TABS.map(function (t) {
        var badge = (t.h === '#/message' && _unread > 0) ? '<span class="tbdot">' + (_unread > 99 ? '99+' : _unread) + '</span>' : '';
        return '<div class="tb' + (path === t.h ? ' on' : '') + '" onclick="location.hash=\'' + t.h + '\'"><span class="ti">' + t.icon + '</span>' + t.name + badge + '</div>';
      }).join('') + '</div>' : '');
    var render = RENDERERS[path] || RENDERERS['#/home'];
    render(document.getElementById('page'), parseQuery(hash));
  }
  function parseQuery(hash) {
    var o = {}, i = hash.indexOf('?');
    if (i < 0) return o;
    hash.slice(i + 1).split('&').forEach(function (kv) {
      var a = kv.split('='); o[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || '');
    });
    return o;
  }

  // ---------- 公共片段 ----------
  function policyCard(p) {
    var sub = p.subsidyMax ? '<div class="subsidy">最高 ' + esc(p.subsidyMax) + ' 万</div>' : '<div class="subsidy none">公示</div>';
    var tag = p.type === 'park' ? '<span class="tag park">园区</span>' : '<span class="tag">' + esc(typeName(p.type)) + '</span>';
    var remain = p.remainDays != null ? '<span class="remain">剩余' + p.remainDays + '天</span>' : '';
    return '<div class="pcard" onclick="location.hash=\'#/detail?id=' + esc(p.id) + '\'">' + sub +
      '<div class="tt">' + esc(p.title) + '</div>' +
      '<div class="meta">' + tag +
        (p.publishDate ? '<span class="org">' + esc(p.publishDate) + '</span>' : '') +
        (p.publishOrg ? '<span class="org">| ' + esc(p.publishOrg) + '</span>' : '') +
        remain +
      '</div></div>';
  }
  function typeName(t) { return { project: '政策项目', original: '政策原文', public: '公示公告', park: '园区发布' }[t] || t; }
  function loading() { return '<div class="loading">加载中…</div>'; }
  function empty(txt) { return '<div class="empty"><span class="e-ico">📭</span>' + esc(txt || '暂无数据') + '</div>'; }

  // ---------- 页面渲染 ----------
  var RENDERERS = {};

  // 首页
  RENDERERS['#/home'] = function (el) {
    el.innerHTML =
      '<div class="banner"><h2>惠企政策一键查</h2><p>政策项目 · 智能匹配 · 精准推送，助力企业应享尽享</p>' +
        '<div class="searchbar"><input id="hm-kw" placeholder="搜索政策项目名称或关键字"/><button onclick="homeSearch()">搜索</button></div></div>' +
      '<div class="grid">' +
        '<div class="item" onclick="location.hash=\'#/policy?type=project\'"><div class="ico">📋</div><div class="nm">政策项目</div></div>' +
        '<div class="item" onclick="location.hash=\'#/policy?type=original\'"><div class="ico">📄</div><div class="nm">政策原文</div></div>' +
        '<div class="item" onclick="location.hash=\'#/policy?type=public\'"><div class="ico">📢</div><div class="nm">公示公告</div></div>' +
        '<div class="item" onclick="location.hash=\'#/policy?type=park\'"><div class="ico">🏢</div><div class="nm">园区发布</div></div>' +
        '<div class="item" onclick="location.hash=\'#/company-check\'"><div class="ico">🏆</div><div class="nm">获批查询</div></div>' +
        '<div class="item" onclick="location.hash=\'#/ai-match\'"><div class="ico">🤖</div><div class="nm">智能匹配</div></div>' +
        '<div class="item" onclick="location.hash=\'#/ai\'"><div class="ico">💬</div><div class="nm">AI政策助手</div></div>' +
        '<div class="item" onclick="location.hash=\'#/live\'"><div class="ico">🎥</div><div class="nm">直播大讲堂</div></div>' +
      '</div>' +
      '<div class="sec-hd"><h3>最新政策</h3><span class="more" onclick="location.hash=\'#/policy\'">更多 ›</span></div>' +
      '<div id="hm-list">' + loading() + '</div>';
    api('/liqi/policy/page' + qs({ pageNo: 1, pageSize: 5 })).then(function (d) {
      document.getElementById('hm-list').innerHTML = d.list.length ? d.list.map(policyCard).join('') : empty('暂无政策');
    }).catch(function () { document.getElementById('hm-list').innerHTML = empty('加载失败'); });
  };
  window.homeSearch = function () {
    var kw = document.getElementById('hm-kw').value.trim();
    location.hash = '#/policy?keyword=' + encodeURIComponent(kw);
  };

  // 政策列表
  var polState = { type: 'project', category: '', keyword: '', pageNo: 1, list: [], total: 0, loading: false };
  RENDERERS['#/policy'] = function (el, q) {
    if (q.type !== undefined) polState.type = q.type;
    if (q.keyword !== undefined) polState.keyword = q.keyword;
    if (q.type !== undefined || q.keyword !== undefined) { polState.pageNo = 1; polState.list = []; }
    var subs = [['project', '政策项目'], ['original', '政策原文'], ['public', '公示公告'], ['park', '园区发布']];
    var cats = ['', '专精特新', '研发投入', '技术改造', '设备更新', '高企认定', '创业扶持'];
    el.innerHTML =
      '<div class="searchbar" style="background:#fff;border:1px solid var(--line);margin-bottom:10px">' +
        '<input id="pl-kw" placeholder="请输入政策项目名称或关键字" value="' + esc(polState.keyword) + '"/>' +
        '<button onclick="polSearch()">搜索</button></div>' +
      '<div class="subtabs">' + subs.map(function (s) {
        return '<div class="st' + (polState.type === s[0] ? ' on' : '') + '" onclick="polTab(\'' + s[0] + '\')">' + s[1] + '</div>';
      }).join('') + '</div>' +
      '<div class="chips">' + cats.map(function (c) {
        return '<div class="chip' + (polState.category === c ? ' on' : '') + '" onclick="polCat(\'' + c + '\')">' + (c || '全部分类') + '</div>';
      }).join('') + '</div>' +
      '<div id="pl-list">' + loading() + '</div>' +
      '<div class="more-btn" id="pl-more" style="display:none" onclick="polMore()">加载更多</div>';
    loadPolicy();
  };
  function loadPolicy(reset) {
    if (reset) { polState.pageNo = 1; polState.list = []; }
    polState.loading = true;
    api('/liqi/policy/page' + qs({ type: polState.type, keyword: polState.keyword, category: polState.category, pageNo: polState.pageNo, pageSize: 10 }))
      .then(function (d) {
        polState.list = polState.list.concat(d.list || []);
        polState.total = d.total || 0;
        var box = document.getElementById('pl-list');
        box.innerHTML = polState.list.length ? polState.list.map(policyCard).join('') : empty('没有符合条件的政策');
        document.getElementById('pl-more').style.display = polState.list.length < polState.total ? 'block' : 'none';
      }).catch(function () { document.getElementById('pl-list').innerHTML = empty('加载失败'); })
      .then(function () { polState.loading = false; });
  }
  window.polTab = function (t) { polState.type = t; polState.category = ''; route(); };
  window.polCat = function (c) { polState.category = c; loadPolicy(true); };
  window.polSearch = function () { polState.keyword = document.getElementById('pl-kw').value.trim(); loadPolicy(true); };
  window.polMore = function () { polState.pageNo++; loadPolicy(false); };

  // 政策详情
  RENDERERS['#/detail'] = function (el, q) {
    el.innerHTML = loading();
    api('/liqi/policy/get' + qs({ id: q.id })).then(function (d) {
      var p = d.policy;
      if (!p) { el.innerHTML = empty('政策不存在或已下线'); return; }
      el.innerHTML =
        '<div class="detail-hero"><div class="src">来源：' + esc(p.parkName || p.publishOrg || '') + ' 发布</div>' +
          '<h2>' + esc(p.title) + '</h2>' +
          '<div class="dmeta">' + (p.deadline ? '截止 ' + esc(p.deadline) + (p.remainDays != null ? ' · 剩余 ' + p.remainDays + ' 天' : '') : '长期有效') + '</div></div>' +
        '<div class="ai-box" id="ai-explain" onclick="explainPolicy(\'' + esc(p.id) + '\')"><div class="ai-ico">🤖</div>' +
          '<div class="ai-tx"><b>帮我读懂（说人话）</b><p>AI 把这条政策翻译成大白话，点我生成 ›</p></div></div>' +
        '<div class="ai-result" id="ai-result" style="display:none"></div>' +
        '<div class="kv"><div class="kvi"><div class="v">' + (p.subsidyMax ? esc(p.subsidyMax) + ' 万' : '—') + '</div><div class="k">最高补贴</div></div>' +
          '<div class="kvi"><div class="v blue">' + esc(p.region || '—') + '</div><div class="k">所属地区</div></div>' +
          '<div class="kvi"><div class="v blue">' + esc(p.industry || '—') + '</div><div class="k">所属行业</div></div></div>' +
        '<div class="body-card"><h4>政策正文</h4><div class="ct">' + esc(p.content || p.summary || '（正文以发布方原文为准）') + '</div></div>' +
        '<div style="display:flex;gap:10px;margin-top:16px">' +
          '<button class="btn ghost" style="flex:1" id="fav-btn" onclick="toggleFav(\'' + esc(p.id) + '\')">' + (d.favorited ? '★ 已收藏' : '☆ 收藏') + '</button>' +
          '<button class="btn orange" style="flex:1.4" onclick="location.hash=\'#/apply?policyId=' + esc(p.id) + '&title=' + encodeURIComponent(p.title) + '&type=' + esc(p.type) + '\'">立即申报</button>' +
        '</div>';
      window._curPolicy = p;
    }).catch(function () { el.innerHTML = empty('加载失败'); });
  };
  window.toggleFav = function (id) {
    if (!localStorage.getItem(TOKEN_KEY)) { needLogin(); return; }
    var p = window._curPolicy || {};
    api('/liqi/favorite/add', { method: 'POST', body: { policyId: id, policyTitle: p.title, policyType: p.type, publishOrg: p.publishOrg } })
      .then(function () { toast('已收藏'); document.getElementById('fav-btn').textContent = '★ 已收藏'; })
      .catch(function (e) { toast(e.msg || '操作失败'); });
  };

  // ⑤ AI 帮我读懂（非流式）
  window.explainPolicy = function (id) {
    var box = document.getElementById('ai-result');
    var trigger = document.getElementById('ai-explain');
    if (!box) return;
    box.style.display = 'block';
    box.innerHTML = '<div class="loading">🤖 AI 正在解读政策…</div>';
    if (trigger) trigger.querySelector('.ai-tx p').textContent = '正在生成解读…';
    api('/liqi/ai/explain' + qs({ policyId: id }))
      .then(function (text) {
        box.innerHTML = '<div class="ai-answer">' + esc(text || '（暂无解读）').replace(/\n/g, '<br/>') + '</div>';
        if (trigger) trigger.querySelector('.ai-tx p').textContent = '已生成 · 点击可重新解读';
      })
      .catch(function (e) {
        box.innerHTML = '<div class="empty">解读失败：' + esc(e.msg || 'AI 暂不可用') + '</div>';
        if (trigger) trigger.querySelector('.ai-tx p').textContent = 'AI 把这条政策翻译成大白话，点我重试 ›';
      });
  };

  // 政策申报
  RENDERERS['#/apply'] = function (el, q) {
    el.innerHTML =
      '<div class="body-card" style="background:#eef4ff;margin-bottom:14px">正在申报：<b>' + esc(q.title ? decodeURIComponent(q.title) : '政策项目') + '</b></div>' +
      '<div class="form-card">' +
        '<div class="fitem"><label>政策项目</label><input id="ap-policy" value="' + esc(q.title ? decodeURIComponent(q.title) : '') + '" placeholder="政策项目名称"/></div>' +
        '<div class="fitem"><label>企业名称 <span class="req">*</span></label><input id="ap-ent" placeholder="请输入申报企业全称"/></div>' +
        '<div class="fitem"><label>联系人 <span class="req">*</span></label><input id="ap-name" placeholder="请输入联系人姓名"/></div>' +
        '<div class="fitem"><label>联系电话 <span class="req">*</span></label><input id="ap-phone" type="tel" placeholder="请输入手机号码"/></div>' +
        '<div class="fitem"><label>备注</label><textarea id="ap-remark" placeholder="补充说明（选填）"></textarea></div>' +
        '<button class="btn orange" onclick="submitApply(\'' + esc(q.id || '') + '\',\'' + esc(q.type || '') + '\')">提交申报</button>' +
        '<p style="font-size:12px;color:var(--sub);text-align:center;margin-top:12px">提交后将有专人与您联系对接，请保持电话畅通。</p>' +
      '</div>';
  };
  window.submitApply = function (policyId, type) {
    var body = {
      policyId: policyId || undefined,
      policyTitle: document.getElementById('ap-policy').value.trim(),
      policyType: type || undefined,
      enterpriseName: document.getElementById('ap-ent').value.trim(),
      contactName: document.getElementById('ap-name').value.trim(),
      contactPhone: document.getElementById('ap-phone').value.trim(),
      remark: document.getElementById('ap-remark').value.trim()
    };
    if (!body.enterpriseName || !body.contactName || !body.contactPhone) { toast('请填写带 * 的必填项'); return; }
    if (!/^1[3-9]\d{9}$/.test(body.contactPhone)) { toast('请输入正确的手机号码'); return; }
    api('/liqi/apply/create', { method: 'POST', body: body })
      .then(function () { toast('提交成功，稍后专人联系'); setTimeout(function () { location.hash = '#/home'; }, 1200); })
      .catch(function (e) { toast(e.msg || '提交失败'); });
  };

  // 智能匹配（独立页：进页即按绑定企业的地区/行业/资质匹配可申报政策）
  RENDERERS['#/match'] = function (el) {
    if (!localStorage.getItem(TOKEN_KEY)) {
      el.innerHTML =
        '<div class="bind-card">🤖 绑定企业后，AI 按你的地区 / 行业 / 资质智能匹配可申报补贴政策</div>' +
        empty('登录并绑定企业后即可智能匹配') +
        '<button class="btn orange" onclick="location.hash=\'#/login\'">去登录 / 注册</button>';
      return;
    }
    el.innerHTML =
      '<div class="bind-card">🤖 已按你绑定企业的地区 / 行业 / 资质，匹配以下可申报政策</div>' +
      '<div id="match-result">' + loading() + '</div>';
    api('/liqi/policy/match').then(function (list) {
      var box = document.getElementById('match-result');
      box.innerHTML = (list && list.length)
        ? list.map(policyCard).join('')
        : '<div class="empty">暂未匹配到政策，可先完善 / 更新企业绑定<br/><br/>' +
          '<button class="btn orange" onclick="location.hash=\'#/bind\'">去绑定企业</button></div>';
    }).catch(function (e) {
      document.getElementById('match-result').innerHTML = empty(e.msg || '匹配失败，请先绑定企业');
    });
  };

  // AI 智能匹配（输入企业名 → 实时调大模型，返回可申报政策 + 5 维打分/理由/风险，无需登录）
  var AM_DIMS = [
    ['industry_match', '行业'], ['capability_match', '能力'], ['cert_match', '资质信誉'],
    ['region_match', '地区'], ['scale_match', '规模']
  ];
  RENDERERS['#/ai-match'] = function (el, q) {
    el.innerHTML =
      '<div class="bind-card">🤖 输入<b>企业名称</b>，AI 大模型从行业 / 能力 / 资质 / 地区 / 规模 5 个维度，' +
      '实时匹配可申报政策并打分（含申报建议与风险提示）。<br/>⏳ 深度分析约需 <b>40~60 秒</b>，请耐心等待。</div>' +
      '<div class="body-card">' +
        '<div class="fitem"><label>企业名称 <span class="req">*</span></label>' +
          '<input id="am-company" placeholder="如：深圳启程智远网络有限公司" value="' + esc(q.kw ? decodeURIComponent(q.kw) : '') + '"/></div>' +
        '<div class="fitem" style="display:flex;gap:10px">' +
          '<div style="flex:1"><label>营业收入（万元）</label><input id="am-revenue" type="number" inputmode="decimal" placeholder="如 5000"/></div>' +
          '<div style="flex:1"><label>社保人数（人）</label><input id="am-staff" type="number" inputmode="numeric" placeholder="如 100"/></div>' +
        '</div>' +
        '<button class="btn orange" id="am-btn" onclick="doAiMatch()">🚀 开始 AI 智能匹配</button>' +
      '</div>' +
      '<div id="am-result"></div>';
  };
  window.doAiMatch = function () {
    var company = document.getElementById('am-company').value.trim();
    if (!company) { toast('请输入企业名称'); return; }
    var revenue = document.getElementById('am-revenue').value;
    var staff = document.getElementById('am-staff').value;
    var body = { companyName: company };
    if (revenue !== '') body.revenue = Number(revenue);
    if (staff !== '') body.staffNum = parseInt(staff, 10);
    var btn = document.getElementById('am-btn');
    btn.disabled = true; btn.textContent = 'AI 分析中…（约 40~60 秒）';
    var box = document.getElementById('am-result');
    box.innerHTML = '<div class="loading am-loading">🧠 AI 正在检索政策并多维度评估打分，请稍候，不要离开页面…</div>';
    api('/liqi/policy/ai-match', { method: 'POST', body: body }).then(function (d) {
      btn.disabled = false; btn.textContent = '🚀 重新匹配';
      renderAiMatch(box, d || {});
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = '🚀 开始 AI 智能匹配';
      box.innerHTML = empty(e.msg || '匹配失败，请稍后重试');
    });
  };
  function amPct(v) { v = Number(v); if (isNaN(v)) return 0; return Math.round(v * 100); }
  function amLevelCls(lv) {
    lv = lv || '';
    if (lv.indexOf('高度') >= 0) return 'am-lvl high';
    if (lv.indexOf('中度') >= 0 || lv.indexOf('可') >= 0) return 'am-lvl mid';
    return 'am-lvl';
  }
  function renderAiMatch(box, d) {
    var list = d.list || [];
    if (!list.length) { box.innerHTML = empty('暂未匹配到可申报政策，可补全营收/人数后重试'); return; }
    var html = '<div class="sec-hd"><h3>🎯 为「' + esc(d.company || '') + '」匹配到 ' + (d.total != null ? d.total : list.length) + ' 项可申报政策</h3></div>';
    html += list.map(function (p, i) {
      var sc = p.scores || {};
      var dr = p.dimensionReasoning || {};
      var bars = AM_DIMS.map(function (dm) {
        var pct = amPct(sc[dm[0]]);
        return '<div class="am-dim"><span class="am-dn">' + dm[1] + '</span>' +
          '<span class="am-bar"><i style="width:' + pct + '%"></i></span><span class="am-dv">' + pct + '</span></div>';
      }).join('');
      var reasons = AM_DIMS.map(function (dm) {
        var key = { industry_match: 'industry', capability_match: 'capability', cert_match: 'cert', region_match: 'region', scale_match: 'scale' }[dm[0]];
        return dr[key] ? '<p><b>' + dm[1] + '：</b>' + esc(dr[key]) + '</p>' : '';
      }).join('');
      return '<div class="body-card am-card">' +
        '<div class="am-top">' +
          '<span class="tag park">' + esc(p.rank || '政策') + '</span>' +
          (p.matchLevel ? '<span class="' + amLevelCls(p.matchLevel) + '">' + esc(p.matchLevel) + '</span>' : '') +
          '<span class="am-score">综合 ' + amPct(p.llmScore) + ' 分</span>' +
        '</div>' +
        '<div class="am-tt">' + esc(p.projectName) + '</div>' +
        '<div class="am-meta">' + (p.publishTime ? esc(String(p.publishTime).slice(0, 10)) : '') +
          (p.area ? '　' + esc(p.area) : '') + '</div>' +
        '<div class="am-scores">' + bars + '</div>' +
        (reasons ? '<div class="am-reason" id="am-reason-' + i + '" style="display:none">' + reasons + '</div>' +
          '<div class="am-toggle" onclick="var e=document.getElementById(\'am-reason-' + i + '\');e.style.display=e.style.display===\'none\'?\'block\':\'none\';this.querySelector(\'u\').textContent=e.style.display===\'none\'?\'查看 AI 评估理由 ▾\':\'收起评估理由 ▴\'"><u>查看 AI 评估理由 ▾</u></div>' : '') +
        (p.riskNotes ? '<div class="am-risk">⚠️ ' + esc(p.riskNotes) + '</div>' : '') +
      '</div>';
    }).join('');
    box.innerHTML = html;
  }

  // 企业获批查询（已获补贴 + 可申报项目）
  RENDERERS['#/company-check'] = function (el, q) {
    var defKw = '深圳市云启智能科技有限公司';
    el.innerHTML =
      '<div class="searchbar" style="background:#fff;border:1px solid var(--line);margin-bottom:14px">' +
        '<input id="cc-kw" placeholder="输入企业名称或统一社会信用代码" value="' + esc(q.kw ? decodeURIComponent(q.kw) : defKw) + '"/>' +
        '<button onclick="doCompanyCheck()">查询</button></div>' +
      '<div id="cc-result"><div class="bind-card">🏆 输入企业名称，查询该企业<b>已获得的补贴/获批项目</b>，以及按企业标签匹配的<b>可申报项目</b>。</div></div>';
    if (q.kw) { doCompanyCheck(); }
  };
  window.doCompanyCheck = function () {
    var kw = document.getElementById('cc-kw').value.trim();
    if (!kw) { toast('请输入企业名称'); return; }
    var box = document.getElementById('cc-result');
    box.innerHTML = loading();
    api('/liqi/company/check' + qs({ keyword: kw })).then(function (d) {
      var e = d.enterprise || {};
      var approvals = d.approvals || [];
      var policies = d.policies || [];
      var tags = (e.tags || '').split(';').filter(Boolean).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join(' ');
      var html = '<div class="body-card"><b style="font-size:15px">' + esc(e.name || kw) + '</b>' +
        '<div style="color:var(--sub);font-size:13px;margin-top:8px;line-height:1.8">' +
        '法人：' + esc(e.legalPerson || '—') + '　行业：' + esc(e.industry || '—') + '<br/>地址：' + esc(e.registerAddress || '—') + '</div>' +
        (tags ? '<div style="margin-top:8px">' + tags + '</div>' : '') + '</div>';
      html += '<div class="sec-hd"><h3>🏆 已获补贴 / 获批项目（' + approvals.length + '）</h3></div>';
      if (approvals.length) {
        html += approvals.map(function (a) {
          return '<div class="pcard" style="cursor:default"><div class="tt">' + esc(a.projectName) + '</div>' +
            '<div class="meta"><span class="tag park">已获批</span>' +
            (a.subsidy ? '<span class="remain">补贴 ' + esc(a.subsidy) + ' 万</span>' : '<span class="tag">资质认定</span>') +
            '<span class="org">' + esc(a.approvalTime || '') + '</span>' +
            (a.department ? '<span class="org">| ' + esc(a.department) + '</span>' : '') + '</div></div>';
        }).join('');
      } else {
        html += empty('暂无公示的获批记录');
      }
      html += '<div class="sec-hd"><h3>🎯 可申报项目（' + policies.length + '）</h3></div>';
      if (policies.length) {
        html += policies.map(policyCard).join('');
      } else {
        html += empty('暂无匹配的可申报政策');
      }
      box.innerHTML = html;
    }).catch(function (err) { box.innerHTML = empty(err.msg || '查询失败'); });
  };

  // 园区企业
  var entState = { parkId: 1, pageNo: 1 };
  var PARKS = [[1, '深圳湾生态科技园'], [2, '广州天河智慧城'], [3, '北京朝阳CBD']];
  RENDERERS['#/enterprise'] = function (el) {
    el.innerHTML =
      '<div class="chips" style="position:static">' + PARKS.map(function (pk) {
        return '<div class="chip' + (entState.parkId === pk[0] ? ' on' : '') + '" onclick="entPark(' + pk[0] + ')">' + pk[1] + '</div>';
      }).join('') + '</div><div id="ent-list">' + loading() + '</div>';
    loadEnt();
  };
  function loadEnt() {
    entState.pageNo = 1;
    api('/liqi/enterprise/by-park' + qs({ parkId: entState.parkId, pageNo: 1, pageSize: 50 }))
      .then(function (d) {
        var list = d.list || [];
        document.getElementById('ent-list').innerHTML = list.length ? list.map(function (e) {
          var tags = (e.tags || '').split(';').filter(Boolean).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
          return '<div class="ent-card"><div class="en">' + esc(e.name) + '</div>' +
            '<div class="em">法人：' + esc(e.legalPerson) + '　行业：' + esc(e.industry) + '<br/>地址：' + esc(e.registerAddress) + '</div>' +
            (tags ? '<div class="et">' + tags + '</div>' : '') + '</div>';
        }).join('') : empty('该园区暂无企业数据');
      }).catch(function () { document.getElementById('ent-list').innerHTML = empty('加载失败'); });
  }
  window.entPark = function (id) { entState.parkId = id; route(); };

  // 消息（政策找人：站内信真实数据；区分外部政策 / 园区发布）
  var msgState = { source: '' };
  RENDERERS['#/message'] = function (el) {
    var tabs = [['', '全部'], ['external', '外部政策'], ['park', '园区发布']];
    el.innerHTML =
      '<div class="bind-card">🔔 绑定企业后，系统自动把你可申报的政策推送到这里</div>' +
      '<div class="subtabs">' + tabs.map(function (t) {
        return '<div class="st' + (msgState.source === t[0] ? ' on' : '') + '" onclick="msgTab(\'' + t[0] + '\')">' + t[1] + '</div>';
      }).join('') + '</div>' +
      '<div id="msg-list"></div>';
    if (!localStorage.getItem(TOKEN_KEY)) {
      document.getElementById('msg-list').innerHTML = empty('登录后查看政策推送消息');
      return;
    }
    document.getElementById('msg-list').innerHTML = loading();
    loadMsg();
  };
  window.msgTab = function (s) { msgState.source = s; route(); };
  function loadMsg() {
    var q = { pageNo: 1, pageSize: 30 };
    if (msgState.source) { q.source = msgState.source; }
    api('/liqi/message/page' + qs(q)).then(function (d) {
      var list = d.list || [];
      var box = document.getElementById('msg-list');
      if (!list.length) { box.innerHTML = empty('暂无消息，匹配到政策后会推送到这里'); return; }
      box.innerHTML = list.map(function (m) {
        var badge = m.isRead ? '' : '<span class="tbdot" style="position:static;margin-left:6px"></span>';
        var jump = m.policyId ? ' onclick="location.hash=\'#/detail?id=' + esc(m.policyId) + '\'" style="cursor:pointer"' : '';
        var typeLabel = m.type === 2 ? '临期' : (m.type === 3 ? '系统' : '政策');
        var typeColor = m.type === 2 ? 'color:var(--orange)' : (m.type === 3 ? '' : 'color:var(--blue)');
        var srcTag = m.source === 'park' ? '<span class="tag park">园区发布</span>' : '<span class="tag">外部政策</span>';
        return '<div class="body-card"' + jump + '><div style="display:flex;gap:8px;margin-bottom:6px;align-items:center;flex-wrap:wrap">' +
          '<b style="' + typeColor + '">' + typeLabel + '</b>' + srcTag +
          '<span style="flex:1;min-width:120px">' + esc(m.title) + '</span>' + badge + '</div>' +
          (m.content ? '<div style="color:#333;font-size:14px;line-height:1.6">' + esc(m.content) + '</div>' : '') +
          '<div style="color:var(--sub);font-size:12px;margin-top:6px">' + esc(fmtTime(m.createTime)) + '</div></div>';
      }).join('');
      api('/liqi/message/read', { method: 'PUT' }).then(function () { _unread = 0; }).catch(function () {});
    }).catch(function () { document.getElementById('msg-list').innerHTML = empty('加载失败'); });
  }

  // 订阅设置
  var SUBS = [['subZjx', '专精特新', '专精特新中小企业/小巨人相关申报'], ['subRd', '研发补贴', '研发投入后补助、加计扣除等'],
    ['subEquip', '设备更新', '技术改造、设备购置奖励'], ['subHigh', '高企认定', '国家高新技术企业认定奖补'],
    ['subStartup', '创业扶持', '创业补贴、退役军人创业扶持等'], ['subPark', '园区发布', '所在园区定向发布的扶持项目']];
  RENDERERS['#/subscribe'] = function (el) {
    el.innerHTML = '<div class="body-card" style="padding:4px 0"><div id="sub-list">' + SUBS.map(function (s, i) {
      return '<div class="sub-item"><div class="s-tx"><b>' + s[1] + '</b><p>' + s[2] + '</p></div>' +
        '<div class="switch" data-k="' + s[0] + '" onclick="this.classList.toggle(\'on\')"></div></div>';
    }).join('') + '</div></div>' +
      '<button class="btn" onclick="saveSub()">保存设置</button>' +
      '<p style="font-size:12px;color:var(--sub);text-align:center;margin-top:12px">开启后，匹配到的政策将通过「消息 · 精准推送」提醒你。</p>';
    if (!localStorage.getItem(TOKEN_KEY)) { /* 游客可查看，保存时提示 */ }
  };
  window.saveSub = function () {
    if (!localStorage.getItem(TOKEN_KEY)) { needLogin(); return; }
    var body = {};
    document.querySelectorAll('#sub-list .switch').forEach(function (sw) { body[sw.getAttribute('data-k')] = sw.classList.contains('on') ? 1 : 0; });
    api('/liqi/subscribe/save', { method: 'POST', body: body }).then(function () { toast('已保存'); }).catch(function (e) { toast(e.msg || '保存失败'); });
  };

  // 我的收藏
  RENDERERS['#/favorite'] = function (el) {
    if (!localStorage.getItem(TOKEN_KEY)) { el.innerHTML = empty('登录后查看收藏'); return; }
    el.innerHTML = loading();
    api('/liqi/favorite/list').then(function (list) {
      el.innerHTML = list && list.length ? list.map(function (f) {
        return '<div class="pcard" onclick="location.hash=\'#/detail?id=' + esc(f.policyId) + '\'">' +
          '<div class="tt">' + esc(f.policyTitle) + '</div>' +
          '<div class="meta"><span class="tag">' + esc(typeName(f.policyType)) + '</span>' +
          (f.publishOrg ? '<span class="org">| ' + esc(f.publishOrg) + '</span>' : '') + '</div></div>';
      }).join('') : empty('还没有收藏政策');
    }).catch(function () { el.innerHTML = empty('加载失败'); });
  };

  // 我的
  RENDERERS['#/mine'] = function (el) {
    var tk = localStorage.getItem(TOKEN_KEY);
    el.innerHTML =
      '<div class="mine-hd"><div class="avatar">👤</div><div class="uinfo">' +
        (tk ? '<b>惠企用户</b><p>已登录</p>' : '<b>点击登录</b><p style="cursor:pointer" onclick="location.hash=\'#/login\'">登录后体验收藏 / 绑定 / 精准推送</p>') +
      '</div></div>' +
      '<div class="mine-list">' +
        '<div class="mi" onclick="location.hash=\'#/bind\'"><span class="mi-ico">🏷️</span><span class="mi-tx">绑定我的企业</span><span class="mi-ar">›</span></div>' +
        '<div class="mi" onclick="location.hash=\'#/favorite\'"><span class="mi-ico">⭐</span><span class="mi-tx">我的收藏</span><span class="mi-ar">›</span></div>' +
        '<div class="mi" onclick="location.hash=\'#/myapply\'"><span class="mi-ico">📝</span><span class="mi-tx">我的申报</span><span class="mi-ar">›</span></div>' +
      '</div>' +
      (tk ? '<button class="btn ghost" onclick="logout()">退出登录</button>' : '');
  };
  window.logout = function () { localStorage.removeItem(TOKEN_KEY); toast('已退出'); route(); };

  // 我的申报
  RENDERERS['#/myapply'] = function (el) {
    if (!localStorage.getItem(TOKEN_KEY)) { el.innerHTML = empty('登录后查看申报记录'); return; }
    el.innerHTML = loading();
    api('/liqi/apply/page' + qs({ pageNo: 1, pageSize: 20 })).then(function (d) {
      var list = d.list || [];
      el.innerHTML = list.length ? list.map(function (a) {
        // 改道后申报写入「预留信息」：content=申报项目(+备注)，company=申报企业；预留信息暂无跟进状态，统一"待联系"
        var st = '待联系';
        return '<div class="pcard"><div class="tt">' + esc(a.content || '政策申报') + '</div>' +
          '<div class="meta"><span class="tag park">' + st + '</span><span class="org">' + esc(a.company || '') + '</span></div></div>';
      }).join('') : empty('还没有申报记录');
    }).catch(function () { el.innerHTML = empty('加载失败'); });
  };

  // 登录（一期：手机号 + 验证码，走底座 member 短信登录；短信未配置时会提示）
  RENDERERS['#/login'] = function (el) {
    el.innerHTML =
      '<div class="form-card" style="margin-top:20px">' +
        '<div class="fitem"><label>手机号</label><input id="lg-phone" type="tel" placeholder="请输入手机号" value="18888888888"/></div>' +
        '<div class="fitem"><label>验证码</label><div style="display:flex;gap:10px"><input id="lg-code" placeholder="验证码" style="flex:1"/>' +
          '<button class="btn ghost" style="width:120px" onclick="sendSms()">获取验证码</button></div></div>' +
        '<button class="btn" onclick="doLogin()">登录 / 注册</button>' +
        '<p style="font-size:12px;color:var(--sub);text-align:center;margin-top:12px">未注册手机号验证后自动登录。演示环境可使用测试账号。</p>' +
      '</div>';
  };
  window.sendSms = function () {
    var phone = document.getElementById('lg-phone').value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) { toast('手机号格式不正确'); return; }
    api('/member/auth/send-sms-code', { method: 'POST', body: { mobile: phone, scene: 1 } })
      .then(function () { toast('验证码已发送（演示环境见后端日志）'); })
      .catch(function (e) { toast(e.msg || '短信发送失败（二期配置）'); });
  };
  window.doLogin = function () {
    var phone = document.getElementById('lg-phone').value.trim();
    var code = document.getElementById('lg-code').value.trim();
    if (!phone || !code) { toast('请输入手机号和验证码'); return; }
    api('/member/auth/sms-login', { method: 'POST', body: { mobile: phone, code: code } })
      .then(function (d) { if (d && d.accessToken) { localStorage.setItem(TOKEN_KEY, d.accessToken); toast('登录成功'); setTimeout(function () { location.hash = '#/mine'; }, 800); } else { toast('登录返回异常'); } })
      .catch(function (e) { toast(e.msg || '登录失败'); });
  };

  // ③ 绑定我的企业（输企业名 → 工商确认 → 绑定画像）
  RENDERERS['#/bind'] = function (el) {
    if (!localStorage.getItem(TOKEN_KEY)) { el.innerHTML = empty('请先登录后绑定企业'); return; }
    el.innerHTML =
      '<div class="form-card">' +
        '<div class="fitem"><label>企业名称 / 信用代码</label><input id="bd-kw" placeholder="请输入企业全称或统一社会信用代码"/></div>' +
        '<button class="btn ghost" onclick="searchEnt()">查询企业</button>' +
        '<div id="bd-result" style="margin-top:14px"></div>' +
      '</div>' +
      '<div id="bd-current" style="margin-top:14px"></div>';
    api('/liqi/bind/get').then(function (b) {
      if (b && b.enterpriseName) {
        document.getElementById('bd-current').innerHTML =
          '<div class="body-card"><b>当前绑定企业</b><p style="margin-top:8px">' + esc(b.enterpriseName) + '</p>' +
          '<p style="color:var(--sub);font-size:13px;margin-top:4px">' + esc(b.snapshotRegion || '') + ' · ' + esc(b.snapshotIndustry || '') + '</p>' +
          '<p style="color:var(--sub);font-size:13px">资质：' + esc(b.snapshotQualifications || '—') + '</p></div>';
        document.getElementById('bd-kw').value = b.enterpriseName;
      }
    }).catch(function () {});
  };
  window.searchEnt = function () {
    var kw = document.getElementById('bd-kw').value.trim();
    if (!kw) { toast('请输入企业名称'); return; }
    var box = document.getElementById('bd-result');
    box.innerHTML = loading();
    api('/liqi/enterprise/base-info' + qs({ keyword: kw })).then(function (e) {
      if (!e || !e.name) { box.innerHTML = empty('未查询到该企业，请核对名称'); return; }
      var tags = (e.tags || '').split(';').filter(Boolean).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      box.innerHTML =
        '<div class="ent-card"><div class="en">' + esc(e.name) + '</div>' +
        '<div class="em">法人：' + esc(e.legalPerson || '—') + '　行业：' + esc(e.industry || '—') + '<br/>' +
        '信用代码：' + esc(e.creditCode || '—') + '<br/>地址：' + esc(e.registerAddress || '—') + '</div>' +
        (tags ? '<div class="et">' + tags + '</div>' : '') +
        '<button class="btn orange" style="margin-top:12px;width:100%" onclick="doBind(\'' + esc(kw) + '\')">绑定这家企业，用于智能匹配/推送</button></div>';
    }).catch(function (err) { box.innerHTML = empty('查询失败：' + (err.msg || '')); });
  };
  window.doBind = function (keyword) {
    api('/liqi/bind/bind', { method: 'POST', body: { keyword: keyword } })
      .then(function () { toast('绑定成功，已生成企业画像'); setTimeout(function () { location.hash = '#/match'; }, 1000); })
      .catch(function (e) { toast(e.msg || '绑定失败'); });
  };

  // ⑤ AI 政策助手（SSE 流式问答）
  RENDERERS['#/ai'] = function (el) {
    el.innerHTML =
      '<div class="ai-chat" id="ai-chat">' +
        '<div class="bubble ai">您好，我是力企云 AI 政策助手 🤖<br/>可以问我：高新企业怎么认定？专精特新补贴多少？研发费用怎么加计扣除？把政策讲成大白话。</div>' +
      '</div>' +
      '<div class="ai-input"><input id="ai-q" placeholder="请输入政策问题…" onkeydown="if(event.key===\'Enter\')sendAi()"/>' +
        '<button class="btn orange" onclick="sendAi()">发送</button></div>';
  };
  window.sendAi = function () {
    var q = document.getElementById('ai-q').value.trim();
    if (!q) { toast('请输入问题'); return; }
    var chat = document.getElementById('ai-chat');
    chat.innerHTML += '<div class="bubble me">' + esc(q) + '</div>';
    document.getElementById('ai-q').value = '';
    var ans = document.createElement('div');
    ans.className = 'bubble ai';
    ans.innerHTML = '<span class="ai-typing">思考中…</span>';
    chat.appendChild(ans);
    var first = true;
    ssePost('/liqi/ai/chat', { content: q },
      function (delta) {
        if (first) { ans.innerHTML = ''; first = false; }
        ans.innerHTML = esc(ans.textContent + delta).replace(/\n/g, '<br/>');
        chat.scrollTop = chat.scrollHeight;
      },
      function () {
        if (first) { ans.innerHTML = '（暂无回复，请稍后再试）'; }
        chat.scrollTop = chat.scrollHeight;
      });
  };

  // ⑫ 专家直播大讲堂
  RENDERERS['#/live'] = function (el) {
    el.innerHTML = '<div id="live-list">' + loading() + '</div>';
    api('/liqi/live/list').then(function (list) {
      list = list || [];
      var box = document.getElementById('live-list');
      if (!list.length) { box.innerHTML = empty('暂无直播安排'); return; }
      var stMap = ['预告', '直播中', '回放', '已下架'];
      var stColor = ['#3b82f6', '#ef4444', '#10b981', '#999'];
      box.innerHTML = list.map(function (lv) {
        var st = lv.status == null ? 0 : lv.status;
        var btn = '';
        if (st === 1 && lv.liveUrl) { btn = '<a class="btn orange" style="text-decoration:none;text-align:center" href="' + esc(lv.liveUrl) + '" target="_blank" rel="noopener">进入直播间</a>'; }
        else if (st === 2 && lv.replayUrl) { btn = '<a class="btn ghost" style="text-decoration:none;text-align:center" href="' + esc(lv.replayUrl) + '" target="_blank" rel="noopener">观看回放</a>'; }
        else if (st === 0) { btn = '<button class="btn ghost" style="width:100%" disabled>预约提醒（开播前通知）</button>'; }
        var cover = lv.coverUrl
          ? '<div class="live-cover"><img src="' + esc(lv.coverUrl) + '" alt=""/></div>'
          : '<div class="live-cover live-cover-ph">🎥</div>';
        return '<div class="live-card">' + cover +
          '<div class="live-bd"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
            '<b>' + esc(lv.title) + '</b><span class="live-st" style="background:' + stColor[st] + '">' + stMap[st] + '</span></div>' +
          '<div class="live-meta">讲师：' + esc(lv.lecturer || '—') + (lv.lecturerDesc ? '（' + esc(lv.lecturerDesc) + '）' : '') + '</div>' +
          '<div class="live-meta">时间：' + esc(fmtTime(lv.startTime)) + '</div>' +
          (lv.summary ? '<div class="live-desc">' + esc(lv.summary) + '</div>' : '') +
          (btn ? '<div style="margin-top:10px">' + btn + '</div>' : '') + '</div></div>';
      }).join('');
    }).catch(function () { document.getElementById('live-list').innerHTML = empty('加载失败'); });
  };

  // 进入需要登录态的页面后刷新未读数
  refreshUnread();
  route();
})();
