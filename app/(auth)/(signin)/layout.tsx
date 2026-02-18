import Header from "@/components/layout/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Cobertura",
  description: "Sistema de Cobertura",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 w-full pt-16 overflow-auto">
        <div className="max-w-screen-2xl mx-auto h-full">{children}</div>
      </main>
    </div>
  );
}
