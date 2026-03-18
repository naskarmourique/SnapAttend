import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import AppLayout from "@/components/AppLayout";
import { Calendar, Table, User, Search } from "lucide-react";
import { useState } from "react";
import { studentApi, attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import GlassButton from "@/components/GlassButton";

export default function StudentPanel() {
  const [view, setView] = useState<"table" | "calendar">("table");
  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!rollNumber) return;
    setLoading(true);
    try {
      const studentsRes = await studentApi.getAll();
      const foundStudent = studentsRes.data.find((s: any) => s.roll_number === rollNumber);
      
      if (!foundStudent) {
        toast.error("Student not found with this roll number");
        setStudent(null);
        setAttendance([]);
        return;
      }

      setStudent(foundStudent);
      const attRes = await attendanceApi.getStudent(foundStudent.id);
      setAttendance(attRes.data);
      toast.success(`Records loaded for ${foundStudent.name}`);
    } catch (err) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendance.length;
  // This is a simplified calculation
  const attendancePercentage = student ? Math.min(Math.round((presentCount / 20) * 100), 100) : 0;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground mt-1">Check your personal attendance records</p>
      </motion.div>

      {/* Search Bar */}
      <GlassCard className="mb-8 max-w-xl">
        <div className="flex gap-3">
          <div className="flex-1 glass-card flex items-center gap-2 px-4 py-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter your Roll Number (e.g. CS202401)"
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full py-2"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <GlassButton onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "View Records"}
          </GlassButton>
        </div>
      </GlassCard>

      {!student ? (
        <div className="text-center py-20">
          <User className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Enter your roll number above to see your attendance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard glow>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center mb-4 neon-border">
                <span className="text-2xl font-bold text-white">{student.name[0]}</span>
              </div>
              <h2 className="text-xl font-display font-bold">{student.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {student.department} • Roll #{student.roll_number}
              </p>
              
              <div className="mt-8 p-4 glass-card w-full">
                <p className="text-4xl font-display font-bold text-primary">{attendancePercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">Attendance Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-display font-bold text-green-400">{presentCount}</p>
                  <p className="text-xs text-muted-foreground">Days Present</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-display font-bold text-muted-foreground">--</p>
                  <p className="text-xs text-muted-foreground">Days Absent</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Attendance History */}
          <GlassCard className="lg:col-span-2" delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold">Attendance History</h2>
              <div className="flex gap-1 glass-card p-1">
                <button
                  onClick={() => setView("table")}
                  className={`p-2 rounded-xl transition-all ${view === "table" ? "gradient-accent text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Table className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`p-2 rounded-xl transition-all ${view === "calendar" ? "gradient-accent text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records found yet.
              </div>
            ) : view === "table" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs font-semibold text-muted-foreground pb-2 border-b border-border/30">
                  <span>Date</span>
                  <span>Time</span>
                  <span className="text-right">Status</span>
                </div>
                {attendance.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-3 py-3 text-sm border-b border-border/20 last:border-0"
                  >
                    <span className="text-foreground">{entry.date}</span>
                    <span className="text-muted-foreground">{entry.time}</span>
                    <span className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                        Present
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground italic">
                Calendar view coming soon. Please use table view for now.
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </>
  );
}
