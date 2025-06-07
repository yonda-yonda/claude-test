import React, { useState } from 'react';
import './MoveInput.css';

interface MoveInputProps {
  onMoveSubmit: (moveString: string) => void;
  disabled?: boolean;
  lastMove?: string;
}

export const MoveInput: React.FC<MoveInputProps> = ({
  onMoveSubmit,
  disabled = false,
  lastMove
}) => {
  const [moveInput, setMoveInput] = useState('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moveInput.trim() && !disabled) {
      onMoveSubmit(moveInput.trim());
      setMoveHistory(prev => [...prev, moveInput.trim()]);
      setMoveInput('');
    }
  };

  const handleClear = () => {
    setMoveInput('');
  };

  const handleHistoryClick = (move: string) => {
    setMoveInput(move);
  };

  const exampleMoves = [
    { move: 'い↑B3B2', description: 'いなだをB3からB2に移動' },
    { move: 'ま↑B4A3', description: 'まぐろをB4からA3に移動' },
    { move: 'い↑A3★', description: '手ゴマのいなだをA3に配置' }
  ];

  return (
    <div className="move-input-container">
      <div className="move-input-section">
        <h3>手の入力</h3>
        <form onSubmit={handleSubmit} className="move-form">
          <div className="input-group">
            <input
              type="text"
              value={moveInput}
              onChange={(e) => setMoveInput(e.target.value)}
              placeholder="例: い↑B3B2"
              className="move-input"
              disabled={disabled}
            />
            <button
              type="submit"
              className="submit-button"
              disabled={disabled || !moveInput.trim()}
            >
              実行
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              disabled={disabled}
            >
              クリア
            </button>
          </div>
        </form>

        {lastMove && (
          <div className="last-move">
            <span className="label">前回の手:</span>
            <span className="move">{lastMove}</span>
          </div>
        )}
      </div>

      <div className="examples-section">
        <h4>入力例</h4>
        <div className="examples-list">
          {exampleMoves.map((example, index) => (
            <div
              key={index}
              className="example-item"
              onClick={() => !disabled && handleHistoryClick(example.move)}
            >
              <code className="example-move">{example.move}</code>
              <span className="example-description">{example.description}</span>
            </div>
          ))}
        </div>
      </div>

      {moveHistory.length > 0 && (
        <div className="history-section">
          <h4>手の履歴</h4>
          <div className="history-list">
            {moveHistory.slice(-5).map((move, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => !disabled && handleHistoryClick(move)}
              >
                <span className="history-number">{moveHistory.length - 4 + index}.</span>
                <code className="history-move">{move}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};