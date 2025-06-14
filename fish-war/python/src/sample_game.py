#!/usr/bin/env python3
"""
おさかな対戦 - サンプルゲーム実行
"""

from board_game_logic import (
    initialize_game, get_board_text, get_game_info_text,
    parse_move, make_move
)


def run_sample_game():
    """サンプルゲームを実行"""
    # サンプルの棋譜（TypeScript版と同じ）
    sample_moves = [
        "い↑B3B2",  # 先手: いなだを前進（B3→B2）
        "ま↓B1B2",  # 後手: まぐろで先手のいなだを捕獲（B1→B2）
        "ま↑B4B3",  # 先手: まぐろを前進（B4→B3）
        "ま↓B2B3",  # 後手: まぐろで先手のまぐろを捕獲（B2→B3）→ゲーム終了
    ]
    
    print("=== おさかな対戦 サンプルゲーム ===\n")
    
    game_state = initialize_game()
    print("初期盤面:")
    print(get_board_text(game_state.board))
    print()
    
    # 各手を実行
    for i, move_str in enumerate(sample_moves):
        player = "先手" if game_state.current_player == 'first' else "後手"
        print(f"手{i + 1}: {player} - {move_str}")
        
        move = parse_move(move_str)
        if not move:
            print(f"エラー: 無効な手 '{move_str}'")
            break
        
        new_state, error = make_move(game_state, move)
        if error:
            print(f"エラー: {error}")
            break
        
        game_state = new_state
        print(get_board_text(game_state.board))
        
        # 手ゴマがある場合は表示
        first_hand = ''.join(p.value for p in game_state.hand_pieces['first'])
        second_hand = ''.join(p.value for p in game_state.hand_pieces['second'])
        if first_hand or second_hand:
            print(f"手ゴマ - 先手: {first_hand or 'なし'}, 後手: {second_hand or 'なし'}")
        
        print()
        
        # ゲーム終了判定
        if game_state.game_result:
            break
    
    # 結果表示
    print("=" * 40)
    if game_state.game_result == 'draw':
        print("結果: 引き分け")
    elif game_state.game_result:
        winner = "先手" if game_state.game_result == 'first' else "後手"
        print(f"結果: {winner}の勝利！")
    print("=" * 40)


if __name__ == "__main__":
    run_sample_game()