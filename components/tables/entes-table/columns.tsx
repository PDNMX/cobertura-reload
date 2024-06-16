// @ts-nocheck
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User } from "@/constants/data";
import { CheckCircle, XCircle } from "lucide-react";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <div className="text-left">{row.original.nombre}</div>,
    size: 500, // Ancho fijo para Nombre
  },
  {
    accessorKey: "ambitoGobierno",
    header: "Ámbito Gobierno",
    cell: ({ row }) => (
      <div className="text-center">{row.original.ambitoGobierno}</div>
    ),
    size: 125, // Ancho fijo para Ámbito Gobierno
  },
  {
    accessorKey: "poderGobierno",
    header: "Poder Gobierno",
    cell: ({ row }) => (
      <div className="text-center">{row.original.poderGobierno}</div>
    ),
    size: 125, // Ancho fijo para Poder Gobierno
  },
  {
    accessorKey: "sistema1",
    header: "S1",
    cell: ({ row }) => (
      <div className="flex justify-center items-center h-full">
        {row.original.sistema1 ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <XCircle className="text-red-500" />
        )}
      </div>
    ),
    size: 20, // Ancho fijo para S1
  },
  {
    accessorKey: "sistema2",
    header: "S2",
    cell: ({ row }) => (
      <div className="flex justify-center items-center h-full">
        {row.original.sistema2 ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <XCircle className="text-red-500" />
        )}
      </div>
    ),
    size: 20 // Ancho fijo para S2
  },
  {
    accessorKey: "sistema3",
    header: "S3",
    cell: ({ row }) => (
      <div className="flex justify-center items-center h-full">
        {row.original.sistema3 ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <XCircle className="text-red-500" />
        )}
      </div>
    ),
    size: 20 // Ancho fijo para S3
  },
  {
    accessorKey: "sistema6",
    header: "S6",
    cell: ({ row }) => (
      <div className="flex justify-center items-center h-full">
        {row.original.sistema6 ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <XCircle className="text-red-500" />
        )}
      </div>
    ),
    size: 20 // Ancho fijo para S6
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    size: 20 // Ancho fijo para acciones
  },
];
