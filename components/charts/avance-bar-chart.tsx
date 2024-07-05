// @ts-nocheck
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const colorMap = {
  "Sistema 1": "#F29888",
  "Sistema 2": "#B25FAC",
  "Sistema 3 OIC": "#9085DA",
  "Sistema 3 Tribunal": "#9085DA",
  "Sistema 6": "#42A5CC",
};

export const AvanceBarChart = ({ data }: any) => {
  if (data.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 5, left: 5, bottom: 15 }}>
          <XAxis
            dataKey="sistema"
            stroke="#888888"
            fontSize={12}
            padding={{ left: 5, right: 5 }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            type="number"
            domain={[0, 100]}
            scale="sqrt"
            tickFormatter={(tick) => `${tick}%`}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const totalEntes = props.payload.totalEntes;
              const conectados = props.payload.conectados;
              return [`Total: ${value}%`,`${conectados} de ${totalEntes}`];
            }}
            labelFormatter={() => ""}
          />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorMap[entry.sistema]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <>
        <p>No hay datos que mostrar</p>
      </>
    );
  }
};
