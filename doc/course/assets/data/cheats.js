/* 速查手册 · 跨章节检索用 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.cheats.push(
  {
    id: 'formula',
    title: '公式速查',
    kicker: '考前五分钟扫一遍',
    hue: '#2f6bff',
    html: `
<div class="tbl"><table class="formula-tbl">
<thead><tr><th>名称</th><th>公式</th><th>用来做什么</th><th>章节</th></tr></thead>
<tbody>
<tr><td>神经元输出</td><td><span class="katex-inline">\\(f\\left(\\sum_i w_i x_i + b\\right)\\)</span></td><td>加权求和后过激活函数</td><td>3</td></tr>
<tr><td>梯度下降更新</td><td><span class="katex-inline">\\(w \\leftarrow w - \\eta\\,\\partial L/\\partial w\\)</span></td><td>沿负梯度方向走一步，学习率控制步长</td><td>3</td></tr>
<tr><td>卷积输出尺寸</td><td><span class="katex-inline">\\(\\left\\lfloor (H+2P-K)/S \\right\\rfloor + 1\\)</span></td><td>算特征图边长；输出通道数等于卷积核个数</td><td>3</td></tr>
<tr><td>LSTM 细胞状态</td><td><span class="katex-inline">\\(C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde C_t\\)</span></td><td>遗忘门加输入门，缓解梯度消失</td><td>3</td></tr>
<tr><td>自注意力</td><td><span class="katex-inline">\\(\\mathrm{softmax}(QK^{\\top}/\\sqrt{d_k})V\\)</span></td><td>任意两位置直接算相关性，路径长度 O(1)</td><td>3 · 5</td></tr>
<tr><td>最小二乘法</td><td><span class="katex-inline">\\(\\min \\sum (y_i - (wx_i+b))^2\\)</span></td><td>线性回归找最佳拟合线的准则</td><td>2</td></tr>
<tr><td>Sigmoid</td><td><span class="katex-inline">\\(\\sigma(z)=1/(1+e^{-z})\\)</span></td><td>把实数压到 (0,1)，逻辑回归输出概率</td><td>2</td></tr>
<tr><td>归一化</td><td><span class="katex-inline">\\(x'=(x-x_{\\min})/(x_{\\max}-x_{\\min})\\)</span></td><td>缩放到 0 至 1，消除量纲差异</td><td>2</td></tr>
<tr><td>标准化</td><td><span class="katex-inline">\\(x'=(x-\\mu)/\\sigma\\)</span></td><td>变成均值 0 方差 1，适合含离群值的数据</td><td>2</td></tr>
<tr><td>欧氏距离</td><td><span class="katex-inline">\\(d=\\sqrt{\\sum_j (x_j-\\mu_j)^2}\\)</span></td><td>K-means 与 KNN 衡量样本相似度</td><td>2</td></tr>
<tr><td>簇内平方误差和</td><td><span class="katex-inline">\\(J=\\sum_k \\sum_{x \\in C_k} \\lVert x-\\mu_k \\rVert^2\\)</span></td><td>K-means 最小化的目标函数</td><td>2</td></tr>
<tr><td>贝叶斯公式</td><td><span class="katex-inline">\\(P(C\\mid X)=P(X\\mid C)P(C)/P(X)\\)</span></td><td>由证据反推类别的后验概率</td><td>2</td></tr>
<tr><td>TF-IDF</td><td><span class="katex-inline">\\(\\mathrm{TF}\\times\\mathrm{IDF}\\)</span></td><td>词频乘逆文档频率，压低「的」这类通用词</td><td>5</td></tr>
<tr><td>VAE 两个分布</td><td><span class="katex-inline">\\(q_\\phi(z\\mid x)\\;\\to\\;p_\\theta(x\\mid z)\\)</span></td><td>编码器学后验，解码器学似然</td><td>6</td></tr>
</tbody></table></div>`
  },
  {
    id: 'metrics',
    title: '评估指标怎么选',
    kicker: '第二章高频计算题',
    hue: '#00c2a8',
    html: `
<div class="duo">
  <div class="duo-col">
    <h4>混淆矩阵</h4>
    <table class="cm">
      <thead><tr><th></th><th>预测正类</th><th>预测负类</th></tr></thead>
      <tbody>
        <tr><th>实际正类</th><td class="good">TP 真正例</td><td class="bad">FN 假负例<br>漏报</td></tr>
        <tr><th>实际负类</th><td class="bad">FP 假正例<br>误报</td><td class="good">TN 真负例</td></tr>
      </tbody>
    </table>
  </div>
  <div class="duo-col duo-col--alt">
    <h4>四个指标</h4>
    <ul>
      <li><strong>准确率</strong> <span class="katex-inline">\\((TP+TN)/\\text{总数}\\)</span>：整体对了多少，类别极不均衡时会骗人</li>
      <li><strong>精确率</strong> <span class="katex-inline">\\(TP/(TP+FP)\\)</span>：预测为正的里面真的有多少，看列</li>
      <li><strong>召回率</strong> <span class="katex-inline">\\(TP/(TP+FN)\\)</span>：实际为正的里面抓到多少，看行</li>
      <li><strong>F1</strong> <span class="katex-inline">\\(2PR/(P+R)\\)</span>：精确率与召回率的调和平均</li>
    </ul>
  </div>
</div>
<div class="tbl"><table>
<thead><tr><th>场景</th><th>该盯哪个</th><th>原因</th></tr></thead>
<tbody>
<tr><td>疾病筛查、地震预警</td><td class="good">召回率</td><td>漏掉一个真病人代价极大，宁可多误报</td></tr>
<tr><td>垃圾邮件拦截、推荐推送</td><td class="good">精确率</td><td>把正常邮件判为垃圾代价大，宁可漏一些</td></tr>
<tr><td>正负样本数量接近</td><td>准确率</td><td>整体正确率有代表性</td></tr>
<tr><td>正样本只占百分之一</td><td class="bad">准确率失效</td><td>全判负类也有 99% 准确率</td></tr>
<tr><td>回归任务拟合好坏</td><td>R² 决定系数</td><td>越接近 1 拟合越好，与分类指标不通用</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>算题口诀</strong>：精确率的分母是<strong>预测</strong>正类总数，召回率的分母是<strong>实际</strong>正类总数。看到「预测为患病的人里有多少真患病」用精确率，看到「所有真患病的人里查出多少」用召回率。</div>`
  },
  {
    id: 'rules',
    title: '判别口诀',
    kicker: '看到关键词就能选',
    hue: '#ffb020',
    html: `
<div class="tbl"><table>
<thead><tr><th>题干出现</th><th>直接对应</th><th>章节</th></tr></thead>
<tbody>
<tr><td>给出了具体步骤「先直走再左转」</td><td>面向指令的导航</td><td>7</td></tr>
<tr><td>给出了终点「去厨房」</td><td>面向目标的导航</td><td>7</td></tr>
<tr><td>给出了状态或愿望「我困了」「想放松」</td><td>面向需求的导航</td><td>7</td></tr>
<tr><td>多轮聊天中需求逐步明确</td><td>基于对话的导航</td><td>7</td></tr>
<tr><td>只输出文本</td><td>LLM</td><td>7</td></tr>
<tr><td>看图说话、图像加文本问答</td><td>VLM</td><td>7</td></tr>
<tr><td>要动手、要执行物理动作</td><td>VLA</td><td>7</td></tr>
<tr><td>按语言指令找路</td><td>VLN</td><td>7</td></tr>
<tr><td>有标签、学输入到输出的映射</td><td>监督学习</td><td>2</td></tr>
<tr><td>无标签、发现内在结构</td><td>无监督学习</td><td>2</td></tr>
<tr><td>与环境交互、靠奖励信号</td><td>强化学习</td><td>2 · 7</td></tr>
<tr><td>生成全新内容</td><td>AIGC 生成式 AI</td><td>6</td></tr>
<tr><td>文生图、跨模态</td><td>输入文本输出图像</td><td>6</td></tr>
<tr><td>医疗、金融、司法 + 可解释性</td><td>需求最强</td><td>8</td></tr>
<tr><td>问「主要挑战」「危害」</td><td>选负面选项，正面项全排除</td><td>8</td></tr>
<tr><td>问「怎样保持主体性」</td><td>批判性评估加自身判断</td><td>8</td></tr>
<tr><td>问「不属于」「不包括」</td><td>找与事实相反或表述绝对化的那一项</td><td>1 · 6 · 8</td></tr>
<tr><td>从人身上读取情绪状态</td><td>情感识别</td><td>8</td></tr>
<tr><td>机器表演出情绪</td><td>情感模拟或生成</td><td>8</td></tr>
<tr><td>「完全无法」「所有」「100%」</td><td>通常是错误选项</td><td>6 · 8</td></tr>
</tbody></table></div>`
  },
  {
    id: 'pairs',
    title: '易混对照',
    kicker: '两组词只差一个字',
    hue: '#ff2d78',
    html: `
<div class="tbl"><table>
<thead><tr><th>左</th><th>右</th><th>分界线</th></tr></thead>
<tbody>
<tr><td>VLM</td><td>VLA</td><td>是否输出<strong>动作</strong>。只描述图像是 VLM，要控制机器人是 VLA</td></tr>
<tr><td>VLN</td><td>VLA</td><td>VLN 限定<strong>导航</strong>任务，VLA 是通用动作执行</td></tr>
<tr><td>精确率</td><td>召回率</td><td>分母是预测正类还是实际正类</td></tr>
<tr><td>过拟合</td><td>欠拟合</td><td>训练好测试差是过拟合；两边都差是欠拟合</td></tr>
<tr><td>词干提取</td><td>词形还原</td><td>粗暴砍词尾可能不是真词；查词典还原成规范词形</td></tr>
<tr><td>CBOW</td><td>Skip-gram</td><td>上下文猜中心词 / 中心词猜上下文</td></tr>
<tr><td>BERT</td><td>GPT</td><td>双向编码器做理解 / 单向解码器做生成</td></tr>
<tr><td>GAN</td><td>VAE</td><td>对抗博弈画质锐利但训练不稳 / 概率编码稳定但偏模糊</td></tr>
<tr><td>RAG</td><td>微调</td><td>外挂知识库随时更新 / 改模型权重需重新训练</td></tr>
<tr><td>语义分割</td><td>实例分割</td><td>同类物体是否区分个体</td></tr>
<tr><td>目标检测</td><td>图像分类</td><td>是否给出位置框</td></tr>
<tr><td>双目视觉</td><td>结构光</td><td>几十米室外受光照影响 / 0.1 至 5 米室内细节好但怕强光</td></tr>
<tr><td>决策透明</td><td>可解释性</td><td>像查账追溯过程 / 像翻译解释结论</td></tr>
<tr><td>情感识别</td><td>情感操纵</td><td>读取状态 / 利用情感诱导用户</td></tr>
<tr><td>符号主义</td><td>联结主义</td><td>显式规则与知识推理 / 神经网络从数据学权重</td></tr>
<tr><td>分析式 AI</td><td>生成式 AI</td><td>分类回归预测 / 创造新内容</td></tr>
</tbody></table></div>`
  }
);

window.STUDY.glossary = [
  { term: 'AI', full: 'Artificial Intelligence', def: '人工智能。1956 年达特茅斯会议由麦卡锡命名。', ch: 1 },
  { term: 'ML', full: 'Machine Learning', def: '机器学习，AI 的子集，从数据中学习规律。', ch: 1 },
  { term: 'DL', full: 'Deep Learning', def: '深度学习，ML 的子集，用多层神经网络。包含关系 AI ⊃ ML ⊃ DL。', ch: 1 },
  { term: 'AGI', full: 'Artificial General Intelligence', def: '通用人工智能，能跨领域完成人类水平的任务，尚未实现。', ch: 1 },
  { term: 'Accuracy', full: '准确率', def: '(TP+TN)/总数。整体对了多少，类别极不均衡时会高估性能。', ch: 2 },
  { term: 'Precision', full: '精确率', def: 'TP/(TP+FP)。预测为正的样本里真的有多少，竖着看混淆矩阵的预测列。怕误报时盯它。', ch: 2 },
  { term: 'Recall', full: '召回率', def: 'TP/(TP+FN)。实际为正的样本里抓到多少，横着看混淆矩阵的真实行。怕漏报时盯它。', ch: 2 },
  { term: 'F1', full: 'F1 Score', def: '2PR/(P+R)，精确率与召回率的调和平均。两者相差越大，F1 被拉得越低。', ch: 2 },
  { term: '混淆矩阵', full: 'Confusion Matrix', def: 'TP 真正例、FP 假正例（误报）、FN 假负例（漏报）、TN 真负例四个格子，是所有分类指标的源头。', ch: 2 },
  { term: 'ROC', full: 'Receiver Operating Characteristic', def: '以假正例率为横轴、真正例率为纵轴画出的曲线，用来观察阈值变化时的表现。', ch: 2 },
  { term: 'AUC', full: 'Area Under Curve', def: 'ROC 曲线下的面积，越接近 1 越好，0.5 相当于随机猜测。', ch: 2 },
  { term: 'MSE', full: 'Mean Squared Error', def: '均方误差，残差平方的平均。对大误差惩罚重，是线性回归的优化目标。', ch: 2 },
  { term: 'MAE', full: 'Mean Absolute Error', def: '平均绝对误差，残差绝对值的平均，对离群值没有 MSE 那么敏感。', ch: 2 },
  { term: 'R²', full: 'Coefficient of Determination', def: '决定系数，模型解释掉的方差占比，越接近 1 拟合越好，可以为负。', ch: 2 },
  { term: 'K-means', full: 'K 均值聚类', def: '无监督聚类，最小化簇内平方误差和。K 需要事先指定，标签取值 0 到 K−1，用前先标准化。', ch: 2 },
  { term: 'KNN', full: 'K-Nearest Neighbors', def: 'K 近邻，按距离找出最近的 K 个样本投票或取平均，属于有标签的监督学习。', ch: 2 },
  { term: 'One-hot', full: '独热编码', def: '一个类别展开成多列 0/1，任意两列互相正交，适合无序类别，代价是维度变高。', ch: 2 },
  { term: 'Ordinal', full: '序数编码', def: '一列整数表示类别次序，适合有大小关系的类别，缺点是给无序类别强加了距离。', ch: 2 },
  { term: '过拟合', full: 'Overfitting', def: '训练集表现好、测试集表现差，模型把噪声也记住了。对策是更多数据、正则化、Dropout、早停。', ch: 2 },
  { term: 'ANN', full: 'Artificial Neural Network', def: '人工神经网络，由神经元加权求和加激活函数堆叠而成。', ch: 3 },
  { term: 'BP', full: 'Back Propagation', def: '反向传播。1986 年 Rumelhart、Hinton、Williams 在《Nature》发表，让多层网络可训练。', ch: 3 },
  { term: 'CNN', full: 'Convolutional Neural Network', def: '卷积神经网络，局部连接加权值共享，处理网格结构数据如图像。', ch: 3 },
  { term: 'RNN', full: 'Recurrent Neural Network', def: '循环神经网络，隐藏状态沿时间传递，处理序列数据。', ch: 3 },
  { term: 'LSTM', full: 'Long Short-Term Memory', def: '长短期记忆网络，用遗忘门、输入门、输出门缓解梯度消失。', ch: 3 },
  { term: 'GRU', full: 'Gated Recurrent Unit', def: '门控循环单元，LSTM 的简化版本。', ch: 3 },
  { term: 'GCN', full: 'Graph Convolutional Network', def: '图卷积网络，处理节点与边构成的图结构数据。', ch: 3 },
  { term: 'ReLU', full: 'Rectified Linear Unit', def: '修正线性单元，取零与输入中的较大值，缓解梯度消失。', ch: 3 },
  { term: 'Transformer', full: 'Transformer', def: '完全基于自注意力的结构，抛弃循环与卷积，任意两位置直接算相关性，可大规模并行。', ch: 3 },
  { term: '学习率', full: 'Learning Rate', def: '梯度下降每一步的步长。过大来回震荡甚至发散，过小收敛极慢。', ch: 3 },
  { term: '梯度消失', full: 'Vanishing Gradient', def: '深层网络反向传播时梯度连乘越来越小，靠前层几乎学不动。Sigmoid 导数上限只有 0.25 是典型诱因。', ch: 3 },
  { term: 'Dropout', full: 'Dropout', def: '训练时随机丢弃一部分神经元，迫使网络不依赖个别单元，是一种正则化手段。', ch: 3 },
  { term: '残差连接', full: 'Residual Connection', def: '把输入直接加到输出上，让梯度有一条捷径回传，使很深的网络仍然可训练。', ch: 3 },
  { term: 'CV', full: 'Computer Vision', def: '计算机视觉，让机器看懂图像与视频。', ch: 4 },
  { term: 'RGB', full: 'Red Green Blue', def: '加色模型，用于显示器与摄像头等发光设备。', ch: 4 },
  { term: 'CMYK', full: 'Cyan Magenta Yellow Key', def: '减色模型，用于印刷等反射光场景。', ch: 4 },
  { term: 'HSV', full: 'Hue Saturation Value', def: '色调、饱和度、明度，贴近人类描述颜色的方式，便于按颜色分割。', ch: 4 },
  { term: 'LoG', full: 'Laplacian of Gaussian', def: '高斯拉普拉斯算子，先平滑再求二阶导，尺度参数越大检测的结构越粗。', ch: 4 },
  { term: 'NLP', full: 'Natural Language Processing', def: '自然语言处理，让机器读懂人类语言。', ch: 5 },
  { term: 'BoW', full: 'Bag of Words', def: '词袋模型，按词表统计词频，忽略词序。', ch: 5 },
  { term: 'TF-IDF', full: 'Term Frequency - Inverse Document Frequency', def: '词频乘逆文档频率，衡量词对文档的区分能力。', ch: 5 },
  { term: 'NER', full: 'Named Entity Recognition', def: '命名实体识别，常用 BIO 标注配合 BiLSTM-CRF。', ch: 5 },
  { term: 'BERT', full: 'Bidirectional Encoder Representations from Transformers', def: '双向编码器，用掩码语言模型与下一句预测预训练，擅长理解类任务。', ch: 5 },
  { term: 'GPT', full: 'Generative Pre-trained Transformer', def: '单向解码器，自回归预测下一个词元，擅长生成类任务。', ch: 5 },
  { term: 'Token', full: '词元', def: '模型处理文本的最小单位，可以是一个字、一个词或一个子词片段，计费与上下文长度都按它算。', ch: 5 },
  { term: 'Embedding', full: '嵌入表示', def: '把词、句子或图像映射成稠密向量，语义相近的对象在向量空间里距离也近。', ch: 5 },
  { term: 'AIGC', full: 'AI Generated Content', def: '人工智能生成内容，自动生成文本、图像、音频、视频。', ch: 6 },
  { term: 'GAN', full: 'Generative Adversarial Network', def: '生成对抗网络，2014 年提出，生成器与判别器对抗训练。', ch: 6 },
  { term: 'VAE', full: 'Variational Auto-Encoder', def: '变分自编码器，编码器学潜在变量分布，解码器重构数据。', ch: 6 },
  { term: 'CLIP', full: 'Contrastive Language-Image Pre-training', def: '图文对比预训练模型，文生图中负责把文本编码成词元嵌入。', ch: 6 },
  { term: 'RAG', full: 'Retrieval-Augmented Generation', def: '检索增强生成，先查外部知识库再让模型作答，缓解知识过时与幻觉。', ch: 6 },
  { term: 'RLHF', full: 'Reinforcement Learning from Human Feedback', def: '基于人类反馈的强化学习，用奖励模型给输出打分，引导模型生成符合人类偏好的回答。', ch: 6 },
  { term: 'RM', full: 'Reward Model', def: '奖励模型，评估大模型输出文本质量并给出分数。', ch: 6 },
  { term: 'Agent', full: 'Intelligent Agent', def: '智能体，能自主感知环境、做出决策并执行行动以实现目标。', ch: 6 },
  { term: 'CoT', full: 'Chain of Thought', def: '思维链，让模型分步推理，是提示工程的重要原则。', ch: 6 },
  { term: 'Prompt', full: '提示词', def: '给模型的输入指令。写清角色、任务、约束与输出格式，必要时给示例，能显著改变结果质量。', ch: 6 },
  { term: '幻觉', full: 'Hallucination', def: '模型生成看似流畅可信、实际与事实或给定材料不符的内容。RAG、引用溯源与人工复核是主要对策。', ch: 6 },
  { term: '扩散模型', full: 'Diffusion Model', def: '先逐步加噪把数据破坏成纯噪声，再训练网络逐步去噪还原，是当前文生图的主流路线。', ch: 6 },
  { term: '微调', full: 'Fine-tuning', def: '在预训练模型基础上用领域数据继续训练，让通用能力适配具体任务。', ch: 6 },
  { term: 'EAI', full: 'Embodied Artificial Intelligence', def: '具身智能，智能需要一个身体与一个可交互的世界。', ch: 7 },
  { term: 'LLM', full: 'Large Language Model', def: '大语言模型，纯文本理解与生成。', ch: 7 },
  { term: 'VLM', full: 'Vision-Language Model', def: '视觉语言模型，图像加文本的多模态理解。', ch: 7 },
  { term: 'VLA', full: 'Vision-Language-Action', def: '视觉语言动作模型，在 VLM 基础上增加动作输出，用于具身控制。', ch: 7 },
  { term: 'VLN', full: 'Vision-Language Navigation', def: '视觉语言导航，按语言指令结合视觉信息到达目标。', ch: 7 },
  { term: 'TOF', full: 'Time of Flight', def: '飞行时间测距，量光往返时间，实时性好但像素密度较低。', ch: 7 },
  { term: 'RL', full: 'Reinforcement Learning', def: '强化学习，智能体与环境交互，靠奖励信号学最优策略。', ch: 7 },
  { term: 'MDP', full: 'Markov Decision Process', def: '马尔可夫决策过程，由状态、动作、转移、奖励构成。', ch: 7 },
  { term: '信息茧房', full: 'Information Cocoons', def: '桑斯坦提出的概念：推荐系统只喂用户爱看的内容，视野越收越窄，判断力与主体性被削弱。', ch: 8 },
  { term: 'XAI', full: 'Explainable AI', def: '可解释人工智能，目的是可理解、可审计、可问责、可信任。', ch: 8 },
  { term: 'Grad-CAM', full: 'Gradient-weighted Class Activation Mapping', def: '激活热力图，高亮显示模型决策的重要依据。', ch: 8 },
  { term: 'COMPAS', full: 'Correctional Offender Management Profiling for Alternative Sanctions', def: '再犯风险预测系统，对黑人与白人的误判率差异是算法偏见的经典证据。', ch: 8 },
  { term: 'GDPR', full: 'General Data Protection Regulation', def: '欧盟通用数据保护条例，剑桥分析事件后被严格执行。', ch: 8 },
  { term: 'CCPA', full: 'California Consumer Privacy Act', def: '美国加州消费者隐私法案。', ch: 8 },
  { term: 'FTC', full: 'Federal Trade Commission', def: '美国联邦贸易委员会，2020 年与 Facebook 达成 50 亿美元和解。', ch: 8 },
  { term: 'SAE', full: 'Society of Automotive Engineers', def: '国际汽车工程师协会，制定自动驾驶分级体系。', ch: 8 },
  { term: 'EDR', full: 'Event Data Recorder', def: '行车事件记录器，记录事故前后的车辆运行数据。', ch: 8 },
  { term: 'DMS', full: 'Driver Monitoring System', def: '驾驶员状态监测系统，监测分心与疲劳。', ch: 8 },
  { term: 'SER', full: 'Speech Emotion Recognition', def: '语音情感识别，融合原始音频、MFCC 与梅尔谱三种模态。', ch: 8 },
  { term: 'MFCC', full: 'Mel-Frequency Cepstral Coefficients', def: '梅尔频率倒谱系数，语音处理常用声学特征。', ch: 8 },
  { term: 'AU', full: 'Action Unit', def: '面部动作单元，如皱眉 AU4、闭眼 AU43，用于疼痛表情识别。', ch: 8 },
  { term: 'Deepfake', full: 'Deep Fake', def: '深度伪造。2025 年第一季度全球相关诈骗损失达 2 亿美元。', ch: 8 }
];