import React from "react";
import { CaseGroup } from "../types";
import { ChevronRight, ArrowRight } from "lucide-react";

interface CaseCardProps {
  caseGroup: CaseGroup;
  index: number;
  onSelect: (caseGroup: CaseGroup) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseGroup, index, onSelect }) => {
  const comparison = caseGroup.comparison;
  const inputDoc = caseGroup.inputFile || caseGroup.files.find(f => f.docType === "input") || caseGroup.files[0];
  const outputDoc = caseGroup.outputFile || caseGroup.files.find(f => f.docType === "output") || caseGroup.files[1];

  const ratio = comparison?.expansionRatio || (outputDoc && inputDoc ? (outputDoc.wordCount / Math.max(inputDoc.wordCount, 1)).toFixed(1) : "10+");
  const subjectName = comparison?.subjectGrade?.split(" ")[0] || caseGroup.folderName;

  return (
    <div
      id={`case-card-${index}`}
      onClick={() => onSelect(caseGroup)}
      className="group bg-white border border-gray-200 hover:border-[#07c160] rounded-xl p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-2.5">
        {/* 顶部学段与字数扩充比 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-gray-400">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {subjectName}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#06ad56] bg-[#f0faf4] px-1.5 py-0.5 rounded border border-[#d1f2e1]">
            扩充 {ratio}x
          </span>
        </div>

        {/* 标题 */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#06ad56] transition-colors line-clamp-1">
            {caseGroup.title}
          </h3>
          {comparison?.teacherName && (
            <p className="text-xs text-gray-400 mt-0.5">
              原案执教：{comparison.teacherName}
            </p>
          )}
        </div>

        {/* 核心重构亮点（简明一句话） */}
        {comparison?.outputImprovements && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {comparison.outputImprovements}
          </p>
        )}
      </div>

      {/* 底部字数与进入查看 */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
          <span>{inputDoc?.wordCount || 0}字</span>
          <ArrowRight className="w-2.5 h-2.5 text-gray-300" />
          <span className="text-gray-700 font-medium">{outputDoc?.wordCount || 0}字</span>
        </div>
        <span className="text-[#07c160] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          <span>查看方案</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

