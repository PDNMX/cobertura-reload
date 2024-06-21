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
        count: parseInt(dato.count, 10) // Convertir count a número entero (base 10)
      };
    });
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={datosConNombres}
          width={500}
          height={300}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}>
          <XAxis
            dataKey="nombreEntidad"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={true}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={true}
            type="number"
            domain={[0, "dataMax"]}
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
