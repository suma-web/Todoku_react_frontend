import { useEffect, useState } from "react";
import { downloadAttachment, listAttachments, type Attachment, type AttachmentParent } from "../../api/attachments";

export const AttachmentList = ({ parent, id }: { parent: AttachmentParent; id: number }) => {
  const [items, setItems] = useState<Attachment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listAttachments(parent, id).then(setItems).catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : "添付ファイルを取得できませんでした"),
    );
  }, [parent, id]);

  if (error) return <p className="mt-4 text-sm text-red-600">{error}</p>;
  if (items.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl bg-slate-50 p-4">
      <h2 className="font-bold">添付ファイル</h2>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => void downloadAttachment(item).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "ダウンロードできませんでした"))}
              className="text-left text-sky-700 underline hover:text-sky-900"
            >
              {item.original_name}（{(item.size_bytes / 1024 / 1024).toFixed(1)}MB）
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
