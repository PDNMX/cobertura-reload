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
    accessorKey: "sistema1",
    header: "S1",
  },
  {
    accessorKey: "sistema2",
    header: "S2",
  },
  {
    accessorKey: "sistema3",
    header: "S3",
  },
  {
    accessorKey: "sistema6",
    header: "S6",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
