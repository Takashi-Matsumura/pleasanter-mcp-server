import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PleasanterClient } from '../pleasanter/client.js';
import { View } from '../types/pleasanter.js';

const AdvancedSearchSchema = z.object({
  siteId: z.number().int().positive(),
  search: z.string().optional(),
  filters: z.record(z.string()).optional(),
  dateFilters: z.object({
    startDateFrom: z.string().optional(),
    startDateTo: z.string().optional(),
    completionDateFrom: z.string().optional(),
    completionDateTo: z.string().optional(),
    updatedFrom: z.string().optional(),
    updatedTo: z.string().optional(),
  }).optional(),
  numberFilters: z.object({
    progressRateMin: z.number().min(0).max(100).optional(),
    progressRateMax: z.number().min(0).max(100).optional(),
    workValueMin: z.number().optional(),
    workValueMax: z.number().optional(),
  }).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
});

const MultiSiteSearchSchema = z.object({
  siteIds: z.array(z.number().int().positive()).min(1).max(10),
  search: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
});

const TrendAnalysisSchema = z.object({
  siteId: z.number().int().positive(),
  analysisType: z.enum(['completion', 'creation', 'update', 'progress']),
  period: z.enum(['week', 'month', 'quarter', 'year']),
  groupBy: z.string().optional(),
});

const StatusSummarySchema = z.object({
  siteId: z.number().int().positive(),
  groupBy: z.enum(['status', 'assignee', 'manager', 'classA', 'classB']).optional(),
});

