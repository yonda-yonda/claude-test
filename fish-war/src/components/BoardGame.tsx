import React, { useState, useCallback } from 'react';
import { BoardGameLogic } from '../utils/boardGameLogic';
import { BoardGameBoard } from './BoardGameBoard';
import { HandPieces } from './HandPieces';
import { GameInfo } from './GameInfo';
import { MoveInput } from './MoveInput';
import { Position, PieceType, GameState } from '../types/boardGame';
import './BoardGame.css';

export const BoardGame: React.FC = () => {
  const [gameLogic] = useState(() => new BoardGameLogic());
  const [gameState, setGameState] = useState<GameState>(gameLogic.getGameState());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedHandPiece, setSelectedHandPiece] = useState<PieceType | null>(null);
  const [lastMove, setLastMove] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  const showAlertMessage = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const closeAlert = useCallback(() => {
    setShowAlert(false);
    setAlertMessage('');
  }, []);

  const handleMoveSubmit = useCallback((moveString: string) => {
    const move = gameLogic.parseMove(moveString);
    if (!move) {
      setErrorMessage('無効な手の形式です');
      showAlertMessage('無効な手の形式です。例: い↑B3B2');
      return;
    }

    const result = gameLogic.makeMove(move);
    if (result.success) {
      setGameState(gameLogic.getGameState());
      setLastMove(moveString);
      setErrorMessage('');
      setSelectedPosition(null);
      setSelectedHandPiece(null);
    } else {
      const errorMsg = result.error || '不明なエラー';
      setErrorMessage(errorMsg);
      showAlertMessage(errorMsg);
    }
  }, [gameLogic, showAlertMessage]);

  const handleCellClick = useCallback((position: Position) => {
    if (gameState.gameResult) {
      showAlertMessage('ゲームは既に終了しています');
      return;
    }

    const { row, col } = gameLogic.positionToIndex(position);
    const piece = gameState.board[row][col];

    if (selectedHandPiece) {
      const moveString = `${selectedHandPiece}${gameState.currentPlayer === 'first' ? '↑' : '↓'}${position.col}${position.row}★`;
      handleMoveSubmit(moveString);
      return;
    }

    if (selectedPosition) {
      if (selectedPosition.row === position.row && selectedPosition.col === position.col) {
        setSelectedPosition(null);
        return;
      }

      const fromPiece = gameState.board[gameLogic.positionToIndex(selectedPosition).row][gameLogic.positionToIndex(selectedPosition).col];
      if (fromPiece) {
        const moveString = `${fromPiece.type}${gameState.currentPlayer === 'first' ? '↑' : '↓'}${selectedPosition.col}${selectedPosition.row}${position.col}${position.row}`;
        handleMoveSubmit(moveString);
        return;
      }
    }

    if (piece && piece.player === gameState.currentPlayer) {
      setSelectedPosition(position);
      setSelectedHandPiece(null);
    } else if (piece && piece.player !== gameState.currentPlayer) {
      showAlertMessage('相手のコマは選択できません');
    } else {
      setSelectedPosition(null);
    }
  }, [gameState, selectedPosition, selectedHandPiece, gameLogic, handleMoveSubmit, showAlertMessage]);

  const handleHandPieceClick = useCallback((piece: PieceType) => {
    if (gameState.gameResult) {
      showAlertMessage('ゲームは既に終了しています');
      return;
    }

    const currentPlayerHandPieces = gameState.handPieces[gameState.currentPlayer];
    if (!currentPlayerHandPieces.includes(piece)) {
      showAlertMessage('その手ゴマを所持していません');
      return;
    }

    if (gameState.currentPlayer === 'first' || gameState.currentPlayer === 'second') {
      setSelectedHandPiece(selectedHandPiece === piece ? null : piece);
      setSelectedPosition(null);
    }
  }, [gameState, selectedHandPiece, showAlertMessage]);

  const handleNewGame = useCallback(() => {
    const newGame = new BoardGameLogic();
    setGameState(newGame.getGameState());
    setSelectedPosition(null);
    setSelectedHandPiece(null);
    setLastMove('');
    setErrorMessage('');
    // gameLogicを更新するためにページリロードが必要
    window.location.reload();
  }, []);

  const isGameFinished = gameState.gameResult !== null;

  return (
    <div className="board-game">
      <div className="game-header">
        <h1>おさかな対戦</h1>
        <button onClick={handleNewGame} className="new-game-button">
          新しいゲーム
        </button>
      </div>

      {errorMessage && (
        <div className="error-message">
          ❌ {errorMessage}
        </div>
      )}

      <div className="game-content">
        <div className="game-board-section">
          <BoardGameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            selectedPosition={selectedPosition}
          />
          <HandPieces
            handPieces={gameState.handPieces}
            currentPlayer={gameState.currentPlayer}
            selectedHandPiece={selectedHandPiece}
            onHandPieceClick={handleHandPieceClick}
          />
        </div>

        <div className="game-controls-section">
          <GameInfo
            currentPlayer={gameState.currentPlayer}
            turn={gameState.turn}
            gameResult={gameState.gameResult}
          />
          <MoveInput
            onMoveSubmit={handleMoveSubmit}
            disabled={isGameFinished}
            lastMove={lastMove}
          />
        </div>
      </div>

      {gameState.gameResult?.type === 'win' && (
        <div className="victory-celebration">
          <div className="confetti">🎉</div>
          <div className="victory-message">
            <h2>
              {gameState.gameResult.winner === 'first' ? '先手' : '後手'}の勝利！
            </h2>
            <p>{gameState.gameResult.reason}</p>
            <button onClick={handleNewGame} className="play-again-button">
              もう一度プレイ
            </button>
          </div>
          <div className="confetti">🎊</div>
        </div>
      )}

      {showAlert && (
        <div className="alert-overlay" onClick={closeAlert}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <h3>⚠️ 無効な操作</h3>
            </div>
            <div className="alert-content">
              <p>{alertMessage}</p>
            </div>
            <div className="alert-actions">
              <button onClick={closeAlert} className="alert-ok-button">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};