// @ts-nocheck
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User } from "@/constants/data";

export const createColumns = ({ entesMap }, session): ColumnDef<User>[] =>
  [
    {
      accessorKey: "oic",
      header: () => <div className="text-left">OIC</div>,
      cell: ({ row }) => {
        return (
          <div className="text-left">{entesMap[row.original.oic] || "N/A"}</div>
        );
      },
      size: 450,
      enableSorting: true,
    },
    {
      accessorKey: "sujetosObligados",
      header: () => <div className="text-left">Ente(s) Público(s)</div>,
      cell: ({ row }) => {
        const sujetos = Array.isArray(row.original.sujetosObligados)
          ? row.original.sujetosObligados
          : [row.original.sujetosObligados];
        
        const nombresEntes = sujetos
          .map(id => entesMap[id] || "N/A")
          .filter(nombre => nombre !== "N/A"); // Opcional: eliminar entradas "N/A"

        return (
          <div className="text-left">
            {nombresEntes.length > 0 ? (
              <ul className="list-disc pl-4">
                {nombresEntes.map((nombre, index) => (
                  <li key={index}>{nombre}</li>
                ))}
              </ul>
            ) : (
              "N/A"
            )}
          </div>
        );
      },
      size: 450,
      enableSorting: true,
    },
    {
      accessorKey: "puesto",
      header: () => <div className="text-left">Puesto</div>,
      cell: ({ row }) => <div className="text-left">{row.original.puesto}</div>,
      size: 200,
      enableSorting: true,
    },
    {
      accessorKey: "nombre",
      header: () => <div className="text-left">Nombre</div>,
      cell: ({ row }) => <div className="text-left">{row.original.nombre}</div>,
      size: 200,
      enableSorting: true,
    },
    {
      accessorKey: "correoElectronico",
      header: () => <div className="text-left">Correo Electrónico</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.original.correoElectronico}</div>
      ),
      size: 300,
      enableSorting: true,
    },
    {
      accessorKey: "telefono",
      header: () => <div className="text-left">Teléfono</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.original.telefono}</div>
      ),
      size: 150,
      enableSorting: true,
    },
    {
      accessorKey: "direccion",
      header: () => <div className="text-left">Dirección</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.original.direccion}</div>
      ),
      size: 300,
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => <div className="text-center"></div>,
      cell: ({ row }) => <CellAction data={row.original} session={session} />,
      size: 25,
      enableSorting: false,
    },
  ].filter(Boolean);