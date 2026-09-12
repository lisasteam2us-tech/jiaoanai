import { db } from './index.ts';
import {
  curriculumStandards,
  textbookKnowledgeNodes,
  studentMisconceptions,
  teachingScaffolds,
} from './schema.ts';
import { sql } from 'drizzle-orm';

export async function seedComprehensiveKnowledge() {
  try {
    console.log('[Seed] 检查知识库是否已有数据...');
    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(curriculumStandards);

    if (countRes && countRes.count > 0) {
      console.log(`[Seed] 知识库已有 ${countRes.count} 条课标记录，跳过初始灌库。`);
      return;
    }

    console.log('[Seed] 正在向 Cloud SQL PostgreSQL 灌入首批全国新课标教研大纲与知识图谱资产...');

    // 1. 课程标准与素养指标 (覆盖语文、数学、英语、物理、化学、生物、历史、地理、道法、科学)
    await db.insert(curriculumStandards).values([
      {
        subject: '语文',
        stage: '小学',
        grade: '1-2年级',
        coreCompetencies: '文化自信、语言运用、思维能力、审美创造',
        bigIdeas: '文学阅读与创意表达：在诵读和儿歌朗读中建立音形义联结，激发对大自然生命和语言韵律的好奇。',
        qualityStandards: '能正确流利地朗读课文，读出疑问句的语气；在观察中提炼动物特征，尝试模仿问答句式进行简单创编。',
        benchmarkCode: 'CN-CHI-2022-P1-2',
      },
      {
        subject: '语文',
        stage: '初中',
        grade: '7-9年级',
        coreCompetencies: '文化自信、语言建构、思辨读写、审美鉴赏',
        bigIdeas: '思辨性阅读与表达：依托散文意象与写景技法，剖析作者由自然物象升华至生命体验的审美脉络。',
        qualityStandards: '能品味汪曾祺、朱自清等现当代名篇的语言平淡之美，分析生活琐屑中的人情味与文化底蕴。',
        benchmarkCode: 'CN-CHI-2022-M7-9',
      },
      {
        subject: '数学',
        stage: '小学',
        grade: '3-6年级',
        coreCompetencies: '数感、量感、空间观念、推理意识、模型意识',
        bigIdeas: '图形与几何核心大概念：化曲为直的转化思想，通过极限逼近感知圆周率与曲线测量本质。',
        qualityStandards: '经历测量、猜想、滚动、割圆逼近等探究过程，自主建构并验证 C = πd = 2πr 的数学模型。',
        benchmarkCode: 'CN-MAT-2022-P3-6',
      },
      {
        subject: '数学',
        stage: '初中',
        grade: '7-9年级',
        coreCompetencies: '抽象能力、几何直观、空间观念、运算能力、严谨演绎推理',
        bigIdeas: '几何图形演绎大概念：特殊与一般的辩证统一，由平行四边形向矩形、菱形、正方形递进的性质与判定网络。',
        qualityStandards: '能熟练运用综合法证明特殊平行四边形的判定与性质定理，画出树状分类逻辑图，解决几何动点与极值问题。',
        benchmarkCode: 'CN-MAT-2022-M7-9',
      },
      {
        subject: '地理',
        stage: '高中',
        grade: '高一/高二',
        coreCompetencies: '人地协调观、综合思维、区域认知、地理实践力',
        bigIdeas: '地球运动与时空规律：黄赤交角存在导致太阳直射点回归移动，从而引起正午太阳高度角的时间节律与纬度递变。',
        qualityStandards: '能运用空间几何模型推导 H = 90° - |纬度差|，绘制正午太阳高度周年变化曲线，解决楼间距与太阳能采光实务问题。',
        benchmarkCode: 'CN-GEO-2022-H1-2',
      },
      {
        subject: '道德与法治',
        stage: '小学',
        grade: '3-4年级',
        coreCompetencies: '政治认同、道德修养、法治观念、健全人格、责任意识',
        bigIdeas: '人与家乡自然生态共生：从空间尺度体悟祖国河山壮丽，树立生态保护法律法规红线意识。',
        qualityStandards: '识别中国地势三级阶梯，以家乡生态微调研为载体，设计可行的儿童生态文明守护行动提案。',
        benchmarkCode: 'CN-MOR-2022-P3-4',
      },
      {
        subject: '物理',
        stage: '初中',
        grade: '八年级',
        coreCompetencies: '物理观念、科学思维、科学探究、科学态度与责任',
        bigIdeas: '相互作用与压强模型：单位面积上所受的压力定义压强，理解固体压强与液体压强的微观与宏观差异。',
        qualityStandards: '会设计控制变量实验探究影响压力作用效果的因素，运用 p=F/S 与 p=ρgh 解释深海潜水与破窗锤原理。',
        benchmarkCode: 'CN-PHY-2022-M8',
      },
    ]);

    // 2. 全国教材课时知识图谱
    await db.insert(textbookKnowledgeNodes).values([
      {
        subject: '语文',
        version: '统编版',
        gradeStage: '一年级上册',
        unitTitle: '第六单元·动物自然与问答歌',
        lessonTitle: '比尾巴',
        prerequisites: '掌握拼音拼读、基础问号语气停顿与日常动物观察生活常识。',
        coreObjectives: '1. 认读“比、尾、巴”等11个生字；2. 准确读好三连问疑问语调；3. 抓住长、短、扁、弯等对比形容词建立特征卡。',
        keyFocus: '指导疑问句的语调停顿（上扬）及两两动物尾巴特征的分类识记。',
        difficulty: '理解“扁”、“伞”等比喻特征，从被动读背进阶为自主仿创儿歌。',
      },
      {
        subject: '语文',
        version: '统编版',
        gradeStage: '三年级上册',
        unitTitle: '第三单元·童话世界的情怀与哲思',
        lessonTitle: '稻草人',
        prerequisites: '掌握记叙文六要素，能体会童话拟人手法的基本修辞作用。',
        coreObjectives: '1. 抓住稻草人心痛、着急但无能为力的动作细节；2. 剖析叶圣陶作品中对下层劳动人民的深沉悲悯；3. 学习借景写情。',
        keyFocus: '分析三次求救与三次破灭的层层递进心理刻画。',
        difficulty: '跨越时代背景隔阂，领会现实主义童话“不能动的爱与痛”思想内核。',
      },
      {
        subject: '数学',
        version: '人教版',
        gradeStage: '六年级上册',
        unitTitle: '第五单元·圆的性质与面积',
        lessonTitle: '圆的周长',
        prerequisites: '直线多边形（长方形、正方形）周长公式；估算与测量基本操作技能。',
        coreObjectives: '1. 领悟“化曲为直”的转化法；2. 探索圆周长与直径的固定比值关系；3. 理解圆周率 π 的数学史与无限不循环本质。',
        keyFocus: '实验操作与数据收集，归纳周长 C 与直径 d 的正比例关系。',
        difficulty: '极限逼近思想的感知：正多边形边数无限增多时逐步趋向圆周曲线。',
      },
      {
        subject: '数学',
        version: '人教版',
        gradeStage: '八年级下册',
        unitTitle: '第十八章·平行四边形',
        lessonTitle: '特殊平行四边形',
        prerequisites: '平行四边形的性质与判定；全等三角形判定与尺规作图。',
        coreObjectives: '1. 厘清矩形、菱形、正方形从“角”或“边”特殊化的集合包含关系；2. 熟练应用对角线性质解题。',
        keyFocus: '从对角线相等、垂直、平分的不同维度推导判定定理。',
        difficulty: '克服判定定理与性质定理逆命题混淆，构建完整四边形网络思维导图。',
      },
      {
        subject: '地理',
        version: '人教版/中图版',
        gradeStage: '高一必修一',
        unitTitle: '第一单元·宇宙中的地球',
        lessonTitle: '正午太阳高度角的变化',
        prerequisites: '地球自转公转方向周期、黄赤交角 23°26′ 与太阳直射点移动轨迹。',
        coreObjectives: '1. 掌握正午太阳高度的概念与计算通式；2. 归纳夏至日、冬至日、二分日全球纬度分布特征；3. 解决建筑楼间距。',
        keyFocus: '正午太阳高度随纬度分布和季节变化的定量推算及规律归纳。',
        difficulty: '空间思维立构：三维地球公转光照图向二维正午太阳高度剖面图的认知转换。',
      },
    ]);

    // 3. 学生典型认知障碍与易错归因库
    await db.insert(studentMisconceptions).values([
      {
        subject: '数学',
        gradeStage: '小学高年级',
        topic: '圆的周长',
        misconceptionTitle: '圆周率等于3.14且随圆的大小改变',
        typicalSymptom: '“大圆的周长更长，所以大圆的 π 肯定比小圆的 π 更大！”或者“π 就是 3.14，它是一个有限小数。”',
        rootCause: '未能建立“常数比值”的恒定函数概念，将测量误差当做比例常数的波动，将计算近似值 3.14 误认为精确值。',
        interventionStrategy: '【动态滚圆对比支架】：让不同小组测量硬币、瓶盖、自行车轮并填表计算 C÷d，柱状图横向对照发现全都收敛在 3.1 左右，引入祖冲之割圆术动画强化常数本质。',
      },
      {
        subject: '数学',
        gradeStage: '初中',
        topic: '特殊平行四边形',
        misconceptionTitle: '对角线互相垂直就认定是菱形',
        typicalSymptom: '在证明题中，仅凭 AC⊥BD 就下结论“所以四边形ABCD是菱形”，忽略了“必须在平行四边形的前提下”。',
        rootCause: '思维跳跃与孤立记忆性质：学生只记住了菱形对角线垂直的表象，忽视了几何体系中“母体+特化限制”的层级结构（比如筝形对角线也垂直但不是平行四边形）。',
        interventionStrategy: '【反例冲突辨析支架】：出示四根木棒钉成的“风筝形”（AC⊥BD但不是平行四边形），诱发认知失调；再出示分类包含集合维恩图（Venn Diagram）。',
      },
      {
        subject: '语文',
        gradeStage: '小学低年级',
        topic: '比尾巴',
        misconceptionTitle: '把疑问语气读成陈述语气，把特征标签化背诵',
        typicalSymptom: '读“谁的尾巴长？”读成语调下沉的平声；在介绍松鼠尾巴时只会机械复述“像一把伞”，不知道为什么像伞。',
        rootCause: '一年级儿童对标点符号的功能感知尚停留在视觉符号，未能转化为言语交际中的追问心态；缺乏具象动作体验。',
        interventionStrategy: '【森林记者问答支架】：让学生一人手持放大镜做“小记者”，一人戴动物头饰做“动物明星”，用夸张好奇表情上扬升调发问，配合披毯子动作体悟“像伞一样保暖和降落”。',
      },
      {
        subject: '地理',
        gradeStage: '高中',
        topic: '正午太阳高度角的变化',
        misconceptionTitle: '混淆“太阳高度”与“正午太阳高度”，公式误套纬度加减法',
        typicalSymptom: '误以为一天中任何时候都是正午太阳高度；在计算 H = 90° - |纬度差| 时，同半球与异半球的加减判定混乱。',
        rootCause: '二维平面空间感知局限，未能建立动态太阳天球视运动轨迹图；机械套用公式而非理解几何互余角原理。',
        interventionStrategy: '【地平经纬仪投影支架】：现场使用激光笔在地平仪模型上打出直射点光线，几何辅助线推导同侧同旁内角互补与互余关系，提炼出“同半球减、异半球加”的几何本质口诀。',
      },
    ]);

    // 4. 特级名师逆向支架与评价量规
    await db.insert(teachingScaffolds).values([
      {
        subject: '综合学科',
        gradeStage: '全学段通用',
        topic: '通用表现性任务',
        scaffoldType: 'rubric',
        title: '特级教师三星逆向评价量规 (Three-Star Rubric)',
        content: JSON.stringify({
          star1: '【基础达标★】：能根据范例复述概念、完成标准步骤，指出明显错误。',
          star2: '【良好进阶★★】：能独立建立逻辑模型，对比分析异同，在真实情境中灵活迁移解题并阐述因果关系。',
          star3: '【特级卓越★★★】：能主动质疑反思、多角度辨析反例、设计原创探究方案或解决跨学科复杂劣构问题。',
        }),
        expertPedagogy: '评教一致性：以终为始（UbD），先设计学生达标的三星证据，再反推教学活动的推进层级。',
      },
      {
        subject: '数学',
        gradeStage: '初中',
        topic: '特殊平行四边形',
        scaffoldType: 'inquiry_chain',
        title: '苏霍姆林斯基启发式追问链',
        content: JSON.stringify([
          '第一问（直观感知）：如果我们拉动平行四边形的一个活动顶点，当一个内角变成 90° 时，它的对角线发生了什么奇妙变化？',
          '第二问（反向思辨）：如果仅知道两条对角线相等，它一定能变成矩形吗？你能用手中的皮筋拉出一个反例吗？',
          '第三问（逻辑收敛）：矩形与菱形如果“结婚”，会生出一个怎样的“完美图形”？它同时继承了父母的哪些基因？',
        ]),
        expertPedagogy: '问题链设计原则：每一个设问都直击学生潜在认知冲突，将灌输式定理证明转变为学生的发现之旅。',
      },
    ]);

    console.log('[Seed] Cloud SQL 知识库数据初始灌充成功完成！');
  } catch (error) {
    console.error('[Seed] 灌充数据异常:', error);
  }
}
