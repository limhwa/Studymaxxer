import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BlockLogForm } from "@/components/forms/block-log-form";
import { getBlockPageData, getCurrentUser } from "@/lib/server/queries";
import { previousThreeHourWindow } from "@/lib/time";

export default async function LogBlockPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const fallback = previousThreeHourWindow();
  const initialStart = params.start ? new Date(params.start) : fallback.start;
  const initialEnd = params.end ? new Date(params.end) : fallback.end;
  const data = await getBlockPageData(user.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <Badge variant="outline">Three-hour logger</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Block Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Summarize the previous block quickly, then move on.</p>
      </div>
      <BlockLogForm
        userId={user.id}
        initialStart={initialStart}
        initialEnd={initialEnd}
        sessions={data.sessions}
        recentBlocks={data.blocks}
      />
    </div>
  );
}

