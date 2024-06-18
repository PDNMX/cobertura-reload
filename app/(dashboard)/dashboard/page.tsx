// @ts-nocheck
//read-items
"use client";

import { useEffect, useState } from "react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const { session, status } = useCurrentSession();
  const [data, setData] = useState({
    sistema1: 0,
    sistema2: 0,
    sistema3: 0,
    sistema6: 0,
    totalSujetosObligados: 0,
    totalOIC: 0,
  });

  useEffect(() => {
    if (status === "authenticated") {
      async function fetchData() {
        try {
          const result = await directus.request(
            readItems("entes", {
              limit: "-1",
              fields: ["*", "controlOIC"],
              filter: {
                entidad: {
                  _eq: session?.user?.entidad,
                },
              },
            })
          );

          // Procesar datos
          const processedData = result.reduce(
            (acc, item) => {
              if (!item.controlOIC) {
                if (item.sistema1) acc.sistema1 += 1;
                if (item.sistema2) acc.sistema2 += 1;
                if (item.sistema6) acc.sistema6 += 1;
                acc.totalSujetosObligados += 1;
              } else {
                if (item.sistema3) acc.sistema3 += 1;
                acc.totalOIC += 1;
              }
              return acc;
            },
            {
              sistema1: 0,
              sistema2: 0,
              sistema3: 0,
              sistema6: 0,
              totalSujetosObligados: 0,
              totalOIC: 0,
            }
          );

          setData(processedData);
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      }

      fetchData();
    }
  }, [session, status]);

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Hola, ¡Bienvenido de nuevo! 👋
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entes Públicos Conectados al Sistema 1
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.sistema1}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(
                  data.sistema1,
                  data.totalSujetosObligados
                )}
                % de los sujetos obligados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entes Públicos Conectados al Sistema 2
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.sistema2}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(
                  data.sistema2,
                  data.totalSujetosObligados
                )}
                % de los sujetos obligados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entes Públicos Conectados al Sistema 3
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.sistema3}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(data.sistema3, data.totalOIC)}% de los OIC
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entes Públicos Conectados al Sistema 6
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.sistema6}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(
                  data.sistema6,
                  data.totalSujetosObligados
                )}
                % de los sujetos obligados
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-4 md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}