import { API_BASE_URL } from "./base";

export type CurrentUser = {
  id: number;
  name: string;
  bio: string;
  location: string;
  website: string;
  created_at: string;
};

export type ProfileInput = Pick<
  CurrentUser,
  "name" | "bio" | "location" | "website"
>;

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

export const getUserProfile = async (name: string): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(name)}`, { credentials: "include" });
  return readUserResponse(response, "プロフィールを取得できませんでした");
};

export const updateProfile = async (input: ProfileInput): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readUserResponse(response, "プロフィールを更新できませんでした");
};
