import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export class PromptTemplates {
  getPromptDefinitions(): Prompt[] {
    return [
      {
        name: 'project_status_report',
        description: 'プロジェクトのステータスレポートを生成します',
        arguments: [
          {
            name: 'siteId',
            description: '対象プロジェクトのサイトID',
            required: true,
          },
          {
            name: 'reportDate',
            description: 'レポート基準日（YYYY-MM-DD形式、省略時は今日）',
            required: false,
          },
          {
            name: 'includeTrends',
            description: 'トレンド分析を含める（true/false、デフォルト: true）',
            required: false,
          },
        ],
      },
      {
        name: 'issue_analysis',
        description: '課題の傾向分析とレコメンデーションを生成します',
        arguments: [
          {
            name: 'siteId',
            description: '分析対象サイトID',
            required: true,
          },
          {
            name: 'period',
            description: '分析期間（week/month/quarter、デフォルト: month）',
            required: false,
          },
          {
            name: 'focusArea',
            description: '重点分析領域（performance/quality/timeline、デフォルト: performance）',
            required: false,
          },
        ],
      },
      {
        name: 'team_productivity_report',
        description: 'チームの生産性レポートを生成します',
        arguments: [
          {
            name: 'siteId',
            description: '対象プロジェクトのサイトID',
            required: true,
          },
          {
            name: 'teamType',
            description: 'チーム分類方法（assignee/manager/group、デフォルト: assignee）',
            required: false,
          },
          {
            name: 'period',
            description: '分析期間（week/month/quarter、デフォルト: month）',
            required: false,
          },
        ],
      },
      {
        name: 'priority_task_identification',
        description: '優先対応すべき課題を特定し、アクションプランを提案します',
        arguments: [
          {
            name: 'siteId',
            description: '対象プロジェクトのサイトID',
            required: true,
          },
          {
            name: 'urgencyLevel',
            description: '緊急度レベル（high/medium/low、デフォルト: medium）',
            required: false,
          },
        ],
      },
      {
        name: 'weekly_standup_preparation',
        description: 'ウィークリースタンドアップ用の情報を整理します',
        arguments: [
          {
            name: 'siteId',
            description: '対象プロジェクトのサイトID',
            required: true,
          },
          {
            name: 'teamMember',
            description: '特定チームメンバーのID（省略時は全体）',
            required: false,
          },
        ],
      },
    ];
  }

  async generatePrompt(name: string, args: Record<string, any>): Promise<string> {
    try {
      switch (name) {
        case 'project_status_report':
          return await this.generateProjectStatusReport(args);
        case 'issue_analysis':
          return await this.generateIssueAnalysis(args);
        case 'team_productivity_report':
          return await this.generateTeamProductivityReport(args);
        case 'priority_task_identification':
          return await this.generatePriorityTaskIdentification(args);
        case 'weekly_standup_preparation':
          return await this.generateWeeklyStandupPreparation(args);
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    } catch (error) {
      console.error(`Error generating prompt ${name}:`, error);
      throw new Error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateProjectStatusReport(args: Record<string, any>): Promise<string> {
    const siteId = args.siteId;
    const reportDate = args.reportDate || new Date().toISOString().split('T')[0];
    const includeTrends = args.includeTrends !== false;

    return `# プロジェクトステータスレポート生成

以下の手順でプロジェクト（サイトID: ${siteId}）のステータスレポートを生成してください。

## 1. 基本情報の取得
\`\`\`
pleasanter_status_summary を使用してサイト ${siteId} の基本情報を取得
- 総課題数
- ステータス別内訳
- 完了率
- 担当者別の状況
\`\`\`

## 2. 現在の状況分析
\`\`\`
pleasanter_get_issues を使用して以下の情報を取得：
- 開いている課題（Status: "100|200|300|400|500"）
- 期限が迫っている課題
- 進捗が遅れている課題
\`\`\`

${includeTrends ? `
## 3. トレンド分析
\`\`\`
pleasanter_trend_analysis を使用してトレンド分析を実行：
- analysisType: "completion"
- period: "month"
- プロジェクトの完了傾向を分析
\`\`\`
` : ''}

## 4. レポート内容
取得したデータを基に、以下の形式でレポートを作成してください：

### プロジェクト概要
- レポート作成日: ${reportDate}
- 総課題数と完了率
- 現在のプロジェクト健全性（良好/注意/要改善）

### 現在の状況
- 開いている課題の概要
- 緊急対応が必要な課題
- 今週完了予定の課題

### 課題とリスク
- 期限遅れの課題
- ボトルネックとなっている作業
- リソース配分の問題

${includeTrends ? `
### 傾向分析
- 完了ペースの変化
- 課題作成と解決のバランス
- 予測される完了時期
` : ''}

### 推奨アクション
- 優先的に対応すべき課題
- リソース再配分の提案
- プロセス改善の提案

データ取得後、わかりやすく整理されたレポートを日本語で作成してください。`;
  }

  private async generateIssueAnalysis(args: Record<string, any>): Promise<string> {
    const siteId = args.siteId;
    const period = args.period || 'month';
    const focusArea = args.focusArea || 'performance';

    const focusDescriptions: Record<string, string> = {
      performance: '生産性とパフォーマンス',
      quality: '品質と再発防止',
      timeline: 'スケジュールと期限管理',
    };

    return `# 課題分析とレコメンデーション生成

サイトID ${siteId} の課題について、${focusDescriptions[focusArea] || 'パフォーマンス'}に焦点を当てた分析を実行してください。

## 1. データ収集
\`\`\`
以下のツールを使用してデータを収集：

1. pleasanter_trend_analysis
   - analysisType: "creation", "completion", "update"
   - period: "${period}"
   - 課題の作成・完了・更新パターンを分析

2. pleasanter_advanced_search
   - 完了済み課題の分析（Status: "900"）
   - 作業時間と進捗率の関係を調査

3. pleasanter_status_summary
   - groupBy: "assignee"
   - 担当者別のパフォーマンス分析
\`\`\`

## 2. 分析観点（${focusArea}）

${focusArea === 'performance' ? `
### パフォーマンス分析
- 課題完了までの平均時間
- 担当者別の生産性指標
- 作業量と完了率の相関
- ボトルネックの特定
` : ''}

${focusArea === 'quality' ? `
### 品質分析
- 再オープンされた課題の割合
- 課題の複雑さと完了時間の関係
- 品質に関する分類（ClassA, ClassB）の分析
- エラーパターンの特定
` : ''}

${focusArea === 'timeline' ? `
### タイムライン分析
- 予定期限vs実際の完了時期
- 期限遅れの要因分析
- スケジュール精度の評価
- 計画と実績の乖離パターン
` : ''}

## 3. レコメンデーション生成

分析結果を基に以下の提案を生成してください：

### 即座に実行可能な改善策
- 具体的なアクションアイテム
- 担当者への推奨事項
- プロセスの微調整

### 中長期的な改善策
- 組織・体制の改善提案
- ツール・システムの改善
- スキル向上の推奨

### メトリクス改善
- 追跡すべきKPI
- 目標値の設定
- 定期的な見直し方法

分析結果とレコメンデーションを、データに基づいた具体的で実行可能な内容として日本語で提示してください。`;
  }

  private async generateTeamProductivityReport(args: Record<string, any>): Promise<string> {
    const siteId = args.siteId;
    const teamType = args.teamType || 'assignee';
    const period = args.period || 'month';

    const teamTypeDescriptions: Record<string, string> = {
      assignee: '担当者',
      manager: '管理者',
      group: 'グループ',
    };

    return `# チーム生産性レポート生成

サイトID ${siteId} について、${teamTypeDescriptions[teamType] || '担当者'}別の生産性分析を実行してください。

## 1. チーム情報の収集
\`\`\`
1. pleasanter_status_summary
   - groupBy: "${teamType}"
   - ${teamTypeDescriptions[teamType] || '担当者'}別の課題分布を取得

${teamType === 'assignee' ? `
2. pleasanter://users リソースを参照
   - ユーザー情報と組織構造を把握
` : ''}

${teamType === 'group' ? `
2. pleasanter://groups リソースを参照
   - グループ構成と メンバー情報を把握
` : ''}
\`\`\`

## 2. 生産性メトリクスの分析
\`\`\`
pleasanter_trend_analysis を使用：
- analysisType: "completion"
- period: "${period}"
- groupBy: "${teamType === 'assignee' ? 'Owner' : teamType === 'manager' ? 'Manager' : 'ClassA'}"
\`\`\`

## 3. 詳細分析
\`\`\`
各${teamTypeDescriptions[teamType] || '担当者'}について以下を分析：

pleasanter_advanced_search で以下のメトリクスを計算：
- 完了課題数（${period}間）
- 平均完了時間
- 進捗率の平均
- 作業量の合計
- 期限遵守率
\`\`\`

## 4. レポート構成

### ${teamTypeDescriptions[teamType] || '担当者'}別パフォーマンス
- 課題完了数ランキング
- 生産性指標（課題/時間、品質スコア等）
- 強みと改善点の特定

### チーム全体の傾向
- 生産性の分布と偏り
- 協業パターンの分析
- ワークロードバランス

### ベストプラクティス
- 高パフォーマンス${teamTypeDescriptions[teamType] || '担当者'}の共通点
- 効率的な作業パターン
- 成功事例の特定

### 改善提案
- 個別の育成・サポート提案
- チーム構成の最適化
- ワークフロー改善案
- スキル開発の推奨

### アクションプラン
- 短期的な改善施策（1-2週間）
- 中期的な能力向上施策（1-3ヶ月）
- 長期的な組織改善施策（3ヶ月以上）

データを基に、建設的で実行可能な改善提案を含む包括的なレポートを日本語で作成してください。`;
  }

  private async generatePriorityTaskIdentification(args: Record<string, any>): Promise<string> {
    const siteId = args.siteId;
    const urgencyLevel = args.urgencyLevel || 'medium';

    const urgencyLevelDescriptions: Record<string, string> = {
      high: '緊急度高（即日対応必要）',
      medium: '緊急度中（3日以内対応）',
      low: '緊急度低（1週間以内対応）',
    };

    return `# 優先対応課題の特定とアクションプラン

サイトID ${siteId} について、${urgencyLevelDescriptions[urgencyLevel] || '緊急度中（3日以内対応）'}のタスクを特定し、アクションプランを提案してください。

## 1. 緊急課題の特定
\`\`\`
pleasanter_advanced_search を使用して以下の条件で課題を検索：

1. 期限切れ課題
   - dateFilters: { completionDateTo: "今日の日付" }
   - filters: { Status: "100|200|300|400|500" }

2. 期限間近の課題
   - dateFilters: { 
       completionDateFrom: "今日", 
       completionDateTo: "${urgencyLevel === 'high' ? '今日' : urgencyLevel === 'medium' ? '3日後' : '1週間後'}" 
     }

3. 高優先度課題
   - filters: { ClassA: "緊急", ClassB: "高" }
   - または工数の大きい課題（numberFilters: { workValueMin: 8 }）

4. ブロックされている課題
   - filters: { Status: "500" } # ブロック状態
   - 長期間更新されていない課題
\`\`\`

## 2. 影響度分析
\`\`\`
各特定された課題について以下を評価：
- プロジェクト全体への影響度
- 他の課題への依存関係
- リソース要件
- 完了までの見積もり時間
\`\`\`

## 3. リソース状況の確認
\`\`\`
pleasanter_status_summary で担当者別の作業状況を確認：
- groupBy: "assignee"
- 各担当者の現在の負荷状況
- 利用可能なリソースの特定
\`\`\`

## 4. 優先度マトリクス作成

### 緊急度 x 重要度マトリクス
特定された課題を以下の4象限に分類：

1. **緊急かつ重要**（即座対応）
   - 期限切れで影響大の課題
   - ブロッカーとなっている課題

2. **重要だが緊急でない**（計画的対応）
   - 戦略的に重要な課題
   - 将来的リスクを含む課題

3. **緊急だが重要でない**（効率的対応）
   - 期限は迫っているが影響は限定的
   - 簡単に解決可能な課題

4. **緊急でも重要でもない**（後回し可能）
   - 優先度の低い課題

## 5. アクションプラン

### 即座実行項目（今日中）
- 最優先課題の担当者アサイン
- ブロッカーの除去
- 緊急リソースの確保

### 短期アクション（${urgencyLevel === 'high' ? '2-3日' : urgencyLevel === 'medium' ? '1週間' : '2週間'}以内）
- 各優先課題の詳細計画
- 必要なリソース調整
- 進捗チェックポイントの設定

### リスク軽減策
- 予想される障害と対策
- エスカレーション基準
- バックアップ計画

## 6. 実行可能な推奨事項

分析結果を基に、以下の形式で具体的な推奨事項を提示してください：

### 課題ごとの対応方針
- 課題ID、タイトル、緊急度
- 推奨担当者
- 必要工数と期限
- 具体的なアクション

### リソース配分提案
- 人員配置の調整案
- 優先順位の再設定
- 外部リソース活用の検討

### プロセス改善提案
- 今後同様の状況を防ぐための改善策
- 早期警告システムの提案
- 定期的なレビュープロセス

実行可能で具体的なアクションプランを日本語で提示してください。`;
  }

  private async generateWeeklyStandupPreparation(args: Record<string, any>): Promise<string> {
    const siteId = args.siteId;
    const teamMember = args.teamMember;

    return `# ウィークリースタンドアップ準備

サイトID ${siteId} の${teamMember ? `ユーザーID ${teamMember} の` : 'チーム全体の'}ウィークリースタンドアップ用情報を整理してください。

## 1. 今週の実績収集
\`\`\`
pleasanter_advanced_search で今週の活動を調査：

1. 今週完了した課題
   - filters: { Status: "900" }
   - dateFilters: { updatedFrom: "今週月曜日", updatedTo: "今日" }
   ${teamMember ? `- filters追加: { Owner: "${teamMember}" }` : ''}

2. 今週進捗があった課題
   - dateFilters: { updatedFrom: "今週月曜日", updatedTo: "今日" }
   - filters: { Status: "100|200|300|400|500" }
   ${teamMember ? `- filters追加: { Owner: "${teamMember}" }` : ''}
\`\`\`

## 2. 来週の予定確認
\`\`\`
pleasanter_advanced_search で来週の予定を確認：

1. 来週期限の課題
   - dateFilters: { completionDateFrom: "来週月曜日", completionDateTo: "来週日曜日" }
   - filters: { Status: "100|200|300|400|500" }
   ${teamMember ? `- filters追加: { Owner: "${teamMember}" }` : ''}

2. 来週開始予定の課題
   - dateFilters: { startDateFrom: "来週月曜日", startDateTo: "来週日曜日" }
   ${teamMember ? `- filters追加: { Owner: "${teamMember}" }` : ''}
\`\`\`

## 3. 課題・ブロッカーの特定
\`\`\`
以下の課題を特定：

1. 期限遅れの課題
   - dateFilters: { completionDateTo: "昨日" }
   - filters: { Status: "100|200|300|400|500" }

2. ブロックされている課題
   - filters: { Status: "500" } または進捗の止まっている課題

3. 支援が必要な課題
   - 長期間更新されていない課題
   - 進捗率が低い期限間近の課題
\`\`\`

## 4. スタンドアップ情報の整理

${teamMember ? `
### ${teamMember}の個人レポート
` : `
### チーム全体のレポート
`}

#### 今週の成果（What did we accomplish?）
- 完了した課題の一覧（課題ID、タイトル、完了日）
- 重要な進捗（大きく前進した課題）
- 解決した問題・課題

#### 来週の計画（What will we work on?）
- 優先的に取り組む課題
- 新たに開始する課題
- 完了予定の課題

#### 課題・ブロッカー（What obstacles are in our way?）
- 現在ブロックされている作業
- 支援が必要な領域
- リスクや懸念事項

#### 必要なサポート（What support do we need?）
- 他チームからの協力要請
- リソースや情報の不足
- 意思決定が必要な事項

## 5. メトリクス・KPI

${teamMember ? `
### 個人パフォーマンス指標
- 今週の完了課題数
- 平均進捗率
- 期限遵守率
` : `
### チームパフォーマンス指標
- チーム全体の完了課題数
- ベロシティ（完了した作業量）
- チーム全体の期限遵守率
- 担当者別の負荷バランス
`}

## 6. アクションアイテム
- 今週積み残しとなった課題の対処方針
- 来週のリスク軽減策
- チーム内での調整が必要な事項

収集したデータを基に、スタンドアップミーティングで効果的に共有できる簡潔で要点を押さえた情報を日本語で整理してください。`;
  }
}