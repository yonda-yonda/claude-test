#!/usr/bin/env python3
"""
pytestがインストールされていない環境でもテストを実行するスクリプト
"""

import sys
import unittest
from pathlib import Path

# srcディレクトリをPythonパスに追加
sys.path.insert(0, str(Path(__file__).parent / "src"))

# テストモジュールをインポート
from tests.test_board_game_logic import TestBoardGameLogic
from tests.test_board_game_logic_maguro import TestMaguroVictory

def run_tests():
    """テストを実行"""
    # テストスイートを作成
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # テストクラスを追加
    suite.addTests(loader.loadTestsFromTestCase(TestBoardGameLogic))
    suite.addTests(loader.loadTestsFromTestCase(TestMaguroVictory))
    
    # テストを実行
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # 結果を返す
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)