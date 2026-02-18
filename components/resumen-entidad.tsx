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
import { MapPin, Search, Users, Building2, Scale, TrendingUp, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import marcoGeoestadisticoInegi from "@/components/tables/cobertura-table/data-entidades";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";

const SISTEMAS_CONFIG = {
  resultSistema1: {
    color: "#F29888",
    nombre: "Sistema 1",
    descripcion: "Declaraciones Patrimoniales",
    tipo: "entes",
    icon: Users,
  },
  resultSistema2: {
    color: "#B25FAC",
    nombre: "Sistema 2",
    descripcion: "Servidores en Contrataciones",
    tipo: "entes",
    icon: Building2,
  },
  resultSistema3OIC: {
    color: "#9085DA",
    nombre: "Sistema 3",
    descripcion: "Servidores Sancionados",
    tipo: "oic",
    icon: Scale,
  },
  resultSistema6: {
    color: "#42A5CC",
    nombre: "Sistema 6",
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

// Componente de gráfica Donut
const DonutChart = ({ conectados, total, color, label }) => {
  const porcentaje = total > 0 ? (conectados / total) * 100 : 0;
  const data = [
    { name: "Conectados", value: conectados, color: color },
    { name: "Pendientes", value: total - conectados, color: "#e5e7eb" },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>
            {porcentaje.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2">{label}</span>
      <span className="text-sm font-medium">
        {conectados.toLocaleString()} / {total.toLocaleString()}
      </span>
    </div>
  );
};

// Componente de KPI Card
const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <Card className="relative overflow-hidden">
    <div
      className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10"
      style={{ backgroundColor: color }}
    />
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          {trend >= 50 ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend >= 50 ? "text-green-600" : "text-red-600"
            )}
          >
            {trend >= 50 ? "Buen avance" : "Requiere atención"}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

export function ResumenEntidad({ data }: ResumenEntidadProps) {
  const [selectedEntidad, setSelectedEntidad] = useState<string>("");
  const [municipiosData, setMunicipiosData] = useState(null);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Lista de entidades ordenadas alfabéticamente para el Combobox
  const entidadesOptions = useMemo(() => {
    return marcoGeoestadisticoInegi
      .map((e) => ({ value: e.id, label: e.nombre }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

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

  // Cargar datos de municipios cuando se selecciona una entidad
  useEffect(() => {
    async function fetchMunicipiosData() {
      if (!selectedEntidad) {
        setMunicipiosData(null);
        return;
      }

      setLoadingMunicipios(true);
      try {
        // Query para obtener municipios únicos conectados por sistema
        const [totalMunicipios, s1Municipios, s2Municipios, s3Municipios, s6Municipios] = await Promise.all([
          // Total de municipios con entes en la entidad
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                controlOIC: { _eq: false },
                municipio: { _nnull: true },
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          // Municipios con S1
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                controlOIC: { _eq: false },
                sistema1: { _eq: true },
                municipio: { _nnull: true },
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          // Municipios con S2
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                controlOIC: { _eq: false },
                sistema2: { _eq: true },
                municipio: { _nnull: true },
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          // Municipios con S3 (OIC)
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                sistema3: { _eq: true },
                municipio: { _nnull: true },
                _or: [
                  { controlOIC: { _eq: true } },
                  { controlTribunal: { _eq: true } },
                ],
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
          // Municipios con S6
          directus.request(
            readItems("entes", {
              filter: {
                entidad: { _eq: selectedEntidad },
                controlOIC: { _eq: false },
                sistema6: { _eq: true },
                municipio: { _nnull: true },
              },
              aggregate: { countDistinct: ["municipio"] },
            })
          ),
        ]);

        setMunicipiosData({
          total: Number(totalMunicipios[0]?.countDistinct?.municipio || 0),
          s1: Number(s1Municipios[0]?.countDistinct?.municipio || 0),
          s2: Number(s2Municipios[0]?.countDistinct?.municipio || 0),
          s3: Number(s3Municipios[0]?.countDistinct?.municipio || 0),
          s6: Number(s6Municipios[0]?.countDistinct?.municipio || 0),
        });
      } catch (error) {
        console.error("Error al cargar datos de municipios:", error);
        setMunicipiosData(null);
      } finally {
        setLoadingMunicipios(false);
      }
    }

    fetchMunicipiosData();
  }, [selectedEntidad]);

  // Calcular estadísticas de la entidad
  const estadisticas = useMemo(() => {
    if (!entidadData) return null;

    const totalEntes = entidadData.resultSujetosObligados || 0;
    const totalOIC = entidadData.resultOIC || 0;

    return {
      totalEntes,
      totalOIC,
      sistemas: {
        resultSistema1: {
          conectados: entidadData.resultSistema1 || 0,
          total: totalEntes,
          porcentaje: totalEntes > 0 ? ((entidadData.resultSistema1 || 0) / totalEntes) * 100 : 0,
        },
        resultSistema2: {
          conectados: entidadData.resultSistema2 || 0,
          total: totalEntes,
          porcentaje: totalEntes > 0 ? ((entidadData.resultSistema2 || 0) / totalEntes) * 100 : 0,
        },
        resultSistema3OIC: {
          conectados: entidadData.resultSistema3OIC || 0,
          total: totalOIC,
          porcentaje: totalOIC > 0 ? ((entidadData.resultSistema3OIC || 0) / totalOIC) * 100 : 0,
        },
        resultSistema6: {
          conectados: entidadData.resultSistema6 || 0,
          total: totalEntes,
          porcentaje: totalEntes > 0 ? ((entidadData.resultSistema6 || 0) / totalEntes) * 100 : 0,
        },
      },
    };
  }, [entidadData]);

  // Datos para la gráfica de barras comparativa
  const barChartData = useMemo(() => {
    if (!estadisticas) return [];
    return [
      {
        name: "S1",
        porcentaje: estadisticas.sistemas.resultSistema1.porcentaje,
        fill: SISTEMAS_CONFIG.resultSistema1.color,
      },
      {
        name: "S2",
        porcentaje: estadisticas.sistemas.resultSistema2.porcentaje,
        fill: SISTEMAS_CONFIG.resultSistema2.color,
      },
      {
        name: "S3",
        porcentaje: estadisticas.sistemas.resultSistema3OIC.porcentaje,
        fill: SISTEMAS_CONFIG.resultSistema3OIC.color,
      },
      {
        name: "S6",
        porcentaje: estadisticas.sistemas.resultSistema6.porcentaje,
        fill: SISTEMAS_CONFIG.resultSistema6.color,
      },
    ];
  }, [estadisticas]);

  // Datos para gráfica de municipios
  const municipiosChartData = useMemo(() => {
    if (!municipiosData) return [];
    return [
      { name: "S1", value: municipiosData.s1, fill: SISTEMAS_CONFIG.resultSistema1.color },
      { name: "S2", value: municipiosData.s2, fill: SISTEMAS_CONFIG.resultSistema2.color },
      { name: "S3", value: municipiosData.s3, fill: SISTEMAS_CONFIG.resultSistema3OIC.color },
      { name: "S6", value: municipiosData.s6, fill: SISTEMAS_CONFIG.resultSistema6.color },
    ];
  }, [municipiosData]);

  return (
    <div className="space-y-6">
      {/* Selector de entidad con búsqueda */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Resumen Estadístico por Entidad</CardTitle>
              <CardDescription>
                Selecciona una entidad para ver su información detallada
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
              placeholder="Buscar entidad federativa..."
            />
          </div>
          {!selectedEntidad && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Escribe el nombre del estado para encontrarlo rápidamente
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contenido cuando hay entidad seleccionada */}
      {estadisticas && (
        <>
          {/* Header con nombre de entidad */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-12 w-1 rounded-full bg-primary" />
            <div>
              <h2 className="text-3xl font-bold">{nombreEntidad}</h2>
              <p className="text-muted-foreground">
                Dashboard de Interconexión con la PDN
              </p>
            </div>
          </div>

          {/* KPIs principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Entes Públicos"
              value={estadisticas.totalEntes}
              subtitle="Sujetos obligados registrados"
              icon={Building2}
              color="#3b82f6"
            />
            <KPICard
              title="OIC / Autoridades"
              value={estadisticas.totalOIC}
              subtitle="Órganos de control"
              icon={Scale}
              color="#f59e0b"
            />
            <KPICard
              title="Cobertura Promedio"
              value={`${(
                (estadisticas.sistemas.resultSistema1.porcentaje +
                  estadisticas.sistemas.resultSistema2.porcentaje +
                  estadisticas.sistemas.resultSistema6.porcentaje) /
                3
              ).toFixed(1)}%`}
              subtitle="Promedio S1, S2 y S6"
              icon={TrendingUp}
              color="#10b981"
              trend={
                (estadisticas.sistemas.resultSistema1.porcentaje +
                  estadisticas.sistemas.resultSistema2.porcentaje +
                  estadisticas.sistemas.resultSistema6.porcentaje) /
                3
              }
            />
            <KPICard
              title="Municipios"
              value={loadingMunicipios ? "..." : municipiosData?.total || 0}
              subtitle="Con entes registrados"
              icon={MapPin}
              color="#8b5cf6"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                  const stats = estadisticas.sistemas[key];
                  return (
                    <div key={key} className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <DonutChart
                        conectados={stats.conectados}
                        total={stats.total}
                        color={config.color}
                        label={config.nombre}
                      />
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        {config.descripcion}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gráfica de barras comparativa */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparativa de Avance</CardTitle>
                <CardDescription>Porcentaje por sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={40} />
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(2)}%`, "Avance"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                      />
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
                <CardTitle className="text-base">Municipios Conectados</CardTitle>
                <CardDescription>
                  Municipios únicos con conexión por sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMunicipios ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : municipiosData ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={municipiosChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value, "Municipios"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
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
                    Sin datos de municipios
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalle de conexión por sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Conexión</CardTitle>
              <CardDescription>
                Información detallada de cada sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => {
                  const stats = estadisticas.sistemas[key];
                  const Icon = config.icon;
                  const isOIC = config.tipo === "oic";
                  const municipiosConectados = municipiosData?.[key.replace("result", "").toLowerCase().replace("oic", "")] || 0;

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: config.color, borderLeftWidth: 4 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${config.color}15` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: config.color }} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{config.nombre}</h4>
                            <p className="text-xs text-muted-foreground">
                              {config.descripcion}
                            </p>
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
                          <span
                            className="text-2xl font-bold"
                            style={{ color: config.color }}
                          >
                            {stats.porcentaje.toFixed(2)}%
                          </span>
                        </div>

                        <div className="h-2 rounded-full overflow-hidden bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stats.porcentaje}%`,
                              backgroundColor: config.color,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Conectados</p>
                            <p className="font-semibold text-green-600">
                              {stats.conectados.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pendientes</p>
                            <p className="font-semibold text-red-500">
                              {(stats.total - stats.conectados).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay entidad seleccionada */}
      {!selectedEntidad && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Selecciona una Entidad Federativa</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            Elige una entidad del menú superior para visualizar sus estadísticas
            de interconexión con la Plataforma Digital Nacional.
          </p>
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-lg">
            {Object.entries(SISTEMAS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
