#!/usr/bin/env python3
"""
おさかな対戦 - バッチ実行
コマンドライン引数で棋譜を受け取って実行
"""

import sys
from board_game_logic import (
    initialize_game, get_board_text, get_game_info_text,
    parse_move, make_move
)


def run_batch_game(moves):
    """バッチモードでゲームを実行"""
    print("=== おさかな対戦 バッチ実行 ===\n")
    
    game_state = initialize_game()
    print("初期盤面:")
    print(get_board_text(game_state.board))
    print()
    
    # 各手を実行
    for i, move_str in enumerate(moves):
        player = "先手" if game_state.current_player == 'first' else "後手"
        print(f"手{i + 1}: {player} - {move_str}")
        
        move = parse_move(move_str)
        if not move:
            print(f"エラー: 無効な手 '{move_str}'")
            print("ゲームを中断します。")
            sys.exit(1)
        
        new_state, error = make_move(game_state, move)
        if error:
            print(f"エラー: {error}")
            print("ゲームを中断します。")
            sys.exit(1)
        
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
    
    # 最終状態の表示
    print("=" * 40)
    print("最終状態:")
    print(get_game_info_text(game_state))
    print("=" * 40)
    
    if game_state.game_result == 'draw':
        print("結果: 引き分け")
    elif game_state.game_result:
        winner = "先手" if game_state.game_result == 'first' else "後手"
        print(f"結果: {winner}の勝利！")
    else:
        print("ゲームは継続中です。")


def main():
    if len(sys.argv) < 2:
        print("使用方法: python batch_game.py <手1> <手2> ...")
        print("例: python batch_game.py \"い↑B3B2\" \"い↓B1B2\" \"た→C3C2\"")
        sys.exit(1)
    
    moves = sys.argv[1:]
    run_batch_game(moves)


if __name__ == "__main__":
    main()