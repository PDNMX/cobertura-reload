// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { MapPin, Search, Users, Building2, Scale, TrendingUp, CheckCircle2, XCircle, Loader2, Globe, ChevronRight } from "lucide-react";
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
} from "recharts";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";

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
    { name: "Pendientes", value: Math.max(0, total - conectados), color: "#e5e7eb" },
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
                <Cell key={`cell-${index}`} fill={entry.color} />
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
      <span className="text-sm font-semibold mt-2" style={{ color }}>{nombre}</span>
      <span className="text-xs text-muted-foreground">{descripcion}</span>
      <span className="text-xs text-muted-foreground mt-1">
        {conectados.toLocaleString()} / {total.toLocaleString()}
      </span>
    </div>
  );
};

// Componente de KPI Card grande
const KPICardLarge = ({ title, value, subtitle, icon: Icon, color, percentage, secondaryValue, secondaryLabel }) => (
  <Card className="relative overflow-hidden">
    <div
      className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10"
      style={{ backgroundColor: color }}
    />
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {secondaryValue !== undefined && (
            <p className="text-xs mt-2">
              <span className="font-medium">{secondaryValue.toLocaleString()}</span>
              <span className="text-muted-foreground"> {secondaryLabel}</span>
            </p>
          )}
          {percentage !== undefined && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-xl ml-4"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente de mini card para entidades
const EntidadMiniCard = ({ nombre, porcentaje, color, onClick }) => (
  <div
    onClick={onClick}
    className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md group"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium truncate flex-1">{nombre}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Avance</span>
        <span className="text-sm font-bold" style={{ color }}>{porcentaje.toFixed(2)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
    </div>
  </div>
);

export function ResumenEntidad({ data }: ResumenEntidadProps) {
  const [selectedEntidad, setSelectedEntidad] = useState<string>("");
  const [municipiosData, setMunicipiosData] = useState(null);
  const [municipiosNacionales, setMunicipiosNacionales] = useState(null);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

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

  // Cargar municipios nacionales al inicio
  useEffect(() => {
    async function fetchMunicipiosNacionales() {
      try {
        // Contar entes con municipio registrado y municipios únicos conectados por sistema
        const [entesConMunicipio, s1Municipios, s2Municipios, s3Municipios, s6Municipios] = await Promise.all([
          // Total de entes que tienen municipio registrado
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

  // Cache de municipios por entidad para evitar recargas
  const [municipiosCache, setMunicipiosCache] = useState<Record<string, any>>({});

  // Cargar datos de municipios cuando se selecciona una entidad
  useEffect(() => {
    async function fetchMunicipiosData() {
      if (!selectedEntidad) {
        setMunicipiosData(null);
        return;
      }

      // Verificar si ya tenemos los datos en cache
      if (municipiosCache[selectedEntidad]) {
        setMunicipiosData(municipiosCache[selectedEntidad]);
        return;
      }

      setLoadingMunicipios(true);
      try {
        // Consulta 1: Total de municipios del catálogo para esta entidad usando id_entidad
        const catalogoMunicipios = await directus.request(
          readItems("municipio", {
            filter: { id_entidad: { _eq: selectedEntidad } },
            aggregate: { count: ["*"] },
          })
        );

        const totalCatalogo = Number(catalogoMunicipios[0]?.count || 0);

        // Consulta 2: Obtener municipios registrados y conectados desde entes (como estaba funcionando)
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

        const result = {
          totalCatalogo,
          entesConMunicipio: Number(entesConMunicipio[0]?.count || 0),
          municipiosRegistrados: Number(entesConMunicipio[0]?.countDistinct?.municipio || 0),
          s1: Number(s1Municipios[0]?.countDistinct?.municipio || 0),
          s2: Number(s2Municipios[0]?.countDistinct?.municipio || 0),
          s3: Number(s3Municipios[0]?.countDistinct?.municipio || 0),
          s6: Number(s6Municipios[0]?.countDistinct?.municipio || 0),
        };

        // Guardar en cache
        setMunicipiosCache(prev => ({ ...prev, [selectedEntidad]: result }));
        setMunicipiosData(result);
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

  // Datos para la gráfica de barras comparativa
  const barChartData = useMemo(() => {
    if (!estadisticas) return [];
    return [
      { name: "S1", fullName: "Sistema 1", porcentaje: estadisticas.sistemas.resultSistema1.porcentaje, fill: SISTEMAS_CONFIG.resultSistema1.color },
      { name: "S2", fullName: "Sistema 2", porcentaje: estadisticas.sistemas.resultSistema2.porcentaje, fill: SISTEMAS_CONFIG.resultSistema2.color },
      { name: "S3", fullName: "Sistema 3", porcentaje: estadisticas.sistemas.resultSistema3OIC.porcentaje, fill: SISTEMAS_CONFIG.resultSistema3OIC.color },
      { name: "S6", fullName: "Sistema 6", porcentaje: estadisticas.sistemas.resultSistema6.porcentaje, fill: SISTEMAS_CONFIG.resultSistema6.color },
    ];
  }, [estadisticas]);

  // Datos para gráfica de municipios conectados
  const municipiosChartData = useMemo(() => {
    if (!currentMunicipios) return [];
    return [
      { name: "S1", fullName: "Sistema 1", value: currentMunicipios.s1, fill: SISTEMAS_CONFIG.resultSistema1.color },
      { name: "S2", fullName: "Sistema 2", value: currentMunicipios.s2, fill: SISTEMAS_CONFIG.resultSistema2.color },
      { name: "S3", fullName: "Sistema 3", value: currentMunicipios.s3, fill: SISTEMAS_CONFIG.resultSistema3OIC.color },
      { name: "S6", fullName: "Sistema 6", value: currentMunicipios.s6, fill: SISTEMAS_CONFIG.resultSistema6.color },
    ];
  }, [currentMunicipios]);

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

  // Custom tooltip para mostrar nombre completo del sistema
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm" style={{ color: data.fill }}>
            {payload[0].dataKey === "porcentaje"
              ? `${Number(payload[0].value).toFixed(2)}%`
              : `${payload[0].value} municipios`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Selector de entidad */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              {selectedEntidad ? <MapPin className="h-6 w-6 text-primary" /> : <Globe className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <CardTitle className="text-xl">
                {selectedEntidad ? "Resumen por Entidad" : "Resumen General"}
              </CardTitle>
              <CardDescription>
                {selectedEntidad
                  ? "Estadísticas de la entidad seleccionada"
                  : "Vista general de todas las entidades federativas"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-[500px]">
            <Combobox
              options={entidadesOptions}
              value={selectedEntidad}
              onChange={setSelectedEntidad}
              placeholder="Ver Resumen Nacional"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            {selectedEntidad
              ? "Selecciona otra entidad o limpia para ver el resumen nacional"
              : "Selecciona una entidad para ver su detalle específico"}
          </p>
        </CardContent>
      </Card>

      {estadisticas && (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-12 w-1 rounded-full bg-primary" />
            <div>
              <h2 className="text-3xl font-bold">
                {selectedEntidad ? nombreEntidad : "República Mexicana"}
              </h2>
              <p className="text-muted-foreground">
                {selectedEntidad
                  ? "Dashboard de Interconexión con la PDN"
                  : "32 Entidades Federativas y Federación"}
              </p>
            </div>
          </div>

          {/* KPIs principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICardLarge
              title="Entes Públicos"
              value={estadisticas.totalEntes}
              subtitle="Sujetos obligados registrados"
              icon={Building2}
              color="#3b82f6"
            />
            <KPICardLarge
              title="OIC / Autoridades"
              value={estadisticas.totalOIC}
              subtitle="Órganos de control"
              icon={Scale}
              color="#f59e0b"
            />
            <KPICardLarge
              title="Cobertura Promedio"
              value={`${(
                (estadisticas.sistemas.resultSistema1.porcentaje +
                  estadisticas.sistemas.resultSistema2.porcentaje +
                  estadisticas.sistemas.resultSistema6.porcentaje) / 3
              ).toFixed(2)}%`}
              subtitle="Promedio S1, S2 y S6"
              icon={TrendingUp}
              color="#10b981"
              percentage={(
                (estadisticas.sistemas.resultSistema1.porcentaje +
                  estadisticas.sistemas.resultSistema2.porcentaje +
                  estadisticas.sistemas.resultSistema6.porcentaje) / 3
              )}
            />
            <KPICardLarge
              title="Municipios"
              value={currentMunicipios?.totalCatalogo || TOTAL_MUNICIPIOS_CATALOGO}
              subtitle="Total en catálogo"
              icon={MapPin}
              color="#8b5cf6"
              secondaryValue={currentMunicipios?.municipiosRegistrados}
              secondaryLabel="con entes registrados"
            />
          </div>

          {/* Gráficas de Donut por sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Avance por Sistema
              </CardTitle>
              <CardDescription>
                Porcentaje de conexión en cada sistema de la PDN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                  const stats = estadisticas.sistemas[key];
                  return (
                    <div key={key} className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
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
            </CardContent>
          </Card>

          {/* Gráficas comparativas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Comparativa de avance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparativa de Avance</CardTitle>
                <CardDescription>Porcentaje de conexión por sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={40} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="porcentaje" radius={[0, 4, 4, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Municipios conectados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Municipios Conectados por Sistema</CardTitle>
                <CardDescription>
                  De {currentMunicipios?.totalCatalogo?.toLocaleString() || TOTAL_MUNICIPIOS_CATALOGO.toLocaleString()} municipios en catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(selectedEntidad && loadingMunicipios) ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : currentMunicipios ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={municipiosChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {municipiosChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Cargando datos de municipios...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Solo mostrar ranking de entidades en vista nacional */}
          {!selectedEntidad && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top entidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Mayor Avance
                  </CardTitle>
                  <CardDescription>Entidades con mejor cobertura promedio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topEntidades.map((entidad, index) => (
                    <EntidadMiniCard
                      key={entidad.id}
                      nombre={`${index + 1}. ${entidad.nombre}`}
                      porcentaje={entidad.promedio}
                      color="#10b981"
                      onClick={() => setSelectedEntidad(entidad.id)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Entidades que requieren atención */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Requieren Atención
                  </CardTitle>
                  <CardDescription>Entidades con menor cobertura promedio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {entidadesAtencion.map((entidad, index) => (
                    <EntidadMiniCard
                      key={entidad.id}
                      nombre={`${index + 1}. ${entidad.nombre}`}
                      porcentaje={entidad.promedio}
                      color="#ef4444"
                      onClick={() => setSelectedEntidad(entidad.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detalle de conexión por sistema (solo en vista de entidad) */}
          {selectedEntidad && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Conexión</CardTitle>
                <CardDescription>Información detallada de cada sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                    const stats = estadisticas.sistemas[key];
                    const Icon = config.icon;
                    const isOIC = config.tipo === "oic";

                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
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
                              {stats.porcentaje.toFixed(2)}%
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
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
