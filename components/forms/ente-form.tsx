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
import { Textarea } from "@/components/ui/textarea";
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

import directus from "@/lib/directus";
import { readItems, createItem } from "@directus/sdk";

const formSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  ambitoGobierno: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  poderGobierno: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  controlOIC: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  controlTribunal: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  sistema1: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  sistema2: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  sistema3: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  sistema6: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  entidad: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  municipio: z
    .string()
    .min(3, { message: "Employee name must be at least 3 characters" }),
  status: z.string().min(3, { message: "Select status" }),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
}

export const EnteForm: React.FC<ProductFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = initialData ? "Editar ente públicos" : "Crear ente público";
  const description = initialData ? "Edit a employee." : "Agregar un nuevo ente público";
  const toastMessage = initialData ? "Employee updated." : "Ente público creado.";
  const action = initialData ? "Save changes" : "Crear";

  const defaultValues = initialData
    ? initialData
    : {
        nombre: "",
        ambitoGobierno: "",
        poderGobierno: "",
        controlOIC: "",
        controlTribunal: "",
        sistema1: "",
        sistema2: "",
        sistema3: "",
        sistema6: "",
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
        // await axios.post(`/api/products/edit-product/${initialData._id}`, data);
        await directus.request(createItem("entes2", data));
      } else {
        // const res = await axios.post(`/api/products/create-product`, data);
        // console.log("product", res);

        await directus.request(createItem("entes2", data));
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
      //   await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
    } catch (error: any) {
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      /> */}
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            {/* Hidden status field */}
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
                  <FormLabel>Ambito de Gobierno</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Selecciona"
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Selecciona"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="controlOIC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organo Interno de Control</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
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
                <FormItem>
                  <FormLabel>Tribunal de Justicia Administrativa</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sistema1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema 1</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
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
                <FormItem>
                  <FormLabel>Sistema 2</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
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
                <FormItem>
                  <FormLabel>Sistema 3</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
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
                <FormItem>
                  <FormLabel>Sistema 6</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="TRUE/FALSE"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidad</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Automatico del usuario"
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
                      placeholder="Condicional solo si ambito es MUNICIPAL"
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
      </Form>
    </>
  );
};
 