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
import { Plus } from "lucide-react";
import { createCard } from "./actions";

interface AddCardDialogProps {
  deckId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
  children?: React.ReactNode;
}

export function AddCardDialog({ 
  deckId, 
  variant = "default", 
  size = "default",
  className,
  children 
}: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await createCard({
        deckId,
        front,
        back,
      });

      // Reset form and close dialog
      setFront("");
      setBack("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create card");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={variant} size={size} className={className} />
        }
      >
        {children || (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add New Card</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new flashcard for this deck. Add content for both the front and back of the card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="front" className="text-white">
                Front
              </Label>
              <Textarea
                id="front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                rows={4}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back" className="text-white">
                Back
              </Label>
              <Textarea
                id="back"
                placeholder="Enter the answer or explanation..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
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
              disabled={isLoading}
              className="bg-zinc-700 text-white hover:bg-zinc-600"
            >
              {isLoading ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
