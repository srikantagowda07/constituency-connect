"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";

/**
 * Compose all app-level context providers here.
 * Add new providers by wrapping inside this component.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
