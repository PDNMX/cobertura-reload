"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";

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
    entidad: "00",
    totalSO: 331,
    totalOIC: 199,
    s1: 302,
    s2: 3,
    s3: 190,
    s6: 267,
  },
  { entidad: "01", totalSO: 93, totalOIC: 69, s1: 93, s2: 90, s3: 69, s6: 9 },
  { entidad: "02", totalSO: 132, totalOIC: 95, s1: 1, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "03",
    totalSO: 126,
    totalOIC: 18,
    s1: 126,
    s2: 126,
    s3: 18,
    s6: 10,
  },
  { entidad: "04", totalSO: 107, totalOIC: 45, s1: 0, s2: 17, s3: 1, s6: 0 },
  { entidad: "05", totalSO: 118, totalOIC: 32, s1: 0, s2: 20, s3: 0, s6: 0 },
  { entidad: "06", totalSO: 74, totalOIC: 33, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "07",
    totalSO: 230,
    totalOIC: 165,
    s1: 207,
    s2: 149,
    s3: 64,
    s6: 0,
  },
  { entidad: "08", totalSO: 154, totalOIC: 15, s1: 67, s2: 38, s3: 1, s6: 1 },
  { entidad: "09", totalSO: 89, totalOIC: 61, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "10", totalSO: 124, totalOIC: 80, s1: 0, s2: 109, s3: 21, s6: 0 },
  { entidad: "11", totalSO: 127, totalOIC: 12, s1: 10, s2: 19, s3: 12, s6: 0 },
  { entidad: "12", totalSO: 286, totalOIC: 221, s1: 3, s2: 6, s3: 6, s6: 0 },
  { entidad: "13", totalSO: 175, totalOIC: 6, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "14",
    totalSO: 483,
    totalOIC: 483,
    s1: 253,
    s2: 230,
    s3: 366,
    s6: 1,
  },
  { entidad: "15", totalSO: 420, totalOIC: 135, s1: 13, s2: 411, s3: 2, s6: 3 },
  {
    entidad: "16",
    totalSO: 265,
    totalOIC: 133,
    s1: 84,
    s2: 167,
    s3: 120,
    s6: 9,
  },
  { entidad: "17", totalSO: 140, totalOIC: 64, s1: 39, s2: 119, s3: 0, s6: 1 },
  { entidad: "18", totalSO: 110, totalOIC: 79, s1: 10, s2: 0, s3: 0, s6: 0 },
  { entidad: "19", totalSO: 395, totalOIC: 298, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "20", totalSO: 375, totalOIC: 286, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "21",
    totalSO: 308,
    totalOIC: 307,
    s1: 182,
    s2: 87,
    s3: 90,
    s6: 1,
  },
  { entidad: "22", totalSO: 127, totalOIC: 91, s1: 0, s2: 28, s3: 11, s6: 0 },
  { entidad: "23", totalSO: 86, totalOIC: 24, s1: 85, s2: 8, s3: 6, s6: 1 },
  { entidad: "24", totalSO: 184, totalOIC: 184, s1: 97, s2: 90, s3: 72, s6: 0 },
  { entidad: "25", totalSO: 192, totalOIC: 37, s1: 1, s2: 33, s3: 0, s6: 0 },
  { entidad: "26", totalSO: 172, totalOIC: 147, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "27", totalSO: 97, totalOIC: 97, s1: 1, s2: 81, s3: 97, s6: 0 },
  { entidad: "28", totalSO: 208, totalOIC: 201, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "29", totalSO: 209, totalOIC: 83, s1: 71, s2: 71, s3: 1, s6: 0 },
  { entidad: "30", totalSO: 325, totalOIC: 235, s1: 0, s2: 7, s3: 5, s6: 3 },
  { entidad: "31", totalSO: 191, totalOIC: 191, s1: 0, s2: 2, s3: 4, s6: 0 },
  { entidad: "32", totalSO: 156, totalOIC: 85, s1: 59, s2: 57, s3: 1, s6: 0 },
];
const colors = {
  S1: "#F29888",
  S2: "#B25FAC",
  S3: "#9085DA",
  S6: "#42A5CC",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { sistema, count, total, Total } = payload[0].payload;
    return (
      <div className="custom-tooltip p-2 border rounded shadow-lg bg-white text-black">
        <p className="label">{`${count} de ${total}`}</p>
        <p className="intro">{`Total: ${Total.toFixed(2)}%`}</p>
      </div>
    );
  }

  return null;
};

export function Overview({ entidad }: { entidad: string }) {
  const entityData = data.find((item) => item.entidad === entidad);

  if (!entityData) {
    return (
      <p className="pl-4">No hay información disponible para tu entidad.</p>
    );
  }

  const processedData = [
    {
      sistema: "S1",
      count: entityData.s1,
      total: entityData.totalSO,
      Total: (entityData.s1 / entityData.totalSO) * 100,
      color: colors.S1,
    },
    {
      sistema: "S2",
      count: entityData.s2,
      total: entityData.totalSO,
      Total: (entityData.s2 / entityData.totalSO) * 100,
      color: colors.S2,
    },
    {
      sistema: "S3",
      count: entityData.s3,
      total: entityData.totalOIC,
      Total: (entityData.s3 / entityData.totalOIC) * 100,
      color: colors.S3,
    },
    {
      sistema: "S6",
      count: entityData.s6,
      total: entityData.totalSO,
      Total: (entityData.s6 / entityData.totalSO) * 100,
      color: colors.S6,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={processedData}>
        <XAxis
          dataKey="sistema"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
          domain={[0, 100]} // Establece el rango del eje Y de 0 a 100
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Total" radius={[4, 4, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
