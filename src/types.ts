export interface CaseDocument {
  id: string;
  name: string;
  originalPath: string;
  displayPath: string;
  size: number;
  wordCount: number;
  extractedText: string;
  htmlContent: string;
  summary: string;
  keyPoints: string[];
  docType: "input" | "output" | "other"; // 明确文档类型：输入 vs 输出
  images: string[];
}

export interface TeachingStep {
  timeRange: string;         // 如 "00-05 min"
  phaseTitle: string;        // 如 "真实情境激趣：森林动物王国的特殊来电"
  studentActivity: string;    // 学生活动与探究
  teacherPrompt: string;      // 教师关键设问与追问链
  scaffolding: string;        // 真实学情卡壳预设与补救支架（关键！）
  designIntent: string;       // 设计意图与认知支撑
}

export interface EnhancedTeachingPlan {
  caseId: string;
  topic: string;
  gradeSubject: string;
  versionInfo: string;
  coreConcept: string;        // 学科大观念 (Big Idea)
  
  // 1. 课例诊断与学情逆向审计
  diagnosis: {
    originalHighlights: string;   // 教师原案闪光点与一线教学经验
    criticalGaps: string[];       // 3大实操痛点诊断（具体而非套话）
    targetAudienceProfile: string;// 真实班级学情与已知/未知分析
  };

  // 2. 核心素养与教学目标三维表现量表
  competencyGoals: {
    category: string;             // 如 "语言运用"、"空间观念"
    performanceGoal: string;      // 可观测可达成的具体素养目标描述
    evidenceOfLearning: string;   // 评价证据
  }[];

  // 3. 40分钟精准行课施工图
  timeline: TeachingStep[];

  // 4. 黑板板书物理布局设计图
  boardDesign: {
    layoutType: string;           // 如 "对称结构型"、"动态形变轴"、"图文思维网"
    leftWing: string;             // 左翼：主干知识/情境任务
    centerStage: string;          // 中部：师生动态生成/推导图谱
    rightWing: string;            // 右翼：核心结论/评价量规/关键词
    teacherNotes: string;         // 书写节奏与彩色粉笔提示
  };

  // 5. 随堂学生学习探究单与表现性评价量规
  studentWorksheet: {
    sheetTitle: string;
    drivingQuestion: string;
    tasks: {
      taskNumber: string;
      taskPrompt: string;
      scaffoldTip: string;
      responseAreaPlaceholder: string;
    }[];
    rubrics: {
      dimension: string;
      levels: {
        level3: string; // 卓越
        level2: string; // 良好合格
        level1: string; // 需辅导
      };
    }[];
  };

  // 6. 分层弹性作业设计
  tieredHomework: {
    tier1Basic: string;           // 基础巩固（必做）
    tier2Exploratory: string;     // 进阶探究（挑战选做）
    tier3Practical: string;       // 生活实践与跨学科（综合运用）
  };

  // 7. 三方横向审计对比指标
  auditComparison: {
    dimension: string;
    teacherInputState: string;
    legacyAiOutputState: string;
    enhancedPlanState: string;
    practicalVerdict: string;
  }[];

  // 8. 官方课标与真实教研知识库权威出处引用
  authoritativeCitations?: string[];
}

export interface CaseComparison {
  expansionRatio: number; // 字数扩充倍数，如 10.9
  teacherName: string;    // 原执教老师/主备人
  aiEvaluator: string;    // AI教研员/重构者（如 蔡龄锋老师 / 青湖教育科学研究院）
  subjectGrade: string;   // 学段与学科
  inputWordCount: number; // 输入字数
  outputWordCount: number;// 输出字数
  inputCharacteristics: string;  // 教师原始初稿特征与局限
  outputImprovements: string;    // AI输出文档核心重构亮点与突破
  critiqueFocus: string;         // AI教研员讲评聚焦问题
  teachingGoalsEvolution: {
    original: string;     // 原教案教学目标
    reconstructed: string;// 重构后素养目标
  };
  taskDesignEvolution: string;   // 学习任务与情境创设进化
  homeworkEvolution: string;     // 作业与评价分层演进
}

export interface CaseGroup {
  id: string;
  title: string;
  folderName: string;
  originalFolder: string;
  files: CaseDocument[];
  inputFile?: CaseDocument;  // 输入文档
  outputFile?: CaseDocument; // 输出文档
  enhancedPlan?: EnhancedTeachingPlan; // 新一代特级专家科学重构版
  comparison?: CaseComparison; // 输入与输出的对照分析
  caseAnalysis?: {
    background: string;
    coreProblem: string;
    actionOrMethod: string;
    results: string;
    insights: string;
  };
}

export interface InspectionResult {
  totalCases: number;
  totalFiles: number;
  folderStructure: any;
  targetFolder: string;
  cases: CaseGroup[];
  overallAnalysis: string;
  unpackedAt: string;
}

