# CLAUDE.md
必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## テトリスプロジェクト
### プロジェクト概要

React.js + TypeScript で作成されたテトリスゲーム

### コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

### アーキテクチャ

#### ディレクトリ構造
- `/tetris-game/src/components` - Reactコンポーネント
  - `Game.tsx` - メインゲームコンポーネント
  - `Board.tsx` - ゲームボード表示
  - `NextPiece.tsx` - 次のピース表示
  - `GameInfo.tsx` - スコア・レベル表示
- `/tetris-game/src/hooks` - カスタムフック
  - `useGameLoop.ts` - ゲームループとキーボード操作
- `/tetris-game/src/types` - 型定義
  - `game.ts` - ゲーム関連の型とテトリミノ定義
- `/tetris-game/src/utils` - ユーティリティ関数
  - `gameLogic.ts` - ゲームロジック（回転、衝突判定、ライン消去）

#### 主要な設計パターン
- カスタムフックによるゲームループ管理
- レスポンシブデザイン（画面サイズに応じたセルサイズ自動調整）
- TypeScriptによる型安全性の確保

## ボードゲームプロジェクト

### プロジェクト概要

「おさかな対戦」- 将棋風の2人対戦ボードゲーム（4×3マス）

### コマンド

#### GUI版
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

#### CLI版
```bash
# インタラクティブモード
npx tsx fish-war/src/cli/playGame.ts

# サンプルゲーム実行
npx tsx fish-war/src/cli/sampleGame.ts

# バッチ実行
npx tsx fish-war/src/cli/batchGame.ts "い↑B3B2" "ま↓B1B2"
```

### アーキテクチャ

#### ディレクトリ構造
- `/fish-war/src/components` - Reactコンポーネント
  - `BoardGame.tsx` - メインゲームコンポーネント
  - `BoardGameBoard.tsx` - ゲームボード表示
  - `HandPieces.tsx` - 手ゴマ表示
  - `GameInfo.tsx` - ゲーム情報・勝敗表示
  - `MoveInput.tsx` - 手入力インターフェース
- `/fish-war/src/types` - 型定義
  - `boardGame.ts` - ゲーム関連の型定義
- `/fish-war/src/utils` - ユーティリティ関数
  - `boardGameLogic.ts` - ゲームロジック（移動、捕獲、勝敗判定）
- `/fish-war/src/cli` - CLIプログラム
  - `playGame.ts` - インタラクティブCLI
  - `sampleGame.ts` - サンプル実行
  - `batchGame.ts` - バッチ実行

#### 主要な機能
- **GUI版**
  - マウスクリックによるコマ選択・移動
  - テキスト入力による手入力（例: `い↑B3B2`）
  - 無効な手の選択時にアラート表示
  - 勝利時の祝福アニメーション
  - レスポンシブデザイン
- **CLI版**
  - 対話形式でのゲームプレイ
  - バッチ実行による自動プレイ
  - 詳細なエラーメッセージ表示

#### ゲームルール
- コマは5種類（まぐろ、いなだ、ぶり、たこ、かれい）
- 相手のまぐろを捕獲すると勝利
- 自分のまぐろが相手陣地に到達しても勝利
- いなだは相手陣地でぶりに出世
- 捕獲したコマは手ゴマとして再利用可能
