/**
 * 表现性评价量规与微教学支架规范字典 (第5层知识库)
 * 来源：课标附录评价案例、华东师大崔允漷《学历案》与UbD逆向设计标准
 */
import { PerformanceRubricTemplate } from "./types.js";

export const PERFORMANCE_RUBRIC_TEMPLATES: PerformanceRubricTemplate[] = [
  // 1. 文学阅读与语言品味评价量规 (语文)
  {
    id: "rubric_literary_analysis",
    rubricName: "初中语文细节品味与深层情感体悟表现性量规",
    pedagogyMethod: "reading_expression_group",
    applicableScenarios: ["文学作品阅读", "记叙文写人记事", "散文细节鉴赏"],
    dimensions: [
      {
        dimensionName: "细节提取与还原度",
        levelThreeEvidence: "★★★ 卓越级：能敏锐捕捉文中极细微的动作反常点（如动作迟缓、攀爬笨拙），结合特定时代家庭处境，精准还原人物真实心理活动与未明言的千言万语。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能找出文中的动作与神态描写，并能解释字面意思，点出人物的关心与慈爱。",
        levelOneEvidence: "★ 需帮扶级：只能泛泛回答'写得很好'、'很感动'，无法具体指出哪些字词具有关键表现力。"
      },
      {
        dimensionName: "情感反思与自我建构",
        levelThreeEvidence: "★★★ 卓越级：能反思自己与父母长辈日常相处中的'冷漠/任性/误解'，产生真诚的认知失调与愧疚感，并在创意练笔中写出克制深沉的真实细节。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能表达出要感恩父母的观点，写作能围绕主题展开，情感真实。",
        levelOneEvidence: "★ 需帮扶级：套用通用口号（如'我们要听爸爸妈妈的话'），缺乏真情实感与细节依托。"
      }
    ],
    scaffoldingToolkit: [
      {
        toolName: "慢镜头特写批注微锦囊",
        description: "引导学生对一个连续动作进行定格拆解（如穿衣、爬铁道、掏钱、擦泪），用'动词替换法'体会表达效果。",
        usageGuide: "提供句式支架：'如果把此处的【攀】换成【爬】/【跳】，效果有何不同？为什么作者非用这个词不可？'"
      },
      {
        toolName: "双视角色彩对比表",
        description: "对比'当年的我（年轻任性自以为是）'与'现在的我（饱经沧桑悔恨泪目）'对同一件事的不同视角。",
        usageGuide: "绘制双栏对比表格，左栏填写'当时的心理与举动'，右栏填写'事后回看的心痛与懂得'。"
      }
    ]
  },

  // 2. 数学探究与逻辑推理评价量规 (数学)
  {
    id: "rubric_math_inquiry_proof",
    rubricName: "初中数学几何定理探究与演绎推理表现性量规",
    pedagogyMethod: "UbD_backward",
    applicableScenarios: ["几何定理探索与证明", "勾股定理", "图形性质与判定"],
    dimensions: [
      {
        dimensionName: "数形结合与面积割补建模",
        levelThreeEvidence: "★★★ 卓越级：能独立借助赵爽弦图或拼图操作，清晰利用整式运算列出`(a+b)^2 - 4*(1/2ab) = c^2`进行逻辑无漏洞化简，讲清面积守恒本质。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能在他人或教师提示下完成拼图，并验证公式`a²+b²=c²`在特定直角三角形中成立。",
        levelOneEvidence: "★ 需帮扶级：仅能死记背诵公式字母，拿到变式或没有字母c的图形不知所措，无法解释定理来源。"
      },
      {
        dimensionName: "分类讨论与严密推理",
        levelThreeEvidence: "★★★ 卓越级：在已知直角三角形两边长时，能自主识别'未指明哪条是斜边'的隐含条件，主动分情况讨论，答案无遗漏。",
        levelTwoEvidence: "★★ 良好级（达标底线）：在教师提醒'注意斜边'后，能补充漏掉的另一种解题可能。",
        levelOneEvidence: "★ 需帮扶级：直接想当然地将给出的两边代入作为直角边计算，缺乏严密分类意识。"
      }
    ],
    scaffoldingToolkit: [
      {
        toolName: "无字证明（Proof without words）操作盘",
        description: "提供 4 个全等直角三角形纸片与 1 个小正方形纸片，供学生同桌合作在 2 分钟内拼接大正方形。",
        usageGuide: "任务提示：请计算拼出的大正方形面积的两种不同算式：一种是边长平方，一种是各部分面积之和。"
      },
      {
        toolName: "直角三角形三边关系防踩坑自检卡",
        description: "给出 3 组易错特例（如边长 3 和 4；边长 6 和 8；直角顶点未知等），训练学生的分类审题雷达。",
        usageGuide: "学生动笔前先默念三问：① 是否明确直角在哪？② 是否明确给出的数是直角边还是斜边？③ 是否满足三角形三边关系？"
      }
    ]
  },

  // 3. 科学探究与控制变量实验量规 (小学科学)
  {
    id: "rubric_science_poe_inquiry",
    rubricName: "小学科学探究实验与证据意识表现性量规",
    pedagogyMethod: "POE_inquiry",
    applicableScenarios: ["对比实验设计", "水的三态变化", "力与运动实验"],
    dimensions: [
      {
        dimensionName: "预测-观察-解释（POE）科学思维",
        levelThreeEvidence: "★★★ 卓越级：能基于现象大胆提出有根据的假设，用事实证据反驳直觉错误，并运用微观粒子或状态转移观点科学解释原因。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能观察到实验现象并如实记录数据，得出水受热蒸发变快的结论。",
        levelOneEvidence: "★ 需帮扶级：观察不细致，甚至篡改记录迎合老师预设的答案。"
      },
      {
        dimensionName: "控制变量实验严谨性",
        levelThreeEvidence: "★★★ 卓越级：在设计对比实验时，能自主做到'严格控制只有一个变量不同，其余条件完全一致'，并能反思实验中可能存在的误差来源。",
        levelTwoEvidence: "★★ 良好级（达标底线）：在教师指导下能分清哪个条件变、哪些条件不能变。",
        levelOneEvidence: "★ 需帮扶级：同时改变了两个或多个变量（例如既加热水又吹风），无法得出单一有效结论。"
      }
    ],
    scaffoldingToolkit: [
      {
        toolName: "公平实验天平卡（控制变量支架）",
        description: "用天平两端比喻对比实验：相同条件放左盘（必须完全平衡），不同条件放右盘（只能有一项）。",
        usageGuide: "在探究水蒸发快慢时，用磁力贴让学生将'水滴大小'、'水滴位置'贴在相同栏，只留'是否加热'在不同栏。"
      },
      {
        toolName: "水分子逃逸微观动画透镜",
        description: "把看不见的水蒸气具象化为'爱奔跑的水宝宝'，让低中段小学生理解水不是凭空消失。",
        usageGuide: "配合透明密封袋冷水温水对比实验，观察袋壁出现的小水珠，提供'液化证据'。"
      }
    ]
  },

  // 4. 真实情境交际与语篇思辨表现性量规 (英语/外语)
  {
    id: "rubric_english_communication",
    rubricName: "初高中英语情境交际与语篇逻辑思辨表现性量规",
    pedagogyMethod: "task_based_language",
    applicableScenarios: ["真实情境对话", "主题阅读语篇分析", "思辨性书面表达"],
    dimensions: [
      {
        dimensionName: "语境得体性与语言流利度",
        levelThreeEvidence: "★★★ 卓越级：在真实任务情境中发音自然、用词得体地道，能根据说话对象身份灵活选用恰当的语体（正式/非正式），交流零中式英语直译痕迹。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能借助句型支架表达核心意思，基本无重大时态错误，交际顺畅。",
        levelOneEvidence: "★ 需帮扶级：词汇破碎，停顿频次高，存在严重时态单复数混淆，交流出现明显阻滞。"
      },
      {
        dimensionName: "语篇逻辑与跨文化批判思辨",
        levelThreeEvidence: "★★★ 卓越级：能敏锐梳理语篇隐性逻辑线索，辩证评价文化异同，在写作中段落过渡自然、论据充实。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能回答语篇表层事实细节，能完成要点罗列并写出合乎语法的段落。",
        levelOneEvidence: "★ 需帮扶级：仅能照抄原文碎片句子，缺乏自主概括能力与批判性思考。"
      }
    ],
    scaffoldingToolkit: [
      {
        toolName: "语篇连接词与逻辑跳板卡",
        description: "提供表示转折（However, In contrast）、递进（Furthermore）、因果（Consequently）的句式支架卡。",
        usageGuide: "要求学生在每次发表观点或修改作文时，至少嵌入两个逻辑跳板词以强化思维连贯度。"
      }
    ]
  },

  // 5. 跨学科科学探究与工程实证量规 (物理/化学/生物/信息科技)
  {
    id: "rubric_general_stem_inquiry",
    rubricName: "理化生与信息科技实证探究与模型构建表现性量规",
    pedagogyMethod: "inquiry_experimental",
    applicableScenarios: ["物理力热电实验", "化学守恒与变化探究", "生物显微与生理探究", "信息科技算法设计"],
    dimensions: [
      {
        dimensionName: "物理微观模型建构与守恒意识",
        levelThreeEvidence: "★★★ 卓越级：能从微观粒子/能量守恒/受力平衡等学科大概念出发，建立严谨的数学物理模型，解释复杂异常现象。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能规范操作仪器设备，准确记录实验测量数据，并按标准步骤完成定律验证。",
        levelOneEvidence: "★ 需帮扶级：盲目动手，仪器读数出现原理性错误，对实验背后的物理化学本质缺乏理解。"
      },
      {
        dimensionName: "科学论证与实证反思",
        levelThreeEvidence: "★★★ 卓越级：能主动分析系统误差与偶然误差的来源，设计排除干扰变量的改进对照实验，严谨撰写实证报告。",
        levelTwoEvidence: "★★ 良好级（达标底线）：能在教师指导下指出可能导致数据偏离的某个操作原因。",
        levelOneEvidence: "★ 需帮扶级：数据与理论不符时私自篡改真实记录，缺乏尊重事实的科学品德。"
      }
    ],
    scaffoldingToolkit: [
      {
        toolName: "隔离体受力与微观反应可视化图纸",
        description: "引导学生在动笔计算或实验前，强制画出受力分析隔离体图或微观分子重组示意图。",
        usageGuide: "学生自检：'力是否找到了施力物体？化学键断裂与形成是否原子种类守恒？'"
      }
    ]
  }
];
