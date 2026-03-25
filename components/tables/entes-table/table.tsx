// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, X, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import Image from "next/image";
import icoS1    from "@/components/tables/cobertura-table/icons-thead/s1.svg";
import icoS2    from "@/components/tables/cobertura-table/icons-thead/s2.svg";
import icoS3OIC from "@/components/tables/cobertura-table/icons-thead/s3OIC.svg";
import icoS6    from "@/components/tables/cobertura-table/icons-thead/s6.svg";
import icoSO    from "@/components/tables/cobertura-table/icons-thead/sujetosObligados.svg";
import icoOIC   from "@/components/tables/cobertura-table/icons-thead/oic.svg";
import icoTJA   from "@/components/tables/cobertura-table/icons-thead/tribunal.svg";

// Colores y metadatos por tipo de ente
const TAB_META = {
  SO:  { color: "#6f4168", iconSrc: icoSO  },
  OIC: { color: "#c49a2a", iconSrc: icoOIC },
  TJA: { color: "#b5877a", iconSrc: icoTJA },
};

// ─── Config ───────────────────────────────────────────────────────────────────
const columnVisibilityMap = {
  SO:  { ambitoGobierno: true, poderGobierno: true, sistema1: true,  sistema2: true,  sistema3: false, sistema6: true  },
  OIC: { ambitoGobierno: true, poderGobierno: true, sistema1: false, sistema2: false, sistema3: true,  sistema6: false },
  TJA: { ambitoGobierno: true, poderGobierno: true, sistema1: true,  sistema2: true,  sistema3: true,  sistema6: true  },
};

// Sistemas visibles por tab
const SISTEMAS_POR_TAB = {
  SO:  [
    { key: "sistema1", label: "S1", icon: icoS1, hex: "#F29888" },
    { key: "sistema2", label: "S2", icon: icoS2, hex: "#B25FAC" },
    { key: "sistema6", label: "S6", icon: icoS6, hex: "#42A5CC" },
  ],
  OIC: [
    { key: "sistema3", label: "S3", icon: icoS3OIC, hex: "#9085DA" },
  ],
  TJA: [
    { key: "sistema1", label: "S1", icon: icoS1,    hex: "#F29888" },
    { key: "sistema2", label: "S2", icon: icoS2,    hex: "#B25FAC" },
    { key: "sistema3", label: "S3", icon: icoS3OIC, hex: "#9085DA" },
    { key: "sistema6", label: "S6", icon: icoS6,    hex: "#42A5CC" },
  ],
};

// Estado de filtro de sistema: null=todos, true=conectados, false=sin conexión
type SistemaFilter = Record<string, null | boolean>;

const emptyFilters = {
  nombre:  "",
  ambito:  "all",
  poder:   "all",
  sistemas: {} as SistemaFilter,
};

