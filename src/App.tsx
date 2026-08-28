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
import { RoleRoute } from "./pages/auth/RoleRoute";
import { GroupsPage } from "./pages/admin/GroupsPage";
import { SchoolPostCreatePage } from "./pages/school/SchoolPostCreatePage";
import { TimelinePage } from "./pages/school/TimelinePage";
import { QuestionsPage } from "./pages/school/QuestionsPage";
import { QuestionCreatePage } from "./pages/school/QuestionCreatePage";
import { QuestionDetailPage } from "./pages/school/QuestionDetailPage";
import { QuestionCategoriesPage } from "./pages/admin/QuestionCategoriesPage";
import { SearchPage } from "./pages/school/SearchPage";
import { SchoolLayout } from "./components/school/SchoolLayout";
import { RoleHomePage } from "./pages/school/RoleHomePage";
import { UsersPage } from "./pages/admin/UsersPage";
import { SchoolPostDetailPage } from "./pages/school/SchoolPostDetailPage";
import { PostStatusPage } from "./pages/school/PostStatusPage";

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
            <Route element={<SchoolLayout />}>
              <Route index element={<RoleHomePage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/new" element={<QuestionCreatePage />} />
              <Route path="/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/school-posts/:id" element={<SchoolPostDetailPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/groups" element={<GroupsPage />} />
              <Route path="/admin/question-categories" element={<QuestionCategoriesPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute roles={["teacher", "admin"]} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/school-posts/new" element={<SchoolPostCreatePage />} />
              <Route path="/teacher/school-posts/:id/status" element={<PostStatusPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RegisterProvider>
    </BrowserRouter>
  );
}

export default App;
