import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId, type Card as CardType } from "@/db/queries/cards";
import { Play, Plus } from "lucide-react";
import { AddCardDialog } from "./add-card-dialog";
import { EditDeckDialog } from "./edit-deck-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { DeleteCardDialog } from "./delete-card-dialog";
import { GenerateAICardsButton } from "./generate-ai-cards-button";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    redirect("/dashboard");
  }

  let deck;
  let cards: CardType[] = [];

  try {
    deck = await getDeckById(deckIdNumber, userId);
    cards = await getCardsByDeckId(deckIdNumber);
  } catch (error) {
    redirect("/dashboard");
  }

  const studyProgress = 0;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="w-full flex items-center justify-between px-16 py-4 border-b border-zinc-800">
        <Link href="/dashboard">
          <h2 className="text-xl font-semibold text-white hover:text-zinc-300 transition-colors cursor-pointer">
            Flash Card AI
          </h2>
        </Link>
        <UserButton />
      </header>
      
      <div className="px-16 py-4  bg-white dark:bg-zinc-900">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{deck.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <main className="flex-1 p-8 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="bg-zinc-900 rounded-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-3">
                  {deck.name}
                </h1>
                {deck.description && (
                  <p className="text-zinc-400 mb-4">
                    {deck.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>{cards.length} cards</span>
                  <span>Created {new Date(deck.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EditDeckDialog 
                  deckId={deckIdNumber}
                  currentName={deck.name}
                  currentDescription={deck.description || undefined}
                />
                <DeleteDeckDialog 
                  deckId={deckIdNumber}
                  deckName={deck.name}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">Study Progress</span>
                <span className="text-sm font-medium text-zinc-400">{studyProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-600 transition-all" 
                  style={{ width: `${studyProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {cards.length === 0 ? (
                <Button 
                  className="flex-1" 
                  size="lg"
                  disabled
                >
                  <Play className="h-5 w-5" />
                  Start Study Session
                </Button>
              ) : (
                <Button 
                  className="flex-1" 
                  size="lg"
                >
                  <Link href={`/decks/${deckId}/study`} className="flex items-center justify-center gap-2">
                    <Play className="h-5 w-5" />
                    Start Study Session
                  </Link>
                </Button>
              )}
              <GenerateAICardsButton deckId={deckIdNumber} />
              <AddCardDialog 
                deckId={deckIdNumber} 
                variant="outline" 
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Add Card
              </AddCardDialog>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Cards
            </h2>
            <AddCardDialog deckId={deckIdNumber} variant="outline" />
          </div>

          {cards.length === 0 ? (
            <div className="bg-zinc-900 rounded-lg p-12 text-center">
              <p className="text-zinc-400 mb-4">
                This deck doesn't have any cards yet. Add your first card to get started.
              </p>
              <AddCardDialog deckId={deckIdNumber} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, index) => (
                <Card key={card.id} className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-zinc-500 mb-4">
                      Card #{index + 1}
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-zinc-400 mb-2">
                        Front
                      </p>
                      <div className="bg-blue-950/50 border border-blue-900/50 rounded px-3 py-2">
                        <p className="text-sm text-blue-200 whitespace-pre-wrap">
                          {card.front}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">
                        Back
                      </p>
                      <div className="bg-blue-950/50 border border-blue-900/50 rounded px-3 py-2">
                        <p className="text-sm text-blue-200 whitespace-pre-wrap">
                          {card.back}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <EditCardDialog
                      cardId={card.id}
                      deckId={deckIdNumber}
                      currentFront={card.front}
                      currentBack={card.back}
                    />
                    <DeleteCardDialog
                      cardId={card.id}
                      deckId={deckIdNumber}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
