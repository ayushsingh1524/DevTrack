"use client";

import { useState } from "react";
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
      await authService.forgotPassword(values);
      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <GlassCard className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
          Check your email
        </h1>
        <p className="text-sm text-white/60 mb-6">
          If an account exists for that email, we have sent password reset instructions.
        </p>
        <Link href="/login" className="block w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            Return to Login
          </Button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Reset password
        </h1>
        <p className="text-sm text-white/60">
          Enter your email and we will send you a reset link
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
               <FormItem>
                <FormLabel className="text-white/80">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
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
            Send Reset Link
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-white/60 hover:text-white font-medium transition-colors"
        >
          &larr; Back to login
        </Link>
      </div>
    </GlassCard>
  );
}
