import PropTypes from "prop-types";
import { memo } from "react";
import { chevronLeft, chevronRight } from "../../assets/figmaIcons";
import { Icon } from "..";

const TablePagination = ({
  currentPage = 1,
  totalPages = 0,
  pageSize = 10, // Added to calculate the range
  totalItems = 0, // Added to show the total count
  onButtonClick,
  onDecrease,
  onIncrease,
  className = "flex items-center justify-end gap-6",
  buttonClassname = "size-7 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#E4E4E3] hover:bg-[#FAFAF9] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer",
}) => {
  const handleDecreaseClick = () => {
    if (currentPage > 1) {
      if (typeof onDecrease === "function") onDecrease();
      else onButtonClick?.(currentPage - 2);
    }
  };

  const handleIncreaseClick = () => {
    if (currentPage < totalPages) {
      if (typeof onIncrease === "function") onIncrease();
      else onButtonClick?.(currentPage);
    }
  };

  if (totalPages <= 0) return null;

  return (
    <div className={`${className} font-sans antialiased`}>
      {totalItems > 0 && (
        <span className="text-[13px] text-[#6B6B6A] font-medium tracking-wide">
          {`Showing ${totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} - ${Math.min(currentPage * pageSize, totalItems)} from ${totalItems}`}{" "}
        </span>
      )}

      <div className="flex items-center gap-2">
        {/* Previous Arrow */}
        <button
          disabled={currentPage <= 1}
          className={buttonClassname}
          onClick={handleDecreaseClick}
        >
          <Icon svg={chevronLeft} className="size-4 p-0 text-[#6B6B6A]" />
        </button>

        {/* Page Numbers */}
        <div className="max-w-[210px] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={index}
                className={`size-9 flex-shrink-0 flex items-center justify-center rounded-lg text-[14px] font-bold transition-all border ${
                  isActive
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : "bg-white text-[#6B6B6A] border-[#E4E4E3] hover:border-[#CFCFCE] hover:text-[#0F0F0E]"
                }`}
                onClick={() => onButtonClick?.(index)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          disabled={currentPage >= totalPages}
          className={buttonClassname}
          onClick={handleIncreaseClick}
        >
          <Icon svg={chevronRight} className="size-4 p-0 text-[#6B6B6A]" />
        </button>
      </div>
    </div>
  );
};

TablePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number,
  onButtonClick: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  showPageNumber: PropTypes.bool,
  buttonsSize: PropTypes.string,
  className: PropTypes.string,
  buttonClassname: PropTypes.string,
  content: PropTypes.node,
};

export default memo(TablePagination);
