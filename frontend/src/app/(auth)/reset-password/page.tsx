"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
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
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, new_password: values.password });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to reset password. The link might be expired."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Password Reset Complete
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Link href="/login">
            <Button className="w-full">
              Proceed to Login
            </Button>
          </Link>
        </div>
      </GlassCard>
    );
  }

  if (!token) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Invalid Link
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            This password reset link is invalid or missing the required security token. Please request a new link.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">
              Request new link
            </Button>
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Create New Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
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
