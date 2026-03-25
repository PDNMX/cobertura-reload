// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
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
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useMemo } from "react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import directus from "@/lib/directus";
import { createItem, updateItem, readItems, withToken } from "@directus/sdk";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import icoS1    from "@/components/tables/cobertura-table/icons-thead/s1.svg";
import icoS2    from "@/components/tables/cobertura-table/icons-thead/s2.svg";
import icoS3OIC from "@/components/tables/cobertura-table/icons-thead/s3OIC.svg";
import icoS6    from "@/components/tables/cobertura-table/icons-thead/s6.svg";
import icoSO    from "@/components/tables/cobertura-table/icons-thead/sujetosObligados.svg";
import icoOIC   from "@/components/tables/cobertura-table/icons-thead/oic.svg";
import icoTJA   from "@/components/tables/cobertura-table/icons-thead/tribunal.svg";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type TipoEnte = "SO" | "OIC" | "TJA";

const TIPO_ENTE = [
  {
    value: "SO" as TipoEnte,
    label: "Sujeto Obligado",
    shortLabel: "SO",
    description: "Entes públicos que reportan en los Sistemas 1, 2 y 6",
    sistemas: "S1 · S2 · S6",
    iconSrc: icoSO,
    color: "#6f4168",
    bg: "#6f416815",
    border: "#6f416850",
  },
  {
    value: "OIC" as TipoEnte,
    label: "Órgano Interno de Control",
    shortLabel: "OIC",
    description: "OIC que reporta en el Sistema 3",
    sistemas: "S3",
    iconSrc: icoOIC,
    color: "#c49a2a",
    bg: "#e5bb5f15",
    border: "#e5bb5f50",
  },
  {
    value: "TJA" as TipoEnte,
    label: "Tribunal de Justicia Administrativa",
    shortLabel: "TJA",
    description: "Tribunal que puede reportar en todos los sistemas",
    sistemas: "S1 · S2 · S3 · S6",
    iconSrc: icoTJA,
    color: "#b5877a",
    bg: "#b5877a15",
    border: "#b5877a50",
  },
] as const;

const SISTEMAS_LIST = [
  { key: "sistema1", label: "Sistema 1", desc: "Evolución patrimonial, declaración de intereses y declaración fiscal", icon: icoS1,    hex: "#F29888", aplicaA: ["SO", "TJA"] },
  { key: "sistema2", label: "Sistema 2", desc: "Servidores públicos en procedimientos de contrataciones públicas",    icon: icoS2,    hex: "#B25FAC", aplicaA: ["SO", "TJA"] },
  { key: "sistema3", label: "Sistema 3", desc: "Servidores públicos y particulares sancionados",                      icon: icoS3OIC, hex: "#9085DA", aplicaA: ["OIC", "TJA"] },
  { key: "sistema6", label: "Sistema 6", desc: "Sistema de Información Pública de Contrataciones",                    icon: icoS6,    hex: "#42A5CC", aplicaA: ["SO", "TJA"] },
] as const;

