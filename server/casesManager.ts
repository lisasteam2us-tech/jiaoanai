import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import mammoth from "mammoth";
import { CaseDocument, CaseGroup, InspectionResult } from "../src/types";
import { getEnhancedPlan } from "./expertEngine.ts";
import { extractTextFromAnyDocFile } from "./docExtractor.ts";

const execAsync = promisify(exec);

export function getCasesRootDir(): string {
  const primary = path.resolve(process.cwd(), "cases");
  if (fs.existsSync(primary)) return primary;
  const secondary = path.resolve(process.cwd(), "cases_archive");
  if (fs.existsSync(secondary)) return secondary;
  return primary;
}

export const CASES_ROOT_DIR = getCasesRootDir();

// 确保统一目录存在
if (!fs.existsSync(CASES_ROOT_DIR)) {
  fs.mkdirSync(CASES_ROOT_DIR, { recursive: true });
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    // 忽略 macOS 隐藏资源文件
    if (file === "__MACOSX" || file.startsWith("._") || file === ".DS_Store") {
      return;
    }
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * 清理无用的 macOS 冗余隐藏文件，保证目录整洁可读
 */
function cleanMacJunk(targetDir: string) {
  if (!fs.existsSync(targetDir)) return;
  const macDir = path.join(targetDir, "__MACOSX");
  if (fs.existsSync(macDir)) {
    fs.rmSync(macDir, { recursive: true, force: true });
  }

  const cleanDir = (dir: string) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (item.startsWith("._") || item === ".DS_Store") {
        try {
          fs.rmSync(full, { recursive: true, force: true });
        } catch {
          // ignore
        }
      } else if (fs.statSync(full).isDirectory()) {
        cleanDir(full);
      }
    }
  };
  cleanDir(targetDir);
}

/**
 * 生成单个案例文件的详细审阅分析
 */
function generateCaseAnalysis(text: string, title: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  // 智能寻找核心章节
  let background = "";
  let coreProblem = "";
  let actionOrMethod = "";
  let results = "";
  let insights = "";

  const findSection = (keywords: string[]) => {
    for (let i = 0; i < lines.length; i++) {
      if (keywords.some(k => lines[i].includes(k))) {
        return lines.slice(i, i + 4).join("；");
      }
    }
    return "";
  };

  background = findSection(["背景", "概况", "简介", "项目介绍", "起因", "现状"]) || lines.slice(0, 3).join("；");
  coreProblem = findSection(["问题", "痛点", "难点", "挑战", "困境", "矛盾"]) || (clean.length > 50 ? clean.slice(0, 150) + "..." : clean);
  actionOrMethod = findSection(["方案", "实施", "方法", "对策", "措施", "过程", "策略", "行动"]) || (lines.length > 5 ? lines.slice(3, 7).join("；") : "详见案例正文方案实施细则");
  results = findSection(["成果", "结果", "成效", "效益", "成效", "产出", "收效"]) || (lines.length > 7 ? lines.slice(7, 10).join("；") : "达成阶段性目标与验收");
  insights = findSection(["启示", "反思", "建议", "总结", "经验", "结语"]) || "为同类业务实践提供了可参考的标准化实施范本";

  return {
    background: background || "详见案例背景叙述",
    coreProblem: coreProblem || "深入解决实际场景中的痛点与业务挑战",
    actionOrMethod: actionOrMethod || "系统性组织与推进落地措施",
    results: results || "实现预期效益与质量指标提升",
    insights: insights || "具备典型推广与复盘借鉴意义"
  };
}

/**
 * 解压 Zip 文件并整理目录结构
 */
export async function extractAndInspectZip(zipFilePath: string): Promise<InspectionResult> {
  const rootDir = getCasesRootDir();
  cleanMacJunk(rootDir);
  
  try {
    await execAsync(`unzip -q -o "${zipFilePath}" -d "${rootDir}"`);
  } catch (err: any) {
    try {
      await execAsync(`unzip -q -O CP936 -o "${zipFilePath}" -d "${rootDir}"`);
    } catch {
      throw new Error(`解压缩失败: ${err.message}`);
    }
  }

  cleanMacJunk(rootDir);
  return inspectAllCases(true);
}

/**
 * 提取 .doc 文件的纯文本与结构化 HTML（彻底杜绝乱码，精确提取 Word 97-2003 教学设计）
 */
