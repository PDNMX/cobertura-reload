"use client";

import BreadCrumb from "@/components/breadcrumb";
import { EntesTable } from "@/components/tables/entes-table/table";

import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { useEffect, useState } from "react";

const breadcrumbItems = [{ title: "Entes Públicos", link: "/dashboard/entes" }];

export default function page() {
  const [entes_publicos, setEntes_publicos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result: any = await directus.request(
          readItems("entes_publicos", {
            fields: ["*"],
          }),
        );

        // Map over the result data and convert specific keys to lowercase
        const processedData = result.map((item: any) => ({
          ...item,
          nombre: item.nombre,
          poderGobierno: item.poderGobierno,
        }));

        setEntes_publicos(processedData);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    }

    fetchData();
  }, []);

  console.log({ entes_publicos });

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <EntesTable data={entes_publicos} />
      </div>
    </>
  );
}
