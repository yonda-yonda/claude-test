export type PieceType = 'ま' | 'い' | 'ぶ' | 'た' | 'か';

export type Player = 'first' | 'second';

export interface Position {
  col: 'A' | 'B' | 'C';
  row: 1 | 2 | 3 | 4;
}

export interface Piece {
  type: PieceType;
  player: Player;
}

export type Board = (Piece | null)[][];

export interface HandPieces {
  first: PieceType[];
  second: PieceType[];
}

export interface Move {
  type: 'move' | 'place';
  piece: PieceType;
  from?: Position;
  to: Position;
  player: Player;
}

export interface GameState {
  board: Board;
  handPieces: HandPieces;
  currentPlayer: Player;
  turn: number;
  gameResult: GameResult | null;
  history: BoardState[];
  maguroInEnemyTerritory: {
    first: boolean;  // 先手のまぐろが後手陣地にいるか
    second: boolean; // 後手のまぐろが先手陣地にいるか
    firstSince?: number;  // 先手のまぐろが到達したターン
    secondSince?: number; // 後手のまぐろが到達したターン
  };
}

export interface BoardState {
  board: Board;
  handPieces: HandPieces;
  currentPlayer: Player;
}

export type GameResult = 
  | { type: 'win'; winner: Player; reason: string }
  | { type: 'draw'; reason: string }
  | { type: 'invalid'; reason: string };

export interface MoveResult {
  success: boolean;
  gameState?: GameState;
  error?: string;
  gameResult?: GameResult;
}

export const PIECE_MOVES: Record<PieceType, {row: number, col: number}[]> = {
  'ま': [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ],
  'い': [
    { row: -1, col: 0 }
  ],
  'ぶ': [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: 0 }
  ],
  'た': [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ],
  'か': [
    { row: -1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: 0 }
  ]
};