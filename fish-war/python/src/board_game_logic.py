import re
from typing import Optional, List, Tuple
from collections import Counter

from board_game_types import (
    PieceType, Player, Position, Piece, Board, GameState, Move,
    PIECE_MOVES, FORWARD_DIRECTION
)


def initialize_game() -> GameState:
    """ゲームの初期状態を作成"""
    # 4×3の空盤面を作成
    board: Board = [[None for _ in range(3)] for _ in range(4)]
    
    # 初期配置（TypeScript版に合わせて修正）
    # 先手（下側）
    board[3][0] = Piece(PieceType.TAKO, 'first')
    board[3][1] = Piece(PieceType.MAGURO, 'first')
    board[3][2] = Piece(PieceType.KAREI, 'first')
    board[2][1] = Piece(PieceType.INADA, 'first')
    
    # 後手（上側）
    board[0][0] = Piece(PieceType.KAREI, 'second')
    board[0][1] = Piece(PieceType.MAGURO, 'second')
    board[0][2] = Piece(PieceType.TAKO, 'second')
    board[1][1] = Piece(PieceType.INADA, 'second')
    
    return GameState(
        board=board,
        hand_pieces={'first': [], 'second': []},
        current_player='first',
        turn=1,
        game_result=None,
        history=[get_board_hash(board)],
        maguro_in_enemy_territory={'first': False, 'second': False}
    )


def position_to_index(position: Position) -> Tuple[int, int]:
    """Position型を配列インデックスに変換"""
    col_map = {'A': 0, 'B': 1, 'C': 2}
    return position.row - 1, col_map[position.col]


def index_to_position(row: int, col: int) -> Optional[Position]:
    """配列インデックスをPosition型に変換"""
    if 0 <= row < 4 and 0 <= col < 3:
        col_map = ['A', 'B', 'C']
        return Position(col_map[col], row + 1)
    return None


def get_board_text(board: Board) -> str:
    """盤面をテキスト形式で出力"""
    result = []
    result.append("  A B C")
    
    for row in range(4):
        row_text = f"{row + 1} "
        for col in range(3):
            piece = board[row][col]
            if piece:
                row_text += f"{piece.type.value} "
            else:
                row_text += "・ "
        result.append(row_text.rstrip())
    
    return '\n'.join(result)


def get_board_hash(board: Board) -> str:
    """盤面のハッシュ値を生成（引き分け判定用）"""
    board_str = ""
    for row in board:
        for cell in row:
            if cell:
                board_str += f"{cell.type.value}{cell.player[0]}"
            else:
                board_str += "00"
    return board_str


def get_possible_moves(piece_type: PieceType, position: Position, player: Player) -> List[Position]:
    """コマの移動可能位置を計算"""
    row, col = position_to_index(position)
    moves = []
    
    for dc, dr in PIECE_MOVES[piece_type]:
        # プレイヤーによって前後を反転
        if player == 'first':
            dr = dr * FORWARD_DIRECTION['first']
        else:
            dr = dr * FORWARD_DIRECTION['second']
            
        new_row = row + dr
        new_col = col + dc
        
        new_pos = index_to_position(new_row, new_col)
        if new_pos:
            moves.append(new_pos)
    
    return moves


def validate_move(game_state: GameState, move: Move) -> Optional[str]:
    """移動の妥当性を検証"""
    # 手番の確認
    if game_state.game_result:
        return "ゲームは既に終了しています"
    
    if move.is_placement:
        # 手ゴマの配置
        if move.piece_type not in game_state.hand_pieces[game_state.current_player]:
            return f"{move.piece_type.value}を持っていません"
        
        to_row, to_col = position_to_index(move.to_position)
        if game_state.board[to_row][to_col] is not None:
            return "配置先にコマが存在します"
    else:
        # 通常の移動
        if not move.from_position:
            return "移動元が指定されていません"
            
        from_row, from_col = position_to_index(move.from_position)
        piece = game_state.board[from_row][from_col]
        
        if not piece:
            return "移動元にコマが存在しません"
        
        if piece.player != game_state.current_player:
            return "相手のコマは動かせません"
        
        if piece.type != move.piece_type:
            return f"指定されたコマ（{move.piece_type.value}）と実際のコマ（{piece.type.value}）が一致しません"
        
        # 移動可能位置の確認
        possible_moves = get_possible_moves(piece.type, move.from_position, piece.player)
        if move.to_position not in possible_moves:
            return "その位置には移動できません"
        
        # 移動先に自分のコマがないか確認
        to_row, to_col = position_to_index(move.to_position)
        target_piece = game_state.board[to_row][to_col]
        if target_piece and target_piece.player == game_state.current_player:
            return "自分のコマがある位置には移動できません"
    
    return None


def update_maguro_status(game_state: GameState) -> None:
    """まぐろの相手陣地到達状態を更新"""
    # 先手のまぐろが後手陣地（1行目）にいるか
    for col in range(3):
        piece = game_state.board[0][col]
        if piece and piece.type == PieceType.MAGURO and piece.player == 'first':
            game_state.maguro_in_enemy_territory['first'] = True
            break
    
    # 後手のまぐろが先手陣地（4行目）にいるか
    for col in range(3):
        piece = game_state.board[3][col]
        if piece and piece.type == PieceType.MAGURO and piece.player == 'second':
            game_state.maguro_in_enemy_territory['second'] = True
            break


