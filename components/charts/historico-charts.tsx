"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
} from "recharts";
import {
  fetchHistoricoResumen, fetchHistoricoConfig,
  toXlsxDownload, toCsvDownload,
  TrimData, TrimConfig, TrimDatoEntidad,
} from "@/lib/historico-data";
import { entidadesData } from "@/lib/entidades-slugs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2, AlertCircle, Download, TrendingUp, TrendingDown, Minus,
  BarChart2, MapPin, Building2, FileDown, LayoutGrid,
  ArrowLeftRight, PieChart as PieChartIcon, Activity, ChevronDown,
} from "lucide-react";

// ── Constantes ────────────────────────────────────────────────────────────────

const COLORS = { S1: "#F29888", S2: "#B25FAC", S3: "#9085DA", S6: "#42A5CC" };

const SISTEMAS = [
  { key: "S1" as const, label: "Sistema 1", desc: "Declaraciones e intereses", color: COLORS.S1, universo: "SO" as const },
  { key: "S2" as const, label: "Sistema 2", desc: "Servidores en contrataciones", color: COLORS.S2, universo: "SO" as const },
  { key: "S3" as const, label: "Sistema 3", desc: "Servidores sancionados", color: COLORS.S3, universo: "OIC" as const },
  { key: "S6" as const, label: "Sistema 6", desc: "Información de contrataciones", color: COLORS.S6, universo: "SO" as const },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const pct = (num: number, den: number) =>
  den > 0 ? parseFloat(((num / den) * 100).toFixed(1)) : 0;

const fmt = (n: number) => n.toLocaleString("es-MX");

function calcNacional(trm: TrimData) {
  let totalSO = 0, s1 = 0, s2 = 0, s6 = 0, totalOIC = 0, s3 = 0;
  for (const d of Object.values(trm.entidades)) {
    totalSO += d.totalSO; s1 += d.s1; s2 += d.s2; s6 += d.s6;
    totalOIC += d.totalOIC + d.totalTJA;
    s3 += d.s3OIC + d.s3TJA;
  }
  return {
    totalSO, totalOIC,
    S1: pct(s1, totalSO), S1n: s1,
    S2: pct(s2, totalSO), S2n: s2,
    S3: pct(s3, totalOIC), S3n: s3,
    S6: pct(s6, totalSO), S6n: s6,
  };
}

function rankColor(value: number): string {
  if (value >= 70) return "#22c55e";
  if (value >= 40) return "#f59e0b";
  return "#f43f5e";
}

// ── Componentes de UI ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Cargando datos históricos...</span>
    </div>
  );
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p>{msg}</p>
    </div>
  );
}

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground border-b pb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground text-xs">{p.name}</span>
          </div>
          <span className="font-semibold text-xs tabular-nums">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

// ── AccordionBlock ────────────────────────────────────────────────────────────

