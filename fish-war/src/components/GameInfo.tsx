import React from 'react';
import { Player, GameResult } from '../types/boardGame';
import './GameInfo.css';

interface GameInfoProps {
  currentPlayer: Player;
  turn: number;
  gameResult: GameResult | null;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  turn,
  gameResult
}) => {
  const getCurrentPlayerText = () => {
    return currentPlayer === 'first' ? '先手' : '後手';
  };

  const getResultText = () => {
    if (!gameResult) return null;

    switch (gameResult.type) {
      case 'win': {
        const winner = gameResult.winner === 'first' ? '先手' : '後手';
        return (
          <div className="game-result win">
            <h2>🎉 {winner}の勝利！ 🎉</h2>
            <p>{gameResult.reason}</p>
          </div>
        );
      }
      case 'draw':
        return (
          <div className="game-result draw">
            <h2>🤝 引き分け</h2>
            <p>{gameResult.reason}</p>
          </div>
        );
      case 'invalid':
        return (
          <div className="game-result invalid">
            <h2>❌ 無効な手</h2>
            <p>{gameResult.reason}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="game-info">
      <div className="game-status">
        <h2>おさかな対戦</h2>
        <div className="turn-info">
          <div className="turn-number">
            <span className="label">ターン：</span>
            <span className="value">{turn}</span>
          </div>
          <div className={`current-player ${currentPlayer}`}>
            <span className="label">現在の手番：</span>
            <span className="value">{getCurrentPlayerText()}</span>
          </div>
        </div>
      </div>

      {getResultText()}

      <div className="game-rules-summary">
        <h3>ルール概要</h3>
        <ul>
          <li>相手のまぐろを捕獲すると勝利</li>
          <li>自分のまぐろが相手陣地に到達すると勝利</li>
          <li>いなだは相手陣地でぶりに出世</li>
          <li>捕獲したコマは手ゴマとして使用可能</li>
        </ul>
      </div>
    </div>
  );
};