import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../../../contexts/RegisterContext";
import type { DateSelectProps } from "../../../types/register";

const DateSelect = ({ label, value, onChange, children }: DateSelectProps) => {
  return (
    <label className="relative block">
      <span className="absolute left-3 top-2 text-sm text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-16 w-full appearance-none border-b-2 border-slate-500 bg-slate-100 px-3 pb-1 pt-6 outline-none transition focus:border-sky-500"
      >
        <option value="">選択</option>
        {children}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 text-slate-500">
        ▼
      </span>
    </label>
  );
};

export const RegisterStep1 = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 100 }, (_, index) => currentYear - index);
  }, []);

  const canSubmit =
    registerData.name.trim() !== "" &&
    registerData.email.trim() !== "" &&
    year !== "" &&
    month !== "" &&
    day !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const birthday = [year, month.padStart(2, "0"), day.padStart(2, "0")].join(
      "-",
    );

    setRegisterData((current) => ({
      ...current,
      birthday,
    }));

    navigate("/register/password");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black/40 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="relative min-h-[590px] w-full max-w-[600px] rounded-2xl bg-white px-8 pb-12 pt-16 shadow-xl sm:px-12"
      >
        <div className="absolute left-1/2 top-4 -translate-x-1/2 text-6xl font-black text-black-500">
          𝕏
        </div>

        <h1 className="mb-7 mt-13 text-2xl font-bold text-slate-900">
          アカウントを作成
        </h1>

        <div className="space-y-5">
          <label className="block">
            <span className="sr-only">名前</span>

            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="名前"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData((current) => ({
                    ...current,
                    name: e.target.value,
                  }))
                }
                className="h-16 w-full border-b-2 border-slate-500 bg-slate-100 px-3 outline-none transition focus:border-sky-500"
              />

              <span className="absolute bottom-1 right-2 text-sm text-slate-500">
                {registerData.name.length}/50
              </span>
            </div>
          </label>

          <label className="block">
            <span className="sr-only">メールアドレス</span>

            <input
              type="email"
              placeholder="メールアドレス"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              className="h-16 w-full border-b-2 border-slate-500 bg-slate-100 px-3 outline-none transition focus:border-sky-500"
            />
          </label>
        </div>

        <section className="mt-10">
          <h2 className="font-bold text-slate-900">生年月日</h2>

          <p className="mb-4 text-sm leading-5 text-slate-500">
            この情報は公開されません。適切な内容を表示するため、
            年齢を確認してください。
          </p>

          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
            <DateSelect label="月" value={month} onChange={setMonth}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}月
                  </option>
                ),
              )}
            </DateSelect>

            <DateSelect label="日" value={day} onChange={setDay}>
              {Array.from({ length: 31 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}日
                  </option>
                ),
              )}
            </DateSelect>

            <DateSelect label="年" value={year} onChange={setYear}>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}年
                </option>
              ))}
            </DateSelect>
          </div>
        </section>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full mt-20 rounded-full bg-black px-5 py-2 font-bold text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          次へ
        </button>
      </form>
    </main>
  );
};
