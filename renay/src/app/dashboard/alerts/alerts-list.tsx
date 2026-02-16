import { AlertTriangle, ChevronRight, Clock, XCircle } from "lucide-react";
import Link from "next/link";

type Alert = {
  type: "expired" | "expiring_soon" | "missing";
  subId: string;
  subName: string;
  validUntil: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="rounded-xl border bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
        <h2 className="font-semibold text-sm flex items-center gap-1.5"><AlertTriangle className="size-3.5" /> Alerts</h2>
        {alerts.length > 0 && (
          <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
          No alerts.
        </p>
      ) : (
        <div className="divide-y">
          {alerts.map((a, i) => (
            <Link
              key={i}
              href={`/subs/${a.subId}`}
              className="px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors"
            >
              {a.type === "expiring_soon" ? (
                <Clock className="size-4 text-yellow-500 mt-0.5 shrink-0" />
              ) : a.type === "expired" ? (
                <XCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug">{a.subName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.type === "expiring_soon"
                    ? `AVS expiring soon${a.validUntil ? ` — ${formatDate(a.validUntil)}` : ""}`
                    : a.type === "expired"
                    ? `AVS expired${a.validUntil ? ` — ${formatDate(a.validUntil)}` : ""}`
                    : "No AVS document"}
                </p>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground shrink-0 self-center" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
