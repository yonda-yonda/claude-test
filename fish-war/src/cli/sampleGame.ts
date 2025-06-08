#!/usr/bin/env node
import { BoardGameLogic } from '../utils/boardGameLogic';

console.log('おさかな対戦 - サンプルゲーム実行\n');

const game = new BoardGameLogic();

// ゲームの手順を定義（有効な手順に修正）
const moves = [
  { move: 'い↑B3B2', description: '先手: いなだを前進（B3→B2）' },
  { move: 'ま↓B1B2', description: '後手: まぐろで先手のいなだを捕獲（B1→B2）' },
  { move: 'ま↑B4B3', description: '先手: まぐろを前進（B4→B3）' },
  { move: 'ま↓B2B3', description: '後手: まぐろで先手のまぐろを捕獲（B2→B3）→ゲーム終了' }
];

console.log('=== 初期盤面 ===');
console.log(game.getBoardText());
console.log('\nEnterキーを押して次の手へ...');

// 各手を実行
for (const { move: moveString, description } of moves) {
  // ユーザー入力を待機（実際のCLIでは readline使用）
  console.log(`\n${description}`);
  console.log(`実行: ${moveString}`);
  
  const move = game.parseMove(moveString);
  if (!move) {
    console.log('❌ 無効な手の形式');
    continue;
  }

  const result = game.makeMove(move);
  if (!result.success) {
    console.log(`❌ エラー: ${result.error}`);
    continue;
  }

  console.log('\n=== 盤面更新 ===');
  console.log(game.getBoardText());

  if (result.gameResult) {
    console.log('\n🎮 ゲーム終了！');
    if (result.gameResult.type === 'win') {
      const winner = result.gameResult.winner === 'first' ? '先手' : '後手';
      console.log(`🎉 ${winner}の勝利！`);
      console.log(`理由: ${result.gameResult.reason}`);
    }
    break;
  }
}

console.log('\n=== サンプルゲーム終了 ===');