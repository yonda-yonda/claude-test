import React from 'react';
import { Board, Piece, Position } from '../types/boardGame';
import './BoardGameBoard.css';

interface BoardGameBoardProps {
  board: Board;
  onCellClick?: (position: Position) => void;
  selectedPosition?: Position | null;
}

export const BoardGameBoard: React.FC<BoardGameBoardProps> = ({
  board,
  onCellClick,
  selectedPosition
}) => {
  const columns = ['A', 'B', 'C'] as const;
  const rows = [1, 2, 3, 4] as const;

  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      const position: Position = {
        col: columns[col],
        row: rows[row] as 1 | 2 | 3 | 4
      };
      onCellClick(position);
    }
  };

  const isSelected = (row: number, col: number): boolean => {
    if (!selectedPosition) return false;
    return selectedPosition.row === rows[row] && selectedPosition.col === columns[col];
  };

  const renderPiece = (piece: Piece | null): React.ReactNode => {
    if (!piece) return null;
    
    const direction = piece.player === 'first' ? '↑' : '↓';
    const playerClass = piece.player === 'first' ? 'first-player' : 'second-player';
    
    return (
      <div className={`piece ${playerClass}`}>
        <span className="piece-type">{piece.type}</span>
        <span className="piece-direction">{direction}</span>
      </div>
    );
  };

  return (
    <div className="board-game-board">
      <div className="column-labels">
        <div className="row-label"></div>
        {columns.map(col => (
          <div key={col} className="column-label">{col}</div>
        ))}
      </div>
      
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          <div className="row-label">{rows[rowIndex]}</div>
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${isSelected(rowIndex, colIndex) ? 'selected' : ''}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {renderPiece(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};