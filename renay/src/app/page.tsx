import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Renay
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md text-center">
        Stop chasing subcontractors for insurance docs. Collect, verify, and track compliance documents in one place.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/signup">Start Free Trial</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </main>
  );
}