function getTipoFromData(data: any): TipoEnte {
  if (!data) return "SO";
  if (data.controlTribunal) return "TJA";
  if (data.controlOIC)      return "OIC";
  return "SO";
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z.object({
  nombre:        z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  ambitoGobierno: z.enum(["Estatal", "Federal", "Municipal"], { message: "Selecciona una opción válida" }),
  poderGobierno:  z.enum(["Ejecutivo", "Judicial", "Legislativo", "Autonomo"], { message: "Selecciona una opción válida" }),
  controlOIC:     z.boolean().optional(),
  controlTribunal: z.boolean().optional(),
  sistema1: z.boolean().optional(),
  sistema2: z.boolean().optional(),
  sistema3: z.boolean().optional(),
  sistema6: z.boolean().optional(),
  entidad:  z.string(),
  municipio: z.string().nullable(),
});

type EnteFormValues = z.infer<typeof formSchema>;

interface EnteFormProps {
  initialData:  any | null;
  defaultTipo?: TipoEnte;
}

export const EnteForm: React.FC<EnteFormProps> = ({ initialData, defaultTipo = "SO" }) => {
  const router   = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ambito,  setAmbito]  = useState(initialData?.ambitoGobierno ?? "");
  const [tipoEnte, setTipoEnte] = useState<TipoEnte>(
    initialData ? getTipoFromData(initialData) : defaultTipo
  );
  const [municipiosData, setMunicipiosData] = useState([]);
  const { session } = useCurrentSession();

  const isEditing = !!initialData;
  const title       = isEditing ? "Actualizar ente" : "Registrar nuevo ente";
  const toastMessage = isEditing ? "Ente actualizado correctamente." : "Ente registrado correctamente.";
  const action      = isEditing ? "Actualizar" : "Registrar";

  const defaultValues = useMemo(() => ({
    nombre:         initialData?.nombre          ?? "",
    ambitoGobierno: initialData?.ambitoGobierno  ?? "",
    poderGobierno:  initialData?.poderGobierno   ?? "",
    controlOIC:     initialData?.controlOIC      ?? (defaultTipo === "OIC"),
    controlTribunal: initialData?.controlTribunal ?? (defaultTipo === "TJA"),
    sistema1: initialData?.sistema1 ?? false,
    sistema2: initialData?.sistema2 ?? false,
    sistema3: initialData?.sistema3 ?? false,
    sistema6: initialData?.sistema6 ?? false,
    entidad:  session?.user?.entidad ?? "",
    municipio: initialData?.municipio ?? "",
  }), [initialData, session?.user?.entidad, defaultTipo]);

  const form = useForm<EnteFormValues>({ resolver: zodResolver(formSchema), defaultValues });

  useEffect(() => {
    if (initialData) {
      for (const key in initialData) {
        if (formSchema.shape.hasOwnProperty(key)) form.setValue(key, initialData[key]);
      }
      setAmbito(initialData.ambitoGobierno);
    } else {
      if (session?.user?.entidad) form.setValue("entidad", session.user.entidad);
    }
  }, [initialData, session]);

  useEffect(() => {
    if (!session) return;
    directus.request(withToken(session?.access_token, readItems("municipio", {
      sort: ["nombre"], limit: "-1", fields: ["*"],
      filter: { id_entidad: { _eq: session?.user?.entidad } },
    }))).then(setMunicipiosData).catch(console.error);
  }, [session]);

  // Cuando cambia el tipo, actualizar controlOIC/controlTribunal y limpiar sistemas no aplicables
  const handleTipoChange = (tipo: TipoEnte) => {
    setTipoEnte(tipo);
    form.setValue("controlOIC",      tipo === "OIC");
    form.setValue("controlTribunal", tipo === "TJA");
    // Limpiar sistemas que no apliquen al nuevo tipo
    SISTEMAS_LIST.forEach((s) => {
      if (!s.aplicaA.includes(tipo)) form.setValue(s.key, false);
    });
  };

  const handleAmbitoChange = (value: "Estatal" | "Federal" | "Municipal") => {
    setAmbito(value);
    form.setValue("ambitoGobierno", value);
    if (value !== "Municipal") form.setValue("municipio", "");
  };

  const poderOptions = ambito === "Municipal"
    ? ["Ejecutivo"]
    : ["Ejecutivo", "Judicial", "Legislativo", "Autonomo"];

  const onSubmit = async (data: EnteFormValues) => {
    try {
      setLoading(true);
      if (data.municipio === "") data.municipio = null;
      if (isEditing) {
        await directus.request(withToken(session?.access_token, updateItem("entes", initialData.id, data)));
      } else {
        await directus.request(withToken(session?.access_token, createItem("entes", data)));
      }
      router.refresh();
      router.push("/dashboard/entes");
      toast({ variant: "default", className: "bg-green-600", title: "", description: toastMessage });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al intentar guardar" });
    } finally {
      setLoading(false);
    }
  };

  const tipoActual = TIPO_ENTE.find((t) => t.value === tipoEnte)!;

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={
          isEditing
            ? "Edita la información del ente registrado"
            : "Completa los campos para registrar un nuevo ente"
        } />
      </div>
      <Separator />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">

          {/* ── 1. TIPO DE ENTE ───────────────────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Tipo de ente <span className="text-red-500">*</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selecciona el tipo que corresponde al ente que deseas registrar.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIPO_ENTE.map((tipo) => {
                const isSelected = tipoEnte === tipo.value;
                return (
                  <button
                    key={tipo.value}
                    type="button"
                    disabled={loading}
                    onClick={() => handleTipoChange(tipo.value)}
                    className="relative text-left rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none"
                    style={{
                      borderColor:     isSelected ? tipo.color : "hsl(var(--border))",
                      backgroundColor: isSelected ? tipo.bg    : "transparent",
                    }}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 h-4 w-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: tipo.color }}>
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </span>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                      style={{ backgroundColor: isSelected ? tipo.color + "22" : "hsl(var(--muted))" }}>
                      <Image
                        src={tipo.iconSrc}
                        alt={tipo.shortLabel}
                        width={26}
                        height={26}
                        className={isSelected ? "opacity-100" : "opacity-50"}
                      />
                    </div>
                    <p className="text-sm font-bold leading-tight" style={{ color: isSelected ? tipo.color : undefined }}>{tipo.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{tipo.description}</p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: isSelected ? tipo.color + "20" : "hsl(var(--muted))",
                        color:           isSelected ? tipo.color         : "hsl(var(--muted-foreground))",
                      }}>
                      {tipo.sistemas}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* ── 2. DATOS GENERALES ────────────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Datos generales</p>
            <div className="grid grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder={`Nombre del ${tipoActual.label}`} value={field.value || ""} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="ambitoGobierno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ámbito de Gobierno <span className="text-red-500">*</span></FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={(v) => { handleAmbitoChange(v as any); field.onChange(v); }}
                        value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona un ámbito" /></SelectTrigger>
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
                      <FormLabel>Poder de Gobierno <span className="text-red-500">*</span></FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona un poder" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {poderOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Municipio (solo visible si ámbito es Municipal) */}
              {ambito === "Municipal" && (
                <FormField
                  control={form.control}
                  name="municipio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipio</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio">
                              {municipiosData.find((m) => m.id_municipio === field.value)?.nombre || ""}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {municipiosData.map((m) => (
                            <SelectItem key={m.id_municipio} value={m.id_municipio}>{m.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Entidad oculta */}
              <FormField control={form.control} name="entidad" render={({ field }) => (
                <FormItem className="hidden"><FormControl><Input disabled readOnly {...field} /></FormControl></FormItem>
              )} />
            </div>
          </div>

          <Separator />

          {/* ── 3. SISTEMAS DE INTERCONEXIÓN ──────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Sistemas de interconexión</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tipoEnte === "SO"  && "Para Sujetos Obligados aplican los Sistemas 1, 2 y 6. El Sistema 3 no aplica."}
                {tipoEnte === "OIC" && "Para OIC aplica únicamente el Sistema 3. Los Sistemas 1, 2 y 6 no aplican."}
                {tipoEnte === "TJA" && "Para Tribunales aplican todos los sistemas: 1, 2, 3 y 6."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SISTEMAS_LIST.map((s) => {
                const aplica = s.aplicaA.includes(tipoEnte);
                return (
                  <FormField
                    key={s.key}
                    control={form.control}
                    name={s.key}
                    render={({ field }) => (
                      <div
                        className="flex items-center justify-between rounded-xl border p-4 transition-colors"
                        style={{
                          opacity:         aplica ? 1 : 0.45,
                          borderColor:     aplica && field.value ? s.hex + "60" : undefined,
                          backgroundColor: aplica && field.value ? s.hex + "08" : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: aplica ? s.hex + "18" : "hsl(var(--muted))" }}>
                            <Image src={s.icon} alt={s.label} width={20} height={20}
                              className={aplica ? "" : "opacity-40"} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-none" style={{ color: aplica ? s.hex : undefined }}>
                              {s.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{s.desc}</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-3">
                          {aplica ? (
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                            />
                          ) : (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full whitespace-nowrap">
                              No aplica
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button disabled={loading} type="submit" className="min-w-[120px]">
              {action}
            </Button>
          </div>

        </form>
      </FormProvider>
    </>
  );
};
