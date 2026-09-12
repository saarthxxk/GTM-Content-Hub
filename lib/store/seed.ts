import type { Database } from "./db";
import type {
  AuditLogEntry,
  Campaign,
  Category,
  Content,
  ContentAnalytics,
  ContentVersion,
  MediaAsset,
  Review,
  Tag,
  User,
} from "@/types";

// Deterministic ids so the seed is stable across resets (nice for demos and
// for tests that reference a known record).
const uid = (n: string) => `usr_${n}`;
const cid = (n: string) => `cnt_${n}`;

const users: User[] = [
  { id: uid("sarthak"), name: "Sarthak Awasthi", email: "awasthifate@gmail.com", role: "author", avatarColor: "#6366f1", title: "Content Strategist" },
  { id: uid("priya"), name: "Priya Menon", email: "priya.menon@example.com", role: "author", avatarColor: "#0ea5e9", title: "GTM Writer" },
  { id: uid("rahul"), name: "Rahul Verma", email: "rahul.verma@example.com", role: "reviewer", avatarColor: "#16a34a", title: "Content Reviewer" },
  { id: uid("elena"), name: "Elena Ruiz", email: "elena.ruiz@example.com", role: "reviewer", avatarColor: "#f59e0b", title: "Brand Lead" },
  { id: uid("admin"), name: "Morgan Blake", email: "morgan.blake@example.com", role: "admin", avatarColor: "#dc2626", title: "GTM Platform Admin" },
];

const categories: Category[] = [
  { id: "cat_ai", name: "Artificial Intelligence", slug: "ai" },
  { id: "cat_cloud", name: "Cloud", slug: "cloud" },
  { id: "cat_cyber", name: "Cybersecurity", slug: "cybersecurity" },
  { id: "cat_data", name: "Data & Analytics", slug: "data" },
  { id: "cat_industry", name: "Industry Insights", slug: "industry" },
];

const tags: Tag[] = [
  "AI", "Digital Transformation", "Enterprise Technology", "Automation", "Data Analytics",
  "Cloud Migration", "Zero Trust", "Customer Experience", "Sustainability", "Financial Services",
].map((name, i) => ({ id: `tag_${i}`, name }));

const campaigns: Campaign[] = [
  { id: "cmp_ai_transform", name: "AI Transformation 2026", description: "Enterprise AI adoption campaign for FSI and healthcare accounts.", startDate: "2026-01-15", endDate: "2026-06-30" },
  { id: "cmp_cloud_migration", name: "Cloud Modernization Q3", description: "Driving cloud migration assessments across mid-market accounts.", startDate: "2026-07-01", endDate: "2026-09-30" },
  { id: "cmp_secure_enterprise", name: "Secure Enterprise", description: "Zero trust security thought leadership series.", startDate: "2026-03-01", endDate: "2026-12-31" },
];

function metadata(title: string, description: string, keywords: string[]) {
  return {
    metaTitle: title,
    metaDescription: description,
    keywords,
    canonicalUrl: undefined,
    ogImage: undefined,
  };
}

const lorem = {
  ai: `Organizations are increasingly adopting artificial intelligence to accelerate digital transformation, improve operational efficiency, and unlock new sources of customer value. This shift is not just technological — it requires new operating models, governance structures, and talent strategies.

Enterprises that succeed with AI treat it as a capability woven through the business rather than a bolt-on initiative. That means investing in clean, well-governed data; building cross-functional teams that pair domain experts with data scientists; and establishing clear metrics for value realization from day one.

Leaders should start with a small number of high-value use cases, prove impact quickly, and scale the operating model — not just the technology — across the organization. The organizations that move fastest are the ones that pair strong technical foundations with disciplined change management.

Looking ahead, the gap between AI leaders and laggards will widen. Now is the time to build the muscle.`,
  cloud: `Cloud migration remains one of the highest-leverage investments an enterprise can make, but the path from legacy infrastructure to a modern cloud estate is rarely linear. Successful programs start with a clear-eyed assessment of workloads, dependencies, and business risk.

A phased migration — rehost, then replatform, then refactor where it matters — lets teams show early wins while building the skills needed for deeper modernization. Governance, cost management, and security need to be designed in from the first migration wave, not retrofitted later.

The organizations getting the most value from cloud are the ones treating migration as a forcing function for broader modernization: simplifying architectures, retiring technical debt, and building platform teams that make the cloud a genuine accelerant for the business.`,
  security: `Zero trust has moved from buzzword to baseline expectation for enterprise security architecture. The core idea — never trust, always verify, regardless of network location — reshapes how organizations think about identity, access, and segmentation.

Implementing zero trust is a multi-year journey that touches identity providers, network architecture, endpoint management, and application access patterns. Enterprises that succeed treat it as a strategic program with executive sponsorship, not a single product purchase.

Getting the fundamentals right — strong identity, least-privilege access, and continuous verification — pays dividends far beyond compliance, reducing the blast radius of any single compromised credential and giving security teams far better visibility into what's actually happening across the estate.`,
  data: `Data-driven decision making is only as good as the data platform underneath it. Many enterprises still struggle with fragmented data, inconsistent definitions, and slow access to trustworthy information — the very problems a modern data platform is meant to solve.

A well-designed data architecture balances centralized governance with decentralized ownership, giving domain teams the autonomy to move fast while maintaining consistent definitions and quality standards across the business.

The payoff is real: faster, more confident decisions, better customer experiences, and the foundation needed to responsibly scale AI and analytics use cases across the enterprise.`,
};

