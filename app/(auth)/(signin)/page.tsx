// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoberturaTable } from "@/components/tables/cobertura-table/table";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";

export default function AuthenticationPage() {
  const [entes, setEntes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores

  useEffect(() => {
    async function fetchCombinarResultadosDirectus() {
      setIsLoading(true);
      try {
        // Realizar ambas solicitudes en paralelo
        const solicitudes = {
          // resultSujetosObligados
          resultSujetosObligados: directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultOIC
          resultOIC: directus.request(
            readItems("entes", {
              filter: { controlOIC: { _eq: true } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultTribunal
          resultTribunal: directus.request(
            readItems("entes", {
              filter: { controlTribunal: { _eq: true } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultSistema1
          resultSistema1: directus.request(
            readItems("entes", {
              filter: { sistema1: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultSistema2
          resultSistema2: directus.request(
            readItems("entes", {
              filter: { sistema2: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultSistema3OIC
          resultSistema3OIC: directus.request(
            readItems("entes", {
              filter: { sistema3: { _eq: true }, controlOIC: { _eq: true } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultSistema3Tribunal
          resultSistema3Tribunal: directus.request(
            readItems("entes", {
              filter: {
                sistema3: { _eq: true },
                controlOIC: { _eq: false },
                controlTribunal: { _eq: true },
              },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultSistema6
          resultSistema6: directus.request(
            readItems("entes", {
              filter: { sistema6: { _eq: true }, controlOIC: { _eq: false } },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
          // resultConexiones
          resultConexiones: directus.request(
            readItems("entes", {
              filter: {
                sistema1: { _eq: true },
                sistema2: { _eq: true },
                sistema6: { _eq: true },
                controlOIC: { _eq: false },
              },
              aggregate: { count: ["*"] },
              groupBy: ["entidad"],
            }),
          ),
        };

        const resultados = await Promise.all(Object.values(solicitudes));

        const combinedData = resultados.reduce((acumulador, result, index) => {
          const conteoAgrupamiento = Object.keys(solicitudes)[index];
          result.forEach((item) => {
            const { entidad, count } = item;
            acumulador[entidad] = {
              ...acumulador[entidad],
              [conteoAgrupamiento]: parseInt(count, 10) || 0, // Convertir a número o usar 0 si es undefined/NaN
            };
          });
          return acumulador;
        }, {});

        // Asegurar que todas las entidades tengan conteos
        for (const entidad in combinedData) {
          for (const conteoAgrupamiento in solicitudes) {
            combinedData[entidad][conteoAgrupamiento] =
              combinedData[entidad][conteoAgrupamiento] || 0;
          }
        }
        
        const resultadoFinal = Object.entries(combinedData).map(([entidad, count]) => ({
          entidad,
          ...count,
        }));
        //console.log(resultadoFinal);
        setEntes(resultadoFinal);
      } catch (error) {
        setError(error); // Establecer mensaje de error
        console.error("Error al cargar los datos:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCombinarResultadosDirectus();
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          {isLoading ? (
            <div>Cargando datos...</div> // Mensaje de carga
          ) : error ? (
            <div>Error al cargar los datos: {error.message}</div> // Mensaje de error
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
              <CoberturaTable data={entes} />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
