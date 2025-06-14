#!/usr/bin/env python3
"""
おさかな対戦 - インタラクティブCLI版
"""

import sys
from board_game_logic import (
    initialize_game, get_board_text, get_game_info_text,
    parse_move, make_move
)


def print_game_state(game_state):
    """ゲーム状態を表示"""
    print("\n" + "=" * 30)
    print(get_board_text(game_state.board))
    print("-" * 30)
    print(get_game_info_text(game_state))
    print("=" * 30)


def print_help():
    """ヘルプメッセージを表示"""
    print("\n=== 操作方法 ===")
    print("移動: コマ種類+方向+移動元+移動先 (例: い↑B3B2)")
    print("配置: コマ種類+*+配置先 (例: い*B2)")
    print("コマ: ま=まぐろ, い=いなだ, ぶ=ぶり, た=たこ, か=かれい")
    print("方向: ↑↓→← (実際の移動方向とは関係なく入力)")
    print("help: このヘルプを表示")
    print("quit: ゲームを終了")
    print("================\n")


def main():
    print("おさかな対戦へようこそ！")
    print("'help'でヘルプを表示します。")
    
    game_state = initialize_game()
    print_game_state(game_state)
    
    while game_state.game_result is None:
        player = "先手" if game_state.current_player == 'first' else "後手"
        
        try:
            move_input = input(f"\n{player}の番です。手を入力してください: ").strip()
            
            if move_input.lower() == 'quit':
                print("ゲームを終了します。")
                sys.exit(0)
            elif move_input.lower() == 'help':
                print_help()
                continue
            
            # 手を解析
            move = parse_move(move_input)
            if not move:
                print("エラー: 入力形式が正しくありません。'help'でヘルプを表示できます。")
                continue
            
            # 移動を実行
            new_state, error = make_move(game_state, move)
            if error:
                print(f"エラー: {error}")
                continue
            
            game_state = new_state
            print_game_state(game_state)
            
        except KeyboardInterrupt:
            print("\n\nゲームを中断しました。")
            sys.exit(0)
        except Exception as e:
            print(f"予期しないエラーが発生しました: {e}")
            continue
    
    # ゲーム終了
    print("\n" + "★" * 30)
    if game_state.game_result == 'draw':
        print("引き分けです！")
    else:
        winner = "先手" if game_state.game_result == 'first' else "後手"
        print(f"{winner}の勝利です！")
    print("★" * 30)


if __name__ == "__main__":
    main()