// @ts-nocheck
"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export const EntesTable = ({ data }: any) => {
  return <DataTable searchKey="nombre" columns={columns} data={data} />;
};
