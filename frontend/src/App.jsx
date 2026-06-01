import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/feed" /> : <Login />} />
      <Route path="/login" element={token ? <Navigate to="/feed" /> : <Login />} />
      <Route path="/signup" element={token ? <Navigate to="/feed" /> : <Signup />} />
      <Route path="/feed" element={token ? <Feed /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;