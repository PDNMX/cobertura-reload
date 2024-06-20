"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from "recharts";

type EntityData = {
  entidad: string;
  totalSO: number;
  totalOIC: number;
  s1: number;
  s2: number;
  s3: number;
  s6: number;
};

const data: EntityData[] = [
  {
    entidad: "01",
    totalSO: 93,
    totalOIC: 69,
    s1: 92,
    s2: 90,
    s3: 69,
    s6: 1,
  },
  {
    entidad: "02",
    totalSO: 127,
    totalOIC: 89,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "03",
    totalSO: 120,
    totalOIC: 14,
    s1: 73,
    s2: 84,
    s3: 14,
    s6: 0,
  },
];

const colors = {
  S1: "#F29888",
  S2: "#B25FAC",
  S3: "#9085DA",
  S6: "#42A5CC",
};

export function Overview({ entidad }: { entidad: string }) {
  const entityData = data.find((item) => item.entidad === entidad);

  if (!entityData) {
    return <p className="pl-4">No hay información disponible para tu entidad.</p>;
  }

  const processedData = [
    {
      name: `S1: ${entityData.s1} de ${entityData.totalSO}`,
      Total: (entityData.s1 / entityData.totalSO) * 100,
      color: colors.S1,
    },
    {
      name: `S2: ${entityData.s2} de ${entityData.totalSO}`,
      Total: (entityData.s2 / entityData.totalSO) * 100,
      color: colors.S2,
    },
    {
      name: `S3: ${entityData.s3} de ${entityData.totalOIC}`,
      Total: (entityData.s3 / entityData.totalOIC) * 100,
      color: colors.S3,
    },
    {
      name: `S6: ${entityData.s6} de ${entityData.totalSO}`,
      Total: (entityData.s6 / entityData.totalSO) * 100,
      color: colors.S6,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={processedData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.split(":")[0]}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
        />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
        <Bar dataKey="Total" radius={[4, 4, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}