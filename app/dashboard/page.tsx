import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDeckCount, getUserDecks, type Deck } from "@/db/queries/decks";
import { getUserTotalCardCount } from "@/db/queries/cards";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

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
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Welcome back! Manage your flashcard decks and study sessions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Decks</CardTitle>
                <CardDescription>
                  View and manage your flashcard decks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{deckCount}</p>
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
                  <Link key={deck.id} href={`/decks/${deck.id}`}>
                    <Card className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{deck.name}</CardTitle>
                        {deck.description && (
                          <CardDescription className="line-clamp-2">
                            {deck.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Created {new Date(deck.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              Quick Actions
            </h2>
            <div className="flex gap-4">
              <Button size="lg">
                Create New Deck
              </Button>
              <Button variant="outline" size="lg">
                Browse Decks
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
