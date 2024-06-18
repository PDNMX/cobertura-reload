"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import directus from "@/lib/directus"; // Importa directus
import { useToast } from "@/components/ui/use-toast";
import { deleteItem } from "@directus/sdk"; // Importa deleteItem
import Link from "next/link";

export const CellAction = ({ data }: any) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("deleted") === "true") {
      toast({
        variant: "default",
        title: "Deleted Successfully",
        description: "Ente público eliminado exitosamente.",
      });
      localStorage.removeItem("deleted"); // Elimina el estado después de mostrar el toast
    }
  }, []);

  const onConfirm = async () => {
    try {
      setLoading(true);
      if (data) {
        await directus.request(deleteItem("entes",data.id));
        localStorage.setItem("deleted", "true"); // Almacena el estado
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
          >
            <Edit className="mr-2 h-4 w-4" />  
            <Link href={`/dashboard/entes/${data.id}`}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
