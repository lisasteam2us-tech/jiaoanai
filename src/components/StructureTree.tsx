import React from "react";
import { Folder, FileText, ChevronDown } from "lucide-react";

interface StructureTreeProps {
  tree: any;
}

const TreeNode: React.FC<{ node: any; depth?: number }> = ({ node, depth = 0 }) => {
  if (!node) return null;

  if (node.type === "file") {
    return (
      <div
        className="flex items-center gap-2 py-1 text-xs text-slate-600 hover:text-slate-900 transition-colors font-mono"
        style={{ paddingLeft: `${depth * 18}px` }}
      >
        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate">{node.name}</span>
        {node.size && (
          <span className="text-[10px] text-slate-400">({(node.size / 1024).toFixed(1)} KB)</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div
        className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-800 font-mono"
        style={{ paddingLeft: `${depth * 18}px` }}
      >
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="border-l border-slate-100 ml-2">
          {node.children.map((child: any, idx: number) => (
            <TreeNode key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const StructureTree: React.FC<StructureTreeProps> = ({ tree }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono">
      <div className="text-xs font-bold text-slate-700 pb-2 border-b border-slate-200 mb-2 flex items-center justify-between">
        <span>📁 根目录统一存储路径 (cases_archive/)</span>
        <span className="text-[11px] font-normal text-slate-500">原层级结构已完整保持</span>
      </div>
      <div className="max-h-60 overflow-y-auto pr-2">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};
