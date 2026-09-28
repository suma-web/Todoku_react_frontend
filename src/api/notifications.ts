import { API_BASE_URL } from "./base";

export type AppNotification = {
  id: number;
  post_id: number;
  kind: "important_update";
  title: string;
  read_at: string | null;
  created_at: string;
};
export type NotificationList = { items: AppNotification[]; unread_count: number };

export const getNotifications = async (): Promise<NotificationList> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, { credentials: "include" });
  if (!response.ok) throw new Error("通知を取得できませんでした");
  return response.json();
};
export const markNotificationRead = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: "POST", credentials: "include" });
  if (!response.ok) throw new Error("通知を既読にできませんでした");
};
