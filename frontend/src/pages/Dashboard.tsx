import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import StatusIndicator from "@/components/StatusIndicator";
import { Users, UserCheck, UserX, Camera, Play, Square, CheckCircle2, Info, Star, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { analyticsApi, attendanceApi, recognitionApi, studentApi } from "@/lib/api";
import { toast } from "sonner";
import { isWeekend, eachDayOfInterval, isSameDay, startOfDay, format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");
  const studentRoll = localStorage.getItem("student_roll");

  // Admin State
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [monthly, setMonthly] = useState({ month: "", attendance_rate: 0 });

  // Student State
  const [studentData, setStudentData] = useState<any>(null);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [dailyRes, logsRes, statusRes, monthlyRes] = await Promise.all([
        analyticsApi.getDaily(),
        attendanceApi.getAll(),
        recognitionApi.getStatus(),
        analyticsApi.getMonthly()
      ]);
      setStats({ present: dailyRes.data.present, absent: dailyRes.data.absent, total: dailyRes.data.total });
      setMonthly(monthlyRes.data);
      setRecentLogs(logsRes.data.slice(-5).reverse());
      setIsRecognizing(statusRes.data.is_running);
    } catch (err) {
      console.error("Dashboard admin fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!studentRoll) return;
    try {
      const [studentsRes, statusRes] = await Promise.all([
        studentApi.getAll(),
        recognitionApi.getStatus()
      ]);
      const found = studentsRes.data.find((s: any) => s.roll_number === studentRoll);
      if (found) {
        setStudentData(found);
        const attRes = await attendanceApi.getStudent(found.id);
        setStudentAttendance(attRes.data);
      }
      setIsRecognizing(statusRes.data.is_running);
    } catch (err) {
      console.error("Dashboard student fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 5000);
      return () => clearInterval(interval);
    } else {
      fetchStudentData();
      const interval = setInterval(fetchStudentData, 5000);
      return () => clearInterval(interval);
    }
  }, [role, studentRoll]);

  const studentStats = useMemo(() => {
    if (!studentData) return { rate: 0, present: 0, absent: 0 };
    const allDays = eachDayOfInterval({ start: startOfDay(new Date(studentData.created_at)), end: startOfDay(new Date()) });
    const workingDays = allDays.filter(day => !isWeekend(day));
    const presentDates = studentAttendance.map(entry => startOfDay(new Date(entry.date)));
    const presentCount = workingDays.filter(day => presentDates.find(pDate => isSameDay(pDate, day))).length;
    const rate = workingDays.length > 0 ? Math.round((presentCount / workingDays.length) * 100) : 0;
    return { rate, present: presentCount, absent: workingDays.length - presentCount };
  }, [studentData, studentAttendance]);

  const handleToggleRecognition = async () => {
    try {
      if (isRecognizing) {
        await recognitionApi.stop();
        toast.success("Stopped");
      } else {
        await recognitionApi.start(role === "student" ? studentData?.id : undefined);
        toast.success("Started");
      }
      setIsRecognizing(!isRecognizing);
    } catch (err) {
      toast.error("Control failed");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;

  if (role === "student") {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Biometric <span className="text-primary neon-text">Portal</span>
            </h1>
            <p className="text-muted-foreground mt-1">Status: {studentData?.name} | {studentData?.roll_number}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Session</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <GlassCard glow>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="text-4xl font-display font-bold text-primary mt-1 neon-text">{studentStats.rate}%</p>
          </GlassCard>
          <GlassCard border="border-green-500/20">
            <p className="text-sm text-muted-foreground">Days Present</p>
            <p className="text-4xl font-display font-bold text-green-400 mt-1">{studentStats.present}</p>
          </GlassCard>
          <GlassCard border="border-red-500/20">
            <p className="text-sm text-muted-foreground">Days Absent</p>
            <p className="text-4xl font-display font-bold text-red-400 mt-1">{studentStats.absent}</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard glow className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Self-Service Scan</h2>
              <StatusIndicator status={isRecognizing ? "scanning" : "idle"} />
            </div>
            <div className="relative aspect-video bg-background/50 rounded-2xl overflow-hidden border border-border/30">
              {isRecognizing ? (
                <img src="http://localhost:8000/recognition/video_feed" className="w-full h-full object-cover" alt="Feed" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <Camera className="h-12 w-12 mb-2" />
                  <p className="text-xs uppercase tracking-widest font-bold">Scanner Offline</p>
                </div>
              )}
            </div>
            <GlassButton className="w-full mt-4" onClick={handleToggleRecognition} variant={isRecognizing ? "danger" : "primary"}>
              {isRecognizing ? "Stop Scanner" : "Start Personal Scan"}
            </GlassButton>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-display font-semibold mb-4">Quick Tip</h2>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 glass-card bg-primary/5">
                <Star className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Make sure your face is well-lit and you are looking directly at the camera for the highest accuracy.
                </p>
              </div>
              <div className="flex gap-3 p-3 glass-card bg-muted/20">
                <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground italic">
                  Attendance is calculated based on working days (Mon-Fri) starting from your registration date.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  // Admin View (Current)
  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary neon-text">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's today's attendance overview</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
          <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Active</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Present Today", value: stats.present, icon: UserCheck, color: "text-green-400" },
          { label: "Absent Today", value: stats.absent, icon: UserX, color: "text-destructive" },
          { label: `${monthly.month || 'Monthly'} Rate`, value: `${Math.round(monthly.attendance_rate)}%`, icon: Play, color: "text-purple-400" },
        ].map((s, i) => (
          <GlassCard key={s.label} glow delay={i * 0.1}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-3xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className="glass-card p-3">
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard glow className="lg:col-span-2" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Live Recognition</h2>
            <StatusIndicator status={isRecognizing ? "scanning" : "idle"} />
          </div>
          <div className="relative aspect-video bg-background/50 rounded-2xl overflow-hidden flex items-center justify-center border border-border/30">
            {isRecognizing ? (
              <img 
                src="http://localhost:8000/recognition/video_feed" 
                className="w-full h-full object-cover" 
                alt="Live Feed"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  setIsRecognizing(false);
                }}
              />
            ) : (
              <div className="text-center">
                <Camera className="h-16 w-16 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Camera is currently inactive</p>
              </div>
            )}
            
            {isRecognizing && (
              <>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="bracket-corner bracket-tl top-4 left-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-tr top-4 right-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-bl bottom-4 left-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-br bottom-4 right-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="absolute top-4 left-4 right-4 h-0.5 gradient-accent opacity-60 scan-line" />
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <GlassButton 
              size="lg" 
              className="flex-1" 
              onClick={handleToggleRecognition}
              variant={isRecognizing ? "danger" : "primary"}
            >
              <span className="flex items-center justify-center gap-2">
                {isRecognizing ? (
                  <> <Square className="h-5 w-5" /> Stop System </>
                ) : (
                  <> <Play className="h-5 w-5" /> Start Recognition </>
                )}
              </span>
            </GlassButton>
          </div>
        </GlassCard>

        <GlassCard delay={0.4}>
          <h2 className="text-lg font-display font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity recorded today</p>
            ) : recentLogs.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.student_name}</p>
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Present
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
