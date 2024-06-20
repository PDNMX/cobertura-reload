// @ts-nocheck 
"use client";

import { DataTable } from "./data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { columns } from "./columns";

import dataEjemplo from "./data-ejemplo";

export const CoberturaTable = ({ data }: any) => {
  //console.log(data)

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Tablero Estadístico de Cobertura Nacional de Interconexión`}
          /* description={`${dataEjemplo.length} entes registrados`} */
        />
      </div>
      <Separator />

      <DataTable searchKey="entFed" columns={columns} data={dataEjemplo} />
    </>
  );
};
