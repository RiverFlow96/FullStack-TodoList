import { Route, BrowserRouter, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Home />} />
          <Route path="/tasks:id" element={<Tasks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/auth:login" element={<LoginPage />} />
          <Route path="/auth:register" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
