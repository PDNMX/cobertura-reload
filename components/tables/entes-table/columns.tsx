"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User } from "@/constants/data";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<User>[] = [

  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "ambitoGobierno",
    header: "Ambito Gobierno",
  },

  {
    accessorKey: "poderGobierno",
    header: "Poder Gobierno",
  },
  {
    accessorKey: "entidad",
    header: "ID Entidad",
  },
  {
    accessorKey: "municipio",
    header: "ID Municipio",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];