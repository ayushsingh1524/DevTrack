"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: values.email });
      setIsSubmitted(true);
      toast.success("Reset link sent! Check your email.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            We&apos;ve sent a password reset link to your email address. Click the link in the email to reset your password.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
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
            Send Reset Link
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to login
        </Link>
      </div>
    </GlassCard>
  );
}
