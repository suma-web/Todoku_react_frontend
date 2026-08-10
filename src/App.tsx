import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/login/LoginPage";
import { RegisterProvider } from "./contexts/RegisterContext";
import { RegisterStep1 } from "./pages/auth/register/RegisterStep1";
import { RegisterStep2 } from "./pages/auth/register/RegisterStep2";
import { Home } from "./pages/app/Home";
import { PostCreate } from "./pages/app/PostCreate";
import { PostDetail } from "./pages/app/PostDetail";
import { SelfProfile } from "./pages/app/Profile";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import { Notifications } from "./pages/app/Notifications";
import { Messages, MessageGroupDetail } from "./pages/app/Messages";
import { Bookmarks } from "./pages/app/Bookmarks";

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

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/post/create" element={<PostCreate />} />
            <Route path="/post/:id/detail" element={<PostDetail />} />
            <Route path="/user/:name" element={<SelfProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:groupId" element={<MessageGroupDetail />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </RegisterProvider>
    </BrowserRouter>
  );
}

export default App;
