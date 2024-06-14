// @ts-nocheck 
import BreadCrumb from "@/components/breadcrumb";
import { EnteForm } from "@/components/forms/ente-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function Page() {
  const breadcrumbItems = [
    { title: "Entes Públicos", link: "/dashboard/entes" },
    { title: "Editar", link: "/dashboard/entes/editar" },

  ];
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <EnteForm
          categories={[
            { _id: "shirts", name: "shirts" },
            { _id: "pants", name: "pants" },
          ]}
          initialData={null}
          key={null}
        />
      </div>
    </ScrollArea>
  );
}
