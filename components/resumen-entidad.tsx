// @ts-nocheck
"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { MapPin, Search, Users, Building2, Scale, TrendingUp, CheckCircle2, XCircle, Loader2, Globe, ChevronRight, Layers, Gavel, BarChart2, Download } from "lucide-react";
import marcoGeoestadisticoInegi from "@/components/tables/cobertura-table/data-entidades";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { AvanceMapa } from "@/components/charts/avance-mapa";
import { EntidadBarChart } from "@/components/charts/entidad-bar-chart";

// Total de municipios según catálogo oficial
const TOTAL_MUNICIPIOS_CATALOGO = 2475;

const SISTEMAS_CONFIG = {
  resultSistema1: {
    color: "#F29888",
    nombre: "Sistema 1",
    shortName: "S1",
    descripcion: "Declaraciones Patrimoniales",
    tipo: "entes",
    icon: Users,
  },
  resultSistema2: {
    color: "#B25FAC",
    nombre: "Sistema 2",
    shortName: "S2",
    descripcion: "Servidores en Contrataciones",
    tipo: "entes",
    icon: Building2,
  },
  resultSistema3OIC: {
    color: "#9085DA",
    nombre: "Sistema 3",
    shortName: "S3",
    descripcion: "Servidores Sancionados",
    tipo: "oic",
    icon: Scale,
  },
  resultSistema6: {
    color: "#42A5CC",
    nombre: "Sistema 6",
    shortName: "S6",
    descripcion: "Contrataciones Públicas",
    tipo: "entes",
    icon: TrendingUp,
  },
};

interface EntidadData {
  entidad: string;
  resultSujetosObligados: number;
  resultOIC: number;
  resultSistema1: number;
  resultSistema2: number;
  resultSistema3OIC: number;
  resultSistema6: number;
}

interface ResumenEntidadProps {
  data: EntidadData[];
  dataAmbito: Record<string, any[]>;
  dataPoder: Record<string, any[]>;
  resumenConexiones: {
    entesConectados: number;
    totalEntes: number;
    oicConectados: number;
    totalOIC: number;
  };
  initialEntidadId?: string;
  onEntidadChange?: (id: string) => void;
}

// Función helper para formatear porcentaje (sin decimales si es 100% o 0%)
const formatPorcentaje = (porcentaje: number) => {
  if (porcentaje === 100 || porcentaje === 0) {
    return `${Math.round(porcentaje)}%`;
  }
  return `${porcentaje.toFixed(2)}%`;
};

// Componente de gráfica Donut con nombre del sistema debajo
const DonutChart = ({ conectados, total, color, nombre, shortName, descripcion }) => {
  const porcentaje = total > 0 ? (conectados / total) * 100 : 0;
  const data = [
    { name: "Conectados", value: conectados, color: color },
    { name: "Pendientes", value: Math.max(0, total - conectados), color: "var(--muted)" },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={42}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? entry.color : "#cbd5e1"} className="dark:opacity-80" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {formatPorcentaje(porcentaje)}
          </span>
        </div>
      </div>
      <span className="text-sm font-bold mt-2" style={{ color }}>{nombre}</span>
      <span className="text-xs text-foreground/60 text-center">{descripcion}</span>
      <span className="text-xs font-semibold text-foreground/70 mt-1">
        {conectados.toLocaleString()} / {total.toLocaleString()}
      </span>
    </div>
  );
};

