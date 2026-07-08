import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ApiError, login } from "../../../api/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
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

      setLoginData({
        name: "",
        password: "",
      });

      navigate("/home");
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
      <main className="flex min-h-screen items-center justify-center bg-black/40 px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="relative min-h-[590px] w-full max-w-[600px] rounded-2xl bg-white px-8 pb-12 pt-16 shadow-xl sm:px-12"
        >
          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-6xl font-black text-black-500">
            𝕏
          </div>

          <h1 className="mb-7 mt-13 text-2xl font-bold text-slate-900">
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
                className="h-16 w-full border-b-2 border-slate-500 bg-slate-100 px-3 outline-none transition focus:border-sky-500"
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
                className="h-16 w-full border-b-2 border-slate-500 bg-slate-100 px-3 outline-none transition focus:border-sky-500"
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
            className="w-full mt-20 rounded-full bg-black px-5 py-2 font-bold text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40 flex justify-center"
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
          <button
            className="text-sm text-gray-600/75 dark:text-gray-400/75 pl-4 pr-4 pt-3 justify-end"
            onClick={() => navigate("/register/email_name_birthday")}
          >
            アカウントを作成する
          </button>
        </form>
      </main>
    </div>
  );
};
