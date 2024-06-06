import BreadCrumb from "@/components/breadcrumb";
import { EnteForm } from "@/components/forms/ente-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function Page() {
  const breadcrumbItems = [
    { title: "Entes Públicos", link: "/dashboard/entes" },
    { title: "Create", link: "/dashboard/entes/create" },
  ];
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <EnteForm
          companies={[
            { _id: "Uplers", name: "Uplers" },
            { _id: "Apple", name: "Apple" },
            { _id: "Google", name: "Google" },
          ]}
          genders={[
            { _id: "male", name: "Male" },
            { _id: "female", name: "Female" },
          ]}
          initialData={null}
          key={null}
        />
      </div>
    </ScrollArea>
  );
}
