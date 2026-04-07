// @ts-nocheck
import BreadCrumb from "@/components/breadcrumb";
import { EnteForm } from "@/components/forms/ente-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const TIPO_LABELS = {
  SO:  "Sujeto Obligado",
  OIC: "Órgano Interno de Control",
  TJA: "Tribunal de Justicia Administrativa",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  const rawTipo = tipo?.toUpperCase();
  const defaultTipo = (rawTipo === "OIC" || rawTipo === "TJA") ? rawTipo : "SO";

  const breadcrumbItems = [
    { title: "Entes Públicos", link: "/dashboard/entes" },
    { title: `Crear ${TIPO_LABELS[defaultTipo]}`, link: "/dashboard/entes/create" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <EnteForm initialData={null} key={defaultTipo} defaultTipo={defaultTipo} />
      </div>
    </ScrollArea>
  );
}
