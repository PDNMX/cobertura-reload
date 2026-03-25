import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/utils";
import { LayoutDashboardIcon } from "lucide-react";

export default function Sidebar() {
  return (
    <nav className={cn("relative hidden h-screen border-r lg:flex lg:flex-col w-72 bg-background/95")}>
      {/* Nav items */}
      <div className="flex-1 px-3 pt-20 pb-6">
        {/* Section label */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menú
        </p>
        <DashboardNav items={navItems} />
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t">
        <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
          Plataforma Digital Nacional
          <br />
          Sistema de Cobertura
        </p>
      </div>
    </nav>
  );
}
