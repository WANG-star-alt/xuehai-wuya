// ============================================================
// 学海无涯 · 认知知识树数据
// 遵循 COGNITION_TREE_FORMAT_SPEC 规范
// 每个节点: { id, label, desc, time, children, href?, color? }
// ============================================================

(function () {
  const createNode = (id, label, desc, time, children = [], extra = {}) => ({
    id, label, desc, time, children, ...extra
  });

  // ---------- 智能篇 ----------
  const branchIntelligence = createNode(
    'intelligence',
    '智能篇',
    '认识 AI 的过去、现在与未来。从"AI 是什么"到大模型、Agent、多模态——14 章串起完整的 AI 认知地图。',
    '约 40 小时',
    [
      createNode('ai-01', '第 1 章 · AI 是什么',
        'ANI / AGI / ASI 三种 AI 层级 + AI 的四种核心能力。',
        '约 3 小时',
        [
          createNode('ai-01-1', '§ 1.1 · 弱 AI · ANI 篇', '狭义人工智能——今天所有能用的 AI 都属于这一类。', '30 min', [], { href: 'chapters/ai/01-1-ani.html' }),
          createNode('ai-01-2', '§ 1.2 · 通用 AI · AGI 篇', '像人类一样能做任何智力任务的 AI，尚未实现。', '30 min', [], { href: 'chapters/ai/01-2-agi.html' }),
          createNode('ai-01-3', '§ 1.3 · 超级 AI · ASI 篇', '在所有领域全面超越人类的假想 AI。', '30 min', [], { href: 'chapters/ai/01-3-asi.html' }),
          createNode('ai-01-4', '§ 1.4 · AI 的四种能力', '感知 / 理解 / 决策 / 生成——AI 做的事都可以归到这四类。', '45 min', [], { href: 'chapters/ai/01-4-abilities.html' })
        ],
        { href: 'chapters/ai/01-what-is-ai.html' }
      ),
      createNode('ai-02', '第 2 章 · 三个圈',
        'AI / ML / DL / GenAI / LLM——五个概念的包含关系。',
        '约 3 小时',
        [
          createNode('ai-02-1', '§ 2.1 · 人工智能 · AI 篇', '最外圈——所有让机器有智能行为的技术总称。', '30 min', [], { href: 'chapters/ai/02-1-ai.html' }),
          createNode('ai-02-2', '§ 2.2 · 机器学习 · ML 篇', '让机器从数据里学规律的方法集合。', '30 min', [], { href: 'chapters/ai/02-2-ml.html' }),
          createNode('ai-02-3', '§ 2.3 · 深度学习 · DL 篇', '用多层神经网络的机器学习——是 ML 的子集。', '30 min', [], { href: 'chapters/ai/02-3-dl.html' }),
          createNode('ai-02-4', '§ 2.4 · 生成式 AI · GenAI 篇', '专门"造"内容的 AI——文字、图片、视频。', '30 min', [], { href: 'chapters/ai/02-4-genai.html' }),
          createNode('ai-02-5', '§ 2.5 · 大语言模型 · LLM 篇', '基于 Transformer 的巨型语言模型——ChatGPT 的核心。', '30 min', [], { href: 'chapters/ai/02-5-llm.html' })
        ],
        { href: 'chapters/ai/02-three-circles.html' }
      ),
      createNode('ai-03', '第 3 章 · 简史',
        '从 1943 神经元到 2026 推理模型——70 年 AI 发展全景。',
        '约 2 小时',
        [
          createNode('ai-03-early', '早期探索 · 1943-1956', '神经元数学模型、图灵测试、达特茅斯会议。', '20 min', [], { href: 'chapters/ai/03-history.html#early' }),
          createNode('ai-03-expert', '专家系统与寒冬 · 1969-1993', '感知机撞墙、专家系统兴衰、两次 AI 寒冬。', '20 min', [], { href: 'chapters/ai/03-history.html#expert-winter' }),
          createNode('ai-03-dl', '深度学习革命 · 1997-2017', '深蓝、Hinton 复活神经网络、AlexNet、AlphaGo、Transformer。', '30 min', [], { href: 'chapters/ai/03-history.html#dl-revolution' }),
          createNode('ai-03-llm', '大模型时代 · 2018-2026', 'BERT/GPT、ChatGPT、多模态、推理模型、Agent 元年。', '30 min', [], { href: 'chapters/ai/03-history.html#llm-era' }),
          createNode('ai-03-lessons', '历史启示', '三次浪潮的共同规律——技术、算力、数据缺一不可。', '10 min', [], { href: 'chapters/ai/03-history.html#lessons' })
        ],
        { href: 'chapters/ai/03-history.html' }
      ),
      createNode('ai-04', '第 4 章 · 机器学习',
        '监督/无监督/强化/自监督——ML 的四大流派。',
        '约 4 小时',
        [
          createNode('ai-04-1', '§ 4.1 · 监督学习篇', '老师批改作业式学习——工业界用得最多。', '45 min', [], { href: 'chapters/ai/04-1-supervised.html' }),
          createNode('ai-04-2', '§ 4.2 · 无监督学习篇', '自己找规律——聚类、降维、异常检测。', '45 min', [], { href: 'chapters/ai/04-2-unsupervised.html' }),
          createNode('ai-04-3', '§ 4.3 · 强化学习篇', '试错式学习——下棋 AI、自动驾驶、机器人。', '45 min', [], { href: 'chapters/ai/04-3-reinforcement.html' }),
          createNode('ai-04-4', '§ 4.4 · 自监督学习篇', '让数据自己教自己——大模型预训练的核心。', '45 min', [], { href: 'chapters/ai/04-4-self-supervised.html' }),
          createNode('ai-04-5', '§ 4.5 · 特征/标签/过拟合篇', 'ML 的三个基础术语——ABC 级别的必备概念。', '45 min', [], { href: 'chapters/ai/04-5-overfitting.html' })
        ],
        { href: 'chapters/ai/04-machine-learning.html' }
      ),
      createNode('ai-05', '第 5 章 · 神经网络', '神经元、权重、CNN、RNN、GAN、Diffusion——深度学习的心脏。', '约 4 小时', [], { href: 'chapters/ai/05-neural-network.html' }),
      createNode('ai-06', '第 6 章 · 训练三部曲', '数据、模型、损失——训练一个 AI 到底在干什么；预训练/SFT/RLHF/DPO 全解。', '约 3 小时', [], { href: 'chapters/ai/06-training-trilogy.html' }),
      createNode('ai-07', '第 7 章 · Transformer', 'Attention、QKV、多头、Encoder/Decoder、MoE——现代 AI 的基石。', '约 3 小时', [], { href: 'chapters/ai/07-transformer.html' }),
      createNode('ai-08', '第 8 章 · 大语言模型 LLM', 'Token、上下文窗口、Temperature、CoT、推理模型 o1/R1。', '约 3 小时', []),
      createNode('ai-09', '第 9 章 · 多模态', '文/图/视频/语音——AI 打破单一模态边界。', '约 2 小时', []),
      createNode('ai-10', '第 10 章 · 提示词工程', '角色、任务、Few-shot、CoT——怎么问 AI 才能拿到好答案。', '约 2 小时', []),
      createNode('ai-11', '第 11 章 · AI 智能体 Agent', '大脑+记忆+工具+循环——AI 从"答题"到"办事"。', '约 3 小时', []),
      createNode('ai-12', '第 12 章 · 生态地图', 'OpenAI、Anthropic、DeepSeek、Qwen——2026 年的玩家地图。', '约 2 小时', []),
      createNode('ai-13', '第 13 章 · 局限与风险', '幻觉、偏见、版权、深度伪造、Prompt 注入——AI 的暗面。', '约 2 小时', []),
      createNode('ai-14', '第 14 章 · 与 AI 共处', '把 AI 当学习助手、写作伙伴、编程搭档——但保留人类判断。', '约 2 小时', [])
    ],
    { color: '#4a6d8c' }
  );

  // ---------- 网络篇 ----------
  const branchNetwork = createNode(
    'network',
    '网络篇',
    '从"什么是网络"到"数据怎么从你的手机跑到百度服务器"——10 章讲透互联网工作原理。',
    '约 30 小时',
    [
      createNode('net-01', '第 1 章 · 网络是什么',
        '主机、协议、地址、客户端服务器、数据包、带宽时延丢包——建立最基础的认识。',
        '约 3 小时',
        [
          createNode('net-01-1', '§ 1.1 · 主机 Host 篇', '每台联网设备都叫主机——从手机到服务器。', '30 min', [], { href: 'chapters/network/01-1-host.html' }),
          createNode('net-01-2', '§ 1.2 · 协议 Protocol 篇', '协议 = 通信的"共同语言"——TCP/IP、HTTP、DNS。', '30 min', [], { href: 'chapters/network/01-2-protocol.html' }),
          createNode('net-01-3', '§ 1.3 · 地址 Address 篇', 'IP + MAC + 端口——网络世界的三种"地址"。', '30 min', [], { href: 'chapters/network/01-3-address.html' }),
          createNode('net-01-4', '§ 1.4 · 客户端 vs 服务器篇', '谁发起、谁响应——互联网的基本分工模式。', '30 min', [], { href: 'chapters/network/01-4-client-server.html' }),
          createNode('net-01-5', '§ 1.5 · 数据包 Packet 篇', '把数据切成小包裹分批传输——为什么不整块发。', '30 min', [], { href: 'chapters/network/01-5-packet.html' }),
          createNode('net-01-6', '§ 1.6 · 带宽/时延/丢包 篇', '衡量网络好坏的三个核心指标。', '30 min', [], { href: 'chapters/network/01-6-metrics.html' })
        ],
        { href: 'chapters/network/01-what-is-network.html' }
      ),
      createNode('net-02', '第 2 章 · 分层模型',
        'OSI 七层 vs TCP/IP 四层——网络设计的"分工艺术"。',
        '约 2 小时',
        [
          createNode('net-02-1', '§ 2.1 · OSI 七层模型篇', '国际标准化组织的"理想分层"——教学必学。', '45 min', [], { href: 'chapters/network/02-1-osi.html' }),
          createNode('net-02-2', '§ 2.2 · TCP/IP 四层模型篇', '互联网实际在用的模型——比 OSI 简洁。', '45 min', [], { href: 'chapters/network/02-2-tcpip.html' }),
          createNode('net-02-3', '§ 2.3 · 分层实战篇', '把协议"对号入座"——每个协议在哪一层。', '30 min', [], { href: 'chapters/network/02-3-layers-in-action.html' })
        ],
        { href: 'chapters/network/02-layered-models.html' }
      ),
      createNode('net-03', '第 3 章 · 关键协议',
        'HTTP、TCP、UDP、DNS、IP——你天天在用的六个协议。',
        '约 4 小时',
        [
          createNode('net-03-1', '§ 3.1 · HTTP / HTTPS 篇', '浏览网页的协议——请求响应、状态码、Cookie、加密。', '45 min', [], { href: 'chapters/network/03-1-http.html' }),
          createNode('net-03-2', '§ 3.2 · TCP 篇', '可靠传输——三次握手、四次挥手、流量控制。', '45 min', [], { href: 'chapters/network/03-2-tcp.html' }),
          createNode('net-03-3', '§ 3.3 · UDP 篇', '快速但不保证——视频、直播、游戏为什么用它。', '30 min', [], { href: 'chapters/network/03-3-udp.html' }),
          createNode('net-03-dns', 'DNS 篇（未上线）', '域名翻译成 IP——递归查询、缓存、污染。', '待更新', []),
          createNode('net-03-ip', 'IP 篇（未上线）', 'IPv4/IPv6、公网私网、子网、NAT。', '待更新', []),
          createNode('net-03-other', '其他协议（未上线）', 'ARP、ICMP、DHCP、SSH、FTP、SMTP。', '待更新', [])
        ],
        { href: 'chapters/network/03-protocols.html' }
      ),
      createNode('net-04', '第 4 章 · 一次访问的旅程', '输入网址到网页显示——完整数据流走一遍。', '约 2 小时', []),
      createNode('net-05', '第 5 章 · 网络设备', '路由器、交换机、网关、防火墙、光猫——机房里的角色。', '约 2 小时', []),
      createNode('net-06', '第 6 章 · 无线与移动', 'WiFi、蓝牙、4G/5G、卫星互联网——切断电缆的自由。', '约 2 小时', []),
      createNode('net-07', '第 7 章 · 云与边缘', 'CDN、VPC、边缘节点、K8s、Serverless——现代云网络。', '约 3 小时', []),
      createNode('net-08', '第 8 章 · 网络安全', '加密、证书、XSS、CSRF、DDoS、零信任——防御网络攻击。', '约 3 小时', []),
      createNode('net-09', '第 9 章 · 排错工具箱', 'ping、traceroute、curl、Wireshark——工程师的诊断工具。', '约 2 小时', []),
      createNode('net-10', '第 10 章 · 现代协议演进', 'HTTP/3、IPv6、DoH、BBR——网络协议的最新进化。', '约 2 小时', [])
    ],
    { color: '#556b3d' }
  );

  // ---------- 根节点 ----------
  const treeRoot = createNode(
    'root',
    '学海无涯',
    '把 AI 与网络两大领域拆成看得见、点得动的认知地图——每篇独立、循序渐进。',
    '总计约 70 小时',
    [branchIntelligence, branchNetwork]
  );

  window.__cognitionTreeData = treeRoot;
})();
