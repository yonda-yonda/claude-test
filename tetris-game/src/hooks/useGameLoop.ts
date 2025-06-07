import { useEffect, useRef, useCallback } from 'react';
import type { GameState, Position } from '../types/game';
import { 
  isValidPosition, 
  rotatePiece, 
  placePiece, 
  clearLines, 
  calculateScore, 
  calculateLevel, 
  getDropInterval,
  createTetromino,
  getRandomTetrominoType
} from '../utils/gameLogic';

interface UseGameLoopProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const useGameLoop = ({ gameState, setGameState }: UseGameLoopProps) => {
  const lastUpdateTime = useRef(Date.now());
  const animationId = useRef<number>();

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const newPosition: Position = {
        x: prev.currentPiece.position.x + dx,
        y: prev.currentPiece.position.y + dy
      };
      
      if (isValidPosition(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition
          }
        };
      }
      
      if (dy > 0) {
        const newBoard = placePiece(prev.board, prev.currentPiece);
        const { board: clearedBoard, linesCleared } = clearLines(newBoard);
        const newLines = prev.lines + linesCleared;
        const newScore = prev.score + calculateScore(linesCleared, prev.level);
        const newLevel = calculateLevel(newLines);
        
        const newPiece = createTetromino(prev.nextPiece);
        const isGameOver = !isValidPosition(clearedBoard, newPiece, newPiece.position);
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: isGameOver ? null : newPiece,
          nextPiece: getRandomTetrominoType(),
          score: newScore,
          level: newLevel,
          lines: newLines,
          isGameOver
        };
      }
      
      return prev;
    });
  }, [setGameState]);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const rotatedPiece = rotatePiece(prev.currentPiece);
      
      if (isValidPosition(prev.board, rotatedPiece, rotatedPiece.position)) {
        return {
          ...prev,
          currentPiece: rotatedPiece
        };
      }
      
      return prev;
    });
  }, [setGameState]);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      let dropDistance = 0;
      const testPosition = { ...prev.currentPiece.position };
      
      while (isValidPosition(prev.board, prev.currentPiece, { x: testPosition.x, y: testPosition.y + dropDistance + 1 })) {
        dropDistance++;
      }
      
      if (dropDistance > 0) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              ...prev.currentPiece.position,
              y: prev.currentPiece.position.y + dropDistance
            }
          }
        };
      }
      
      return prev;
    });
    
    setTimeout(() => movePiece(0, 1), 0);
  }, [movePiece, setGameState]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, [setGameState]);

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const dropInterval = getDropInterval(gameState.level);
      
      if (now - lastUpdateTime.current > dropInterval && !gameState.isPaused && !gameState.isGameOver) {
        movePiece(0, 1);
        lastUpdateTime.current = now;
      }
      
      animationId.current = requestAnimationFrame(gameLoop);
    };
    
    if (!gameState.isGameOver) {
      animationId.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [gameState.level, gameState.isPaused, gameState.isGameOver, movePiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotate, hardDrop, togglePause, gameState.isGameOver]);

  return {
    movePiece,
    rotate,
    hardDrop,
    togglePause
  };
};