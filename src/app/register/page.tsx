"use client";
import { useState } from "react";
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
import { useAuth } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const city = String(form.get("city") || "");
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const res = register(name, email, password, city || undefined);
    if (!res.ok) { setLoading(false); toast.error(res.error || "Could not create account"); return; }
    // auto-login
    login(email, password);
    setLoading(false);
    toast.success("Welcome to MetroMitra. Let's set up your stations.");
    router.push("/dashboard?welcome=1");
    router.refresh();
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
                This is a local demo: your account is stored in your browser only. No data leaves your device.
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
