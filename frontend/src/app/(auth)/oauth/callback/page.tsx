"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/glass-card";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        router.push("/login");
        return;
      }

      if (!token) {
        toast.error("No authentication token received.");
        router.push("/login");
        return;
      }

      try {
        // Temporarily set the access token so the API client can use it
        useAuthStore.getState().setAccessToken(token);
        
        // Fetch the user profile using the new token
        const user = await authService.getCurrentUser();
        
        // Store both in the auth store
        setAuth(user, token);
        
        toast.success("Successfully logged in!");
        router.push("/");
      } catch (err: any) {
        console.error("Failed to fetch user profile", err);
        toast.error("Failed to fetch user profile. Please try logging in again.");
        // Clear token on failure
        useAuthStore.getState().logout();
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">Authenticating</h2>
      <p className="text-muted-foreground text-center">
        Please wait while we complete your login...
      </p>
    </GlassCard>
  );
}
