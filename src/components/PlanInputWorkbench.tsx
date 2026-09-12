import React, { useState, useRef, useEffect } from "react";
import { EnhancedTeachingPlan } from "../types";
import { exportTeachingPlanToDocx, DocxFontStyle, FONT_THEMES } from "../utils/docxExporter";
import { KnowledgeFlowPipeline } from "./KnowledgeFlowPipeline";
import {
  FileText,
  UploadCloud,
  Sparkles,
  Loader2,
  FileDown,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ClipboardPaste,
  HelpCircle,
  RefreshCw,
  XCircle,
  FileWarning
} from "lucide-react";

interface PlanInputWorkbenchProps {
  onPlanAnalyzed: (plan: EnhancedTeachingPlan) => void;
}

export type AnalysisRequestStage = "idle" | "uploading" | "analyzing" | "success" | "error";

export interface AnalysisErrorInfo {
  title: string;
  message: string;
  suggestion?: string;
  technicalDetails?: string;
}

export const PlanInputWorkbench: React.FC<PlanInputWorkbenchProps> = ({ onPlanAnalyzed }) => {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  // 完善的状态机状态管理
  const [requestStage, setRequestStage] = useState<AnalysisRequestStage>("idle");
  const [stageProgressText, setStageProgressText] = useState("");
  const [detailedError, setDetailedError] = useState<AnalysisErrorInfo | null>(null);
  const [successPlan, setSuccessPlan] = useState<EnhancedTeachingPlan | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);

  // 组件卸载时清理所有正在进行的请求和防抖定时器
  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  const isAnalyzing = requestStage === "uploading" || requestStage === "analyzing";

  // 预置范例
  const samplePlans = [
    {
      title: "小学数学《平行四边形的面积》",
      text: `《平行四边形的面积》教学设计
一、教学目标：
1. 掌握平行四边形的面积公式，能正确计算面积。
2. 通过剪拼操作，体会转化的数学思想，发展空间观念。
3. 解决生活中的实际面积问题，体会数学的价值。
二、教学重难点：
重点：掌握平行四边形面积计算公式并能应用。
难点：理解转化推导过程，明确转化前后底和高与长宽的对应关系。
三、教学过程：
1. 复习长方形面积公式导入。
2. 提出问题：怎么计算校门口平行四边形花坛的面积？能不能数方格？
3. 动手操作：剪一剪、拼一拼，把平行四边形沿着高剪开拼成长方形。
4. 得出公式：平行四边形面积 = 底 × 高。
5. 课堂练习：做教材第89页做一做。
6. 总结布置作业。`
    },
    {
      title: "初中语文《从百草园到三味书屋》",
      text: `《从百草园到三味书屋》教学设计
一、教学目标
1. 学习按空间顺序写景的方法，品味生动传神的语言。
2. 抓住“不必说...也不必说...单是...”句式体悟儿童视角。
3. 对比百草园的自由快乐与三味书屋的枯燥，理解鲁迅对童年生活的眷恋。
二、教学过程
1. 导入鲁迅童年故事。
2. 朗读第二自然段，标出描写了哪些景物，动词是什么。
3. 小组讨论：雪地捕鸟的九个动词好在哪里？
4. 分析三味书屋读书情景与先生形象。
5. 仿写练习：写一段童年景物。`
    },
    {
      title: "初中物理《牛顿第一定律》",
      text: `《牛顿第一定律》教学设计
一、教学目标：
1. 知道牛顿第一定律的内容，领会实验加理想推理的科学方法。
2. 理解力不是维持物体运动的原因，而是改变物体运动状态的原因。
3. 认识惯性现象，并能解释生活中的惯性事例。
二、教学过程：
1. 亚里士多德与伽利略关于运动和力的观点争论导入。
2. 阻力对物体运动影响的演示实验（毛巾、棉布、木板斜面小车）。
3. 科学推论：若表面绝对光滑，小车将怎样运动？
4. 得出牛顿第一定律。
5. 认识惯性及安全带、刹车现象。`
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDetailedError(null);
      if (requestStage === "error") {
        setRequestStage("idle");
      }
    }
  };

  /**
   * 核心执行函数：带 AbortController 取消前序请求、防并发冲突与细粒度错误分流归因
   */
  const executeAnalysis = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput && !selectedFile) {
      setDetailedError({
        title: "未检测到教案内容",
        message: "请在输入框中粘贴教案文本，或上传 .docx / .doc / .txt 格式的教案文件。",
        suggestion: "您可以点击上方的“试试范例”快速体验平行四边形或牛顿第一定律等课例。"
      });
      setRequestStage("error");
      return;
    }

    // 1. 若已有请求正在进行，先行取消前序请求，杜绝竞态与重复响应
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    // 2. 初始化请求状态
    setRequestStage(selectedFile ? "uploading" : "analyzing");
    setStageProgressText(selectedFile ? "正在上传教案文件并提取文本..." : "正在抽取教案结构与学科核心素养...");
    setDetailedError(null);
    setSuccessPlan(null);
    setElapsedSeconds(0);

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }
    const startTime = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed >= 12) {
        setStageProgressText("特级教研引擎多维交叉校验中，即将完成落地输出...");
      } else if (elapsed >= 8) {
        setStageProgressText("正在构建结构化板书设计与随堂任务单量规...");
      } else if (elapsed >= 4) {
        setStageProgressText("正在细化40分钟实操施工图，配置师生问答与救急支架...");
      } else if (elapsed >= 2) {
        setStageProgressText("正在进行学情逆向审计，研判认知断点与易错陷阱...");
      }
    }, 1000);

    try {
      let fetchOptions: RequestInit;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (trimmedInput) {
          formData.append("lessonPlanText", trimmedInput);
        }
        fetchOptions = {
          method: "POST",
          body: formData,
          signal: abortController.signal
        };
      } else {
        fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            lessonPlanText: trimmedInput
          }),
          signal: abortController.signal
        };
      }

      const res = await fetch("/api/analyze-plan", fetchOptions);

      const contentType = res.headers.get("content-type") || "";
      const rawText = await res.text();

      // 针对 HTTP 异常状态码进行明确归因分类
      if (!res.ok) {
        let errTitle = "教案诊断服务响应异常";
        let errMessage = `服务端返回状态码 HTTP ${res.status}`;
        let suggestion = "请检查网络连接后重试。";

        try {
          const errJson = JSON.parse(rawText);
          if (errJson.error) {
            errMessage = errJson.error;
          }
        } catch {
          // 非 JSON 返回，根据状态码细分
          if (res.status === 413) {
            errTitle = "教案文件过大";
            errMessage = "上传的文档大小超过了系统限制（最大允许200MB）。";
            suggestion = "请去除文档中不必要的大图或精简内容后重试。";
          } else if (res.status === 504 || rawText.includes("504") || rawText.includes("Time-out")) {
            errTitle = "云端解析超时";
            errMessage = "AI诊断推演耗时较长导致网关超时。";
            suggestion = "您可以再次点击“重新解析”，系统将使用极速重构管道秒级出具报告。";
          } else if (res.status === 502 || res.status === 503) {
            errTitle = "服务暂时繁忙";
            errMessage = "云端模型节点正处于高并发调度中。";
            suggestion = "请稍候数秒后点击“一键重试”。";
          } else if (rawText.includes("MulterError") || rawText.includes("Unexpected field")) {
            errTitle = "文件上传解析异常";
            errMessage = "表单多部件流异常，浏览器未能规范封装文件。";
            suggestion = "建议重新选择文件上传，或切换为“粘贴教案文本”模式直接输入。";
          }
        }

        if (res.status === 400) {
          errTitle = "输入内容校验未通过";
          suggestion = "教案有效文字需在10字以上，请补充教学目标、教学过程或环节内容。";
        }

        throw {
          title: errTitle,
          message: errMessage,
          suggestion,
          technicalDetails: `HTTP ${res.status} | Content-Type: ${contentType}`
        };
      }

      // 提取与自愈解析 JSON
      let json: any = null;
      let parseErrDetail = "";
      const cleanedRawText = rawText
        .replace(/^\uFEFF/, "") // 去除 UTF-8 BOM
        .trim();

      // 1. 优先尝试直接标准反序列化
      try {
        json = JSON.parse(cleanedRawText);
      } catch (e1: any) {
        parseErrDetail = e1?.message || "标准解析失败";
        // 2. 尝试修复大模型/文本传输中未转义的反斜杠与控制字符
        try {
          const sanitized = cleanedRawText
            .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
          json = JSON.parse(sanitized);
        } catch (e2: any) {
          parseErrDetail += ` | 转义修复失败: ${e2?.message}`;
          // 3. 尝试从混合文本或带有额外包裹的内容中提取最外层平衡的 JSON 结构
          const firstBrace = cleanedRawText.indexOf("{");
          const lastBrace = cleanedRawText.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            const block = cleanedRawText.slice(firstBrace, lastBrace + 1);
            try {
              json = JSON.parse(block);
            } catch (e3: any) {
              try {
                const sanitizedBlock = block
                  .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
                json = JSON.parse(sanitizedBlock);
              } catch (e4: any) {
                parseErrDetail += ` | 块截取解析失败: ${e4?.message}`;
              }
            }
          }
        }
      }

      if (!json) {
        console.error("[PlanInputWorkbench] JSON解析完全失败:", parseErrDetail, "响应内容预览:", rawText.slice(0, 300));
        const isHtml = cleanedRawText.startsWith("<!DOCTYPE") || cleanedRawText.includes("<html") || cleanedRawText.includes("<body");
        throw {
          title: isHtml ? "服务端网关错误 (HTML 页面)" : "解析结果格式不符合预期",
          message: isHtml 
            ? "网络代理或服务端进程返回了 HTML 页面而非接口数据，请稍后点击重试。" 
            : `服务端数据序列化格式异常（${parseErrDetail.slice(0, 80)}）。`,
          suggestion: "请点击右侧“重试”按钮，系统将自动采用多梯队容灾引擎出具教案。",
          technicalDetails: `长度: ${cleanedRawText.length} 字符 | 前缀: ${cleanedRawText.slice(0, 80)}`
        };
      }

      if (!json.success || !json.data?.plan) {
        throw {
          title: "教案重构生成未完成",
          message: json.error || "未能提取出完整教学设计要素，请确保内容包含课题与教学环节。",
          suggestion: "建议在教案中明确写出课题名称或包含教学过程。"
        };
      }

      const plan: EnhancedTeachingPlan = json.data.plan;
      setRequestStage("success");
      setSuccessPlan(plan);
      onPlanAnalyzed(plan);
    } catch (err: any) {
      // 若是由于前序请求被取消触发的 AbortError，静默忽略，不覆盖新请求的状态
      if (err.name === "AbortError") {
        return;
      }

      setRequestStage("error");
      if (err.title && err.message) {
        setDetailedError(err as AnalysisErrorInfo);
      } else {
        setDetailedError({
          title: "深度解析失败",
          message: err.message || "请求处理异常，请检查网络或文档内容。",
          suggestion: "您可以先尝试使用快捷范例测试，或直接将教案内容复制粘贴到文本框中。"
        });
      }
    } finally {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
      if (activeAbortControllerRef.current === abortController) {
        activeAbortControllerRef.current = null;
      }
    }
  };

  /**
   * 用户主动取消正在进行的诊断，防止长时间等待或挂起
   */
  const handleCancelAnalysis = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    setRequestStage("idle");
    setDetailedError(null);
  };

  /**
   * 防抖触发处理：限制 400ms 内重复点击，防止用户短时间内多次快速敲击导致并发冲突
   */
  const handleStartAnalysisWithDebounce = () => {
    const now = Date.now();
    // 快速硬限制：500ms 内禁止重复触发
    if (now - lastSubmitTimeRef.current < 500) {
      return;
    }
    lastSubmitTimeRef.current = now;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeAnalysis();
    }, 200);
  };

  const [exportFontStyle, setExportFontStyle] = useState<DocxFontStyle>("modern");

  const handleExportSingleDocx = async (overrideStyle?: DocxFontStyle) => {
    if (!successPlan) return;
    const styleToUse = overrideStyle || exportFontStyle;
    try {
      setIsExporting(true);
      await exportTeachingPlanToDocx(successPlan, { fontStyle: styleToUse });
    } catch (err: any) {
      alert("导出 Word 失败: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
      {/* 头部精简标题与范例 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-4 rounded-xs bg-[#07c160] inline-block"></span>
            备课教案深度诊断与重构
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            输入或上传教案初稿，一键生成对标新课标的40分钟教学施工图与表现性评价量规。
          </p>
        </div>

        {/* 快捷范例 */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-xs text-gray-400">快速填入:</span>
          {samplePlans.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAnalyzing}
              onClick={() => {
                setInputMode("text");
                setInputText(sample.text);
                setSelectedFile(null);
                setDetailedError(null);
                setRequestStage("idle");
              }}
              className="px-2.5 py-1 text-xs rounded-md bg-gray-100 hover:bg-[#e8f8f0] hover:text-[#06ad56] disabled:opacity-50 text-gray-700 font-medium transition-colors cursor-pointer"
            >
              {sample.title.split("《")[1]?.replace("》", "") || sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* 切换输入模式 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => {
                setInputMode("text");
                setDetailedError(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              粘贴文本
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => {
                setInputMode("file");
                setDetailedError(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                inputMode === "file"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>上传文件</span>
              {selectedFile && <span className="w-1.5 h-1.5 rounded-full bg-[#07c160]" />}
            </button>
          </div>

          {inputMode === "text" && inputText.length > 0 && (
            <span className="text-xs text-gray-400 font-mono">{inputText.length} 字</span>
          )}
        </div>

        {/* 内容输入区 */}
        {inputMode === "text" ? (
          <textarea
            value={inputText}
            disabled={isAnalyzing}
            onChange={(e) => {
              setInputText(e.target.value);
              if (detailedError) setDetailedError(null);
            }}
            placeholder="在此粘贴教学设计/备课教案初稿（包含课题、教学目标、重难点、主要教学过程等）..."
            rows={8}
            className="w-full text-xs sm:text-sm font-sans text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-[#07c160] focus:border-[#07c160] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 leading-relaxed resize-y disabled:opacity-60"
          />
        ) : (
          <div
            onClick={() => {
              if (!isAnalyzing) fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-xl p-7 flex flex-col items-center justify-center text-center transition-all ${
              isAnalyzing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            } ${
              selectedFile
                ? "border-[#07c160] bg-[#f0faf4]"
                : "border-gray-200 hover:border-[#07c160] bg-gray-50/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              disabled={isAnalyzing}
              accept=".docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-1.5">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#e8f8f0] text-[#07c160] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-gray-800 truncate max-w-[280px]">{selectedFile.name}</p>
                <p className="text-[11px] text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB · 点击更换文件</p>
                {!isAnalyzing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setDetailedError(null);
                    }}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    移除文件
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="w-9 h-9 mx-auto rounded-full bg-white text-gray-400 flex items-center justify-center border border-gray-200 shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-[#07c160]" />
                </div>
                <p className="text-xs font-semibold text-gray-700">点击或将文件拖入此区域</p>
                <p className="text-[11px] text-gray-400">支持 Word (.docx / .doc) 与纯文本 (.txt)</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 结构化清晰的错误提示看板 */}
      {detailedError && (
        <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-gray-800 space-y-2 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-900">{detailedError.title}</h4>
                <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{detailedError.message}</p>
              </div>
            </div>
            <button
              onClick={handleStartAnalysisWithDebounce}
              className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:text-red-900 bg-red-100 rounded-md flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重试</span>
            </button>
          </div>

          {detailedError.suggestion && (
            <div className="text-xs text-gray-600 bg-white/80 p-2 rounded-lg border border-red-100 flex items-start gap-1.5">
              <span className="font-semibold text-gray-800 shrink-0">💡 建议:</span>
              <span className="leading-normal">{detailedError.suggestion}</span>
            </div>
          )}

          {detailedError.technicalDetails && (
            <div className="text-[11px] text-gray-500 bg-red-100/50 px-2 py-1.5 rounded font-mono truncate">
              <span className="font-semibold text-gray-700">诊断信息: </span>
              {detailedError.technicalDetails}
            </div>
          )}
        </div>
      )}

      {/* 真实生动的知识库动态流转与推演可视化 */}
      {isAnalyzing && (
        <KnowledgeFlowPipeline
          elapsedSeconds={elapsedSeconds}
          fileNameHint={selectedFile?.name}
          wordCount={inputText.trim().length}
          onCancel={handleCancelAnalysis}
        />
      )}

      {/* 提交诊断分析动作条 */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-gray-400 hidden sm:block">
          五层知识库赋能：2022课标图谱 · 考评学情审计 · 40分钟施工图 · 评价量规
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAnalyzing && (
            <button
              type="button"
              onClick={handleCancelAnalysis}
              className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-all cursor-pointer"
            >
              取消
            </button>
          )}

          <button
            onClick={handleStartAnalysisWithDebounce}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#07c160] hover:bg-[#06ad56] disabled:opacity-75 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>推演进行中 ({elapsedSeconds}s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>开始深度诊断重构</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 分析完成反馈与一键导出 */}
      {successPlan && requestStage === "success" && (
        <div className="p-4 rounded-xl bg-[#f0faf4] border border-[#d1f2e1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#07c160] shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900">
                《{successPlan.topic}》诊断与重构方案已生成
              </p>
              <p className="text-xs text-gray-500">
                40分钟施工图、学情支架、板书布局与量规已就绪
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
            <select
              value={exportFontStyle}
              onChange={(e) => setExportFontStyle(e.target.value as DocxFontStyle)}
              disabled={isExporting}
              className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-[#07c160]"
              title="选择 Word 导出字体风格"
            >
              <option value="modern">字体：现代教研体（推荐）</option>
              <option value="official">字体：标准公文体（规范）</option>
              <option value="dengxian">字体：新锐等线体（精致）</option>
            </select>

            <button
              onClick={() => handleExportSingleDocx()}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-[#07c160] hover:bg-[#06ad56] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{isExporting ? "导出中..." : "导出 Word"}</span>
            </button>
            <button
              onClick={() => onPlanAnalyzed(successPlan)}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-gray-500" />
              <span>在线审阅</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

