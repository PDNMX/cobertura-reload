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
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import directus from "@/lib/directus";
import { createItem } from "@directus/sdk";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  ambitoGobierno: z.enum(["Estatal", "Federal", "Municipal"], {
    message: "Selecciona una opción válida",
  }),
  poderGobierno: z.enum(
    ["Ejecutivo", "Judicial", "Legislativo", "Autonomo"],
    {
      message: "Selecciona una opción válida",
    }
  ),
  controlOIC: z.boolean().optional(),
  controlTribunal: z.boolean().optional(),
  sistema1: z.boolean().optional(),
  sistema2: z.boolean().optional(),
  sistema3: z.boolean().optional(),
  sistema6: z.boolean().optional(),
  entidad: z.string(),
  municipio: z.string(),
  status: z.string().min(3, { message: "Select status" }),
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
  const [ambito, setAmbito] = useState(
    initialData ? initialData.ambitoGobierno : ""
  );

  const title = initialData ? "Editar ente público" : "Crear ente público";
  const description = initialData
    ? "Edit a employee."
    : "Agregar un nuevo ente público";
  const toastMessage = initialData
    ? "Employee updated."
    : "Ente público creado.";
  const action = initialData ? "Save changes" : "Crear";

  const defaultValues = initialData
    ? initialData
    : {
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await directus.request(createItem("entes", data));
      } else {
        await directus.request(createItem("entes", data));
      }
      router.refresh();
      router.push(`/dashboard/entes`);
      toast({
        variant: "default",
        title: "Created Successfully",
        description: "Hurry! Employee created successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
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

  const handleAmbitoChange = (value: "Estatal" | "Federal" | "Municipal") => {
    setAmbito(value);
    form.setValue("ambitoGobierno", value);
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
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
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
              name="ambitoGobierno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ámbito de Gobierno</FormLabel>
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
          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="controlOIC"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">
                    Órgano Interno de Control
                  </FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="controlTribunal"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">
                    Tribunal de Justicia Administrativa
                  </FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-4 gap-8">
            <FormField
              control={form.control}
              name="sistema1"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">Sistema 1</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema2"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">Sistema 2</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema3"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">Sistema 3</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema6"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">Sistema 6</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={loading || form.watch("controlOIC")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-2 gap-8">
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
                      disabled={loading}
                      placeholder="Condicional solo si ámbito es MUNICIPAL"
                      {...field}
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
