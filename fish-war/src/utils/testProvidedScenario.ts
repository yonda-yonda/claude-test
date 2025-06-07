import { BoardGameLogic } from './boardGameLogic';
import { Board, GameState } from '../types/boardGame';

console.log('=== 提供されたシナリオのテスト ===\n');

class TestBoardGameLogic extends BoardGameLogic {
  setGameState(state: Partial<GameState>) {
    Object.assign(this['gameState'], state);
  }
  
  getInternalGameState() {
    return this['gameState'];
  }
}

const game = new TestBoardGameLogic();

// 提供された盤面を設定（先手のまぐろがB1に到達した直後）
const board: Board = [
  [{ type: 'か', player: 'second' }, { type: 'ま', player: 'first' }, { type: 'た', player: 'second' }],
  [null, { type: 'い', player: 'second' }, null],
  [{ type: 'ま', player: 'second' }, { type: 'い', player: 'first' }, null],
  [{ type: 'た', player: 'first' }, { type: 'ま', player: 'first' }, { type: 'か', player: 'first' }]
];

// 先手がまぐろをB1に到達させた状況をシミュレート
game.setGameState({
  board,
  currentPlayer: 'second', // 後手の番
  turn: 12, // まぐろが到達したターン
  maguroInEnemyTerritory: {
    first: true,      // 先手のまぐろが後手陣地にいる
    second: false,
    firstSince: 12    // ターン12で到達
  },
  handPieces: {
    first: [],
    second: []
  },
  gameResult: null,
  history: []
});

console.log('現在の盤面（先手のまぐろがB1に到達した直後）:');
console.log(game.getBoardText());

const state = game.getInternalGameState();
console.log(`\n現在の状態:`);
console.log(`- ターン: ${state.turn}`);
console.log(`- 手番: ${state.currentPlayer === 'first' ? '先手' : '後手'}`);
console.log(`- 先手のまぐろが後手陣地: ${state.maguroInEnemyTerritory.first}`);
console.log(`- 到達ターン: ${state.maguroInEnemyTerritory.firstSince}`);

// ケース1: 後手がまぐろを捕獲しない手を打つ
console.log('\n=== ケース1: 後手がまぐろを捕獲しない ===');
console.log('後手: ま↓A3A4（まぐろを別の場所に移動）');

const nonCaptureMove = game.parseMove('ま↓A3A4');
if (nonCaptureMove) {
  const result = game.makeMove(nonCaptureMove);
  console.log(`結果: ${result.success ? '成功' : 'エラー: ' + result.error}`);
  
  if (result.success) {
    const newState = game.getInternalGameState();
    console.log(`\n移動後の状態:`);
    console.log(`- ターン: ${newState.turn}`);
    console.log(`- 手番: ${newState.currentPlayer === 'first' ? '先手' : '後手'}`);
    console.log(`- 先手のまぐろがまだB1にいる: ${newState.maguroInEnemyTerritory.first}`);
    
    if (result.gameResult) {
      console.log(`\n🎉 ゲーム終了！`);
      console.log(`勝者: ${result.gameResult.winner === 'first' ? '先手' : '後手'}`);
      console.log(`理由: ${result.gameResult.reason}`);
    } else {
      console.log('\nまだゲーム終了していません（バグの可能性）');
    }
  }
}

console.log('\n---\n');

// ケース2: 後手がまぐろを捕獲する場合の比較
console.log('=== ケース2（比較用）: 後手がまぐろを捕獲 ===');
const game2 = new TestBoardGameLogic();
game2.setGameState({
  board: board.map(row => row.map(cell => cell ? {...cell} : null)),
  currentPlayer: 'second',
  turn: 12,
  maguroInEnemyTerritory: {
    first: true,
    second: false,
    firstSince: 12
  },
  handPieces: { first: [], second: [] },
  gameResult: null,
  history: []
});

console.log('後手: か↓A1B1（かれいで先手のまぐろを捕獲）');
const captureMove = game2.parseMove('か↓A1B1');
if (captureMove) {
  const result = game2.makeMove(captureMove);
  console.log(`結果: ${result.success ? '成功' : 'エラー: ' + result.error}`);
  
  if (result.gameResult && result.gameResult.type === 'win') {
    console.log(`\n勝者: ${result.gameResult.winner === 'first' ? '先手' : '後手'}`);
    console.log(`理由: ${result.gameResult.reason}`);
  }
}