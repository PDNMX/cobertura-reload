// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { signOut } from "next-auth/react";
import directus from "@/lib/directus";
import { readItems, withToken } from "@directus/sdk";
import { Overview } from "@/components/overview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import icoS1 from "@/components/tables/cobertura-table/icons-thead/s1.svg";
import icoS2 from "@/components/tables/cobertura-table/icons-thead/s2.svg";
import icoS3OIC from "@/components/tables/cobertura-table/icons-thead/s3OIC.svg";
import icoS6 from "@/components/tables/cobertura-table/icons-thead/s6.svg";
import iconEjecutivo from "@/components/tables/cobertura-table/icons-thead/ejecutivo.svg";
import iconJudicial from "@/components/tables/cobertura-table/icons-thead/judicial.svg";
import iconLegislativo from "@/components/tables/cobertura-table/icons-thead/legislativo.svg";
import iconAutonomo from "@/components/tables/cobertura-table/icons-thead/autonomo.svg";
import iconEjecutivoMunicipal from "@/components/tables/cobertura-table/icons-thead/ejecutivo_municipal.svg";
import iconOICE from "@/components/tables/cobertura-table/icons-thead/oice.svg";
import iconOICM from "@/components/tables/cobertura-table/icons-thead/oicm.svg";
import iconTJA from "@/components/tables/cobertura-table/icons-thead/tribunal.svg";
import {
  CalendarDays,
  ArrowRight,
  ClipboardList,
  RefreshCw,
  MapPin,
  Activity,
  Building2,
  ShieldCheck,
  Gavel,
  Loader2,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const GOOGLE_FORM_URL = "https://forms.gle/NyEWrtFFiaeAkXzB8";

/** Ventanas de captura trimestral — actualizar solo si cambian las fechas oficiales */
const CAPTURE_PERIODS = [
  {
    id: "1T2026",
    trimestre: "Primer Trimestre 2026",
    periodoLabel: "enero — marzo 2026",
    start: new Date(2026, 3, 1),            // 1 abr 2026
    end:   new Date(2026, 3, 9, 23, 59, 59), // 9 abr 2026
  },
  {
    id: "2T2026",
    trimestre: "Segundo Trimestre 2026",
    periodoLabel: "abril — junio 2026",
    start: new Date(2026, 6, 19),            // 19 jul 2026
    end:   new Date(2026, 6, 27, 23, 59, 59), // 27 jul 2026
  },
  {
    id: "3T2026",
    trimestre: "Tercer Trimestre 2026",
    periodoLabel: "julio — septiembre 2026",
    start: new Date(2026, 9, 1),             // 1 oct 2026
    end:   new Date(2026, 9, 9, 23, 59, 59),  // 9 oct 2026
  },
  {
    id: "4T2026",
    trimestre: "Cuarto Trimestre 2026",
    periodoLabel: "octubre — diciembre 2026",
    start: new Date(2027, 0, 7),             // 7 ene 2027
    end:   new Date(2027, 0, 15, 23, 59, 59), // 15 ene 2027
  },
];

/** Período actualmente abierto (dentro de ventana), o null */
function getActivePeriod(now: Date) {
  return CAPTURE_PERIODS.find(p => now >= p.start && now <= p.end) ?? null;
}

/** Próxima ventana futura más cercana, o null */
function getNextPeriod(now: Date) {
  return CAPTURE_PERIODS.find(p => now < p.start) ?? null;
}

/** Formatea rango: "1 — 9 de abril de 2026" */
function formatRange(start: Date, end: Date) {
  const startDay = start.getDate();
  const endStr = new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  }).format(end);
  return `${startDay} — ${endStr}`;
}

