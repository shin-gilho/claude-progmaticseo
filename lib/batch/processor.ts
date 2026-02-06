import { delay } from '@/lib/utils';

export interface BatchConfig {
  batchSize: number;
  delayBetweenBatches: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  batchSize: 5,
  delayBetweenBatches: 2000,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

export interface BatchItem<T> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'success' | 'failed';
  result?: any;
  error?: string;
  retryCount: number;
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

export type ProgressCallback = (progress: BatchProgress) => void;
export type ItemProcessor<T, R> = (item: T) => Promise<R>;

export async function processBatch<T, R>(
  items: BatchItem<T>[],
  processor: ItemProcessor<T, R>,
  config: BatchConfig = DEFAULT_BATCH_CONFIG,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<BatchItem<T>[]> {
  const totalBatches = Math.ceil(items.length / config.batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    // Check for abort
    if (signal?.aborted) {
      throw new Error('Batch processing aborted');
    }

    const start = batchIndex * config.batchSize;
    const batch = items.slice(start, start + config.batchSize);

    // Process batch items in parallel
    await Promise.all(
      batch.map(async (item) => {
        item.status = 'processing';

        try {
          item.result = await processWithTimeout(
            () => processWithRetry(() => processor(item.data), config.maxRetries, config.retryDelay),
            config.timeout
          );
          item.status = 'success';
        } catch (error) {
          item.status = 'failed';
          item.error = error instanceof Error ? error.message : 'Unknown error';
        }
      })
    );

    // Update progress
    const completed = items.filter((i) => i.status !== 'pending' && i.status !== 'processing').length;

    if (onProgress) {
      onProgress({
        total: items.length,
        completed,
        success: items.filter((i) => i.status === 'success').length,
        failed: items.filter((i) => i.status === 'failed').length,
        pending: items.filter((i) => i.status === 'pending').length,
        currentBatch: batchIndex + 1,
        totalBatches,
        percentage: Math.round((completed / items.length) * 100),
        currentItem: batch[0]?.data ? String(batch[0].data) : undefined,
      });
    }

    // Delay between batches (except for last batch)
    if (batchIndex < totalBatches - 1) {
      await delay(config.delayBetweenBatches);
    }
  }

  return items;
}

async function processWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Exponential backoff
      await delay(baseDelay * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'rate limit',
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    '429',
    '503',
    '502',
    'overloaded',
  ];

  const message = error.message.toLowerCase();
  return retryablePatterns.some((pattern) => message.includes(pattern.toLowerCase()));
}

async function processWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
    ),
  ]);
}

export function createBatchItems<T>(
  data: T[],
  idExtractor: (item: T) => string
): BatchItem<T>[] {
  return data.map((item) => ({
    id: idExtractor(item),
    data: item,
    status: 'pending' as const,
    retryCount: 0,
  }));
}
