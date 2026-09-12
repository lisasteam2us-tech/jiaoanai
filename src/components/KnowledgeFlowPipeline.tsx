import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSearch,
  BookOpen,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  X
} from "lucide-react";

interface KnowledgeFlowPipelineProps {
  elapsedSeconds: number;
  fileNameHint?: string;
  wordCount?: number;
  onCancel?: () => void;
}

interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  sourceLayer: string;
  authority: string;
  icon: React.ElementType;
  brief: string;
  targetBadge: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: "原案特征解析与学段对齐",
    subtitle: "教学要素解析与结构化向量编码",
    sourceLayer: "第 1 层：输入解析",
    authority: "教案时空分布与要素完整性标准",
    icon: FileSearch,
    brief: "正在解析教学设计时序骨架，提取课题、学段及核心教学要素分布",
    targetBadge: "原案要素解构"
  },
  {
    id: 2,
    title: "教育部 2022 新课标素养召回",
    subtitle: "14 学科法定大观念与学业质量基线",
    sourceLayer: "第 2 层：课标基准",
    authority: "教育部《义务教育课程标准（2022年版）》",
    icon: BookOpen,
    brief: "正在检索教育部新课标核心素养图谱，校准官方学业质量标准与大观念",
    targetBadge: "法定素养基准"
  },
  {
    id: 3,
    title: "考评真题与学情易错逆向审计",
    subtitle: "省市教研质量报告与典型认知断层",
    sourceLayer: "第 3 层：实证学情",
    authority: "省市教研室历年质量考评分析与中考错题库",
    icon: AlertTriangle,
    brief: "正在比对历年中考错解归因，前置排查课堂伪懂假掌握与认知卡点",
    targetBadge: "易错学情诊断"
  },
  {
    id: 4,
    title: "40 分钟施工图与问题链重塑",
    subtitle: "国家智慧教育平台部级优课实录时序",
    sourceLayer: "第 4 层：课例切片",
    authority: "国家中小学智慧教育平台精品课切片库",
    icon: Clock,
    brief: "正在排布 5+15+10+6+4 课堂节奏，配置名师递进问题链与救急微支架",
    targetBadge: "40分钟施工图"
  },
  {
    id: 5,
    title: "表现性量规与板书拓扑交付",
    subtitle: "华东师大崔允漷学历案与教-学-评一致性",
    sourceLayer: "第 5 层：评价交付",
    authority: "华东师大学历案量规规范 & UbD 逆向设计",
    icon: ClipboardCheck,
    brief: "正在构建左中右三区物理板书设计，输出三档表现性量规与随堂任务单",
    targetBadge: "学历案三档量规"
  }
];

export const KnowledgeFlowPipeline: React.FC<KnowledgeFlowPipelineProps> = ({
  elapsedSeconds,
  fileNameHint,
  wordCount = 0,
  onCancel
}) => {
  // 根据耗时推导当前流转步骤
  const getActiveStepIndex = (sec: number): number => {
    if (sec < 1.4) return 0;
    if (sec < 3.2) return 1;
    if (sec < 5.0) return 2;
    if (sec < 6.8) return 3;
    return 4;
  };

  const activeIndex = getActiveStepIndex(elapsedSeconds);
  const currentStep = PIPELINE_STEPS[activeIndex] || PIPELINE_STEPS[4];
  const StepIcon = currentStep.icon;

  return (
    <div
      id="knowledge-flow-pipeline-container"
      className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-7 overflow-hidden space-y-6"
    >
      {/* 顶部微光流动背景纹理（大气极简） */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-32 bg-gradient-to-b from-emerald-500/8 to-transparent blur-2xl pointer-events-none" />

      {/* 1. 顶部 Header：极简专业标题与控制 */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#07c160] to-emerald-400 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                2022 课标知识库实时流转推演
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#07c160] animate-pulse" />
                真实知识图谱召回中
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <span>教育部新课标基座</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>中考考评实证学情</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>华东师大表现性量规</span>
            </p>
          </div>
        </div>

        {/* 计时与取消 */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-xs font-mono text-slate-600">
            耗时 {elapsedSeconds}s
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="取消本次推演"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 极简大气光流连线轨道 (Minimalist Luminous Rail) */}
      <div className="relative z-10">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
          {/* 底层连接导轨 */}
          <div className="absolute left-7 right-7 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 rounded-full" />

          {/* 动态推进的极光导轨 */}
          <motion.div
            className="absolute left-7 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-[#07c160] rounded-full shadow-[0_0_8px_rgba(7,193,96,0.5)]"
            initial={{ width: "0%" }}
            animate={{
              width: `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 100}%`
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* 5 个极简圆形节点 */}
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#07c160] text-white shadow-sm"
                      : isCurrent
                      ? "bg-white border-2 border-[#07c160] text-[#07c160] shadow-[0_0_12px_rgba(7,193,96,0.3)]"
                      : "bg-white border border-slate-200 text-slate-400"
                  }`}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>0{step.id}</span>
                  )}
                </motion.div>

                {/* 节点微标文案 */}
                <span
                  className={`text-[11px] font-medium mt-2 transition-colors whitespace-nowrap hidden sm:block ${
                    isCurrent
                      ? "text-slate-900 font-semibold"
                      : isCompleted
                      ? "text-emerald-700"
                      : "text-slate-400"
                  }`}
                >
                  {step.targetBadge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 核心动态流体展台 (Sleek Morphing Card) */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl bg-gradient-to-b from-slate-50/70 to-slate-50/30 border border-slate-200/70 p-4 sm:p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* 左侧：动态几何光环与标题 */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center shrink-0">
                  <StepIcon className="w-6 h-6 text-[#07c160]" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#07c160] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#07c160]" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#07c160] uppercase tracking-wider">
                      {currentStep.sourceLayer}
                    </span>
                    <span className="text-slate-300">·</span>
                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                      {currentStep.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {currentStep.brief}
                  </p>
                </div>
              </div>

              {/* 右侧：权威来源印章徽标 */}
              <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-medium">权威知识库出处</div>
                  <div className="text-xs font-semibold text-slate-800 tracking-tight">
                    {currentStep.authority}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部元数据流动条 */}
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>处理对象：{fileNameHint || "用户录入备课文稿"}</span>
                {wordCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/60 text-[11px] font-mono">
                    {wordCount} 字
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>精准语义向量对齐中</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. 底部微光进度条 */}
      <div className="relative z-10 space-y-1.5">
        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#07c160]"
            initial={{ width: "15%" }}
            animate={{
              width: `${Math.min(98, Math.round(20 + elapsedSeconds * 8))}%`
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <span>全链路真实知识库挂载：课标图谱 → 学情审计 → 施工图 → 表现性量规</span>
          <span>特级方案即刻呈现</span>
        </div>
      </div>
    </div>
  );
};
