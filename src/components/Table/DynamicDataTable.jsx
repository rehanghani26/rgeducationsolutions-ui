import PropTypes from "prop-types";
import { FiPlus, FiTrash2, FiRotateCcw } from "react-icons/fi";

const DynamicDataTable = ({
  className = "",
  tableHeads,
  renderCell,
  rows = [{ isVisible: true }],
  onRemoveRow,
  onResetClick,
  onAddRowClick,
  disabled,
  addButtonDisable,
  addButtonVisible,
  errorMessage = "",
  heading = "",
  deleteButtonVisible,
  columnWidths = [],
  readOnly,
  showIndex = false,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {heading && (
        <h2 className="text-[13px] font-bold" style={{ color: "#030736" }}>
          {heading}
        </h2>
      )}

      <div
        className="overflow-visible rounded-xl bg-white"
        style={{
          border: "1px solid #01298B22",
          boxShadow: "0 1px 6px #01298B0f",
        }}
      >
        <table
          className="min-w-full divide-y"
          style={{ borderColor: "#01298B18" }}
        >
          {/* Head */}
          <thead>
            <tr
              className="text-[11px] rounded-t-lg  font-bold tracking-wide uppercase"
              style={{
                background: "#030736",
                color: "#B0C4DE",
              }}
            >
              {showIndex && (
                <th
                  className="px-3 py-2.5 text-center font-semibold"
                  style={{ borderRight: "1px solid #01298B", width: 40 }}
                >
                  #
                </th>
              )}

              {tableHeads.map((head, index) => (
                <th
                  key={head?.name || head || index}
                  className={`px-3 py-2.5 text-center font-semibold whitespace-nowrap ${columnWidths[index] || ""}`}
                  style={{ borderRight: "1px solid #01298B" }}
                >
                  {typeof head === "object" ? (
                    <>
                      {head?.name}
                      {head?.required && !readOnly && (
                        <span className="ml-1" style={{ color: "#0177D9" }}>
                          *
                        </span>
                      )}
                    </>
                  ) : (
                    head
                  )}
                </th>
              ))}

              {(disabled || deleteButtonVisible) && (
                <th className="px-3 py-2.5 text-center font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody
            className="text-[12px] text-center divide-y"
            style={{ borderColor: "#01298B12" }}
          >
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-all duration-300 ${
                  row?.isVisible === false
                    ? "opacity-0 -translate-y-2 scale-95"
                    : "opacity-100"
                }`}
                style={{
                  background: rowIndex % 2 === 0 ? "#fff" : "#03073602",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0177D908")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    rowIndex % 2 === 0 ? "#fff" : "#03073602")
                }
              >
                {showIndex && (
                  <td
                    className="px-3 py-2 text-center font-semibold text-[11px]"
                    style={{
                      color: "#0177D9",
                      borderRight: "1px solid #01298B12",
                    }}
                  >
                    {rowIndex + 1}
                  </td>
                )}

                {tableHeads.map((_, columnIndex) => {
                  if (_ !== undefined)
                    return (
                      <td
                        key={`${rowIndex}-${columnIndex}`}
                        className={`px-2 py-1.5 relative ${columnWidths[columnIndex] || ""}`}
                        style={{ borderRight: "1px solid #01298B10" }}
                      >
                        {renderCell(rowIndex, columnIndex)}
                      </td>
                    );
                })}

                {(disabled || deleteButtonVisible) && (
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {rowIndex === 0 ? (
                        <button
                          onClick={onResetClick}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-200"
                          style={{
                            background: "#fff",
                            color: "#033F7D",
                            border: "1px solid #01298B",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#01298B12";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                          }}
                        >
                          <FiRotateCcw size={11} />
                          Reset
                        </button>
                      ) : (
                        <button
                          onClick={() => onRemoveRow(rowIndex)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200"
                          style={{
                            background: "#fff1f1",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                          }}
                          aria-label="Remove row"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff1f1";
                          }}
                        >
                          <FiTrash2 size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {/* Add row */}
            {(!addButtonDisable || addButtonVisible) && (
              <tr>
                <td
                  colSpan={
                    tableHeads.length +
                    (disabled || deleteButtonVisible ? 1 : 0) +
                    (showIndex ? 1 : 0)
                  }
                  className="px-4 py-2.5"
                  style={{
                    background: "#03073604",
                    borderTop: "1px solid #01298B15",
                  }}
                >
                  <button
                    onClick={onAddRowClick}
                    disabled={addButtonDisable}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "#fff",
                      color: "#0177D9",
                      border: "1px solid #0177D9",
                    }}
                    onMouseEnter={(e) => {
                      if (!addButtonDisable)
                        e.currentTarget.style.background = "#0177D912";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <FiPlus size={12} />
                    Add row
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {errorMessage && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold"
          style={{
            background: "#fff1f1",
            border: "1px solid #fca5a5",
            color: "#dc2626",
          }}
        >
          <FiTrash2 size={11} />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

DynamicDataTable.propTypes = {
  className: PropTypes.string,
  tableHeads: PropTypes.array,
  renderCell: PropTypes.func,
  disabled: PropTypes.bool,
  rows: PropTypes.array,
  addButtonDisable: PropTypes.bool,
  onRemoveRow: PropTypes.func,
  onResetClick: PropTypes.func,
  onAddRowClick: PropTypes.func,
  addButtonVisible: PropTypes.bool,
  errorMessage: PropTypes.string,
  heading: PropTypes.string,
  deleteButtonVisible: PropTypes.bool,
  columnWidths: PropTypes.arrayOf(PropTypes.string),
  readOnly: PropTypes.bool,
  showIndex: PropTypes.bool,
};

export default DynamicDataTable;
