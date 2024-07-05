"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntidadBarChart } from "./entidad-bar-chart";
import { AvanceBarChart } from "./avance-bar-chart";
//import { AvanceMapa } from "./avance-mapa"

export const TabsColumnsSistemas = ({ dataEntidad, selectedColumn, dataNacional, tipoColumna }: any) => {
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
          {/* <TabsTrigger value="avanceMapa">
            Mapa
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="entidad" className="space-y-4">
          <EntidadBarChart data={dataEntidad} selectedColumn={selectedColumn}/>
        </TabsContent>

        <TabsContent value="nacional" className="space-y-4">
          <AvanceBarChart data={dataNacional} tipoColumna={tipoColumna} />
        </TabsContent>

        {/* <TabsContent value="avanceMapa" className="space-y-4">
          <AvanceMapa data={dataEntidad} />
        </TabsContent> */}
      </Tabs>
    </>
  );
};
