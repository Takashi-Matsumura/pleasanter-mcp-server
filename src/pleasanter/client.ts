import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiRequest,
  ApiResponse,
  Issue,
  Result,
  Site,
  User,
  Group,
  Dept,
  PleasanterConfig,
  BulkOperationRequest,
  ImportRequest,
  ExportRequest,
} from '../types/pleasanter.js';

export class PleasanterClient {
  private client: AxiosInstance;
  private config: PleasanterConfig;

  constructor(config: PleasanterConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pleasanter-MCP-Server/1.0.0',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('[API Response Error]', error.response?.data || error.message);
        
        // Retry logic for rate limiting
        if (error.response?.status === 429 && this.config.retries && this.config.retries > 0) {
          await this.delay(1000);
          this.config.retries--;
          return this.client.request(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createRequest(additionalData: Partial<ApiRequest> = {}): ApiRequest {
    return {
      ApiVersion: 1.0,
      ApiKey: this.config.apiKey,
      ...additionalData,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    data: ApiRequest
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(endpoint, data);
      
      if (response.data.StatusCode && response.data.StatusCode >= 400) {
        throw new Error(`API Error ${response.data.StatusCode}: ${response.data.Message}`);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiResponse<T>;
        if (apiError?.Message) {
          throw new Error(`Pleasanter API Error: ${apiError.Message}`);
        }
      }
      throw error;
    }
  }

  // Issues API
  async getIssues(siteId: number, request: Partial<ApiRequest> = {}): Promise<ApiResponse<Issue>> {
    const data = this.createRequest(request);
    return this.makeRequest<Issue>(`/api/items/${siteId}/get`, data);
  }

  async createIssue(siteId: number, issue: Partial<Issue>): Promise<ApiResponse<Issue>> {
    const data = this.createRequest(issue);
    return this.makeRequest<Issue>(`/api/items/${siteId}/create`, data);
  }

  async updateIssue(siteId: number, issue: Partial<Issue>): Promise<ApiResponse<Issue>> {
    const data = this.createRequest(issue);
    return this.makeRequest<Issue>(`/api/items/${siteId}/update`, data);
  }

  async upsertIssue(siteId: number, issue: Partial<Issue>): Promise<ApiResponse<Issue>> {
    const data = this.createRequest(issue);
    return this.makeRequest<Issue>(`/api/items/${siteId}/upsert`, data);
  }

  async deleteIssue(siteId: number, issueId: number): Promise<ApiResponse<Issue>> {
    const data = this.createRequest({ IssueId: issueId });
    return this.makeRequest<Issue>(`/api/items/${siteId}/delete`, data);
  }

  async bulkUpsertIssues(siteId: number, issues: Partial<Issue>[]): Promise<ApiResponse<Issue>> {
    const data: BulkOperationRequest = this.createRequest({ Data: issues });
    return this.makeRequest<Issue>(`/api/items/${siteId}/bulkupsert`, data);
  }

  async bulkDeleteIssues(siteId: number, issueIds: number[]): Promise<ApiResponse<Issue>> {
    const data: BulkOperationRequest = this.createRequest({ 
      Data: issueIds.map(id => ({ IssueId: id }))
    });
    return this.makeRequest<Issue>(`/api/items/${siteId}/bulkdelete`, data);
  }

  // Results API (similar structure to Issues)
  async getResults(siteId: number, request: Partial<ApiRequest> = {}): Promise<ApiResponse<Result>> {
    const data = this.createRequest(request);
    return this.makeRequest<Result>(`/api/items/${siteId}/get`, data);
  }

  async createResult(siteId: number, result: Partial<Result>): Promise<ApiResponse<Result>> {
    const data = this.createRequest(result);
    return this.makeRequest<Result>(`/api/items/${siteId}/create`, data);
  }

  async updateResult(siteId: number, result: Partial<Result>): Promise<ApiResponse<Result>> {
    const data = this.createRequest(result);
    return this.makeRequest<Result>(`/api/items/${siteId}/update`, data);
  }

  async deleteResult(siteId: number, resultId: number): Promise<ApiResponse<Result>> {
    const data = this.createRequest({ ResultId: resultId });
    return this.makeRequest<Result>(`/api/items/${siteId}/delete`, data);
  }

  // Sites API
  async getSites(request: Partial<ApiRequest> = {}): Promise<ApiResponse<Site>> {
    const data = this.createRequest(request);
    return this.makeRequest<Site>('/api/items/0/getsite', data);
  }

  async createSite(site: Partial<Site>): Promise<ApiResponse<Site>> {
    const data = this.createRequest(site);
    return this.makeRequest<Site>('/api/items/0/createsite', data);
  }

  async updateSite(siteId: number, site: Partial<Site>): Promise<ApiResponse<Site>> {
    const data = this.createRequest(site);
    return this.makeRequest<Site>(`/api/items/${siteId}/updatesite`, data);
  }

  // Users API (Read-only)
  async getUsers(request: Partial<ApiRequest> = {}): Promise<ApiResponse<User>> {
    const data = this.createRequest(request);
    return this.makeRequest<User>('/api/users/get', data);
  }

  // Groups API (Read-only)
  async getGroups(request: Partial<ApiRequest> = {}): Promise<ApiResponse<Group>> {
    const data = this.createRequest(request);
    return this.makeRequest<Group>('/api/groups/get', data);
  }

  // Departments API (Read-only)
  async getDepts(request: Partial<ApiRequest> = {}): Promise<ApiResponse<Dept>> {
    const data = this.createRequest(request);
    return this.makeRequest<Dept>('/api/depts/get', data);
  }

  // Import/Export operations
  async importData(siteId: number, importRequest: Omit<ImportRequest, keyof ApiRequest>): Promise<ApiResponse<any>> {
    const data = this.createRequest(importRequest);
    return this.makeRequest(`/api/items/${siteId}/import`, data);
  }

  async exportData(siteId: number, exportRequest: Omit<ExportRequest, keyof ApiRequest>): Promise<string> {
    const data = this.createRequest(exportRequest);
    const response = await this.client.post(`/api/items/${siteId}/export`, data, {
      responseType: 'text',
    });
    return response.data;
  }

  // Utility methods
  async getIssueById(siteId: number, issueId: number): Promise<Issue | null> {
    try {
      const response = await this.getIssues(siteId, {
        View: {
          ColumnFilterHash: {
            IssueId: issueId.toString(),
          },
        },
        PageSize: 1,
      });

      if (response.Response?.Data && response.Response.Data.length > 0) {
        return response.Response.Data[0];
      }
      return null;
    } catch (error) {
      console.error(`Error getting issue ${issueId}:`, error);
      return null;
    }
  }

  async searchIssues(siteId: number, searchText: string, limit: number = 50): Promise<Issue[]> {
    try {
      const response = await this.getIssues(siteId, {
        View: {
          Search: searchText,
        },
        PageSize: limit,
      });

      return response.Response?.Data || [];
    } catch (error) {
      console.error(`Error searching issues:`, error);
      return [];
    }
  }

  async getOpenIssues(siteId: number): Promise<Issue[]> {
    try {
      const response = await this.getIssues(siteId, {
        View: {
          ColumnFilterHash: {
            Status: '100|200|300', // Open statuses
          },
        },
      });

      return response.Response?.Data || [];
    } catch (error) {
      console.error(`Error getting open issues:`, error);
      return [];
    }
  }

  async getIssuesByAssignee(siteId: number, userId: number): Promise<Issue[]> {
    try {
      const response = await this.getIssues(siteId, {
        View: {
          ColumnFilterHash: {
            Owner: userId.toString(),
          },
        },
      });

      return response.Response?.Data || [];
    } catch (error) {
      console.error(`Error getting issues by assignee:`, error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getUsers({ PageSize: 1 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}