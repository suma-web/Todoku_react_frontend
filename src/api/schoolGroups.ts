import { API_BASE_URL } from "./base";
export type SchoolGroup = {
  id: number;
  name: string;
  type: "grade" | "class" | "club" | "committee" | "department";
};
export type SchoolGroupMember = {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
};
const read = async <T>(request: Response | Promise<Response>): Promise<T> => {
  const response = await request;
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error?.message ?? "処理に失敗しました");
  return body as T;
};
export const getSchoolGroups = () =>
  read<SchoolGroup[]>(
    fetch(`${API_BASE_URL}/api/school-groups`, { credentials: "include" }),
  );
export const createSchoolGroup = (input: Omit<SchoolGroup, "id">) =>
  read<SchoolGroup>(
    fetch(`${API_BASE_URL}/api/school-groups`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
export const deleteSchoolGroup = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/school-groups/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("所属を削除できませんでした");
};
export const addSchoolGroupMember = async (groupId: number, userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/api/school-groups/${groupId}/members`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    },
  );
  if (!response.ok) throw new Error("所属を追加できませんでした");
};
export const getSchoolGroupMembers = (groupId: number) =>
  read<SchoolGroupMember[]>(
    fetch(`${API_BASE_URL}/api/school-groups/${groupId}/members`, {
      credentials: "include",
    }),
  );
export const removeSchoolGroupMember = async (
  groupId: number,
  userId: number,
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/school-groups/${groupId}/members/${userId}`,
    { method: "DELETE", credentials: "include" },
  );
  if (!response.ok) throw new Error("所属から解除できませんでした");
};
