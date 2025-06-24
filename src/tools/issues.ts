import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PleasanterClient } from '../pleasanter/client.js';
import { Issue } from '../types/pleasanter.js';

// Zod schemas for validation
const CreateIssueSchema = z.object({
  siteId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  body: z.string().optional(),
  status: z.number().int().optional(),
  manager: z.number().int().optional(),
  owner: z.number().int().optional(),
  startTime: z.string().optional(),
  completionTime: z.string().optional(),
  workValue: z.number().optional(),
  progressRate: z.number().min(0).max(100).optional(),
  classA: z.string().optional(),
  classB: z.string().optional(),
  classC: z.string().optional(),
  numA: z.number().optional(),
  numB: z.number().optional(),
  numC: z.number().optional(),
  dateA: z.string().optional(),
  dateB: z.string().optional(),
  dateC: z.string().optional(),
  descriptionA: z.string().optional(),
  descriptionB: z.string().optional(),
  descriptionC: z.string().optional(),
  checkA: z.boolean().optional(),
  checkB: z.boolean().optional(),
  checkC: z.boolean().optional(),
});

const UpdateIssueSchema = z.object({
  siteId: z.number().int().positive(),
  issueId: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  status: z.number().int().optional(),
  manager: z.number().int().optional(),
  owner: z.number().int().optional(),
  startTime: z.string().optional(),
  completionTime: z.string().optional(),
  workValue: z.number().optional(),
  progressRate: z.number().min(0).max(100).optional(),
  classA: z.string().optional(),
  classB: z.string().optional(),
  classC: z.string().optional(),
  numA: z.number().optional(),
  numB: z.number().optional(),
  numC: z.number().optional(),
  dateA: z.string().optional(),
  dateB: z.string().optional(),
  dateC: z.string().optional(),
  descriptionA: z.string().optional(),
  descriptionB: z.string().optional(),
  descriptionC: z.string().optional(),
  checkA: z.boolean().optional(),
  checkB: z.boolean().optional(),
  checkC: z.boolean().optional(),
  comments: z.string().optional(),
});

