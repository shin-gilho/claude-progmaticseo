import type { Template } from './template';
import type { Prompt } from './prompt';

export type PostStatus = 'pending' | 'success' | 'failed';

export interface Post {
  id: string;
  title: string;
  content: string;
  keyword: string;
  status: PostStatus;
  wpPostId: number | null;
  wpUrl: string | null;
  errorMessage: string | null;
  templateId: string;
  template?: Template;
  promptId: string;
  prompt?: Prompt;
  createdAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  keyword: string;
  status: PostStatus;
  wpPostId?: number;
  wpUrl?: string;
  errorMessage?: string;
  templateId: string;
  promptId: string;
}
