import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export const PostCreate = () => {
  const navigate = useNavigate();
  const [postData, setPostData] = useState({
    doc: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("画像は5MB以下にしてください");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handlePostChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const doc = textarea.value;

    setPostData((previous) => ({
      ...previous,
      doc,
    }));

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("doc", postData.doc.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;

        throw new Error(body?.error?.message ?? "投稿に失敗しました");
      }

      navigate("/home");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "通信に失敗しました。時間をおいてもう一度お試しください。",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevform = () => {
    navigate("/home");
  };

  const canSubmit =
    (postData.doc.trim().length > 0 || selectedImage !== null) &&
    postData.doc.length <= 140 &&
    !isSubmitting;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black/40 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="relative min-h-[350px] w-full max-w-[600px] rounded-2xl bg-white px-8 pb-12 pt-16 shadow-xl sm:px-3"
      >
        <button
          type="button"
          onClick={handlePrevform}
          aria-label="homeに戻る"
          className="absolute left-2 top-2 flex size-10 items-center justify-center rounded-full text-xl leading-none text-slate-900 transition hover:bg-gray-200"
        >
          ×
        </button>

        <div className="space-y-5">
          <label className="block">
            <span className="sr-only">いまどうしてる？</span>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                U
              </div>
              <textarea
                placeholder="いまどうしてる？"
                value={postData.doc}
                rows={1}
                onChange={handlePostChange}
                disabled={isSubmitting}
                maxLength={140}
                className="box-border min-h-10 w-full resize-none overflow-hidden whitespace-pre-wrap wrap-break-word border-slate-500 py-2 outline-none transition focus:border-gray-200"
              />
            </div>
          </label>

          {imagePreviewUrl && (
            <div className="relative ml-13 overflow-hidden rounded-2xl border border-gray-200">
              <img
                src={imagePreviewUrl}
                alt="選択した投稿画像のプレビュー"
                className="max-h-80 w-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="選択した画像を削除"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white hover:bg-black/85"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3">
          <div className="flex gap-1 text-black">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isSubmitting}
              aria-label="投稿する画像を選択"
              className="rounded-full p-2 hover:bg-gray-500/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              className="rounded-full p-2 hover:bg-gray-500/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-gray-500/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                />
              </svg>
            </button>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-gray-500/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <p role="alert" className="error-message">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span
                aria-label="投稿中"
                className="block size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
            ) : (
              "ポストする"
            )}
          </button>
        </div>
      </form>
    </main>
  );
};
