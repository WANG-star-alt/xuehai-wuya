// assets/charts.js — 学海无涯 图表
(function () {
  if (typeof echarts === 'undefined') return;

  var style = getComputedStyle(document.documentElement);
  var accent  = (style.getPropertyValue('--accent')  || '#556b3d').trim();
  var accent2 = (style.getPropertyValue('--accent2') || '#a05a2c').trim();
  var ink     = (style.getPropertyValue('--ink')     || '#2b2a26').trim();
  var muted   = (style.getPropertyValue('--muted')   || '#8a8579').trim();
  var rule    = (style.getPropertyValue('--rule')    || '#e2dccf').trim();
  var bg2     = (style.getPropertyValue('--bg2')     || '#f2ede4').trim();

  var titleFont = 'Crimson, "Noto Serif SC", serif';
  var bodyFont  = 'Lora, "Noto Serif SC", serif';

  // ==============================================================
  // Chart 1: OSI 7 vs TCP/IP 4
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-layers');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var osi = [
      { name: '应用层',   en: 'Application',  tcp: '应用层' },
      { name: '表示层',   en: 'Presentation', tcp: '应用层' },
      { name: '会话层',   en: 'Session',      tcp: '应用层' },
      { name: '传输层',   en: 'Transport',    tcp: '传输层' },
      { name: '网络层',   en: 'Network',      tcp: '网络层' },
      { name: '数据链路层', en: 'Data Link',  tcp: '网络接口层' },
      { name: '物理层',   en: 'Physical',     tcp: '网络接口层' }
    ];

    var tcpColor = function (name) {
      switch (name) {
        case '应用层':     return accent;
        case '传输层':     return accent2;
        case '网络层':     return '#7d6c3e';
        case '网络接口层': return '#8a8579';
        default: return muted;
      }
    };

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      grid: [
        { left: '4%',  right: '52%', top: 30, bottom: 30, containLabel: true },
        { left: '52%', right: '4%',  top: 30, bottom: 30, containLabel: true }
      ],
      xAxis: [
        { gridIndex: 0, type: 'value', show: false, max: 1 },
        { gridIndex: 1, type: 'value', show: false, max: 1 }
      ],
      yAxis: [
        {
          gridIndex: 0, type: 'category',
          data: osi.map(function (o) { return o.name; }).reverse(),
          axisLine: { lineStyle: { color: rule } },
          axisTick: { show: false },
          axisLabel: { color: ink, fontSize: 12, fontWeight: 'bold' },
          name: 'OSI 七层', nameLocation: 'middle', nameGap: 50,
          nameTextStyle: { color: accent, fontFamily: titleFont, fontSize: 14, fontWeight: 'bold' }
        },
        {
          gridIndex: 1, type: 'category',
          data: ['网络接口层', '网络接口层', '网络层', '传输层', '应用层', '应用层', '应用层'],
          axisLine: { lineStyle: { color: rule } },
          axisTick: { show: false },
          axisLabel: {
            color: ink, fontSize: 12, fontWeight: 'bold',
            formatter: function (v, idx) {
              var arr = ['网络接口层', '网络接口层', '网络层', '传输层', '应用层', '应用层', '应用层'];
              if (idx > 0 && arr[idx] === arr[idx - 1]) return '';
              return v;
            }
          },
          name: 'TCP/IP 四层', nameLocation: 'middle', nameGap: 60,
          nameTextStyle: { color: accent2, fontFamily: titleFont, fontSize: 14, fontWeight: 'bold' }
        }
      ],
      series: [
        {
          type: 'bar', xAxisIndex: 0, yAxisIndex: 0,
          data: osi.slice().reverse().map(function (o) {
            return { value: 1, itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] }, label: { formatter: o.en } };
          }),
          barWidth: '65%',
          label: {
            show: true, position: 'insideLeft', color: '#fff',
            fontFamily: bodyFont, fontSize: 11, fontStyle: 'italic',
            formatter: function (p) { return p.data.label.formatter; }
          }
        },
        {
          type: 'bar', xAxisIndex: 1, yAxisIndex: 1,
          data: [
            { value: 1, itemStyle: { color: tcpColor('网络接口层'), borderRadius: [4, 0, 0, 4] } },
            { value: 1, itemStyle: { color: tcpColor('网络接口层') } },
            { value: 1, itemStyle: { color: tcpColor('网络层'), borderRadius: [4, 0, 0, 4] } },
            { value: 1, itemStyle: { color: tcpColor('传输层'), borderRadius: [4, 0, 0, 4] } },
            { value: 1, itemStyle: { color: tcpColor('应用层'), borderRadius: [4, 0, 0, 4] } },
            { value: 1, itemStyle: { color: tcpColor('应用层') } },
            { value: 1, itemStyle: { color: tcpColor('应用层') } }
          ],
          barWidth: '65%'
        }
      ],
      tooltip: {
        appendToBody: true,
        formatter: function (p) {
          if (p.seriesIndex === 0) {
            var o = osi.slice().reverse()[p.dataIndex];
            return '<b>' + o.name + '</b> · ' + o.en + '<br/>对应 TCP/IP：' + o.tcp;
          }
          return '';
        }
      }
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 2: 常见协议流量占比
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-protocol');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      color: [accent, accent2, '#7d6c3e', '#a89a6e', muted, '#b8a58a'],
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
      legend: {
        bottom: 10,
        textStyle: { color: ink, fontFamily: bodyFont, fontSize: 12 },
        itemWidth: 12, itemHeight: 12
      },
      series: [{
        name: '协议占比',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: bg2, borderWidth: 2 },
        label: { color: ink, fontFamily: bodyFont, fontSize: 12, formatter: '{b}\n{d}%' },
        labelLine: { lineStyle: { color: rule } },
        data: [
          { value: 42, name: 'HTTPS (Web)' },
          { value: 24, name: '流媒体 (UDP)' },
          { value: 12, name: 'DNS' },
          { value: 10, name: 'QUIC / HTTP3' },
          { value: 7,  name: '邮件 / SSH' },
          { value: 5,  name: '其他' }
        ]
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 3: HTTPS 请求耗时分解
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-timing');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var stages   = ['DNS 解析', 'TCP 握手', 'TLS 握手', '发送请求', '服务器处理', '内容下载', '浏览器渲染'];
    var duration = [20, 40, 90, 5, 120, 60, 180];

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true,
        formatter: function (p) { return p[0].name + '<br/><b>' + p[0].value + ' ms</b>'; }
      },
      grid: { left: 90, right: 30, top: 20, bottom: 40 },
      xAxis: {
        type: 'value', name: '毫秒 (ms)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      yAxis: {
        type: 'category', data: stages, inverse: true,
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: duration.map(function (v, i) {
          var colors = [accent, accent, accent2, '#7d6c3e', accent2, accent, '#7d6c3e'];
          return { value: v, itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] } };
        }),
        barWidth: '55%',
        label: { show: true, position: 'right', color: ink, fontFamily: bodyFont, fontSize: 11, formatter: '{c} ms' }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 4: HTTP 三代雷达
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-http-versions');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      color: [muted, accent, accent2],
      legend: {
        bottom: 10,
        textStyle: { color: ink, fontFamily: bodyFont, fontSize: 12 },
        itemWidth: 14, itemHeight: 8
      },
      tooltip: { appendToBody: true, trigger: 'item' },
      radar: {
        indicator: [
          { name: '速度',     max: 10 },
          { name: '多路复用', max: 10 },
          { name: '头部压缩', max: 10 },
          { name: '安全性',   max: 10 },
          { name: '弱网表现', max: 10 }
        ],
        center: ['50%', '48%'],
        radius: '60%',
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, '#faf7f2'] } },
        axisLine: { lineStyle: { color: rule } },
        axisName: { color: ink, fontSize: 12, fontFamily: bodyFont }
      },
      series: [{
        type: 'radar',
        data: [
          { value: [3, 1, 1, 4, 3], name: 'HTTP/1.1 (1997)', areaStyle: { opacity: 0.15 }, lineStyle: { width: 2 } },
          { value: [7, 8, 8, 8, 6], name: 'HTTP/2 (2015)',   areaStyle: { opacity: 0.2  }, lineStyle: { width: 2 } },
          { value: [9, 9, 9, 9, 9], name: 'HTTP/3 · QUIC',    areaStyle: { opacity: 0.25 }, lineStyle: { width: 2 } }
        ]
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 5: 蜂窝网络 2G→5G
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-cellular');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var gens = ['2G', '3G', '4G', '4G+', '5G Sub-6', '5G mmWave'];
    var mbps = [0.2, 42, 150, 1000, 3000, 20000];

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      tooltip: {
        appendToBody: true, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: function (p) {
          var v = p[0].value;
          var disp = v >= 1000 ? (v / 1000).toFixed(1) + ' Gbps' : v + ' Mbps';
          return p[0].name + '<br/><b>' + disp + '</b>';
        }
      },
      grid: { left: 70, right: 40, top: 30, bottom: 40 },
      xAxis: {
        type: 'category', data: gens,
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 12 }
      },
      yAxis: {
        type: 'log', name: 'Mbps (对数)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { lineStyle: { color: rule } },
        axisLabel: {
          color: muted, fontSize: 11,
          formatter: function (v) { return v >= 1000 ? (v / 1000) + ' Gbps' : v + ' Mbps'; }
        },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: mbps.map(function (v, i) {
          var palette = [muted, '#a89a6e', '#7d6c3e', accent, accent2, '#963f34'];
          return { value: v, itemStyle: { color: palette[i], borderRadius: [4, 4, 0, 0] } };
        }),
        barWidth: '55%',
        label: {
          show: true, position: 'top', color: ink, fontFamily: bodyFont, fontSize: 11,
          formatter: function (p) {
            var v = p.value;
            return v >= 1000 ? (v / 1000) + ' Gbps' : v + ' Mbps';
          }
        }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 6: Git 三区流动
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-git-areas');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: bodyFont, color: ink },
      tooltip: {
        appendToBody: true,
        trigger: 'item',
        formatter: function (p) {
          if (p.dataType === 'edge') {
            return p.data.source.replace('\n', ' / ') + ' → ' + p.data.target.replace('\n', ' / ') +
                   '<br/>命令：<code>' + p.data.cmd + '</code>';
          }
          return p.name.replace('\n', ' / ');
        }
      },
      series: [{
        type: 'sankey',
        left: 30, right: 130, top: 20, bottom: 20,
        nodeWidth: 24,
        nodeGap: 22,
        emphasis: { focus: 'adjacency' },
        data: [
          { name: '远程 (pull)\nGitHub',    itemStyle: { color: '#8a8579' } },
          { name: '仓库 (pull)\nRepository', itemStyle: { color: '#7d6c3e' } },
          { name: '工作区\nWorking',        itemStyle: { color: accent } },
          { name: '暂存区\nStaging',        itemStyle: { color: accent2 } },
          { name: '仓库\nRepository',       itemStyle: { color: '#7d6c3e' } },
          { name: '远程\nGitHub',           itemStyle: { color: '#8a8579' } }
        ],
        links: [
          { source: '远程 (pull)\nGitHub',    target: '仓库 (pull)\nRepository', value: 1, cmd: 'git pull',     lineStyle: { opacity: 0.3 } },
          { source: '仓库 (pull)\nRepository', target: '工作区\nWorking',        value: 1, cmd: 'git checkout', lineStyle: { opacity: 0.3 } },
          { source: '工作区\nWorking',        target: '暂存区\nStaging',         value: 2, cmd: 'git add',      lineStyle: { opacity: 0.55 } },
          { source: '暂存区\nStaging',        target: '仓库\nRepository',        value: 2, cmd: 'git commit',   lineStyle: { opacity: 0.55 } },
          { source: '仓库\nRepository',       target: '远程\nGitHub',            value: 2, cmd: 'git push',     lineStyle: { opacity: 0.55 } }
        ],
        label: {
          color: ink,
          fontFamily: bodyFont,
          fontSize: 12,
          fontWeight: 'bold'
        },
        lineStyle: { curveness: 0.5 }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  })();

  // ==============================================================
  // Chart 7: 学海无涯 · 知识树状图（径向可折叠树）
  // ==============================================================
  (function () {
    var el = document.getElementById('chart-knowledge-map');
    if (!el) return;

    var VOL_NET = accent;
    var VOL_GIT = accent2;
    var VOL_AI  = '#4a6d8c';
    var VOL_FUT = muted;
    var ROOT_C  = ink;

    // ---------- 网络篇 ----------
    var netChildren = [
      { name: '第 1 章 · 网络是什么',
        children: [
          { name: '主机 Host' }, { name: '协议 Protocol' }, { name: '地址 Address' },
          { name: '客户端 / 服务器' }, { name: '数据包 Packet' }, { name: '带宽 / 时延 / 丢包' }
        ] },
      { name: '第 2 章 · 分层模型',
        children: [
          { name: 'OSI 7 层',
            children: [
              { name: '物理层' }, { name: '数据链路层' }, { name: '网络层' },
              { name: '传输层' }, { name: '会话层' }, { name: '表示层' }, { name: '应用层' }
            ] },
          { name: 'TCP/IP 4 层' },
          { name: '每层职责一览' }
        ] },
      { name: '第 3 章 · 关键协议',
        children: [
          { name: 'HTTP / HTTPS',
            children: [
              { name: '请求方法 GET/POST' }, { name: '状态码 2xx-5xx' },
              { name: 'Header / Cookie' }, { name: 'TLS 握手' }, { name: 'HTTP/2 · HTTP/3' }
            ] },
          { name: 'TCP',
            children: [
              { name: '三次握手' }, { name: '四次挥手' },
              { name: '流量控制' }, { name: '拥塞控制' }
            ] },
          { name: 'UDP' },
          { name: 'DNS',
            children: [
              { name: '根 / 顶级 / 权威' }, { name: '递归 vs 迭代' }, { name: 'DNS 污染 / DoH' }
            ] },
          { name: 'IP',
            children: [
              { name: 'IPv4 / IPv6' }, { name: '公网 IP / 私网 IP' },
              { name: '子网与 CIDR' }, { name: 'NAT / 端口转发' }
            ] },
          { name: '其他',
            children: [
              { name: 'ARP' }, { name: 'ICMP · ping' }, { name: 'DHCP' }, { name: 'SSH / FTP / SMTP' }
            ] }
        ] },
      { name: '第 4 章 · 一次访问的旅程',
        children: [
          { name: '输入网址' }, { name: 'DNS 查询' }, { name: '建立 TCP' },
          { name: 'TLS 握手' }, { name: '发送 HTTP 请求' }, { name: '服务器响应' },
          { name: '浏览器渲染' }
        ] },
      { name: '第 5 章 · 网络设备',
        children: [
          { name: '路由器 Router' }, { name: '交换机 Switch' },
          { name: '网关 Gateway' }, { name: '防火墙 Firewall' },
          { name: '负载均衡 LB' }, { name: '光猫 · 光纤' }
        ] },
      { name: '第 6 章 · 无线与移动',
        children: [
          { name: 'WiFi 6/7' }, { name: '蓝牙' }, { name: 'NFC' },
          { name: '4G / 5G / 6G' }, { name: '卫星互联网' }
        ] },
      { name: '第 7 章 · 云与边缘',
        children: [
          { name: 'CDN' }, { name: '云网络 VPC' }, { name: '边缘节点' },
          { name: '容器网络 · K8s' }, { name: 'Serverless' }
        ] },
      { name: '第 8 章 · 网络安全',
        children: [
          { name: '对称加密' }, { name: '非对称加密' }, { name: '数字证书 CA' },
          { name: 'XSS / CSRF / SQL 注入' }, { name: 'DDoS' },
          { name: 'VPN / 代理' }, { name: '零信任 · Zero Trust' }
        ] },
      { name: '第 9 章 · 排错工具箱',
        children: [
          { name: 'ping' }, { name: 'traceroute' }, { name: 'nslookup / dig' },
          { name: 'curl / wget' }, { name: 'netstat / ss' }, { name: 'Wireshark 抓包' }
        ] },
      { name: '第 10 章 · 现代协议演进',
        children: [
          { name: 'HTTP/3 · QUIC' }, { name: 'IPv6 全面部署' },
          { name: 'DoH · DoT · 加密 DNS' }, { name: 'BBR 拥塞控制' }
        ] }
    ];

    // ---------- Git 篇 ----------
    var gitChildren = [
      { name: 'Git vs GitHub',
        children: [
          { name: 'Git = 本地工具' }, { name: 'GitHub = 云端仓库' },
          { name: 'GitLab / Gitee / Bitbucket' }
        ] },
      { name: '概念地图',
        children: [
          { name: '工作区 Working' }, { name: '暂存区 Staging' },
          { name: '本地仓库 Local' }, { name: '远程仓库 Remote' },
          { name: '.git 目录' }, { name: 'HEAD 指针' }
        ] },
      { name: '日常十条命令',
        children: [
          { name: 'git init / clone' }, { name: 'git status' },
          { name: 'git add' }, { name: 'git commit -m' },
          { name: 'git log' }, { name: 'git diff' },
          { name: 'git push / pull' }, { name: 'git fetch' },
          { name: 'git branch' }, { name: 'git checkout / switch' }
        ] },
      { name: '分支与合并',
        children: [
          { name: 'branch 创建 / 切换' }, { name: 'merge 合并' },
          { name: 'rebase 变基' }, { name: 'cherry-pick' },
          { name: '冲突解决' }, { name: 'fast-forward' }
        ] },
      { name: '时光机 · 撤销',
        children: [
          { name: 'git reset --soft / hard' }, { name: 'git revert' },
          { name: 'git stash' }, { name: 'git reflog 救命' }
        ] },
      { name: '协作工作流',
        children: [
          { name: 'Fork · Pull Request' }, { name: 'Code Review' },
          { name: 'Git Flow' }, { name: 'GitHub Flow' }, { name: 'Trunk-based' }
        ] },
      { name: '认证与远程',
        children: [
          { name: 'HTTPS + Token' }, { name: 'SSH Key' },
          { name: 'origin / upstream' }, { name: '多远程管理' }
        ] },
      { name: '生态与进阶',
        children: [
          { name: '.gitignore' }, { name: 'submodule' }, { name: 'LFS 大文件' },
          { name: 'GitHub Actions CI/CD' }, { name: 'Cloudflare Pages 部署' },
          { name: 'GUI: VS Code / Fork / SourceTree' }
        ] }
    ];

    // ---------- AI 篇（14 章 · 带锚点） ----------
    var aiChildren = [
      { name: '第 1 章 · AI 是什么', link: 'chapters/ai/01-what-is-ai.html', external: true,
        children: [
          { name: '弱 AI · ANI 篇',    link: 'chapters/ai/01-1-ani.html',       external: true },
          { name: '通用 AI · AGI 篇',  link: 'chapters/ai/01-2-agi.html',       external: true },
          { name: '超级 AI · ASI 篇',  link: 'chapters/ai/01-3-asi.html',       external: true },
          { name: '四种能力篇 · 感知 / 理解 / 决策 / 生成', link: 'chapters/ai/01-4-abilities.html', external: true }
        ] },
      { name: '第 2 章 · 三个圈', link: 'chapters/ai/02-three-circles.html', external: true,
        children: [
          { name: '人工智能 · AI 篇',      link: 'chapters/ai/02-1-ai.html',    external: true },
          { name: '机器学习 · ML 篇',      link: 'chapters/ai/02-2-ml.html',    external: true },
          { name: '深度学习 · DL 篇',      link: 'chapters/ai/02-3-dl.html',    external: true },
          { name: '生成式 AI · GenAI 篇',  link: 'chapters/ai/02-4-genai.html', external: true },
          { name: '大语言模型 · LLM 篇',   link: 'chapters/ai/02-5-llm.html',   external: true }
        ] },
      { name: '第 3 章 · 简史', link: 'a-03',
        children: [
          { name: '1950 图灵测试' }, { name: '1956 达特茅斯会议' },
          { name: '1980s 专家系统' }, { name: '1997 深蓝' },
          { name: '2012 AlexNet' }, { name: '2016 AlphaGo' },
          { name: '2017 Transformer' }, { name: '2022 ChatGPT' },
          { name: '2025 推理模型 & Agent' }
        ] },
      { name: '第 4 章 · 机器学习', link: 'a-04',
        children: [
          { name: '监督学习' }, { name: '无监督学习' },
          { name: '强化学习' }, { name: '自监督学习' },
          { name: '特征 / 标签 / 过拟合' }
        ] },
      { name: '第 5 章 · 神经网络', link: 'a-05',
        children: [
          { name: '神经元 Neuron' }, { name: '权重 / 偏置 / 激活' },
          { name: '前向传播' }, { name: '反向传播' },
          { name: 'CNN 图像' }, { name: 'RNN / LSTM' },
          { name: 'GAN 对抗' }, { name: 'Diffusion 扩散' }
        ] },
      { name: '第 6 章 · 训练三部曲', link: 'a-06',
        children: [
          { name: '数据 · Dataset' }, { name: '模型 · Model' },
          { name: '损失 · Loss' }, { name: '梯度下降' },
          { name: '预训练 Pre-train' }, { name: 'SFT 指令微调' },
          { name: 'RLHF / DPO 对齐' }, { name: 'RL 推理训练' }
        ] },
      { name: '第 7 章 · Transformer', link: 'a-07',
        children: [
          { name: 'Attention 注意力' },
          { name: 'Query / Key / Value' },
          { name: 'Multi-head 多头' },
          { name: 'Encoder-only · BERT' },
          { name: 'Decoder-only · GPT' },
          { name: 'MoE 专家混合' }
        ] },
      { name: '第 8 章 · 大语言模型 LLM', link: 'a-08',
        children: [
          { name: 'Token 分词' }, { name: '自回归生成' },
          { name: 'Context Window' }, { name: 'Temperature / Top-p' },
          { name: 'System Prompt' }, { name: '思维链 CoT' },
          { name: '推理模型 o1 / R1' }
        ] },
      { name: '第 9 章 · 多模态', link: 'a-09',
        children: [
          { name: '文 · Text' }, { name: '图 · Image' },
          { name: '视频 · Video' }, { name: '语音 · Audio' },
          { name: 'Embedding 向量' }, { name: 'CLIP 跨模态对齐' }
        ] },
      { name: '第 10 章 · 提示词工程', link: 'a-10',
        children: [
          { name: '角色 Role' }, { name: '任务 Task' },
          { name: '示例 Few-shot' }, { name: '一步步想 CoT' },
          { name: '输出格式' }, { name: '迭代对话' }
        ] },
      { name: '第 11 章 · AI 智能体 Agent', link: 'a-11',
        children: [
          { name: '大脑 LLM' }, { name: '记忆 Memory' },
          { name: '工具 Tools' }, { name: 'ReAct 循环' },
          { name: 'RAG 检索增强' }, { name: 'MCP 协议' },
          { name: 'Multi-Agent 协作' }
        ] },
      { name: '第 12 章 · 生态地图', link: 'a-12',
        children: [
          { name: '芯片: NVIDIA · 华为' },
          { name: '基础模型: OpenAI · Anthropic · Google' },
          { name: '中国阵营: DeepSeek · Qwen · 豆包 · Kimi · GLM' },
          { name: '开源: Llama · Mistral · Hugging Face' },
          { name: '工具: Cursor · TRAE · Ollama' },
          { name: '应用: ChatGPT · Claude · Perplexity · Midjourney · Sora' }
        ] },
      { name: '第 13 章 · 局限与风险', link: 'a-13',
        children: [
          { name: '幻觉 Hallucination' }, { name: '偏见 Bias' },
          { name: '时效性 Cut-off' }, { name: '隐私 / 版权' },
          { name: '深度伪造' }, { name: 'Prompt 注入' }
        ] },
      { name: '第 14 章 · 与 AI 共处', link: 'a-14',
        children: [
          { name: '学习助手' }, { name: '写作 / 编程 / 研究' },
          { name: '批判性思维' }, { name: '保留人类判断' }
        ] }
    ];

    // ---------- 未来篇 · 预留 ----------
    var futureChildren = [
      { name: '数据结构与算法',
        children: [ { name: '数组 / 链表' }, { name: '树 / 图' }, { name: '排序 / 搜索' }, { name: '动态规划' } ] },
      { name: '操作系统',
        children: [ { name: '进程 / 线程' }, { name: '内存管理' }, { name: '文件系统' }, { name: '并发 / 锁' } ] },
      { name: '数据库',
        children: [ { name: 'SQL 基础' }, { name: '索引 / 事务' }, { name: 'NoSQL' }, { name: '向量数据库' } ] },
      { name: '编程语言',
        children: [ { name: 'Python' }, { name: 'JavaScript' }, { name: 'Go / Rust' }, { name: 'C / C++' } ] },
      { name: 'Web 与前端',
        children: [ { name: 'HTML / CSS' }, { name: 'JavaScript' }, { name: 'React / Vue' }, { name: '响应式设计' } ] },
      { name: '云与 DevOps',
        children: [ { name: 'Docker' }, { name: 'K8s' }, { name: 'CI/CD' }, { name: '监控 / 日志' } ] },
      { name: '安全篇',
        children: [ { name: '密码学基础' }, { name: 'Web 安全' }, { name: '渗透测试' }, { name: '零信任' } ] },
      { name: '产品与设计',
        children: [ { name: '需求分析' }, { name: '交互设计' }, { name: 'A/B 测试' }, { name: '数据驱动' } ] }
    ];

    // ==============================================================
    // 组装：把上面细化的三个分支挂进整棵人类知识大树
    // 网络 / Git / AI 都是"信息与计算科学"分支下面的叶子
    // ==============================================================
    var C_HUM  = '#8a6d4a'; // 人文 · 木色
    var C_SOC  = '#a07c56'; // 社科 · 黄土
    var C_NAT  = '#6a8b5b'; // 自然 · 苔绿
    var C_FRM  = '#5a7d8c'; // 形式 · 石青
    var C_ENG  = '#a55a3c'; // 工程 · 秋橙
    var C_MED  = '#8b5a6a'; // 医学 · 樱茜
    var C_ART  = '#7f6b8f'; // 艺术 · 藤紫
    var C_LIFE = '#7a7960'; // 生活 · 米棕

    var branchHumanities = {
      name: '人文学科', itemStyle: { color: C_HUM }, collapsed: true,
      children: [
        { name: '哲学', children: [
          { name: '西方哲学', children: [
            { name: '古希腊 · 苏 / 柏 / 亚' }, { name: '经院哲学' },
            { name: '近代理性主义' }, { name: '近代经验主义' },
            { name: '德国古典哲学' }, { name: '现象学' }, { name: '分析哲学' }, { name: '存在主义' }
          ] },
          { name: '中国哲学', children: [
            { name: '儒家' }, { name: '道家' }, { name: '墨家' }, { name: '法家' },
            { name: '宋明理学' }, { name: '心学' }
          ] },
          { name: '印度 · 佛教哲学' },
          { name: '伦理学' }, { name: '逻辑学' }, { name: '形而上学' }, { name: '认识论' }
        ] },
        { name: '文学', children: [
          { name: '诗歌' }, { name: '小说' }, { name: '戏剧' }, { name: '散文' },
          { name: '中国古典' }, { name: '现当代文学' },
          { name: '欧洲文学' }, { name: '美洲文学' }, { name: '日本 · 俳句 / 物语' }
        ] },
        { name: '历史学', children: [
          { name: '中国史', children: [
            { name: '先秦' }, { name: '秦汉' }, { name: '魏晋南北朝' },
            { name: '隋唐' }, { name: '宋元' }, { name: '明清' }, { name: '近现代' }
          ] },
          { name: '世界史', children: [
            { name: '古埃及 / 两河' }, { name: '古希腊罗马' },
            { name: '中世纪欧洲' }, { name: '大航海' },
            { name: '工业革命' }, { name: '两次世界大战' }, { name: '冷战与全球化' }
          ] },
          { name: '考古学' }, { name: '史学方法' }
        ] },
        { name: '语言学', children: [
          { name: '语音学' }, { name: '语法学' }, { name: '语义学' }, { name: '语用学' },
          { name: '社会语言学' }, { name: '历史语言学' }
        ] },
        { name: '宗教学', children: [
          { name: '佛教' }, { name: '基督教' }, { name: '伊斯兰教' }, { name: '道教' }, { name: '印度教' }
        ] }
      ]
    };

    var branchSocial = {
      name: '社会科学', itemStyle: { color: C_SOC }, collapsed: true,
      children: [
        { name: '经济学', children: [
          { name: '微观经济学' }, { name: '宏观经济学' },
          { name: '货币与金融' }, { name: '国际贸易' },
          { name: '行为经济学' }, { name: '发展经济学' }
        ] },
        { name: '政治学', children: [
          { name: '政治哲学' }, { name: '比较政治' }, { name: '国际关系' }, { name: '公共政策' }
        ] },
        { name: '法学', children: [
          { name: '宪法' }, { name: '民法' }, { name: '刑法' },
          { name: '商法 / 公司法' }, { name: '国际法' }, { name: '知识产权' }
        ] },
        { name: '社会学', children: [
          { name: '社会分层' }, { name: '家庭与人口' },
          { name: '城市社会学' }, { name: '网络社会学' }
        ] },
        { name: '心理学', children: [
          { name: '认知心理' }, { name: '发展心理' },
          { name: '社会心理' }, { name: '临床心理' }, { name: '神经心理' }
        ] },
        { name: '管理学', children: [
          { name: '战略管理' }, { name: '市场营销' }, { name: '人力资源' },
          { name: '组织行为' }, { name: '运营管理' }
        ] },
        { name: '教育学', children: [
          { name: '教育心理' }, { name: '课程与教学' }, { name: '教育技术' }
        ] },
        { name: '传播学', children: [
          { name: '大众传播' }, { name: '新媒体' }, { name: '广告学' }
        ] },
        { name: '人类学 · 地理学' }
      ]
    };

    var branchNatural = {
      name: '自然科学', itemStyle: { color: C_NAT }, collapsed: true,
      children: [
        { name: '物理学', children: [
          { name: '经典力学' }, { name: '电磁学' }, { name: '热力学 · 统计力学' },
          { name: '光学' }, { name: '相对论' }, { name: '量子力学' },
          { name: '粒子物理' }, { name: '凝聚态物理' }, { name: '天体物理' }
        ] },
        { name: '化学', children: [
          { name: '无机化学' }, { name: '有机化学' },
          { name: '分析化学' }, { name: '物理化学' }, { name: '生物化学' }
        ] },
        { name: '生物学', children: [
          { name: '细胞生物' }, { name: '遗传学' },
          { name: '分子生物' }, { name: '进化论' },
          { name: '生态学' }, { name: '神经科学' }, { name: '合成生物' }
        ] },
        { name: '地球科学', children: [
          { name: '地质学' }, { name: '气象学' },
          { name: '海洋学' }, { name: '大气科学' }, { name: '地理信息 GIS' }
        ] },
        { name: '天文学 · 宇宙学', children: [
          { name: '太阳系' }, { name: '恒星与星系' },
          { name: '黑洞与引力波' }, { name: '宇宙大爆炸' }
        ] }
      ]
    };

    var branchFormal = {
      name: '形式科学', itemStyle: { color: C_FRM },
      children: [
        { name: '数学', collapsed: true, children: [
          { name: '算术 · 初等代数' },
          { name: '几何', children: [
            { name: '平面几何' }, { name: '解析几何' }, { name: '微分几何' }, { name: '拓扑' }
          ] },
          { name: '代数', children: [
            { name: '线性代数' }, { name: '抽象代数' }, { name: '数论' }
          ] },
          { name: '分析', children: [
            { name: '微积分' }, { name: '实分析' }, { name: '复分析' }, { name: '泛函分析' }
          ] },
          { name: '概率与统计', children: [
            { name: '概率论' }, { name: '数理统计' }, { name: '贝叶斯统计' }
          ] },
          { name: '离散数学', children: [
            { name: '组合数学' }, { name: '图论' }
          ] },
          { name: '运筹与优化' }
        ] },
        { name: '逻辑学', children: [
          { name: '命题逻辑' }, { name: '一阶逻辑' },
          { name: '模态逻辑' }, { name: '数理逻辑' }
        ] },
        { name: '信息与计算科学', children: [
          { name: '计算理论', children: [
            { name: '图灵机' }, { name: '可计算性' }, { name: '复杂度 P/NP' }
          ] },
          { name: '数据结构与算法', children: [
            { name: '数组 / 链表' }, { name: '栈 / 队列' },
            { name: '树 / 图' }, { name: '哈希表' },
            { name: '排序 / 搜索' }, { name: '动态规划' }, { name: '贪心 / 分治' }
          ] },
          { name: '编程范式', children: [
            { name: '命令式' }, { name: '面向对象' },
            { name: '函数式' }, { name: '并发编程' }
          ] },
          { name: '编程语言', children: [
            { name: 'Python' }, { name: 'JavaScript / TypeScript' },
            { name: 'Java · C#' }, { name: 'C / C++' },
            { name: 'Go · Rust' }, { name: 'SQL' }
          ] },
          { name: '操作系统', children: [
            { name: '进程 / 线程' }, { name: '内存管理' },
            { name: '文件系统' }, { name: '并发 / 锁' }, { name: 'Linux · Shell' }
          ] },
          { name: '数据库', children: [
            { name: '关系型 SQL' }, { name: 'NoSQL' },
            { name: '事务与索引' }, { name: '向量数据库' }
          ] },
          { name: '计算机网络', itemStyle: { color: VOL_NET }, children: netChildren },
          { name: 'Web 与前端', children: [
            { name: 'HTML / CSS' }, { name: 'React / Vue' },
            { name: '响应式设计' }, { name: '性能优化' }
          ] },
          { name: '版本控制 · Git', itemStyle: { color: VOL_GIT }, children: gitChildren },
          { name: '云与 DevOps', children: [
            { name: 'Docker' }, { name: 'Kubernetes' },
            { name: 'CI/CD' }, { name: '监控与日志' }
          ] },
          { name: '信息安全', children: [
            { name: '密码学基础' }, { name: 'Web 安全' },
            { name: '渗透测试' }, { name: '零信任' }
          ] },
          { name: '人工智能 AI', itemStyle: { color: VOL_AI }, children: aiChildren },
          { name: '人机交互 HCI' }
        ] },
        { name: '系统科学 · 控制论' }
      ]
    };

    var branchEngineering = {
      name: '工程与技术', itemStyle: { color: C_ENG }, collapsed: true,
      children: [
        { name: '机械工程', children: [
          { name: '机械设计' }, { name: '制造工艺' }, { name: '机器人学' }
        ] },
        { name: '电子与电气', children: [
          { name: '模拟电路' }, { name: '数字电路' },
          { name: '芯片设计' }, { name: '嵌入式系统' }
        ] },
        { name: '土木与建筑', children: [
          { name: '结构工程' }, { name: '建筑设计' }, { name: '城市规划' }
        ] },
        { name: '材料科学', children: [
          { name: '金属材料' }, { name: '高分子' }, { name: '半导体材料' }
        ] },
        { name: '航空航天' }, { name: '能源工程' },
        { name: '化学工程' }, { name: '交通运输' }
      ]
    };

    var branchMedicine = {
      name: '医学与健康', itemStyle: { color: C_MED }, collapsed: true,
      children: [
        { name: '基础医学', children: [
          { name: '解剖学' }, { name: '生理学' },
          { name: '病理学' }, { name: '药理学' }, { name: '免疫学' }
        ] },
        { name: '临床医学', children: [
          { name: '内科' }, { name: '外科' },
          { name: '妇产 · 儿科' }, { name: '精神医学' }, { name: '急诊 · ICU' }
        ] },
        { name: '中医学', children: [
          { name: '中医基础理论' }, { name: '针灸 · 推拿' }, { name: '中药与方剂' }
        ] },
        { name: '公共卫生 · 流行病学' },
        { name: '营养与运动', children: [
          { name: '宏量营养素' }, { name: '微量元素' }, { name: '运动生理' }, { name: '力量训练 · 有氧' }
        ] },
        { name: '心理健康' }
      ]
    };

    var branchArts = {
      name: '艺术与设计', itemStyle: { color: C_ART }, collapsed: true,
      children: [
        { name: '视觉艺术', children: [
          { name: '绘画' }, { name: '雕塑' }, { name: '书法' }, { name: '摄影' }
        ] },
        { name: '音乐', children: [
          { name: '乐理' }, { name: '古典音乐' }, { name: '爵士 / 流行' }, { name: '电子音乐' }
        ] },
        { name: '影视', children: [
          { name: '电影史' }, { name: '导演 · 编剧' },
          { name: '摄影 · 剪辑' }, { name: '动画' }
        ] },
        { name: '戏剧 · 舞蹈' },
        { name: '设计', children: [
          { name: '平面设计' }, { name: 'UI / UX' },
          { name: '工业设计' }, { name: '室内设计' }
        ] },
        { name: '建筑艺术' }
      ]
    };

    var branchLife = {
      name: '生活技艺', itemStyle: { color: C_LIFE }, collapsed: true,
      children: [
        { name: '烹饪', children: [
          { name: '中餐' }, { name: '西餐' }, { name: '烘焙' }, { name: '刀工与火候' }
        ] },
        { name: '茶 · 咖啡 · 酒' },
        { name: '园艺 · 植物' }, { name: '手工艺 · 木工 / 缝纫' },
        { name: '摄影与视频' }, { name: '旅行' },
        { name: '理财', children: [
          { name: '储蓄 · 记账' }, { name: '基金 · 股票' },
          { name: '保险' }, { name: '税务基础' }
        ] },
        { name: '沟通与写作' }, { name: '时间管理' }
      ]
    };

    // ---------- 组装：智能 & 网络 两大平级分支 ----------
    var VOL_NET_C = accent;       // 网络篇 · 松苔绿
    var VOL_AI_C  = '#4a6d8c';    // 智能篇 · 深墨蓝

    var branchIntelligence = {
      name: '智能篇 · Intelligence',
      itemStyle: { color: VOL_AI_C },
      symbolSize: 18,
      children: aiChildren
    };

    var branchNetwork = {
      name: '网络篇 · Network',
      itemStyle: { color: VOL_NET_C },
      symbolSize: 18,
      children: netChildren
    };

    var treeData = [{
      name: '学海',
      itemStyle: { color: ink },
      symbolSize: 24,
      children: [ branchIntelligence, branchNetwork ]
    }];

    window.__xhwyTreeData = treeData;
  })();

})();