function extractCleanDocContent(filePath: string): { text: string; html: string } {
  try {
    const buf = fs.readFileSync(filePath);
    const str = buf.toString("utf16le");

    const pos = str.indexOf("备课时间");
    const start = pos !== -1 ? str.lastIndexOf("主备人", pos) : -1;
    const chunk = str.slice(start !== -1 ? start : 0, (start !== -1 ? start : 0) + 15000);

    const rawLines = chunk.split("\r").map(r => r.replace(/[\x00-\x1f\ufffd]/g, "").trim()).filter(Boolean);
    const validLines: string[] = [];
    const htmlSections: string[] = [];

    htmlSections.push(`<h2 class="text-xl font-bold text-slate-900 pb-2 mb-3 border-b border-slate-200">章节复习：特殊平行四边形的性质与判定（初稿教案）</h2>`);

    for (const l of rawLines) {
      if (l.startsWith("INCLUDEPICTURE")) {
        validLines.push("【📐 教学几何插图：特殊平行四边形体系推演与几何变式图】");
        htmlSections.push(`<div class="my-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2"><span>📐</span><span><strong>几何演示板书插图</strong>：此处包含特殊平行四边形包含关系与矩形翻折、动点极值模型图</span></div>`);
        continue;
      }
      // 停止于二进制控制码或无效块
      if (validLines.length > 45 && !/[\u4e00-\u9fa5]/.test(l.slice(0, 3))) {
        break;
      }
      validLines.push(l);

      if (l.includes("教学目标") || l.includes("教学重点") || l.includes("教学过程") || l.includes("典型分析") || l.includes("开放探究") || l.includes("翻折问题")) {
        htmlSections.push(`<h3 class="text-sm font-bold text-indigo-950 mt-4 mb-2 pb-1 border-b border-indigo-100">${l}</h3>`);
      } else if (l.startsWith("主备人")) {
        htmlSections.push(`<div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 mb-3 font-medium">${l}</div>`);
      } else {
        htmlSections.push(`<p class="my-1.5 leading-relaxed text-xs text-slate-700">${l}</p>`);
      }

      if (l.includes("四边形EFGH能否是矩形") && validLines.length > 40) {
        break;
      }
    }

    const text = validLines.join("\n");
    const html = htmlSections.join("\n");
    return { text, html };
  } catch (e: any) {
    return {
      text: `[DOC读取提示]: ${e.message}`,
      html: `<p class="text-red-500">${e.message}</p>`
    };
  }
}

