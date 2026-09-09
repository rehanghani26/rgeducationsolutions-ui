import PropTypes from "prop-types";
import { memo, useState, Fragment } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { noRecord } from "../../assets";

import { BeatLoader, Filter, Input, Search } from "..";

import { TablePagination } from ".";

import "./table.scss";
import { useSelector } from "react-redux";
import { COMPANY_PROVIDER } from "../../constants/company";

// Helper: truncate string to 50 chars with ellipsis
function truncateText(value, maxLength = 50) {
  if (typeof value !== "string") return value;
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + "…";
}

const Table = ({
  className = "",
  tableLayout = [],
  data = [],
  tableHeading = "",
  headingClassName = "text-lg font-semibold mb-2",
  tableClassName = "",
  trClassname = "",
  tableHeadClassName = "",
  inputPlaceholders = [],
  searchClassName = "",
  onSearchChange = () => {},
  searchPlaceholder = "",
  openedRow = [],
  Collapse,
  collapseAttribute = "id",
  children,
  noScrollBar = true,
  currentPage = 0,
  totalPages = 0,
  onButtonClick,
  onDecrease,
  onIncrease,
  initialFilters = {},
  filterOptions = {},
  showfilter = true,
  onFiltersChange = () => {},
  loadingTableContent = false,
  noRecordImage,
  noRecordImageClassName = "",
  noRecordText = "",
  noRecordTextClassName = "",
  additionalFilters = <></>,
  totalDataLabel = "",
  totalDataValue = "",
  isFilterMultiple = false,
  additionalButtons = <></>,
}) => {
  const company = useSelector(
    (state) => state?.authentication?.logInCompanyDetails
  );
  const isProvider = company?.companyType === COMPANY_PROVIDER;
  const textClass = isProvider ? "text-[#FFEDD5]" : "text-white";

  const [searchItem, setSearchItem] = useState("");

  function handleSearchChange(e) {
    setSearchItem(e.target.value);
  }

  function onCrossClick() {
    setSearchItem("");
    onSearchChange("");
  }

  function onSearchClick() {
    onSearchChange(searchItem.toLowerCase());
  }

  return (
    <div className={`relative ${className} font-sans antialiased`}>
      {tableHeading && <h1 className={headingClassName}>{tableHeading}</h1>}
      {children}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {searchPlaceholder && (
            <Search
              id={searchPlaceholder.split(" ").join("-").toLowerCase()}
              name={searchPlaceholder.split(" ").join("-").toLowerCase()}
              className={`bg-white border border-[#E5E9F0] rounded-lg h-9 min-w-[240px] text-sm shadow-sm ${searchClassName}`}
              placeholder={searchPlaceholder}
              value={searchItem}
              onChange={handleSearchChange}
              onCrossClick={onCrossClick}
              onSearchClick={onSearchClick}
            />
          )}

          {inputPlaceholders?.map((placeholder, index) => (
            <Input
              id={placeholder?.split(" ")?.join("-")?.toLowerCase()}
              type="text"
              className="min-w-32"
              key={index}
              placeholder={placeholder}
            />
          ))}

          {Object.keys(filterOptions)?.length > 0 && showfilter && (
            <Filter
              filterOptions={filterOptions}
              onFiltersChange={onFiltersChange}
              initialFilters={initialFilters}
              isMultiple={isFilterMultiple}
            />
          )}

          {additionalFilters}
        </div>

        <div className="flex items-center gap-3">
          {totalDataLabel && (
            <div className="rounded-lg border border-[#E5E9F0] bg-[#F8FAFF] px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium">
              <span className="text-[#6B7280]">{totalDataLabel}:</span>
              <span className="font-bold text-[#0064E0]">{totalDataValue}</span>
            </div>
          )}
          {additionalButtons && additionalButtons}
        </div>
      </div>

      {/* Table wrapper */}
      <div
        className={`overflow-x-auto scroll-smooth rounded-xl border border-[#E5E9F0] shadow-sm ${
          noScrollBar ? "no-scrollbar" : ""
        } ${tableClassName}`}
      >
        {loadingTableContent ? (
          <div className="flex items-center justify-center min-h-[250px] w-full bg-white">
            <BeatLoader />
          </div>
        ) : (
          <table className="min-w-full text-center">
            <thead
              className={`bg-[#000F52] border-b-2 border-[#3e8b8250] ${tableHeadClassName}`}
            >
              <tr>
                {tableLayout?.filter(Boolean)?.map((layout, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${textClass} select-none whitespace-nowrap`}
                  >
                    {layout?.headData}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F0F4F8]">
              {data?.length > 0 &&
                data?.map((dataItem, itemIndex) => {
                  const isOpen =
                    openedRow?.includes(dataItem) ||
                    openedRow?.some(
                      (row) =>
                        row?.[collapseAttribute] ===
                        dataItem?.[collapseAttribute]
                    );

                  return (
                    <Fragment key={itemIndex}>
                      <motion.tr
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: itemIndex * 0.025,
                          duration: 0.18,
                        }}
                        className={`group border-b border-[#F0F4F8] transition-colors duration-150 ease-in-out hover:bg-[#F5F8FF] cursor-default ${
                          isOpen
                            ? "bg-[#F0F5FF] border-l-2 border-l-[#0064E0]"
                            : ""
                        } ${trClassname}`}
                      >
                        {tableLayout
                          ?.filter(Boolean)
                          ?.map((layout, layoutIndex) => {
                            // Get the rendered cell value
                            const cellValue = layout?.bodyData(
                              dataItem,
                              itemIndex
                            );

                            // Only truncate plain string output; leave React nodes as-is
                            const isPlainString = typeof cellValue === "string";
                            const displayValue = isPlainString
                              ? truncateText(cellValue)
                              : cellValue;
                            const tooltipTitle =
                              isPlainString && cellValue.length > 50
                                ? cellValue
                                : undefined;

                            return (
                              <td
                                key={layoutIndex}
                                className="px-4 py-3.5 text-sm font-medium text-[#374151] whitespace-nowrap max-w-[260px]  text-ellipsis"
                                title={tooltipTitle}
                              >
                                {displayValue}
                              </td>
                            );
                          })}
                      </motion.tr>

                      <AnimatePresence>
                        {isOpen && Collapse && (
                          <tr>
                            <td
                              colSpan={tableLayout?.filter(Boolean)?.length}
                              className="p-0 border-l-2 border-l-[#0064E0]"
                            >
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.28, ease: "easeOut" }}
                              >
                                <div className="p-5 bg-[#F8FAFF] border-t border-[#E5E9F0]">
                                  {Collapse(dataItem)}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {data?.length === 0 && !loadingTableContent && (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F5FF] flex items-center justify-center mb-4">
              <img
                src={noRecordImage || noRecord}
                className={noRecordImageClassName || "w-8 h-auto opacity-50"}
                alt="No records"
              />
            </div>
            <p
              className={`text-[#1A1F36] font-semibold text-sm ${noRecordTextClassName}`}
            >
              {noRecordText || "No records found"}
            </p>
            <p className="text-[#9CA3AF] text-xs mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {!!totalPages && (
        <div className="mt-4 flex justify-end">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalDataValue}
            onButtonClick={onButtonClick}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  className: PropTypes.string,
  tableLayout: PropTypes.array,
  data: PropTypes.array,
  tableHeading: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  headingClassName: PropTypes.string,
  tableClassName: PropTypes.string,
  trClassname: PropTypes.string,
  border: PropTypes.string,
  tableHeadClassName: PropTypes.string,
  inputPlaceholders: PropTypes.array,
  searchClassName: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  onSearchChange: PropTypes.func,
  openedRow: PropTypes.array,
  Collapse: PropTypes.func,
  collapseAttribute: PropTypes.string,
  noScrollBar: PropTypes.bool,
  children: PropTypes.node,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onButtonClick: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  initialFilters: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onFiltersChange: PropTypes.func,
  filterOptions: PropTypes.object,
  showfilter: PropTypes.bool,
  additionalFilters: PropTypes.node,
  loadingTableContent: PropTypes.bool,
  noRecordImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  noRecordImageClassName: PropTypes.string,
  noRecordText: PropTypes.string,
  noRecordTextClassName: PropTypes.string,
  totalDataLabel: PropTypes.string,
  totalDataValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isFilterMultiple: PropTypes.bool,
  additionalButtons: PropTypes.node,
};

export default memo(Table);
