import { PricingTable } from "@clerk/nextjs";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="w-full flex items-center justify-between px-16 py-4 border-b border-zinc-200 dark:border-zinc-800 dark:bg-black">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Show when="signed-out">
          <div className="flex gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="flex h-10 items-center justify-center rounded-full border border-solid border-black/4 bg-white px-5 text-black transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      <main className="flex flex-1 flex-col items-center py-16 px-8 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl w-full flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
              Select the perfect plan for your learning needs
            </p>
          </div>
          <div className="mt-8">
            <PricingTable />
          </div>
        </div>
      </main>
    </div>
  );
}
