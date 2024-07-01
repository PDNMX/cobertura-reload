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
import { useTheme } from 'next-themes';

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
    totalSO: 324,
    totalOIC: 31,
    s1: 2,
    s2: 263,
    s3: 18,
    s6: 294,
  },
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
  {
    entidad: "04",
    totalSO: 107,
    totalOIC: 45,
    s1: 0,
    s2: 10,
    s3: 1,
    s6: 0,
  },
  {
    entidad: "05",
    totalSO: 148,
    totalOIC: 95,
    s1: 0,
    s2: 19,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "06",
    totalSO: 74,
    totalOIC: 33,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "07",
    totalSO: 230,
    totalOIC: 164,
    s1: 207,
    s2: 148,
    s3: 63,
    s6: 0,
  },
  {
    entidad: "08",
    totalSO: 153,
    totalOIC: 15,
    s1: 67,
    s2: 22,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "09",
    totalSO: 89,
    totalOIC: 60,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "10",
    totalSO: 113,
    totalOIC: 167,
    s1: 0,
    s2: 84,
    s3: 1,
    s6: 0,
  },
  {
    entidad: "11",
    totalSO: 216,
    totalOIC: 13,
    s1: 9,
    s2: 11,
    s3: 13,
    s6: 0,
  },
  {
    entidad: "12",
    totalSO: 286,
    totalOIC: 221,
    s1: 1,
    s2: 3,
    s3: 1,
    s6: 0,
  },
  {
    entidad: "13",
    totalSO: 317,
    totalOIC: 283,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "14",
    totalSO: 445,
    totalOIC: 330,
    s1: 131,
    s2: 158,
    s3: 153,
    s6: 0,
  },
  {
    entidad: "15",
    totalSO: 419,
    totalOIC: 10,
    s1: 13,
    s2: 405,
    s3: 10,
    s6: 3,
  },
  {
    entidad: "16",
    totalSO: 302,
    totalOIC: 246,
    s1: 80,
    s2: 158,
    s3: 120,
    s6: 1,
  },
  {
    entidad: "17",
    totalSO: 140,
    totalOIC: 0,
    s1: 33,
    s2: 84,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "18",
    totalSO: 118,
    totalOIC: 83,
    s1: 9,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "19",
    totalSO: 395,
    totalOIC: 297,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "20",
    totalSO: 375,
    totalOIC: 286,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "21",
    totalSO: 308,
    totalOIC: 306,
    s1: 112,
    s2: 86,
    s3: 88,
    s6: 1,
  },
  {
    entidad: "22",
    totalSO: 131,
    totalOIC: 75,
    s1: 0,
    s2: 18,
    s3: 11,
    s6: 0,
  },
  {
    entidad: "23",
    totalSO: 84,
    totalOIC: 23,
    s1: 83,
    s2: 7,
    s3: 7,
    s6: 1,
  },
  {
    entidad: "24",
    totalSO: 184,
    totalOIC: 185,
    s1: 97,
    s2: 86,
    s3: 56,
    s6: 0,
  },
  {
    entidad: "25",
    totalSO: 171,
    totalOIC: 94,
    s1: 0,
    s2: 22,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "26",
    totalSO: 172,
    totalOIC: 147,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "27",
    totalSO: 97,
    totalOIC: 97,
    s1: 1,
    s2: 62,
    s3: 97,
    s6: 0,
  },
  {
    entidad: "28",
    totalSO: 208,
    totalOIC: 201,
    s1: 0,
    s2: 0,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "29",
    totalSO: 151,
    totalOIC: 1,
    s1: 71,
    s2: 4,
    s3: 1,
    s6: 0,
  },
  {
    entidad: "30",
    totalSO: 470,
    totalOIC: 423,
    s1: 2,
    s2: 2,
    s3: 0,
    s6: 3,
  },
  {
    entidad: "31",
    totalSO: 161,
    totalOIC: 86,
    s1: 0,
    s2: 1,
    s3: 0,
    s6: 0,
  },
  {
    entidad: "32",
    totalSO: 155,
    totalOIC: 85,
    s1: 1,
    s2: 53,
    s3: 0,
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
  const { theme } = useTheme();
  const entityData = data.find((item) => item.entidad === entidad);

  if (!entityData) {
    return (
      <p className="pl-4">No hay información disponible para tu entidad.</p>
    );
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

  const textColor = theme === "dark" ? "#8993A6" : "#1F2937"; // Usar colores del tema oscuro/claro

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
          tick={{ fill: textColor }} // Aplicar color dinámico
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
          tick={{ fill: textColor }} // Aplicar color dinámico
          domain={[0, 100]} // Establece el rango del eje Y de 0 a 100
        />
        <Tooltip
          formatter={(value) => `${Number(value).toFixed(2)}%`}
          contentStyle={{ color: textColor }} // Aplicar color dinámico al tooltip
        />
        <Bar dataKey="Total" radius={[4, 4, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}