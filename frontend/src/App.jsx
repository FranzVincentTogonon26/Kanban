import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoutes, PublicRoutes, RootRedirect } from "./routes/Route";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import BoardPage from "./pages/BoardPage";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Root Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoutes>
              <Register />
            </PublicRoutes>
          }
        />

        {/* Protectec Routes */}
        <Route
          element={
            <ProtectedRoutes>
              <AppLayout />
            </ProtectedRoutes>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#16161d",
            border: "1px solid #e9e8f3",
            borderRadius: "999px",
            padding: "0.6rem 1rem",
            boxShadow: "0 8px 24px rgba(28,27,64,0.1)",
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
