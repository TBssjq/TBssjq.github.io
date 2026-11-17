/* 第 3 章 · 智能的觉醒：深度学习模型与应用 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 3,
  title: '智能的觉醒',
  subtitle: '深度学习模型与应用',
  hue: '#00c2a8',
  glyph: '03',
  tagline: '五种网络，五种数据结构',
  exam: {
    name: '第三章测验',
    due: '2026-11-21T23:59:00+08:00',
    rule: '单选 13 道 × 8 分',
    note: '答案串 B B C B B B B A C B B B C。建议分四组记忆：训练机制（1–3）、CNN 与尺寸（4–6、13）、RNN 家族（7–8、12）、GCN 与 Transformer（9–11）。'
  },
  lead: '本章把「神经网络」拆成五种具体结构。复习时抓住一条主线：数据长什么样，就用什么网络——网格用 CNN，序列用 RNN，图用 GCN，长序列与跨模态用 Transformer。计算题只有卷积输出尺寸与参数量两类，公式背熟即可满分。',
  sections: [
    {
      id: 'neuron',
      title: '从生物神经元到人工神经元',
      kicker: '起点',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch3-neuron.jpg" alt="多层神经网络：输入层、隐藏层、输出层的信息传递" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>多层神经网络：输入层、隐藏层、输出层的信息传递</figcaption></figure>

<div class="duo">
  <div class="duo-col"><h4>生物神经元</h4><ul>
    <li><strong>树突</strong>：分支状，接收其他神经元的输入信号</li>
    <li><strong>细胞体</strong>：控制中心，整合信息并决定是否激活</li>
    <li><strong>轴突</strong>：把处理后的信号传递给下一个神经元或目标组织</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>人工神经元</h4><ul>
    <li><strong>输入</strong>对应树突，接收前一层信号</li>
    <li><strong>加权求和加偏置</strong>对应细胞体处理</li>
    <li><strong>激活函数</strong>对应轴突输出，引入非线性并决定是否激活</li>
  </ul></div>
</div>
<div class="formula">\\[\\text{输出} = \\text{激活函数}\\left(\\sum_i (\\text{输入}_i \\times \\text{权重}_i) + \\text{偏置}\\right)\\]</div>
<p>多个神经元分层连接就构成网络：<strong>输入层</strong>接收数据，<strong>隐藏层</strong>逐层提取特征，<strong>输出层</strong>给出结果。前馈神经网络是最基础的形态，数据从前向后单向流动、无反馈连接。</p>`
    },
    {
      id: 'bp',
      title: 'BP 与梯度下降：网络怎么学',
      kicker: '第 1、3 题',
      html: `
<div class="steps">
  <li><b>前向传播</b>：数据从输入层经隐藏层到输出层，得到预测值。</li>
  <li><b>计算损失</b>：用损失函数衡量预测与真实值的差距，如均方误差、交叉熵。</li>
  <li><b>反向传播</b>：利用链式法则从输出层向输入层逐层计算损失对每个权重与偏置的偏导数。</li>
  <li><b>参数更新</b>：优化器沿负梯度方向调整参数，使损失下降。</li>
  <li><b>迭代</b>：重复上述四步，直到损失收敛或达到轮次上限。</li>
</div>
<div class="formula">\\[w_{new}=w_{old}-\\eta\\,\\frac{\\partial L}{\\partial w}\\qquad b_{new}=b_{old}-\\eta\\,\\frac{\\partial L}{\\partial b}\\]</div>
<div class="note note--key"><strong>三个必须分清的点</strong><br>① BP 本身<span class="hl">只算梯度，不更新参数</span>，更新由优化器（SGD、Adam）完成；两者共同服务于「最小化损失函数」。<br>② 公式里的<span class="hl">减号</span>：梯度指向损失上升最快的方向，参数沿负梯度走才是下降。<br>③ 梯度计算顺序是输出层到隐藏层，但<span class="hl">参数更新通常在所有梯度算完后统一进行</span>，同一轮迭代使用同一份旧参数。</div>
<p>学习率 <span class="katex-inline">\\(\\eta\\)</span> 控制步长：过大导致震荡甚至发散，过小导致收敛缓慢。权重初始化（Xavier、He）是训练前的独立步骤，与 BP 无关；全零初始化会引发对称性问题。隐藏层数量属于结构设计，训练中不会改变。</p>
<p><strong>应用案例 MNIST 手写体识别</strong>：输入 28×28 像素灰度图像，隐藏层 100 个神经元，输出层 10 个神经元对应数字 0 到 9。训练流程为数据准备 → 前向传播 → 计算损失 → 反向传播与权重更新；评估用准确率、召回率、F1 分数。</p>`
    },
    {
      id: 'activation',
      title: '激活函数与梯度消失、梯度爆炸',
      kicker: '第 2、7 题',
      html: `
<p>梯度消失的根源是链式法则中的<strong>连乘效应</strong>：误差逐层回传时反复乘以激活函数的导数，若导数恒小于 1，层数一多梯度就指数级衰减，浅层参数几乎不更新。</p>
<div class="tbl"><table>
<thead><tr><th>激活函数</th><th>导数特性</th><th>梯度消失风险</th><th>备注</th></tr></thead>
<tbody>
<tr><td><strong>Sigmoid</strong></td><td><span class="katex-inline">\\(\\sigma'(x)=\\sigma(x)(1-\\sigma(x))\\)</span>，最大值仅 <strong>0.25</strong></td><td class="bad">最高</td><td>输入稍大或稍小就进入饱和区。5 层回传梯度上界约 <span class="katex-inline">\\(0.25^5\\approx 10^{-3}\\)</span></td></tr>
<tr><td>Tanh</td><td>导数最大值 1，零中心</td><td>较高</td><td>两端同样饱和，理论上也会消失，但比 Sigmoid 轻。若题目改为多选，B 与 D 都应入选</td></tr>
<tr><td><strong>ReLU</strong></td><td>x&gt;0 时导数恒为 1</td><td class="good">低</td><td>缓解梯度消失的常用方案，代价是可能出现死亡 ReLU</td></tr>
<tr><td>Leaky ReLU</td><td>负半轴保留小斜率（如 0.01）</td><td class="good">低</td><td>既避免神经元死亡，也不造成连乘衰减</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>治法配对，考试高频</strong><br><span class="hl">梯度消失</span> → 换 ReLU 系激活、加残差连接、批归一化、门控结构（LSTM / GRU）。<br><span class="hl">梯度爆炸</span> → 梯度裁剪、权重正则、合理初始化。<br>梯度裁剪对消失无效：小梯度裁了还是小。</div>
<p><strong>LSTM 为什么能治消失</strong>：原生 RNN 的隐藏状态反复乘同一个权重矩阵 <span class="katex-inline">\\(W_{hh}\\)</span>，时间步一长就出现连乘衰减。LSTM 引入细胞状态 <span class="katex-inline">\\(C_t\\)</span> 这条近似线性的信息高速路：</p>
<div class="formula">\\[C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t\\]</div>
<p>遗忘门、输入门、输出门控制信息的写入与读出。当遗忘门接近 1 时，梯度可以近乎无损地沿时间回传，从而建模长期依赖。GRU 是同一思路的简化版，效率更高。</p>`
    },
    {
      id: 'cnn',
      title: 'CNN 三件套：卷积、池化、全连接',
      kicker: '第 4、5、6、13 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch3-conv.jpg" alt="卷积运算示意：卷积核在输入图像上滑动，生成特征图" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>卷积运算示意：卷积核在输入图像上滑动，生成特征图</figcaption></figure>

<div class="cards cards--3">
  <div class="card"><span class="card-k">第一职责</span><h4 class="card-t">卷积层：提特征</h4><p class="card-b">卷积核（3×3、5×5 的小矩阵）在局部感受野上滑动加权求和。浅层提取边缘、颜色、纹理，深层组合出形状、部件乃至语义。每个核生成一张特征图，多个核并行提取不同特征。</p></div>
  <div class="card"><span class="card-k">第二职责</span><h4 class="card-t">池化层：降尺寸</h4><p class="card-b">最大池化取窗口最大值，保留最显著特征、增强鲁棒性；平均池化取窗口平均值，平滑特征但可能丢失局部显著信息。<strong>池化不改变通道数，只压缩宽与高</strong>，从而提升效率并抑制过拟合。</p></div>
  <div class="card"><span class="card-k">第三职责</span><h4 class="card-t">全连接层：做分类</h4><p class="card-b">把特征图展平成一维向量，将低级特征组合成高级特征，实现从特征空间到类别标签的映射，用于最终分类或回归。参数量巨大。</p></div>
</div>
<p><strong>彩色图像怎么卷积</strong>：RGB 三个通道分别与对应的卷积核运算，生成三张独立特征图，再把三个结果在相同位置累加求和，输出一张综合特征图。所以每个卷积核其实是 3×3×3 的立体张量，深度必须与输入通道数一致。</p>
<div class="note note--key"><strong>CNN 为什么适合图像</strong>：图像有两个先验——局部相关性（相邻像素关系紧密）与平移不变性（同一模式出现在哪里都该被识别）。局部连接只连一小块区域，权值共享让同一个核扫完整张图，于是<span class="hl">参数量只与卷积核大小和个数有关，与输入分辨率无关</span>。<br><strong>课件对比算例</strong>：32×32×3 的图像接 1000 神经元的全连接层，参数约 3072×1000 ≈ 300 万；而 12 个 3×3×3 卷积核仅 12×27+12 = <strong>336</strong> 个参数，相差近万倍。</div>
<h4 class="sub-h">两类计算题</h4>
<div class="formula">\\[H_{out}=\\left\\lfloor\\frac{H_{in}+2P-K}{S}\\right\\rfloor+1 \\qquad \\text{输出通道数}=\\text{卷积核个数}\\]</div>
<p>其中 K 是核大小、P 是填充、S 是步长。例：输入 32×32×3，12 个 3×3 核，无填充、步长 1 → 尺寸 (32−3)/1+1 = 30，通道 12 → <strong>30×30×12</strong>。保持尺寸需要 padding=1 配合 3×3 核（same 卷积）。参数量 12×(27+1) = 336，含偏置。</p>
<div class="note"><strong>逐项排除的常见陷阱</strong>：卷积本身是线性运算，非线性来自激活函数；降分辨率主要靠池化或 stride&gt;1 的卷积；批量归一化稳定分布、加速收敛，<span class="hl">不改变张量形状</span>；全连接层是维度重组，不是特征图下采样。</div>`
    },
    {
      id: 'flower',
      title: '案例：花卉分类的完整网络',
      kicker: '课件案例',
      html: `
<p>收集 5 类常见花卉共 <strong>4317 张</strong>图像，做归一化、像素值标准化与数据增强。挑战在于类间差异微小、类内差异显著。模型通过三次卷积—池化组合逐步提取和压缩特征，测试集准确率 <strong>99% 以上</strong>，显著优于 BP 网络。</p>
<div class="tbl"><table>
<thead><tr><th>层</th><th>配置</th><th>作用</th></tr></thead>
<tbody>
<tr><td>输入层</td><td>IMG_SIZE × IMG_SIZE，灰度化</td><td>统一尺寸与通道</td></tr>
<tr><td>卷积层 1</td><td>16 个 3×3 核，ReLU</td><td>提取初级特征</td></tr>
<tr><td>池化层 1</td><td>最大池化 2×2，步长 2</td><td>特征图尺寸减半</td></tr>
<tr><td>卷积层 2</td><td>32 个 3×3 核，ReLU</td><td>深化特征提取</td></tr>
<tr><td>池化层 2</td><td>最大池化 2×2</td><td>进一步压缩维度</td></tr>
<tr><td>卷积层 3</td><td>64 个 3×3 核，ReLU</td><td>提取高层语义特征</td></tr>
<tr><td>池化层 3</td><td>最大池化 2×2</td><td>最终空间下采样</td></tr>
<tr><td>展平层</td><td>三维张量展开为一维向量</td><td>准备全连接处理</td></tr>
<tr><td>全连接层</td><td>128 个神经元，ReLU</td><td>高级特征组合</td></tr>
<tr><td>Dropout 层</td><td>0.5 概率随机失活</td><td>防止过拟合</td></tr>
<tr><td>输出层</td><td>5 个单元，Softmax</td><td>生成类别概率分布</td></tr>
</tbody></table></div>
<div class="note"><strong>规律</strong>：越往深层，特征图空间尺寸越小、通道数越多（16 → 32 → 64）。空间信息被逐步压缩成语义信息，这是 CNN 的通用设计模式。</div>`
    },
    {
      id: 'rnn',
      title: 'RNN 家族：让网络有记忆',
      kicker: '第 7、8、12 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch3-rnn.jpg" alt="RNN 按时间步展开：隐藏状态 h 在不同时刻间传递，形成「记忆」" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>RNN 按时间步展开：隐藏状态 h 在不同时刻间传递，形成「记忆」</figcaption></figure>

<div class="formula">\\[h_t = f\\big(W_{xh}x_t + W_{hh}h_{t-1} + b\\big)\\qquad y_t = g(W_{hy}h_t)\\]</div>
<p>隐藏状态 <span class="katex-inline">\\(h_t\\)</span> 就是网络的<strong>短期记忆</strong>：它既含当前输入，也压缩了此前所有历史，从而把时序信息沿时间传递下去。输出层通过全连接与激活函数，把最后一个时间步的隐藏状态转化为任务输出。</p>
<div class="note note--key"><strong>两个必记性质</strong><br>① RNN 可处理<span class="hl">变长序列</span>（配合 padding 与 mask），这是它相对全连接网络的优势。<br>② 所有时间步<span class="hl">共享同一组权重</span> <span class="katex-inline">\\(W_{xh}, W_{hh}, W_{hy}\\)</span>，BPTT 中梯度对各步求和后统一更新。若每步独立参数，既无法泛化到不同长度，参数量也会随时间步线性增长。</div>
<div class="tbl"><table>
<thead><tr><th>变体</th><th>结构特点</th><th>解决什么</th><th>代价</th></tr></thead>
<tbody>
<tr><td>原生 RNN</td><td>单一隐藏状态递归</td><td>时序建模的基本形态</td><td>长序列梯度消失，记不住远处信息</td></tr>
<tr><td><strong>LSTM</strong></td><td>细胞状态 + 遗忘门、输入门、输出门</td><td>长期依赖、梯度消失</td><td>参数多、计算慢</td></tr>
<tr><td>GRU</td><td>更新门 + 重置门，合并细胞状态与隐藏状态</td><td>同 LSTM，效率更高</td><td>表达能力略弱</td></tr>
<tr><td><strong>Bi-RNN</strong></td><td>前向层与后向层输出拼接</td><td>同时利用过去与未来上下文</td><td>参数约 2 倍、训练更慢、需要完整序列，不适合严格实时流式生成</td></tr>
</tbody></table></div>
<p><strong>Bi-RNN 的典型场景</strong>：命名实体识别、词性标注、机器翻译的编码器、语音识别。判断「我 昨天 在 南京 吃 了 …」中某个词的词性时，既能看到上文也能看到下文。</p>
<div class="note"><strong>课件案例：降雨径流预测</strong>。收集 16 年气象数据（降雨量、蒸散发量、气温、径流观测），预处理与归一化后构建输入层、循环层、输出层，引入 LSTM 解决梯度消失与长期依赖。评估用 MSE、RMSE、R²，对比预测值与真实值曲线分析泛化能力。传统方法在处理这类非线性关系时受限，RNN 提供了新思路，对水资源管理意义重大。</div>`
    },
    {
      id: 'gcn',
      title: 'GCN：邻居数量不固定怎么办',
      kicker: '第 9 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch3-gcn.jpg" alt="图神经网络：聚合邻居节点信息，适应邻居数量不固定的图结构" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>图神经网络：聚合邻居节点信息，适应邻居数量不固定的图结构</figcaption></figure>

<p><strong>为什么引入图卷积</strong>：图像中每个像素的邻居数量固定（3×3 窗口就是 8 个），固定尺寸卷积核可以直接用。图结构中每个节点的邻居数量动态变化，固定卷积核无法适配，于是改用<strong>可学习的聚合方式</strong>。</p>
<div class="steps">
  <li><b>邻域聚合</b>：每个节点收集邻居节点的特征。例如节点 C 整合邻居 E 与 D 的特征，通过平均或拼接计算。</li>
  <li><b>线性变换</b>：聚合后的特征经全连接层权重 W 处理，增强表达能力。</li>
  <li><b>非线性激活</b>：加入 ReLU 等激活函数，映射到非线性空间，生成最终节点特征表示。</li>
  <li><b>多层堆叠</b>：层数增加，节点能捕捉更广泛的上下文关系，信息范围逐层扩展。</li>
</div>
<div class="note note--key"><strong>判断标准只有一条</strong>：样本之间是否存在<span class="hl">不规则的拓扑连接</span>。<br>适合 GCN：社交网络用户分类（用户是节点、好友是边）、分子结构属性预测（原子是节点、化学键是边）、推荐系统用户—物品二部图（LightGCN）。<br>最不适合：<span class="hl">CIFAR-10 图像分类</span>——它是规则网格，邻域固定、顺序固定，用 CNN 最自然高效。理论上可以把像素强行构图，但属于杀鸡用牛刀。</div>
<p><strong>课件案例：Cora 论文引用网络</strong>。节点代表论文，边表示引用关系，特征向量描述论文内容。利用逆矩阵 <span class="katex-inline">\\(D^{-1/2}\\)</span> 做归一化保证稳定性与收敛性，经过三层图卷积逐步融合节点及邻居信息，再输入分类神经网络，预测论文所属领域（人工智能、数据库等）。</p>`
    },
    {
      id: 'transformer',
      title: 'Transformer：注意力就是全部',
      kicker: '第 10、11 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch3-attn.jpg" alt="注意力机制：序列中任意两个位置可直接建立关联" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>注意力机制：序列中任意两个位置可直接建立关联</figcaption></figure>

<p>Transformer 采用<strong>编码器—解码器</strong>架构：编码器把输入序列转换为特征向量矩阵 Z，解码器根据 Z 逐步生成输出序列。它摒弃递归，纯靠注意力，因此可以并行处理整个序列。</p>
<div class="formula">\\[\\text{Attention}(Q,K,V)=\\text{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V\\]</div>
<div class="cards">
  <div class="card"><span class="card-k">机制一</span><h4 class="card-t">自注意力 Self-Attention</h4><p class="card-b">每个位置与序列中所有位置直接计算相关性权重，任意两个词元之间的信息路径长度为 <strong>O(1)</strong>；RNN 需逐步传递，路径长度 O(n)，长距离信息易被稀释。课件例句「我 明天 返回 南京」中，「返回」与「南京」的关联被直接建模。缩放因子 <span class="katex-inline">\\(\\sqrt{d_k}\\)</span> 防止点积过大让 softmax 进入饱和区。</p></div>
  <div class="card"><span class="card-k">机制二</span><h4 class="card-t">多头注意力</h4><p class="card-b">多组独立的 Q/K/V 投影，让模型在不同子空间同时关注不同关系（语法、指代、语义），增强捕捉复杂依赖的能力。</p></div>
  <div class="card"><span class="card-k">机制三</span><h4 class="card-t">位置编码</h4><p class="card-b">自注意力把输入看作集合，打乱顺序输出只是相应置换（置换等变），模型本身不知道谁先谁后。位置编码显式注入空间或时序信息，与词向量相加后送入各层。原始论文用正弦余弦编码，后续有可学习位置嵌入、RoPE、ALiBi。</p></div>
  <div class="card"><span class="card-k">机制四</span><h4 class="card-t">编码器与解码器堆叠</h4><p class="card-b">编码器每层含 Self-Attention 与 Feed Forward；解码器每层含 Self-Attention、<strong>Encoder-Decoder Attention</strong> 与 Feed Forward，后者负责动态关联源句与目标序列，实现上下文感知的翻译。</p></div>
</div>
<div class="formula">\\[PE_{(pos,\\,2i)}=\\sin\\!\\left(\\frac{pos}{10000^{2i/d}}\\right)\\qquad PE_{(pos,\\,2i+1)}=\\cos\\!\\left(\\frac{pos}{10000^{2i/d}}\\right)\\]</div>
<div class="note note--warn"><strong>三个常见误判</strong><br>① 自注意力计算复杂度为 <span class="katex-inline">\\(O(n^2)\\)</span>，长序列反而更贵；Transformer 的优势是<span class="hl">可并行</span>，不是单纯减少训练时间。<br>② 注意力本身不是降维操作，投影维度是设计选择。<br>③ 局部特征提取是 CNN 的强项，注意力是<span class="hl">全局</span>建模。<br><strong>关联记忆</strong>：自注意力给「全局关联能力」，位置编码补「顺序感知能力」，两者合起来才构成完整的输入建模。</div>
<p><strong>课件案例：机器翻译</strong>。输入「我 明天 南京 返回」经词 Embedding 加位置 Embedding 得到输入矩阵 X，编码器堆叠输出特征矩阵 Z，解码器逐词生成译文直至输出整句。位置编码让模型无需循环结构即可处理序列，多头注意力与自注意力共同提升翻译质量与流畅度。</p>`
    },
    {
      id: 'extend',
      title: '知识拓展：短视频动作识别怎么设计',
      kicker: '课后思考',
      html: `
<p>任务：识别短视频中的人物动作（跑步、跳跃、挥手），视频每秒 30 帧。三个问题的参考思路：</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">问题一</span><h4 class="card-t">单独用 BP 网络合适吗</h4><p class="card-b">不合适。BP 网络是全连接结构，把每帧像素展平后参数量爆炸，且丢失空间结构；它也没有任何时间建模机制，无法利用「动作是帧与帧之间的变化」这一关键信息，30 帧的时序依赖完全被忽略。</p></div>
  <div class="card"><span class="card-k">问题二</span><h4 class="card-t">单独用 CNN 或 RNN 的局限</h4><p class="card-b">只用 CNN：擅长提取单帧的空间特征（人体姿态、肢体位置），但各帧独立处理，无法判断「手举起来」是挥手还是跳跃的起始。只用 RNN：能建模时序，但直接吃原始像素维度太高、难以提取有效的空间表示，训练困难且效果差。</p></div>
  <div class="card"><span class="card-k">问题三</span><h4 class="card-t">如何结合</h4><p class="card-b">CNN 负责空间、RNN 负责时间：每帧先经共享权重的 CNN 提取特征向量，再把 30 个特征向量按时间顺序送入 LSTM/GRU，取最后隐藏状态接全连接与 Softmax 输出动作类别。这就是 CNN+LSTM 的经典视频理解架构。进一步可用 3D CNN 同时卷积时空，或用 Video Transformer 直接对帧块做自注意力。</p></div>
</div>`
    },
    {
      id: 'confuse',
      title: '高频易混点速记',
      kicker: '考前必看',
      html: `
<div class="tbl"><table>
<thead><tr><th>易混对</th><th>结论</th></tr></thead>
<tbody>
<tr><td>梯度消失 vs 梯度爆炸</td><td>LSTM、ReLU、残差连接治消失；梯度裁剪治爆炸</td></tr>
<tr><td>卷积层 vs 池化层</td><td>卷积提特征；池化降尺寸，不改通道数</td></tr>
<tr><td>Sigmoid vs Tanh</td><td>都饱和；Sigmoid 导数上限 0.25，更易消失</td></tr>
<tr><td>Self-Attention vs 位置编码</td><td>前者管全局关联，后者管先后顺序</td></tr>
<tr><td>梯度方向 vs 更新方向</td><td>梯度指向上升，参数沿负梯度更新</td></tr>
<tr><td>输出尺寸 vs 输出通道</td><td>尺寸看 K、P、S；通道看卷积核个数</td></tr>
<tr><td>GCN vs CNN</td><td>非欧氏拓扑用 GCN，规则网格用 CNN</td></tr>
<tr><td>BP vs 优化器</td><td>BP 算梯度，优化器更新参数</td></tr>
</tbody></table></div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 8,
      stem: '关于反向传播算法的主要目的，以下哪项描述最准确？（　）',
      opts: ['用于初始化神经网络的权重参数', '通过调整权重和偏置来最小化损失函数', '增加神经网络的隐藏层数量', '提高模型训练时的计算速度'],
      ans: 'B',
      why: '<p>BP 本质是一套高效求梯度的方法：前向传播得到损失后，用链式法则从输出层向输入层逐层计算偏导数，再交给优化器沿负梯度方向更新参数，使损失下降。BP 加梯度下降共同服务于最小化损失函数。</p><ul><li>A：权重初始化（Xavier、He）是训练前的独立步骤，全零初始化还会导致对称性问题。</li><li>C：隐藏层数量属于结构设计超参数，训练中不改变。</li><li>D：BP 让梯度计算可行，训练提速靠 GPU、混合精度、批量并行。</li></ul><p>严格说 BP 只算梯度、不更新参数，但四个选项中只有 B 指向训练目标。</p>',
      point: '反向传播的目的',
      anchor: 'BP 算梯度，优化器更新，共同目标是损失最小'
    },
    {
      n: 2, type: 'single', score: 8,
      stem: '在 BP 神经网络中，以下哪种激活函数可能导致梯度消失问题？（　）',
      opts: ['ReLU（Rectified Linear Unit）', 'Sigmoid', 'Leaky ReLU', 'Tanh'],
      ans: 'B',
      why: '<p>梯度消失源于链式法则的连乘效应。Sigmoid 导数 <span class="katex-inline">\\(\\sigma\'(x)=\\sigma(x)(1-\\sigma(x))\\)</span> 最大值仅 0.25（在 x=0 处），输入稍大或稍小就迅速趋近 0。5 层网络回传梯度上界约 <span class="katex-inline">\\(0.25^5\\approx 10^{-3}\\)</span>。</p><ul><li>A：ReLU 在 x&gt;0 时导数恒为 1，不衰减，是缓解方案。</li><li>C：Leaky ReLU 负半轴保留小斜率，避免死亡也不衰减。</li><li>D：Tanh 导数最大值 1、零中心，理论上也会消失但程度较轻。单选取最典型的 Sigmoid；若改为多选，B 与 D 都应入选。</li></ul>',
      point: 'Sigmoid 的导数上限与饱和区',
      anchor: '导数上限 0.25 的就是 Sigmoid'
    },
    {
      n: 3, type: 'single', score: 8,
      stem: '关于梯度下降中的权重更新步骤，正确的描述是？（　）',
      opts: ['先更新输出层权重，再更新隐藏层权重', '权重更新仅依赖输入数据，不依赖误差反向传播', '权重更新公式为：新权重 = 旧权重 − 学习率 × 梯度', '梯度方向是损失函数增长最快的方向'],
      ans: 'C',
      why: '<div class="formula">\\[w_{new}=w_{old}-\\eta\\,\\frac{\\partial L}{\\partial w}\\]</div><p>减号表示沿负梯度方向移动，即损失下降最快的方向；学习率控制步长，过大震荡、过小收敛慢。</p><ul><li>A：梯度计算顺序是输出层到隐藏层，但参数更新通常在所有梯度算完后统一进行，同一轮使用同一份旧参数。</li><li>B：梯度由损失对参数求导得到，必然依赖反向传播。</li><li>D：这句话本身数学上成立，但描述的是梯度的性质，没有描述更新步骤，且训练时实际走反方向。C 才是对更新规则的直接完整描述。</li></ul>',
      point: '梯度下降更新公式',
      anchor: '记牢公式里的减号'
    },
    {
      n: 4, type: 'single', score: 8,
      stem: '卷积神经网络中，卷积层的主要作用是：（　）',
      opts: ['减少参数数量', '提取输入数据的空间局部特征', '增加模型非线性表达能力', '降低图像分辨率'],
      ans: 'B',
      why: '<p>卷积核在局部感受野上滑动加权求和，不同核响应不同局部模式：浅层提取边缘、颜色、纹理，深层组合出形状、部件乃至语义。这是卷积层的第一职责。</p><ul><li>A：参数量减少是局部连接加权值共享带来的副产品，属于第 6 题考点。</li><li>C：卷积本身是线性运算，非线性来自激活函数。</li><li>D：降分辨率主要靠池化层或 stride&gt;1 的卷积。</li></ul>',
      point: '卷积层的功能定义',
      anchor: '卷积提特征，池化降尺寸'
    },
    {
      n: 5, type: 'single', score: 8,
      stem: '以下哪种操作可以显著减少特征图的尺寸并保留主要特征？（　）',
      opts: ['使用步长（stride）=1 的卷积', '最大池化（Max Pooling）', '批量归一化（Batch Normalization）', '全连接层（Fully Connected Layer）'],
      ans: 'B',
      why: '<p>2×2、stride=2 的最大池化每 4 个像素取最大值，宽高各减半、面积降为 1/4，同时保留区域内响应最强的特征，并带来一定的平移不变性与抗噪能力。</p><ul><li>A：stride=1 的卷积几乎不改变尺寸，仅因无填充少 2 个像素。</li><li>C：BN 做标准化与缩放平移，稳定分布、加速收敛，不改变张量形状。</li><li>D：全连接层把特征展平用于分类，属于维度重组，参数量巨大。</li></ul>',
      point: '下采样操作的识别',
      anchor: '显著减尺寸又保留显著特征 = 最大池化'
    },
    {
      n: 6, type: 'single', score: 8,
      stem: '卷积神经网络更适合处理图像数据的主要原因是：（　）',
      opts: ['全连接层能高效提取全局特征', '局部连接和权值共享减少了参数量', '池化层能直接识别复杂物体', '不需要预处理即可处理原始像素'],
      ans: 'B',
      why: '<p>图像的两个先验是局部相关性与平移不变性。局部连接只连一小块区域，权值共享让同一个核扫完整张图，参数量只与核大小和个数有关，与输入分辨率无关。</p><p>对比：32×32×3 图像接 1000 神经元全连接层约 300 万参数；12 个 3×3×3 卷积核仅 336 个参数，相差近万倍，既避免过拟合也让训练可行。</p><ul><li>A：全连接层参数爆炸且丢失空间结构，恰恰是不适合图像的原因。</li><li>C：池化只做下采样与特征筛选，识别复杂物体靠多层堆叠加分类器。</li><li>D：归一化、去均值、数据增强在 CNN 中依然常见。</li></ul>',
      point: '局部连接与权值共享',
      anchor: '参数量与分辨率无关，这是 CNN 的核心优势'
    },
    {
      n: 7, type: 'single', score: 8,
      stem: '以下哪种结构设计主要用于解决 RNN 的梯度消失问题？（　）',
      opts: ['梯度裁剪（Gradient Clipping）', '长短期记忆网络（LSTM）', '增加 Dropout 层', '减少 RNN 的层数'],
      ans: 'B',
      why: '<p>原生 RNN 隐藏状态反复乘同一个 <span class="katex-inline">\\(W_{hh}\\)</span>，时间步一长梯度指数衰减。LSTM 引入细胞状态这条近似线性的信息高速路，用遗忘门、输入门、输出门控制读写：</p><div class="formula">\\[C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t\\]</div><p>遗忘门接近 1 时梯度近乎无损回传，从而建模长期依赖。GRU 是简化版。</p><ul><li>A：梯度裁剪专治梯度爆炸，对消失无效。</li><li>C：Dropout 是正则化，缓解过拟合。</li><li>D：减少层数是工程妥协，不是结构设计，还牺牲容量。</li></ul>',
      point: 'LSTM 的门控与细胞状态',
      anchor: '治消失用门控，治爆炸用裁剪'
    },
    {
      n: 8, type: 'single', score: 8,
      stem: '双向循环神经网络（Bi-RNN）的主要优势是（　）',
      opts: ['同时利用序列的过去和未来上下文信息', '参数数量比单向 RNN 少', '训练速度更快', '仅适用于短序列数据'],
      ans: 'A',
      why: '<p>Bi-RNN 由两个方向相反的 RNN 组成，前向层从头读到尾，后向层从尾读到头，每个时刻输出是两者拼接。判断词性、做命名实体识别时既能看到上文也能看到下文。典型场景还有机器翻译编码器与语音识别。</p><ul><li>B：两套参数，约为单向的 2 倍。</li><li>C：需要正反两遍计算，训练更慢。</li><li>D：适用性与序列长短无必然绑定；它需要完整序列，因此不适合严格实时的流式生成，这属于局限，不构成优势。</li></ul>',
      point: '双向结构的收益与代价',
      anchor: '双向 = 上下文更全，参数翻倍、速度更慢'
    },
    {
      n: 9, type: 'single', score: 8,
      stem: '图卷积网络最不适合处理以下哪种任务？（　）',
      opts: ['社交网络用户分类', '分子结构属性预测', '图像分类（如 CIFAR-10 数据集）', '推荐系统中的用户-物品关系建模'],
      ans: 'C',
      why: '<p>GCN 的前提是数据能表示为非欧氏的图，判断标准是样本之间是否存在不规则拓扑连接。</p><ul><li>A：用户是节点、好友是边，节点分类的经典场景。</li><li>B：原子是节点、化学键是边，图级回归预测溶解度与毒性。</li><li>D：用户与物品构成二部图，图协同过滤如 LightGCN。</li><li>C：CIFAR-10 是 32×32×3 的规则网格，邻域固定、顺序固定，用 CNN 最自然高效。强行构图属于杀鸡用牛刀。</li></ul>',
      point: '数据形态与网络结构的匹配',
      anchor: '规则网格用 CNN，不规则拓扑用 GCN'
    },
    {
      n: 10, type: 'single', score: 8,
      stem: 'Transformer 中的自注意力机制（Self-Attention）的核心作用是什么？（　）',
      opts: ['减少模型训练时间', '捕捉序列中任意位置之间的长距离依赖关系', '对输入数据进行降维', '增强局部特征的提取能力'],
      ans: 'B',
      why: '<div class="formula">\\[\\text{Attention}(Q,K,V)=\\text{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V\\]</div><p>每个位置与所有位置直接计算相关性权重，任意两个词元的信息路径长度为 O(1)；RNN 需逐步传递，路径长度 O(n)，长距离信息易被稀释。缩放因子防止点积过大让 softmax 饱和，多头注意力让模型在不同子空间关注不同关系。</p><ul><li>A：复杂度 O(n²)，长序列更贵；优势是可并行，不是单纯减少训练时间。</li><li>C：投影维度是设计选择，注意力本身不降维。</li><li>D：局部特征是 CNN 的强项，注意力是全局建模。</li></ul>',
      point: '自注意力的路径长度优势',
      anchor: '任意两点直连，路径 O(1)'
    },
    {
      n: 11, type: 'single', score: 8,
      stem: 'Transformer 模型中位置编码（Positional Encoding）的主要目的是？（　）',
      opts: ['对输入特征进行归一化', '为序列中的每个位置提供空间或时序信息', '防止模型过拟合', '加速矩阵乘法运算'],
      ans: 'B',
      why: '<p>自注意力把输入看作集合，打乱词元顺序输出只是相应置换（置换等变），模型本身无法知道谁先谁后。但语言、语音、时间序列里顺序就是语义，必须显式注入位置信息。原始论文用正弦余弦编码，与词向量相加后送入各层；后续有可学习位置嵌入、RoPE、ALiBi，ViT 中注入二维空间位置。</p><ul><li>A：归一化是 LayerNorm / BatchNorm 的职责。</li><li>C：防过拟合靠 Dropout、权重衰减、数据增强。</li><li>D：属于工程优化，与位置编码无关。</li></ul>',
      point: '置换等变性与位置信息',
      anchor: '自注意力管关联，位置编码管顺序'
    },
    {
      n: 12, type: 'single', score: 8,
      stem: '循环神经网络的主要特点是：（　）',
      opts: ['仅处理固定长度的输入数据', '通过隐藏状态传递序列的时序信息', '每个时间步使用独立的权重参数', '天然适合处理图像分类任务'],
      ans: 'B',
      why: '<div class="formula">\\[h_t = f\\big(W_{xh}x_t + W_{hh}h_{t-1} + b\\big)\\]</div><p>隐藏状态既含当前输入也压缩了此前所有历史，把时序信息沿时间传递下去。</p><ul><li>A：RNN 可处理变长序列（配合 padding 与 mask），这是相对全连接网络的优势。</li><li>C：所有时间步共享同一组权重，BPTT 中梯度对各步求和后统一更新；每步独立参数会导致无法泛化到不同长度且参数量线性增长。</li><li>D：图像空间结构更适合 CNN，RNN 的主场是文本、语音、时序信号。</li></ul>',
      point: '隐藏状态与跨时间步权重共享',
      anchor: '变长序列 + 共享权重 + 隐藏状态记忆'
    },
    {
      n: 13, type: 'single', score: 8,
      stem: '假设输入为 32×32×3 的 RGB 图像，使用 12 个 3×3 的卷积核（无填充），输出的特征图尺寸是：（　）',
      opts: ['32×32×12', '30×30×3', '30×30×12', '28×28×12'],
      ans: 'C',
      why: '<div class="formula">\\[H_{out}=\\left\\lfloor\\frac{H_{in}+2P-K}{S}\\right\\rfloor+1=\\frac{32+0-3}{1}+1=30\\]</div><p>输出通道数等于卷积核个数 12。每个核其实是 3×3×3 的立体张量，深度与输入通道数一致，12 个核各产生一张 30×30 特征图，堆叠得 30×30×12。</p><ul><li>A：无填充不能保持 32，保持尺寸需 padding=1 配合 3×3 核。</li><li>B：错把输出通道当成输入通道 3。</li><li>D：28 相当于多减了一次，常见来源是误用 5×5 核或误以为 stride=2。</li></ul><p>顺带记参数量：12×(27+1) = 336，含偏置，与输入分辨率无关。</p>',
      point: '卷积输出尺寸与通道数计算',
      anchor: '尺寸看 K、P、S；通道看核个数'
    }
  ]
});