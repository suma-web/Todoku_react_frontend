import { API_BASE_URL } from "./base";

export type Post = {
  id: number;
  user_id: number;
  name: string;
  doc: string;
  image_url: string | null;
  created_at: string;
};

export type PostsPage = {
  posts: Post[];
  limit: number;
  offset: number;
  has_more: boolean;
};

export const getPosts = async (
  limit = 20,
  offset = 0,
): Promise<PostsPage> => {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${API_BASE_URL}/api/posts?${query}`, {
    credentials: "include",
  });

  const body = (await response.json().catch(() => null)) as
    | PostsPage
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "投稿一覧を取得できませんでした");
  }

  return body as PostsPage;
};

export const resolveImageURL = (imageURL: string) =>
  imageURL.startsWith("http") ? imageURL : `${API_BASE_URL}${imageURL}`;
