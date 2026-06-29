"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronLeft, ChevronRight, RotateCw, X, Shuffle, Check, XCircle } from "lucide-react";
import Link from "next/link";
import type { Card as CardType } from "@/db/queries/cards";

interface StudyCardsProps {
  cards: CardType[];
  deckId: number;
  deckName: string;
}

export function StudyCards({ cards, deckId, deckName }: StudyCardsProps) {
  const [studyCards, setStudyCards] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardAnswers, setCardAnswers] = useState<Record<number, 'correct' | 'incorrect'>>({});

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex + 1) / studyCards.length) * 100;
  
  const correctCount = Object.values(cardAnswers).filter(answer => answer === 'correct').length;
  const incorrectCount = Object.values(cardAnswers).filter(answer => answer === 'incorrect').length;
  const totalAnswered = correctCount + incorrectCount;
  const correctPercentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  
  const currentCardAnswer = cardAnswers[currentCard.id];

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardAnswers({});
  };

  const handleCorrect = () => {
    const cardId = currentCard.id;
    const wasAlreadyAnswered = cardAnswers[cardId] !== undefined;
    
    setCardAnswers(prev => ({
      ...prev,
      [cardId]: 'correct' as const
    }));
    
    if (!wasAlreadyAnswered && currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleIncorrect = () => {
    const cardId = currentCard.id;
    const wasAlreadyAnswered = cardAnswers[cardId] !== undefined;
    
    setCardAnswers(prev => ({
      ...prev,
      [cardId]: 'incorrect' as const
    }));
    
    if (!wasAlreadyAnswered && currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="w-full flex items-center justify-between px-16 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Link href={`/decks/${deckId}`}>
              <X className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {deckName}
            </h2>
            <p className="text-sm text-zinc-400">
              Card {currentIndex + 1} of {studyCards.length}
            </p>
          </div>
        </div>
      </header>

      <div className="px-16 py-4 bg-white dark:bg-zinc-900 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/decks/${deckId}`}>{deckName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Study Session</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">
            {Math.round(progress)}% Complete
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShuffle}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle and Replay
          </Button>
        </div>
      </div>

      <div className="px-16 py-2 bg-white dark:bg-zinc-900">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 flex justify-center p-8 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-6xl">
          <div className="flex items-center gap-6">
            <div className="w-48 flex-shrink-0">
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Tracking</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Answered</span>
                    <span className="text-xs text-zinc-400">{totalAnswered} / {studyCards.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-zinc-300">Correct</span>
                    </div>
                    <span className="text-sm font-semibold text-green-500">{correctCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-zinc-300">Incorrect</span>
                    </div>
                    <span className="text-sm font-semibold text-red-500">{incorrectCount}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Accuracy</span>
                      <span className="text-lg font-bold text-white">{correctPercentage}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-1">
              <Card
                className={`${ isFlipped ? "bg-blue-900" : "bg-fuchsia-900" } border-zinc-800 p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all hover:border-zinc-700`}
                onClick={handleFlip}
              >
                <div className="text-center w-full">
                  <div className="mb-6">
                  <span className={`text-xl text-semibold underline font-normal ${
                        isFlipped ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {isFlipped ? "Answer:" : "Question:"}
                    </span>
                  </div>
                  <p className="text-2xl text-white whitespace-pre-wrap">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>
              </Card>
            </div>

            <div className="w-48 flex-shrink-0">
              {isFlipped && (
                <div className="space-y-3">
                  {currentCardAnswer && (
                    <p className="text-xs text-zinc-400 text-center mb-2">
                      Click to update
                    </p>
                  )}
                  <Button
                    size="lg"
                    onClick={handleCorrect}
                    className={`w-full ${
                      currentCardAnswer === 'correct'
                        ? 'bg-green-700 hover:bg-green-800 ring-2 ring-green-400'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {currentCardAnswer === 'correct' ? 'Correct ✓' : 'Correct'}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleIncorrect}
                    className={`w-full ${
                      currentCardAnswer === 'incorrect'
                        ? 'bg-red-700 hover:bg-red-800 ring-2 ring-red-400'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    {currentCardAnswer === 'incorrect' ? 'Incorrect ✓' : 'Incorrect'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-20">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleFlip}
              className="flex-2"
            >
              <RotateCw className="h-5 w-5 mr-2" />
              Flip Card
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex === studyCards.length - 1}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {currentIndex === studyCards.length - 1 && totalAnswered > 0 && (
            <div className="mt-8">
              <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
                <p className="text-emerald-500 font-semibold text-2xl mb-4">
                  Congratulations! You've reached the end of this deck!
                </p>
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div>
                    <p className="text-sm text-zinc-400">Correct</p>
                    <p className="text-2xl font-bold text-green-500">{correctCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Incorrect</p>
                    <p className="text-2xl font-bold text-red-500">{incorrectCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Accuracy</p>
                    <p className="text-2xl font-bold text-white">{correctPercentage}%</p>
                  </div>
                </div>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href={`/decks/${deckId}`}>
                    Back to Deck
                  </Link>
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
