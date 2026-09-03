import { API_BASE_URL } from "./base";

export type Attachment = {
  id: number;
  original_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export type AttachmentParent = "school-posts" | "questions" | "answers";

const readError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);
  return body?.error?.message ?? fallback;
};

export const listAttachments = async (
  parent: AttachmentParent,
  id: number,
): Promise<Attachment[]> => {
  const response = await fetch(`${API_BASE_URL}/api/${parent}/${id}/attachments`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(await readError(response, "添付ファイルを取得できませんでした"));
  return response.json() as Promise<Attachment[]>;
};

export const uploadAttachments = async (
  parent: AttachmentParent,
  id: number,
  files: File[],
): Promise<Attachment[]> => {
  if (files.length === 0) return [];
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const response = await fetch(`${API_BASE_URL}/api/${parent}/${id}/attachments`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!response.ok) throw new Error(await readError(response, "添付ファイルを保存できませんでした"));
  return response.json() as Promise<Attachment[]>;
};

export const downloadAttachment = async (attachment: Attachment) => {
  const response = await fetch(`${API_BASE_URL}/api/attachments/${attachment.id}/download`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(await readError(response, "添付ファイルをダウンロードできませんでした"));
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = attachment.original_name;
  anchor.click();
  URL.revokeObjectURL(url);
};
