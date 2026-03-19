import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import StatusIndicator from "@/components/StatusIndicator";
import AppLayout from "@/components/AppLayout";
import { Users, UserCheck, UserX, Camera, Play, Square, Download, Plus, HelpCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsApi, attendanceApi, recognitionApi } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [manualRoll, setManualRoll] = useState("");

  const [monthly, setMonthly] = useState({ month: "", attendance_rate: 0 });

  const fetchData = async (retryCount = 0) => {
    try {
      const [dailyRes, logsRes, statusRes, monthlyRes] = await Promise.all([
        analyticsApi.getDaily(),
        attendanceApi.getAll(),
        recognitionApi.getStatus(),
        analyticsApi.getMonthly()
      ]);
      
      setStats({
        present: dailyRes.data.present,
        absent: dailyRes.data.absent,
        total: dailyRes.data.total
      });
      
      setMonthly(monthlyRes.data);
      setRecentLogs(logsRes.data.slice(0, 5));
      setIsRecognizing(statusRes.data.is_running);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error", err);
      if (retryCount < 2) {
        setTimeout(() => fetchData(retryCount + 1), 2000);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleToggleRecognition = async () => {
    try {
      if (isRecognizing) {
        await recognitionApi.stop();
        toast.success("Recognition stopped");
      } else {
        await recognitionApi.start();
        toast.success("Recognition started");
      }
      setIsRecognizing(!isRecognizing);
    } catch (err) {
      toast.error("Failed to control camera");
    }
  };

  const handleExport = () => {
    window.open(attendanceApi.export(), '_blank');
    toast.success("Downloading attendance report...");
  };

  const handleManualMark = async () => {
    if (!manualRoll) return;
    try {
      await attendanceApi.markManual(manualRoll);
      toast.success(`Marked ${manualRoll} as present`);
      setManualRoll("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to mark attendance");
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary neon-text">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's today's attendance overview</p>
        </div>
        <div className="flex gap-3">
          <GlassButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </GlassButton>
          <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Active</span>
          </div>
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
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow delay={0.3}>
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
                <div className="absolute inset-0 pointer-events-none">
                  <div className="bracket-corner bracket-tl top-4 left-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-tr top-4 right-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-bl bottom-4 left-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="bracket-corner bracket-br bottom-4 right-4" style={{ animation: "bracketPulse 2s infinite" }} />
                  <div className="absolute top-4 left-4 right-4 h-0.5 gradient-accent opacity-60 scan-line" />
                </div>
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

          <GlassCard glow delay={0.5}>
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Manual Override
            </h2>
            <div className="flex gap-3">
              <input
                className="flex-1 glass-card bg-background/50 px-4 py-2 outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="Enter Roll Number..."
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
              />
              <GlassButton onClick={handleManualMark}>Mark Present</GlassButton>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
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

          <GlassCard className="bg-primary/5 border-primary/20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4" /> Quick Start
            </h2>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">1</div>
                Register students first in the <span className="text-foreground font-medium">Registration</span> tab.
              </li>
              <li className="flex gap-2">
                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">2</div>
                Click <span className="text-foreground font-medium">Start Recognition</span> to begin live scanning.
              </li>
              <li className="flex gap-2">
                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">3</div>
                Export reports daily to keep track of attendance records.
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-primary/10 flex items-center gap-2">
              <Info className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground italic">Biometric data is encrypted and stored locally.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
