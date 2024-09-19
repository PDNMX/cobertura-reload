// @ts-nocheck
"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import { useEffect, useState } from "react";
import directus from "@/lib/directus";
import { readItems, withToken } from "@directus/sdk";
import { useCurrentSession } from "@/hooks/useCurrentSession";

export const DirectorioTable = ({ data }: any) => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const [entesMap, setEntesMap] = useState({});
  
  useEffect(() => {
    async function fetchEntesNames() {
      if (data.length > 0 && session?.access_token) {
        const ids = data.flatMap((item: any) => [item.oic, ...(Array.isArray(item.sujetosObligados) ? item.sujetosObligados : [item.sujetosObligados])]).filter(Boolean);
  
        try {
          const result = await directus.request(
            withToken(session.access_token, readItems("entes", {
              filter: {
                id: { _in: ids },
              },
              fields: ["id", "nombre"],
            }))
          );
  
          const newEntesMap = result.reduce((acc: any, ente: any) => {
            acc[ente.id] = ente.nombre;
            return acc;
          }, {});
  
          setEntesMap(newEntesMap);
        } catch (error) {
          console.error("Error al obtener los nombres de los entes:", error);
        }
      }
    }
  
    fetchEntesNames();
  }, [data, session]);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title="Directorio"
          description="Administrar Directorio"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/directorio/create`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar nuevo
        </Button>
      </div>
      <Separator />

      <div className="space-y-4">
        <DataTable
          searchKey="correoElectronico"
          columns={createColumns({ entesMap }, session)}
          data={data}
        />
      </div>
    </>
  );
};