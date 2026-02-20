// Mapeo de slugs a IDs de entidades federativas
// Formato: slug -> { id, nombre, abreviacion }

export interface EntidadInfo {
  id: string;
  nombre: string;
  abreviacion: string;
  slug: string;
}

// Función para generar slug desde nombre
export function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/ñ/g, "n")
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/[^a-z0-9-]/g, ""); // Solo letras, números y guiones
}

// Datos de entidades con slugs
export const entidadesData: EntidadInfo[] = [
  { id: "00", nombre: "Federación", abreviacion: "Fed.", slug: "federacion" },
  { id: "01", nombre: "Aguascalientes", abreviacion: "Ags.", slug: "aguascalientes" },
  { id: "02", nombre: "Baja California", abreviacion: "BC", slug: "baja-california" },
  { id: "03", nombre: "Baja California Sur", abreviacion: "BCS", slug: "baja-california-sur" },
  { id: "04", nombre: "Campeche", abreviacion: "Camp.", slug: "campeche" },
  { id: "05", nombre: "Coahuila", abreviacion: "Coah.", slug: "coahuila" },
  { id: "06", nombre: "Colima", abreviacion: "Col.", slug: "colima" },
  { id: "07", nombre: "Chiapas", abreviacion: "Chis.", slug: "chiapas" },
  { id: "08", nombre: "Chihuahua", abreviacion: "Chih.", slug: "chihuahua" },
  { id: "09", nombre: "Ciudad de México", abreviacion: "CDMX", slug: "ciudad-de-mexico" },
  { id: "10", nombre: "Durango", abreviacion: "Dgo.", slug: "durango" },
  { id: "11", nombre: "Guanajuato", abreviacion: "Gto.", slug: "guanajuato" },
  { id: "12", nombre: "Guerrero", abreviacion: "Gro.", slug: "guerrero" },
  { id: "13", nombre: "Hidalgo", abreviacion: "Hgo.", slug: "hidalgo" },
  { id: "14", nombre: "Jalisco", abreviacion: "Jal.", slug: "jalisco" },
  { id: "15", nombre: "México", abreviacion: "Mex.", slug: "mexico" },
  { id: "16", nombre: "Michoacán", abreviacion: "Mich.", slug: "michoacan" },
  { id: "17", nombre: "Morelos", abreviacion: "Mor.", slug: "morelos" },
  { id: "18", nombre: "Nayarit", abreviacion: "Nay.", slug: "nayarit" },
  { id: "19", nombre: "Nuevo León", abreviacion: "NL", slug: "nuevo-leon" },
  { id: "20", nombre: "Oaxaca", abreviacion: "Oax.", slug: "oaxaca" },
  { id: "21", nombre: "Puebla", abreviacion: "Pue.", slug: "puebla" },
  { id: "22", nombre: "Querétaro", abreviacion: "Qro.", slug: "queretaro" },
  { id: "23", nombre: "Quintana Roo", abreviacion: "Q. Roo", slug: "quintana-roo" },
  { id: "24", nombre: "San Luis Potosí", abreviacion: "SLP", slug: "san-luis-potosi" },
  { id: "25", nombre: "Sinaloa", abreviacion: "Sin.", slug: "sinaloa" },
  { id: "26", nombre: "Sonora", abreviacion: "Son.", slug: "sonora" },
  { id: "27", nombre: "Tabasco", abreviacion: "Tab.", slug: "tabasco" },
  { id: "28", nombre: "Tamaulipas", abreviacion: "Tamps.", slug: "tamaulipas" },
  { id: "29", nombre: "Tlaxcala", abreviacion: "Tlax.", slug: "tlaxcala" },
  { id: "30", nombre: "Veracruz", abreviacion: "Ver.", slug: "veracruz" },
  { id: "31", nombre: "Yucatán", abreviacion: "Yuc.", slug: "yucatan" },
  { id: "32", nombre: "Zacatecas", abreviacion: "Zac.", slug: "zacatecas" },
];

// Mapeo slug -> entidad
export const slugToEntidad = new Map<string, EntidadInfo>(
  entidadesData.map((e) => [e.slug, e])
);

// Mapeo id -> entidad
export const idToEntidad = new Map<string, EntidadInfo>(
  entidadesData.map((e) => [e.id, e])
);

// Obtener entidad por slug
export function getEntidadBySlug(slug: string): EntidadInfo | undefined {
  return slugToEntidad.get(slug);
}

// Obtener entidad por ID
export function getEntidadById(id: string): EntidadInfo | undefined {
  return idToEntidad.get(id);
}

// Obtener todos los slugs válidos (para generateStaticParams)
export function getAllSlugs(): string[] {
  return entidadesData.map((e) => e.slug);
}
