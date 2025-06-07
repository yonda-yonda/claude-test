#!/usr/bin/env node
import { BoardGameLogic } from '../utils/boardGameLogic';

// コマンドライン引数から手のリストを取得
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('使用方法: npx tsx src/cli/batchGame.ts [手1] [手2] ...');
  console.log('例: npx tsx src/cli/batchGame.ts "い↑B3B2" "た↓C1C2" "ま↑B4B3"');
  process.exit(1);
}

console.log('おさかな対戦 - バッチ実行モード\n');

const game = new BoardGameLogic();

console.log('=== 初期盤面 ===');
console.log(game.getBoardText());

// 各手を実行
for (let i = 0; i < args.length; i++) {
  const moveString = args[i];
  const currentPlayer = game.getGameState().currentPlayer === 'first' ? '先手' : '後手';
  
  console.log(`\n--- ターン ${i + 1}: ${currentPlayer} ---`);
  console.log(`実行: ${moveString}`);
  
  const move = game.parseMove(moveString);
  if (!move) {
    console.log('❌ 無効な手の形式です');
    console.log('ゲームを中断します');
    process.exit(1);
  }

  const result = game.makeMove(move);
  if (!result.success) {
    console.log(`❌ エラー: ${result.error}`);
    console.log('ゲームを中断します');
    process.exit(1);
  }

  console.log(game.getBoardText());

  if (result.gameResult) {
    console.log('\n=================================');
    if (result.gameResult.type === 'win') {
      const winner = result.gameResult.winner === 'first' ? '先手' : '後手';
      console.log(`🎉 ${winner}の勝利！`);
      console.log(`理由: ${result.gameResult.reason}`);
    } else if (result.gameResult.type === 'draw') {
      console.log('🤝 引き分け');
      console.log(`理由: ${result.gameResult.reason}`);
    }
    console.log('=================================');
    break;
  }
}

console.log('\nバッチ実行完了');