import React, { useState, useEffect, useMemo } from "react";
import { InspectionResult, CaseGroup, EnhancedTeachingPlan } from "./types";
import { UploadZone } from "./components/UploadZone";
import { CaseCard } from "./components/CaseCard";
import { CaseListItem } from "./components/CaseListItem";
import { CaseModal } from "./components/CaseModal";
import { StructureTree } from "./components/StructureTree";
import { PlanInputWorkbench } from "./components/PlanInputWorkbench";
import { KnowledgeBaseModal } from "./components/KnowledgeBaseModal";
import {
  RotateCw,
  FolderTree,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  Database
} from "lucide-react";

export default function App() {
  const [data, setData] = useState<InspectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseGroup | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [activeTab, setActiveTab] = useState<"workbench" | "cases">("workbench");
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  // 课例页面的筛选与展示状态（支持：全部、小学年级、初中年级、高中年级）
  const [selectedGradeStage, setSelectedGradeStage] = useState<"all" | "primary" | "middle" | "high">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewLayout, setViewLayout] = useState<"list" | "grid">("list");

  // 判断课例所属学段辅助方法
  const getCaseGradeStage = (c: CaseGroup): "primary" | "middle" | "high" | "other" => {
    const text = `${c.title} ${c.folderName} ${c.comparison?.subjectGrade || ""}`;
    if (text.includes("小学") || text.includes("一年级") || text.includes("二年级") || text.includes("三年级") || text.includes("四年级") || text.includes("五年级") || text.includes("六年级")) {
      return "primary";
    }
    if (text.includes("初中") || text.includes("七年级") || text.includes("八年级") || text.includes("九年级") || text.includes("初一") || text.includes("初二") || text.includes("初三")) {
      return "middle";
    }
    if (text.includes("高中") || text.includes("高一") || text.includes("高二") || text.includes("高三")) {
      return "high";
    }
    return "other";
  };

  // 各学段数量统计
  const stageCounts = useMemo(() => {
    const counts = { all: 0, primary: 0, middle: 0, high: 0 };
    if (!data?.cases) return counts;
    counts.all = data.cases.length;
    data.cases.forEach((c) => {
      const stage = getCaseGradeStage(c);
      if (stage === "primary") counts.primary += 1;
      else if (stage === "middle") counts.middle += 1;
      else if (stage === "high") counts.high += 1;
    });
    return counts;
  }, [data]);

  // 过滤后的课例列表
  const filteredCases = useMemo(() => {
    if (!data?.cases) return [];
    return data.cases.filter((c) => {
      // 学段过滤：全部、小学年级、初中年级、高中年级
      if (selectedGradeStage !== "all") {
        const stage = getCaseGradeStage(c);
        if (stage !== selectedGradeStage) {
          return false;
        }
      }
      // 搜索过滤
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = c.title.toLowerCase().includes(q);
        const teacherMatch = c.comparison?.teacherName?.toLowerCase().includes(q);
        const folderMatch = c.folderName.toLowerCase().includes(q);
        const improveMatch = c.comparison?.outputImprovements?.toLowerCase().includes(q);
        return titleMatch || teacherMatch || folderMatch || improveMatch;
      }
      return true;
    });
  }, [data, selectedGradeStage, searchQuery]);


  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.totalCases > 0) {
          setData(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUploadSuccess = (result: InspectionResult) => {
    setData(result);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 微信绿简约顶栏 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#07c160] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 tracking-tight">
                备课深度诊断与评价重构
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0faf4] text-[#06ad56] border border-[#d1f2e1]">
                新课标
              </span>
            </div>
          </div>

          {/* 切换 Tab 与 知识库入口 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab("workbench")}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "workbench"
                    ? "bg-white text-gray-900 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === "workbench" ? "text-[#07c160]" : "text-gray-400"}`} />
                <span>诊断工作台</span>
              </button>
              <button
                onClick={() => setActiveTab("cases")}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "cases"
                    ? "bg-white text-gray-900 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>参考课例</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-600 text-[10px]">
                  {data?.totalCases || 10}
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowKnowledgeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              title="查看 Cloud SQL 工业级知识库底层元数据与诊断归档"
            >
              <Database className="w-3.5 h-3.5 text-[#07c160]" />
              <span className="hidden sm:inline">SQL 知识库</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#07c160] animate-pulse"></span>
            </button>
          </div>
        </div>
      </header>

      {/* 主视窗 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "workbench" ? (
          /* 主工作台：输入、逆向审计、40分施工图、一键导出 */
          <PlanInputWorkbench
            onPlanAnalyzed={(newPlan) => {
              const dynamicCase: CaseGroup = {
                id: newPlan.caseId,
                title: newPlan.topic,
                folderName: newPlan.caseId,
                originalFolder: newPlan.caseId,
                files: [],
                inputFile: {
                  id: "custom_input",
                  name: `${newPlan.topic}_原案.txt`,
                  originalPath: `${newPlan.topic}.txt`,
                  displayPath: `${newPlan.topic}.txt`,
                  size: 2048,
                  wordCount: 800,
                  extractedText: "新输入的备课原稿已成功完成深度解析与逆向审计。",
                  htmlContent: "<p>新输入的备课原稿已成功完成深度解析与逆向审计。</p>",
                  summary: newPlan.diagnosis.targetAudienceProfile,
                  keyPoints: newPlan.diagnosis.criticalGaps,
                  docType: "input",
                  images: []
                },
                enhancedPlan: newPlan
              };
              setSelectedCase(dynamicCase);
            }}
          />
        ) : (
          /* 参考课例：10套名师重构课例 */
          <div className="space-y-4">
            {/* 顶栏控制条 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-xs bg-[#07c160] inline-block"></span>
                <h2 className="text-sm font-bold text-gray-900">
                  参考课例库
                </h2>
                <span className="text-xs text-gray-400">
                  ({filteredCases.length} 篇)
                </span>
              </div>

              {/* 搜索框与工具按钮 */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 快捷搜索 */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="按课题、教师搜索..."
                    className="pl-8 pr-3 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#07c160] w-36 sm:w-44 text-gray-700"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* 视图切换：列表 / 网格 */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewLayout("list")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      viewLayout === "list"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="简洁列表视图"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewLayout("grid")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      viewLayout === "grid"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="卡片视图"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowTree(!showTree)}
                  className="px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FolderTree className="w-3.5 h-3.5 text-gray-400" />
                  <span>{showTree ? "收起" : "目录"}</span>
                </button>

                <button
                  onClick={fetchCases}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-500 transition-colors cursor-pointer"
                  title="刷新数据"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <UploadZone onSuccess={handleUploadSuccess} compact={true} />
              </div>
            </div>

            {/* 学段年级分类筛选 Chips：全部、小学年级、初中年级、高中年级 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 text-xs shrink-0 mr-0.5">学段：</span>
              
              <button
                onClick={() => setSelectedGradeStage("all")}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGradeStage === "all"
                    ? "bg-[#e8f8f0] text-[#06ad56] font-semibold border border-[#d1f2e1]"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                全部 ({stageCounts.all})
              </button>

              <button
                onClick={() => setSelectedGradeStage("primary")}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGradeStage === "primary"
                    ? "bg-[#e8f8f0] text-[#06ad56] font-semibold border border-[#d1f2e1]"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                小学年级 ({stageCounts.primary})
              </button>

              <button
                onClick={() => setSelectedGradeStage("middle")}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGradeStage === "middle"
                    ? "bg-[#e8f8f0] text-[#06ad56] font-semibold border border-[#d1f2e1]"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                初中年级 ({stageCounts.middle})
              </button>

              <button
                onClick={() => setSelectedGradeStage("high")}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGradeStage === "high"
                    ? "bg-[#e8f8f0] text-[#06ad56] font-semibold border border-[#d1f2e1]"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                高中年级 ({stageCounts.high})
              </button>
            </div>

            {showTree && data?.folderStructure && (
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                <StructureTree tree={data.folderStructure} />
              </div>
            )}

            {/* 课例列表 / 网格渲染 */}
            {filteredCases.length > 0 ? (
              viewLayout === "list" ? (
                <div className="space-y-2">
                  {filteredCases.map((cg, idx) => (
                    <CaseListItem
                      key={cg.id || idx}
                      caseGroup={cg}
                      index={idx}
                      onSelect={(selected) => setSelectedCase(selected)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCases.map((cg, idx) => (
                    <CaseCard
                      key={cg.id || idx}
                      caseGroup={cg}
                      index={idx}
                      onSelect={(selected) => setSelectedCase(selected)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-400 space-y-2">
                <p>未找到匹配的课例</p>
                {(selectedGradeStage !== "all" || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedGradeStage("all");
                      setSearchQuery("");
                    }}
                    className="text-[#07c160] hover:underline cursor-pointer"
                  >
                    清除所有筛选条件
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 弹窗查看案例完整原文与结构化信息 */}
      <CaseModal caseGroup={selectedCase} onClose={() => setSelectedCase(null)} />

      {/* Cloud SQL 工业级关系型知识库视窗 */}
      <KnowledgeBaseModal isOpen={showKnowledgeModal} onClose={() => setShowKnowledgeModal(false)} />
    </div>
  );
}
