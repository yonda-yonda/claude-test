from enum import Enum
from typing import TypedDict, Literal, Optional, List
from dataclasses import dataclass


class PieceType(Enum):
    MAGURO = 'ま'  # まぐろ
    INADA = 'い'   # いなだ
    BURI = 'ぶ'    # ぶり
    TAKO = 'た'    # たこ
    KAREI = 'か'   # かれい


Player = Literal['first', 'second']


@dataclass(frozen=True)
class Position:
    col: Literal['A', 'B', 'C']
    row: Literal[1, 2, 3, 4]
    
    def __str__(self):
        return f"{self.col}{self.row}"


@dataclass(frozen=True)
class Piece:
    type: PieceType
    player: Player
    
    def __str__(self):
        return self.type.value


Board = List[List[Optional[Piece]]]


class HandPieces(TypedDict):
    first: List[PieceType]
    second: List[PieceType]


class MaguroInEnemyTerritory(TypedDict):
    first: bool
    second: bool


@dataclass
class GameState:
    board: Board
    hand_pieces: HandPieces
    current_player: Player
    turn: int
    game_result: Optional[Player]
    history: List[str]
    maguro_in_enemy_territory: MaguroInEnemyTerritory
    
    def copy(self):
        """ディープコピーを作成"""
        import copy
        return copy.deepcopy(self)


@dataclass
class Move:
    piece_type: PieceType
    from_position: Optional[Position]
    to_position: Position
    is_placement: bool


# 各コマの移動可能方向を定義（col_delta, row_delta）
PIECE_MOVES = {
    PieceType.MAGURO: [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)],  # 8方向全て
    PieceType.INADA: [(0, -1)],  # 前のみ
    PieceType.BURI: [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (0, 1)],  # 6方向
    PieceType.TAKO: [(-1, -1), (1, -1)],  # 斜め前2方向
    PieceType.KAREI: [(0, -1), (-1, 1), (1, 1)]  # 前と斜め後ろ2方向
}


# プレイヤーごとの前方向（first: 上、second: 下）
FORWARD_DIRECTION = {
    'first': 1,
    'second': -1
}