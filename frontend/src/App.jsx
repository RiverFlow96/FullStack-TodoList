import { Route, BrowserRouter, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useStore";
import AuthPage from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import LoginLayout from "./layouts/LoginLayout";
import RegisterLayout from "./layouts/RegisterLayout";
import ProfilePage from "./pages/ProfilePage";
import { TaskLayout } from "./layouts/TaskLayout";
import AddTaskPage from "./pages/AddTaskPage";
import { Toaster } from "react-hot-toast";
import EditTaskPage from "./pages/EditTaskPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"

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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
            <Route path="/home/add" element={<AddTaskPage />} />
            <Route path="/home/edit/:id" element={<EditTaskPage />} />
          </Route>

          {/* Public routes - only for non-logged users */}
          <Route path="/auth" element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }>
            <Route path="login" element={<LoginLayout />} />
            <Route path="register" element={<RegisterLayout />} />
            <Route path="verify" element={<VerifyEmailPage />} />
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
