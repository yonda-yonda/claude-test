# 要件
RULE.mdを元に、おさかな対戦のソフトウェアをTypeScriptで作成する。

## ゲームロジック
以下の条件を満たすクラスを作成する。

* 盤面（ステージの配置、手ゴマの種類）を記憶している。
* 先手後手どちらのターンか、現在何ターン目かを記憶している。ターンは1から開始する。
* 手を入力するとバリデーションを行い、有効な手であれば盤面とターンを更新する。勝敗が決まった場合は結果として返す。無効な手であれば無効な理由を返す。
* 現在の盤面をテキストで出力することができる。

### バリデーション
以下の条件のいずれかに違反する手が入力された場合、無効と判定する。

* 手番と一致しない手
* 対象のコマが移動できないマスへ移動させる手
* 移動先のマスに自分のコマが存在する手
* ステージの外へ移動させる手
* 手駒を自分のコマが存在するマスに配置する手
* 手駒をステージの外に配置する手
* 相手のコマを移動させる手
* マスに存在しないコマを移動させる手
* 所持していない手ゴマを配置する手
* その他、RULE.mdの内容から違反と判断される手


## GUI
React.jsで以下を満たすブラウザゲームを作成する。

* 先手後手が手を入力してゲームを進めることができる。
* 盤面の状態が確認できる。
* 勝敗が決まったら勝者が盛大に祝われる。
* 有効でない手を選択した場合はアラートを出す。

