// @ts-nocheck
"use client";

import BreadCrumb from "@/components/breadcrumb";
import { EntesTable } from "@/components/tables/entes-table/table";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const breadcrumbItems = [{ title: "Entes Públicos", link: "/dashboard/entes" }];

export default function Page() {
  const { data: session, status } = useSession();
  const [entes, setEntes] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      async function fetchData() {
        try {
          const result = await directus.request(
            readItems("entes", {
              fields: ["*"],
              filter: {
                entidad: {
                  _eq: session.user.entidad,
                },
              },
            })
          );
          //console.log(JSON.stringify(result));

          // Map over the result data and convert specific keys to lowercase
          const processedData = result.map((item) => ({
            ...item,
            nombre: item.nombre,
            poderGobierno: item.poderGobierno,
          }));

          setEntes(processedData);
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      }

      fetchData();
    }
  }, [session, status]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <EntesTable data={entes} />
    </div>
  );
}
