import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  LogOut,
  Plus,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: FolderOpen },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/subcontractors", label: "Subs", icon: Users },
  { href: "/dashboard/documents", label: "Docs", icon: FileText },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
];

// ── Static mock data (replace with DB queries later) ──────────────────────────

const stats = [
  { label: "Active Projects", value: 4, icon: FolderOpen },
  { label: "Total Subcontractors", value: 23, icon: Users },
  { label: "Fully Compliant", value: 16, icon: CheckCircle2, color: "text-green-600" },
  { label: "Expiring in 30 days", value: 5, icon: Clock, color: "text-amber-500" },
];

const projects = [
  {
    id: "1",
    name: "Riverside Office Complex",
    status: "warning",
    compliant: 7,
    total: 9,
    deadline: "Mar 15, 2026",
  },
  {
    id: "2",
    name: "Lakewood Residential Units",
    status: "good",
    compliant: 6,
    total: 6,
    deadline: "Apr 2, 2026",
  },
  {
    id: "3",
    name: "Harbor View Renovation",
    status: "danger",
    compliant: 2,
    total: 5,
    deadline: "Feb 28, 2026",
  },
  {
    id: "4",
    name: "Westside Retail Buildout",
    status: "good",
    compliant: 3,
    total: 3,
    deadline: "May 10, 2026",
  },
];

const subcontractors = [
  {
    id: "1",
    name: "Alpine Electrical Co.",
    project: "Riverside Office Complex",
    coi: "valid",
    w9: "valid",
    license: "expiring",
    nextExpiry: "Feb 28, 2026",
  },
  {
    id: "2",
    name: "Summit Plumbing LLC",
    project: "Harbor View Renovation",
    coi: "missing",
    w9: "valid",
    license: "missing",
    nextExpiry: "—",
  },
  {
    id: "3",
    name: "Horizon HVAC Services",
    project: "Riverside Office Complex",
    coi: "expiring",
    w9: "valid",
    license: "valid",
    nextExpiry: "Mar 5, 2026",
  },
  {
    id: "4",
    name: "Clearview Glazing Inc.",
    project: "Lakewood Residential Units",
    coi: "valid",
    w9: "valid",
    license: "valid",
    nextExpiry: "Aug 12, 2026",
  },
  {
    id: "5",
    name: "Bedrock Foundations",
    project: "Harbor View Renovation",
    coi: "missing",
    w9: "missing",
    license: "valid",
    nextExpiry: "—",
  },
];

const alerts = [
  { type: "expiring", message: "Alpine Electrical Co. — License expires Feb 28", project: "Riverside Office Complex" },
  { type: "expiring", message: "Horizon HVAC Services — COI expires Mar 5", project: "Riverside Office Complex" },
  { type: "missing", message: "Summit Plumbing LLC — COI & License missing", project: "Harbor View Renovation" },
  { type: "missing", message: "Bedrock Foundations — COI & W-9 missing", project: "Harbor View Renovation" },
  { type: "expiring", message: "2 more documents expiring within 30 days", project: "Various projects" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig = {
  good: { label: "Compliant", className: "bg-green-100 text-green-700" },
  warning: { label: "Incomplete", className: "bg-amber-100 text-amber-700" },
  danger: { label: "Action needed", className: "bg-red-100 text-red-700" },
};

const docConfig = {
  valid: { icon: CheckCircle2, className: "text-green-600", label: "Valid" },
  expiring: { icon: Clock, className: "text-amber-500", label: "Expiring" },
  missing: { icon: XCircle, className: "text-red-500", label: "Missing" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">

      {/* Sidebar — hidden on mobile, visible md+ */}
      <aside className="hidden md:flex w-60 shrink-0 border-r bg-background flex-col">
        <div className="h-14 flex items-center px-5 border-b">
          <span className="font-bold text-lg tracking-tight">Renay</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navLinks.map((l) => (
            <SidebarLink key={l.href} href={l.href} active={l.href === "/dashboard"}>
              <l.icon className="size-4" /> {l.label}
            </SidebarLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t">
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6 shrink-0">
          <h1 className="font-semibold text-sm text-muted-foreground">Overview</h1>
          <Button size="sm">
            <Plus className="size-4 mr-1.5" /> New Project
          </Button>
        </header>

        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-6 pb-20 md:pb-6">

          {/* Stats — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border bg-background p-3 md:p-4 flex items-center gap-3 md:gap-4">
                <div className="rounded-lg bg-muted p-2 md:p-2.5 shrink-0">
                  <s.icon className={`size-4 md:size-5 ${s.color ?? "text-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl md:text-2xl font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects + Alerts — stacked on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

            {/* Projects */}
            <div className="md:col-span-2 rounded-xl border bg-background flex flex-col">
              <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
                <h2 className="font-semibold text-sm">Projects</h2>
                <Link href="/dashboard/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                  View all <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="divide-y">
                {projects.map((p) => {
                  const s = statusConfig[p.status as keyof typeof statusConfig];
                  return (
                    <div key={p.id} className="px-4 md:px-5 py-3 md:py-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Due {p.deadline}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.className}`}>
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{p.compliant}/{p.total} subs compliant</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 -mr-2">
                          <Send className="size-3" /> Invite sub
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts */}
            <div className="rounded-xl border bg-background flex flex-col">
              <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
                <h2 className="font-semibold text-sm">Alerts</h2>
                <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <div className="divide-y">
                {alerts.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3">
                    {a.type === "expiring" ? (
                      <Clock className="size-4 text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subcontractors table — horizontally scrollable on mobile */}
          <div className="rounded-xl border bg-background">
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
              <h2 className="font-semibold text-sm">Subcontractors</h2>
              <Link href="/dashboard/subcontractors" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                View all <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left px-4 md:px-5 py-3 font-medium">Subcontractor</th>
                    <th className="text-left px-4 md:px-5 py-3 font-medium hidden sm:table-cell">Project</th>
                    <th className="text-center px-3 py-3 font-medium">COI</th>
                    <th className="text-center px-3 py-3 font-medium">W-9</th>
                    <th className="text-center px-3 py-3 font-medium">License</th>
                    <th className="text-left px-4 md:px-5 py-3 font-medium hidden sm:table-cell">Next expiry</th>
                    <th className="px-4 md:px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subcontractors.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 md:px-5 py-3 font-medium text-sm">{sub.name}</td>
                      <td className="px-4 md:px-5 py-3 text-muted-foreground text-xs hidden sm:table-cell">{sub.project}</td>
                      <DocCell status={sub.coi as keyof typeof docConfig} />
                      <DocCell status={sub.w9 as keyof typeof docConfig} />
                      <DocCell status={sub.license as keyof typeof docConfig} />
                      <td className="px-4 md:px-5 py-3 text-xs text-muted-foreground hidden sm:table-cell">{sub.nextExpiry}</td>
                      <td className="px-4 md:px-5 py-3">
                        <Button variant="ghost" size="sm" className="h-7 text-xs whitespace-nowrap">
                          Send reminder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Bottom nav — visible on mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around h-14 px-2 z-10">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
              l.href === "/dashboard"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <l.icon className="size-5" />
            {l.label}
          </Link>
        ))}
      </nav>

    </div>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function DocCell({ status }: { status: keyof typeof docConfig }) {
  const { icon: Icon, className, label } = docConfig[status];
  return (
    <td className="text-center px-4 py-3">
      <span title={label} className="inline-flex justify-center">
        <Icon className={`size-4 ${className}`} />
      </span>
    </td>
  );
}
