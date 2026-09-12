import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  convertInchesToTwip,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ImageRun
} from "docx";
import { saveAs } from "file-saver";
import { EnhancedTeachingPlan } from "../types";
import { generateBlackboardImageBytes } from "./blackboardRenderer";

/**
 * 导出字体风格方案
 */
export type DocxFontStyle = "modern" | "official" | "dengxian";

export interface FontTheme {
  id: DocxFontStyle;
  name: string;
  badge: string;
  description: string;
  titleFont: string;       // 封面大标题
  headingFont: string;     // 一二级板块标题
  bodyFont: string;        // 正文字体
  scaffoldFont: string;    // 学情支架与注释字体
  asciiFont: string;       // 西文数字字体
}

/**
 * 预设三种高质感专业字体风格（彻底杜绝字体混杂）
 */
export const FONT_THEMES: Record<DocxFontStyle, FontTheme> = {
  modern: {
    id: "modern",
    name: "现代教研体",
    badge: "推荐 · 清爽大方",
    description: "全篇统一采用【微软雅黑】搭配高雅墨玉绿，圆润开阔，高分辨率屏幕与打印观感极佳",
    titleFont: "Microsoft YaHei",
    headingFont: "Microsoft YaHei",
    bodyFont: "Microsoft YaHei",
    scaffoldFont: "Microsoft YaHei",
    asciiFont: "Calibri"
  },
  official: {
    id: "official",
    name: "标准公文体",
    badge: "国家标准 · 评优赛课",
    description: "遵循国家公文与教研案规程：标题【黑体】+ 正文【仿宋】+ 支架【楷体】，庄重大气",
    titleFont: "SimHei",
    headingFont: "SimHei",
    bodyFont: "FangSong",
    scaffoldFont: "KaiTi",
    asciiFont: "Times New Roman"
  },
  dengxian: {
    id: "dengxian",
    name: "新锐等线体",
    badge: "微软原味 · 紧凑秀丽",
    description: "采用微软 Office 官方原生【等线】搭配清雅藏蓝，排版呼吸感强，典雅整洁",
    titleFont: "DengXian",
    headingFont: "DengXian",
    bodyFont: "DengXian",
    scaffoldFont: "KaiTi",
    asciiFont: "Segoe UI"
  }
};

/**
 * 现代高水准学术与特级示范课配色规范（6位16进制Hex代码）
 */
const PALETTE = {
  primaryGreen: "065F46",  // 墨玉深绿（学术主标题）
  primaryNavy: "1E3A8A",   // 藏蓝（专业二级标题）
  accentAmber: "B45309",   // 琥珀金（学情卡壳与支架）
  dangerRed: "991B1B",     // 砖红（原案痛点靶向诊断）
  slateDark: "0F172A",     // 深石板黑（正文重点）
  slateBody: "334155",     // 炭灰（正文字体）
  slateMuted: "64748B",    // 浅铅灰（副标与注释）
  headerBg: "0F172A",      // 表头沉稳深底
  headerGreenBg: "064E3B", // 板书设计黑板表头
  zebraLight: "F8FAFC",    // 浅灰斑马纹
  greenLight: "F0FDF4",    // 浅绿背景
  amberLight: "FEF3C7",    // 浅琥珀背景
  borderGray: "CBD5E1",    // 细灰色边框
  borderSubtle: "E2E8F0",  // 单元格内部分隔细线
};

/**
 * 统一定义标准表格单元格细边框
 */
const TABLE_BORDER_STYLE = {
  top: { style: BorderStyle.SINGLE, size: 4, color: PALETTE.borderGray },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: PALETTE.borderGray },
  left: { style: BorderStyle.SINGLE, size: 4, color: PALETTE.borderGray },
  right: { style: BorderStyle.SINGLE, size: 4, color: PALETTE.borderGray },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: PALETTE.borderSubtle },
  insideVertical: { style: BorderStyle.SINGLE, size: 2, color: PALETTE.borderSubtle },
};

