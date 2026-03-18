import { NavLink as RouterNavLink, Link } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student", label: "Student Panel", icon: User },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  { to: "/registration", label: "Registration", icon: Camera },
];

export default function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            onClick={() => {
              console.log(`Navigating to ${item.to}`);
              setMobileOpen(false);
            }}
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

      {/* Theme toggle */}
      <div className="px-4 pb-6">
        <button
          onClick={toggleTheme}
          className="glass-card flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
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
