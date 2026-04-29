// @ts-nocheck
"use client";
import fs from "fs";
import path from "path";
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Download, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import Image from "next/image";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { EntesTable } from "@/components/tables/cell-entes-table/table";
import { TabsColumnsSistemas } from "@/components/charts/tabs-columns-sistemas";

import { ArrowUpDown, BarChart2 } from "lucide-react";
import InfoAlert from "./info-alert";
import icoSO  from "@/components/tables/cobertura-table/icons-thead/sujetosObligados.svg";
import icoOIC from "@/components/tables/cobertura-table/icons-thead/oic.svg";
import icoTJA from "@/components/tables/cobertura-table/icons-thead/tribunal.svg";

const TIPO_ENTE_CONFIG = [
  {
    key:    "SO",
    label:  "Sujetos Obligados",
    icon:   icoSO,
    color:  "#6f4168",
    bg:     "#6f416812",
    border: "#6f416840",
    filter: (i: any) => !i.controlOIC && !i.controlTribunal,
  },
  {
    key:    "OIC",
    label:  "Órganos Internos de Control",
    icon:   icoOIC,
    color:  "#c49a2a",
    bg:     "#c49a2a12",
    border: "#c49a2a40",
    filter: (i: any) => !!i.controlOIC,
  },
  {
    key:    "TJA",
    label:  "Tribunales de Justicia Administrativa",
    icon:   icoTJA,
    color:  "#b5877a",
    bg:     "#b5877a12",
    border: "#b5877a40",
    filter: (i: any) => !!i.controlTribunal,
  },
];

// Columnas visibles por tipo de ente
const COLUMNS_BY_TIPO: Record<string, object> = {
  SO:  { sistema1: true,  sistema2: true,  sistema3: false, sistema6: true  },
  OIC: { sistema1: false, sistema2: false, sistema3: true,  sistema6: false },
  TJA: { sistema1: true,  sistema2: true,  sistema3: true,  sistema6: true  },
};

// Nombre amigable de cada columna para el título del dialog
const NOMBRE_COLUMNA: Record<string, string> = {
  nombreEntidad:          "Todos los entes",
  resultSujetosObligados: "Sujetos Obligados",
  resultOIC:              "OIC / Autoridades",
  resultTribunal:         "Tribunales",
  resultSistema1:         "Sistema 1",
  resultSistema2:         "Sistema 2",
  resultSistema3OIC:      "Sistema 3 — OIC",
  resultSistema3Tribunal: "Sistema 3 — Tribunal",
  resultSistema6:         "Sistema 6",
  resultConexiones:       "Conexiones",
};

