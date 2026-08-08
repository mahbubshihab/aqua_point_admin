'use client';

import { ChevronDown } from 'lucide-react';

interface TableFooterProps {
  totalItems: number;
  visibleCount?: number;
  onSeeMore?: () => void;
  onLoadMore?: () => void;
  selectedCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showEntriesInfo?: boolean;
}

export default function TableFooter({
  totalItems,
  visibleCount,
  onSeeMore,
  onLoadMore,
  selectedCount = 0,
  currentPage,
  totalPages,
  onPageChange,
  showEntriesInfo = true,
}: TableFooterProps) {
  const currentVisible = visibleCount ?? (currentPage ? Math.min(currentPage * 10, totalItems) : totalItems);
  const hasMore = currentVisible < totalItems;

  const handleSeeMore = () => {
    if (onSeeMore) {
      onSeeMore();
    } else if (onLoadMore) {
      onLoadMore();
    } else if (onPageChange && currentPage && totalPages) {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    }
  };

  return (
    <div className="bg-[#3e4396] text-white px-4 sm:px-6 py-3 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold shadow-inner mt-0">
      <div className="flex items-center gap-3 text-slate-200">
        {showEntriesInfo && (
          <span>
            Showing {Math.min(currentVisible, totalItems)} of {totalItems} entries
          </span>
        )}
        {selectedCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#00BCE1]/20 text-[#00BCE1] text-[10px] font-bold border border-[#00BCE1]/40">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div>
        {hasMore ? (
          <button
            type="button"
            onClick={handleSeeMore}
            className="px-5 py-2 rounded-xl bg-[#00BCE1] text-[#0F172A] hover:bg-cyan-300 font-extrabold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95 border border-cyan-400/50"
          >
            <span>See More</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[11px] text-slate-300 font-medium italic">
            {totalItems > 0 ? 'Showing all entries' : 'No entries'}
          </span>
        )}
      </div>
    </div>
  );
}
