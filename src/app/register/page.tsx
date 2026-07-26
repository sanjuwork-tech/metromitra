"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Train } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const city = String(form.get("city") || "");
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, city: city || undefined }),
      });
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("Account created, but sign-in failed. Please sign in manually.");
      toast.success("Welcome to MetroMitra. Let's set up your stations.");
      router.push("/dashboard?welcome=1");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Train className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle>Join your line</CardTitle>
            <CardDescription>Create a free MetroMitra account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" autoComplete="name" required placeholder="Devika Rao" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.in" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="city" name="city" placeholder="Bengaluru" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
              <p className="text-xs text-muted-foreground">
                By signing up you agree to meet in public station areas and use the platform responsibly.
              </p>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already a member?{" "}
            <Link href="/login" className="ml-1 font-medium text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
