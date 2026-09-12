import React, { useState } from "react";
import { CaseGroup, CaseDocument } from "../types";
import { EnhancedPlanView } from "./EnhancedPlanView";
import {
  X,
  Copy,
  Check,
  User,
  GraduationCap,
  TrendingUp,
  Sparkles,
  BookOpen,
  Layers,
  Target,
  CheckCircle2,
  SplitSquareVertical,
  ImageIcon,
  Maximize2,
  FileText,
  Layout,
  Clock
} from "lucide-react";

interface CaseModalProps {
  caseGroup: CaseGroup | null;
  onClose: () => void;
}

export const CaseModal: React.FC<CaseModalProps> = ({ caseGroup, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"enhanced" | "compare" | "split" | "input" | "output">("enhanced");
  const [viewMode, setViewMode] = useState<"rich" | "raw">("rich");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!caseGroup) return null;

  const comparison = caseGroup.comparison;
  const inputDoc: CaseDocument | undefined = caseGroup.inputFile || caseGroup.files.find(f => f.docType === "input") || caseGroup.files[0];
  const outputDoc: CaseDocument | undefined = caseGroup.outputFile || caseGroup.files.find(f => f.docType === "output") || caseGroup.files[1] || caseGroup.files[0];

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const currentDoc = activeTab === "input" ? inputDoc : outputDoc;
  const currentImages = currentDoc?.images || [];
  const allImages = [...(inputDoc?.images || []), ...(outputDoc?.images || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="case-modal-container"
        className="bg-white rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* 头部信息 */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-xs font-mono">
              {caseGroup.folderName}
            </span>
            <h2 className="text-base font-bold text-gray-900 truncate max-w-xl">{caseGroup.title}</h2>
            <span className="hidden sm:inline-flex text-gray-500 text-xs items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {comparison?.teacherName || "原案教师"}
            </span>
            {allImages.length > 0 && (
              <span className="hidden sm:inline-flex text-xs text-[#06ad56] bg-[#f0faf4] px-2 py-0.5 rounded border border-[#d1f2e1]">
                {allImages.length} 图
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 视图切换导航与操作条 */}
        <div className="px-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("enhanced")}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "enhanced"
                  ? "border-[#07c160] text-[#06ad56] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#07c160]" />
              <span>40分钟重构方案</span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "compare"
                  ? "border-[#07c160] text-[#06ad56] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>对比分析</span>
            </button>

            <button
              onClick={() => setActiveTab("split")}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "split"
                  ? "border-[#07c160] text-[#06ad56] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>双屏对照</span>
            </button>

            <button
              onClick={() => setActiveTab("input")}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "input"
                  ? "border-[#07c160] text-[#06ad56] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>初稿 ({inputDoc?.wordCount?.toLocaleString() || 0}字)</span>
            </button>

            <button
              onClick={() => setActiveTab("output")}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "output"
                  ? "border-[#07c160] text-[#06ad56] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>旧版输出 ({outputDoc?.wordCount?.toLocaleString() || 0}字)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            {/* 排版模式切换 */}
            {(activeTab === "input" || activeTab === "output" || activeTab === "split") && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode("rich")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === "rich"
                      ? "bg-white text-[#06ad56] shadow-xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="原版图文排版"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>图文</span>
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === "raw"
                      ? "bg-white text-[#06ad56] shadow-xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="纯文本阅读模式"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>纯文本</span>
                </button>
              </div>
            )}

            {activeTab === "input" && (
              <button
                onClick={() => handleCopy(inputDoc?.extractedText || "", "input")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
              >
                {copiedType === "input" ? <Check className="w-3.5 h-3.5 text-[#07c160]" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedType === "input" ? "已复制" : "复制初稿"}</span>
              </button>
            )}

            {activeTab === "output" && (
              <button
                onClick={() => handleCopy(outputDoc?.extractedText || "", "output")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f0faf4] hover:bg-[#e1f5ec] text-[#06ad56] text-xs font-medium transition-colors cursor-pointer border border-[#d1f2e1]"
              >
                {copiedType === "output" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === "output" ? "已复制" : "复制输出"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 内容展示区 */}
        {activeTab === "enhanced" && caseGroup.enhancedPlan ? (
          <div className="flex-1 overflow-hidden">
            <EnhancedPlanView plan={caseGroup.enhancedPlan} caseId={caseGroup.folderName} />
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
            {/* TAB 1: 结构化深度对比 */}
            {activeTab === "compare" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              {/* 双文档概况 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 输入文档概况 */}
                <div className="p-4.5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                      初稿原件
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {inputDoc?.wordCount?.toLocaleString() || 0} 字
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm truncate" title={inputDoc?.name}>
                    {inputDoc?.name}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {comparison?.inputCharacteristics || "教师提交的初稿材料。"}
                  </p>
                  {inputDoc?.images && inputDoc.images.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>含 {inputDoc.images.length} 张插图</span>
                    </div>
                  )}
                </div>

                {/* 输出文档概况 */}
                <div className="p-4.5 rounded-xl bg-white border border-[#d1f2e1] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#f0faf4] text-[#06ad56]">
                      重构方案
                    </span>
                    <span className="text-xs font-mono font-bold text-[#06ad56]">
                      {outputDoc?.wordCount?.toLocaleString() || 0} 字 ({comparison?.expansionRatio || "10+"}x)
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm truncate" title={outputDoc?.name}>
                    {outputDoc?.name}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {comparison?.outputImprovements || "重构输出的规范大单元教学方案。"}
                  </p>
                  {outputDoc?.images && outputDoc.images.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <ImageIcon className="w-3.5 h-3.5 text-[#07c160]" />
                      <span>含 {outputDoc.images.length} 个图表/素材</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 图像素材快速浏览区 */}
              {allImages.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      已完整提取文档原始图标与插图（共 {allImages.length} 个）
                    </div>
                    <span className="text-xs text-slate-400">点击可查看高清原图</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                    {allImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(imgUrl)}
                        className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-video flex items-center justify-center p-1.5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
                      >
                        <img
                          src={imgUrl}
                          alt={`素材 ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>放大</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 维度 1: 教学目标进化 */}
              {comparison && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <Target className="w-4 h-4 text-rose-500" />
                    维度一：教学目标与素养立意进化
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-semibold text-slate-500">原教案教学目标：</div>
                      <p className="text-slate-700 leading-relaxed">
                        {comparison.teachingGoalsEvolution.original}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                      <div className="font-semibold text-indigo-800">重构后新课标核心素养目标：</div>
                      <p className="text-indigo-950 leading-relaxed font-medium">
                        {comparison.teachingGoalsEvolution.reconstructed}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 维度 2: 任务与情境创设进化 */}
              {comparison && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    维度二：大情境创设与学习任务群进阶
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    {comparison.taskDesignEvolution}
                  </p>
                </div>
              )}

              {/* 维度 3: 课后作业与评价演进 */}
              {comparison && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    维度三：三层分层作业与表现性评价升级
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    {comparison.homeworkEvolution}
                  </p>
                </div>
              )}

              {/* 维度 4: AI教研员讲评导向 */}
              {comparison && (
                <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-xs space-y-2 bg-gradient-to-br from-indigo-50/40 to-white">
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    AI教研员（{comparison.aiEvaluator}）专业讲评聚焦：
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    “{comparison.critiqueFocus}”
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 左右分屏对比 (Split View) */}
          {activeTab === "split" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* 左边：输入文档 */}
              <div className="flex flex-col rounded-xl border border-sky-200 bg-white overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-100 flex items-center justify-between text-xs font-semibold text-sky-900">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                    <span className="truncate">输入原案：{inputDoc?.name}</span>
                  </div>
                  <span className="font-mono text-sky-700 shrink-0">{inputDoc?.wordCount?.toLocaleString()} 字</span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 text-xs text-slate-800 leading-relaxed select-text bg-white">
                  {viewMode === "rich" && inputDoc?.htmlContent ? (
                    <div
                      className="case-html-body prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: inputDoc.htmlContent }}
                    />
                  ) : (
                    <div className="font-mono whitespace-pre-wrap">
                      {inputDoc?.extractedText || "无输入正文"}
                    </div>
                  )}
                </div>
              </div>

              {/* 右边：输出文档 */}
              <div className="flex flex-col rounded-xl border border-indigo-200 bg-white overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                    <span className="truncate">输出终稿：{outputDoc?.name}</span>
                  </div>
                  <span className="font-mono text-indigo-700 font-bold shrink-0">{outputDoc?.wordCount?.toLocaleString()} 字</span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 text-xs text-slate-800 leading-relaxed select-text bg-white">
                  {viewMode === "rich" && outputDoc?.htmlContent ? (
                    <div
                      className="case-html-body prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: outputDoc.htmlContent }}
                    />
                  ) : (
                    <div className="font-mono whitespace-pre-wrap">
                      {outputDoc?.extractedText || "无输出正文"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 单独查看输入文档全文 */}
          {activeTab === "input" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 text-xs gap-2">
                <div className="font-mono text-slate-500 truncate">
                  文件路径: {inputDoc?.originalPath}
                </div>
                <div className="font-mono text-slate-600 flex items-center gap-3">
                  <span>字符数: <strong className="text-slate-800">{inputDoc?.wordCount?.toLocaleString()}</strong></span>
                  {currentImages.length > 0 && (
                    <span className="text-sky-600 font-medium">包含插图: {currentImages.length} 处</span>
                  )}
                </div>
              </div>

              {/* 该文档特有的图片画廊 */}
              {currentImages.length > 0 && (
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-2">
                  <div className="text-xs font-semibold text-sky-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>本篇输入文档包含的插图素材 ({currentImages.length} 个):</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {currentImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(imgUrl)}
                        className="h-20 w-28 shrink-0 rounded-lg border border-sky-200 bg-white p-1 flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
                      >
                        <img src={imgUrl} alt={`插图 ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 正文区域 */}
              {viewMode === "rich" && inputDoc?.htmlContent ? (
                <div
                  className="case-html-body prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: inputDoc.htmlContent }}
                />
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap select-text font-sans">
                  {inputDoc?.extractedText}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 单独查看输出文档全文 */}
          {activeTab === "output" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 text-xs gap-2">
                <div className="font-mono text-slate-500 truncate">
                  文件路径: {outputDoc?.originalPath}
                </div>
                <div className="font-mono flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">
                    字符数: {outputDoc?.wordCount?.toLocaleString()}
                  </span>
                  {currentImages.length > 0 && (
                    <span className="text-emerald-600 font-medium">提取图标/徽标: {currentImages.length} 个</span>
                  )}
                </div>
              </div>

              {/* 输出终稿包含的图标与素材画廊 */}
              {currentImages.length > 0 && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                  <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>本篇输出终稿提取的图标与可视化素材 ({currentImages.length} 个):</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {currentImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(imgUrl)}
                        className="h-20 w-28 shrink-0 rounded-lg border border-indigo-200 bg-white p-1 flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
                      >
                        <img src={imgUrl} alt={`图标素材 ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 正文区域 */}
              {viewMode === "rich" && outputDoc?.htmlContent ? (
                <div
                  className="case-html-body prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: outputDoc.htmlContent }}
                />
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap select-text font-sans">
                  {outputDoc?.extractedText}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* 图片全屏放大预览 Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-mono text-slate-500 truncate max-w-md">{previewImage}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto flex items-center justify-center max-h-[75vh]">
              <img
                src={previewImage}
                alt="预览大图"
                className="max-h-[70vh] max-w-full rounded-lg shadow-xs object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
