// @ts-nocheck
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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

import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { EntesTable } from "@/components/tables/cell-entes-table/table";
import { ConteoColumna } from "./conteo-columna";
import { TabsColumnsSistemas } from "@/components/charts/tabs-columns-sistemas";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(
    null
  );

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
    data: data.sort((a, b) => a.entidad.localeCompare(b.entidad)), //ordenamos los datos
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      ...(tipoColumna === "resultCampeonatoS1" && {
        sistema1: { _eq: true },
        controlOIC: { _eq: false },
      }),
    };

    const options = {
      filter,
      ...(entidad === null && {
        aggregate: { count: ["*"] },
        groupBy: ["entidad"],
      }),
      ...(entidad !== null && { sort: ["nombre"], limit: "-1", fields: ["*"] }),
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
    if (cell.row) {
      const rowElement = cell.row.original;
      const entidad = rowElement.entidad;
      const tipoColumna = cell.column.id;

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
      setDialogContent(
        <EntesTable data={respuestaDirectus} columnsShow={columnasMostrar} />
      );
      setIsDialogOpen(true);
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
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  sistema1: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
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
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  sistema2: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
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
            },
            resultSistema3Tribunal: {
              ejecutivo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema3: { _eq: true },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultSistema6: {
              ejecutivo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  sistema6: { _eq: true },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
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
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlOIC: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
            resultOIC: {
              ejecutivo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
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
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  _or: [
                    { controlOIC: { _eq: true } },
                    { controlTribunal: { _eq: true } },
                  ],
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
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
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              judicial: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Judicial" },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              legislativo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Legislativo" },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              autonomo: readItems("entes", {
                filter: {
                  ambitoGobierno: { _neq: "Municipal" },
                  poderGobierno: { _eq: "Autonomo" },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
              ejecutivoMunicipal: readItems("entes", {
                filter: {
                  ambitoGobierno: { _eq: "Municipal" },
                  poderGobierno: { _eq: "Ejecutivo" },
                  controlTribunal: { _eq: false },
                },
                aggregate: { count: ["*"] },
                groupBy: ["entidad"],
              }),
            },
          };

          let resultEjecutivo,
            resultJudicial,
            resultLegislativo,
            resultAutonomo,
            resultEjecutivoMunicipal;
          let totalEjecutivo,
            totalJudicial,
            totalLegislativo,
            totalAutonomo,
            totalEjecutivoMunicipal;

          if (tipoColumna === "resultSistema3OIC") {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
              resultEjecutivoMunicipal,
            ] = await Promise.all([
              directus.request(poderQueries.resultSistema3OIC.ejecutivo),
              directus.request(poderQueries.resultSistema3OIC.judicial),
              directus.request(poderQueries.resultSistema3OIC.legislativo),
              directus.request(poderQueries.resultSistema3OIC.autonomo),
              directus.request(
                poderQueries.resultSistema3OIC.ejecutivoMunicipal
              ),
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
            const totalOICEjecutivoMunicipal = await directus.request(
              poderQueries.resultOIC.ejecutivoMunicipal
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
            totalEjecutivoMunicipal = totalOICEjecutivoMunicipal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else if (tipoColumna === "resultSistema3Tribunal") {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
              resultEjecutivoMunicipal,
            ] = await Promise.all([
              directus.request(poderQueries.resultSistema3Tribunal.ejecutivo),
              directus.request(poderQueries.resultSistema3Tribunal.judicial),
              directus.request(poderQueries.resultSistema3Tribunal.legislativo),
              directus.request(poderQueries.resultSistema3Tribunal.autonomo),
              directus.request(
                poderQueries.resultSistema3Tribunal.ejecutivoMunicipal
              ),
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
            const totalTribunalEjecutivoMunicipal = await directus.request(
              poderQueries.resultTribunal.ejecutivoMunicipal
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
            totalEjecutivoMunicipal = totalTribunalEjecutivoMunicipal.reduce(
              (acc, item) => acc + Number(item.count),
              0
            );
          } else {
            [
              resultEjecutivo,
              resultJudicial,
              resultLegislativo,
              resultAutonomo,
              resultEjecutivoMunicipal,
            ] = await Promise.all([
              directus.request(poderQueries[tipoColumna].ejecutivo),
              directus.request(poderQueries[tipoColumna].judicial),
              directus.request(poderQueries[tipoColumna].legislativo),
              directus.request(poderQueries[tipoColumna].autonomo),
              directus.request(poderQueries[tipoColumna].ejecutivoMunicipal),
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
            const totalSujetosEjecutivoMunicipal = await directus.request(
              poderQueries.resultSujetosObligados.ejecutivoMunicipal
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
            totalEjecutivoMunicipal = totalSujetosEjecutivoMunicipal.reduce(
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
          const ejecutivoMunicipalConectados = resultEjecutivoMunicipal.reduce(
            (acc, item) => acc + Number(item.count),
            0
          );

          const ejecutivoPorcentaje =
            (ejecutivoConectados / totalEjecutivo) * 100;
          const judicialPorcentaje = (judicialConectados / totalJudicial) * 100;
          const legislativoPorcentaje =
            (legislativoConectados / totalLegislativo) * 100;
          const autonomoPorcentaje = (autonomoConectados / totalAutonomo) * 100;
          const ejecutivoMunicipalPorcentaje =
            (ejecutivoMunicipalConectados / totalEjecutivoMunicipal) * 100;

          dataPoder = [
            {
              poder: "Ejec.",
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
            {
              poder: "Ejec. Muni.",
              count: parseFloat(ejecutivoMunicipalPorcentaje.toFixed(2)),
              conectados: ejecutivoMunicipalConectados,
              totalEntes: totalEjecutivoMunicipal,
            },
          ];

          console.log(dataPoder);
        } catch (error) {
          console.error("Error al cargar los datos de poder:", error);
        }
      };

      await fetchPoderData();

      setIsDialogOpen(true);
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

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Buscar...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="w-full"
        />
      </div>
      <ScrollArea className="rounded-md border h-[calc(80vh-100px)]">
        <Table className="relative w-full">
          <TableHeader className="sticky bottom-0 bg-gray-200 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => handleCellClick(header)}
                      className="text-center py-2 px-0.5 text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
        <DialogContent className="p-6 rounded-md shadow-lg max-w-5xl w-full bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Entes Públicos
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">{dialogContent}</div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
