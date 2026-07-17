import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/auth/login/LoginPage";
import { RegisterProvider } from "./contexts/RegisterContext";
import { RegisterStep1 } from "./pages/auth/register/RegisterStep1";
import { RegisterStep2 } from "./pages/auth/register/RegisterStep2";
import { Home } from "./pages/app/Home";
import { PostCreate } from "./pages/app/PostCreate";
import { PostDetail } from "./pages/app/PostDetail";

function App() {
  return (
    <BrowserRouter>
      <RegisterProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/register/email_name_birthday"
            element={<RegisterStep1 />}
          />
          <Route path="/register/password" element={<RegisterStep2 />} />
          <Route path="/home" element={<Home />} />
          <Route path="/post/create" element={<PostCreate />} />
          <Route path="/post/:id/detail" element={<PostDetail />} />
        </Routes>
      </RegisterProvider>
    </BrowserRouter>
  );
}

export default App;
