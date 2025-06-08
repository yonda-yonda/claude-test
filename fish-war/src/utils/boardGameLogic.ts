import {
  GameState,
  Board,
  HandPieces,
  Position,
  Move,
  MoveResult,
  Player,
  PieceType,
  BoardState,
  PIECE_MOVES
} from '../types/boardGame';

export class BoardGameLogic {
  private gameState: GameState;

  constructor() {
    this.gameState = this.initializeGame();
  }

  private initializeGame(): GameState {
    const board: Board = [
      [{ type: 'か', player: 'second' }, { type: 'ま', player: 'second' }, { type: 'た', player: 'second' }],
      [null, { type: 'い', player: 'second' }, null],
      [null, { type: 'い', player: 'first' }, null],
      [{ type: 'た', player: 'first' }, { type: 'ま', player: 'first' }, { type: 'か', player: 'first' }]
    ];

    const handPieces: HandPieces = {
      first: [],
      second: []
    };

    return {
      board,
      handPieces,
      currentPlayer: 'first',
      turn: 1,
      gameResult: null,
      history: [],
      maguroInEnemyTerritory: {
        first: false,
        second: false
      }
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getBoardText(): string {
    let result = '  A    B    C\n';
    result += ' --------------\n';
    
    for (let row = 0; row < 4; row++) {
      result += '|';
      for (let col = 0; col < 3; col++) {
        const piece = this.gameState.board[row][col];
        if (piece) {
          const direction = piece.player === 'first' ? '↑' : '↓';
          result += ` ${piece.type}${direction}|`;
        } else {
          result += '    |';
        }
      }
      result += ` ${row + 1}\n`;
      result += ' --------------\n';
    }

    result += '\n手ゴマ置き場\n';
    result += `先手：${this.gameState.handPieces.first.join(', ') || 'なし'}\n`;
    result += `後手：${this.gameState.handPieces.second.join(', ') || 'なし'}\n`;
    result += `現在のターン：${this.gameState.turn} (${this.gameState.currentPlayer === 'first' ? '先手' : '後手'})\n`;

    return result;
  }

  public positionToIndex(position: Position): { row: number; col: number } {
    const colMap = { 'A': 0, 'B': 1, 'C': 2 };
    return {
      row: position.row - 1,
      col: colMap[position.col]
    };
  }

  private indexToPosition(row: number, col: number): Position {
    const colMap = ['A', 'B', 'C'] as const;
    return {
      row: (row + 1) as 1 | 2 | 3 | 4,
      col: colMap[col]
    };
  }

  private isValidPosition(position: Position): boolean {
    return position.row >= 1 && position.row <= 4 && 
           ['A', 'B', 'C'].includes(position.col);
  }

  private getPossibleMoves(piece: PieceType, from: Position, player: Player): Position[] {
    const moves = PIECE_MOVES[piece];
    const { row: fromRow, col: fromCol } = this.positionToIndex(from);
    
    return moves.map(move => {
      let newRow: number;
      let newCol: number;
      
      if (player === 'first') {
        newRow = fromRow + move.row;
        newCol = fromCol + move.col;
      } else {
        newRow = fromRow - move.row;
        newCol = fromCol - move.col;
      }
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 3) {
        return this.indexToPosition(newRow, newCol);
      }
      return null;
    }).filter((pos): pos is Position => pos !== null);
  }

  private validateMove(move: Move): string | null {
    if (move.player !== this.gameState.currentPlayer) {
      return '手番が違います';
    }

    if (move.type === 'move') {
      if (!move.from) {
        return '移動元が指定されていません';
      }

      const { row: fromRow, col: fromCol } = this.positionToIndex(move.from);
      const fromPiece = this.gameState.board[fromRow][fromCol];

      if (!fromPiece) {
        return '移動元にコマが存在しません';
      }

      if (fromPiece.player !== move.player) {
        return '相手のコマは移動できません';
      }

      if (fromPiece.type !== move.piece) {
        return '指定されたコマと異なります';
      }

      const possibleMoves = this.getPossibleMoves(move.piece, move.from, move.player);
      const canMove = possibleMoves.some(pos => 
        pos.row === move.to.row && pos.col === move.to.col
      );

      if (!canMove) {
        return 'そのコマはその位置に移動できません';
      }

      const { row: toRow, col: toCol } = this.positionToIndex(move.to);
      const toPiece = this.gameState.board[toRow][toCol];

      if (toPiece && toPiece.player === move.player) {
        return '自分のコマがある位置には移動できません';
      }

    } else if (move.type === 'place') {
      const handPieces = this.gameState.handPieces[move.player];
      if (!handPieces.includes(move.piece)) {
        return '所持していない手ゴマです';
      }

      const { row: toRow, col: toCol } = this.positionToIndex(move.to);
      const toPiece = this.gameState.board[toRow][toCol];

      if (toPiece) {
        return 'コマがある位置には配置できません';
      }
    }

    if (!this.isValidPosition(move.to)) {
      return 'ステージの外には移動/配置できません';
    }

    return null;
  }

  public makeMove(move: Move): MoveResult {
    if (this.gameState.gameResult) {
      return {
        success: false,
        error: 'ゲームは既に終了しています'
      };
    }

    const validationError = this.validateMove(move);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        gameResult: {
          type: 'invalid',
          reason: validationError
        }
      };
    }

