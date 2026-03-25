// @ts-nocheck
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Mail, Phone, MapPin, Building2, Users } from "lucide-react";

export const createColumns = (session): ColumnDef<any>[] => [
  {
    accessorKey: "oic",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-violet-500" />
        <span>OIC / Autoridad</span>
      </div>
    ),
    cell: ({ row }) => {
      const oic = row.original.oic;
      return (
        <div className="font-medium text-sm leading-snug max-w-[260px]">
          {oic?.nombre || (
            <span className="text-muted-foreground italic text-xs">Sin asignar</span>
          )}
        </div>
      );
    },
    size: 280,
    enableSorting: true,
  },
  {
    accessorKey: "sujetosObligados",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-blue-500" />
        <span>Ente(s) Público(s)</span>
      </div>
    ),
    cell: ({ row }) => {
      const sujetos = row.original.sujetosObligados || [];
      if (sujetos.length === 0) {
        return (
          <span className="text-muted-foreground italic text-xs">Sin entes asignados</span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[280px]">
          {sujetos.slice(0, 3).map((ente, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50"
            >
              {ente.nombre}
            </span>
          ))}
          {sujetos.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/50">
              +{sujetos.length - 3} más
            </span>
          )}
        </div>
      );
    },
    size: 300,
    enableSorting: false,
  },
  {
    accessorKey: "nombre",
    header: () => <span>Nombre</span>,
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.nombre || "—"}</div>
    ),
    size: 200,
    enableSorting: true,
  },
  {
    accessorKey: "puesto",
    header: () => <span>Puesto</span>,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.puesto || "—"}</div>
    ),
    size: 180,
    enableSorting: true,
  },
  {
    accessorKey: "correoElectronico",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Correo</span>
      </div>
    ),
    cell: ({ row }) => {
      const email = row.original.correoElectronico;
      if (!email) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <a
          href={`mailto:${email}`}
          className="text-sm text-primary hover:underline underline-offset-2 truncate max-w-[200px] block"
        >
          {email}
        </a>
      );
    },
    size: 220,
    enableSorting: true,
  },
  {
    accessorKey: "telefono",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Teléfono</span>
      </div>
    ),
    cell: ({ row }) => {
      const tel = row.original.telefono;
      if (!tel) return <span className="text-muted-foreground text-xs">—</span>;
      const formatted = tel.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
      return (
        <a href={`tel:${tel}`} className="text-sm hover:underline underline-offset-2">
          {formatted}
        </a>
      );
    },
    size: 130,
    enableSorting: false,
  },
  {
    accessorKey: "direccion",
    header: () => (
      <div className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Dirección</span>
      </div>
    ),
    cell: ({ row }) => {
      const dir = row.original.direccion;
      if (!dir) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="text-sm text-muted-foreground max-w-[220px] truncate" title={dir}>
          {dir}
        </div>
      );
    },
    size: 240,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} session={session} />,
    size: 40,
    enableSorting: false,
  },
];
