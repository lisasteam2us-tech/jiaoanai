import React, { useState, useRef } from "react";
import { UploadCloud, FileArchive, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { InspectionResult } from "../types";

interface UploadZoneProps {
  onSuccess: (data: InspectionResult) => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onSuccess, compact = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("正在上传并解压案例文件...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    setProgressText("正在上传文件并解析...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgressText("正在解压缩到根目录 cases_archive/ 并保持目录结构...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "上传与解压失败");
      }

      setProgressText("正在逐个审阅提取10个案例文档内容...");
      const json = await res.json();
      if (json.success && json.data) {
        onSuccess(json.data);
      } else {
        throw new Error(json.error || "未收到有效数据");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "上传处理发生错误，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".zip,.docx,.doc"
          className="hidden"
          id="compact-upload-input"
        />
        <button
          id="btn-reupload-zip"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>处理中...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>上传新的案例包 (.zip)</span>
            </>
          )}
        </button>
        {errorMsg && (
          <span className="text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6">
      <div
        id="zip-dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 bg-white"
        } shadow-sm`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".zip,.docx,.doc"
          className="hidden"
          id="zip-upload-input"
        />

        {isUploading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-800">{progressText}</h3>
              <p className="text-xs text-slate-500">
                系统正在自动执行：清理冗余分叉文件 → 保持原始层级规整解压 → 深度抽取审阅各案例要点
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <FileArchive className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">
                点击选择或将案例压缩包 (.zip) 拖拽至此处
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                支持直接上传您包含 10 个案例的 <span className="font-semibold text-indigo-600">.zip</span> 压缩文件（或单独 docx 文档）
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span>选择文件上传</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                统一解压保存至根目录 cases_archive/
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                严格保留原本子目录架构
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                智能提取并深度审阅分析全部案例
              </span>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
