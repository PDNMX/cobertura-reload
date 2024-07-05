// @ts-nocheck
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { EntesTable } from "@/components/tables/cell-entes-table/table";
import { ConteoColumna } from "./conteo-columna";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(
    null,
  );

  const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
  >(({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  ));
  Table.displayName = "Table";

  const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <thead
      ref={ref}
      // Manually added sticky top-0 to fix header not sticking to top of table
      className={cn("sticky top-0 bg-secondary [&_tr]:border-b", className)}
      {...props}
    />
  ));
  TableHeader.displayName = "TableHeader";

  const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      // Manually added sticky top-0 to fix header not sticking to top of table
      className={cn("sticky top-0 bg-secondary [&_tr]:border-b", className)}
      {...props}
    />
  ));
  TableFooter.displayName = "TableFooter";

  const table = useReactTable({
    data: data.sort((a, b) => a.entidad.localeCompare(b.entidad)), //ordenamos los datos
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  async function fetchDataCell(entidad: string | null, tipoColumna: string) {
    const filter = {
      ...(entidad && { entidad: { _eq: entidad } }), // Filtra por entidad si se proporciona
      ...(tipoColumna === "resultSujetosObligados" && {
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultOIC" && {
        _or: [
          { controlOIC: { _eq: true } },
          { controlTribunal: { _eq: true } },
        ],
      }),
      ...(tipoColumna === "resultTribunal" && {
        controlTribunal: { _eq: true },
      }),
      ...(tipoColumna === "resultSistema1" && {
        sistema1: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultSistema2" && {
        sistema2: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultSistema3OIC" && {
        sistema3: { _eq: true },
        _or: [
          { controlOIC: { _eq: true } },
          { controlTribunal: { _eq: true } },
        ],
      }),
      ...(tipoColumna === "resultSistema3Tribunal" && {
        sistema3: { _eq: true },
        controlOIC: { _eq: false },
        controlTribunal: { _eq: true },
      }),
      ...(tipoColumna === "resultSistema6" && {
        sistema6: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultConexiones" && {
        controlOIC: { _eq: false },
        _or: [
          {sistema1: { _eq: true }},
          {sistema2: { _eq: true }},
          {sistema6: { _eq: true }},
        ],
      }),
      ...(tipoColumna === "resultCampeonatoS1" && {
        controlOIC: { _eq: false },
        sistema1: { _eq: true },
      }),
    };

    const options = {
      filter,
      ...(entidad === null && {
        aggregate: { count: ["*"] },
        groupBy: ["entidad"],
      }),
      ...(entidad !== null && { sort: ["nombre"], limit: "-1", fields: ["*"] }),
    };

    try {
      const result = await directus.request(readItems("entes", options));
      return result;
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      return null;
    }
  }

  const handleCellClick = async (cell: any) => {
    if (cell.row) {
      const rowElement = cell.row.original;
      const entidad = rowElement.entidad;
      const tipoColumna = cell.column.id;

      const columnVisibilityMap = {
        resultSujetosObligados: {
          sistema1: true,
          sistema2: true,
          sistema3: false,
          sistema6: true,
        },
        resultOIC: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultTribunal: {
          sistema1: true,
          sistema2: true,
          sistema3: true,
          sistema6: true,
        },
        resultSistema1: {
          sistema1: true,
          sistema2: false,
          sistema3: false,
          sistema6: false,
        },
        resultSistema2: {
          sistema1: false,
          sistema2: true,
          sistema3: false,
          sistema6: false,
        },
        resultSistema3: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema3OIC: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema3Tribunal: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema6: {
          sistema1: false,
          sistema2: false,
          sistema3: false,
          sistema6: true,
        },
        resultConexiones: {
          sistema1: true,
          sistema2: true,
          sistema3: false,
          sistema6: true,
        },
        resultCampeonatoS1: {
          sistema1: true,
          sistema2: false,
          sistema3: false,
          sistema6: false,
        },
      };

      const columnasMostrar = columnVisibilityMap[tipoColumna] || {};

      const respuestaDirectus = await fetchDataCell(entidad, tipoColumna);
      setDialogContent(
        <EntesTable data={respuestaDirectus} columnsShow={columnasMostrar} />,
      );
      setIsDialogOpen(true);
    } else if (cell.column) {
      const tipoColumna = cell.column.id;
      if (
        tipoColumna == "resultSujetosObligados" ||
        tipoColumna == "resultOIC" ||
        tipoColumna == "resultTribunal"
      ) {
        const entidad = null;
        const respuestaDirectus = await fetchDataCell(entidad, tipoColumna);
        setIsDialogOpen(true);
        setDialogContent(<ConteoColumna data={respuestaDirectus} />);
      } else {
        //const entidad = null;
        //const respuestaDirectus = await fetchDataCell(entidad, tipoColumna);
        console.log(data);
        let dataConPorcentaje;
        if (tipoColumna == "resultSistema3OIC") {
          dataConPorcentaje = data.map((item) => {
            return {
              ...item,
              count: Number(
                ((item[tipoColumna] / item.resultOIC) * 100).toFixed(2),
              ),
            };
          });
        } else if (tipoColumna == "resultSistema3Tribunal") {
          dataConPorcentaje = data.map((item) => {
            return {
              ...item,
              count: Number(
                ((item[tipoColumna] / item.resultTribunal) * 100).toFixed(2),
              ),
            };
          });
        } else if (tipoColumna == "resultConexiones" || "resultCampeonatoS1") {
          dataConPorcentaje = data.map((item) => {
            return {
              ...item,
              count: item[tipoColumna]
            };
          });
        } else {
          dataConPorcentaje = data.map((item) => {
            return {
              ...item,
              count: Number(
                (
                  (item[tipoColumna] / item.resultSujetosObligados) *
                  100
                ).toFixed(2),
              ),
            };
          });
        }
        // Pasar los datos al nuevo componente
        setIsDialogOpen(true);
        setDialogContent(<ConteoColumna data={dataConPorcentaje} />);
      }
    }
  };

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Buscar...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="w-full"
        />
      </div>
      <ScrollArea className="rounded-md border h-[calc(80vh-100px)]">
        <Table className="relative w-full">
          <TableHeader className="sticky bottom-0 bg-gray-200 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => handleCellClick(header)}
                      className="text-center py-2 px-0.5 text-muted-foreground"
                      /* style={{ width: header.column.columnDef.size }} */
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  className={
                    hoveredRowId === row.id
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      /* style={{ width: cell.column.columnDef.size }} */
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      onMouseEnter={() => setHoveredColumnId(cell.column.id)}
                      onMouseLeave={() => setHoveredColumnId(null)}
                      className={`cursor-pointer ${
                        hoveredColumnId === cell.column.id
                          ? "bg-gray-200 dark:bg-gray-600"
                          : ""
                      } ${
                        hoveredRowId === row.id &&
                        hoveredColumnId === cell.column.id
                          ? "bg-gray-300 dark:bg-gray-500"
                          : ""
                      } text-center`}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xl">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* FOOTER - TOTALES */}
          <TableFooter className="sticky bottom-0 bg-gray-200 dark:bg-gray-800">
            {/* Styled and Sticky Footer */}
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className="text-center py-2 px-0.5 text-muted-foreground"
                    /* style={{ width: header.column.columnDef.size }} */
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
        <DialogContent className="p-6 rounded-md shadow-lg max-w-5xl w-full bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Entes Públicos
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">{dialogContent}</div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
