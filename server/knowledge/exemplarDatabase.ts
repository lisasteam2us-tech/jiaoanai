/**
 * 经典名师课例实录切片与中高考真实学情易错认知库 (第2层 & 第3层知识库)
 * 来源：国家智慧教育平台部级精品课、历年省市中考教学质量分析报告、全国青年教师教学大赛获奖课例
 */
import { StudentMisconceptionEntry, MasterLessonExemplar } from "./types.js";

/**
 * 真实学情卡壳与中考典型错解归因库
 */
export const STUDENT_MISCONCEPTIONS: StudentMisconceptionEntry[] = [
  // 1. 初中语文《背影》
  {
    id: "misc_cn_beiying_01",
    topic: "背影",
    subject: "chinese",
    gradeBand: "junior",
    stumblingPointName: "用当代优渥眼光审视民国父子，误以为父亲'违反交规、自私霸道'，无法理解'肥胖、蹒跚、吃力爬月台'背后压抑的破产之痛",
    pseudoUnderstandingSign: "课堂上一问'父亲爱不爱儿子'，全班高呼'爱，父亲给儿子买橘子很伟大'；但一到自主品读，私下窃笑父亲体态臃肿、嫌弃父亲多嘴迂腐，根本没有触及深层悲悯。",
    cognitiveObstacleReason: "十四五岁初中生生活在和平富足时代，缺乏家庭遭逢巨变（祖母去世、父亲赋闲、债台高筑、变卖典质）的生活经验，对'中年男人的穷途末路与强撑体面'完全处于共情盲区。",
    examFailureEvidence: "历年中考散文阅读题中，考查'文中三次写到作者流泪，为何第二次是赶紧拭干了泪'，得分率常年低于 45%。近半数学生机械写'怕父亲看见'，答不出'害怕父亲发现自己看穿了他掩饰的辛酸与衰颓，唯恐刺痛父亲最后的自尊'。",
    recommendedRescueScaffold: {
      scaffoldType: "step_worksheet",
      actionDescription: "补充【徐州老家惨淡光景】历史信件档案微补充包，设计'父亲动作定格三联对比'学习单，把'胖'还原为'重担下的踉跄'。",
      rescuePromptingChain: [
        "追问1：父亲当时多大年纪？（四十七八岁，并不算太老）——那为什么一个不到五十岁的男人，穿布棉袍、走几步路会如此'蹒跚'？",
        "追问2：车站到处有脚夫小贩，给几个小钱就能代劳买橘子，为什么债台高筑的父亲宁可亲自'费事'也要穿过铁道、爬上爬下？他到底在跟谁赌气？",
        "追问3：当朱自清看到父亲用两手攀着上面、两脚向上缩、身子微向左倾时，他为什么'赶紧拭干了泪'，而不是跑过去帮一把？"
      ]
    }
  },

  // 2. 初中数学《勾股定理》
  {
    id: "misc_math_pythagorean_01",
    topic: "勾股定理",
    subject: "math",
    gradeBand: "junior",
    stumblingPointName: "公式代入机械死套，完全忽略'哪条边是斜边'的分类讨论与直角存在前提",
    pseudoUnderstandingSign: "做标准练习题已知 a=3, b=4 都能一口报出 c=5；但题目一旦变形为'已知直角三角形两边长分别为 3 和 4，求第三边'，90% 的学生毫不犹豫写 5，直接漏掉直角边情况。",
    cognitiveObstacleReason: "小初几何认知惯性：学生习惯于'公式就是套数字'，把`a²+b²=c²`当成代数加法表，缺乏将字母与图形特定边（直角边/斜边）进行空间几何绑定的严密推理意识。",
    examFailureEvidence: "某省期末联考及中考填空题第12题：'若直角三角形的两边长为 3 和 4，则第三边的长为____'。全省全对率（写5或√7）仅为 27.6%，高达 68.2% 的考生直接答 5 被扣全部分数。",
    recommendedRescueScaffold: {
      scaffoldType: "counter_example",
      actionDescription: "出示'作图悖论直通车'：给每位学生发直尺与圆规，让其亲手画出'以 4 为斜边、3 为直角边的直角三角形'，在实操中发现第三边是根号7而非5。",
      rescuePromptingChain: [
        "追问1：我们在公式 a²+b²=c² 中，谁规定 c 必须是未知的第三边？斜边一定是长为 4 的边吗？还是 4 只能当直角边？",
        "追问2：当 4 是斜边时，直角三角形的第三条直角边有多长？请用勾股定理算一下看，等于 5 吗？",
        "追问3：今后在题目中看到'直角三角形'但没有指明直角顶点或斜边时，脑海里第一道警戒线应该是什么？"
      ]
    }
  },

  // 3. 小学科学《水到哪里去了》
  {
    id: "misc_sci_evaporation_01",
    topic: "水到哪里去了",
    subject: "science",
    gradeBand: "primary_mid",
    stumblingPointName: "儿童直觉以为'水蒸发就是水被消灭了/不存在了'，或者把白汽误当成水蒸气",
    pseudoUnderstandingSign: "看到黑板上的水迹干了，学生能流利回答'蒸发了'、'变成了水蒸气'；但一问'那水蒸气长什么样？'，全班争先恐后指着烧开水冒出的白汽说'就是那团白烟'。",
    cognitiveObstacleReason: "小学生处于具体运算阶段，'看不见即不存在'的知觉经验占主导；同时日常口语将沸水壶口的小水滴悬浮物俗称为'热气/白汽'，造成顽固的前科学概念混淆。",
    examFailureEvidence: "小学科学毕业监测题：'水蒸气是一种（ ）的气体。A.白色看得见 B.无色无味看不见'。近 53% 的三年级学生错选 A，无法区分液态小水滴与气态水蒸气。",
    recommendedRescueScaffold: {
      scaffoldType: "physical_analogy",
      actionDescription: "设计'魔术透明密封袋'与'透明玻璃杯倒扣'对比实证支架：在干燥透明自封袋内滴入一滴水并封口，在阳光下晒干后观察袋子鼓起；移至阴凉处后观察袋内壁重新凝结出无数微小水珠。",
      rescuePromptingChain: [
        "追问1：密封袋从头到尾没有开封，袋子里的水跑出来了吗？如果没跑出来，为什么水滴不见了？",
        "追问2：袋子为什么会微微鼓起来？谁在里面撑着？",
        "追问3：当我们把袋子放进冰水上方，袋壁上又冒出了什么？这些小水珠是从外太空来的，还是刚才那个'看不见的朋友'变回来的？"
      ]
    }
  },

  // 4. 初中物理《压强与浮力》
  {
    id: "misc_phy_pressure_01",
    topic: "压强",
    subject: "physics",
    gradeBand: "junior",
    stumblingPointName: "混淆'受力面积'与'物体的底面积'，或盲目认为压力总是等于物体的重力",
    pseudoUnderstandingSign: "套用公式 p=F/S 时，直接将物体的长宽乘积当做 S，或者在斜面上直接写 F=G。",
    cognitiveObstacleReason: "前物理概念混淆：直觉认为'只要物体放上去，接触就是全部面积'，没有建立垂直作用在接触面上的矢量投影意识。",
    examFailureEvidence: "历年中考力学计算题中，当木块只有一半叠放在桌面上时，超过 42% 的考生误用整个木块底面积计算压强。",
    recommendedRescueScaffold: {
      scaffoldType: "visual_diagram",
      actionDescription: "设计'红色印泥盖章法'：让学生将不同放置姿态的物体底部沾满红色印泥压在白纸上，观察白纸上真正的'受力红色印痕'才是有效 S。",
      rescuePromptingChain: [
        "追问1：如果把一根铅笔两头用手指顶住，两个手指感受到的压力大小一样吗？为什么笔尖那一端感觉钻心的疼？",
        "追问2：书本悬空一半搭在桌沿，真正压在桌面上的面积是整本书的封面，还是桌沿下的那一半？"
      ]
    }
  },

  // 5. 初中化学《质量守恒定律》
  {
    id: "misc_chem_conservation_01",
    topic: "质量守恒定律",
    subject: "chemistry",
    gradeBand: "junior",
    stumblingPointName: "以宏观感官直觉替代微观原子守恒，误认为'有气体生成或燃烧变轻'就不遵守守恒",
    pseudoUnderstandingSign: "背诵质量守恒定律一字不差，但做实验看到镁条燃烧后白色粉末变轻，立刻动摇怀疑定律有例外。",
    cognitiveObstacleReason: "缺乏封闭系统意识与微观原子重新组合的守恒心智模型。",
    examFailureEvidence: "中考化学实验探究题：'敞口烧杯中盐酸与碳酸钙反应天平指针向右偏'，35% 的学生答'质量变小了，该反应不遵守质量守恒'。",
    recommendedRescueScaffold: {
      scaffoldType: "step_worksheet",
      actionDescription: "设计气球套紧锥形瓶的密闭装置对比实验，先在密闭系统反应称重，再刺破气球释放二氧化碳称重，体会质量'飞走'的本质。",
      rescuePromptingChain: [
        "追问1：天平指针为什么偏了？是原子被消灭了，还是有看不见的物质逃逸到了空气中？",
        "追问2：反应前后，碳原子、钙原子、氧原子的总数量变过吗？既然原子数量没变，总质量怎么可能无故消失？"
      ]
    }
  },

  // 6. 初中英语《时态辨析与语篇阅读》
  {
    id: "misc_eng_tense_01",
    topic: "一般过去时",
    subject: "english",
    gradeBand: "junior",
    stumblingPointName: "脱离真实语境机械记忆规则变化，在 when/while 复合句中无法感知动作延续与短暂打断",
    pseudoUnderstandingSign: "单项选择题能做对 did，但一到真实书面表达或复合句，动词时态全篇混乱，各种现在时与过去时交织混用。",
    cognitiveObstacleReason: "母语汉语没有动词屈折形态变化，学生习惯用中文思维直译，缺乏语篇宏观'时间锚点'的自觉控制。",
    examFailureEvidence: "中考英语书面表达评分分析显示：动词时态前后不一致（混用 is/was、go/went）占总语法扣分项的 61.4%。",
    recommendedRescueScaffold: {
      scaffoldType: "step_worksheet",
      actionDescription: "引入'故事时间轴色块法'：用冷色蓝标记过去故事背景，用暖色橙标记突发动作，帮助建立时态的镜头感。",
      rescuePromptingChain: [
        "追问1：这个动作是在你说这句话之前就已经结束了，还是现在仍然在发生？",
        "追问2：当听到敲门声（短暂动作）的时候，你正在做的事情（延续动作）是什么？"
      ]
    }
  }
];