// Componente de mini card para entidades
const EntidadMiniCard = ({ nombre, porcentaje, color, onClick }) => (
  <div
    onClick={onClick}
    className="p-3 rounded-lg border border-border/60 bg-card/80 dark:bg-card hover:bg-accent/50 dark:hover:bg-accent/30 cursor-pointer transition-all hover:shadow-md group"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium truncate flex-1 text-foreground">{nombre}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground/60">Avance</span>
        <span className="text-sm font-bold" style={{ color }}>{porcentaje.toFixed(2)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-muted/60 dark:bg-muted">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
    </div>
  </div>
);

// Card seleccionable de sistema para filtrar
const SistemaFilterCard = ({ sistema, config, stats, isSelected, onClick }) => {
  const Icon = config.icon;
  const porcentaje = stats.porcentaje;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden",
        isSelected
          ? "shadow-xl scale-[1.02]"
          : "border-border/50 hover:border-border hover:shadow-md bg-card/50"
      )}
      style={{
        borderColor: isSelected ? config.color : undefined,
        backgroundColor: isSelected ? `${config.color}10` : undefined,
      }}
    >
      {/* Barra de color en la parte superior cuando está seleccionado */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: config.color }}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isSelected ? "shadow-md" : ""
            )}
            style={{
              backgroundColor: isSelected ? `${config.color}25` : `${config.color}10`,
            }}
          >
            <Icon
              className="h-5 w-5 transition-all"
              style={{ color: config.color }}
            />
          </div>
          <div>
            <p
              className={cn(
                "font-bold text-base transition-all",
                isSelected ? "" : "text-muted-foreground"
              )}
              style={{ color: isSelected ? config.color : undefined }}
            >
              {config.nombre}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-2xl font-bold transition-all",
              !isSelected && "text-muted-foreground"
            )}
            style={{ color: isSelected ? config.color : undefined }}
          >
            {formatPorcentaje(porcentaje)}
          </p>
        </div>
      </div>
      {/* Barra de progreso */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-muted/50">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: config.color,
            opacity: isSelected ? 1 : 0.5
          }}
        />
      </div>
    </div>
  );
};

