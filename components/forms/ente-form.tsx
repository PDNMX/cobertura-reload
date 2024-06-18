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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useMemo } from "react";
import directus from "@/lib/directus";
import { createItem, updateItem } from "@directus/sdk";
import { Switch } from "@/components/ui/switch";
import clsx from 'clsx';

const formSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre del ente público debe tener al menos 3 caracteres.",
  }),
  ambitoGobierno: z.enum(["Estatal", "Federal", "Municipal"], {
    message: "Selecciona una opción válida",
  }),
  poderGobierno: z.enum(["Ejecutivo", "Judicial", "Legislativo", "Autonomo"], {
    message: "Selecciona una opción válida",
  }),
  controlOIC: z.boolean().optional(),
  controlTribunal: z.boolean().optional(),
  sistema1: z.boolean().optional(),
  sistema2: z.boolean().optional(),
  sistema3: z.boolean().optional(),
  sistema6: z.boolean().optional(),
  entidad: z.string(),
  municipio: z.string().nullable(), // Permitir valores nulos
  status: z.string().min(3, { message: "Select status" }),
});

type EnteFormValues = z.infer<typeof formSchema>;

interface EnteFormProps {
  initialData: any | null;
}

export const EnteForm: React.FC<EnteFormProps> = ({ initialData }) => {
  //console.log(session.user.entidad);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ambito, setAmbito] = useState(
    initialData ? initialData.ambitoGobierno : ""
  );
  console.log(initialData)

  const title = initialData ? "Actualizar ente público" : "Crear ente público";
  const description = initialData
    ? "Edita la información del ente público"
    : "Agrega un nuevo ente público";
  const toastMessage = initialData
    ? "Ente público actualizado"
    : "Nuevo ente público creado.";
  const action = initialData ? "Actualizar" : "Crear";

  // Calcular defaultValues usando useMemo
  const defaultValues = useMemo(() => {
    return initialData ?? {
      nombre: "",
      ambitoGobierno: "",
      poderGobierno: "",
      controlOIC: false,
      controlTribunal: false,
      sistema1: false,
      sistema2: false,
      sistema3: false,
      sistema6: false,
      entidad: "",
      municipio: "",
      status: "Published",
    };
  }, [initialData]); // Solo recalcular si initialData cambia


  const form = useForm<EnteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      for (const key in initialData) {
        if (formSchema.shape.hasOwnProperty(key)) {
          form.setValue(key, initialData[key]);
        }
      }
    }
  }, [initialData, form.setValue]); 

  const onSubmit = async (data: EnteFormValues) => {
    try {
      setLoading(true);
      if (data.municipio === "") {
        data.municipio = null; // Convertir cadena vacía a null antes de enviar
      }
      if (initialData) {
        await directus.request(updateItem("entes", initialData.id, data));
      } else {
        await directus.request(createItem("entes", data));
      }
      router.refresh();
      router.push(`/dashboard/entes`);
      toast({
        variant: "default",
        title: "",
        description: toastMessage
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

  /* const onDelete = async () => {
    try {
      setLoading(true);
      router.refresh();
      router.push(`/${params.storeId}/products`);
    } catch (error: any) {
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
 */
  const handleAmbitoChange = (value: "Estatal" | "Federal" | "Municipal") => {
    setAmbito(value);
    form.setValue("ambitoGobierno", value);
    if (value !== "Municipal") {
      form.setValue("municipio", ""); // Limpiar el campo municipio si no es Municipal
    }
  };

  const poderOptions =
    ambito === "Municipal"
      ? ["Ejecutivo"]
      : ["Ejecutivo", "Judicial", "Legislativo", "Autonomo"];

  useEffect(() => {
    const controlOIC = form.watch("controlOIC");
    const controlTribunal = form.watch("controlTribunal");

    if (controlOIC) {
      form.setValue("sistema1", false);
      form.setValue("sistema2", false);
      form.setValue("sistema6", false);
    }

    if (controlTribunal) {
      form.setValue("controlOIC", false);
    }

    if (!controlOIC && !controlTribunal) {
      form.setValue("sistema3", false);
    }
  }, [form.watch("controlOIC"), form.watch("controlTribunal")]);

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
          <div className="md:grid md:grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Employee name"
                      value={"Published"}
                      readOnly
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
                    Nombre: <span className="text-red-500">*</span>
                  </FormLabel>
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
              name="ambitoGobierno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ámbito de Gobierno: <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      handleAmbitoChange(
                        value as "Estatal" | "Federal" | "Municipal"
                      );
                      field.onChange(value);
                    }}
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
              name="poderGobierno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Poder de Gobierno: <span className="text-red-500">*</span>
                  </FormLabel>
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
                      {poderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-1 gap-8">
            {/* SWITCH OIC */}
            <FormField
              control={form.control}
              name="controlOIC"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm",
                    { disabled: loading }
                  )}
                  data-tooltip="Habilitará solo el sistema S3"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Órgano Interno de Control</FormLabel>
                    <FormDescription>
                      Al activar el Órgano Interno de Control, solo el sistema
                      S3 estará disponible.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => {
                        form.setValue("controlOIC", checked);
                        if (checked) {
                          form.setValue("controlTribunal", false);
                          form.setValue("sistema1", false);
                          form.setValue("sistema2", false);
                          form.setValue("sistema3", false);
                          form.setValue("sistema6", false);
                        }
                      }}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="controlTribunal"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm",
                    { disabled: loading || form.watch("controlOIC") }
                  )}
                  data-tooltip="Deshabilita la opción de Órgano Interno de Control"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Tribunal de Justicia Administrativa</FormLabel>
                    <FormDescription>
                      Al activar el Tribunal de Justicia Administrativa, podrás
                      activar o desactivar todos los sistemas.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => {
                        form.setValue("controlTribunal", checked);
                        if (checked) {
                          form.setValue("controlOIC", false);
                        }
                      }}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="sistema1"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "items-center justify-between rounded-lg border p-3 shadow-sm",
                    { disabled: loading || form.watch("controlOIC") }
                  )}
                  data-tooltip="Deshabilitado si Órgano Interno de Control está activado"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Sistema 1</FormLabel>
                    <FormDescription>
                      Este sistema estará deshabilitado si la opción de Órgano
                      Interno de Control está activada.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sistema2"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "items-center justify-between rounded-lg border p-3 shadow-sm",
                    { disabled: loading || form.watch("controlOIC") }
                  )}
                  data-tooltip="Deshabilitado si Órgano Interno de Control está activado"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Sistema 2</FormLabel>
                    <FormDescription>
                      Este sistema estará deshabilitado si la opción de Órgano
                      Interno de Control está activada.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sistema3"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "items-center justify-between rounded-lg border p-3 shadow-sm",
                    {
                      disabled:
                        loading ||
                        (!form.watch("controlOIC") &&
                          !form.watch("controlTribunal")),
                    }
                  )}
                  data-tooltip="Disponible si se activa Órgano Interno de Control o Tribunal de Justicia Administrativa"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Sistema 3</FormLabel>
                    <FormDescription>
                      Este sistema estará disponible si se activa el Órgano
                      Interno de Control o el Tribunal de Justicia
                      Administrativa.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={
                        loading ||
                        (!form.watch("controlOIC") &&
                          !form.watch("controlTribunal"))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sistema6"
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    "items-center justify-between rounded-lg border p-3 shadow-sm",
                    { disabled: loading || form.watch("controlOIC") }
                  )}
                  data-tooltip="Deshabilitado si Órgano Interno de Control está activado"
                >
                  <div className="space-y-0.5">
                    <FormLabel>Sistema 6</FormLabel>
                    <FormDescription>
                      Este sistema estará deshabilitado si la opción de Órgano
                      Interno de Control está activada.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="md:grid md:grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="entidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidad</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Automático del usuario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="municipio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipio</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading || ambito !== "Municipal"}
                      placeholder="Condicional solo si ámbito es MUNICIPAL"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </FormProvider>
    </>
  );
};
