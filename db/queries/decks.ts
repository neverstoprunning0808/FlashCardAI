import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Deck = InferSelectModel<typeof decks>;
export type NewDeck = InferInsertModel<typeof decks>;

export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.createdAt));
}

export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(eq(decks.id, deckId))
    .limit(1);

  if (!deck || deck.userId !== userId) {
    throw new Error("Deck not found");
  }

  return deck;
}

export async function getUserDeckCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(decks)
    .where(eq(decks.userId, userId));

  return result[0]?.count ?? 0;
}

export async function insertDeck(data: NewDeck) {
  const [deck] = await db
    .insert(decks)
    .values(data)
    .returning();

  return deck;
}

export async function updateDeck(
  deckId: number,
  userId: string,
  data: Partial<Omit<NewDeck, "userId" | "createdAt">>
) {
  const [deck] = await db
    .update(decks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(decks.id, deckId))
    .returning();

  if (!deck || deck.userId !== userId) {
    throw new Error("Deck not found");
  }

  return deck;
}

export async function deleteDeck(deckId: number, userId: string) {
  const deck = await getDeckById(deckId, userId);

  await db.delete(decks).where(eq(decks.id, deckId));

  return deck;
}
