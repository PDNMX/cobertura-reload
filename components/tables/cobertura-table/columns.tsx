"use client";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/constants/data";
/* import { ChevronDownIcon } from "@radix-ui/react-icons"; */

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "entFed",     header: () => (
    <div className="flex items-center">
      {/* <ChevronDownIcon className="h-4 w-4" /> */}
      <span className="ml-2">Entidad Federativa</span>
    </div>
  ),},
  { accessorKey: "totEnt", header: "Total de Entes" },
  { accessorKey: "s1Con", header: "S1 Conectados" },
  { accessorKey: "s1Por", header: "S1 Porcentaje" },
  { accessorKey: "s2Con", header: "S2 Conectados" },
  { accessorKey: "s2Por", header: "S2 Porcentaje" },
  { accessorKey: "s3OICECon", header: "S3 OIC Estatal Conectados" },
  { accessorKey: "s3OICEPor", header: "S3 OIC Estatal Porcentaje" },
  { accessorKey: "s3OICMCon", header: "S3 OIC Municipal Conectados" },
  { accessorKey: "s3OICMPor", header: "S3 OIC Municipal Porcentaje" },
  { accessorKey: "s3TJACon", header: "S3 TJA Conectados" },
  { accessorKey: "s3TJAPor", header: "S3 TJA Porcentaje" },
  { accessorKey: "s3PJCon", header: "S3 PJ Conectados" },
  { accessorKey: "s3PJPor", header: "S3 PJ Porcentaje" },
  { accessorKey: "s6Con", header: "S6 Conectados" },
  { accessorKey: "s6Por", header: "S6 Porcentaje" },
  { accessorKey: "ejecCon", header: "Ejecutivo Conectados" },
  { accessorKey: "ejecPor", header: "Ejecutivo Porcentaje" },
  { accessorKey: "legisCon", header: "Legislativo Conectados" },
  { accessorKey: "legisPor", header: "Legislativo Porcentaje" },
  { accessorKey: "judCon", header: "Judicial Conectados" },
  { accessorKey: "judPor", header: "Judicial Porcentaje" },
  {
    accessorKey: "ocasCon",
    header: "Órganos Constitucionales Autónomos Conectados",
  },
  {
    accessorKey: "ocasPor",
    header: "Órganos Constitucionales Autónomos Porcentaje",
  },
  { accessorKey: "cmCon", header: "Cabeceras Municipales Conectados" },
  { accessorKey: "cmPor", header: "Cabeceras Municipales Porcentaje" },
  { accessorKey: "emCon", header: "Entes Municipales Ejecutivo Conectados" },
  { accessorKey: "emPor", header: "Entes Municipales Ejecutivo Porcentaje" },
  { accessorKey: "totConex", header: "Total de Conexiones" },
  { accessorKey: "calif", header: "Calificación" },
];
