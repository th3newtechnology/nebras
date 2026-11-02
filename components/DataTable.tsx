
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
}

const DataTable = <T extends { id: string },>({ data, columns, onEdit, onDelete, onView }: DataTableProps<T>) => {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.className}`}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th className="px-6 py-4 text-xs font-bold text-slate-500 text-left">العمليات</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 py-4 text-sm text-slate-700 ${col.className}`}>
                  {typeof col.accessor === 'function' 
                    ? col.accessor(item) 
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="px-6 py-4 text-left space-x-2 space-x-reverse whitespace-nowrap">
                  {onView && (
                    <button 
                      onClick={() => onView(item)}
                      className="text-amber-600 hover:text-amber-700 text-xs font-bold transition-colors ml-3"
                    >
                      عرض التفاصيل
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(item)}
                      className="text-cyan-600 hover:text-cyan-700 text-xs font-bold transition-colors ml-3"
                    >
                      تعديل
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(item)}
                      className="text-red-500 hover:text-red-600 text-xs font-bold transition-colors"
                    >
                      حذف
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
