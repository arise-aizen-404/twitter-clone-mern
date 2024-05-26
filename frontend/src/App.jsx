import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import Sidebar from "./components/common/Sidebar";
import HomePage from "./pages/home/HomePage";
import RightPanel from "./components/common/RightPanel";
import NotificatonPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
function App() {
  const { data: authenticatedUser, isLoading } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.error) return null; // even if we logout then there is an empty object in authenticatedUser so it will be true and in routes it will show homePage because authenticatedUser ? <Navigate to="/" /> : <LoginPage /> this will become true even if we use navigate("/")
        if (!response.ok)
          throw new Error(data.message || "Something went wrong");
        // console.log("Auth user: ", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="max-w-[1024px] flex mx-auto">
      {/* common components are not gonna wrapped in Routes */}
      <Toaster />
      {authenticatedUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authenticatedUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={authenticatedUser ? <Navigate to="/" /> : <SignUpPage />}
        />
        <Route
          path="/login"
          element={authenticatedUser ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/notifications"
          element={
            authenticatedUser ? <NotificatonPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile/:username"
          element={
            authenticatedUser ? <ProfilePage /> : <Navigate to="/login" />
          }
        />
      </Routes>
      {authenticatedUser && <RightPanel />}
    </div>
  );
}
export default App;
