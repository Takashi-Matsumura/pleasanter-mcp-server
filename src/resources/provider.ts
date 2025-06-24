import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { PleasanterClient } from '../pleasanter/client.js';

export class ResourceProvider {
  constructor(private client: PleasanterClient) {}

  getResourceTemplates(): Resource[] {
    return [
      {
        uri: 'pleasanter://sites',
        name: 'Pleasanter Sites',
        description: '利用可能なPleasanterサイト（プロジェクト）一覧',
        mimeType: 'application/json',
      },
      {
        uri: 'pleasanter://users',
        name: 'Pleasanter Users',
        description: 'システム登録ユーザー一覧',
        mimeType: 'application/json',
      },
      {
        uri: 'pleasanter://groups',
        name: 'Pleasanter Groups',
        description: 'システム登録グループ一覧',
        mimeType: 'application/json',
      },
      {
        uri: 'pleasanter://depts',
        name: 'Pleasanter Departments',
        description: 'システム登録部署一覧',
        mimeType: 'application/json',
      },
    ];
  }

  async getResource(uri: string): Promise<{ contents: Array<{ type: string; text: string }> }> {
    try {
      const url = new URL(uri);
      const path = url.pathname;

      switch (path) {
        case '/sites':
          return await this.getSitesResource();
        case '/users':
          return await this.getUsersResource();
        case '/groups':
          return await this.getGroupsResource();
        case '/depts':
          return await this.getDeptsResource();
        default:
          // Dynamic site-specific resources
          const siteMatch = path.match(/^\/sites\/(\d+)\/(.+)$/);
          if (siteMatch) {
            const siteId = parseInt(siteMatch[1]);
            const resourceType = siteMatch[2];
            return await this.getSiteSpecificResource(siteId, resourceType);
          }
          
          throw new Error(`Unknown resource: ${uri}`);
      }
    } catch (error) {
      console.error(`Error getting resource ${uri}:`, error);
      throw new Error(`Failed to get resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSitesResource() {
    try {
      const response = await this.client.getSites({ PageSize: 100 });
      const sites = response.Response?.Data || [];

      const sitesInfo = sites.map(site => ({
        siteId: site.SiteId,
        title: site.Title,
        body: site.Body,
        referenceType: site.ReferenceType,
        createdTime: site.CreatedTime,
        updatedTime: site.UpdatedTime,
        resourceUri: `pleasanter://sites/${site.SiteId}/issues`,
      }));

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: 'Pleasanterサイト（プロジェクト）一覧',
              totalCount: sites.length,
              sites: sitesInfo,
              usage: {
                note: 'これらのサイトIDを使用して課題の操作や検索を行うことができます',
                examples: [
                  'pleasanter_get_issues を使用してサイトの課題を取得',
                  'pleasanter_create_issue を使用して新しい課題を作成',
                  'pleasanter_advanced_search を使用して高度な検索を実行',
                ],
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get sites: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getUsersResource() {
    try {
      const response = await this.client.getUsers({ PageSize: 500 });
      const users = response.Response?.Data || [];

      const usersInfo = users.map(user => ({
        userId: user.UserId,
        loginId: user.LoginId,
        name: user.Name,
        email: user.Email,
        deptId: user.DeptId,
        groupId: user.GroupId,
        disabled: user.Disabled,
        lastLoginTime: user.LastLoginTime,
      }));

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: 'Pleasanterユーザー一覧',
              totalCount: users.length,
              users: usersInfo,
              usage: {
                note: 'これらのユーザーIDを使用して課題の担当者や管理者を指定できます',
                examples: [
                  'pleasanter_create_issue でownerやmanagerにユーザーIDを指定',
                  'pleasanter_get_issues でassigneeやmanagerでフィルタリング',
                  'pleasanter_status_summary でassignee別やmanager別の集計を取得',
                ],
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getGroupsResource() {
    try {
      const response = await this.client.getGroups({ PageSize: 100 });
      const groups = response.Response?.Data || [];

      const groupsInfo = groups.map(group => ({
        groupId: group.GroupId,
        groupName: group.GroupName,
        body: group.Body,
        members: group.Members?.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
        createdTime: group.CreatedTime,
        updatedTime: group.UpdatedTime,
      }));

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: 'Pleasanterグループ一覧',
              totalCount: groups.length,
              groups: groupsInfo,
              usage: {
                note: 'グループ情報を使用してチーム単位での課題管理や分析を行えます',
                examples: [
                  'グループメンバーのユーザーIDを使用して課題を検索',
                  'チーム別の進捗分析や課題割り当ての参考に使用',
                ],
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get groups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getDeptsResource() {
    try {
      const response = await this.client.getDepts({ PageSize: 100 });
      const depts = response.Response?.Data || [];

      const deptsInfo = depts.map(dept => ({
        deptId: dept.DeptId,
        deptCode: dept.DeptCode,
        deptName: dept.DeptName,
        body: dept.Body,
        createdTime: dept.CreatedTime,
        updatedTime: dept.UpdatedTime,
      }));

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: 'Pleasanter部署一覧',
              totalCount: depts.length,
              departments: deptsInfo,
              usage: {
                note: '部署情報を使用して組織単位での課題管理や分析を行えます',
                examples: [
                  '部署別の課題進捗の分析',
                  '組織構造を考慮した課題の割り当て',
                ],
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get departments: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSiteSpecificResource(siteId: number, resourceType: string) {
    switch (resourceType) {
      case 'issues':
        return await this.getSiteIssuesResource(siteId);
      case 'summary':
        return await this.getSiteSummaryResource(siteId);
      case 'status':
        return await this.getSiteStatusResource(siteId);
      default:
        throw new Error(`Unknown site resource type: ${resourceType}`);
    }
  }

  private async getSiteIssuesResource(siteId: number) {
    try {
      // 最近更新された課題を取得（最大50件）
      const response = await this.client.getIssues(siteId, {
        View: {
          ColumnSorterHash: {
            UpdatedTime: 'desc',
          },
        },
        PageSize: 50,
      });
      
      const issues = response.Response?.Data || [];

      const issuesInfo = issues.map(issue => ({
        issueId: issue.IssueId,
        title: issue.Title,
        body: issue.Body?.substring(0, 200) + (issue.Body && issue.Body.length > 200 ? '...' : ''),
        status: issue.Status,
        owner: issue.Owner,
        manager: issue.Manager,
        progressRate: issue.ProgressRate,
        workValue: issue.WorkValue,
        startTime: issue.StartTime,
        completionTime: issue.CompletionTime,
        classA: issue.ClassA,
        classB: issue.ClassB,
        createdTime: issue.CreatedTime,
        updatedTime: issue.UpdatedTime,
      }));

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: `サイト ${siteId} の課題一覧（最新50件）`,
              siteId,
              totalCount: issues.length,
              issues: issuesInfo,
              lastUpdated: new Date().toISOString(),
              usage: {
                note: 'この情報を参考に課題の状況を把握し、適切な操作を実行できます',
                examples: [
                  'pleasanter_update_issue を使用して課題を更新',
                  'pleasanter_advanced_search を使用してより詳細な検索',
                ],
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get site issues: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSiteSummaryResource(siteId: number) {
    try {
      const response = await this.client.getIssues(siteId, { PageSize: 1000 });
      const issues = response.Response?.Data || [];

      // サマリー情報を計算
      const statusCounts: Record<string, number> = {};
      const assigneeCounts: Record<string, number> = {};
      let totalWorkValue = 0;
      let completedWorkValue = 0;
      let totalProgressRate = 0;

      issues.forEach(issue => {
        // ステータス集計
        const status = issue.Status?.toString() || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        // 担当者集計
        const assignee = issue.Owner?.toString() || 'unassigned';
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;

        // 作業量・進捗率集計
        totalWorkValue += issue.WorkValue || 0;
        if (issue.Status === 900) { // 完了ステータス
          completedWorkValue += issue.WorkValue || 0;
        }
        totalProgressRate += issue.ProgressRate || 0;
      });

      const averageProgress = issues.length > 0 ? totalProgressRate / issues.length : 0;
      const completionRate = issues.length > 0 ? (statusCounts['900'] || 0) / issues.length * 100 : 0;

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: `サイト ${siteId} のサマリー情報`,
              siteId,
              summary: {
                totalIssues: issues.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageProgress: Math.round(averageProgress * 100) / 100,
                totalWorkValue,
                completedWorkValue,
                remainingWorkValue: totalWorkValue - completedWorkValue,
              },
              statusBreakdown: statusCounts,
              assigneeBreakdown: assigneeCounts,
              lastUpdated: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get site summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSiteStatusResource(siteId: number) {
    try {
      // 開いている課題（未完了）を取得
      const openResponse = await this.client.getIssues(siteId, {
        View: {
          ColumnFilterHash: {
            Status: '100|200|300|400|500', // 完了以外のステータス
          },
        },
        PageSize: 100,
      });

      // 最近完了した課題を取得
      const completedResponse = await this.client.getIssues(siteId, {
        View: {
          ColumnFilterHash: {
            Status: '900', // 完了ステータス
          },
          ColumnSorterHash: {
            UpdatedTime: 'desc',
          },
        },
        PageSize: 20,
      });

      const openIssues = openResponse.Response?.Data || [];
      const completedIssues = completedResponse.Response?.Data || [];

      // 緊急度・優先度の高い課題を特定
      const urgentIssues = openIssues.filter(issue => 
        issue.ClassA === '緊急' || 
        issue.ClassB === '高' ||
        (issue.CompletionTime && new Date(issue.CompletionTime) < new Date())
      );

      // 進捗の遅れている課題を特定
      const delayedIssues = openIssues.filter(issue => {
        if (!issue.StartTime || !issue.CompletionTime) return false;
        const start = new Date(issue.StartTime);
        const end = new Date(issue.CompletionTime);
        const now = new Date();
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);
        return (issue.ProgressRate || 0) < expectedProgress - 20; // 20%以上の遅れ
      });

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              description: `サイト ${siteId} の現在のステータス`,
              siteId,
              status: {
                openIssues: openIssues.length,
                recentlyCompleted: completedIssues.length,
                urgentIssues: urgentIssues.length,
                delayedIssues: delayedIssues.length,
              },
              urgentIssues: urgentIssues.slice(0, 10).map(issue => ({
                issueId: issue.IssueId,
                title: issue.Title,
                status: issue.Status,
                completionTime: issue.CompletionTime,
                classA: issue.ClassA,
                classB: issue.ClassB,
              })),
              delayedIssues: delayedIssues.slice(0, 10).map(issue => ({
                issueId: issue.IssueId,
                title: issue.Title,
                progressRate: issue.ProgressRate,
                startTime: issue.StartTime,
                completionTime: issue.CompletionTime,
              })),
              recentlyCompleted: completedIssues.slice(0, 5).map(issue => ({
                issueId: issue.IssueId,
                title: issue.Title,
                updatedTime: issue.UpdatedTime,
              })),
              lastUpdated: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get site status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}