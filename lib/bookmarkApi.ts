import api from '@/lib/axios';
import { ExplorePost } from '@/components/explore/types';

export type BookmarkPage = {
  posts: ExplorePost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function addBookmarkApi(postId: string): Promise<void> {
  await api.post(`/posts/bookmarks/${postId}`);
}

export async function removeBookmarkApi(postId: string): Promise<void> {
  await api.delete(`/posts/bookmarks/${postId}`);
}

export async function checkBookmarkApi(postId: string): Promise<boolean> {
  const res = await api.get<{
    success: boolean;
    data: { isBookmarked: boolean };
  }>(`/posts/bookmarks/check/${postId}`);
  return res.data.data.isBookmarked;
}

export async function fetchBookmarksApi(
  page = 1,
  limit = 15
): Promise<BookmarkPage> {
  const res = await api.get<{
    success: boolean;
    data: ExplorePost[];
    pagination: BookmarkPage['pagination'];
  }>('/posts/bookmarks', { params: { page, limit } });
  return { posts: res.data.data, pagination: res.data.pagination };
}
