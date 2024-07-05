// @ts-nocheck
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntidadBarChart } from "./entidad-bar-chart";
import { AvanceBarChart } from "./avance-bar-chart";

export const TabsColumnsSistemas = ({ dataEntidad, dataNacional, tipoColumna }: any) => {
  return (
    <>  
      <Tabs defaultValue="entidad" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entidad">
            Entidad
          </TabsTrigger>
          <TabsTrigger value="nacional">
            Nacional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entidad" className="space-y-4">
          <EntidadBarChart data={dataEntidad} />
        </TabsContent>

        <TabsContent value="nacional" className="space-y-4">
          <AvanceBarChart data={dataNacional} tipoColumna={tipoColumna} />
        </TabsContent>
      </Tabs>
    </>
  );
};