// ==============================================================
// Knowledge Map Renderer (在数据准备好后单独渲染)
// ==============================================================
(function () {
  function init() {
    if (typeof echarts === 'undefined') {
      console.warn('[kmap] echarts not loaded');
      return;
    }
    var el = document.getElementById('chart-knowledge-map');
    if (!el) {
      console.warn('[kmap] container #chart-knowledge-map not found');
      return;
    }
    if (!window.__xhwyTreeData) {
      console.warn('[kmap] tree data not ready, retry in 100ms');
      setTimeout(init, 100);
      return;
    }

    var style = getComputedStyle(document.documentElement);
    var accent2 = (style.getPropertyValue('--accent2') || '#a05a2c').trim();
    var ink     = (style.getPropertyValue('--ink')     || '#2b2a26').trim();
    var muted   = (style.getPropertyValue('--muted')   || '#8a8579').trim();
    var rule    = (style.getPropertyValue('--rule')    || '#e2dccf').trim();
    var bodyFont = 'Lora, "Noto Serif SC", serif';

    var chart = echarts.init(el, null, { renderer: 'svg' });
    var isMobile = window.innerWidth <= 720;

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: '#faf7f2',
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontFamily: bodyFont, fontSize: 12 },
        formatter: function (p) {
          return '<b>' + (p.data && p.data.name ? p.data.name : '') + '</b>';
        }
      },
      series: [{
        type: 'tree',
        data: window.__xhwyTreeData,
        layout: 'orthogonal',
        orient: 'LR',
        top: 20,
        bottom: 20,
        left: '12%',
        right: '20%',
        symbol: 'emptyCircle',
        symbolSize: 7,
        roam: true,
        initialTreeDepth: 2,
        lineStyle: {
          color: rule,
          width: 1,
          curveness: 0.55
        },
        itemStyle: {
          borderColor: ink,
          borderWidth: 1.2,
          color: '#faf7f2'
        },
        cursor: 'pointer',
        // 非叶子（有子节点、可以展开的）——标签放在圆点上方，避开进入的连线
        label: {
          position: 'top',
          verticalAlign: 'bottom',
          align: 'center',
          fontFamily: bodyFont,
          fontSize: isMobile ? 10 : 12,
          fontWeight: 'bold',
          color: ink,
          distance: 6,
          backgroundColor: 'rgba(250,247,242,0.92)',
          padding: [2, 5, 2, 5],
          borderRadius: 3
        },
        // 叶子（最末端节点）——标签放右侧
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
            distance: 8,
            color: muted,
            fontSize: isMobile ? 9 : 11,
            backgroundColor: 'rgba(250,247,242,0.85)',
            padding: [1, 3, 1, 3],
            borderRadius: 3
          }
        },
        emphasis: {
          focus: 'relative',
          itemStyle: { shadowBlur: 6, shadowColor: 'rgba(85,107,61,.35)' },
          label: {
            fontWeight: 'bold',
            color: accent2,
            backgroundColor: 'rgba(250,247,242,1)'
          }
        },
        expandAndCollapse: true,
        animationDuration: 500,
        animationDurationUpdate: 500
      }]
    });

    console.log('[kmap] rendered OK');
    window.addEventListener('resize', function () { chart.resize(); });

    // 点击带 link 字段的章节节点 → 跳转新页面 或 平滑滚动
    chart.on('click', function (params) {
      if (params && params.data && params.data.link) {
        var link = params.data.link;
        if (params.data.external) {
          window.location.href = link;
          return;
        }
        var target = document.getElementById(link);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history && history.replaceState) {
            history.replaceState(null, '', '#' + link);
          }
        }
      }
    });

    // ===============================
    // 控制按钮：展开 / 收起 / 放大 / 缩小
    // ===============================
    function walk(node, cb) {
      cb(node);
      if (node.children) node.children.forEach(function (c) { walk(c, cb); });
    }
    function setAllCollapsed(collapsed) {
      var roots = window.__xhwyTreeData;
      roots.forEach(function (r) {
        walk(r, function (n) {
          if (n.children && n.children.length) n.collapsed = collapsed;
        });
      });
      // 根始终展开，避免"全部收起"后只剩一个孤点
      if (collapsed) {
        roots.forEach(function (r) { r.collapsed = false; });
      }
      chart.setOption({ series: [{ data: window.__xhwyTreeData }] });
    }
    function zoom(factor) {
      var opt = chart.getOption();
      var s = opt.series && opt.series[0];
      var current = (s && s.zoom) || 1;
      var next = Math.max(0.3, Math.min(4, current * factor));
      chart.setOption({ series: [{ zoom: next }] });
    }

    var btnExpand   = document.getElementById('kmap-expand');
    var btnCollapse = document.getElementById('kmap-collapse');
    var btnZoomIn   = document.getElementById('kmap-zoom-in');
    var btnZoomOut  = document.getElementById('kmap-zoom-out');
    var btnReset    = document.getElementById('kmap-reset');

    if (btnExpand)   btnExpand.addEventListener('click',   function () { setAllCollapsed(false); });
    if (btnCollapse) btnCollapse.addEventListener('click', function () { setAllCollapsed(true);  });
    if (btnZoomIn)   btnZoomIn.addEventListener('click',   function () { zoom(1.25); });
    if (btnZoomOut)  btnZoomOut.addEventListener('click',  function () { zoom(0.8);  });
    if (btnReset)    btnReset.addEventListener('click',    function () {
      chart.setOption({ series: [{ zoom: 1, center: null }] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
