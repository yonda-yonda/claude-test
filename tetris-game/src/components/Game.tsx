import React, { useState, useEffect } from 'react';
import Board from './Board';
import NextPiece from './NextPiece';
import GameInfo from './GameInfo';
import { useGameLoop } from '../hooks/useGameLoop';
import { initializeGameState } from '../utils/gameLogic';
import './Game.css';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState(initializeGameState());
  const [cellSize, setCellSize] = useState(25);
  
  useGameLoop({ gameState, setGameState });

  useEffect(() => {
    const updateCellSize = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // ヘッダー、パディング、UIコンポーネントのためのスペースを考慮
      const availableHeight = windowHeight - 200; // ヘッダーとパディング用
      const boardHeight = 20; // テトリスボードの高さ（セル数）
      
      // サイドバーの幅を考慮した利用可能な幅
      const availableWidth = Math.min(windowWidth - 400, windowHeight - 200); // サイドバー用のスペース
      const boardWidth = 10; // テトリスボードの幅（セル数）
      
      // 高さと幅の両方に基づいて最適なセルサイズを計算
      const maxCellSizeByHeight = Math.floor(availableHeight / boardHeight);
      const maxCellSizeByWidth = Math.floor(availableWidth / boardWidth);
      const optimalCellSize = Math.min(maxCellSizeByHeight, maxCellSizeByWidth);
      
      // 最小値と最大値を設定
      const finalCellSize = Math.max(20, Math.min(40, optimalCellSize));
      setCellSize(finalCellSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  const handleRestart = () => {
    setGameState(initializeGameState());
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>TETRIS</h1>
      </div>
      
      <div className="game-content">
        <div className="game-sidebar">
          <GameInfo 
            score={gameState.score}
            level={gameState.level}
            lines={gameState.lines}
          />
          <NextPiece type={gameState.nextPiece} cellSize={Math.floor(cellSize * 0.8)} />
          
          <div className="game-controls">
            <h3>Controls</h3>
            <div className="controls-list">
              <div>← → : Move</div>
              <div>↑ : Rotate</div>
              <div>↓ : Soft Drop</div>
              <div>Space : Hard Drop</div>
              <div>P : Pause</div>
            </div>
          </div>
          
          <button className="restart-button" onClick={handleRestart}>
            New Game
          </button>
        </div>
        
        <div className="game-main">
          <Board 
            board={gameState.board}
            currentPiece={gameState.currentPiece}
            cellSize={cellSize}
          />
          
          {gameState.isGameOver && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>GAME OVER</h2>
                <p>Final Score: {gameState.score.toLocaleString()}</p>
                <button onClick={handleRestart}>Play Again</button>
              </div>
            </div>
          )}
          
          {gameState.isPaused && !gameState.isGameOver && (
            <div className="pause-overlay">
              <div className="pause-content">
                <h2>PAUSED</h2>
                <p>Press P to continue</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;