import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/forms/settings-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, getDashboardData } from "@/lib/server/queries";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getDashboardData(user.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <Badge variant="outline">Controls</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure reminders, targets, and scoring thresholds.</p>
      </div>
      <Alert>
        Browser notifications are best-effort and require permission. Flutter local notifications are the reliable daily prompt path.
      </Alert>
      <SettingsForm userId={user.id} settings={data.settings} />
    </div>
  );
}

