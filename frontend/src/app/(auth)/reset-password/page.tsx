"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, new_password: values.password });
      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to reset password. Token may be expired."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <GlassCard className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
        <p className="text-white/60 mb-6">The password reset link is invalid or missing a token.</p>
        <Link href="/forgot-password" className="block w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            Request New Link
          </Button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Set new password
        </h1>
        <p className="text-sm text-white/60">
          Must be at least 8 characters
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
               <FormItem>
                <FormLabel className="text-white/80">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Reset Password
          </Button>
        </form>
      </Form>
    </GlassCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<GlassCard><Loader2 className="animate-spin mx-auto text-primary" /></GlassCard>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