const SISTEMAS = [
  { key: "sistema1", label: "Sistema 1", short: "S1", desc: "Evolución patrimonial, declaración de intereses y fiscal", icon: icoS1,    hex: "#F29888", totalKey: "totalSujetosObligados" },
  { key: "sistema2", label: "Sistema 2", short: "S2", desc: "Servidores públicos en contrataciones públicas",           icon: icoS2,    hex: "#B25FAC", totalKey: "totalSujetosObligados" },
  { key: "sistema3", label: "Sistema 3", short: "S3", desc: "Servidores públicos y particulares sancionados",           icon: icoS3OIC, hex: "#9085DA", totalKey: "totalOIC"             },
  { key: "sistema6", label: "Sistema 6", short: "S6", desc: "Sistema de Información Pública de Contrataciones",         icon: icoS6,    hex: "#42A5CC", totalKey: "totalSujetosObligados" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctN(v: number, t: number) { return t === 0 ? 0 : Math.round((v / t) * 100); }
function pctStr(v: number, t: number) { return t === 0 ? "0.0" : ((v / t) * 100).toFixed(1); }

// ─── Anillo SVG de progreso ───────────────────────────────────────────────────
function Ring({
  pct, color, size = 72, stroke = 7,
}: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct, 100) / 100 * circ;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "hsl(var(--ring-track))" }} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className="text-xs font-black tabular-nums z-10" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ─── Fila clasificación ───────────────────────────────────────────────────────
function ClasificacionRow({ icon, label, value, total, color }: {
  icon: any; label: string; value: number; total: number; color: string;
}) {
  const p = pctN(value, total);
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Image src={icon} alt={label} width={14} height={14} className="shrink-0 opacity-75" />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs font-bold tabular-nums w-6 text-right">{value}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{p}%</span>
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Page() {
  const { session, status } = useCurrentSession();
  const [serverNow, setServerNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sistema1: 0, sistema2: 0, sistema3: 0, sistema6: 0,
    totalSujetosObligados: 0, totalOIC: 0,
  });
  const [counts, setCounts] = useState({
    ejecutivo: 0, judicial: 0, legislativo: 0, autonomo: 0,
    ejecutivoMunicipal: 0, OIC: 0, OICM: 0, TJA: 0,
  });

  useEffect(() => {
    fetch("/api/server-time")
      .then(r => r.json())
      .then(({ now }) => setServerNow(new Date(now)))
      .catch(() => setServerNow(new Date())); // fallback al cliente si falla
  }, []);

  useEffect(() => {
    if (session?.forceLogout) {
      signOut({ callbackUrl: "/" });
    } else if (status === "authenticated") {
      async function fetchData() {
        try {
          const result = await directus.request(
            withToken(session?.access_token, readItems("entes", {
              limit: "-1",
              fields: ["*", "controlOIC", "controlTribunal", "ambitoGobierno", "poderGobierno"],
            })),
          );
          const p = result.reduce((acc, item) => {
            if (!item.controlOIC) {
              if (item.sistema1) acc.sistema1 += 1;
              if (item.sistema2) acc.sistema2 += 1;
              if (item.sistema6) acc.sistema6 += 1;
              acc.totalSujetosObligados += 1;
              if (item.ambitoGobierno !== "Municipal") {
                if (item.poderGobierno === "Ejecutivo")   acc.ejecutivo += 1;
                if (item.poderGobierno === "Judicial")    acc.judicial += 1;
                if (item.poderGobierno === "Legislativo") acc.legislativo += 1;
                if (item.poderGobierno === "Autonomo")    acc.autonomo += 1;
              } else {
                if (item.poderGobierno === "Ejecutivo") acc.ejecutivoMunicipal += 1;
              }
            }
            if (item.controlOIC || item.controlTribunal) {
              if (item.controlOIC) {
                if (item.ambitoGobierno === "Estatal")   acc.OIC += 1;
                if (item.ambitoGobierno === "Municipal") acc.OICM += 1;
              }
              if (item.controlTribunal) acc.TJA += 1;
              if (item.sistema3) acc.sistema3 += 1;
              acc.totalOIC += 1;
            }
            return acc;
          }, {
            sistema1: 0, sistema2: 0, sistema3: 0, sistema6: 0,
            totalSujetosObligados: 0, totalOIC: 0,
            ejecutivo: 0, judicial: 0, legislativo: 0, autonomo: 0,
            ejecutivoMunicipal: 0, OIC: 0, OICM: 0, TJA: 0,
          });
          setData(p);
          setCounts(p);
        } catch (err) {
          console.error("Error al cargar los datos:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  const userName   = session?.user?.name    ?? "";
  const entidadId  = session?.user?.entidad ?? "";
  const totalEntes = data.totalSujetosObligados + data.totalOIC;

  // Cobertura SO: promedio S1, S2, S6
  const avgSO = Math.round((
    pctN(data.sistema1, data.totalSujetosObligados) +
    pctN(data.sistema2, data.totalSujetosObligados) +
    pctN(data.sistema6, data.totalSujetosObligados)
  ) / 3);

  // Cobertura OIC: S3
  const avgOIC = pctN(data.sistema3, data.totalOIC);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">

        {/* ══ 1. BIENVENIDA ══════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1 font-medium">
              Tablero estatal · PDN
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              {userName ? `¡Bienvenido, ${userName}! 👋` : "¡Bienvenido de nuevo! 👋"}
            </h2>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {loading && (
              <Badge variant="outline" className="gap-1.5 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Cargando datos…
              </Badge>
            )}
            {!loading && (
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Datos en tiempo real
              </Badge>
            )}
          </div>
        </div>

        {/* ══ 2. AVISOS ══════════════════════════════════════════════════════ */}
        {(() => {
          const now    = serverNow ?? new Date();
          const active = getActivePeriod(now);
          const next   = getNextPeriod(now);
          const shown  = active ?? next;

          return (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">

              {/* ── Card 1: Ventana de captura ── */}
              <div className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-4 ${
                active
                  ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20"
                  : "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/20"
              }`}>
                {/* Icono decorativo de fondo */}
                <CalendarDays className={`absolute right-4 top-4 h-20 w-20 opacity-[0.06] ${active ? "text-green-600" : "text-amber-600"}`} />

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-green-100 dark:bg-green-900/50" : "bg-amber-100 dark:bg-amber-900/50"
                  }`}>
                    <CalendarDays className={`h-5 w-5 ${active ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                    active
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                      : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                  }`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                    {active ? "Ventana abierta" : "Próximamente"}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="space-y-1">
                  <p className={`text-xs font-medium uppercase tracking-wider ${active ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {shown?.trimestre ?? "Sin período programado"}
                  </p>
                  <h3 className={`text-base font-bold leading-snug ${active ? "text-green-900 dark:text-green-100" : "text-amber-900 dark:text-amber-100"}`}>
                    Actualización del padrón de Entes Públicos
                  </h3>
                  <p className={`text-xs leading-relaxed ${active ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>
                    {shown
                      ? <>Periodo de reporte: <strong>{shown.periodoLabel}</strong></>
                      : "No hay un período de captura programado próximamente."}
                  </p>
                </div>

                {/* Fecha destacada */}
                {shown && (
                  <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    active
                      ? "border-green-200 dark:border-green-700 bg-white/70 dark:bg-green-900/20"
                      : "border-amber-200 dark:border-amber-700 bg-white/70 dark:bg-amber-900/20"
                  }`}>
                    <div className={`h-8 w-1 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-amber-500"}`} />
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider font-medium mb-0.5 ${active ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {active ? "Ventana de captura" : "Próxima ventana"}
                      </p>
                      <p className={`text-sm font-bold ${active ? "text-green-900 dark:text-green-100" : "text-amber-900 dark:text-amber-100"}`}>
                        {formatRange(shown.start, shown.end)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Card 2: Formulario trimestral ── */}
              <div className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-4 ${
                active
                  ? "border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50/60 dark:from-violet-950/30 dark:to-purple-950/20"
                  : "border-violet-200/70 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/60 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10"
              }`}>
                {/* Icono decorativo de fondo */}
                <ClipboardList className="absolute right-4 top-4 h-20 w-20 opacity-[0.06] text-violet-600" />

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
                    <ClipboardList className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                    active
                      ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700"
                      : "bg-muted text-muted-foreground border-border/60"
                  }`}>
                    {active ? "Disponible ahora" : shown ? "No disponible aún" : "Sin período"}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Formulario trimestral · PDN
                  </p>
                  <h3 className="text-base font-bold leading-snug text-violet-900 dark:text-violet-100">
                    Avance en la interconexión con los sistemas
                  </h3>
                  <p className="text-xs leading-relaxed text-violet-700 dark:text-violet-300">
                    Reporta el avance de tu entidad en la interconexión con los sistemas 1, 2, 3 y 6 de la Plataforma Digital Nacional.
                  </p>
                </div>

                {/* Acción */}
                <div className="space-y-2">
                  {active ? (
                    <a
                      href={GOOGLE_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shadow-violet-200 dark:shadow-none"
                    >
                      Ir al formulario
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <>
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-100/80 dark:bg-violet-900/20 border border-violet-200/60 dark:border-violet-800/40 px-4 py-2.5 text-sm font-semibold text-violet-400 dark:text-violet-500 cursor-not-allowed select-none">
                        Formulario no disponible aún
                      </div>
                      {next && (
                        <p className="text-center text-[11px] text-violet-500 dark:text-violet-400">
                          Disponible del {formatRange(next.start, next.end)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ══ 3. SEPARADOR ═══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-1">
            <Activity className="h-3.5 w-3.5" /> Estadísticas · {(() => { const n = serverNow ?? new Date(); return (getActivePeriod(n) ?? getNextPeriod(n))?.trimestre ?? "Último corte"; })()}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* ══ 4. HERO CARD ═══════════════════════════════════════════════════ */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#F29888] via-[#9085DA] to-[#42A5CC]" />

          <CardContent className="pt-6 pb-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-16 w-28" />
                  <Skeleton className="h-16 w-28" />
                  <Skeleton className="h-16 w-28" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                {/* Identidad + stats */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Entidad federativa</p>
                    </div>
                    <h3 className="text-2xl font-black leading-tight">{userName || "Tu entidad"}</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="gap-1 text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        En tiempo real
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <CalendarDays className="h-2.5 w-2.5" />
                        2T 2026 · En curso
                      </Badge>
                    </div>
                  </div>

                  {/* 3 stat boxes */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Sujetos Obligados", value: data.totalSujetosObligados, color: "#F29888" },
                      { label: "OIC y Tribunales",  value: data.totalOIC,               color: "#F5A623" },
                      { label: "Total Entes",        value: totalEntes,                  color: "#9085DA" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl border bg-muted/40 px-3 py-3">
                        <p className="text-2xl font-black tabular-nums leading-none" style={{ color }}>{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anillos de cobertura */}
                <div className="flex items-center gap-6 shrink-0 lg:pl-6 lg:border-l">
                  {/* SO */}
                  <div className="flex flex-col items-center gap-2">
                    <Ring pct={avgSO} color="#F29888" size={96} stroke={9} />
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-foreground">Cobertura SO</p>
                      <p className="text-[10px] text-muted-foreground">S1 · S2 · S6</p>
                    </div>
                  </div>
                  <div className="h-16 w-px bg-border hidden sm:block" />
                  {/* OIC */}
                  <div className="flex flex-col items-center gap-2">
                    <Ring pct={avgOIC} color="#9085DA" size={96} stroke={9} />
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-foreground">Cobertura OIC</p>
                      <p className="text-[10px] text-muted-foreground">Sistema 3</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ══ 5. TARJETAS DE SISTEMAS ════════════════════════════════════════ */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SISTEMAS.map((s) => {
            const total = data[s.totalKey];
            const value = data[s.key];
            const p     = parseFloat(pctStr(value, total));
            return (
              <Card key={s.key} className="flex flex-col">
                {/* Header con color */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                      style={{ backgroundColor: `${s.hex}18` }}>
                      <Image src={s.icon} alt={s.label} width={20} height={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.short}</p>
                      <p className="text-sm font-bold leading-tight" style={{ color: s.hex }}>{s.label}</p>
                    </div>
                  </div>
                  {loading
                    ? <Skeleton className="h-14 w-14 rounded-full" />
                    : <Ring pct={p} color={s.hex} size={56} stroke={5} />
                  }
                </div>

                <div className="h-px bg-border mx-5" />

                <CardContent className="pt-3 pb-4 flex flex-col flex-1 gap-2">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-end gap-1.5">
                        <span className="text-3xl font-black tabular-nums leading-none" style={{ color: s.hex }}>{value}</span>
                        <span className="text-sm text-muted-foreground mb-0.5">/ {total}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug flex-1">{s.desc}</p>
                      <div className="flex items-center justify-between pt-1 border-t mt-auto">
                        <span className="text-[11px] font-bold" style={{ color: s.hex }}>{p}% conectados</span>
                        <span className="text-[11px] text-muted-foreground">{total - value} pendientes</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ══ 6. CLASIFICACIÓN + OVERVIEW ════════════════════════════════════ */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">

          {/* Clasificación */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle>Clasificación de Entes</CardTitle>
              <CardDescription>Distribución por tipo y ámbito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full rounded-full" />
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : (
                <>
                  {/* Barra apilada */}
                  <div className="space-y-1.5">
                    <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
                      {[
                        { v: counts.ejecutivo,          c: "#F29888" },
                        { v: counts.judicial,           c: "#B25FAC" },
                        { v: counts.legislativo,        c: "#9085DA" },
                        { v: counts.autonomo,           c: "#42A5CC" },
                        { v: counts.ejecutivoMunicipal, c: "#6EAF8F" },
                        { v: counts.OIC + counts.OICM,  c: "#F5A623" },
                        { v: counts.TJA,                c: "#E05C5C" },
                      ].map(({ v, c }, i) => {
                        const w = pctN(v, totalEntes);
                        return w > 0 ? (
                          <div key={i} className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                            style={{ width: `${w}%`, backgroundColor: c }} />
                        ) : null;
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                      {[
                        { label: "Ejecutivo",   c: "#F29888" }, { label: "Judicial",    c: "#B25FAC" },
                        { label: "Legislativo", c: "#9085DA" }, { label: "Autónomo",    c: "#42A5CC" },
                        { label: "Municipal",   c: "#6EAF8F" }, { label: "OIC",         c: "#F5A623" },
                        { label: "TJA",         c: "#E05C5C" },
                      ].map(({ label, c }) => (
                        <div key={label} className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                          <span className="text-[10px] text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Sujetos Obligados */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F29888]/15">
                          <Building2 className="h-3 w-3 text-[#F29888]" />
                        </div>
                        <span className="text-xs font-bold">Sujetos Obligados</span>
                      </div>
                      <span className="text-xs font-black tabular-nums border rounded-full px-2 py-0.5 text-muted-foreground">{data.totalSujetosObligados}</span>
                    </div>
                    <div className="space-y-2 pl-1">
                      <ClasificacionRow icon={iconEjecutivo}          label="Ejecutivo Estatal"   value={counts.ejecutivo}          total={data.totalSujetosObligados} color="#F29888" />
                      <ClasificacionRow icon={iconJudicial}           label="Judicial Estatal"    value={counts.judicial}           total={data.totalSujetosObligados} color="#B25FAC" />
                      <ClasificacionRow icon={iconLegislativo}        label="Legislativo Estatal" value={counts.legislativo}        total={data.totalSujetosObligados} color="#9085DA" />
                      <ClasificacionRow icon={iconAutonomo}           label="Autónomo Estatal"    value={counts.autonomo}           total={data.totalSujetosObligados} color="#42A5CC" />
                      <ClasificacionRow icon={iconEjecutivoMunicipal} label="Ejecutivo Municipal" value={counts.ejecutivoMunicipal} total={data.totalSujetosObligados} color="#6EAF8F" />
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* OIC */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F5A623]/15">
                          <ShieldCheck className="h-3 w-3 text-[#F5A623]" />
                        </div>
                        <span className="text-xs font-bold">Órganos Internos de Control</span>
                      </div>
                      <span className="text-xs font-black tabular-nums border rounded-full px-2 py-0.5 text-muted-foreground">{counts.OIC + counts.OICM}</span>
                    </div>
                    <div className="space-y-2 pl-1">
                      <ClasificacionRow icon={iconOICE} label="OICE — Estatales"   value={counts.OIC}  total={counts.OIC + counts.OICM} color="#F5A623" />
                      <ClasificacionRow icon={iconOICM} label="OICM — Municipales" value={counts.OICM} total={counts.OIC + counts.OICM} color="#E8930A" />
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* TJA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E05C5C]/15">
                          <Gavel className="h-3 w-3 text-[#E05C5C]" />
                        </div>
                        <span className="text-xs font-bold">Tribunal de Justicia Administrativa</span>
                      </div>
                      <span className="text-xs font-black tabular-nums border rounded-full px-2 py-0.5 text-muted-foreground">{counts.TJA}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border bg-[#E05C5C]/5 px-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E05C5C]/10">
                        <Image src={iconTJA} alt="TJA" width={18} height={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground">Tribunales registrados</p>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                          <div className="h-full rounded-full transition-all duration-700 bg-[#E05C5C]"
                            style={{ width: `${pctN(counts.TJA, data.totalOIC)}%` }} />
                        </div>
                      </div>
                      <span className="text-2xl font-black tabular-nums shrink-0 text-[#E05C5C]">{counts.TJA}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Overview chart */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Avance por sistema</CardTitle>
              <CardDescription>Último corte: 1T 2026 — 1 de enero al 31 de marzo de 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <Overview entidad={entidadId} />
            </CardContent>
          </Card>

        </div>

      </div>
    </ScrollArea>
  );
}
