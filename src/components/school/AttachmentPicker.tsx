import { attachmentsAreValid } from "../../utils/attachmentValidation";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export const AttachmentPicker = ({ files, onChange, disabled = false }: Props) => {
  const error = attachmentsAreValid(files) ? "" : "PDF・JPEG・PNG・WebPを最大5件、1件10MB・合計25MB以内で指定してください";

  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
      <legend className="px-2 font-bold">添付ファイル</legend>
      <input
        type="file"
        multiple
        disabled={disabled}
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        className="block w-full text-sm"
      />
      <p className="mt-2 text-xs text-slate-500">PDF・JPEG・PNG・WebP／最大5件／1件10MB／合計25MB</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}（{(file.size / 1024 / 1024).toFixed(1)}MB）</li>)}
        </ul>
      )}
    </fieldset>
  );
};
