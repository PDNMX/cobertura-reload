import { NavItem } from "@/types";

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavItem[] = [
  {
    title: "Inicio",
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
/*   {
    title: "Employees",
    href: "/dashboard/employees",
    icon: "users",
    label: "employees",
  },
  {
    title: "Kanban",
    href: "/dashboard/kanban",
    icon: "kanban",
    label: "kanban",
  }, */
];
