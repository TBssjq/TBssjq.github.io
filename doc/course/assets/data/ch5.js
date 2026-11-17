/* 第 5 章 · 让机器读懂世界：自然语言处理 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 5,
  title: '让机器读懂世界',
  subtitle: '自然语言处理',
  hue: '#8b5cf6',
  glyph: '05',
  tagline: '把文字变成计算机能算的东西',
  exam: {
    name: '第五章作业',
    due: '2026-11-28T23:59:00+08:00',
    rule: '单选 10 道 × 10 分',
    note: '答案串 B A B A C D A B D C。'
  },
  lead: '本章只有两条主线：一条是「方法属于哪个技术阶段」，另一条是「任务的输入输出是什么」。把统计与神经的分界、编码器与解码器的分界记牢，10 道题都能直接定位。',
  sections: [
    {
      id: 'what',
      title: 'NLP 是什么：四大核心任务',
      kicker: '第 1 题',
      html: `
<p class="lead">自然语言处理（Natural Language Processing, NLP）是人工智能与语言学的交叉方向，让计算机<strong>理解、分析、处理、生成</strong>人类日常使用的语言，目标是实现自然的人机交互。智能音箱听懂复杂指令、搜索引擎理解查询意图，都是它的直接产物。</p>
<div class="tbl"><table>
<thead><tr><th>核心任务</th><th>做什么</th><th>课件示例</th></tr></thead>
<tbody>
<tr><td><strong>文本解析</strong></td><td>拆分句子结构，切出词单元</td><td>「他吃苹果」→ 他 / 吃 / 苹果；「我们参观了故宫博物院」→ 我们 / 参观 / 了 / 故宫博物院</td></tr>
<tr><td><strong>情感分析</strong></td><td>判断文本情绪极性与态度倾向</td><td>「这家餐厅服务太差了！」→ 负面；「中了彩票」→ 超级积极</td></tr>
<tr><td><strong>机器翻译</strong></td><td>跨语言转换</td><td>「雨后春笋」早期直译 bamboo shoots after rain，现代意译 emerge in large numbers</td></tr>
<tr><td><strong>文本生成</strong></td><td>创作新内容</td><td>写一首关于秋天的诗、写一段故事开头、生成一段能运行的代码</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>第 1 题的干扰项</strong>：学会编程属于程序合成，运算速度属于体系结构与高性能计算，知识库构建属于知识工程。三者都可以借助 NLP，但都不是 NLP 的核心目标。看到「核心目标」要选最本质、最上位的描述。</div>
<h4 class="sub-h">典型应用场景</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">交互</span><h4 class="card-t">语音助手与客服</h4><p class="card-b">问答、播放音乐、方言交互；电商咨询与 24 小时服务。</p></div>
  <div class="card"><span class="card-k">理解</span><h4 class="card-t">分类与摘要</h4><p class="card-b">新闻分栏（政治、经济）、内容管理；新闻精简，让信息高效获取。</p></div>
  <div class="card"><span class="card-k">洞察</span><h4 class="card-t">情感与舆情</h4><p class="card-b">产品评论分析与市场洞察；政策反馈与企业危机公关。</p></div>
  <div class="card"><span class="card-k">生成</span><h4 class="card-t">写作与翻译</h4><p class="card-b">新闻稿、诗歌创作、代码生成；跨国沟通与旅行辅助。</p></div>
  <div class="card"><span class="card-k">检索</span><h4 class="card-t">智能问答与推荐</h4><p class="card-b">搜索引擎精准回答「太阳系最大行星」；电商商品与资讯个性化推荐。</p></div>
  <div class="card"><span class="card-k">前沿</span><h4 class="card-t">多模态与低资源</h4><p class="card-b">文本加图像加声音；保护濒危语言，构建语料库与跨语言迁移学习；理解隐喻、反讽与混合情感。</p></div>
</div>`
    },
    {
      id: 'history',
      title: '发展历程：四个阶段',
      kicker: '第 3、7 题',
      html: `
<div class="timeline">
  <div class="tl-item"><span class="tl-year">阶段一</span><div class="tl-body"><h4>基于规则</h4><p>人工编写语法规则、词典与模板，靠关键词匹配、正则表达式、模糊匹配工作。问题在于规则复杂且互相矛盾、无法处理多义词与上下文、计算复杂度高。</p></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">阶段二</span><div class="tl-body"><h4>基于统计</h4><p>核心思想是从数据中学习概率模型，「概率越高，句子越合理」——「我吃苹果」比「苹果吃我」概率高。代表方法：<strong>TF-IDF</strong> 词重要性评估、<strong>BoW</strong> 词袋模型、<strong>LDA</strong> 主题模型（无监督聚类）、N-gram、HMM/CRF、朴素贝叶斯与 SVM。优点是可解释性强、适合简单任务；缺点是忽略词序、无法处理语义变化。</p></div></div>
  <div class="tl-item"><span class="tl-year">阶段三</span><div class="tl-body"><h4>深度学习</h4><p>词向量与词嵌入 Word2Vec（2013）、GloVe（2014）解决静态词向量局限；序列建模从 RNN/LSTM 走到 Transformer（2017，自注意力机制，并行处理优势）；预训练模型 BERT（双向理解）与 GPT（文本生成）实现「一次训练，多任务复用」。</p></div></div>
  <div class="tl-item"><span class="tl-year">阶段四</span><div class="tl-body"><h4>预训练大模型与多模态融合</h4><p>大规模语言模型联合文本、图像、语音建模，走向通用能力与跨领域自适应。</p></div></div>
</div>
<div class="note note--key"><strong>分界线只有一条：是否依赖神经网络训练参数。</strong><br>看到 <span class="hl">TF-IDF、BoW、N-gram</span> → 统计方法。<br>看到 <span class="hl">Word2Vec、LSTM、GPT、BERT</span> → 深度学习谱系。<br>TF-IDF 完全依赖语料的频次统计与数值加权，不写语言规则也不训练神经网络，因此归入统计阶段。</div>
<div class="note"><strong>第 7 题的口径说明</strong>：严格学术意义上 TF-IDF 更准确的叫法是「统计特征与权重计算方法」，带参数学习的统计学习模型通常指朴素贝叶斯、SVM、HMM、CRF、最大熵。但四选一里只有 TF-IDF 落在「基于统计」一侧，其余三项都涉及神经网络参数学习。</div>`
    },
    {
      id: 'preprocess',
      title: '文本预处理：五个步骤',
      kicker: '第 2 题',
      html: `
<p>中文与英文不同，词与词之间没有空格分隔，因此分词是中文 NLP 的基础预处理步骤。</p>
<div class="steps">
  <li><b>清洗</b>：处理特殊字符、统一大小写、删除重复字符。</li>
  <li><b>分词</b>：中文用<span class="hl">结巴分词 jieba</span>，「我喜欢吃苹果」→「我 / 喜欢 / 吃 / 苹果」；英文用 NLTK 库，分割「I love NLP」。</li>
  <li><b>去停用词</b>：移除无实义词汇，如「的」「a」。「我喜欢在公园里跑步」→「喜欢 公园 跑步」。</li>
  <li><b>词干提取</b>：截断词尾得到词干，running → run。</li>
  <li><b>词形还原</b>：还原为词典原形，better → good。</li>
</div>
<div class="note note--key"><strong>第 2 题的关键区分</strong>：工具库做具体任务，框架搭模型。<br><span class="hl">jieba</span> 是 Python 生态最常用的中文分词库，支持精确模式、全模式、搜索引擎模式，还提供关键词提取（TF-IDF / TextRank）与词性标注，允许加载自定义词典。同类还有 HanLP、THULAC、pkuseg、LTP。<br><span class="hl">NLTK</span> 是英文 NLP 教学与研究工具包，内置语料、分词、词性标注、句法分析。<br><span class="hl">TensorFlow 与 PyTorch</span> 是通用深度学习框架，用于搭建和训练神经网络，不直接提供中文分词功能。</div>
<div class="note"><strong>词干提取与词形还原的差别</strong>：词干提取是机械截断，结果可能不是真实单词（studies → studi）；词形还原查词典与词性，结果一定是合法单词（better → good）。中文没有词形变化，这两步主要服务于英文。</div>`
    },
    {
      id: 'vector',
      title: '文本向量化：BoW、TF-IDF、词嵌入',
      kicker: '第 3、7、10 题',
      html: `
<p>计算机只能算数字，所以第一步永远是把文字变成向量。三代方法各有取舍。</p>
<h4 class="sub-h">词袋模型 BoW</h4>
<p>把文档看成「一袋子词」，只记录词表中每个词出现的次数，构造一个与词表等长的向量。课件词表为 <code>{苹果, 香蕉, 草莓, 橘子, 葡萄, 西瓜}</code>。</p>
<div class="tbl"><table>
<thead><tr><th>文本</th><th>原始文本</th><th>词频向量</th></tr></thead>
<tbody>
<tr><td>A</td><td>苹果 香蕉 草莓 苹果</td><td class="num">[2, 1, 1, 0, 0, 0]</td></tr>
<tr><td>B</td><td>香蕉 橘子 草莓</td><td class="num">[0, 1, 1, 1, 0, 0]</td></tr>
<tr><td>C</td><td>橘子 葡萄 西瓜</td><td class="num">[0, 0, 0, 1, 1, 1]</td></tr>
<tr><td>D</td><td>苹果 葡萄</td><td class="num">[1, 0, 0, 0, 1, 0]</td></tr>
<tr><td>E</td><td>西瓜 香蕉</td><td class="num">[0, 1, 0, 0, 0, 1]</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>BoW 的致命缺陷是丢失词序</strong>：「猫 追 狗」与「狗 追 猫」的向量完全相同，两句话语义相反却被认为一模一样。伴生缺陷还有向量高维稀疏、无法表达词义相似度（「猫」和「猫咪」是两个独立维度）。<br>它只是计数，计算非常简单，这反而是优点；生僻词可用扩充词表或 <code>&lt;UNK&gt;</code> 统一处理，是所有固定词表模型的共性问题；BoW 是无监督向量化，<strong>不需要人工标注</strong>。</div>
<h4 class="sub-h">TF-IDF：给词打重要性分</h4>
<p>在 BoW 计数基础上做权重改进，缓解「常见词主导」。两个因子相乘：</p>
<div class="formula">\\[ \\mathrm{TF}(t,d)=\\frac{\\text{词 }t\\text{ 在文档 }d\\text{ 中出现次数}}{\\text{文档 }d\\text{ 的总词数}},\\qquad \\mathrm{IDF}(t)=\\log\\frac{\\text{文档总篇数}}{\\text{包含词 }t\\text{ 的文档篇数}} \\]</div>
<div class="note note--key"><strong>课件算例</strong>：一篇 100 个词的文档里「人工智能」出现 10 次，<span class="katex-inline">\\(\\mathrm{TF}=10/100=0.1\\)</span>；1000 篇文档中有 100 篇包含该词，<span class="katex-inline">\\(\\mathrm{IDF}=\\log(1000/100)=\\log 10=1\\)</span>；乘积 <span class="katex-inline">\\(0.1\\times 1=0.1\\)</span>。<br>IDF 的作用是惩罚到处都出现的常见词（「的」「是」），突出在本文档显著、在全集罕见的关键词。<strong>TF-IDF 改进了权重，但仍然不解决词序问题。</strong></div>
<h4 class="sub-h">词嵌入：让语义相近的词靠近</h4>
<p>把单词映射为多维向量，语义相近的词在空间中距离近。课件给出的二维示意：</p>
<div class="tbl"><table>
<thead><tr><th>词</th><th>向量</th><th>读法</th></tr></thead>
<tbody>
<tr><td>国王</td><td class="num">(0.2, 0.8)</td><td rowspan="2">第一维接近 → 同为皇室身份；第二维差 0.2 → 性别差异</td></tr>
<tr><td>王后</td><td class="num">(0.2, 0.6)</td></tr>
<tr><td>男人</td><td class="num">(0.6, 0.7)</td><td rowspan="2">第一维接近 → 同为普通人；第二维差 0.2 → 同样的性别差异</td></tr>
<tr><td>女人</td><td class="num">(0.6, 0.5)</td></tr>
</tbody></table></div>
<div class="cards cards--3">
  <div class="card"><span class="card-k">Word2Vec · 2013</span><h4 class="card-t">CBOW</h4><p class="card-b">根据周围的词语预测当前的目标词。上下文 → 中心词。</p></div>
  <div class="card"><span class="card-k">Word2Vec · 2013</span><h4 class="card-t">Skip-gram</h4><p class="card-b">使用中心词来预测其周围的词。中心词 → 上下文，与 CBOW 方向相反。</p></div>
  <div class="card"><span class="card-k">GloVe · 2014</span><h4 class="card-t">全局加局部</h4><p class="card-b">不同于 Word2Vec 只专注局部上下文窗口，GloVe 结合全局统计信息与局部上下文的优势。</p></div>
</div>
<div class="note"><strong>要保留顺序</strong>需 N-gram、RNN/LSTM；<strong>要拿到语义</strong>需 Word2Vec、BERT 等分布式表示。BoW 与 TF-IDF 两样都缺。</div>`
    },
    {
      id: 'lm',
      title: '语言模型：预测下一个词',
      kicker: '第 6 题',
      html: `
<p>语言模型的定义是<strong>预测下一个词的概率</strong>，例如「今天天气」→「真好」。它是文本生成的基石。</p>
<div class="tbl"><table>
<thead><tr><th>类型</th><th>机制</th><th>长处</th><th>局限</th></tr></thead>
<tbody>
<tr><td>N-Gram</td><td>统计词频。2-Gram 看前 1 词，3-Gram 看前 2 词</td><td>简单、可解释、无需训练神经网络</td><td>数据稀疏，窗口外信息完全丢失</td></tr>
<tr><td>RNN</td><td>隐藏状态串行传递</td><td>能处理变长序列</td><td>串行处理，易遗忘长距离信息</td></tr>
<tr><td>LSTM</td><td>门控机制：遗忘门、输入门、输出门</td><td>记忆关键信息，缓解梯度消失</td><td>结构复杂，仍需串行</td></tr>
<tr><td>GRU</td><td>简化版 LSTM，合并门控</td><td>效率更高</td><td>表达能力略弱于 LSTM</td></tr>
<tr><td><strong>Transformer</strong></td><td>自注意力机制</td><td>并行处理，适合长文本（翻译、写文章）</td><td>复杂度随序列长度平方增长</td></tr>
</tbody></table></div>
<h4 class="sub-h">Transformer 的核心创新</h4>
<p>2017 年 Vaswani 等人的论文 <em>Attention Is All You Need</em> 提出 Transformer，最大变革是<strong>彻底弃用循环与卷积，完全基于注意力机制</strong>建模序列。自注意力对每个位置用 Query / Key / Value 计算它与所有位置的关联权重，再加权汇总得到该位置的表示。</p>
<div class="formula">\\[ \\mathrm{Attention}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V \\]</div>
<div class="cards cards--3">
  <div class="card"><span class="card-k">收益一</span><h4 class="card-t">并行计算</h4><p class="card-b">不像 RNN 必须按时间步串行，训练效率大幅提升。</p></div>
  <div class="card"><span class="card-k">收益二</span><h4 class="card-t">长距离依赖</h4><p class="card-b">任意两词直接交互，信息路径长度为 O(1)，缓解 RNN 的梯度消失与遗忘。</p></div>
  <div class="card"><span class="card-k">收益三</span><h4 class="card-t">多头注意力</h4><p class="card-b">在不同子空间同时捕捉语法、指代、语义等多类关系。</p></div>
</div>
<p>配套组件还有位置编码（注入顺序信息）、前馈网络、残差连接与 LayerNorm。</p>
<div class="note note--warn"><strong>第 6 题的干扰项</strong>：RNN/LSTM/GRU 才是循环结构，恰是 Transformer 要替代的对象；CNN 用于文本（TextCNN）或图像；词向量 Word2Vec、GloVe 在 2013 年前后已出现，早于 Transformer，并非它的创新。题干问「核心创新」，关键词就是自注意力。</div>`
    },
    {
      id: 'semantics',
      title: '句法分析与语义分析',
      kicker: '第 4、5 题',
      html: `
<h4 class="sub-h">语法与句法：语言的交通规则</h4>
<div class="cards">
  <div class="card"><span class="card-k">依存关系分析</span><h4 class="card-t">词语间的直接语法依赖</h4><p class="card-b">「我非常喜欢吃苹果」中<strong>「喜欢」是核心</strong>，「我」「非常」「吃苹果」都依附于它。</p></div>
  <div class="card"><span class="card-k">短语结构分析</span><h4 class="card-t">分解为嵌套短语</h4><p class="card-b">「我」→ NP 名词短语，「非常」→ AdvP 副词短语。</p></div>
</div>
<p><strong>应用</strong>：保证机器翻译的语法合法性；信息抽取中的实体定位。</p>
<h4 class="sub-h">语义分析三项任务</h4>
<div class="tbl"><table>
<thead><tr><th>任务</th><th>做什么</th><th>代表方法</th><th>典型应用</th></tr></thead>
<tbody>
<tr><td><strong>命名实体识别 NER</strong></td><td>从非结构化文本中定位并分类实体</td><td>BIO / BIOES 序列标注 + BiLSTM-CRF、BERT-CRF</td><td>知识图谱构建、问答、信息检索</td></tr>
<tr><td><strong>情感分析</strong></td><td>判断情感倾向与态度极性</td><td>情感词典、机器学习分类、BERT</td><td><strong>舆情监控</strong>、评论分析、客服质检</td></tr>
<tr><td><strong>意图识别</strong></td><td>解析用户需求，如「预订机票」</td><td>RNN / Transformer</td><td>对话系统</td></tr>
</tbody></table></div>
<p><strong>综合应用</strong>：钓鱼邮件检测同时结合 NER、情感分析与意图识别。</p>
<div class="note note--key"><strong>NER 的实体类别</strong>：人名 PER、地名 LOC、机构名 ORG；时间、日期、数量、货币、百分比；领域扩展到疾病、药品、基因、产品型号、法律条款。<br>例：「<strong>张三</strong>在<strong>北京</strong>加入<strong>腾讯</strong>」→ 张三/人名、北京/地名、腾讯/机构名。</div>
<div class="note note--warn"><strong>四大基础任务别串台</strong>：分词 → 切词；NER → 抽实体；情感分析 → 判态度；句法解析 → 析结构。<br>第 4 题凡是出现「监控 / 评论 / 口碑 / 正负面」字眼基本都指向情感分析；机器翻译属语言转换，文本生成属产出新文本，语法解析属结构分析。</div>`
    },
    {
      id: 'generate',
      title: '语言生成：三种方法对照',
      kicker: '第 9 题',
      html: `
<div class="tbl"><table>
<thead><tr><th>方法类型</th><th>优点</th><th>局限性</th><th>适用场景</th></tr></thead>
<tbody>
<tr><td><strong>基于模板</strong></td><td>简单高效，<span class="hl">可控性强、格式规范</span></td><td>灵活性低，语义单一，文本生硬重复</td><td>天气预报、邮件模板、报表、比赛战报、票据通知</td></tr>
<tr><td>基于规则</td><td>语法严谨，适合专业领域</td><td>规则维护成本高</td><td>法律文书、技术文档</td></tr>
<tr><td>基于神经网络</td><td>自然度高，适应复杂语境</td><td>需大量数据，生成可控性弱</td><td>对话系统、新闻写作、创作辅助</td></tr>
</tbody></table></div>
<div class="note"><strong>模板法怎么工作</strong>：人工预先写好带槽位的句式，再把结构化数据填进去。<br><code>{日期}，{城市}气温{温度}℃，{天气提示}。</code><br>填入后 → <code>11月17日，南京气温12℃，请注意添衣。</code><br>输出完全落在设计者允许的句式内，可解释、易审计、零幻觉风险、部署成本低。</div>
<div class="note note--warn"><strong>第 9 题最有迷惑性的是 C「无需训练数据」</strong>：模板方法确实不依赖训练语料，这是它的特点，但「不用数据」不等于「生成得好」，且模板本身需要大量人工设计，省下的数据成本被人力成本抵消。遇到「主要优点」要选体现<span class="hl">输出质量与业务价值</span>的那一项。<br>A「自然流畅」与 B「适应复杂语义」恰好是模板法的局限，属于神经网络生成的长处。</div>`
    },
    {
      id: 'arch',
      title: 'BERT、GPT、原始 Transformer',
      kicker: '第 8 题',
      html: `
<p>BERT 的全称是 <strong>B</strong>idirectional <strong>E</strong>ncoder <strong>R</strong>epresentations from <strong>T</strong>ransformers，名字已经点明两个关键词：双向 + 编码器。</p>
<div class="tbl"><table>
<thead><tr><th>模型</th><th>架构</th><th>能否看右侧上下文</th><th>预训练任务</th><th>擅长</th></tr></thead>
<tbody>
<tr><td><strong>BERT</strong></td><td>Encoder-only，自注意力不掩码</td><td><span class="good">能，双向</span></td><td>MLM 掩码语言模型 + NSP 下一句预测</td><td>理解类：分类、NER、问答、语义匹配</td></tr>
<tr><td><strong>GPT</strong></td><td>Decoder-only，带因果掩码</td><td><span class="bad">不能，单向</span></td><td>自回归预测下一个词</td><td>生成类：续写、对话、写作</td></tr>
<tr><td>原始 Transformer</td><td>Encoder–Decoder 完整结构</td><td>编码器能，解码器不能</td><td>序列到序列监督训练</td><td>机器翻译</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>MLM 是实现双向的关键</strong>：随机遮住 15% 的 token，靠左右上下文预测原词。因为要预测被遮住的词，模型必须同时看两边。NSP 判断两句是否连续，服务句对任务。预训练后接分类或标注头做微调。</div>
<div class="note note--warn"><strong>第 8 题逐项</strong>：A 编码器对了但「单向」错，单向会退化为类似 GPT 的左到右建模；C 是 GPT 类自回归模型的描述；D「双向解码器」自相矛盾，解码器带因果掩码，天然不能看未来 token。<br>口诀：<span class="hl">BERT 双向编码做理解，GPT 单向解码做生成</span>。</div>`
    },
    {
      id: 'case',
      title: '案例：古诗词情感分析全流程',
      kicker: '课件案例',
      html: `
<p>课件用《唐诗三百首》（诗句加情感标签）完整走了一遍 NLP 流水线，把前面所有技术串成一条线。</p>
<h4 class="sub-h">第一步 · 数据准备与预处理</h4>
<div class="steps">
  <li><b>清洗</b>：去标点、去注释。「春风得意马蹄疾，一日看尽长安花。」→「春风得意马蹄疾一日看尽长安花」。</li>
  <li><b>分词</b>：古汉语分词。「黄沙百战穿金甲」→「黄沙 / 百战 / 穿 / 金甲」。</li>
  <li><b>去停用词</b>：移除「之」「乎」等虚词。「念天地之悠悠」→「念 / 天地 / 悠悠」。</li>
</div>
<h4 class="sub-h">第二步 · 特征表示与模型构建</h4>
<div class="steps">
  <li><b>构建词表</b>：把所有出现过的词编号，形成索引字典。</li>
  <li><b>Embedding 层</b>：词语映射为 <strong>128 维</strong>向量。</li>
  <li><b>输入层</b>：接收诗句的索引序列。</li>
  <li><b>RNN 层</b>：传递上下文信息，取<strong>最后一个隐藏状态</strong>作为整句表示。</li>
  <li><b>全连接层</b>：输出情感概率，例如「豪迈」类概率 0.8。</li>
</div>
<h4 class="sub-h">第三步 · 模型训练与预测</h4>
<div class="steps">
  <li><b>批次划分</b>：32 首 / 批。</li>
  <li><b>前向传播</b>：算出预测与损失。</li>
  <li><b>反向传播</b>：用 Adam 优化器更新参数，逐轮记录损失与准确率。</li>
  <li><b>预测</b>：「春风得意马蹄疾」→ 预处理 → 索引 → 模型输出 →「喜悦」（标签 0）。</li>
</div>
<div class="note note--key"><strong>这条流水线可以套到任何文本分类任务上</strong>：清洗 → 分词 → 去停用词 → 词表 → 嵌入 → 序列模型 → 分类头 → 训练 → 预测。把「唐诗」换成「商品评论」，就是情感分析；换成「新闻」，就是文本分类；换成「邮件」，就是垃圾邮件识别。</div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 10,
      stem: '自然语言处理的核心目标是？（　）',
      opts: ['让计算机学会编程', '实现计算机与人类自然语言的交互', '提高计算机的运算速度', '构建大规模知识库'],
      ans: 'B',
      why: '<p>NLP 是人工智能与语言学的交叉方向，研究如何让计算机理解、分析、处理和生成人类日常使用的自然语言，打通人与机器之间的语言壁垒，包括理解（问答、翻译、分类）与生成（摘要、对话、写作）两端。</p><ul><li>A：程序合成与代码生成属相邻领域，即便用到 NLP 也只是应用之一。</li><li>C：运算速度由硬件、体系结构与算法复杂度决定。</li><li>D：知识库构建属知识工程，可作为 NLP 的辅助资源。</li></ul><p>看到「核心目标」要选最本质、最上位的描述。</p>',
      point: 'NLP 的学科定义',
      anchor: '理解 + 生成 = 人机自然语言交互'
    },
    {
      n: 2, type: 'single', score: 10,
      stem: '中文分词常用的工具是？（　）',
      opts: ['结巴分词', 'NLTK', 'TensorFlow', 'PyTorch'],
      ans: 'A',
      why: '<p>中文词与词之间没有空格分隔，分词是中文 NLP 的基础预处理步骤。结巴分词 jieba 是 Python 生态最常用的中文分词库，支持精确模式、全模式、搜索引擎模式，还提供 TF-IDF / TextRank 关键词提取与词性标注，允许加载自定义词典。同类还有 HanLP、THULAC、pkuseg、LTP。</p><ul><li>B：NLTK 是英文 NLP 教学与研究工具包，主要面向英文。</li><li>C、D：TensorFlow 与 PyTorch 是通用深度学习框架，用于搭建训练神经网络，不直接提供中文分词功能。</li></ul><p>区分工具库（做具体任务）与框架（搭模型）。</p>',
      point: '中文分词工具与深度学习框架的区别',
      anchor: 'jieba 切中文，NLTK 切英文'
    },
    {
      n: 3, type: 'single', score: 10,
      stem: 'TF-IDF 技术属于自然语言处理发展的哪个阶段？（　）',
      opts: ['基于规则阶段', '基于统计阶段', '深度学习阶段', '多模态融合阶段'],
      ans: 'B',
      why: '<p>TF 是词在当前文档中出现的频率，IDF 是包含该词的文档数的倒数取对数，用来惩罚到处都出现的常见词。整个计算完全依赖对语料做频次统计与数值加权，不写人工语言规则，也不训练神经网络。</p><ul><li>A：基于规则阶段依靠语言学家手工编写语法规则、词典与模板。</li><li>C：深度学习阶段以 Word2Vec、RNN/LSTM、CNN、Transformer、BERT 为标志。</li><li>D：多模态融合指文本、图像、语音联合建模，是更晚近的方向。</li></ul><p>TF-IDF 计算简单、可解释，但不含词序与语义信息。</p>',
      point: '技术阶段的归属判据',
      anchor: '不训练神经网络参数的归统计'
    },
    {
      n: 4, type: 'single', score: 10,
      stem: '下列哪项属于情感分析的应用场景？（　）',
      opts: ['舆情监控', '机器翻译', '文本生成', '语法解析'],
      ans: 'A',
      why: '<p>情感分析判定文本表达的情绪极性或态度倾向（正面、负面、中性，也可细化到喜怒哀惧），常作用于评论、社交媒体、论坛帖子。舆情监控追踪公众对品牌、事件、政策的情绪走向，及时预警负面风潮，是典型场景。其他还有电商评论分析、客服质检、金融情绪面分析。</p><ul><li>B：机器翻译是序列到序列的语言转换，不判断情绪。</li><li>C：文本生成产出新文本，属生成类任务。</li><li>D：语法解析分析主谓宾与依存关系，属基础句法任务。</li></ul>',
      point: '情感分析的任务边界',
      anchor: '出现监控、评论、口碑、正负面就指向情感分析'
    },
    {
      n: 5, type: 'single', score: 10,
      stem: '命名实体识别的主要任务是？（　）',
      opts: ['判断文本情感倾向', '生成自然语言文本', '识别专有名词（如人名、地名）', '分析句子语法结构'],
      ans: 'C',
      why: '<p>NER 是信息抽取的基础子任务，从非结构化文本中定位并分类具有特定意义的实体：人名 PER、地名 LOC、机构名 ORG，以及时间、日期、数量、货币、百分比，领域扩展到疾病、药品、基因、产品型号、法律条款。</p><p>例：「张三在北京加入腾讯」→ 张三/人名、北京/地名、腾讯/机构名。常建模为序列标注问题，用 BIO / BIOES 标签配合 HMM、CRF、BiLSTM-CRF、BERT-CRF。</p><ul><li>A：情感分析的任务。</li><li>B：自然语言生成 NLG 的任务。</li><li>D：句法与语法解析的任务。</li></ul>',
      point: 'NER 的定义与实体类别',
      anchor: '分词切词、NER 抽实体、情感判态度、句法析结构'
    },
    {
      n: 6, type: 'single', score: 10,
      stem: 'Transformer 模型的核心创新是？（　）',
      opts: ['循环神经网络结构', '卷积神经网络结构', '词向量技术', '自注意力机制'],
      ans: 'D',
      why: '<p>Transformer 由 Vaswani 等人在 2017 年论文 Attention Is All You Need 中提出，最大变革是彻底弃用循环与卷积，完全基于注意力机制建模序列。自注意力用 Query / Key / Value 计算每个位置与所有位置的关联权重再加权汇总，带来并行计算、长距离依赖（路径长度 O(1)）与多头注意力三项收益。</p><ul><li>A：RNN/LSTM/GRU 才是循环结构，恰是 Transformer 要替代的对象。</li><li>B：CNN 用于文本 TextCNN 或图像。</li><li>C：词向量 Word2Vec、GloVe 在 2013 年前后已出现，早于 Transformer，是容易误选的旧技术。</li></ul>',
      point: 'Transformer 的核心机制',
      anchor: '核心创新 = Self-Attention'
    },
    {
      n: 7, type: 'single', score: 10,
      stem: '下列属于统计学习方法的是？（　）',
      opts: ['TF-IDF', 'Word2Vec', 'LSTM', 'GPT'],
      ans: 'A',
      why: '<p>TF-IDF 的全部计算来自语料统计（词频、文档频率、对数），无需梯度下降训练参数，是传统统计向量化的代表。Word2Vec 是浅层神经网络训练得到的分布式词向量，LSTM 是带门控的循环神经网络变体，GPT 是基于 Transformer 解码器的预训练大模型，三者都涉及神经网络参数学习。</p><p>口径说明：严格学术意义上 TF-IDF 更准确叫统计特征与权重计算方法，带参数学习的统计学习模型通常指朴素贝叶斯、SVM、HMM、CRF、最大熵。但四选一里只有 A 落在基于统计一侧。</p>',
      point: '统计方法与神经网络方法的分界',
      anchor: '与第 3 题同一判据'
    },
    {
      n: 8, type: 'single', score: 10,
      stem: 'BERT 模型采用的核心架构是？（　）',
      opts: ['单向 Transformer 编码器', '双向 Transformer 编码器', '单向 Transformer 解码器', '双向 Transformer 解码器'],
      ans: 'B',
      why: '<p>BERT = Bidirectional Encoder Representations from Transformers，名字点明双向加编码器。它只堆叠 Transformer 的 Encoder 层，每层自注意力不掩码，每个 token 同时看到左右全部上下文。预训练任务是 MLM（随机遮住 15% token，靠左右上下文预测原词，这是实现双向的关键）与 NSP（判断两句是否连续）。擅长分类、NER、问答、语义匹配等理解类任务。</p><ul><li>A：编码器对了但单向错，单向会退化为类似 GPT 的左到右建模。</li><li>C：那是 GPT 类自回归模型的描述。</li><li>D：解码器带因果掩码，天然不能双向看未来 token，双向解码器自相矛盾。</li></ul><p>口诀：BERT 双向编码做理解，GPT 单向解码做生成。</p>',
      point: 'Encoder-only 与 Decoder-only 的差别',
      anchor: '看能否看右侧上下文'
    },
    {
      n: 9, type: 'single', score: 10,
      stem: '基于模板的语言生成方法的主要优点是？（　）',
      opts: ['生成文本自然流畅', '适应复杂语义关系', '无需训练数据', '可控性强、格式规范'],
      ans: 'D',
      why: '<p>模板生成预先写好带槽位的句式再填入结构化数据，例如「{日期}，{城市}气温{温度}℃，{天气提示}。」输出完全落在设计者允许的句式内，可控性强、格式规范，适合报表、天气播报、比赛战报、客服话术、票据通知等要求字段齐全口径一致的场景，并且可解释、易审计、零幻觉风险、部署成本低。</p><ul><li>A、B：文本生硬重复、槽位固定难以表达复杂语义，恰是模板法的局限。</li><li>C：不依赖训练语料属于特点，算不上主要优点，「不用数据」不等于「生成得好」，模板本身需要大量人工设计，省下的数据成本被人力成本抵消。</li></ul><p>遇到「主要优点」要选体现输出质量与业务价值的那一项。</p>',
      point: '模板法与神经生成法的取舍',
      anchor: '可控规范 对 自然灵活'
    },
    {
      n: 10, type: 'single', score: 10,
      stem: '词袋模型（BoW）的主要缺陷是？（　）',
      opts: ['计算复杂程度高', '无法处理生僻词', '忽略词语顺序', '依赖人工标注数据'],
      ans: 'C',
      why: '<p>BoW 只记录词表中每个词出现与否与出现次数。「猫 追 狗」与「狗 追 猫」的向量完全相同，两句话语义相反却被认为一模一样，同时丢失句法、指代与上下文语义。伴生缺陷还有向量高维稀疏、无法表达词义相似度。</p><ul><li>A：BoW 只是计数，计算非常简单，反而是优点。</li><li>B：生僻词可通过扩充词表或 &lt;UNK&gt; 统一处理，OOV 是所有固定词表模型的共性问题。</li><li>D：BoW 是无监督文本向量化，不需要人工标注。</li></ul><p>TF-IDF 在 BoW 计数基础上改进权重，仍不解决词序；要保留顺序需 N-gram、RNN/LSTM，要拿到语义需 Word2Vec、BERT。</p>',
      point: 'BoW 的三大关键词',
      anchor: '忽略词序、高维稀疏、无语义'
    }
  ]
});