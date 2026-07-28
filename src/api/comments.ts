import { API_BASE_URL } from "./base";

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  name: string;
  comment: string;
  created_at: string;
};

export type CommentsPage = {
  comments: Comment[];
  limit: number;
  offset: number;
  has_more: boolean;
};

type ErrorBody = { error?: { message?: string } };

export const createComment = async (postID: number, comment: string): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postID}/comments`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  const body = (await response.json().catch(() => null)) as Comment | ErrorBody | null;
  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "コメントを投稿できませんでした");
  }
  return body as Comment;
};

export const getComments = async (postID: number, limit = 20, offset = 0): Promise<CommentsPage> => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_BASE_URL}/api/posts/${postID}/comments?${query}`, { credentials: "include" });
  const body = (await response.json().catch(() => null)) as CommentsPage | ErrorBody | null;
  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "コメント一覧を取得できませんでした");
  }
  return body as CommentsPage;
};

export const getMyComments = async (limit = 20, offset = 0): Promise<CommentsPage> => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_BASE_URL}/api/me/comments?${query}`, { credentials: "include" });
  const body = (await response.json().catch(() => null)) as CommentsPage | ErrorBody | null;
  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "コメント一覧を取得できませんでした");
  }
  return body as CommentsPage;
};

export const deleteComment = async (commentID: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/comments/${commentID}`, { method: "DELETE", credentials: "include" });
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as ErrorBody | null;
  throw new Error(body?.error?.message ?? "コメントを削除できませんでした");
};
