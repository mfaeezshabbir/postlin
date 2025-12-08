/**
 * Helper to convert object keys to full URLs using environment variable
 * This allows changing R2_PUBLIC_URL without database migrations
 */

import { getFileUrl } from './r2';

export interface PostWithUrls {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  [key: string]: any;
}

/**
 * Convert object keys in a post to full URLs
 * If imageUrl/videoUrl are just keys, construct full URLs
 * If they're already full URLs, return as-is
 */
export function constructPostUrls(post: any): PostWithUrls {
  return {
    ...post,
    imageUrl: post.imageUrl ? constructFileUrl(post.imageUrl) : null,
    videoUrl: post.videoUrl ? constructFileUrl(post.videoUrl) : null,
  };
}

/**
 * Convert object key to full URL if needed
 */
export function constructFileUrl(filePathOrUrl: string | null | undefined): string | null {
  if (!filePathOrUrl) return null;

  // If it's already a full URL, return as-is
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl;
  }

  // Otherwise treat it as an object key and construct the full URL
  try {
    return getFileUrl(filePathOrUrl);
  } catch (error) {
    console.error('Error constructing file URL:', error);
    return filePathOrUrl; // Fallback to returning the key
  }
}

/**
 * Convert multiple posts
 */
export function constructPostsUrls(posts: any[]): PostWithUrls[] {
  return posts.map(constructPostUrls);
}