function makeContentItem(
  id: string,
  title: string,
  type: Content["type"],
  status: Content["status"],
  authorId: string,
  categoryId: string,
  campaignId: string | undefined,
  tagIds: string[],
  body: string,
  daysAgoCreated: number,
  daysAgoUpdated: number,
  extra: Partial<Content> = {}
): Content {
  const now = Date.now();
  const created = new Date(now - daysAgoCreated * 86400000).toISOString();
  const updated = new Date(now - daysAgoUpdated * 86400000).toISOString();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const base: Content = {
    id,
    title,
    slug,
    type,
    status,
    body,
    excerpt: body.slice(0, 160).trim() + "…",
    authorId,
    campaignId,
    categoryId,
    tagIds,
    metadata: metadata(title, body.slice(0, 155).trim(), tagIds.slice(0, 3).map(() => "")),
    typeFields: {},
    createdAt: created,
    updatedAt: updated,
    versionCount: 1,
    ...extra,
  };
  return base;
}

function buildContent(): Content[] {
  const items: Content[] = [
    makeContentItem(
      cid("ai-strategy"),
      "AI Transformation Strategy for Modern Enterprises",
      "article",
      "published",
      uid("sarthak"),
      "cat_ai",
      "cmp_ai_transform",
      ["tag_0", "tag_1", "tag_2"],
      lorem.ai,
      40,
      12,
      {
        subtitle: "A practical playbook for enterprise AI adoption",
        typeFields: { article: { subtitle: "A practical playbook for enterprise AI adoption", category: "Artificial Intelligence" } },
        metadata: metadata(
          "AI Transformation Strategy for Modern Enterprises",
          "Explore how organizations can use AI to improve operational efficiency, customer experience, and data-driven decision making.",
          ["AI", "Digital Transformation", "Enterprise Technology"]
        ),
        publishedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        versionCount: 3,
        quality: {
          score: 91,
          ruleScore: 95,
          aiScore: 88,
          generatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          checks: [
            { id: "q1", label: "Title present", passed: true, severity: "info", source: "rule" },
            { id: "q2", label: "Meta description present", passed: true, severity: "info", source: "rule" },
            { id: "q3", label: "Image alt text present", passed: true, severity: "info", source: "rule" },
            { id: "q4", label: "Readability is strong", passed: true, severity: "info", source: "ai" },
            { id: "q5", label: "CTA could be stronger", passed: false, severity: "warning", source: "ai" },
            { id: "q6", label: "Paragraph 4 is too long", passed: false, severity: "warning", source: "ai" },
          ],
        },
      }
    ),
    makeContentItem(
      cid("cloud-guide"),
      "Cloud Migration Guide for Regulated Industries",
      "article",
      "in_review",
      uid("priya"),
      "cat_cloud",
      "cmp_cloud_migration",
      ["tag_5", "tag_2"],
      lorem.cloud,
      10,
      1,
      {
        submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        versionCount: 2,
        quality: {
          score: 84,
          ruleScore: 90,
          aiScore: 80,
          generatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          checks: [
            { id: "q1", label: "Title present", passed: true, severity: "info", source: "rule" },
            { id: "q2", label: "Meta description present", passed: true, severity: "info", source: "rule" },
            { id: "q3", label: "Image alt text present", passed: false, severity: "warning", source: "rule" },
            { id: "q4", label: "Structure is clear", passed: true, severity: "info", source: "ai" },
          ],
        },
      }
    ),
    makeContentItem(
      cid("zero-trust"),
      "Why Zero Trust Is Now Table Stakes",
      "article",
      "changes_requested",
      uid("sarthak"),
      "cat_cyber",
      "cmp_secure_enterprise",
      ["tag_6"],
      lorem.security,
      15,
      3,
      { versionCount: 2 }
    ),
    makeContentItem(
      cid("data-platform"),
      "Building a Modern Data Platform",
      "article",
      "draft",
      uid("priya"),
      "cat_data",
      undefined,
      ["tag_4"],
      lorem.data,
      3,
      1,
      { versionCount: 1 }
    ),
    makeContentItem(
      cid("ai-fsi-case"),
      "How a Global Bank Cut Fraud Losses 34% with AI",
      "case_study",
      "published",
      uid("sarthak"),
      "cat_ai",
      "cmp_ai_transform",
      ["tag_0", "tag_9"],
      "A global bank partnered with our team to modernize its fraud detection stack using machine learning models trained on transaction-level data.",
      60,
      20,
      {
        typeFields: {
          case_study: {
            client: "Global Financial Services Firm",
            industry: "Banking",
            challenge: "Legacy rules-based fraud detection produced high false-positive rates and missed sophisticated fraud patterns.",
            solution: "Deployed an ML-based fraud scoring pipeline integrated into the real-time transaction flow, with human-in-the-loop review for edge cases.",
            results: "34% reduction in fraud losses, 28% reduction in false positives, 4-week faster investigation cycle time.",
          },
        },
        publishedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        versionCount: 4,
      }
    ),
    makeContentItem(
      cid("gtm-summit"),
      "GTM Innovation Summit 2026",
      "event",
      "published",
      uid("priya"),
      "cat_industry",
      "cmp_ai_transform",
      ["tag_1"],
      "Join GTM and technology leaders for a day of keynotes, workshops, and networking focused on AI-powered growth strategy.",
      25,
      8,
      {
        typeFields: {
          event: {
            eventDate: "2026-11-04",
            location: "Chicago, IL",
            speaker: "Morgan Blake, VP Platform Strategy",
            registrationUrl: "https://example.com/register/gtm-summit",
          },
        },
        publishedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        versionCount: 2,
      }
    ),
    makeContentItem(
      cid("campaign-cloud-q3"),
      "Cloud Modernization Q3 Launch Campaign",
      "campaign",
      "approved",
      uid("sarthak"),
      "cat_cloud",
      "cmp_cloud_migration",
      ["tag_5"],
      "A cross-channel campaign introducing our new cloud modernization assessment offer to mid-market IT leaders.",
      6,
      1,
      {
        typeFields: {
          campaign: {
            targetAudience: "Mid-market IT Directors and VPs of Infrastructure",
            cta: "Book a free cloud readiness assessment",
            ctaUrl: "https://example.com/cloud-assessment",
            startDate: "2026-07-01",
            endDate: "2026-09-30",
          },
        },
        versionCount: 1,
      }
    ),
    makeContentItem(
      cid("campaign-ai-transform-launch"),
      "AI Transformation Assessment Campaign",
      "campaign",
      "published",
      uid("sarthak"),
      "cat_ai",
      "cmp_ai_transform",
      ["tag_0", "tag_1"],
      "A campaign inviting enterprise IT and data leaders to a complimentary AI readiness assessment, covering data maturity, use-case prioritization, and governance.",
      18,
      5,
      {
        typeFields: {
          campaign: {
            targetAudience: "VPs of Data & AI, CIOs at enterprise accounts",
            cta: "Book your AI readiness assessment",
            ctaUrl: "https://example.com/ai-assessment",
            startDate: "2026-01-15",
            endDate: "2026-06-30",
          },
        },
        publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        versionCount: 2,
      }
    ),
    makeContentItem(
      cid("sustainability"),
      "Sustainable IT: Measuring the Carbon Cost of Cloud",
      "article",
      "draft",
      uid("priya"),
      "cat_industry",
      undefined,
      ["tag_8"],
      "As enterprises scale cloud usage, measuring and reducing the associated carbon footprint is becoming a board-level concern.",
      2,
      0.5,
      { versionCount: 1 }
    ),
    makeContentItem(
      cid("cx-report"),
      "2026 Customer Experience Benchmark Report",
      "article",
      "in_review",
      uid("sarthak"),
      "cat_data",
      "cmp_ai_transform",
      ["tag_7", "tag_4"],
      lorem.data,
      5,
      0.2,
      { submittedAt: new Date(Date.now() - 0.2 * 86400000).toISOString(), versionCount: 1 }
    ),
    makeContentItem(
      cid("healthcare-case"),
      "Reducing Patient Wait Times with Predictive Scheduling",
      "case_study",
      "archived",
      uid("priya"),
      "cat_ai",
      undefined,
      ["tag_0"],
      "A regional healthcare network used predictive scheduling models to reduce average patient wait times by 22%.",
      120,
      90,
      {
        typeFields: {
          case_study: {
            client: "Regional Healthcare Network",
            industry: "Healthcare",
            challenge: "Manual scheduling led to long patient wait times and uneven provider utilization.",
            solution: "Implemented a predictive scheduling model that forecasts no-show risk and optimizes appointment slotting.",
            results: "22% reduction in average wait time, 15% improvement in provider utilization.",
          },
        },
        archivedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 110 * 86400000).toISOString(),
        versionCount: 2,
      }
    ),
  ];
  return items;
}