    const newGameState = { ...this.gameState };
    newGameState.board = this.gameState.board.map(row => [...row]);
    newGameState.handPieces = {
      first: [...this.gameState.handPieces.first],
      second: [...this.gameState.handPieces.second]
    };
    newGameState.maguroInEnemyTerritory = {
      ...this.gameState.maguroInEnemyTerritory
    };

    if (move.type === 'move' && move.from) {
      const { row: fromRow, col: fromCol } = this.positionToIndex(move.from);
      const { row: toRow, col: toCol } = this.positionToIndex(move.to);
      
      const capturedPiece = newGameState.board[toRow][toCol];
      if (capturedPiece && capturedPiece.player !== move.player) {
        let capturedType = capturedPiece.type;
        if (capturedType === 'ぶ') {
          capturedType = 'い';
        }
        newGameState.handPieces[move.player].push(capturedType);

        if (capturedPiece.type === 'ま') {
          newGameState.gameResult = {
            type: 'win',
            winner: move.player,
            reason: 'まぐろを捕獲しました'
          };
        }
      }

      newGameState.board[toRow][toCol] = newGameState.board[fromRow][fromCol];
      newGameState.board[fromRow][fromCol] = null;

      if (move.piece === 'い') {
        const opponentTerritory = move.player === 'first' ? 1 : 4;
        if (move.to.row === opponentTerritory) {
          newGameState.board[toRow][toCol] = { type: 'ぶ', player: move.player };
        }
      }

      // まぐろが相手陣地に到達した場合は、次のターンで判定

    } else if (move.type === 'place') {
      const { row: toRow, col: toCol } = this.positionToIndex(move.to);
      newGameState.board[toRow][toCol] = { type: move.piece, player: move.player };
      
      const handPieces = newGameState.handPieces[move.player];
      const pieceIndex = handPieces.indexOf(move.piece);
      handPieces.splice(pieceIndex, 1);
    }

    newGameState.history.push({
      board: this.gameState.board.map(row => [...row]),
      handPieces: {
        first: [...this.gameState.handPieces.first],
        second: [...this.gameState.handPieces.second]
      },
      currentPlayer: this.gameState.currentPlayer
    });

    newGameState.currentPlayer = newGameState.currentPlayer === 'first' ? 'second' : 'first';
    newGameState.turn = newGameState.turn + 1;

    // まぐろの位置を更新してから勝利判定
    this.updateMaguroStatus(newGameState);
    
    // まぐろが相手陣地にいるかチェック（ターン開始時）
    if (newGameState.gameResult === null) {
      this.checkMaguroVictory(newGameState);
    }

    this.checkForDraw(newGameState);

    this.gameState = newGameState;

