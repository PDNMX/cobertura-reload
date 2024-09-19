// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import directus from "@/lib/directus";
import { createItem, updateItem, readItems, withToken } from "@directus/sdk";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import clsx from "clsx";

// Esquema de validación
const formSchema = z.object({
  oic: z
    .number()
    .nullable()
    .refine((value) => value !== null, {
      message: "Debe seleccionar una Autoridad Resolutora",
    }),
  sujetosObligados: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un Sujeto Obligado"),

  puesto: z.string().min(3, {
    message: "El puesto debe tener al menos 3 caracteres.",
  }),
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  correoElectronico: z.string().email({
    message: "Debe ser un correo electrónico válido.",
  }),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .optional(),
  direccion: z.string().optional(),
  entidad: z.string(),
});

type DirectorioFormValues = z.infer<typeof formSchema>;

interface DirectorioFormProps {
  initialData: any | null;
}
// Para Combobox
interface ComboboxProps {
  options: { value: number; label: string }[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
}

// Para MultiSelect
interface MultiSelectProps {
  options: { value: number; label: string }[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder: string;
}

export const DirectorioForm: React.FC<DirectorioFormProps> = ({
  initialData,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [oicOptions, setOicOptions] = useState([]);
  const [sujetosObligadosOptions, setSujetosObligadosOptions] = useState([]);
  const { session } = useCurrentSession();

  const title = initialData ? "Actualizar Directorio" : "Crear Directorio";
  const description = initialData
    ? "Edita la información del directorio"
    : "Agrega un nuevo registro al directorio";
  const toastMessage = initialData
    ? "Registro del directorio actualizado"
    : "Nuevo registro del directorio creado.";
  const action = initialData ? "Actualizar" : "Crear";

  const defaultValues = {
    oic: initialData?.oic ?? null,
    sujetosObligados: initialData?.sujetosObligados ?? [],
    puesto: initialData?.puesto ?? "",
    nombre: initialData?.nombre ?? "",
    correoElectronico: initialData?.correoElectronico ?? "",
    telefono: initialData?.telefono ?? "",
    direccion: initialData?.direccion ?? "",
    entidad: session?.user?.entidad || "",
  };

  const form = useForm<DirectorioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    const fetchOicOptions = async () => {
      try {
        const response = await directus.request(
          withToken(
            session?.access_token,
            readItems("entes", {
              filter: {
                _or: [
                  { controlOIC: { _eq: true } },
                  { controlTribunal: { _eq: true } },
                ],
              },
              fields: ["id", "nombre"],
              limit: "-1",
            })
          )
        );
        setOicOptions(
          response.map((ente) => ({
            value: Number(ente.id),
            label: ente.nombre,
          }))
        );
      } catch (error) {
        console.error("Error al cargar las opciones de OIC", error);
      }
    };

    const fetchSujetosObligadosOptions = async () => {
      try {
        const response = await directus.request(
          withToken(
            session?.access_token,
            readItems("entes", {
              filter: { controlOIC: { _eq: false } },
              fields: ["id", "nombre"],
              limit: "-1",
            })
          )
        );
        setSujetosObligadosOptions(
          response.map((ente) => ({
            value: Number(ente.id),
            label: ente.nombre,
          }))
        );
      } catch (error) {
        console.error(
          "Error al cargar las opciones de Sujetos Obligados",
          error
        );
      }
    };

    fetchOicOptions();
    fetchSujetosObligadosOptions();

    if (!initialData && session?.user?.entidad) {
      form.setValue("entidad", session.user.entidad);
    }
  }, [session, initialData, form]);

  const onSubmit = async (data: DirectorioFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await directus.request(
          withToken(
            session?.access_token,
            updateItem("directorio", initialData.id, data)
          )
        );
      } else {
        await directus.request(
          withToken(session?.access_token, createItem("directorio", data))
        );
      }
      router.refresh();
      router.push(`/dashboard/directorio`);
      toast({
        variant: "default",
        className: "bg-green-600",
        title: "",
        description: toastMessage,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al intentar guardar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="md:grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="oic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Autoridad Resolutora (OIC){" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          options={oicOptions}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          placeholder="Buscar y seleccionar OIC"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sujetosObligados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sujetos Obligados{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={sujetosObligadosOptions}
                          value={field.value}
                          onChange={(values) => {
                            field.onChange(values);
                          }}
                          placeholder="Buscar y seleccionar Sujetos Obligados"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="md:grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="puesto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Puesto <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Puesto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Nombre"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correoElectronico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Correo Electrónico{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Correo Electrónico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Teléfono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Dirección"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="entidad"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Entidad</FormLabel>
                <FormControl>
                  <Input disabled readOnly value={field.value} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </FormProvider>
    </>
  );
};