// Tipos de ente que incluye cada columna de la tabla principal
const TIPOS_POR_COLUMNA: Record<string, string[]> = {
  nombreEntidad:         ["SO", "OIC", "TJA"],
  resultSujetosObligados:["SO", "TJA"],
  resultOIC:             ["OIC", "TJA"],
  resultTribunal:        ["TJA"],
  resultSistema1:        ["SO", "TJA"],
  resultSistema2:        ["SO", "TJA"],
  resultSistema3OIC:     ["OIC", "TJA"],
  resultSistema3Tribunal:["TJA"],
  resultSistema6:        ["SO", "TJA"],
  resultConexiones:      ["SO", "TJA"],
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  hideNameFilter?: boolean;
  showInfoAlert?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  hideNameFilter = false,
  showInfoAlert = true,
}: DataTableProps<TData, TValue>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [dialogActions, setDialogActions] = useState<React.ReactNode | null>(null);
  const [dialogData, setDialogData] = useState<any[]>([]);
  const [dialogColumnsShow, setDialogColumnsShow] = useState<object>({});
  const [filterAmbito, setFilterAmbito] = useState("todos");
  const [filterPoder, setFilterPoder] = useState("todos");
  const [filterTipo, setFilterTipo] = useState<string>("SO");
  const [dialogColumna, setDialogColumna] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("Entes Públicos");
  const [dialogSubtitle, setDialogSubtitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNacional, setIsLoadingNacional] = useState(false);

  const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
  >(({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  ));
  Table.displayName = "Table";

  const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("sticky top-0 bg-secondary [&_tr]:border-b", className)}
      {...props}
    />
  ));
  TableHeader.displayName = "TableHeader";

  const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("sticky top-0 bg-secondary [&_tr]:border-b", className)}
      {...props}
    />
  ));
  TableFooter.displayName = "TableFooter";

  const table = useReactTable({
    data: data.sort((a, b) => a.entidad.localeCompare(b.entidad)),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    /* initialState: {
      sorting: [{ id: 'entidad', desc: false }]
    }, */
  });

  async function fetchDataCell(entidad: string | null, tipoColumna: string) {
    const filter = {
      ...(entidad && { entidad: { _eq: entidad } }), // Filtra por entidad si se proporciona
      ...(tipoColumna === "resultSujetosObligados" && {
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultOIC" && {
        _or: [
          { controlOIC: { _eq: true } },
          { controlTribunal: { _eq: true } },
        ],
      }),
      ...(tipoColumna === "resultTribunal" && {
        controlTribunal: { _eq: true },
      }),
      ...(tipoColumna === "resultSistema1" && {
        sistema1: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultSistema2" && {
        sistema2: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultSistema3OIC" && {
        sistema3: { _eq: true },
        _or: [
          { controlOIC: { _eq: true } },
          { controlTribunal: { _eq: true } },
        ],
      }),
      ...(tipoColumna === "resultSistema3Tribunal" && {
        sistema3: { _eq: true },
        controlOIC: { _eq: false },
        controlTribunal: { _eq: true },
      }),
      ...(tipoColumna === "resultSistema6" && {
        sistema6: { _eq: true },
        controlOIC: { _eq: false },
      }),
      ...(tipoColumna === "resultConexiones" && {
        controlOIC: { _eq: false },
        _or: [
          { sistema1: { _eq: true } },
          { sistema2: { _eq: true } },
          { sistema6: { _eq: true } },
        ],
      }),
      // ...(tipoColumna === "resultCampeonatoS1" && {
      //   sistema1: { _eq: true },
      //   controlOIC: { _eq: false },
      // }),
    };

    const options = {
      filter,
      fields: ["*", "entidad.nombre", "municipio.nombre"], // Incluir campos relacionados
      ...(entidad === null && {
        aggregate: { count: ["*"] },
        groupBy: ["entidad.id"],
      }),
      ...(entidad !== null && { sort: ["nombre"], limit: "-1" }),
    };

    try {
      const result = await directus.request(readItems("entes", options));
      return result;
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      return null;
    }
  }

  const handleCellClick = async (cell: any) => {
    setIsLoading(true);
    setIsDialogOpen(true);
    setDialogActions(null);
    setDialogData([]);
    setDialogContent(null);
    setFilterAmbito("todos");
    setFilterPoder("todos");
    setFilterTipo("SO");
    const colId = cell.column?.id ?? "";
    setDialogColumna(colId);
    if (cell.row) {
      const rowElement = cell.row.original;
      const entidad = rowElement.entidad;
      const tipoColumna = cell.column.id;
      const nombreEntidad = rowElement.nombreEntidad ?? entidad;
      setDialogTitle(nombreEntidad);
      setDialogSubtitle(NOMBRE_COLUMNA[tipoColumna] ?? tipoColumna);

      const columnVisibilityMap = {
        resultSujetosObligados: {
          sistema1: true,
          sistema2: true,
          sistema3: false,
          sistema6: true,
        },
        resultOIC: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultTribunal: {
          sistema1: true,
          sistema2: true,
          sistema3: true,
          sistema6: true,
        },
        resultSistema1: {
          sistema1: true,
          sistema2: false,
          sistema3: false,
          sistema6: false,
        },
        resultSistema2: {
          sistema1: false,
          sistema2: true,
          sistema3: false,
          sistema6: false,
        },
        resultSistema3: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema3OIC: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema3Tribunal: {
          sistema1: false,
          sistema2: false,
          sistema3: true,
          sistema6: false,
        },
        resultSistema6: {
          sistema1: false,
          sistema2: false,
          sistema3: false,
          sistema6: true,
        },
        resultConexiones: {
          sistema1: true,
          sistema2: true,
          sistema3: false,
          sistema6: true,
        },
        resultCampeonatoS1: {
          sistema1: true,
          sistema2: false,
          sistema3: false,
          sistema6: false,
        },
      };

      const columnasMostrar = columnVisibilityMap[tipoColumna] || {};

      const respuestaDirectus = await fetchDataCell(entidad, tipoColumna);
      setIsLoading(false);

      // ── Columnas dinámicas para export (según lo que se muestra) ──────────
      const exportColumns = [
        { label: "ID",                    accessor: (i) => i.id,                                     width: 8  },
        { label: "Nombre del Ente Público", accessor: (i) => i.nombre,                               width: 42 },
        { label: "Tipo de Autoridad",     accessor: (i) => getTipoAutoridad(i.controlOIC, i.controlTribunal), width: 24 },
        { label: "Ámbito de Gobierno",    accessor: (i) => i.ambitoGobierno,                         width: 20 },
        { label: "Poder de Gobierno",     accessor: (i) => i.poderGobierno,                          width: 20 },
        ...(columnasMostrar.sistema1 ? [{ label: "Sistema 1", accessor: (i) => i.sistema1 ? "Sí" : "No", width: 13 }] : []),
        ...(columnasMostrar.sistema2 ? [{ label: "Sistema 2", accessor: (i) => i.sistema2 ? "Sí" : "No", width: 13 }] : []),
        ...(columnasMostrar.sistema3 ? [{ label: "Sistema 3", accessor: (i) => i.sistema3 ? "Sí" : "No", width: 13 }] : []),
        ...(columnasMostrar.sistema6 ? [{ label: "Sistema 6", accessor: (i) => i.sistema6 ? "Sí" : "No", width: 13 }] : []),
        { label: "Entidad",               accessor: (i) => i.entidad?.nombre  || "N/A",              width: 22 },
        { label: "Municipio",             accessor: (i) => i.municipio?.nombre || "N/A",             width: 22 },
      ];

      // ── XLSX ──────────────────────────────────────────────────────────────
      const exportToXLSX = async () => {
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Entes Públicos");

        // Encabezado institucional (mismo patrón que export nacional)
        const r1 = ws.addRow(["Secretaría Ejecutiva del Sistema Nacional Anticorrupción"]);
        r1.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        const r2 = ws.addRow(["PLATAFORMA DIGITAL NACIONAL"]);
        r2.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        ws.addRow([]);
        const r4 = ws.addRow(["Tablero Estadístico de Interconexión Nacional"]);
        r4.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        ws.addRow([]);
        const r6 = ws.addRow(["Fecha de generación:", new Date().toLocaleString()]);
        r6.getCell(1).font = { bold: true, name: "Calibri" };
        r6.getCell(2).font = { name: "Calibri" };
        ws.addRow([]);
        ws.addRow([]);

        // Encabezados de columnas
        const headerRow = ws.addRow(exportColumns.map((c) => c.label));
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, name: "Calibri", size: 11 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          cell.border = { bottom: { style: "thin" } };
        });

        // Filas de datos
        respuestaDirectus.forEach((item) => {
          const row = ws.addRow(exportColumns.map((c) => c.accessor(item)));
          row.eachCell((cell) => {
            cell.font = { name: "Calibri", size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          });
        });

        // Anchos de columna
        exportColumns.forEach((c, i) => { ws.getColumn(i + 1).width = c.width; });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `entes_${entidad}_${tipoColumna}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
      };

      // ── CSV (misma estructura que XLSX) ───────────────────────────────────
      const exportToCSV = () => {
        const headers = exportColumns.map((c) => `"${c.label}"`).join(",");
        const rows = respuestaDirectus.map((item) =>
          exportColumns.map((c) => {
            const val = c.accessor(item);
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(",")
        );
        const csv = [headers, ...rows].join("\n");
        downloadFile("\uFEFF" + csv, "text/csv;charset=utf-8", `entes_${entidad}_${tipoColumna}.csv`);
      };

      // ── JSON ──────────────────────────────────────────────────────────────
      const exportToJSON = () => {
        const jsonContent = JSON.stringify(respuestaDirectus, null, 2);
        downloadFile(jsonContent, "application/json", `entes_${entidad}_${tipoColumna}.json`);
      };

      setDialogData(respuestaDirectus);
      setDialogColumnsShow(columnasMostrar);
      // Auto-seleccionar el primer tipo que tenga datos
      const primerTipo = TIPO_ENTE_CONFIG.find((cfg) =>
        respuestaDirectus.some(cfg.filter)
      );
      if (primerTipo) setFilterTipo(primerTipo.key);
      setDialogActions(
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Exportar:</span>
          <Button size="sm" variant="outline" onClick={exportToXLSX} className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" /> XLSX
          </Button>
          <Button size="sm" variant="outline" onClick={exportToCSV} className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportToJSON} className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" /> JSON
          </Button>
        </div>
      );
    } else if (cell.column) {
      const tipoColumna = cell.column.id;
      if (
        tipoColumna === "resultSujetosObligados" ||
        tipoColumna === "resultOIC" ||
        tipoColumna === "resultTribunal" ||
        tipoColumna === "resultConexiones" ||
        tipoColumna === "resultCampeonatoS1"
      ) {
        return;
      }

      const nombreAmigableMap = {
        resultSistema1: "Sistema 1",
        resultSistema2: "Sistema 2",
        resultSistema3OIC: "Sistema 3 OIC",
        resultSistema3Tribunal: "Sistema 3 Tribunal",
        resultSistema6: "Sistema 6",
      };

      let dataEntidad;
      if (tipoColumna === "resultSistema3OIC") {
        dataEntidad = data.map((item) => ({
          ...item,
          count: Number(
            ((item[tipoColumna] / item.resultOIC) * 100).toFixed(2)
          ),
        }));
      } else if (tipoColumna === "resultSistema3Tribunal") {
        dataEntidad = data.map((item) => ({
          ...item,
          count: Number(
            ((item[tipoColumna] / item.resultTribunal) * 100).toFixed(2)
          ),
        }));
      } else {
        dataEntidad = data.map((item) => ({
          ...item,
          count: Number(
            ((item[tipoColumna] / item.resultSujetosObligados) * 100).toFixed(2)
          ),
        }));
      }

      let dataNacional;
      if (tipoColumna === "resultSistema3OIC") {
        const totalEntes = data.reduce((acc, item) => acc + item.resultOIC, 0);
        const conectados = data.reduce(
          (acc, item) => acc + item[tipoColumna],
          0
        );
        const porcentajeConectados = (conectados / totalEntes) * 100;
        dataNacional = [
          {
            sistema: nombreAmigableMap[tipoColumna],
            count: parseFloat(porcentajeConectados.toFixed(2)), // Convertir a porcentaje con 2 decimales
            conectados,
            totalEntes,
          },
        ];
      } else if (tipoColumna === "resultSistema3Tribunal") {
        const totalEntes = data.reduce(
          (acc, item) => acc + item.resultTribunal,
          0
        );
        const conectados = data.reduce(
          (acc, item) => acc + item[tipoColumna],
          0
        );
        const porcentajeConectados = (conectados / totalEntes) * 100;
        dataNacional = [
          {
            sistema: nombreAmigableMap[tipoColumna],
            count: parseFloat(porcentajeConectados.toFixed(2)), // Convertir a porcentaje con 2 decimales
            conectados,
            totalEntes,
          },
        ];
      } else {
        const totalEntes = data.reduce(
          (acc, item) => acc + item.resultSujetosObligados,
          0
        );
        const conectados = data.reduce(
          (acc, item) => acc + item[tipoColumna],
          0
        );
        const porcentajeConectados = (conectados / totalEntes) * 100;
        dataNacional = [
          {
            sistema: nombreAmigableMap[tipoColumna],
            count: parseFloat(porcentajeConectados.toFixed(2)), // Convertir a porcentaje con 2 decimales
            conectados,
            totalEntes,
          },
        ];
      }

      // Obtener datos de ambito
      let dataAmbito = [];

      const fetchAmbitoData = async () => {
        try {
          const ambitoQueries = {
            resultSistema1: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema2: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema3OIC: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema3Tribunal: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema6: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSujetosObligados: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultOIC: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultTribunal: {
              federal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Federal" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              estatal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Estatal" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              municipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
          };

          let resultFederal, resultEstatal, resultMunicipal;
          let totalFederal, totalEstatal, totalMunicipal;

          if (tipoColumna === "resultSistema3OIC") {
            [resultFederal, resultEstatal, resultMunicipal] = await Promise.all(
              [
                directus.request(ambitoQueries.resultSistema3OIC.federal),
                directus.request(ambitoQueries.resultSistema3OIC.estatal),
                directus.request(ambitoQueries.resultSistema3OIC.municipal),
              ]
            );

            const totalOICFederal = await directus.request(
              ambitoQueries.resultOIC.federal
            );
            const totalOICEstatal = await directus.request(
              ambitoQueries.resultOIC.estatal
            );
            const totalOICMunicipal = await directus.request(
              ambitoQueries.resultOIC.municipal
            );

            totalFederal = totalOICFederal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalEstatal = totalOICEstatal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalMunicipal = totalOICMunicipal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else if (tipoColumna === "resultSistema3Tribunal") {
            [resultFederal, resultEstatal, resultMunicipal] = await Promise.all(
              [
                directus.request(ambitoQueries.resultSistema3Tribunal.federal),
                directus.request(ambitoQueries.resultSistema3Tribunal.estatal),
                directus.request(
                  ambitoQueries.resultSistema3Tribunal.municipal
                ),
              ]
            );

            const totalTribunalFederal = await directus.request(
              ambitoQueries.resultTribunal.federal
            );
            const totalTribunalEstatal = await directus.request(
              ambitoQueries.resultTribunal.estatal
            );
            const totalTribunalMunicipal = await directus.request(
              ambitoQueries.resultTribunal.municipal
            );

            totalFederal = totalTribunalFederal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalEstatal = totalTribunalEstatal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalMunicipal = totalTribunalMunicipal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else {
            [resultFederal, resultEstatal, resultMunicipal] = await Promise.all(
              [
                directus.request(ambitoQueries[tipoColumna].federal),
                directus.request(ambitoQueries[tipoColumna].estatal),
                directus.request(ambitoQueries[tipoColumna].municipal),
              ]
            );

            const totalSujetosFederal = await directus.request(
              ambitoQueries.resultSujetosObligados.federal
            );
            const totalSujetosEstatal = await directus.request(
              ambitoQueries.resultSujetosObligados.estatal
            );
            const totalSujetosMunicipal = await directus.request(
              ambitoQueries.resultSujetosObligados.municipal
            );

            totalFederal = totalSujetosFederal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalEstatal = totalSujetosEstatal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalMunicipal = totalSujetosMunicipal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          }

          const federalConectados = resultFederal.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );
          const estatalConectados = resultEstatal.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );
          const municipalConectados = resultMunicipal.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );

          const federalPorcentaje = (federalConectados / totalFederal) * 100;
          const estatalPorcentaje = (estatalConectados / totalEstatal) * 100;
          const municipalPorcentaje =
            (municipalConectados / totalMunicipal) * 100;

          dataAmbito = [
            {
              ambito: "Federal",
              count: parseFloat(federalPorcentaje.toFixed(2)),
              conectados: federalConectados,
              totalEntes: totalFederal,
            },
            {
              ambito: "Estatal",
              count: parseFloat(estatalPorcentaje.toFixed(2)),
              conectados: estatalConectados,
              totalEntes: totalEstatal,
            },
            {
              ambito: "Municipal",
              count: parseFloat(municipalPorcentaje.toFixed(2)),
              conectados: municipalConectados,
              totalEntes: totalMunicipal,
            },
          ];
        } catch (error) {
          console.error("Error al cargar los datos de ambito:", error);
        }
      };

      await fetchAmbitoData();

      // Obtener datos de poder
      let dataPoder = [];

      const fetchPoderData = async () => {
        try {
          const poderQueries = {
            resultSistema1: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema2: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema3OIC: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  sistema3: { _eq: true },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema3Tribunal: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema6: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSujetosObligados: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultOIC: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultTribunal: {
              ejecutivo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Judicial" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Legislativo" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  poderGobierno: { _eq: "Autonomo" },
                  controlTribunal: { _eq: true },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
          };

          let resultEjecutivo,
            resultJudicial,
            resultLegislativo,
            resultAutonomo;
          let totalEjecutivo, totalJudicial, totalLegislativo, totalAutonomo;

          if (tipoColumna === "resultSistema3OIC") {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
            ] = await Promise.all([
              directus.request(poderQueries.resultSistema3OIC.ejecutivo),
              directus.request(poderQueries.resultSistema3OIC.judicial),
              directus.request(poderQueries.resultSistema3OIC.legislativo),
              directus.request(poderQueries.resultSistema3OIC.autonomo),
            ]);

            const totalOICEjecutivo = await directus.request(
              poderQueries.resultOIC.ejecutivo
            );
            const totalOICJudicial = await directus.request(
              poderQueries.resultOIC.judicial
            );
            const totalOICLegislativo = await directus.request(
              poderQueries.resultOIC.legislativo
            );
            const totalOICAutonomo = await directus.request(
              poderQueries.resultOIC.autonomo
            );

            totalEjecutivo = totalOICEjecutivo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalJudicial = totalOICJudicial.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalLegislativo = totalOICLegislativo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalAutonomo = totalOICAutonomo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else if (tipoColumna === "resultSistema3Tribunal") {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
            ] = await Promise.all([
              directus.request(poderQueries.resultSistema3Tribunal.ejecutivo),
              directus.request(poderQueries.resultSistema3Tribunal.judicial),
              directus.request(poderQueries.resultSistema3Tribunal.legislativo),
              directus.request(poderQueries.resultSistema3Tribunal.autonomo),
            ]);

            const totalTribunalEjecutivo = await directus.request(
              poderQueries.resultTribunal.ejecutivo
            );
            const totalTribunalJudicial = await directus.request(
              poderQueries.resultTribunal.judicial
            );
            const totalTribunalLegislativo = await directus.request(
              poderQueries.resultTribunal.legislativo
            );
            const totalTribunalAutonomo = await directus.request(
              poderQueries.resultTribunal.autonomo
            );

            totalEjecutivo = totalTribunalEjecutivo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalJudicial = totalTribunalJudicial.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalLegislativo = totalTribunalLegislativo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalAutonomo = totalTribunalAutonomo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
            ] = await Promise.all([
              directus.request(poderQueries[tipoColumna].ejecutivo),
              directus.request(poderQueries[tipoColumna].judicial),
              directus.request(poderQueries[tipoColumna].legislativo),
              directus.request(poderQueries[tipoColumna].autonomo),
            ]);

            const totalSujetosEjecutivo = await directus.request(
              poderQueries.resultSujetosObligados.ejecutivo
            );
            const totalSujetosJudicial = await directus.request(
              poderQueries.resultSujetosObligados.judicial
            );
            const totalSujetosLegislativo = await directus.request(
              poderQueries.resultSujetosObligados.legislativo
            );
            const totalSujetosAutonomo = await directus.request(
              poderQueries.resultSujetosObligados.autonomo
            );

            totalEjecutivo = totalSujetosEjecutivo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalJudicial = totalSujetosJudicial.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalLegislativo = totalSujetosLegislativo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
            totalAutonomo = totalSujetosAutonomo.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          }

          const ejecutivoConectados = resultEjecutivo.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );
          const judicialConectados = resultJudicial.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );
          const legislativoConectados = resultLegislativo.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );
          const autonomoConectados = resultAutonomo.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );

          const ejecutivoPorcentaje =
            (ejecutivoConectados / totalEjecutivo) * 100;
          const judicialPorcentaje = (judicialConectados / totalJudicial) * 100;
          const legislativoPorcentaje =
            (legislativoConectados / totalLegislativo) * 100;
          const autonomoPorcentaje = (autonomoConectados / totalAutonomo) * 100;

          dataPoder = [
            {
              poder: "Ejecutivo",
              count: parseFloat(ejecutivoPorcentaje.toFixed(2)),
              conectados: ejecutivoConectados,
              totalEntes: totalEjecutivo,
            },
            {
              poder: "Judicial",
              count: parseFloat(judicialPorcentaje.toFixed(2)),
              conectados: judicialConectados,
              totalEntes: totalJudicial,
            },
            {
              poder: "Legislativo",
              count: parseFloat(legislativoPorcentaje.toFixed(2)),
              conectados: legislativoConectados,
              totalEntes: totalLegislativo,
            },
            {
              poder: "OCAS",
              count: parseFloat(autonomoPorcentaje.toFixed(2)),
              conectados: autonomoConectados,
              totalEntes: totalAutonomo,
            },
          ];
        } catch (error) {
          console.error("Error al cargar los datos de poder:", error);
        }
      };

      await fetchPoderData();

      setIsLoading(false);
      setDialogContent(
        <TabsColumnsSistemas
          dataEntidad={dataEntidad}
          selectedColumn={tipoColumna}
          dataNacional={dataNacional}
          dataAmbito={dataAmbito}
          dataPoder={dataPoder}
        />
      );
    }
  };
  // Exportación nacional a XLSX con 3 hojas: Entes Públicos, OIC y Tribunales
  const exportNacionalToXLSX = async () => {
    setIsLoadingNacional(true);
    try {
      const [entesData, oicData, tribunalesData] = await Promise.all([
        directus.request(
          readItems("entes", {
            filter: { controlOIC: { _eq: false } },
            fields: ["*", "entidad.nombre", "municipio.nombre"],
            sort: ["nombre"],
            limit: -1,
          })
        ),
        directus.request(
          readItems("entes", {
            filter: { controlOIC: { _eq: true } },
            fields: ["*", "entidad.nombre", "municipio.nombre"],
            sort: ["nombre"],
            limit: -1,
          })
        ),
        directus.request(
          readItems("entes", {
            filter: { controlTribunal: { _eq: true } },
            fields: ["*", "entidad.nombre", "municipio.nombre"],
            sort: ["nombre"],
            limit: -1,
          })
        ),
      ]);

      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();

      const addInstitutionalHeader = (ws, sheetTitle) => {
        const r1 = ws.addRow(["Secretaría Ejecutiva del Sistema Nacional Anticorrupción"]);
        r1.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        const r2 = ws.addRow(["PLATAFORMA DIGITAL NACIONAL"]);
        r2.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        ws.addRow([]);
        const r4 = ws.addRow([sheetTitle]);
        r4.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        ws.addRow([]);
        const r6 = ws.addRow(["Fecha de generación:", new Date().toLocaleString()]);
        r6.getCell(1).font = { bold: true, name: "Calibri" };
        r6.getCell(2).font = { name: "Calibri" };
        ws.addRow([]);
        ws.addRow([]);
      };

      const addSheet = (ws, rawData, columns, sheetTitle) => {
        addInstitutionalHeader(ws, sheetTitle);
        const headerRow = ws.addRow(columns.map((c) => c.label));
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, name: "Calibri", size: 11 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          cell.border = { bottom: { style: "thin" } };
        });
        rawData.forEach((item) => {
          const row = ws.addRow(columns.map((c) => c.accessor(item)));
          row.eachCell((cell) => {
            cell.font = { name: "Calibri", size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          });
        });
      };

      // Hoja 1: Entes Públicos — S1, S2, S6
      const ws1 = workbook.addWorksheet("Entes Públicos");
      addSheet(
        ws1,
        entesData,
        [
          { label: "ID", accessor: (i) => i.id },
          { label: "Nombre del Ente Público", accessor: (i) => i.nombre },
          { label: "Ámbito de Gobierno", accessor: (i) => i.ambitoGobierno },
          { label: "Poder de Gobierno", accessor: (i) => i.poderGobierno },
          { label: "Sistema 1", accessor: (i) => (i.sistema1 ? "Sí" : "No") },
          { label: "Sistema 2", accessor: (i) => (i.sistema2 ? "Sí" : "No") },
          { label: "Sistema 6", accessor: (i) => (i.sistema6 ? "Sí" : "No") },
          { label: "Entidad", accessor: (i) => i.entidad?.nombre || "N/A" },
          { label: "Municipio", accessor: (i) => i.municipio?.nombre || "N/A" },
        ],
        "Entes Públicos — Tablero Estadístico de Interconexión Nacional"
      );
      [8, 40, 22, 20, 12, 12, 12, 22, 22].forEach((w, i) => { ws1.getColumn(i + 1).width = w; });

      // Hoja 2: OIC — S3
      const ws2 = workbook.addWorksheet("OIC");
      addSheet(
        ws2,
        oicData,
        [
          { label: "ID", accessor: (i) => i.id },
          { label: "Nombre del Ente Público", accessor: (i) => i.nombre },
          { label: "Ámbito de Gobierno", accessor: (i) => i.ambitoGobierno },
          { label: "Poder de Gobierno", accessor: (i) => i.poderGobierno },
          { label: "Sistema 3", accessor: (i) => (i.sistema3 ? "Sí" : "No") },
          { label: "Entidad", accessor: (i) => i.entidad?.nombre || "N/A" },
          { label: "Municipio", accessor: (i) => i.municipio?.nombre || "N/A" },
        ],
        "OIC — Tablero Estadístico de Interconexión Nacional"
      );
      [8, 40, 22, 20, 12, 22, 22].forEach((w, i) => { ws2.getColumn(i + 1).width = w; });

      // Hoja 3: Tribunales — S1, S2, S3, S6
      const ws3 = workbook.addWorksheet("Tribunales");
      addSheet(
        ws3,
        tribunalesData,
        [
          { label: "ID", accessor: (i) => i.id },
          { label: "Nombre del Ente Público", accessor: (i) => i.nombre },
          { label: "Ámbito de Gobierno", accessor: (i) => i.ambitoGobierno },
          { label: "Poder de Gobierno", accessor: (i) => i.poderGobierno },
          { label: "Sistema 1", accessor: (i) => (i.sistema1 ? "Sí" : "No") },
          { label: "Sistema 2", accessor: (i) => (i.sistema2 ? "Sí" : "No") },
          { label: "Sistema 3", accessor: (i) => (i.sistema3 ? "Sí" : "No") },
          { label: "Sistema 6", accessor: (i) => (i.sistema6 ? "Sí" : "No") },
          { label: "Entidad", accessor: (i) => i.entidad?.nombre || "N/A" },
          { label: "Municipio", accessor: (i) => i.municipio?.nombre || "N/A" },
        ],
        "Tribunales — Tablero Estadístico de Interconexión Nacional"
      );
      [8, 40, 22, 20, 12, 12, 12, 12, 22, 22].forEach((w, i) => { ws3.getColumn(i + 1).width = w; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "datos_nacionales.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar datos nacionales:", error);
    } finally {
      setIsLoadingNacional(false);
    }
  };

  // Función auxiliar para determinar el tipo de autoridad
  const getTipoAutoridad = (controlOIC, controlTribunal) => {
    if (!controlOIC && !controlTribunal) return "Sujeto Obligado";
    if (controlOIC && !controlTribunal) return "Autoridad Resolutora";
    if (!controlOIC && controlTribunal) return "TJA";
    return "Otro"; // Para cualquier otra combinación
  };
  // Función para convertir a CSV (datos originales)
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => {
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return value.nombre || "";
          if (typeof value === "string" && value.includes(","))
            return `"${value}"`;
          return value;
        })
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const downloadFile = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Modificar la renderización de las celdas para usar íconos
  const renderCell = (value, columnId) => {
    if (columnId.startsWith("sistema")) {
      return value ? (
        <Check className="text-green-500" />
      ) : (
        <X className="text-red-500" />
      );
    }
    return value;
  };

  return (
    <>
      {/* Mostrar filtro y/o InfoAlert según las props */}
      {(!hideNameFilter || showInfoAlert) && (
        <div className="flex items-center justify-between py-4 gap-4">
          {!hideNameFilter && (
            <div className="flex-1">
              <Input
                placeholder={`Filtrar por nombre...`}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="w-full max-w-md"
              />
            </div>
          )}
          {showInfoAlert && (
            <div className={hideNameFilter ? "ml-auto" : ""}>
              <InfoAlert />
            </div>
          )}
        </div>
      )}
      <ScrollArea className="rounded-md border h-[calc(80vh-100px)]">
        <Table className="relative w-full">
          <TableHeader className="sticky bottom-0 bg-gray-200 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => {
                        if (canSort) {
                          header.column.toggleSorting(
                            header.column.getIsSorted() === "asc"
                          );
                        } else {
                          handleCellClick(header);
                        }
                      }}
                      className="cursor-pointer py-2 relative group transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center justify-center relative">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="text-gray-600 dark:text-gray-200 absolute right-0 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {canSort ? (
                            <ArrowUpDown className="h-4 w-4" />
                          ) : (
                            <BarChart2 className="h-4 w-4" />
                          )}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  className={
                    hoveredRowId === row.id
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      onMouseEnter={() => setHoveredColumnId(cell.column.id)}
                      onMouseLeave={() => setHoveredColumnId(null)}
                      className={`cursor-pointer ${
                        hoveredColumnId === cell.column.id
                          ? "bg-gray-200 dark:bg-gray-600"
                          : ""
                      } ${
                        hoveredRowId === row.id &&
                        hoveredColumnId === cell.column.id
                          ? "bg-gray-300 dark:bg-gray-500"
                          : ""
                      } text-center`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xl"
                >
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="sticky bottom-0 bg-gray-200 dark:bg-gray-800">
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className="text-center py-2 px-0.5 text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setDialogData([]); setDialogContent(null); } }}>
        <DialogContent className="flex flex-col p-6 rounded-xl shadow-xl max-w-5xl w-full max-h-[85vh] bg-background border border-border">
          <DialogHeader className="shrink-0">
            <div className="flex items-start justify-between gap-3">
              {/* Título contextual */}
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-foreground leading-tight truncate">
                  {dialogTitle}
                </DialogTitle>
                {dialogSubtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{dialogSubtitle}</p>
                )}
              </div>
              {/* Pills de tipos incluidos */}
              {!isLoading && dialogColumna && (TIPOS_POR_COLUMNA[dialogColumna] ?? []).length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[10px] text-muted-foreground">Incluye:</span>
                  {(TIPOS_POR_COLUMNA[dialogColumna] ?? []).map((key) => {
                    const cfg = TIPO_ENTE_CONFIG.find((c) => c.key === key);
                    if (!cfg) return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        title={cfg.label}
                      >
                        <Image src={cfg.icon} alt={key} width={11} height={11} className="shrink-0" />
                        {key}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Contenido de entes (click en celda de fila) */}
          {!isLoading && dialogData.length > 0 && (() => {
            const esColumnaEntidad = dialogColumna === "nombreEntidad";

            // Grupos para las cards (solo aplica en columna entidad)
            const grupos = TIPO_ENTE_CONFIG.map((cfg) => ({
              ...cfg,
              total: dialogData.filter(cfg.filter).length,
            }));
            const grupoActivo = grupos.find((g) => g.key === filterTipo);

            // Datos base: si es columna entidad filtra por tipo, si no usa todos
            const porTipo = esColumnaEntidad && grupoActivo
              ? dialogData.filter(grupoActivo.filter)
              : dialogData;

            const baseFiltered = porTipo.filter(
              (i) =>
                (filterAmbito === "todos" || i.ambitoGobierno === filterAmbito) &&
                (filterPoder  === "todos" || i.poderGobierno  === filterPoder)
            );

            const columnsShow = esColumnaEntidad
              ? (COLUMNS_BY_TIPO[filterTipo] ?? dialogColumnsShow)
              : dialogColumnsShow;

            return (
              <>
                {/* ── Cards de tipo — solo en columna Entidad Federativa ── */}
                {esColumnaEntidad && (
                  <div className="shrink-0 pt-2 pb-3 border-b space-y-2.5">
                    {/* Resumen total + desglose */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Total: <span className="font-bold text-foreground">{dialogData.length}</span> entes registrados
                      </span>
                      <div className="flex items-center gap-3">
                        {grupos.map((g) => (
                          <span key={g.key} className="flex items-center gap-1 text-[11px]">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                            <span className="text-muted-foreground">{g.key}:</span>
                            <span className="font-bold text-foreground">{g.total}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {grupos.map((g) => {
                        const isActive = filterTipo === g.key;
                        const isDisabled = g.total === 0;
                        return (
                          <button
                            key={g.key}
                            onClick={() => { setFilterTipo(g.key); setFilterAmbito("todos"); setFilterPoder("todos"); }}
                            disabled={isDisabled}
                            className={`relative overflow-hidden flex flex-col gap-2 px-3 pt-4 pb-3 rounded-xl border-2 text-left transition-all duration-200
                              ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:scale-[1.02]"}
                            `}
                            style={{
                              borderColor: g.color,
                              backgroundColor: isActive ? g.bg : "hsl(var(--card))",
                            }}
                          >
                            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" style={{ backgroundColor: g.color, opacity: isActive ? 1 : 0.4 }} />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Image src={g.icon} alt={g.key} width={18} height={18} className="shrink-0" />
                                <span className="text-xs font-bold" style={{ color: g.color }}>{g.key}</span>
                              </div>
                              {isActive && (
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: g.color }}>
                                  Activo
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{g.label}</p>
                            <span className="text-xl font-black tabular-nums leading-none" style={{ color: g.color }}>
                              {g.total}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Filtros Ámbito / Poder ────────────────────────────── */}
                <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 border-b">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">Ámbito:</span>
                    {["todos", "Federal", "Estatal", "Municipal"].map((v) => (
                      <button
                        key={v}
                        aria-pressed={filterAmbito === v}
                        onClick={() => setFilterAmbito(v)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${filterAmbito === v ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"}`}
                      >
                        {v === "todos" ? "Todos" : v}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">Poder:</span>
                    {["todos", "Ejecutivo", "Judicial", "Legislativo", "Autonomo"].map((v) => (
                      <button
                        key={v}
                        aria-pressed={filterPoder === v}
                        onClick={() => setFilterPoder(v)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${filterPoder === v ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"}`}
                      >
                        {v === "todos" ? "Todos" : v === "Autonomo" ? "Autónomo" : v}
                      </button>
                    ))}
                  </div>
                  <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                    {baseFiltered.length} de {esColumnaEntidad ? (grupoActivo?.total ?? dialogData.length) : dialogData.length}
                  </span>
                </div>

                {/* ── Tabla ────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0 pt-2">
                  {baseFiltered.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">Sin resultados con los filtros aplicados.</p>
                  ) : (
                    <EntesTable data={baseFiltered} columnsShow={columnsShow} />
                  )}
                </div>
              </>
            );
          })()}

          {/* Contenido de gráficas (click en encabezado de columna) */}
          {!isLoading && dialogData.length === 0 && (
            <div className="flex-1 overflow-y-auto min-h-0 py-4">
              {isLoading ? (
                <div className="flex flex-row items-start gap-2">
                  Cargando datos...
                  <Loader2 className="animate-spin ml-1" />
                </div>
              ) : (
                <>{dialogContent}</>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-start gap-2 py-4">
              Cargando datos...
              <Loader2 className="animate-spin ml-1" />
            </div>
          )}
          <DialogFooter className="shrink-0 pt-3 border-t flex flex-row items-center justify-between gap-2 sm:justify-between">
            <div>{!isLoading && dialogActions}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