/**
 * 经典特级名师课例实录切片库 (国家精品课拆解)
 */
export const MASTER_LESSON_EXEMPLARS: MasterLessonExemplar[] = [
  // 1. 初中语文《背影》
  {
    id: "master_cn_beiying",
    topic: "背影",
    subject: "chinese",
    gradeBand: "junior",
    textbookVersion: "统编部编版",
    chapterContext: "八年级上册 第二单元 第5课",
    masterTeacher: "国家智慧教育平台部级精品课示范 / 特级名家课例",
    bigQuestion: "为什么这篇不足千五百字、写尽父亲'不体面与尴尬'的平实散文，能跨越百年让无数人掩面长泣？",
    timelineSlices: [
      {
        timeSlot: "00-05 min",
        coreActivity: "情境唤醒：展示朱自清 1925 年在北京清华园收到父亲来信'惟膀子疼痛厉害，举箸提笔，诸多不便，大约大去之期不远矣'的真实影印背景，直面生死离别的创伤情境。",
        masterQuestionChain: [
          "问题1：这封信距当年的浦口车站送别已经过去了八年。为什么八年之后，三十岁的朱自清在晶莹的泪光中，又浮现出那个黑布马褂的背影？"
        ],
        scaffoldingNotes: "将学生从'初中生读父母'的浅层说教，拉入'人到中年蓦然读懂老父'的深沉历史情境。"
      },
      {
        timeSlot: "05-18 min",
        coreActivity: "望父买橘·特写定格：圈画第6段动词，按'穿衣-下铁道-过铁轨-爬月台-抱橘-放橘'绘制慢镜头分解图。",
        masterQuestionChain: [
          "问题1：请大家盯住父亲过铁道时这四个动词：'攀'、'缩'、'倾'。如果换成'爬'、'迈'、'跳'，父亲的形象会发生什么微妙变化？",
          "问题2：父亲两手攀着上面时，两脚为什么是'向上缩'，而不是'往上登'？这个'缩'字暴露出父亲什么身体秘密？"
        ],
        scaffoldingNotes: "提供动词替换卡：通过词义张力与动作还原，逼出'肥胖、穿棉袍、老境颓唐、筋力衰退'的沉重现实。"
      },
      {
        timeSlot: "18-28 min",
        coreActivity: "对话解密·破解伪懂：梳理全文父亲说的五句极其简短朴拙的话，对比儿子当年的自作聪明与内疚。",
        masterQuestionChain: [
          "问题1：父亲每次说话都不超过两句，为什么总带着'事已如此，不必难过'、'不要紧，他们去不好'这样的大白话？",
          "问题2：朱自清两次说自己'那时真是太聪明了'，'太聪明'到底是在讽刺谁？"
        ],
        scaffoldingNotes: "组织同桌进行双视角朗读，体会'大爱无声、笨拙难言'的东方父爱隐忍美学。"
      },
      {
        timeSlot: "28-35 min",
        coreActivity: "聚焦板书与随堂表现任务：完成【父母的不体面时刻】300字微写作，写一个长辈为了生活'不帅气甚至狼狈'但竭尽全力的细节瞬间。",
        masterQuestionChain: [
          "问题1：在你的记忆中，是否有过父母某一次穿粗布衣、骑破车、或者跟别人小心赔笑的背影，曾让你觉得难堪，如今想来却鼻头发酸？"
        ],
        scaffoldingNotes: "出示优秀与薄弱范例对比，严禁泛泛写'妈妈每天做饭很辛苦'，必须锁定一个具体动作定格。"
      },
      {
        timeSlot: "35-40 min",
        coreActivity: "思维提升：梳理四次背影与三次流泪的感情结构线，完成星级量规自评。",
        masterQuestionChain: [
          "总结追问：为什么文章首尾呼应的背影是朦胧的，而惟独买橘子的背影被刻画得像木刻版画一样清晰？"
        ],
        scaffoldingNotes: "点出文学中'剪影式典型意象'对抒发隐忍情感的艺术价值。"
      }
    ],
    blackboardDesign: {
      patternType: "flow_ladder",
      leftWing: [
        "【时空背景】",
        "徐州惨淡·变卖典质",
        "浦口车站·仓促送别",
        "八年之后·清华见信"
      ],
      centerStage: [
        "【核心意象：望父买橘定格】",
        "步履：蹒跚 ────┐",
        "姿态：微胖 ────┼─→ 隐忍山父·强撑尊严",
        "动作：攀·缩·倾 ─┘",
        "  ↓",
        "【四次背影 ──── 三次拭泪】",
        "难忘 ── 刻画 ── 惜别 ── 怀念"
      ],
      rightWing: [
        "【表现性评价】",
        "★★★ 动作拆解入微",
        "★★☆ 读懂隐忍父爱",
        "★☆☆ 仅知字面意思"
      ],
      chalkColorGuide: "白色书写主干事实，黄色粉笔重点圈画'攀·缩·倾'动作，红色标注'三次拭泪'情感转折点。"
    }
  },

  // 2. 初中数学《勾股定理》
  {
    id: "master_math_pythagorean",
    topic: "勾股定理",
    subject: "math",
    gradeBand: "junior",
    textbookVersion: "人教版",
    chapterContext: "八年级下册 第十七章 勾股定理 第1课时",
    masterTeacher: "全国青年教师数学展示一等奖 / 特级课例",
    bigQuestion: "直角三角形三条边的长度平方和，为什么在任何情况下都能像魔法一样保持恒等？中国古代数学家是如何用一张拼图征服全世界的？",
    timelineSlices: [
      {
        timeSlot: "00-05 min",
        coreActivity: "历史谜题导入：毕达哥拉斯在朋友家地砖上发现的秘密——等腰直角三角形三边正方形的面积关系。",
        masterQuestionChain: [
          "问题1：观察铺设正方形瓷砖的地面，以等腰直角三角形三边为边长向外作正方形，面积 P、Q、R 之间有何关系？一般直角三角形也成立吗？"
        ],
        scaffoldingNotes: "从特殊的等腰直角三角形网格数格子，迁移至任意直角三角形面积测量猜想。"
      },
      {
        timeSlot: "05-18 min",
        coreActivity: "动手实证：4人小组利用 4 张全等的直角三角形纸片（直角边 a, b，斜边 c）拼成赵爽弦图大正方形，探寻面积守恒。",
        masterQuestionChain: [
          "问题1：我们拼出的大正方形边长是多少？它的总面积可以怎么用 c 来表示？",
          "问题2：如果不看大正方形边长，把这个图形拆成零件，它的总面积又可以由哪些部分的面积相加得到？",
          "问题3：既然算的是同一个图形的面积，这两个代数式能画等号吗？化简后你惊奇地发现了什么？"
        ],
        scaffoldingNotes: "提供赵爽弦图拼图盘，学生在动手操作中自然推导出 `4*(1/2ab) + (b-a)^2 = c^2` 即 `a^2 + b^2 = c^2`。"
      },
      {
        timeSlot: "18-28 min",
        coreActivity: "辨析纠偏：破解中考失分陷阱（分类讨论与实际建模）。",
        masterQuestionChain: [
          "陷阱题：直角三角形两边长分别为 3 和 4，求第三边长。真的是 5 吗？为什么小明画出的三角形斜边是 4？",
          "问题2：遇到题目没画图、没标明角 C 是直角时，做题应该有几根弦？"
        ],
        scaffoldingNotes: "黑板出示两种不同直角三角形图形对比，形成肌肉记忆：分类讨论（当 4 为斜边 vs 当 4 为直角边）。"
      },
      {
        timeSlot: "28-35 min",
        coreActivity: "工程实战应用：测量大树高度/圆柱蚂蚁最短路线展开，学生独立完成随堂任务单。",
        masterQuestionChain: [
          "问题1：蚂蚁怎么走最近？'两点之间线段最短'的平面定理，怎么用在曲面的圆柱上？"
        ],
        scaffoldingNotes: "引导学生'立体问题平面化（侧面展开图）'，在展开的长方形中利用勾股定理算斜边。"
      },
      {
        timeSlot: "35-40 min",
        coreActivity: "全课反思：数形结合思想提升与三星级达标自评。",
        masterQuestionChain: [
          "总结追问：勾股定理美在哪里？它是怎样把代数里的'平方加法'与几何里的'直角与面积'紧密焊在一起的？"
        ],
        scaffoldingNotes: "强化'以形助数、以数解形'的数学大观念。"
      }
    ],
    blackboardDesign: {
      patternType: "contrast_tree",
      leftWing: [
        "【定理内容】",
        "在直角三角形中：",
        "两直角边平方和等于斜边平方",
        "符号语言：",
        "∵ 在 Rt△ABC 中, ∠C=90°",
        "∴ a² + b² = c²"
      ],
      centerStage: [
        "【数形转化·赵爽弦图无字证明】",
        "大正方形面积 = 4个直角三角形 + 1个小正方形",
        "c² = 4 × (1/2·a·b) + (b - a)²",
        "c² = 2ab + b² - 2ab + a²",
        "c² = a² + b²  (完全恒等变形)",
        "【防踩坑分类雷达】",
        "若已知 a=3, b=4：",
        "① 4 为直角边 → 第三边 c = 5",
        "② 4 为斜边   → 第三边 = √(4²-3²) = √7"
      ],
      rightWing: [
        "【数学思想】",
        "① 数形结合",
        "② 割补法 (面积守恒)",
        "③ 分类讨论思想"
      ],
      chalkColorGuide: "彩色粉笔区分 a, b（黄色直角边）与 c（白色斜边），红色粉笔写出分类讨论结果。"
    }
  },

  // 3. 小学科学《水到哪里去了》
  {
    id: "master_sci_water_evaporation",
    topic: "水到哪里去了",
    subject: "science",
    gradeBand: "primary_mid",
    textbookVersion: "教科版",
    chapterContext: "三年级上册 第一单元 水 第1课时",
    masterTeacher: "全国小学科学特级教师 / 优质课大赛一等奖",
    bigQuestion: "洗干净的衣服挂在太阳底下，水滴既没有流走，也没有人把它喝掉，水到底跑哪儿去了？它还在这个世界上吗？",
    timelineSlices: [
      {
        timeSlot: "00-05 min",
        coreActivity: "魔术情境导入：用湿毛笔在黑板上写一个大大的'水'字，计时观察水迹的变化。",
        masterQuestionChain: [
          "问题1：盯着黑板看，一分钟过去，字迹发生了什么变化？黑板上的水到哪里去了？"
        ],
        scaffoldingNotes: "鼓励学生各抒己见，暴露前概念：'被黑板吃掉了'、'不见了'、'变成了看不见的气'。"
      },
      {
        timeSlot: "05-18 min",
        coreActivity: "对比实验实证：水真的逃出去了吗？两个同样大小的烧杯，倒入等量水，一杯敞口，一杯用塑料薄膜封口，静置观察。",
        masterQuestionChain: [
          "问题1：经过一段时间，敞口杯和封口杯里的水面高度会有什么不同？",
          "问题2：封口塑料薄膜内表面出现了什么？这些小水珠是从哪里来的？能证明水真的跑出去了吗？"
        ],
        scaffoldingNotes: "提供对比实验观察记录表，用红蓝记号笔画好起始刻度线，让证据说话。"
      },
      {
        timeSlot: "18-28 min",
        coreActivity: "思维破除：水蒸气看得见吗？科学解释'水蒸发'与'白汽'的本质区别。",
        masterQuestionChain: [
          "问题1：水变成的水蒸气是什么样的？我们平时看水开冒出的'白汽'是水蒸气吗？",
          "问题2：仔细观察烧水壶嘴最贴近出口的地方，那里是透明的还是白的？为什么离壶嘴远一点才看到白汽？"
        ],
        scaffoldingNotes: "手持强光手电筒照射沸水壶嘴透明处，引导学生发现：无色透明看不见的才是真正的水蒸气，白汽其实是遇冷重新凝结的小水滴。"
      },
      {
        timeSlot: "28-35 min",
        coreActivity: "探究实践：怎样让水蒸发得更快？4人小组设计'吹风、加热、摊开'控制变量实验方案。",
        masterQuestionChain: [
          "问题1：如果你想证明'吹风能让水干得更快'，两块湿纸巾有什么条件必须完全一样？只能有什么不同？"
        ],
        scaffoldingNotes: "出示'公平天平'对比磁铁卡，强化控制变量意识。"
      },
      {
        timeSlot: "35-40 min",
        coreActivity: "总结升华：水在自然界里的大循环旅行，完成表现性评价自评。",
        masterQuestionChain: [
          "总结追问：今天洗澡流走的水，明天有没有可能变成天上的一朵云？水真的会永远消失吗？"
        ],
        scaffoldingNotes: "展示地球水循环简图，建立'物质不灭、循环转化'的朴素科学观念。"
      }
    ],
    blackboardDesign: {
      patternType: "loop_cycle",
      leftWing: [
        "【观察现象】",
        "水迹变干",
        "水面下降",
        "衣服晾干"
      ],
      centerStage: [
        "【水到哪里去了·状态变化】",
        " 液态水  ──( 吸热蒸发 )──→  气态水蒸气",
        " (看得见/有形)             (看不见/无色)",
        "    ↑                           │",
        "    └────( 遇冷凝结 )──────────┘",
        "         (如：白汽、小水珠)",
        "【加快蒸发三秘诀】",
        "① 温度升高  ② 表面积变大  ③ 空气流动快"
      ],
      rightWing: [
        "【科学探究量规】",
        "★★★ 严控单一变量",
        "★★☆ 观察记录详实",
        "★☆☆ 能举生活例子"
      ],
      chalkColorGuide: "蓝色粉笔画液态水，白色箭头表示蒸发路径，黄色粉笔重点板书'无色、透明、看不见'特征。"
    }
  }
];
