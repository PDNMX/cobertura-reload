// @ts-nocheck
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntidadBarChart } from "./entidad-bar-chart";
import { AvanceBarChart } from "./avance-bar-chart";
import { AvanceMapa } from "./avance-mapa";
import { AmbitoBarChart } from "./ambito-bar-chart";

export const TabsColumnsSistemas = ({
  dataEntidad,
  selectedColumn,
  dataNacional,
  dataAmbito
}: any) => {
  const colors: object = {
    resultSistema1: "#F29888",
    resultSistema2: "#B25FAC",
    resultSistema3OIC: "#9085DA",
    resultSistema3Tribunal: "#9085DA",
    resultSistema6: "#42A5CC",
  };

  const colorSistema = colors[selectedColumn];
  return (
    <>
      <Tabs defaultValue="entidad" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entidad">Entidad</TabsTrigger>
          <TabsTrigger value="nacional">Nacional</TabsTrigger>
          <TabsTrigger value="avanceMapa">Mapa</TabsTrigger>
          <TabsTrigger value="ambito">Ámbito</TabsTrigger>
        </TabsList>

        <TabsContent value="entidad" className="space-y-4">
          <EntidadBarChart data={dataEntidad} selectedColumn={selectedColumn} />
        </TabsContent>

        <TabsContent value="nacional" className="space-y-4">
          <AvanceBarChart data={dataNacional} tipoColumna={selectedColumn} />
        </TabsContent>

        <TabsContent value="avanceMapa" className="space-y-4">
          <AvanceMapa data={dataEntidad} baseColor={colorSistema} />
        </TabsContent>

        <TabsContent value="ambito" className="space-y-4">
          <AmbitoBarChart data={dataAmbito} tipoColumna={selectedColumn} />
        </TabsContent>
      </Tabs>
    </>
  );
};