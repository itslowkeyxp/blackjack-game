
import { Card, Rank, Suit } from '../types';

export const createDeck = (): Card[] => {
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const ranks = Object.values(Rank);
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      let value: number;
      switch (rank) {
        case Rank.ACE:
          value = 11;
          break;
        case Rank.JACK:
        case Rank.QUEEN:
        case Rank.KING:
        case Rank.TEN:
          value = 10;
          break;
        default:
          value = parseInt(rank, 10);
      }
      deck.push({ suit, rank, value });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const calculateScore = (hand: Card[]): number => {
  let score = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (card.isHidden) continue;
    score += card.value;
    if (card.rank === Rank.ACE) {
      aceCount += 1;
    }
  }

  // Adjust for Aces if score is over 21
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount -= 1;
  }

  return score;
};

export const isBlackjack = (hand: Card[]): boolean => {
  return hand.length === 2 && calculateScore(hand) === 21;
};

export const formatHandForAI = (hand: Card[]): string => {
  return hand.map(c => `${c.rank} of ${c.suit}`).join(', ');
};
