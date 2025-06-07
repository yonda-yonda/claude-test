import { BoardGameLogic } from './boardGameLogic';
import { Board, GameState } from '../types/boardGame';

console.log('=== まぐろ勝利判定包括テスト ===\n');

// テスト用のBoardGameLogicクラスを拡張
class TestBoardGameLogic extends BoardGameLogic {
  setGameState(state: Partial<GameState>) {
    Object.assign(this['gameState'], state);
  }
  
  getInternalGameState() {
    return this['gameState'];
  }
}

// テスト1: まぐろが相手陣地に到達してすぐ捕獲される場合
console.log('テスト1: まぐろが相手陣地に到達してすぐ捕獲される場合');
const game1 = new BoardGameLogic();

const moves1 = [
  'い↑B3B2', // 先手
  'い↓B2B3', // 後手  
  'ま↑B4B3', // 先手
  'い↓B3B4', // 後手
  'ま↑B3B2', // 先手
  'た↓C1C2', // 後手
  'ま↑B2B1', // 先手: まぐろが相手陣地に到達
];

for (const moveStr of moves1) {
  const move = game1.parseMove(moveStr);
  if (move) {
    const result = game1.makeMove(move);
    console.log(`${moveStr}: ${result.success ? '成功' : result.error}`);
    if (result.gameResult && result.gameResult.type !== 'invalid') {
      console.log(`ゲーム結果: ${result.gameResult.type} - ${result.gameResult.reason}`);
      break;
    }
  }
}

// この時点ではまだ勝利していないはず
console.log(`現在のターン: ${game1.getGameState().turn}`);
console.log(`ゲーム終了?: ${game1.getGameState().gameResult ? 'はい' : 'いいえ'}`);

// 後手がまぐろを捕獲
console.log('\n後手がまぐろを捕獲:');
const captureMove = game1.parseMove('ま↓B1A1');
if (captureMove) {
  const result = game1.makeMove(captureMove);
  console.log(`ま↓B1A1: ${result.success ? '成功' : result.error}`);
  if (result.gameResult) {
    console.log(`ゲーム結果: ${result.gameResult.type} - ${result.gameResult.reason}`);
  }
}

console.log('\n---\n');

// テスト2: まぐろが相手陣地に到達して生き残る場合
console.log('テスト2: まぐろが相手陣地に到達して生き残る場合');
const game2 = new TestBoardGameLogic();

// 直接盤面を設定（先手のまぐろがB1に到達した状況）
const board: Board = [
  [{ type: 'か', player: 'second' }, { type: 'ま', player: 'first' }, { type: 'た', player: 'second' }],
  [null, { type: 'い', player: 'second' }, null],
  [{ type: 'ま', player: 'second' }, { type: 'い', player: 'first' }, null],
  [{ type: 'た', player: 'first' }, { type: 'ま', player: 'first' }, { type: 'か', player: 'first' }]
];

game2.setGameState({
  board,
  currentPlayer: 'second',
  turn: 12,
  maguroInEnemyTerritory: {
    first: true,
    second: false,
    firstSince: 12 // ターン12で到達
  },
  handPieces: {
    first: [],
    second: []
  },
  gameResult: null,
  history: []
});

console.log('現在の盤面（先手のまぐろがB1に到達した直後）:');
console.log(game2.getBoardText());

// 後手がまぐろを捕獲しない手を打つ
console.log('\n後手: か↓A1A2（まぐろを捕獲しない）');
const nonCaptureMove = game2.parseMove('か↓A1A2');
if (nonCaptureMove) {
  const result = game2.makeMove(nonCaptureMove);
  console.log(`結果: ${result.success ? '成功' : result.error}`);
  if (result.gameResult) {
    console.log(`ゲーム結果: ${result.gameResult.type} - ${result.gameResult.reason}`);
  } else {
    console.log('まだゲーム終了していない');
  }
}

// 次のターン（先手の番）で勝利判定が発生するはず
console.log('\n先手: た↑A4B3（適当な手）');
const nextMove = game2.parseMove('た↑A4B3');
if (nextMove) {
  const result = game2.makeMove(nextMove);
  console.log(`結果: ${result.success ? '成功' : result.error}`);
  if (result.gameResult) {
    console.log(`🎉 ゲーム結果: ${result.gameResult.type} - ${result.gameResult.reason}`);
  }
}

console.log('\n---\n');

// テスト3: シンプルなまぐろ勝利ケース
console.log('テスト3: シンプルなまぐろ勝利ケース');
const game3 = new BoardGameLogic();

const moves3 = [
  'か↑C4C3',  // 先手: かれいを移動（まぐろの道を開ける）
  'か↓A1A2',  // 後手: かれいを移動
  'ま↑B4B3',  // 先手: まぐろを前進
  'か↓A2A3',  // 後手: かれいをさらに移動
  'ま↑B3B2',  // 先手: まぐろを前進
  'か↓A3A4',  // 後手: かれいをさらに移動
  'ま↑B2B1',  // 先手: まぐろが相手陣地到達！
  'た↓C1C2',  // 後手: まぐろを捕獲しない
];

for (let i = 0; i < moves3.length; i++) {
  const moveStr = moves3[i];
  const player = i % 2 === 0 ? '先手' : '後手';
  
  console.log(`${player}: ${moveStr}`);
  const move = game3.parseMove(moveStr);
  if (!move) continue;
  
  const result = game3.makeMove(move);
  if (!result.success) {
    console.log(`エラー: ${result.error}`);
    break;
  }
  
  if (moveStr === 'ま↑B2B1') {
    console.log('→ まぐろが相手陣地に到達！');
  }
  
  if (result.gameResult) {
    console.log(`🎉 ゲーム終了: ${result.gameResult.reason}`);
    break;
  }
}

console.log('\nまぐろ勝利判定テスト完了');