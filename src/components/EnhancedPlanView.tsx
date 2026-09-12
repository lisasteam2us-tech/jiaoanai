import React, { useState, useRef, useEffect } from "react";
import { EnhancedTeachingPlan } from "../types";
import { exportTeachingPlanToDocx, DocxFontStyle, FONT_THEMES } from "../utils/docxExporter";
import { generateBlackboardDataUrl } from "../utils/blackboardRenderer";
import {
  Clock,
  Target,
  Sparkles,
  Award,
  BookOpen,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  PenTool,
  Send,
  Loader2,
  TableProperties,
  FileDown,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Download,
  ShieldCheck
} from "lucide-react";

interface EnhancedPlanViewProps {
  plan: EnhancedTeachingPlan;
  caseId: string;
}

export const EnhancedPlanView: React.FC<EnhancedPlanViewProps> = ({ plan: initialPlan, caseId }) => {
  const [plan, setPlan] = useState<EnhancedTeachingPlan>(initialPlan);
  const [activeSection, setActiveSection] = useState<"timeline" | "board" | "worksheet" | "rubric" | "audit">("timeline");
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizeStatus, setCustomizeStatus] = useState<string | null>(null);

  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [selectedFontStyle, setSelectedFontStyle] = useState<DocxFontStyle>("modern");
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  const [blackboardDataUrl, setBlackboardDataUrl] = useState<string | null>(null);
  const [boardPreviewMode, setBoardPreviewMode] = useState<"image" | "layout">("image");

  useEffect(() => {
    if (activeSection === "board" && !blackboardDataUrl && plan?.boardDesign) {
      const url = generateBlackboardDataUrl(plan.boardDesign, plan.topic);
      if (url) {
        setBlackboardDataUrl(url);
      }
    }
  }, [activeSection, plan, blackboardDataUrl]);

  const handleDownloadBoardImage = () => {
    const url = blackboardDataUrl || generateBlackboardDataUrl(plan.boardDesign, plan.topic);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `《${plan.topic}》_物理黑板空间规划板书挂图.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setIsFontMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyFullPlan = () => {
    const text = `【${plan.topic}】40分钟特级教师精细化实操教案
学科版本：${plan.gradeSubject} (${plan.versionInfo})
学科大观念：${plan.coreConcept}

一、课例诊断与学情分析
• 教师原案闪光点：${plan.diagnosis.originalHighlights}
• 三大实操痛点突破：
${plan.diagnosis.criticalGaps.map((g, i) => `  ${i + 1}. ${g}`).join("\n")}
• 目标学情特征：${plan.diagnosis.targetAudienceProfile}

二、核心素养与教学表现目标
${plan.competencyGoals.map(c => `• [${c.category}]：${c.performanceGoal}\n  评价证据：${c.evidenceOfLearning}`).join("\n")}

三、40分钟精准行课施工图（带真实学情卡壳与补救支架）
${plan.timeline.map(t => `【${t.timeRange}】${t.phaseTitle}
  学生活动：${t.studentActivity}
  教师设问：${t.teacherPrompt}
  学情卡壳与补救支架：${t.scaffolding}
  设计意图：${t.designIntent}
`).join("\n")}

四、黑板板书物理布局设计
[左翼]：${plan.boardDesign.leftWing}
[中台]：${plan.boardDesign.centerStage}
[右翼]：${plan.boardDesign.rightWing}
板书提示：${plan.boardDesign.teacherNotes}

五、随堂学生探究任务单与量规
大问题：${plan.studentWorksheet.drivingQuestion}
任务清单：
${plan.studentWorksheet.tasks.map(tsk => `• ${tsk.taskNumber}：${tsk.taskPrompt}\n  支架提示：${tsk.scaffoldTip}`).join("\n")}
评价量规：
${plan.studentWorksheet.rubrics.map(r => `• 维度【${r.dimension}】：\n  ★★★：${r.levels.level3}\n  ★★：${r.levels.level2}\n  ★：${r.levels.level1}`).join("\n")}

六、三层弹性进阶作业
1. 基础过关（必做）：${plan.tieredHomework.tier1Basic}
2. 探究进阶（选做）：${plan.tieredHomework.tier2Exploratory}
3. 跨界实践（综合）：${plan.tieredHomework.tier3Practical}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async (overrideFontStyle?: DocxFontStyle) => {
    const styleToUse = overrideFontStyle || selectedFontStyle;
    try {
      setIsExportingDocx(true);
      await exportTeachingPlanToDocx(plan, { fontStyle: styleToUse });
    } catch (err: any) {
      console.error("导出 Word 失败:", err);
      alert("导出 Word 文档失败: " + err.message);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isCustomizing) return;

    setIsCustomizing(true);
    setCustomizeStatus(null);
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}/customize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: customPrompt.trim() })
      });
      const data = await res.json();
      if (data.success && data.customizedPlan) {
        setPlan(data.customizedPlan);
        setCustomizeStatus("定制重构成功已合并至当前方案！");
      } else {
        setCustomizeStatus(data.message || "定制处理未完成");
      }
    } catch (err: any) {
      setCustomizeStatus("网络请求异常: " + err.message);
    } finally {
      setIsCustomizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f9fafb] overflow-y-auto">
      {/* 顶部标题栏：微信绿简约风格 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#f0faf4] text-[#06ad56] border border-[#d1f2e1] text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#07c160]" />
                专家实操版
              </span>
              <span className="text-gray-500 text-xs font-mono">{plan.gradeSubject}</span>
              <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {plan.versionInfo}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span>{plan.topic}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                40分钟设计
              </span>
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
              <strong className="text-[#06ad56]">核心大观念：</strong>
              {plan.coreConcept}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {/* 导出 Word 字体风格选择与下载组合控件 */}
            <div className="relative inline-flex rounded-lg shadow-xs" ref={fontMenuRef}>
              <button
                onClick={() => handleExportDocx()}
                disabled={isExportingDocx}
                className="px-3.5 py-1.5 rounded-l-lg bg-[#07c160] hover:bg-[#06ad56] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-r border-[#059649]"
                title={`当前字体方案：${FONT_THEMES[selectedFontStyle].name}`}
              >
                {isExportingDocx ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-white" />
                )}
                <span>{isExportingDocx ? "正在生成..." : "导出 Word"}</span>
                <span className="text-[10px] font-normal bg-white/20 px-1.5 py-0.5 rounded text-white/95 ml-0.5 hidden sm:inline-block">
                  {FONT_THEMES[selectedFontStyle].name}
                </span>
              </button>

              <button
                onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                disabled={isExportingDocx}
                className="px-2 py-1.5 rounded-r-lg bg-[#07c160] hover:bg-[#06ad56] disabled:opacity-50 text-white text-xs flex items-center justify-center transition-all cursor-pointer"
                title="选择排版字体方案"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isFontMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* 字体方案下拉选择面板 */}
              {isFontMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-[#07c160]" />
                      Word 导出字体风格
                    </span>
                    <span className="text-[10px] text-gray-400">杜绝杂乱混杂</span>
                  </div>

                  <div className="p-1 space-y-1">
                    {(Object.keys(FONT_THEMES) as DocxFontStyle[]).map((styleKey) => {
                      const item = FONT_THEMES[styleKey];
                      const isSelected = selectedFontStyle === styleKey;
                      return (
                        <button
                          key={styleKey}
                          onClick={() => {
                            setSelectedFontStyle(styleKey);
                            setIsFontMenuOpen(false);
                            handleExportDocx(styleKey);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? "bg-[#f0faf4] border border-[#bbf0d4]"
                              : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? "text-[#06ad56]" : "text-gray-800"}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 font-medium">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 py-1.5 bg-gray-50/70 border-t border-gray-100 mt-1 text-[10px] text-gray-400">
                    点击任一方案立即导出，系统已全局锁定标题、正文与表格字体同源统一。
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCopyFullPlan}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-gray-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#07c160]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copied ? "已复制" : "复制教案"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-gray-200"
            >
              <Printer className="w-3.5 h-3.5 text-gray-400" />
              <span>打印</span>
            </button>
          </div>
        </div>
      </div>

      {/* 学情要点提示条 */}
      <div className="bg-[#f0faf4] border-b border-[#d1f2e1] px-5 py-2.5 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-700 truncate">
            <Target className="w-3.5 h-3.5 text-[#07c160] shrink-0" />
            <span className="font-semibold text-gray-800 shrink-0">学情诊断：</span>
            <span className="truncate">{plan.diagnosis.targetAudienceProfile}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {plan.authoritativeCitations && plan.authoritativeCitations.length > 0 && (
              <button
                onClick={() => setShowCitations(!showCitations)}
                className="text-[11px] font-medium text-[#06ad56] bg-white hover:bg-emerald-50 px-2 py-0.5 rounded border border-[#d1f2e1] flex items-center gap-1 cursor-pointer transition-colors"
                title="查看教案重构引用的官方课标与权威教研数据出处"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#07c160]" />
                <span>知识库背书 ({plan.authoritativeCitations.length}项依据)</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCitations ? "rotate-180" : ""}`} />
              </button>
            )}
            <span className="text-[11px] font-medium text-[#06ad56] bg-white px-2 py-0.5 rounded border border-[#d1f2e1]">
              3项实操痛点突破
            </span>
          </div>
        </div>

        {/* 权威依据展开抽屉 */}
        {showCitations && plan.authoritativeCitations && plan.authoritativeCitations.length > 0 && (
          <div className="max-w-5xl mx-auto mt-2.5 pt-2.5 border-t border-[#d1f2e1]/70 animate-in fade-in duration-200">
            <div className="text-[11px] font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#07c160]" />
              <span>本课例重构引用的权威课标、学情报告与名师切片依据：</span>
            </div>
            <ul className="space-y-1">
              {plan.authoritativeCitations.map((citation, idx) => (
                <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1.5 leading-relaxed bg-white/70 px-2.5 py-1 rounded border border-[#e1f5ec]">
                  <span className="text-[#07c160] font-bold shrink-0">{idx + 1}.</span>
                  <span>{citation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 子功能导航条 */}
      <div className="bg-white border-b border-gray-200 px-5 sticky top-0 z-10 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSection("timeline")}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "timeline"
                ? "border-[#07c160] text-[#06ad56] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>40分钟施工图</span>
          </button>

          <button
            onClick={() => setActiveSection("board")}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "board"
                ? "border-[#07c160] text-[#06ad56] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>黑板板书布局</span>
          </button>

          <button
            onClick={() => setActiveSection("worksheet")}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "worksheet"
                ? "border-[#07c160] text-[#06ad56] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>随堂探究单</span>
          </button>

          <button
            onClick={() => setActiveSection("rubric")}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "rubric"
                ? "border-[#07c160] text-[#06ad56] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>表现性评价量规</span>
          </button>

          <button
            onClick={() => setActiveSection("audit")}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "audit"
                ? "border-[#07c160] text-[#06ad56] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>三方对比审计</span>
          </button>
        </div>
      </div>

      {/* 主体内容区域 */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">

        {/* 1. 40分钟行课施工图 */}
        {activeSection === "timeline" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                  40分钟常态课堂施工图
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                共 {plan.timeline.length} 个教学环节
              </span>
            </div>

            <div className="space-y-3">
              {plan.timeline.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-3 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#f0faf4] text-[#06ad56] font-mono font-bold text-xs border border-[#d1f2e1]">
                        {step.timeRange}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{step.phaseTitle}</h4>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      环节 {idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 学生活动 */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-bold text-gray-800 block mb-1">
                        学生活动与探究：
                      </span>
                      <p className="text-gray-600 leading-relaxed">{step.studentActivity}</p>
                    </div>

                    {/* 教师设问 */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-bold text-gray-800 block mb-1">
                        教师关键设问：
                      </span>
                      <p className="text-gray-700 leading-relaxed">{step.teacherPrompt}</p>
                    </div>
                  </div>

                  {/* 学情卡壳与补救支架 */}
                  <div className="bg-[#f0faf4] p-3 rounded-lg border border-[#d1f2e1] text-xs">
                    <span className="font-bold text-[#06ad56] block mb-0.5">
                      学情预警与补救支架：
                    </span>
                    <p className="text-gray-700 leading-relaxed">{step.scaffolding}</p>
                  </div>

                  {/* 设计意图 */}
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="font-medium text-gray-500">设计意图：</span>
                    <span>{step.designIntent}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 作业分层 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4.5 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-3 rounded-xs bg-[#07c160] inline-block"></span>
                分层弹性作业设计
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">
                    ① 基础过关（必做）
                  </span>
                  <p className="text-gray-600 leading-relaxed">{plan.tieredHomework.tier1Basic}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">
                    ② 探究进阶（选做）
                  </span>
                  <p className="text-gray-600 leading-relaxed">{plan.tieredHomework.tier2Exploratory}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f0faf4] border border-[#d1f2e1]">
                  <span className="font-bold text-[#06ad56] block mb-1">
                    ③ 实践拓展（综合）
                  </span>
                  <p className="text-gray-700 leading-relaxed">{plan.tieredHomework.tier3Practical}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 黑板板书物理布局 */}
        {activeSection === "board" && (
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                  黑板物理板书空间布局
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    版式：{plan.boardDesign.layoutType}
                  </span>
                </h3>
              </div>

              {/* 视图切换与下载板书挂图按钮 */}
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-0.5 rounded-lg flex items-center text-xs">
                  <button
                    onClick={() => setBoardPreviewMode("image")}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                      boardPreviewMode === "image"
                        ? "bg-white text-[#07c160] shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>拟真板书图 (Word同步)</span>
                  </button>
                  <button
                    onClick={() => setBoardPreviewMode("layout")}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                      boardPreviewMode === "layout"
                        ? "bg-white text-[#07c160] shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>分栏文本</span>
                  </button>
                </div>

                <button
                  onClick={handleDownloadBoardImage}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  title="下载 16:9 高清物理黑板挂图 PNG"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>下载板书图</span>
                </button>
              </div>
            </div>

            {/* 拟真黑板挂图模式 (与 Word 导出文档一致的 16:9 物理黑板图) */}
            {boardPreviewMode === "image" && (
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 space-y-2">
                {blackboardDataUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-md group">
                    <img
                      src={blackboardDataUrl}
                      alt={`《${plan.topic}》黑板物理板书挂图`}
                      className="w-full h-auto object-cover block"
                    />
                    <div className="absolute bottom-2 right-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleDownloadBoardImage}
                        className="px-3 py-1.5 rounded-md bg-black/75 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>保存高清挂图 (1600×850)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-[#07c160]" />
                    <span className="text-xs">正在渲染拟真物理黑板空间图...</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-1">
                  <span>* 导出的 Word 文档中已自动将此图高清渲染并嵌入至第四部分《黑板物理板书空间版式图》</span>
                  <span className="text-[#07c160] font-medium">支持直接投屏或打印用于常态赛课</span>
                </div>
              </div>
            )}

            {/* 模拟黑板分栏文本模式 */}
            {boardPreviewMode === "layout" && (
              <div className="w-full max-w-full bg-[#1e2a22] text-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-800 font-sans overflow-hidden">
                <div className="text-center pb-3 border-b border-white/10 mb-4 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    物理黑板空间拓扑（左翼 25% · 中台主板 50% · 右翼 25%）
                  </span>
                  <span className="text-xs text-[#07c160] font-medium tracking-wider">
                    讲台视角 · 教学板书全景
                  </span>
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    实操防溢保护 · 等宽字模对齐
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs sm:text-sm">
                  {/* 左翼区 (3/12 = 25%) */}
                  <div className="lg:col-span-3 min-w-0 overflow-hidden bg-black/20 p-3.5 rounded-lg border border-white/10 space-y-2 flex flex-col">
                    <div className="text-[#07c160] font-bold border-b border-white/10 pb-1.5 flex items-center justify-between shrink-0">
                      <span className="truncate">【左翼区】主干概念与情境</span>
                      <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-1">固定保留</span>
                    </div>
                    <div className="w-full min-w-0 overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-words font-sans text-gray-200 leading-relaxed text-xs">
                        {plan.boardDesign.leftWing}
                      </pre>
                    </div>
                  </div>

                  {/* 中台区 (6/12 = 50% 主画幅) */}
                  <div className="lg:col-span-6 min-w-0 overflow-hidden bg-black/35 p-3.5 sm:p-4 rounded-lg border border-[#07c160]/40 space-y-2.5 flex flex-col shadow-inner">
                    <div className="text-emerald-300 font-bold border-b border-white/10 pb-1.5 flex items-center justify-between shrink-0">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#07c160] animate-pulse shrink-0"></span>
                        <span>【中台区】师生动态推演</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 font-normal ml-1">
                        核心生成 · 课堂主脉
                      </span>
                    </div>
                    <div className="w-full min-w-0 overflow-x-auto rounded-md bg-black/30 p-3 border border-white/5">
                      <pre className="font-mono text-xs sm:text-[13px] text-white leading-relaxed font-medium whitespace-pre break-normal max-w-full select-text">
                        {plan.boardDesign.centerStage}
                      </pre>
                    </div>
                  </div>

                  {/* 右翼区 (3/12 = 25%) */}
                  <div className="lg:col-span-3 min-w-0 overflow-hidden bg-black/20 p-3.5 rounded-lg border border-white/10 space-y-2 flex flex-col">
                    <div className="text-gray-300 font-bold border-b border-white/10 pb-1.5 flex items-center justify-between shrink-0">
                      <span className="truncate">【右翼区】示范与评价量规</span>
                      <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-1">互动副板</span>
                    </div>
                    <div className="w-full min-w-0 overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-words font-sans text-gray-200 leading-relaxed text-xs">
                        {plan.boardDesign.rightWing}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-300 flex items-start gap-2">
                  <span className="font-semibold text-[#07c160] shrink-0">板书说明：</span>
                  <p className="leading-relaxed">{plan.boardDesign.teacherNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. 学生随堂探究单 */}
        {activeSection === "worksheet" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                  随堂学生探究单
                </h3>
              </div>
              <button
                onClick={handlePrint}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3 text-gray-400" />
                <span>打印任务单</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-7 shadow-xs space-y-5 text-gray-900">
              <div className="text-center border-b border-gray-200 pb-3 space-y-1">
                <h2 className="text-base sm:text-lg font-bold">{plan.studentWorksheet.sheetTitle}</h2>
                <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-1">
                  <span>班级：___________</span>
                  <span>姓名：___________</span>
                  <span>互评等级：___________</span>
                </div>
              </div>

              {/* 驱动性大问题 */}
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                <span className="font-bold text-[#06ad56] text-xs block mb-0.5">核心探究问题：</span>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">{plan.studentWorksheet.drivingQuestion}</p>
              </div>

              {/* 任务列表 */}
              <div className="space-y-3.5">
                {plan.studentWorksheet.tasks.map((task, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3.5 space-y-2 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800">
                        {task.taskNumber}
                      </span>
                      {task.scaffoldTip && (
                        <span className="text-[11px] text-[#06ad56] bg-[#f0faf4] px-2 py-0.5 rounded border border-[#d1f2e1]">
                          支架提示：{task.scaffoldTip}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {task.taskPrompt}
                    </p>
                    <div className="min-h-16 bg-white border border-dashed border-gray-200 rounded p-2.5 text-xs text-gray-400">
                      [作答区]：{task.responseAreaPlaceholder}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. 表现性评价量规 (Rubric) */}
        {activeSection === "rubric" && (
          <div className="space-y-3.5">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                表现性评价量规
              </h3>
            </div>

            <div className="space-y-3">
              {plan.studentWorksheet.rubrics.map((rubric, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="bg-gray-50 px-3.5 py-2.5 border-b border-gray-200 font-bold text-xs text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#07c160]"></span>
                    <span>评价维度：{rubric.dimension}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-xs">
                    <div className="p-3.5 bg-[#f0faf4]/50 space-y-1">
                      <span className="font-bold text-[#06ad56]">
                        ★★★ 卓越 (Level 3)
                      </span>
                      <p className="text-gray-700 leading-relaxed">{rubric.levels.level3}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/50 space-y-1">
                      <span className="font-bold text-gray-800">
                        ★★ 合格 (Level 2)
                      </span>
                      <p className="text-gray-600 leading-relaxed">{rubric.levels.level2}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/30 space-y-1">
                      <span className="font-bold text-gray-500">
                        ★ 待提高 (Level 1)
                      </span>
                      <p className="text-gray-500 leading-relaxed">{rubric.levels.level1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 三方客观审计对照 */}
        {activeSection === "audit" && (
          <div className="space-y-3.5">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                三方客观对比审计
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                      <th className="p-3 font-semibold w-24">对比维度</th>
                      <th className="p-3 font-semibold text-gray-500">教师初稿</th>
                      <th className="p-3 font-semibold text-gray-500">旧版AI扩充</th>
                      <th className="p-3 font-semibold text-[#06ad56] bg-[#f0faf4]/60">新重构方案</th>
                      <th className="p-3 font-semibold text-gray-700">评判结论</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plan.auditComparison.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/40">
                        <td className="p-3 font-medium text-gray-900 bg-gray-50/30">{item.dimension}</td>
                        <td className="p-3 text-gray-500 leading-relaxed">{item.teacherInputState}</td>
                        <td className="p-3 text-gray-500 leading-relaxed">{item.legacyAiOutputState}</td>
                        <td className="p-3 text-gray-900 font-medium leading-relaxed bg-[#f0faf4]/30">{item.enhancedPlanState}</td>
                        <td className="p-3 text-[#06ad56] font-medium leading-relaxed">{item.practicalVerdict}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 底部微调定制卡 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-2.5 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#07c160]" />
              <span>针对特定班情个性化微调</span>
            </h4>
            <span className="text-[11px] text-gray-400">
              例如：降低难度、补充具象学具
            </span>
          </div>

          <form onSubmit={handleCustomization} className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="输入您的班情或定制要求..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#07c160] focus:ring-1 focus:ring-[#07c160] bg-gray-50"
            />
            <button
              type="submit"
              disabled={isCustomizing || !customPrompt.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-[#07c160] hover:bg-[#06ad56] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {isCustomizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>{isCustomizing ? "处理中..." : "微调"}</span>
            </button>
          </form>

          {customizeStatus && (
            <p className="text-xs text-[#06ad56] bg-[#f0faf4] p-2 rounded border border-[#d1f2e1]">
              {customizeStatus}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
