// @ts-nocheck
"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "./input";
import { ArrowUp, ArrowDown, ArrowUpDown, SearchX } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  columnsShow?: object;
  hideSearch?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  columnsShow,
  hideSearch = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility: columnsShow },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      {!hideSearch && (
        <Input
          placeholder={`Buscar por ${searchKey}...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
          className="w-full"
        />
      )}

      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">

            {/* ── Header ── */}
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/60">
                  {hg.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    const canSort  = header.column.getCanSort();
                    const isNombre = header.column.id === "nombre";
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={[
                          "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide select-none",
                          isNombre ? "text-left" : "text-center",
                          canSort  ? "cursor-pointer hover:text-foreground transition-colors" : "",
                        ].join(" ")}
                      >
                        <span className={["inline-flex items-center gap-1", isNombre ? "" : "justify-center"].join(" ")}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            isSorted === "asc"  ? <ArrowUp   className="h-3 w-3 shrink-0" /> :
                            isSorted === "desc" ? <ArrowDown className="h-3 w-3 shrink-0" /> :
                                                  <ArrowUpDown className="h-3 w-3 shrink-0 opacity-30" />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* ── Body ── */}
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={[
                      "border-b last:border-0 transition-colors hover:bg-muted/40",
                      i % 2 === 0 ? "" : "bg-muted/20",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isNombre = cell.column.id === "nombre";
                      return (
                        <td
                          key={cell.id}
                          className={[
                            "px-4 py-3 align-middle",
                            isNombre ? "text-left" : "text-center",
                          ].join(" ")}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <SearchX className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium">Sin resultados</p>
                      <p className="text-xs">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
