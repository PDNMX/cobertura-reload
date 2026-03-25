// @ts-nocheck
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { CheckCircle2, Minus } from "lucide-react";
import Image from "next/image";
import icoS1 from "@/components/tables/cobertura-table/icons-thead/s1.svg";
import icoS2 from "@/components/tables/cobertura-table/icons-thead/s2.svg";
import icoS3OIC from "@/components/tables/cobertura-table/icons-thead/s3OIC.svg";
import icoS6 from "@/components/tables/cobertura-table/icons-thead/s6.svg";

const SISTEMA_META = {
  sistema1: { icon: icoS1,    label: "S1", hex: "#F29888" },
  sistema2: { icon: icoS2,    label: "S2", hex: "#B25FAC" },
  sistema3: { icon: icoS3OIC, label: "S3", hex: "#9085DA" },
  sistema6: { icon: icoS6,    label: "S6", hex: "#42A5CC" },
};

function SistemaHeader({ sistemaKey }: { sistemaKey: string }) {
  const m = SISTEMA_META[sistemaKey];
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <Image src={m.icon} alt={m.label} width={18} height={18} />
      <span className="text-[10px] font-bold" style={{ color: m.hex }}>{m.label}</span>
    </div>
  );
}

function SistemaCell({ value, sistemaKey }: { value: boolean; sistemaKey: string }) {
  const m = SISTEMA_META[sistemaKey];
  if (value) {
    return (
      <div className="flex justify-center">
        <span
          className="inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: m.hex + "15",
            borderColor:     m.hex + "50",
            color:           m.hex,
          }}
        >
          <CheckCircle2 className="h-2.5 w-2.5" /> Sí
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />
    </div>
  );
}

export const createColumns = (visibilityMap, session): ColumnDef<any>[] => [
  {
    accessorKey: "nombre",
    header: () => <div className="text-left font-semibold text-xs">Nombre</div>,
    cell: ({ row }) => (
      <div className="text-left text-sm font-medium">{row.original.nombre}</div>
    ),
    size: 450,
    enableSorting: true,
  },
  visibilityMap.ambitoGobierno && {
    accessorKey: "ambitoGobierno",
    header: () => <div className="text-center font-semibold text-xs whitespace-nowrap">Ámbito</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
          {row.original.ambitoGobierno}
        </span>
      </div>
    ),
    size: 110,
    enableSorting: true,
  },
  visibilityMap.poderGobierno && {
    accessorKey: "poderGobierno",
    header: () => <div className="text-center font-semibold text-xs whitespace-nowrap">Poder</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
          {row.original.poderGobierno}
        </span>
      </div>
    ),
    size: 110,
    enableSorting: true,
  },
  visibilityMap.sistema1 && {
    accessorKey: "sistema1",
    header: () => <SistemaHeader sistemaKey="sistema1" />,
    cell: ({ row }) => <SistemaCell value={row.original.sistema1} sistemaKey="sistema1" />,
    size: 60,
    enableSorting: true,
    sortingFn: (rowA, rowB, colId) => (rowA.original[colId] ? 1 : 0) - (rowB.original[colId] ? 1 : 0),
  },
  visibilityMap.sistema2 && {
    accessorKey: "sistema2",
    header: () => <SistemaHeader sistemaKey="sistema2" />,
    cell: ({ row }) => <SistemaCell value={row.original.sistema2} sistemaKey="sistema2" />,
    size: 60,
    enableSorting: true,
    sortingFn: (rowA, rowB, colId) => (rowA.original[colId] ? 1 : 0) - (rowB.original[colId] ? 1 : 0),
  },
  visibilityMap.sistema3 && {
    accessorKey: "sistema3",
    header: () => <SistemaHeader sistemaKey="sistema3" />,
    cell: ({ row }) => <SistemaCell value={row.original.sistema3} sistemaKey="sistema3" />,
    size: 60,
    enableSorting: true,
    sortingFn: (rowA, rowB, colId) => (rowA.original[colId] ? 1 : 0) - (rowB.original[colId] ? 1 : 0),
  },
  visibilityMap.sistema6 && {
    accessorKey: "sistema6",
    header: () => <SistemaHeader sistemaKey="sistema6" />,
    cell: ({ row }) => <SistemaCell value={row.original.sistema6} sistemaKey="sistema6" />,
    size: 60,
    enableSorting: true,
    sortingFn: (rowA, rowB, colId) => (rowA.original[colId] ? 1 : 0) - (rowB.original[colId] ? 1 : 0),
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <CellAction data={row.original} session={session} />,
    size: 40,
    enableSorting: false,
  },
].filter(Boolean);
