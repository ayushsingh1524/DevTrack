"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/axios";

// Add paths that do not require authentication
const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, setAccessToken, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we don't have an access token but we are on a protected route, 
      // try to refresh to see if there's a valid httpOnly cookie.
      if (!accessToken && !publicPaths.includes(pathname)) {
        try {
          const response = await apiClient.post("/auth/refresh");
          setAccessToken(response.data.access_token);
        } catch (error) {
          // If refresh fails, we clear state and redirect
          logout();
          router.push("/login");
        }
      } else if (isAuthenticated && publicPaths.includes(pathname)) {
        // If authenticated user tries to access login/register, redirect to home
        router.push("/");
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [pathname, accessToken, isAuthenticated, setAccessToken, logout, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent rendering protected content if not authenticated
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
