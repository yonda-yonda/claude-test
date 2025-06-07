import React from 'react';
import './GameInfo.css';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
}

const GameInfo: React.FC<GameInfoProps> = ({ score, level, lines }) => {
  return (
    <div className="game-info">
      <div className="info-item">
        <h3>Score</h3>
        <p>{score.toLocaleString()}</p>
      </div>
      <div className="info-item">
        <h3>Level</h3>
        <p>{level}</p>
      </div>
      <div className="info-item">
        <h3>Lines</h3>
        <p>{lines}</p>
      </div>
    </div>
  );
};

export default GameInfo;