    return {
      success: true,
      gameState: { ...newGameState },
      gameResult: newGameState.gameResult || undefined
    };
  }

  private updateMaguroStatus(gameState: GameState): void {
    // 各プレイヤーのまぐろが相手陣地にいるかチェック
    let firstMaguroInSecondTerritory = false;
    let secondMaguroInFirstTerritory = false;

    // 後手陣地（1行目）をチェック
    for (let col = 0; col < 3; col++) {
      const piece = gameState.board[0][col];
      if (piece && piece.type === 'ま' && piece.player === 'first') {
        firstMaguroInSecondTerritory = true;
      }
    }

    // 先手陣地（4行目）をチェック
    for (let col = 0; col < 3; col++) {
      const piece = gameState.board[3][col];
      if (piece && piece.type === 'ま' && piece.player === 'second') {
        secondMaguroInFirstTerritory = true;
      }
    }

    // 到達状態を更新
    if (firstMaguroInSecondTerritory && !gameState.maguroInEnemyTerritory.first) {
      gameState.maguroInEnemyTerritory.first = true;
      gameState.maguroInEnemyTerritory.firstSince = gameState.turn;
    } else if (!firstMaguroInSecondTerritory) {
      gameState.maguroInEnemyTerritory.first = false;
      gameState.maguroInEnemyTerritory.firstSince = undefined;
    }

    if (secondMaguroInFirstTerritory && !gameState.maguroInEnemyTerritory.second) {
      gameState.maguroInEnemyTerritory.second = true;
      gameState.maguroInEnemyTerritory.secondSince = gameState.turn;
    } else if (!secondMaguroInFirstTerritory) {
      gameState.maguroInEnemyTerritory.second = false;
      gameState.maguroInEnemyTerritory.secondSince = undefined;
    }
  }

  private checkMaguroVictory(gameState: GameState): void {
    // 先手のまぐろが後手陣地に到達してから後手が1回手を打った後のチェック
    if (gameState.maguroInEnemyTerritory.first && 
        gameState.maguroInEnemyTerritory.firstSince !== undefined &&
        gameState.turn > gameState.maguroInEnemyTerritory.firstSince) {
      // 先手のまぐろが到達 → 後手が手を打つ → 後手のターンで判定
      gameState.gameResult = {
        type: 'win',
        winner: 'first',
        reason: 'まぐろが相手陣地に到達し、捕獲されませんでした'
      };
      return;
    }

    // 後手のまぐろが先手陣地に到達してから先手が1回手を打った後のチェック
    if (gameState.maguroInEnemyTerritory.second && 
        gameState.maguroInEnemyTerritory.secondSince !== undefined &&
        gameState.turn > gameState.maguroInEnemyTerritory.secondSince) {
      // 後手のまぐろが到達 → 先手が手を打つ → 先手のターンで判定
      gameState.gameResult = {
        type: 'win',
        winner: 'second',
        reason: 'まぐろが相手陣地に到達し、捕獲されませんでした'
      };
      return;
    }
  }

  private checkForDraw(gameState: GameState): void {
    const currentState = {
      board: gameState.board.map(row => [...row]),
      handPieces: {
        first: [...gameState.handPieces.first],
        second: [...gameState.handPieces.second]
      },
      currentPlayer: gameState.currentPlayer
    };

    const stateCount = gameState.history.filter(state => 
      this.compareStates(state, currentState)
    ).length;

    if (stateCount >= 2) {
      gameState.gameResult = {
        type: 'draw',
        reason: '同じ状態が3回発生しました'
      };
    }
  }

  private compareStates(state1: BoardState, state2: BoardState): boolean {
    if (state1.currentPlayer !== state2.currentPlayer) return false;
    
    if (state1.handPieces.first.length !== state2.handPieces.first.length ||
        state1.handPieces.second.length !== state2.handPieces.second.length) return false;
    
    for (let i = 0; i < state1.handPieces.first.length; i++) {
      if (state1.handPieces.first[i] !== state2.handPieces.first[i]) return false;
    }
    for (let i = 0; i < state1.handPieces.second.length; i++) {
      if (state1.handPieces.second[i] !== state2.handPieces.second[i]) return false;
    }

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const piece1 = state1.board[row][col];
        const piece2 = state2.board[row][col];
        
        if (piece1 === null && piece2 === null) continue;
        if (piece1 === null || piece2 === null) return false;
        if (piece1.type !== piece2.type || piece1.player !== piece2.player) return false;
      }
    }

    return true;
  }

  public parseMove(moveString: string): Move | null {
    const moveRegex = /^([まいぶたか])(↑|↓)([ABC][1-4])([ABC][1-4]|★)$/;
    const match = moveString.match(moveRegex);
    
    if (!match) return null;
    
    const [, pieceType, direction, fromOrTo, to] = match;
    const player = direction === '↑' ? 'first' : 'second';
    
    if (to === '★') {
      return {
        type: 'place',
        piece: pieceType as PieceType,
        to: {
          col: fromOrTo[0] as 'A' | 'B' | 'C',
          row: parseInt(fromOrTo[1]) as 1 | 2 | 3 | 4
        },
        player
      };
    } else {
      return {
        type: 'move',
        piece: pieceType as PieceType,
        from: {
          col: fromOrTo[0] as 'A' | 'B' | 'C',
          row: parseInt(fromOrTo[1]) as 1 | 2 | 3 | 4
        },
        to: {
          col: to[0] as 'A' | 'B' | 'C',
          row: parseInt(to[1]) as 1 | 2 | 3 | 4
        },
        player
      };
    }
  }
}