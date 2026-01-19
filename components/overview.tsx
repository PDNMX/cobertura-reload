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
    totalSO: 337,
    totalOIC: 199,
    s1: 304,
    s2: 267,
    s3: 0,
    s6: 267,
  },
  { entidad: "01", totalSO: 92, totalOIC: 68, s1: 92, s2: 89, s3: 51, s6: 13 },
  { entidad: "02", totalSO: 138, totalOIC: 95, s1: 6, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "03",
    totalSO: 132,
    totalOIC: 20,
    s1: 132,
    s2: 132,
    s3: 20,
    s6: 42,
  },
  { entidad: "04", totalSO: 107, totalOIC: 45, s1: 77, s2: 17, s3: 1, s6: 0 },
  { entidad: "05", totalSO: 119, totalOIC: 32, s1: 0, s2: 20, s3: 0, s6: 0 },
  { entidad: "06", totalSO: 82, totalOIC: 44, s1: 25, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "07",
    totalSO: 232,
    totalOIC: 166,
    s1: 232,
    s2: 226,
    s3: 0,
    s6: 0,
  },
  { entidad: "08", totalSO: 150, totalOIC: 21, s1: 69, s2: 67, s3: 15, s6: 1 },
  { entidad: "09", totalSO: 90, totalOIC: 61, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "10",
    totalSO: 129,
    totalOIC: 124,
    s1: 0,
    s2: 123,
    s3: 122,
    s6: 0,
  },
  { entidad: "11", totalSO: 125, totalOIC: 38, s1: 10, s2: 23, s3: 38, s6: 0 },
  { entidad: "12", totalSO: 205, totalOIC: 222, s1: 11, s2: 6, s3: 6, s6: 0 },
  { entidad: "13", totalSO: 175, totalOIC: 6, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "14",
    totalSO: 466,
    totalOIC: 466,
    s1: 360,
    s2: 245,
    s3: 387,
    s6: 1,
  },
  { entidad: "15", totalSO: 551, totalOIC: 135, s1: 7, s2: 333, s3: 2, s6: 6 },
  {
    entidad: "16",
    totalSO: 265,
    totalOIC: 134,
    s1: 109,
    s2: 167,
    s3: 134,
    s6: 69,
  },
  { entidad: "17", totalSO: 143, totalOIC: 65, s1: 128, s2: 121, s3: 1, s6: 1 },
  { entidad: "18", totalSO: 110, totalOIC: 79, s1: 10, s2: 0, s3: 0, s6: 0 },
  { entidad: "19", totalSO: 172, totalOIC: 16, s1: 0, s2: 0, s3: 0, s6: 15 },
  { entidad: "20", totalSO: 376, totalOIC: 286, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "21",
    totalSO: 308,
    totalOIC: 307,
    s1: 294,
    s2: 280,
    s3: 90,
    s6: 1,
  },
  { entidad: "22", totalSO: 127, totalOIC: 91, s1: 0, s2: 40, s3: 0, s6: 0 },
  { entidad: "23", totalSO: 87, totalOIC: 25, s1: 87, s2: 9, s3: 23, s6: 1 },
  { entidad: "24", totalSO: 183, totalOIC: 184, s1: 96, s2: 99, s3: 0, s6: 0 },
  { entidad: "25", totalSO: 226, totalOIC: 37, s1: 1, s2: 53, s3: 16, s6: 0 },
  { entidad: "26", totalSO: 172, totalOIC: 147, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "27", totalSO: 97, totalOIC: 97, s1: 2, s2: 81, s3: 97, s6: 1 },
  { entidad: "28", totalSO: 210, totalOIC: 201, s1: 11, s2: 0, s3: 0, s6: 0 },
  { entidad: "29", totalSO: 135, totalOIC: 2, s1: 71, s2: 71, s3: 2, s6: 0 },
  { entidad: "30", totalSO: 325, totalOIC: 235, s1: 0, s2: 7, s3: 5, s6: 3 },
  { entidad: "31", totalSO: 191, totalOIC: 191, s1: 0, s2: 2, s3: 4, s6: 0 },
  { entidad: "32", totalSO: 155, totalOIC: 85, s1: 146, s2: 65, s3: 0, s6: 0 },
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
