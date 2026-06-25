import axios from 'axios';
import { 
  Collection, SavedRequest, Environment, EnvironmentVariable, 
  HistoryEntry, HistoryListEntry, ProxyResponse, Tab, RequestState 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to handle Axios error responses gracefully
const handleResponse = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  try {
    const res = await promise;
    return res.data;
  } catch (error: any) {
    console.error('API Error:', error);
    const message = error.response?.data?.detail || error.message || 'API request failed';
    throw new Error(typeof message === 'object' ? JSON.stringify(message) : message);
  }
};

export const apiService = {
  // ============================================
  // Collections & Saved Requests
  // ============================================
  getCollections: () => 
    handleResponse<Collection[]>(apiClient.get('/collections')),

  getCollection: (id: string) => 
    handleResponse<Collection>(apiClient.get(`/collections/${id}`)),

  createCollection: (data: { name: string; description?: string }) => 
    handleResponse<Collection>(apiClient.post('/collections', data)),

  updateCollection: (id: string, data: { name: string; description?: string }) => 
    handleResponse<Collection>(apiClient.patch(`/collections/${id}`, data)),

  deleteCollection: (id: string) => 
    handleResponse<void>(apiClient.delete(`/collections/${id}`)),

  saveRequest: (collectionId: string, data: {
    name: string;
    method: string;
    url: string;
    headers: any[];
    params: any[];
    body: any;
    body_type: string;
    auth_type: string;
    auth_data: any;
  }) => 
    handleResponse<SavedRequest>(apiClient.post(`/collections/${collectionId}/requests`, data)),

  updateRequest: (requestId: string, data: {
    name?: string;
    method?: string;
    url?: string;
    headers?: any[];
    params?: any[];
    body?: any;
    body_type?: string;
    auth_type?: string;
    auth_data?: any;
  }) => 
    handleResponse<SavedRequest>(apiClient.patch(`/requests/${requestId}`, data)),

  deleteRequest: (requestId: string) => 
    handleResponse<void>(apiClient.delete(`/requests/${requestId}`)),

  // ============================================
  // Environments & Variables
  // ============================================
  getEnvironments: () => 
    handleResponse<Environment[]>(apiClient.get('/environments')),

  getEnvironment: (id: string) => 
    handleResponse<Environment>(apiClient.get(`/environments/${id}`)),

  createEnvironment: (data: { name: string; variables?: { key: string; value: string; enabled: boolean }[] }) => 
    handleResponse<Environment>(apiClient.post('/environments', data)),

  updateEnvironment: (id: string, data: { name?: string }) => 
    handleResponse<Environment>(apiClient.patch(`/environments/${id}`, data)),

  deleteEnvironment: (id: string) => 
    handleResponse<void>(apiClient.delete(`/environments/${id}`)),

  updateVariables: (environmentId: string, variables: { key: string; value: string; enabled: boolean }[]) => 
    handleResponse<EnvironmentVariable[]>(apiClient.put(`/environments/${environmentId}/variables`, variables)),

  activateEnvironment: (id: string | null) => {
    if (!id) {
      return handleResponse<void>(apiClient.post('/environments/deactivate'));
    }
    return handleResponse<void>(apiClient.post(`/environments/${id}/activate`));
  },

  // ============================================
  // History
  // ============================================
  getHistory: (page = 1, limit = 50) => 
    handleResponse<HistoryListEntry[]>(apiClient.get('/history', { params: { page, limit } })),

  getHistoryDetail: (id: string) => 
    handleResponse<HistoryEntry>(apiClient.get(`/history/${id}`)),

  deleteHistoryEntry: (id: string) => 
    handleResponse<void>(apiClient.delete(`/history/${id}`)),

  clearHistory: () => 
    handleResponse<void>(apiClient.delete('/history')),

  // ============================================
  // Open Tabs
  // ============================================
  getTabs: () => 
    handleResponse<Tab[]>(apiClient.get('/tabs')),

  createTab: (data: {
    request_id?: string;
    history_id?: string;
    tab_type: string;
    title: string;
    unsaved_state?: RequestState;
    is_active: boolean;
    sort_order: number;
  }) => 
    handleResponse<Tab>(apiClient.post('/tabs', data)),

  updateTab: (id: string, data: {
    title?: string;
    unsaved_state?: RequestState;
    is_active?: boolean;
    sort_order?: number;
    request_id?: string;
    tab_type?: string;
  }) => 
    handleResponse<Tab>(apiClient.patch(`/tabs/${id}`, data)),

  closeTab: (id: string) => 
    handleResponse<void>(apiClient.delete(`/tabs/${id}`)),

  reorderTabs: (tabIds: string[]) => 
    handleResponse<void>(apiClient.post('/tabs/reorder', { tab_ids: tabIds })),

  // ============================================
  // Proxy (Send request)
  // ============================================
  sendRequest: (data: {
    method: string;
    url: string;
    headers: any[];
    params: any[];
    body: any;
    auth: any;
    environment_id?: string | null;
  }) => 
    handleResponse<ProxyResponse>(apiClient.post('/proxy/send', data)),

  // ============================================
  // Code Generation
  // ============================================
  generateCurl: (data: {
    method: string;
    url: string;
    headers: any[];
    params: any[];
    body: any;
    auth: any;
  }) => 
    handleResponse<{ snippet: string }>(apiClient.post('/codegen/curl', data)),

  generateFetch: (data: {
    method: string;
    url: string;
    headers: any[];
    params: any[];
    body: any;
    auth: any;
  }) => 
    handleResponse<{ snippet: string }>(apiClient.post('/codegen/fetch', data)),

  // ============================================
  // Import / Export
  // ============================================
  importCollection: (postmanCollectionJson: any) => 
    handleResponse<{ message: string; collection_id: string }>(
      apiClient.post('/import/postman-v2', postmanCollectionJson)
    ),

  exportCollection: (collectionId: string) => 
    handleResponse<any>(apiClient.get(`/export/postman-v2/${collectionId}`)),
};
