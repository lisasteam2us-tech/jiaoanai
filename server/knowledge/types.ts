/**
 * 中小学教研专业知识库与素养图谱数据类型定义
 * 严格对标《义务教育课程标准（2022年版）》与一线教学实操标准
 */

export type SubjectCode =
  | "chinese" // 语文
  | "math" // 数学
  | "english" // 英语
  | "morality_law" // 道德与法治
  | "science" // 科学 (小学)
  | "physics" // 物理 (初中/高中)
  | "chemistry" // 化学 (初中/高中)
  | "biology" // 生物学 (初中/高中)
  | "history" // 历史
  | "geography" // 地理
  | "information_tech" // 信息科技
  | "labor" // 劳动
  | "art_music" // 艺术(音乐)
  | "art_fine" // 艺术(美术)
  | "physical_health"; // 体育与健康

export type GradeBand =
  | "primary_low" // 小学低段 (1-2年级)
  | "primary_mid" // 小学中段 (3-4年级)
  | "primary_high" // 小学高段 (5-6年级)
  | "junior" // 初中 (7-9年级)
  | "senior"; // 高中 (10-12年级)

/**
 * 1. 新课标素养与核心大概念条目
 */
export interface CurriculumStandardEntry {
  id: string;
  subject: SubjectCode;
  gradeBand: GradeBand;
  coreDisciplineConcept: string; // 学科大观念 (Big Idea)
  competencyDomains: string[]; // 核心素养维度 (如: 语文 文化自信/语言运用/思维能力/审美创造; 数学 会用数学眼光/思维/语言)
  learningTaskGroup?: string; // 学习任务群 (如: 实用性阅读与交流/文学阅读与创意表达/思辨性阅读与表达)
  contentStandards: string[]; // 课标内容要求
  qualityBenchmarks: string[]; // 学业质量标准 (达标行为证据)
  sourceDocument: string; // 官方出处: 如《义务教育语文课程标准（2022年版）》第X页
}

/**
 * 2. 真实学情卡壳与易错认知分析 (来源：历年中考/期末试卷分析、教科研期刊)
 */
export interface StudentMisconceptionEntry {
  id: string;
  topic: string; // 关联课题
  subject: SubjectCode;
  gradeBand: GradeBand;
  stumblingPointName: string; // 卡点名称 (如: "分不清'压强'与'压力'的物理本质")
  pseudoUnderstandingSign: string; // 表面"伪懂"假象 (课堂看似对答如流的虚假表现)
  cognitiveObstacleReason: string; // 真实思维断层根因 (为什么会卡壳)
  examFailureEvidence: string; // 考评实测证据 (如: 2024某市中考该题得分率仅38%，62%学生混淆受力面积与接触面)
  recommendedRescueScaffold: {
    scaffoldType: "physical_analogy" | "counter_example" | "step_worksheet" | "visual_diagram";
    actionDescription: string; // 教师实操破局支架描述
    rescuePromptingChain: string[]; // 名师递进追问链 (破除伪懂的关键提问)
  };
}

/**
 * 3. 经典名师课例与实录教学切片 (来源：国家智慧教育平台部级精品课、全国青年教师教学展示)
 */
export interface MasterLessonExemplar {
  id: string;
  topic: string;
  subject: SubjectCode;
  gradeBand: GradeBand;
  textbookVersion: string; // 如: 统编部编版、人教版、苏科版
  chapterContext: string; // 如: 八年级上册 第二单元 第5课
  masterTeacher?: string; // 执教名师/课例来源 (如: 窦桂梅、于永正、部级精品课一等奖)
  bigQuestion: string; // 驱动性大问题
  timelineSlices: {
    timeSlot: string; // 如: 05-18 min
    coreActivity: string; // 学生活动
    masterQuestionChain: string[]; // 名师关键问题链 (递进三连问)
    scaffoldingNotes: string; // 支架引导关键点
  }[];
  blackboardDesign: {
    patternType: "contrast_tree" | "loop_cycle" | "flow_ladder" | "center_radiate" | "dynamic_table";
    leftWing: string[]; // 左翼主干
    centerStage: string[]; // 中台推演
    rightWing: string[]; // 右翼量规/提升
    chalkColorGuide: string; // 彩粉笔使用策略
  };
}

/**
 * 4. 表现性评价量规与微支架规范 (来源：课标附录、华东师大崔允漷团队学历案规范)
 */
export interface PerformanceRubricTemplate {
  id: string;
  rubricName: string;
  pedagogyMethod:
    | "UbD_backward"
    | "task_driven"
    | "POE_inquiry"
    | "reading_expression_group"
    | "task_based_language"
    | "inquiry_experimental";
  applicableScenarios: string[];
  dimensions: {
    dimensionName: string;
    levelThreeEvidence: string; // ★★★ 卓越级表现特征
    levelTwoEvidence: string; // ★★ 良好级(达标底线)
    levelOneEvidence: string; // ★ 需帮扶级(常见低阶表现)
  }[];
  scaffoldingToolkit: {
    toolName: string;
    description: string;
    usageGuide: string;
  }[];
}

/**
 * 知识库统一检索结果
 */
export interface KnowledgeRetrievalResult {
  matchedCurriculum?: CurriculumStandardEntry;
  misconceptions: StudentMisconceptionEntry[];
  lessonExemplar?: MasterLessonExemplar;
  rubricTemplate?: PerformanceRubricTemplate;
  authoritativeCitations: string[]; // 权威出处列表
}
