"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeckActions } from "./deck-actions";
import type { Deck } from "@/db/queries/decks";

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <Card className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <Link href={`/decks/${deck.id}`}>
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
      </Link>
      <DeckActions deck={deck} />
    </Card>
  );
}
