import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>ログイン</h1>

      <button onClick={() => navigate("/register/email_name_birthday")}>
        アカウントを作成
      </button>
    </div>
  );
};
