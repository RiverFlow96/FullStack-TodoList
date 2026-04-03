import { Route, BrowserRouter, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useStore";
import AuthPage from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import LoginLayout from "./layouts/LoginLayout";
import RegisterLayout from "./layouts/RegisterLayout";
import ProfilePage from "./pages/ProfilePage";
import { TaskLayout } from "./layouts/TaskLayout";

function ProtectedLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

function PublicOnlyRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  if (isLoggedIn) {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Protected routes - require login */}
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<HomePage />}>
              <Route index="true" element={<TaskLayout />} />
            </Route>
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Public routes - only for non-logged users */}
          <Route path="/auth" element={
            <AuthPage />
          }>
            <Route path="login" element={<LoginLayout />} />
            <Route path="register" element={<RegisterLayout />} />
            <Route index="true" element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
