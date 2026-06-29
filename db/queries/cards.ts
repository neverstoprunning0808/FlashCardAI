import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, desc, sql, and, asc } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Card = InferSelectModel<typeof cards>;
export type NewCard = InferInsertModel<typeof cards>;

export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(asc(cards.id));
}

export async function getCardById(cardId: number) {
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export async function getUserTotalCardCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, userId));

  return result[0]?.count ?? 0;
}

export async function insertCard(data: NewCard) {
  const [card] = await db
    .insert(cards)
    .values(data)
    .returning();

  return card;
}

export async function insertCards(data: NewCard[]) {
  if (data.length === 0) return [];

  const insertedCards = await db
    .insert(cards)
    .values(data)
    .returning();

  return insertedCards;
}

export async function updateCard(
  cardId: number,
  data: Partial<Omit<NewCard, "deckId" | "createdAt">>
) {
  const [card] = await db
    .update(cards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cards.id, cardId))
    .returning();

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export async function deleteCard(cardId: number) {
  const card = await getCardById(cardId);

  await db.delete(cards).where(eq(cards.id, cardId));

  return card;
}
