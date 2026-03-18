import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "./pages/Dashboard";
import StudentPanel from "./pages/StudentPanel";
import AdminPanel from "./pages/AdminPanel";
import StudentRegistration from "./pages/StudentRegistration";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

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
            <Route element={<LayoutWrapper />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/student" element={<StudentPanel />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/registration" element={<StudentRegistration />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
