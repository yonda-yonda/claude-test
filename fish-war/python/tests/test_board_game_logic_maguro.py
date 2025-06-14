import unittest
import sys
from pathlib import Path

# srcディレクトリをPythonパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from board_game_types import PieceType, Position, Piece, GameState
from board_game_logic import (
    initialize_game, parse_move, make_move, check_maguro_victory
)


class TestBoardGameLogicForTesting:
    """テスト用の拡張クラス（内部状態へのアクセスを提供）"""
    
    def __init__(self):
        self.game_state = initialize_game()
    
    def set_game_state(self, state: GameState):
        """内部状態を直接設定"""
        self.game_state = state
    
    def get_internal_game_state(self):
        """内部状態を取得"""
        return self.game_state
    
    def make_move(self, move):
        """移動を実行"""
        self.game_state, error = make_move(self.game_state, move)
        return self.game_state, error


class TestMaguroVictory(unittest.TestCase):
    """まぐろ勝利判定のテスト"""
    
    def setUp(self):
        """各テストメソッドの前に実行"""
        self.game_state = initialize_game()
        self.test_game = TestBoardGameLogicForTesting()
    
    def test_maguro_reaches_enemy_territory_and_gets_captured(self):
        """まぐろ到達後に即座に捕獲されるケース"""
        # まぐろが相手陣地に到達する直前の盤面を設定
        board = [[None for _ in range(3)] for _ in range(4)]
        board[0][1] = Piece(PieceType.KAREI, 'second')    # B1: かれい(後手)
        board[1][0] = Piece(PieceType.MAGURO, 'second')   # A2: まぐろ(後手)
        board[1][2] = Piece(PieceType.MAGURO, 'first')    # C2: まぐろ(先手)
        board[3][0] = Piece(PieceType.TAKO, 'first')      # A4: たこ(先手)
        board[3][2] = Piece(PieceType.KAREI, 'first')     # C4: かれい(先手)
        
        state = GameState(
            board=board,
            hand_pieces={'first': [], 'second': []},
            current_player='first',
            turn=10,
            game_result=None,
            history=[],
            maguro_in_enemy_territory={'first': False, 'second': False}
        )
        
        self.test_game.set_game_state(state)
        
        # 先手のまぐろがC2からB1に移動（相手陣地に到達）
        move_to_enemy = parse_move('ま↑C2B1')
        new_state, error = self.test_game.make_move(move_to_enemy)
        
        self.assertIsNone(error)
        self.assertIsNone(new_state.game_result)  # まだ勝利していない
        
        # 盤面状態の確認
        self.assertEqual(new_state.board[0][1].type, PieceType.MAGURO)  # B1に先手のまぐろ
        self.assertEqual(new_state.board[0][1].player, 'first')
        self.assertTrue(new_state.maguro_in_enemy_territory['first'])
        self.assertEqual(new_state.current_player, 'second')  # 後手の番
        
        # 後手がまぐろを即座に捕獲（A2からB1へ斜め移動）
        capture_move = parse_move('ま↓A2B1')
        final_state, error2 = self.test_game.make_move(capture_move)
        
        self.assertIsNone(error2)
        self.assertEqual(final_state.game_result, 'second')  # まぐろ捕獲で後手の勝利
    
    def test_maguro_reaches_enemy_territory_and_survives(self):
        """まぐろが相手陣地に到達して生き残る場合"""
        # TypeScriptテストと同じ盤面設定
        board = [[None for _ in range(3)] for _ in range(4)]
        board[0][0] = Piece(PieceType.KAREI, 'second')   # A1: かれい(後手)
        board[0][1] = Piece(PieceType.MAGURO, 'first')   # B1: まぐろ(先手) - 相手陣地到達
        board[0][2] = Piece(PieceType.TAKO, 'second')    # C1: たこ(後手)
        board[1][1] = Piece(PieceType.INADA, 'second')   # B2: いなだ(後手)
        board[2][0] = Piece(PieceType.MAGURO, 'second')  # A3: まぐろ(後手)
        board[2][1] = Piece(PieceType.INADA, 'first')    # B3: いなだ(先手)
        board[3][0] = Piece(PieceType.TAKO, 'first')     # A4: たこ(先手)
        board[3][2] = Piece(PieceType.KAREI, 'first')    # C4: かれい(先手)
        
        state = GameState(
            board=board,
            hand_pieces={'first': [], 'second': []},
            current_player='second',
            turn=12,
            game_result=None,
            history=[],
            maguro_in_enemy_territory={'first': True, 'second': False}
        )
        
        # 後手がまぐろを捕獲しない手を打つ（TypeScriptテストと同じ）
        move = parse_move('か↓A1A2')  # かれいを前進
        new_state, error = make_move(state, move)
        self.assertIsNone(error)
        
        # まぐろが生き残ったので先手の勝利
        result = check_maguro_victory(new_state)
        self.assertEqual(result, 'first')  # 先手の勝利
    
    def test_maguro_capture_victory_detailed(self):
        """まぐろ捕獲による勝利の詳細テスト"""
        moves = [
            'い↑B3B2',  # 先手: いなだで後手のいなだを捕獲
            'た↓C1B2',  # 後手: たこで先手のいなだを捕獲
            'か↑C4C3',  # 先手: かれいを前へ
            'た↓B2A3',  # 後手: たこを左斜めへ
            'ま↑B4A3',  # 先手: まぐろで後手のたこを捕獲
            'か↓A1A2',  # 後手: かれいを前へ
            'ま↑A3A2',  # 先手: まぐろで後手のかれいを捕獲
            'ま↓B1A2',  # 後手: まぐろで先手のまぐろを捕獲
        ]
        
        game_state = self.game_state
        for i, move_str in enumerate(moves):
            move = parse_move(move_str)
            game_state, error = make_move(game_state, move)
            self.assertIsNone(error)
            
            if game_state.game_result:  # ゲーム終了したらbreak
                break
        
        self.assertEqual(game_state.game_result, 'second')
    
    def test_inada_promotion_to_buri(self):
        """いなだのぶり出世テスト"""
        # 先手のいなだを相手陣地に移動
        moves = [
            'い↑B3B2',  # 先手: いなだで後手のいなだを捕獲
            'ま↓B1A2',  # 後手: まぐろをB1からA2へ移動（道を空ける）
            'い↑B2B1',  # 先手: いなだを相手陣地へ（ぶりに出世）
        ]
        
        game_state = self.game_state
        for move_str in moves:
            move = parse_move(move_str)
            game_state, error = make_move(game_state, move)
            self.assertIsNone(error)
        
        # B1にぶりが存在することを確認
        self.assertEqual(game_state.board[0][1].type, PieceType.BURI)
        self.assertEqual(game_state.board[0][1].player, 'first')
    
    def test_hand_pieces_functionality(self):
        """手ゴマ機能のテスト"""
        # 捕獲したコマが手ゴマになることを確認
        move1 = parse_move('い↑B3B2')
        game_state, error = make_move(self.game_state, move1)
        self.assertIsNone(error)
        
        # 先手が後手のいなだを捕獲
        self.assertEqual(len(game_state.hand_pieces['first']), 1)
        self.assertEqual(game_state.hand_pieces['first'][0], PieceType.INADA)
    
    def test_hand_piece_placement(self):
        """手ゴマの配置機能のテスト"""
        # まず先手がいなだを捕獲して手ゴマにする
        move1 = parse_move('い↑B3B2')
        game_state, error = make_move(self.game_state, move1)
        self.assertIsNone(error)
        self.assertEqual(game_state.hand_pieces['first'], [PieceType.INADA])
        
        # 後手が別の手を打つ
        move2 = parse_move('た↓C1B2')
        game_state, error = make_move(game_state, move2)
        self.assertIsNone(error)
        
        # 先手が手ゴマのいなだを配置
        move3 = parse_move('い*A3')
        game_state, error = make_move(game_state, move3)
        self.assertIsNone(error)
        
        # 手ゴマが消費され、A3にいなだが配置される
        self.assertEqual(len(game_state.hand_pieces['first']), 0)
        self.assertEqual(game_state.board[2][0].type, PieceType.INADA)
        self.assertEqual(game_state.board[2][0].player, 'first')
    
    def test_specific_board_victory_conditions_no_capture(self):
        """後手がまぐろを捕獲しない場合の勝利判定"""
        # TypeScriptテストと同じ盤面設定（先手のまぐろがB1に到達した直後）
        board = [[None for _ in range(3)] for _ in range(4)]
        board[0][0] = Piece(PieceType.KAREI, 'second')   # A1: かれい(後手)
        board[0][1] = Piece(PieceType.MAGURO, 'first')   # B1: まぐろ(先手)
        board[0][2] = Piece(PieceType.TAKO, 'second')    # C1: たこ(後手)
        board[1][1] = Piece(PieceType.INADA, 'second')   # B2: いなだ(後手)
        board[2][0] = Piece(PieceType.MAGURO, 'second')  # A3: まぐろ(後手)
        board[2][1] = Piece(PieceType.INADA, 'first')    # B3: いなだ(先手)
        board[3][0] = Piece(PieceType.TAKO, 'first')     # A4: たこ(先手)
        board[3][2] = Piece(PieceType.KAREI, 'first')    # C4: かれい(先手)
        
        state = GameState(
            board=board,
            hand_pieces={'first': [], 'second': []},
            current_player='second',
            turn=12,
            game_result=None,
            history=[],
            maguro_in_enemy_territory={'first': True, 'second': False}
        )
        
        # 後手がまぐろを捕獲しない手を打つ
        move = parse_move('ま↓A3A4')  # まぐろ移動
        new_state, error = make_move(state, move)
        self.assertIsNone(error)
        
        # まぐろが生き残ったので先手の勝利
        result = check_maguro_victory(new_state)
        self.assertEqual(result, 'first')
    
    def test_specific_board_victory_conditions_with_capture(self):
        """後手がまぐろを捕獲する場合の勝利判定"""
        # TypeScriptテストと同じ盤面設定
        board = [[None for _ in range(3)] for _ in range(4)]
        board[0][0] = Piece(PieceType.MAGURO, 'second')   # A1: まぐろ(後手)
        board[0][1] = Piece(PieceType.MAGURO, 'first')   # B1: まぐろ(先手)
        board[0][2] = Piece(PieceType.TAKO, 'second')    # C1: たこ(後手)
        board[1][1] = Piece(PieceType.INADA, 'second')   # B2: いなだ(後手)
        board[2][0] = Piece(PieceType.MAGURO, 'second')  # A3: まぐろ(後手)
        board[2][1] = Piece(PieceType.INADA, 'first')    # B3: いなだ(先手)
        board[3][0] = Piece(PieceType.TAKO, 'first')     # A4: たこ(先手)
        board[3][2] = Piece(PieceType.KAREI, 'first')    # C4: かれい(先手)
        
        state = GameState(
            board=board,
            hand_pieces={'first': [], 'second': []},
            current_player='second',
            turn=12,
            game_result=None,
            history=[],
            maguro_in_enemy_territory={'first': True, 'second': False}
        )
        
        # 後手がまぐろで先手のまぐろを捕獲
        move = parse_move('ま↓A1B1')
        new_state, error = make_move(state, move)
        self.assertIsNone(error)
        
        # まぐろ捕獲で後手の勝利
        self.assertEqual(new_state.game_result, 'second')