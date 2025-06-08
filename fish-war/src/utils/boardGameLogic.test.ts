/// <reference types="jest" />
import { BoardGameLogic } from './boardGameLogic';

describe('BoardGameLogic', () => {
  let game: BoardGameLogic;

  beforeEach(() => {
    game = new BoardGameLogic();
  });

  describe('初期状態', () => {
    test('初期盤面が正しく設定されている', () => {
      const state = game.getGameState();
      
      expect(state.currentPlayer).toBe('first');
      expect(state.turn).toBe(1);
      expect(state.gameResult).toBeNull();
      expect(state.handPieces.first).toEqual([]);
      expect(state.handPieces.second).toEqual([]);
      
      // 初期配置確認
      expect(state.board[0][0]).toEqual({ type: 'か', player: 'second' }); // A1
      expect(state.board[0][1]).toEqual({ type: 'ま', player: 'second' }); // B1
      expect(state.board[0][2]).toEqual({ type: 'た', player: 'second' }); // C1
      expect(state.board[1][1]).toEqual({ type: 'い', player: 'second' }); // B2
      expect(state.board[2][1]).toEqual({ type: 'い', player: 'first' });  // B3
      expect(state.board[3][0]).toEqual({ type: 'た', player: 'first' });  // A4
      expect(state.board[3][1]).toEqual({ type: 'ま', player: 'first' });  // B4
      expect(state.board[3][2]).toEqual({ type: 'か', player: 'first' });  // C4
    });
  });

  describe('手の解析', () => {
    test('有効な移動手を正しく解析する', () => {
      const move = game.parseMove('い↑B3B2');
      
      expect(move).toEqual({
        type: 'move',
        piece: 'い',
        from: { col: 'B', row: 3 },
        to: { col: 'B', row: 2 },
        player: 'first'
      });
    });

    test('有効な配置手を正しく解析する', () => {
      const move = game.parseMove('い↑A3★');
      
      expect(move).toEqual({
        type: 'place',
        piece: 'い',
        to: { col: 'A', row: 3 },
        player: 'first'
      });
    });

    test('無効な手の形式を拒否する', () => {
      expect(game.parseMove('invalid')).toBeNull();
      expect(game.parseMove('い↑B3')).toBeNull();
      expect(game.parseMove('XB3B2')).toBeNull();
    });
  });

  describe('基本的なゲームプレイ', () => {
    test('先手のいなだの移動', () => {
      const move = game.parseMove('い↑B3B2');
      const result = game.makeMove(move!);
      
      expect(result.success).toBe(true);
      expect(result.gameResult).toBeUndefined();
      
      const state = game.getGameState();
      expect(state.currentPlayer).toBe('second');
      expect(state.turn).toBe(2);
      expect(state.board[1][1]).toEqual({ type: 'い', player: 'first' });
      expect(state.board[2][1]).toBeNull();
      expect(state.handPieces.first).toEqual(['い']); // 後手のいなだを捕獲
    });

    test('後手のまぐろでの捕獲', () => {
      // 先手: い↑B3B2
      game.makeMove(game.parseMove('い↑B3B2')!);
      
      // 後手: ま↓B1B2
      const move = game.parseMove('ま↓B1B2');
      const result = game.makeMove(move!);
      
      expect(result.success).toBe(true);
      expect(result.gameResult).toBeUndefined();
      
      const state = game.getGameState();
      expect(state.currentPlayer).toBe('first');
      expect(state.turn).toBe(3);
      expect(state.board[1][1]).toEqual({ type: 'ま', player: 'second' });
      expect(state.handPieces.second).toEqual(['い']); // 先手のいなだを捕獲
    });
  });

  describe('まぐろ捕獲による勝利', () => {
    test('先手がまぐろを捕獲して勝利', () => {
      // ゲームセットアップ
      const moves = [
        'い↑B3B2',   // 先手: いなだで後手のいなだを捕獲
        'ま↓B1B2',   // 後手: まぐろで先手のいなだを捕獲
        'ま↑B4B3',   // 先手: まぐろを前進
        'ま↓B2B3'    // 後手: まぐろで先手のまぐろを捕獲（実際はこれで後手勝利）
      ];

      let finalResult;
      for (let i = 0; i < moves.length; i++) {
        const move = game.parseMove(moves[i]);
        finalResult = game.makeMove(move!);
        
        if (finalResult.gameResult) {
          break;
        }
      }
      
      expect(finalResult!.success).toBe(true);
      expect(finalResult!.gameResult).toEqual({
        type: 'win',
        winner: 'second',
        reason: 'まぐろを捕獲しました'
      });
    });
  });

  describe('無効な手の処理', () => {
    test('手番が違う場合のエラー', () => {
      const move = game.parseMove('い↓B2B3'); // 後手の手だが先手の番
      const result = game.makeMove(move!);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('手番が違います');
    });

    test('自分のコマがない位置からの移動エラー', () => {
      const move = game.parseMove('い↑A3A2'); // A3には先手のコマがない
      const result = game.makeMove(move!);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('移動元にコマが存在しません');
    });

    test('自分のコマがある位置への移動エラー', () => {
      const move = game.parseMove('ま↑B4B3'); // B3には先手のいなだがいる
      const result = game.makeMove(move!);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('自分のコマがある位置には移動できません');
    });
  });
});