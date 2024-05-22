import "./App.css";
import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import Sidebar from "./components/common/Sidebar";
import HomePage from "./pages/home/HomePage";
import RightPanel from "./components/common/RightPanel";
import NotificatonPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
function App() {
  return (
    <div className="flex mx-auto">
      {/* common components are not gonna wrapped in Routes */}
      <Sidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificatonPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
      <RightPanel />
    </div>
  );
}
export default App;
