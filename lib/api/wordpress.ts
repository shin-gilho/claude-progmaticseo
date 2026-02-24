import { decrypt } from '@/lib/security/encryption';

export interface WPAuth {
  siteUrl: string;
  username: string;
  encryptedPassword: string;
}

export interface WPPostData {
  title: string;
  content: string;
  status: 'draft' | 'publish' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
  meta?: {
    // RankMath SEO 필드
    rank_math_focus_keyword?: string;
    rank_math_description?: string;
    rank_math_title?: string;
    // 기타 커스텀 메타 필드
    [key: string]: any;
  };
}

export interface WPPost {
  id: number;
  link: string;
  title: { rendered: string };
  status: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/**
 * Build RankMath SEO metadata from template settings and keyword
 * @param keyword - Keyword to substitute in patterns (e.g., "R1049")
 * @param focusKeywordsPattern - Focus keywords pattern from template (supports {{keyword}})
 * @param descriptionPattern - Meta description pattern from template (supports {{keyword}})
 * @returns RankMath meta object (returns null if patterns are not provided)
 */
export function buildRankMathMetadata(
  keyword: string,
  focusKeywordsPattern?: string | null,
  descriptionPattern?: string | null
) {
  // If no patterns provided, return null (no RankMath metadata)
  if (!focusKeywordsPattern && !descriptionPattern) {
    return null;
  }

  const result: {
    rank_math_focus_keyword?: string;
    rank_math_description?: string;
  } = {};

  // Replace {{keyword}} in focus keywords pattern
  if (focusKeywordsPattern) {
    result.rank_math_focus_keyword = focusKeywordsPattern.replace(/\{\{keyword\}\}/g, keyword);
  }

  // Replace {{keyword}} in description pattern
  if (descriptionPattern) {
    result.rank_math_description = descriptionPattern.replace(/\{\{keyword\}\}/g, keyword);
  }

  return result;
}

async function wpRequest<T>(
  auth: WPAuth,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { siteUrl, username, encryptedPassword } = auth;
  const password = decrypt(encryptedPassword);
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const url = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `WordPress API error: ${response.status}`);
  }

  return response.json();
}

export async function testConnection(auth: WPAuth): Promise<boolean> {
  await wpRequest<{ id: number }>(auth, '/users/me');
  return true;
}

export async function createPost(auth: WPAuth, postData: WPPostData): Promise<WPPost> {
  return wpRequest<WPPost>(auth, '/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function updatePost(
  auth: WPAuth,
  postId: number,
  postData: Partial<WPPostData>
): Promise<WPPost> {
  return wpRequest<WPPost>(auth, `/posts/${postId}`, {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function getCategories(auth: WPAuth): Promise<WPCategory[]> {
  return wpRequest<WPCategory[]>(auth, '/categories?per_page=100&hide_empty=false');
}

export async function getTags(auth: WPAuth): Promise<WPTag[]> {
  return wpRequest<WPTag[]>(auth, '/tags?per_page=100&hide_empty=false');
}

export async function createCategory(auth: WPAuth, name: string): Promise<WPCategory> {
  return wpRequest<WPCategory>(auth, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function createTag(auth: WPAuth, name: string): Promise<WPTag> {
  return wpRequest<WPTag>(auth, '/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}
