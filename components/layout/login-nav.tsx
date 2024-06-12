"use client";

import UserAuthForm from "@/components/forms/user-auth-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

export function LoginNav() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="text-xs md:text-sm">
            Ingresar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-100" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <UserAuthForm/>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