// Indicador compacto de totales
const TotalesIndicador = ({
  totalEntes,
  totalOIC,
  entesConectados,
  oicConectados,
  totalMunicipios,
  municipiosRegistrados,
  coberturaPromedio
}) => {
  const porcentajeEntes = totalEntes > 0 ? (entesConectados / totalEntes) * 100 : 0;
  const porcentajeOIC = totalOIC > 0 ? (oicConectados / totalOIC) * 100 : 0;
  const porcentajeMunicipios = totalMunicipios > 0 ? (municipiosRegistrados / totalMunicipios) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Entes Públicos */}
      <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/5 dark:from-blue-500/25 dark:to-blue-700/15 rounded-xl p-4 border border-blue-500/30 dark:border-blue-400/40 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 dark:bg-blue-400/25">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">Entes Públicos</span>
        </div>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalEntes.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">{entesConectados.toLocaleString()}</span>
          <span className="text-xs text-foreground/60">conectados</span>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 ml-auto">{formatPorcentaje(porcentajeEntes)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-blue-500/25 dark:bg-blue-400/30 mt-2">
          <div className="h-full rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: `${Math.min(porcentajeEntes, 100)}%` }} />
        </div>
      </div>

      {/* OIC */}
      <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 dark:from-amber-500/25 dark:to-amber-700/15 rounded-xl p-4 border border-amber-500/30 dark:border-amber-400/40 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 dark:bg-amber-400/25">
            <Scale className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-200">OIC / Autoridades</span>
        </div>
        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalOIC.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">{oicConectados.toLocaleString()}</span>
          <span className="text-xs text-foreground/60">conectados</span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 ml-auto">{formatPorcentaje(porcentajeOIC)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-amber-500/25 dark:bg-amber-400/30 mt-2">
          <div className="h-full rounded-full bg-amber-500 dark:bg-amber-400" style={{ width: `${Math.min(porcentajeOIC, 100)}%` }} />
        </div>
      </div>

      {/* Cobertura Promedio */}
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 dark:from-emerald-500/25 dark:to-emerald-700/15 rounded-xl p-4 border border-emerald-500/30 dark:border-emerald-400/40 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 dark:bg-emerald-400/25">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">Cobertura Promedio</span>
        </div>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{coberturaPromedio.toFixed(2)}%</p>
        <p className="text-xs text-foreground/60 mt-1">Promedio S1, S2 y S6</p>
        <div className="h-2 rounded-full overflow-hidden bg-emerald-500/25 dark:bg-emerald-400/30 mt-2">
          <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${Math.min(coberturaPromedio, 100)}%` }} />
        </div>
      </div>

      {/* Municipios */}
      <div className="bg-gradient-to-br from-violet-500/15 to-violet-600/5 dark:from-violet-500/25 dark:to-violet-700/15 rounded-xl p-4 border border-violet-500/30 dark:border-violet-400/40 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 dark:bg-violet-400/25">
            <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          </div>
          <span className="text-xs font-semibold text-violet-700 dark:text-violet-200">Municipios</span>
        </div>
        <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{totalMunicipios.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-violet-700 dark:text-violet-300 font-semibold">{municipiosRegistrados?.toLocaleString() || 0}</span>
          <span className="text-xs text-foreground/60">registrados</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-violet-500/25 dark:bg-violet-400/30 mt-2">
          <div className="h-full rounded-full bg-violet-500 dark:bg-violet-400" style={{ width: `${Math.min(porcentajeMunicipios, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

export function ResumenEntidad({ data, dataAmbito, dataPoder, resumenConexiones, initialEntidadId = "", onEntidadChange }: ResumenEntidadProps) {
  const [selectedEntidad, setSelectedEntidad] = useState<string>(initialEntidadId);
  const [selectedSistema, setSelectedSistema] = useState<string>("resultSistema1");
  const [municipiosData, setMunicipiosData] = useState(null);
  const [municipiosNacionales, setMunicipiosNacionales] = useState(null);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [entesConectadosEntidad, setEntesConectadosEntidad] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Ref para capturar la card principal
  const cardRef = useRef<HTMLDivElement>(null);

  // Lista de entidades ordenadas alfabéticamente para el Combobox
  const entidadesOptions = useMemo(() => {
    return [
      { value: "", label: "Ver Resumen Nacional" },
      ...marcoGeoestadisticoInegi
        .map((e) => ({ value: e.id, label: e.nombre }))
        .sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, []);

  // Estadísticas nacionales
  const statsNacionales = useMemo(() => {
    if (data.length === 0) return null;

    const totalEntes = data.reduce((acc, e) => acc + (e.resultSujetosObligados || 0), 0);
    const totalOIC = data.reduce((acc, e) => acc + (e.resultOIC || 0), 0);
    const s1 = data.reduce((acc, e) => acc + (e.resultSistema1 || 0), 0);
    const s2 = data.reduce((acc, e) => acc + (e.resultSistema2 || 0), 0);
    const s3 = data.reduce((acc, e) => acc + (e.resultSistema3OIC || 0), 0);
    const s6 = data.reduce((acc, e) => acc + (e.resultSistema6 || 0), 0);

    return {
      totalEntes,
      totalOIC,
      totalEntidades: data.length,
      sistemas: {
        resultSistema1: { conectados: s1, total: totalEntes, porcentaje: totalEntes > 0 ? (s1 / totalEntes) * 100 : 0 },
        resultSistema2: { conectados: s2, total: totalEntes, porcentaje: totalEntes > 0 ? (s2 / totalEntes) * 100 : 0 },
        resultSistema3OIC: { conectados: s3, total: totalOIC, porcentaje: totalOIC > 0 ? (s3 / totalOIC) * 100 : 0 },
        resultSistema6: { conectados: s6, total: totalEntes, porcentaje: totalEntes > 0 ? (s6 / totalEntes) * 100 : 0 },
      },
    };
  }, [data]);

  // Datos de la entidad seleccionada
  const entidadData = useMemo(() => {
    if (!selectedEntidad) return null;
    return data.find((d) => d.entidad === selectedEntidad);
  }, [data, selectedEntidad]);

  // Nombre de la entidad
  const nombreEntidad = useMemo(() => {
    if (!selectedEntidad) return "";
    const found = marcoGeoestadisticoInegi.find((e) => e.id === selectedEntidad);
    return found?.nombre || "Entidad no encontrada";
  }, [selectedEntidad]);

  // ── Descarga ──────────────────────────────────────────────────────────────

  // Función para formatear la fecha de descarga
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Nombre de archivo base
  const getFileName = (ext: string) => {
    const entidad = selectedEntidad ? nombreEntidad : "Nacional";
    const dateStr = new Date().toISOString().split("T")[0];
    return `estadisticas-PDN-${entidad.replace(/\s+/g, "-")}-${dateStr}.${ext}`;
  };

  // Obtener color de fondo resuelto (no CSS var)
  const getBackgroundColor = () => {
    if (!cardRef.current) return "#ffffff";
    const style = window.getComputedStyle(cardRef.current);
    const bg = style.backgroundColor;
    return bg === "rgba(0, 0, 0, 0)" || !bg ? "#ffffff" : bg;
  };

  // Descargar como PNG
  const handleDownloadPNG = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    // Pequeña espera para que el watermark de fecha se renderice
    await new Promise((r) => setTimeout(r, 100));
    try {
      const { toPng } = await import("html-to-image");
      const bgColor = getBackgroundColor();
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bgColor,
      });
      const link = document.createElement("a");
      link.download = getFileName("png");
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al descargar PNG:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedEntidad, nombreEntidad]);

  // ─────────────────────────────────────────────────────────────────────────

  // Cargar municipios nacionales al inicio
  useEffect(() => {
    async function fetchMunicipiosNacionales() {
      try {
        const [entesConMunicipio, s1Municipios, s2Municipios, s3Municipios, s6Municipios] = await Promise.all([
          directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false }, municipio: { _nnull: true } },
              aggregate: { count: ["*"], countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false }, sistema1: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false }, sistema2: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: {
                sistema3: { _eq: true },
                municipio: { _nnull: true },
                _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }],
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false }, sistema6: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
        ]);

        setMunicipiosNacionales({
          totalCatalogo: TOTAL_MUNICIPIOS_CATALOGO,
          entesConMunicipio: Number(entesConMunicipio[0]?.count || 0),
          municipiosRegistrados: Number(entesConMunicipio[0]?.countDistinct?.municipio || 0),
          s1: Number(s1Municipios[0]?.countDistinct?.municipio || 0),
          s2: Number(s2Municipios[0]?.countDistinct?.municipio || 0),
          s3: Number(s3Municipios[0]?.countDistinct?.municipio || 0),
          s6: Number(s6Municipios[0]?.countDistinct?.municipio || 0),
        });
      } catch (error) {
        console.error("Error al cargar municipios nacionales:", error);
      }
    }
    fetchMunicipiosNacionales();
  }, []);

  // Cache de municipios por entidad
  const [municipiosCache, setMunicipiosCache] = useState<Record<string, any>>({});

  // Cargar datos de municipios cuando se selecciona una entidad
  useEffect(() => {
    async function fetchMunicipiosData() {
      if (!selectedEntidad) {
        setMunicipiosData(null);
        setEntesConectadosEntidad(0);
        return;
      }

      if (municipiosCache[selectedEntidad]) {
        setMunicipiosData(municipiosCache[selectedEntidad]);
        setEntesConectadosEntidad(municipiosCache[selectedEntidad].entesConectados || 0);
        return;
      }

      setLoadingMunicipios(true);
      try {
        const catalogoMunicipios = await directus.request(
          readItems("municipio", {
            filter: { id_entidad: { _eq: selectedEntidad } },
            aggregate: { count: ["*"] },
          })
        );

        const totalCatalogo = Number(catalogoMunicipios[0]?.count || 0);

        const [entesConMunicipio, s1Municipios, s2Municipios, s3Municipios, s6Municipios] = await Promise.all([
          directus.request(
            readItems("entes", {
              filter: { entidad: { _eq: selectedEntidad }, controlOIC: { _eq: false }, municipio: { _nnull: true } },
              aggregate: { count: ["*"], countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { entidad: { _eq: selectedEntidad }, controlOIC: { _eq: false }, sistema1: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { entidad: { _eq: selectedEntidad }, controlOIC: { _eq: false }, sistema2: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                sistema3: { _eq: true },
                municipio: { _nnull: true },
                _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }],
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          directus.request(
            readItems("entes", {
              filter: { entidad: { _eq: selectedEntidad }, controlOIC: { _eq: false }, sistema6: { _eq: true }, municipio: { _nnull: true } },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
        ]);

        // Query adicional para entes conectados de la entidad
        const entesConectadosResult = await directus.request(
          readItems("entes", {
            filter: {
              entidad: { _eq: selectedEntidad },
              controlOIC: { _eq: false },
              _or: [
                { sistema1: { _eq: true } },
                { sistema2: { _eq: true } },
                { sistema6: { _eq: true } },
              ],
            },
            aggregate: { count: ["*"] },
          })
        );

        const result = {
          totalCatalogo,
          entesConMunicipio: Number(entesConMunicipio[0]?.count || 0),
          municipiosRegistrados: Number(entesConMunicipio[0]?.countDistinct?.municipio || 0),
          s1: Number(s1Municipios[0]?.countDistinct?.municipio || 0),
          s2: Number(s2Municipios[0]?.countDistinct?.municipio || 0),
          s3: Number(s3Municipios[0]?.countDistinct?.municipio || 0),
          s6: Number(s6Municipios[0]?.countDistinct?.municipio || 0),
          entesConectados: Number(entesConectadosResult[0]?.count || 0),
        };

        setMunicipiosCache(prev => ({ ...prev, [selectedEntidad]: result }));
        setMunicipiosData(result);
        setEntesConectadosEntidad(result.entesConectados);
      } catch (error) {
        console.error("Error al cargar datos de municipios:", error);
        setMunicipiosData(null);
      } finally {
        setLoadingMunicipios(false);
      }
    }

    fetchMunicipiosData();
  }, [selectedEntidad, municipiosCache]);

  // Calcular estadísticas de la entidad seleccionada
  const estadisticasEntidad = useMemo(() => {
    if (!entidadData) return null;

    const totalEntes = entidadData.resultSujetosObligados || 0;
    const totalOIC = entidadData.resultOIC || 0;

    return {
      totalEntes,
      totalOIC,
      sistemas: {
        resultSistema1: { conectados: entidadData.resultSistema1 || 0, total: totalEntes, porcentaje: totalEntes > 0 ? ((entidadData.resultSistema1 || 0) / totalEntes) * 100 : 0 },
        resultSistema2: { conectados: entidadData.resultSistema2 || 0, total: totalEntes, porcentaje: totalEntes > 0 ? ((entidadData.resultSistema2 || 0) / totalEntes) * 100 : 0 },
        resultSistema3OIC: { conectados: entidadData.resultSistema3OIC || 0, total: totalOIC, porcentaje: totalOIC > 0 ? ((entidadData.resultSistema3OIC || 0) / totalOIC) * 100 : 0 },
        resultSistema6: { conectados: entidadData.resultSistema6 || 0, total: totalEntes, porcentaje: totalEntes > 0 ? ((entidadData.resultSistema6 || 0) / totalEntes) * 100 : 0 },
      },
    };
  }, [entidadData]);

  // Usar estadísticas nacionales o de entidad según selección
  const estadisticas = selectedEntidad ? estadisticasEntidad : statsNacionales;
  const currentMunicipios = selectedEntidad ? municipiosData : municipiosNacionales;

  // Datos para el mapa (con nombres de entidad)
  const dataMapaConNombres = useMemo(() => {
    return data.map((dato) => {
      const entidadEncontrada = marcoGeoestadisticoInegi.find(
        (entidad) => entidad.id === dato.entidad
      );
      const nombreEntidad = entidadEncontrada?.nombre || "Entidad no encontrada";

      let count = 0;
      if (selectedSistema === "resultSistema3OIC") {
        count = dato.resultOIC > 0
          ? Number(((dato.resultSistema3OIC / dato.resultOIC) * 100).toFixed(2))
          : 0;
      } else {
        count = dato.resultSujetosObligados > 0
          ? Number(((dato[selectedSistema] / dato.resultSujetosObligados) * 100).toFixed(2))
          : 0;
      }

      return {
        ...dato,
        nombreEntidad,
        count,
      };
    });
  }, [data, selectedSistema]);

  // Top 5 entidades con mejor avance
  const topEntidades = useMemo(() => {
    return data
      .map((e) => {
        const totalEntes = e.resultSujetosObligados || 0;
        const promedio = totalEntes > 0
          ? ((e.resultSistema1 || 0) + (e.resultSistema2 || 0) + (e.resultSistema6 || 0)) / (3 * totalEntes) * 100
          : 0;
        const nombre = marcoGeoestadisticoInegi.find((ent) => ent.id === e.entidad)?.nombre || "Desconocido";
        return { id: e.entidad, nombre, promedio };
      })
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5);
  }, [data]);

  // Entidades que requieren atención (menor avance)
  const entidadesAtencion = useMemo(() => {
    return data
      .map((e) => {
        const totalEntes = e.resultSujetosObligados || 0;
        const promedio = totalEntes > 0
          ? ((e.resultSistema1 || 0) + (e.resultSistema2 || 0) + (e.resultSistema6 || 0)) / (3 * totalEntes) * 100
          : 0;
        const nombre = marcoGeoestadisticoInegi.find((ent) => ent.id === e.entidad)?.nombre || "Desconocido";
        return { id: e.entidad, nombre, promedio };
      })
      .sort((a, b) => a.promedio - b.promedio)
      .slice(0, 5);
  }, [data]);

  // Cobertura promedio
  const coberturaPromedio = useMemo(() => {
    if (!estadisticas) return 0;
    return (
      estadisticas.sistemas.resultSistema1.porcentaje +
      estadisticas.sistemas.resultSistema2.porcentaje +
      estadisticas.sistemas.resultSistema6.porcentaje
    ) / 3;
  }, [estadisticas]);

  // Custom tooltip para ámbito y poder
  const CustomAmbitoPoderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { conectados, totalEntes, count } = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{`${conectados} de ${totalEntes}`}</p>
          <p className="text-sm" style={{ color: SISTEMAS_CONFIG[selectedSistema].color }}>{`${count}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Card principal con selector y estadísticas integradas */}
      <Card ref={cardRef} className="border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                {selectedEntidad ? <MapPin className="h-6 w-6 text-primary" /> : <Globe className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {selectedEntidad ? nombreEntidad : "República Mexicana"}
                </CardTitle>
                <CardDescription>
                  {selectedEntidad
                    ? "Dashboard de Interconexión con la PDN"
                    : "32 Entidades Federativas y Federación"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-[300px]">
                <Combobox
                  options={entidadesOptions}
                  value={selectedEntidad}
                  onChange={(id) => {
                    setSelectedEntidad(id);
                    if (onEntidadChange) onEntidadChange(id);
                  }}
                  placeholder="Seleccionar entidad federativa..."
                />
              </div>
              {/* Botón de descarga PNG */}
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={handleDownloadPNG}
                className="shrink-0 gap-1.5"
                title="Descargar como imagen PNG"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline text-xs">Descargar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {estadisticas && (
          <CardContent className="space-y-6">
            {/* Título de Resumen General */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Resumen General</span>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Indicadores compactos de totales */}
            <TotalesIndicador
              totalEntes={estadisticas.totalEntes}
              totalOIC={estadisticas.totalOIC}
              entesConectados={
                selectedEntidad
                  ? currentMunicipios?.entesConectados || 0
                  : resumenConexiones?.entesConectados || 0
              }
              oicConectados={
                selectedEntidad
                  ? estadisticas.sistemas.resultSistema3OIC.conectados
                  : resumenConexiones?.oicConectados || 0
              }
              totalMunicipios={currentMunicipios?.totalCatalogo || (selectedEntidad ? 0 : TOTAL_MUNICIPIOS_CATALOGO)}
              municipiosRegistrados={currentMunicipios?.municipiosRegistrados}
              coberturaPromedio={coberturaPromedio}
            />

            {/* Gráficas de Donut por sistema y Municipios */}
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Avance por Sistema - 3/4 del espacio */}
              <div className="lg:col-span-3">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/20 dark:bg-primary/25">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Avance por Sistema</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                    const stats = estadisticas.sistemas[key];
                    return (
                      <div key={key} className="flex flex-col items-center p-4 rounded-xl border border-border/50 bg-card/50 dark:bg-card/80 hover:bg-accent/30 dark:hover:bg-accent/20 transition-colors shadow-sm">
                        <DonutChart
                          conectados={stats.conectados}
                          total={stats.total}
                          color={config.color}
                          nombre={config.nombre}
                          shortName={config.shortName}
                          descripcion={config.descripcion}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Municipios Conectados por Sistema - 1/4 del espacio */}
              <div className="lg:col-span-1">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-500/20 dark:bg-violet-400/25">
                    <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-foreground">Municipios</span>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 ml-auto">
                    {currentMunicipios?.municipiosRegistrados || 0}/{currentMunicipios?.totalCatalogo || (selectedEntidad ? 0 : TOTAL_MUNICIPIOS_CATALOGO)}
                  </span>
                </h4>
                <div className="p-4 rounded-xl border border-border/50 bg-card/50 dark:bg-card/80 shadow-sm">
                  {currentMunicipios ? (
                    <div className="space-y-3">
                      {/* Sistema 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: '#F29888' }}>S1</span>
                          <span className="text-xs font-bold" style={{ color: '#F29888' }}>
                            {currentMunicipios.s1 || 0}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-muted/60 dark:bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMunicipios.totalCatalogo > 0 ? ((currentMunicipios.s1 || 0) / currentMunicipios.totalCatalogo) * 100 : 0}%`,
                              backgroundColor: '#F29888'
                            }}
                          />
                        </div>
                      </div>

                      {/* Sistema 2 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: '#B25FAC' }}>S2</span>
                          <span className="text-xs font-bold" style={{ color: '#B25FAC' }}>
                            {currentMunicipios.s2 || 0}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-muted/60 dark:bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMunicipios.totalCatalogo > 0 ? ((currentMunicipios.s2 || 0) / currentMunicipios.totalCatalogo) * 100 : 0}%`,
                              backgroundColor: '#B25FAC'
                            }}
                          />
                        </div>
                      </div>

                      {/* Sistema 3 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: '#9085DA' }}>S3</span>
                          <span className="text-xs font-bold" style={{ color: '#9085DA' }}>
                            {currentMunicipios.s3 || 0}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-muted/60 dark:bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMunicipios.totalCatalogo > 0 ? ((currentMunicipios.s3 || 0) / currentMunicipios.totalCatalogo) * 100 : 0}%`,
                              backgroundColor: '#9085DA'
                            }}
                          />
                        </div>
                      </div>

                      {/* Sistema 6 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: '#42A5CC' }}>S6</span>
                          <span className="text-xs font-bold" style={{ color: '#42A5CC' }}>
                            {currentMunicipios.s6 || 0}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-muted/60 dark:bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMunicipios.totalCatalogo > 0 ? ((currentMunicipios.s6 || 0) / currentMunicipios.totalCatalogo) * 100 : 0}%`,
                              backgroundColor: '#42A5CC'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Solo mostrar ranking de entidades en vista nacional */}
            {!selectedEntidad && (
              <>
                {/* Título separador para ranking */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Ranking de Entidades</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Top entidades */}
                  <div className="rounded-xl border border-green-500/30 dark:border-green-400/40 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-700/10 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-green-500/20 dark:bg-green-400/25">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-green-700 dark:text-green-300">Mayor Avance</h4>
                    </div>
                    <div className="space-y-2">
                      {topEntidades.map((entidad, index) => (
                        <EntidadMiniCard
                          key={entidad.id}
                          nombre={`${index + 1}. ${entidad.nombre}`}
                          porcentaje={entidad.promedio}
                          color="#10b981"
                          onClick={() => setSelectedEntidad(entidad.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Entidades que requieren atención */}
                  <div className="rounded-xl border border-red-500/30 dark:border-red-400/40 bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-500/20 dark:to-red-700/10 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-red-500/20 dark:bg-red-400/25">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300">Requieren Atención</h4>
                    </div>
                    <div className="space-y-2">
                      {entidadesAtencion.map((entidad, index) => (
                        <EntidadMiniCard
                          key={entidad.id}
                          nombre={`${index + 1}. ${entidad.nombre}`}
                          porcentaje={entidad.promedio}
                          color="#ef4444"
                          onClick={() => setSelectedEntidad(entidad.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Separador visual para análisis detallado */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Análisis Detallado por Sistema</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Cards de filtro por sistema */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => (
                    <SistemaFilterCard
                      key={key}
                      sistema={key}
                      config={config}
                      stats={estadisticas.sistemas[key]}
                      isSelected={selectedSistema === key}
                      onClick={() => setSelectedSistema(key)}
                    />
                  ))}
                </div>

                {/* Mapa a la izquierda, Ámbito y Poder a la derecha */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Mapa de México */}
                  <AvanceMapa
                    data={dataMapaConNombres}
                    baseColor={SISTEMAS_CONFIG[selectedSistema].color}
                  />

                  {/* Gráficas de Ámbito y Poder apiladas */}
                  <div className="flex flex-col gap-4">
                    {/* Por Ámbito */}
                    <div className="rounded-xl border border-border/50 bg-card/50 dark:bg-card/80 p-4 flex-1 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${SISTEMAS_CONFIG[selectedSistema].color}20` }}>
                          <Layers className="h-4 w-4" style={{ color: SISTEMAS_CONFIG[selectedSistema].color }} />
                        </div>
                        <h4 className="font-semibold text-sm">Por Ámbito de Gobierno</h4>
                      </div>
                      {dataAmbito[selectedSistema] && (
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataAmbito[selectedSistema]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                              <XAxis dataKey="ambito" fontSize={12} className="fill-foreground" />
                              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} className="fill-foreground" />
                              <Tooltip content={<CustomAmbitoPoderTooltip />} />
                              <Bar dataKey="count" fill={SISTEMAS_CONFIG[selectedSistema].color} radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="count" position="top" fontSize={11} formatter={(v) => `${v}%`} className="fill-foreground" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Por Poder */}
                    <div className="rounded-xl border border-border/50 bg-card/50 dark:bg-card/80 p-4 flex-1 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${SISTEMAS_CONFIG[selectedSistema].color}20` }}>
                          <Gavel className="h-4 w-4" style={{ color: SISTEMAS_CONFIG[selectedSistema].color }} />
                        </div>
                        <h4 className="font-semibold text-sm">Por Poder de Gobierno</h4>
                      </div>
                      {dataPoder[selectedSistema] && (
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataPoder[selectedSistema]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                              <XAxis dataKey="poder" fontSize={12} className="fill-foreground" />
                              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} className="fill-foreground" />
                              <Tooltip content={<CustomAmbitoPoderTooltip />} />
                              <Bar dataKey="count" fill={SISTEMAS_CONFIG[selectedSistema].color} radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="count" position="top" fontSize={11} formatter={(v) => `${v}%`} className="fill-foreground" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gráfica original de Entidad (la que usan para reportes) */}
                <EntidadBarChart
                  data={data}
                  selectedColumn={selectedSistema}
                />
              </>
            )}

            {/* Detalle de conexión por sistema (solo en vista de entidad) */}
            {selectedEntidad && (
              <>
                {/* Separador visual para detalle */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Detalle por Sistema</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                    const stats = estadisticas.sistemas[key];
                    const Icon = config.icon;
                    const isOIC = config.tipo === "oic";

                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl border bg-muted/20 hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: config.color, borderLeftWidth: 4 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
                              <Icon className="h-5 w-5" style={{ color: config.color }} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{config.shortName}</h4>
                              <p className="text-xs text-muted-foreground">{config.nombre}</p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium",
                              isOIC
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            )}
                          >
                            {isOIC ? "OIC" : "Entes"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Avance</span>
                            <span className="text-2xl font-bold" style={{ color: config.color }}>
                              {formatPorcentaje(stats.porcentaje)}
                            </span>
                          </div>

                          <div className="h-2 rounded-full overflow-hidden bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${stats.porcentaje}%`, backgroundColor: config.color }}
                            />
                          </div>

                          <p className="text-xs text-muted-foreground">{config.descripcion}</p>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Conectados</p>
                              <p className="font-semibold text-green-600">{stats.conectados.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Pendientes</p>
                              <p className="font-semibold text-red-500">{(stats.total - stats.conectados).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {/* Marca de fecha de descarga - solo visible al exportar */}
            {isDownloading && (
              <div className="border-t pt-4 mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Plataforma Digital Nacional — Tablero de Interconexión</span>
                <span>Generado el {getFormattedDate()}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
