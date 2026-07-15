import { API_BASE_URL } from "./base";

export type CurrentUser = {
  id: number;
  name: string;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: "include",
  });

  const body = (await response.json().catch(() => null)) as
    | CurrentUser
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message =
      body && "error" in body
        ? body.error?.message
        : undefined;
    throw new Error(message ?? "ユーザー情報を取得できませんでした");
  }

  return body as CurrentUser;
};
