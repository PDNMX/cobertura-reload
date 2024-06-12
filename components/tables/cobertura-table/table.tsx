"use client";

import { DataTable } from "./data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { columns } from "./columns";

export const CoberturaTable = ({ data }: any) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Tablero Estadístico de Cobertura Nacional de Interconexión`}
          description={`${data.length} entes registrados`}
        />
      </div>
      <Separator />

      <DataTable searchKey="nombre" columns={columns} data={data} />
    </>
  );
};
