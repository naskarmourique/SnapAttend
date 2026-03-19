import { NavLink as RouterNavLink, Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Camera,
  Sun,
  Moon,
  ScanFace,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const adminItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin", label: "Student Panel", icon: User },
  { to: "/registration", label: "Registration", icon: Camera },
];

const studentItems = [
  { to: "/student", label: "My Attendance", icon: User },
];

export default function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("snapattend_role") || "student";

  const handleLogout = () => {
    localStorage.removeItem("snapattend_token");
    localStorage.removeItem("snapattend_role");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = role === "admin" ? adminItems : studentItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-5 py-6 hover:opacity-80 transition-opacity">
        <div className="glass-card-glow p-2">
          <ScanFace className="h-6 w-6 text-primary" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          SnapAttend
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 relative z-[130] ${
                isActive
                  ? "glass-card-glow text-primary neon-text"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 pb-6 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[100] glass-card p-2 lg:hidden cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[120] h-full w-64 glass-card-glow transition-transform duration-300 transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground p-2"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 glass-card-glow border-r border-border/50">
        {sidebarContent}
      </aside>
    </>
  );
}
