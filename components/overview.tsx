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
  { entidad: "02", totalSO: 17, totalOIC: 96, s1: 10, s2: 0, s3: 0, s6: 0 },
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
  { entidad: "06", totalSO: 82, totalOIC: 44, s1: 27, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "07",
    totalSO: 233,
    totalOIC: 166,
    s1: 233,
    s2: 230,
    s3: 0,
    s6: 0,
  },
  { entidad: "08", totalSO: 151, totalOIC: 21, s1: 69, s2: 67, s3: 15, s6: 1 },
  { entidad: "09", totalSO: 90, totalOIC: 61, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "10",
    totalSO: 127,
    totalOIC: 124,
    s1: 0,
    s2: 122,
    s3: 122,
    s6: 0,
  },
  { entidad: "11", totalSO: 126, totalOIC: 57, s1: 10, s2: 27, s3: 42, s6: 0 },
  { entidad: "12", totalSO: 153, totalOIC: 218, s1: 31, s2: 9, s3: 6, s6: 0 },
  { entidad: "13", totalSO: 181, totalOIC: 6, s1: 87, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "14",
    totalSO: 449,
    totalOIC: 449,
    s1: 387,
    s2: 245,
    s3: 386,
    s6: 2,
  },
  {
    entidad: "15",
    totalSO: 551,
    totalOIC: 135,
    s1: 7,
    s2: 334,
    s3: 111,
    s6: 6,
  },
  {
    entidad: "16",
    totalSO: 264,
    totalOIC: 125,
    s1: 133,
    s2: 166,
    s3: 125,
    s6: 70,
  },
  { entidad: "17", totalSO: 157, totalOIC: 65, s1: 130, s2: 119, s3: 0, s6: 2 },
  { entidad: "18", totalSO: 110, totalOIC: 79, s1: 10, s2: 0, s3: 0, s6: 0 },
  { entidad: "19", totalSO: 172, totalOIC: 17, s1: 0, s2: 0, s3: 0, s6: 15 },
  { entidad: "20", totalSO: 376, totalOIC: 286, s1: 0, s2: 0, s3: 0, s6: 0 },
  {
    entidad: "21",
    totalSO: 308,
    totalOIC: 307,
    s1: 307,
    s2: 307,
    s3: 90,
    s6: 1,
  },
  { entidad: "22", totalSO: 127, totalOIC: 91, s1: 127, s2: 42, s3: 4, s6: 0 },
  { entidad: "23", totalSO: 86, totalOIC: 23, s1: 86, s2: 8, s3: 21, s6: 1 },
  { entidad: "24", totalSO: 183, totalOIC: 184, s1: 96, s2: 99, s3: 0, s6: 0 },
  { entidad: "25", totalSO: 227, totalOIC: 39, s1: 2, s2: 58, s3: 22, s6: 0 },
  { entidad: "26", totalSO: 172, totalOIC: 147, s1: 0, s2: 0, s3: 0, s6: 0 },
  { entidad: "27", totalSO: 93, totalOIC: 93, s1: 64, s2: 0, s3: 0, s6: 0 },
  { entidad: "28", totalSO: 210, totalOIC: 201, s1: 143, s2: 0, s3: 0, s6: 0 },
  { entidad: "29", totalSO: 134, totalOIC: 1, s1: 70, s2: 70, s3: 0, s6: 0 },
  { entidad: "30", totalSO: 327, totalOIC: 241, s1: 0, s2: 48, s3: 44, s6: 3 },
  { entidad: "31", totalSO: 216, totalOIC: 191, s1: 0, s2: 2, s3: 4, s6: 0 },
  { entidad: "32", totalSO: 155, totalOIC: 85, s1: 148, s2: 65, s3: 0, s6: 0 },
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
