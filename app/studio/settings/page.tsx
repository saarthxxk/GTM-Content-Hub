import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listAuditLog, listCampaigns, listCategories, listTags, listUsers } from "@/lib/store/catalog";
import { UsersTable } from "@/components/admin/UsersTable";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { CampaignManager } from "@/components/admin/CampaignManager";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administration" };

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (currentUser.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access restricted"
        description="Administration is only available to Admin accounts. Switch to Morgan Blake (Admin) from the account menu to explore this section."
      />
    );
  }

  const users = listUsers();
  const categories = listCategories();
  const tags = listTags();
  const campaigns = listCampaigns();
  const auditLog = listAuditLog(60);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Administration</h1>
        <p className="mt-1 text-[13px] text-muted">Manage users, taxonomy, campaigns, and review the full audit trail.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="taxonomy">Categories &amp; Tags</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users &amp; Roles</CardTitle>
              <CardDescription>Author, Reviewer, and Admin roles control what each person can do — see the workflow permissions in lib/workflow.</CardDescription>
            </CardHeader>
            <UsersTable users={users} currentUserId={currentUser.id} />
          </Card>
        </TabsContent>

        <TabsContent value="taxonomy" className="mt-4">
          <TaxonomyManager categories={categories} tags={tags} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignManager campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Every significant action across the platform, most recent first.</CardDescription>
            </CardHeader>
            <AuditLogTable entries={auditLog} users={users} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
