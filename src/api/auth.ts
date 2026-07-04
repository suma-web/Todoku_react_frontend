import type { ErrorResponse } from "../types/apierror";
import type { RegisterData } from "../types/register";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const signup = async (data: RegisterData) => {
  const response = await fetch("http://localhost:8080/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = (await response.json().catch(() => null)) as
    | ErrorResponse
    | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.message ?? "登録に失敗しました",
      body?.error?.code,
    );
  }

  return body;
};