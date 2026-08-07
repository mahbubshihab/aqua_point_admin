'use client';

interface TableFooterProps {
  totalItems: number;
  selectedCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function TableFooter({
  totalItems,
  selectedCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: TableFooterProps) {
  return (
    <div className="bg-[#3e4396] text-white px-6 py-3.5 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold shadow-inner mt-0">
      <div className="flex items-center gap-3 text-slate-200">
        <span>Showing {totalItems > 0 ? 1 : 0} to {totalItems} of {totalItems} entries</span>
        {selectedCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#4cceac]/20 text-[#4cceac] text-[10px] font-bold border border-[#4cceac]/40">
            {selectedCount} selected
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg bg-[#1f2940] text-slate-200 hover:text-white hover:bg-[#141b2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border border-[#2c3754]"
        >
          Previous
        </button>
        <span className="px-3 py-1 rounded-lg bg-[#141b2d] text-[#4cceac] font-bold">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg bg-[#1f2940] text-slate-200 hover:text-white hover:bg-[#141b2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border border-[#2c3754]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
