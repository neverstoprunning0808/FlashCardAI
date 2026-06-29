"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { removeCard } from "./actions";

interface DeleteCardDialogProps {
  cardId: number;
  deckId: number;
}

export function DeleteCardDialog({ 
  cardId,
  deckId 
}: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await removeCard({
        cardId,
        deckId,
      });

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete card");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2 border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Delete Card</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to delete this card? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <DialogFooter className="bg-zinc-900 border-zinc-800">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-900 text-white hover:bg-red-800"
          >
            {isLoading ? "Deleting..." : "Delete Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
