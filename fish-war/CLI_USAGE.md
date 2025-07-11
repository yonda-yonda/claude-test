# おさかな対戦 CLI使用方法

## インタラクティブモード

対話形式でゲームをプレイします。

```bash
npx tsx src/cli/playGame.ts
```

### 操作方法
- 手を入力: `い↑B3B2` (いなだをB3からB2へ移動)
- 手ゴマ配置: `い↑A3★` (手ゴマのいなだをA3に配置)
- 終了: `quit`

### 実行例
```
=================================
       おさかな対戦 CLI
=================================

  A    B    C
 --------------
| か↓| ま↓| た↓| 1
 --------------
|    | い↓|    | 2
 --------------
|    | い↑|    | 3
 --------------
| た↑| ま↑| か↑| 4
 --------------

手ゴマ置き場
先手：なし
後手：なし
現在のターン：1 (先手)

手を入力してください (例: い↑B3B2, 終了: quit): い↑B3B2
```

## サンプルゲーム実行

事前に定義されたゲームの流れを確認できます。

```bash
npx tsx src/cli/sampleGame.ts
```

## バッチ実行モード

コマンドライン引数で複数の手を一度に実行します。

```bash
npx tsx src/cli/batchGame.ts "い↑B3B2" "ま↓B1B2" "ま↑B4B3"
```

### 使用例

#### 短いゲーム
```bash
# 先手のいなだを前進させ、後手のまぐろで捕獲
npx tsx src/cli/batchGame.ts "い↑B3B2" "ま↓B1B2"
```

#### 勝利までのシナリオ
```bash
# まぐろ捕獲による勝利の例
npx tsx src/cli/batchGame.ts \
  "い↑B3B2" \
  "ま↓B1B2" \
  "ま↑B4B3" \
  "ま↓B2B3"
```

## 手の記法

### 移動
`[コマ][方向][移動元][移動先]`
- コマ: ま、い、ぶ、た、か
- 方向: ↑(先手)、↓(後手)
- 例: `ま↑B4A3` (先手のまぐろをB4からA3へ)

### 手ゴマ配置
`[コマ][方向][配置先]★`
- 例: `い↑A3★` (先手の手ゴマのいなだをA3に配置)

## エラーハンドリング

無効な手を入力した場合、詳細なエラーメッセージが表示されます：
- 手番が違います
- そのコマはその位置に移動できません
- 自分のコマがある位置には移動できません
- 所持していない手ゴマです
- etc...