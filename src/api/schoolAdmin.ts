import { API_BASE_URL } from "./base";

export type UserRole = "student" | "teacher" | "admin";
export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};
export type CreateManagedUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const read = async <T>(request: Promise<Response>) => {
  const response = await request;
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error?.message ?? "処理に失敗しました");
  return body as T;
};

export const getManagedUsers = () =>
  read<ManagedUser[]>(
    fetch(`${API_BASE_URL}/api/admin/users`, { credentials: "include" }),
  );
export const createManagedUser = (input: CreateManagedUserInput) =>
  read<ManagedUser>(
    fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
export const updateManagedUser = (user: ManagedUser) =>
  read<ManagedUser>(
    fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: user.role, is_active: user.is_active }),
    }),
  );
