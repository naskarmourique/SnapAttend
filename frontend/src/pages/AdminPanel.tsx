import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import AppLayout from "@/components/AppLayout";
import { UserPlus, UserMinus, Upload, Download, Search, ScanFace, Filter, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { studentApi, attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    if (!window.confirm("Are you sure?")) return;
    try {
      await studentApi.delete(id);
      toast.success("Student removed");
      fetchDetails();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleExport = () => {
    const data = activeTab === "students" ? students : logs;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapattend_${activeTab}.json`;
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
          <p className="text-muted-foreground mt-1">Manage database and records</p>
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
          <Download className="h-4 w-4 mr-2" /> Export
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
          <div className="mb-4 glass-card flex items-center gap-2 px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 text-xs font-bold text-muted-foreground pb-2 border-b border-border/30 px-2">
              <span>Name</span>
              <span>Roll Number</span>
              <span>Department</span>
              <span className="text-right">Actions</span>
            </div>
            {filteredStudents.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No students found in database</p>
            ) : filteredStudents.map((s) => (
              <div key={s.id} className="grid grid-cols-4 items-center py-3 text-sm border-b border-border/10 last:border-0 hover:bg-white/5 rounded-xl px-2 transition-colors">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">{s.roll_number}</span>
                <span className="text-muted-foreground">{s.department}</span>
                <span className="text-right">
                  <button onClick={() => handleDeleteStudent(s.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard glow>
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-xs font-bold text-muted-foreground pb-2 border-b border-border/30 px-2">
              <span>Name</span>
              <span>Date</span>
              <span>Time</span>
              <span className="text-right">Status</span>
            </div>
            {logs.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No attendance records found</p>
            ) : logs.map((l, i) => (
              <div key={i} className="grid grid-cols-4 items-center py-3 text-sm border-b border-border/10 last:border-0 px-2">
                <span className="font-medium">{l.student_name}</span>
                <span className="text-muted-foreground">{l.date}</span>
                <span className="text-muted-foreground">{l.time}</span>
                <span className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400">PRESENT</span>
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </>
  );
}
