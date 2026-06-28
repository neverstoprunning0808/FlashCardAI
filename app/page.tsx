import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="w-full flex items-center justify-end px-16 py-4 border-b border-zinc-200 dark:border-zinc-800 dark:bg-black">
        <Show when="signed-out">
          <div className="flex gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="flex h-10 items-center justify-center rounded-full border border-solid border-black/4 bg-white px-5 text-black transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="flex h-10 items-center justify-center rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      <main className="flex flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            Flash Card AI
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Advance your study with Flashcard platform
          </p>
          <Show when="signed-out">
            <div className="flex gap-4 mt-4">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="flex h-12 items-center justify-center rounded-full border border-solid border-black/4 bg-white px-8 text-black transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </main>
    </div>
  );
}