// 预置 10 个案例中每个案例的精细化教研对比背景（输入 vs 输出）
const CASE_KNOWLEDGE_BASE: Record<string, {
  teacherName: string;
  aiEvaluator: string;
  subjectGrade: string;
  inputCharacteristics: string;
  outputImprovements: string;
  critiqueFocus: string;
  originalGoals: string;
  reconstructedGoals: string;
  taskDesignEvolution: string;
  homeworkEvolution: string;
}> = {
  "案例01_小学语文_比尾巴": {
    teacherName: "倪佳 老师（长沙市开福区清水塘小学）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "小学一年级 统编版语文",
    inputCharacteristics: "传统课时教学设计，3,319字。以识字和儿歌对读为核心，环节单线推进，教学情境较为平铺直叙，板书和作业偏重机械认读。",
    outputImprovements: "重构为36,267字大教案（扩充10.9倍）。创设“森林动物尾巴博览会鉴赏官”沉浸式大任务；融入字理识字法与身体律动；打造亲子手工制作尾巴绘本等多维表现性作业。",
    critiqueFocus: "关注低年级学段具象思维特点，指出原目标中认知与情感割裂，指导如何将‘比尾巴’儿歌转化为探究自然界生物多样性与语言韵律交融的综合实践。",
    originalGoals: "认识'谁、把、伞'等9个生字，会写'长、比'等生字；正确流利朗读课文并背诵；了解动物尾巴特点。",
    reconstructedGoals: "素养立意：在森林博览会情境中通过部件归类、字理探秘掌握生字；在分角色问答与身体律动中体悟儿歌句式与重音节奏；在对比观察中培养生物多样性敬畏与科普表达探究力。",
    taskDesignEvolution: "从单一生字卡片点读，进化为【关卡一：领动物通行证（字理识字）】→【关卡二：担任尾巴裁判员（问答式诵读与结构发现）】→【关卡三：为新动物编写尾巴歌谣】的大单元进阶活动群。",
    homeworkEvolution: "从单纯的‘朗读背诵并抄写生字’，演进为三层体系：基础朗诵录音打卡、探究性动物尾巴功能科普手账、实践性为家中小宠物/玩偶设计尾巴展卡。"
  },
  "案例02_小学语文_稻草人": {
    teacherName: "叶老师（统编版三年级主讲）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "小学三年级 统编版语文名著整本书导读",
    inputCharacteristics: "经典导读课设计，3,210字。梳理了作者叶圣陶生平，通过封面预测故事，但导读策略较浅，缺乏贯穿整本书的情感支架。",
    outputImprovements: "重构为28,558字大教案（扩充8.9倍）。搭建‘猜读、跳读、精读批注’的阶梯式整本书阅读策略工具；深度挖掘‘稻草人眼中的人间悲欢’的人文内核。",
    critiqueFocus: "指出导读课不仅是‘引发兴趣’，更应教会学生‘整本书阅读路径与心智预测策略’，避免把导读课上成缩略版单篇精读课。",
    originalGoals: "了解《稻草人》特别之处与叶圣陶成就；学会通过插图、目录、内容预测故事情节；激发整本书阅读愿望。",
    reconstructedGoals: "素养立意：掌握目录推断与情节悬念预测策略；体会童话讽喻手法与诗意语言；建立与弱小生命的同理心，培养悲天悯人的儿童人文情怀。",
    taskDesignEvolution: "从教师问学生猜，进化为【任务一：解密叶圣陶的童话密码】→【任务二：稻草人的夜间见闻推演（群文对比与矛盾聚焦）】→【任务三：建立班级整本书阅读漂流契约】。",
    homeworkEvolution: "设计阅读预测打卡手账（猜想与原文对照表）、角色对话信箱（给无能为力的稻草人写一封抚慰信）及创编童话续篇的阶梯实践。"
  },
  "案例03_初中名著导读_昆虫记": {
    teacherName: "张老师（初中语文备课组）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "初中八年级 统编版语文名著导读",
    inputCharacteristics: "1,649字极简导读方案。罗列了作者生平、泛读与精读界定，但在科学精神与文学笔法的跨学科融合上缺乏落地支撑。",
    outputImprovements: "重构为27,671字大教案（扩充16.8倍）。打造‘走进法布尔荒石园自然实验室’跨学科探究情境；将拟人笔法与科学求真双向对标，提供精细台词引导。",
    critiqueFocus: "强调《昆虫记》是‘科学与文学的宏伟史诗’，批评了将科学名著仅当普通写景散文来教的偏向，指导建立科学观察与文学审美并重的探究范式。",
    originalGoals: "了解法布尔生平与背景；区分通读与精读；掌握批注感受与修辞手法的阅读方法。",
    reconstructedGoals: "素养立意：在跨媒介探究中感悟科学实证精神；鉴赏科普作品将科学理性与文学诗意熔铸一炉的语言特质；学会长篇科普纪实文学的专题研读方法。",
    taskDesignEvolution: "从简单的片段赏析，升级为【探险一：荒石园科学考察路线图】→【探险二：猎虫者的笔墨侦查（比拟与特写手法解剖）】→【探险三：撰写微型自然观察科学笔记】。",
    homeworkEvolution: "基础题（精读段落科普卡制作）、探究题（对比法布尔与现代生物学词条的语言风格异同）、实践题（校园微生态昆虫寻访摄影与小传撰写）。"
  },
  "案例04_初中语文_昆明的雨": {
    teacherName: "彭傲华 老师",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "初中八年级 统编版语文散文精读",
    inputCharacteristics: "1,082字精炼教案初稿。抓住‘淡而有味’的语言特点，但品读支架较少，学生容易只知其淡而无法体会汪曾祺字里行间的温润人情。",
    outputImprovements: "重构为27,211字大教案（扩充25.1倍）。创设‘寻味昆明雨，品悟淡中情’语言美学工坊；层层拆解仙人掌、菌子、杨梅、缅桂花中的风物味与人情味。",
    critiqueFocus: "重点剖析散文‘形散神聚’与‘闲笔不闲’的教学法，指导教师如何设计文本细读的显微镜问题，引导初中生体悟平淡生活中的诗意哲学。",
    originalGoals: "品味汪曾祺散文平淡而有韵味的语言；体会作者对昆明生活的深情怀念；学习以小见大的写景抒情手法。",
    reconstructedGoals: "素养立意：通过联读批注与声调涵泳，品味‘看似寻常最奇崛’的散文语言美；体悟抗战烽火背景下文人的从容风骨与人间温情；掌握生活审美化微写作技巧。",
    taskDesignEvolution: "从师问生答的散点概括，进阶为【美学品析一：昆明雨中‘风物谱’（味觉与视觉交织）】→【美学品析二：闲笔背后的‘人情暖’】→【美学品析三：写出属于你的‘草木人间’】。",
    homeworkEvolution: "设置三级作业：基础积累（汪式日常口语与文雅语词汇图谱）、探究练笔（为一种家乡日常风物写300字淡而有味的闲笔短文）、跨媒介品鉴（配乐朗诵昆明雨音频录制）。"
  },
  "案例05_小学道德与法治_美丽河山我们的家": {
    teacherName: "执教老师（中华民族大家庭主题研讨组）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "小学四年级 道德与法治 / 中华民族大家庭",
    inputCharacteristics: "3,022字常规教案。以读图知晓祖国辽阔版图为主，课堂问答偏概念化，学生对于辽阔与壮丽缺乏具身体验。",
    outputImprovements: "重构为35,143字大教案（扩充11.6倍）。打造‘我是祖国河山推荐官’大情境；融入祖国地理阶梯、自然景观与多民族守望相助的生动史实，增强家国认同。",
    critiqueFocus: "指出国情教育要脱离空洞说教，必须借助空间想象、生活对比与多模态视听资源，让‘祖国山河之美’在儿童心中具象化、情感化。",
    originalGoals: "知道我国幅员辽阔、山河壮丽；了解祖国的主要地形地貌与名山大川；激发热爱祖国大好河山的情感。",
    reconstructedGoals: "素养立意：构建大中国立体地理认知与空间观念；在山河寻访中体会人与自然和谐共生的生态文明理念；培育强烈的国家自豪感与民族命运共同体意识。",
    taskDesignEvolution: "从看图指认，跃升为【考察路线一：乘高铁看立体中国（三级阶梯探秘）】→【考察路线二：祖国母亲的绿色命脉（长江黄河生态寻访）】→【考察路线三：少数民族聚居区山水守护者】。",
    homeworkEvolution: "设计‘家庭旅行绿色山水规划师’方案、绘制‘我心中的中华山河全景图’手抄绘本、撰写一段向外国小朋友介绍中国山河的英文/中双语推荐词。"
  },
  "案例06_小学古诗文_示儿": {
    teacherName: "蔡龄锋 执教老师（临湘市第三完全小学课例）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "小学五年级 统编版语文古诗与历史跨学科",
    inputCharacteristics: "2,014字教学备案表。明确提出了历史跨学科融合构想（南宋偏安与崖山海战），但具体实施步骤和对话引导尚待展开。",
    outputImprovements: "重构为27,326字大教案（扩充13.6倍）。构建知人论世的沉浸式历史剧场；将‘死去元知万事空’与‘但悲不见九州同’的心理极限撕裂感诠释得淋漓尽致。",
    critiqueFocus: "深入探索古诗教学的‘历史纵深’与‘语言密度’，示范了如何将南宋历史地图与陆游生平诗词（如《秋夜将晓出篱门迎凉有感》）群文对照，实现情感共振。",
    originalGoals: "结合南宋偏安历史背景理解《示儿》；掌握生字生词，有感情背诵古诗；体会诗人至死不渝的爱国情怀。",
    reconstructedGoals: "素养立意：知人论世，通过诗史互证理解南宋悲壮挽歌；体会古汉语精炼沉痛的抒情力量；树立天下兴亡匹夫有责的历史使命担当。",
    taskDesignEvolution: "从逐字翻译，升华为【时空回溯一：公元1210年绍兴沈园绝笔（体察临终状态）】→【时空回溯二：何以‘万事空’与何以‘九州同’（历史地图互证）】→【时空回溯三：千古家训的现代回响】。",
    homeworkEvolution: "三层评价：基础诵读（录制悲壮激昂的配乐朗诵）、比较探究（联读辛弃疾、文天祥同主题爱国诗词并做异同批注）、实践表达（写给陆游放翁的一封告慰信）。"
  },
  "案例07_小学综合实践_手机之外的世界": {
    teacherName: "贺希 老师（宁乡市花明楼镇朱石桥九年制学校）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "初中/小学 心理健康与综合实践活动",
    inputCharacteristics: "2,393字心理健康教案。以讨论手机成瘾和制定约定为主，立意很好，但在行为心理学层面的替代策略可操作性上较弱。",
    outputImprovements: "重构为34,702字大教案（扩充14.5倍）。基于行为心理学‘线索-渴求-反应-奖赏’闭环，设计‘现实世界真实替代方案库’；建立长达一周的家庭协同干预机制。",
    critiqueFocus: "严肃指出了对手机依赖‘堵不如疏’的科学原理，强调不能停留在‘不玩手机就是好孩子’的道德评判，必须帮助学生在现实中建立高价值、高多巴胺的替代生活乐趣。",
    originalGoals: "认识过度使用手机的危害；学会合理使用手机的方法；制定并执行手机使用公约。",
    reconstructedGoals: "素养立意：掌握注意力管理与情绪觉察的元认知能力；探索现实人际交往与运动创造的真实乐趣；形成健全的数字化生存自律机制与家庭协作模式。",
    taskDesignEvolution: "从说教式批判手机，转变为【体验一：注意力黑洞实验（手机如何悄悄偷走时间）】→【体验二：替代方案百宝箱（寻访心流体验活动）】→【体验三：家庭屏幕友好条约共建工坊】。",
    homeworkEvolution: "打破传统书面作业，设计为【一周现实心流探索体验日志】：尝试3种非手机替代活动并评定体验星级，周末全家举行无手机家庭日共聚复盘。"
  },
  "案例08_初中数学_特殊平行四边形": {
    teacherName: "马娟 老师（初中数学备课组）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "初中八年级 人教版数学几何复习课",
    inputCharacteristics: "经典章节复习课教案初稿（Word 97-2003文档）。结构包含掌握定义、性质判定定理，偏重定理复述与静态几何推导演练，讲授占比大。",
    outputImprovements: "重构为28,806字大教案。构建‘特殊平行四边形家族演变树’；引入动态几何（几何画板）观察一般到特殊的连续变异；作业引入等面积动点与建筑抗震模型。",
    critiqueFocus: "指出几何复习课极易沦为‘题海刷题课’，指导教师从‘知识网络梳理’进阶到‘数学思想方法（转化、分类讨论、方程思想）’的深层建模观念培养。",
    originalGoals: "掌握平行四边形、矩形、菱形、正方形的定义与性质判定定理；能运用定理证明计算；理解一般与特殊的关系。",
    reconstructedGoals: "素养立意：发展几何直观、逻辑推理与数学抽象核心素养；在动态形变中建立‘条件增加导致性质丰富’的演绎体系；培养模型观念与跨情境解决复杂几何问题能力。",
    taskDesignEvolution: "从教师黑板板书定理，升级为【动态探究一：一根木条的形变（从平行四边形到矩形/菱形/正方形）】→【思想突破二：对角线特征的矩阵式结构发现】→【综合应用三：折叠与动点极值模型攻坚】。",
    homeworkEvolution: "分层进阶：基础过关（性质判定双向思维判断题表）、综合探究（动点P在矩形边上移动时的等面积与线段和定值探究）、实践应用（利用几何画板制作动态形变演示微视频）。"
  },
  "案例09_小学数学_圆的周长": {
    teacherName: "项老师（小学数学六年级备课组）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "小学六年级 人教版数学空间与图形",
    inputCharacteristics: "2,588字教案初稿。以绕线法和滚动法量圆为主，虽然有探究活动，但对‘化曲为直’极限思想与‘圆周率本质是比值’的数学反思相对薄弱。",
    outputImprovements: "重构为27,711字大教案（扩充10.7倍）。重构为‘数学破案小分队’大探究；深度重现祖冲之割圆术与人类测量史；引导学生反思测量误差并顿悟常数比值的数学之美。",
    critiqueFocus: "强调圆的周长不仅是套公式C=πd，更承载着人类几何思想从有限走向无限的跨越，教学应带领儿童亲历科学假说的提出、测量验证与极限思想渗透。",
    originalGoals: "理解圆周率的意义，推导并掌握圆的周长公式；能正确计算圆的周长；渗透化曲为直的数学思想。",
    reconstructedGoals: "素养立意：经历化曲为直猜想验证全过程，培育推理意识与数据意识；感悟圆周率作为无理常数的几何拓扑必然性；传承祖冲之严谨求实的科学精神与民族文化自豪感。",
    taskDesignEvolution: "从简单的分组卷尺量圆，提升为【科学求证一：车轮滚动的秘密（周长与直径正比例假说）】→【科学求证二：测量误差分析与割圆术思想链接】→【公式迁移三：解决工程与生活中的圆周问题】。",
    homeworkEvolution: "三维立体作业：基础固本（典型周长变式速算）、实践探究（寻找校园中最粗的大树并测算其胸径与树龄）、科学史思辨（撰写200字小品文：假如圆周率π正好等于3，世界会变成怎样？）。"
  },
  "案例10_高中地理_正午太阳高度角的变化": {
    teacherName: "马老师（地理教学备课组）",
    aiEvaluator: "蔡龄锋（湖南教育报刊集团 青湖教育科学研究院）",
    subjectGrade: "高中/初中 人教版地理地球运动专题",
    inputCharacteristics: "1,368字课时计划。公式推导密集（A+H=90°，A=纬度差），多为抽象空间几何讲解，学生普遍感到枯燥吃力。",
    outputImprovements: "重构为27,135字大教案（扩充19.8倍）。将死板公式无缝嵌入两大高频生活刚需：‘北纬40°北京买房冬至日正午楼间距采光测算’与‘太阳能热水器最佳可调倾角设计’。",
    critiqueFocus: "精准点拨高中地理的‘空间思维瓶颈’，要求将静态投影图转换为动态公转运行轨迹，并在真实决策情境中应用公式，培养综合思维与地理实践力。",
    originalGoals: "结合实例说明地球运动意义；分析正午太阳高度角变化规律在生活实例（太阳能、楼间距）中的应用；掌握计算公式。",
    reconstructedGoals: "素养立意：构建太阳直射点年际往返回归运动的三维时空模型；熟练运用正午太阳高度公式解决实际人居采光决策；强化地理实践力与人地协调观。",
    taskDesignEvolution: "从枯燥的板书几何推演，演进为【决策任务一：为新家选房把脉（冬至日正午阴影极限几何测算）】→【工程任务二：绿色节能太阳能最佳角度自适应机械装置设计】→【全球视野三：从赤道到极地的影子舞步】。",
    homeworkEvolution: "阶梯实践作业：基础题（本地春秋分及夏冬至正午太阳高度速算）、探究决策题（北京/长沙买房楼间距采光防遮挡验算）、跨学科创客题（制作简易可调节角度太阳能支架模型并附计算报告）。"
  }
};


