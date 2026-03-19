import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "./pages/Dashboard";
import StudentPanel from "./pages/StudentPanel";
import AdminPanel from "./pages/AdminPanel";
import StudentRegistration from "./pages/StudentRegistration";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const token = localStorage.getItem("snapattend_token");
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const role = localStorage.getItem("snapattend_role");
  if (role !== "admin") return <Navigate to="/student" replace />;
  return <Outlet />;
};

const LayoutWrapper = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Direct Login Routes (No more auto-redirect away from login) */}
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/student" element={<StudentLogin />} />
            
            {/* Protected Application Area */}
            <Route element={<ProtectedRoute />}>
              <Route element={<LayoutWrapper />}>
                {/* Admin Only Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/registration" element={<StudentRegistration />} />
                </Route>
                
                {/* Common/Student Routes */}
                <Route path="/student" element={<StudentPanel />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
