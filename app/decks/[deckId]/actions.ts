"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateDeck, deleteDeck, getDeckById } from "@/db/queries/decks";
import { insertCard, insertCards, updateCard, deleteCard } from "@/db/queries/cards";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

// Deck Actions
const updateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Deck name is required").max(255),
  description: z.string().min(1, "Deck description is required").max(1000),
});

const deleteDeckSchema = z.object({
  deckId: z.number(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function editDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateDeckSchema.parse(input);

  const deck = await updateDeck(validated.deckId, userId, {
    name: validated.name,
    description: validated.description,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${validated.deckId}`);
  return deck;
}

export async function removeDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteDeckSchema.parse(input);

  await deleteDeck(validated.deckId, userId);

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${validated.deckId}`);
  return { success: true };
}

// Card Actions
const createCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
});

const updateCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
});

const deleteCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
});

type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;
type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createCardSchema.parse(input);

  // Verify user owns the deck
  await getDeckById(validated.deckId, userId);

  const card = await insertCard({
    deckId: validated.deckId,
    front: validated.front,
    back: validated.back,
  });

  revalidatePath(`/decks/${validated.deckId}`);
  return card;
}

export async function editCard(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateCardSchema.parse(input);

  // Verify user owns the deck
  await getDeckById(validated.deckId, userId);

  const card = await updateCard(validated.cardId, {
    front: validated.front,
    back: validated.back,
  });

  revalidatePath(`/decks/${validated.deckId}`);
  return card;
}

export async function removeCard(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deleteCardSchema.parse(input);

  // Verify user owns the deck
  await getDeckById(validated.deckId, userId);

  await deleteCard(validated.cardId);

  revalidatePath(`/decks/${validated.deckId}`);
  return { success: true };
}

// AI Card Generation
const generateCardsSchema = z.object({
  deckId: z.number(),
});

type GenerateCardsInput = z.infer<typeof generateCardsSchema>;

const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1).describe('The question or prompt on the front of the card'),
      back: z.string().min(1).describe('The answer or explanation on the back of the card'),
    })
  ),
});

export async function generateCardsWithAI(input: GenerateCardsInput) {
  const { has, userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = generateCardsSchema.parse(input);

  // Check if user has AI generation feature
  const hasAIGeneration = has({ feature: 'ai_flashcard_generation' });
  
  if (!hasAIGeneration) {
    throw new Error("AI flashcard generation requires a Pro subscription");
  }

  // Verify user owns the deck and get deck details
  const deck = await getDeckById(validated.deckId, userId);

  try {
    // Generate flashcards with AI
    const { object } = await generateObject({
      model: openai('gpt-5-mini'),
      schema: flashcardSchema,
      prompt: `Generate 20 flashcards about the following topic:
      
Title: ${deck.name}
${deck.description ? `Description: ${deck.description}` : ''}

Create 20 educational flashcards that cover key concepts, facts, and important details about this topic. 
Each card should have a clear question on the front and a concise, accurate answer on the back.
Make sure the cards are varied and cover different aspects of the topic.`,
    });

    // Save generated cards to database
    const savedCards = await insertCards(
      object.cards.map(card => ({
        deckId: validated.deckId,
        front: card.front,
        back: card.back,
      }))
    );

    revalidatePath(`/decks/${validated.deckId}`);
    
    return { 
      success: true, 
      cardsGenerated: savedCards.length,
      cards: savedCards 
    };
  } catch (error) {
    console.error('AI generation failed:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}
