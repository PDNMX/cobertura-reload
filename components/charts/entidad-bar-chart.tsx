// @ts-nocheck
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import marcoGeoestadisticoInegi from "../tables/cobertura-table/data-entidades";

const colors = {
  resultSistema1: "#F29888",
  resultSistema2: "#B25FAC",
  resultSistema3OIC: "#9085DA",
  resultSistema3Tribunal: "#9085DA",
  resultSistema6: "#42A5CC",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { originalCount, total } = payload[0].payload;
    return (
      <div className="custom-tooltip p-2 border rounded shadow-lg bg-white text-black">        <p className="label">{`${originalCount} de ${total}`}</p>
        <p className="intro">{`Total: ${(originalCount / total * 100).toFixed(2)}%`}</p>
      </div>
    );
  }

  return null;
};

export const EntidadBarChart = ({ data, selectedColumn }: any) => {
  if (data.length > 0) {
    const datosConNombres = data.map((dato: any) => {
      const entidadEncontrada = marcoGeoestadisticoInegi.find(
        (entidad) => entidad.id === dato.entidad,
      );
      const originalCount = parseInt(dato[selectedColumn], 10);
      const total = parseInt(dato.resultSujetosObligados, 10) || 1;
      const percentage = (originalCount / total) * 100;

      return {
        ...dato,
        nombreEntidad: entidadEncontrada?.nombre || "Entidad no encontrada",
        abreviacion: entidadEncontrada?.abreviacion || "NA",
        count: parseFloat(percentage.toFixed(2)), // Almacenar el porcentaje
        originalCount, // Almacenar el conteo original para el tooltip
        total, // Almacenar el total para el tooltip
      };
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
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
            tickFormatter={(tick) => `${tick}%`} // Añadir el símbolo de porcentaje
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count">
            {datosConNombres.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[selectedColumn]} />
            ))}
          </Bar>
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