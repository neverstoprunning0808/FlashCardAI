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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { editDeck } from "./actions";

interface EditDeckDialogProps {
  deckId: number;
  currentName: string;
  currentDescription?: string;
}

export function EditDeckDialog({ 
  deckId, 
  currentName,
  currentDescription 
}: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await editDeck({
        deckId,
        name,
        description,
      });

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deck");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2" />
        }
      >
        <Pencil className="h-4 w-4" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Edit Deck</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update the name and description of your deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Deck Name
              </Label>
              <Textarea
                id="name"
                placeholder="Enter deck name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                rows={2}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter deck description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
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
              type="submit"
              disabled={isLoading || !name.trim() || !description.trim()}
              className="bg-zinc-700 text-white hover:bg-zinc-600"
            >
              {isLoading ? "Updating..." : "Update Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
