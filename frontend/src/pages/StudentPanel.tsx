import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import AppLayout from "@/components/AppLayout";
import { Calendar as CalendarIcon, Table, User, Search, CheckCircle2, XCircle, Info, Camera, Play, Square } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { studentApi, attendanceApi, recognitionApi } from "@/lib/api";
import { toast } from "sonner";
import GlassButton from "@/components/GlassButton";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { isWeekend, eachDayOfInterval, isSameDay, format, startOfDay } from "date-fns";
import StatusIndicator from "@/components/StatusIndicator";

export default function StudentPanel() {
  const [searchParams] = useSearchParams();
  const role = localStorage.getItem("user_role");
  const storedRoll = localStorage.getItem("student_roll");
  
  const [view, setView] = useState<"table" | "calendar">("table");
  const [rollNumber, setRollNumber] = useState(storedRoll || searchParams.get("roll") || "");
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const handleSearch = async (providedRoll?: string) => {
    const rollToSearch = providedRoll || rollNumber;
    if (!rollToSearch) return;
    
    setLoading(true);
    try {
      const studentsRes = await studentApi.getAll();
      const foundStudent = studentsRes.data.find((s: any) => s.roll_number === rollToSearch);
      
      if (!foundStudent) {
        if (role === "admin") toast.error("Student not found with this roll number");
        setStudent(null);
        setAttendance([]);
        return;
      }

      setStudent(foundStudent);
      const attRes = await attendanceApi.getStudent(foundStudent.id);
      setAttendance(attRes.data);
      
      const statusRes = await recognitionApi.getStatus();
      setIsRecognizing(statusRes.data.is_running);
    } catch (err) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If student is logged in (has storedRoll), auto-load their data immediately
    if (role === "student" && storedRoll) {
      handleSearch(storedRoll);
    } else {
      // Admin view: check search params
      const roll = searchParams.get("roll");
      if (roll) {
        handleSearch(roll);
      }
    }
  }, [role, storedRoll, searchParams]);

  // Handle personal attendance marking
  const handleToggleRecognition = async () => {
    if (!student) return;
    try {
      if (isRecognizing) {
        await recognitionApi.stop();
        toast.success("Camera stopped");
      } else {
        // Targeted start: only recognize THIS student
        await recognitionApi.start(student.id);
        toast.success("Position your face for recognition");
      }
      setIsRecognizing(!isRecognizing);
      // Refresh data after a short delay to see the new attendance mark
      setTimeout(() => handleSearch(student.roll_number), 5000);
    } catch (err) {
      toast.error("Failed to control camera");
    }
  };

  // Advanced Attendance Logic
  const attendanceStats = useMemo(() => {
    if (!student) return { present: [], absent: [], totalWorking: 0, rate: 0 };

    const registrationDate = new Date(student.created_at);
    const today = new Date();
    
    // Get all days from registration to today
    const allDays = eachDayOfInterval({
      start: startOfDay(registrationDate),
      end: startOfDay(today)
    });

    // Filter for working days (Mon-Fri)
    const workingDays = allDays.filter(day => !isWeekend(day));
    
    // Present dates from attendance records
    const presentDates = attendance.map(entry => startOfDay(new Date(entry.date)));

    const present: Date[] = [];
    const absent: Date[] = [];

    workingDays.forEach(day => {
      const isPresent = presentDates.find(pDate => isSameDay(pDate, day));
      if (isPresent) {
        present.push(day);
      } else {
        absent.push(day);
      }
    });

    const rate = workingDays.length > 0 ? Math.round((present.length / workingDays.length) * 100) : 0;

    return { present, absent, totalWorking: workingDays.length, rate };
  }, [student, attendance]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground mt-1">Biometric verification and attendance history</p>
      </motion.div>

      {/* Search Bar - ONLY for Admins */}
      {role === "admin" && (
        <GlassCard className="mb-8 max-w-xl">
          <div className="flex gap-3">
            <div className="flex-1 glass-card flex items-center gap-2 px-4 py-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Lookup student by Roll Number..."
                className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <GlassButton onClick={() => handleSearch()} disabled={loading}>
              {loading ? "Searching..." : "View Records"}
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {!student ? (
        <div className="text-center py-20">
          <User className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {role === "student" ? "Loading your profile..." : "Enter a roll number above to view student records"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard glow>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center mb-4 neon-border shadow-xl">
                <span className="text-3xl font-bold text-white uppercase">{student.name[0]}</span>
              </div>
              <h2 className="text-2xl font-display font-bold">{student.name}</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                {student.department} • {student.roll_number}
              </p>
              
              <div className="mt-8 p-6 glass-card w-full bg-primary/10 border-primary/30">
                <p className="text-5xl font-display font-bold text-primary neon-text">{attendanceStats.rate}%</p>
                <p className="text-[10px] text-primary/70 mt-2 uppercase tracking-[0.2em] font-bold">Verified Attendance Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                <div className="glass-card p-4 text-center border-green-500/40 bg-green-500/10">
                  <p className="text-2xl font-display font-bold text-green-400">{attendanceStats.present.length}</p>
                  <p className="text-[10px] text-green-400/70 uppercase font-bold tracking-wider mt-1">Present</p>
                </div>
                <div className="glass-card p-4 text-center border-red-500/40 bg-red-500/10">
                  <p className="text-2xl font-display font-bold text-red-400">{attendanceStats.absent.length}</p>
                  <p className="text-[10px] text-red-400/70 uppercase font-bold tracking-wider mt-1">Absent</p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 text-[10px] text-muted-foreground text-left p-4 glass-card bg-muted/20 border-border/20">
                <Info className="h-4 w-4 text-primary/50 flex-shrink-0" />
                <p className="leading-relaxed">Records calculated from registration date: <span className="text-foreground font-bold">{format(new Date(student.created_at), 'MMM dd, yyyy')}</span>. Weekend cycles are excluded.</p>
              </div>
            </div>
          </GlassCard>

          {/* Attendance History */}
          <GlassCard className="lg:col-span-2" delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold tracking-tight uppercase tracking-[0.1em]">Verification Logs</h2>
              <div className="flex gap-1 glass-card p-1 bg-background/50 border-border/40">
                <button
                  onClick={() => setView("table")}
                  className={`p-2 rounded-xl transition-all ${view === "table" ? "gradient-accent text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Table className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`p-2 rounded-xl transition-all ${view === "calendar" ? "gradient-accent text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/40">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No synchronization records found</p>
              </div>
            ) : view === "table" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-[10px] font-bold text-muted-foreground pb-4 uppercase tracking-[0.2em] px-4">
                  <span>Log Date</span>
                  <span>Sync Time</span>
                  <span className="text-right">Biometric Status</span>
                </div>
                {attendance.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-3 py-4 text-sm bg-white/5 border border-white/5 hover:border-primary/20 rounded-2xl px-4 transition-all group mb-2"
                  >
                    <span className="text-foreground group-hover:text-primary transition-colors font-medium">{format(new Date(entry.date), 'PP')}</span>
                    <span className="text-muted-foreground">{entry.time}</span>
                    <span className="text-right">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500 text-black uppercase tracking-tighter">
                        VERIFIED
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Legend */}
                <div className="flex gap-8 mb-10 p-4 glass-card bg-background/50 border-border/40 text-[10px] font-black uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-green-500 border border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                    <span className="text-green-400">Present</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-red-600 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <span className="text-red-500">Absent</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-30">
                    <div className="w-4 h-4 rounded-lg bg-muted border border-border" />
                    <span>N/A</span>
                  </div>
                </div>

                <div className="p-8 rounded-[40px] border border-border/40 bg-background/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  <Calendar
                    mode="multiple"
                    selected={attendanceStats.present}
                    className="p-0 border-none"
                    modifiers={{
                      present: attendanceStats.present,
                      absent: attendanceStats.absent
                    }}
                    modifiersStyles={{
                      present: {
                        backgroundColor: "#22c55e",
                        color: "#000000",
                        fontWeight: "900",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)"
                      },
                      absent: {
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        fontWeight: "900",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)"
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </GlassCard>

          {/* Targeted Attendance Marking Section */}
          <GlassCard className="lg:col-span-3 mt-6" glow delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold">Mark My Attendance</h2>
                <p className="text-sm text-muted-foreground">Secure self-service biometric verification</p>
              </div>
              <StatusIndicator status={isRecognizing ? "scanning" : "idle"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-video bg-background/50 rounded-3xl overflow-hidden border border-border/30 shadow-2xl">
                {isRecognizing ? (
                  <img 
                    src="http://localhost:8000/recognition/video_feed" 
                    className="w-full h-full object-cover" 
                    alt="Live Feed"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Camera className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Camera is off</p>
                  </div>
                )}
                
                {isRecognizing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 scan-line" />
                    <div className="absolute inset-0 border-[20px] border-background/20" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Recognition is targeted only to your biometric profile.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Other students will not be recognized in this view.</p>
                  </div>
                </div>

                <GlassButton 
                  size="lg" 
                  className="w-full py-6" 
                  onClick={handleToggleRecognition}
                  variant={isRecognizing ? "danger" : "primary"}
                >
                  <span className="flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs">
                    {isRecognizing ? (
                      <> <Square className="h-5 w-5 fill-current" /> Stop Scanner </>
                    ) : (
                      <> <Play className="h-5 w-5 fill-current" /> Begin Personal Scan </>
                    )}
                  </span>
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
