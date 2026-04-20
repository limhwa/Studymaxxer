import { redirect } from "next/navigation";
import { AppNav, MobileNav } from "@/components/app/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <AppNav email={user.email} />
      <main className="min-w-0 pb-20 lg:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}

