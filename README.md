# Pleasanter MCP サーバー

Implem.Pleasanter統合のためのModel Context Protocol (MCP)サーバーです。AIアシスタントがPleasanterのプロジェクトや課題を操作できるようになります。

## 機能

### ツール
- **課題管理**: 課題の作成、読み取り、更新、削除
- **高度な検索**: プロジェクト全体での複雑なフィルタリングと検索
- **分析機能**: トレンド分析とプロジェクトステータスサマリー
- **バルク操作**: 複数課題の効率的な一括処理

### リソース
- **サイト**: 利用可能なPleasanterプロジェクトへのアクセス
- **ユーザー/グループ/部署**: 組織構造情報
- **動的リソース**: リアルタイムのプロジェクトステータスと課題データ

### プロンプト
- **プロジェクトステータスレポート**: 自動化されたプロジェクト健全性レポート
- **課題分析**: トレンド分析とレコメンデーション
- **チーム生産性**: パフォーマンス分析と洞察
- **優先タスク特定**: 緊急タスクの特定とアクションプラン
- **週次スタンドアップ準備**: チームミーティングの準備

## インストール

1. **サーバーコードのクローンまたはダウンロード**
   ```bash
   cd pleasanter-mcp-server
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **サーバーのビルド**
   ```bash
   npm run build
   ```

## 前提条件

- Node.js 18.0.0 以上（推奨: 24.x LTS）
- npm または yarn
- Pleasanter サーバーへのアクセス権限とAPIキー

### 動作確認済み環境

以下の環境でビルドと動作確認が完了しています：

- **OS**: Ubuntu 24.04.2 LTS (WSL2)
- **Node.js**: v24.2.0
- **npm**: v11.3.0
- **TypeScript**: v5.8.3
- **プラットフォーム**: WSL2 on Windows

## 設定

1. **環境ファイルの作成**
   ```bash
   cp .env.example .env
   ```

2. **設定の編集**
   ```env
   # 必須設定
   PLEASANTER_BASE_URL=http://10.255.20.80:50001  # ローカルネットワーク内のPleasanterサーバー
   PLEASANTER_API_KEY=your-api-key-here          # PleasanterのAPIキー
   
   # オプション設定
   PLEASANTER_TIMEOUT=30000
   PLEASANTER_RETRIES=3
   LOG_LEVEL=info
   ```
   
   **注意**: 
   - 本番環境ではHTTPSを使用してください
   - APIキーは安全に管理し、定期的にローテーションしてください

3. **Pleasanter APIキーの取得**
   - Pleasanterシステムにログイン
   - ユーザー設定に移動
   - APIキーを生成またはコピー
   - アカウントでAPIアクセスが有効になっていることを確認

## Claude Desktopでの使用方法

### macOS環境

1. **Claude Desktop設定に追加**
   
   `~/Library/Application Support/Claude/claude_desktop_config.json` を編集:
   
   ```json
   {
     "mcpServers": {
       "pleasanter": {
         "command": "node",
         "args": ["/path/to/pleasanter-mcp-server/dist/index.js"],
         "env": {
           "PLEASANTER_BASE_URL": "https://your-pleasanter-server.com",
           "PLEASANTER_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

### Windows環境

1. **Claude Desktop設定に追加**
   
   `%APPDATA%\Claude\claude_desktop_config.json` を編集:
   
   **オプション1: WSLコマンドを使用（推奨）**
   ```json
   {
     "mcpServers": {
       "pleasanter": {
         "command": "wsl",
         "args": [
           "node",
           "/home/ubuntu/github/Implem.Pleasanter/pleasanter-mcp-server/dist/index.js"
         ],
         "env": {
           "PLEASANTER_BASE_URL": "http://10.255.20.80:50001",
           "PLEASANTER_API_KEY": "your-api-key-here",
           "PLEASANTER_TIMEOUT": "30000",
           "PLEASANTER_RETRIES": "3",
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```
   
   **オプション2: WSL2パスを直接指定**
   ```json
   {
     "mcpServers": {
       "pleasanter": {
         "command": "node",
         "args": [
           "\\\\wsl.localhost\\Ubuntu\\home\\ubuntu\\github\\Implem.Pleasanter\\pleasanter-mcp-server\\dist\\index.js"
         ],
         "env": {
           "PLEASANTER_BASE_URL": "http://10.255.20.80:50001",
           "PLEASANTER_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

   **オプション3: Windows側にプロジェクトをコピーした場合**
   ```json
   {
     "mcpServers": {
       "pleasanter": {
         "command": "node",
         "args": ["C:\\path\\to\\pleasanter-mcp-server\\dist\\index.js"],
         "env": {
           "PLEASANTER_BASE_URL": "http://10.255.20.80:50001",
           "PLEASANTER_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

### Linux環境

1. **Claude Desktop設定に追加**
   
   `~/.config/Claude/claude_desktop_config.json` を編集:
   
   ```json
   {
     "mcpServers": {
       "pleasanter": {
         "command": "node",
         "args": ["/path/to/pleasanter-mcp-server/dist/index.js"],
         "env": {
           "PLEASANTER_BASE_URL": "https://your-pleasanter-server.com",
           "PLEASANTER_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

2. **Claude Desktopを再起動**

3. **接続を確認**
   
   Claude Desktopで以下のプロンプトを試して、MCPサーバーが正常に動作していることを確認してください:

   **ステップ1: 基本接続確認**
   ```
   利用可能なPleasanterサイトを一覧表示できますか？
   ```
   
   **期待される結果**: サイト一覧が表示されるか、適切なエラーメッセージが表示される

   **ステップ2: リソース確認**
   ```
   利用可能なPleasanterリソースにはどのようなものがありますか？
   ```
   
   **期待される結果**: pleasanter://sites、pleasanter://users等のリソース一覧が表示される

   **ステップ3: ツール確認**
   ```
   Pleasanter関連で利用できるツールや機能を教えてください。
   ```
   
   **期待される結果**: pleasanter_create_issue、pleasanter_get_issues等のツール一覧が表示される

   **ステップ4: ユーザー情報確認**
   ```
   Pleasanterのユーザー一覧を最初の5件だけ取得してください。
   ```
   
   **期待される結果**: JSON形式でユーザー情報が表示される

   **もしエラーが発生した場合**:
   - APIキーが正しく設定されているか確認
   - PLEASANTER_BASE_URLが正しいか確認
   - Claude Desktopを完全に再起動
   - MCPサーバーのログを確認（コンソールエラーなど）

## 利用可能なツール

### 課題管理
- `pleasanter_create_issue`: 新しい課題を作成
- `pleasanter_get_issues`: 課題を検索・取得
- `pleasanter_update_issue`: 既存の課題を更新
- `pleasanter_delete_issue`: 課題を削除
- `pleasanter_bulk_create_issues`: 複数の課題を一括作成

### 高度な検索・分析
- `pleasanter_advanced_search`: フィルターを使った複雑な検索
- `pleasanter_multi_site_search`: 複数プロジェクトの横断検索
- `pleasanter_trend_analysis`: プロジェクトトレンド分析
- `pleasanter_status_summary`: プロジェクトステータスサマリー

## 利用可能なリソース

- `pleasanter://sites`: 利用可能なプロジェクト一覧
- `pleasanter://users`: ユーザーディレクトリ
- `pleasanter://groups`: グループ情報
- `pleasanter://depts`: 部署構造
- `pleasanter://sites/{siteId}/issues`: プロジェクト固有の課題
- `pleasanter://sites/{siteId}/summary`: プロジェクトサマリー
- `pleasanter://sites/{siteId}/status`: プロジェクトステータス

## 利用可能なプロンプト

- `project_status_report`: 包括的なプロジェクトレポートを生成
- `issue_analysis`: 課題トレンドを分析し、レコメンデーションを提供
- `team_productivity_report`: チームパフォーマンス分析
- `priority_task_identification`: 緊急タスクを特定し、アクションプランを作成
- `weekly_standup_preparation`: 週次スタンドアップ情報を準備

## 開発

### 開発モードでの実行
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### テスト
```bash
npm test
```

### リント
```bash
npm run lint
```

## トラブルシューティング

### よくある問題

1. **接続失敗**
   - PLEASANTER_BASE_URLが正しいことを確認
   - APIキーの有効性をチェック
   - ネットワーク接続を確認

2. **認証エラー**
   - APIキーが正しいことを確認
   - ユーザーのAPIアクセスが有効になっているかチェック
   - ユーザーに必要な権限があることを確認

3. **レート制限**
   - サーバーはPleasanterのレート制限を遵守します
   - リトライには指数バックオフを実装
   - 日次のAPI使用量を監視

### デバッグモード
詳細なログを表示するには、環境変数で `LOG_LEVEL=debug` を設定してください。

### Windows環境固有の問題

1. **WSLコマンドが見つからない**
   - Windows Subsystem for Linux (WSL)がインストールされているか確認
   - `wsl --version` でWSLのバージョンを確認

2. **パスの区切り文字の問題**
   - Windowsのパスはバックスラッシュ `\` を使用
   - JSON内ではエスケープが必要: `\\`

3. **ファイアウォールの問題**
   - Claude DesktopがMCPサーバーにアクセスできない場合
   - Windows Defenderファイアウォールでポートを許可する必要がある場合があります

## セキュリティに関する考慮事項

- APIキーは安全に保管してください
- 設定には環境変数を使用してください
- 適切なアクセス制御を実装してください
- API使用量を監視してください
- 定期的にキーをローテーションしてください

## WSL2環境での開発

Windows環境でWSL2を使用している場合の特別な設定：

### 1. WSL2での環境構築
```bash
# WSL2 Ubuntu環境でのセットアップ
sudo apt update
sudo apt install nodejs npm

# プロジェクトのセットアップ
cd /home/ubuntu/github/Implem.Pleasanter/pleasanter-mcp-server
npm install
npm run build
```

### 2. 環境変数の設定
```bash
# WSL2環境でのPleasanter設定
cp .env.example .env

# .envファイルを編集
PLEASANTER_BASE_URL=http://10.255.20.80:50001
PLEASANTER_API_KEY=your-api-key-here
```

### 3. Windows側からのアクセス
- WSL2のファイルシステムは `\\wsl.localhost\Ubuntu\` からアクセス可能
- Claude DesktopはWindows側で実行するため、WSLコマンドまたはWSL2パスを使用

## Docker環境での実行

### 完全なDocker環境構築

PleasanterのWebサーバーとMCPサーバーを含む完全な環境を構築できます：

```bash
# 1. 環境変数を設定
cp .env.example .env
# .envファイルを編集してPleasanter APIキーを設定

# 2. Docker環境を起動
docker-compose up -d

# 3. 初回セットアップの確認
docker-compose logs codedefiner

# 4. Webアプリケーションにアクセス
# http://localhost:8080 でPleasanterにアクセス

# 5. MCPサーバーの動作確認
# http://localhost:3000 でMCPサーバーの状態確認
```

### サービス構成

- **pleasanter-web**: PleasanterのWebアプリケーション (ポート8080)
- **db**: PostgreSQLデータベース (ポート5432)
- **codedefiner**: データベース初期化用 (一回のみ実行)
- **mcp-server**: MCPサーバー (ポート3000)

### トラブルシューティング

#### コンテナ停止・再起動
```bash
# 全サービス停止
docker-compose down

# データベースも含めて完全削除
docker-compose down -v

# 再構築
docker-compose up --build -d
```

#### ログの確認
```bash
# 全サービスのログ
docker-compose logs

# 特定サービスのログ
docker-compose logs pleasanter-web
docker-compose logs mcp-server
```

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください。