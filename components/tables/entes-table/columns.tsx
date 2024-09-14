// @ts-nocheck
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User } from "@/constants/data";
import { CheckCircle, XCircle } from "lucide-react";

export const createColumns = (visibilityMap, session): ColumnDef<User>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <div className="text-left">{row.original.nombre}</div>,
    size: 500,
    enableSorting: true,
  },
  visibilityMap.ambitoGobierno && {
    accessorKey: "ambitoGobierno",
    header: "Ámbito Gobierno",
    cell: ({ row }) => (
      <div className="text-center">{row.original.ambitoGobierno}</div>
    ),
    size: 125,
    enableSorting: true,
  },
  visibilityMap.poderGobierno && {
    accessorKey: "poderGobierno",
    header: "Poder Gobierno",
    cell: ({ row }) => (
      <div className="text-center">{row.original.poderGobierno}</div>
    ),
    size: 125,
    enableSorting: true,
  },
  visibilityMap.sistema1 && {
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
    size: 20,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original[columnId] ? 1 : 0;
      const b = rowB.original[columnId] ? 1 : 0;
      return a - b;
    },
  },
  visibilityMap.sistema2 && {
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
    size: 20,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original[columnId] ? 1 : 0;
      const b = rowB.original[columnId] ? 1 : 0;
      return a - b;
    },
  },
  visibilityMap.sistema3 && {
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
    size: 20,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original[columnId] ? 1 : 0;
      const b = rowB.original[columnId] ? 1 : 0;
      return a - b;
    },
  },
  visibilityMap.sistema6 && {
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
    size: 20,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original[columnId] ? 1 : 0;
      const b = rowB.original[columnId] ? 1 : 0;
      return a - b;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} session={session} />,
    size: 20,
    enableSorting: false,
  },
].filter(Boolean);