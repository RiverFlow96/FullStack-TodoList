import { Route, BrowserRouter, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import LoginLayout from "./layouts/LoginLayout";
import RegisterLayout from "./layouts/RegisterLayout";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          {/* <Route path="/tasks:id" element={<Tasks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/auth" element={<AuthPage />}>
            <Route path="login" element={<LoginLayout />} />
            <Route path="register" element={<RegisterLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
