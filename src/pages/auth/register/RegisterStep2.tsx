import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../../../contexts/RegisterContext";
import { ApiError, signup } from "../../../api/auth";

export const RegisterStep2 = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData, resetRegisterData } = useRegister();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signup(registerData);

      resetRegisterData();
      navigate("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage(
          "ユーザー名またはメールアドレスは既に使用されています。",
        );
      } else if (error instanceof ApiError) {
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
    navigate("/register/email_name_birthday");
  };

  const canSubmit =
    registerData.password.trim() !== "" && registerData.password.length > 7;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black/40 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="relative min-h-[590px] w-full max-w-[600px] rounded-2xl bg-white px-8 pb-12 pt-16 shadow-xl sm:px-12"
      >
        <button
          type="button"
          onClick={handlePrevform}
          aria-label="前の画面に戻る"
          className="absolute left-4 top-4 rounded-full p-2 text-2xl text-slate-900 transition hover:bg-slate-100"
        >
          ←
        </button>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 text-6xl text-black-500">
          𝕏
        </div>

        <h1 className="mb-7 text-2xl mt-13 font-bold text-slate-900">
          パスワード設定
        </h1>

        <div className="space-y-5">
          <label className="block">
            <span className="sr-only">パスワード</span>

            <input
              type="password"
              placeholder="パスワード"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value,
                })
              }
              disabled={isSubmitting}
              className="h-16 w-full border-b-2 border-slate-500 bg-slate-100 px-3 outline-none transition focus:border-sky-500"
            />

            {errorMessage && (
              <p role="alert" className="error-message">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full mt-20 rounded-full bg-black px-5 py-2 font-bold text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </button>
          </label>
        </div>
      </form>
    </main>
  );
};
