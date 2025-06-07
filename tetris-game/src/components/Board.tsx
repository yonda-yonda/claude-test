import React from 'react';
import type { Tetromino } from '../types/game';
import { TETROMINO_COLORS } from '../types/game';
import './Board.css';

interface BoardProps {
  board: number[][];
  currentPiece: Tetromino | null;
  cellSize?: number;
}

const Board: React.FC<BoardProps> = ({ board, currentPiece, cellSize = 30 }) => {
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      const { shape, position, type } = currentPiece;
      const colorIndex = Object.keys(TETROMINO_COLORS).indexOf(type) + 1;
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
              displayBoard[boardY][boardX] = colorIndex;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };
  
  const getCellColor = (value: number): string => {
    if (value === 0) return 'transparent';
    const types: (keyof typeof TETROMINO_COLORS)[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return TETROMINO_COLORS[types[value - 1]] || 'gray';
  };
  
  return (
    <div className="board">
      {renderBoard().map((row, y) => (
        <div key={y} className="board-row">
          {row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="board-cell"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getCellColor(cell),
                border: cell ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;