/**
 * 辅助函数：创建统一字体的 TextRun（彻底杜绝中文假斜体与非受控回退）
 */
function createRun(
  text: string,
  theme: FontTheme,
  options?: {
    bold?: boolean;
    size?: number; // 半点 (20 = 10pt, 21 = 10.5pt 五号, 24 = 12pt 小四)
    color?: string;
    fontRole?: "title" | "heading" | "body" | "scaffold";
  }
) {
  let selectedFont = theme.bodyFont;
  if (options?.fontRole === "title") selectedFont = theme.titleFont;
  else if (options?.fontRole === "heading") selectedFont = theme.headingFont;
  else if (options?.fontRole === "scaffold") selectedFont = theme.scaffoldFont;

  return new TextRun({
    text: text || "",
    bold: options?.bold || false,
    italics: false, // 严禁对中文字体使用假斜体，避免机械倾斜变形与字体回退
    size: options?.size || 21,
    color: options?.color || PALETTE.slateBody,
    font: selectedFont,
  });
}

/**
 * 辅助函数：创建正文段落
 */
function createBodyParagraph(
  text: string,
  theme: FontTheme,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingBefore?: number;
    spacingAfter?: number;
    fontRole?: "body" | "scaffold";
  }
) {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spacingBefore ?? 60,
      after: options?.spacingAfter ?? 60,
      line: 320, // 1.35倍行距
    },
    children: [
      createRun(text, theme, {
        bold: options?.bold,
        size: options?.size || 21,
        color: options?.color || PALETTE.slateBody,
        fontRole: options?.fontRole || "body",
      }),
    ],
  });
}

/**
 * 辅助函数：创建带前缀色条的一级板块标题
 */
function createSectionHeader(title: string, theme: FontTheme, colorHex = PALETTE.primaryGreen) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: "▍ ",
        color: colorHex,
        bold: true,
        size: 26,
        font: theme.headingFont,
      }),
      new TextRun({
        text: title,
        bold: true,
        size: 26, // 13pt
        color: colorHex,
        font: theme.headingFont,
      }),
    ],
  });
}

/**
 * 辅助函数：创建二级小标题
 */
function createSubHeader(title: string, theme: FontTheme, colorHex = PALETTE.primaryNavy) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22, // 11pt
        color: colorHex,
        font: theme.headingFont,
      }),
    ],
  });
}

/**
 * 辅助函数：创建带统一内边距与边框的 TableCell
 */
function createStyledCell(
  children: Paragraph[],
  options?: {
    widthPercent?: number;
    bgFill?: string;
  }
) {
  return new TableCell({
    shading: options?.bgFill
      ? { type: ShadingType.CLEAR, fill: options.bgFill }
      : undefined,
    width: options?.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    margins: {
      top: 130,    // 舒适的上下内边距
      bottom: 130,
      left: 160,   // 舒适的左右内边距
      right: 160,
    },
    borders: TABLE_BORDER_STYLE,
    children: children.length > 0 ? children : [new Paragraph({})],
  });
}

export interface DocxExportOptions {
  filename?: string;
  fontStyle?: DocxFontStyle;
}

/**
 * 将特级专家增强型教学解析、诊断与评价重构方案导出为专业的 Word (.docx) 文档
 */
