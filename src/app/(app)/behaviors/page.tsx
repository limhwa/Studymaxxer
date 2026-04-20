import { redirect } from "next/navigation";
import { BehaviorLogger } from "@/components/forms/behavior-logger";
import { Badge } from "@/components/ui/badge";
import { getBehaviorPageData, getCurrentUser } from "@/lib/server/queries";

export default async function BehaviorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getBehaviorPageData(user.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <Badge variant="outline">Accountability engine</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Behavior Logger</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log rule breaks, recoveries, and discipline wins with point audit history.</p>
      </div>
      <BehaviorLogger
        userId={user.id}
        types={data.types}
        logs={data.logs}
        blocks={data.blocks}
        sessions={data.sessions}
      />
    </div>
  );
}