function buildVersions(content: Content[]): ContentVersion[] {
  const versions: ContentVersion[] = [];
  for (const c of content) {
    const count = c.versionCount;
    for (let v = 1; v <= count; v++) {
      versions.push({
        id: `ver_${c.id}_${v}`,
        contentId: c.id,
        versionNumber: v,
        title: v === count ? c.title : `${c.title} (draft v${v})`,
        body: c.body,
        metadata: c.metadata,
        createdBy: c.authorId,
        createdAt: new Date(new Date(c.createdAt).getTime() + (v - 1) * 86400000).toISOString(),
        note: v === 1 ? "Initial draft" : v === count ? "Latest revision" : `Revision ${v}`,
      });
    }
  }
  return versions;
}

function buildReviews(content: Content[]): Review[] {
  const reviews: Review[] = [];
  const reviewer = uid("rahul");
  const changesRequested = content.find((c) => c.status === "changes_requested");
  if (changesRequested) {
    reviews.push({
      id: `rev_${changesRequested.id}_1`,
      contentId: changesRequested.id,
      reviewerId: reviewer,
      decision: "changes_requested",
      comments: "Strong point of view, but the middle section needs a concrete customer example and the CTA should link to the zero trust assessment page.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    });
  }
  const published = content.filter((c) => c.status === "published");
  for (const c of published) {
    reviews.push({
      id: `rev_${c.id}_1`,
      contentId: c.id,
      reviewerId: reviewer,
      decision: "approved",
      comments: "Looks great — approved for publication.",
      createdAt: c.publishedAt ?? c.updatedAt,
    });
  }
  return reviews;
}

function buildMedia(): MediaAsset[] {
  const now = Date.now();
  const items: { name: string; type: MediaAsset["type"]; mime: string; alt: string; tags: string[]; campaign?: string }[] = [
    { name: "ai-strategy-banner.png", type: "image", mime: "image/png", alt: "Abstract network graphic representing AI transformation", tags: ["AI", "Banner"], campaign: "cmp_ai_transform" },
    { name: "cloud-migration-hero.jpg", type: "image", mime: "image/jpeg", alt: "Cloud infrastructure diagram over a city skyline", tags: ["Cloud", "Hero"], campaign: "cmp_cloud_migration" },
    { name: "gtm-summit-2026.png", type: "image", mime: "image/png", alt: "GTM Innovation Summit 2026 event graphic", tags: ["Event"] },
    { name: "fraud-case-study-chart.png", type: "image", mime: "image/png", alt: "Bar chart showing 34% reduction in fraud losses", tags: ["Case Study", "Chart"] },
    { name: "zero-trust-whitepaper.pdf", type: "document", mime: "application/pdf", alt: "Zero Trust Architecture Whitepaper", tags: ["Security", "Whitepaper"], campaign: "cmp_secure_enterprise" },
    { name: "cx-benchmark-report.pdf", type: "document", mime: "application/pdf", alt: "2026 Customer Experience Benchmark Report", tags: ["Data", "Report"] },
    { name: "cloud-assessment-explainer.mp4", type: "video", mime: "video/mp4", alt: "Explainer video for the cloud readiness assessment", tags: ["Cloud", "Video"], campaign: "cmp_cloud_migration" },
    { name: "healthcare-case-photo.jpg", type: "image", mime: "image/jpeg", alt: "Clinician reviewing a patient schedule on a tablet", tags: ["Healthcare"] },
];
  return items.map((it, i) => ({
    id: `med_${i}`,
    filename: it.name,
    url: `/media/${it.name}`,
    type: it.type,
    mimeType: it.mime,
    size: 120000 + i * 45000,
    altText: it.alt,
    description: undefined,
    tags: it.tags,
    campaignId: it.campaign,
    uploadedBy: i % 2 === 0 ? uid("sarthak") : uid("priya"),
    uploadedAt: new Date(now - (30 - i * 3) * 86400000).toISOString(),
    width: it.type === "image" ? 1600 : undefined,
    height: it.type === "image" ? 900 : undefined,
  }));
}

function buildAuditLog(content: Content[]): AuditLogEntry[] {
  const log: AuditLogEntry[] = [];
  let t = Date.now() - 45 * 86400000;
  const push = (userId: string, action: string, c: Content, detail?: string) => {
    log.push({
      id: `aud_${log.length}`,
      userId,
      action,
      entityType: "content",
      entityId: c.id,
      entityLabel: c.title,
      detail,
      createdAt: new Date(t).toISOString(),
    });
    t += 3600 * 1000 * (6 + Math.random() * 30);
  };

  const ai = content.find((c) => c.id === cid("ai-strategy"))!;
  push(uid("sarthak"), "created", ai);
  push(uid("sarthak"), "ai_generated_metadata", ai, "Generated SEO metadata and tags via AI Assistant");
  push(uid("sarthak"), "submitted_for_review", ai);
  push(uid("rahul"), "approved", ai);
  push(uid("sarthak"), "published", ai);

  const zt = content.find((c) => c.id === cid("zero-trust"))!;
  push(uid("sarthak"), "created", zt);
  push(uid("sarthak"), "submitted_for_review", zt);
  push(uid("rahul"), "requested_changes", zt, "Needs a concrete customer example and stronger CTA");

  const cg = content.find((c) => c.id === cid("cloud-guide"))!;
  push(uid("priya"), "created", cg);
  push(uid("priya"), "ai_generated_summary", cg);
  push(uid("priya"), "submitted_for_review", cg);

  const cc = content.find((c) => c.id === cid("campaign-cloud-q3"))!;
  push(uid("sarthak"), "created", cc);
  push(uid("sarthak"), "submitted_for_review", cc);
  push(uid("elena"), "approved", cc);

  log.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return log;
}

function buildAnalytics(content: Content[]): ContentAnalytics[] {
  const published = content.filter((c) => c.status === "published" || c.status === "archived");
  return published.map((c, i) => {
    const days = 14;
    const series = Array.from({ length: days }).map((_, d) => {
      const dayDate = new Date(Date.now() - (days - d) * 86400000);
      const base = 200 + i * 90;
      const noise = Math.round(Math.sin(d / 2 + i) * 40 + Math.random() * 30);
      const views = Math.max(10, base + noise);
      const clicks = Math.round(views * (0.18 + i * 0.01));
      const ctaClicks = Math.round(clicks * 0.35);
      const conversions = Math.round(ctaClicks * 0.12);
      return {
        date: dayDate.toISOString().slice(0, 10),
        views,
        clicks,
        ctaClicks,
        conversions,
      };
    });
    const totalViews = series.reduce((s, p) => s + p.views, 0);
    const totalClicks = series.reduce((s, p) => s + p.clicks, 0);
    const totalCtaClicks = series.reduce((s, p) => s + p.ctaClicks, 0);
    const totalConversions = series.reduce((s, p) => s + p.conversions, 0);
    return {
      contentId: c.id,
      totalViews,
      totalClicks,
      totalCtaClicks,
      totalConversions,
      engagementRate: Math.round((totalClicks / totalViews) * 1000) / 10,
      series,
    };
  });
}

export function seedDatabase(): Database {
  const content = buildContent();
  return {
    users,
    content,
    versions: buildVersions(content),
    reviews: buildReviews(content),
    categories,
    tags,
    campaigns,
    media: buildMedia(),
    auditLog: buildAuditLog(content),
    analytics: buildAnalytics(content),
  };
}
