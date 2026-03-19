import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassButton from "@/components/GlassButton";
import GlassCard from "@/components/GlassCard";
import { ScanFace, ShieldCheck, Zap, BarChart3, Users, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: ScanFace,
      title: "Face Recognition",
      description: "Industry-leading accuracy using FaceNet512 for instant biometric verification."
    },
    {
      icon: ShieldCheck,
      title: "Anti-Spoofing",
      description: "Advanced liveness detection to prevent photo or video replay attacks."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Async processing ensures your attendance is marked in milliseconds."
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Automated reporting, low attendance alerts, and monthly trends for admins."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="glass-card-glow p-2">
            <ScanFace className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tighter">SnapAttend</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                <span className="hidden xs:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span className="hidden xs:inline">Dark Mode</span>
              </>
            )}
          </button>
          <button 
            onClick={() => navigate("/login/student")}
            className="hidden sm:block text-sm font-medium hover:text-primary transition-colors"
          >
            Login
          </button>
          <GlassButton onClick={() => navigate("/login/student")} size="sm">
            Get Started
          </GlassButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Version 2.0 Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              The Future of Attendance <br /> is <span className="text-primary neon-text">Biometric</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Eliminate proxy attendance and manual logs with our high-precision facial recognition system. 
              Designed for modern classrooms and secure workplaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton size="lg" className="px-10" onClick={() => navigate("/login/admin")}>
                Admin Portal <ChevronRight className="ml-2 h-4 w-4" />
              </GlassButton>
              <GlassButton variant="secondary" size="lg" className="px-10" onClick={() => navigate("/login/student")}>
                Student Access
              </GlassButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <GlassCard key={i} delay={i * 0.1} glow>
                <div className="p-2 w-fit rounded-xl bg-primary/10 mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Login Path CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => navigate("/login/student")}
            >
              <GlassCard className="h-full border-primary/20 group-hover:border-primary/50 transition-all p-8 text-center" glow>
                <Users className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">For Students</h2>
                <p className="text-muted-foreground mb-8">
                  Check your personal attendance, track your monthly percentage, and mark yourself present using your device's camera.
                </p>
                <span className="text-primary font-bold flex items-center justify-center gap-2">
                  Student Login <ChevronRight className="h-4 w-4" />
                </span>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => navigate("/login/admin")}
            >
              <GlassCard className="h-full border-purple-500/20 group-hover:border-purple-500/50 transition-all p-8 text-center" glow>
                <ShieldCheck className="h-12 w-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">For Administrators</h2>
                <p className="text-muted-foreground mb-8">
                  Register new students, monitor live recognition logs, manage student database, and export detailed attendance reports.
                </p>
                <span className="text-purple-400 font-bold flex items-center justify-center gap-2">
                  Admin Login <ChevronRight className="h-4 w-4" />
                </span>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ScanFace className="h-5 w-5 text-primary" />
          <span className="font-display font-bold">SnapAttend</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2024 SnapAttend • Built for modern institutions with Security & Privacy in mind.
        </p>
      </footer>
    </div>
  );
}
