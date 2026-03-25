"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/constants/data";
import { MenuIcon } from "lucide-react";
import { useState } from "react";

// import { Playlist } from "../data/playlists";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // playlists: Playlist[];
}

export function MobileSidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-3 pt-8 pb-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Menú
            </p>
            <DashboardNav items={navItems} setOpen={setOpen} />
          </div>
          <div className="px-4 py-3 border-t">
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Plataforma Digital Nacional — Sistema de Cobertura
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
