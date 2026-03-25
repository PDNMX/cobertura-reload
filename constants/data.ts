import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Tablero Estatal",
    href: "/dashboard",
    icon: "dashboard",
    label: "Resumen y estadísticas",
  },
  {
    title: "Entes Públicos",
    href: "/dashboard/entes",
    icon: "users",
    label: "Padrón de sujetos obligados",
  },
  {
    title: "Directorio",
    href: "/dashboard/directorio",
    icon: "notebook",
    label: "Contactos y responsables",
  },
];
