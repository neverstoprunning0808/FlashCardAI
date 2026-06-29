"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insertDeck, updateDeck, deleteDeck, getUserDeckCount } from "@/db/queries/decks";

const createDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(255),
  description: z.string().min(1, "Deck description is required").max(1000),
});

const updateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Deck name is required").max(255),
  description: z.string().min(1, "Deck description is required").max(1000),
});

const deleteDeckSchema = z.object({
  deckId: z.number(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createDeckSchema.parse(input);

  // Check if user has unlimited decks feature
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });

  if (!hasUnlimitedDecks) {
    const currentDeckCount = await getUserDeckCount(userId);
    
    if (currentDeckCount >= 2) {
      throw new Error("Free plan limited to 2 decks. Upgrade to Pro for unlimited decks.");
    }
  }

  const deck = await insertDeck({
    userId,
    name: validated.name,
    description: validated.description,
  });

  revalidatePath("/dashboard");
  redirect(`/decks/${deck.id}`);
}

export async function editDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateDeckSchema.parse(input);

  const deck = await updateDeck(validated.deckId, userId, {
    name: validated.name,
    description: validated.description,
  });

  revalidatePath("/dashboard");
  return deck;
}

export async function removeDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteDeckSchema.parse(input);

  await deleteDeck(validated.deckId, userId);

  revalidatePath("/dashboard");
  return { success: true };
}
