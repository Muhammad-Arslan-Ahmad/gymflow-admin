import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import { cn } from "@/utils/cn";

export default function DataTable({
  columns,
  data,
  totalCount,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  isLoading,
  searchQuery,
  setSearchQuery,
  filters = {}, // Add default empty object
  setFilters,
  availableFilters = [],
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors",
              Object.keys(filters).length > 0
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
            )}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters{" "}
            {Object.keys(filters).length > 0 &&
              `(${Object.keys(filters).length})`}
          </button>

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="text-sm text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Builder Panel */}
      {isFilterOpen && availableFilters.length > 0 && (
        <div className="p-4 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableFilters.map((filter) => (
            <div key={filter.id} className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {filter.label}
              </label>
              {filter.type === "select" ? (
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={filters[filter.id] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newFilters = { ...filters };
                    if (value) newFilters[filter.id] = value;
                    else delete newFilters[filter.id];
                    setFilters(newFilters);
                  }}
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === "date" ? (
                <input
                  type="date"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={filters[filter.id] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newFilters = { ...filters };
                    if (value) newFilters[filter.id] = value;
                    else delete newFilters[filter.id];
                    setFilters(newFilters);
                  }}
                />
              ) : null}
            </div>
          ))}
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              Close Filters
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      Loading data...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={(pageIndex + 1) * pageSize >= totalCount}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {data.length > 0 ? pageIndex * pageSize + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min((pageIndex + 1) * pageSize, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-300 text-sm font-medium bg-white text-gray-700">
                  Page {pageIndex + 1}
                </div>
                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={(pageIndex + 1) * pageSize >= totalCount}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
