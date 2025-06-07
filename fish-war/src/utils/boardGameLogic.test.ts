import { BoardGameLogic } from './boardGameLogic';

const game = new BoardGameLogic();

console.log('=== 初期状態 ===');
console.log(game.getBoardText());

console.log('\n=== 先手：い↑B3B2 ===');
const move1 = game.parseMove('い↑B3B2');
if (move1) {
  const result1 = game.makeMove(move1);
  console.log('結果:', result1.success ? '成功' : result1.error);
  if (result1.success) {
    console.log(game.getBoardText());
  }
}

console.log('\n=== 後手：ま↓B1B2 ===');
const move2 = game.parseMove('ま↓B1B2');
if (move2) {
  const result2 = game.makeMove(move2);
  console.log('結果:', result2.success ? '成功' : result2.error);
  if (result2.success) {
    console.log(game.getBoardText());
  }
}

console.log('\n=== 先手：ま↑B4A3 ===');
const move3 = game.parseMove('ま↑B4A3');
if (move3) {
  const result3 = game.makeMove(move3);
  console.log('結果:', result3.success ? '成功' : result3.error);
  if (result3.success) {
    console.log(game.getBoardText());
  }
}

console.log('\n=== 後手：ま↓B2B3 ===');
const move4 = game.parseMove('ま↓B2B3');
if (move4) {
  const result4 = game.makeMove(move4);
  console.log('結果:', result4.success ? '成功' : result4.error);
  if (result4.success) {
    console.log(game.getBoardText());
  }
}

console.log('\n=== 先手：ま↑A3B3 (相手のまぐろを捕獲して勝利) ===');
const move5 = game.parseMove('ま↑A3B3');
if (move5) {
  const result5 = game.makeMove(move5);
  console.log('結果:', result5.success ? '成功' : result5.error);
  if (result5.success) {
    console.log(game.getBoardText());
    if (result5.gameResult) {
      console.log('ゲーム結果:', result5.gameResult);
    }
  }
}