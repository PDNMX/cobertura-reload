// @ts-nocheck
"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
  const [entesCell, setEntesCell] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleCellClick = (cell: any) => {
    
    const rowElement = cell.row.original;
    const entidad = rowElement.entidad;
    const tipoColumna = cell.column.id;

    async function fetchDataCell() {
      try {
        setEntesCell('')
        const result = await directus.request(
          readItems("entes", {
            sort: ["nombre"],
            limit: "-1",
            fields: ["*"],
            filter: {
              entidad: {
                _eq: entidad,
              },
              ...(tipoColumna === "resultSujetosObligados" && {
                controlOIC: { _eq: false },
              }),
              ...(tipoColumna === "resultOIC" && { controlOIC: { _eq: true } }), // Conditional filter
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
                controlOIC: { _eq: true },
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
                sistema1: { _eq: true },
                sistema2: { _eq: true },
                sistema6: { _eq: true },
                controlOIC: { _eq: false },
              })
            },
          }),
        );
        console.log(result);
        setEntesCell(result);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    }

    fetchDataCell();
    setIsDialogOpen(true);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-3">
              Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
                  className="h-24 text-center">
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

          <div className="grid gap-4 py-4">
            <EntesTable data={entesCell} />
          </div>
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
