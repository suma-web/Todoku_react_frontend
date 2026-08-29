import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/login/LoginPage";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
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
import { AuthoredSchoolPostsPage } from "./pages/school/AuthoredSchoolPostsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
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
              <Route path="/teacher/school-posts" element={<AuthoredSchoolPostsPage />} />
              <Route path="/teacher/school-posts/:id/status" element={<PostStatusPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
