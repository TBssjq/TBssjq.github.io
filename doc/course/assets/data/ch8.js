/* 第 8 章 · 挑战与治理：人工智能与社会伦理 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 8,
  title: '挑战与治理',
  subtitle: '人工智能与社会伦理',
  hue: '#06b6d4',
  glyph: '08',
  tagline: '技术能做什么，与应当做什么',
  exam: {
    name: '第八章作业',
    due: '2026-11-28T23:59:00+08:00',
    rule: '单选 12 道 × 8.5 分',
    note: '答案串 D B B B C C A C B C A B。'
  },
  lead: '本章考题有一条统一的判断标准：看决策的风险高低与利害关系。医疗、金融、司法涉及人身安全与重大权益，可解释性需求最强；娱乐、创作、实验演示后果可控，需求较弱。主体性题则一律选「批判性评估加自身判断」那一项。',
  sections: [
    {
      id: 'intro',
      title: '伦理范式的根本性变革',
      kicker: '课件引言',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-digitalgap.jpg" alt="数字鸿沟的演进：从接入沟到素养沟，再到智能沟" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>数字鸿沟的演进：从接入沟到素养沟，再到智能沟</figcaption></figure>

<p class="lead">智能体不仅作为技术工具存在，更通过<strong>自主决策参与社会活动</strong>，使传统伦理框架面临诸多新的挑战。</p>
<div class="tbl"><table>
<thead><tr><th>文明阶段</th><th>核心伦理议题</th></tr></thead>
<tbody>
<tr><td>农耕文明</td><td>个体德性修养、人际关系规范</td></tr>
<tr><td>工业文明</td><td>劳动权益、代际公平、环境保护</td></tr>
<tr><td>数字革命</td><td>数字身份、信息隐私</td></tr>
<tr><td><strong>人工智能</strong></td><td><span class="hl">「人—数据—算法」三元交互结构</span>，引发伦理范式根本性变革</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>三元结构为什么是变革</strong>：过去伦理关系发生在人与人之间，现在数据成为中介、算法成为决策参与者。责任主体不再只有人，还要追问数据从哪来、算法怎么判、谁为结果负责。本章所有议题都从这个结构里长出来。</div>`
    },
    {
      id: 'privacy',
      title: '数据隐私与安全',
      kicker: '第 1 题',
      html: `
<h4 class="sub-h">剑桥分析事件：四步链条</h4>
<div class="steps">
  <li><b>付费招募种子参与者</b>：大约 32 万美国选民被支付 2 至 5 美元，参加一项详细的个性与政治测试，测试要求他们使用自己的 Facebook 账号登录。</li>
  <li><b>连带收集好友数据</b>：应用程序同时收集点赞、测试者账户个人信息，以及他们朋友的数据，总计超过 5000 万人的原始 Facebook 数据。</li>
  <li><b>配对寻找心理模式</b>：把性格测试结果与 Facebook 数据（如点赞）配对，寻找心理模式。</li>
  <li><b>融合外部数据精准投放</b>：算法把数据与选民记录等其他来源结合，创建更高级别的记录（最初涉及 11 个关键州的 200 万人），每人拥有数百个数据点，随后基于个性数据通过高度个性化广告进行定位。</li>
</div>
<div class="note"><strong>后续处置</strong>：2020 年 4 月联邦法院正式批准美国联邦贸易委员会 FTC 与 Facebook 之间的用户个人隐私问题和解协议，Facebook 认罚 <strong>50 亿美元</strong>，并增加隐私措施、提供季度报告、成立专门的隐私委员会。</div>
<div class="cards cards--3">
  <div class="card"><span class="card-k">企业层面</span><h4 class="card-t">重塑责任意识</h4><p class="card-b">督促平台企业提升技术手段，加强权限管控、第三方接入审查与技术防护。</p></div>
  <div class="card"><span class="card-k">监管层面</span><h4 class="card-t">全球监管升级</h4><p class="card-b">推动 GDPR 严格执行，以及美国《加州消费者隐私法案》CCPA 与各国数据保护立法。</p></div>
  <div class="card"><span class="card-k">伦理层面</span><h4 class="card-t">隐私权成为核心议题</h4><p class="card-b">使隐私权与数据主权从边缘议题跃升为数字伦理与治理的核心，成为隐私保护的里程碑案例。</p></div>
</div>
<div class="note note--warn"><strong>第 1 题选 D 的理由</strong>：事件后 Facebook（现 Meta）仅遭遇罚款、市值短期波动与声誉损失，公司持续经营至今。「直接导致公司破产」明显与事实不符，因此不属于该事件的意义。</div>
<h4 class="sub-h">勒索软件成为主流</h4>
<p>近几年数据安全事件出现明显变化：勒索软件攻击成为主流，目标从企业转向政府、能源、医疗等关键领域，具有规模化、跨国化、高破坏性等特点。</p>
<div class="tbl"><table>
<thead><tr><th>时间</th><th>事件</th><th>规模与损失</th></tr></thead>
<tbody>
<tr><td>2024 年 5 月</td><td>Change Healthcare 勒索软件攻击</td><td>超过 1 亿人的个人信息和医疗保健数据被盗，损失 24.5 亿美元</td></tr>
<tr><td>2024 年 4 月</td><td>背景调查公司 NPD 遭网络攻击</td><td>29 亿个人隐私数据泄露，兜售 350 万美元</td></tr>
</tbody></table></div>
<h4 class="sub-h">三层应对措施</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">技术层面</span><h4 class="card-t">可用不可见</h4><p class="card-b">数据加密、差分隐私、隐私计算，让数据在「可用不可见」的状态下实现分析与共享。</p></div>
  <div class="card"><span class="card-k">制度政策层面</span><h4 class="card-t">分级与预案</h4><p class="card-b">数据分级分类制度、应急预案、法律法规。</p></div>
  <div class="card"><span class="card-k">个人习惯</span><h4 class="card-t">最小授权</h4><p class="card-b">强密码并定期更换，避免在公共 WiFi 下操作敏感数据，拒绝与功能无关的定位、相册、麦克风调用。</p></div>
</div>`
    },
    {
      id: 'bias',
      title: '算法偏见：成因、案例与治理',
      kicker: '第 7 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-facebias.jpg" alt="人脸识别的种族偏见：不同人群的识别评分存在系统性差异" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>人脸识别的种族偏见：不同人群的识别评分存在系统性差异</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-genderbias.jpg" alt="科技企业技术岗位的性别比例失衡，是算法与数据偏见的现实映射" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>科技企业技术岗位的性别比例失衡，是算法与数据偏见的现实映射</figcaption></figure>

<p><strong>定义</strong>：算法系统在设计、数据或决策过程中，由于数据集、算法设计缺陷或人为因素，导致对特定群体产生<strong>系统性不公平结果</strong>的现象。</p>
<div class="steps">
  <li><b>数据层面</b>：数据集样本不足、样本不均衡、样本存在歧视性关联。</li>
  <li><b>特征层面</b>：选择与偏见相关的特征，或通过「代理变量」留下算法漏洞。</li>
  <li><b>设计层面</b>：在数据集标注、算法权重和阈值等参数设定、目标函数优化过程中融入人为偏见。</li>
</div>
<div class="note note--warn"><strong>第 7 题选 A 的理由</strong>：「数据集样本充足且均衡」恰恰是<span class="hl">缓解</span>算法偏见的手段，不属于成因。B、C、D 分别对应特征层面、设计层面、数据层面的真实成因。</div>
<h4 class="sub-h">案例一 · COMPAS 再犯风险预测</h4>
<p>COMPAS 用于预测被告的再犯风险，辅助法官决定量刑、保释或假释。</p>
<div class="tbl"><table>
<thead><tr><th>群体</th><th>错误标记为「高风险」的比例</th><th>错误标记为「低风险」的比例</th></tr></thead>
<tbody>
<tr><td>黑人</td><td class="num bad">45%</td><td class="num">28%</td></tr>
<tr><td>白人</td><td class="num">23%</td><td class="num bad">48%</td></tr>
</tbody></table></div>
<div class="note"><strong>怎么读这张表</strong>：黑人被误判为高风险的比例几乎是白人的两倍，意味着更多黑人被过度惩罚；白人被误判为低风险的比例接近黑人的两倍，意味着更多白人获得轻判。两类错误方向相反，共同构成系统性不公平。根源在于训练用的历史数据本身反映着司法系统长期存在的针对少数族裔的执法偏见。</div>
<h4 class="sub-h">案例二 · 物体识别的地域偏差</h4>
<p>同一块肥皂，来自尼泊尔与来自英国，六家厂商的识别结果完全不同。</p>
<div class="tbl"><table>
<thead><tr><th>厂商</th><th>尼泊尔的肥皂</th><th>英国的肥皂</th></tr></thead>
<tbody>
<tr><td>Azure</td><td>食物、奶酪、面包、蛋糕、三明治</td><td>厕所、设计、艺术、水槽</td></tr>
<tr><td>Clarifai</td><td>食物、木材、烹饪、美味、健康</td><td>人、水龙头、医疗保健、洗手池、洗衣房</td></tr>
<tr><td>谷歌</td><td>食物、盘子、美食、安慰食品、午餐肉</td><td>产品、液体、水、流体、浴室配件</td></tr>
<tr><td>亚马逊</td><td>食品、糖果、甜点、汉堡</td><td>水槽、室内、瓶子、水龙头</td></tr>
<tr><td>沃森</td><td>食物、食品产品、姜黄、调味品</td><td>油箱、储罐、洗漱用品、肥皂分配器</td></tr>
<tr><td>腾讯</td><td>食物、盘子、物质、快餐、营养素</td><td>乳液、洗漱用品、肥皂分配器、剃须后护理</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>成因</strong>：数据集中覆盖面不全，高收入国家与家庭的样本数量相较低收入国家与家庭更为丰富。英国样本家庭月收入 1890 美元，尼泊尔样本家庭月收入 288 美元。<br>研究测试了 117 个类别、跨越从布隆迪月收入 27 美元的贫穷家庭到乌克兰月收入 10090 美元的富裕家庭。与月收入超过 3500 美元的家庭相比，识别月收入 50 美元的家庭时误差率大约增加 10%；与索马里和布基纳法索相比，识别来自美国的产品准确率提升 15% 至 20%。</div>
<h4 class="sub-h">案例三 · 亚马逊 AI 招聘</h4>
<p>投递「软件开发工程师」等技术岗位的求职者简历，如果包含「女」关键词（性别、「女子象棋俱乐部部长」、「女子学院」等）则会被打低星，而「男」则不受影响。</p>
<div class="note"><strong>课件引用的原话</strong>：「可以说这个人工智能很成功，因为它模仿了亚马逊当前的招聘状态。」训练数据来自亚马逊过去 10 年收到的简历，AI 学会了挑出男性求职者。项目 2014 年启动，2015 年发现性别歧视，经过修改但最终被放弃。<br>这个案例说明：<span class="hl">模型准确复现历史数据，不等于模型公平</span>。历史本身带有偏见时，学得越好偏得越狠。</div>
<h4 class="sub-h">治理三手段</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">数据层</span><h4 class="card-t">清洗与丰富</h4><p class="card-b">数据清洗，丰富数据集，修正隐含歧视关联。</p></div>
  <div class="card"><span class="card-k">模型层</span><h4 class="card-t">公平性约束</h4><p class="card-b">增加公平性约束，强制模型无法推断敏感属性。</p></div>
  <div class="card"><span class="card-k">决策层</span><h4 class="card-t">公平的因果性</h4><p class="card-b">推动决策基于公平的因果性，区分相关与因果。</p></div>
</div>
<div class="note note--warn"><strong>偏见会自我强化</strong>：算法偏见的各个因素事实上不是独立的，它们互相影响、作用，形成循环反馈会进一步升级、强化偏见的产生。需要技术、法律与社会监督共同协作治理。<br>「减少数据收集量」会加剧样本偏差与代表性不足，方向相反，是治理措施中的反例。</div>`
    },
    {
      id: 'xai',
      title: '决策透明与可解释性',
      kicker: '第 2、11、12 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-blackbox.jpg" alt="黑箱模型：输入被转换为输出，中间过程难以解释" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>黑箱模型：输入被转换为输出，中间过程难以解释</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-xai.jpg" alt="可解释性与模型性能的取舍：越复杂的模型往往越难解释" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>可解释性与模型性能的取舍：越复杂的模型往往越难解释</figcaption></figure>

<p>机器学习各种模型内部的决策逻辑和推理过程通常难以被解释和直观理解。这类无法追溯决策过程、工作原理不透明的模型被称为<strong>「黑盒」模型</strong>。在医疗诊断、金融风控和司法量刑等高风险领域，模型的决策透明度和可解释性成为是否采信该模型结果的重要依据。</p>
<div class="note note--key"><strong>可解释性与性能一般成反比</strong>：线性回归、逻辑回归和决策树模型具有较强的可解释性；随着模型复杂度增加、性能提升，可解释性逐步下降，逐渐变为一个功能强大的黑盒子。为提升可解释性常要牺牲一点性能。</div>
<div class="duo">
  <div class="duo-col"><h4>决策透明</h4><p class="duo-sub">是否可以像<strong>「查账」</strong>一样，一步步追溯模型的决策过程。面向审计与追责，强调过程可复现。</p></div>
  <div class="duo-col duo-col--alt"><h4>可解释性</h4><p class="duo-sub">能够像<strong>「翻译」</strong>一样，用普通用户可以理解的方式解释模型的结论。面向用户理解，强调结论可懂。</p></div>
</div>
<div class="note"><strong>课件的放贷例子</strong>：决策依据包括收入水平、教育程度、贷款额度、贷款时长；模型给出的解释是「高收入水平 → 低贷款额度」。用户被拒付时需要理由，银行也需要向监管机构说明模型逻辑。</div>
<h4 class="sub-h">可解释 AI（XAI）的三条路径</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">路径一</span><h4 class="card-t">优化模型设计</h4><p class="card-b">为输入特征分配权重，强制模型学习与人类认知一致的特征原型。事前可解释。</p></div>
  <div class="card"><span class="card-k">路径二</span><h4 class="card-t">事后解释</h4><p class="card-b">在模型训练后，通过工具或算法解释模型的决策原理。适用于已有黑盒模型。</p></div>
  <div class="card"><span class="card-k">路径三</span><h4 class="card-t">可视化解释</h4><p class="card-b">激活热力图 Grad-CAM 高亮显示决策重要依据，让人直接看到模型在看哪里。</p></div>
</div>
<div class="note note--key"><strong>第 11 题的「四可」</strong>：<span class="hl">可理解</span>（让人看懂模型为何这样判断）、<span class="hl">可审计</span>（便于发现偏见、错误与歧视）、<span class="hl">可问责</span>（出问题时能定位责任主体）、<span class="hl">可信任</span>（用户因理解而愿意采纳）。<br>准确率与运行效率属于性能指标，与可解释性无必然联系。</div>
<h4 class="sub-h">需求强度取决于风险与利害关系</h4>
<div class="tbl"><table>
<thead><tr><th>场景</th><th>影响</th><th>可解释性需求</th></tr></thead>
<tbody>
<tr><td><strong>医疗诊断</strong></td><td>直接关系患者生命健康，误诊可能致命；医生需理解 AI 为何给出该建议，才能判断合理性、追责、必要时推翻</td><td class="good">最高</td></tr>
<tr><td><strong>银行风控拒付</strong></td><td>直接关涉用户财产安全与权益，且需合规审计</td><td class="good">高</td></tr>
<tr><td>司法量刑</td><td>关涉人身自由与重大权益</td><td class="good">高</td></tr>
<tr><td>电影推荐</td><td>仅影响娱乐体验</td><td>低</td></tr>
<tr><td>实验室猫狗分类</td><td>实验演示，无实质后果</td><td>低</td></tr>
<tr><td>城市路灯控制</td><td>简单规则，决策后果轻微</td><td>低</td></tr>
<tr><td>游戏娱乐、音乐创作、绘画艺术</td><td>低风险、主观审美，即使算法说不清理由后果也可控</td><td>低</td></tr>
</tbody></table></div>`
    },
    {
      id: 'subjectivity',
      title: '人类主体性与技术依赖',
      kicker: '第 3、4、6 题',
      html: `
<p>十八世纪近现代哲学人类学的思想先驱、德国哲学家<strong>康德</strong>提出了人类主体性的哲学思想，表达人作为主体所具有的<strong>能动性、自主性、自我选择、自我决定</strong>。AI 时代，当技术打破了人类与机器的边界、算法深度参与人类决策、技术便利导致能力退化，人类的主体性开始逐渐模糊。</p>
<h4 class="sub-h">信息茧房</h4>
<div class="note"><strong>概念出处</strong>：哈佛大学凯斯·桑斯坦在 2006 年出版的《信息乌托邦：众人如何生产知识》中提出——「公众只注意自己选择的东西和使自己愉悦的通讯领域，久而久之，会将自身桎梏于像蚕茧一般的『茧房』中。」<br>智能推荐算法营造「信息舒适区」，固化认知范围，形成「认知茧房」，造成个人意见退化。也称过滤气泡 Filter Bubble。</div>
<div class="note note--key"><strong>课件给出的量化证据</strong>：平台通过 2 万以上特征维度构建用户画像；剑桥大学实验显示，用户在社交平台点击 5 次同类内容后，算法推荐相似信息的概率提升至 92%。每一次点击都给算法的判断增添一份砝码，形成「越喜欢越推送」的闭环。</div>
<div class="cards cards--3">
  <div class="card"><span class="card-k">危害一</span><h4 class="card-t">个体认知局限</h4><p class="card-b">偏见固化，走向极端化认知，接触多元观点的机会减少。</p></div>
  <div class="card"><span class="card-k">危害二</span><h4 class="card-t">社会沟通障碍</h4><p class="card-b">共识难以形成，网络暴力加剧。</p></div>
  <div class="card"><span class="card-k">危害三</span><h4 class="card-t">阻碍创新</h4><p class="card-b">威胁民主政治，独立判断与批判思考能力被削弱。</p></div>
</div>
<div class="tbl"><table>
<thead><tr><th>应对层次</th><th>具体做法</th></tr></thead>
<tbody>
<tr><td>个体层面</td><td>主动破茧：尝试异质信息，参与多元社交</td></tr>
<tr><td>平台层面</td><td>承担责任：优化推荐算法，增加算法透明度</td></tr>
<tr><td>政府层面</td><td>强化法律监管</td></tr>
<tr><td>社会层面</td><td>促进跨领域交流</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>第 3 题的解法</strong>：题干问「主要挑战」，指向负面效果。A 增强自主学习能力、C 提升决策效率、D 激发创新思维都是正面效果，与题干指向相悖，直接排除。用户的选择表面上自由，实则被算法预先框定，从「信息的主宰者」退化为「被喂养的接受者」。</div>
<h4 class="sub-h">技术依赖导致能力退化</h4>
<div class="duo">
  <div class="duo-col"><h4>正向证据</h4><p class="duo-sub">经过多回合训练测试获得许可的伦敦出租车司机，海马体后部蕴含更多神经元及其他组织，导航能力被强化。说明主动使用空间记忆能塑造大脑。</p></div>
  <div class="duo-col duo-col--alt"><h4>反向证据</h4><p class="duo-sub">GPS 依赖者负责空间记忆的后海马体体积年均减少 0.8%，萎缩程度与日均 GPS 使用时长正相关。过度依赖 AI 还可能造成推理、逻辑构建、手眼协调等能力退化。</p></div>
</div>
<h4 class="sub-h">怎样才算保持主体性</h4>
<div class="tbl"><table>
<thead><tr><th>做法</th><th>判定</th><th>原因</th></tr></thead>
<tbody>
<tr><td>完全按 AI 建议决策，不做任何思考</td><td class="bad">盲从</td><td>把判断权完全让渡给 AI，主体性丧失</td></tr>
<tr><td>拒绝使用 AI 提供的任何建议</td><td class="bad">全盘拒绝</td><td>拒绝技术赋能，是消极姿态，谈不上主体性发挥</td></tr>
<tr><td>随机选择 AI 给出的多个建议之一</td><td class="bad">放弃评估</td><td>放弃了理性评估，同样是主体缺位</td></tr>
<tr><td>仅根据他人意见决定是否采纳</td><td class="bad">外包判断</td><td>把判断权让给他人，同样是主体性丧失</td></tr>
<tr><td><strong>批判性分析后结合自身判断做出决策</strong></td><td class="good">人主导、AI 辅助</td><td>既利用 AI 的信息优势，又保留审查、价值权衡与最终裁决权</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>第 4、6 题同一口径</strong>：不盲从、不排斥、不外包判断，以「我」的知识、经验与价值观为锚，对 AI 建议进行<span class="hl">批判性评估 → 自主选择 → 承担责任</span>。</div>`
    },
    {
      id: 'responsibility',
      title: '决策权让渡与责任归属',
      kicker: '第 5 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-sae.jpg" alt="SAE 自动驾驶分级：Level 3 是驾驶员与系统责任划分的关键分界" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>SAE 自动驾驶分级：Level 3 是驾驶员与系统责任划分的关键分界</figcaption></figure>

<p>决策权逐步让渡给算法，复杂场景的责任归属难以划分。AI 目前<strong>不具备法律人格</strong>，无法独立承担责任，因此责任须回溯到人。</p>
<h4 class="sub-h">医疗 AI 的责任分担</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">开发者</span><h4 class="card-t">产品责任</h4><p class="card-b">对模型缺陷、不透明、未充分验证、说明义务缺失负责。</p></div>
  <div class="card"><span class="card-k">医生</span><h4 class="card-t">专业责任</h4><p class="card-b">作为最终临床决策者，对是否采纳 AI 建议、是否尽到合理审慎义务负责。</p></div>
  <div class="card"><span class="card-k">医院</span><h4 class="card-t">机构责任</h4><p class="card-b">通常承担替代责任，但并非唯一责任主体。</p></div>
</div>
<div class="note note--warn"><strong>第 5 题选 C</strong>：最合理的是按<span class="hl">过错程度</span>进行责任分担，「全有」或「全无」的简单划分不成立。问题成因往往是多方的，把责任全推给开发者或全推给医生都不成立。</div>
<h4 class="sub-h">自动驾驶：SAE 分级与 L2 要求</h4>
<p>国际汽车工程师协会 SAE 的分级体系是判断「智驾」概念的依据。主流量产车型处于 L2 级辅助驾驶。</p>
<div class="note"><strong>《智能网联汽车组合驾驶辅助系统安全要求》（征求意见稿）对 L2 级的五项要求</strong></div>
<div class="steps">
  <li><b>脱离检测</b>：系统需具备手部脱离检测和视线脱离检测功能，检测到脱离时发出报警并强制退出系统。</li>
  <li><b>脱离惩罚</b>：多次脱离方向盘后，系统将在至少 30 分钟内禁用。</li>
  <li><b>宣传用语</b>：禁止使用「自动驾驶」「无人驾驶」等误导性宣传词。</li>
  <li><b>场景标注</b>：需明确标注适用场景（如高速公路、城市道路）及限制条件。</li>
  <li><b>数据记录</b>：需完整记录车辆运行数据以支持事故责任判定。</li>
</div>
<h4 class="sub-h">两起标志性诉讼</h4>
<div class="tbl"><table>
<thead><tr><th>案件</th><th>经过</th><th>判决与意义</th></tr></thead>
<tbody>
<tr><td>2019 年佛罗里达 Model S 致命车祸</td><td>2019 年 4 月 25 日，司机开启 Autopilot 返家途中俯身捡拾掉落手机，车辆以超过 60 英里（96 公里）每小时的速度冲进十字路口发生碰撞，一死一伤</td><td>2025 年 8 月 1 日佛罗里达州联邦南区地方法院裁定特斯拉承担 <strong>33% 责任</strong>，支付 2 亿美元惩罚性赔偿，总赔偿 2.43 亿美元。这是特斯拉在美国自动驾驶安全责任诉讼中的首次败诉</td></tr>
<tr><td>2021 年 Model 3 追尾数据知情权案</td><td>2021 年 2 月张女士父亲驾驶的 Model 3 发生追尾，家属质疑刹车失灵，历经四年诉讼</td><td>2025 年 9 月 16 日法院责令特斯拉提供事故发生前半小时的完整行车数据。法律首次支持消费者获取完整智能汽车数据的诉求，认定<strong>消费者知情权优先于企业商业秘密主张</strong></td></tr>
</tbody></table></div>
<h4 class="sub-h">责任归属认定的五项措施</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">法规</span><h4 class="card-t">完善立法</h4><p class="card-b">如《智能网联汽车组合驾驶辅助系统安全要求》。</p></div>
  <div class="card"><span class="card-k">记录</span><h4 class="card-t">EDR 事件记录器</h4><p class="card-b">记录事故前后的车辆运行数据。</p></div>
  <div class="card"><span class="card-k">监测</span><h4 class="card-t">DMS 驾驶员状态监测</h4><p class="card-b">监测驾驶员分心、疲劳等情况。</p></div>
  <div class="card"><span class="card-k">存证</span><h4 class="card-t">区块链加密存储</h4><p class="card-b">确保车辆数据不可篡改。</p></div>
  <div class="card"><span class="card-k">复现</span><h4 class="card-t">数字孪生</h4><p class="card-b">建模还原事故场景，复现 AI 决策过程。</p></div>
</div>`
    },
    {
      id: 'genai',
      title: '生成式 AI 的认知冲击',
      kicker: '课件议题',
      html: `
<div class="cards cards--3">
  <div class="card"><span class="card-k">冲击一</span><h4 class="card-t">数据集质量</h4><p class="card-b">数据集偏差造成模型幻觉；明显偏向性内容引发信息极化和社会分化。</p></div>
  <div class="card"><span class="card-k">冲击二</span><h4 class="card-t">版权争议</h4><p class="card-b">大模型训练数据可能涉及的侵权争议，以及生成内容是否具有独立版权的争议。</p></div>
  <div class="card"><span class="card-k">冲击三</span><h4 class="card-t">造假与欺骗</h4><p class="card-b">使用生成式 AI 造假带来更大风险。2025 年第一季度全球 Deepfake 诈骗损失高达 2 亿美元，普通民众受害者占比 34%，逼近名人政客的 41%。</p></div>
</div>
<h4 class="sub-h">两个版权争议案例</h4>
<div class="duo">
  <div class="duo-col"><h4>《太空歌剧院》</h4><p class="duo-sub">由 Midjourney 生成的绘画作品，2022 年获美国科罗拉多州博览会美术大赛冠军。传统艺术家认为使用 AI 生成图像并获奖完全是作弊；获奖者艾伦表示虽采用 AI 画图，但身为创作者也花费大量创作时间与精力。2023 年他试图为作品申请版权保护遭驳回，2024 年 9 月因这份被拒绝的申请提起上诉。</p></div>
  <div class="duo-col duo-col--alt"><h4>AI 孙燕姿</h4><p class="duo-sub">孙燕姿因独具辨识度的音色与唱腔成为 AI 宠儿，AI 孙燕姿走红 B 站，相关视频上千条，翻唱歌曲超过百首，最受欢迎的歌曲播放量已超百万，由此引发「AI 克隆是否侵权」热议。她本人的回应是：「它赫然耸现并将威胁到成千上万个由人类创造的工作，比如法律、医学、会计等行业，以及目前我们正在谈论的，唱歌。」</p></div>
</div>
<h4 class="sub-h">两部关键法规</h4>
<div class="tbl"><table>
<thead><tr><th>法规</th><th>时间</th><th>要点</th></tr></thead>
<tbody>
<tr><td>《生成式人工智能服务管理暂行办法》</td><td>国家网信办等七部门发布，2023 年 8 月 15 日正式实施</td><td>针对训练数据的来源、质量和生成内容的标记与使用，规范服务提供者行为</td></tr>
<tr><td>欧盟《人工智能法案》</td><td>2024 年 8 月 1 日正式生效</td><td>全球首部全面监管人工智能的法规。修正案增加通用人工智能与基础模型相关定义，要求生成式 AI 遵守额外透明度要求，如披露内容来源、明确要求设计模型禁止非法生成</td></tr>
</tbody></table></div>
<div class="note"><strong>立法动议</strong>：有代表在 2025 年全国两会上提交了「关于加强 AI 换脸拟声违法侵权重灾区治理的建议」。</div>`
    },
    {
      id: 'affective',
      title: '情感计算与伦理边界',
      kicker: '第 8、9、10 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch8-emotion.jpg" alt="六种基本情绪：情感计算试图识别这些人类表情，也带来伦理边界问题" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>六种基本情绪：情感计算试图识别这些人类表情，也带来伦理边界问题</figcaption></figure>

<p><strong>情感计算 Affective Computing</strong> 由 MIT 的 Rosalind Picard 于 1995 年提出，经典定义是「与情感相关、源于情感、或刻意影响情感的计算」。目标是让计算机具备<strong>识别、理解、表达、响应乃至适度模拟</strong>人类情感的能力，提升人机交互的自然性与有效性。</p>
<div class="note"><strong>明斯基在《情感机器》中的判断</strong>：「问题不在于智能机器能否有情感，而在于机器实现智能时怎么能没有情感。」2024 年 12 月，「情感计算」入选 2024 年度计算机科学技术研究前沿热点词。</div>
<div class="note note--warn"><strong>第 8 题逐项</strong>：A 防止 AI 产生自主情感、确保绝对理性，方向相反；B 替代人类所有情感劳动，过度化；D 完全理解和体验人类内心感受，已属强人工智能与意识层面的幻想，超出情感计算范畴。C 识别、理解、响应甚至模拟人类情感，是标准定义。</div>
<h4 class="sub-h">文本情感识别：四类词典</h4>
<div class="tbl"><table>
<thead><tr><th>词典</th><th>作用</th><th>例子</th></tr></thead>
<tbody>
<tr><td>积极情感词典</td><td>包含正向情绪词汇，赋予正向分值</td><td>快乐</td></tr>
<tr><td>消极情感词典</td><td>收录负面词汇，赋予负向分值</td><td>糟糕</td></tr>
<tr><td>程度词词典</td><td>量化情感强度，调整情感词权重</td><td>极其</td></tr>
<tr><td>否定词词典</td><td>反转情感极性</td><td>不、没有</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>课件例句</strong>：「这部 电影 一点 也 不 好看」——「好看」是正向，「一点也」强化，「不」反转，最终判定为<span class="hl">负面情绪</span>。这条链路展示了四类词典如何协同工作。</div>
<div class="duo">
  <div class="duo-col"><h4>情感词典的优势</h4><ul>
    <li>规则透明、可控性强</li>
    <li>可根据需要调整、定制规则</li>
    <li>情感词覆盖率高的场景（如商品评论）分类准确率可达 80% 以上</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>情感词典的局限</h4><ul>
    <li><strong>依赖词典质量</strong>：网络新词需人工标注，维护成本高（如「yyds」）</li>
    <li><strong>跨领域适应性差</strong>：同一词在不同语境含义可能相反（如「变态」）</li>
    <li><strong>忽略上下文语义</strong>：难以处理反讽或复杂句式的情感反转（如「这操作真是 6」）</li>
  </ul></div>
</div>
<p>在新兴网络语言或复杂语义场景，需结合机器学习模型（如 BERT）弥补不足。</p>
<h4 class="sub-h">语音情感识别 SER</h4>
<p>结合语音识别、信号处理、深度学习等多种技术的交叉学科领域。课件引用的 ICASSP 2022 工作把三种声学特征当作三个模态处理：</p>
<div class="tbl"><table>
<thead><tr><th>模态</th><th>编码网络</th></tr></thead>
<tbody>
<tr><td>原始音频信号</td><td>wav2vec2</td></tr>
<tr><td>MFCC 梅尔频率倒谱系数</td><td>BiLSTM</td></tr>
<tr><td>梅尔谱</td><td>AlexNet</td></tr>
</tbody></table></div>
<p>先把 utterance 级别的原始音频切分，对每段提取 MFCC 与梅尔谱，三路编码后用 co-attention 模块做多模态信息融合，在 IEMOCAP 数据集上取得效果。</p>
<h4 class="sub-h">视觉情感识别</h4>
<div class="cards">
  <div class="card"><span class="card-k">表情</span><h4 class="card-t">Ekman 六种基础表情</h4><p class="card-b">人脸情感识别主要指表情识别。课件进一步展示基于六种基础表情的疼痛表情研究：为识别 ICU 非语言患者疼痛建立自定义表达式，包含眼睑收紧（AU9+AU10）、皱眉（AU4）、上唇抬起皱鼻（AU10）、下唇抬起（AU17）、闭眼（AU43）等动作单元，用「手伸入冰水」这一常见疼痛测试范式验证有效性。</p></div>
  <div class="card"><span class="card-k">姿态</span><h4 class="card-t">肢体语言</h4><p class="card-b">站立姿势、行走方式、手势都可成为情感判断依据。同一个人在不同时候走路姿势也会变化：步伐匆忙、头比平时低，可能意味着心事重重。</p></div>
</div>
<h4 class="sub-h">生理信号</h4>
<p>脉搏、血压、呼吸频率、皮肤电反应等生理信号表达的情感<strong>更为真实可靠</strong>，因为它们难以被主观伪装。实际应用中情感计算系统需要同步采集多种情感信号。</p>
<h4 class="sub-h">应用与风险</h4>
<div class="duo">
  <div class="duo-col"><h4>四个应用领域</h4><ul><li>智能客服</li><li>教育培训</li><li>医疗健康</li><li>智能家居</li></ul></div>
  <div class="duo-col duo-col--alt"><h4>三类面临风险</h4><ul><li>用户过度情感依赖</li><li>情感迷失</li><li>影响用户的价值观和行为选择</li></ul></div>
</div>
<div class="note note--warn"><strong>课件的关键提醒</strong>：机器模拟的情感是对人类情感不停地观察和计算，它并不真正共情。这一点决定了情感计算的伦理边界。</div>
<h4 class="sub-h">知情同意原则</h4>
<p>知情同意 Informed Consent 要求三步：<strong>充分告知 → 自由理解 → 自愿同意</strong>。</p>
<div class="tbl"><table>
<thead><tr><th>第 10 题选项</th><th>违反什么</th></tr></thead>
<tbody>
<tr><td>A 秘密记录分析学生面部表情</td><td class="bad">侵犯知情权与隐私</td></tr>
<tr><td>B 仅凭一次情绪识别就永久标记学生</td><td class="bad">违反数据准确性与反歧视原则</td></tr>
<tr><td>C 明确告知情感数据收集目的并获得知情同意</td><td class="good">完整践行告知目的加获得同意，唯一合规</td></tr>
<tr><td>D 将学生焦虑沮丧状态实时公开展示排行榜</td><td class="bad">严重侵犯隐私并可能造成心理伤害</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>第 9 题的判别</strong>：车载系统分析驾驶员面部表情、语音语调、握持力度，判断疲劳与分心并报警，是从人身上<span class="hl">读取</span>状态，属<strong>情感识别</strong>。情感模拟与生成是机器「表演」出某种情绪（如虚拟人微笑）；情感操纵是利用情感信息影响、诱导用户，通常带有负面伦理含义。</div>`
    },
    {
      id: 'governance',
      title: '人工智能的未来治理',
      kicker: '课件展望',
      html: `
<div class="cards cards--3">
  <div class="card"><span class="card-k">方向一</span><h4 class="card-t">多方协作治理机制</h4><p class="card-b">跨学科、跨领域，整合各方专业知识与经验，确保治理措施的全面性和有效性。人工智能治理攸关全人类命运，多利益攸关方共同参与，实现全球共识走向全球共治。多方协作、全球共治必将成为未来人工智能治理的总体趋势。</p></div>
  <div class="card"><span class="card-k">方向二</span><h4 class="card-t">技术普惠与可持续发展</h4><p class="card-b">全球协作、携手弥合智能鸿沟，实现技术普惠，建立人人可及的人工智能。通过构建语料库、行业大模型和应用场景，助力发展中国家开发自主可控的人工智能主权大模型，同时传承与保护本地语言及文化。</p></div>
  <div class="card"><span class="card-k">方向三</span><h4 class="card-t">长尾风险与动态治理框架</h4><p class="card-b">「长尾」来自统计学，指一长串可能性低但却可能发生的情况。应对方式是敏捷治理与适应性治理。</p></div>
</div>
<div class="duo">
  <div class="duo-col"><h4>敏捷治理</h4><p class="duo-sub">快速识别问题和风险，短时间做出响应并调整。强调速度。</p></div>
  <div class="duo-col duo-col--alt"><h4>适应性治理</h4><p class="duo-sub">通过长期监测体系，确保治理体系能够持续适应技术和社会环境的变化。强调持久。</p></div>
</div>
<div class="note note--key"><strong>本章核心考点六条</strong><br>① 数据伦理事件：剑桥分析泄露推动隐私立法、企业责任、监管升级。<br>② 算法偏见：来源于数据不均衡、特征选择、标注歧视、设计者主观偏见。<br>③ 可解释性 XAI：高风险场景（医疗、金融、司法）需求最强，目的是理解、审计、问责、信任。<br>④ 人类主体性：人主导、AI 辅助，保持批判性评估与最终裁决权。<br>⑤ 信息茧房：算法推荐的负面效应，削弱主体性。<br>⑥ 情感计算：识别 → 理解 → 响应 → 模拟人类情感，须遵守知情同意，反对标签化与操纵。</div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 8.5,
      stem: '以下哪项不属于 Facebook 数据泄露事件的重要意义？（　）',
      opts: ['督促企业提升技术手段、重塑责任意识', '推动了全球监管改革与升级', '使「隐私权」成为数字伦理的核心议题', '直接导致 Facebook 公司破产'],
      ans: 'D',
      why: '<p>2018 年曝光的剑桥分析事件涉及超过 8700 万 Facebook 用户数据被不当获取用于政治画像与精准营销。历史意义体现在三个层面：企业层面促使平台反思数据治理、加强权限管控与第三方接入审查（A）；监管层面推动 GDPR 严格执行以及美国 CCPA 与各国数据保护立法（B）；伦理层面使隐私权与数据主权成为数字伦理核心议题（C）。</p><p>事件后 Facebook（现 Meta）仅遭遇罚款、市值短期波动与声誉损失，2020 年 4 月与 FTC 达成和解认罚 50 亿美元，公司持续经营至今，并未破产。</p>',
      point: '重大数据伦理事件的实际后果',
      anchor: '三个层面对应 A、B、C'
    },
    {
      n: 2, type: 'single', score: 8.5,
      stem: '在算法伦理与数据治理中，决策透明与可解释性在以下哪个领域更为重要？（　）',
      opts: ['游戏娱乐', '医疗诊断', '音乐创作', '绘画艺术'],
      ans: 'B',
      why: '<p>可解释性的重要程度与决策风险的高低、是否涉及人身安全与重大权益正相关。医疗诊断直接关系患者生命健康，误诊可能致命；医生需要理解 AI 为何给出某一诊断建议，才能判断其合理性、追责、并在必要时推翻。</p><p>游戏娱乐、音乐创作、绘画艺术属于低风险、主观审美领域，即使算法说不清理由后果也可控，需求相对较弱。</p>',
      point: '按风险等级判断可解释性需求',
      anchor: '医疗、金融、司法需求最强'
    },
    {
      n: 3, type: 'single', score: 8.5,
      stem: '在 AI 时代，当智能推荐算法持续为用户推送单一类型信息，导致用户认知范围固化，这种现象对人类主体性带来的主要挑战是？（　）',
      opts: ['增强人类自主学习能力', '形成「认知茧房」，模糊人类主体性', '提升人类决策效率', '激发人类创新思维'],
      ans: 'B',
      why: '<p>题干描述的正是信息茧房 Information Cocoon 与过滤气泡 Filter Bubble：算法基于历史偏好不断推送同质化内容，使用户长期处于自我强化的信息环境中。危害在于认知视野被窄化、接触多元观点机会减少；用户的选择表面自由实则被算法预先框定，独立判断与批判思考能力被削弱；久而久之从信息的主宰者退化为被喂养的接受者。</p><p>A、C、D 均为正面效果，与题干「主要挑战」的负面指向相悖。</p>',
      point: '信息茧房的负面效应',
      anchor: '问挑战就选负面项'
    },
    {
      n: 4, type: 'single', score: 8.5,
      stem: '以下哪种情况最能体现人类在 AI 决策过程中的主体性？（　）',
      opts: ['完全按照 AI 给出的建议进行决策，不做任何思考', '对 AI 给出的建议进行批判性分析后，结合自身判断做出决策', '拒绝使用 AI 提供的任何决策建议', '随机选择 AI 给出的多个建议中的一个'],
      ans: 'B',
      why: '<p>人类主体性强调人在决策中居于主导、能动、负责任的核心地位，正确模式是人主导、AI 辅助。</p><ul><li>A：盲从，把判断权完全让渡给 AI。</li><li>C：全盘拒绝，拒绝技术赋能，是消极姿态。</li><li>D：随机选，放弃理性评估，同样主体缺位。</li><li>B：既利用 AI 的信息优势，又保留审查、价值权衡与最终裁决权。</li></ul>',
      point: '主体性的判定标准',
      anchor: '批判性分析 + 自身判断'
    },
    {
      n: 5, type: 'single', score: 8.5,
      stem: '在医疗领域使用 AI 辅助诊断时，若因 AI 模型决策不透明导致医生误判病情，责任应如何划分？（　）',
      opts: ['完全由 AI 模型开发者承担责任', '完全由使用 AI 模型的医生承担责任', '医生和 AI 模型开发者根据过错程度共同承担责任', '由医院行政管理部门承担责任'],
      ans: 'C',
      why: '<p>AI 目前不具备法律人格，无法独立承担责任，责任须回溯到人。在 AI 加医生共同决策的场景中，问题成因往往是多方的：开发者对模型缺陷、不透明、未充分验证、说明义务缺失负有产品责任；医生作为最终临床决策者，对是否采纳建议、是否尽到合理审慎义务负有专业责任；医院通常承担替代责任与机构责任，但并非唯一责任主体。</p><p>因此最合理的是按过错程度进行责任分担，「全有」或「全无」的简单划分不成立。</p>',
      point: '多方过错下的责任分担',
      anchor: '按过错程度共同承担'
    },
    {
      n: 6, type: 'single', score: 8.5,
      stem: '人类在面对 AI 的决策建议时，保持主体性的关键在于？（　）',
      opts: ['完全忽视 AI 的建议', '盲目跟从 AI 的建议', '结合自身知识和价值观对 AI 建议进行评估和选择', '仅根据他人的意见来决定是否采纳 AI 建议'],
      ans: 'C',
      why: '<p>与第 4 题一脉相承。保持主体性的核心是：不盲从（排除 B）；不排斥，否则等于放弃 AI 的工具价值（排除 A）；不外包判断，把判断权让给他人同样是主体性丧失（排除 D）；以「我」的知识、经验与价值观为锚，对 AI 建议进行批判性评估、自主选择、承担责任（C）。</p>',
      point: '主体性的四个要点',
      anchor: '不盲从、不排斥、不外包判断'
    },
    {
      n: 7, type: 'single', score: 8.5,
      stem: '算法偏见产生的原因不包括以下哪项？（　）',
      opts: ['数据集样本充足且均衡', '选择与偏见相关特征', '在参数设定过程中融入人为偏见', '数据集标注存在歧视性关联'],
      ans: 'A',
      why: '<p>算法偏见的典型来源分三层：数据层面的样本不均衡、历史歧视被编码、标注含偏见（B、D）；设计层面的特征选择、目标函数、参数设置中嵌入设计者主观偏见（C）；交互层面的部署后与用户反馈形成偏见放大循环。</p><p>「样本充足且均衡」恰恰是缓解算法偏见的手段，不属于成因。课件三个案例：COMPAS 对黑人的高风险误判率 45% 对白人 23%；物体识别对低收入国家家庭误差率增加约 10%；亚马逊 AI 招聘对含「女」关键词简历打低星。</p>',
      point: '偏见的成因与缓解手段方向相反',
      anchor: '充足均衡是解药不是病因'
    },
    {
      n: 8, type: 'single', score: 8.5,
      stem: '情感计算（Affective Computing）的核心目标是？（　）',
      opts: ['防止人工智能产生自主情感，确保其绝对理性', '让机器人能够替代人类的所有情感劳动，如护理和陪伴', '通过人工智能识别、理解、响应甚至模拟人类情感', '开发能够完全理解和体验人类内心感受的强人工智能'],
      ans: 'C',
      why: '<p>情感计算由 MIT 的 Rosalind Picard 于 1995 年提出，定义为与情感相关、源于情感、或刻意影响情感的计算。目标是让计算机具备识别、理解、表达、响应乃至适度模拟人类情感的能力，提升人机交互的自然性与有效性。</p><ul><li>A：方向相反，情感计算并不排斥情感。</li><li>B：替代所有情感劳动过度化。</li><li>D：完全理解与体验内心感受已属强人工智能与意识层面的幻想，超出情感计算范畴。</li></ul><p>明斯基在《情感机器》中说：问题不在于智能机器能否有情感，而在于机器实现智能时怎么能没有情感。</p>',
      point: '情感计算的定义边界',
      anchor: '识别、理解、响应、模拟'
    },
    {
      n: 9, type: 'single', score: 8.5,
      stem: '车载系统分析驾驶员面部表情、语音语调、握持力度，判断疲劳或分心并报警，体现情感计算的哪种应用？（　）',
      opts: ['情感模拟', '情感识别', '情感生成', '情感操纵'],
      ans: 'B',
      why: '<p>系统通过多模态信号（视觉加语音加行为）感知并推断人的情绪与状态，属于典型的情感识别 Affective Recognition，是从人身上读取状态。</p><ul><li>A、C：情感模拟与生成是机器表演出某种情绪，如虚拟人微笑。</li><li>D：情感操纵是利用情感信息影响、诱导用户，通常带有负面伦理含义。</li></ul>',
      point: '读取状态与表演情绪的区分',
      anchor: '从人身上读取 = 识别'
    },
    {
      n: 10, type: 'single', score: 8.5,
      stem: '从「知情同意」伦理原则出发，开发基于情感计算的「智能学习伙伴」，哪种做法最符合伦理规范？（　）',
      opts: ['秘密记录分析学生面部表情', '仅凭一次情绪识别就永久标记学生', '明确告知用户情感数据收集目的并获得知情同意', '将学生焦虑沮丧状态实时公开展示排行榜'],
      ans: 'C',
      why: '<p>知情同意 Informed Consent 要求充分告知、自由理解、自愿同意三步。</p><ul><li>A：秘密采集，侵犯知情权与隐私。</li><li>B：单次判定即永久标签化，违反数据准确性与反歧视原则。</li><li>D：公开展示情绪状态，严重侵犯隐私并可能造成心理伤害。</li><li>C：完整践行告知目的加获得同意，是唯一合规做法。</li></ul>',
      point: '知情同意的三步要求',
      anchor: '告知目的 + 获得同意'
    },
    {
      n: 11, type: 'single', score: 8.5,
      stem: '在人工智能领域，我们追求模型的「决策透明」与「可解释性」，其主要目的是？（　）',
      opts: ['为了理解和信任模型的决策逻辑，便于发现偏差、进行问责和建立信任', '为了提升模型在训练数据集上的准确率至 100%', '为了让模型的运行速度更快，计算资源消耗更少', 'solely（仅）为了让非专业人士觉得技术更酷、更神秘'],
      ans: 'A',
      why: '<p>可解释 AI（XAI）的核心目的可概括为四可：可理解（让人看懂模型为何这样判断）、可审计（便于发现偏见、错误与歧视）、可问责（出问题时能定位责任主体）、可信任（用户因理解而愿意采纳）。</p><p>B 准确率与 C 效率属于性能指标，与可解释性无必然联系；事实上可解释性与性能一般成反比，为提升可解释性常要牺牲一点性能。D 明显荒谬。</p><p>课件区分：决策透明像查账，一步步追溯决策过程；可解释性像翻译，用普通用户能理解的方式解释结论。</p>',
      point: 'XAI 的四可目的',
      anchor: '理解、审计、问责、信任'
    },
    {
      n: 12, type: 'single', score: 8.5,
      stem: '以下哪个场景最能体现对人工智能决策可解释性的需求？（　）',
      opts: ['一个用于推荐电影的网络流媒体算法', '一个用于识别信用卡欺诈的银行风控系统，该系统会拒绝用户的交易', '一个在实验室中用于识别猫和狗的图像分类模型', '一个用于控制城市路灯开关的自动化系统'],
      ans: 'B',
      why: '<p>可解释性需求强度取决于决策的影响范围与利害关系。电影推荐仅影响娱乐体验，需求低；实验室猫狗分类无实质后果，需求低；路灯控制是简单规则、后果轻微，需求低。</p><p>银行风控拒付直接关涉用户财产安全与权益，且需合规审计：用户被拒付需要理由，银行也需要向监管机构说明模型逻辑，是最典型的强可解释性需求场景。</p>',
      point: '按利害关系排序',
      anchor: '与第 2 题同一判据'
    }
  ]
});