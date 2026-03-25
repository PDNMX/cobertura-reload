"use client";

import { Session } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

// This hook doesn't rely on the session provider
export const useCurrentSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const pathName = usePathname();

  const retrieveSession = useCallback(async () => {
    try {
      const sessionData = await getSession();
      if (sessionData) {
        // Si el token no pudo refrescarse, forzar cierre de sesión
        if (sessionData.forceLogout || sessionData.error === "RefreshAccessTokenError") {
          setSession(null);
          setStatus("unauthenticated");
          await signOut({ callbackUrl: "/" });
          return;
        }
        setSession(sessionData);
        setStatus("authenticated");
        return;
      }
      setStatus("unauthenticated");
      setSession(null);
    } catch (error) {
      setStatus("unauthenticated");
      setSession(null);
    }
  }, []);

  useEffect(() => {
    // Re-verificar sesión en cada cambio de ruta (no solo cuando no hay sesión)
    // Esto garantiza que si el token expiró, se detecta al navegar
    retrieveSession();
  }, [retrieveSession, pathName]);

  return { session, status };
};
