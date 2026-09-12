import { Eye, MousePointerClick, Target, TrendingUp } from "lucide-react";
import { getAnalyticsSummary } from "@/lib/store/analytics";
import { StatTile } from "@/components/analytics/StatTile";
import { AreaChart } from "@/components/analytics/AreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { StatusDistribution } from "@/components/analytics/StatusDistribution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const summary = getAnalyticsSummary();
  const dates = summary.seriesByDate.map((p) => p.date);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Content Performance</h1>
        <p className="mt-1 text-[13px] text-muted">How published content is performing across views, engagement, and conversions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Views" value={formatNumber(summary.totalViews)} icon={Eye} />
        <StatTile label="Total Clicks" value={formatNumber(summary.totalClicks)} icon={MousePointerClick} />
        <StatTile label="Conversions" value={formatNumber(summary.totalConversions)} icon={Target} />
        <StatTile label="Avg. Engagement Rate" value={`${summary.avgEngagementRate}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views &amp; Clicks Over Time</CardTitle>
          <CardDescription>Last 14 days across all published content</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            dates={dates}
            series={[
              { key: "views", label: "Views", color: "var(--chart-1)", values: summary.seriesByDate.map((p) => p.views) },
              { key: "clicks", label: "Clicks", color: "var(--chart-2)", values: summary.seriesByDate.map((p) => p.clicks) },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content by Category</CardTitle>
            <CardDescription>Number of content items per category</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={summary.byCategory.map((c) => ({ label: c.categoryName, value: c.count }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Views by Campaign</CardTitle>
            <CardDescription>Which campaigns are driving the most traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={summary.byCampaign.map((c) => ({ label: c.campaignName, value: c.views }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
            <CardDescription>Where everything sits in the workflow right now</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistribution counts={summary.byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Content</CardTitle>
            <CardDescription>Highest-performing published content by views</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={summary.topContent.map((c) => ({ label: c.title, value: c.views }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