export class SearchTools {
  constructor(private client: PleasanterClient) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'pleasanter_advanced_search',
        description: '高度な検索条件を指定してPleasanterの課題を検索します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            search: {
              type: 'string',
              description: '全文検索キーワード（タイトル・本文・コメントを検索）',
            },
            filters: {
              type: 'object',
              description: 'カラム別フィルター条件（例: {"Status": "100|200", "ClassA": "バグ"}）',
              additionalProperties: { type: 'string' },
            },
            dateFilters: {
              type: 'object',
              description: '日付範囲でのフィルター',
              properties: {
                startDateFrom: { type: 'string', description: '開始日の開始範囲（YYYY-MM-DD）' },
                startDateTo: { type: 'string', description: '開始日の終了範囲（YYYY-MM-DD）' },
                completionDateFrom: { type: 'string', description: '完了日の開始範囲（YYYY-MM-DD）' },
                completionDateTo: { type: 'string', description: '完了日の終了範囲（YYYY-MM-DD）' },
                updatedFrom: { type: 'string', description: '更新日の開始範囲（YYYY-MM-DD）' },
                updatedTo: { type: 'string', description: '更新日の終了範囲（YYYY-MM-DD）' },
              },
            },
            numberFilters: {
              type: 'object',
              description: '数値範囲でのフィルター',
              properties: {
                progressRateMin: { type: 'number', description: '進捗率の最小値（0-100）' },
                progressRateMax: { type: 'number', description: '進捗率の最大値（0-100）' },
                workValueMin: { type: 'number', description: '作業量の最小値' },
                workValueMax: { type: 'number', description: '作業量の最大値' },
              },
            },
            sortBy: {
              type: 'string',
              description: 'ソートするカラム名（例: "UpdatedTime", "ProgressRate", "Status"）',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'ソート順序（asc=昇順、desc=降順）',
            },
            limit: {
              type: 'number',
              description: '取得件数制限（最大1000、デフォルト: 100）',
            },
            offset: {
              type: 'number',
              description: '取得開始位置（ページネーション用、デフォルト: 0）',
            },
          },
          required: ['siteId'],
        },
      },
      {
        name: 'pleasanter_multi_site_search',
        description: '複数のプロジェクト（サイト）を横断してキーワード検索します',
        inputSchema: {
          type: 'object',
          properties: {
            siteIds: {
              type: 'array',
              items: { type: 'number' },
              description: '検索対象のサイトIDリスト（最大10サイト）',
            },
            search: {
              type: 'string',
              description: '検索キーワード',
            },
            limit: {
              type: 'number',
              description: 'サイトあたりの取得件数制限（デフォルト: 20）',
            },
          },
          required: ['siteIds', 'search'],
        },
      },
      {
        name: 'pleasanter_trend_analysis',
        description: 'プロジェクトの傾向分析を実行します（完了率、作成数、更新数等）',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            analysisType: {
              type: 'string',
              enum: ['completion', 'creation', 'update', 'progress'],
              description: '分析タイプ（completion=完了傾向、creation=作成傾向、update=更新傾向、progress=進捗傾向）',
            },
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year'],
              description: '分析期間（week=週、month=月、quarter=四半期、year=年）',
            },
            groupBy: {
              type: 'string',
              description: 'グループ化項目（Status, ClassA, Owner等）',
            },
          },
          required: ['siteId', 'analysisType', 'period'],
        },
      },
      {
        name: 'pleasanter_status_summary',
        description: 'プロジェクトのステータス別サマリーを取得します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            groupBy: {
              type: 'string',
              enum: ['status', 'assignee', 'manager', 'classA', 'classB'],
              description: 'グループ化項目（status=ステータス別、assignee=担当者別、manager=管理者別等）',
            },
          },
          required: ['siteId'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'pleasanter_advanced_search':
          return await this.advancedSearch(args);
        case 'pleasanter_multi_site_search':
          return await this.multiSiteSearch(args);
        case 'pleasanter_trend_analysis':
          return await this.trendAnalysis(args);
        case 'pleasanter_status_summary':
          return await this.statusSummary(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error in ${name}:`, error);
      throw new Error(`Failed to execute ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async advancedSearch(args: any) {
    const params = AdvancedSearchSchema.parse(args);

    const view: View = {};
    
    // 全文検索
    if (params.search) {
      view.Search = params.search;
    }

    // カラムフィルター
    if (params.filters && Object.keys(params.filters).length > 0) {
      view.ColumnFilterHash = params.filters;
    }

    // 日付フィルター
    if (params.dateFilters) {
      if (!view.ColumnFilterExpressions) {
        view.ColumnFilterExpressions = {};
      }
      
      if (params.dateFilters.startDateFrom) {
        view.ColumnFilterExpressions.StartTime = 
          `>=[StartTime]>='${params.dateFilters.startDateFrom}'`;
      }
      if (params.dateFilters.startDateTo) {
        const existing = view.ColumnFilterExpressions.StartTime || '';
        view.ColumnFilterExpressions.StartTime = 
          existing + `<=[StartTime]<='${params.dateFilters.startDateTo}'`;
      }
      
      if (params.dateFilters.completionDateFrom) {
        view.ColumnFilterExpressions.CompletionTime = 
          `>=[CompletionTime]>='${params.dateFilters.completionDateFrom}'`;
      }
      if (params.dateFilters.completionDateTo) {
        const existing = view.ColumnFilterExpressions.CompletionTime || '';
        view.ColumnFilterExpressions.CompletionTime = 
          existing + `<=[CompletionTime]<='${params.dateFilters.completionDateTo}'`;
      }
      
      if (params.dateFilters.updatedFrom) {
        view.ColumnFilterExpressions.UpdatedTime = 
          `>=[UpdatedTime]>='${params.dateFilters.updatedFrom}'`;
      }
      if (params.dateFilters.updatedTo) {
        const existing = view.ColumnFilterExpressions.UpdatedTime || '';
        view.ColumnFilterExpressions.UpdatedTime = 
          existing + `<=[UpdatedTime]<='${params.dateFilters.updatedTo}'`;
      }
    }

    // 数値フィルター
    if (params.numberFilters) {
      if (!view.ColumnFilterExpressions) {
        view.ColumnFilterExpressions = {};
      }
      
      if (params.numberFilters.progressRateMin !== undefined) {
        view.ColumnFilterExpressions.ProgressRate = 
          `>=[ProgressRate]>=${params.numberFilters.progressRateMin}`;
      }
      if (params.numberFilters.progressRateMax !== undefined) {
        const existing = view.ColumnFilterExpressions.ProgressRate || '';
        view.ColumnFilterExpressions.ProgressRate = 
          existing + `<=[ProgressRate]<=${params.numberFilters.progressRateMax}`;
      }
      
      if (params.numberFilters.workValueMin !== undefined) {
        view.ColumnFilterExpressions.WorkValue = 
          `>=[WorkValue]>=${params.numberFilters.workValueMin}`;
      }
      if (params.numberFilters.workValueMax !== undefined) {
        const existing = view.ColumnFilterExpressions.WorkValue || '';
        view.ColumnFilterExpressions.WorkValue = 
          existing + `<=[WorkValue]<=${params.numberFilters.workValueMax}`;
      }
    }

    // ソート
    if (params.sortBy) {
      view.ColumnSorterHash = {
        [params.sortBy]: params.sortOrder || 'desc',
      };
    }

    const request = {
      View: view,
      Offset: params.offset || 0,
      PageSize: params.limit || 100,
    };

    const response = await this.client.getIssues(params.siteId, request);

    return {
      success: true,
      results: response.Response?.Data || [],
      totalCount: response.Response?.TotalCount,
      searchConditions: {
        search: params.search,
        filters: params.filters,
        dateFilters: params.dateFilters,
        numberFilters: params.numberFilters,
      },
      pagination: {
        offset: params.offset || 0,
        limit: params.limit || 100,
        hasMore: (response.Response?.Data?.length || 0) === (params.limit || 100),
      },
    };
  }

  private async multiSiteSearch(args: any) {
    const params = MultiSiteSearchSchema.parse(args);

    const searchResults = await Promise.allSettled(
      params.siteIds.map(async (siteId) => {
        try {
          const response = await this.client.searchIssues(
            siteId, 
            params.search, 
            params.limit || 20
          );
          return {
            siteId,
            success: true,
            results: response,
            count: response.length,
          };
        } catch (error) {
          return {
            siteId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            results: [],
            count: 0,
          };
        }
      })
    );

    const results = searchResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          siteId: params.siteIds[index],
          success: false,
          error: result.reason,
          results: [],
          count: 0,
        };
      }
    });

    const totalResults = results.reduce((acc, site) => acc + site.count, 0);
    const successfulSites = results.filter(site => site.success).length;

    return {
      success: true,
      searchTerm: params.search,
      sites: results,
      summary: {
        totalSites: params.siteIds.length,
        successfulSites,
        totalResults,
        sitesWithResults: results.filter(site => site.count > 0).length,
      },
    };
  }

  private async trendAnalysis(args: any) {
    const params = TrendAnalysisSchema.parse(args);

    // 期間の設定
    const now = new Date();
    let startDate: Date;
    
    switch (params.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // 分析タイプに応じたデータ取得
    let view: View = {};
    
    switch (params.analysisType) {
      case 'completion':
        view.ColumnFilterHash = { Status: '900' }; // 完了ステータス
        view.ColumnFilterExpressions = {
          UpdatedTime: `>=[UpdatedTime]>='${startDateStr}'`,
        };
        break;
      case 'creation':
        view.ColumnFilterExpressions = {
          CreatedTime: `>=[CreatedTime]>='${startDateStr}'`,
        };
        break;
      case 'update':
        view.ColumnFilterExpressions = {
          UpdatedTime: `>=[UpdatedTime]>='${startDateStr}'`,
        };
        break;
      case 'progress':
        view.ColumnFilterExpressions = {
          UpdatedTime: `>=[UpdatedTime]>='${startDateStr}'`,
        };
        break;
    }

    if (params.groupBy) {
      view.ColumnSorterHash = { [params.groupBy]: 'asc' };
    }

    const response = await this.client.getIssues(params.siteId, { View: view, PageSize: 1000 });
    const issues = response.Response?.Data || [];

    // データ分析
    const analysis = this.analyzeData(issues, params.analysisType, params.period, params.groupBy);

    return {
      success: true,
      analysisType: params.analysisType,
      period: params.period,
      dateRange: {
        from: startDateStr,
        to: now.toISOString().split('T')[0],
      },
      totalIssues: issues.length,
      analysis,
    };
  }

  private async statusSummary(args: any) {
    const params = StatusSummarySchema.parse(args);

    const response = await this.client.getIssues(params.siteId, { PageSize: 1000 });
    const issues = response.Response?.Data || [];

    const groupBy = params.groupBy || 'status';
    const summary: Record<string, any> = {};

    issues.forEach(issue => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          key = issue.Status?.toString() || 'unknown';
          break;
        case 'assignee':
          key = issue.Owner?.toString() || 'unassigned';
          break;
        case 'manager':
          key = issue.Manager?.toString() || 'unassigned';
          break;
        case 'classA':
          key = issue.ClassA || 'uncategorized';
          break;
        case 'classB':
          key = issue.ClassB || 'uncategorized';
          break;
        default:
          key = 'unknown';
      }

      if (!summary[key]) {
        summary[key] = {
          count: 0,
          totalWorkValue: 0,
          averageProgress: 0,
          completedCount: 0,
          issues: [],
        };
      }

      summary[key].count++;
      summary[key].totalWorkValue += issue.WorkValue || 0;
      summary[key].averageProgress += issue.ProgressRate || 0;
      if (issue.Status === 900) { // 完了ステータス
        summary[key].completedCount++;
      }
      summary[key].issues.push({
        id: issue.IssueId,
        title: issue.Title,
        status: issue.Status,
        progress: issue.ProgressRate,
      });
    });

    // 平均値の計算
    Object.keys(summary).forEach(key => {
      if (summary[key].count > 0) {
        summary[key].averageProgress = summary[key].averageProgress / summary[key].count;
        summary[key].completionRate = (summary[key].completedCount / summary[key].count) * 100;
      }
    });

    return {
      success: true,
      groupBy,
      totalIssues: issues.length,
      groupCount: Object.keys(summary).length,
      summary,
      overview: {
        totalCompleted: Object.values(summary).reduce((acc: number, group: any) => acc + group.completedCount, 0),
        overallCompletionRate: issues.filter(i => i.Status === 900).length / issues.length * 100,
        totalWorkValue: issues.reduce((acc, issue) => acc + (issue.WorkValue || 0), 0),
      },
    };
  }

  private analyzeData(issues: any[], analysisType: string, period: string, groupBy?: string) {
    const groupedData: Record<string, any[]> = {};
    
    // グループ化
    if (groupBy) {
      issues.forEach(issue => {
        const key = issue[groupBy] || 'unknown';
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(issue);
      });
    } else {
      groupedData['all'] = issues;
    }

    // 時系列分析
    const timeSeriesData: Record<string, number> = {};
    
    issues.forEach(issue => {
      let dateKey: string;
      let dateField: string;
      
      switch (analysisType) {
        case 'completion':
          dateField = 'UpdatedTime';
          break;
        case 'creation':
          dateField = 'CreatedTime';
          break;
        case 'update':
          dateField = 'UpdatedTime';
          break;
        case 'progress':
          dateField = 'UpdatedTime';
          break;
        default:
          dateField = 'CreatedTime';
      }

      const date = new Date(issue[dateField]);
      if (isNaN(date.getTime())) return;

      switch (period) {
        case 'week':
          dateKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
          break;
        case 'month':
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'quarter':
          dateKey = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
          break;
        case 'year':
          dateKey = date.getFullYear().toString();
          break;
        default:
          dateKey = date.toISOString().split('T')[0];
      }

      timeSeriesData[dateKey] = (timeSeriesData[dateKey] || 0) + 1;
    });

    return {
      groups: Object.keys(groupedData).map(key => ({
        name: key,
        count: groupedData[key].length,
        averageProgress: groupedData[key].reduce((acc, issue) => acc + (issue.ProgressRate || 0), 0) / groupedData[key].length,
        completionRate: groupedData[key].filter(issue => issue.Status === 900).length / groupedData[key].length * 100,
      })),
      timeSeries: Object.keys(timeSeriesData)
        .sort()
        .map(key => ({
          period: key,
          count: timeSeriesData[key],
        })),
      trends: {
        increasing: this.calculateTrend(Object.values(timeSeriesData)) > 0,
        peak: Math.max(...Object.values(timeSeriesData)),
        average: Object.values(timeSeriesData).reduce((a, b) => a + b, 0) / Object.values(timeSeriesData).length,
      },
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return secondAvg - firstAvg;
  }
}