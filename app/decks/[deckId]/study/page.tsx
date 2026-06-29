import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudyCards } from "./study-cards";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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
  let cards;

  try {
    deck = await getDeckById(deckIdNumber, userId);
    cards = await getCardsByDeckId(deckIdNumber);
  } catch (error) {
    redirect("/dashboard");
  }

  if (cards.length === 0) {
    redirect(`/decks/${deckId}`);
  }

  return <StudyCards cards={cards} deckId={deckIdNumber} deckName={deck.name} />;
}
