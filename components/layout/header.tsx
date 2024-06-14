import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { LoginNav } from "./login-nav";
import Link from "next/link";
import Image from "next/image"; // Import Image component from Next.js
import logo from "./logo.svg"; // Ruta a tu logo


export default function Header() {
  return (
    <div className="header-gradient fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:flex items-center">
        <Image 
            src={logo} 
            alt="Logo PDN" 
            width={60} // Ajusta el ancho según tu logo
            height={60} // Ajusta la altura según tu logo
            className="mr-2" // Agrega margen derecho para separar del texto
          />
          <Link
            className="ml-2 text-white"
            href="https://www.plataformadigitalnacional.org/"
            target="_blank"
          >
            Plataforma Digital Nacional
          </Link>
          
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
          <LoginNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
