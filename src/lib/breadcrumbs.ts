const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  jobs: "Jobs",
  candidates: "Candidates",
  workflows: "Workflows",
  reports: "Reports",
  applications: "Applications",
  settings: "Settings",
  users: "Users",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE = /^[0-9a-f]{16,}$|^\d+$|^[0-9a-f-]{20,}$/i;

function isIdSegment(segment: string): boolean {
  return UUID_RE.test(segment) || ID_RE.test(segment);
}

function formatSegment(segment: string): string {
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface BreadcrumbEntry {
  label: string;
  href: string;
}

export function buildBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbEntry[] = [];
  let href = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    href += `/${segment}`;

    if (isIdSegment(segment)) {
      const parent = segments[i - 1];
      const singular = parent ? parent.replace(/s$/, "") : "item";
      items.push({ label: `${formatSegment(singular)} Details`, href });
    } else {
      const label = SEGMENT_LABELS[segment] ?? formatSegment(segment);
      items.push({ label, href });
    }
  }

  return items;
}
