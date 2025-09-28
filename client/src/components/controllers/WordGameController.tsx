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
    <div className="min-h-screen bg-blue-100 flex flex-col p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{playerName}</h2>
        <p className="text-gray-600">Word Challenge</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Challenge:</h3>
        <p className="text-blue-600">{currentPrompt}</p>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg mb-3 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className={`w-full p-4 text-lg font-bold rounded-lg ${
              inputText.trim()
                ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white transition-colors`}
          >
            Submit Word
          </button>
        </div>

        {submittedWords.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3">Your Words:</h4>
            <div className="flex flex-wrap gap-2">
              {submittedWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordGameController;