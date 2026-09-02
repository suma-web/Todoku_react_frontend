import { API_BASE_URL } from "./base";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role: "student" | "teacher" | "admin";
  is_active: boolean;
};

const readUserResponse = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => null)) as
    | CurrentUser
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? fallback);
  }
  return body as CurrentUser;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: "include",
  });

  return readUserResponse(response, "ユーザー情報を取得できませんでした");
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  throw new Error(body?.error?.message ?? "ログアウトできませんでした");
};