// ─── Barra de filtros ─────────────────────────────────────────────────────────
function FilterBar({
  tab,
  filters,
  onChange,
  onClear,
  activeCount,
  total,
  filtered,
}: {
  tab: "SO" | "OIC" | "TJA";
  filters: typeof emptyFilters;
  onChange: (k: string, v: any) => void;
  onClear: () => void;
  activeCount: number;
  total: number;
  filtered: number;
}) {
  const sistemas = SISTEMAS_POR_TAB[tab];

  const cycleSistema = (key: string) => {
    const cur  = filters.sistemas[key] ?? null;
    const next = cur === null ? true : cur === true ? false : null;
    onChange("sistemas", { ...filters.sistemas, [key]: next });
  };

  const getSistemaState = (key: string) => filters.sistemas[key] ?? null;

  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-3">

      {/* Fila 1: búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nombre..."
          value={filters.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          className="pl-9 h-9 text-sm bg-background"
        />
        {filters.nombre && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onChange("nombre", "")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Fila 2: selects + sistemas */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Ámbito */}
        <Select value={filters.ambito} onValueChange={(v) => onChange("ambito", v)}>
          <SelectTrigger className="h-8 min-w-[160px] w-auto text-xs bg-background">
            <SelectValue placeholder="Ámbito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los ámbitos</SelectItem>
            <SelectItem value="Estatal">Estatal</SelectItem>
            <SelectItem value="Federal">Federal</SelectItem>
            <SelectItem value="Municipal">Municipal</SelectItem>
          </SelectContent>
        </Select>

        {/* Poder */}
        <Select value={filters.poder} onValueChange={(v) => onChange("poder", v)}>
          <SelectTrigger className="h-8 min-w-[170px] w-auto text-xs bg-background">
            <SelectValue placeholder="Poder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los poderes</SelectItem>
            <SelectItem value="Ejecutivo">Ejecutivo</SelectItem>
            <SelectItem value="Judicial">Judicial</SelectItem>
            <SelectItem value="Legislativo">Legislativo</SelectItem>
            <SelectItem value="Autonomo">Autónomo</SelectItem>
          </SelectContent>
        </Select>

        {/* Divisor */}
        <span className="hidden sm:block h-5 w-px bg-border" />

        {/* Sistemas */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Conexión:
          </span>
          {sistemas.map((s) => {
            const state = getSistemaState(s.key);
            const isYes = state === true;
            const isNo  = state === false;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => cycleSistema(s.key)}
                title="Clic: Todos → Solo conectados → Sin conexión"
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: isYes ? s.hex + "18" : isNo ? "#ef444415" : "hsl(var(--background))",
                  borderColor:     isYes ? s.hex + "60" : isNo ? "#ef444460" : "hsl(var(--border))",
                  color:           isYes ? s.hex         : isNo ? "#ef4444"   : "hsl(var(--muted-foreground))",
                }}
              >
                <Image src={s.icon} alt={s.label} width={13} height={13} />
                {s.label}
                {isYes && <span className="font-black">✓</span>}
                {isNo  && <span className="font-black">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Spacer + resumen + limpiar */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {filtered === total
              ? <>{total} entes</>
              : <><strong>{filtered}</strong> de {total}</>
            }
          </span>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar {activeCount > 1 ? `(${activeCount})` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Función de filtrado ──────────────────────────────────────────────────────
function applyFilters(data: any[], filters: typeof emptyFilters): any[] {
  return data.filter((item) => {
    if (filters.nombre && !item.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.ambito !== "all" && item.ambitoGobierno !== filters.ambito) return false;
    if (filters.poder  !== "all" && item.poderGobierno  !== filters.poder)  return false;
    for (const [key, val] of Object.entries(filters.sistemas)) {
      if (val === null) continue;
      if (item[key] !== val) return false;
    }
    return true;
  });
}

function countActive(filters: typeof emptyFilters): number {
  let n = 0;
  if (filters.nombre) n++;
  if (filters.ambito !== "all") n++;
  if (filters.poder  !== "all") n++;
  n += Object.values(filters.sistemas).filter((v) => v !== null).length;
  return n;
}

// ─── Tabla principal ──────────────────────────────────────────────────────────
export const EntesTable = ({ data }: any) => {
  const router = useRouter();
  const { session } = useCurrentSession();

  const [activeTab, setActiveTab]   = useState<"SO" | "OIC" | "TJA">("SO");
  const [soFilters,  setSoFilters]  = useState({ ...emptyFilters, sistemas: {} });
  const [oicFilters, setOicFilters] = useState({ ...emptyFilters, sistemas: {} });
  const [tjaFilters, setTjaFilters] = useState({ ...emptyFilters, sistemas: {} });

  const handleChange = (setter) => (key: string, value: any) =>
    setter((prev) => ({ ...prev, [key]: value }));

  const handleClear = (setter) => () =>
    setter({ ...emptyFilters, sistemas: {} });

  // Separar datos por tipo
  const rawSO  = data.filter((i: any) => !i.controlOIC && !i.controlTribunal);
  const rawOIC = data.filter((i: any) =>  i.controlOIC  && !i.controlTribunal);
  const rawTJA = data.filter((i: any) =>  i.controlTribunal);

  // Aplicar filtros
  const soData  = useMemo(() => applyFilters(rawSO,  soFilters),  [rawSO,  soFilters]);
  const oicData = useMemo(() => applyFilters(rawOIC, oicFilters), [rawOIC, oicFilters]);
  const tjaData = useMemo(() => applyFilters(rawTJA, tjaFilters), [rawTJA, tjaFilters]);

  const soActive  = countActive(soFilters);
  const oicActive = countActive(oicFilters);
  const tjaActive = countActive(tjaFilters);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title="Entes Públicos" description="Administrar el padrón de entes de tu entidad" />
      </div>
      <Separator />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "SO" | "OIC" | "TJA")} className="space-y-4">

        {/* ── Selector de tipo ── */}
        <TabsList className="grid grid-cols-3 gap-2 h-auto bg-transparent p-0">
          {([
            {
              value: "SO",
              label: "Sujetos Obligados",
              count: rawSO.length,
              sistemas: [{ ico: icoS1, label: "S1", hex: "#F29888" }, { ico: icoS2, label: "S2", hex: "#B25FAC" }, { ico: icoS6, label: "S6", hex: "#42A5CC" }],
              ...TAB_META.SO,
            },
            {
              value: "OIC",
              label: "Órganos Internos",
              count: rawOIC.length,
              sistemas: [{ ico: icoS3OIC, label: "S3", hex: "#9085DA" }],
              ...TAB_META.OIC,
            },
            {
              value: "TJA",
              label: "Tribunales Administrativos",
              count: rawTJA.length,
              sistemas: [{ ico: icoS1, label: "S1", hex: "#F29888" }, { ico: icoS2, label: "S2", hex: "#B25FAC" }, { ico: icoS3OIC, label: "S3", hex: "#9085DA" }, { ico: icoS6, label: "S6", hex: "#42A5CC" }],
              ...TAB_META.TJA,
            },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-auto p-0 bg-transparent border-0 rounded-xl data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <div
                  className="relative w-full rounded-xl border-2 p-3 text-left transition-all duration-200 overflow-hidden"
                  style={{
                    borderColor:     isActive ? tab.color      : "hsl(var(--border) / 0.5)",
                    backgroundColor: isActive ? tab.color + "10" : "hsl(var(--card) / 0.6)",
                    boxShadow:       isActive ? `0 0 0 1px ${tab.color}30, 0 4px 12px ${tab.color}20` : undefined,
                  }}
                >
                  {/* Barra superior de color cuando activo */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                      style={{ backgroundColor: tab.color }} />
                  )}

                  {/* Header: icono + label + conteo */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                        style={{ backgroundColor: isActive ? tab.color + "28" : tab.color + "12" }}
                      >
                        <Image src={tab.iconSrc} alt={tab.value} width={20} height={20}
                          className={isActive ? "opacity-100" : "opacity-60"} />
                      </span>
                      <span
                        className="text-xs font-semibold leading-tight text-left"
                        style={{ color: isActive ? tab.color : "hsl(var(--foreground))" }}
                      >
                        {tab.label.includes(" ") ? (
                          <>
                            {tab.label.split(" ").slice(0, Math.ceil(tab.label.split(" ").length / 2)).join(" ")}<br />
                            {tab.label.split(" ").slice(Math.ceil(tab.label.split(" ").length / 2)).join(" ")}
                          </>
                        ) : tab.label}
                      </span>
                    </div>
                    <span
                      className="text-xl font-black tabular-nums leading-none"
                      style={{ color: tab.color, opacity: isActive ? 1 : 0.6 }}
                    >
                      {tab.count}
                    </span>
                  </div>

                  {/* Pills de sistemas */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wide mr-0.5">Reporta:</span>
                    {tab.sistemas.map((s) => (
                      <span key={s.label}
                        className="inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: s.hex + "50", backgroundColor: s.hex + "12", color: s.hex }}>
                        <Image src={s.ico} alt={s.label} width={10} height={10} />{s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Sujetos Obligados ── */}
        <TabsContent value="SO" className="space-y-3 mt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{ borderColor: TAB_META.SO.color + "30", backgroundColor: TAB_META.SO.color + "08" }}>
              <Image src={TAB_META.SO.iconSrc} alt="SO" width={16} height={16} className="shrink-0" />
              <p className="text-xs" style={{ color: TAB_META.SO.color }}>
                Entes públicos que reportan sus registros en los <strong>Sistemas 1, 2 y 6</strong> de la Plataforma Digital Nacional.
              </p>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0 ml-auto"
              onClick={() => router.push("/dashboard/entes/create?tipo=SO")}>
              <Plus className="h-4 w-4" /> Agregar Sujeto Obligado
            </Button>
          </div>
          <FilterBar
            tab="SO" filters={soFilters} activeCount={soActive}
            total={rawSO.length} filtered={soData.length}
            onChange={handleChange(setSoFilters)}
            onClear={handleClear(setSoFilters)}
          />
          <DataTable
            searchKey="nombre" hideSearch
            columns={createColumns(columnVisibilityMap.SO, session)}
            data={soData}
          />
        </TabsContent>

        {/* ── OIC ── */}
        <TabsContent value="OIC" className="space-y-3 mt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{ borderColor: TAB_META.OIC.color + "30", backgroundColor: TAB_META.OIC.color + "08" }}>
              <Image src={TAB_META.OIC.iconSrc} alt="OIC" width={16} height={16} className="shrink-0" />
              <p className="text-xs" style={{ color: TAB_META.OIC.color }}>
                Órganos Internos de Control que reportan sus registros de servidores sancionados en el <strong>Sistema 3</strong> de la PDN.
              </p>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0 ml-auto"
              onClick={() => router.push("/dashboard/entes/create?tipo=OIC")}>
              <Plus className="h-4 w-4" /> Agregar Órgano Interno de Control
            </Button>
          </div>
          <FilterBar
            tab="OIC" filters={oicFilters} activeCount={oicActive}
            total={rawOIC.length} filtered={oicData.length}
            onChange={handleChange(setOicFilters)}
            onClear={handleClear(setOicFilters)}
          />
          <DataTable
            searchKey="nombre" hideSearch
            columns={createColumns(columnVisibilityMap.OIC, session)}
            data={oicData}
          />
        </TabsContent>

        {/* ── Tribunales ── */}
        <TabsContent value="TJA" className="space-y-3 mt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{ borderColor: TAB_META.TJA.color + "30", backgroundColor: TAB_META.TJA.color + "08" }}>
              <Image src={TAB_META.TJA.iconSrc} alt="TJA" width={16} height={16} className="shrink-0" />
              <p className="text-xs" style={{ color: TAB_META.TJA.color }}>
                Tribunales de Justicia Administrativa que reportan en los <strong>Sistemas 1, 2, 3 y 6</strong> de la Plataforma Digital Nacional.
              </p>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0 ml-auto"
              onClick={() => router.push("/dashboard/entes/create?tipo=TJA")}>
              <Plus className="h-4 w-4" /> Agregar Tribunal de Justicia Administrativa
            </Button>
          </div>
          <FilterBar
            tab="TJA" filters={tjaFilters} activeCount={tjaActive}
            total={rawTJA.length} filtered={tjaData.length}
            onChange={handleChange(setTjaFilters)}
            onClear={handleClear(setTjaFilters)}
          />
          <DataTable
            searchKey="nombre" hideSearch
            columns={createColumns(columnVisibilityMap.TJA, session)}
            data={tjaData}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
