import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDeckCount, getUserDecks, type Deck } from "@/db/queries/decks";
import { getUserTotalCardCount } from "@/db/queries/cards";
import { CreateDeckDialog } from "./create-deck-dialog";
import { DeckCard } from "./deck-card";

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });

  const [deckCount, totalCards, recentDecks] = await Promise.all([
    getUserDeckCount(userId),
    getUserTotalCardCount(userId),
    getUserDecks(userId).then((decks: Deck[]) => decks.slice(0, 5)),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="w-full flex items-center justify-between px-16 py-4 border-b border-zinc-200 dark:border-zinc-800 dark:bg-black">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Flash Card AI
        </h2>
        <UserButton />
      </header>
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Dashboard
              </h1>
              {hasUnlimitedDecks ? (
                <CreateDeckDialog />
              ) : deckCount >= 2 ? (
                <Link href="/pricing">
                  <Button size="lg">Upgrade to Pro</Button>
                </Link>
              ) : (
                <CreateDeckDialog />
              )}
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Welcome back! Manage your flashcard decks and study sessions.
            </p>
            {!hasUnlimitedDecks && (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Free plan: {deckCount} of 2 decks used. {deckCount >= 2 && (
                  <Link href="/pricing" className="text-blue-600 dark:text-blue-400 underline">
                    Upgrade to Pro for unlimited decks.
                  </Link>
                )}
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Decks</CardTitle>
                <CardDescription>
                  {hasUnlimitedDecks 
                    ? "View and manage your flashcard decks" 
                    : "View and manage your flashcard decks (2 max on Free)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {hasUnlimitedDecks ? deckCount : `${deckCount} / 2`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Cards</CardTitle>
                <CardDescription>
                  Number of flashcards created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCards}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards per Deck</CardTitle>
                <CardDescription>
                  Average cards in each deck
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {deckCount > 0 ? Math.round(totalCards / deckCount) : 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {recentDecks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
                Recent Decks
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentDecks.map((deck: Deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
}
