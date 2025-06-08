#!/usr/bin/env node
import { BoardGameLogic } from '../utils/boardGameLogic';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const game = new BoardGameLogic();

function displayGame() {
  console.clear();
  console.log('=================================');
  console.log('       おさかな対戦 CLI');
  console.log('=================================\n');
  console.log(game.getBoardText());
}

function askForMove(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('手を入力してください (例: い↑B3B2, 終了: quit): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function playGame() {
  displayGame();

  while (!game.getGameState().gameResult) {
    const moveString = await askForMove();
    
    if (moveString.toLowerCase() === 'quit') {
      console.log('\nゲームを終了します。');
      rl.close();
      return;
    }

    const move = game.parseMove(moveString);
    if (!move) {
      console.log('\n❌ エラー: 無効な手の形式です。例: い↑B3B2');
      console.log('続けるにはEnterキーを押してください...');
      await askForMove();
      displayGame();
      continue;
    }

    const result = game.makeMove(move);
    if (!result.success) {
      console.log(`\n❌ エラー: ${result.error}`);
      console.log('続けるにはEnterキーを押してください...');
      await askForMove();
      displayGame();
      continue;
    }

    displayGame();

    if (result.gameResult) {
      console.log('\n=================================');
      if (result.gameResult.type === 'win') {
        const winner = result.gameResult.winner === 'first' ? '先手' : '後手';
        console.log(`🎉🎉🎉 ${winner}の勝利！ 🎉🎉🎉`);
        console.log(`理由: ${result.gameResult.reason}`);
      } else if (result.gameResult.type === 'draw') {
        console.log(`🤝 引き分け`);
        console.log(`理由: ${result.gameResult.reason}`);
      }
      console.log('=================================\n');
      
      const playAgain = await new Promise<string>((resolve) => {
        rl.question('もう一度プレイしますか？ (y/n): ', resolve);
      });
      
      if (playAgain.toLowerCase() === 'y') {
        // 新しいゲームを開始
        const newGame = new BoardGameLogic();
        Object.assign(game, newGame);
        displayGame();
      } else {
        console.log('ゲームを終了します。');
        rl.close();
        return;
      }
    }
  }

  rl.close();
}

// ゲーム開始
console.log('おさかな対戦へようこそ！\n');
console.log('ルール:');
console.log('- 相手のまぐろを捕獲すると勝利');
console.log('- 自分のまぐろが相手陣地に到達すると勝利');
console.log('- 手の入力例: い↑B3B2 (コマを移動), い↑A3★ (手ゴマを配置)');
console.log('- 終了するには "quit" と入力\n');
console.log('Enterキーを押してゲームを開始...');

rl.question('', () => {
  playGame().catch((err) => {
    console.error('エラーが発生しました:', err);
    rl.close();
  });
});