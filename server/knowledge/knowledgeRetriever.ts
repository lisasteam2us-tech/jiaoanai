/**
 * 中小学教研专业知识库智能检索增强引擎 (RAG Retriever)
 * 结合精准标签过滤、语义特征匹配与多层级教研切片召回
 */
import {
  SubjectCode,
  GradeBand,
  KnowledgeRetrievalResult,
  CurriculumStandardEntry,
  StudentMisconceptionEntry,
  MasterLessonExemplar,
  PerformanceRubricTemplate
} from "./types.js";
import { CURRICULUM_STANDARDS_2022 } from "./curriculum2022.js";
import { STUDENT_MISCONCEPTIONS, MASTER_LESSON_EXEMPLARS } from "./exemplarDatabase.js";
import { PERFORMANCE_RUBRIC_TEMPLATES } from "./scaffoldingRubrics.js";

export class ProfessionalKnowledgeRetriever {
  /**
   * 智能识别学科与学段
   */
  public detectSubjectAndGrade(text: string): { subject: SubjectCode; gradeBand: GradeBand; topicName: string } {
    const lower = text.toLowerCase();
    
    // 1. 全学科智能探测 (覆盖义务教育全学科)
    let subject: SubjectCode = "chinese";
    if (/数学|代数|几何|勾股|函数|方程|定理|三角形|算式|面积|周长|加法|减法|乘法|除法|分数列式/.test(text)) {
      subject = "math";
    } else if (/\benglish\b|英语|听力|单词|语法|句型|dialogue|reading|vocabulary|tense/i.test(text)) {
      subject = "english";
    } else if (/物理|牛顿|欧姆|压强|透镜|凸透镜|功|机械能|浮力|电路|滑动变阻器|反射|折射/.test(text)) {
      subject = "physics";
    } else if (/化学|元素|分子|原子|酸碱|氧化|还原|质量守恒|化学式|沉淀|金属活动性/.test(text)) {
      subject = "chemistry";
    } else if (/生物|细胞|显微镜|光合作用|呼吸作用|动植物|遗传|生态系统|DNA|染色体/.test(text)) {
      subject = "biology";
    } else if (/道德与法治|思政|思想品德|法治|宪法|权利与义务|公民|守则|核心价值观/.test(text)) {
      subject = "morality_law";
    } else if (/历史|朝代|史料|春秋战国|汉唐|宋元|明清|辛亥革命|抗日战争|新中国|鸦片战争/.test(text)) {
      subject = "history";
    } else if (/地理|经纬|地图|气候|等高线|地形|板块|降水|长江|黄河|人地协调/.test(text)) {
      subject = "geography";
    } else if (/科学|蒸发|水蒸气|溶解|磁铁|植物|萌发|重力|传热|岩石|土壤/.test(text)) {
      subject = "science";
    } else if (/信息科技|信息技术|编程|算法|流程图|python|scratch|计算机|数据结构|人工智能/.test(text)) {
      subject = "information_tech";
    } else if (/劳动|烹饪|打扫|种植|手工|木工|保洁|自理|家务|农作/.test(text)) {
      subject = "labor";
    } else if (/音乐|合唱|独唱|简谱|五线谱|乐理|节拍|音色|器乐|二胡|钢琴/.test(text)) {
      subject = "art_music";
    } else if (/美术|绘画|水彩|中国画|素描|色彩|透视|雕塑|剪纸|书法|设计/.test(text)) {
      subject = "art_fine";
    } else if (/体育|健康|跑|跳|投|篮球|足球|排球|羽毛球|乒乓球|体能|心肺复苏/.test(text)) {
      subject = "physical_health";
    } else if (/语文|散文|文言文|修辞|段落|阅读|背影|朱自清|石拱桥|诗歌|词语|生字|拼音/.test(text)) {
      subject = "chinese";
    }

    // 2. 学段精准探测
    let gradeBand: GradeBand = "junior";
    if (/一年级|二年级|小一|小二/.test(text)) {
      gradeBand = "primary_low";
    } else if (/三年级|四年级|小三|小四/.test(text)) {
      gradeBand = "primary_mid";
    } else if (/五年级|六年级|小五|小六/.test(text)) {
      gradeBand = "primary_high";
    } else if (/小学/.test(text)) {
      gradeBand = "primary_mid";
    } else if (/七年级|八年级|九年级|初一|初二|初三|初中|中考/.test(text)) {
      gradeBand = "junior";
    } else if (/高一|高二|高三|高中|高考/.test(text)) {
      gradeBand = "senior";
    }

    // 3. 课题名称抽取
    let topicName = "未命名课题";
    const titleMatch = text.match(/(?:课题|课名|课题名|教学内容|篇目)[：:\s]*([《“]?[^\r\n，。]{2,20}[》”]?)|\b(背影|勾股定理|水到哪里去了|中国石拱桥|一次函数)\b/);
    if (titleMatch) {
      topicName = (titleMatch[1] || titleMatch[2]).replace(/[《》“”]/g, "").trim();
    } else {
      const firstLine = text.trim().split("\n")[0].slice(0, 20).replace(/[#*《》]/g, "").trim();
      if (firstLine.length >= 2) topicName = firstLine;
    }

    return { subject, gradeBand, topicName };
  }

  /**
   * 核心 RAG 检索方法：按输入教案上下文检索多层知识
   */
  public retrieveKnowledge(inputText: string): KnowledgeRetrievalResult {
    const { subject, gradeBand, topicName } = this.detectSubjectAndGrade(inputText);
    const citations: string[] = [];

    // 1. 检索课标图谱 (第1层 - 优先精准学段匹配)
    let matchedCurriculum: CurriculumStandardEntry | undefined = CURRICULUM_STANDARDS_2022.find(
      (c) => c.subject === subject && c.gradeBand === gradeBand
    );
    if (!matchedCurriculum) {
      // 若无完全匹配学段，在同大学段内查找 (如 primary 系列或 junior)
      if (gradeBand.startsWith("primary")) {
        matchedCurriculum = CURRICULUM_STANDARDS_2022.find(
          (c) => c.subject === subject && c.gradeBand.startsWith("primary")
        );
      } else {
        matchedCurriculum = CURRICULUM_STANDARDS_2022.find(
          (c) => c.subject === subject && c.gradeBand === "junior"
        );
      }
    }
    // 降级兜底：该学科任意条目
    if (!matchedCurriculum) {
      matchedCurriculum = CURRICULUM_STANDARDS_2022.find((c) => c.subject === subject);
    }
    if (matchedCurriculum) {
      citations.push(matchedCurriculum.sourceDocument);
    }

    // 2. 检索学情卡点与考评错解 (第2层)
    const matchedMisconceptions: StudentMisconceptionEntry[] = STUDENT_MISCONCEPTIONS.filter(
      (m) =>
        m.subject === subject &&
        (inputText.includes(m.topic) || topicName.includes(m.topic) || m.topic.includes(topicName))
    );
    if (matchedMisconceptions.length > 0) {
      citations.push(`省市教研室中考与期末质量分析数据库：【${matchedMisconceptions[0].topic}】典型学情易错归因报告`);
    }

    // 3. 检索名师精品课例切片 (第3层)
    const matchedExemplar: MasterLessonExemplar | undefined = MASTER_LESSON_EXEMPLARS.find(
      (e) =>
        e.subject === subject &&
        (inputText.includes(e.topic) || topicName.includes(e.topic) || e.topic.includes(topicName))
    );
    if (matchedExemplar) {
      citations.push(`国家智慧教育平台部级精品课 / ${matchedExemplar.masterTeacher}：【${matchedExemplar.topic}】教学切片与板书实录`);
    }

    // 4. 检索表现性评价量规 (第5层)
    let matchedRubric: PerformanceRubricTemplate | undefined = PERFORMANCE_RUBRIC_TEMPLATES.find((r) => {
      if (subject === "chinese" && r.pedagogyMethod === "reading_expression_group") return true;
      if (subject === "math" && r.pedagogyMethod === "UbD_backward") return true;
      if (subject === "science" && r.pedagogyMethod === "POE_inquiry") return true;
      if (subject === "english" && r.pedagogyMethod === "task_based_language") return true;
      if (
        (subject === "physics" || subject === "chemistry" || subject === "biology" || subject === "information_tech") &&
        r.pedagogyMethod === "inquiry_experimental"
      )
        return true;
      return false;
    });
    if (!matchedRubric) {
      matchedRubric = PERFORMANCE_RUBRIC_TEMPLATES[0];
    }
    citations.push(`华东师大崔允漷《学历案与逆向教学设计标准》及课标表现性评价量规库：【${matchedRubric.rubricName}】`);

    return {
      matchedCurriculum,
      misconceptions: matchedMisconceptions,
      lessonExemplar: matchedExemplar,
      rubricTemplate: matchedRubric,
      authoritativeCitations: citations
    };
  }

  /**
   * 将检索到的知识包结构化格式化为大模型的注入 Prompt
   */
  public formatKnowledgeToPrompt(result: KnowledgeRetrievalResult): string {
    const sections: string[] = [];

    sections.push("【教研专业知识库深度检索增强（权威依据与真实学情背书）】");

    if (result.matchedCurriculum) {
      sections.push(
        `📌 [依据一：教育部《2022新课程标准》权威锚定]
- 官方来源：${result.matchedCurriculum.sourceDocument}
- 课标学科大观念：${result.matchedCurriculum.coreDisciplineConcept}
- 核心素养表现维度：${result.matchedCurriculum.competencyDomains.join("、")}
- 课标学业质量标准底线：\n  * ${result.matchedCurriculum.qualityBenchmarks.join("\n  * ")}`
      );
    }

    if (result.misconceptions && result.misconceptions.length > 0) {
      const m = result.misconceptions[0];
      sections.push(
        `🚨 [依据二：一线真实学情易错盲区与考评数据]
- 考点卡壳与易错表象：${m.stumblingPointName}
- 课堂表面"伪懂"假象：${m.pseudoUnderstandingSign}
- 真实思维断层根因：${m.cognitiveObstacleReason}
- 考评实测数据警示：${m.examFailureEvidence}
- 名师推荐破局支架：${m.recommendedRescueScaffold.actionDescription}
- 名师递进追问链必选：\n  * ${m.recommendedRescueScaffold.rescuePromptingChain.join("\n  * ")}`
      );
    }

    if (result.lessonExemplar) {
      const ex = result.lessonExemplar;
      sections.push(
        `⭐ [依据三：国家智慧教育平台部级精品课示范切片]
- 课例课题：${ex.topic} (${ex.textbookVersion} ${ex.chapterContext})
- 执教课例认证：${ex.masterTeacher}
- 核心驱动大问题：${ex.bigQuestion}
- 精品课实录关键问题链切片：
${ex.timelineSlices.map((s) => `  * [${s.timeSlot}] ${s.coreActivity} -> 关键提问: ${s.masterQuestionChain.join(" | ")}`).join("\n")}
- 规范板书拓扑：
  左翼：${ex.blackboardDesign.leftWing.join(" / ")}
  中台：${ex.blackboardDesign.centerStage.join(" / ")}
  右翼：${ex.blackboardDesign.rightWing.join(" / ")}
  板书彩笔规范：${ex.blackboardDesign.chalkColorGuide}`
      );
    }

    if (result.rubricTemplate) {
      const rub = result.rubricTemplate;
      sections.push(
        `📊 [依据四：国家级表现性评价量规与微支架规范]
- 量规名称：${rub.rubricName}
- 核心评价维度：
${rub.dimensions.map((d) => `  * 【${d.dimensionName}】\n    ${d.levelThreeEvidence}\n    ${d.levelTwoEvidence}`).join("\n")}
- 推荐实操微支架：
${rub.scaffoldingToolkit.map((t) => `  * ${t.toolName}：${t.description} (使用指导：${t.usageGuide})`).join("\n")}`
      );
    }

    sections.push(
      "【强制生成指令】：\n你必须在重构的【40分钟施工图】、【学情卡壳预警与补救支架】、【物理板书】与【学生探究单】中深度融入上述检索到的课标大观念、真实中考易错分析、名师关键追问链与表现性量规。在输出的教学方案中明确体现这些权威出处。"
    );

    return sections.join("\n\n");
  }
}

export const knowledgeRetriever = new ProfessionalKnowledgeRetriever();
