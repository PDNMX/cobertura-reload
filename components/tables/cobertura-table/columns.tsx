"use client";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/constants/data";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "poderGobierno",
    header: "Poder Gobierno",
  },
];
