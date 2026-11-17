/* 第 1 章 · 从梦想到现实：人工智能基础 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 1,
  title: '从梦想到现实',
  subtitle: '人工智能基础',
  hue: '#f5a524',
  glyph: '01',
  tagline: '机器能思考吗？这个问题如何变成一个学科',
  exam: {
    name: '第一章作业',
    due: '2026-11-21T23:59:00+08:00',
    rule: '单选 4.5 分 · 多选 3.5 分',
    note: '作业页面共 23 题，已全部收录。第 4–10 题题干据前序整理，已标注。'
  },
  lead: '这一章回答三个问题：人工智能是什么、它从哪来、它靠什么跑起来。考试里最容易丢分的地方集中在「年份与人物配对」和「学习范式判定」，把这两张表背熟，本章基本满分。',
  sections: [
    {
      id: 'define',
      title: '人工智能是什么',
      kicker: '概念',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-robot.jpg" alt="机器人是 AI 能力的综合体现：感知、决策、动作一体" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>机器人是 AI 能力的综合体现：感知、决策、动作一体</figcaption></figure>

<p class="lead">人工智能是让机器具备<strong>感知、学习、推理、生成、决策</strong>能力的技术。判断一项技术属不属于 AI，就看它是否提供这五种能力之一。</p>
<div class="cards">
  <div class="card"><span class="card-k">2020 · 中国人工智能产业发展联盟</span><h4 class="card-t">智能科学与工程</h4><p class="card-b">强调研究与模拟人类智能活动的规律，构造具有一定智能的人工系统。</p></div>
  <div class="card"><span class="card-k">2021 · ISO/IEC</span><h4 class="card-t">系统能力标准</h4><p class="card-b">从工程角度定义：系统能够正确解释外部数据，从中学习，并通过灵活适应实现特定目标与任务。</p></div>
  <div class="card"><span class="card-k">2022 · Meta</span><h4 class="card-t">数据驱动的学习</h4><p class="card-b">强调<strong>数据驱动下的学习和任务执行能力</strong>。课件自测题考的就是这一条。</p></div>
  <div class="card"><span class="card-k">2023 · 英伟达</span><h4 class="card-t">计算与生成</h4><p class="card-b">把 AI 看作能够理解并生成语言、图像、代码等多种内容的计算范式。</p></div>
</div>
<div class="note note--key"><strong>按能力分级</strong>：弱人工智能 ANI（只会一件事，如人脸识别、下棋）→ 通用人工智能 AGI（跨任务迁移，DeepMind 的 Gato 能做 604 项任务，其中 450 项超过专家水平的 50%）→ 超人工智能 ASI（全面超越人类，尚未实现）。<br><strong>按技术分</strong>：符号主义、联结主义、行为主义三大学派。<span class="hl">「自然人工智能」是编造词，考试里的排除项。</span></div>
`
    },
    {
      id: 'turing',
      title: '图灵测试：把哲学问题变成实验',
      kicker: '1950',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-turing.jpg" alt="艾伦·图灵（1912—1954）：计算机科学与人工智能的奠基者" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>艾伦·图灵（1912—1954）：计算机科学与人工智能的奠基者</figcaption></figure>

<p>1950 年，艾伦·图灵在哲学期刊 <em>Mind</em> 发表<strong>《计算机器与智能》（Computing Machinery and Intelligence）</strong>，开篇问「机器能思考吗？」，随后给出可操作的替代方案——<strong>模仿游戏</strong>，也就是图灵测试。</p>
<div class="steps">
  <li><b>测试者</b>通过纯文本对话分别与人和机器交流，看不到对方。</li>
  <li>如果<strong>超过 30% 的测试者无法分辨</strong>对面是人还是机器，就认为机器通过测试。</li>
  <li>它回避了「思考」的哲学定义，改用<strong>行为判据</strong>，属于操作主义的智能判定方式。</li>
</div>
<div class="note"><strong>2024 年 6 月的现代版实验</strong>：加州大学圣迭戈分校让 500 名测试者分别与人和模型进行 5 分钟对话，GPT-4 被误认为人类的比例达到 <strong>54%</strong>，真人对照为 67%。</div>
<div class="duo">
  <div class="duo-col"><h4>它能证明什么</h4><ul><li>机器在语言行为上可以与人难以区分</li><li>提供了一个可重复、可量化的实验判据</li></ul></div>
  <div class="duo-col duo-col--alt"><h4>它证明不了什么</h4><ul><li>只测对话，不覆盖感知、具身与推理一致性</li><li>结果受测试者主观判断影响</li><li>塞尔「中文房间」指出：通过测试不等于真正理解</li><li>图灵本人没有提出「人工智能」这个术语</li></ul></div>
</div>`
    },
    {
      id: 'schools',
      title: '三大学派：三种造智能的思路',
      kicker: '核心考点',
      html: `
<div class="tbl"><table>
<thead><tr><th>学派</th><th>核心主张</th><th>怎么工作</th><th>代表成果</th><th>软肋</th></tr></thead>
<tbody>
<tr><td><strong>符号主义</strong></td><td>智能 = 符号表示 + 逻辑推理</td><td>符号是积木，规则是图纸，推理就是按图纸搭积木</td><td>专家系统 MYCIN（500 多条规则）、DENDRAL、Prospector 钼矿勘探、知识图谱、深蓝</td><td>知识获取瓶颈；规则组合爆炸；面对没写过的情况很脆弱</td></tr>
<tr><td><strong>联结主义</strong></td><td>智能 = 大量简单单元的连接与权重学习</td><td>猜 → 比 → 改，三个动作循环十万次</td><td>感知机、BP 算法、CNN、RNN、Transformer、深度学习</td><td>黑箱难解释；数据饥渴；容易学偏</td></tr>
<tr><td><strong>行为主义</strong></td><td>智能 = 感知与动作的反馈闭环</td><td>胡萝卜加大棒：做对了加分，做错了扣分</td><td>控制论、强化学习、AlphaGo、具身智能、六足机器人断腿后 2 分钟自救</td><td>试错成本高；奖励函数难设计</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>考试陷阱</strong>：「进化主义」（遗传算法、进化策略）属于计算智能分支，<span class="hl">不在三大核心学派之列</span>，看到它基本就是那个排除项。</div>
<p><strong>符号主义的例子</strong>：三段论「所有人都会死；苏格拉底是人；所以苏格拉底会死」。识别老虎就写一条规则链：有毛发 → 哺乳动物；吃肉 → 食肉动物；黄褐色带黑条纹 → 老虎。规则一旦写不全，系统就失效，这正是它在 1980 年代后期退潮的原因。</p>
<p><strong>联结主义的例子</strong>：给网络看十万张猫的照片，每次让它猜，猜错了就调整权重。没人告诉它「猫有尖耳朵」，它自己学出了这个特征。</p>
<p><strong>行为主义的例子</strong>：四足机器人学会走路——前进一步 +1 分，能耗过高 −0.1 分，摔倒 −100 分。它不需要任何人类示范。</p>`
    },
    {
      id: 'timeline',
      title: '发展时间线：年份、人物、事件',
      kicker: '必背',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-dartmouth.jpg" alt="1956 年达特茅斯会议：人工智能作为独立学科正式诞生" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>1956 年达特茅斯会议：人工智能作为独立学科正式诞生</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-timeline.jpg" alt="人工智能发展编年史：从早期符号主义到深度学习" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>人工智能发展编年史：从早期符号主义到深度学习</figcaption></figure>

<div class="timeline">
  <div class="tl-item"><span class="tl-year">1948</span><div class="tl-body"><b>维纳《控制论》</b><span>反馈与自组织思想，行为主义的源头。</span></div></div>
  <div class="tl-item"><span class="tl-year">1950</span><div class="tl-body"><b>图灵《计算机器与智能》</b><span>提出模仿游戏（图灵测试）。思想起点。</span></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">1956</span><div class="tl-body"><b>达特茅斯会议</b><span>麦卡锡、明斯基、香农、罗切斯特。<strong>麦卡锡命名 Artificial Intelligence</strong>，AI 成为独立学科的标志。</span></div></div>
  <div class="tl-item"><span class="tl-year">1957</span><div class="tl-body"><b>感知机 Perceptron</b><span>Rosenblatt 提出，单层网络无法解决异或问题。1958 年 LISP 语言诞生。</span></div></div>
  <div class="tl-item"><span class="tl-year">1959</span><div class="tl-body"><b>塞缪尔与机器学习</b><span>西洋跳棋程序通过自我对弈提升棋力，「机器学习」一词由此推广。</span></div></div>
  <div class="tl-item"><span class="tl-year">1966</span><div class="tl-body"><b>ELIZA 聊天程序</b><span>靠话术套路让人误以为它理解自己，是图灵测试局限性的经典例证。</span></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">1980s</span><div class="tl-body"><b>专家系统商业化 + 联结主义复兴</b><span>DEC 的 XCON/R1 进入企业，知识工程形成产业。1986 年 Rumelhart、Hinton、Williams 在《Nature》发表 BP 论文，多层网络终于能训练。1987 年国际人工神经网络学会成立。</span></div></div>
  <div class="tl-item"><span class="tl-year">1990s</span><div class="tl-body"><b>统计学习崛起</b><span>SVM、隐马尔可夫模型、贝叶斯网络。1997 年深蓝战胜卡斯帕罗夫。</span></div></div>
  <div class="tl-item"><span class="tl-year">2006</span><div class="tl-body"><b>深度信念网络</b><span>Hinton 在《Science》提出逐层预训练，深度学习序幕。</span></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">2012</span><div class="tl-body"><b>AlexNet</b><span>ImageNet 竞赛错误率大幅下降，CNN 引爆计算机视觉，第三次浪潮开始。</span></div></div>
  <div class="tl-item"><span class="tl-year">2014</span><div class="tl-body"><b>生成对抗网络 GAN</b><span>生成器与判别器对抗训练，AIGC 的里程碑。</span></div></div>
  <div class="tl-item"><span class="tl-year">2016</span><div class="tl-body"><b>AlphaGo</b><span>深度强化学习 + 蒙特卡洛树搜索战胜李世石。</span></div></div>
  <div class="tl-item"><span class="tl-year">2017</span><div class="tl-body"><b>Transformer</b><span>《Attention Is All You Need》，自注意力机制取代递归。</span></div></div>
  <div class="tl-item"><span class="tl-year">2022→</span><div class="tl-body"><b>ChatGPT / Sora / o1 / DeepSeek</b><span>大语言模型走向大众，推理模型与智能体成为新方向。2025 年 DeepSeek 引发全球关注。</span></div></div>
</div>
<div class="note note--key"><strong>三句话一起背</strong>：思想起点 1950 图灵 → 学科起点 1956 达特茅斯 → 产业爆发 2012 之后深度学习。<br><strong>人物陷阱</strong>：图灵 1954 年已去世，<span class="hl">不可能参加 1956 年的会议</span>。命名者是麦卡锡，他也是 LISP 发明者、1971 年图灵奖得主。</div>`
    },
    {
      id: 'pillars',
      title: '三大技术基石：算力 × 数据 × 算法',
      kicker: '乘性关系',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-chip.jpg" alt="算力是三大基石之一：芯片与硬件支撑起大规模计算" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>算力是三大基石之一：芯片与硬件支撑起大规模计算</figcaption></figure>

<p>三者是<strong>缺一不可的乘性关系</strong>，任何一项为零，结果就是零。政策支持、资本投入属于外部条件；隐私伦理属于约束项；它们都不是技术基石。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">基石一</span><h4 class="card-t">算力突破</h4><p class="card-b">GPU/TPU 的大规模并行矩阵运算，把「上百层、上万亿参数」从不可能变成可承担。通用 GPU 灵活，专用 ASIC 能效更高。</p></div>
  <div class="card"><span class="card-k">基石二</span><h4 class="card-t">海量数据</h4><p class="card-b">互联网沉淀的文本、图像、行为日志是预训练的燃料。数据规模上去后过拟合被抑制，模型学到通用表示，摆脱死记硬背。</p></div>
  <div class="card"><span class="card-k">基石三</span><h4 class="card-t">算法创新</h4><p class="card-b">反向传播、CNN/RNN 的结构先验、注意力机制、预训练与指令微调，把算力和数据转化成可用能力。</p></div>
</div>
<div class="tbl"><table>
<caption>课件给出的芯片算力对照（单位 TFLOPS）</caption>
<thead><tr><th>芯片</th><th>算力</th><th>类型</th></tr></thead>
<tbody>
<tr><td>谷歌 TPU v7p</td><td class="num">2307</td><td>专用 ASIC</td></tr>
<tr><td>壁仞 BR100</td><td class="num">1024</td><td>通用 GPU</td></tr>
<tr><td>英伟达 H100</td><td class="num">990</td><td>通用 GPU</td></tr>
<tr><td>华为昇腾 910D</td><td class="num">512</td><td>专用 NPU</td></tr>
<tr><td>寒武纪 MLU590</td><td class="num">314.6</td><td>专用 NPU</td></tr>
</tbody></table></div>
<p><strong>数据规模</strong>：2025 年全国数据产量 52.26 ZB，占全球 27.44%。单位阶梯 KB → MB → GB → TB → PB → EB → ZB → YB，每级 1024 倍。数据分结构化（表格、数据库）与非结构化（文本、图像、音视频），后者占绝大多数，也正是大模型的主食。</p>
<p><strong>模型</strong>可以写成 <span class="katex-inline">\\(y = f(x)\\)</span>：参数就像收音机上的旋钮，训练就是把成千上万个旋钮拧到合适位置。</p>`
    },
    {
      id: 'paradigm',
      title: '四种学习范式：看标签从哪来',
      kicker: '高频判定',
      html: `
<p>判定口诀：<strong>全有标签 → 监督；全没标签 → 无监督；一点有加上的一大堆没有 → 半监督；环境给奖惩 → 强化</strong>。再加一条：没有人工标签但<strong>自己设计辅助任务</strong>造标签 → 自监督。</p>
<div class="tbl"><table>
<thead><tr><th>范式</th><th>监督信号来源</th><th>训练数据</th><th>典型算法与任务</th><th>本章对应题</th></tr></thead>
<tbody>
<tr><td><strong>监督学习</strong></td><td>人工标注的 y</td><td>全部带标签</td><td>线性回归、决策树、SVM；分类与回归</td><td>第 19 题</td></tr>
<tr><td><strong>无监督学习</strong></td><td>数据自身结构</td><td>全部无标签</td><td>K-Means、DBSCAN、PCA、关联规则</td><td>第 18、19 题</td></tr>
<tr><td><strong>半监督学习</strong></td><td>少量 y + 大量无标签数据的分布</td><td>少量标注 + 大量未标注</td><td>伪标签自训练、一致性正则、图半监督</td><td>第 2 题</td></tr>
<tr><td><strong>自监督学习</strong></td><td>从数据本身自动构造</td><td>无标签，有辅助任务</td><td>BERT 掩码预测、GPT 下一词预测、MAE、SimCLR 对比学习</td><td>第 15 题</td></tr>
<tr><td><strong>强化学习</strong></td><td>环境反馈的奖励与惩罚</td><td>无标签，有交互轨迹</td><td>Q-Learning、策略梯度、PPO、AlphaGo</td><td>第 9、21 题</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>最容易纠结的一组</strong>：无监督与自监督都没有人工标签。区别在于无监督<strong>直接找数据固有结构</strong>（聚类、降维），自监督<strong>刻意构造一个预测型辅助任务</strong>。题干一旦出现「辅助任务 / 预训练任务 / 自己造标签 / 掩码预测 / 对比学习」，一律选自监督。</div>
<div class="note"><strong>半监督的适用前提</strong>：标注成本高、未标注数据易获取。医学影像是教科书级案例——一张片子要副主任医师以上阅片写报告，标注极贵；而医院 PACS 系统里沉淀着海量未标注片子。它依赖平滑假设与聚类假设：同类样本在特征空间中彼此靠近。假设不成立时，伪标签会把错误放大。</div>`
    },
    {
      id: 'models',
      title: '深度阵营与传统阵营',
      kicker: '镜像题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch1-multimodal.jpg" alt="多模态大模型：文本、图像、音频统一接入 LLM 处理" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>多模态大模型：文本、图像、音频统一接入 LLM 处理</figcaption></figure>

<div class="duo">
  <div class="duo-col"><h4>深度学习模型</h4><p class="duo-sub">多层可微模块堆叠 + 反向传播端到端训练</p><ul>
    <li><strong>CNN</strong> 卷积神经网络 → 网格 / 图像，局部卷积、权值共享、池化</li>
    <li><strong>RNN</strong> 循环神经网络 → 序列 / 时序，隐状态递归，LSTM/GRU 门控</li>
    <li><strong>GNN</strong> 图神经网络 → 图 / 关系，邻域消息传递与聚合</li>
    <li><strong>Transformer</strong> → 序列与几乎万物，自注意力、并行、位置编码</li>
    <li>深度信念网络、自编码器</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>传统机器学习模型</h4><p class="duo-sub">单层或浅层结构，多数有闭式解或明确统计假设</p><ul>
    <li><strong>线性回归</strong> <span class="katex-inline">\\(y = w^{T}x + b\\)</span>，单层线性、无隐藏层、无激活函数</li>
    <li>逻辑回归（名字带回归，实为线性分类器）</li>
    <li>支持向量机 SVM</li>
    <li>决策树、随机森林</li>
    <li>K 近邻 KNN、朴素贝叶斯</li>
    <li>K-Means、PCA</li>
  </ul></div>
</div>
<div class="note note--key"><strong>两题互为镜像</strong>：第 16 题问「哪个不是深度学习模型」，答案是线性回归；第 20 题把线性回归换成 Transformer，于是四项全选。<br><strong>两个维度别串台</strong>：线性回归<span class="hl">是监督学习，但不是深度学习</span>；聚类<span class="hl">是无监督学习</span>。</div>
<p><strong>CNN 为什么主攻图像</strong>：局部感受野对应「边缘纹理由局部像素构成」；权值共享让同一个核扫完整张图，参数量不随分辨率爆炸，并获得平移等变性（猫在左边还是右边都能认出）；池化与层级堆叠形成「边缘 → 部件 → 语义对象」的层次表示。文本主流用 RNN/Transformer，语音主流用 Conformer 与语音 Transformer，视频需要额外建模时间维。题干有「主要」二字，选最教科书的那一个。</p>`
    },
    {
      id: 'trend',
      title: '趋势、政策与挑战',
      kicker: '拓展',
      html: `
<div class="cards">
  <div class="card"><span class="card-k">技术趋势</span><h4 class="card-t">推理模型与智能体</h4><p class="card-b">思维链加强化学习让模型「先想再答」；Agent 从演示走向产品化，能调用工具、分步完成复杂任务。RLHF（基于人类反馈的强化学习）用人类偏好训练奖励模型，再指导生成。</p></div>
  <div class="card"><span class="card-k">产业数据</span><h4 class="card-t">2025 年成绩单</h4><p class="card-b">核心产业规模 1.2 万亿元，企业超 6000 家，生成式 AI 用户 5.15 亿，智能眼镜出货 178 万副，国内人形机器人产品超 330 款。</p></div>
  <div class="card"><span class="card-k">政策脉络</span><h4 class="card-t">从写入报告到专项行动</h4><p class="card-b">2024 年 3 月「人工智能+」写入政府工作报告；2025 年 8 月国务院发布深入实施意见；2026 年 1 月工信部等八部门提出建设 1000 个工业智能体、100 个数据集、500 个应用场景。</p></div>
  <div class="card"><span class="card-k">风险挑战</span><h4 class="card-t">数据与偏见</h4><p class="card-b">2014 年剑桥大学科根通过「这是你的数字化生活」应用，从 2.7 万名参与者扩展到约 5000 万用户数据。人脸识别对女性与深色人种的识别率显著偏低，根源是训练数据不均衡。详见第 8 章。</p></div>
</div>
<div class="note"><strong>多模态</strong>指融合不同感知通道的数据：图像（二维像素网格）、文本（离散符号序列）、语音（连续声波）、视频（时空帧序列加音轨）。语音与文本虽然都承载语言，但编码方式与模型结构不同，属于两个模态。代表工作有 CLIP、GPT-4V、Whisper。</div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 4.5,
      stem: '金融行业更可能被生成式人工智能重塑的主要原因是（　）',
      opts: ['金融市场波动频繁', '数据密集型和语言相关任务多', '客户服务需求量大', '投资决策复杂度高'],
      ans: 'B',
      why: '<p>生成式 AI 的能力内核是「理解语言 + 生成内容 + 基于知识做归纳改写」。判断一个行业是否会被重塑，看它的日常工作流里有多少环节是文本、知识、对话形态。</p><p>金融业高度集中在这类任务上：研报摘要、招股书与合规文件、合同审阅、监管报送、财报问答、客服话术、营销文案、会议纪要、代码与 SQL 生成，既数据密集又语言任务密集。</p><ul><li>A：市场波动带来的是数值预测与风控需求，恰恰不是生成式模型的强项。</li><li>C：客服只是 B 的一个子场景，覆盖面窄，且传统规则机器人也能解决。</li><li>D：复杂度高反而暴露幻觉、可解释性不足、责任归属不清等短板，意味着实际应用更审慎。</li></ul>',
      point: '生成式 AI 的能力边界与行业适配性',
      anchor: '有文字、有知识、有对话的地方，先被大模型改写'
    },
    {
      n: 2, type: 'single', score: 4.5,
      stem: '在以下场景中最适合使用半监督学习的是（　）',
      opts: ['银行需要分析用户交易数据以检测欺诈行为（所有数据均带有标签）', '医院希望利用少量已标注的医学影像和大量未标注影像训练疾病诊断模型', '电商平台需根据用户浏览记录推荐商品（完全无标签）', '自动驾驶汽车实时调整行驶路径以避免碰撞'],
      ans: 'B',
      why: '<p>半监督学习的定义是「少量人工标注样本 + 大量未标注样本」，用未标注数据的分布结构辅助提升泛化。适用前提是标注成本高、未标注数据易获取，医学影像正是典型案例。</p><ul><li>A：全部带标签，直接用监督学习。</li><li>C：完全无标签，属于无监督学习或自监督、协同过滤范畴。</li><li>D：实时避障是感知—决策—环境反馈的闭环，属于强化学习与控制规划。</li></ul>',
      point: '按标注情况判定学习范式',
      anchor: '一点有标签加上一大堆没标签 = 半监督'
    },
    {
      n: 3, type: 'single', score: 4.5,
      stem: '人工智能发展的三大核心学派不包括以下哪一项？（　）',
      opts: ['符号主义', '联结主义', '行为主义', '进化主义'],
      ans: 'D',
      why: '<p>三大核心学派固定为符号主义（符号表示加逻辑推理）、联结主义（大量简单单元的连接与权重学习）、行为主义（感知与动作反馈）。</p><p>进化主义指遗传算法、进化策略、进化编程，属于计算智能与受生物启发的优化方法分支，常与模糊逻辑、人工生命并列讨论，不在三大学派之列。</p>',
      point: '三大学派的名称与归属',
      anchor: '看到「进化主义」基本就是那个排除项'
    },
    {
      n: 4, type: 'single', score: 4.5, reconstructed: true,
      stem: '本轮 AI 崛起的三大技术基石是（　）',
      opts: ['政策支持、人才储备、资本投入', '摩尔定律、5G、量子计算', '数据隐私、伦理规范、开源社区', '算力突破、海量数据、算法创新'],
      ans: 'D',
      why: '<p>三者是缺一不可的乘性关系：算力让深层网络可训练，数据提供燃料并抑制过拟合，算法把前两者转化成可用能力。</p><ul><li>A：产业发展的外部条件，不直接决定模型能力。</li><li>B：摩尔定律是背景规律且已放缓，5G 解决传输，量子计算尚未成为主流训练基础设施。</li><li>C：治理与生态，隐私伦理是约束项，开源社区是加速器。</li></ul>',
      point: '算力 × 数据 × 算法三角',
      anchor: '技术基石只认这三样，其余都是外部条件'
    },
    {
      n: 5, type: 'single', score: 4.5, reconstructed: true,
      stem: '20 世纪 80 年代 AI 的核心技术突破是（　）',
      opts: ['专家系统的商业化应用', '深度强化学习', '卷积神经网络 CNN', '生成对抗网络 GAN'],
      ans: 'A',
      why: '<p>1980 年代 DEC 的 XCON/R1 配置系统进入企业，各类诊断型专家系统形成「知识工程」产业热潮，这是那个年代的主导性突破。同期 1986 年 BP 算法被重新推广，联结主义开始复兴。</p><ul><li>B：深度强化学习在 2013 年 DQN 之后，2016 年 AlphaGo 达到高峰。</li><li>C：LeNet 属早期原型，大规模成熟在 2012 年 AlexNet 之后。</li><li>D：GAN 提出于 2014 年。</li></ul>',
      point: '用时间线定位年代标志性成果',
      anchor: '80 年代的主角是知识加规则的专家系统'
    },
    {
      n: 6, type: 'single', score: 4.5, reconstructed: true,
      stem: '图灵测试首次提出的标志性文献是（　）',
      opts: ['《计算机器与智能》Computing Machinery and Intelligence', '《达特茅斯会议提案》', '《控制论》', '《感知器》'],
      ans: 'A',
      why: '<p>1950 年图灵在哲学期刊 Mind 发表《Computing Machinery and Intelligence》，提出模仿游戏。</p><ul><li>B：1955 年麦卡锡、明斯基、香农、罗切斯特的研讨会提案，首次使用 Artificial Intelligence 一词。</li><li>C：维纳 1948 年《控制论》，奠定反馈与自组织思想。</li><li>D：Rosenblatt 的感知器，1957 至 1958 年。</li></ul>',
      point: '年份、文献、人物三者配对',
      anchor: '1950 图灵，1956 达特茅斯，两组不要互换'
    },
    {
      n: 7, type: 'single', score: 4.5, reconstructed: true,
      stem: '图灵测试提出的主要目的是（　）',
      opts: ['验证计算机计算速度', '判断机器是否具有人类水平的智能', '优化机器学习算法性能', '测试硬件稳定性'],
      ans: 'B',
      why: '<p>图灵的巧思在于回避定义、改用行为判据：如果测试者通过纯文本对话无法区分对面是人还是机器，就承认它具有智能。这是把形而上问题转成可实验的问题。</p><ul><li>A、D：属于计算机基准测试与硬件工程范畴。</li><li>C：属于算法评测，图灵测试不优化任何算法。</li></ul><p>它的局限是只测语言行为、结果主观、通过测试不等于真正理解，但「主要目的」仍是判定智能。</p>',
      point: '图灵测试的操作主义本质',
      anchor: '图灵测试判智能，不判速度也不判硬件'
    },
    {
      n: 8, type: 'single', score: 4.5, reconstructed: true,
      stem: 'AI 作为独立学科正式诞生的标志是（　）',
      opts: ['图灵提出图灵测试', '达特茅斯会议的召开', 'ENIAC 诞生', '深度学习算法被提出'],
      ans: 'B',
      why: '<p>1956 年夏达特茅斯学院为期约两个月的研讨会，首次正式使用 Artificial Intelligence 名称，聚集了该领域的奠基者。有了名字、共同议题与研究共同体，学界以它作为学科起点。</p><ul><li>A：1950 年图灵测试是思想先声，当时没有学科建制与命名。</li><li>C：ENIAC 是通用电子计算机硬件里程碑，提供计算工具。</li><li>D：深度学习在 2006 与 2012 年之后成为主流，是学科内部的第三次浪潮。</li></ul>',
      point: '思想起点与学科起点的区分',
      anchor: '思想 1950，学科 1956，产业 2012'
    },
    {
      n: 9, type: 'single', score: 4.5, reconstructed: true,
      stem: 'AlphaGo 成功主要依赖的方法是（　）',
      opts: ['监督学习', '强化学习', '联邦学习', '多模态学习'],
      ans: 'B',
      why: '<p>AlphaGo 先用人类职业棋谱做监督学习初始化策略网络，再用自我对弈加策略梯度的强化学习持续优化，并训练价值网络评估局面，对弈时结合蒙特卡洛树搜索。</p><p>关键突破来自自我对弈：它让模型跳出人类棋谱的天花板。AlphaGo Zero 完全移除人类棋谱，纯靠强化学习自对弈反而更强，直接坐实主要依赖强化学习。</p><ul><li>A：只是冷启动手段。</li><li>C：联邦学习解决数据不出域的联合训练。</li><li>D：围棋是单一棋盘状态，不涉及多模态。</li></ul>',
      point: '强化学习的识别特征',
      anchor: '环境给奖励、智能体试错改策略 = 强化学习'
    },
    {
      n: 10, type: 'single', score: 4.5, reconstructed: true,
      stem: '反向传播算法成熟应用推动的时期是（　）',
      opts: ['1950 年代符号主义', '1980 年代联结主义复兴', '1990 年代知识工程', '2010 年代深度学习爆发'],
      ans: 'B',
      why: '<p>BP 思想可追到 Werbos 1974 年的博士论文，真正让它普及并点燃研究热潮的是 1986 年 Rumelhart、Hinton、Williams 在《Nature》发表的论文，它解决了「隐藏层怎么学」，直接带来 1980 年代联结主义复兴。</p><ul><li>A：50 年代主导是符号与逻辑，单层感知器无法解决异或。</li><li>C：90 年代主线是统计学习，神经网络因算力数据不足进入低潮。</li><li>D：2010 年代是 BP 结出的果实，不是算法成熟应用发生的时点。</li></ul>',
      point: '方法被采纳的转折时点',
      anchor: '看到 1986、Rumelhart、Hinton 就锁定 80 年代'
    },
    {
      n: 11, type: 'single', score: 4.5,
      stem: '人工智能（AI）的概念最早由哪位科学家在 1956 年的达特茅斯会议上提出？',
      opts: ['艾伦·图灵', '约翰·麦卡锡', '马文·明斯基', '赫伯特·西蒙'],
      ans: 'B',
      why: '<p>麦卡锡是 1955 年提案的主笔与 1956 年会议的主要组织者，造出并推广了 Artificial Intelligence 术语，被称为 AI 之父，同时是 LISP 发明者、1971 年图灵奖得主。</p><ul><li>A：图灵 1954 年已去世，不可能参加 1956 年会议，这是本题最常见的陷阱。</li><li>C：明斯基是核心参与者，与 Papert 合著《感知器》指出单层网络局限。</li><li>D：西蒙提出有限理性与通用问题求解器 GPS，1975 年图灵奖、1978 年诺贝尔经济学奖。</li></ul>',
      point: '术语命名者的唯一归属',
      anchor: '达特茅斯是集体事件，命名者只有麦卡锡'
    },
    {
      n: 12, type: 'single', score: 4.5,
      stem: '深度学习中的循环神经网络主要用于处理哪种类型的数据？',
      opts: ['图像数据', '文本数据', '语音数据', '视频数据'],
      ans: 'B',
      why: '<p>循环神经网络（RNN）的核心结构是<strong>隐藏状态沿时间步传递</strong>，让模型保留前面输入的信息，专门对付<strong>序列数据</strong>——元素之间有先后顺序、前后依赖的数据。文本是序列数据最典型的代表：一句话里的词按序出现，「苹果」的意思要看前文，所以 RNN 及其变体 LSTM、GRU 长期是自然语言处理的主力模型。</p><ul><li>A：图像是二维网格，用 CNN 的局部感受野与权值共享处理，见第 13 题。</li><li>C：语音虽也是序列，但教科书问「主要」时首推文本，语音主流链路是 RNN-CTC、Conformer。</li><li>D：视频需额外建模时间维，用 3D CNN 或 Video Transformer，属扩展场景。</li></ul>',
      point: '模型与数据结构的匹配：RNN 对应序列数据',
      anchor: 'RNN 有「记忆」，专管有先后顺序的文本序列'
    },
    {
      n: 13, type: 'single', score: 4.5,
      stem: '深度学习中的卷积神经网络主要用于处理哪种类型的数据？',
      opts: ['图像数据', '文本数据', '语音数据', '视频数据'],
      ans: 'A',
      why: '<p>CNN 的三个结构先验天然贴合二维网格：局部感受野对应边缘纹理由局部像素构成；权值共享让参数量不随分辨率爆炸并获得平移等变性；池化与层级堆叠形成边缘到部件到语义对象的层次表示。</p><ul><li>B：文本主流是 RNN 与 Transformer，TextCNN 属借用。</li><li>C：语音主流链路是 RNN-CTC、Conformer、语音 Transformer。</li><li>D：视频需额外建模时间维，用 3D CNN 或 Video Transformer，是扩展场景。</li></ul>',
      point: '模型与数据结构的匹配',
      anchor: '题干有「主要」二字，选最教科书的那一个'
    },
    {
      n: 14, type: 'multi', score: 3.5,
      stem: '多模态学习融合了哪些数据模态？',
      opts: ['图像', '文本', '语音', '视频'],
      ans: 'ABCD',
      why: '<p>模态指信息的载体与感知通道，只要来自不同通道、表示形式不同就构成不同模态。图像是二维像素网格，文本是离散符号序列，语音是连续声波，视频是时空帧序列加音轨，四者都在覆盖范围内。</p><p>常见误区是认为语音和文本都承载语言所以算一个模态。语音是连续波形、文本是离散 token，编码方式与相互匹配的难度都不同，恰恰是经典跨模态组合。实际系统还可以有点云、深度图、传感器时序、生理信号、表格。</p>',
      point: '模态的定义与范围',
      anchor: '图、文、音、视频全选，另有传感器与点云'
    },
    {
      n: 15, type: 'single', score: 4.5,
      stem: '以下哪种学习方式允许模型在没有人工标签的情况下，通过设计辅助任务进行自我学习？',
      opts: ['监督学习', '无监督学习', '半监督学习', '自监督学习'],
      ans: 'D',
      why: '<p>题眼是「没有人工标签」与「设计辅助任务」两句同时成立，这是自监督学习的标准定义：监督信号从数据本身自动构造，不花人工标注。例如 BERT 掩码预测、GPT 下一词预测、MAE 图像块重建、SimCLR 对比学习。</p><ul><li>A：每条样本都要人工给的 y，违反前提。</li><li>B：确实无标签，但直接找数据固有结构，不刻意构造预测型辅助任务，这是最容易纠结的一项。</li><li>C：需要少量人工标签，与「没有人工标签」冲突。</li></ul>',
      point: '自监督与无监督的边界',
      anchor: '出现辅助任务、掩码预测、对比学习，一律选自监督'
    },
    {
      n: 16, type: 'single', score: 4.5,
      stem: '深度学习可以通过构建多层次神经网络来模拟人脑神经网络的结构和功能，以下哪种模型不属于深度学习模型？',
      opts: ['线性回归', '卷积神经网络', '循环神经网络', '图神经网络'],
      ans: 'A',
      why: '<p>判定标准是多层次、非线性变换、端到端表示学习。CNN 卷积层堆叠、RNN 时间步展开加门控、GNN 多轮消息传递，都是深度模型。</p><p>线性回归 <span class="katex-inline">\\(y = w^{T}x + b\\)</span> 单层、线性、无隐藏层、无激活函数，有闭式解（最小二乘），属于传统统计学习。同类非深度模型还有逻辑回归、SVM、决策树、随机森林、KNN、朴素贝叶斯、K-Means、PCA。</p>',
      point: '深度模型的判定标准',
      anchor: '与第 20 题互为镜像：换掉线性回归就变成全选'
    },
    {
      n: 17, type: 'single', score: 4.5,
      stem: '半监督学习特别适用于哪种场景？',
      opts: ['标记数据丰富', '未标记数据丰富', '完全没有标记数据', '数据量极少'],
      ans: 'B',
      why: '<p>半监督学习的定义是「<strong>少量标注样本 + 大量未标注样本</strong>」，用未标注数据的分布结构辅助提升泛化。它的适用前提是：<strong>标注成本高</strong>（需要专家、耗时、涉隐私），而<strong>未标注数据很容易大量获取</strong>。因此「未标记数据丰富」正是它大显身手的场景。</p><ul><li>A：标记数据丰富时直接用监督学习即可，用不着半监督。</li><li>C：完全没有标记，只能做无监督学习（聚类、降维）或自监督学习。</li><li>D：数据量极少时，无论监督还是半监督都难以学到可靠规律。</li></ul>',
      point: '按标注情况判定学习范式',
      anchor: '一点有标签加上一大堆没标签 = 半监督'
    },
    {
      n: 18, type: 'single', score: 4.5,
      stem: '无监督学习的优点在于？',
      opts: ['无需标注数据', '模型预测效果好', '适用于标记数据丰富的场景', '验证模型效果简单'],
      ans: 'A',
      why: '<p>无监督学习只给 X 不给 y，让模型自己发现簇、低维流形、频繁模式、异常点。最硬的优势是省掉标注成本，由此还能发现人没预设过的未知模式，常作为预训练、特征学习、降维、异常检测的前置步骤。</p><ul><li>B：没有显式目标去逼近正确答案，效果不必然好。</li><li>C：标记数据丰富时应优先用监督学习把标签用起来。</li><li>D：恰恰因为没有真实标签，验证最难，只能用轮廓系数、重构误差等内部指标。</li></ul>',
      point: '无监督学习的优势与代价',
      anchor: '无监督：省标注、能探索、难评估'
    },
    {
      n: 19, type: 'single', score: 4.5,
      stem: '监督学习是利用已标记的数据训练模型，以下哪种算法不属于监督学习算法？',
      opts: ['线性回归', '聚类', '决策树', '支持向量机'],
      ans: 'B',
      why: '<p>监督学习的判据是每条训练样本为 (x, y)，模型学 x 到 y 的映射，任务是分类或回归。线性回归拟合连续 y，决策树做分类或回归，SVM 找最大间隔分类面，都需要标签。</p><p>聚类（K-Means、DBSCAN、层次聚类、GMM）输入只有 x，按相似度自动分组，组号不是预先给定的标签，属于无监督。同属无监督的还有 PCA、隐狄利克雷分配、关联规则 Apriori。</p>',
      point: '监督与无监督的算法归属',
      anchor: '线性回归是监督学习但不是深度学习，两个维度不要混淆'
    },
    {
      n: 20, type: 'multi', score: 3.5,
      stem: '深度学习是机器学习的一个特定分支，主要用于处理大规模的数据和复杂的任务，以下哪些模型属于深度学习模型？',
      opts: ['卷积神经网络', '循环神经网络', '图神经网络', 'Transformer 模型'],
      ans: 'ABCD',
      why: '<p>四项都是多层可微模块堆叠加反向传播端到端训练的典型代表：CNN 对应网格与图像，RNN 对应序列与时序，GNN 对应图与关系，Transformer 靠自注意力、并行与位置编码，几乎通吃。</p><p>Transformer 由 2017 年《Attention Is All You Need》提出，摒弃递归，是 BERT、GPT 与大语言模型的基座，也外溢到视觉 ViT、语音与多模态。</p>',
      point: '深度阵营清单',
      anchor: 'CNN、RNN、GNN、Transformer 四个全选'
    },
    {
      n: 21, type: 'multi', score: 3.5,
      stem: '以下哪些属于机器学习中常见的学习方式？',
      opts: ['监督学习', '无监督学习', '半监督学习', '强化学习'],
      ans: 'ABCD',
      why: '<p>四种基础范式按监督信号来源排成一条轴：人工标注的 y、数据自身结构、少量 y 加大量无标签分布、环境反馈的奖励。四项都是标准教材的基础分类。</p><p>自监督、迁移学习、联邦学习、主动学习、集成学习也属于常见训练策略，但它们是扩展或交叉范式。多选题出现「常见」二字，四个基础项通常就是全选。</p>',
      point: '四大基础学习范式',
      anchor: '监督、无监督、半监督、强化，四个全选'
    },
    {
      n: 22, type: 'single', score: 4.5,
      stem: '人工智能的核心技术之一，使计算机能够通过数据进行学习并持续改进的是？',
      opts: ['机器学习', '深度学习', '计算机视觉', '自然语言处理'],
      ans: 'A',
      why: '<p>这句话正是<strong>机器学习的标准定义</strong>：让计算机从数据中自动学得规律，并用新数据持续优化性能，而不靠人显式编写每条规则。机器学习是 AI 的<strong>方法论核心</strong>，深度学习只是它的一个分支（用多层神经网络做表示学习）。</p><ul><li>B：深度学习是机器学习的子集，题干说的是更基础、更普适的那一层。</li><li>C：计算机视觉是「让机器看懂图像」的应用方向，不是通过数据学习这件事本身。</li><li>D：自然语言处理是「让机器读懂语言」的应用方向，同理排除。</li></ul>',
      point: '机器学习的定义与它在 AI 中的层级',
      anchor: '「通过数据学习并改进」= 机器学习的定义句'
    },
    {
      n: 23, type: 'single', score: 4.5,
      stem: '以下哪项技术不是人工智能的关键技术？',
      opts: ['机器学习', '深度学习', '区块链', '自然语言处理'],
      ans: 'C',
      why: '<p>AI 关键技术谱系是机器学习（方法论核心）→ 深度学习（当前主流分支）→ 各应用方向（计算机视觉、自然语言处理、语音、机器人、知识工程）。</p><p>区块链本质是分布式账本加共识机制加密码学，解决多方互不信任时如何记账、不可篡改，属于分布式系统与信息安全领域。它常与 AI 组合使用（数据溯源、版权存证、联邦学习激励），但「能和 AI 结合」不等于「属于 AI 技术」。</p>',
      point: 'AI 关键技术的判断标准',
      anchor: '是否让机器具备感知、学习、推理、生成或决策能力'
    }
  ],
  bonus: [
    {
      n: 101, type: 'single', source: '课件自测',
      stem: '以下哪种人工智能定义强调「数据驱动下的学习和任务执行能力」？',
      opts: ['2020 年中国人工智能产业发展联盟的定义', '2021 年 ISO/IEC 的定义', '2022 年 Meta 公司的定义', '2023 年英伟达的定义'],
      ans: 'C',
      why: '<p>课件第 14 页原题。2022 年 Meta 的定义把重点放在数据驱动的学习与任务执行能力上；2020 年联盟定义强调智能科学与工程，2021 年 ISO/IEC 强调系统解释外部数据并灵活适应，2023 年英伟达强调理解与生成多种内容。</p>',
      point: '四种权威定义的侧重点',
      anchor: 'Meta 2022 = 数据驱动'
    },
    {
      n: 102, type: 'single', source: '课件自测',
      stem: '以下哪项不属于人工智能按能力划分的分类？',
      opts: ['弱人工智能', '强人工智能', '通用人工智能', '自然人工智能'],
      ans: 'D',
      why: '<p>按能力划分为弱人工智能 ANI、强人工智能（通用人工智能 AGI）、超人工智能 ASI。「自然人工智能」是编造词，自然界存在的是人类智能与动物智能，它们不属于人工智能的分类。</p>',
      point: 'ANI / AGI / ASI 三级',
      anchor: '看到「自然人工智能」直接排除'
    }
  ]
});