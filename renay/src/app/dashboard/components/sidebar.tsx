"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Users, FolderOpen } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isProjects = pathname.startsWith("/projects");
  const isSubs = pathname.startsWith("/subs");

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r bg-background flex-col">
        <div className="h-14 flex items-center px-5 border-b">
          <span className="font-bold text-lg tracking-tight">Renay</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isDashboard
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
          <Link
            href="/projects"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isProjects
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <FolderOpen className="size-4" /> Projects
          </Link>
          <Link
            href="/subs"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isSubs
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Users className="size-4" /> Subcontractors
          </Link>
        </nav>

        <div className="px-3 py-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around h-14 z-10">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
            isDashboard ? "bg-primary text-primary-foreground rounded-md px-3" : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="size-5" />
          Dashboard
        </Link>
        <Link
          href="/projects"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
            isProjects ? "bg-primary text-primary-foreground rounded-md px-3" : "text-muted-foreground"
          )}
        >
          <FolderOpen className="size-5" />
          Projects
        </Link>
        <Link
          href="/subs"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
            isSubs ? "bg-primary text-primary-foreground rounded-md px-3" : "text-muted-foreground"
          )}
        >
          <Users className="size-5" />
          Subs
        </Link>
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-muted-foreground cursor-pointer"
        >
          <LogOut className="size-5" />
          Sign out
        </button>
      </nav>
    </>
  );
}
