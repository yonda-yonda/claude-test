import React from 'react';
import type { TetrominoType } from '../types/game';
import { TETROMINO_SHAPES, TETROMINO_COLORS } from '../types/game';
import './NextPiece.css';

interface NextPieceProps {
  type: TetrominoType;
  cellSize?: number;
}

const NextPiece: React.FC<NextPieceProps> = ({ type, cellSize = 20 }) => {
  const shape = TETROMINO_SHAPES[type][0];
  const color = TETROMINO_COLORS[type];
  
  return (
    <div className="next-piece">
      <h3>Next</h3>
      <div className="next-piece-display">
        {shape.map((row, y) => (
          <div key={y} className="next-piece-row">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="next-piece-cell"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? color : 'transparent',
                  border: cell ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextPiece;