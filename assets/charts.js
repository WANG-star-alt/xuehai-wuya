// assets/charts.js — 学海无涯 · 网络篇 图表
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
  // Chart 1: OSI 7 vs TCP/IP 4 —— 层级对应关系
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
  // Chart 2: 常见协议流量占比（示意）
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
  // Chart 3: HTTPS 请求耗时分解（毫秒）
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
  // Chart 4: HTTP 三代演进对比（雷达图）
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
  // Chart 5: 蜂窝网络 2G→5G 峰值速率
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

})();
