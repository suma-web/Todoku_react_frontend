import { Link, Navigate } from "react-router-dom";
import schoolCommunicationImage from "../../assets/school-communication.png";
import { useAuth } from "../../contexts/auth";

export const RoleHomePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-white">読み込み中...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <img
          src={schoolCommunicationImage}
          alt="校内コミュニケーション"
          className="mx-auto w-full max-w-md object-contain"
        />
        <section>
          <p className="text-sm font-semibold text-sky-400">
            {user.name}さん、おかえりなさい
          </p>
          <h1 className="mt-2 text-3xl font-bold">今日の校内情報を確認しましょう</h1>
          <p className="mt-4 text-slate-300">
            連絡の確認、質問、担当窓口の検索をひとつの場所から始められます。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/timeline" className="rounded-full bg-sky-600 px-5 py-3 font-bold hover:bg-sky-500">
              連絡を見る
            </Link>
            <Link to="/questions" className="rounded-full border border-slate-600 px-5 py-3 font-bold hover:bg-slate-800">
              質問を見る
            </Link>
            {user.role === "admin" && (
              <Link to="/admin/users" className="rounded-full border border-slate-600 px-5 py-3 font-bold hover:bg-slate-800">
                ユーザー管理
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
