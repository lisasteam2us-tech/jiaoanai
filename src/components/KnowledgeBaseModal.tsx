import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  BookOpen,
  AlertTriangle,
  Layers,
  History,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Server
} from "lucide-react";

interface KnowledgeStats {
  standardsCount: number;
  textbookNodesCount: number;
  misconceptionsCount: number;
  scaffoldsCount: number;
  diagnosesCount: number;
}

interface DiagnosisRecord {
  id: string;
  lessonTitle: string;
  subject: string;
  gradeStage: string;
  score: number | null;
  createdAt: string;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "diagnoses" | "query">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      }
      const diagRes = await fetch("/api/knowledge/recent-diagnoses");
      if (diagRes.ok) {
        const diagJson = await diagRes.json();
        if (diagJson.success && diagJson.data) {
          setDiagnoses(diagJson.data);
        }
      }
    } catch (err) {
      console.error("加载知识库统计失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/knowledge/query?title=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data);
        }
      }
    } catch (err) {
      console.error("知识库检索失败:", err);
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* 模态框顶栏 */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#07c160] flex items-center justify-center border border-emerald-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">Cloud SQL (PostgreSQL) 知识库</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/80 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07c160] animate-pulse"></span>
                    已连接
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  面向全国数百万教师教案诊断的高性能标准 SQL 关系型知识底座
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="刷新统计"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#07c160]" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 选项卡栏 */}
          <div className="px-6 pt-3 border-b border-gray-100 flex gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "border-[#07c160] text-[#07c160] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>知识库资产概览</span>
            </button>
            <button
              onClick={() => setActiveTab("query")}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "query"
                  ? "border-[#07c160] text-[#07c160] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>知识资产实时检索</span>
            </button>
            <button
              onClick={() => setActiveTab("diagnoses")}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "diagnoses"
                  ? "border-[#07c160] text-[#07c160] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>历史诊断存库记录</span>
              {diagnoses.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {diagnoses.length}
                </span>
              )}
            </button>
          </div>

          {/* 内容展示区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 核心指标卡片 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>国家新课标指标</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats ? stats.standardsCount : "..."}
                      <span className="text-xs font-normal text-slate-400 ml-1">条标准</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">覆盖学科大观念与学业质量基线</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>权威教材知识节点</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats ? stats.textbookNodesCount : "..."}
                      <span className="text-xs font-normal text-slate-400 ml-1">个节点</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">人教/部编等主流版本课标图谱</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>学生认知障碍归因</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats ? stats.misconceptionsCount : "..."}
                      <span className="text-xs font-normal text-slate-400 ml-1">类误区</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">实证考评盲区与根因逆向诊断</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>特级名师支架与量规</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats ? stats.scaffoldsCount : "..."}
                      <span className="text-xs font-normal text-slate-400 ml-1">套脚手架</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">三区板书拓扑与三档表现性量规</p>
                  </div>
                </div>

                {/* 架构与规范说明 */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs space-y-2">
                  <div className="font-semibold text-emerald-950 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>工业级 SQL 关系型数据库模型架构</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    已通过 Drizzle ORM 在 Google Cloud SQL（PostgreSQL）中构建了高并发教案诊断关系模型，包括
                    <code className="mx-1 px-1 bg-white rounded border border-emerald-200">curriculum_standards</code>、
                    <code className="mx-1 px-1 bg-white rounded border border-emerald-200">textbook_knowledge_nodes</code>、
                    <code className="mx-1 px-1 bg-white rounded border border-emerald-200">student_misconceptions</code>、
                    <code className="mx-1 px-1 bg-white rounded border border-emerald-200">teaching_scaffolds</code> 以及
                    <code className="mx-1 px-1 bg-white rounded border border-emerald-200">lesson_diagnoses</code>。
                    支持为全中国一线教师提供高并发毫秒级检索、逆向诊断与方案存盘。
                  </p>
                </div>
              </div>
            )}

            {activeTab === "query" && (
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="输入知识点或课题（例如：平行四边形、摩擦力、太阳高度角、赤壁赋）"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#07c160]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {searching ? "检索中..." : "检索知识库"}
                  </button>
                </form>

                {searchResults ? (
                  <div className="space-y-4 mt-4 text-xs">
                    {/* 课标条目 */}
                    {searchResults.standards?.length > 0 && (
                      <div className="border border-gray-100 rounded-xl p-3 bg-slate-50/50">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          匹配课标指标 ({searchResults.standards.length})
                        </h4>
                        <div className="space-y-2">
                          {searchResults.standards.map((s: any) => (
                            <div key={s.id} className="p-2.5 bg-white rounded-lg border border-gray-100">
                              <div className="font-semibold text-gray-800">{s.subject} · {s.stage}</div>
                              <div className="text-gray-600 mt-1"><span className="font-medium text-gray-700">学科大观念：</span>{s.bigIdeas}</div>
                              <div className="text-gray-600 mt-0.5"><span className="font-medium text-gray-700">学业质量标准：</span>{s.qualityStandards}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 典型易错点 */}
                    {searchResults.misconceptions?.length > 0 && (
                      <div className="border border-gray-100 rounded-xl p-3 bg-slate-50/50">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          学生易错盲区与突破支架 ({searchResults.misconceptions.length})
                        </h4>
                        <div className="space-y-2">
                          {searchResults.misconceptions.map((m: any) => (
                            <div key={m.id} className="p-2.5 bg-white rounded-lg border border-gray-100">
                              <div className="font-semibold text-gray-800">{m.misconceptionTitle}</div>
                              <div className="text-amber-700 mt-1"><span className="font-medium">典型症状：</span>{m.typicalSymptom}</div>
                              <div className="text-gray-600 mt-0.5"><span className="font-medium text-gray-700">根因归因：</span>{m.rootCause}</div>
                              <div className="text-emerald-700 mt-0.5"><span className="font-medium">突破策略：</span>{m.interventionStrategy}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 名师支架 */}
                    {searchResults.scaffolds?.length > 0 && (
                      <div className="border border-gray-100 rounded-xl p-3 bg-slate-50/50">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          特级名师板书与评价量规 ({searchResults.scaffolds.length})
                        </h4>
                        <div className="space-y-2">
                          {searchResults.scaffolds.map((sc: any) => (
                            <div key={sc.id} className="p-2.5 bg-white rounded-lg border border-gray-100">
                              <div className="font-semibold text-gray-800">{sc.title} ({sc.scaffoldType})</div>
                              <div className="text-gray-600 mt-1 whitespace-pre-wrap">{sc.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    输入关键词实时查询 Cloud SQL 关系型数据库底层储存的知识元数据
                  </div>
                )}
              </div>
            )}

            {activeTab === "diagnoses" && (
              <div className="space-y-3">
                {diagnoses.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    暂无诊断记录。在工作台中提交教案后，系统将自动持久化存入 Cloud SQL。
                  </div>
                ) : (
                  diagnoses.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{d.lessonTitle}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                          <span>{d.subject}</span>
                          <span>•</span>
                          <span>{d.gradeStage}</span>
                          <span>•</span>
                          <span>{new Date(d.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.score && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                            {d.score}分
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">已存入 SQL</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 模态框底部 */}
          <div className="px-6 py-3 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-gray-400" />
              <span>Cloud SQL · PostgreSQL · Drizzle ORM</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              关闭
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
