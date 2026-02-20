// @ts-nocheck
"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CoberturaTable } from "@/components/tables/cobertura-table/table";
import InfoAlert from "@/components/tables/cobertura-table/info-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ResumenConexiones } from "@/components/dashboard-stats-cards";
import directus from "@/lib/directus";
import { Loader2, Table2, LayoutDashboard, Radio, Info, Home, Share2, ArrowLeft } from "lucide-react";
import { ResumenEntidad } from "@/components/resumen-entidad";
import { readItems } from "@directus/sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EntidadInfo, getEntidadById } from "@/lib/entidades-slugs";
import Link from "next/link";

interface EntidadPageClientProps {
  entidadInfo: EntidadInfo;
}

export default function EntidadPageClient({ entidadInfo }: EntidadPageClientProps) {
  const router = useRouter();
  const [entes, setEntes] = useState([]);
  const [dataAmbito, setDataAmbito] = useState({});
  const [dataPoder, setDataPoder] = useState({});
  const [entesConectadosCount, setEntesConectadosCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        // Queries principales por entidad
        const solicitudes = {
          resultSujetosObligados: directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultOIC: directus.request(
            readItems("entes", {
              filter: {
                _or: [
                  { controlOIC: { _eq: true } },
                  { controlTribunal: { _eq: true } },
                ],
              },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultTribunal: directus.request(
            readItems("entes", {
              filter: { controlTribunal: { _eq: true } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultSistema1: directus.request(
            readItems("entes", {
              filter: { sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultSistema2: directus.request(
            readItems("entes", {
              filter: { sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultSistema3OIC: directus.request(
            readItems("entes", {
              filter: {
                sistema3: { _eq: true },
                _or: [
                  { controlOIC: { _eq: true } },
                  { controlTribunal: { _eq: true } },
                ],
              },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultSistema3Tribunal: directus.request(
            readItems("entes", {
              filter: {
                sistema3: { _eq: true },
                controlOIC: { _eq: false },
                controlTribunal: { _eq: true },
              },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
          resultSistema6: directus.request(
            readItems("entes", {
              filter: { sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            })
          ),
        };

        // Queries por ámbito de gobierno
        const ambitoQueries = {
          totalFederal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalEstatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalMunicipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICFederal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICEstatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICMunicipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s1Federal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s1Estatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s1Municipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Federal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Estatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Municipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s3Federal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s3Estatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s3Municipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s6Federal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Federal" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s6Estatal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Estatal" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s6Municipal: directus.request(
            readItems("entes", {
              filter: { ambitoGobierno: { _eq: "Municipal" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
        };

        // Queries por poder de gobierno
        const poderQueries = {
          totalEjecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalJudicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalLegislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalAutonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICEjecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICJudicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICLegislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          totalOICAutonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s1Ejecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s1Judicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s1Legislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s1Autonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Ejecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Judicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Legislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s2Autonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s3Ejecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s3Judicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s3Legislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s3Autonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, sistema3: { _eq: true }, _or: [{ controlOIC: { _eq: true } }, { controlTribunal: { _eq: true } }] },
              aggregate: { count: ["*"] },
            })
          ),
          s6Ejecutivo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Ejecutivo" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s6Judicial: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Judicial" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s6Legislativo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Legislativo" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
          s6Autonomo: directus.request(
            readItems("entes", {
              filter: { poderGobierno: { _eq: "Autonomo" }, sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
            })
          ),
        };

        // Query para contar entes conectados en al menos uno de S1, S2 o S6
        const entesConectadosQuery = directus.request(
          readItems("entes", {
            filter: {
              controlOIC: { _eq: false },
              _or: [
                { sistema1: { _eq: true } },
                { sistema2: { _eq: true } },
                { sistema6: { _eq: true } },
              ],
            },
            aggregate: { count: ["*"] },
          })
        );

        // Ejecutar todas las queries en paralelo
        const [resultados, ambitoResults, poderResults, entesConectadosResult] = await Promise.all([
          Promise.all(Object.values(solicitudes)),
          Promise.all(Object.entries(ambitoQueries).map(async ([key, query]) => {
            const result = await query;
            return [key, result[0]?.count || 0];
          })),
          Promise.all(Object.entries(poderQueries).map(async ([key, query]) => {
            const result = await query;
            return [key, result[0]?.count || 0];
          })),
          entesConectadosQuery,
        ]);

        // Guardar el conteo de entes conectados
        setEntesConectadosCount(Number(entesConectadosResult[0]?.count || 0));

        // Procesar datos de entidades
        const combinedData = resultados.reduce((acumulador, result, index) => {
          const conteoAgrupamiento = Object.keys(solicitudes)[index];
          result.forEach((item) => {
            const { entidad, count } = item;
            acumulador[entidad] = {
              ...acumulador[entidad],
              [conteoAgrupamiento]: parseInt(count, 10) || 0,
            };
          });
          return acumulador;
        }, {});

        for (const entidad in combinedData) {
          for (const conteoAgrupamiento in solicitudes) {
            combinedData[entidad][conteoAgrupamiento] =
              combinedData[entidad][conteoAgrupamiento] || 0;
          }
        }

        for (const entidad in combinedData) {
          const totalSO = combinedData[entidad].resultSujetosObligados;
          const sistema1 = combinedData[entidad].resultSistema1;
          const sistema2 = combinedData[entidad].resultSistema2;
          const sistema6 = combinedData[entidad].resultSistema6;

          if (totalSO > 0) {
            const porcentaje = (100 * sistema1) / totalSO;
            let diferencia = 100 - porcentaje;
            if (porcentaje < 50) {
              diferencia = porcentaje;
            }
            const campeonato = porcentaje + (diferencia * totalSO) / 2700;
            combinedData[entidad].resultCampeonatoS1 = Math.round(campeonato);

            const conexiones =
              (100 * (sistema1 + sistema2 + sistema6)) / (3 * totalSO);
            combinedData[entidad].resultConexiones = Math.round(conexiones);
          } else {
            combinedData[entidad].resultCampeonatoS1 = 0;
            combinedData[entidad].resultConexiones = 0;
          }
        }

        const resultadoFinal = Object.entries(combinedData).map(
          ([entidad, count]) => ({
            entidad,
            ...count,
          })
        );
        setEntes(resultadoFinal);

        // Procesar datos de ámbito
        const ambitoData = Object.fromEntries(ambitoResults);
        const totalFederal = Number(ambitoData.totalFederal);
        const totalEstatal = Number(ambitoData.totalEstatal);
        const totalMunicipal = Number(ambitoData.totalMunicipal);
        const totalOICFederal = Number(ambitoData.totalOICFederal);
        const totalOICEstatal = Number(ambitoData.totalOICEstatal);
        const totalOICMunicipal = Number(ambitoData.totalOICMunicipal);

        const ambitoPorSistema = {
          resultSistema1: [
            { ambito: "Federal", count: totalFederal > 0 ? parseFloat(((Number(ambitoData.s1Federal) / totalFederal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s1Federal), totalEntes: totalFederal },
            { ambito: "Estatal", count: totalEstatal > 0 ? parseFloat(((Number(ambitoData.s1Estatal) / totalEstatal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s1Estatal), totalEntes: totalEstatal },
            { ambito: "Municipal", count: totalMunicipal > 0 ? parseFloat(((Number(ambitoData.s1Municipal) / totalMunicipal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s1Municipal), totalEntes: totalMunicipal },
          ],
          resultSistema2: [
            { ambito: "Federal", count: totalFederal > 0 ? parseFloat(((Number(ambitoData.s2Federal) / totalFederal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s2Federal), totalEntes: totalFederal },
            { ambito: "Estatal", count: totalEstatal > 0 ? parseFloat(((Number(ambitoData.s2Estatal) / totalEstatal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s2Estatal), totalEntes: totalEstatal },
            { ambito: "Municipal", count: totalMunicipal > 0 ? parseFloat(((Number(ambitoData.s2Municipal) / totalMunicipal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s2Municipal), totalEntes: totalMunicipal },
          ],
          resultSistema3OIC: [
            { ambito: "Federal", count: totalOICFederal > 0 ? parseFloat(((Number(ambitoData.s3Federal) / totalOICFederal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s3Federal), totalEntes: totalOICFederal },
            { ambito: "Estatal", count: totalOICEstatal > 0 ? parseFloat(((Number(ambitoData.s3Estatal) / totalOICEstatal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s3Estatal), totalEntes: totalOICEstatal },
            { ambito: "Municipal", count: totalOICMunicipal > 0 ? parseFloat(((Number(ambitoData.s3Municipal) / totalOICMunicipal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s3Municipal), totalEntes: totalOICMunicipal },
          ],
          resultSistema6: [
            { ambito: "Federal", count: totalFederal > 0 ? parseFloat(((Number(ambitoData.s6Federal) / totalFederal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s6Federal), totalEntes: totalFederal },
            { ambito: "Estatal", count: totalEstatal > 0 ? parseFloat(((Number(ambitoData.s6Estatal) / totalEstatal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s6Estatal), totalEntes: totalEstatal },
            { ambito: "Municipal", count: totalMunicipal > 0 ? parseFloat(((Number(ambitoData.s6Municipal) / totalMunicipal) * 100).toFixed(2)) : 0, conectados: Number(ambitoData.s6Municipal), totalEntes: totalMunicipal },
          ],
        };
        setDataAmbito(ambitoPorSistema);

        // Procesar datos de poder
        const poderData = Object.fromEntries(poderResults);
        const totalEjecutivo = Number(poderData.totalEjecutivo);
        const totalJudicial = Number(poderData.totalJudicial);
        const totalLegislativo = Number(poderData.totalLegislativo);
        const totalAutonomo = Number(poderData.totalAutonomo);
        const totalOICEjecutivo = Number(poderData.totalOICEjecutivo);
        const totalOICJudicial = Number(poderData.totalOICJudicial);
        const totalOICLegislativo = Number(poderData.totalOICLegislativo);
        const totalOICAutonomo = Number(poderData.totalOICAutonomo);

        const poderPorSistema = {
          resultSistema1: [
            { poder: "Ejecutivo", count: totalEjecutivo > 0 ? parseFloat(((Number(poderData.s1Ejecutivo) / totalEjecutivo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s1Ejecutivo), totalEntes: totalEjecutivo },
            { poder: "Judicial", count: totalJudicial > 0 ? parseFloat(((Number(poderData.s1Judicial) / totalJudicial) * 100).toFixed(2)) : 0, conectados: Number(poderData.s1Judicial), totalEntes: totalJudicial },
            { poder: "Legislativo", count: totalLegislativo > 0 ? parseFloat(((Number(poderData.s1Legislativo) / totalLegislativo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s1Legislativo), totalEntes: totalLegislativo },
            { poder: "OCAS", count: totalAutonomo > 0 ? parseFloat(((Number(poderData.s1Autonomo) / totalAutonomo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s1Autonomo), totalEntes: totalAutonomo },
          ],
          resultSistema2: [
            { poder: "Ejecutivo", count: totalEjecutivo > 0 ? parseFloat(((Number(poderData.s2Ejecutivo) / totalEjecutivo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s2Ejecutivo), totalEntes: totalEjecutivo },
            { poder: "Judicial", count: totalJudicial > 0 ? parseFloat(((Number(poderData.s2Judicial) / totalJudicial) * 100).toFixed(2)) : 0, conectados: Number(poderData.s2Judicial), totalEntes: totalJudicial },
            { poder: "Legislativo", count: totalLegislativo > 0 ? parseFloat(((Number(poderData.s2Legislativo) / totalLegislativo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s2Legislativo), totalEntes: totalLegislativo },
            { poder: "OCAS", count: totalAutonomo > 0 ? parseFloat(((Number(poderData.s2Autonomo) / totalAutonomo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s2Autonomo), totalEntes: totalAutonomo },
          ],
          resultSistema3OIC: [
            { poder: "Ejecutivo", count: totalOICEjecutivo > 0 ? parseFloat(((Number(poderData.s3Ejecutivo) / totalOICEjecutivo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s3Ejecutivo), totalEntes: totalOICEjecutivo },
            { poder: "Judicial", count: totalOICJudicial > 0 ? parseFloat(((Number(poderData.s3Judicial) / totalOICJudicial) * 100).toFixed(2)) : 0, conectados: Number(poderData.s3Judicial), totalEntes: totalOICJudicial },
            { poder: "Legislativo", count: totalOICLegislativo > 0 ? parseFloat(((Number(poderData.s3Legislativo) / totalOICLegislativo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s3Legislativo), totalEntes: totalOICLegislativo },
            { poder: "OCAS", count: totalOICAutonomo > 0 ? parseFloat(((Number(poderData.s3Autonomo) / totalOICAutonomo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s3Autonomo), totalEntes: totalOICAutonomo },
          ],
          resultSistema6: [
            { poder: "Ejecutivo", count: totalEjecutivo > 0 ? parseFloat(((Number(poderData.s6Ejecutivo) / totalEjecutivo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s6Ejecutivo), totalEntes: totalEjecutivo },
            { poder: "Judicial", count: totalJudicial > 0 ? parseFloat(((Number(poderData.s6Judicial) / totalJudicial) * 100).toFixed(2)) : 0, conectados: Number(poderData.s6Judicial), totalEntes: totalJudicial },
            { poder: "Legislativo", count: totalLegislativo > 0 ? parseFloat(((Number(poderData.s6Legislativo) / totalLegislativo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s6Legislativo), totalEntes: totalLegislativo },
            { poder: "OCAS", count: totalAutonomo > 0 ? parseFloat(((Number(poderData.s6Autonomo) / totalAutonomo) * 100).toFixed(2)) : 0, conectados: Number(poderData.s6Autonomo), totalEntes: totalAutonomo },
          ],
        };
        setDataPoder(poderPorSistema);

      } catch (error) {
        setError(error);
        console.error("Error al cargar los datos:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, []);

  // Calcular resumen de Entes Públicos vs OIC
  const resumenConexiones = useMemo(() => {
    if (entes.length === 0) {
      return { entesConectados: 0, totalEntes: 0, oicConectados: 0, totalOIC: 0 };
    }

    const totalEntes = entes.reduce((acc, e) => acc + (e.resultSujetosObligados || 0), 0);
    const totalOIC = entes.reduce((acc, e) => acc + (e.resultOIC || 0), 0);

    // OIC conectados en S3
    const oicConectados = entes.reduce((acc, e) => acc + (e.resultSistema3OIC || 0), 0);

    return { entesConectados: entesConectadosCount, totalEntes, oicConectados, totalOIC };
  }, [entes, entesConectadosCount]);

  // Copiar URL al portapapeles
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6 pb-10">
      {isLoading ? (
        <div className="flex flex-row items-center justify-center gap-2 py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Cargando datos de {entidadInfo.nombre}...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          Error al cargar los datos: {error.message}
        </div>
      ) : (
        <>
          {/* Header con navegación y compartir */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Navegación y título */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ver todas las entidades
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {entidadInfo.nombre}
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Tiempo Real
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estadísticas de interconexión con la Plataforma Digital Nacional
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {copied ? "¡Copiado!" : "Compartir"}
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Nacional
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* Contenido */}
          <ResumenEntidad
            data={entes}
            dataAmbito={dataAmbito}
            dataPoder={dataPoder}
            resumenConexiones={resumenConexiones}
            initialEntidadId={entidadInfo.id}
          />
        </>
      )}
    </div>
  );
}
