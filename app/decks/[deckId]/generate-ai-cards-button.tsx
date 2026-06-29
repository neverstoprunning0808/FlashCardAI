"use client";

import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { generateCardsWithAI } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GenerateAICardsButtonProps {
  deckId: number;
}

export function GenerateAICardsButton({ deckId }: GenerateAICardsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateCardsWithAI({ deckId });
      
      if (result.success) {
        toast.success(`Successfully generated ${result.cardsGenerated} flashcards!`);
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate cards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradeClick = () => {
    router.push("/pricing");
  };

  return (
    <>
      <Show
        when={{ feature: "ai_flashcard_generation" }}
        fallback={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleUpgradeClick}
                >
                  <Sparkles className="h-5 w-5" />
                  Generate with AI
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI flashcard generation is a Pro feature</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      >
        <Button
          variant="outline"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles className="h-5 w-5" />
          {isGenerating ? "Generating..." : "Generate with AI"}
        </Button>
      </Show>
    </>
  );
}