/**
 * 缓存变量，避免每次 HTTP 请求重复执行20个 docx 文档解析与大量 unzip 进程
 */
let cachedInspectionResult: InspectionResult | null = null;
let hasExtractedMedia = false;
let ongoingInspection: Promise<InspectionResult> | null = null;

export function invalidateCasesCache() {
  cachedInspectionResult = null;
  hasExtractedMedia = false;
}

/**
 * 确保所有 docx 文档内的图标和插图素材已提取到 public/cases_media/[案例文件夹]/
 */
async function ensureDocxMediaExtracted(rootDir: string, force = false) {
  if (hasExtractedMedia && !force) return;
  try {
    const publicMediaRoot = path.resolve(process.cwd(), "public/cases_media");
    if (!fs.existsSync(publicMediaRoot)) {
      fs.mkdirSync(publicMediaRoot, { recursive: true });
    }
    const allDocx = getAllFiles(rootDir).filter(f => f.endsWith(".docx"));
    for (const docxPath of allDocx) {
      const rel = path.relative(rootDir, docxPath);
      const parts = rel.split(path.sep);
      const groupKey = parts.length > 1 ? parts[0] : "general";
      const targetDir = path.join(publicMediaRoot, groupKey);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const isOutput = path.basename(docxPath).includes("输出");
      const prefix = isOutput ? "out_" : "in_";
      
      const tempZipDir = path.join(publicMediaRoot, `_tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
      try {
        await execAsync(`unzip -q -j "${docxPath}" "word/media/*" -d "${tempZipDir}"`);
        if (fs.existsSync(tempZipDir)) {
          const extracted = fs.readdirSync(tempZipDir);
          for (const img of extracted) {
            const dest = path.join(targetDir, `${prefix}${img}`);
            if (!fs.existsSync(dest)) {
              fs.copyFileSync(path.join(tempZipDir, img), dest);
            }
          }
          fs.rmSync(tempZipDir, { recursive: true, force: true });
        }
      } catch {
        if (fs.existsSync(tempZipDir)) {
          fs.rmSync(tempZipDir, { recursive: true, force: true });
        }
      }
    }
    hasExtractedMedia = true;
  } catch (err) {
    // 忽略非关键媒体提取异常
  }
}

/**
 * 全面审阅根目录下统一文件夹内的所有案例文件
 */
export async function inspectAllCases(forceRefresh: boolean = false): Promise<InspectionResult> {
  if (cachedInspectionResult && !forceRefresh) {
    return cachedInspectionResult;
  }

  if (ongoingInspection && !forceRefresh) {
    return ongoingInspection;
  }

  ongoingInspection = (async () => {
    const rootDir = getCasesRootDir();

    cleanMacJunk(rootDir);
    await ensureDocxMediaExtracted(rootDir, forceRefresh);

  const allFiles = getAllFiles(rootDir);
  const docxFiles = allFiles.filter(f => f.endsWith(".docx") || f.endsWith(".doc"));
  const otherFiles = allFiles.filter(f => !f.endsWith(".docx") && !f.endsWith(".doc") && !f.endsWith(".zip"));

  const casesMap = new Map<string, CaseGroup>();
  let caseIndex = 1;

  for (const filePath of docxFiles) {
    const relPath = path.relative(rootDir, filePath);
    const pathParts = relPath.split(path.sep);
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);

    let extractedText = "";
    let htmlContent = "";

    const isInput = fileName.includes("输入");
    const isOutput = fileName.includes("输出");
    const docType: "input" | "output" | "other" = isInput ? "input" : (isOutput ? "output" : "other");
    const groupKey = pathParts.length > 1 ? pathParts[0] : `案例_${caseIndex.toString().padStart(2, '0')}`;

    try {
      if (filePath.endsWith(".docx") || filePath.endsWith(".doc")) {
        const extracted = await extractTextFromAnyDocFile(filePath, fileName);
        extractedText = extracted.text || "";
        htmlContent = extracted.html || `<p class="leading-relaxed text-xs text-slate-700 whitespace-pre-wrap">${extractedText}</p>`;
      }
    } catch (e: any) {
      extractedText = `[文档解析提醒]: 该文件需直接查看，详情: ${e.message}`;
      htmlContent = `<p>${extractedText}</p>`;
    }

    // 关联提取的高清图标与数据图表
    const mediaDir = path.resolve(process.cwd(), "public/cases_media", groupKey);
    const prefix = isOutput ? "out_" : (isInput ? "in_" : "");
    let docImages: string[] = [];
    if (fs.existsSync(mediaDir)) {
      const mediaFiles = fs.readdirSync(mediaDir);
      docImages = mediaFiles
        .filter(m => !prefix || m.startsWith(prefix))
        .map(m => `/cases_media/${groupKey}/${m}`);
    }

    // 从文本中提炼标题
    const lines = extractedText.split("\n").map(l => l.trim()).filter(Boolean);
    const firstLineTitle = lines.length > 0 ? lines[0].slice(0, 40) : fileName.replace(/\.[^/.]+$/, "");

    // 分组标题
    const groupTitle = pathParts.length > 1 
      ? pathParts[0].replace(/_/g, " - ") 
      : firstLineTitle || `案例 ${caseIndex}`;

    // 提炼关键点
    const keyPoints = lines.slice(1, 6).filter(l => l.length > 5 && l.length < 120);

    const doc: CaseDocument = {
      id: `doc_${caseIndex}_${path.basename(filePath)}`,
      name: fileName,
      originalPath: relPath,
      displayPath: relPath,
      size: stats.size,
      wordCount: extractedText.length,
      extractedText,
      htmlContent,
      docType,
      summary: lines.slice(0, 3).join(" ").slice(0, 200) + "...",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["详见案例正文材料"],
      images: docImages
    };

    if (!casesMap.has(groupKey)) {
      casesMap.set(groupKey, {
        id: `case_${caseIndex}`,
        title: groupTitle,
        folderName: groupKey,
        originalFolder: pathParts.length > 1 ? pathParts[0] : "根目录",
        files: [doc],
        caseAnalysis: generateCaseAnalysis(extractedText, groupTitle)
      });
      caseIndex++;
    } else {
      const group = casesMap.get(groupKey)!;
      group.files.push(doc);
      if (fileName.includes("输出") || extractedText.length > (group.files[0]?.wordCount || 0)) {
        group.caseAnalysis = generateCaseAnalysis(extractedText, groupTitle);
      }
    }
  }

  // 辅助文件
  for (const filePath of otherFiles) {
    const relPath = path.relative(rootDir, filePath);
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    const pathParts = relPath.split(path.sep);
    const groupKey = pathParts.length > 1 ? pathParts[0] : "其他资料与附件";

    const doc: CaseDocument = {
      id: `other_${Date.now()}_${Math.random()}`,
      name: fileName,
      originalPath: relPath,
      displayPath: relPath,
      size: stats.size,
      wordCount: 0,
      extractedText: "[附件资源文件]",
      htmlContent: `<p>附件文件：${fileName} (${(stats.size / 1024).toFixed(1)} KB)</p>`,
      docType: "other",
      summary: `附件资源：${fileName}`,
      keyPoints: ["案例辅助素材"],
      images: []
    };

    if (casesMap.has(groupKey)) {
      casesMap.get(groupKey)!.files.push(doc);
    }
  }

  const cases = Array.from(casesMap.values()).sort((a, b) => a.folderName.localeCompare(b.folderName, 'zh-CN'));

  // 对每个案例装配 inputFile, outputFile, comparison
  for (const caseGroup of cases) {
    const inp = caseGroup.files.find(f => f.docType === "input") || caseGroup.files.find(f => f.name.includes("输入"));
    const out = caseGroup.files.find(f => f.docType === "output") || caseGroup.files.find(f => f.name.includes("输出"));
    
    caseGroup.inputFile = inp;
    caseGroup.outputFile = out;

    const meta = CASE_KNOWLEDGE_BASE[caseGroup.folderName];
    const inpCount = inp?.wordCount || 1000;
    const outCount = out?.wordCount || 25000;
    const ratio = Number((outCount / Math.max(inpCount, 1)).toFixed(1));

    if (meta) {
      caseGroup.comparison = {
        expansionRatio: ratio,
        teacherName: meta.teacherName,
        aiEvaluator: meta.aiEvaluator,
        subjectGrade: meta.subjectGrade,
        inputWordCount: inpCount,
        outputWordCount: outCount,
        inputCharacteristics: meta.inputCharacteristics,
        outputImprovements: meta.outputImprovements,
        critiqueFocus: meta.critiqueFocus,
        teachingGoalsEvolution: {
          original: meta.originalGoals,
          reconstructed: meta.reconstructedGoals
        },
        taskDesignEvolution: meta.taskDesignEvolution,
        homeworkEvolution: meta.homeworkEvolution
      };
    } else {
      caseGroup.comparison = {
        expansionRatio: ratio,
        teacherName: "执教老师",
        aiEvaluator: "蔡龄锋（青湖教育科学研究院）",
        subjectGrade: caseGroup.title,
        inputWordCount: inpCount,
        outputWordCount: outCount,
        inputCharacteristics: `教师原始教案草案输入，字数约 ${inpCount} 字。`,
        outputImprovements: `AI教研员重构升级输出，扩充至 ${outCount} 字。`,
        critiqueFocus: "针对教学目标达成、学生活动创设与评价分层进行全面指导。",
        teachingGoalsEvolution: {
          original: "达成基础知识掌握与课标基本要求。",
          reconstructed: "素养导向、大单元大任务进阶设计。"
        },
        taskDesignEvolution: "从单向讲授进阶到多维任务群。",
        homeworkEvolution: "构建基础过关、探究挑战与实践表现性三层作业。"
      };
    }

    // 装配特级专家科学重构版教案 (包含40分钟行课单、真实学情支架、黑板布局、随堂探究单与Rubrics)
    caseGroup.enhancedPlan = getEnhancedPlan(caseGroup);
  }

  // 整理综合分析
  const totalWordCount = cases.reduce((acc, c) => acc + c.files.reduce((a, f) => a + f.wordCount, 0), 0);
  const targetFolder = path.basename(rootDir);
  const overallAnalysis = cases.length > 0 
    ? `已成功审阅全部 ${cases.length} 个案例（共 ${allFiles.length} 个文档文件，总计文本量达 ${totalWordCount.toLocaleString()} 字符）。本套案例为湖南教育报刊集团青湖教育科学研究院蔡龄锋老师主导的“AI赋能备课与教案升级”专题成果，覆盖小学至高中的语文、数学、地理、道法、综合实践等多学科。各案例均包含“教师原始输入”与“AI教研员深度讲评/重构输出”，生动展现了AI在大单元情境创设、素养导向活动设计及分层作业评价中的显著赋能效果。所有文件均已按高可读性规范归整存放在根目录 ${targetFolder}/ 中。`
    : "暂未检索到解压后的案例文件，请通过上传通道上传 Zip 压缩包。";

    const result: InspectionResult = {
      totalCases: cases.length,
      totalFiles: allFiles.length,
      folderStructure: buildFolderTree(rootDir),
      targetFolder,
      cases,
      overallAnalysis,
      unpackedAt: new Date().toLocaleString()
    };

    cachedInspectionResult = result;
    return result;
  })();

  try {
    return await ongoingInspection;
  } finally {
    ongoingInspection = null;
  }
}

/**
 * 递归构建目录树
 */
function buildFolderTree(dir: string): any {
  if (!fs.existsSync(dir)) return null;
  const name = path.basename(dir);
  const stats = fs.statSync(dir);

  if (!stats.isDirectory()) {
    return { name, type: "file", size: stats.size };
  }

  const children = fs.readdirSync(dir)
    .filter(f => f !== "__MACOSX" && !f.startsWith("._") && f !== ".DS_Store")
    .map(child => buildFolderTree(path.join(dir, child)));

  return { name, type: "directory", children };
}