def check_maguro_victory(game_state: GameState) -> Optional[Player]:
    """まぐろの相手陣地到達による勝利判定"""
    # 各プレイヤーのまぐろが相手陣地にいるかチェック
    for player in ['first', 'second']:
        if game_state.maguro_in_enemy_territory[player]:
            # プレイヤーのまぐろが相手陣地にいることを確認
            enemy_row = 0 if player == 'first' else 3
            for col in range(3):
                piece = game_state.board[enemy_row][col]
                if piece and piece.type == PieceType.MAGURO and piece.player == player:
                    # まぐろが相手陣地にいて、相手が1手打った後（現在そのプレイヤーの番）なら勝利
                    if game_state.current_player == player:
                        return player
    
    return None


def check_for_draw(game_state: GameState) -> bool:
    """引き分け判定（同じ盤面が3回出現）"""
    counter = Counter(game_state.history)
    return any(count >= 3 for count in counter.values())


def make_move(game_state: GameState, move: Move) -> Tuple[GameState, Optional[str]]:
    """移動を実行し、新しいゲーム状態を返す"""
    # 移動の妥当性チェック
    error = validate_move(game_state, move)
    if error:
        return game_state, error
    
    # ゲーム状態のコピーを作成
    new_state = game_state.copy()
    
    if move.is_placement:
        # 手ゴマの配置
        to_row, to_col = position_to_index(move.to_position)
        new_state.board[to_row][to_col] = Piece(move.piece_type, new_state.current_player)
        new_state.hand_pieces[new_state.current_player].remove(move.piece_type)
    else:
        # 通常の移動
        from_row, from_col = position_to_index(move.from_position)
        to_row, to_col = position_to_index(move.to_position)
        
        piece = new_state.board[from_row][from_col]
        target_piece = new_state.board[to_row][to_col]
        
        # コマを移動
        new_state.board[to_row][to_col] = piece
        new_state.board[from_row][from_col] = None
        
        # いなだの出世判定（まぐろ捕獲判定より先に実行）
        enemy_territory_row = 0 if piece.player == 'first' else 3
        if piece.type == PieceType.INADA and to_row == enemy_territory_row:
            new_state.board[to_row][to_col] = Piece(PieceType.BURI, piece.player)
        
        # 相手のコマを捕獲
        if target_piece:
            captured_type = target_piece.type
            # ぶりは捕獲時にいなだに降格
            if captured_type == PieceType.BURI:
                captured_type = PieceType.INADA
            
            new_state.hand_pieces[new_state.current_player].append(captured_type)
            
            # まぐろを捕獲したら即勝利
            if target_piece.type == PieceType.MAGURO:
                new_state.game_result = new_state.current_player
                return new_state, None
    
    # 履歴に追加
    new_state.history.append(get_board_hash(new_state.board))
    
    # 手番交代
    new_state.current_player = 'second' if new_state.current_player == 'first' else 'first'
    new_state.turn += 1
    
    # まぐろ位置の更新
    update_maguro_status(new_state)
    
    # まぐろ勝利判定
    winner = check_maguro_victory(new_state)
    if winner:
        new_state.game_result = winner
    
    # 引き分け判定
    elif check_for_draw(new_state):
        new_state.game_result = 'draw'
    
    return new_state, None


def parse_move(move_str: str) -> Optional[Move]:
    """文字列形式の手を解析してMove型に変換"""
    # 手ゴマ配置: "い*B2"
    placement_match = re.match(r'^([まいぶたか])\*([ABC])([1-4])$', move_str)
    if placement_match:
        piece_char, col, row = placement_match.groups()
        piece_type = next(p for p in PieceType if p.value == piece_char)
        return Move(
            piece_type=piece_type,
            from_position=None,
            to_position=Position(col, int(row)),
            is_placement=True
        )
    
    # 通常移動: "い↑B3B2" または "い→B3C3"
    move_match = re.match(r'^([まいぶたか])[↑↓→←]([ABC])([1-4])([ABC])([1-4])$', move_str)
    if move_match:
        piece_char, from_col, from_row, to_col, to_row = move_match.groups()
        piece_type = next(p for p in PieceType if p.value == piece_char)
        return Move(
            piece_type=piece_type,
            from_position=Position(from_col, int(from_row)),
            to_position=Position(to_col, int(to_row)),
            is_placement=False
        )
    
    return None


def get_game_info_text(game_state: GameState) -> str:
    """ゲーム情報をテキスト形式で出力"""
    result = []
    result.append(f"ターン: {game_state.turn}")
    result.append(f"手番: {'先手' if game_state.current_player == 'first' else '後手'}")
    
    # 手ゴマ
    first_hand = ''.join(p.value for p in game_state.hand_pieces['first'])
    second_hand = ''.join(p.value for p in game_state.hand_pieces['second'])
    result.append(f"先手の手ゴマ: {first_hand if first_hand else 'なし'}")
    result.append(f"後手の手ゴマ: {second_hand if second_hand else 'なし'}")
    
    # 勝敗
    if game_state.game_result:
        if game_state.game_result == 'draw':
            result.append("結果: 引き分け")
        else:
            winner = '先手' if game_state.game_result == 'first' else '後手'
            result.append(f"結果: {winner}の勝ち")
    
    return '\n'.join(result)