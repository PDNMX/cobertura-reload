"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { signOut } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";
import { LogOut } from "lucide-react";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="flex flex-col h-full gap-1">
      <div className="flex flex-col gap-1 flex-1">
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          const isActive = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href ?? ""));
          return (
            item.href && (
              <Link
                key={index}
                href={item.disabled ? "/" : item.href}
                onClick={() => {
                  if (setOpen) setOpen(false);
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
                )}

                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="leading-tight">{item.title}</span>
                  {item.label && (
                    <span className="text-[10px] text-muted-foreground/70 font-normal leading-tight">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-1 my-2" />

      {/* Logout */}
      <button
        onClick={() => signOut()}
        className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 group-hover:bg-destructive/15 transition-all duration-150">
          <LogOut className="h-4 w-4" />
        </span>
        <span>Cerrar Sesión</span>
      </button>
    </nav>
  );
}
