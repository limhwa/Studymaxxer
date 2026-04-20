import Link from "next/link";
import { BookOpen, CalendarDays, Gauge, ListChecks, Settings, TimerReset } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/study", label: "Study", icon: TimerReset },
  { href: "/log-block", label: "Log block", icon: BookOpen },
  { href: "/behaviors", label: "Behaviors", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav({ email }: { email?: string | null }) {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-card/40 px-4 py-5 lg:block">
      <div>
        <p className="font-semibold">Reality Ledger</p>
        <p className="mt-1 break-words text-xs text-muted-foreground">{email}</p>
      </div>
      <Separator className="my-5" />
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={signOut} className="mt-8">
        <Button variant="outline" className="w-full" type="submit">
          Sign out
        </Button>
      </form>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-background/95 backdrop-blur lg:hidden">
      {navItems.slice(0, 5).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

