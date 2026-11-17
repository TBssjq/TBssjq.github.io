/* 第 6 章 · 创造的革命：生成式 AI 重塑未来 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 6,
  title: '创造的革命',
  subtitle: '生成式 AI 重塑未来',
  hue: '#ff6a2b',
  glyph: '06',
  tagline: '从分析数据到创造内容',
  exam: {
    name: '第六章作业',
    due: '2026-11-28T23:59:00+08:00',
    rule: '单选 4 道 × 25 分',
    note: '答案串 B C B C。题量最少、单题分值最高，错一道就丢 25 分。'
  },
  lead: '本章考题只有 4 道，但每道 25 分。三条主线覆盖全部考点：AIGC 的定义边界、跨模态的典型场景、现实风险清单。课件里的 GAN、扩散模型、提示工程、RAG、智能体与本地部署是理解这三条主线的支撑知识。',
  sections: [
    {
      id: 'what',
      title: 'AIGC 是什么：生成与分析的分界',
      kicker: '第 2 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-aigcface.jpg" alt="AI 生成的逼真人脸：生成式 AI 能创造全新的内容" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>AI 生成的逼真人脸：生成式 AI 能创造全新的内容</figcaption></figure>

<p class="lead">生成式人工智能（Artificial Intelligence Generated Content，AIGC）通过学习大量数据，生成与训练数据相似但又具有创造性的<strong>新内容</strong>。核心在于「生成」二字——产出原本不存在的东西。</p>
<div class="duo">
  <div class="duo-col"><h4>分析式 AI（判别式）</h4><ul>
    <li>做的是<strong>分类、回归、预测</strong></li>
    <li>输入数据，输出一个判断或数值</li>
    <li>人脸识别解锁、推荐算法排序、垃圾邮件识别、股价预测</li>
    <li>不创造新内容，只对已有内容做判定</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>生成式 AI（AIGC）</h4><ul>
    <li>做的是<strong>创造文本、图像、音频、视频</strong></li>
    <li>输入条件，输出全新的内容</li>
    <li>ChatGPT 写文章、Midjourney 画图、Sora 生成视频</li>
    <li>不仅理解和分析数据，还产出原本不存在的内容</li>
  </ul></div>
</div>
<div class="tbl"><table>
<thead><tr><th>第 2 题选项</th><th>对应概念</th><th>是否属于 AIGC</th></tr></thead>
<tbody>
<tr><td>A 专门用于下棋和玩游戏</td><td>博弈型 AI，如 AlphaGo</td><td class="bad">否，专用窄 AI</td></tr>
<tr><td>B 感知环境并采取行动实现目标的智能体</td><td>Agent，强调感知—决策—行动闭环</td><td class="bad">否</td></tr>
<tr><td>C 自动生成文本、图像、音频、视频</td><td>生成式 AI</td><td class="good">是</td></tr>
<tr><td>D 分析处理大数据并给出预测性结论</td><td>传统数据分析与预测型 AI</td><td class="bad">否</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>内容生产的三种范式</strong>：<span class="hl">PGC</span> 专业生产内容（机构、媒体、专业创作者）、<span class="hl">UGC</span> 用户生产内容（社交平台上的普通人）、<span class="hl">AIGC</span> 人工智能生成内容。AIGC 属于「机器生产内容 MGC」的高级形态。</div>
<p><strong>应用领域</strong>：教育、医疗、娱乐、艺术等多个领域，为各行业带来深远影响。</p>`
    },
    {
      id: 'history',
      title: '发展历程：五个节点',
      kicker: '课件脉络',
      html: `
<div class="timeline">
  <div class="tl-item"><span class="tl-year">1950s</span><div class="tl-body"><h4>萌芽阶段</h4><p>机器能否创作的早期探索，与图灵测试同期。</p></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">2014</span><div class="tl-body"><h4>生成对抗网络 GAN</h4><p>Goodfellow 提出 GAN，标志着 AIGC 领域的一个重要里程碑。生成器与判别器对抗训练，第一次让机器画出以假乱真的图像。</p></div></div>
  <div class="tl-item"><span class="tl-year">2017</span><div class="tl-body"><h4>Transformer</h4><p>谷歌推出 Transformer 模型，自注意力机制取代循环结构，为后续所有大模型提供统一底座。</p></div></div>
  <div class="tl-item"><span class="tl-year">2018+</span><div class="tl-body"><h4>预训练模型兴起</h4><p>「一次预训练、多任务微调」的范式确立，AIGC 领域的又一重要进展。</p></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">2022</span><div class="tl-body"><h4>ChatGPT 引爆</h4><p>以 ChatGPT 为代表的大语言模型引领新一轮 AIGC 发展热潮，生成式 AI 从实验室走进大众日常。</p></div></div>
</div>`
    },
    {
      id: 'gan',
      title: 'GAN 与 VAE：两种生成思路',
      kicker: '课件原理',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-gan.jpg" alt="GAN：生成器造假、判别器鉴真，二者对抗中共同进步" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>GAN：生成器造假、判别器鉴真，二者对抗中共同进步</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-vae.jpg" alt="VAE：编码器把输入压缩到隐空间，解码器再重建出来" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>VAE：编码器把输入压缩到隐空间，解码器再重建出来</figcaption></figure>

<h4 class="sub-h">生成对抗网络 GAN</h4>
<p>核心思想是让两个神经网络互相博弈：<strong>生成器 Generator</strong> 负责造假，<strong>判别器 Discriminator</strong> 负责识假。两者对抗训练，共同提升。</p>
<div class="steps">
  <li><b>生成器生成样本</b>：从随机噪声向量开始，通过神经网络映射生成一个数据样本。</li>
  <li><b>判别器评估样本</b>：接收两个来源的输入——真实数据样本与生成器生成的样本，输出一个概率值，表示输入样本是真实样本的概率。</li>
  <li><b>对抗训练</b>：判别器的目标是最小化真实样本被误判为假的概率，同时最大化生成样本被正确判为假的概率。</li>
  <li><b>交替更新</b>：生成器尝试生成更逼真的样本，判别器不断学习如何更好地区分真假。两者交替进行更新。</li>
</div>
<div class="note"><strong>直观理解</strong>：造假者不断提高仿制水平，鉴定师不断提高鉴别水平，最后造假者的作品连鉴定师都分不出来——这时生成器就学会了真实数据的分布。</div>
<h4 class="sub-h">变分自编码器 VAE</h4>
<p>结合自编码器与概率图模型的生成式深度学习模型。编码器把输入数据（图像、文本）压缩为低维潜在特征，这些特征可作为后续生成模型（如 U-Net）的输入；解码器把潜在变量 z 解码回原始数据的分布。</p>
<div class="steps">
  <li><b>编码</b>：输入数据 x 进入编码器 Encoder。</li>
  <li><b>学分布</b>：编码器学习潜在变量 z 的分布，即后验分布 <span class="katex-inline">\\(q_\\phi(z\\mid x)\\)</span>。</li>
  <li><b>采样</b>：从该分布中采样得到潜在表示 z。</li>
  <li><b>解码</b>：解码器根据 z 重构数据，即似然分布 <span class="katex-inline">\\(p_\\theta(x\\mid z)\\)</span>。</li>
  <li><b>输出</b>：输出重构后的数据，完成生成或重建过程。</li>
</div>
<div class="note note--key"><strong>GAN 与 VAE 的差别</strong>：GAN 靠对抗博弈逼近真实分布，图像锐利但训练不稳定；VAE 靠概率建模与重构，训练稳定、潜在空间连续可插值，但生成结果偏模糊。扩散模型后来在质量与稳定性上同时超越两者。</div>`
    },
    {
      id: 'diffusion',
      title: '扩散模型与文生图流程',
      kicker: '第 3 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-diffusion.jpg" alt="扩散模型：前向逐步加噪，反向学习去噪生成图像" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>扩散模型：前向逐步加噪，反向学习去噪生成图像</figcaption></figure>

<p>扩散模型（Diffusion Models）的核心思想是<strong>先学会破坏，再学会修复</strong>：通过逐步添加噪声把数据转化为噪声（正向扩散），再从噪声中逐步去除噪声恢复出原始数据（逆向扩散）。</p>
<div class="duo">
  <div class="duo-col"><h4>正向扩散</h4><p class="duo-sub">将原始数据（图像或视频）逐步转化为高斯噪声。这一步不需要学习，是预先设定好的加噪日程。它的作用是制造训练样本：每一步的「带噪图 → 更干净的图」都是一条监督信号。</p></div>
  <div class="duo-col duo-col--alt"><h4>逆向扩散</h4><p class="duo-sub">正向扩散的反向操作，目标是从噪声中逐步恢复出原始数据。这一步由神经网络学习，是模型真正掌握的能力。生成时从纯随机噪声出发，反复去噪直到得到清晰图像。</p></div>
</div>
<h4 class="sub-h">文生图的完整流程</h4>
<div class="steps">
  <li><b>文本编码</b>：通过编码器（如 CLIP）把文字描述转换为词元嵌入 Token Embeddings。</li>
  <li><b>迭代去噪</b>：一个随机噪声张量被送入图像信息生成器（UNet + 调度器）。UNet 在文本条件的指导下逐步预测并去除噪声，此过程循环迭代，每一步都生成一个噪声更少的张量。</li>
  <li><b>图像解码</b>：处理后干净的潜在张量被送入图像解码器，转换回最终的像素图像。</li>
</div>
<div class="note note--key"><strong>第 3 题为什么选文生图</strong>：跨模态（Cross-modal）指在两种或两种以上不同信息形态之间建立映射。文生图的输入是<span class="hl">文本模态</span>，输出是<span class="hl">图像模态</span>，既理解了文字语义又生成了对应图像，是跨模态理解与生成的教科书级案例，代表产品 Midjourney、DALL·E、Stable Diffusion。<br>人脸识别是「图像 → 身份」的单模态识别，不涉及生成；推荐算法做行为数据匹配与排序，属判别式任务；Excel 公式是确定性计算，根本不是 AI。</div>
<div class="tbl"><table>
<thead><tr><th>跨模态任务</th><th>输入 → 输出</th><th>代表</th></tr></thead>
<tbody>
<tr><td>文生图 Text-to-Image</td><td>文本 → 图像</td><td>Midjourney、DALL·E、Stable Diffusion</td></tr>
<tr><td>文生视频 Text-to-Video</td><td>文本 → 视频</td><td>Sora</td></tr>
<tr><td>文生语音 / 语音克隆 TTS</td><td>文本 → 音频</td><td>语音合成与音色克隆</td></tr>
<tr><td>图生文 Image Captioning</td><td>图像 → 文本</td><td>图像描述生成</td></tr>
<tr><td>语音转文字 ASR</td><td>音频 → 文本</td><td>语音识别</td></tr>
</tbody></table></div>`
    },
    {
      id: 'pipeline',
      title: '生成式模型的四阶段流水线',
      kicker: '课件原理',
      html: `
<div class="steps">
  <li><b>数据准备</b>：预训练使用大规模文本数据集，通常是未经标注的原始文本。使用前要进行分词 Tokenization，把文本拆分成 tokens。</li>
  <li><b>预训练 Pretraining</b>：关键技术是<span class="hl">自监督学习</span>。目标是让模型从大量无标签文本中学习语言的统计规律、语法结构、语义关系。做法是预测文本的某些部分（下一个 token，或被遮掩的部分），学到规律后迁移到下游任务（文本分类、问答、翻译）。</li>
  <li><b>微调 Finetuning</b>：六步走——选择预训练模型 → 准备数据集 → 调整模型结构 → 设置训练参数 → 执行微调 → 评估与调优。</li>
  <li><b>奖励模型与强化学习</b>：奖励模型（Reward Model, RM）评估大语言模型输出的文本质量并给出分数，指导模型在后续生成中更符合人类偏好与需求。强化学习通过奖惩机制引导模型学习，这一步即人类反馈强化学习 RLHF。</li>
</div>
<h4 class="sub-h">训练成本与 Tokens</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">占 80% 以上</span><h4 class="card-t">计算资源</h4><p class="card-b">GPU / TPU 的硬件消耗，是训练成本的绝对大头。</p></div>
  <div class="card"><span class="card-k">数据成本</span><h4 class="card-t">收集、清洗、标注</h4><p class="card-b">高质量语料的获取与处理费用。</p></div>
  <div class="card"><span class="card-k">能耗与运维</span><h4 class="card-t">电力、冷却、存储</h4><p class="card-b">数据中心持续运行的开销。</p></div>
  <div class="card"><span class="card-k">研发成本</span><h4 class="card-t">算法与实验</h4><p class="card-b">算法设计、调参、实验迭代的人力投入。</p></div>
</div>
<div class="note note--key"><strong>Tokens 是衡量训练数据规模的单位</strong>。模型的训练数据通常以 Tokens 总量衡量，而不是以「多少本书」「多少 GB」衡量。一个 token 大致对应一个词或一个子词片段，中文一个汉字通常占一到两个 token。</div>`
    },
    {
      id: 'prompt',
      title: '提示工程：把话说清楚',
      kicker: '课件实操',
      html: `
<p>Prompt 是用户向模型提供的输入，用于引导模型生成特定类型、主题或格式的文本输出。它可以是一个问题、一个描述、一组关键词或上下文信息，告诉模型用户希望得到的输出类型和内容。</p>
<div class="note note--key"><strong>一个典型提示的六个元素</strong>：<span class="hl">指令</span>（要做什么）、<span class="hl">上下文</span>（背景信息）、<span class="hl">示例</span>（参考样例）、<span class="hl">输入</span>（待处理内容）、<span class="hl">输出格式</span>（结构要求）、其他信息。</div>
<h4 class="sub-h">四个关键要素</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">要素一</span><h4 class="card-t">准确理解语义</h4><p class="card-b">精准传递信息的密钥。用词明确，避免歧义与含混指代。</p></div>
  <div class="card"><span class="card-k">要素二</span><h4 class="card-t">构建语境</h4><p class="card-b">为 AI 创作营造特定场景。交代身份、对象、用途与约束条件。</p></div>
  <div class="card"><span class="card-k">要素三</span><h4 class="card-t">引导提示</h4><p class="card-b">为 AI 创作指引方向。给出思考路径与期望的推理步骤。</p></div>
  <div class="card"><span class="card-k">要素四</span><h4 class="card-t">设定限制</h4><p class="card-b">确保 AI 创作符合预期。限定字数、格式、口径与禁止事项。</p></div>
</div>
<h4 class="sub-h">七条技巧与四条原则</h4>
<div class="duo">
  <div class="duo-col"><h4>如何写好提示词</h4><ul>
    <li>明确要求</li><li>明确目的</li><li>夸奖大模型</li><li>使用结构化语言</li>
    <li>提供上下文信息</li><li>尝试多种表达方式</li><li>逐步细化</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>提示词原则</h4><ul>
    <li><strong>设定角色</strong>：你是一位有十年经验的教务老师</li>
    <li><strong>给出示例</strong>：先示范一条输入输出，再让它照做</li>
    <li><strong>思维链</strong>：要求分步推理，把中间过程写出来</li>
    <li><strong>自我反思</strong>：让它检查自己的答案并修正</li>
  </ul></div>
</div>
<div class="note"><strong>为什么这些技巧有效</strong>：模型按概率续写，提示词决定了它进入哪一段概率分布。角色设定收窄了语域，示例提供了模式，思维链把复杂推理拆成可验证的小步，自我反思触发二次检查。它们都在减少模型的自由发挥空间。</div>`
    },
    {
      id: 'rag',
      title: '检索增强 RAG：给模型配一个资料库',
      kicker: '课件原理',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-rag.jpg" alt="RAG 流程：用户提问先检索外部知识库，再把结果交给大模型生成答案" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>RAG 流程：用户提问先检索外部知识库，再把结果交给大模型生成答案</figcaption></figure>

<p>检索增强（Retrieval-Augmented Generation, RAG）是一种结合信息检索、文本增强及文本生成的自然语言处理技术，通过检索外部知识库中的相关信息来增强生成式模型的生成能力。</p>
<div class="note note--key"><strong>它解决什么问题</strong>：大模型回答特定领域问题时会出现<span class="hl">知识过时</span>与<span class="hl">事实性错误</span>。RAG 的核心是如何有效检索和利用外部知识，提高生成内容的质量与准确性。</div>
<h4 class="sub-h">工作机制三阶段</h4>
<div class="steps">
  <li><b>数据准备</b>：对用户提出的自然语言问题做词法分析、句法分析，理解问题的语义与意图，识别出关键信息。</li>
  <li><b>检索</b>：基于对问题的理解，在大量知识源中检索。知识源可以是旅游网站、攻略文档、百科知识，也可以是自己创建的知识库。</li>
  <li><b>生成</b>：把检索到的相关片段与原始问题合并，形成更丰富的上下文信息，交给大模型融合自身已有知识生成回答。</li>
</div>
<h4 class="sub-h">图数据库在 RAG 中的应用</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">优势一</span><h4 class="card-t">复杂关系处理</h4><p class="card-b">实体之间的多跳关系用图结构天然表达，向量检索难以覆盖。</p></div>
  <div class="card"><span class="card-k">优势二</span><h4 class="card-t">动态知识更新</h4><p class="card-b">改一条边就更新一处知识，无需重新训练模型。</p></div>
  <div class="card"><span class="card-k">优势三</span><h4 class="card-t">减少幻觉</h4><p class="card-b">回答有明确的实体与关系来源，可追溯、可核验。</p></div>
</div>
<div class="tbl"><table>
<thead><tr><th>结合方式</th><th>做什么</th></tr></thead>
<tbody>
<tr><td>知识图谱构建</td><td>从文本数据中提取实体和关系，存储到图数据库中</td></tr>
<tr><td>检索阶段</td><td>根据用户查询提取关键实体和关系，从图数据库中检索相关信息</td></tr>
<tr><td>生成阶段</td><td>把检索到的信息作为上下文输入语言模型，生成准确且连贯的回答</td></tr>
</tbody></table></div>
<p><strong>应用案例</strong>：知识问答系统快速检索相关实体与关系生成高质量问答；多领域知识整合支持跨领域查询与生成；个性化内容生成按用户需求与偏好定制检索与生成过程。</p>
<div class="note"><strong>RAG 与微调的分工</strong>：RAG 补充「模型不知道的事实」，改知识库即可生效；微调改变「模型的行为方式与专业表达」，需要重新训练。两者可以叠加使用。</div>`
    },
    {
      id: 'agent',
      title: '智能体 Agent：让模型动手做事',
      kicker: '课件实操',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch6-agent.jpg" alt="智能体 Agent：大模型调用工具、访问知识库，形成「感知—规划—行动」闭环" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>智能体 Agent：大模型调用工具、访问知识库，形成「感知—规划—行动」闭环</figcaption></figure>

<p>智能体（Agent）是能够<strong>自主感知环境、做出决策并执行行动</strong>以实现特定目标的系统。大模型 Agent 构建于大型语言模型之上，具备环境感知、自主理解、决策制定与执行行动的能力。</p>
<h4 class="sub-h">系统架构五模块</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">模块一</span><h4 class="card-t">感知模块</h4><p class="card-b">接收用户输入与环境信息，把外部世界转成模型可处理的表示。</p></div>
  <div class="card"><span class="card-k">模块二</span><h4 class="card-t">核心处理模块</h4><p class="card-b">以大语言模型为大脑，负责理解、推理与生成。</p></div>
  <div class="card"><span class="card-k">模块三</span><h4 class="card-t">记忆模块</h4><p class="card-b">保存对话历史与长期知识，让智能体记得住上下文。</p></div>
  <div class="card"><span class="card-k">模块四</span><h4 class="card-t">规划与决策模块</h4><p class="card-b">把复杂任务拆解为子任务，决定调用哪个工具、按什么顺序执行。</p></div>
  <div class="card"><span class="card-k">模块五</span><h4 class="card-t">交互模块</h4><p class="card-b">对外输出结果、调用外部工具与 API，完成实际行动。</p></div>
</div>
<p><strong>三项关键技术</strong>：提示工程（设计指令模板引导模型行为，如角色扮演、格式约束）、微调（通过领域数据或人类反馈 RLHF 优化特定任务表现）、多模态扩展（融合视觉与语音模型如 GPT-4V 处理跨模态任务）。</p>
<h4 class="sub-h">三种工作流</h4>
<div class="tbl"><table>
<thead><tr><th>工作流</th><th>组织方式</th><th>适合什么</th></tr></thead>
<tbody>
<tr><td><strong>链式工作流</strong></td><td>多个步骤按线性序列组织，一个步骤的输出作为下一个步骤的输入，形成连续处理链</td><td>流程固定、前后依赖明确的任务</td></tr>
<tr><td><strong>并行化工作流</strong></td><td>同时执行多个任务或处理多个数据集</td><td>数据密集型操作，提高效率</td></tr>
<tr><td><strong>路由工作流</strong></td><td>根据输入条件动态指导执行路径，无需预定义序列</td><td>输入多样、需要临场判断的情况</td></tr>
</tbody></table></div>
<p>智能体工作流以大型语言模型为技术基础，通过多个 AI 智能体协作，把复杂任务分解为可管理的子任务，并通过迭代优化完成目标。</p>
<h4 class="sub-h">动手做一个校园智能体</h4>
<p>课件给出的真实场景：清晨第一节课前教室位置突然变更却无人通知；面对繁多选修课不知如何搭配才能满足学分要求；深夜复习找不到适配专业的高质量学习资源。</p>
<div class="steps">
  <li><b>明确目标</b>：功能设计包括查询课表时间与地点、推荐专业相关学习资源、解答选课与学分等教务问题、用表情包缓解学业压力。用户画像是全校新生，需理解不同专业术语。</li>
  <li><b>配置基础信息</b>：访问 Coze 官网 <code>https://www.coze.cn/</code>，用学校邮箱注册账号（支持 Google 与手机号注册），进入 Create Bot 界面，点「+」开始。</li>
  <li><b>编写提示词</b>：这是配置智能体的第一步，也就是智能体的<span class="hl">人设与回复逻辑</span>。人设会持续影响它在所有会话中的回复效果。</li>
  <li><b>添加知识库</b>：模型训练数据来自互联网公开数据，通常不具备垂直领域专业知识。在编排页面定位到知识功能区域，单击添加按钮（+）加入专属知识库，解决专业领域知识不足的问题。</li>
  <li><b>调试与发布</b>：在「预览与调试」区域测试是否符合预期，完成后单击「发布」。支持发布到飞书、微信、抖音、豆包等多个渠道。</li>
</div>`
    },
    {
      id: 'deepseek',
      title: 'DeepSeek：本地部署与知识库搭建',
      kicker: '课件实操',
      html: `
<p>2021 至 2023 年是全球 AI 技术突破的窗口期：以 GPT-4 为代表的国际大模型掀起技术革命浪潮，国内亟需突破应用创新局限、向底层技术攻坚。2023 年中文大模型「百模大战」全面爆发，DeepSeek 应运而生。</p>
<h4 class="sub-h">三阶分层架构</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">第一层</span><h4 class="card-t">输入解析层</h4><p class="card-b">通过多模态感知网络精准识别任务本质。</p></div>
  <div class="card"><span class="card-k">第二层</span><h4 class="card-t">知识检索层</h4><p class="card-b">依托超 2000 亿参数的领域知识库进行靶向信息提取，如同为 AI 配备专业智库。</p></div>
  <div class="card"><span class="card-k">第三层</span><h4 class="card-t">推理生成层</h4><p class="card-b">运用链式思维技术把复杂问题拆解为可验证的逻辑单元，独特的递归验证模块实时检测推理漏洞。</p></div>
</div>
<h4 class="sub-h">四维能力</h4>
<div class="tbl"><table>
<thead><tr><th>能力维度</th><th>学术场景示例</th><th>行业应用延伸</th><th>技术支撑点</th></tr></thead>
<tbody>
<tr><td>文本生成</td><td>实验报告结构化写作</td><td>金融年报自动生成</td><td>长文本逻辑链控制技术</td></tr>
<tr><td>代码开发</td><td>Python 爬虫脚本调试</td><td>工业物联网协议转换器开发</td><td>多语言代码理解框架</td></tr>
<tr><td>数据分析</td><td>问卷统计结果可视化解读</td><td>城市交通流量预测模型构建</td><td>非结构化数据提取引擎</td></tr>
<tr><td>知识融合</td><td>量子物理与哲学交叉研究</td><td>生物制药专利知识图谱构建</td><td>跨学科语义关联算法</td></tr>
</tbody></table></div>
<p><strong>跨域创新案例</strong>：理工科穿透性应用、文科创造性拓展、艺术设计协同创作。核心能力源于多模态融合架构，可同步处理文本、代码、数据、图表等多类型信息。</p>
<h4 class="sub-h">本地部署五步</h4>
<div class="note"><strong>软件需求三件套</strong>：<span class="hl">Ollama</span>（<code>https://ollama.com/</code>）用于本地运行 DeepSeek 模型的开源工具；<span class="hl">AnythingLLM</span> 提供图形界面和知识库管理功能的应用框架；<span class="hl">BGE-M3</span> 用于将文档转换为向量模型。硬件按所选参数规模决定，课件演示选用 7b。</div>
<div class="steps">
  <li><b>部署环境</b>：确认硬件满足所选参数规模的要求，安装上述三类软件。</li>
  <li><b>安装 Ollama 并部署模型</b>：打开终端（Windows 使用 PowerShell 或命令窗口），根据硬件选择参数规模，输入 <code>ollama run deepseek-r1:7b</code> 下载模型。等待下载完成，提示 <code>success</code> 表示安装成功。</li>
  <li><b>安装与配置 AnythingLLM</b>：从 <code>https://anythingllm.com/desktop</code> 下载对应系统安装包。首次运行点击页面左下角工具按钮中的设置（扳手），选择 Ollama 作为模型提供商，在 Ollama Model 中选择已下载的 <code>deepseek-r1:7b</code>。在设置菜单「外观」的 Display Language 中选择 Chinese 可切换中文界面。</li>
  <li><b>配置向量模型与知识库</b>：终端输入 <code>ollama pull bge-m3</code> 下载嵌入模型。进入 AnythingLLM 设置的「Embedder 首选项」，嵌入引擎提供商选 ollama、模型选 bge-m3，保存后返回工作区。点击工作区「上传」按钮或直接拖拽文件到虚线框，支持 PDF、Markdown、Word。选中文档点「Move to workspace」，再点「Save and embed」保存。</li>
  <li><b>使用知识库</b>：点击工作区齿轮按钮进入设置 → 聊天设置 → 点击 System default 选项 → 搜索框输入 ollama 并选择出现的选项 → 工作区聊天模型选 DeepSeek-r1:7b → 聊天模式选「查询」→ 拉到最下面点击保存。</li>
</div>
<div class="note note--key"><strong>这一步直接反驳第 4 题的 C 选项</strong>：一台普通个人电脑就能本地跑起 7b 参数的 DeepSeek 并挂载自己的知识库。「个人电脑完全无法运行任何 AIGC 模型」与事实明显不符。</div>`
    },
    {
      id: 'risk',
      title: '风险清单与数据偏差治理',
      kicker: '第 1、4 题',
      html: `
<p>生成式模型本质上是「从数据中学习分布」。如果训练数据集本身存在偏差——某些群体样本过少、历史刻板印象被大量收录、来源渠道单一——模型会把这些统计偏差当作规律学习下来，并在生成阶段被放大。</p>
<div class="note note--warn"><strong>第 1 题</strong>：数据偏差的典型表现是性别、种族、文化、地域偏见，例如「护士默认女性」「程序员默认男性」的刻板输出。<br>偏差不会提升准确性，反而降低输出对真实世界的客观还原度；训练速度主要受算力、数据量、模型规模影响；存储需求由参数量决定。三者都与数据是否有偏差无关。</div>
<div class="tbl"><table>
<thead><tr><th>风险</th><th>具体表现</th><th>是否真实</th></tr></thead>
<tbody>
<tr><td>事实性幻觉 Hallucination</td><td>模型按概率续写，不保证事实正确，可能编造论文、案例、API 接口甚至法律条文</td><td class="good">真实，结构性缺陷</td></tr>
<tr><td>数据偏见与歧视</td><td>生成包含偏见或歧视性的话语</td><td class="good">真实</td></tr>
<tr><td>版权与知识产权争议</td><td>训练数据版权、生成内容著作权归属</td><td class="good">真实</td></tr>
<tr><td>深度伪造与虚假信息</td><td>换脸、拟声、伪造新闻</td><td class="good">真实</td></tr>
<tr><td>隐私与数据泄露</td><td>训练语料与对话记录中的个人信息</td><td class="good">真实</td></tr>
<tr><td>就业冲击与伦理争议</td><td>岗位替代与责任归属</td><td class="good">真实</td></tr>
<tr><td>算力与能耗的环保压力</td><td>数据中心电力与冷却消耗</td><td class="good">真实</td></tr>
<tr><td>「个人电脑完全无法运行任何 AIGC 模型」</td><td>已有大量轻量化与小参数模型（Llama、Qwen、ChatGLM 的量化版本）可在消费级 PC 甚至手机上本地运行</td><td class="bad">表述绝对化，不属于风险</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>第 4 题的解题口径</strong>：题干是「不包括」，即寻找<span class="hl">错误或夸大</span>的说法。凡是出现「完全」「任何」「绝对」「一律」这类全称量词，先怀疑它。<br><strong>缓解数据偏差的常见做法</strong>：数据清洗与去偏、样本均衡、人类反馈强化学习 RLHF、红队测试、输出审核机制。</div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 25,
      stem: '数据集偏差对生成式人工智能的影响是什么？（　）',
      opts: ['提高生成内容的准确性', '导致生成带有偏见的内容', '加快模型训练速度', '减少模型存储需求'],
      ans: 'B',
      why: '<p>生成式模型本质上是从数据中学习分布。训练数据集若存在偏差（某些群体样本过少、历史刻板印象被大量收录、来源渠道单一），模型会把统计偏差当作规律学下来，并在生成阶段放大，表现为性别、种族、文化、地域偏见，例如「护士默认女性」「程序员默认男性」。</p><ul><li>A：偏差降低输出对真实世界的客观还原度。</li><li>C：训练速度主要受算力、数据量、模型规模影响。</li><li>D：存储需求由参数量决定。</li></ul><p>缓解做法：数据清洗与去偏、样本均衡、人类反馈强化学习 RLHF、红队测试、输出审核机制。</p>',
      point: '数据偏差如何传导到生成结果',
      anchor: '数据偏差 → 输出偏见'
    },
    {
      n: 2, type: 'single', score: 25,
      stem: '以下关于 AIGC（人工智能生成内容）最贴切的描述是？（　）',
      opts: ['一种专门用于下棋和玩游戏的人工智能', '一种能够感知环境并采取行动实现目标的智能体', '利用人工智能技术自动生成文本、图像、音频、视频等内容', '专门用于分析和处理大数据，并给出预测性结论的系统'],
      ans: 'C',
      why: '<p>AIGC 全称 AI Generated Content，核心在于「生成」二字，即由模型产出原本不存在的新内容。</p><ul><li>A：博弈型 AI 如 AlphaGo，只针对特定游戏场景，属专用窄 AI。</li><li>B：描述的是 Agent 智能体，强调感知—决策—行动闭环。</li><li>D：判别式与分析式 AI 的典型描述，做分类、回归、预测。</li></ul><p>AIGC 与 PGC 专业生产内容、UGC 用户生产内容并称内容生产的三种范式，属于机器生产内容 MGC 的高级形态。</p>',
      point: 'AIGC 的定义边界',
      anchor: '生成新内容 对 分析已有数据'
    },
    {
      n: 3, type: 'single', score: 25,
      stem: '下列哪项应用最能体现 AIGC「跨模态理解与生成」的典型能力？（　）',
      opts: ['用人脸识别系统进行手机解锁', '根据一段文字描述，自动生成一张符合描述的图片', '使用推荐算法为你推送喜欢的短视频', '在 Excel 中使用公式自动计算表格数据'],
      ans: 'B',
      why: '<p>跨模态指在两种或两种以上不同信息形态之间建立映射，常见模态包括文本、图像、音频、视频、3D、代码。文生图输入是文本模态、输出是图像模态，既理解文字语义又生成对应图像，代表产品 Midjourney、DALL·E、Stable Diffusion。</p><ul><li>A：人脸识别是图像到身份的单模态识别，不涉及生成也不跨模态。</li><li>C：推荐算法做用户行为数据的匹配与排序，属判别式任务。</li><li>D：Excel 公式是确定性计算，不是 AI。</li></ul><p>其他跨模态任务：文生视频 Sora、文生语音 TTS、图生文 Image Captioning、语音转文字 ASR。</p>',
      point: '跨模态任务的判定',
      anchor: '输入输出必须是两种不同模态，且要有生成'
    },
    {
      n: 4, type: 'single', score: 25,
      stem: '目前 AIGC 技术在应用中面临的主要挑战和风险不包括以下哪项？（　）',
      opts: ['可能生成包含偏见或歧视性的话语', '生成的代码或文本可能存在事实性错误（幻觉）', '由于其强大的算力需求，导致个人电脑完全无法运行任何 AIGC 模型', '引发关于知识产权和内容归属的法律与伦理问题'],
      ans: 'C',
      why: '<p>题干是「不包括」，即寻找错误或夸大的说法。C 的表述过于绝对：已有大量轻量化与小参数模型（Llama、Qwen、ChatGLM 的量化版本）可以在消费级 PC 甚至手机上本地运行，课件本身也演示了用 Ollama 在个人电脑部署 deepseek-r1:7b 并搭建知识库。</p><ul><li>A：真实风险，与第 1 题呼应。</li><li>B：幻觉是生成模型的结构性缺陷，模型按概率续写并不保证事实正确，可能编造论文、案例、API 接口甚至法律条文。</li><li>D：训练数据版权、生成内容著作权归属、深度伪造滥用都是当前法律与伦理讨论的焦点。</li></ul><p>完整风险清单还包括隐私与数据泄露、就业冲击、算力与能耗的环保压力。</p>',
      point: '识别绝对化表述',
      anchor: '看到「完全」「任何」先怀疑'
    }
  ]
});