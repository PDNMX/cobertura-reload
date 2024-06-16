// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const EntesTable = ({ data }: any) => {
  const router = useRouter();

  // Filtrar datos basados en el campo controlOIC
  const sujetosObligados = data.filter((item: any) => !item.controlOIC);
  const organoInternoControl = data.filter((item: any) => item.controlOIC);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title="Entes Públicos"
          description="Administrar Entes Públicos"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/entes/create`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar nuevo
        </Button>
      </div>
      <Separator />

      <Tabs defaultValue="SO" className="space-y-4">
        <TabsList>
          <TabsTrigger value="SO">
            Sujetos Obligados ({sujetosObligados.length})
          </TabsTrigger>
          <TabsTrigger value="OIC">
            Órgano Interno de Control ({organoInternoControl.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="SO" className="space-y-4">
          <DataTable
            searchKey="nombre"
            columns={columns}
            data={sujetosObligados}
          />
        </TabsContent>

        <TabsContent value="OIC" className="space-y-4">
          <DataTable
            searchKey="nombre"
            columns={columns}
            data={organoInternoControl}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
