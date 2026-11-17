/* 第 2 章 · 让机器思考：机器学习 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

(function () {
  var metricTables = `
<div class="tbl tbl--quad"><table>
<caption>表 A</caption>
<thead><tr><th>类</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
<tbody>
<tr><td>0</td><td class="num">0.921053</td><td class="num">0.812500</td><td class="num">1.000000</td><td class="num">0.896552</td></tr>
<tr><td>1</td><td class="num">0.710526</td><td class="num">0.578947</td><td class="num">0.785714</td><td class="num">0.666667</td></tr>
<tr><td>2</td><td class="num">0.789474</td><td class="num">1.000000</td><td class="num bad">0.272727</td><td class="num bad">0.428571</td></tr>
</tbody></table>
<table>
<caption>表 B</caption>
<thead><tr><th>类</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
<tbody>
<tr><td>0</td><td class="num good">1.000000</td><td class="num good">1.0000</td><td class="num good">1.000000</td><td class="num good">1.000000</td></tr>
<tr><td>1</td><td class="num">0.868421</td><td class="num">1.0000</td><td class="num">0.642857</td><td class="num">0.782609</td></tr>
<tr><td>2</td><td class="num">0.868421</td><td class="num">0.6875</td><td class="num">1.000000</td><td class="num">0.814815</td></tr>
</tbody></table>
<table>
<caption>表 C</caption>
<thead><tr><th>类</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
<tbody>
<tr><td>0</td><td class="num good">1.000000</td><td class="num good">1.000000</td><td class="num good">1.000000</td><td class="num good">1.000000</td></tr>
<tr><td>1</td><td class="num">0.947368</td><td class="num">1.000000</td><td class="num">0.857143</td><td class="num">0.923077</td></tr>
<tr><td>2</td><td class="num">0.947368</td><td class="num">0.846154</td><td class="num">1.000000</td><td class="num">0.916667</td></tr>
</tbody></table>
<table>
<caption>表 D</caption>
<thead><tr><th>类</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
<tbody>
<tr><td>0</td><td class="num">0.894737</td><td class="num">0.784706</td><td class="num">1.0</td><td class="num">≈0.88</td></tr>
<tr><td>1</td><td class="num">0.631579</td><td class="num bad">0.000000</td><td class="num bad">0.0</td><td class="num bad">0.000000</td></tr>
<tr><td>2</td><td class="num">0.736842</td><td class="num">0.523810</td><td class="num">1.0</td><td class="num">0.687500</td></tr>
</tbody></table></div>`;

  window.STUDY.chapters.push({
    id: 2,
    title: '让机器思考',
    subtitle: '机器学习',
    hue: '#2f6bff',
    glyph: '02',
    tagline: '不写规则，让数据自己长出规律',
    exam: {
      name: '第二章考核',
      due: '2026-11-21T23:59:00+08:00',
      rule: '单选 22 道 × 4.5 分 · 填空 2 道 × 1 分',
      note: '第 16、17 题为填空。第 20 题与第 24 题共用同一批指标表，一个横向比模型，一个纵向比类别。'
    },
    lead: '本章是全课程计算量最大的一章，也是考试最容易靠「背公式 + 记场景」拿满分的一章。核心只有三块：任务类型判定、聚类与回归的算法细节、评估指标的四个格子。',
    sections: [
      {
        id: 'what',
        title: '机器学习到底在学什么',
        kicker: '概念',
        html: `
<p class="lead">1959 年塞缪尔让西洋跳棋程序自我对弈，棋力随对局数增长，「机器学习」由此得名。Tom Mitchell 给出经典定义：<strong>对于任务 T 和性能度量 P，若程序利用经验 E 在 T 上的性能随 E 增加而改善，就称它从 E 中学习。</strong></p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">要素一</span><h4 class="card-t">模型</h4><p class="card-b">参数化的映射 <span class="katex-inline">\\(y=f(x)\\)</span>，是学习的成果。</p></div>
  <div class="card"><span class="card-k">要素二</span><h4 class="card-t">算法</h4><p class="card-b">求解参数的方法，如最小二乘、梯度下降、信息增益划分。</p></div>
  <div class="card"><span class="card-k">要素三</span><h4 class="card-t">策略</h4><p class="card-b">衡量好坏的目标函数与准则，如损失最小、SSE 最小。</p></div>
</div>
<p><strong>包含关系</strong>：人工智能 ⊃ 机器学习 ⊃ 深度学习。深度学习是机器学习的一个分支，用多层神经网络自动学习特征。</p>
<div class="note note--key"><strong>哪些任务适合机器学习</strong>：识别手写数字、预测共享单车需求、识别垃圾短信——规律藏在数据里、难以手写规则。<br><strong>哪些不适合</strong>：计算订单总价、按固定税率算税额、校验密码是否满 8 位——规则明确且固定，直接写代码更可靠。</div>
<p><strong>数据 → 信息 → 知识</strong>：原始记录是数据，整理后带上下文成为信息，提炼出实体与关系成为知识。知识图谱用「实体—关系—实体」三元组存储知识，例如（北京，是首都of，中国）。</p>`
      },
      {
        id: 'prepare',
        title: '数据准备：归一化与标准化',
        kicker: '易混',
        html: `
<div class="duo">
  <div class="duo-col"><h4>归一化 Normalization</h4><p class="duo-sub">压缩到 [0, 1] 区间</p>
  <div class="formula">\\[x' = \\frac{x - x_{\\min}}{x_{\\max} - x_{\\min}}\\]</div>
  <ul><li>结果严格落在 0 到 1 之间</li><li><strong>对异常值非常敏感</strong>：一个极大值会把其余数据全部压到接近 0</li><li>适合数据边界明确、分布较均匀的场景</li></ul></div>
  <div class="duo-col duo-col--alt"><h4>标准化 Standardization</h4><p class="duo-sub">均值 0，标准差 1</p>
  <div class="formula">\\[x' = \\frac{x - \\mu}{\\sigma}\\]</div>
  <ul><li>结果大致落在 [−3, 3]，不保证有界</li><li><strong>对异常值相对不敏感</strong>，均值与标准差被少量极端值拉动有限</li><li>适合存在离群点、或算法假设数据近似正态的场景</li></ul></div>
</div>
<div class="note"><strong>课件算例</strong>：一组 60 到 100 的数值，归一化后均匀铺开在 0 到 1；一旦混入一个 1000 的异常值，原来那些数全部被压缩到 0.04 附近，彼此几乎无法区分。换成标准化，主体数据仍保持可分辨的间距。<br><strong>为什么必须做</strong>：欧氏距离对量纲敏感，「年收入（万元级）」会直接压过「年龄（十位数）」，聚类与 KNN 的结果会被量纲绑架。</div>
<p><strong>ImageNet 的众包故事</strong>：2007 年李飞飞与李凯启动，目标 22000 个类别。靠雇本科生标注需要 19 年，于是改用亚马逊 Mechanical Turk 平台，来自 167 个国家近 5 万人参与，从 10 亿张候选图片中筛出 1500 万张，每张经过三重验证，2009 年 6 月正式发布。这个数据集直接支撑了 2012 年 AlexNet 的突破。</p>`
      },
      {
        id: 'generalize',
        title: '泛化、过拟合与欠拟合',
        kicker: '核心',
        html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-biasvar.jpg" alt="偏差—方差四象限：偏差与方差都小才是理想的模型" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>偏差—方差四象限：偏差与方差都小才是理想的模型</figcaption></figure>

<p><strong>泛化能力</strong>指模型在没见过的新数据上的表现，这才是机器学习的真正目标。训练集上满分、测试集上崩塌，等于把答案背下来了。</p>
<div class="tbl"><table>
<thead><tr><th>现象</th><th>本质</th><th>表现</th><th>对策</th></tr></thead>
<tbody>
<tr><td><strong>过拟合</strong></td><td>把噪声误判为信息</td><td>训练误差极低、测试误差高；偏差小、方差大</td><td>增加数据、正则化、Dropout、早停、降低模型复杂度、交叉验证</td></tr>
<tr><td><strong>欠拟合</strong></td><td>错过了真实信息</td><td>训练误差与测试误差都高；偏差大</td><td>增加特征、提升模型复杂度、延长训练、减小正则化强度</td></tr>
</tbody></table></div>
<p>误差可以拆成三部分：<strong>偏差</strong>（模型假设与真实规律的偏离）、<strong>方差</strong>（换一批训练数据结果的波动）、<strong>噪声</strong>（数据本身不可消除的随机性）。模型越复杂，偏差下降、方差上升，这就是偏差—方差权衡。</p>
<div class="note note--key"><strong>课件的果茶奶茶例</strong>：区分果茶与奶茶，只要看「含不含奶」这一个特征就够了。如果模型非要把「杯子颜色」「店名长度」也学进去，它就是在拟合噪声，换一家店立刻失效。<span class="hl">特征够用就好，多余的特征是过拟合的入口。</span></div>`
      },
      {
        id: 'linear',
        title: '线性回归与最小二乘法',
        kicker: '第 1、2、16 题',
        html: `
<p>拟合线写成 <span class="katex-inline">\\(\\hat y = wx + b\\)</span>，残差 <span class="katex-inline">\\(e_i = y_i - \\hat y_i\\)</span>。<strong>最小二乘法</strong>选择让残差平方和最小的参数：</p>
<div class="formula">\\[\\min_{w,b}\\; J(w,b)=\\sum_{i=1}^{n}\\left(y_i-(wx_i+b)\\right)^2\\]</div>
<p>用平方的三个理由：消除正负残差互相抵消；对大误差惩罚更重；函数连续可导且是凸函数，有唯一全局最优解。求解有两条路——解析解（求偏导令其为 0，得正规方程）与数值解（梯度下降迭代 <span class="katex-inline">\\(w \\leftarrow w - \\alpha\\,\\partial J/\\partial w\\)</span>）。</p>
<div class="note note--key"><strong>经典假设记作 LINE</strong>：<strong>L</strong>inear 自变量与因变量线性；<strong>I</strong>ndependent 样本与误差项独立；<strong>N</strong>ormal <span class="hl">误差项</span>近似正态（不是因变量）；<strong>E</strong>qual variance 误差项同方差。另要求自变量之间不存在严重多重共线性，注意只要求「无严重共线性」，不要求「完全独立」。</div>
<div class="tbl"><table>
<thead><tr><th>问题</th><th>定义</th><th>后果</th><th>处理</th></tr></thead>
<tbody>
<tr><td><strong>多重共线性</strong></td><td>多个自变量之间高度线性相关</td><td>系数方差变大、极不稳定甚至符号反转；t 检验不显著但 F 检验显著</td><td>看相关系数矩阵与 VIF（大于 10 认为严重）；剔除冗余变量、岭回归 / Lasso、PCA 降维</td></tr>
<tr><td><strong>异方差性</strong></td><td><span class="hl">误差项</span>的方差随自变量变化，不保持恒定</td><td>标准误估计失真，区间估计与检验不可靠</td><td>加权最小二乘、对因变量取对数、稳健标准误</td></tr>
</tbody></table></div>
<p><strong>回归评估指标</strong>：<span class="katex-inline">\\(R^2\\)</span> 决定系数越大越好，衡量拟合程度；MSE 与 RMSE 对大误差敏感；MAE 对异常值较不敏感。</p>`
      },
      {
        id: 'logistic',
        title: '逻辑回归：名字带回归，实为分类',
        kicker: '第 3、18 题',
        html: `
<p>在线性组合 <span class="katex-inline">\\(z=w^{T}x+b\\)</span> 外套一层 Sigmoid，把无界实数压成概率：</p>
<div class="formula">\\[P(y=1\\mid x)=\\sigma(z)=\\frac{1}{1+e^{-z}}\\in(0,1)\\]</div>
<p>取阈值（通常 0.5）即得二分类决策，损失函数用交叉熵。它输出概率、可解释、训练快，是二分类的基线首选。多分类可扩展为 Softmax 回归，或用 One-vs-Rest 组合多个二分类器。</p>
<div class="note"><strong>课件的阈值算例</strong>：六个人的患病概率依次为 0.20、0.45、0.55、0.70、0.80、0.95。阈值取 0.5 时后四人判为阳性；阈值提到 0.9 时只有最后一人判阳性，误报减少但漏报增加。<br><strong>三个层次别混</strong>：概率是连续值，类别是阈值切出来的判定，实际结果是客观事实。模型输出 0.8 不代表这个人一定患病。</div>
<div class="note note--warn"><strong>判断任务类型看输出，不看模型名字</strong>：输出连续值 → 回归；输出有限个离散类别 → 分类。布尔值本质是二分类标签。线性回归输出无界连续值，直接拿来做分类会被离群点拉偏，且输出可能超出 [0,1]。</div>`
      },
      {
        id: 'kmeans',
        title: 'K-means：六步走与三个细节',
        kicker: '第 11、12、17、19、21 题',
        html: `
<div class="steps">
  <li><b>确定 K</b>：预先指定要分成几簇，可用肘部法则观察 SSE 随 K 下降的拐点。</li>
  <li><b>选初始中心</b>：随机挑 K 个点，或用 K-means++ 让初始中心彼此远离。</li>
  <li><b>分配步</b>：计算每个样本到各中心的欧氏距离，归到最近的那个中心。</li>
  <li><b>更新步</b>：把每个中心移到该簇样本的均值向量，「means」由此得名。</li>
  <li><b>迭代</b>：重复分配与更新，每步都保证目标函数不增。</li>
  <li><b>停止</b>：中心不再变化，或达到最大迭代次数。收敛到局部最优。</li>
</div>
<div class="formula">\\[J=\\sum_{k=1}^{K}\\sum_{x\\in C_k}\\left\\|x-\\mu_k\\right\\|^2 \\qquad d(x,\\mu)=\\sqrt{\\sum_j (x_j-\\mu_j)^2}\\]</div>
<p>目标函数是<strong>簇内平方误差和 SSE</strong>，即每个样本到其所属簇中心的距离平方之和最小。目标函数里没有簇间距离项，「簇内紧、簇间远」是好聚类的期望性质，不是被直接优化的量。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">细节一</span><h4 class="card-t">距离与均值绑定</h4><p class="card-b">使平方误差和最小的中心恰好是均值向量。换成曼哈顿距离，最优中心应为中位数，那就成了 K-medians。文本与高维稀疏数据更适合余弦相似度。</p></div>
  <div class="card"><span class="card-k">细节二</span><h4 class="card-t">簇号从 0 开始</h4><p class="card-b">sklearn、Spark MLlib 与多数可视化平台一律从 0 编号。<strong>K=5 ⇒ 取值 0~4</strong>，共 5 个值。用「取值个数必须等于 K」可秒排错误选项。</p></div>
  <div class="card"><span class="card-k">细节三</span><h4 class="card-t">初始中心影响结果</h4><p class="card-b">不同初始中心可能收敛到不同的局部最优，所以「不管初始中心怎么设结果都一样」是错误说法。实践中多次运行取 SSE 最小的一次。</p></div>
</div>
<div class="note"><strong>课件鸢尾花算例</strong>：150 条样本、3 个品种各 50 条、4 个特征。选用花瓣长与花瓣宽两个特征、设 k=3，输出簇号 0、1、2，与三个品种高度吻合。<br><strong>适用前提</strong>：簇大致呈球形、大小相近。对非凸形状或密度不均的数据应改用 DBSCAN 或层次聚类。对离群点敏感时可改用 K-medoids。</div>`
      },
      {
        id: 'tree',
        title: '决策树与随机森林',
        kicker: '课件重点',
        html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-tree.jpg" alt="决策树：按特征逐层提问（有没有羽毛、会不会飞）完成分类" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>决策树：按特征逐层提问（有没有羽毛、会不会飞）完成分类</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-forest.jpg" alt="随机森林：多棵决策树投票，降低单棵树的不稳定" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>随机森林：多棵决策树投票，降低单棵树的不稳定</figcaption></figure>

<p>决策树由<strong>根节点</strong>（第一次划分）、<strong>内部节点</strong>（后续判断）、<strong>叶节点</strong>（最终类别）组成。<span class="hl">每个叶子节点代表一种类别</span>，这是课件自测题的正确说法。</p>
<p>怎么选划分特征？用<strong>信息熵</strong>衡量混乱程度（「熵」字由物理学家胡刚复造出），熵越大越混乱。<strong>信息增益 = 划分前的熵 − 划分后各子集熵的加权平均</strong>，增益最大的特征优先划分。</p>
<div class="note"><strong>课件的 14 天外出例</strong>：14 天记录里 9 天外出、5 天不外出。按「天气」划分后计算信息增益，再按「湿度」继续划分，最终得到一条可读规则：<strong>天气晴且湿度大 → 不外出</strong>。整棵树就是一串这样的如果那么规则，这也是决策树可解释性强的原因。</div>
<p><strong>单棵树不稳定</strong>：换一批数据，树的结构可能大变。随机森林用两个随机加一个投票解决——随机抽取样本（有放回）、随机抽取特征子集，训练多棵树，最后投票决定类别。这属于集成学习中的 Bagging 思想。</p>`
      },
      {
        id: 'bayes',
        title: '朴素贝叶斯：先验与后验',
        kicker: '课件重点',
        html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-bayes.jpg" alt="朴素贝叶斯案例：由「天气」等证据反推「是否打网球」的后验概率" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>朴素贝叶斯案例：由「天气」等证据反推「是否打网球」的后验概率</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-weathertable.jpg" alt="贝叶斯与决策树共用的经典数据集：天气与打网球" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>贝叶斯与决策树共用的经典数据集：天气与打网球</figcaption></figure>

<p>贝叶斯（1702—1761）的思想是<strong>用新证据更新旧判断</strong>：先验概率是看到证据前的信念，条件概率是证据在各类别下出现的可能性，后验概率是结合证据后的新判断。</p>
<div class="formula">\\[P(C\\mid X)=\\frac{P(X\\mid C)\\,P(C)}{P(X)}\\]</div>
<p>「朴素」指<strong>假设各特征在给定类别下条件独立</strong>。这个假设现实中常不成立，但计算量因此大幅下降，效果在文本分类上依然很好。</p>
<div class="note"><strong>课件的 6 位病人例</strong>：统计 6 位病人的职业与症状，第 7 位是「打喷嚏的建筑工人」，问最可能患什么病。分别算「感冒 × 建筑工人 × 打喷嚏」与「过敏 × 建筑工人 × 打喷嚏」等组合的分子。<span class="hl">分母 P(X) 对所有类别相同，只需比较分子大小</span>，这是解题的关键简化。</div>`
      },
      {
        id: 'metrics',
        title: '评估指标：四个格子决定一切',
        kicker: '第 4~8、20、24 题',
        html: `
<div class="tbl"><table class="cm">
<caption>混淆矩阵：行是真实值，列是预测值</caption>
<thead><tr><th></th><th>预测正类</th><th>预测负类</th></tr></thead>
<tbody>
<tr><th>真实正类</th><td class="good"><strong>TP</strong> 真正例<br><span>判对了的正类</span></td><td class="bad"><strong>FN</strong> 假负例<br><span>漏报</span></td></tr>
<tr><th>真实负类</th><td class="bad"><strong>FP</strong> 假正例<br><span>误报</span></td><td class="good"><strong>TN</strong> 真负例<br><span>判对了的负类</span></td></tr>
</tbody></table></div>
<div class="formula">\\[\\text{Accuracy}=\\frac{TP+TN}{TP+TN+FP+FN}\\quad \\text{Precision}=\\frac{TP}{TP+FP}\\quad \\text{Recall}=\\frac{TP}{TP+FN}\\quad F_1=\\frac{2PR}{P+R}\\]</div>
<div class="note note--key"><strong>口诀</strong>：精确率<span class="hl">竖着看预测列</span>（怕误报），召回率<span class="hl">横着看真实行</span>（怕漏报），准确率看整体对不对，F1 是二者的调和平均、用来看稳不稳。<br><strong>场景配对</strong>：垃圾邮件过滤、法庭定罪、广告精准投放、商品推荐 → 怕误报 → 看精确率；疾病筛查、地震预警、逃犯追捕、欺诈召回 → 怕漏报 → 看召回率。</div>
<div class="note note--warn"><strong>99% 准确率陷阱（课件原题）</strong>：1000 条短信里 990 条正常、10 条垃圾。<br>模型 A 全判正常：准确率 99%，但 10 条垃圾一条没抓到，召回率 0。<br>模型 B 找出 8 条垃圾、误拦 20 条正常：准确率 97.8%，精确率 8/28 ≈ 28.6%，召回率 8/10 = 80%。<br>看起来 A 的准确率更高，实际上 B 才有用。<span class="hl">类别不平衡时准确率会系统性高估模型性能。</span>改用 Precision / Recall / F1、ROC-AUC、PR-AUC，配合类别加权、SMOTE 过采样、分层抽样。</div>
<p><strong>全部预测为正类会怎样</strong>：FN = 0，召回率达到 100%；但精确率与准确率都等于正类占比，正类稀少时极低，F1 被低精确率拖累。单一指标会骗人。</p>
<p><strong>怎么读一组分类报告</strong>：先看宏平均与加权平均 F1，再看<strong>各类别 F1 的最小值与方差</strong>，而不是只看某一个 1.000000。整体高加上各类均衡，才是又好又稳。</p>
<p><strong>回归评估</strong>：<span class="katex-inline">\\(R^2\\)</span> 决定系数衡量拟合程度，越大越好；MSE 均方误差、RMSE 均方根误差对大误差敏感；MAE 平均绝对误差对异常值较不敏感。</p>`
      },
      {
        id: 'corr',
        title: '相关性矩阵与「相关不等于因果」',
        kicker: '第 23 题',
        html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch2-balance.jpg" alt="模型复杂度需要平衡：过简单欠拟合，过复杂过拟合" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>模型复杂度需要平衡：过简单欠拟合，过复杂过拟合</figcaption></figure>

<p>皮尔逊相关系数 <span class="katex-inline">\\(r\\in[-1,1]\\)</span>，读它有三条规矩：</p>
<div class="steps">
  <li><b>强弱看绝对值</b>：比较相关程度必须取 <span class="katex-inline">\\(|r|\\)</span>，不能按代数值排序。−0.327 比 0.0099 相关得多。</li>
  <li><b>符号只看方向</b>：正数同向变化，负数反向变化，接近 0 表示无线性相关。</li>
  <li><b>相关不等于因果</b>：即便 r 显著为正，也只能说存在正向线性关联，不能断言「X 越大 Y 就越多」。</li>
</div>
<div class="note note--warn"><strong>课件的冰淇淋与溺水</strong>：4 月到 9 月冰淇淋销量为 10、18、30、42、40、25 千份，同期溺水人数为 1、2、4、7、6、3。两条曲线高度同步，但吃冰淇淋不会导致溺水——<span class="hl">气温是共同原因</span>：天热既让人买冰淇淋，也让人去游泳。这就是混杂变量。</div>
<p><strong>实战用途</strong>：相关性矩阵用于特征选择与共线性排查，绝对值很高的两列考虑保留其一；但 r 接近 0 只说明没有线性关系，不排斥存在非线性关系。</p>`
      },
      {
        id: 'encoding',
        title: '特征编码：一列整数还是多列 0/1',
        kicker: '第 22 题',
        html: `
<div class="duo">
  <div class="duo-col"><h4>Ordinal 序数编码</h4><p class="duo-sub">单列整数</p><ul>
    <li>每个类别映射成一个整数，只增加<strong>一列</strong></li>
    <li>会人为引入大小顺序（0 &lt; 1 &lt; 2 &lt; 3）</li>
    <li>只适合<strong>确有内在顺序</strong>的类别：学历、房间大小、满意度等级</li>
    <li>用在无序类别上，线性模型与基于距离的模型会误以为「海淀区比东城区大 3 倍」</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>One-hot 独热编码</h4><p class="duo-sub">多列 0/1</p><ul>
    <li>m 个取值展开成 <strong>m 列</strong>，每行恰有一个 1</li>
    <li>各类别在空间中等距，不引入伪序</li>
    <li>适合<strong>无序名义变量</strong>：地区、颜色、品牌</li>
    <li>代价是维度膨胀；类别极多时配合 Embedding、目标编码、特征哈希；可 drop 一列避免虚拟变量陷阱</li>
  </ul></div>
</div>
<div class="note note--key"><strong>秒判口诀</strong>：<span class="hl">一列整数 = Ordinal；多列 0/1 = One-hot</span>。题目问「分别对应」时顺序别写反，反序就是标准陷阱选项。</div>`
      }
    ],
    questions: [
      {
        n: 1, type: 'single', score: 4.5,
        stem: '在多元线性回归中，如果自变量之间存在高度相关性，可能会导致____问题。',
        opts: ['过拟合', '欠拟合', '多重共线性', '异方差性'],
        ans: 'C',
        why: '<p>多个自变量之间高度线性相关，正是多重共线性的定义。例如同时放入「房屋面积（平方米）」与「房屋面积（平方英尺）」，或把总收入、税前收入、税后收入一起作为特征。</p><p>后果是回归系数方差变大、结果极不稳定甚至符号反转，t 检验不显著但整体 F 检验显著。排查用相关系数矩阵与 VIF（大于 10 认为严重），处理用剔除冗余变量、岭回归 / Lasso、PCA 降维。</p><ul><li>A 过拟合：模型复杂度过高把噪声学进去。</li><li>B 欠拟合：模型太简单没学到规律。</li><li>D 异方差性：误差项的方差随自变量变化，破坏的是另一条回归假设。</li></ul>',
        point: '多重共线性的定义与后果',
        anchor: '自变量互相高度相关 = 多重共线性；误差项方差变化 = 异方差'
      },
      {
        n: 2, type: 'single', score: 4.5,
        stem: '线性回归模型的基本假设是____。',
        opts: ['自变量与因变量之间存在线性关系', '自变量之间必须完全独立', '因变量必须服从正态分布', '所有选项都正确'],
        ans: 'A',
        why: '<p>经典线性回归假设记作 LINE：Linear 线性关系、Independent 样本与误差项独立、Normal 误差项近似正态、Equal variance 误差项同方差，另要求无严重多重共线性。</p><ul><li>B：「完全独立」过于绝对，只要求不存在严重共线性，允许适度相关。</li><li>C：正态性针对的是残差与误差项，不是因变量本身。收入这类偏态因变量完全可以建模。</li><li>D：B、C 均不成立。</li></ul>',
        point: 'LINE 四条假设的准确表述',
        anchor: '正态性说的是误差项，不是因变量'
      },
      {
        n: 3, type: 'single', score: 4.5,
        stem: '在机器学习中，回归问题是指预测____类型的数据。',
        opts: ['分类标签', '连续值', '离散值', '布尔值'],
        ans: 'B',
        why: '<p>回归输出连续实数，可在区间内取任意值，如房价、温度、销量、股价，评估用 MSE、RMSE、MAE、R²。分类输出有限个离散类别，布尔值本质是二分类标签，A、C、D 都在分类侧。</p><p>逻辑回归名字带回归却是二分类算法。判断任务类型的依据是输出形式，模型名字不作数。</p>',
        point: '回归与分类的输出差异',
        anchor: '连续值是回归，离散类别是分类'
      },
      {
        n: 4, type: 'single', score: 4.5,
        stem: '在一个文本分类任务中，如果希望减少误报（即将负类错误地预测为正类），应该____。',
        opts: ['提高准确率', '提高精确率', '提高召回率', '增加数据集的大小'],
        ans: 'B',
        why: '<p>误报就是 FP（负类被判成正类）。精确率 <span class="katex-inline">\\(P=TP/(TP+FP)\\)</span> 的分母含 FP，提高精确率等价于压低 FP、减少误报；召回率针对的是漏报 FN。</p><p>工程做法是提高分类阈值（如从 0.5 提到 0.8），模型只在很有把握时才判正类，代价是牺牲一部分召回率，这就是 PR 权衡。</p><ul><li>A：准确率是整体正确比例，不专门针对误报，类别不平衡时还会误导。</li><li>D：扩大数据集能整体改善，但不直接必然降低误报。</li></ul>',
        point: '精确率管误报，召回率管漏报',
        anchor: '怕误报看精确率，怕漏报看召回率'
      },
      {
        n: 5, type: 'single', score: 4.5,
        stem: '在一个不平衡的数据集中，使用准确率作为评估指标可能会导致____。',
        opts: ['模型性能被低估', '模型性能被高估', '无法判断模型性能', '精确率和召回率都提高'],
        ans: 'B',
        why: '<p>负类占 99%、正类占 1% 时，模型什么都不学、一律预测负类，准确率也有 99%，但正类召回率为 0，毫无实用价值。准确率把多数类的正确预测计入分子，少数类被淹没，于是性能被高估。</p><p>正确做法是看混淆矩阵，改用 Precision / Recall / F1、ROC-AUC、PR-AUC，配合类别加权、SMOTE 过采样、欠采样、调整阈值、分层抽样。</p><ul><li>C：准确率仍然算得出来，问题在于这个数值系统性偏乐观。</li><li>D：与指标选择无关。</li></ul>',
        point: '类别不平衡下准确率的误导性',
        anchor: '全判多数类也能拿 99% 准确率'
      },
      {
        n: 6, type: 'single', score: 4.5,
        stem: '混淆矩阵如下，精确率为____。',
        figure: `<div class="tbl"><table class="cm"><thead><tr><th>真实值 \\ 预测值</th><th>预测正类</th><th>预测负类</th></tr></thead><tbody><tr><th>真实正类</th><td class="good"><strong>50</strong> TP</td><td class="bad"><strong>10</strong> FN</td></tr><tr><th>真实负类</th><td class="bad"><strong>5</strong> FP</td><td class="good"><strong>35</strong> TN</td></tr></tbody></table></div>`,
        opts: ['50%', '91%', '83%', '88%'],
        ans: 'B',
        why: '<p>TP=50、FN=10、FP=5、TN=35，总样本 100。精确率只看预测为正类的那一列：</p><div class="formula">\\[\\text{Precision}=\\frac{TP}{TP+FP}=\\frac{50}{55}\\approx 0.9091\\approx 91\\%\\]</div><p>干扰项反推很有价值：召回率 = 50/60 = 83.3% 对应 C；准确率 = (50+35)/100 = 85%；F1 ≈ 87% 接近 D；50% 是把 TP 直接除以总数的错误算法。</p>',
        point: '混淆矩阵四格到指标的换算',
        anchor: '精确率竖着看预测列，召回率横着看真实行'
      },
      {
        n: 7, type: 'single', score: 4.5,
        stem: '在一个二分类问题中，如果模型将所有样本都预测为正类，那么其____。',
        opts: ['准确率最高', '精确率最高', '召回率最高', 'F1 分数最高'],
        ans: 'C',
        why: '<p>全部预测为正类意味着不存在「真实正类被判成负类」，即 FN = 0，召回率 <span class="katex-inline">\\(TP/(TP+0)=1\\)</span>，达到上限。</p><p>其他指标并不高：精确率与准确率都等于正类占比，正类稀少时极低；F1 是调和平均，被低精确率拖累。这个例子说明单一指标会骗人，要用 F1、PR 曲线、AUC 综合评估。</p>',
        point: '极端预测下各指标的表现',
        anchor: '全判正类 ⇒ 召回率满分，其余指标等于正类占比'
      },
      {
        n: 8, type: 'single', score: 4.5,
        stem: '在机器学习的分类问题中，准确率是指____。',
        opts: ['正确分类的样本数占总样本数的比例', '预测为正类的样本中真正为正类的比例', '实际为正类的样本中被正确预测为正类的比例', '预测为正类的样本数占所有预测为正类样本数的比例'],
        ans: 'A',
        why: '<p>准确率 <span class="katex-inline">\\((TP+TN)/(TP+TN+FP+FN)\\)</span>，分子同时包含正类判对与负类判对。</p><ul><li>B 是精确率 <span class="katex-inline">\\(TP/(TP+FP)\\)</span>。</li><li>C 是召回率 <span class="katex-inline">\\(TP/(TP+FN)\\)</span>。</li><li>D 表述自相重复，恒为 1，也不是准确率。</li></ul>',
        point: '三个指标的文字定义辨析',
        anchor: '准确率看整体对不对，精确率看报出来的准不准，召回率看该找的找全没'
      },
      {
        n: 9, type: 'single', score: 4.5,
        stem: '在机器学习中，分类和聚类的主要区别是____。',
        opts: ['分类是有监督学习，聚类是无监督学习', '分类用于预测连续值，聚类用于预测离散类别', '分类和聚类都是有监督学习方法', '聚类可以处理非数值型数据，而分类不能'],
        ans: 'A',
        why: '<p>分类有标签，把样本指派到已知类别，用逻辑回归、决策树、SVM、朴素贝叶斯，评估用准确率、F1、AUC。聚类无标签，按相似度自动发现分组，用 K-means、DBSCAN、层次聚类，评估用轮廓系数、SSE、CH 指数。</p><ul><li>B：预测连续值是回归；聚类只给簇编号，簇本身没有预设语义。</li><li>C：聚类没有标签。</li><li>D：两类方法都能通过编码或距离设计处理非数值数据，分类用 One-hot、Ordinal，聚类可用 Gower 距离、K-modes。</li></ul>',
        point: '分类与聚类的范式差异',
        anchor: '分类有标签，聚类无标签'
      },
      {
        n: 10, type: 'single', score: 4.5,
        stem: '下列____是聚类算法的一个常见应用。',
        opts: ['预测股票价格', '疾病预测', '将电子邮件分为垃圾邮件和非垃圾邮件', '将客户群体细分为不同细分市场'],
        ans: 'D',
        why: '<p>客户细分是聚类最经典的应用：没有先验标签，按消费金额、频次、年龄自动分成高价值群、价格敏感群、潜力群，再制定差异化营销。其他应用有社群发现、图像颜色量化、异常检测预处理、文档主题分组。</p><ul><li>A：预测具体价格是回归。</li><li>B：患病与不患病是有标签的分类。</li><li>C：垃圾邮件识别是典型二分类，有标注，常用朴素贝叶斯与逻辑回归。</li></ul>',
        point: '聚类的典型应用场景',
        anchor: '没有标签、想自动分群 → 聚类'
      },
      {
        n: 11, type: 'single', score: 4.5,
        stem: 'K-means 算法的目标是____。',
        opts: ['最小化每个数据点到其聚类中心的距离之和', '最大化每个数据点到其聚类中心的距离之和', '最小化聚类中心之间的距离', '最大化聚类中心之间的距离'],
        ans: 'A',
        why: '<p>K-means 最小化簇内平方误差和 SSE：</p><div class="formula">\\[J=\\sum_{k=1}^{K}\\sum_{x\\in C_k}\\left\\|x-\\mu_k\\right\\|^2\\]</div><p>算法交替执行分配步（归到最近中心）与更新步（中心移到簇均值），每步保证 J 不增，收敛到局部最优。</p><ul><li>B：方向反了，最大化会让簇内尽可能散。</li><li>C、D：簇间距离大是好聚类的期望性质，但目标函数里没有簇间距离项，不直接优化它；C 的方向还与好聚类相反。</li></ul>',
        point: 'K-means 的目标函数',
        anchor: '最小化簇内距离平方和，目标里没有簇间项'
      },
      {
        n: 12, type: 'single', score: 4.5,
        stem: '无监督学习中的聚类算法试图将数据点分成不同的「簇」，这些「簇」是基于____定义的。',
        opts: ['数据点的物理位置', '数据点的标签', '用户预定义的规则', '数据点之间的相似性'],
        ans: 'D',
        why: '<p>无监督学习没有标签，只能依靠特征空间里的相似度或距离定义簇：同簇样本距离近，不同簇距离远，这就是聚类假设。度量可用欧氏距离、曼哈顿距离、余弦相似度，度量方式会直接改变分群结果。</p><ul><li>A：数据点是多维特征向量，不是现实空间的物理摆放。</li><li>B：有标签就是监督学习了。</li><li>C：簇由算法自动发现，用户只设定 K 与距离度量等超参数。</li></ul>',
        point: '聚类的依据是相似度',
        anchor: '没有标签时，距离就是唯一的依据'
      },
      {
        n: 13, type: 'single', score: 4.5,
        stem: '在强化学习中，智能体通过____来优化其行为。',
        opts: ['标记好的训练数据集', '与环境的交互和奖励信号', '人类的直接指导', '观察其他智能体的行为'],
        ans: 'B',
        why: '<p>强化学习的闭环是：智能体在状态 s 下采取动作 a，环境转移到新状态并给出奖励 r，智能体据此更新策略，目标是最大化长期累积折扣回报 <span class="katex-inline">\\(G_t=\\sum \\gamma^k r_{t+k}\\)</span>。核心词是交互、奖励、试错。</p><ul><li>A：标记数据集是监督学习。</li><li>C：人类直接逐步指导不是定义；RLHF 仍是把人类偏好转成奖励信号，本质还是 B。</li><li>D：观察他人属于模仿学习、逆强化学习、多智能体学习，是分支方向。</li></ul><p>奖励往往延迟且稀疏，因此才有探索与利用的权衡。</p>',
        point: '强化学习的信号来源',
        anchor: '监督看答案，强化看打分，无监督看结构'
      },
      {
        n: 14, type: 'single', score: 4.5,
        stem: '在有监督的学习中，模型通过____来进行学习。',
        opts: ['标记好的训练数据集', '奖励信号', '群体智慧', '试探性搜索'],
        ans: 'A',
        why: '<p>监督学习的数据形式是 (x, y)，每条样本既有特征也有已知正确答案。模型最小化预测与真实标签之间的损失（交叉熵、均方误差），学到 x 到 y 的映射。</p><ul><li>B：奖励信号属于强化学习。</li><li>C：群体智慧是集成学习思想（Bagging、Boosting、随机森林），不是学习材料。</li><li>D：试探性搜索属于强化学习的探索或超参数搜索。</li></ul>',
        point: '监督学习的信号来源',
        anchor: '有标签就是监督学习'
      },
      {
        n: 15, type: 'single', score: 4.5,
        stem: '机器学习的主要目的是让计算机从数据中____，以实现某些任务或预测未知数据。',
        opts: ['寻找特征', '生成模型', '进行推理', '分类标签'],
        ans: 'B',
        why: '<p>按 Mitchell 的定义，学习的成果就是模型（参数化的映射 f）。流程是数据 → 训练 → 生成模型 → 用模型对未见数据做预测。题干强调「预测未知数据」，指向泛化能力。</p><ul><li>A：寻找特征属于特征工程与表示学习，是训练中的一个环节，深度学习还会自动学特征。</li><li>C：推理是模型训练完成之后拿来用的动作，顺序反了。</li><li>D：标签是训练前就存在的监督信号，不是学出来的东西，且只覆盖分类任务。</li></ul>',
        point: '机器学习的产出是模型',
        anchor: '数据 → 训练 → 模型 → 预测未知'
      },
      {
        n: 16, type: 'blank', score: 1,
        stem: '线性回归通过________找到最佳拟合线？',
        ans: ['最小二乘法'],
        accept: ['最小二乘法', '最小二乘', '最小化残差平方和', '残差平方和最小', '最小化均方误差', '均方误差最小', 'MSE', 'OLS', '普通最小二乘', '普通最小二乘法', '梯度下降'],
        why: '<p>设拟合线 <span class="katex-inline">\\(\\hat y=wx+b\\)</span>，残差 <span class="katex-inline">\\(e_i=y_i-\\hat y_i\\)</span>，最小二乘法选择使残差平方和最小的参数：</p><div class="formula">\\[\\min_{w,b}\\; J(w,b)=\\sum_{i=1}^{n}\\left(y_i-(wx_i+b)\\right)^2\\]</div><p>用平方是为了消除正负抵消、加重对大误差的惩罚、保证函数连续可导且为凸函数。求解可用解析解（正规方程）或数值解（梯度下降）。填「梯度下降」是达到同一目标的优化手段，标准答案是最小二乘法这一准则。</p>',
        point: '线性回归的求解准则',
        anchor: '最佳拟合线 = 残差平方和最小'
      },
      {
        n: 17, type: 'blank', score: 1,
        stem: 'K-means 通过________衡量样本之间的相似度？',
        ans: ['欧氏距离'],
        accept: ['欧氏距离', '欧式距离', '欧几里得距离', '欧几里德距离', '距离', '样本到聚类中心的距离', '闵可夫斯基距离', 'Euclidean', 'euclidean distance'],
        why: '<p>标准 K-means 用欧氏距离 <span class="katex-inline">\\(d(x,\\mu)=\\sqrt{\\sum_j (x_j-\\mu_j)^2}\\)</span>，实现中常直接比较平方距离省去开方。距离越小越相似，归为同一簇。</p><p>「means」与欧氏距离绑定：使平方误差和最小的中心恰好是簇内均值向量；换成曼哈顿距离，最优中心应为中位数，那就是 K-medians。</p><p>实践注意：欧氏距离对量纲敏感，必须先标准化或归一化；高维稀疏与文本向量更适合余弦相似度；对离群点敏感时改用 K-medoids 或 DBSCAN。</p>',
        point: 'K-means 的距离度量',
        anchor: 'K-means 用欧氏距离，用前先标准化'
      },
      {
        n: 18, type: 'single', score: 4.5,
        stem: '哪种算法特别适用于处理分类问题，尤其是二分类问题？',
        opts: ['决策树', '贝叶斯', '逻辑回归', '线性回归'],
        ans: 'C',
        why: '<p>逻辑回归在线性组合外套 Sigmoid，输出 (0,1) 的概率，取阈值 0.5 即得二分类决策，损失用交叉熵。它输出概率、可解释、训练快，是二分类的基线首选。</p><ul><li>D：线性回归输出无界连续值，直接分类会被离群点拉偏且可能超出 [0,1]。</li><li>A：决策树可分类也可回归（CART），并非尤其针对二分类。</li><li>B：朴素贝叶斯常用于文本多分类，依赖特征条件独立假设。</li></ul><p>多分类可扩展为 Softmax 回归或 One-vs-Rest。</p>',
        point: '二分类的经典基线算法',
        anchor: '尤其二分类 → 逻辑回归'
      },
      {
        n: 19, type: 'single', score: 4.5,
        stem: 'K-均值聚类算法主要应用于哪些场景？',
        opts: ['回归问题', '市场细分、社交网络分析', '分类问题', '未来趋势预测'],
        ans: 'B',
        why: '<p>K-means 是无监督分群算法，适用于事先不知道类别标签、想按特征自动分组的场景：市场细分与客户分群、社交网络社群发现、图像压缩与分割、异常检测预处理、推荐系统用户分组、文档粗聚类。</p><ul><li>A、D：输出连续数值，属于监督学习。</li><li>C：分类需要已知标签。</li></ul><p>使用前提是预先指定 K，且假设簇大致呈球形、大小相近；非凸形状或密度不均时改用 DBSCAN 或层次聚类。</p>',
        point: 'K-means 的应用边界',
        anchor: '分群用聚类，预测数值用回归，已知类别用分类'
      },
      {
        n: 20, type: 'single', score: 4.5,
        stem: '根据如下四张指标表判断，________分类模型的性能最好、最稳定。',
        figure: metricTables,
        opts: ['表 A', '表 B', '表 C', '表 D'],
        ans: 'C',
        why: '<p>判断标准有两条，缺一不可：整体高（四项指标普遍接近 1）与各类均衡稳定（不能某类特别好、另一类塌陷）。F1 是精确率与召回率的调和平均，任一项低就会把它拉下来，最适合用来看稳不稳。</p><ul><li>A：类 2 的 Recall 仅 0.2727、F1 仅 0.4286，大量样本被漏判，严重失衡。</li><li>B：类 0 满分很亮眼，但类 1 的 Recall 0.6429、F1 0.7826，类 2 的 Precision 0.6875，与类 0 差距大。这是「被单类满分迷惑」的典型陷阱。</li><li>D：类 1 的 Precision / Recall / F1 全为 0，等于完全没识别出该类，整体准确率也最低。</li><li>C：类 0 四项满分，类 1 与类 2 的 Accuracy 均 0.947，F1 分别 0.923 与 0.917，三类 F1 全部不低于 0.916，无任一指标塌陷。</li></ul>',
        point: '横向比较模型：整体高 + 各类 F1 均衡',
        anchor: '先看各类 F1 的最小值，别只看某一个 1.000000'
      },
      {
        n: 21, type: 'single', score: 4.5,
        stem: '聚类模型完成后，可以通过「行过滤」组件，以 Kmeans_cluster == <聚类簇号> 为条件查看每一类的样本情况。如果聚类个数设置为 5，那么 <聚类簇号> 的取值范围为________。',
        figure: `<div class="q-photo"><img src="assets/media/img/ch2-q21-figure.jpg" alt="KMeans 聚类参数面板"><p>KMeans 参数面板：聚类个数设为 5，行过滤条件为 Kmeans_cluster == ?</p></div>`,
        opts: ['1~4', '0~4', '1~5', '0~5'],
        ans: 'B',
        why: '<p>K-means 输出的新列存放簇标签，sklearn、Spark MLlib 及多数可视化建模平台一律从 0 开始编号。K=5 时标签集合为 {0,1,2,3,4}，即 0~4，共 5 个取值，与簇个数一致。</p><ul><li>A：只有 4 个值，少一类。</li><li>C：从 1 开始数的直觉错误。</li><li>D：有 6 个值，多一类。</li></ul><p>用「取值个数必须等于 K」秒排 A、D，再用「从 0 起编」排掉 C。实操中依次填 == 0 到 == 4 查看各簇样本，再给每个簇做业务命名。</p>',
        point: '簇编号从 0 开始',
        anchor: 'K=5 ⇒ 0~4，个数必须等于 K'
      },
      {
        n: 22, type: 'single', score: 4.5,
        stem: '从「特征工程」组中先后加入「One-hot 编码」和「Ordinal 编码」对「地区」和「房间类型」分别编码。将「地区」分别进行两种编码后，图 8-1 和 8-2 分别对应________编码效果。',
        figure: `<div class="duo"><div class="duo-col"><h4>图 8-1</h4><p class="duo-sub">新增一列 new_地区</p><div class="tbl"><table><thead><tr><th>地区</th><th>new_地区</th></tr></thead><tbody><tr><td>东城区</td><td class="num">0</td></tr><tr><td>其他城区</td><td class="num">1</td></tr><tr><td>朝阳区</td><td class="num">2</td></tr><tr><td>海淀区</td><td class="num">3</td></tr></tbody></table></div></div><div class="duo-col duo-col--alt"><h4>图 8-2</h4><p class="duo-sub">展开为四列，每行仅一个 1.0</p><div class="tbl"><table><thead><tr><th>东城区</th><th>其他城区</th><th>朝阳区</th><th>海淀区</th></tr></thead><tbody><tr><td class="num good">1.0</td><td class="num">0.0</td><td class="num">0.0</td><td class="num">0.0</td></tr><tr><td class="num">0.0</td><td class="num good">1.0</td><td class="num">0.0</td><td class="num">0.0</td></tr><tr><td class="num">0.0</td><td class="num">0.0</td><td class="num good">1.0</td><td class="num">0.0</td></tr><tr><td class="num">0.0</td><td class="num">0.0</td><td class="num">0.0</td><td class="num good">1.0</td></tr></tbody></table></div></div></div>`,
        opts: ['One-hot 编码、Ordinal 编码', 'Ordinal 编码、One-hot 编码', 'One-hot 编码、One-hot 编码', 'Ordinal 编码、Ordinal 编码'],
        ans: 'B',
        why: '<p>图 8-1 把每个类别映射成一个整数、只增加一列，是 Ordinal 序数编码。图 8-2 把 4 个取值展开成 4 个 0/1 列、每行恰有一个 1，是 One-hot 独热编码。</p><p>关键取舍：Ordinal 会人为引入大小顺序，地区本无顺序，线性模型与基于距离的模型会误以为「海淀区比东城区大 3 倍」；One-hot 让各类别等距、不引入伪序，代价是维度膨胀。Ordinal 只适合确有内在顺序的类别，如房间类型按小到大、学历按低到高。</p>',
        point: '两种编码的形态与适用场景',
        anchor: '一列整数 = Ordinal，多列 0/1 = One-hot，顺序别写反'
      },
      {
        n: 23, type: 'single', score: 4.5,
        stem: '从下面的相关性矩阵分析，1)~4) 的说法中正确的是________。',
        figure: `<div class="tbl"><table><thead><tr><th></th><th>Age</th><th>Annual Income (k$)</th><th>Spending Score (1-100)</th></tr></thead><tbody><tr><th>Age</th><td class="num">1.000000</td><td class="num">-0.012398</td><td class="num bad">-0.327227</td></tr><tr><th>Annual Income</th><td class="num">-0.012398</td><td class="num">1.000000</td><td class="num">0.009903</td></tr><tr><th>Spending Score</th><td class="num bad">-0.327227</td><td class="num">0.009903</td><td class="num">1.000000</td></tr></tbody></table></div>
<ol class="claims"><li>Spending Score 与 Annual Income 的相关性最高，因为 0.009903 &gt; -0.012398 &gt; -0.327227</li><li>年收入 Annual Income 越大，消费积分 Spending Score 就越多</li><li>年龄 Age 对年收入 Annual Income 的影响低于对消费积分 Spending Score 的影响</li><li>年收入 Annual Income 和消费积分 Spending Score 无关</li></ol>`,
        opts: ['1) 2)', '2) 3)', '3) 4)', '1) 4)'],
        ans: 'C',
        why: '<p>三条规矩：强弱看绝对值，符号只看方向，相关不等于因果。</p><ul><li><strong>1) 错误</strong>：按代数值排序确实成立，但比较相关性必须取绝对值。三组 |r| 分别是 0.009903、0.012398、0.327227，最高的是 Age 与 Spending Score。把「负得更多」当成「更弱」是本题最大的陷阱。</li><li><strong>2) 错误</strong>：Income 与 Spending 的 r = 0.009903 接近 0，几乎无线性关系；即便显著为正也不能断言因果式的「越大就越多」。</li><li><strong>3) 正确</strong>：0.0124 远小于 0.3272，Age 与 Income 的线性关联远弱于 Age 与 Spending Score。</li><li><strong>4) 正确</strong>：0.009903 已接近 0，可认为线性无关，注意不排斥非线性关系。</li></ul>',
        point: '相关系数的绝对值与方向',
        anchor: '比强弱取绝对值，−0.327 比 0.0099 相关得多'
      },
      {
        n: 24, type: 'single', score: 4.5,
        stem: '以下是同一数据集使用四种不同分类模型后的评估指标表（四张表同第 20 题）。可以推测 0、1、2 三类数据样本中，________类特征更明显，更容易与其他两类区别。',
        figure: metricTables,
        opts: ['第 0 类', '第 1 类', '第 2 类', '都差不多'],
        ans: 'A',
        why: '<p>题目强调同一数据集、四种不同模型。若某一类在不同模型下都稳定拿到高分，说明规律性来自数据本身（该类样本特征紧凑、边界清晰），而不是某个模型碰巧拟合得好。</p><ul><li><strong>第 0 类</strong>：表 B、表 C 中四项全部 1.000000；表 A 有 Recall=1.000、F1=0.897；表 D 有 Recall=1.0、F1≈0.88。四个模型都能稳定认出。</li><li><strong>第 1 类</strong>：表 D 中三项全 0，表 A 的 F1 仅 0.667，表 B 的 Recall 仅 0.643，波动最大，最难分。</li><li><strong>第 2 类</strong>：表 A 的 Recall 仅 0.273、F1 0.429，表 B 的 Precision 0.6875，时好时坏，介于中间。</li></ul><p>与第 20 题形成对照：第 20 题横向比哪个模型好（选表 C），本题纵向比哪个类别好分（选第 0 类）。</p>',
        point: '纵向比较类别：跨模型都高分的那一类特征最明显',
        anchor: '同一批表，横看选模型，纵看选类别'
      }
    ],
    bonus: [
      {
        n: 201, type: 'single', source: '课件自测',
        stem: '人工智能、机器学习、深度学习三者的关系是？',
        opts: ['机器学习包含人工智能，人工智能包含深度学习', '人工智能包含机器学习，机器学习包含深度学习', '深度学习包含机器学习，机器学习包含人工智能', '三者相互独立、没有包含关系'],
        ans: 'B',
        why: '<p>人工智能是最大的范畴，机器学习是实现人工智能的一条主要路径，深度学习是机器学习中用多层神经网络自动学习特征的分支。三者是层层包含的关系。</p>',
        point: 'AI ⊃ ML ⊃ DL',
        anchor: '人工智能最大，深度学习最小'
      },
      {
        n: 202, type: 'single', source: '课件自测',
        stem: '关于 K-means 聚类，下列说法不正确的是？',
        opts: ['需要预先指定聚类个数 K', '通过迭代更新聚类中心使簇内平方误差和下降', '不管初始中心点如何设置，K-means 聚类结果都是一样的', '对离群点比较敏感'],
        ans: 'C',
        why: '<p>K-means 收敛到局部最优，不同初始中心可能得到不同分群结果，因此「结果都一样」是错误说法。实践中用 K-means++ 初始化并多次运行取 SSE 最小的一次。其余三项都是 K-means 的真实性质。</p>',
        point: 'K-means 的局部最优特性',
        anchor: '初始中心会影响结果'
      },
      {
        n: 203, type: 'single', source: '课件自测',
        stem: '关于决策树的结构，下列说法正确的是？',
        opts: ['每个叶子节点代表一种类别', '每个内部节点代表一种类别', '根节点直接给出最终类别', '决策树只能处理数值型特征'],
        ans: 'A',
        why: '<p>决策树的根节点与内部节点都是判断条件，只有叶子节点给出最终结论，分类树中每个叶子代表一种类别。决策树也能处理类别型特征，这正是它可解释性强的原因之一。</p>',
        point: '决策树的节点职责',
        anchor: '内部节点问问题，叶子节点给答案'
      },
      {
        n: 204, type: 'single', source: '课件自测',
        stem: '在疾病检测任务中，应优先提高哪个指标？',
        opts: ['准确率 Accuracy', '精确率 Precision', '查全率 Recall', '决定系数 R²'],
        ans: 'C',
        why: '<p>疾病检测最怕漏诊：把患病者判为健康会延误治疗，代价远高于多做一次复查。漏报对应 FN，管 FN 的指标是召回率（查全率）。R² 是回归指标，与分类任务无关。</p>',
        point: '指标与业务代价的匹配',
        anchor: '怕漏报 → 查全率；怕误报 → 查准率'
      },
      {
        n: 205, type: 'single', source: '课件自测',
        stem: '衡量回归模型拟合程度的统计量是？',
        opts: ['F1 分数', '决定系数 R²', '轮廓系数', '信息增益'],
        ans: 'B',
        why: '<p>决定系数 R² 表示模型解释的方差占总方差的比例，越大说明拟合越好。F1 用于分类，轮廓系数用于聚类，信息增益用于决策树划分特征。</p>',
        point: '回归与分类聚类指标的区分',
        anchor: '回归看 R²、MSE、RMSE、MAE'
      },
      {
        n: 206, type: 'blank', source: '课件自测',
        stem: 'K-means 通过________衡量样本之间的相似度。',
        ans: ['欧氏距离'],
        accept: ['欧氏距离', '欧式距离', '欧几里得距离', '距离', 'Euclidean'],
        why: '<p>课件第 52 页填空题，与本章第 17 题同一考点。标准 K-means 使用欧氏距离，配合最小化簇内平方误差和的目标函数，最优中心恰好是簇内均值向量。</p>',
        point: 'K-means 的距离度量',
        anchor: '欧氏距离 + 均值中心'
      }
    ]
  });
})();