"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch"; // Importa el nuevo componente Switch
import directus from "@/lib/directus"; // Importa el cliente Directus

// Define los tipos para entidades, municipios y regiones
interface Entidad {
  id_entidad: string;
  nombre: string;
  id_region: number;
}

interface Municipio {
  id_municipio: string;
  nombre: string;
  id_entidad: string;
}

interface Region {
  id: number;
  nombre: string;
}

const formSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  ambito_de_gobierno: z.enum(["Estatal", "Federal", "Municipal"], {
    message: "Selecciona una opción válida",
  }),
  poder_de_gobierno: z.enum(
    ["Ejecutivo", "Judicial", "Legislativo", "Autonomo"],
    {
      message: "Selecciona una opción válida",
    }
  ),
  control_oic: z.boolean().optional(),
  control_tribunal: z.boolean().optional(),
  sistema_1: z.boolean().optional(),
  sistema_2: z.boolean().optional(),
  sistema_3: z.boolean().optional(),
  sistema_6: z.boolean().optional(),
  id_entidad: z.string().min(2, { message: "Selecciona una entidad válida" }),
  id_municipio: z
    .string()
    .min(3, { message: "Selecciona un municipio válido" })
    .optional(),
  status: z.string().min(3, { message: "Selecciona un estado" }),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
}

export const EnteForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = initialData ? "Editar ente públicos" : "Crear ente público";
  const description = initialData
    ? "Edit a employee."
    : "Agregar un nuevo ente público";
  const toastMessage = initialData
    ? "Employee updated."
    : "Ente público creado.";
  const action = initialData ? "Save changes" : "Crear";

  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const entidadesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Entidad`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const entidadesData = await entidadesResponse.json();
        setEntidades(entidadesData.data);

        const municipiosResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Municipio`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const municipiosData = await municipiosResponse.json();
        setMunicipios(municipiosData.data);

        const regionesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Region`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const regionesData = await regionesResponse.json();
        setRegiones(regionesData.data);
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      }
    };

    fetchCatalogs();
  }, []);

  const defaultValues = initialData
    ? initialData
    : {
        nombre: "",
        ambito_de_gobierno: "",
        poder_de_gobierno: "",
        control_oic: false,
        control_tribunal: false,
        sistema_1: false,
        sistema_2: false,
        sistema_3: false,
        sistema_6: false,
        id_entidad: "",
        id_municipio: "",
        status: "Published",
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const response = initialData
        ? await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Entes/${initialData.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(data),
            }
          )
        : await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Entes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      router.refresh();
      router.push(`/dashboard/entes`);
      toast({
        variant: "default",
        title: "Created Successfully",
        description: "Ente público creado exitosamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Algo salió mal.",
        description: "Hubo un problema con tu solicitud.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/Entes/${initialData.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      router.refresh();
      router.push(`/dashboard/entes`);
    } catch (error: any) {
      console.error("Failed to delete data:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre del Ente Público"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ambito_de_gobierno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ámbito de Gobierno</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ámbito" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Estatal">Estatal</SelectItem>
                      <SelectItem value="Federal">Federal</SelectItem>
                      <SelectItem value="Municipal">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="poder_de_gobierno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poder de Gobierno</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un poder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ejecutivo">Ejecutivo</SelectItem>
                      <SelectItem value="Judicial">Judicial</SelectItem>
                      <SelectItem value="Legislativo">Legislativo</SelectItem>
                      <SelectItem value="Autonomo">Autonomo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="control_oic"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">
                    Órgano Interno de Control
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="control_tribunal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tribunal de Justicia Administrativa</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema 1</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema 2</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema_3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema 3</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema_6"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema 6</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_entidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidad</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una entidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entidades.map((entidad) => (
                        <SelectItem
                          key={entidad.id_entidad}
                          value={entidad.id_entidad}
                        >
                          {entidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_municipio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipio</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un municipio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {municipios.map((municipio) => (
                        <SelectItem
                          key={municipio.id_municipio}
                          value={municipio.id_municipio}
                        >
                          {municipio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
