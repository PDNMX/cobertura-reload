// @ts-nocheck
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import marcoGeoestadisticoInegi from "./data-entidades";

export const ConteoColumna = ({ data }: any) => {
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
    //console.log(datosConNombres)
    return (
      <ResponsiveContainer width="100%" height={400} >
        <BarChart
          data={datosConNombres}
          >
          <XAxis
            dataKey="abreviacion"
            stroke="#888888"
            fontSize={12}
            angle={-60}
            textAnchor="end"
            tickMargin={1}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            type="number"
            domain={[0, "dataMax"]}
            allowDecimals={false}
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
