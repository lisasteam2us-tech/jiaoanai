import React from "react";
import { CaseGroup } from "../types";
import { ChevronRight, ArrowRight, User } from "lucide-react";

interface CaseListItemProps {
  caseGroup: CaseGroup;
  index: number;
  onSelect: (caseGroup: CaseGroup) => void;
}

export const CaseListItem: React.FC<CaseListItemProps> = ({ caseGroup, index, onSelect }) => {
  const comparison = caseGroup.comparison;
  const inputDoc = caseGroup.inputFile || caseGroup.files.find(f => f.docType === "input") || caseGroup.files[0];
  const outputDoc = caseGroup.outputFile || caseGroup.files.find(f => f.docType === "output") || caseGroup.files[1];

  const ratio = comparison?.expansionRatio || (outputDoc && inputDoc ? (outputDoc.wordCount / Math.max(inputDoc.wordCount, 1)).toFixed(1) : "10+");
  const subjectName = comparison?.subjectGrade?.split(" ")[0] || caseGroup.folderName;

  return (
    <div
      id={`case-item-${index}`}
      onClick={() => onSelect(caseGroup)}
      className="group bg-white hover:bg-gray-50/80 border border-gray-200 hover:border-[#07c160] rounded-xl px-4 py-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
    >
      {/* 左侧：序号、学科、标题、执教人 */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 group-hover:bg-[#e8f8f0] group-hover:text-[#06ad56] text-xs font-mono font-medium flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0">
          {subjectName}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#06ad56] transition-colors truncate">
              {caseGroup.title}
            </h3>
            {comparison?.teacherName && (
              <span className="hidden md:inline-flex items-center text-xs text-gray-400 shrink-0">
                · {comparison.teacherName}
              </span>
            )}
          </div>
          {comparison?.outputImprovements && (
            <p className="text-xs text-gray-500 truncate mt-0.5 max-w-2xl">
              {comparison.outputImprovements}
            </p>
          )}
        </div>
      </div>

      {/* 右侧：字数对比及查看按钮 */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <div className="flex items-center gap-2 text-gray-500 font-mono">
          <span className="text-gray-400">{inputDoc?.wordCount || 0}字</span>
          <ArrowRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-900 font-medium">{outputDoc?.wordCount || 0}字</span>
          <span className="text-[11px] font-semibold text-[#06ad56] bg-[#f0faf4] px-1.5 py-0.2 rounded border border-[#d1f2e1]">
            +{ratio}x
          </span>
        </div>

        <span className="text-[#07c160] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
          <span>查看</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
