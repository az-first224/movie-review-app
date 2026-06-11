# 作品レビュー記録アプリ

映画、ドラマ、アニメ、ゲーム、小説、音楽などのレビューを記録できるWebアプリです。
データ保存は `localStorage` ではなく Supabase を使うため、同じSupabaseプロジェクトを参照すればPCとスマホで同じレビュー一覧を共有できます。

## ファイル構成

- `index.html`: 画面のHTML
- `styles.css`: デザインとレスポンシブ対応
- `app.js`: Supabase連携、登録、編集、削除、検索、絞り込み処理
- `supabase-config.example.js`: Supabase接続設定のサンプル
- `supabase-schema.sql`: テーブル作成、RLSポリシー、サンプルデータ投入SQL
- `supabase-public-policies.sql`: 管理者限定RLSから公開CRUDへ戻すSQL
- `README.md`: この説明書

## Supabaseの準備

1. Supabaseで新しいプロジェクトを作成します。
2. Supabase管理画面の SQL Editor を開きます。
3. `supabase-schema.sql` の内容を貼り付けて実行します。
4. Project Settings > API で以下を確認します。
   - Project URL
   - anon public key

## Vercelの簡易パスワード

Vercelの Environment Variables に以下を設定します。

```text
SITE_PASSWORD=任意のサイトパスワード
```

設定後に再デプロイすると、ログイン画面と署名付きCookieによるアクセス制限が有効になります。
パスワード自体はブラウザへ配信されません。Cookieの有効期間は7日間です。

## テーブル設計

テーブル名: `public.review_records`

主なカラム:

- `id`: UUID、主キー
- `title`: 作品タイトル
- `director`: 監督名
- `tagline`: キャッチコピー
- `cast_names`: 出演者
- `rating`: 0.0〜5.0の評価点
- `category`: 映画、漫画、ドラマ、アニメ、ゲーム、スポーツ、小説、音楽のいずれか
- `genres`: 複数ジャンルを保存する `text[]`
- `comment`: コメント本文
- `created_at`: 登録日時
- `updated_at`: 更新日時

## SQL

SQLは [supabase-schema.sql](C:/AI/test/supabase-schema.sql) に入っています。

このSQLには以下が含まれます。

- `review_records` テーブル作成
- `updated_at` 自動更新トリガー
- Row Level Security の有効化
- anon key での select / insert / update / delete ポリシー
- サンプルデータ3件

個人用でログインなしの共有アプリにするため、anon key でCRUDできるポリシーにしています。URLとanon keyを知っている人はデータを操作できるため、公開サイトとして使う場合はログイン機能とユーザー別RLSに変更してください。

## 管理者限定ポリシーから公開CRUDへ戻す

過去に `supabase-owner-policies.sql` を実行した環境では、Supabase SQL Editorで `supabase-public-policies.sql` を実行してください。
これにより管理者限定ポリシーが削除され、ログインなしで全員が登録・編集・削除できる状態になります。

この設定はURLを知っている全員に書き込み権限を与えます。インターネットへ一般公開する場合は、データの改変や削除が誰でも可能になる点に注意してください。

## 環境変数と設定ファイル

ブラウザだけで動くHTML/CSS/JavaScript構成では、Node.jsのように `.env` を直接読み込めません。
そのため、開発時は以下の環境変数名で値を管理し、ブラウザ用の `supabase-config.js` に反映してください。

環境変数名:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

このアプリで実際に読み込む設定ファイル:

```js
window.REVIEW_APP_SUPABASE = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

設定手順:

1. `supabase-config.example.js` を同じフォルダ内にコピーします。
2. コピーしたファイル名を `supabase-config.js` に変更します。
3. `url` と `anonKey` を自分のSupabaseプロジェクトの値に置き換えます。

PowerShellで環境変数から `supabase-config.js` を作る例:

```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
$env:SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

@"
window.REVIEW_APP_SUPABASE = {
  url: "$env:SUPABASE_URL",
  anonKey: "$env:SUPABASE_ANON_KEY"
};
"@ | Set-Content -Encoding utf8 supabase-config.js
```

`supabase-config.js` は `.gitignore` に入れてあります。キーを含むため、共有や公開リポジトリへの追加は避けてください。

## 使い方

1. `supabase-config.js` を作成します。
2. `index.html` をブラウザで開きます。
3. 入力フォームに作品情報を入力します。
4. 星評価はスライダーまたは数値入力で、0.0から5.0まで0.1単位で指定できます。
5. カテゴリータグは `映画`、`漫画`、`ドラマ`、`アニメ`、`ゲーム`、`スポーツ`、`小説`、`音楽` から1つ選択します。
6. ジャンルは複数選択できます。
7. `登録する` を押すとSupabaseへ保存されます。

## 主な機能

- 作品レビューの新規登録
- Supabaseからのレビュー一覧取得
- レビューの編集
- レビューの削除
- 作品タイトル、監督名、出演者、ジャンル、カテゴリー、コメント本文で検索
- 星評価で絞り込み
- ジャンルで絞り込み
- カテゴリーで絞り込み
- 登録日時と更新日時の表示
- PCとスマホで同じレビュー一覧を共有

## 動作確認方法

1. SupabaseでSQLを実行します。
2. `supabase-config.js` を作成します。
3. `index.html` を開きます。
4. SQLのサンプルデータが3件表示されることを確認します。
5. 新しいレビューを登録します。
6. 別のブラウザ、PC、スマホで同じ `index.html` を開き、同じSupabase設定を使ってレビューが見えることを確認します。
7. `編集`、`更新`、`削除`、検索、絞り込みを確認します。

スマホで同じ画面を開くには、このフォルダを静的サイトとして配信するか、同じファイル一式をスマホからアクセスできる場所に置いてください。Supabase側に保存されるため、接続先が同じなら一覧は共有されます。
