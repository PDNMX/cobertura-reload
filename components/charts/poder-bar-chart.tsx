import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import marcoGeoestadisticoInegi from "../tables/cobertura-table/data-entidades";

export const ConteoColumna = ({ data }: any) => {
  console.log(data)
  if (data.length > 0) {
    const datosConNombres = data.map((dato: any) => {
      const entidadEncontrada = marcoGeoestadisticoInegi.find(
        (entidad) => entidad.id === dato.entidad,
      );
      return {
        ...dato,
        nombreEntidad: entidadEncontrada?.nombre || "Entidad no encontrada",
        abreviacion: entidadEncontrada?.abreviacion || "NA",
        count: parseInt(dato.count, 10) // Convertir count a número entero (base 10)
      };
    });
    //console.log(datosConNombres);
    return (
      <ResponsiveContainer width="100%" height={400} >
        <BarChart data={datosConNombres} margin={{ top: 10, right: 5, left: 5, bottom: 15 }}>
          <XAxis
            dataKey="abreviacion"
            stroke="#888888"
            fontSize={12}
            angle={-45} 
            textAnchor="end"
            interval={0} // Asegurar que todas las etiquetas se muestren
            padding={{ left: 5, right: 5 }} // Ajustar el padding
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            type="number"
            domain={[0, 100]}
            scale="linear"
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <>
        <p className="text-xl">No hay datos que mostrar</p>
      </>
    );
  }
};
