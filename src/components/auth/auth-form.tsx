import Link from "next/link";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/app/(auth)/actions";

type AuthFormProps = {
  mode: "login" | "signup";
  error?: string;
  message?: string;
};

export function AuthForm({ mode, error, message }: AuthFormProps) {
  const isSignup = mode === "signup";
  const action = isSignup ? signup : login;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_460px]">
      <div className="hidden min-h-screen items-end overflow-hidden border-r lg:flex">
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80"
          alt="Focused desk with notebook and laptop"
          width={1600}
          height={2200}
          priority
          className="h-full w-full object-cover opacity-70"
        />
      </div>
      <main className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isSignup ? "Create your ledger" : "Return to the ledger"}</CardTitle>
            <CardDescription>
              Track study, behavior, and discipline with a 14-day reality window.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              {error ? <Alert className="border-[var(--color-demerit)] text-[var(--color-demerit)]">{error}</Alert> : null}
              {message ? <Alert>{message}</Alert> : null}
              {isSignup ? (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input id="displayName" name="displayName" autoComplete="name" required />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </div>
              <Button className="w-full" type="submit">
                {isSignup ? "Create account" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <Link className="text-primary hover:underline" href={isSignup ? "/login" : "/signup"}>
                {isSignup ? "Sign in" : "Create account"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
