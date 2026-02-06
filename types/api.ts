export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  success: number;
  failed: number;
  pending: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  currentItem?: string;
}

export interface GenerateRequest {
  templateId: string;
  promptId: string;
  keywords: string[];
  wpCategory?: number;
  wpTags?: number[];
  publishToWp: boolean;
}

export interface GenerateResult {
  keyword: string;
  status: 'success' | 'failed';
  postId?: string;
  wpPostId?: number;
  wpUrl?: string;
  error?: string;
}
