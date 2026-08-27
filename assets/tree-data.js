// ============================================================
// 学海无涯 · 认知知识树数据
// 遵循 COGNITION_TREE_FORMAT_SPEC 规范
// 每个节点: { id, label, desc, words, children, href?, color? }
// words = 内容字数（节=实际字数 / 章篇=合计 / 未写=待撰写）
// ============================================================

(function () {
  const createNode = (id, label, desc, words, children = [], extra = {}) => ({
    id, label, desc, words, children, ...extra
  });

  // ---------- 智能篇 ----------
  const branchIntelligence = createNode(
    'intelligence',
    '智能篇',
    '认识 AI 的过去、现在与未来。从"AI 是什么"到大模型、Agent、多模态——14 章串起完整的 AI 认知地图。',
    '待撰写',
    [
      createNode('ai-01', '第 1 章 · AI 是什么',
        'ANI / AGI / ASI 三种 AI 层级 + AI 的四种核心能力。',
        '约 3.5 万字',
        [
          createNode('ai-01-1', '§ 1.1 · 弱 AI · ANI', '狭义人工智能——今天所有能用的 AI 都属于这一类。', '8885 字', [], { href: 'chapters/ai/01-1-ani.html', spec: 'pass'}),
          createNode('ai-01-2', '§ 1.2 · 通用 AI · AGI', '像人类一样能做任何智力任务的 AI，尚未实现。', '8983 字', [], { href: 'chapters/ai/01-2-agi.html', spec: 'pass'}),
          createNode('ai-01-3', '§ 1.3 · 超级 AI · ASI', '在所有领域全面超越人类的假想 AI。', '8293 字', [], { href: 'chapters/ai/01-3-asi.html', spec: 'pass'}),
          createNode('ai-01-4', '§ 1.4 · AI 的四种能力', '感知 / 理解 / 决策 / 生成——AI 做的事都可以归到这四类。', '8599 字', [], { href: 'chapters/ai/01-4-abilities.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/01-what-is-ai.html' }
      ),
      createNode('ai-02', '第 2 章 · 三个圈',
        'AI / ML / DL / GenAI / LLM——五个概念的包含关系。',
        '约 4.1 万字',
        [
          createNode('ai-02-1', '§ 2.1 · 人工智能 · AI', '最外圈——所有让机器有智能行为的技术总称。', '7603 字', [], { href: 'chapters/ai/02-1-ai.html', spec: 'pass'}),
          createNode('ai-02-2', '§ 2.2 · 机器学习 · ML', '让机器从数据里学规律的方法集合。', '8089 字', [], { href: 'chapters/ai/02-2-ml.html', spec: 'pass'}),
          createNode('ai-02-3', '§ 2.3 · 深度学习 · DL', '用多层神经网络的机器学习——是 ML 的子集。', '8054 字', [], { href: 'chapters/ai/02-3-dl.html', spec: 'pass'}),
          createNode('ai-02-4', '§ 2.4 · 生成式 AI · GenAI', '专门"造"内容的 AI——文字、图片、视频。', '7946 字', [], { href: 'chapters/ai/02-4-genai.html', spec: 'pass'}),
          createNode('ai-02-5', '§ 2.5 · 大语言模型 · LLM', '基于 Transformer 的巨型语言模型——ChatGPT 的核心。', '9361 字', [], { href: 'chapters/ai/02-5-llm.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/02-three-circles.html' }
      ),
      createNode('ai-03', '第 3 章 · 简史',
        '从 1943 神经元到 2026 推理模型——70 年 AI 发展全景。',
        '约 3.5 万字',
        [
          createNode('ai-03-early', '§ 3.1 · 早期探索 · 1943-1956', '神经元数学模型、图灵测试、达特茅斯会议。', '7024 字', [], { href: 'chapters/ai/03-history.html#early', spec: 'pass'}),
          createNode('ai-03-expert', '§ 3.2 · 专家系统与寒冬 · 1969-1993', '感知机撞墙、专家系统兴衰、两次 AI 寒冬。', '7024 字', [], { href: 'chapters/ai/03-history.html#expert-winter', spec: 'pass'}),
          createNode('ai-03-dl', '§ 3.3 · 深度学习革命 · 1997-2017', '深蓝、Hinton 复活神经网络、AlexNet、AlphaGo、Transformer。', '7024 字', [], { href: 'chapters/ai/03-history.html#dl-revolution', spec: 'pass'}),
          createNode('ai-03-llm', '§ 3.4 · 大模型时代 · 2018-2026', 'BERT/GPT、ChatGPT、多模态、推理模型、Agent 元年。', '7024 字', [], { href: 'chapters/ai/03-history.html#llm-era', spec: 'pass'}),
          createNode('ai-03-lessons', '§ 3.5 · 历史启示', '三次浪潮的共同规律——技术、算力、数据缺一不可。', '7024 字', [], { href: 'chapters/ai/03-history.html#lessons', spec: 'pass'})
        ],
        { href: 'chapters/ai/03-history.html' }
      ),
      createNode('ai-04', '第 4 章 · 机器学习',
        '监督/无监督/强化/自监督——ML 的四大流派。',
        '约 5.2 万字',
        [
          createNode('ai-04-1', '§ 4.1 · 监督学习', '老师批改作业式学习——工业界用得最多。', '9967 字', [], { href: 'chapters/ai/04-1-supervised.html', spec: 'pass'}),
          createNode('ai-04-2', '§ 4.2 · 无监督学习', '自己找规律——聚类、降维、异常检测。', '9941 字', [], { href: 'chapters/ai/04-2-unsupervised.html', spec: 'pass'}),
          createNode('ai-04-3', '§ 4.3 · 强化学习', '试错式学习——下棋 AI、自动驾驶、机器人。', '11586 字', [], { href: 'chapters/ai/04-3-reinforcement.html', spec: 'pass'}),
          createNode('ai-04-4', '§ 4.4 · 自监督学习', '让数据自己教自己——大模型预训练的核心。', '9578 字', [], { href: 'chapters/ai/04-4-self-supervised.html', spec: 'pass'}),
          createNode('ai-04-5', '§ 4.5 · 特征/标签/过拟合', 'ML 的三个基础术语——ABC 级别的必备概念。', '10640 字', [], { href: 'chapters/ai/04-5-overfitting.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/04-machine-learning.html' }
      ),
      createNode('ai-05', '第 5 章 · 神经网络',
        '神经元、权重、CNN、RNN、GAN、Diffusion——深度学习的心脏。',
        '约 7.0 万字',
        [
          createNode('ai-05-1', '§ 5.1 · 神经元', '加权求和 + 激活函数——一个"人工神经元"的全部。', '6524 字', [], { href: 'chapters/ai/05-1-neuron.html', spec: 'pass'}),
          createNode('ai-05-2', '§ 5.2 · 前向 & 反向传播', '数据怎么流动、错误怎么反传——学习的引擎。', '10230 字', [], { href: 'chapters/ai/05-2-propagation.html', spec: 'pass'}),
          createNode('ai-05-3', '§ 5.3 · CNN 卷积网络', '图像专家——从 AlexNet 到 YOLO，看图靠它。', '11237 字', [], { href: 'chapters/ai/05-3-cnn.html', spec: 'pass'}),
          createNode('ai-05-4', '§ 5.4 · RNN / LSTM', '序列专家——2017 前的 NLP 主力，被 Transformer 取代。', '12005 字', [], { href: 'chapters/ai/05-4-rnn.html', spec: 'pass'}),
          createNode('ai-05-5', '§ 5.5 · GAN 对抗网络', '假币贩子 vs 警察——两个网络较量学会造假。', '14485 字', [], { href: 'chapters/ai/05-5-gan.html', spec: 'pass'}),
          createNode('ai-05-6', '§ 5.6 · Diffusion 扩散模型', 'Midjourney / Sora 背后——从噪声一步步生成图像。', '15635 字', [], { href: 'chapters/ai/05-6-diffusion.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/05-neural-network.html' }
      ),
      createNode('ai-06', '第 6 章 · 训练三部曲',
        '数据、模型、损失——训练一个 AI 到底在干什么；预训练/SFT/RLHF/DPO 全解。',
        '约 4.8 万字',
        [
          createNode('ai-06-1', '§ 6.1 · 数据 · Dataset', '规模+质量+多样性、训练/验证/测试三集分离。', '10611 字', [], { href: 'chapters/ai/06-1-dataset.html', spec: 'pass'}),
          createNode('ai-06-2', '§ 6.2 · 模型 · Model', '参数量、架构、初始化、超参数——待训练的神经网络。', '8121 字', [], { href: 'chapters/ai/06-2-model.html', spec: 'pass'}),
          createNode('ai-06-3', '§ 6.3 · 损失 & 梯度下降', '交叉熵/MSE + 蒙眼下山——让损失越来越小。', '9581 字', [], { href: 'chapters/ai/06-3-loss.html', spec: 'pass'}),
          createNode('ai-06-4', '§ 6.4 · 预训练', '几十T 语料预测下一词——基座大模型的诞生。', '8681 字', [], { href: 'chapters/ai/06-4-pretrain.html', spec: 'pass'}),
          createNode('ai-06-5', '§ 6.5 · SFT · RLHF · DPO 对齐', '学对话 → 学偏好 → 让模型讨人喜欢。', '10756 字', [], { href: 'chapters/ai/06-5-rlhf.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/06-training-trilogy.html' }
      ),
      createNode('ai-07', '第 7 章 · Transformer',
        'Attention、QKV、多头、Encoder/Decoder、MoE——现代 AI 的基石。',
        '约 4.2 万字',
        [
          createNode('ai-07-1', '§ 7.1 · Attention 注意力', '每个词都能"看到"其他所有词——图书馆式加权。', '4042 字', [], { href: 'chapters/ai/07-1-attention.html', spec: 'pass'}),
          createNode('ai-07-2', '§ 7.2 · QKV 三兄弟', '打分 → Softmax → 加权求和——Attention 完整公式。', '9037 字', [], { href: 'chapters/ai/07-2-qkv.html', spec: 'pass'}),
          createNode('ai-07-3', '§ 7.3 · Multi-head 多头', '多组 QKV 并行——像多个专家同时会诊。', '9022 字', [], { href: 'chapters/ai/07-3-multihead.html', spec: 'pass'}),
          createNode('ai-07-4', '§ 7.4 · Encoder / Decoder 派系', 'BERT（懂）vs GPT（写）vs T5（翻）——三种主流架构。', '9910 字', [], { href: 'chapters/ai/07-4-variants.html', spec: 'pass'}),
          createNode('ai-07-5', '§ 7.5 · MoE 专家混合', '万亿参数只激活一小部分——DeepSeek 的降本秘籍。', '10489 字', [], { href: 'chapters/ai/07-5-moe.html', spec: 'pass'})
        ],
        { href: 'chapters/ai/07-transformer.html' }
      ),
      createNode('ai-08', '第 8 章 · 大语言模型 LLM',
        'Token、上下文窗口、Temperature、CoT、推理模型 o1/R1。',
        '约 4.0 万字',
        [
          createNode('ai-08-1', '§ 8.1 · Token 与分词', '模型眼里没有汉字，只有 token——为什么按 token 计费。', '7013 字', [], { href: 'chapters/ai/08-1-token.html', spec: 'pass'}),
          createNode('ai-08-2', '§ 8.2 · 自回归生成', '一个字一个字往后猜——生成的本质就是接话。', '6582 字', [], { href: 'chapters/ai/08-2-autoregressive.html', spec: 'pass'}),
          createNode('ai-08-3', '§ 8.3 · 上下文窗口', '从 4K 到 100 万 token——记忆边界与"失忆"现象。', '6638 字', [], { href: 'chapters/ai/08-3-context.html', spec: 'pass'}),
          createNode('ai-08-4', '§ 8.4 · 采样参数', 'Temperature、Top-p、Top-k——控制"发散还是保守"。', '6637 字', [], { href: 'chapters/ai/08-4-sampling.html', spec: 'pass'}),
          createNode('ai-08-5', '§ 8.5 · 思维链 CoT', '"让我们一步一步想"——为什么加这句话正确率会涨。', '6530 字', [], { href: 'chapters/ai/08-5-cot.html', spec: 'pass'}),
          createNode('ai-08-6', '§ 8.6 · 推理模型', 'o1 / R1 / DeepSeek——先想很久再答的新一代模型。', '6535 字', [], { href: 'chapters/ai/08-6-reasoning.html', spec: 'pass'})
        ], { href: 'chapters/ai/08-llm.html' }),
      createNode('ai-09', '第 9 章 · 多模态',
        '文/图/视频/语音——AI 打破单一模态边界。',
        '约 5.0 万字',
        [
          createNode('ai-09-1', '§ 9.1 · 什么是多模态', '文字、图像、音频、视频——模态之间怎么打通。', '7748 字', [], { href: 'chapters/ai/09-1-what-is-multimodal.html', spec: 'pass'}),
          createNode('ai-09-2', '§ 9.2 · Embedding 向量', '把万物变成一串数字——语义搜索的底层原理。', '9937 字', [], { href: 'chapters/ai/09-2-embedding.html', spec: 'pass'}),
          createNode('ai-09-3', '§ 9.3 · CLIP 与跨模态对齐', '让"猫的图"和"猫这个词"落在同一个空间。', '9014 字', [], { href: 'chapters/ai/09-3-clip.html', spec: 'pass'}),
          createNode('ai-09-4', '§ 9.4 · 视觉理解', 'ViT、视觉编码器——GPT-4V 怎么"看懂"截图。', '9664 字', [], { href: 'chapters/ai/09-4-vision.html', spec: 'pass'}),
          createNode('ai-09-5', '§ 9.5 · 语音与视频生成', 'TTS、ASR、Sora——听得懂也说得出、还能拍片。', '11261 字', [], { href: 'chapters/ai/09-5-speech-video.html', spec: 'pass'})
        ], { href: 'chapters/ai/09-multimodal.html' }),
      createNode('ai-10', '第 10 章 · 提示词工程',
        '角色、任务、Few-shot、CoT——怎么问 AI 才能拿到好答案。',
        '约 4.7 万字',
        [
          createNode('ai-10-1', '§ 10.1 · 提示词四要素', '角色 + 任务 + 上下文 + 输出格式——万能模板。', '8812 字', [], { href: 'chapters/ai/10-1-four-elements.html', spec: 'pass'}),
          createNode('ai-10-2', '§ 10.2 · Few-shot 示例', '给两三个例子，比写一千字说明更有效。', '7084 字', [], { href: 'chapters/ai/10-2-fewshot.html', spec: 'pass'}),
          createNode('ai-10-3', '§ 10.3 · 思维链提示', '拆步骤、列前提、要过程——复杂任务的解法。', '7083 字', [], { href: 'chapters/ai/10-3-cot-prompt.html', spec: 'pass'}),
          createNode('ai-10-4', '§ 10.4 · 结构化输出', 'JSON、表格、Markdown——让结果能直接被程序用。', '9535 字', [], { href: 'chapters/ai/10-4-structured.html', spec: 'pass'}),
          createNode('ai-10-5', '§ 10.5 · 迭代与反模式', '追问、纠错、拆任务 + 常见的六个坑。', '11314 字', [], { href: 'chapters/ai/10-5-iteration.html', spec: 'pass'})
        ], { href: 'chapters/ai/10-prompt.html' }),
      createNode('ai-11', '第 11 章 · AI 智能体 Agent',
        '大脑+记忆+工具+循环——AI 从"答题"到"办事"。',
        '约 6.1 万字',
        [
          createNode('ai-11-1', '§ 11.1 · Agent 是什么', '从"回答问题"到"自己干完一件事"的跨越。', '8208 字', [], { href: 'chapters/ai/11-1-what-is-agent.html', spec: 'pass'}),
          createNode('ai-11-2', '§ 11.2 · 工具调用', 'Function Calling——让模型学会用计算器和搜索。', '10113 字', [], { href: 'chapters/ai/11-2-tool-calling.html', spec: 'pass'}),
          createNode('ai-11-3', '§ 11.3 · 记忆系统', '短期上下文 + 长期向量库——Agent 怎么"记事"。', '10469 字', [], { href: 'chapters/ai/11-3-memory.html', spec: 'pass'}),
          createNode('ai-11-4', '§ 11.4 · RAG 检索增强', '先查资料再回答——治幻觉最实用的一招。', '10303 字', [], { href: 'chapters/ai/11-4-rag.html', spec: 'pass'}),
          createNode('ai-11-5', '§ 11.5 · ReAct 与规划', '想 → 做 → 观察 → 再想——Agent 的执行循环。', '8852 字', [], { href: 'chapters/ai/11-5-react.html', spec: 'pass'}),
          createNode('ai-11-6', '§ 11.6 · MCP 与多 Agent', '标准化工具协议 + 多个 Agent 分工协作。', '10288 字', [], { href: 'chapters/ai/11-6-mcp.html', spec: 'pass'})
        ], { href: 'chapters/ai/11-agent.html' }),
      createNode('ai-12', '第 12 章 · 生态地图',
        'OpenAI、Anthropic、DeepSeek、Qwen——2026 年的玩家地图。',
        '约 5.0 万字',
        [
          createNode('ai-12-1', '§ 12.1 · 芯片与算力', 'NVIDIA、华为昇腾、TPU——AI 的石油与发电厂。', '10123 字', [], { href: 'chapters/ai/12-1-chips.html', spec: 'pass'}),
          createNode('ai-12-2', '§ 12.2 · 海外基础模型', 'OpenAI、Anthropic、Google、Meta——第一梯队格局。', '8722 字', [], { href: 'chapters/ai/12-2-foreign-models.html', spec: 'pass'}),
          createNode('ai-12-3', '§ 12.3 · 中国阵营', 'DeepSeek、Qwen、豆包、Kimi、GLM——本土玩家。', '8727 字', [], { href: 'chapters/ai/12-3-china-models.html', spec: 'pass'}),
          createNode('ai-12-4', '§ 12.4 · 开源生态', 'Llama、Mistral、Hugging Face、Ollama——自己也能跑。', '9456 字', [], { href: 'chapters/ai/12-4-opensource.html', spec: 'pass'}),
          createNode('ai-12-5', '§ 12.5 · 应用与工具层', 'Cursor、TRAE、Perplexity、Midjourney——落地产品。', '9863 字', [], { href: 'chapters/ai/12-5-apps.html', spec: 'pass'})
        ], { href: 'chapters/ai/12-landscape.html' }),
      createNode('ai-13', '第 13 章 · 局限与风险',
        '幻觉、偏见、版权、深度伪造、Prompt 注入——AI 的暗面。',
        '约 4.9 万字',
        [
          createNode('ai-13-1', '§ 13.1 · 幻觉', '它不是在骗你，它是在"合理地猜"——原理与缓解。', '9195 字', [], { href: 'chapters/ai/13-1-hallucination.html', spec: 'pass'}),
          createNode('ai-13-2', '§ 13.2 · 偏见与公平性', '训练数据里的偏见会被模型放大。', '9793 字', [], { href: 'chapters/ai/13-2-bias.html', spec: 'pass'}),
          createNode('ai-13-3', '§ 13.3 · 隐私与版权', '你输入的内容去哪了、生成物归谁。', '9887 字', [], { href: 'chapters/ai/13-3-privacy-copyright.html', spec: 'pass'}),
          createNode('ai-13-4', '§ 13.4 · 深度伪造', '换脸、拟声、假视频——如何识别与防范。', '8499 字', [], { href: 'chapters/ai/13-4-deepfake.html', spec: 'pass'}),
          createNode('ai-13-5', '§ 13.5 · Prompt 注入与安全', '越狱、间接注入——大模型时代的新攻击面。', '8844 字', [], { href: 'chapters/ai/13-5-prompt-injection.html', spec: 'pass'})
        ], { href: 'chapters/ai/13-limits.html' }),
      createNode('ai-14', '第 14 章 · 与 AI 共处',
        '把 AI 当学习助手、写作伙伴、编程搭档——但保留人类判断。',
        '约 5.0 万字',
        [
          createNode('ai-14-1', '§ 14.1 · AI 当学习助手', '费曼式提问、生成练习、讲不清就是没懂。', '9671 字', [], { href: 'chapters/ai/14-1-learning.html', spec: 'pass'}),
          createNode('ai-14-2', '§ 14.2 · AI 当写作与研究伙伴', '大纲、改写、找反例——但结论要自己下。', '9651 字', [], { href: 'chapters/ai/14-2-writing.html', spec: 'pass'}),
          createNode('ai-14-3', '§ 14.3 · AI 当编程搭档', 'Vibe Coding 与代码审查——效率与风险并存。', '9489 字', [], { href: 'chapters/ai/14-3-coding.html', spec: 'pass'}),
          createNode('ai-14-4', '§ 14.4 · 批判性思维', '怎么判断 AI 在胡说——三步验证法。', '9270 字', [], { href: 'chapters/ai/14-4-critical-thinking.html', spec: 'pass'}),
          createNode('ai-14-5', '§ 14.5 · 保留人类判断', '哪些决定永远不该外包给 AI。', '9314 字', [], { href: 'chapters/ai/14-5-human-judgment.html', spec: 'pass'})
        ], { href: 'chapters/ai/14-living-with-ai.html' })
    ],
    { color: '#4a6d8c' }
  );

  // ---------- 网络篇 ----------
  const branchNetwork = createNode(
    'network',
    '网络篇',
    '从"什么是网络"到"数据怎么从你的手机跑到百度服务器"——10 章讲透互联网工作原理。',
    '待撰写',
    [
      createNode('net-01', '第 1 章 · 网络是什么',
        '主机、协议、地址、客户端服务器、数据包、带宽时延丢包——建立最基础的认识。',
        '约 6.4 万字',
        [
          createNode('net-01-1', '§ 1.1 · 主机 Host', '每台联网设备都叫主机——从手机到服务器。', '10085 字', [], { href: 'chapters/network/01-1-host.html', spec: 'pass'}),
          createNode('net-01-2', '§ 1.2 · 协议 Protocol', '协议 = 通信的"共同语言"——TCP/IP、HTTP、DNS。', '11311 字', [], { href: 'chapters/network/01-2-protocol.html', spec: 'pass'}),
          createNode('net-01-3', '§ 1.3 · 地址 Address', 'IP + MAC + 端口——网络世界的三种"地址"。', '10673 字', [], { href: 'chapters/network/01-3-address.html', spec: 'pass'}),
          createNode('net-01-4', '§ 1.4 · 客户端 vs 服务器', '谁发起、谁响应——互联网的基本分工模式。', '9313 字', [], { href: 'chapters/network/01-4-client-server.html', spec: 'pass'}),
          createNode('net-01-5', '§ 1.5 · 数据包 Packet', '把数据切成小包裹分批传输——为什么不整块发。', '11860 字', [], { href: 'chapters/network/01-5-packet.html', spec: 'pass'}),
          createNode('net-01-6', '§ 1.6 · 带宽/时延/丢包', '衡量网络好坏的三个核心指标。', '11179 字', [], { href: 'chapters/network/01-6-metrics.html', spec: 'pass'})
        ],
        { href: 'chapters/network/01-what-is-network.html' }
      ),
      createNode('net-02', '第 2 章 · 分层模型',
        'OSI 七层 vs TCP/IP 四层——网络设计的"分工艺术"。',
        '约 3.4 万字',
        [
          createNode('net-02-1', '§ 2.1 · OSI 七层模型', '国际标准化组织的"理想分层"——教学必学。', '13082 字', [], { href: 'chapters/network/02-1-osi.html', spec: 'pass'}),
          createNode('net-02-2', '§ 2.2 · TCP/IP 四层模型', '互联网实际在用的模型——比 OSI 简洁。', '10932 字', [], { href: 'chapters/network/02-2-tcpip.html', spec: 'pass'}),
          createNode('net-02-3', '§ 2.3 · 分层实战', '把协议"对号入座"——每个协议在哪一层。', '9585 字', [], { href: 'chapters/network/02-3-layers-in-action.html', spec: 'pass'})
        ],
        { href: 'chapters/network/02-layered-models.html' }
      ),
      createNode('net-03', '第 3 章 · 关键协议',
        'HTTP、TCP、UDP、DNS、IP——你天天在用的六个协议。',
        '约 8.8 万字',
        [
          createNode('net-03-1', '§ 3.1 · HTTP / HTTPS', '浏览网页的协议——请求响应、状态码、Cookie、加密。', '14158 字', [], { href: 'chapters/network/03-1-http.html', spec: 'pass'}),
          createNode('net-03-2', '§ 3.2 · TCP', '可靠传输——三次握手、四次挥手、流量控制。', '15764 字', [], { href: 'chapters/network/03-2-tcp.html', spec: 'pass'}),
          createNode('net-03-3', '§ 3.3 · UDP', '快速但不保证——视频、直播、游戏为什么用它。', '12883 字', [], { href: 'chapters/network/03-3-udp.html', spec: 'pass'}),
          createNode('net-03-4', '§ 3.4 · DNS', '域名翻译成 IP——递归查询、缓存、DNS 污染与 DoH。', '15863 字', [], { href: 'chapters/network/03-4-dns.html', spec: 'pass'}),
          createNode('net-03-5', '§ 3.5 · IP', 'IPv4 / IPv6、公网私网、子网划分与 CIDR、NAT。', '14916 字', [], { href: 'chapters/network/03-5-ip.html', spec: 'pass'}),
          createNode('net-03-6', '§ 3.6 · 其他常用协议', 'ARP、ICMP、DHCP、SSH、FTP、SMTP——各就各位。', '12986 字', [], { href: 'chapters/network/03-6-other-protocols.html', spec: 'pass'})
        ],
        { href: 'chapters/network/03-protocols.html' }
      ),
      createNode('net-04', '第 4 章 · 一次访问的旅程',
        '输入网址到网页显示——完整数据流走一遍。',
        '约 6.5 万字',
        [
          createNode('net-04-1', '§ 4.1 · 输入网址与 URL 解析', 'URL 的七个部分 + 浏览器先干了什么。', '10981 字', [], { href: 'chapters/network/04-1-url.html', spec: 'pass'}),
          createNode('net-04-2', '§ 4.2 · DNS 查询', '本地缓存 → hosts → 递归解析 → 拿到 IP。', '10465 字', [], { href: 'chapters/network/04-2-dns-lookup.html', spec: 'pass'}),
          createNode('net-04-3', '§ 4.3 · 建立 TCP 连接', '三次握手 + 端口分配——通道打通的瞬间。', '10225 字', [], { href: 'chapters/network/04-3-tcp-connect.html', spec: 'pass'}),
          createNode('net-04-4', '§ 4.4 · TLS 握手', '证书验证、密钥协商——HTTPS 加密怎么建立。', '10542 字', [], { href: 'chapters/network/04-4-tls.html', spec: 'pass'}),
          createNode('net-04-5', '§ 4.5 · 发送请求与服务器响应', '请求行、请求头、服务器处理、返回 HTML。', '10162 字', [], { href: 'chapters/network/04-5-request-response.html', spec: 'pass'}),
          createNode('net-04-6', '§ 4.6 · 浏览器渲染', '解析 HTML/CSS → 构建 DOM/CSSOM → 布局 → 绘制。', '10658 字', [], { href: 'chapters/network/04-6-rendering.html', spec: 'pass'})
        ],
        { href: 'chapters/network/04-journey.html' }
      ),
      createNode('net-05', '第 5 章 · 网络设备',
        '路由器、交换机、网关、防火墙、光猫——机房里的角色。',
        '约 5.3 万字',
        [
          createNode('net-05-1', '§ 5.1 · 交换机 Switch', '二层设备——靠 MAC 地址在局域网内转发数据帧。', '10816 字', [], { href: 'chapters/network/05-1-switch.html', spec: 'pass'}),
          createNode('net-05-2', '§ 5.2 · 路由器 Router', '三层设备——靠 IP 和路由表在不同网络间寻路。', '10841 字', [], { href: 'chapters/network/05-2-router.html', spec: 'pass'}),
          createNode('net-05-3', '§ 5.3 · 网关与光猫', '网关 = 出口关卡；光猫 = 光信号与电信号的翻译官。', '10127 字', [], { href: 'chapters/network/05-3-gateway-ont.html', spec: 'pass'}),
          createNode('net-05-4', '§ 5.4 · 防火墙 Firewall', '包过滤、状态检测、下一代防火墙——谁能进谁不能。', '10634 字', [], { href: 'chapters/network/05-4-firewall.html', spec: 'pass'}),
          createNode('net-05-5', '§ 5.5 · 负载均衡 LB', '四层 vs 七层、轮询/最少连接/一致性哈希。', '10967 字', [], { href: 'chapters/network/05-5-load-balancer.html', spec: 'pass'})
        ],
        { href: 'chapters/network/05-1-switch.html' }
      ),
      createNode('net-06', '第 6 章 · 无线与移动',
        'WiFi、蓝牙、4G/5G、卫星互联网——切断电缆的自由。',
        '已上线（5 节全部完结）',
        [
          createNode('net-06-1', '§ 6.1 · WiFi 原理', '2.4G vs 5G vs 6G 频段、信道干扰、WiFi 6/7 新特性。', '6978 字', [], { href: 'chapters/network/06-1-wifi.html', spec: 'pass'}),
          createNode('net-06-2', '§ 6.2 · 蓝牙与近场', '蓝牙、BLE 低功耗、NFC——短距离通信三兄弟。', '6224 字', [], { href: 'chapters/network/06-2-bluetooth-nfc.html', spec: 'pass'}),
          createNode('net-06-3', '§ 6.3 · 移动蜂窝网络', '基站、小区切换、2G 到 5G 的演进逻辑。', '7400 字', [], { href: 'chapters/network/06-3-cellular.html', spec: 'pass'}),
          createNode('net-06-4', '§ 6.4 · 5G 与 6G 展望', '大带宽、低时延、海量连接——切片与边缘计算。', '5843 字', [], { href: 'chapters/network/06-4-5g-6g.html', spec: 'pass'}),
          createNode('net-06-5', '§ 6.5 · 卫星互联网', 'Starlink、低轨星座——把网络铺到没有基站的地方。', '6692 字', [], { href: 'chapters/network/06-5-satellite.html', spec: 'pass'})
        ]),
      createNode('net-07', '第 7 章 · 云与边缘',
        'CDN、VPC、边缘节点、K8s、Serverless——现代云网络。',
        '待撰写',
        [
          createNode('net-07-1', '§ 7.1 · CDN 内容分发', '把内容缓存到离用户最近的节点——为什么视频不卡。', '待撰写', []),
          createNode('net-07-2', '§ 7.2 · 云网络 VPC', '虚拟私有云、子网、安全组、路由表——云上的机房。', '待撰写', []),
          createNode('net-07-3', '§ 7.3 · 容器网络', 'Docker 网络模式、K8s Service 与 Ingress。', '待撰写', []),
          createNode('net-07-4', '§ 7.4 · 服务网格', 'Istio / Envoy——微服务之间的流量治理层。', '待撰写', []),
          createNode('net-07-5', '§ 7.5 · Serverless 与边缘计算', 'Cloudflare Workers、边缘函数——代码跑在离用户 10ms 的地方。', '待撰写', [])
        ]),
      createNode('net-08', '第 8 章 · 网络安全',
        '加密、证书、XSS、CSRF、DDoS、零信任——防御网络攻击。',
        '待撰写',
        [
          createNode('net-08-1', '§ 8.1 · 对称与非对称加密', 'AES vs RSA——一把钥匙 vs 一对钥匙。', '待撰写', []),
          createNode('net-08-2', '§ 8.2 · 数字证书与 CA', '证书链、根证书、自签名——凭什么信任一个网站。', '待撰写', []),
          createNode('net-08-3', '§ 8.3 · Web 攻击', 'XSS、CSRF、SQL 注入、SSRF——最常见的四种打法。', '待撰写', []),
          createNode('net-08-4', '§ 8.4 · DDoS 与防护', '流量型 vs 应用型攻击、清洗中心、限流策略。', '待撰写', []),
          createNode('net-08-5', '§ 8.5 · VPN 与代理', 'VPN、正向/反向代理、隧道协议——流量怎么绕路。', '待撰写', []),
          createNode('net-08-6', '§ 8.6 · 零信任架构', '"默认不信任、始终验证"——边界安全模型的终结。', '待撰写', [])
        ]),
      createNode('net-09', '第 9 章 · 排错工具箱',
        'ping、traceroute、curl、Wireshark——工程师的诊断工具。',
        '待撰写',
        [
          createNode('net-09-1', '§ 9.1 · ping 与 ICMP', '通不通、延迟多少、丢包多少——第一诊断命令。', '待撰写', []),
          createNode('net-09-2', '§ 9.2 · traceroute 路径追踪', '数据包走了哪几跳、卡在哪一跳。', '待撰写', []),
          createNode('net-09-3', '§ 9.3 · nslookup / dig', 'DNS 解析结果排查——域名到底指向哪。', '待撰写', []),
          createNode('net-09-4', '§ 9.4 · curl / wget', '命令行发 HTTP 请求——看原始响应头和状态码。', '待撰写', []),
          createNode('net-09-5', '§ 9.5 · netstat / ss', '本机端口占用、连接状态——谁在监听、谁连着谁。', '待撰写', []),
          createNode('net-09-6', '§ 9.6 · Wireshark 抓包', '逐包分析——网络排错的终极武器。', '待撰写', [])
        ]),
      createNode('net-10', '第 10 章 · 现代协议演进',
        'HTTP/3、IPv6、DoH、BBR——网络协议的最新进化。',
        '待撰写',
        [
          createNode('net-10-1', '§ 10.1 · HTTP/2 与 HTTP/3', '多路复用、头部压缩、QUIC 基于 UDP 重造可靠传输。', '待撰写', []),
          createNode('net-10-2', '§ 10.2 · QUIC 协议', '0-RTT 握手、连接迁移——为什么抛弃 TCP。', '待撰写', []),
          createNode('net-10-3', '§ 10.3 · IPv6 全面部署', '地址耗尽、双栈过渡、为什么推了二十年还没完。', '待撰写', []),
          createNode('net-10-4', '§ 10.4 · 加密 DNS', 'DoH / DoT / DoQ——DNS 查询也要加密。', '待撰写', []),
          createNode('net-10-5', '§ 10.5 · BBR 拥塞控制', 'Google 的新算法——测带宽而不是等丢包。', '待撰写', [])
        ])
    ],
    { color: '#556b3d' }
  );

  // ---------- 界面篇 ----------
  const branchInterface = createNode(
    'interface',
    '界面篇',
    '从"GUI 是什么"到"AI 时代的生成式界面"——10 章讲透人和机器之间那层看得见、摸得着的皮肤；第 5 章重点铺开 14 种主流 GUI 工具。',
    '待撰写',
    [
      createNode('gui-01', '第 1 章 · GUI 是什么',
        'CLI / TUI / GUI 三种交互范式 + 控件、窗口、事件驱动的基本盘。',
        '约 4.6 万字',
        [
          createNode('gui-01-1', '§ 1.1 · 命令行 CLI', '打字对话式交互——精准、可脚本化，但要背命令。', '9957 字', [], { href: 'chapters/gui/01-1-cli.html', spec: 'pass'}),
          createNode('gui-01-2', '§ 1.2 · 字符界面 TUI', '终端里画界面——htop、vim、Midnight Commander。', '8139 字', [], { href: 'chapters/gui/01-2-tui.html', spec: 'pass'}),
          createNode('gui-01-3', '§ 1.3 · 图形界面 GUI', '窗口、图标、菜单、指针——WIMP 范式的诞生。', '8685 字', [], { href: 'chapters/gui/01-3-gui.html', spec: 'pass'}),
          createNode('gui-01-4', '§ 1.4 · 控件 Widget', '按钮、输入框、列表、滑块——界面的乐高积木。', '9460 字', [], { href: 'chapters/gui/01-4-widget.html', spec: 'pass'}),
          createNode('gui-01-5', '§ 1.5 · 事件驱动', '程序不再"从上到下跑完"，而是"等你动手才响应"。', '9792 字', [], { href: 'chapters/gui/01-5-event-driven.html', spec: 'pass'})
        ],
        { href: 'chapters/gui/01-what-is-gui.html' }),
      createNode('gui-02', '第 2 章 · 界面是怎么画出来的',
        '像素、位图与矢量、渲染管线、GPU 合成——一帧画面的诞生过程。',
        '约 3.6 万字',
        [
          createNode('gui-02-1', '§ 2.1 · 像素与分辨率', '像素、DPI、逻辑像素 vs 物理像素、@2x 图为什么存在。', '7539 字', [], { href: 'chapters/gui/02-1-pixel.html', spec: 'pass'}),
          createNode('gui-02-2', '§ 2.2 · 位图 vs 矢量', 'PNG/JPG 放大就糊，SVG 无限放大不糊——差在哪。', '7189 字', [], { href: 'chapters/gui/02-2-bitmap-vector.html', spec: 'pass'}),
          createNode('gui-02-3', '§ 2.3 · 颜色与色彩空间', 'RGB、HSL、sRGB vs P3、透明度与混色。', '7421 字', [], { href: 'chapters/gui/02-3-color.html', spec: 'pass'}),
          createNode('gui-02-4', '§ 2.4 · 渲染管线', '解析 → 布局 → 绘制 → 合成——一帧画面的四步流水线。', '6895 字', [], { href: 'chapters/gui/02-4-render-pipeline.html', spec: 'pass'}),
          createNode('gui-02-5', '§ 2.5 · GPU 合成与 60fps', '为什么动画会卡、为什么 transform 比 top 快。', '7245 字', [], { href: 'chapters/gui/02-5-gpu-60fps.html', spec: 'pass'})
        ],
        { href: 'chapters/gui/02-how-pixels-happen.html' }),
      createNode('gui-03', '第 3 章 · 布局与排版',
        '盒模型、Flex / Grid、约束布局、响应式——元素为什么待在那个位置。',
        '待撰写',
        [
          createNode('gui-03-1', '§ 3.1 · 盒模型', 'content / padding / border / margin——一切布局的原子。', '待撰写', []),
          createNode('gui-03-2', '§ 3.2 · 流式与定位', '文档流、浮动、absolute / fixed / sticky 的取舍。', '待撰写', []),
          createNode('gui-03-3', '§ 3.3 · Flexbox', '一维弹性布局——主轴、交叉轴、伸缩与对齐。', '待撰写', []),
          createNode('gui-03-4', '§ 3.4 · Grid 网格', '二维网格布局——真正的"报纸排版"能力。', '待撰写', []),
          createNode('gui-03-5', '§ 3.5 · 约束布局', '原生 App 的另一套思路——AutoLayout / ConstraintLayout。', '待撰写', []),
          createNode('gui-03-6', '§ 3.6 · 响应式与自适应', '媒体查询、断点、容器查询——一套界面适配所有屏幕。', '待撰写', [])
        ]),
      createNode('gui-04', '第 4 章 · 事件与交互',
        '事件循环、冒泡与捕获、手势、焦点与无障碍——点击背后发生了什么。',
        '待撰写',
        [
          createNode('gui-04-1', '§ 4.1 · 事件循环 Event Loop', '主线程、任务队列、微任务——界面为什么会"卡死"。', '待撰写', []),
          createNode('gui-04-2', '§ 4.2 · 冒泡与捕获', '事件的三个阶段 + 事件委托为什么能提升性能。', '待撰写', []),
          createNode('gui-04-3', '§ 4.3 · 输入设备', '鼠标、键盘、触摸、笔、手柄——不同设备的事件模型。', '待撰写', []),
          createNode('gui-04-4', '§ 4.4 · 手势识别', '点击、长按、拖拽、双指缩放——手势冲突怎么解。', '待撰写', []),
          createNode('gui-04-5', '§ 4.5 · 焦点与键盘导航', 'Tab 顺序、焦点陷阱、快捷键——不用鼠标也能用。', '待撰写', []),
          createNode('gui-04-6', '§ 4.6 · 无障碍 A11y', 'ARIA、屏幕阅读器、对比度——让所有人都能用。', '待撰写', [])
        ]),
      createNode('gui-05', '第 5 章 · 桌面 GUI 工具箱',
        'Python / C++ / C# / Web / Rust 五大技术栈 · 14 种主流 GUI 工具选型与实战。',
        '待撰写',
        [
          createNode('gui-05-1', '§ 5.1 · GUI 框架选型总览', '五大技术栈全景图 + 一张决策树帮你选对工具。', '待撰写', []),
          createNode('gui-05-2', '§ 5.2 · Tkinter', 'Python 自带、零依赖——写小工具最快的路。', '待撰写', []),
          createNode('gui-05-3', '§ 5.3 · PySide6 / PyQt6', '工业级跨平台方案——WPS、VirtualBox 都用它。', '待撰写', []),
          createNode('gui-05-4', '§ 5.4 · Qt Designer 可视化拖拽', '拖控件生成 .ui 文件——不写布局代码也能出界面。', '待撰写', []),
          createNode('gui-05-5', '§ 5.5 · CustomTkinter 与美化方案', '给 Tkinter 换皮——现代化圆角、暗色主题。', '待撰写', []),
          createNode('gui-05-6', '§ 5.6 · Flet', 'Flutter 的 Python 封装——一套代码出桌面/Web/手机。', '待撰写', []),
          createNode('gui-05-7', '§ 5.7 · NiceGUI', '浏览器当界面、Python 写逻辑——数据面板神器。', '待撰写', []),
          createNode('gui-05-8', '§ 5.8 · Dear PyGui', 'GPU 加速即时渲染——实时曲线、游戏工具首选。', '待撰写', []),
          createNode('gui-05-9', '§ 5.9 · Streamlit 与 Gradio', '几十行代码出一个 AI 演示页——最快的原型工具。', '待撰写', []),
          createNode('gui-05-10', '§ 5.10 · Windows 原生栈', 'Win32 / WinForms / WPF / WinUI 3——微软四代 UI 演进。', '待撰写', []),
          createNode('gui-05-11', '§ 5.11 · Avalonia 与 .NET MAUI', 'C# 跨平台双雄——Avalonia 全平台、MAUI 官方牌。', '待撰写', []),
          createNode('gui-05-12', '§ 5.12 · Electron', '用网页技术做桌面应用——VS Code、Discord 的选择。', '待撰写', []),
          createNode('gui-05-13', '§ 5.13 · Tauri', 'Rust + 系统 WebView——体积只有 Electron 的十分之一。', '待撰写', []),
          createNode('gui-05-14', '§ 5.14 · 打包与分发', 'PyInstaller / Nuitka / 安装包 / 签名 / 自动更新。', '待撰写', [])
        ]),
      createNode('gui-06', '第 6 章 · Web 前端三件套',
        'HTML 结构 / CSS 表现 / JS 行为——浏览器里的分工与协作。',
        '待撰写',
        [
          createNode('gui-06-1', '§ 6.1 · HTML 结构', '标签、语义化、DOM 树——网页的骨架。', '待撰写', []),
          createNode('gui-06-2', '§ 6.2 · CSS 表现', '选择器、层叠、继承、优先级——样式为什么"不生效"。', '待撰写', []),
          createNode('gui-06-3', '§ 6.3 · JavaScript 行为', '变量、函数、DOM 操作、异步——让页面活起来。', '待撰写', []),
          createNode('gui-06-4', '§ 6.4 · 浏览器工作原理', '从输入网址到看到页面——渲染引擎与 JS 引擎的分工。', '待撰写', []),
          createNode('gui-06-5', '§ 6.5 · 开发者工具', 'Elements / Console / Network / Performance——调试的兵器谱。', '待撰写', [])
        ]),
      createNode('gui-07', '第 7 章 · 前端框架',
        'React / Vue / Svelte 的心智模型——虚拟 DOM、响应式、编译时。',
        '待撰写',
        [
          createNode('gui-07-1', '§ 7.1 · 为什么需要框架', '手写 DOM 操作的三大痛点——状态、复用、同步。', '待撰写', []),
          createNode('gui-07-2', '§ 7.2 · 组件化思维', '把界面拆成可复用的积木——props、state、组合。', '待撰写', []),
          createNode('gui-07-3', '§ 7.3 · React', '虚拟 DOM、单向数据流、Hooks——声明式 UI 的代表。', '待撰写', []),
          createNode('gui-07-4', '§ 7.4 · Vue', '响应式系统、模板语法、渐进式采用——上手最快的框架。', '待撰写', []),
          createNode('gui-07-5', '§ 7.5 · Svelte 与编译时', '没有虚拟 DOM——把框架成本挪到编译阶段。', '待撰写', []),
          createNode('gui-07-6', '§ 7.6 · 状态管理', 'Redux / Pinia / Zustand——大型应用的数据怎么管。', '待撰写', [])
        ]),
      createNode('gui-08', '第 8 章 · 移动端 UI',
        'iOS / Android 原生 + Flutter / RN 跨平台——小屏幕的设计约束。',
        '待撰写',
        [
          createNode('gui-08-1', '§ 8.1 · 移动端设计约束', '小屏、手指、单手、断网、省电——五条硬约束。', '待撰写', []),
          createNode('gui-08-2', '§ 8.2 · iOS 原生', 'UIKit vs SwiftUI + 人机界面指南 HIG。', '待撰写', []),
          createNode('gui-08-3', '§ 8.3 · Android 原生', 'View 体系 vs Jetpack Compose + Material Design。', '待撰写', []),
          createNode('gui-08-4', '§ 8.4 · Flutter', '自绘引擎 + Dart——一套代码全平台一致。', '待撰写', []),
          createNode('gui-08-5', '§ 8.5 · React Native 与小程序', 'JS 写原生 + 微信生态——中国式跨端方案。', '待撰写', [])
        ]),
      createNode('gui-09', '第 9 章 · 设计原则与 HCI',
        '费茨定律、认知负荷、一致性、可用性测试——好界面为什么好。',
        '待撰写',
        [
          createNode('gui-09-1', '§ 9.1 · 费茨定律与希克定律', '目标越大越近越好点、选项越多越慢——两条量化定律。', '待撰写', []),
          createNode('gui-09-2', '§ 9.2 · 认知负荷', '7±2 法则、渐进披露——别让用户脑子过载。', '待撰写', []),
          createNode('gui-09-3', '§ 9.3 · 可见性与反馈', '状态可见、操作有回应、错误可撤销——诺曼三原则。', '待撰写', []),
          createNode('gui-09-4', '§ 9.4 · 一致性与设计系统', 'Design Token、组件库、Material / HIG / Fluent。', '待撰写', []),
          createNode('gui-09-5', '§ 9.5 · 可用性测试', '五个用户就能发现 85% 的问题——怎么测、测什么。', '待撰写', [])
        ]),
      createNode('gui-10', '第 10 章 · AI 时代的界面',
        '对话式 UI、生成式 UI、Agent 操作界面——AI 正在重写交互范式。',
        '待撰写',
        [
          createNode('gui-10-1', '§ 10.1 · 对话式 UI', '从表单填空到自然语言——ChatGPT 式交互的得与失。', '待撰写', []),
          createNode('gui-10-2', '§ 10.2 · 生成式 UI', '界面不再预先写死，而是按需即时生成。', '待撰写', []),
          createNode('gui-10-3', '§ 10.3 · Agent 操作界面', 'Computer Use——AI 直接点你的鼠标、敲你的键盘。', '待撰写', []),
          createNode('gui-10-4', '§ 10.4 · AI 辅助设计与编码', 'Figma AI、v0、Cursor——设计稿到代码的自动化。', '待撰写', []),
          createNode('gui-10-5', '§ 10.5 · 未来交互范式', '语音、空间计算、脑机接口——屏幕之后是什么。', '待撰写', [])
        ])
    ],
    { color: '#8a5a7a' }
  );
  // ---------- 电学篇 ----------
  const branchElec = createNode(
    'elec',
    '电学篇',
    '不学电气工程，只学家里真能用上的电——从不触电、看懂配电箱，到换灯换插座、跳闸排查、弱电布线、万用表与电费单。',
    '待撰写',
    [
      createNode('elec-01', '第 1 章 · 安全第一课',
        '动手之前先学怎么不受伤——断电、验电、急救，以及哪些地方一辈子都别自己碰。',
        '约 4.7 万字',
        [
          createNode('elec-01-1', '§ 1.1 · 电为什么会电到人', '电流穿过身体才危险，几毫安开始麻、多少毫安要命。', '7423 字', [], { href: 'chapters/elec/01-1-why-shock.html', spec: 'pass'}),
          createNode('elec-01-2', '§ 1.2 · 火线、零线、地线', '三根线各干什么，为什么只碰零线通常不电人。', '7613 字', [], { href: 'chapters/elec/01-2-three-wires.html', spec: 'pass'}),
          createNode('elec-01-3', '§ 1.3 · 动手前的断电三步', '关对闸、验电、告知家人，确认真没电才伸手。', '7426 字', [], { href: 'chapters/elec/01-3-power-off.html', spec: 'pass'}),
          createNode('elec-01-4', '§ 1.4 · 验电笔怎么用', '试电笔的正确握法、误报场景，两点交叉复验法。', '8189 字', [], { href: 'chapters/elec/01-4-test-pen.html', spec: 'pass'}),
          createNode('elec-01-5', '§ 1.5 · 触电与电火灾急救', '先断电再救人、绝缘物分离、电火灾绝不能泼水。', '8787 字', [], { href: 'chapters/elec/01-5-first-aid.html', spec: 'pass'}),
          createNode('elec-01-6', '§ 1.6 · 红线清单：绝不自己碰', '进户线、电表、总闸上游、渗水墙体——直接叫电工。', '7762 字', [], { href: 'chapters/elec/01-6-red-lines.html', spec: 'pass'})
        ]
      , { href: 'chapters/elec/01-safety-first.html' }),
      createNode('elec-02', '第 2 章 · 电的最小认知',
        '只讲会用得上的那几个概念——用水管和水表就能想明白，够你看懂说明书和铭牌。',
        '待撰写',
        [
          createNode('elec-02-1', '§ 2.1 · 电压、电流、电阻', '水压、水流、管子粗细——三个量的关系一次讲透。', '待撰写', []),
          createNode('elec-02-2', '§ 2.2 · 功率与度电', '1500 瓦的吹风机开一小时用几度电，会算就够。', '待撰写', []),
          createNode('elec-02-3', '§ 2.3 · 串联与并联', '为什么家里插座并联，一个坏了别的照样能用。', '待撰写', []),
          createNode('elec-02-4', '§ 2.4 · 交流与直流', '墙上插座是交流，充电宝是直流，混了会出事。', '待撰写', []),
          createNode('elec-02-5', '§ 2.5 · 短路、过载、漏电', '三种故障现象怎么区分，各由哪个保护装置管。', '待撰写', []),
          createNode('elec-02-6', '§ 2.6 · 接地为什么能救命', '地线给漏电流一条回路，漏保 30 毫秒内跳闸。', '待撰写', [])
        ]
      ),
      createNode('elec-03', '第 3 章 · 家里的电路地图',
        '把自家从电表到插座的整条路走一遍，能打开配电箱说出每个开关管哪儿。',
        '待撰写',
        [
          createNode('elec-03-1', '§ 3.1 · 从电线杆到你家插座', '进户线、电表、总闸、分路——一张完整路径图。', '待撰写', []),
          createNode('elec-03-2', '§ 3.2 · 配电箱怎么看', '认清总闸、漏保、分路空开，把缺失标签补齐。', '待撰写', []),
          createNode('elec-03-3', '§ 3.3 · 空开与漏保的区别', '空开保线路，漏保保人——看铭牌和试验按钮分辨。', '待撰写', []),
          createNode('elec-03-4', '§ 3.4 · 回路是怎么分的', '照明、普通插座、空调、厨卫为什么各走一路。', '待撰写', []),
          createNode('elec-03-5', '§ 3.5 · 单控、双控、双联开关', '楼梯两头都能关灯，背后的接线逻辑并不神秘。', '待撰写', []),
          createNode('elec-03-6', '§ 3.6 · 电线颜色与平方数', '红蓝黄绿双色的约定，1.5/2.5/4 平方各管什么。', '待撰写', [])
        ]
      ),
      createNode('elec-04', '第 4 章 · 从换灯泡开始',
        '全屋最安全的第一次动手——灯泡、灯管、驱动、灯座，一步步升级到自己装吸顶灯。',
        '待撰写',
        [
          createNode('elec-04-1', '§ 4.1 · 灯泡型号怎么选', 'E27/E14 螺口与卡口，瓦数、流明、色温怎么挑。', '待撰写', []),
          createNode('elec-04-2', '§ 4.2 · 换灯泡与换灯管', '断电、拆罩、装泡的标准动作和常见卡壳点。', '待撰写', []),
          createNode('elec-04-3', '§ 4.3 · LED 灯换驱动电源', '灯不亮多半是驱动坏了，几十块钱自己就能换。', '待撰写', []),
          createNode('elec-04-4', '§ 4.4 · 灯不亮的排查顺序', '灯泡→开关→灯座→回路，四步逐层缩小范围。', '待撰写', []),
          createNode('elec-04-5', '§ 4.5 · 灯闪烁与忽明忽暗', '接触不良、驱动老化、调光器不兼容怎么区分。', '待撰写', []),
          createNode('elec-04-6', '§ 4.6 · 自己装一盏吸顶灯', '定位打孔、膨胀螺栓承重、接线端子压紧全流程。', '待撰写', [])
        ]
      ),
      createNode('elec-05', '第 5 章 · 开关与插座',
        '家里出问题最多的两个部件——换、判断、选型，以及大功率电器为什么要单独伺候。',
        '待撰写',
        [
          createNode('elec-05-1', '§ 5.1 · 拆开一个开关面板', '卡扣还是螺丝、怎么拆不崩瓷不刮墙。', '待撰写', []),
          createNode('elec-05-2', '§ 5.2 · 换一个单控开关', '拍照记线、一进一出、装回复测的完整流程。', '待撰写', []),
          createNode('elec-05-3', '§ 5.3 · 换五孔插座与 L/N/E', '左零右火上接地，接错会怎样、怎么当场查出来。', '待撰写', []),
          createNode('elec-05-4', '§ 5.4 · 插座发烫、松动、打火', '焦味、发黑、插头晃动——必须当天处理的信号。', '待撰写', []),
          createNode('elec-05-5', '§ 5.5 · USB 插座与智能开关', '智能开关要零线，单火线方案的闪灯坑怎么避。', '待撰写', []),
          createNode('elec-05-6', '§ 5.6 · 排插与延长线怎么选', '10A 还是 16A、总功率怎么算、排插串排插的危险。', '待撰写', []),
          createNode('elec-05-7', '§ 5.7 · 空调专线与 16A 插座', '大功率电器为什么不能跟别的插座抢一条线。', '待撰写', [])
        ]
      ),
      createNode('elec-06', '第 6 章 · 跳闸了怎么查',
        '家里最常见的"突然黑了"——用半拆法十分钟锁定回路，再找到那台惹事的电器。',
        '待撰写',
        [
          createNode('elec-06-1', '§ 6.1 · 跳闸的四种原因', '过载、短路、漏电、开关老化，先分清是哪一类。', '待撰写', []),
          createNode('elec-06-2', '§ 6.2 · 半拆法定位故障回路', '全关再逐个合闸，用排除法把范围压到一路。', '待撰写', []),
          createNode('elec-06-3', '§ 6.3 · 逐个拔插头找元凶', '回路内一台台断开再合闸，揪出真正漏电的设备。', '待撰写', []),
          createNode('elec-06-4', '§ 6.4 · 潮湿季节的漏保跳闸', '卫生间、阳台、热水器受潮漏电的典型现场。', '待撰写', []),
          createNode('elec-06-5', '§ 6.5 · 闸推不上去怎么办', '手柄半档、复位按钮、先复位再合闸，别硬掰。', '待撰写', []),
          createNode('elec-06-6', '§ 6.6 · 什么时候必须停手', '反复跳闸、闻到糊味、墙面发热——立刻叫电工。', '待撰写', [])
        ]
      ),
      createNode('elec-07', '第 7 章 · 电器不工作怎么判断',
        '一套对任何电器都适用的判断框架——先确认有没有电，再判断坏在哪一段，最后决定修还是换。',
        '待撰写',
        [
          createNode('elec-07-1', '§ 7.1 · 三问法排查框架', '有电吗、通不通、断在哪段——任何电器都能套。', '待撰写', []),
          createNode('elec-07-2', '§ 7.2 · 先测插座有没有电', '换插座试、验电笔、万用表，三种验证由简到准。', '待撰写', []),
          createNode('elec-07-3', '§ 7.3 · 插头与电源线故障', '内芯暗断、插头松动是最常见故障，也最好修。', '待撰写', []),
          createNode('elec-07-4', '§ 7.4 · 保险丝与热保护器', '微波炉、吹风机里的小保险，换对型号就复活。', '待撰写', []),
          createNode('elec-07-5', '§ 7.5 · 电机类：不转与嗡嗡响', '风扇、油烟机、水泵的卡死与启动电容老化。', '待撰写', []),
          createNode('elec-07-6', '§ 7.6 · 加热类：不热与忽冷忽热', '电热管、温控器、水壶底座触点的判断顺序。', '待撰写', []),
          createNode('elec-07-7', '§ 7.7 · 修还是换：算一笔账', '配件价、工时、剩余寿命、安全余量——四项打分。', '待撰写', [])
        ]
      ),
      createNode('elec-08', '第 8 章 · 工具箱与万用表',
        '三百块配齐一套家用工具，学会万用表的四个常用档位，从"猜"升级成"测"。',
        '待撰写',
        [
          createNode('elec-08-1', '§ 8.1 · 新手工具清单', '螺丝刀、验电笔、剥线钳、胶布、头灯——够用就好。', '待撰写', []),
          createNode('elec-08-2', '§ 8.2 · 万用表面板怎么看', '档位、表笔插孔、量程，开机第一步别接错。', '待撰写', []),
          createNode('elec-08-3', '§ 8.3 · 测电压：交流与直流', '测插座 220 伏、测电池 1.5 伏，最常用两个操作。', '待撰写', []),
          createNode('elec-08-4', '§ 8.4 · 测通断与电阻', '蜂鸣档查断线、查保险、查开关是不是真的通。', '待撰写', []),
          createNode('elec-08-5', '§ 8.5 · 测电流与计量插座', '钳形表和功率计量插座，看清电器真实耗电。', '待撰写', []),
          createNode('elec-08-6', '§ 8.6 · 剥线、压接、接线端子', '不用电焊也能接得牢的三种正规接线做法。', '待撰写', []),
          createNode('elec-08-7', '§ 8.7 · 绝缘、防水与固定', '热缩管、防水接线盒、线卡——修完还得能用十年。', '待撰写', [])
        ]
      ),
      createNode('elec-09', '第 9 章 · 弱电与网络布线',
        '网线、光猫、路由器、电视信号、门禁对讲——家里那半边"信号的电"怎么走。',
        '待撰写',
        [
          createNode('elec-09-1', '§ 9.1 · 强电与弱电的分界', '为什么网线不能和电线同管，弱电箱在哪、管什么。', '待撰写', []),
          createNode('elec-09-2', '§ 9.2 · 网线的种类与水晶头', '五类、超五类、六类怎么选，568B 线序自己压一根。', '待撰写', []),
          createNode('elec-09-3', '§ 9.3 · 光猫、路由器、交换机', '三个盒子各干什么，谁接谁、桥接和拨号的区别。', '待撰写', []),
          createNode('elec-09-4', '§ 9.4 · 全屋网络怎么规划', '路由器摆哪、AP 面板、Mesh 组网与穿墙的现实预期。', '待撰写', []),
          createNode('elec-09-5', '§ 9.5 · 网速慢的排查顺序', '测速点位、换网线、换信道、查光衰——由外到内四步。', '待撰写', []),
          createNode('elec-09-6', '§ 9.6 · 电视信号与有线电视', '闭路、IPTV、机顶盒接线，以及电视没信号怎么查。', '待撰写', []),
          createNode('elec-09-7', '§ 9.7 · 门禁对讲与可视门铃', '楼宇对讲的原理、门铃供电方式、自己换一个的边界。', '待撰写', [])
        ]
      ),
      createNode('elec-10', '第 10 章 · 直流的世界',
        '电池、充电头、充电宝、汽车电瓶——生活中另一半的电，安全隐患和省钱空间都在这儿。',
        '待撰写',
        [
          createNode('elec-10-1', '§ 10.1 · 干电池与可充电池', '碱性、镍氢、锂电各适合什么，为什么不能混用。', '待撰写', []),
          createNode('elec-10-2', '§ 10.2 · 看懂 5V2A 与快充协议', '充电头参数、线材差别，手机为什么越充越慢。', '待撰写', []),
          createNode('elec-10-3', '§ 10.3 · 充电宝容量的真相', '毫安时与瓦时换算，两万毫安为什么充不满四次。', '待撰写', []),
          createNode('elec-10-4', '§ 10.4 · 漏液、鼓包与报废', '鼓包别扎别泡水，废旧锂电池的正确处理方式。', '待撰写', []),
          createNode('elec-10-5', '§ 10.5 · 汽车电瓶为什么没电', '小灯没关、久停自放电、低温衰减——三大杀手。', '待撰写', []),
          createNode('elec-10-6', '§ 10.6 · 搭电的正确顺序', '红正黑负、接地顺序、搭电宝使用的几条铁规。', '待撰写', []),
          createNode('elec-10-7', '§ 10.7 · 换电瓶与状态检测', '看型号和冷启动电流、先拆负极、装完的复位事项。', '待撰写', [])
        ]
      ),
      createNode('elec-11', '第 11 章 · 电费、省电与请人',
        '把电从"看不见"变成"算得清"——读懂账单、找出电老虎、装修前规划，以及怎么请电工不被坑。',
        '待撰写',
        [
          createNode('elec-11-1', '§ 11.1 · 看懂电费单', '阶梯电价、峰谷时段、每一行费用到底怎么来的。', '待撰写', []),
          createNode('elec-11-2', '§ 11.2 · 自己抄表核对', '智能电表怎么读、走字异常怎么查历史用电。', '待撰写', []),
          createNode('elec-11-3', '§ 11.3 · 找出家里的电老虎', '用计量插座给全家电器排一次真实耗电榜。', '待撰写', []),
          createNode('elec-11-4', '§ 11.4 · 真省电与假省电', '待机功耗、空调频繁开关、拔插头——哪些真有效。', '待撰写', []),
          createNode('elec-11-5', '§ 11.5 · 装修前的电路规划', '回路数量、插座位置、预埋穿线管，别等装完后悔。', '待撰写', []),
          createNode('elec-11-6', '§ 11.6 · 怎么请电工与验收', '报价方式、必问三个问题、完工验收测试清单。', '待撰写', [])
        ]
      )
    ],
    { color: '#a0662c' }
  );

  // ---------- 根节点 ----------
  const treeRoot = createNode(
    'root',
    '学海无涯',
    '把 AI、网络、界面三大领域拆成看得见、点得动的认知地图——每篇独立、循序渐进。',
    '待撰写',
    [branchIntelligence, branchNetwork, branchInterface, branchElec]
  );

  window.__cognitionTreeData = treeRoot;
})();
