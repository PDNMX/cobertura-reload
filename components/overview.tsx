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
    "entidad": "00",
    "totalSO": 324,
    "totalOIC": 0,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "01",
    "totalSO": 93,
    "totalOIC": 67,
    "s1": 93,
    "s2": 90,
    "s3": 68,
    "s6": 9
  },
  {
    "entidad": "02",
    "totalSO": 132,
    "totalOIC": 94,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "03",
    "totalSO": 125,
    "totalOIC": 17,
    "s1": 125,
    "s2": 125,
    "s3": 18,
    "s6": 0
  },
  {
    "entidad": "04",
    "totalSO": 107,
    "totalOIC": 44,
    "s1": 0,
    "s2": 11,
    "s3": 1,
    "s6": 0
  },
  {
    "entidad": "05",
    "totalSO": 118,
    "totalOIC": 31,
    "s1": 0,
    "s2": 20,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "06",
    "totalSO": 74,
    "totalOIC": 32,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "07",
    "totalSO": 230,
    "totalOIC": 164,
    "s1": 207,
    "s2": 148,
    "s3": 64,
    "s6": 0
  },
  {
    "entidad": "08",
    "totalSO": 152,
    "totalOIC": 14,
    "s1": 67,
    "s2": 26,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "09",
    "totalSO": 89,
    "totalOIC": 60,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "10",
    "totalSO": 125,
    "totalOIC": 62,
    "s1": 1,
    "s2": 125,
    "s3": 2,
    "s6": 0
  },
  {
    "entidad": "11",
    "totalSO": 127,
    "totalOIC": 11,
    "s1": 10,
    "s2": 19,
    "s3": 12,
    "s6": 0
  },
  {
    "entidad": "12",
    "totalSO": 286,
    "totalOIC": 220,
    "s1": 1,
    "s2": 4,
    "s3": 4,
    "s6": 0
  },
  {
    "entidad": "13",
    "totalSO": 175,
    "totalOIC": 5,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "14",
    "totalSO": 485,
    "totalOIC": 361,
    "s1": 152,
    "s2": 133,
    "s3": 227,
    "s6": 0
  },
  {
    "entidad": "15",
    "totalSO": 420,
    "totalOIC": 134,
    "s1": 13,
    "s2": 411,
    "s3": 2,
    "s6": 3
  },
  {
    "entidad": "16",
    "totalSO": 265,
    "totalOIC": 132,
    "s1": 85,
    "s2": 157,
    "s3": 120,
    "s6": 1
  },
  {
    "entidad": "17",
    "totalSO": 140,
    "totalOIC": 63,
    "s1": 38,
    "s2": 114,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "18",
    "totalSO": 111,
    "totalOIC": 78,
    "s1": 9,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "19",
    "totalSO": 395,
    "totalOIC": 297,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "20",
    "totalSO": 375,
    "totalOIC": 285,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "21",
    "totalSO": 308,
    "totalOIC": 306,
    "s1": 165,
    "s2": 87,
    "s3": 89,
    "s6": 1
  },
  {
    "entidad": "22",
    "totalSO": 129,
    "totalOIC": 88,
    "s1": 0,
    "s2": 24,
    "s3": 7,
    "s6": 0
  },
  {
    "entidad": "23",
    "totalSO": 86,
    "totalOIC": 23,
    "s1": 85,
    "s2": 8,
    "s3": 6,
    "s6": 1
  },
  {
    "entidad": "24",
    "totalSO": 184,
    "totalOIC": 183,
    "s1": 97,
    "s2": 88,
    "s3": 57,
    "s6": 0
  },
  {
    "entidad": "25",
    "totalSO": 171,
    "totalOIC": 93,
    "s1": 0,
    "s2": 22,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "26",
    "totalSO": 172,
    "totalOIC": 146,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "27",
    "totalSO": 97,
    "totalOIC": 96,
    "s1": 1,
    "s2": 79,
    "s3": 97,
    "s6": 0
  },
  {
    "entidad": "28",
    "totalSO": 208,
    "totalOIC": 200,
    "s1": 0,
    "s2": 0,
    "s3": 0,
    "s6": 0
  },
  {
    "entidad": "29",
    "totalSO": 209,
    "totalOIC": 82,
    "s1": 71,
    "s2": 71,
    "s3": 1,
    "s6": 0
  },
  {
    "entidad": "30",
    "totalSO": 325,
    "totalOIC": 234,
    "s1": 0,
    "s2": 7,
    "s3": 11,
    "s6": 3
  },
  {
    "entidad": "31",
    "totalSO": 191,
    "totalOIC": 190,
    "s1": 0,
    "s2": 2,
    "s3": 4,
    "s6": 0
  },
  {
    "entidad": "32",
    "totalSO": 157,
    "totalOIC": 84,
    "s1": 1,
    "s2": 56,
    "s3": 1,
    "s6": 0
  }
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