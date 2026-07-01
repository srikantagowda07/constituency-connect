"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthState } from "@/services/auth.service";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Subscribe to Firebase Auth state.
 * Returns the current user and a loading flag.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
  };
}
