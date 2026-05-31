"use client";

import type { ReactNode } from "react";

type DataTableColumn<T> = {
  id: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
};

export function DataTable<T>({ columns, rows, getRowKey, emptyMessage = "No records found." }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700/90">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60">
            {columns.map((column) => (
              <th
                key={column.id}
                className={[
                  "px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500",
                  column.className,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-zinc-800/80 last:border-b-0 hover:bg-zinc-900/40">
              {columns.map((column) => (
                <td key={column.id} className={["px-3 py-2.5 text-zinc-300", column.className].filter(Boolean).join(" ")}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { DataTableColumn, DataTableProps };
