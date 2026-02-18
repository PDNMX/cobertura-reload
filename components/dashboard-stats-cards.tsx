// @ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SISTEMAS_CONFIG = {
  sistema1: {
    color: "#F29888",
    nombre: "Sistema 1",
    descripcion: "Declaraciones",
    tipo: "entes", // Sujetos Obligados
  },
  sistema2: {
    color: "#B25FAC",
    nombre: "Sistema 2",
    descripcion: "Servidores en contrataciones",
    tipo: "entes",
  },
  sistema3: {
    color: "#9085DA",
    nombre: "Sistema 3",
    descripcion: "Servidores sancionados",
    tipo: "oic", // OIC / Autoridades Resolutoras
  },
  sistema6: {
    color: "#42A5CC",
    nombre: "Sistema 6",
    descripcion: "Contrataciones",
    tipo: "entes",
  },
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
  selectedSistema: string;
  onSelectSistema: (sistema: string) => void;
}

export function DashboardStatsCards({ stats, selectedSistema, onSelectSistema }: StatsCardsProps) {
  const sistemas = ["sistema1", "sistema2", "sistema3", "sistema6"] as const;

  // Mapeo de keys para compatibilidad
  const sistemaKeyMap = {
    sistema1: "resultSistema1",
    sistema2: "resultSistema2",
    sistema3: "resultSistema3OIC",
    sistema6: "resultSistema6",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {sistemas.map((sistema) => {
        const config = SISTEMAS_CONFIG[sistema];
        const { conectados, total, porcentaje } = stats[sistema];
        const isActive = selectedSistema === sistemaKeyMap[sistema];
        const isOIC = config.tipo === "oic";

        return (
          <Card
            key={sistema}
            onClick={() => onSelectSistema(sistemaKeyMap[sistema])}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out border-2",
              isActive
                ? "scale-[1.03] shadow-2xl border-transparent"
                : "opacity-50 grayscale-[30%] hover:opacity-75 hover:grayscale-0 hover:scale-[1.01] border-transparent"
            )}
            style={{
              borderColor: isActive ? config.color : undefined,
              boxShadow: isActive
                ? `0 0 30px ${config.color}50, 0 8px 32px rgba(0,0,0,0.15)`
                : "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Barra lateral de color */}
            <div
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-300",
                isActive ? "w-2" : "w-1"
              )}
              style={{
                backgroundColor: config.color,
                opacity: isActive ? 1 : 0.5,
              }}
            />

            {/* Indicador de tipo (Entes vs OIC) */}
            <div
              className={cn(
                "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium transition-opacity duration-300",
                isOIC
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                isActive ? "opacity-100" : "opacity-50"
              )}
            >
              {isOIC ? "OIC" : "Entes"}
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle
                className={cn(
                  "text-sm font-medium transition-all duration-300",
                  isActive ? "font-bold" : "font-normal"
                )}
                style={{
                  color: config.color,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {config.nombre}
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-4">
              <div
                className={cn(
                  "font-bold transition-all duration-300",
                  isActive ? "text-4xl" : "text-2xl"
                )}
                style={{
                  color: config.color,
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {porcentaje.toFixed(2)}%
              </div>
              <p className={cn(
                "text-xs mt-1 transition-opacity duration-300",
                isActive ? "text-foreground" : "text-muted-foreground/60"
              )}>
                {conectados.toLocaleString()} de {total.toLocaleString()} conectados
              </p>
              <p className={cn(
                "text-xs mt-0.5 transition-opacity duration-300",
                isActive ? "text-muted-foreground" : "text-muted-foreground/50"
              )}>
                {config.descripcion}
              </p>
            </CardContent>

            {/* Efecto de brillo cuando está activo */}
            {isActive && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${config.color}20 0%, transparent 60%)`,
                }}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}

// Componente separado para mostrar el resumen de Entes vs OIC
interface ResumenConexionesProps {
  entesConectados: number;
  totalEntes: number;
  oicConectados: number;
  totalOIC: number;
}

export function ResumenConexiones({
  entesConectados,
  totalEntes,
  oicConectados,
  totalOIC,
}: ResumenConexionesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-4">
      {/* Card Entes Públicos */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Entes Públicos Conectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {entesConectados.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalEntes.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Conectados en S1, S2 o S6
          </p>
          <div className="mt-2 h-2 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${totalEntes > 0 ? (entesConectados / totalEntes) * 100 : 0}%` }}
            />
          </div>
          <p className="text-right text-xs text-blue-600 dark:text-blue-400 mt-1">
            {totalEntes > 0 ? ((entesConectados / totalEntes) * 100).toFixed(2) : 0}%
          </p>
        </CardContent>
      </Card>

      {/* Card OIC / Autoridades Resolutoras */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Órganos Internos de Control / Autoridades Resolutoras Conectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {oicConectados.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalOIC.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Conectados en Sistema 3
          </p>
          <div className="mt-2 h-2 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${totalOIC > 0 ? (oicConectados / totalOIC) * 100 : 0}%` }}
            />
          </div>
          <p className="text-right text-xs text-amber-600 dark:text-amber-400 mt-1">
            {totalOIC > 0 ? ((oicConectados / totalOIC) * 100).toFixed(2) : 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
