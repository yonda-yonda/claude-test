import type { Tetromino, TetrominoType, Position, GameState } from '../types/game';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINO_SHAPES } from '../types/game';

export const createEmptyBoard = (): number[][] => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
};

export const getRandomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export const createTetromino = (type: TetrominoType): Tetromino => {
  const shape = TETROMINO_SHAPES[type][0];
  const width = shape[0].length;
  return {
    type,
    position: { x: Math.floor((BOARD_WIDTH - width) / 2), y: 0 },
    rotation: 0,
    shape
  };
};

export const isValidPosition = (board: number[][], piece: Tetromino, position: Position): boolean => {
  const shape = piece.shape;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = position.x + x;
        const newY = position.y + y;
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
};

export const rotatePiece = (piece: Tetromino): Tetromino => {
  const newRotation = (piece.rotation + 1) % 4;
  const newShape = TETROMINO_SHAPES[piece.type][newRotation];
  return {
    ...piece,
    rotation: newRotation,
    shape: newShape
  };
};

export const placePiece = (board: number[][], piece: Tetromino): number[][] => {
  const newBoard = board.map(row => [...row]);
  const shape = piece.shape;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = shape[y][x];
        }
      }
    }
  }
  
  return newBoard;
};

export const clearLines = (board: number[][]): { board: number[][], linesCleared: number } => {
  const newBoard = board.filter(row => !row.every(cell => cell !== 0));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  
  return { board: newBoard, linesCleared };
};

export const calculateScore = (linesCleared: number, level: number): number => {
  const baseScores = [0, 100, 300, 500, 800];
  return baseScores[linesCleared] * (level + 1);
};

export const calculateLevel = (lines: number): number => {
  return Math.floor(lines / 10);
};

export const getDropInterval = (level: number): number => {
  return Math.max(100, 1000 - (level * 50));
};

export const initializeGameState = (): GameState => {
  return {
    board: createEmptyBoard(),
    currentPiece: createTetromino(getRandomTetrominoType()),
    nextPiece: getRandomTetrominoType(),
    score: 0,
    level: 0,
    lines: 0,
    isGameOver: false,
    isPaused: false
  };
};