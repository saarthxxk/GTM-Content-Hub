import Link from "next/link";
import { FileStack, CheckCircle2, Clock, PenLine, AlertTriangle, Plus, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listContent } from "@/lib/store/content";
import { getDashboardStats } from "@/lib/store/dashboard";
import { listUsers, listAuditLog } from "@/lib/store/catalog";
import { StatTile } from "@/components/analytics/StatTile";
import { ContentTable } from "@/components/content/ContentTable";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export const metadata = { title: "Dashboard" };

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = getDashboardStats();
  const recent = listContent().slice(0, 6);
  const users = listUsers();
  const activity = listAuditLog(8);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[13px] text-muted">Here&apos;s what&apos;s happening across your content today.</p>
        </div>
        <Link href="/studio/content/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> New Content
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Total Content" value={String(stats.total)} icon={FileStack} />
        <StatTile label="Published" value={String(stats.published)} icon={CheckCircle2} />
        <StatTile label="Pending Review" value={String(stats.pendingReview)} icon={Clock} />
        <StatTile label="Drafts" value={String(stats.drafts)} icon={PenLine} />
        <StatTile label="Needs Attention" value={String(stats.needsAttention)} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-[13px] text-muted">Updated This Month</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{stats.updatedThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-[13px] text-muted">Avg. Review Time</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{stats.avgReviewTimeDays || "—"} {stats.avgReviewTimeDays ? "days" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-[13px] text-muted">AI-Assisted Content</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{stats.aiAssistedPct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-[13px] text-muted">Metadata Completion</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{stats.metadataCompletionPct}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Content</CardTitle>
              <CardDescription>The latest activity across your content library</CardDescription>
            </div>
            <Link href="/studio/content" className="text-[13px] font-medium text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <ContentTable items={recent} users={users} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" /> Recent Activity
            </CardTitle>
            <CardDescription>Audit trail of what changed and who changed it</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed entries={activity} users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
