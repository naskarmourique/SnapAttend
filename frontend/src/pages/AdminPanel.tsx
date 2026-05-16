import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import AppLayout from "@/components/AppLayout";
import { UserPlus, UserMinus, Upload, Download, Search, ScanFace, Filter, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { studentApi, attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "logs">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async (retryCount = 0) => {
    setLoading(true);
    try {
      console.log(`Fetching data (Attempt ${retryCount + 1})...`);
      const [studentsRes, logsRes] = await Promise.all([
        studentApi.getAll(),
        attendanceApi.getAll()
      ]);
      setStudents(studentsRes.data);
      setLogs(logsRes.data);
      console.log("Data loaded successfully.");
    } catch (error) {
      console.error("Fetch error:", error);
      if (retryCount < 2) {
        console.log("Retrying in 2 seconds...");
        setTimeout(() => fetchDetails(retryCount + 1), 2000);
      } else {
        toast.error("Failed to connect to server. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this student? This will delete all their images and attendance logs.")) return;
    try {
      await studentApi.delete(id);
      toast.success("Student and all related data removed");
      fetchDetails();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleManualMark = async (studentId: number) => {
    try {
      await attendanceApi.manualMark(studentId);
      toast.success("Marked present for today");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to mark attendance");
    }
  };

  const handleManualRemove = async (studentId: number, dateStr: string) => {
    if (!window.confirm(`Remove attendance for ${dateStr}?`)) return;
    try {
      await attendanceApi.manualRemove(studentId, dateStr);
      toast.success("Attendance record removed");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to remove record");
    }
  };

  const handleExport = () => {
    const data = activeTab === "students" ? students : logs;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapattend_${activeTab}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const filteredStudents = (students || []).filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage database, biometric records and manual overrides</p>
        </div>
        <GlassButton variant="ghost" size="sm" onClick={fetchDetails} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </GlassButton>
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-6">
        <GlassButton onClick={() => navigate("/registration")}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Student
        </GlassButton>
        <GlassButton variant="ghost" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export JSON
        </GlassButton>
      </div>

      <div className="flex gap-1 glass-card p-1 w-fit mb-6">
        {(["students", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab ? "gradient-accent text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "students" ? (
        <GlassCard glow>
          <div className="mb-6 glass-card flex items-center gap-2 px-4 py-1 border-white/10">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or roll number..."
              className="bg-transparent outline-none text-sm w-full py-2.5"
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-5 text-[10px] font-black text-muted-foreground pb-4 uppercase tracking-[0.2em] px-4">
              <span>Student Details</span>
              <span>Roll Number</span>
              <span>Department</span>
              <span className="text-center">Manual Mark</span>
              <span className="text-right">Manage</span>
            </div>
            {filteredStudents.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic">No student profiles found</p>
            ) : filteredStudents.map((s) => (
              <div key={s.id} className="grid grid-cols-5 items-center py-4 text-sm border-b border-white/5 last:border-0 hover:bg-white/5 rounded-2xl px-4 transition-all group">
                <span className="font-bold group-hover:text-primary transition-colors">{s.name}</span>
                <span className="text-muted-foreground font-mono">{s.roll_number}</span>
                <span className="text-muted-foreground">{s.department}</span>
                <div className="flex justify-center">
                  <button 
                    onClick={() => handleManualMark(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all text-[10px] font-black uppercase"
                  >
                    <CheckCircle className="h-3 w-3" /> Mark Today
                  </button>
                </div>
                <div className="text-right flex justify-end gap-3">
                  <button onClick={() => handleDeleteStudent(s.id)} className="text-muted-foreground hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard glow>
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-[10px] font-black text-muted-foreground pb-4 uppercase tracking-[0.2em] px-4">
              <span>Full Name</span>
              <span>Date</span>
              <span>Time</span>
              <span className="text-right">Actions</span>
            </div>
            {logs.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic">No verification logs available</p>
            ) : logs.map((l, i) => (
              <div key={i} className="grid grid-cols-4 items-center py-4 text-sm border-b border-white/5 last:border-0 px-4 group hover:bg-white/5 rounded-2xl transition-all">
                <span className="font-bold">{l.student_name}</span>
                <span className="text-muted-foreground font-mono">{l.date}</span>
                <span className="text-muted-foreground font-mono">{l.time}</span>
                <div className="text-right flex justify-end">
                   <button 
                    onClick={() => handleManualRemove(l.student_id, l.date)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase"
                  >
                    <XCircle className="h-3 w-3" /> Void Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </>
  );
}
