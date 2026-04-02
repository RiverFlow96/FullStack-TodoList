import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useStore";
import AuthPage from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import LoginLayout from "./layouts/LoginLayout";
import RegisterLayout from "./layouts/RegisterLayout";
import { TaskLayout } from "./layouts/TaskLayout";

function ProtectedRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />
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
          
          {/* Protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }>
            <Route index="true" element={<TaskLayout />} />
          </Route>
          
          {/* Public routes - Auth */}
          <Route path="/auth" element={<AuthPage />}>
            <Route path="login" element={<LoginLayout />} />
            <Route path="register" element={<RegisterLayout />} />
            {/* Redirect /auth to /auth/login */}
            <Route index="true" element={<Navigate to="/auth/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