export async function exportTeachingPlanToDocx(
  plan: EnhancedTeachingPlan,
  optionsOrFilename?: string | DocxExportOptions
): Promise<boolean> {
  let filename = "";
  let fontStyle: DocxFontStyle = "modern";

  if (typeof optionsOrFilename === "string") {
    filename = optionsOrFilename;
  } else if (optionsOrFilename) {
    filename = optionsOrFilename.filename || "";
    fontStyle = optionsOrFilename.fontStyle || "modern";
  }

  const theme: FontTheme = FONT_THEMES[fontStyle] || FONT_THEMES.modern;
  const safeTopic = plan?.topic || "教学设计";
  const exportFilename =
    filename || `${safeTopic}_特级教学设计深度解析诊断与40分钟施工图(${theme.name}).docx`;

  // 安全数据兜底
  const safeGradeSubject = plan?.gradeSubject || "通用学科";
  const safeVersionInfo = plan?.versionInfo || "《新课程标准（2022年版）》";
  const safeCoreConcept = plan?.coreConcept || "核心概念探究与思维进阶";
  const safeDiagnosis = plan?.diagnosis || {
    originalHighlights: "原案具有明确的知识主线与基本教学环节设定。",
    criticalGaps: ["缺少实操细分分钟标定", "缺乏易错点救急支架预设"],
    targetAudienceProfile: "具备前置知识经验，但在高阶综合建模阶段需要适切认知脚手架支撑。",
  };
  const safeCompetencyGoals = plan?.competencyGoals || [];
  const safeTimeline = plan?.timeline || [];
  const safeBoard = plan?.boardDesign || {
    layoutType: "结构化双翼对照型",
    leftWing: "【主干核心框架】\n• 概念聚焦\n• 驱动大问题",
    centerStage: "【核心推导图谱】\n师生协同推演建模",
    rightWing: "【总结与反馈】\n随堂达标评价",
    teacherNotes: "中台主图推导醒目展示因果与逻辑演进关系。",
  };
  const safeWorksheet = plan?.studentWorksheet || {
    sheetTitle: `${safeTopic} · 随堂深度探究任务单`,
    drivingQuestion: `如何通过探究解决《${safeTopic}》中的核心问题？`,
    tasks: [],
    rubrics: [],
  };
  const safeHomework = plan?.tieredHomework || {
    tier1Basic: "基础题：自主整理课堂思维图并完成教材基础习题（约10分钟）",
    tier2Exploratory: "进阶题：尝试用两种不同思路解释变式问题（约15分钟）",
    tier3Practical: "实践题：将本课核心思想与同伴或家人做一次口头阐述（拓展实践）",
  };
  const safeAudit = plan?.auditComparison || [];

  // 尝试渲染黑板物理板书仿真高清图片
  let blackboardImageBytes: Uint8Array | null = null;
  try {
    blackboardImageBytes = await generateBlackboardImageBytes(safeBoard, safeTopic);
  } catch (err) {
    console.warn("生成黑板板书图片未完成，优雅降级为文字版式:", err);
  }

  // ================= 1. 封面与标题信息区 =================
  const docTitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 80 },
    children: [
      createRun(`【特级重构】《${safeTopic}》教学设计`, theme, {
        bold: true,
        size: 38, // 19pt
        color: PALETTE.primaryGreen,
        fontRole: "title",
      }),
    ],
  });

  const docSubtitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 260 },
    children: [
      createRun(
        "深度学情诊断 · 2022课标素养表现 · 40分钟实操施工图 · 随堂探究单 · 评价量规 (Rubric)",
        theme,
        {
          size: 20,
          color: PALETTE.slateMuted,
          fontRole: "body",
        }
      ),
    ],
  });

  // 元数据信息卡表
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDER_STYLE,
    rows: [
      new TableRow({
        children: [
          createStyledCell(
            [createBodyParagraph("课题名称", theme, { bold: true, color: PALETTE.primaryGreen })],
            { widthPercent: 18, bgFill: PALETTE.zebraLight }
          ),
          createStyledCell(
            [createBodyParagraph(safeTopic, theme, { bold: true })],
            { widthPercent: 32 }
          ),
          createStyledCell(
            [createBodyParagraph("学段学科", theme, { bold: true, color: PALETTE.primaryGreen })],
            { widthPercent: 18, bgFill: PALETTE.zebraLight }
          ),
          createStyledCell(
            [createBodyParagraph(safeGradeSubject, theme)],
            { widthPercent: 32 }
          ),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(
            [createBodyParagraph("课标依据", theme, { bold: true, color: PALETTE.primaryGreen })],
            { widthPercent: 18, bgFill: PALETTE.zebraLight }
          ),
          createStyledCell(
            [createBodyParagraph(safeVersionInfo, theme)],
            { widthPercent: 32 }
          ),
          createStyledCell(
            [createBodyParagraph("学科大观念", theme, { bold: true, color: PALETTE.primaryGreen })],
            { widthPercent: 18, bgFill: PALETTE.zebraLight }
          ),
          createStyledCell(
            [createBodyParagraph(safeCoreConcept, theme, { color: PALETTE.primaryNavy })],
            { widthPercent: 32 }
          ),
        ],
      }),
    ],
  });

  // ================= 2. 诊断与学情逆向审计 =================
  const diagnosisSection: Paragraph[] = [
    createSectionHeader("一、 原教案深度诊断与学情逆向审计", theme),
    createSubHeader("1.1 原案闪光点与设计基底", theme),
    createBodyParagraph(`✓ ${safeDiagnosis.originalHighlights || "原案具备良好的情境导入与概念铺垫。"}`, theme),

    createSubHeader("1.2 核心痛点与实操缺陷诊断（精准靶向剖析）", theme),
    ...(safeDiagnosis.criticalGaps && safeDiagnosis.criticalGaps.length > 0
      ? safeDiagnosis.criticalGaps.map((gap, i) =>
          createBodyParagraph(`[痛点 ${i + 1}] ${gap}`, theme, {
            color: PALETTE.dangerRed,
            bold: true,
          })
        )
      : [createBodyParagraph("原教案结构较为完备，重点在于实操环节细节量化与支架补足。", theme)]),

    createSubHeader("1.3 目标学情立体画像（已知认知 vs 易错陷阱 vs 盲区突破）", theme),
    createBodyParagraph(
      safeDiagnosis.targetAudienceProfile || "具备基础知识储备，但在逻辑抽象环节易发生理解受阻。",
      theme,
      { fontRole: "scaffold" }
    ),
  ];

  // ================= 3. 核心素养与三维表现量表 =================
  const competencySection: (Paragraph | Table)[] = [
    createSectionHeader("二、 2022新课标核心素养与教学目标表现量表", theme),
    createBodyParagraph(
      "教学目标严格对接学科素养，细化为课堂中「可观察、可评估、可落地」的学生行为证据。",
      theme,
      { color: PALETTE.slateMuted }
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createStyledCell(
              [createBodyParagraph("核心素养分类", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 24, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("可达成表现性目标 (Performance Goal)", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 44, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("可观测学习证据 (Evidence of Learning)", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 32, bgFill: PALETTE.headerBg }
            ),
          ],
        }),
        ...safeCompetencyGoals.map((goal, idx) =>
          new TableRow({
            children: [
              createStyledCell(
                [createBodyParagraph(goal.category, theme, { bold: true, color: PALETTE.primaryNavy })],
                { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
              createStyledCell(
                [createBodyParagraph(goal.performanceGoal, theme)],
                { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
              createStyledCell(
                [createBodyParagraph(goal.evidenceOfLearning, theme, { color: PALETTE.primaryGreen })],
                { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
            ],
          })
        ),
      ],
    }),
  ];

  // ================= 4. 40分钟高精行课施工图 =================
  const timelineSection: (Paragraph | Table)[] = [
    createSectionHeader("三、 40分钟精准行课施工图（含真实学情卡壳与补救支架）", theme),
    createBodyParagraph(
      "【实操指引】各环节均严格标定常态课40分钟物理时钟分配，预留充分的动笔巡视与自主探究时间，彻底杜绝超时与虚高台词。",
      theme,
      { color: PALETTE.slateMuted, size: 20 }
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createStyledCell(
              [createBodyParagraph("时钟节点", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 14, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("环节名称与设计意图", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 26, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("学生活动与关键驱动提问", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 32, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("学情卡壳预警与补救支架", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 28, bgFill: PALETTE.headerBg }
            ),
          ],
        }),
        ...safeTimeline.map((step, index) =>
          new TableRow({
            children: [
              createStyledCell(
                [createBodyParagraph(step.timeRange, theme, { bold: true, color: PALETTE.primaryNavy })],
                { bgFill: index % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
              createStyledCell(
                [
                  createBodyParagraph(step.phaseTitle, theme, { bold: true }),
                  createBodyParagraph(`【设计意图】${step.designIntent}`, theme, {
                    size: 19,
                    color: PALETTE.slateMuted,
                  }),
                ],
                { bgFill: index % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
              createStyledCell(
                [
                  createBodyParagraph(step.studentActivity, theme),
                  createBodyParagraph(`【核心驱动设问】${step.teacherPrompt}`, theme, {
                    bold: true,
                    size: 19,
                    color: PALETTE.primaryGreen,
                  }),
                ],
                { bgFill: index % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
              ),
              createStyledCell(
                [
                  createBodyParagraph(`⚠️ ${step.scaffolding}`, theme, {
                    bold: true,
                    size: 19,
                    color: PALETTE.accentAmber,
                    fontRole: "scaffold",
                  }),
                ],
                { bgFill: index % 2 === 0 ? PALETTE.amberLight : "FFFBEB" }
              ),
            ],
          })
        ),
      ],
    }),
  ];

  // ================= 5. 黑板物理板书版式图 =================
  const formatBoardContent = (text: string, defaultTitle: string) => {
    const lines = (text || defaultTitle).split("\n").filter((l) => l.trim().length > 0);
    return lines.map((line) =>
      createBodyParagraph(line, theme, {
        size: 19,
        bold: line.startsWith("•") || line.startsWith("【") || line.includes("S ="),
      })
    );
  };

  const boardSection: (Paragraph | Table)[] = [
    createSectionHeader("四、 黑板物理板书空间版式图（拟真物理黑板空间规划挂图）", theme),
    createBodyParagraph(`• 版式结构类型：${safeBoard.layoutType || "结构化对照型"}`, theme),
    createBodyParagraph(
      `• 书写规范与彩粉笔提示：${safeBoard.teacherNotes || "中台重点推导逻辑用醒目彩色标注，注重师生动态生成。"}`,
      theme,
      { color: PALETTE.slateMuted, size: 20 }
    ),
    ...(blackboardImageBytes
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 80 },
            children: [
              new ImageRun({
                type: "png",
                data: blackboardImageBytes,
                transformation: {
                  width: 520, // 页面宽度完美适配 A4
                  height: 276, // 对应 1600x850 真实物理黑板宽幅比例
                },
                altText: {
                  title: "黑板物理板书空间规划挂图",
                  description: `《${safeTopic}》新课标特级示范课物理黑板空间板书规划方案`,
                  name: "blackboard_design.png",
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 180 },
            children: [
              createRun("▲ 图4-1：物理黑板空间分区与动态推演建模规划挂图（16:9 实景拟真视图）", theme, {
                size: 18,
                color: PALETTE.slateMuted,
              }),
            ],
          }),
        ]
      : []),
    createSubHeader("4.1 物理黑板三翼分区规划与板书文字要素细化表", theme),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          children: [
            createStyledCell(
              [createBodyParagraph("左翼：主干任务与概念聚焦", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 30, bgFill: PALETTE.headerGreenBg }
            ),
            createStyledCell(
              [createBodyParagraph("中台：动态推导演进图谱（核心区）", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 44, bgFill: PALETTE.headerGreenBg }
            ),
            createStyledCell(
              [createBodyParagraph("右翼：反思总结与星级达标", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 26, bgFill: PALETTE.headerGreenBg }
            ),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(formatBoardContent(safeBoard.leftWing, "概念框架梳理"), {
              bgFill: PALETTE.greenLight,
            }),
            createStyledCell(formatBoardContent(safeBoard.centerStage, "核心推导展示"), {
              bgFill: "FFFFFF",
            }),
            createStyledCell(formatBoardContent(safeBoard.rightWing, "随堂表现性评价"), {
              bgFill: PALETTE.greenLight,
            }),
          ],
        }),
      ],
    }),
  ];

  // ================= 6. 随堂学生探究单与表现性量规 =================
  const worksheetSection: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new PageBreak()],
    }),

    createSectionHeader("五、 随堂学生自主探究单（可直接 A4 单面/双面打印印发）", theme),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [
        createRun(safeWorksheet.sheetTitle || `《${safeTopic}》随堂深度探究任务单`, theme, {
          bold: true,
          size: 30, // 15pt
          color: PALETTE.primaryGreen,
          fontRole: "heading",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 180 },
      children: [
        createRun(
          "班级：____________    姓名：____________    学号：____________    自评：[ ★★★  ★★  ★ ]",
          theme,
          {
            size: 20,
            color: PALETTE.slateMuted,
          }
        ),
      ],
    }),
    createBodyParagraph(`【驱动性核心大问题】：${safeWorksheet.drivingQuestion || "本节课的驱动问题"}`, theme, {
      bold: true,
      color: PALETTE.primaryNavy,
      size: 21,
    }),

    // 探究任务列表
    ...(safeWorksheet.tasks && safeWorksheet.tasks.length > 0
      ? safeWorksheet.tasks
          .map((task) => [
            createSubHeader(`【${task.taskNumber}】`, theme),
            createBodyParagraph(`任务要求：${task.taskPrompt}`, theme, { bold: true }),
            createBodyParagraph(`💡 探究脚手架：${task.scaffoldTip}`, theme, {
              color: PALETTE.primaryGreen,
              size: 19,
              fontRole: "scaffold",
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER_STYLE,
              rows: [
                new TableRow({
                  children: [
                    createStyledCell(
                      [
                        createBodyParagraph(
                          `✍️ [学生自主探究推演留白区域]\n${task.responseAreaPlaceholder || "在此写出公式推导、画出转化示意图或记录结论与思考..."}\n\n\n`,
                          theme,
                          { color: "94A3B8", size: 19 }
                        ),
                      ],
                      { bgFill: PALETTE.zebraLight }
                    ),
                  ],
                }),
              ],
            }),
            new Paragraph({ spacing: { before: 100 } }),
          ])
          .flat()
      : [
          createSubHeader("【探究任务一】", theme),
          createBodyParagraph("请结合教材或素材进行自主探究并记录推导过程。", theme),
        ]),

    createSubHeader("课堂表现性评价量规表（Rubrics）", theme),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createStyledCell(
              [createBodyParagraph("评价维度", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 22, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("★★★ 卓越表现 (Level 3)", theme, { bold: true, color: "166534" })],
              { widthPercent: 26, bgFill: "DCFCE7" }
            ),
            createStyledCell(
              [createBodyParagraph("★★ 良好达标 (Level 2)", theme, { bold: true, color: "075985" })],
              { widthPercent: 26, bgFill: "E0F2FE" }
            ),
            createStyledCell(
              [createBodyParagraph("★ 需辅导发展 (Level 1)", theme, { bold: true, color: "92400E" })],
              { widthPercent: 26, bgFill: "FEF3C7" }
            ),
          ],
        }),
        ...(safeWorksheet.rubrics && safeWorksheet.rubrics.length > 0
          ? safeWorksheet.rubrics.map((rub, idx) =>
              new TableRow({
                children: [
                  createStyledCell(
                    [createBodyParagraph(rub.dimension, theme, { bold: true, color: PALETTE.primaryNavy })],
                    { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
                  ),
                  createStyledCell([createBodyParagraph(rub.levels.level3, theme)], {
                    bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF",
                  }),
                  createStyledCell([createBodyParagraph(rub.levels.level2, theme)], {
                    bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF",
                  }),
                  createStyledCell([createBodyParagraph(rub.levels.level1, theme)], {
                    bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF",
                  }),
                ],
              })
            )
          : [
              new TableRow({
                children: [
                  createStyledCell([createBodyParagraph("核心思维", theme)], {}),
                  createStyledCell([createBodyParagraph("能举一反三并自主构建模型", theme)], {}),
                  createStyledCell([createBodyParagraph("在支架提示下能正确理解", theme)], {}),
                  createStyledCell([createBodyParagraph("需教师个别启发解答", theme)], {}),
                ],
              }),
            ]),
      ],
    }),
  ];

  // ================= 7. 三级阶梯弹性作业设计 =================
  const homeworkSection: (Paragraph | Table)[] = [
    createSectionHeader("六、 三级阶梯弹性作业设计（双减与分层精准落地）", theme),
    createBodyParagraph("作业设计兼顾巩固、探究与生活应用，严格控制时长，拒绝低效机械重复：", theme, {
      color: PALETTE.slateMuted,
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          children: [
            createStyledCell(
              [createBodyParagraph("第一阶：基础过关（必做）\n约 10 分钟", theme, { bold: true, color: PALETTE.primaryGreen })],
              { widthPercent: 25, bgFill: PALETTE.greenLight }
            ),
            createStyledCell(
              [createBodyParagraph(safeHomework.tier1Basic || "完成基础概念巩固与变式练习。", theme)],
              { widthPercent: 75 }
            ),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(
              [createBodyParagraph("第二阶：思维攀登（选做）\n约 15 分钟", theme, { bold: true, color: PALETTE.primaryNavy })],
              { widthPercent: 25, bgFill: PALETTE.zebraLight }
            ),
            createStyledCell(
              [createBodyParagraph(safeHomework.tier2Exploratory || "探究图形变式或实际生活情境问题。", theme)],
              { widthPercent: 75 }
            ),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(
              [createBodyParagraph("第三阶：综合实践（跨界）\n探究实践", theme, { bold: true, color: PALETTE.accentAmber })],
              { widthPercent: 25, bgFill: PALETTE.amberLight }
            ),
            createStyledCell(
              [createBodyParagraph(safeHomework.tier3Practical || "将所学知识向他人进行一次思维解说或撰写微报告。", theme)],
              { widthPercent: 75 }
            ),
          ],
        }),
      ],
    }),
  ];

  // ================= 8. 三方横向客观审计对照表 =================
  const auditSection: (Paragraph | Table)[] = [
    createSectionHeader("七、 教学设计三方横向客观审计对照表", theme),
    createBodyParagraph(
      "本部分对照教师原始初稿、传统通用AI生成与新特级专家重构版，展现专业重构维度与实效：",
      theme,
      { color: PALETTE.slateMuted }
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDER_STYLE,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createStyledCell(
              [createBodyParagraph("对比审视维度", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 18, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("教师原始初稿状态", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 26, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("传统通用AI扩充输出", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 26, bgFill: PALETTE.headerBg }
            ),
            createStyledCell(
              [createBodyParagraph("新特级专家重构版（本案）", theme, { bold: true, color: "FFFFFF" })],
              { widthPercent: 30, bgFill: PALETTE.primaryGreen }
            ),
          ],
        }),
        ...(safeAudit && safeAudit.length > 0
          ? safeAudit.map((item, idx) =>
              new TableRow({
                children: [
                  createStyledCell(
                    [createBodyParagraph(item.dimension, theme, { bold: true, color: PALETTE.primaryNavy })],
                    { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
                  ),
                  createStyledCell(
                    [createBodyParagraph(item.teacherInputState, theme, { color: PALETTE.slateMuted })],
                    { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
                  ),
                  createStyledCell(
                    [createBodyParagraph(item.legacyAiOutputState, theme, { color: PALETTE.accentAmber })],
                    { bgFill: idx % 2 === 0 ? PALETTE.zebraLight : "FFFFFF" }
                  ),
                  createStyledCell(
                    [
                      createBodyParagraph(item.enhancedPlanState, theme, { bold: true, color: PALETTE.primaryGreen }),
                      createBodyParagraph(`★ 实操结论：${item.practicalVerdict}`, theme, {
                        size: 19,
                        color: PALETTE.primaryGreen,
                        fontRole: "scaffold",
                      }),
                    ],
                    { bgFill: idx % 2 === 0 ? PALETTE.greenLight : "FFFFFF" }
                  ),
                ],
              })
            )
          : [
              new TableRow({
                children: [
                  createStyledCell([createBodyParagraph("行课时间切片", theme, { bold: true })], {}),
                  createStyledCell([createBodyParagraph("环节无分钟标定", theme)], {}),
                  createStyledCell([createBodyParagraph("台词虚高几千字", theme)], {}),
                  createStyledCell([createBodyParagraph("40分钟精准切片落地，可对表执行", theme, { bold: true })], {
                    bgFill: PALETTE.greenLight,
                  }),
                ],
              }),
            ]),
      ],
    }),
  ];

  // ================= 8. 官方课程标准与专业教研知识库权威依据 =================
  const citationsSection: Paragraph[] = [];
  if (plan.authoritativeCitations && plan.authoritativeCitations.length > 0) {
    citationsSection.push(
      createSectionHeader("八、官方课程标准与专业教研知识库权威依据", theme, PALETTE.primaryGreen),
      createBodyParagraph(
        "本教学设计方案与实操施工图严格锚定国家教育权威标准，融合教育部精品课例及省市教研质量分析实测数据：",
        theme,
        { color: PALETTE.slateMuted, spacingAfter: 120 }
      )
    );
    plan.authoritativeCitations.forEach((cite, idx) => {
      citationsSection.push(
        createBodyParagraph(`[依据${idx + 1}] ${cite}`, theme, {
          bold: true,
          color: PALETTE.primaryGreen,
          spacingBefore: 40,
          spacingAfter: 40,
        })
      );
    });
  }

  // ================= 9. 组装整篇专业 Word 文档，注入系统级默认字体锁定 =================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: theme.bodyFont,
            size: 21,
            color: PALETTE.slateBody,
          },
          paragraph: {
            spacing: { line: 320, before: 60, after: 60 },
          },
        },
        heading1: {
          run: {
            font: theme.headingFont,
            size: 26,
            bold: true,
            color: PALETTE.primaryGreen,
          },
          paragraph: {
            spacing: { before: 360, after: 140 },
          },
        },
        heading2: {
          run: {
            font: theme.headingFont,
            size: 22,
            bold: true,
            color: PALETTE.primaryNavy,
          },
          paragraph: {
            spacing: { before: 200, after: 80 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  createRun(`《${safeTopic}》· 新课标特级教学设计解析与40分钟施工图`, theme, {
                    size: 18,
                    color: PALETTE.slateMuted,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  createRun("第 ", theme, {
                    size: 18,
                    color: PALETTE.slateMuted,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    bold: true,
                    color: PALETTE.slateDark,
                    font: theme.bodyFont, // 强行绑定统一字体，解决页码数字与中文字体割裂
                  }),
                  createRun(" 页  |  特级教研专家深度诊断与评价重构手册", theme, {
                    size: 18,
                    color: PALETTE.slateMuted,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          docTitleParagraph,
          docSubtitleParagraph,
          metaTable,
          new Paragraph({ spacing: { before: 200 } }),
          ...diagnosisSection,
          new Paragraph({ spacing: { before: 200 } }),
          ...competencySection,
          new Paragraph({ spacing: { before: 200 } }),
          ...timelineSection,
          new Paragraph({ spacing: { before: 200 } }),
          ...boardSection,
          new Paragraph({ spacing: { before: 200 } }),
          ...worksheetSection,
          new Paragraph({ spacing: { before: 200 } }),
          ...homeworkSection,
          new Paragraph({ spacing: { before: 200 } }),
          ...auditSection,
          ...(citationsSection.length > 0
            ? [new Paragraph({ spacing: { before: 200 } }), ...citationsSection]
            : []),
        ],
      },
    ],
  });

  // 打包并由浏览器触发另存为
  const blob = await Packer.toBlob(doc);
  saveAs(blob, exportFilename);
  return true;
}
