// @ts-nocheck
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEntidadBySlug, getAllSlugs, EntidadInfo } from "@/lib/entidades-slugs";
import EntidadPageClient from "./EntidadPageClient";

interface EntidadPageProps {
  params: Promise<{
    entidad: string;
  }>;
}

// Generar rutas estáticas para todas las entidades
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    entidad: slug,
  }));
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: EntidadPageProps): Promise<Metadata> {
  const { entidad } = await params;
  const entidadInfo = getEntidadBySlug(entidad);

  if (!entidadInfo) {
    return {
      title: "Entidad no encontrada",
    };
  }

  return {
    title: `${entidadInfo.nombre} - Tablero de Interconexión Nacional`,
    description: `Estadísticas de interconexión con la Plataforma Digital Nacional para ${entidadInfo.nombre}. Avance en Sistemas 1, 2, 3 y 6.`,
    openGraph: {
      title: `${entidadInfo.nombre} - Tablero de Interconexión PDN`,
      description: `Visualiza el avance de ${entidadInfo.nombre} en la interconexión con los sistemas de la Plataforma Digital Nacional.`,
    },
  };
}

export default async function EntidadPage({ params }: EntidadPageProps) {
  const { entidad } = await params;
  const entidadInfo = getEntidadBySlug(entidad);

  // Si no existe la entidad, mostrar 404
  if (!entidadInfo) {
    notFound();
  }

  return <EntidadPageClient entidadInfo={entidadInfo} />;
}
