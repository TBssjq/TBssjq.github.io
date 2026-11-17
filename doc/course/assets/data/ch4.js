/* 第 4 章 · 让机器看懂世界：计算机视觉 */
window.STUDY = window.STUDY || { chapters: [], cheats: [] };

window.STUDY.chapters.push({
  id: 4,
  title: '让机器看懂世界',
  subtitle: '计算机视觉',
  hue: '#ff2d78',
  glyph: '04',
  tagline: '从像素矩阵到语义理解',
  exam: {
    name: '第四章作业',
    due: '2026-11-21T23:59:00+08:00',
    rule: '单选 10 道 × 10 分',
    note: '答案串 C D B B C D A B D A。'
  },
  lead: '本章的考题全部围绕「任务输出是什么」展开。把分类、检测、分割、跟踪四个任务的输出形式记清楚，再用「主技术归属」的口径判断应用场景，10 道题可以全对。',
  sections: [
    {
      id: 'pixel',
      title: '像素与 RGB：图像的最小单位',
      kicker: '第 2 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch4-pixel-rabbit.jpg" alt="同一只兔子在不同分辨率下的像素化效果：像素越少越模糊" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>同一只兔子在不同分辨率下的像素化效果：像素越少越模糊</figcaption></figure>

<p class="lead">计算机看到的只是<strong>像素矩阵</strong>，而不是「物体」本身。像素是构成图像的最小单位，一张 1080p 的照片由 <strong>207 万</strong>个小方格组成，每个像素携带自己独特的颜色信息。</p>
<p>颜色由红、绿、蓝三种光按不同强度混合而成，每通道用 0 到 255 的数字表示：<strong>0 是完全关闭，255 是开到最亮</strong>。每通道 8 位、共 24 位色，可表示约 1677 万种颜色。</p>
<div class="tbl"><table class="swatch-tbl">
<thead><tr><th>颜色</th><th>R</th><th>G</th><th>B</th><th>色块</th><th>理解方式</th></tr></thead>
<tbody>
<tr><td>纯红</td><td class="num">255</td><td class="num">0</td><td class="num">0</td><td><span class="swatch" style="--sw:#ff0000"></span></td><td>红色颜料倒满，绿蓝一滴不加</td></tr>
<tr><td>纯白</td><td class="num">255</td><td class="num">255</td><td class="num">255</td><td><span class="swatch" style="--sw:#ffffff"></span></td><td>三色全开，混合成白</td></tr>
<tr><td>纯黑</td><td class="num">0</td><td class="num">0</td><td class="num">0</td><td><span class="swatch" style="--sw:#000000"></span></td><td>全部关闭，一片漆黑</td></tr>
<tr><td>纯黄</td><td class="num">255</td><td class="num">255</td><td class="num">0</td><td><span class="swatch" style="--sw:#ffff00"></span></td><td>红绿开到最亮，蓝完全关闭</td></tr>
<tr><td>纯青</td><td class="num">0</td><td class="num">255</td><td class="num">255</td><td><span class="swatch" style="--sw:#00ffff"></span></td><td>绿蓝全开，红关闭</td></tr>
<tr><td>纯品红</td><td class="num">255</td><td class="num">0</td><td class="num">255</td><td><span class="swatch" style="--sw:#ff00ff"></span></td><td>红蓝全开，绿关闭</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>四种颜色模型的分工</strong>：<span class="hl">RGB</span> 加色模型，对应发光显示与传感器采样，是像素的默认表示；<span class="hl">CMYK</span> 减色模型，服务印刷打印；<span class="hl">HSL</span> 面向人调色的感知型模型，常由 RGB 转换而来；<span class="hl">LAB</span> 设备无关、接近人眼感知，用于色彩校正与色差计算。<br>题目问「像素通常怎么表示」选 RGB；若问「印刷用什么模型」才选 CMYK。</div>`
    },
    {
      id: 'resolution',
      title: '分辨率、位深、压缩比',
      kicker: '第 3、9 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch4-resolution.jpg" alt="分辨率对比：人脸从 100×100 像素逐级降到 1×1，细节不断丢失" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>分辨率对比：人脸从 100×100 像素逐级降到 1×1，细节不断丢失</figcaption></figure>

<div class="cards cards--3">
  <div class="card"><span class="card-k">管清晰度</span><h4 class="card-t">分辨率</h4><p class="card-b">图像在空间与像素层面的采样密度，表述为宽×高像素数（1920×1080）或 PPI/DPI。像素越密，同一块画面记录的细节越多，边缘越锐利、小目标越不容易糊掉。</p></div>
  <div class="card"><span class="card-k">管颜色数量</span><h4 class="card-t">位深</h4><p class="card-b">每通道的量化级数。8 位每通道对应 256 级、约 1677 万色。与分辨率无关。</p></div>
  <div class="card"><span class="card-k">管文件大小</span><h4 class="card-t">压缩比</h4><p class="card-b">由编码算法与压缩参数决定（如 JPEG 质量因子）。分辨率越高通常文件越大。</p></div>
</div>
<div class="note note--warn"><strong>高分辨率是「细节换资源」</strong>：唯一真实优势是<span class="hl">呈现更丰富的细节、便于信息处理</span>，让检测、分割、OCR 有料可用。代价是计算量上升、加载传输更慢、存储更占空间。工程上常用下采样、裁剪、多尺度推理来平衡精度与耗时。<br>把「降低计算复杂度」「提高加载速度」「占用更少存储」说成高分辨率的优点，全是把代价当收益。</div>
<h4 class="sub-h">课件里的三个像素应用</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">信息处理</span><h4 class="card-t">文物修复</h4><p class="card-b">唐三彩彩色陶俑图像修复前后对照：上色、去除部分划痕。像素级操作让文物数字档案恢复可读性。</p></div>
  <div class="card"><span class="card-k">信息处理</span><h4 class="card-t">插值放大</h4><p class="card-b">用插值算法把 640×450 的图像放大 4 倍到 2560×1800。新增像素由周围已知像素推算，细节不会凭空产生。</p></div>
  <div class="card"><span class="card-k">信息处理</span><h4 class="card-t">病虫害检测</h4><p class="card-b">作物叶片图像中，发白的区域对应病虫害较严重的位置。颜色与纹理的像素级差异直接变成农业决策依据。</p></div>
</div>`
    },
    {
      id: 'features',
      title: '图像特征：视觉世界的密码',
      kicker: '第 10 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch4-log.jpg" alt="LoG 滤波器在不同 σ 尺度下的纹理提取：σ 越小细节越丰富" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>LoG 滤波器在不同 σ 尺度下的纹理提取：σ 越小细节越丰富</figcaption></figure>

<p>核心问题是计算机只看到像素矩阵。解决方案是识别图像中的<strong>特征</strong>——从图像中提取的、具有辨识度的视觉元素，是物体独特的「视觉指纹」。</p>
<div class="tbl"><table>
<thead><tr><th>特征类型</th><th>描述什么</th><th>课件例子</th><th>常用提取方法</th></tr></thead>
<tbody>
<tr><td><strong>颜色特征</strong></td><td>什么色、色彩如何分布</td><td>苹果的红色果皮与绿叶的鲜明对比</td><td>颜色直方图、颜色矩</td></tr>
<tr><td><strong>纹理特征</strong></td><td>表面的重复模式、粗糙度、方向性、疏密</td><td>树皮的粗糙纹路、丝绸的光滑质感</td><td>LBP、灰度共生矩阵 GLCM、Gabor 滤波</td></tr>
<tr><td><strong>形状特征</strong></td><td>什么外形、几条边、几何结构</td><td>猫的尖耳朵、书本的直角边</td><td>轮廓、角点、Hu 矩</td></tr>
<tr><td><strong>边缘特征</strong></td><td>灰度剧烈变化的位置</td><td>人脸轮廓的曲线、建筑物的棱角</td><td>Sobel、Canny、LoG</td></tr>
</tbody></table></div>
<div class="note note--key"><strong>一句话判据</strong>：问「表面看上去什么花纹」→ 纹理；问「什么色」→ 颜色；问「什么外形、几条边」→ 形状与边缘。</div>
<h4 class="sub-h">LoG 滤波器与尺度参数 σ</h4>
<p>LoG（Laplacian of Gaussian）主要用于检测边缘和纹理特征。关键参数 <strong>Sigma（σ）</strong>控制滤波器尺度，决定提取特征的粗细程度。</p>
<div class="tbl"><table>
<thead><tr><th>特征类型</th><th>σ=2 精细尺度</th><th>σ=4 粗略尺度</th></tr></thead>
<tbody>
<tr><td>边缘特征</td><td>边缘细致，能捕捉单根条纹边界等细节</td><td>边缘粗略，主要保留身体、头部等整体轮廓</td></tr>
<tr><td>纹理特征</td><td>增强细微纹理对比度，条纹内部细节更清晰</td><td>纹理被平滑化，保留条纹整体走向</td></tr>
<tr><td>形状特征</td><td>局部轮廓更精细（如腿部、耳朵）</td><td>整体结构更突出，弱化局部细节</td></tr>
<tr><td>应用总结</td><td>高精度细节分析，如条纹计数</td><td>整体目标识别，如斑马定位</td></tr>
</tbody></table></div>
<p><strong>取舍</strong>：σ 小对细节敏感，但容易受噪声干扰；σ 大对噪声不敏感，但会模糊细节。</p>
<h4 class="sub-h">特征解码三大步骤</h4>
<div class="steps">
  <li><b>扫描像素 Scan Pixels</b>：把图像分解为像素网格，记录每个像素的 RGB 颜色信息。</li>
  <li><b>提取特征 Extract Features</b>：运行算法（如 LoG），寻找像素间的规律——颜色聚集、连续边缘等。</li>
  <li><b>匹配模式 Match Patterns</b>：把提取出的特征与已知物体的特征数据库对比，推断类别（这是猫，那是车）。</li>
</div>
<div class="note"><strong>课件的两个应用</strong>：探索星空时，把亮星按相对位置连成图案，就能匹配出夏季大三角与猎户座——这正是「提取特征再匹配模式」的过程。动物保护中，通过分析大熊猫黑眼圈的大小与颜色变化判断健康状况，靠的是颜色与形状特征的量化对比。</div>`
    },
    {
      id: 'tasks',
      title: '四大任务：输出形式决定一切',
      kicker: '第 1、4、5、6 题',
      html: `
<figure class="lesson-fig" data-zoom><img src="assets/media/img/ch4-detect.jpg" alt="目标检测：输出类别标签 + 目标框，是分类与定位的结合" loading="lazy"><figcaption><span class="fig-tag">课件原图</span>目标检测：输出类别标签 + 目标框，是分类与定位的结合</figcaption></figure>

<p>计算机视觉的核心目标是让计算机具备通过图像或视频<strong>识别和理解世界中各种物体及其动作</strong>的能力，技术本质是把复杂的视觉世界分解为计算机可处理的结构化信息。</p>
<div class="tbl"><table>
<thead><tr><th>任务</th><th>回答什么问题</th><th>输出形式</th><th>是否跨帧</th></tr></thead>
<tbody>
<tr><td><strong>图像分类</strong></td><td>是什么</td><td>整图一个类别标签</td><td>否</td></tr>
<tr><td><strong>目标检测</strong></td><td>是什么 + 在哪里</td><td>类别标签 + 置信度 + 边界框 (x, y, w, h)</td><td>否（单帧）</td></tr>
<tr><td><strong>语义分割</strong></td><td>每个像素属于哪一类</td><td>逐像素类别掩码，不区分同类个体</td><td>否（单帧）</td></tr>
<tr><td><strong>实例分割</strong></td><td>每个像素属于哪个个体</td><td>逐像素掩码 + 实例编号（车-1、车-2、车-3）</td><td>否（单帧）</td></tr>
<tr><td><strong>目标跟踪</strong></td><td>这个目标后来去哪了</td><td>同一 ID 的位置序列、轨迹、速度、行为</td><td><strong>是</strong></td></tr>
</tbody></table></div>
<div class="note note--key"><strong>一句话区分</strong>：分类只答「是什么」；检测答「是什么 + 在哪（框）」；分割答「每个像素属于谁」；跟踪答「这个谁后来去哪了」。</div>
<h4 class="sub-h">目标检测的工作流程</h4>
<div class="steps">
  <li><b>图像输入</b>：接收一张图像或视频帧。</li>
  <li><b>特征提取</b>：提取颜色、形状、纹理等关键视觉特征。四边形的角可能是桌子，一条曲线可能是狗的尾巴。</li>
  <li><b>边界框回归</b>：预测物体位置并生成矩形框。</li>
  <li><b>分类</b>：判断框内物体属于哪个类别。</li>
  <li><b>输出结果</b>：标注好的图像或结构化数据（如 JSON）。</li>
</div>
<p><strong>应用场景</strong>：自动驾驶检测行人、车辆、交通标志；安全监控识别电动车进入电梯并报警；智能家居感知环境开启智慧生活；零售行业监测货架商品数量。</p>
<h4 class="sub-h">语义分割与实例分割</h4>
<p>两者都是像素级输出，差别只在<strong>要不要分个体</strong>。街景里两辆并排的出租车：语义分割看到「一片车」，实例分割看到「两辆车，各有一圈轮廓」。两者训练通常都需要人工掩码标注，成本都很高；实例分割多了一层区分，通常更重。另有<strong>全景分割</strong>，是语义分割（背景 Stuff）与实例分割（可数物体 Thing）的合并版。</p>
<div class="duo">
  <div class="duo-col"><h4>语义分割的应用</h4><ul>
    <li><strong>虚拟现实</strong>：在家环游世界，把场景分区后叠加虚拟内容</li>
    <li><strong>医学影像</strong>：肝脏肿瘤 CT 分割，红色为正常肝脏组织、绿色为肿瘤组织</li>
    <li><strong>智能安防</strong>：人群场景预测群体分割结果，紫色表示拥挤区域</li>
    <li><strong>农业</strong>：区分作物与杂草，绿色表示作物、红色表示杂草</li>
  </ul></div>
  <div class="duo-col duo-col--alt"><h4>实例分割的应用</h4><ul>
    <li><strong>人群计数</strong>：精准统计图像中的人数</li>
    <li><strong>机器人抓取</strong>：精确定位每一个待抓取物体</li>
    <li><strong>医疗图像</strong>：区分同一患者体内多个病灶，细分癌细胞密集区与坏死区</li>
    <li><strong>自动驾驶</strong>：区分轿车、卡车、公交车，识别位置、方向与速度</li>
    <li><strong>工业质检</strong>：分割零部件区域，检测划痕、裂纹、变形</li>
    <li><strong>物流仓储</strong>：识别货物类型与边界，快速定位盘点</li>
    <li><strong>影视制作</strong>：把演员从复杂背景中精确分离，无缝抠像合成</li>
  </ul></div>
</div>
<h4 class="sub-h">目标跟踪</h4>
<p>关键词是<strong>跨帧、同一目标、持续</strong>。典型流程是逐帧检测 → 数据关联（IOU、外观特征、卡尔曼滤波、匈牙利算法）→ 轨迹维护。<span class="hl">检测是跟踪的组件，但跟踪不等于检测</span>。</p>
<p><strong>应用场景</strong>：智能摄影跟踪球场上快速奔跑的运动员；辅助驾驶做车辆识别、测距、测速、预测轨迹；监控系统检测危险区域人员闯入并报警；增强现实 AR 课堂的教师示范与施工辅助。</p>
<div class="note note--warn"><strong>第 8 题的判断口径</strong>：看应用的<span class="hl">直接产出</span>是不是「找出目标 + 给出类别和框」。<br>电动车入梯监测、人脸识别解锁（第一步是人脸检测）、交通标志识别，主标签都是<strong>检测</strong>。<br>顾客行走路线热力图的核心是「同一个人在连续帧里走到哪」，主标签是<strong>跟踪 + 轨迹聚合 + 热力统计</strong>，产出是路线与热度分布，因此不属于目标检测。真实系统里它也会先用检测器找人，但题目考的是应用归属的主技术。</div>`
    },
    {
      id: 'multimodal',
      title: '视觉多模态：模仿人类的综合感知',
      kicker: '第 7 题',
      html: `
<p>「模态」指信息的不同承载形式：图像与视频（视觉）、文本、语音、深度图、红外、雷达与 IMU 传感器信号。视觉多模态的关键是把视觉和其他模态<strong>相互对应、互补、联合推理</strong>，如同人类综合运用视觉、听觉、触觉做决策。</p>
<div class="note"><strong>为什么需要融合</strong>：单一模态各有盲区——图像怕遮挡、文本缺空间信息、雷达缺纹理。融合能互相补证，提升鲁棒性。</div>
<div class="note note--key"><strong>课件的典型场景：医疗影像诊断</strong><br>视觉模态：肺部 CT 影像，分析结节形状与密度。<br>文本模态：电子病历，如「持续咳嗽三周」。<br>数据模态：血液检测报告，白细胞计数等数值。<br>音频模态：听诊器呼吸音，判断肺部通气情况。</div>
<h4 class="sub-h">三项核心技术</h4>
<div class="cards cards--3">
  <div class="card"><span class="card-k">技术一</span><h4 class="card-t">跨模态统一向量空间</h4><p class="card-b">类比把地图与文字描述中的同一个地点对应起来。把图像特征、文本描述、数值指标转换到同一个低维向量空间，在这个共享的「通用语言」空间里高效比较与关联，为后续融合推理奠定基础。</p></div>
  <div class="card"><span class="card-k">技术二</span><h4 class="card-t">动态特征融合</h4><p class="card-b">扮演优秀的协调者，根据信息的重要性与相关性动态分配注意力权重。CT 影像异常明显时给图像模态更高权重；症状复杂需结合病史与化验时，文本与数值模态权重相应增加。</p></div>
  <div class="card"><span class="card-k">技术三</span><h4 class="card-t">多模态推理引擎</h4><p class="card-b">像拼图高手把零散信息拼成完整画面。输入 CT 结节 + 咳嗽文本 + 炎症指标高，综合分析各项证据，输出「疑似真菌感染，建议支气管镜检查」。</p></div>
</div>
<h4 class="sub-h">技术演进三阶段</h4>
<div class="tbl"><table>
<thead><tr><th>阶段</th><th>时间</th><th>技术特征</th><th>交互深度</th><th>典型能力与局限</th></tr></thead>
<tbody>
<tr><td>机械式多模态拼接</td><td>1990s–2000s</td><td>关键词标签匹配</td><td>浅层、孤立</td><td>图文关联检索。搜「猫」返回所有带猫标签的图片，无法区分品种与姿态。系统不理解内容本身</td></tr>
<tr><td>跨模态注意力机制</td><td>2010–2018</td><td>注意力机制（Transformer）</td><td>中层、关联</td><td>像智能放大镜自动关注重要部分。微软 CaptionBot 尝试为图像生成描述，开创视觉语言交互先河，但常出错（把婚礼照描述为「一群人在食物旁」）。校园应用：板书与讲课录音按时间自动对应，生成可搜索课件</td></tr>
<tr><td>多模态预训练大模型</td><td>2019–至今</td><td>海量多模态数据预训练</td><td>深层、原生</td><td>零样本推理（GPT-4V 解析数学题照片直接给步骤）、多模态生成（DALL·E 3 按文本生成概念图）、具身智能（PaLM-E 在杂乱课桌上找到并抓取指定文具）</td></tr>
</tbody></table></div>
<p><strong>发展路径</strong>：从感知到认知，从关联到生成。数据的「量」与算法的「力」共同驱动，实现能力的阶跃式发展。</p>
<h4 class="sub-h">八大应用领域</h4>
<div class="tbl"><table>
<thead><tr><th>领域</th><th>融合什么</th><th>产出什么</th></tr></thead>
<tbody>
<tr><td>医疗</td><td>X 光、CT、MRI 与临床数据</td><td>发现细微病变、提高诊断准确性；融合术前影像与术中视觉做手术导航</td></tr>
<tr><td>教育</td><td>表情变化、肢体动作、语音</td><td>感知学生状态，实时调整教学节奏，量身定制学习计划</td></tr>
<tr><td>交通</td><td>摄像头、雷达、激光雷达</td><td>识别道路状况与障碍物；优化信号控制缓解拥堵</td></tr>
<tr><td>智能家居</td><td>摄像头、语音识别设备</td><td>按家庭成员行为自动调节环境；监测异常及时报警</td></tr>
<tr><td>娱乐</td><td>视觉画面、动作姿态、语音、环境音效</td><td>沉浸式游戏体验；影视制作整合画面与演员表情动作</td></tr>
<tr><td>金融</td><td>面部、虹膜、语音；财务报表与市场动态</td><td>身份验证与风险评估</td></tr>
<tr><td>工业制造</td><td>产品外观图像、物理特性数据、设备运行声音</td><td>质量检测；实时监测人员操作、设备状态、物料流动以优化流程</td></tr>
<tr><td>文化遗产保护</td><td>高分辨率相机、三维扫描、材质记录；无人机、地面传感器、历史文献</td><td>文物数字化与遗址保护</td></tr>
</tbody></table></div>`
    }
  ],
  questions: [
    {
      n: 1, type: 'single', score: 10,
      stem: '计算机视觉的核心目标是？（　）',
      opts: ['让计算机存储图像数据', '提高图像分辨率', '通过算法解析、理解和处理图像 / 视频，提取知识', '实现图像的像素化'],
      ans: 'C',
      why: '<p>计算机视觉要让机器从像素中还原语义：图里有什么、在哪里、在做什么、彼此什么关系。输入是图像与视频，输出是类别、位置、结构、轨迹、描述等知识。</p><ul><li>A：存储属于数据管理，不涉及理解。</li><li>B：提高分辨率是超分辨率与图像增强任务，只是分支或预处理手段。</li><li>D：像素化是数字图像形成的前提，恰恰是 CV 要反向突破的起点。</li></ul><p>任务分层：底层去噪、增强、边缘；中层检测、分割、跟踪；高层识别、理解、描述生成、视觉推理。</p>',
      point: '计算机视觉的学科定义',
      anchor: 'CV 的目标是从像素还原语义'
    },
    {
      n: 2, type: 'single', score: 10,
      stem: '像素的颜色信息通常通过以下哪种模型表示？（　）',
      opts: ['CMYK 模型', 'HSL 模型', 'LAB 模型', 'RGB 模型'],
      ans: 'D',
      why: '<p>摄像头采集、屏幕显示、绝大多数图像文件解码后在内存中的像素值，默认都是 R、G、B 三通道叠加，每通道 8 位共 24 位色。</p><ul><li>A：CMYK 是减色模型，服务印刷打印。</li><li>B：HSL 是面向人调色的感知型模型，常由 RGB 转换而来。</li><li>C：LAB 设备无关、接近人眼感知，用于色彩校正与色差计算。</li></ul><p>四个都是颜色模型，题目问的是像素通常怎么表示。若题干改成「印刷用什么模型」，答案才是 A。</p>',
      point: '颜色模型的分工',
      anchor: '屏幕与传感器用 RGB，印刷用 CMYK'
    },
    {
      n: 3, type: 'single', score: 10,
      stem: '分辨率的作用是？（　）',
      opts: ['识别图像中的物体类别', '衡量图像中像素的密集程度，影响细节清晰度', '决定图像的颜色数量', '控制图像的压缩比例'],
      ans: 'B',
      why: '<p>分辨率描述图像在空间与像素层面的采样密度，表述为宽×高像素数或 PPI/DPI。像素越密，记录的细节越多，边缘越锐利、小目标越不容易糊掉。</p><ul><li>A：识别类别是图像分类与目标检测的输出。</li><li>C：颜色数量由位深与量化级数决定，8 位每通道约 1677 万色。</li><li>D：压缩比例由编码算法与压缩参数决定，分辨率越高通常文件越大。</li></ul>',
      point: '分辨率、位深、压缩比三者区分',
      anchor: '分辨率管清晰度，位深管颜色数，压缩比管文件大小'
    },
    {
      n: 4, type: 'single', score: 10,
      stem: '目标检测技术的主要输出是？（　）',
      opts: ['物体的像素级分割结果', '图像中物体的类别标签和边界框位置', '物体的运动轨迹', '图像的分辨率提升版本'],
      ans: 'B',
      why: '<p>目标检测 = 分类（What）+ 定位（Where）。标准输出每条包含类别标签、置信度、边界框 (x, y, w, h)，即在图上画矩形框并写上「人 / 车 / 狗」。</p><ul><li>A：像素级分割结果属于图像分割，输出逐像素掩码。</li><li>C：运动轨迹属于目标跟踪，需要跨帧关联同一 ID。</li><li>D：分辨率提升属于超分辨率重建。</li></ul>',
      point: '目标检测的输出形式',
      anchor: '检测答「是什么 + 在哪（框）」'
    },
    {
      n: 5, type: 'single', score: 10,
      stem: '语义分割与实例分割的主要区别在于？（　）',
      opts: ['语义分割处理视频，实例分割处理图像', '语义分割需要人工标注，实例分割自动完成', '语义分割区分物体类别，实例分割区分同类物体的不同个体', '语义分割精度更高，实例分割速度更快'],
      ans: 'C',
      why: '<p>两者都是像素级输出，差别只在要不要分个体。画面里 3 辆车，语义分割全部涂成同一个「车」颜色；实例分割输出车-1、车-2、车-3 各自的掩码，属于类别加个体双重区分。</p><ul><li>A：两者都主要处理图像，也可扩展到视频。</li><li>B：两者训练通常都需要人工掩码标注，成本都很高。</li><li>D：精度与速度取决于模型与数据，不是定义性差别；实例分割多一层区分，通常更重。</li></ul><p>另有全景分割，是语义分割（背景 Stuff）与实例分割（可数物体 Thing）的合并版。</p>',
      point: '语义分割与实例分割的本质差别',
      anchor: '语义分类别，实例分个体'
    },
    {
      n: 6, type: 'single', score: 10,
      stem: '目标跟踪技术的核心是？（　）',
      opts: ['提高图像的色彩还原度', '实现图像的风格转换', '在单帧图像中识别物体', '在视频中持续锁定并记录目标的位置和轨迹'],
      ans: 'D',
      why: '<p>跟踪的关键词是跨帧、同一目标、持续：把第 t 帧的目标与后续帧对应起来，维持稳定 ID，得到位置序列即轨迹。典型流程是逐帧检测 → 数据关联（IOU、外观特征、卡尔曼、匈牙利）→ 轨迹维护。检测是跟踪的组件，但跟踪不等于检测。</p><ul><li>A：色彩还原属于图像增强与白平衡。</li><li>B：风格转换属于风格迁移与图像生成。</li><li>C：单帧识别物体正是目标检测与分类，少了时间关联，是本题最大干扰项。</li></ul>',
      point: '跟踪的时间维度',
      anchor: '跨帧 + 同一 ID + 持续 = 跟踪'
    },
    {
      n: 7, type: 'single', score: 10,
      stem: '视觉多模态技术的关键是？（　）',
      opts: ['融合视觉与其他模态（语音、文本、传感器信号等）信息', '仅处理视觉图像数据', '提高单一模态数据的处理效率', '实现图像的超分辨率重建'],
      ans: 'A',
      why: '<p>模态指信息的不同承载形式。视觉多模态的关键是把视觉和其他模态相互对应、互补、联合推理，例如图文检索 CLIP、视觉问答、自动驾驶的摄像头加激光雷达、语音与画面联合理解。</p><ul><li>B：单模态，与「多」直接矛盾。</li><li>C：仍在优化单模态内部效率，没有跨模态。</li><li>D：超分是纯视觉内部的生成任务。</li></ul><p>单一模态各有盲区：图像怕遮挡、文本缺空间、雷达缺纹理，融合能互相补证提升鲁棒性。</p>',
      point: '多模态的定义与价值',
      anchor: '多模态的关键词是融合与互补'
    },
    {
      n: 8, type: 'single', score: 10,
      stem: '以下哪项应用不属于目标检测技术？（　）',
      opts: ['智能摄像头检测电动车进入电梯', '零售店铺分析顾客行走路线热力图', '手机人脸识别解锁', '自动驾驶识别交通标志'],
      ans: 'B',
      why: '<p>判断口径是应用的直接产出是不是「找出目标 + 给出类别和框」。</p><ul><li>A：判断有没有电动车、在画面哪，典型目标检测，常带告警联动。</li><li>C：人脸解锁流水线第一步就是人脸检测（框出人脸）再做特征比对，按本章归类属检测类应用。</li><li>D：先检测到标志框再分类，检测是核心环节。</li><li>B：核心是「同一个人在连续帧里走到哪」，属于目标跟踪 + 轨迹聚合 + 热力统计，产出是路线与热度分布。真实系统里也会先用检测器找人，但主技术标签是跟踪与行为分析。</li></ul>',
      point: '从应用产出反推主技术',
      anchor: '热力图靠轨迹聚合，主标签是跟踪'
    },
    {
      n: 9, type: 'single', score: 10,
      stem: '高分辨率图像的优势在于？（　）',
      opts: ['降低算法的计算复杂度', '提高图像的加载速度', '占用更少的存储空间', '呈现更丰富的细节，便于信息处理'],
      ans: 'D',
      why: '<p>分辨率升高使采样点更多，小目标、边缘、纹理、文字等细粒度信息被保留，检测、分割、OCR 等后续算法有料可用。</p><p>其余三项全是把代价说成收益：像素数涨则卷积与注意力计算量上升；数据量更大则加载传输更慢；未压缩像素更多则存储更占空间。高分辨率是「细节换资源」，工程上常要下采样、裁剪、多尺度推理来平衡。</p>',
      point: '分辨率的收益与代价',
      anchor: '与第 3 题互为正反两面'
    },
    {
      n: 10, type: 'single', score: 10,
      stem: '以下哪项属于图像的「纹理特征」？（　）',
      opts: ['树皮的粗糙纹路', '物体的颜色分布', '人脸的轮廓曲线', '书本的直角边'],
      ans: 'A',
      why: '<p>纹理特征描述图像局部区域内灰度或颜色的重复模式、粗糙度、方向性、疏密，不关心整体轮廓，只关心表面长什么样。树皮、布纹、木纹、草地、砖墙都是教科书级例子，常用 LBP、灰度共生矩阵 GLCM、Gabor 滤波提取。</p><ul><li>B：颜色分布属于颜色特征，用颜色直方图与颜色矩。</li><li>C：人脸轮廓曲线属于形状与边缘特征。</li><li>D：书本直角边属于形状与边缘特征（直线、角点）。</li></ul>',
      point: '颜色、纹理、形状三类底层特征',
      anchor: '问表面花纹是纹理，问什么色是颜色，问外形边角是形状'
    }
  ]
});