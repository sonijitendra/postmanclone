/* TypeScript types for the application */

// ============================================
// Key-Value Pair (used for headers, params, form data)
// ============================================
export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// ============================================
// Request Body
// ============================================
export type BodyType = 'none' | 'raw_json' | 'raw_text' | 'form_data' | 'x_www_form_urlencoded';

export interface RequestBody {
  type: BodyType;
  content?: string;
  form_data?: KeyValuePair[];
}

// ============================================
// Auth
// ============================================
export type AuthType = 'none' | 'bearer' | 'basic';

export interface AuthData {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
}

// ============================================
// HTTP Methods
// ============================================
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// ============================================
// Request (saved in a collection)
// ============================================
export interface SavedRequest {
  id: string;
  collection_id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: RequestBody | null;
  body_type: BodyType;
  auth_type: AuthType;
  auth_data: AuthData | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Collection
// ============================================
export interface Collection {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  requests: SavedRequest[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Environment
// ============================================
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  name: string;
  is_active: boolean;
  variables: EnvironmentVariable[];
  created_at: string;
  updated_at: string;
}

// ============================================
// History
// ============================================
export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  request_headers?: KeyValuePair[];
  request_params?: KeyValuePair[];
  request_body?: RequestBody;
  body_type: BodyType;
  auth_type: AuthType;
  auth_data?: AuthData;
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  response_time_ms?: number;
  response_size_bytes?: number;
  error_message?: string;
  created_at: string;
}

export interface HistoryListEntry {
  id: string;
  method: HttpMethod;
  url: string;
  response_status?: number;
  response_time_ms?: number;
  error_message?: string;
  created_at: string;
}

// ============================================
// Proxy (Send Request)
// ============================================
export interface ProxyResponse {
  status_code?: number;
  headers?: Record<string, string>;
  body?: string;
  time_ms?: number;
  size_bytes?: number;
  error?: string;
}

// ============================================
// Tabs
// ============================================
export type TabType = 'new' | 'saved' | 'history';

export interface Tab {
  id: string;
  request_id?: string;
  history_id?: string;
  tab_type: TabType;
  title: string;
  unsaved_state?: RequestState;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Request Editor State (in-memory, per tab)
// ============================================
export interface RequestState {
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: RequestBody;
  auth: AuthData;
}

// ============================================
// Code Generation
// ============================================
export interface CodeSnippet {
  language: string;
  code: string;
}
