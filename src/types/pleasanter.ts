// Pleasanter API types based on code analysis

export interface ApiRequest {
  ApiVersion: number;
  ApiKey: string;
  View?: View;
  Keys?: string[];
  Offset?: number;
  PageSize?: number;
  TableType?: 'Normal' | 'History' | 'Deleted';
  Token?: string;
}

export interface ApiResponse<T = any> {
  Id: number;
  StatusCode: number;
  LimitPerDate?: number;
  LimitRemaining?: number;
  Message?: string;
  Response?: {
    Data: T[];
    TotalCount?: number;
  };
}

export interface View {
  ColumnFilterHash?: Record<string, string>;
  ColumnFilterExpressions?: Record<string, string>;
  ColumnFilterSearchTypes?: Record<string, SearchType>;
  ColumnFilterNegatives?: string[];
  Search?: string;
  ColumnSorterHash?: Record<string, 'asc' | 'desc'>;
}

export type SearchType = 'PartialMatch' | 'FullMatch' | 'ForwardMatch' | 'BackwardMatch' | 'Regex';

export interface Issue {
  IssueId?: number;
  Title: string;
  Body?: string;
  Status?: number;
  Manager?: number;
  Owner?: number;
  StartTime?: string;
  CompletionTime?: string;
  WorkValue?: number;
  ProgressRate?: number;
  RemainingWorkValue?: number;
  ClassA?: string;
  ClassB?: string;
  ClassC?: string;
  NumA?: number;
  NumB?: number;
  NumC?: number;
  DateA?: string;
  DateB?: string;
  DateC?: string;
  DescriptionA?: string;
  DescriptionB?: string;
  DescriptionC?: string;
  CheckA?: boolean;
  CheckB?: boolean;
  CheckC?: boolean;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
  Comments?: string;
}

export interface Result {
  ResultId?: number;
  Title: string;
  Body?: string;
  Status?: number;
  Manager?: number;
  Owner?: number;
  ClassA?: string;
  ClassB?: string;
  ClassC?: string;
  NumA?: number;
  NumB?: number;
  NumC?: number;
  DateA?: string;
  DateB?: string;
  DateC?: string;
  DescriptionA?: string;
  DescriptionB?: string;
  DescriptionC?: string;
  CheckA?: boolean;
  CheckB?: boolean;
  CheckC?: boolean;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
  Comments?: string;
}

export interface Site {
  SiteId?: number;
  Title: string;
  Body?: string;
  ReferenceType?: string;
  ParentId?: number;
  InheritPermission?: boolean;
  SiteSettings?: string;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
}

export interface User {
  UserId: number;
  LoginId: string;
  Name: string;
  UserCode?: string;
  Password?: string;
  Email?: string;
  MailAddress?: string;
  LastLoginTime?: string;
  PasswordExpirationTime?: string;
  PasswordChangeTime?: string;
  NumberOfLogins?: number;
  NumberOfDenial?: number;
  TenantManager?: boolean;
  ServiceManager?: boolean;
  AllowCreationAtTopSite?: boolean;
  AllowGroupAdministration?: boolean;
  AllowGroupCreation?: boolean;
  AllowApi?: boolean;
  Disabled?: boolean;
  Lockout?: boolean;
  LockoutCounter?: number;
  Developer?: boolean;
  UserSettings?: string;
  ApiKey?: string;
  DeptId?: number;
  GroupId?: number;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
}

export interface Group {
  GroupId: number;
  GroupName: string;
  Body?: string;
  Members?: string;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
}

export interface Dept {
  DeptId: number;
  DeptCode?: string;
  DeptName: string;
  Body?: string;
  Creator?: number;
  Updator?: number;
  CreatedTime?: string;
  UpdatedTime?: string;
}

export interface PleasanterConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

export interface BulkOperationRequest extends ApiRequest {
  Data: Array<Partial<Issue | Result | Site>>;
}

export interface ImportRequest extends ApiRequest {
  ImportFormat: 'Csv' | 'Excel' | 'Json';
  Data: string;
  UpdatingMode: 'Insert' | 'Update' | 'Upsert';
}

export interface ExportRequest extends ApiRequest {
  ExportFormat: 'Csv' | 'Excel' | 'Json';
}