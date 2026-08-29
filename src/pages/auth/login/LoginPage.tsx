import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ApiError, login } from "../../../api/auth";
import { useAuth } from "../../../contexts/auth";
import schoolCommunicationImage from "../../../assets/school-communication.png";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loginData, setLoginData] = useState({
    name: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

  const canSubmit =
    loginData.name.trim() !== "" && loginData.password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    await sleep(500);

    try {
      await login(loginData);
      await refresh();

      setLoginData({
        name: "",
        password: "",
      });

      navigate("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage("ユーザー名またはパスワードが違います");
      } else if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "通信に失敗しました。時間をおいてもう一度お試しください。",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[600px] rounded-3xl border border-sky-100 bg-white px-8 pb-12 pt-8 shadow-[0_24px_70px_rgba(37,137,232,0.14)] sm:px-12"
        >
          <img
            src={schoolCommunicationImage}
            alt="校内コミュニケーション"
            className="mx-auto h-44 w-44 object-contain sm:h-52 sm:w-52"
          />

          <h1 className="mb-7 text-2xl font-bold text-slate-900">
            ログイン
          </h1>

          <div className="space-y-5">
            <label className="block">
              <span className="sr-only">ユーザー名</span>

              <input
                type="text"
                placeholder="ユーザー名"
                value={loginData.name}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    name: e.target.value,
                  })
                }
                className="h-16 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <input
                type="password"
                placeholder="パスワード"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                className="h-16 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </label>
            {errorMessage && (
              <p role="alert" className="error-message">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-12 flex w-full justify-center rounded-full bg-sky-600 px-5 py-3 font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setLoading(true)}
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
              "続ける"
            )}
          </button>
          <p className="text-sm pl-4 pr-4 pt-3 justify-center items-center text-gray-600/75 dark:text-gray-400/75 ">
            続行することで、利用規約、プライバシーポリシーおよびCookieの使用に同意したものとみなされます。
          </p>
        </form>
      </main>
    </div>
  );
};
