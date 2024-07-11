// @ts-nocheck
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { conectados, totalEntes, count } = payload[0].payload;
    return (
      <div className="custom-tooltip p-2 border rounded shadow-lg bg-white text-black">
        <p className="label">{`${conectados} de ${totalEntes}`}</p>
        <p className="intro">{`Total: ${count}%`}</p>
      </div>
    );
  }

  return null;
};

export const PoderBarChart = ({ data, tipoColumna }: any) => {
  const colors: object = {
    resultSistema1: "#F29888",
    resultSistema2: "#B25FAC",
    resultSistema3OIC: "#9085DA",
    resultSistema3Tribunal: "#9085DA",
    resultSistema6: "#42A5CC",
  };

  const colorSistema = colors[tipoColumna];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 10, right: 5, left: 5, bottom: 15 }}>
        <XAxis
          dataKey="poder"
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
          scale="sqrt"
          type="number"
          domain={[0, 100]}
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill={colorSistema} />
      </BarChart>
    </ResponsiveContainer>
  );
};