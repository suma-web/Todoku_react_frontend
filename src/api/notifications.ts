import { API_BASE_URL } from "./base";

export type Notification = {
  id: number;
  kind: "like" | "follow" | "comment" | "retweet";
  actor_user_id: number;
  actor_name: string;
  post_id: number | null;
  comment_id: number | null;
  comment: string | null;
  created_at: string;
};

export type NotificationsPage = {
  notifications: Notification[];
  limit: number;
  offset: number;
  has_more: boolean;
};

export const getNotifications = async (
  limit = 20,
  offset = 0,
): Promise<NotificationsPage> => {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${API_BASE_URL}/api/notifications?${query}`, {
    credentials: "include",
  });
  const body = (await response.json().catch(() => null)) as
    | NotificationsPage
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "通知一覧を取得できませんでした");
  }
  return body as NotificationsPage;
};
