import React, { useState } from 'react';

interface WordGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
  currentPrompt?: string;
}

const WordGameController: React.FC<WordGameControllerProps> = ({
  playerName,
  sessionId,
  onGameAction,
  currentPrompt = "Enter a word that starts with 'B'"
}) => {
  const [inputText, setInputText] = useState('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  const handleSubmit = () => {
    if (inputText.trim()) {
      const newWord = inputText.trim();
      setSubmittedWords(prev => [...prev, newWord]);
      onGameAction({
        type: 'WORD_SUBMIT',
        word: newWord,
        prompt: currentPrompt,
        timestamp: Date.now()
      });
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="word-game-controller">
      <div className="controller-header">
        <h2>{playerName}</h2>
        <p>Word Challenge</p>
      </div>

      <div className="game-prompt">
        <h3>Current Challenge:</h3>
        <p>{currentPrompt}</p>
      </div>

      <div className="game-controls">
        <div className="input-section">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              marginBottom: '10px'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: inputText.trim() ? '#45b7d1' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Submit Word
          </button>
        </div>
      </div>

      {submittedWords.length > 0 && (
        <div className="submitted-words">
          <h4>Your Words:</h4>
          <div className="word-list">
            {submittedWords.map((word, index) => (
              <span key={index} className="word-tag" style={{
                display: 'inline-block',
                background: '#e1f5fe',
                padding: '5px 10px',
                margin: '2px',
                borderRadius: '15px',
                fontSize: '14px'
              }}>
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordGameController;