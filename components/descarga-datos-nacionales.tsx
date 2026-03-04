// @ts-nocheck
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, FileText } from "lucide-react";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";

const INSTITUTIONAL_HEADER_ROWS = [
  "Secretaría Ejecutiva del Sistema Nacional Anticorrupción",
  "PLATAFORMA DIGITAL NACIONAL",
  "",
  "Tablero Estadístico de Interconexión Nacional",
];

async function fetchNacionalData() {
  return Promise.all([
    // Hoja 1: Entes Públicos
    directus.request(
      readItems("entes", {
        filter: { controlOIC: { _eq: false } },
        fields: ["*", "entidad.nombre", "municipio.nombre"],
        sort: ["nombre"],
        limit: -1,
      })
    ),
    // Hoja 2: OIC y Tribunales combinados
    directus.request(
      readItems("entes", {
        filter: {
          _or: [
            { controlOIC: { _eq: true } },
            { controlTribunal: { _eq: true } },
          ],
        },
        fields: ["*", "entidad.nombre", "municipio.nombre"],
        sort: ["nombre"],
        limit: -1,
      })
    ),
    // Hoja 3: Tribunales (también aparecen en hoja 2 para referencia cruzada)
    directus.request(
      readItems("entes", {
        filter: { controlTribunal: { _eq: true } },
        fields: ["*", "entidad.nombre", "municipio.nombre"],
        sort: ["nombre"],
        limit: -1,
      })
    ),
  ]);
}

function buildXLSXSheet(ws, rawData, columns, sheetTitle) {
  const r1 = ws.addRow([INSTITUTIONAL_HEADER_ROWS[0]]);
  r1.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
  const r2 = ws.addRow([INSTITUTIONAL_HEADER_ROWS[1]]);
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

  const headerRow = ws.addRow(columns.map((c) => c.label));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, name: "Calibri", size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = { bottom: { style: "thin" } };
  });

  rawData.forEach((item) => {
    const row = ws.addRow(columns.map((c) => c.get(item)));
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });
  });
}

const SHEETS_CONFIG = [
  {
    // Incluye Sujetos Obligados y Tribunales (ambos tienen controlOIC: false).
    // La columna "Tipo" permite distinguirlos.
    name: "Entes Públicos",
    title: "Entes Públicos — Tablero Estadístico de Interconexión Nacional",
    columns: [
      { label: "ID", get: (i) => i.id },
      { label: "Nombre del Ente Público", get: (i) => i.nombre },
      { label: "Tipo", get: (i) => (i.controlTribunal ? "Tribunal" : "Sujeto Obligado") },
      { label: "Ámbito de Gobierno", get: (i) => i.ambitoGobierno },
      { label: "Poder de Gobierno", get: (i) => i.poderGobierno },
      { label: "Sistema 1", get: (i) => (i.sistema1 ? "Sí" : "No") },
      { label: "Sistema 2", get: (i) => (i.sistema2 ? "Sí" : "No") },
      { label: "Sistema 6", get: (i) => (i.sistema6 ? "Sí" : "No") },
      { label: "Entidad", get: (i) => i.entidad?.nombre || "N/A" },
      { label: "Municipio", get: (i) => i.municipio?.nombre || "N/A" },
    ],
    widths: [8, 40, 18, 22, 20, 12, 12, 12, 22, 22],
  },
  {
    // OIC y Tribunales combinados — los Tribunales son los únicos que
    // se pueden conectar a los 4 sistemas por registro (S1, S2, S3, S6).
    name: "OIC",
    title: "OIC — Tablero Estadístico de Interconexión Nacional",
    columns: [
      { label: "ID", get: (i) => i.id },
      { label: "Nombre del Ente Público", get: (i) => i.nombre },
      { label: "Tipo", get: (i) => (i.controlTribunal ? "Tribunal" : "OIC") },
      { label: "Ámbito de Gobierno", get: (i) => i.ambitoGobierno },
      { label: "Poder de Gobierno", get: (i) => i.poderGobierno },
      { label: "Sistema 1", get: (i) => (i.sistema1 ? "Sí" : "No") },
      { label: "Sistema 2", get: (i) => (i.sistema2 ? "Sí" : "No") },
      { label: "Sistema 3", get: (i) => (i.sistema3 ? "Sí" : "No") },
      { label: "Sistema 6", get: (i) => (i.sistema6 ? "Sí" : "No") },
      { label: "Entidad", get: (i) => i.entidad?.nombre || "N/A" },
      { label: "Municipio", get: (i) => i.municipio?.nombre || "N/A" },
    ],
    widths: [8, 40, 14, 22, 20, 12, 12, 12, 12, 22, 22],
  },
  {
    // Tribunales de forma independiente — se repiten respecto a la hoja anterior
    // para facilitar la consulta exclusiva de TJAs.
    name: "Tribunales",
    title: "Tribunales — Tablero Estadístico de Interconexión Nacional",
    columns: [
      { label: "ID", get: (i) => i.id },
      { label: "Nombre del Ente Público", get: (i) => i.nombre },
      { label: "Ámbito de Gobierno", get: (i) => i.ambitoGobierno },
      { label: "Poder de Gobierno", get: (i) => i.poderGobierno },
      { label: "Sistema 1", get: (i) => (i.sistema1 ? "Sí" : "No") },
      { label: "Sistema 2", get: (i) => (i.sistema2 ? "Sí" : "No") },
      { label: "Sistema 3", get: (i) => (i.sistema3 ? "Sí" : "No") },
      { label: "Sistema 6", get: (i) => (i.sistema6 ? "Sí" : "No") },
      { label: "Entidad", get: (i) => i.entidad?.nombre || "N/A" },
      { label: "Municipio", get: (i) => i.municipio?.nombre || "N/A" },
    ],
    widths: [8, 40, 22, 20, 12, 12, 12, 12, 22, 22],
  },
];