function AccordionBlock({
  icon, title, subtitle, children, defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <button
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors duration-150 group"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="p-2 rounded-lg bg-muted flex-shrink-0 group-hover:bg-muted/80 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        </div>
        <div className={`rounded-full p-1 transition-all duration-300 ${isOpen ? "bg-muted rotate-180" : "hover:bg-muted"}`}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t px-5 pb-6 pt-5 space-y-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bloque 1: Métricas del trimestre seleccionado ─────────────────────────────

function BloqueMetricas({ trimesters }: { trimesters: TrimData[] }) {
  const latestId = trimesters[trimesters.length - 1]?.id ?? "";
  const prevId   = trimesters[trimesters.length - 2]?.id ?? "";

  const [currentId, setCurrentId] = useState(latestId);
  const [compareId, setCompareId] = useState(prevId);

  const currTrm  = trimesters.find((t) => t.id === currentId) ?? trimesters[trimesters.length - 1];
  const cmpTrm   = trimesters.find((t) => t.id === compareId);

  const curr    = useMemo(() => calcNacional(currTrm), [currTrm]);
  const cmpData = useMemo(() => cmpTrm ? calcNacional(cmpTrm) : null, [cmpTrm]);

  function Delta({ sistema }: { sistema: keyof typeof COLORS }) {
    if (!cmpData) return null;
    const diff   = parseFloat((curr[sistema] - cmpData[sistema]).toFixed(1));
    const before = cmpData[sistema];
    const label  = cmpTrm?.label ?? "";
    if (diff > 0) return (
      <div className="space-y-0.5">
        <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
          <TrendingUp className="h-3.5 w-3.5" /> Subió {diff}% desde el {label}
        </span>
        <p className="text-xs text-muted-foreground">Antes: {before}%</p>
      </div>
    );
    if (diff < 0) return (
      <div className="space-y-0.5">
        <span className="flex items-center gap-1 text-rose-500 text-xs font-semibold">
          <TrendingDown className="h-3.5 w-3.5" /> Bajó {Math.abs(diff)}% desde el {label}
        </span>
        <p className="text-xs text-muted-foreground">Antes: {before}%</p>
      </div>
    );
    return (
      <div className="space-y-0.5">
        <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
          <Minus className="h-3.5 w-3.5" /> Sin cambio respecto al {label}
        </span>
        <p className="text-xs text-muted-foreground">Antes: {before}%</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#F29888] via-[#B25FAC] to-[#42A5CC]" />
      <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <SectionHeader
          icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
          title="Resumen de cobertura nacional"
          desc="Porcentaje de entes públicos conectados a cada sistema de la PDN. Selecciona el trimestre que quieres ver y con cuál compararlo."
        />
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Trimestre</span>
            <Select value={currentId} onValueChange={setCurrentId}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {trimesters.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Comparar con</span>
            <Select value={compareId} onValueChange={setCompareId}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {trimesters.filter((t) => t.id !== currentId).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SISTEMAS.map(({ key, label, desc, color, universo }) => {
          const total      = universo === "SO" ? curr.totalSO : curr.totalOIC;
          const conectados = curr[`${key}n` as keyof typeof curr] as number;
          const porcentaje = curr[key];
          return (
            <div key={key} className="rounded-xl border bg-background p-4 space-y-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs font-bold text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-tight">{desc}</p>

              <div>
                <p className="text-4xl font-black tracking-tight tabular-nums">{porcentaje}<span className="text-lg font-semibold text-muted-foreground">%</span></p>
                <ProgressBar value={porcentaje} color={color} />
                <p className="text-xs text-muted-foreground mt-1.5">
                  <span className="font-semibold text-foreground">{fmt(conectados)}</span> de {fmt(total)}{" "}
                  {universo === "SO" ? "entes SO" : "OIC / TJA"}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60">
                <Delta sistema={key} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ── Bloque 2: Evolución (Nacional + Por entidad fusionados) ───────────────────

function BloqueEvolucion({ trimesters }: { trimesters: TrimData[] }) {
  const [modo, setModo] = useState<"nacional" | "entidad">("nacional");
  const [selectedId, setSelectedId] = useState("14");

  const nacionalData = useMemo(() =>
    trimesters.map((trm) => {
      const n = calcNacional(trm);
      return { label: trm.label, S1: n.S1, S2: n.S2, S3: n.S3, S6: n.S6 };
    }), [trimesters]);

  const entidadData = useMemo(() =>
    trimesters.map((trm) => {
      const d = trm.entidades[selectedId];
      if (!d) return { label: trm.label, S1: 0, S2: 0, S3: 0, S6: 0 };
      const totalOIC = d.totalOIC + d.totalTJA;
      return {
        label: trm.label,
        S1: pct(d.s1, d.totalSO), S2: pct(d.s2, d.totalSO),
        S3: pct(d.s3OIC + d.s3TJA, totalOIC), S6: pct(d.s6, d.totalSO),
      };
    }), [trimesters, selectedId]);

  const data = modo === "nacional" ? nacionalData : entidadData;
  const entidad = entidadesData.find((e) => e.id === selectedId);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <SectionHeader
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        title="Evolución de la cobertura"
        desc="Tendencia trimestral del porcentaje de entes conectados a cada sistema. Alterna entre vista nacional y por entidad federativa."
      />
      {/* Toggle Nacional / Por entidad */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {(["nacional", "entidad"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                modo === m
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "nacional" ? "Nacional" : "Por entidad"}
            </button>
          ))}
        </div>
        {modo === "entidad" && (
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {entidadesData.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {modo === "entidad" && entidad && (
          <p className="text-xs text-muted-foreground">{entidad.nombre} · {entidad.abreviacion}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} width={40} />
          <Tooltip content={<ChartTooltip />} />
          {SISTEMAS.map(({ key, color }) => (
            <Line key={key} type="monotone" dataKey={key}
              stroke={color} strokeWidth={2.5}
              dot={{ r: 4, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Leyenda custom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {SISTEMAS.map(({ key, label, desc, color }) => (
          <div key={key} className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5">
            <span className="mt-0.5 w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bloque 2b: Mapa de calor ──────────────────────────────────────────────────

function BloqueHeatmap({ trimesters }: { trimesters: TrimData[] }) {
  const [selectedSistema, setSelectedSistema] = useState<keyof typeof COLORS>("S1");
  const [sortBy, setSortBy] = useState<"latest" | "trend" | "az">("latest");
  const [tooltip, setTooltip] = useState<{ nombre: string; label: string; value: number; hasData: boolean } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const calcVal = (d: TrimDatoEntidad | undefined, s: keyof typeof COLORS) => {
    if (!d) return null;
    if (s === "S1") return pct(d.s1, d.totalSO);
    if (s === "S2") return pct(d.s2, d.totalSO);
    if (s === "S3") return pct(d.s3OIC + d.s3TJA, d.totalOIC + d.totalTJA);
    return pct(d.s6, d.totalSO);
  };

  const data = useMemo(() => {
    const lastIdx = trimesters.length - 1;
    const rows = entidadesData
      .filter((e) => e.id !== "00")
      .map((e) => ({
        id: e.id,
        nombre: e.abreviacion,
        nombreCompleto: e.nombre,
        values: trimesters.map((trm) => {
          const v = calcVal(trm.entidades[e.id], selectedSistema);
          return { label: trm.label, value: v ?? 0, hasData: v !== null };
        }),
      }));

    if (sortBy === "az") return rows.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, "es"));
    if (sortBy === "trend") return rows.sort((a, b) => {
      const dA = a.values[lastIdx].value - a.values[0].value;
      const dB = b.values[lastIdx].value - b.values[0].value;
      return dB - dA;
    });
    return rows.sort((a, b) => b.values[lastIdx].value - a.values[lastIdx].value);
  }, [trimesters, selectedSistema, sortBy]);

  const nacional = useMemo(() =>
    trimesters.map((trm) => {
      const n = calcNacional(trm);
      const v = selectedSistema === "S1" ? n.S1 : selectedSistema === "S2" ? n.S2 : selectedSistema === "S3" ? n.S3 : n.S6;
      return { label: trm.label, value: v };
    }),
  [trimesters, selectedSistema]);

  function cellClass(value: number, hasData: boolean): string {
    if (!hasData) return "bg-muted";
    if (value >= 70) return "bg-emerald-200 dark:bg-emerald-900/50";
    if (value >= 40) return "bg-amber-200 dark:bg-amber-900/50";
    return "bg-rose-200 dark:bg-rose-900/50";
  }

  const lastIdx = trimesters.length - 1;
  const sistemaColor = COLORS[selectedSistema];

  const alto  = data.filter(r => r.values[lastIdx].value >= 70).length;
  const medio = data.filter(r => r.values[lastIdx].value >= 40 && r.values[lastIdx].value < 70).length;
  const bajo  = data.filter(r => r.values[lastIdx].value < 40).length;

  const SORT_OPTS = [
    { id: "latest" as const, label: "Último" },
    { id: "trend"  as const, label: "Tendencia" },
    { id: "az"     as const, label: "A–Z" },
  ];

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: `0 0 0 1.5px ${sistemaColor}40, 0 4px 24px 0 ${sistemaColor}25` }}
    >
      <div className="h-1 w-full transition-colors duration-300" style={{ background: sistemaColor }} />
      <div className="p-5 space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <SectionHeader
            icon={<LayoutGrid className="h-4 w-4 text-muted-foreground" />}
            title="Mapa de calor por entidad y trimestre"
            desc="Evolución de todos los estados a lo largo de los trimestres."
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex rounded-lg border overflow-hidden text-xs">
              {SORT_OPTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSortBy(id)}
                  className={`px-2.5 py-1.5 transition-colors ${sortBy === id ? "bg-foreground text-background font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Select value={selectedSistema} onValueChange={(v) => setSelectedSistema(v as keyof typeof COLORS)}>
              <SelectTrigger className="w-[120px] h-8 text-xs font-semibold" style={{ color: sistemaColor }}><SelectValue /></SelectTrigger>
              <SelectContent>
                {SISTEMAS.map(({ key, label }) => (
                  <SelectItem key={key} value={key}>
                    <span className="font-semibold" style={{ color: COLORS[key as keyof typeof COLORS] }}>{label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leyenda + conteos */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {alto} alta ≥70%
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> {medio} media 40–69%
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {bajo} baja &lt;40%
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto hidden sm:block">Último trimestre</span>
        </div>

        {/* Tooltip flotante */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-popover border rounded-lg shadow-lg px-3 py-2.5 text-sm"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: "translate(-50%, -100%)" }}
          >
            <p className="font-semibold text-foreground">{tooltip.nombre}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tooltip.label}</p>
            {tooltip.hasData ? (
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tooltip.value >= 70 ? "bg-emerald-500" : tooltip.value >= 40 ? "bg-amber-500" : "bg-rose-500"}`} />
                <span className="font-bold tabular-nums">{tooltip.value}%</span>
                <span className="text-xs text-muted-foreground">{tooltip.value >= 70 ? "Alta" : tooltip.value >= 40 ? "Media" : "Baja"}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Sin datos</p>
            )}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto rounded-lg border border-border/50" onMouseLeave={() => setTooltip(null)}>
          <table className="text-xs border-collapse" style={{ width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap min-w-[72px]">Estado</th>
                {trimesters.map((t) => (
                  <th key={t.id} className="text-center py-2 px-1 font-semibold text-muted-foreground whitespace-nowrap min-w-[62px]">{t.label}</th>
                ))}
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap min-w-[56px]">Δ Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {/* Fila nacional */}
              <tr className="bg-muted/25 border-b border-border">
                <td className="sticky left-0 z-10 bg-muted/25 py-1.5 px-3 font-bold text-foreground whitespace-nowrap">Nac.</td>
                {nacional.map((cell, i) => (
                  <td key={i} className="py-1 px-0.5 text-center">
                    <div
                      className={`rounded-md h-7 w-full cursor-default transition-opacity hover:opacity-70 ${cellClass(cell.value, true)}`}
                      onMouseEnter={(e) => { setTooltip({ nombre: "Nacional", label: cell.label, value: cell.value, hasData: true }); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                    />
                  </td>
                ))}
                <td className="py-1 px-2 text-center">
                  {(() => {
                    const d = nacional[lastIdx].value - nacional[0].value;
                    return <span className={`font-bold text-[11px] ${d >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{d >= 0 ? "+" : ""}{d.toFixed(1)}%</span>;
                  })()}
                </td>
              </tr>
              {/* Filas por estado */}
              {data.map((row) => {
                const delta = row.values[lastIdx].value - row.values[0].value;
                return (
                  <tr key={row.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/20 py-1 px-3 font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                      {row.nombre}
                    </td>
                    {row.values.map((cell, i) => (
                      <td key={i} className="py-1 px-0.5 text-center">
                        <div
                          className={`rounded-md h-6 w-full cursor-default transition-opacity hover:opacity-70 ${cellClass(cell.value, cell.hasData)}`}
                          onMouseEnter={(e) => { setTooltip({ nombre: row.nombreCompleto, label: cell.label, value: cell.value, hasData: cell.hasData }); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                          onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        />
                      </td>
                    ))}
                    <td className="py-1 px-2 text-center">
                      <span className={`font-bold text-[11px] ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// ── Bloque 3: Ranking de estados ──────────────────────────────────────────────

function BloqueRanking({ trimesters }: { trimesters: TrimData[] }) {
  const [selectedTrim, setSelectedTrim] = useState(trimesters[trimesters.length - 1]?.id ?? "");
  const [selectedSistema, setSelectedSistema] = useState<keyof typeof COLORS>("S1");

  const trimData = useMemo(
    () => trimesters.find((t) => t.id === selectedTrim),
    [trimesters, selectedTrim]
  );

  const rankingData = useMemo(() => {
    if (!trimData) return [];
    return entidadesData
      .filter((e) => e.id !== "00")
      .map((e) => {
        const d = trimData.entidades[e.id];
        if (!d) return null;
        let value = 0;
        if (selectedSistema === "S1") value = pct(d.s1, d.totalSO);
        else if (selectedSistema === "S2") value = pct(d.s2, d.totalSO);
        else if (selectedSistema === "S3") value = pct(d.s3OIC + d.s3TJA, d.totalOIC + d.totalTJA);
        else if (selectedSistema === "S6") value = pct(d.s6, d.totalSO);
        return { nombre: e.abreviacion, nombreCompleto: e.nombre, value };
      })
      .filter(Boolean)
      .sort((a, b) => b!.value - a!.value) as { nombre: string; nombreCompleto: string; value: number }[];
  }, [trimData, selectedSistema]);

  const sistemaInfo = SISTEMAS.find(s => s.key === selectedSistema);
  const sistemaColor = COLORS[selectedSistema];

  const RankTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground">{d.payload.nombreCompleto}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sistemaInfo?.label} — {sistemaInfo?.desc}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: rankColor(d.value) }} />
          <span className="font-bold tabular-nums">{d.value}%</span>
          <span className="text-xs text-muted-foreground">
            {d.value >= 70 ? "Cobertura alta" : d.value >= 40 ? "Cobertura media" : "Cobertura baja"}
          </span>
        </div>
      </div>
    );
  };

  const alto  = rankingData.filter(r => r.value >= 70).length;
  const medio = rankingData.filter(r => r.value >= 40 && r.value < 70).length;
  const bajo  = rankingData.filter(r => r.value < 40).length;

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: `0 0 0 1.5px ${sistemaColor}40, 0 4px 24px 0 ${sistemaColor}25` }}
    >
      <div className="h-1 w-full transition-colors duration-300" style={{ background: sistemaColor }} />
      <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <SectionHeader
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          title="Ranking de entidades federativas"
          desc="Estados ordenados de mayor a menor cobertura."
        />
        <div className="flex gap-2 flex-shrink-0">
          <Select value={selectedTrim} onValueChange={setSelectedTrim}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {trimesters.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSistema} onValueChange={(v) => setSelectedSistema(v as keyof typeof COLORS)}>
            <SelectTrigger className="w-[110px] h-8 text-xs font-semibold" style={{ color: sistemaColor }}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SISTEMAS.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  <span className="font-semibold" style={{ color: COLORS[key as keyof typeof COLORS] }}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Semáforo + conteos */}
      <div className="rounded-lg border bg-muted/30 p-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-xs font-semibold text-foreground">Nivel de cobertura:</span>
        <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="font-bold">{alto}</span> estado{alto !== 1 ? "s" : ""} — Alto (70% o más)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="font-bold">{medio}</span> — Medio (40–69%)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
          <span className="font-bold">{bajo}</span> — Bajo (menos de 40%)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={640}>
        <BarChart data={rankingData} layout="vertical" margin={{ top: 0, right: 50, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="nombre" width={44} tick={{ fontSize: 10 }} />
          <Tooltip content={<RankTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16} label={{ position: "right", formatter: (v: number) => `${v}%`, fontSize: 9, fill: "hsl(var(--muted-foreground))" }}>
            {rankingData.map((r, i) => (
              <Cell key={i} fill={rankColor(r.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Bloque 5: Descargas por trimestre ─────────────────────────────────────────

function BloqueDescargas({ config }: { config: TrimConfig[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <SectionHeader
        icon={<FileDown className="h-4 w-4 text-muted-foreground" />}
        title="Descarga de datos por trimestre"
        desc="Listado completo de entes públicos por trimestre en formato XLSX y CSV."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {config.map((c, i) => {
          const isLatest = i === config.length - 1;
          return (
            <div key={c.trimestre}
              className={`rounded-xl border overflow-hidden transition-shadow duration-200 hover:shadow-md ${isLatest ? "border-primary/40" : "border-border"}`}>
              {/* Encabezado de la card */}
              <div className={`px-4 py-3 flex items-center justify-between ${isLatest ? "bg-primary/8" : "bg-muted/40"}`}>
                <div>
                  <p className="text-sm font-bold text-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Cobertura PDN</p>
                </div>
                {isLatest && (
                  <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-2.5 py-1 flex-shrink-0">
                    Más reciente
                  </span>
                )}
              </div>
              {/* Botones de descarga */}
              <div className="p-3 flex flex-col gap-2 bg-card">
                {c.xlsxUrl && (
                  <a href={toXlsxDownload(c.xlsxUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors">
                    <Download className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Descargar XLSX</span>
                    <span className="ml-auto text-[10px] opacity-60">Excel</span>
                  </a>
                )}
                {c.csvUrl && (
                  <a href={toCsvDownload(c.csvUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors">
                    <Download className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Descargar CSV</span>
                    <span className="ml-auto text-[10px] opacity-60">Texto</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bloque Variación: cambio entre trimestres ────────────────────────────────

function BloqueVariacion({ trimesters }: { trimesters: TrimData[] }) {
  const latestId = trimesters[trimesters.length - 1]?.id ?? "";
  const prevId   = trimesters[trimesters.length - 2]?.id ?? "";
  const [trimA, setTrimA] = useState(prevId);
  const [trimB, setTrimB] = useState(latestId);
  const [selectedSistema, setSelectedSistema] = useState<keyof typeof COLORS>("S1");

  // Normalizar: "desde" siempre el más antiguo, "hasta" el más reciente
  const idxA = trimesters.findIndex((t) => t.id === trimA);
  const idxB = trimesters.findIndex((t) => t.id === trimB);
  const fromId = idxA <= idxB ? trimA : trimB;
  const toId   = idxA <= idxB ? trimB : trimA;

  const data = useMemo(() => {
    const trmFrom = trimesters.find((t) => t.id === fromId);
    const trmTo   = trimesters.find((t) => t.id === toId);
    if (!trmFrom || !trmTo) return [];

    const calcVal = (d: TrimDatoEntidad | undefined) => {
      if (!d) return 0;
      if (selectedSistema === "S1") return pct(d.s1, d.totalSO);
      if (selectedSistema === "S2") return pct(d.s2, d.totalSO);
      if (selectedSistema === "S3") return pct(d.s3OIC + d.s3TJA, d.totalOIC + d.totalTJA);
      return pct(d.s6, d.totalSO);
    };

    return entidadesData
      .filter((e) => e.id !== "00")
      .map((e) => {
        const valFrom = calcVal(trmFrom.entidades[e.id]);
        const valTo   = calcVal(trmTo.entidades[e.id]);
        return { nombre: e.abreviacion, nombreCompleto: e.nombre, diff: parseFloat((valTo - valFrom).toFixed(1)), valA: valFrom, valB: valTo };
      })
      .sort((a, b) => b.diff - a.diff);
  }, [trimesters, fromId, toId, selectedSistema]);

  const labelFrom = trimesters.find((t) => t.id === fromId)?.label ?? "";
  const labelTo   = trimesters.find((t) => t.id === toId)?.label ?? "";

  const VarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold border-b pb-1.5 mb-1.5">{d.nombreCompleto}</p>
        <p className="text-xs text-muted-foreground">Desde {labelFrom}: <span className="font-semibold text-foreground">{d.valA}%</span></p>
        <p className="text-xs text-muted-foreground">Hasta {labelTo}: <span className="font-semibold text-foreground">{d.valB}%</span></p>
        <p className={`text-xs font-bold mt-1 ${d.diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
          {d.diff >= 0 ? "+" : ""}{d.diff}% de cambio
        </p>
      </div>
    );
  };

  const mejoraron = data.filter((d) => d.diff > 0).length;
  const bajaron   = data.filter((d) => d.diff < 0).length;
  const igual     = data.filter((d) => d.diff === 0).length;

  const xMin = data.length ? Math.min(0, ...data.map((d) => d.diff)) : -1;
  const xMax = data.length ? Math.max(0, ...data.map((d) => d.diff)) : 1;
  const xPad = Math.max(0.3, (xMax - xMin) * 0.2);
  const xDomain: [number, number] = [
    parseFloat((xMin - xPad).toFixed(1)),
    parseFloat((xMax + xPad).toFixed(1)),
  ];

  const sistemaColor = COLORS[selectedSistema];

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: `0 0 0 1.5px ${sistemaColor}40, 0 4px 24px 0 ${sistemaColor}25` }}
    >
      <div className="h-1 w-full transition-colors duration-300" style={{ background: sistemaColor }} />
      <div className="p-5 space-y-5">
      {/* Header: título + selector de sistema */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <SectionHeader
          icon={<ArrowLeftRight className="h-4 w-4 text-muted-foreground" />}
          title="Variación entre trimestres"
          desc="Cambio en la cobertura de cada estado entre dos periodos seleccionables."
        />
        <Select value={selectedSistema} onValueChange={(v) => setSelectedSistema(v as keyof typeof COLORS)}>
          <SelectTrigger className="w-[110px] h-8 text-xs font-semibold flex-shrink-0" style={{ color: sistemaColor }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SISTEMAS.map(({ key, label }) => (
              <SelectItem key={key} value={key}>
                <span className="font-semibold" style={{ color: COLORS[key as keyof typeof COLORS] }}>{label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pills + selectores Desde/Hasta en la misma fila */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {mejoraron} mejoraron
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {bajaron} bajaron
          </span>
          {igual > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/60" /> {igual} sin cambio
            </span>
          )}
        </div>
        <div className="flex items-end gap-1.5 flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-medium px-1">Desde</span>
            <Select value={trimA} onValueChange={setTrimA}>
              <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {trimesters
                  .filter((_, i) => i <= trimesters.findIndex((t) => t.id === trimB))
                  .map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <ArrowLeftRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mb-2" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-medium px-1">Hasta</span>
            <Select value={trimB} onValueChange={setTrimB}>
              <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {trimesters
                  .filter((_, i) => i >= trimesters.findIndex((t) => t.id === trimA))
                  .map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 18 + 40}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis type="number" tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} tick={{ fontSize: 10 }} domain={xDomain} />
          <YAxis type="category" dataKey="nombre" width={55} tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} interval={0} />
          <Tooltip content={<VarTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
          <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <Bar dataKey="diff" radius={[0, 4, 4, 0]} maxBarSize={16}
            label={{ position: "right", formatter: (v: number) => v !== 0 ? `${v > 0 ? "+" : ""}${v}%` : "", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}>
            {data.map((d, i) => <Cell key={i} fill={d.diff >= 0 ? "#22c55e" : "#f43f5e"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Bloque Pie: Distribución por nivel de cobertura ───────────────────────────

function BloquePieDistribucion({ trimesters }: { trimesters: TrimData[] }) {
  const [selectedTrim, setSelectedTrim] = useState(trimesters[trimesters.length - 1]?.id ?? "");
  const [selectedSistema, setSelectedSistema] = useState<keyof typeof COLORS>("S1");

  const { pieData, total } = useMemo(() => {
    const trimData = trimesters.find((t) => t.id === selectedTrim);
    if (!trimData) return { pieData: [], total: 0 };
    let alto = 0, medio = 0, bajo = 0;
    entidadesData.filter((e) => e.id !== "00").forEach((e) => {
      const d = trimData.entidades[e.id];
      if (!d) return;
      let value = 0;
      if (selectedSistema === "S1") value = pct(d.s1, d.totalSO);
      else if (selectedSistema === "S2") value = pct(d.s2, d.totalSO);
      else if (selectedSistema === "S3") value = pct(d.s3OIC + d.s3TJA, d.totalOIC + d.totalTJA);
      else value = pct(d.s6, d.totalSO);
      if (value >= 70) alto++;
      else if (value >= 40) medio++;
      else bajo++;
    });
    return {
      pieData: [
        { name: "Alto (≥70%)", value: alto, color: "#22c55e" },
        { name: "Medio (40–69%)", value: medio, color: "#f59e0b" },
        { name: "Bajo (<40%)", value: bajo, color: "#f43f5e" },
      ],
      total: alto + medio + bajo,
    };
  }, [trimesters, selectedTrim, selectedSistema]);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }: any) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">{value}</text>;
  };

  const sistemaInfo = SISTEMAS.find((s) => s.key === selectedSistema);
  const sistemaColor = COLORS[selectedSistema];

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: `0 0 0 1.5px ${sistemaColor}40, 0 4px 24px 0 ${sistemaColor}25` }}
    >
      <div className="h-1 w-full transition-colors duration-300" style={{ background: sistemaColor }} />
      <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <SectionHeader
          icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
          title="Distribución de estados por nivel de cobertura"
          desc="Cuántos estados se encuentran en cada nivel (alto, medio, bajo) para un trimestre y sistema seleccionados."
        />
        <div className="flex gap-2 flex-shrink-0">
          <Select value={selectedTrim} onValueChange={setSelectedTrim}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{trimesters.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSistema} onValueChange={(v) => setSelectedSistema(v as keyof typeof COLORS)}>
            <SelectTrigger className="w-[110px] h-8 text-xs font-semibold" style={{ color: sistemaColor }}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SISTEMAS.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  <span className="font-semibold" style={{ color: COLORS[key as keyof typeof COLORS] }}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">{sistemaInfo?.label} — {sistemaInfo?.desc}</p>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <PieChart width={220} height={220}>
            <Pie data={pieData} cx={110} cy={110} innerRadius={65} outerRadius={105}
              dataKey="value" labelLine={false} label={renderLabel}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v} estados`, ""]} />
          </PieChart>
        </div>
        <div className="space-y-4 flex-1 w-full">
          {pieData.map((d) => (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <span className="text-xl font-bold tabular-nums">{d.value} <span className="text-xs font-normal text-muted-foreground">estados</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%`, background: d.color }} />
              </div>
              <p className="text-xs text-muted-foreground text-right">{total > 0 ? Math.round((d.value / total) * 100) : 0}% del total</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Bloque Radar: Comparación de perfil entre dos entidades ───────────────────

function BloqueRadar({ trimesters }: { trimesters: TrimData[] }) {
  const latestId = trimesters[trimesters.length - 1]?.id ?? "";
  const [selectedTrim, setSelectedTrim] = useState(latestId);
  const [idA, setIdA] = useState("14");
  const [idB, setIdB] = useState("09");

  const trimData = trimesters.find((t) => t.id === selectedTrim);

  const calcRadar = (entityId: string) => {
    const d = trimData?.entidades[entityId];
    if (!d) return { S1: 0, S2: 0, S3: 0, S6: 0 };
    return {
      S1: pct(d.s1, d.totalSO),
      S2: pct(d.s2, d.totalSO),
      S3: pct(d.s3OIC + d.s3TJA, d.totalOIC + d.totalTJA),
      S6: pct(d.s6, d.totalSO),
    };
  };

  const radarData = useMemo(() => {
    const a = calcRadar(idA);
    const b = calcRadar(idB);
    return SISTEMAS.map((s) => ({
      sistema: s.key,
      label: s.label,
      A: a[s.key as keyof typeof a],
      B: b[s.key as keyof typeof b],
      desc: s.desc,
    }));
  }, [trimData, idA, idB]);

  const entA = entidadesData.find((e) => e.id === idA);
  const entB = entidadesData.find((e) => e.id === idB);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <SectionHeader
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          title="Perfil de cobertura por sistemas"
          desc="Compara dos entidades en los cuatro sistemas simultáneamente. Útil para identificar en qué sistemas hay mayor o menor avance relativo."
        />
        <Select value={selectedTrim} onValueChange={setSelectedTrim}>
          <SelectTrigger className="w-[110px] h-8 text-xs flex-shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>{trimesters.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Entity comparison cards */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="flex-1 flex items-center gap-3 rounded-xl border px-4 py-3 min-w-0 transition-colors duration-200"
          style={{ borderColor: `${COLORS.S1}40`, background: `${COLORS.S1}08` }}>
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: COLORS.S1 }} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{ color: COLORS.S1 }}>Entidad A</span>
            <Select value={idA} onValueChange={setIdA}>
              <SelectTrigger className="h-auto text-sm font-semibold border-0 bg-transparent shadow-none p-0 focus:ring-0 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{entidadesData.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center flex-shrink-0 sm:py-0 py-0.5">
          <span className="text-xs font-bold text-muted-foreground/60 bg-muted/70 rounded-full h-7 w-7 flex items-center justify-center select-none">vs</span>
        </div>

        <div className="flex-1 flex items-center gap-3 rounded-xl border px-4 py-3 min-w-0 transition-colors duration-200"
          style={{ borderColor: `${COLORS.S2}40`, background: `${COLORS.S2}08` }}>
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: COLORS.S2 }} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{ color: COLORS.S2 }}>Entidad B</span>
            <Select value={idB} onValueChange={setIdB}>
              <SelectTrigger className="h-auto text-sm font-semibold border-0 bg-transparent shadow-none p-0 focus:ring-0 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{entidadesData.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Gráfica radar */}
        <div className="w-full lg:w-3/5 flex-shrink-0">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="sistema" tick={{ fontSize: 13, fontWeight: 700 }} />
              <PolarRadiusAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 9 }} angle={30} />
              <Radar name={entA?.nombre ?? ""} dataKey="A" stroke={COLORS.S1} fill={COLORS.S1} fillOpacity={0.3} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.S1 }} />
              <Radar name={entB?.nombre ?? ""} dataKey="B" stroke={COLORS.S2} fill={COLORS.S2} fillOpacity={0.3} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.S2 }} />
              <Legend content={() => (
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 4 }}>
                  {([
                    { name: entA?.nombre ?? "—", color: COLORS.S1, tag: "A" },
                    { name: entB?.nombre ?? "—", color: COLORS.S2, tag: "B" },
                  ] as const).map(({ name, color, tag }) => (
                    <div key={tag} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: `${color}12`, border: `1px solid ${color}35`,
                      borderRadius: 999, padding: "3px 10px 3px 6px",
                    }}>
                      <span style={{ height: 8, width: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color, lineHeight: 1 }}>{tag}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "currentColor", opacity: 0.75, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1 }}>{name}</span>
                    </div>
                  ))}
                </div>
              )} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla comparativa */}
        <div className="w-full lg:flex-1 rounded-lg border border-border/50 overflow-hidden self-center">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Sistema</th>
                <th className="text-center py-2.5 px-3 font-semibold" style={{ color: COLORS.S1 }}>{entA?.abreviacion ?? "—"}</th>
                <th className="text-center py-2.5 px-3 font-semibold" style={{ color: COLORS.S2 }}>{entB?.abreviacion ?? "—"}</th>
                <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {radarData.map((row) => {
                const diff = row.A - row.B;
                return (
                  <tr key={row.sistema} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-foreground">{row.sistema}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{row.desc}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 font-bold tabular-nums"
                        style={{ background: `${COLORS.S1}18`, color: COLORS.S1 }}>{row.A}%</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 font-bold tabular-nums"
                        style={{ background: `${COLORS.S2}18`, color: COLORS.S2 }}>{row.B}%</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold tabular-nums text-[11px] ${diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Menú de selección de gráficas ────────────────────────────────────────────

const CHART_MENU = [
  { id: "evolucion",    label: "Evolución",      icon: TrendingUp,    desc: "Tendencia trimestral" },
  { id: "variacion",    label: "Variación",      icon: ArrowLeftRight, desc: "Cambios entre periodos" },
  { id: "heatmap",      label: "Mapa de calor",  icon: LayoutGrid,    desc: "Todos los estados" },
  { id: "ranking",      label: "Ranking",        icon: MapPin,        desc: "Por entidad" },
  { id: "distribucion", label: "Distribución",   icon: PieChartIcon,  desc: "Por nivel" },
  { id: "radar",        label: "Perfil",         icon: Activity,      desc: "Comparación" },
  { id: "descargas",    label: "Descargas",      icon: FileDown,      desc: "Archivos" },
] as const;

type ChartId = typeof CHART_MENU[number]["id"];

// ── Componente principal ──────────────────────────────────────────────────────

export function HistoricoCharts() {
  const [trimesters, setTrimesters] = useState<TrimData[]>([]);
  const [config, setConfig]         = useState<TrimConfig[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [selected, setSelected] = useState<ChartId>("evolucion");
  const [visible,  setVisible]  = useState(true);

  const handleSelect = (id: ChartId) => {
    if (id === selected) return;
    setVisible(false);
    setTimeout(() => { setSelected(id); setVisible(true); }, 220);
  };

  useEffect(() => {
    Promise.all([fetchHistoricoResumen(), fetchHistoricoConfig()])
      .then(([t, c]) => { setTrimesters(t); setConfig(c); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState msg={error} />;
  if (!trimesters.length) return <p className="text-sm text-muted-foreground py-10 text-center">Sin datos disponibles.</p>;

  return (
    <div className="space-y-5">
      {/* Resumen siempre visible */}
      <BloqueMetricas trimesters={trimesters} />

      {/* Menú de selección */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
          Explorar análisis
        </p>
        <div className="grid grid-cols-7 gap-2">
          {CHART_MENU.map(({ id, label, icon: Icon, desc }) => {
            const isActive = selected === id;
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all duration-200 w-full group ${
                  isActive
                    ? "bg-primary/15 border-primary/60 text-primary shadow-md scale-[1.04]"
                    : "bg-muted/60 border-muted-foreground/20 text-muted-foreground hover:bg-primary/8 hover:border-primary/35 hover:text-foreground hover:shadow-sm hover:scale-[1.02]"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "text-primary" : "opacity-60 group-hover:opacity-100 group-hover:scale-110"}`} />
                <span className={`text-xs font-semibold text-center leading-tight ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`}>{label}</span>
                <span className={`text-[10px] text-center leading-tight ${isActive ? "text-primary/70" : "opacity-50 group-hover:opacity-80"}`}>{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfica seleccionada con fade */}
      <div
        className="transition-all duration-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
      >
        {selected === "evolucion"    && <BloqueEvolucion      trimesters={trimesters} />}
        {selected === "variacion"    && <BloqueVariacion      trimesters={trimesters} />}
        {selected === "heatmap"      && <BloqueHeatmap        trimesters={trimesters} />}
        {selected === "ranking"      && <BloqueRanking        trimesters={trimesters} />}
        {selected === "distribucion" && <BloquePieDistribucion trimesters={trimesters} />}
        {selected === "radar"        && <BloqueRadar          trimesters={trimesters} />}
        {selected === "descargas"    && <BloqueDescargas      config={config} />}
      </div>
    </div>
  );
}
