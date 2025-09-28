import React, { useState, useEffect, useRef } from 'react';
import firebaseService from '../../services/firebaseService';
import gameStatsService from '../../services/gameStatsService';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onGameEnd?: (score: number, moves: number) => void;
  sessionId?: string;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameEnd, sessionId }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('Player');
  const [currentTime, setCurrentTime] = useState(0);
  
  // Use ref to track flipped cards to avoid stale closures
  const flippedCardsRef = useRef<number[]>([]);

  // Card symbols (using emojis for now)
  const symbols = ['🎮', '🎯', '🎨', '🎪', '🎭', '🎸', '🎲', '🎊', '🎈'];

  // Send match updates to controllers
  const sendMatchUpdate = async (matchedCardIds: number[]) => {
    try {
      await firebaseService.sendInteraction('match-update', {
        matchedCards: matchedCardIds,
        timestamp: Date.now()
      });
      console.log('🔄 Match update sent to controllers:', matchedCardIds);
    } catch (error) {
      console.error('❌ Failed to send match update:', error);
    }
  };

  // Initialize game
  const initializeGame = () => {
    const gameSymbols = symbols.slice(0, 9); // Use 9 symbols for 18 cards (9 pairs)
    const cardPairs = [...gameSymbols, ...gameSymbols]; // Create pairs - each symbol appears twice
    
    // Shuffle the symbols, then assign sequential IDs
    const shuffledSymbols = cardPairs.sort(() => Math.random() - 0.5);
    const shuffledCards = shuffledSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }));

    console.log('🃏 Game initialized with cards:', shuffledCards.map(c => `${c.id}:${c.symbol}`));
    
    // Verify we have exactly 2 of each symbol
    const symbolCounts = shuffledCards.reduce((counts, card) => {
      counts[card.symbol] = (counts[card.symbol] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    console.log('🎯 Symbol counts:', symbolCounts);

    setCards(shuffledCards);
    flippedCardsRef.current = [];
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameStarted(true);
    setGameWon(false);
    setGameStartTime(Date.now());
  };

  // Handle card click (will be triggered by mobile controller)
  const handleCardClick = (cardId: number) => {
    console.log('🃏 handleCardClick called with cardId:', cardId, 'total cards:', cards.length);
    
    // Validate cardId
    if (cardId < 0 || cardId >= cards.length || !cards[cardId]) {
      console.error('❌ Invalid cardId:', cardId, 'cards available:', cards.length);
      return;
    }
    
    if (flippedCardsRef.current.length >= 2) {
      console.log('🚫 Cannot flip more cards, already have 2 flipped:', flippedCardsRef.current);
      return;
    }
    if (cards[cardId].isFlipped || cards[cardId].isMatched) {
      console.log('🚫 Card already flipped or matched:', cardId, cards[cardId]);
      return;
    }
    // Prevent clicking the same card twice
    if (flippedCardsRef.current.includes(cardId)) {
      console.log('🚫 Card already in flipped list:', cardId, flippedCardsRef.current);
      return;
    }

    const newFlippedCards = [...flippedCardsRef.current, cardId];
    flippedCardsRef.current = newFlippedCards;
    setFlippedCards(newFlippedCards);
    console.log('📝 Updated flippedCards:', newFlippedCards);

    // Flip the card
    setCards(prev => {
      const newCards = prev.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      );
      console.log('🔄 Cards after flip:', newCards.filter(c => c.isFlipped).map(c => `${c.id}:${c.symbol}`));
      return newCards;
    });

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards[firstCardId];
      const secondCard = cards[secondCardId];

      console.log('🃏 Checking match:', firstCard.symbol, 'vs', secondCard.symbol);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        console.log('✅ Match found!');
        setTimeout(() => {
          setCards(prev => {
            const newCards = prev.map(card => 
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isMatched: true, isFlipped: false }
                : card
            );
            
            // Send match update to controllers
            const allMatchedCardIds = newCards.filter(c => c.isMatched).map(c => c.id);
            if (sessionId) {
              sendMatchUpdate(allMatchedCardIds);
            }
            
            return newCards;
          });
          setMatchedPairs(prev => prev + 1);
          flippedCardsRef.current = [];
          setFlippedCards([]);
          console.log('✅ Match completed, cleared flippedCards');
        }, 500);
      } else {
        // No match - flip back after delay
        console.log('❌ No match, flipping back in 1 second');
        setTimeout(() => {
          console.log('🔄 Flipping cards back:', firstCardId, secondCardId);
          setCards(prev => prev.map(card => {
            if (card.id === firstCardId || card.id === secondCardId) {
              console.log('🔄 Flipping card', card.id, 'from flipped:', card.isFlipped, 'to false');
              return { ...card, isFlipped: false };
            }
            return card;
          }));
          flippedCardsRef.current = [];
          setFlippedCards([]);
          console.log('❌ No match completed, cleared flippedCards');
        }, 1000);
      }
    }
  };

  // Check for game win
  useEffect(() => {
    if (matchedPairs === 9 && gameStarted) {
      setGameWon(true);
      const timeElapsed = Math.round((Date.now() - gameStartTime) / 1000);
      const score = calculateScore();
      
      // Record game stats
      gameStatsService.recordGame(currentPlayer, 'memory', score, moves, timeElapsed);
      
      onGameEnd?.(score, moves);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedPairs, gameStarted]);

  const calculateScore = () => {
    // Score based on moves (fewer moves = higher score)
    const baseScore = 1000;
    const penalty = Math.max(0, moves - 18) * 10; // Minimum 18 moves for perfect game
    return Math.max(100, baseScore - penalty);
  };

  // Auto-start game when component mounts
  useEffect(() => {
    initializeGame();
    
    // Initialize Firebase session for main display
    if (sessionId) {
      console.log('🎮 Main display initializing Firebase with session:', sessionId);
      firebaseService.initializeSession(sessionId, 'MainDisplay', 'main-display');
    } else {
      console.log('❌ No session ID provided to MemoryGame');
    }
    
    return () => {
      firebaseService.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up Firebase listener after cards are initialized
  useEffect(() => {
    if (gameStarted && cards.length > 0 && sessionId) {
      console.log('🔥 Setting up Firebase listener now that game is ready');
      
      const unsubscribe = firebaseService.onNewInteractions((interaction) => {
        console.log('🎮 Main display received interaction:', interaction);
        if (interaction.action === 'memory-card-select') {
          const cardPosition = interaction.data.cardPosition;
          console.log('🃏 Card selected:', cardPosition, 'by', interaction.playerName, 'cards length:', cards.length);
          console.log('🎯 Card at position', cardPosition, ':', cards[cardPosition]?.symbol, 'isFlipped:', cards[cardPosition]?.isFlipped);
          setCurrentPlayer(interaction.playerName);
          
          // Use setTimeout to ensure state is consistent
          setTimeout(() => {
            console.log('🎯 Calling handleCardClick with:', cardPosition);
            handleCardClick(cardPosition);
          }, 50);
        }
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, cards.length, sessionId]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameWon) {
      const timer = setInterval(() => {
        setCurrentTime(Math.round((Date.now() - gameStartTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameWon, gameStartTime]);

  if (!gameStarted) {
    return (
      <div style={{
        backgroundColor: '#aedfff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <button
          onClick={initializeGame}
          style={{
            backgroundColor: '#347ee1',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            fontSize: '24px',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          Start Memory Game
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#aedfff',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Game Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#2c5aa0'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>Memory Game</h1>
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', fontSize: '1.2rem' }}>
          <div>Player: {currentPlayer}</div>
          <div>Time: {currentTime}s</div>
          <div>Moves: {moves}</div>
          <div>Pairs: {matchedPairs}/9</div>
        </div>
      </div>

      {/* Game Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '15px',
        maxWidth: '800px',
        width: '100%',
        aspectRatio: '2/1'
      }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              backgroundColor: '#347ee1',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              position: 'relative',
              minHeight: '100px',
              border: card.isMatched ? '3px solid #28a745' : '3px solid transparent',
              boxShadow: card.isMatched ? '0 0 20px rgba(40, 167, 69, 0.5)' : '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            {/* Card Back */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              backgroundColor: '#347ee1',
              color: 'white',
              fontSize: '1.5rem'
            }}>
              ?
            </div>
            
            {/* Card Front */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#347ee1'
            }}>
              {card.symbol}
            </div>
          </div>
        ))}
      </div>

      {/* Game Win Message */}
      {gameWon && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: '#347ee1'
          }}>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 20px 0' }}>🎉 You Won!</h2>
            <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>Moves: {moves}</p>
            <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>Score: {calculateScore()}</p>
            <button
              onClick={initializeGame}
              style={{
                backgroundColor: '#347ee1',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                fontSize: '1.1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        color: '#2c5aa0',
        fontSize: '1.1rem'
      }}>
        Use your phone to select cards and find matching pairs!
      </div>
    </div>
  );
};

export default MemoryGame;