import { useEffect } from "react";

type DeleteAccountModalProps = {
  error: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteAccountModal = ({
  error,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-black p-6 shadow-2xl"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.38c.866-1.5 3.03-1.5 3.896 0l7.355 12.746ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 id="delete-account-title" className="text-xl font-bold">
          アカウントを削除しますか？
        </h2>
        <div
          id="delete-account-description"
          className="mt-3 space-y-2 text-sm leading-6 text-slate-400"
        >
          <p>
            投稿、コメント、いいね、ブックマーク、フォロー、通知、ダイレクトメッセージなど、アカウントに関連するデータが削除されます。
          </p>
          <p className="font-bold text-red-400">
            削除したアカウントとデータは元に戻せません。
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-full border border-slate-600 px-5 py-2.5 font-bold transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-5 py-2.5 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "退会処理中..." : "退会する"}
          </button>
        </div>
      </section>
    </div>
  );
};
