export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠'
}

export enum Rank {
  TWO = '2', THREE = '3', FOUR = '4', FIVE = '5', SIX = '6',
  SEVEN = '7', EIGHT = '8', NINE = '9', TEN = '10',
  JACK = 'J', QUEEN = 'Q', KING = 'K', ACE = 'A'
}

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isHidden?: boolean;
}

export enum GameStatus {
  BETTING = 'BETTING',
  PLAYER_TURN = 'PLAYER_TURN',
  DEALER_TURN = 'DEALER_TURN',
  GAME_OVER = 'GAME_OVER'
}

export enum Winner {
  NONE = 'NONE',
  PLAYER = 'PLAYER',
  DEALER = 'DEALER',
  PUSH = 'PUSH'
}

export interface PlayerStats {
  wins: number;
  losses: number;
  pushes: number;
  totalGames: number;
  netProfit: number;
  highestBalance: number;
}

// Interface for Gemini AI blackjack advice response
export interface AdviceResponse {
  suggestion: string;
  reasoning: string;
}
