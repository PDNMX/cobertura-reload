import { NavItem } from "@/types";

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
  loquesea: string;
};
export const users: User[] = [];

export const navItems: NavItem[] = [
  {
    title: "Tablero Estatal",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Entes Públicos",
    href: "/dashboard/entes",
    icon: "users",
    label: "entes",
  },
];
