import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../api/user";
import { useAuth } from "../../contexts/auth";

export const SchoolLayout = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const links = [
    { to: "/", label: "ホーム" },
    { to: "/timeline", label: "連絡" },
    { to: "/questions", label: "質問" },
    { to: "/search", label: "検索" },
  ];

  if (user?.role === "teacher" || user?.role === "admin") {
    links.push({ to: "/school-posts/new", label: "連絡作成" });
  }
  if (user?.role === "admin") {
    links.push(
      { to: "/admin/users", label: "ユーザー" },
      { to: "/admin/groups", label: "所属" },
      { to: "/admin/question-categories", label: "質問カテゴリ" },
    );
  }

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      await refresh();
      navigate("/login", { replace: true });
    } catch (reason) {
      setLogoutError(
        reason instanceof Error ? reason.message : "ログアウトできませんでした",
      );
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F4F8FC] text-[#16324F]">
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 font-medium transition ${isActive ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="ml-auto whitespace-nowrap rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "ログアウト中..." : "ログアウト"}
          </button>
        </nav>
        {logoutError && (
          <p role="alert" className="mx-auto max-w-5xl px-4 pb-2 text-right text-sm text-red-600">
            {logoutError}
          </p>
        )}
      </header>
      <Outlet />
    </div>
  );
};
