import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T | string) => void;
  sortKey?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export const DataTable = <T extends { id?: string | number }>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick
}: DataTableProps<T>) => {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-dark-background/50 text-gray-500 dark:text-gray-400 text-sm font-medium border-b border-gray-200 dark:border-dark-border">
              {columns.map((col, idx) => (
                <th 
                  key={String(col.key)} 
                  className={`px-6 py-4 whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors' : ''} ${idx === 0 ? 'pl-6' : ''}`}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-700 dark:text-gray-200 text-sm divide-y divide-gray-100 dark:divide-dark-border/50"
          >
            {isLoading ? (
              // Loading State (Shimmer Effect)
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`loading-${i}`}>
                  {columns.map((col) => (
                    <td key={`loading-col-${String(col.key)}`} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse w-full max-w-[80%]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              // Data Rows
              data.map((row, idx) => (
                <motion.tr 
                  key={row.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-gray-50/50 dark:hover:bg-dark-bg/40 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={`${row.id || idx}-${String(col.key)}`} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
