// @ts-nocheck
"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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
import { ConteoColumna } from "./conteo-columna"

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  async function fetchDataCell(entidad: string | null, tipoColumna: string) {
    const filter = {
      ...(entidad && { entidad: { _eq: entidad } }),  // Filtra por entidad si se proporciona
      ...(tipoColumna === "resultSujetosObligados" && { controlOIC: { _eq: false } }),
      ...(tipoColumna === "resultOIC" && { controlOIC: { _eq: true } }),
      ...(tipoColumna === "resultTribunal" && { controlTribunal: { _eq: true } }),
      ...(tipoColumna === "resultSistema1" && { sistema1: { _eq: true }, controlOIC: { _eq: false } }),
      ...(tipoColumna === "resultSistema2" && { sistema2: { _eq: true }, controlOIC: { _eq: false } }),
      ...(tipoColumna === "resultSistema3OIC" && { sistema3: { _eq: true }, controlOIC: { _eq: true } }),
      ...(tipoColumna === "resultSistema3Tribunal" && { sistema3: { _eq: true }, controlOIC: { _eq: false }, controlTribunal: { _eq: true } }),
      ...(tipoColumna === "resultSistema6" && { sistema6: { _eq: true }, controlOIC: { _eq: false } }),
      ...(tipoColumna === "resultConexiones" && { sistema1: { _eq: true }, sistema2: { _eq: true }, sistema6: { _eq: true }, controlOIC: { _eq: false } }),
    };
  
    const options = {
      filter,
      ...(entidad === null && { aggregate: { count: ["*"] }, groupBy: ["entidad"] }),
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
      const respuestaDirectus = await fetchDataCell(entidad, tipoColumna); 
      setDialogContent(<EntesTable data={respuestaDirectus} />);
      setIsDialogOpen(true);
    } else if (cell.column) {
      const entidad = null; // Ajustar según sea necesario
      const tipoColumna = cell.column.id;
      const respuestaDirectus = await fetchDataCell(entidad, tipoColumna); 
      // Pasar los datos al nuevo componente
      setIsDialogOpen(true);
      setDialogContent(<ConteoColumna data={respuestaDirectus} />);
      
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
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => handleCellClick(header)}
                      className="text-center pt-2 pb-2">
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
