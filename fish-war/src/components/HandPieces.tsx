import React from 'react';
import { HandPieces as HandPiecesType, PieceType, Player } from '../types/boardGame';
import './HandPieces.css';

interface HandPiecesProps {
  handPieces: HandPiecesType;
  currentPlayer: Player;
  selectedHandPiece?: PieceType | null;
  onHandPieceClick?: (piece: PieceType) => void;
}

export const HandPieces: React.FC<HandPiecesProps> = ({
  handPieces,
  currentPlayer,
  selectedHandPiece,
  onHandPieceClick
}) => {
  const renderHandPiece = (piece: PieceType, player: Player, index: number) => {
    const direction = player === 'first' ? '↑' : '↓';
    const playerClass = player === 'first' ? 'first-player' : 'second-player';
    const isSelected = selectedHandPiece === piece && currentPlayer === player;
    const isClickable = currentPlayer === player && onHandPieceClick;

    return (
      <div
        key={`${piece}-${index}`}
        className={`hand-piece ${playerClass} ${isSelected ? 'selected' : ''} ${isClickable ? 'clickable' : ''}`}
        onClick={() => isClickable && onHandPieceClick(piece)}
      >
        <span className="piece-type">{piece}</span>
        <span className="piece-direction">{direction}</span>
      </div>
    );
  };

  return (
    <div className="hand-pieces-container">
      <div className="hand-pieces-section">
        <h3 className="player-label first-player">先手の手ゴマ</h3>
        <div className="hand-pieces-list">
          {handPieces.first.length > 0 ? (
            handPieces.first.map((piece, index) => 
              renderHandPiece(piece, 'first', index)
            )
          ) : (
            <div className="no-pieces">なし</div>
          )}
        </div>
      </div>

      <div className="hand-pieces-section">
        <h3 className="player-label second-player">後手の手ゴマ</h3>
        <div className="hand-pieces-list">
          {handPieces.second.length > 0 ? (
            handPieces.second.map((piece, index) => 
              renderHandPiece(piece, 'second', index)
            )
          ) : (
            <div className="no-pieces">なし</div>
          )}
        </div>
      </div>
    </div>
  );
};