import { API_BASE_URL } from "./base";

export type MessageGroup = {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  member_count: number;
  last_message: string | null;
  last_message_at: string | null;
};

export type DirectMessage = {
  id: number;
  group_id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
};

type GroupsPage = { groups: MessageGroup[]; limit: number; offset: number; has_more: boolean };
type MessagesPage = { messages: DirectMessage[]; limit: number; offset: number; has_more: boolean };
type ErrorBody = { error?: { message?: string } };

const read = async <T,>(response: Response, fallback: string): Promise<T> => {
  const body = (await response.json().catch(() => null)) as T | ErrorBody | null;
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? fallback);
  }
  return body as T;
};

export const getGroups = async (limit = 20, offset = 0) => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return read<GroupsPage>(
    await fetch(`${API_BASE_URL}/api/groups?${query}`, { credentials: "include" }),
    "グループ一覧を取得できませんでした",
  );
};

export const getGroup = async (id: number) =>
  read<MessageGroup>(
    await fetch(`${API_BASE_URL}/api/groups/${id}`, { credentials: "include" }),
    "グループを取得できませんでした",
  );

export const createGroup = async (name: string, memberNames: string[]) =>
  read<MessageGroup>(
    await fetch(`${API_BASE_URL}/api/groups`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, member_names: memberNames }),
    }),
    "グループを作成できませんでした",
  );

export const getMessages = async (groupID: number, limit = 50, offset = 0) => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return read<MessagesPage>(
    await fetch(`${API_BASE_URL}/api/groups/${groupID}/messages?${query}`, { credentials: "include" }),
    "メッセージ一覧を取得できませんでした",
  );
};

export const createMessage = async (groupID: number, message: string) =>
  read<DirectMessage>(
    await fetch(`${API_BASE_URL}/api/groups/${groupID}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }),
    "メッセージを投稿できませんでした",
  );