function toCSVValue(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function DescargaDatosNacionales() {
  const [isLoading, setIsLoading] = useState<"xlsx" | "csv" | null>(null);

  const handleDownloadXLSX = async () => {
    setIsLoading("xlsx");
    try {
      const datasets = await fetchNacionalData();
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();

      SHEETS_CONFIG.forEach((cfg, idx) => {
        const ws = workbook.addWorksheet(cfg.name);
        buildXLSXSheet(ws, datasets[idx], cfg.columns, cfg.title);
        cfg.widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "datos_nacionales.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar XLSX:", err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadCSV = async () => {
    setIsLoading("csv");
    try {
      const [entesData, oicYTribunalesData] = await fetchNacionalData();

      // Columnas unificadas para el CSV combinado
      const header = [
        "ID", "Nombre del Ente Público", "Tipo", "Ámbito de Gobierno",
        "Poder de Gobierno", "Sistema 1", "Sistema 2", "Sistema 3",
        "Sistema 6", "Entidad", "Municipio",
      ].join(",");

      const toRow = (i, tipo) => [
        i.id,
        i.nombre,
        tipo,
        i.ambitoGobierno,
        i.poderGobierno,
        tipo !== "OIC" ? (i.sistema1 ? "Sí" : "No") : "",
        tipo !== "OIC" ? (i.sistema2 ? "Sí" : "No") : "",
        tipo !== "Ente Público" ? (i.sistema3 ? "Sí" : "No") : "",
        tipo !== "OIC" ? (i.sistema6 ? "Sí" : "No") : "",
        i.entidad?.nombre || "",
        i.municipio?.nombre || "",
      ].map(toCSVValue).join(",");

      const rows = [
        header,
        ...entesData.map((i) => toRow(i, "Ente Público")),
        ...oicYTribunalesData.map((i) =>
          toRow(i, i.controlTribunal ? "Tribunal" : "OIC")
        ),
      ].join("\n");

      // BOM para que Excel abra correctamente con UTF-8
      const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "datos_nacionales.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar CSV:", err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Descargar datos nacionales</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Entes Públicos, OIC y Tribunales — todos los registros
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadXLSX}
          disabled={!!isLoading}
          className="gap-1.5 font-medium"
        >
          {isLoading === "xlsx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
          )}
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
          disabled={!!isLoading}
          className="gap-1.5 font-medium"
        >
          {isLoading === "csv" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 text-blue-600" />
          )}
          CSV
        </Button>
      </div>
    </div>
  );
}
