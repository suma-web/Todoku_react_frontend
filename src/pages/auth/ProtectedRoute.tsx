import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../../api/user";

export const ProtectedRoute = () => {
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">(
    "loading",
  );

  useEffect(() => {
    getCurrentUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("guest"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white">
        読み込み中...
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};