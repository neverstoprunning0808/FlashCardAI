"use client";

import { EditDeckDialog } from "./edit-deck-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import type { Deck } from "@/db/queries/decks";

interface DeckActionsProps {
  deck: Deck;
}

export function DeckActions({ deck }: DeckActionsProps) {
  return (
    <div className="flex gap-2 px-6 pb-4" onClick={(e) => e.stopPropagation()}>
      <EditDeckDialog deck={deck} />
      <DeleteDeckDialog deck={deck} />
    </div>
  );
}
