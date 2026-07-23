type DeleteCommentModalProps = {
  deleting: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
};

export const DeleteCommentModal = ({
  deleting,
  error,
  onConfirm,
  onClose,
}: DeleteCommentModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/40 px-4"
    role="presentation"
    onMouseDown={(event) =>
      event.target === event.currentTarget && !deleting && onClose()
    }
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-comment-title"
      className="w-full max-w-xs rounded-2xl bg-black p-8 text-white"
    >
      <h2 id="delete-comment-title" className="text-xl font-bold">
        コメントを削除しますか？
      </h2>
      <p className="mt-2 text-sm leading-5 text-slate-500">
        この操作は取り消せません。
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={deleting}
        onClick={onConfirm}
        className="mt-6 w-full rounded-full bg-red-600 py-3 font-bold hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "削除中..." : "削除"}
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={onClose}
        className="mt-3 w-full rounded-full border border-slate-600 py-3 font-bold hover:bg-slate-900 disabled:opacity-50"
      >
        キャンセル
      </button>
    </div>
  </div>
);
