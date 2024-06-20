// @ts-nocheck
"use client";

import { DataTable } from "./data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "./columns";

//import datosOriginales from "./data-ejemplo";
import marcoGeoestadisticoInegi from "./data-entidades";

export const CoberturaTable = ({ data }: any) => {
  const datosConNombres = data.map((dato) => {
    const entidadEncontrada = marcoGeoestadisticoInegi.find(
      (entidad) => entidad.id === dato.entidad,
    );
    if (!entidadEncontrada) {
      return { ...dato, nombreEntidad: "Entidad no encontrada" };
    }
    return { ...dato, nombreEntidad: entidadEncontrada.nombre };
  });

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Tablero Estadístico de Cobertura Nacional de Interconexión`}
          /* description={`${dataEjemplo.length} entes registrados`} */
        />
      </div>
      <Separator />

      <DataTable
        searchKey="nombreEntidad"
        columns={columns}
        data={datosConNombres}
      />
    </>
  );
};
