import { API_BASE_URL } from "./base";

export type SchoolPost = {
  id: number;
  author_id: number;
  author_name: string;
  type: "notice" | "emergency";
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  expires_at: string | null;
  created_at: string;
  group_ids: number[];
};

export type SchoolPostStatus = {
  target_count: number;
  read_count: number;
  confirmed_count: number;
  unconfirmed_count: number;
  confirmed_users: Array<{ id: number; name: string }>;
  read_only_users: Array<{ id: number; name: string }>;
  unread_users: Array<{ id: number; name: string }>;
};

type CreateSchoolPostInput = Pick<
  SchoolPost,
  "type" | "title" | "content" | "priority" | "expires_at" | "group_ids"
>;

const read = async <T,>(request: Response | Promise<Response>): Promise<T> => {
  const response = await request;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? "処理に失敗しました");
  }
  return body as T;
};

export const createSchoolPost = (input: CreateSchoolPostInput) =>
  read<SchoolPost>(
    fetch(`${API_BASE_URL}/api/school-posts`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

export const getTimeline = () =>
  read<SchoolPost[]>(
    fetch(`${API_BASE_URL}/api/timeline`, { credentials: "include" }),
  );
export const getSchoolPost=(id:number)=>read<SchoolPost>(fetch(`${API_BASE_URL}/api/school-posts/${id}`,{credentials:"include"}));
export const getSchoolPostStatus=(id:number)=>read<SchoolPostStatus>(fetch(`${API_BASE_URL}/api/school-posts/${id}/status`,{credentials:"include"}));
export const getUnconfirmedUsers=(id:number)=>read<Array<{id:number;name:string}>>(fetch(`${API_BASE_URL}/api/school-posts/${id}/unconfirmed`,{credentials:"include"}));

export const markSchoolPostRead = (id: number) =>
  fetch(`${API_BASE_URL}/api/school-posts/${id}/read`, {
    method: "POST",
    credentials: "include",
  });

export const confirmSchoolPost = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/school-posts/${id}/confirm`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("確認状態を保存できませんでした");
};
