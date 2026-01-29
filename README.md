# Blackjack Pro 🃏

Play here : https://blackjack-iota-blue.vercel.app/

<img width="1209" height="713" alt="image" src="https://github.com/user-attachments/assets/bfcc6e58-9dfc-4bf7-88c6-cf0e9b5a3426" />

A high-stakes, premium Blackjack experience built with React, Tailwind CSS. This application offers a professional casino-grade simulation with smooth animations, realistic sound effects, and intelligent strategic advice.

## ✨ Features

- **Professional Rules**: 
  - Blackjack pays 3:2.
  - Dealer stands on 17.
  - Support for Splitting pairs and Doubling Down.
- **AI Strategic Advisor**: Powered by **Gemini 3 Flash**, get real-time basic strategy advice based on your current hand and the dealer's up-card.
- **Career Stats**: Persistent tracking of your wins, losses, win rate, net profit, and lifetime highest balance via `localStorage`.
- **Immersive UI**: 
  - Realistic 3D card flip animations.
  - Dynamic bet stacks that visually grow as you wager.
  - Haptic-inspired sound effects for chips and card dealing.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop play.

## 🛠 Tech Stack

- **Frontend**: React (ESM)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (@google/genai)
- **Audio**: Custom SoundService with pre-loaded assets.

## 🕹 How to Play

1. **Place Your Bet**: Select chip values from the bottom tray to add to your stack.
2. **Deal**: Hit the 'DEAL' button to start the round.
3. **Decide**:
   - **Hit**: Take another card.
   - **Stand**: Keep your current total and end your turn.
   - **Double**: Double your bet, take exactly one more card, and stand.
   - **Split**: If you have a pair, split them into two separate hands (requires matching bet).
4. **Consult the AI**: Stuck on a 16 vs a Dealer 7? Click the "Advice" button in the AI Strat panel for a calculated recommendation.
5. **Outcome**: The game automatically handles dealer turns and payouts.

## 📜 House Rules

- **Deck**: Played with a single deck that reshuffles when fewer than 15 cards remain.
- **Natural Blackjack**: An Ace and a 10-value card on the deal. Pays 1.5x the bet.
- **Push**: If scores are equal, your bet is returned.
- **Bust**: Going over 21 results in an immediate loss.

---

*Note: This is a simulation for entertainment purposes. No real currency is used or can be won.*
