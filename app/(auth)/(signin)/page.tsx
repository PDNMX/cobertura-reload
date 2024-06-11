"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AuthenticationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard"); // Redirect to dashboard if user is authenticated
    }
  }, [router, status]);

  if (status === "loading") {
    // Render loading state if session status is still loading
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-full">
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Hi, Welcome back 👋
        </h2>
      </div>

    </div>
  </ScrollArea>
  );
}
