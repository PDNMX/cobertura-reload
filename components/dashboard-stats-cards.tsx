// @ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLORES_SISTEMAS = {
  sistema1: "#F29888",
  sistema2: "#B25FAC",
  sistema3: "#9085DA",
  sistema6: "#42A5CC",
};

const NOMBRES_SISTEMAS = {
  sistema1: "Sistema 1",
  sistema2: "Sistema 2",
  sistema3: "Sistema 3",
  sistema6: "Sistema 6",
};

const DESCRIPCIONES_SISTEMAS = {
  sistema1: "Declaraciones",
  sistema2: "Servidores en contrataciones",
  sistema3: "Servidores sancionados",
  sistema6: "Contrataciones",
};

interface SistemaStats {
  conectados: number;
  total: number;
  porcentaje: number;
}

interface StatsCardsProps {
  stats: {
    sistema1: SistemaStats;
    sistema2: SistemaStats;
    sistema3: SistemaStats;
    sistema6: SistemaStats;
  };
}

export function DashboardStatsCards({ stats }: StatsCardsProps) {
  const sistemas = ["sistema1", "sistema2", "sistema3", "sistema6"] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {sistemas.map((sistema) => {
        const color = COLORES_SISTEMAS[sistema];
        const nombre = NOMBRES_SISTEMAS[sistema];
        const descripcion = DESCRIPCIONES_SISTEMAS[sistema];
        const { conectados, total, porcentaje } = stats[sistema];

        return (
          <Card key={sistema} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: color }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color }}
              >
                {nombre}
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color }}>
                {porcentaje.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {conectados.toLocaleString()} de {total.toLocaleString()} entes conectados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {descripcion}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
