/* 第 7 章 · 身体与智能：具身智能与多模态导航 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 7,
  title: '身体与智能',
  subtitle: '具身智能与多模态导航',
  hue: '#84cc16',
  glyph: '07',
  tagline: '智能需要一个身体，也需要一个世界',
  exam: {
    name: '第七章作业',
    due: '2026-11-28T23:59:00+08:00',
    rule: '单选 24 道',
    note: '答案串 B C B B C C C B B A B B C D D A C D B B C B C C。文档题号与原卷有三处互换：第 5 题对应原卷第 6 题，第 6 题对应原卷第 5 题，第 11 题对应原卷第 10 题。'
  },
  lead: '本章 24 道题分成三块：LLM / VLM / VLA / VLN 四个缩写的辨析（9 道）、四类导航方式的判别（12 道）、算法偏见治理与强化学习（3 道）。缩写看输入输出，导航看用户给了什么，两块都能用一句话口诀秒判。',
  sections: [
    {
      id: 'eai',
      title: '具身智能：身体、环境、智能的耦合',
      kicker: '课件概念',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-eai.jpg" alt="具身智能：把大模型的认知能力接入机器人，实现感知—决策—动作闭环" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>具身智能：把大模型的认知能力接入机器人，实现感知—决策—动作闭环</figcaption></figure>

<p class="lead">具身智能（Embodied AI, EAI）强调智能是<strong>身体、环境与智能体三者互动的产物</strong>。传统 AI 把智能当作纯符号运算，具身智能认为没有身体与环境的反馈，智能无法真正形成。</p>
<div class="timeline">
  <div class="tl-item"><span class="tl-year">20世纪初</span><div class="tl-body"><h4>具身认知思想萌芽</h4><p>哲学与心理学提出认知依赖于身体经验，为后来的技术路线奠定思想基础。</p></div></div>
  <div class="tl-item"><span class="tl-year">2010</span><div class="tl-body"><h4>与深度学习结合</h4><p>深度神经网络让机器人具备从原始传感器数据学习感知与策略的能力。</p></div></div>
  <div class="tl-item"><span class="tl-year">2020</span><div class="tl-body"><h4>多模态、仿生与大模型汇流</h4><p>视觉语言模型、仿生结构设计与大语言模型三条线同时推进，具身智能进入加速期。</p></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">2024</span><div class="tl-body"><h4>具身小脑列入十大前沿</h4><p>「具身小脑」作为负责运动协调与实时控制的关键部件，被列入年度十大科技前沿。</p></div></div>
  <div class="tl-item tl-item--hot"><span class="tl-year">2025</span><div class="tl-body"><h4>写入政府工作报告</h4><p>具身智能入选两会新词矩阵，正式纳入国家战略。</p></div></div>
</div>
<div class="note note--key"><strong>本章小结的四句话</strong>：身体—环境—智能深度耦合，解决传统 AI 在物理世界的适应性难题；VLA 与世界模拟成熟后将渗透家庭服务与工业自动化；具身智能成为通往通用人工智能 AGI 的关键路径；挑战在于动态环境的实时决策与跨模态知识迁移，需要仿生设计与类脑计算的融合创新。</div>`
    },
    {
      id: 'robot',
      title: '机器人：从词源到系统组成',
      kicker: '课件概念',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-robot.jpg" alt="机器人系统组成：机械臂、传感器与控制平台的协同" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>机器人系统组成：机械臂、传感器与控制平台的协同</figcaption></figure>

<div class="note"><strong>Robot 一词的来历</strong>：1920 年捷克作家卡雷尔·凯佩克的剧本《罗萨姆的万能机器人》，词根来自捷克语 <em>Robota</em>，意为「仆人」或「强制劳动」。</div>
<p><strong>机器人定义</strong>：一种自动化机器，具备与人或生物相似的智能能力。</p>
<div class="duo">
  <div class="duo-col"><h4>非自主机器人</h4><ul>
    <li>由人类控制或预先编程执行固定动作</li>
    <li>无独立决策能力</li>
    <li>承担重复性、单一任务</li>
    <li>典型：流水线机械臂、遥控玩具车</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>自主机器人</h4><ul>
    <li>多种传感器 + 控制系统 + 智能算法</li>
    <li>能感知环境</li>
    <li>根据目标自主决策</li>
    <li>典型：扫地机器人、自动驾驶汽车、人形机器人</li>
  </ul></div>
</div>
<h4 class="sub-h">机器人系统四部分</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">感官</span><h4 class="card-t">传感器</h4><p class="card-b">摄像头、雷达、红外、惯性传感器、编码器，负责采集外部与自身状态。</p></div>
  <div class="card"><span class="card-k">大脑</span><h4 class="card-t">高层认知</h4><p class="card-b">理解任务、语义推理、长期规划，由大模型承担。</p></div>
  <div class="card"><span class="card-k">小脑</span><h4 class="card-t">运动协调</h4><p class="card-b">实时平衡、步态控制、精细动作协调，要求毫秒级响应。</p></div>
  <div class="card"><span class="card-k">肌肉骨骼</span><h4 class="card-t">执行机构</h4><p class="card-b">电机、关节、灵巧手、底盘，把决策变成物理动作。</p></div>
</div>`
    },
    {
      id: 'sweeper',
      title: '案例拆解：扫地机器人',
      kicker: '课件案例',
      html: `
<p>课件用扫地机器人把「感知—决策—执行」闭环讲透，这是理解具身智能最贴近生活的样本。</p>
<h4 class="sub-h">两类感受器</h4>
<div class="duo">
  <div class="duo-col"><h4>外感受传感器</h4><p class="duo-sub">雷达、摄像头、红外。负责<strong>环境感知</strong>：避障、视物、识别房间边界与家具位置。</p></div>
  <div class="duo-col duo-col--alt"><h4>内感受传感器</h4><p class="duo-sub">惯性传感器、轮式编码器。负责<strong>自我状态</strong>：定位、速度、姿态检测，辅助建图。</p></div>
</div>
<h4 class="sub-h">路径规划</h4>
<div class="steps">
  <li><b>搜索算法</b>：最佳优先搜索与 A* 算法计算最优路径。</li>
  <li><b>动态调整</b>：适应家具移动、人员走动等环境变化，实时重算。</li>
  <li><b>覆盖策略</b>：弓字形路径加延边清扫，做到覆盖最全、路径最短。</li>
</div>
<h4 class="sub-h">运动与任务</h4>
<div class="tbl"><table>
<thead><tr><th>动作</th><th>实现方式</th></tr></thead>
<tbody>
<tr><td>转弯</td><td>左轮加速、右轮减速（差速转向）</td></tr>
<tr><td>边角清扫</td><td>边刷旋转把墙角垃圾扫入吸口</td></tr>
<tr><td>门槛爬坡</td><td>提升驱动力与底盘通过性</td></tr>
<tr><td>障碍绕行</td><td>实时检测后重新规划局部路径</td></tr>
<tr><td>低电量回充</td><td>电量阈值触发返回基座</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>本质</strong>：多模块闭环协作，靠实时数据流与反馈机制串起<span class="hl">感知 → 决策 → 执行</span>。任何一个环节缺失，机器人都无法在真实家庭环境里稳定工作。</div>`
    },
    {
      id: 'vision3d',
      title: '3D 视觉定位：三种方案',
      kicker: '课件技术',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-sensors.jpg" alt="多传感器融合：摄像头、激光雷达、GPS、IMU 共同完成定位" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>多传感器融合：摄像头、激光雷达、GPS、IMU 共同完成定位</figcaption></figure>

<div class="tbl"><table>
<thead><tr><th>方案</th><th>优势</th><th>局限</th><th>有效距离</th><th>典型应用</th></tr></thead>
<tbody>
<tr><td><strong>双目视觉</strong></td><td>硬件简单、成本低</td><td>受光照影响大</td><td>几十米</td><td>自动驾驶、机器人导航</td></tr>
<tr><td><strong>TOF 飞行时间</strong></td><td>计算简单、实时性好</td><td>像素密度较低</td><td>0.5 米至数米</td><td>手机面部解锁、智能家居存在检测、物流包裹体积测量</td></tr>
<tr><td><strong>结构光</strong></td><td>适合细节重建、弱光稳定</td><td>强光干扰、动态受限、硬件昂贵</td><td>0.1 至 5 米</td><td>精密零件三维扫描、缺陷检测、牙科建模、手术导航、人脸支付</td></tr>
</tbody></table></div>
<div class="note"><strong>选型逻辑</strong>：要远距离且预算有限选双目；要实时且中等距离选 TOF；要高精度近距离重建选结构光。三者的距离区间几乎不重叠，这是课件表格最容易考的地方。</div>
<h4 class="sub-h">语义地图</h4>
<p>普通地图只记录「哪里有障碍」，<strong>语义地图</strong>为每个物体与区域贴上有意义的标签：这是厨房、那是沙发、这里是充电桩。有了语义，机器人才能理解「去厨房」这样的自然语言目标。</p>`
    },
    {
      id: 'models',
      title: 'LLM、VLM、VLA：三个缩写的分界',
      kicker: '第 1–9、11、23 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-eai.jpg" alt="VLA 在 VLM 基础上增加动作输出，让模型能直接控制机器人" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>VLA 在 VLM 基础上增加动作输出，让模型能直接控制机器人</figcaption></figure>

<div class="tbl"><table>
<thead><tr><th>模型</th><th>全称</th><th>输入 → 输出</th><th>模态</th><th>类比</th><th>核心能力</th></tr></thead>
<tbody>
<tr><td><strong>LLM</strong></td><td>Large Language Model 大语言模型</td><td>文本 → 文本</td><td>单模态</td><td>大脑</td><td>涌现、记忆、理解、推理、生成</td></tr>
<tr><td><strong>VLM</strong></td><td>Vision-Language Model 视觉语言模型</td><td>图像 + 文本 → 文本</td><td>多模态</td><td>大脑 + 眼睛</td><td>跨模态分析、推理、生成</td></tr>
<tr><td><strong>VLA</strong></td><td>Vision-Language-Action 视觉语言动作模型</td><td>图像 + 文本 → <span class="hl">动作</span></td><td>多模态</td><td>大脑 + 眼睛 + 手脚</td><td>把动作转成文本 token，赋予物理交互能力</td></tr>
<tr><td><strong>VLN</strong></td><td>Vision-Language Navigation 视觉语言导航</td><td>语言指令 + 视觉 → 导航路径</td><td>多模态</td><td>大脑 + 眼睛 + 腿</td><td>去正确的地方，做正确的事</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>两条判别口诀</strong><br>看<span class="hl">是否输出动作</span>：只「看图说话」是 VLM，要「动手去做」才是 VLA。<br>看<span class="hl">是否限定导航</span>：VLN 强调导航任务（找路），VLA 强调通用动作执行（不限定导航）。</div>
<h4 class="sub-h">两种系统架构</h4>
<div class="duo">
  <div class="duo-col"><h4>传统 VLM + 规控双系统</h4><p class="duo-sub">传感器 → VLM 理解场景 → 独立的规划控制模块 → 执行。两个系统之间需要人工定义接口，信息在传递中损耗。</p></div>
  <div class="duo-col duo-col--alt"><h4>VLA 端到端</h4><p class="duo-sub">传感器 → VLA → 控制。一个模型贯通感知到动作，更简洁高效，减少信息传递损耗，更接近生物体的感知—决策—执行闭环。</p></div>
</div>
<div class="note"><strong>RT-2 的意义</strong>：谷歌的 RT-2 把视觉语言预训练知识迁移到机器人控制，大幅提高泛化能力，并能学习推理出训练中没有直接示范过的新能力。这是 VLA 路线的标志性成果。</div>
<div class="tbl"><table>
<thead><tr><th>任务描述</th><th>该选谁</th><th>理由</th></tr></thead>
<tbody>
<tr><td>生成文本、写诗、翻译、摘要、智能客服</td><td>LLM</td><td>纯文本进纯文本出</td></tr>
<tr><td>看图说话、视觉问答、图片分类</td><td>VLM</td><td>图像加文本进，文本出</td></tr>
<tr><td>自动驾驶决策、机器人抓取、具身操作</td><td>VLA</td><td>需要输出转向、加速、刹车、夹取等动作</td></tr>
<tr><td>室内路线规划、按地图指引到达目的地</td><td>VLN</td><td>语言指令加视觉信息，输出导航路径</td></tr>
<tr><td>根据描述生成图片</td><td>文生图模型</td><td>属 AIGC 跨模态生成，四个缩写都不对应</td></tr>
</tbody></table></div>`
    },
    {
      id: 'vln',
      title: 'VLN：四类导航任务',
      kicker: '第 10、12–20、22 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-vln.jpg" alt="视觉语言导航：机器人按语言指令，结合视觉信息走到目标位置" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>视觉语言导航：机器人按语言指令，结合视觉信息走到目标位置</figcaption></figure>

<p>视觉语言导航主要探索机器人如何利用自然语言与人有效沟通，接收并理解指令，最终依靠视觉信息实现精准导航。核心是<strong>去正确的地方，做正确的事</strong>。</p>
<div class="tbl"><table>
<thead><tr><th>导航类型</th><th>依赖信息</th><th>侧重点</th><th>典型场景</th><th>信息获取方式</th></tr></thead>
<tbody>
<tr><td><strong>指令导向</strong></td><td>用户明确给出的具体步骤</td><td>怎么做（路径步骤）</td><td>「先直走 5 米，再左转」</td><td>显式指令，机器人照做</td></tr>
<tr><td><strong>目标导向</strong></td><td>预先设定的最终目标</td><td>达到什么结果</td><td>「去厨房」</td><td>只给终点，路径由系统自行规划</td></tr>
<tr><td><strong>需求导向</strong></td><td>用户潜在意图与内心状态</td><td>满足隐性需求</td><td>「我困了」→ 找咖啡</td><td>从行为与历史偏好中隐式挖掘意图</td></tr>
<tr><td><strong>对话导向</strong></td><td>多轮对话中不断变化的信息</td><td>交互中逐步明确</td><td>边聊边问、边调整路线</td><td>显式交互，允许提问消除歧义</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>判别口诀</strong>：给了<span class="hl">步骤</span> → 指令导航；给了<span class="hl">终点</span> → 目标导航；给了<span class="hl">状态或愿望</span> → 需求导航；给了<span class="hl">多轮聊天</span> → 对话导航。</div>
<h4 class="sub-h">四组高频对比</h4>
<div class="cards">
  <div class="card"><span class="card-k">第 15 题</span><h4 class="card-t">指令 与 目标</h4><p class="card-b">两者是<strong>并列关系</strong>，不存在包含。指令侧重具体步骤「怎么做」，目标侧重最终结果「做到什么」，路径由系统规划。</p></div>
  <div class="card"><span class="card-k">第 16 题</span><h4 class="card-t">需求 与 对话</h4><p class="card-b">需求导航通过分析<strong>用户行为</strong>隐式获取信息；对话导航通过<strong>对话内容</strong>显式获取信息。把两者颠倒就是错误选项。</p></div>
  <div class="card"><span class="card-k">第 20 题</span><h4 class="card-t">谁更强调交互</h4><p class="card-b">对话导航天然依赖多轮人机交互；目标导航只在开始设定目标，之后系统自主运行，交互程度低。</p></div>
  <div class="card"><span class="card-k">第 17、18、19 题</span><h4 class="card-t">三种适用条件</h4><p class="card-b">有明确目标但不清楚步骤 → 目标导航。需求在对话中逐步浮现 → 对话导航。想放松身心但不知具体方式 → 需求导航。</p></div>
</div>
<div class="note note--warn"><strong>第 22 题的完整推理链</strong>：用户只说「我困了」，这是<span class="hl">状态描述与潜在需求</span>——没有给出目标（没说「去冰箱」），也没有给出步骤（没说「向左走」）。机器人自行推断「困 → 需要咖啡 → 冰箱有咖啡」，最终导航至冰箱找到罐装咖啡。这条链路属于<strong>需求导向</strong>的导航任务。</div>`
    },
    {
      id: 'touch',
      title: '触觉感知：补上最后一块模态',
      kicker: '课件技术',
      html: `
<p>具身智能的多模态包含文本、图像、视频、动作，以及<strong>触觉</strong>。视觉能告诉机器人物体在哪，触觉才能告诉它抓得稳不稳。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">触觉细分</span><h4 class="card-t">六种感觉</h4><p class="card-b">压觉、力矩觉、滑觉、湿觉、温觉，加上基础触觉，共同构成完整的接触感知。</p></div>
  <div class="card"><span class="card-k">硬件形态</span><h4 class="card-t">柔性电子皮肤</h4><p class="card-b">柔性材料传感器阵列，可贴合曲面，模拟人类皮肤的分布式感知。</p></div>
  <div class="card"><span class="card-k">部署位置</span><h4 class="card-t">机械臂与手</h4><p class="card-b">夹爪、指尖、指腹、手掌，按操作需求分布。</p></div>
</div>
<div class="note note--key"><strong>典型动作</strong>：放置物体时实时检测摩擦力并调整力度，保证物体平稳不滑落。这正是「感知—决策—执行」闭环在毫秒尺度上的体现，纯视觉方案做不到。</div>`
    },
    {
      id: 'rl',
      title: '强化学习：试错与奖励驱动',
      kicker: '第 24 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-rl.jpg" alt="强化学习闭环：智能体在环境中试错，依据奖励更新策略" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>强化学习闭环：智能体在环境中试错，依据奖励更新策略</figcaption></figure>
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch7-qlearning.jpg" alt="Q-learning 网格世界：智能体逐步学到每个状态的最优动作" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>Q-learning 网格世界：智能体逐步学到每个状态的最优动作</figcaption></figure>

<p>强化学习的核心是<strong>试错</strong>加<strong>奖励驱动</strong>，目标是整体价值最大化。智能体通过与环境交互，根据获得的奖励信号学习一系列最优决策。</p>
<div class="tbl"><table>
<thead><tr><th>范式</th><th>信号来源</th><th>学什么</th><th>第 24 题选项</th></tr></thead>
<tbody>
<tr><td>监督学习</td><td>带标签的数据集</td><td>输入到输出的映射函数，用于预测或分类</td><td>A</td></tr>
<tr><td>无监督学习</td><td>无标签数据</td><td>发现隐藏的内在结构或模式；降维与可视化是其子类</td><td>B、D</td></tr>
<tr><td><strong>强化学习</strong></td><td>环境交互 + 奖励信号</td><td>一系列最优决策，即策略</td><td><strong>C</strong></td></tr>
</tbody></table></div>
<p><strong>六个关键要素</strong>：Agent 智能体、Environment 环境、State 状态、Action 动作、Reward 奖励、Policy 策略。</p>
<h4 class="sub-h">网格世界：课件的教学模型</h4>
<div class="steps">
  <li><b>状态图</b>：把环境离散成网格，每个格子是一个状态。</li>
  <li><b>状态转移</b>：执行动作后从当前格子移动到相邻格子。</li>
  <li><b>策略</b>：告诉智能体在每个状态应采取什么动作，是一张「状态 → 动作」的对照表。</li>
  <li><b>轨迹</b>：基于同一策略可以产生不同轨迹，因为环境可能有随机性。</li>
  <li><b>价值最大化</b>：评价标准是整条轨迹的累积奖励，单步奖励不作为评价标准。</li>
</div>
<div class="tbl"><table class="reward-tbl">
<thead><tr><th>区域</th><th>奖励</th><th>含义</th></tr></thead>
<tbody>
<tr><td>超出边界</td><td class="num bad">−1</td><td>撞墙，惩罚</td></tr>
<tr><td>禁区</td><td class="num bad">−1</td><td>危险区域，惩罚</td></tr>
<tr><td>目标</td><td class="num good">+1</td><td>到达终点，奖励</td></tr>
<tr><td>可访问区</td><td class="num">0</td><td>正常通行，无奖惩</td></tr>
<tr><td>状态不变</td><td class="num">0</td><td>原地不动，无奖惩</td></tr>
</tbody></table></div>
<div class="note"><strong>为什么奖励要这样设计</strong>：目标给正分、危险给负分、普通移动给零分，智能体为了累积价值最大化，会自发学会绕开禁区、尽快到达目标。奖励函数就是设计者表达意图的语言。</div>`
    },
    {
      id: 'sim',
      title: '仿真训练与迁移',
      kicker: '课件技术',
      html: `
<p>强化学习需要数百万次尝试，直接在真实机器人上训练有三个致命问题。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">问题一</span><h4 class="card-t">试错成本高</h4><p class="card-b">本体损坏、环境破坏，一次摔倒可能损失整套硬件。</p></div>
  <div class="card"><span class="card-k">问题二</span><h4 class="card-t">物理动作慢</h4><p class="card-b">一次反馈需要几秒到几分钟，而训练需要数百万次尝试，时间上不可行。</p></div>
  <div class="card"><span class="card-k">问题三</span><h4 class="card-t">安全风险</h4><p class="card-b">未训练好的策略在真实环境中可能伤人或损坏物品。</p></div>
</div>
<div class="duo">
  <div class="duo-col"><h4>仿真</h4><p class="duo-sub">在计算机里构建物理世界的高保真虚拟模型。可以并行开成千上万个环境，一秒内完成现实中几天的试错量，且零硬件损耗。</p></div>
  <div class="duo-col duo-col--alt"><h4>迁移学习</h4><p class="duo-sub">把仿真中训练好的模型参数部署到现实，把策略应用到真实机器人，这一步称为仿真到现实的迁移。</p></div>
</div>
<div class="note note--warn"><strong>仿真与现实的差距</strong>：仿真里完美的策略迁移后可能失效，因为真实世界的摩擦、光照、传感器噪声与仿真不完全一致，需要在真实环境继续微调。这也是课件强调「仿真完美不等于现实可用」的原因。</div>`
    },
    {
      id: 'world',
      title: '世界模型：让机器人会想象',
      kicker: '课件前沿',
      html: `
<p>世界模型模仿人类的心理模型，让智能体在行动之前先在「脑内」推演后果。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">能力一</span><h4 class="card-t">反事实推理</h4><p class="card-b">推演「如果我这样做会发生什么」，比较多种可能未来。</p></div>
  <div class="card"><span class="card-k">能力二</span><h4 class="card-t">预测环境变化</h4><p class="card-b">预测运动行为对环境造成的改变，提前应对并决策。</p></div>
  <div class="card"><span class="card-k">能力三</span><h4 class="card-t">想象行动后果</h4><p class="card-b">在执行前评估风险，减少真实世界中的试错代价。</p></div>
</div>
<div class="note note--key"><strong>代表成果</strong>：谷歌 Genie 2 能从<strong>单张图片</strong>生成可交互的 3D 游戏世界，持续约 1 分钟。这意味着世界模型可以从极少的输入构造出可探索的环境，为具身智能提供近乎无限的训练场。</div>`
    },
    {
      id: 'apps',
      title: '三大应用方向',
      kicker: '课件应用',
      html: `
<h4 class="sub-h">人形机器人</h4>
<p>被视为具身智能的<strong>终极形态</strong>：模仿人类形态与运动方式，从而适应为人类设计的环境（家庭、公共场所）。大脑负责认知规划、小脑负责运动协调、肢体负责执行，三者分工协作。</p>
<div class="cards cards--3">
  <div class="card"><span class="card-k">挑战一</span><h4 class="card-t">全身运动协调</h4><p class="card-b">动态平衡控制，行走、转身、受扰动时不摔倒。</p></div>
  <div class="card"><span class="card-k">挑战二</span><h4 class="card-t">灵巧手操作</h4><p class="card-b">多自由度精细抓取与工具使用。</p></div>
  <div class="card"><span class="card-k">挑战三</span><h4 class="card-t">非结构化环境</h4><p class="card-b">理解与导航杂乱、变化、未见过的真实场景。</p></div>
</div>
<h4 class="sub-h">自动驾驶：端到端 E2E</h4>
<p>一个深度学习模型输入传感器数据，直接输出规划轨迹与控制指令，操控加速、刹车、转向。这正是 VLA 路线在交通领域的体现。</p>
<div class="note"><strong>课件时间点</strong>：2025 年 3 月理想发布 MindVLA；理想 i8 进行道路演示。</div>
<h4 class="sub-h">医疗辅助</h4>
<div class="tbl"><table>
<thead><tr><th>领域</th><th>做什么</th></tr></thead>
<tbody>
<tr><td>临床干预</td><td>手术机器人执行微创与复杂外科手术</td></tr>
<tr><td>日常护理</td><td>辅助移动、送药、监护</td></tr>
<tr><td>基础设施支持</td><td>院内物流、消毒、样本转运</td></tr>
<tr><td>生物医学研究</td><td>自动化实验操作与数据采集</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>达芬奇手术机器人</strong>由三部分组成：<span class="hl">医生主控台</span> + <span class="hl">床旁机械臂手术平台</span> + <span class="hl">成像系统</span>。课件展示的标志性演示是给葡萄剥皮后缝合，体现其精细操作能力。</div>`
    },
    {
      id: 'fairness',
      title: '算法偏见治理：三个层次',
      kicker: '第 21 题',
      html: `
<div class="tbl"><table>
<thead><tr><th>层次</th><th>措施</th><th>作用机理</th></tr></thead>
<tbody>
<tr><td><strong>数据层</strong></td><td>数据清洗、平衡样本、丰富数据集</td><td>让训练数据的分布更接近真实人群的分布，减少代表性不足</td></tr>
<tr><td><strong>模型层</strong></td><td>增加公平性约束、对抗去偏，强制模型无法推断敏感属性</td><td>切断模型利用性别、种族等敏感特征的通路</td></tr>
<tr><td><strong>决策层</strong></td><td>推动决策基于公平的因果性，引入因果推断</td><td>消除歧视性关联，区分相关与因果</td></tr>
</tbody></table></div>
<div class="note note--warn"><strong>第 21 题的反例</strong>：<span class="hl">减少数据收集量</span>会加剧样本偏差与数据代表性不足，反而恶化偏见。其余「多数据、加约束、讲因果」都是正解。<br>记忆方式：治理偏见需要更多信息与更强约束，减少数据在方向上就是反的。</div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single',
      stem: '以下哪种模型主要用于生成文本内容？（　）',
      opts: ['VLM', 'LLM', 'VLA', 'VLN'],
      ans: 'B',
      why: '<p>LLM 大语言模型的核心能力就是文本理解与文本生成，典型应用包括对话、翻译、摘要、写作。其余三个均涉及视觉或多模态能力。</p>',
      point: 'LLM 的能力边界',
      anchor: '纯文本进纯文本出 = LLM'
    },
    {
      n: 2, type: 'single',
      stem: '如果一个模型能同时理解图像和文本，并回答相关问题，它最可能属于？（　）',
      opts: ['LLM', 'VLN', 'VLM', 'VLA'],
      ans: 'C',
      why: '<p>VLM = Vision-Language Model，专门处理图像加语言的多模态任务，如视觉问答 VQA、图像描述。「理解图像和文本并回答」是 VLM 的标准定义。</p>',
      point: 'VLM 的定义',
      anchor: '图像 + 文本 → 文本 = VLM'
    },
    {
      n: 3, type: 'single',
      stem: '以下哪项任务最适合用 VLA 模型完成？（　）',
      opts: ['根据描述生成图片', '在虚拟环境中根据指令移动', '翻译一段英文文本', '识别图片中的物体'],
      ans: 'B',
      why: '<p>VLA 相比 VLM 多了 Action 动作维度，用于具身智能——感知环境后执行动作。「根据指令在环境中移动」正是需要输出动作的场景。</p><ul><li>A：属文生图模型。</li><li>C：属 LLM。</li><li>D：属视觉识别或 VLM。</li></ul>',
      point: 'VLA 的动作输出',
      anchor: '要动手去做才是 VLA'
    },
    {
      n: 4, type: 'single',
      stem: '假设你需要一个模型来规划室内导航路线，应选择？（　）',
      opts: ['LLM', 'VLN', 'VLM', 'VLA'],
      ans: 'B',
      why: '<p>VLN = Vision-Language Navigation 视觉语言导航，专门研究根据语言指令、利用视觉信息导航到目标，与室内路线规划完全对应。</p>',
      point: 'VLN 的任务定位',
      anchor: '导航找路选 VLN'
    },
    {
      n: 5, orig: 6, type: 'single',
      stem: '关于多模态模型，以下哪种说法正确？（　）',
      opts: ['LLM 可以理解图片中的内容', 'VLM 只能处理文本不能生成图像', 'VLA 结合了视觉、语言和动作', 'VLN 不需要语言指令'],
      ans: 'C',
      why: '<ul><li>A：LLM 仅处理文本，理解图片是 VLM 的能力。</li><li>B：VLM 能同时处理图像和文本。</li><li>C：VLA = Vision + Language + Action，正确。</li><li>D：VLN 中的 L 就是 Language，语言指令是其必需输入。</li></ul>',
      point: '四个缩写的能力对照',
      anchor: '逐项检查输入输出模态'
    },
    {
      n: 6, orig: 5, type: 'single',
      stem: '以下哪项是 LLM 和 VLM 的共同点？（　）',
      opts: ['均能直接控制机器人动作', '均依赖纯文本输入', '均能处理语言相关任务', '均需 3D 场景建模'],
      ans: 'C',
      why: '<p>LLM 与 VLM 都具备自然语言理解与生成能力，这是二者的交集。</p><ul><li>A：控制机器人动作是 VLA 的能力。</li><li>B：只适用于 LLM，VLM 还接收图像。</li><li>D：3D 场景建模与两者都无关。</li></ul>',
      point: '找两个模型的交集',
      anchor: '共同点落在语言处理能力上'
    },
    {
      n: 7, type: 'single',
      stem: '如果模型需要「看图说话」，最适合使用？（　）',
      opts: ['LLM', 'VLN', 'VLM', 'VLA'],
      ans: 'C',
      why: '<p>「看图说话」即图像描述 Image Captioning，输入是图像、输出是文本，是 VLM 的经典任务。它不需要输出动作，因此不是 VLA。</p>',
      point: 'VLM 与 VLA 的分界',
      anchor: '只说不做是 VLM'
    },
    {
      n: 8, type: 'single',
      stem: '以下哪个场景会用到 VLN 模型？（　）',
      opts: ['自动生成诗歌', '根据地图指引到达目的地', '识别图片中的动物种类', '将中文翻译为法语'],
      ans: 'B',
      why: '<p>VLN 面向导航场景，需结合视觉信息与语言指引到达目标位置。A 与 D 是 LLM 任务，C 是视觉识别或 VLM 任务。</p>',
      point: 'VLN 的应用场景',
      anchor: '出现「到达目的地」就是导航'
    },
    {
      n: 9, type: 'single',
      stem: '关于模型能力对比，以下正确的是？（　）',
      opts: ['VLM 能执行动作，而 VLA 不能', 'LLM 仅支持文本，VLM 支持图像+文本', 'VLN 比 VLM 更擅长生成图像', 'VLA 不需要视觉输入'],
      ans: 'B',
      why: '<ul><li>A：说反了，VLA 才能输出动作。</li><li>B：精准概括了 LLM 与 VLM 的输入差异，正确。</li><li>C：VLN 用于导航，不擅长图像生成。</li><li>D：VLA 中的 V 就是 Vision，视觉是必需输入。</li></ul>',
      point: '输入模态与输出能力的对应',
      anchor: '缩写里的每个字母都对应一种必需能力'
    },
    {
      n: 10, type: 'single',
      stem: '在具身智能导航中，面向指令的导航主要是根据什么来行动？（　）',
      opts: ['用户明确给出的具体步骤指令', '用户潜在的需求', '最终要达成的目标', '对话中的隐含信息'],
      ans: 'A',
      why: '<p>面向指令的导航 Instruction-following Navigation 要求用户给出明确路径或步骤描述，机器人照做。B 对应需求导航，C 对应目标导航，D 对应对话导航。</p>',
      point: '指令导航的定义',
      anchor: '给了步骤就是指令导航'
    },
    {
      n: 11, orig: 10, type: 'single',
      stem: '以下实际应用中，哪项更可能依赖 VLA 模型？（　）',
      opts: ['智能客服聊天', '自动驾驶汽车决策', '图片分类', '文本摘要'],
      ans: 'B',
      why: '<p>自动驾驶需要感知视觉环境（摄像头与雷达）→ 理解交通语义 → 输出转向、加速、刹车等动作决策，完整覆盖 V-L-A 三要素。A 与 D 是 LLM 场景，C 是视觉或 VLM 场景。</p>',
      point: 'VLA 的工业应用',
      anchor: '自动驾驶是端到端 VLA 的典型'
    },
    {
      n: 12, type: 'single',
      stem: '以下哪种导航类型更关注用户内心想要达成的状态？（　）',
      opts: ['面向指令的导航', '面向需求的导航', '面向目标的导航', '基于对话的导航'],
      ans: 'B',
      why: '<p>关键词「内心想要达成的状态」对应需求。用户未必说清目标或步骤，只是表达一种主观愿望或状态追求，需要系统主动理解并转化为可执行的导航方案。</p>',
      point: '需求导航的判别关键词',
      anchor: '状态与愿望 → 需求导航'
    },
    {
      n: 13, type: 'single',
      stem: '面向目标的导航，其核心是围绕什么开展？（　）',
      opts: ['具体的操作指令', '用户的需求倾向', '预先设定的目标', '对话中的关键信息'],
      ans: 'C',
      why: '<p>面向目标的导航 Goal-oriented Navigation 只给定终点或目标状态，路径由系统自行规划。A 是指令导航，B 是需求导航，D 是对话导航。</p>',
      point: '目标导航的定义',
      anchor: '给了终点就是目标导航'
    },
    {
      n: 14, type: 'single',
      stem: '基于对话的导航，主要依据什么来调整导航策略？（　）',
      opts: ['固定的指令步骤', '用户明确表达的需求', '预先设定的目标', '对话过程中不断变化的信息'],
      ans: 'D',
      why: '<p>对话导航的核心特征是多轮交互、动态调整。用户可能随时补充、修正、追问，系统依据对话流中不断更新的信息实时调整策略。</p>',
      point: '对话导航的动态性',
      anchor: '多轮聊天 → 对话导航'
    },
    {
      n: 15, type: 'single',
      stem: '面向指令的导航和面向目标的导航，关系描述正确的是？（　）',
      opts: ['两者完全一样', '面向指令包含面向目标', '面向目标包含面向指令', '两者侧重点不同：指令侧重具体步骤，目标侧重最终结果'],
      ans: 'D',
      why: '<p>二者是并列关系，不存在包含关系。指令导航给出「怎么做」（路径步骤），目标导航只给「做到什么」（最终结果），路径由系统规划。</p>',
      point: '并列关系与包含关系的区分',
      anchor: '四类导航互相并列'
    },
    {
      n: 16, type: 'single',
      stem: '面向需求的导航和基于对话的导航，在信息获取方面有什么不同？（　）',
      opts: ['面向需求通过分析用户行为获取信息；基于对话通过对话内容获取信息', '面向需求通过对话；基于对话通过行为', '两者都通过固定问卷', '两者都通过实时监测'],
      ans: 'A',
      why: '<p>需求导航侧重从用户行为、历史偏好中隐式挖掘意图；对话导航通过显式交互获取信息。B 把两者颠倒了，C 与 D 都不符合两类导航的机制。</p>',
      point: '隐式挖掘与显式交互',
      anchor: '需求看行为，对话看内容'
    },
    {
      n: 17, type: 'single',
      stem: '当用户不知道具体步骤但有一个大致目标时，更适合哪种导航？（　）',
      opts: ['面向指令的导航', '面向需求的导航', '面向目标的导航', '基于对话的导航'],
      ans: 'C',
      why: '<p>有明确目标加上不清楚步骤，正是面向目标导航的典型适用条件——系统负责把目标拆解成可执行步骤。</p>',
      point: '按适用条件选导航类型',
      anchor: '目标清楚、步骤不清楚 → 目标导航'
    },
    {
      n: 18, type: 'single',
      stem: '用户与系统对话过程中需求逐渐明确，此时哪种导航更能适应？（　）',
      opts: ['面向指令的导航', '面向需求的导航', '面向目标的导航', '基于对话的导航'],
      ans: 'D',
      why: '<p>需求在对话中逐步浮现，需要多轮交互、边问边调整，正是对话导航的设计初衷。它允许机器人提出问题消除歧义，弥补感知信息不足。</p>',
      point: '需求逐步明确的场景',
      anchor: '边聊边明确 → 对话导航'
    },
    {
      n: 19, type: 'single',
      stem: '以下哪种情况更适合采用面向需求的导航？（　）',
      opts: ['用户给出详细路线指引', '用户表示想要放松身心，但不知具体方式', '用户明确要去某个地点', '用户通过对话询问周边信息'],
      ans: 'B',
      why: '<p>「想放松但不知道怎么做」属于典型的模糊与潜在需求，需要系统挖掘用户意图并推荐方案。A 是指令导航，C 是目标导航，D 是对话导航。</p>',
      point: '模糊需求的识别',
      anchor: '只有愿望没有方案 → 需求导航'
    },
    {
      n: 20, type: 'single',
      stem: '在具身智能导航中，面向目标的导航和基于对话的导航，哪个更强调与用户的交互？（　）',
      opts: ['面向目标的导航', '基于对话的导航', '两者强调程度一样', '都不强调交互'],
      ans: 'B',
      why: '<p>对话导航天然依赖多轮人机交互；目标导航只需在开始设定目标，之后系统自主运行，交互程度低。</p>',
      point: '交互程度对比',
      anchor: '对话导航交互最强'
    },
    {
      n: 21, type: 'single',
      stem: '以下哪项措施不能有效治理算法偏见？（　）',
      opts: ['数据清洗，丰富数据集', '增加公平性约束，强制模型无法推断敏感属性', '减少数据收集量', '推动决策基于公平的因果性'],
      ans: 'C',
      why: '<p>算法偏见治理有三个方向：数据层清洗、平衡、丰富数据集（A）；模型层加入公平性约束与对抗去偏（B）；决策层引入因果推断消除歧视性关联（D）。</p><p>减少数据收集量会加剧样本偏差与数据代表性不足，反而恶化偏见，因此是反例。</p>',
      point: '偏见治理的三个层次',
      anchor: '多数据、加约束、讲因果是正解'
    },
    {
      n: 22, type: 'single',
      stem: '视觉语言导航主要探索机器人如何利用自然语言与人进行有效沟通，接收并理解指令，并最终依靠视觉信息实现精准导航。当用户说「我困了」，机器人导航至冰箱找到一瓶罐装咖啡。这次机器人执行的导航任务属于？（　）',
      opts: ['对话导向的导航任务', '需求导向的导航任务', '指令导向的导航任务', '目标导向的导航任务'],
      ans: 'B',
      why: '<p>用户只说「我困了」，这是一个状态描述与潜在需求：没有给出目标（没说去冰箱），也没有给出步骤（没说向左走）。机器人需要自行推断「困 → 需要咖啡 → 冰箱有咖啡」，这正是面向需求导航的典型链路。</p>',
      point: '从用户话语反推导航类型',
      anchor: '状态描述 → 需求导向'
    },
    {
      n: 23, type: 'single',
      stem: '将机器人的物理运动与图像和文本解读能力结合到一个单一框架中的模型，被称为视觉-语言-动作模型，简称？（　）',
      opts: ['LLM', 'VLM', 'VLA', 'VLN'],
      ans: 'C',
      why: '<p>Vision 图像 + Language 文本 + Action 物理运动 → VLA。题干中「物理运动」就是 Action 的关键词提示，「单一框架」对应端到端架构。</p>',
      point: 'VLA 的全称与构成',
      anchor: '出现物理运动就选 VLA'
    },
    {
      n: 24, type: 'single',
      stem: '强化学习（Reinforcement Learning）的核心关注点是？（　）',
      opts: ['从带有标签的数据集中学习一个映射函数，以进行预测或分类', '从无标签的数据中发现隐藏的内在结构或模式', '通过与环境进行交互，根据获得的奖励信号学习一系列最优决策', '对高维数据进行降维和可视化，以便于人类观察和理解'],
      ans: 'C',
      why: '<p>三大机器学习范式的核心区别：监督学习有标签，学输入到输出的映射（A）；无监督学习无标签，发现数据结构（B，D 是其子类）；强化学习由 Agent 与环境交互，通过奖励信号学习最优策略（C）。</p><p>强化学习六个关键要素：Agent、Environment、State、Action、Reward、Policy。核心是试错加奖励驱动，追求整体价值最大化。</p>',
      point: '三大范式的分水岭',
      anchor: '有无环境交互与奖励信号'
    }
  ]
});