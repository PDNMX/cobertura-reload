// @ts-nocheck
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Plus, Search, X, BookUser, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import directus from "@/lib/directus";
import { readItems, withToken } from "@directus/sdk";
import { useCurrentSession } from "@/hooks/useCurrentSession";

/* ── Loading skeleton ─────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="rounded-xl border overflow-hidden">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full mt-px" />
        ))}
      </div>
    </div>
  );
}

/* ── Barra de búsqueda ────────────────────────────── */
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por OIC, nombre o correo..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 h-9 text-sm bg-background"
        />
        {value && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────── */
export const DirectorioTable = () => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDirectorioData() {
      if (session?.access_token) {
        try {
          setLoading(true);
          const result = await directus.request(
            withToken(
              session.access_token,
              readItems("directorio", {
                filter: {
                  entidad: { _eq: session.user.entidad },
                },
                fields: [
                  "*",
                  "oic.nombre",
                  "sujetosObligados.nombre",
                  "entidad.nombre",
                ],
                limit: -1,
              })
            )
          );
          setData(result);
        } catch (error) {
          console.error("Error al obtener los datos del directorio:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchDirectorioData();
  }, [session]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) => {
      const oicNombre = item.oic?.nombre?.toLowerCase() ?? "";
      const nombre = item.nombre?.toLowerCase() ?? "";
      const correo = item.correoElectronico?.toLowerCase() ?? "";
      return oicNombre.includes(q) || nombre.includes(q) || correo.includes(q);
    });
  }, [data, search]);

  const columns = createColumns(session);

  if (loading) return <TableSkeleton />;

  return (
    <div className="flex flex-col gap-5">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-400/15 border border-violet-200/50 dark:border-violet-700/40">
            <BookUser className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Directorio de OIC
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.length} registro{data.length !== 1 ? "s" : ""} en el directorio
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => router.push(`/dashboard/directorio/create`)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar registro</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>

      {/* Nota informativa */}
      <div className="flex gap-3 rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/60 dark:bg-violet-950/20 p-4">
        <Info className="h-4 w-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
          Esta sección integra los datos de contacto y localización de los Órganos Internos de
          Control. Cada OIC puede atender a uno o más Entes Públicos, pero cada Ente Público
          solo puede tener un único OIC asignado.
        </p>
      </div>

      {/* Buscador */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="nombre"
        hideSearch
      />
    </div>
  );
};
