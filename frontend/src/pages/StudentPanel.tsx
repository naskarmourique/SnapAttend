import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import AppLayout from "@/components/AppLayout";
import { Calendar as CalendarIcon, Table, User, Camera, Play, Square, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { studentApi, attendanceApi, recognitionApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import StatusIndicator from "@/components/StatusIndicator";
import GlassButton from "@/components/GlassButton";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function StudentPanel() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "calendar">("table");
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const role = localStorage.getItem("snapattend_role");

  const fetchMyData = useCallback(async () => {
    try {
      const profileRes = await studentApi.getMyProfile();
      setStudent(profileRes.data);
      
      const attRes = await attendanceApi.getStudent(profileRes.data.id);
      setAttendance(attRes.data);
      
      if (role === "student") {
        const statusRes = await recognitionApi.getStatus();
        setIsRecognizing(statusRes.data.is_running);
      }
    } catch (err: any) {
      console.error("StudentPanel Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchMyData();
    if (role === "student") {
      const interval = setInterval(fetchMyData, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchMyData, role]);

  const handleToggleRecognition = async () => {
    try {
      if (isRecognizing) {
        await recognitionApi.stop();
        toast.success("Camera stopped");
      } else {
        await recognitionApi.start();
        toast.success("Recognition started. Look at the camera to mark your attendance.");
      }
      setIsRecognizing(!isRecognizing);
    } catch (err) {
      toast.error("Failed to control camera.");
    }
  };

  // Convert attendance dates string to Date objects for the calendar
  const attendanceDates = useMemo(() => {
    return attendance.map(log => {
      const [year, month, day] = log.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  }, [attendance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {role === "admin" ? "Profile Preview" : "My Attendance"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "admin" ? `Viewing details for ${student?.name}` : `Personal dashboard for ${student?.name}`}
          </p>
        </div>
        {role === "admin" && (
          <GlassButton variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Student List
          </GlassButton>
        )}
      </motion.div>

      {!student ? (
        <div className="text-center py-20">
          <User className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load profile data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            {/* Profile Info */}
            <GlassCard glow>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center mb-4 neon-border">
                  <span className="text-2xl font-bold text-white">{student.name ? student.name[0] : "?"}</span>
                </div>
                <h2 className="text-xl font-display font-bold">{student.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {student.department} • Roll #{student.roll_number}
                </p>
                
                <div className="mt-8 p-4 glass-card w-full">
                  <p className="text-4xl font-display font-bold text-primary">
                    {Math.min(Math.round((attendance.length / 20) * 100), 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">Attendance Rate</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                  <div className="glass-card p-3 text-center">
                    <p className="text-2xl font-display font-bold text-green-400">{attendance.length}</p>
                    <p className="text-xs text-muted-foreground">Days Present</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p className="text-2xl font-display font-bold text-muted-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Target: 75%</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ONLY show Camera for Students */}
            {role === "student" && (
              <GlassCard glow delay={0.2} className="bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Live Attendance
                  </h2>
                  <StatusIndicator status={isRecognizing ? "scanning" : "idle"} />
                </div>
                
                <div className="relative aspect-video bg-background/50 rounded-xl overflow-hidden flex items-center justify-center border border-primary/20">
                  {isRecognizing ? (
                    <img 
                      src="http://localhost:8000/recognition/video_feed" 
                      className="w-full h-full object-cover" 
                      alt="Self Feed"
                      onError={() => setIsRecognizing(false)}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-[10px] text-muted-foreground">Click below to mark attendance</p>
                    </div>
                  )}
                </div>
                
                <GlassButton 
                  size="sm" 
                  className="w-full mt-4" 
                  onClick={handleToggleRecognition}
                  variant={isRecognizing ? "danger" : "primary"}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isRecognizing ? (
                      <> <Square className="h-4 w-4" /> Stop Camera </>
                    ) : (
                      <> <Play className="h-4 w-4" /> Mark My Attendance </>
                    )}
                  </span>
                </GlassButton>
              </GlassCard>
            )}
          </div>

          {/* History Section (Visible to both) */}
          <GlassCard className="lg:col-span-2" delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold">
                {role === "admin" ? "Attendance Logs" : "My History"}
              </h2>
              <div className="flex gap-1 glass-card p-1">
                <button onClick={() => setView("table")} className={cn("p-2 rounded-xl transition-all", view === "table" ? "gradient-accent text-white" : "text-muted-foreground hover:text-foreground")}>
                  <Table className="h-4 w-4" />
                </button>
                <button onClick={() => setView("calendar")} className={cn("p-2 rounded-xl transition-all", view === "calendar" ? "gradient-accent text-white" : "text-muted-foreground hover:text-foreground")}>
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records found yet.
              </div>
            ) : view === "table" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs font-bold text-muted-foreground pb-2 border-b border-border/30 px-2">
                  <span>Date</span>
                  <span>Time</span>
                  <span className="text-right">Status</span>
                </div>
                {attendance.map((entry, i) => (
                  <motion.div
                    key={entry.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-3 py-3 text-sm border-b border-border/20 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors"
                  >
                    <span className="text-foreground">{entry.date}</span>
                    <span className="text-muted-foreground">{entry.time}</span>
                    <span className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase">
                        Present
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <Calendar
                  mode="multiple"
                  selected={attendanceDates}
                  className="rounded-2xl border border-border/50 bg-background/20 backdrop-blur-md"
                  modifiers={{
                    present: attendanceDates
                  }}
                  modifiersClassNames={{
                    present: "bg-green-500/20 text-green-400 font-bold border-green-500/50"
                  }}
                />
                <div className="mt-6 flex gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    <span className="text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent border border-border" />
                    <span className="text-muted-foreground">Today</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </>
  );
}
