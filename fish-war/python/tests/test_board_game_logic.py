import unittest
import sys
from pathlib import Path

# srcディレクトリをPythonパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from board_game_types import PieceType, Position
from board_game_logic import (
    initialize_game, parse_move, make_move
)


class TestBoardGameLogic(unittest.TestCase):
    """BoardGameLogicのテスト"""
    
    def setUp(self):
        """各テストメソッドの前に実行"""
        self.game_state = initialize_game()
    
    def test_initial_state(self):
        """初期状態のテスト"""
        # 初期盤面の確認（TypeScript版に合わせて修正）
        self.assertEqual(self.game_state.board[0][0].type, PieceType.KAREI)
        self.assertEqual(self.game_state.board[0][0].player, 'second')
        self.assertEqual(self.game_state.board[0][1].type, PieceType.MAGURO)
        self.assertEqual(self.game_state.board[0][1].player, 'second')
        self.assertEqual(self.game_state.board[0][2].type, PieceType.TAKO)
        self.assertEqual(self.game_state.board[0][2].player, 'second')
        self.assertEqual(self.game_state.board[1][1].type, PieceType.INADA)
        self.assertEqual(self.game_state.board[1][1].player, 'second')
        
        self.assertEqual(self.game_state.board[3][0].type, PieceType.TAKO)
        self.assertEqual(self.game_state.board[3][0].player, 'first')
        self.assertEqual(self.game_state.board[3][1].type, PieceType.MAGURO)
        self.assertEqual(self.game_state.board[3][1].player, 'first')
        self.assertEqual(self.game_state.board[3][2].type, PieceType.KAREI)
        self.assertEqual(self.game_state.board[3][2].player, 'first')
        self.assertEqual(self.game_state.board[2][1].type, PieceType.INADA)
        self.assertEqual(self.game_state.board[2][1].player, 'first')
        
        # その他の初期値
        self.assertEqual(self.game_state.current_player, 'first')
        self.assertEqual(self.game_state.turn, 1)
        self.assertIsNone(self.game_state.game_result)
        self.assertEqual(len(self.game_state.hand_pieces['first']), 0)
        self.assertEqual(len(self.game_state.hand_pieces['second']), 0)
    
    def test_parse_move(self):
        """手の解析のテスト"""
        # 移動の解析
        move = parse_move('い↑B3B2')
        self.assertIsNotNone(move)
        self.assertEqual(move.piece_type, PieceType.INADA)
        self.assertEqual(move.from_position, Position('B', 3))
        self.assertEqual(move.to_position, Position('B', 2))
        self.assertFalse(move.is_placement)
        
        # 配置の解析
        move = parse_move('い*A3')
        self.assertIsNotNone(move)
        self.assertEqual(move.piece_type, PieceType.INADA)
        self.assertIsNone(move.from_position)
        self.assertEqual(move.to_position, Position('A', 3))
        self.assertTrue(move.is_placement)
        
        # 無効な形式
        self.assertIsNone(parse_move('invalid'))
        self.assertIsNone(parse_move('い↑B3'))
        self.assertIsNone(parse_move('X↑B3B2'))
    
    def test_basic_gameplay(self):
        """基本的なゲームプレイのテスト"""
        # 先手: いなだを前進
        move1 = parse_move('い↑B3B2')
        new_state, error = make_move(self.game_state, move1)
        self.assertIsNone(error)
        self.assertIsNone(new_state.board[2][1])  # B3が空に
        self.assertIsNotNone(new_state.board[1][1])  # B2に移動（ただし後手のいなだがいる）
        self.assertEqual(new_state.current_player, 'second')
        self.assertEqual(new_state.turn, 2)
        self.assertEqual(len(new_state.hand_pieces['first']), 1)  # 捕獲したいなだ
        self.assertEqual(new_state.hand_pieces['first'][0], PieceType.INADA)
        
        # 後手: まぐろでいなだを捕獲
        move2 = parse_move('ま↓B1B2')
        new_state2, error2 = make_move(new_state, move2)
        self.assertIsNone(error2)
        self.assertIsNone(new_state2.board[0][1])  # B1が空に
        self.assertEqual(new_state2.board[1][1].type, PieceType.MAGURO)  # B2にまぐろ
        self.assertEqual(new_state2.board[1][1].player, 'second')
        self.assertEqual(new_state2.current_player, 'first')
        self.assertEqual(new_state2.turn, 3)
        self.assertEqual(len(new_state2.hand_pieces['second']), 1)  # 捕獲したいなだ
        self.assertEqual(new_state2.hand_pieces['second'][0], PieceType.INADA)
    
    def test_maguro_capture_victory(self):
        """まぐろ捕獲による勝利のテスト"""
        # シナリオ: 先手がまぐろを前進させ、後手がそれを捕獲
        moves = [
            'い↑B3B2',  # 先手: いなだ前進
            'ま↓B1B2',  # 後手: まぐろでいなだ捕獲
            'ま↑B4B3',  # 先手: まぐろ前進
            'ま↓B2B3',  # 後手: まぐろでまぐろ捕獲 → 勝利
        ]
        
        game_state = self.game_state
        for i, move_str in enumerate(moves):
            move = parse_move(move_str)
            game_state, error = make_move(game_state, move)
            self.assertIsNone(error)
            
            if i == 3:  # 最後の手
                self.assertEqual(game_state.game_result, 'second')
    
    def test_invalid_moves(self):
        """無効な手の処理のテスト"""
        # 手番でないプレイヤーが動かそうとする
        move = parse_move('た←A1A2')  # 後手のコマを先手が動かそうとする
        new_state, error = make_move(self.game_state, move)
        self.assertEqual(error, "相手のコマは動かせません")
        self.assertEqual(new_state, self.game_state)  # 状態は変わらない
        
        # 存在しないコマを動かそうとする
        move = parse_move('い↑C2C1')  # C2にはコマがない
        new_state, error = make_move(self.game_state, move)
        self.assertEqual(error, "移動元にコマが存在しません")
        
        # 自分のコマがある位置に移動しようとする
        move = parse_move('ま↑B4B3')
        new_state, error = make_move(self.game_state, move)
        # B3には先手のいなだがいるので移動できない
        self.assertEqual(error, "自分のコマがある位置には移動できません")