const GetIssuesSchema = z.object({
  siteId: z.number().int().positive(),
  search: z.string().optional(),
  status: z.string().optional(),
  assignee: z.number().int().optional(),
  manager: z.number().int().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const DeleteIssueSchema = z.object({
  siteId: z.number().int().positive(),
  issueId: z.number().int().positive(),
});

const BulkCreateIssuesSchema = z.object({
  siteId: z.number().int().positive(),
  issues: z.array(CreateIssueSchema.omit({ siteId: true })).min(1).max(100),
});

export class IssueTools {
  constructor(private client: PleasanterClient) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'pleasanter_create_issue',
        description: 'Pleasanterで新しい課題を作成します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            title: {
              type: 'string',
              description: '課題のタイトル（必須、最大200文字）',
            },
            body: {
              type: 'string',
              description: '課題の詳細説明',
            },
            status: {
              type: 'number',
              description: 'ステータス（100=未着手、200=進行中、300=レビュー中、900=完了等）',
            },
            manager: {
              type: 'number',
              description: '管理者のユーザーID',
            },
            owner: {
              type: 'number',
              description: '担当者のユーザーID',
            },
            startTime: {
              type: 'string',
              description: '開始予定日時（ISO 8601形式: YYYY-MM-DDTHH:mm:ss）',
            },
            completionTime: {
              type: 'string',
              description: '完了予定日時（ISO 8601形式: YYYY-MM-DDTHH:mm:ss）',
            },
            workValue: {
              type: 'number',
              description: '作業量（時間）',
            },
            progressRate: {
              type: 'number',
              description: '進捗率（0-100）',
            },
            classA: {
              type: 'string',
              description: '分類A（カテゴリ、優先度等）',
            },
            classB: {
              type: 'string',
              description: '分類B（タイプ、重要度等）',
            },
            classC: {
              type: 'string',
              description: '分類C（その他の分類）',
            },
          },
          required: ['siteId', 'title'],
        },
      },
      {
        name: 'pleasanter_get_issues',
        description: '条件を指定してPleasanterの課題を検索・取得します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            search: {
              type: 'string',
              description: '全文検索キーワード（タイトル・本文を検索）',
            },
            status: {
              type: 'string',
              description: 'ステータスでフィルタ（例: "100", "100|200", "900"）',
            },
            assignee: {
              type: 'number',
              description: '担当者IDでフィルタ',
            },
            manager: {
              type: 'number',
              description: '管理者IDでフィルタ',
            },
            offset: {
              type: 'number',
              description: '取得開始位置（ページネーション用、デフォルト: 0）',
            },
            limit: {
              type: 'number',
              description: '取得件数制限（最大1000、デフォルト: 50）',
            },
            sortBy: {
              type: 'string',
              description: 'ソートするカラム名（例: "UpdatedTime", "Status", "Title"）',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'ソート順序（asc=昇順、desc=降順）',
            },
          },
          required: ['siteId'],
        },
      },
      {
        name: 'pleasanter_update_issue',
        description: 'Pleasanterの既存課題を更新します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            issueId: {
              type: 'number',
              description: '更新する課題のID',
            },
            title: {
              type: 'string',
              description: '課題のタイトル（最大200文字）',
            },
            body: {
              type: 'string',
              description: '課題の詳細説明',
            },
            status: {
              type: 'number',
              description: 'ステータス（100=未着手、200=進行中、300=レビュー中、900=完了等）',
            },
            manager: {
              type: 'number',
              description: '管理者のユーザーID',
            },
            owner: {
              type: 'number',
              description: '担当者のユーザーID',
            },
            progressRate: {
              type: 'number',
              description: '進捗率（0-100）',
            },
            workValue: {
              type: 'number',
              description: '作業量（時間）',
            },
            completionTime: {
              type: 'string',
              description: '完了予定日時（ISO 8601形式）',
            },
            comments: {
              type: 'string',
              description: '更新コメント',
            },
          },
          required: ['siteId', 'issueId'],
        },
      },
      {
        name: 'pleasanter_delete_issue',
        description: 'Pleasanterの課題を削除します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            issueId: {
              type: 'number',
              description: '削除する課題のID',
            },
          },
          required: ['siteId', 'issueId'],
        },
      },
      {
        name: 'pleasanter_bulk_create_issues',
        description: '複数の課題を一括作成します',
        inputSchema: {
          type: 'object',
          properties: {
            siteId: {
              type: 'number',
              description: 'サイトID（プロジェクトID）',
            },
            issues: {
              type: 'array',
              description: '作成する課題のリスト（最大100件）',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: '課題タイトル' },
                  body: { type: 'string', description: '課題詳細' },
                  status: { type: 'number', description: 'ステータス' },
                  owner: { type: 'number', description: '担当者ID' },
                  manager: { type: 'number', description: '管理者ID' },
                  workValue: { type: 'number', description: '作業量' },
                  classA: { type: 'string', description: '分類A' },
                },
                required: ['title'],
              },
            },
          },
          required: ['siteId', 'issues'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'pleasanter_create_issue':
          return await this.createIssue(args);
        case 'pleasanter_get_issues':
          return await this.getIssues(args);
        case 'pleasanter_update_issue':
          return await this.updateIssue(args);
        case 'pleasanter_delete_issue':
          return await this.deleteIssue(args);
        case 'pleasanter_bulk_create_issues':
          return await this.bulkCreateIssues(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error in ${name}:`, error);
      throw new Error(`Failed to execute ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createIssue(args: any) {
    const params = CreateIssueSchema.parse(args);
    
    const issue: Partial<Issue> = {
      Title: params.title,
      Body: params.body,
      Status: params.status,
      Manager: params.manager,
      Owner: params.owner,
      StartTime: params.startTime,
      CompletionTime: params.completionTime,
      WorkValue: params.workValue,
      ProgressRate: params.progressRate,
      ClassA: params.classA,
      ClassB: params.classB,
      ClassC: params.classC,
      NumA: params.numA,
      NumB: params.numB,
      NumC: params.numC,
      DateA: params.dateA,
      DateB: params.dateB,
      DateC: params.dateC,
      DescriptionA: params.descriptionA,
      DescriptionB: params.descriptionB,
      DescriptionC: params.descriptionC,
      CheckA: params.checkA,
      CheckB: params.checkB,
      CheckC: params.checkC,
    };

    const response = await this.client.createIssue(params.siteId, issue);
    
    return {
      success: true,
      message: '課題が正常に作成されました',
      issue: response.Response?.Data?.[0],
      apiInfo: {
        remainingCalls: response.LimitRemaining,
        dailyLimit: response.LimitPerDate,
      },
    };
  }

  private async getIssues(args: any) {
    const params = GetIssuesSchema.parse(args);
    
    const request: any = {
      Offset: params.offset || 0,
      PageSize: params.limit || 50,
    };

    // Build View filter
    const view: any = {};
    
    if (params.search) {
      view.Search = params.search;
    }
    
    if (params.status || params.assignee || params.manager) {
      view.ColumnFilterHash = {};
      
      if (params.status) {
        view.ColumnFilterHash.Status = params.status;
      }
      if (params.assignee) {
        view.ColumnFilterHash.Owner = params.assignee.toString();
      }
      if (params.manager) {
        view.ColumnFilterHash.Manager = params.manager.toString();
      }
    }
    
    if (params.sortBy) {
      view.ColumnSorterHash = {
        [params.sortBy]: params.sortOrder || 'desc',
      };
    }
    
    if (Object.keys(view).length > 0) {
      request.View = view;
    }

    const response = await this.client.getIssues(params.siteId, request);
    
    return {
      success: true,
      issues: response.Response?.Data || [],
      totalCount: response.Response?.TotalCount,
      pagination: {
        offset: params.offset || 0,
        limit: params.limit || 50,
        hasMore: (response.Response?.Data?.length || 0) === (params.limit || 50),
      },
      apiInfo: {
        remainingCalls: response.LimitRemaining,
        dailyLimit: response.LimitPerDate,
      },
    };
  }

  private async updateIssue(args: any) {
    const params = UpdateIssueSchema.parse(args);
    
    const issue: Partial<Issue> = {
      IssueId: params.issueId,
    };

    // Only include non-undefined fields
    if (params.title !== undefined) issue.Title = params.title;
    if (params.body !== undefined) issue.Body = params.body;
    if (params.status !== undefined) issue.Status = params.status;
    if (params.manager !== undefined) issue.Manager = params.manager;
    if (params.owner !== undefined) issue.Owner = params.owner;
    if (params.startTime !== undefined) issue.StartTime = params.startTime;
    if (params.completionTime !== undefined) issue.CompletionTime = params.completionTime;
    if (params.workValue !== undefined) issue.WorkValue = params.workValue;
    if (params.progressRate !== undefined) issue.ProgressRate = params.progressRate;
    if (params.classA !== undefined) issue.ClassA = params.classA;
    if (params.classB !== undefined) issue.ClassB = params.classB;
    if (params.classC !== undefined) issue.ClassC = params.classC;
    if (params.comments !== undefined) issue.Comments = params.comments;

    const response = await this.client.updateIssue(params.siteId, issue);
    
    return {
      success: true,
      message: '課題が正常に更新されました',
      issue: response.Response?.Data?.[0],
      apiInfo: {
        remainingCalls: response.LimitRemaining,
        dailyLimit: response.LimitPerDate,
      },
    };
  }

  private async deleteIssue(args: any) {
    const params = DeleteIssueSchema.parse(args);
    
    const response = await this.client.deleteIssue(params.siteId, params.issueId);
    
    return {
      success: true,
      message: '課題が正常に削除されました',
      issueId: params.issueId,
      apiInfo: {
        remainingCalls: response.LimitRemaining,
        dailyLimit: response.LimitPerDate,
      },
    };
  }

  private async bulkCreateIssues(args: any) {
    const params = BulkCreateIssuesSchema.parse(args);
    
    const issues: Partial<Issue>[] = params.issues.map(issue => ({
      Title: issue.title,
      Body: issue.body,
      Status: issue.status,
      Owner: issue.owner,
      Manager: issue.manager,
      WorkValue: issue.workValue,
      ClassA: issue.classA,
    }));

    const response = await this.client.bulkUpsertIssues(params.siteId, issues);
    
    return {
      success: true,
      message: `${params.issues.length}件の課題が正常に作成されました`,
      issues: response.Response?.Data || [],
      apiInfo: {
        remainingCalls: response.LimitRemaining,
        dailyLimit: response.LimitPerDate,
      },
    };
  }
}