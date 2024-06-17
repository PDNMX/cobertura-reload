// @ts-nocheck 
"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoberturaTable } from "@/components/tables/cobertura-table/table";

import directus from "@/lib/directus";
import { aggregate } from "@directus/sdk";

export default function AuthenticationPage() {
  const [entes, setEntes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await directus.request(
          aggregate("entes", {
            aggregate: { count: '*' },
          }),
        );
        setEntes(result);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          <CoberturaTable data={entes} />
        </div>
      </div>
    </ScrollArea>
  );
}
