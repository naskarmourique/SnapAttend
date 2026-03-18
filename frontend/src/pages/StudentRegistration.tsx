import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import AppLayout from "@/components/AppLayout";
import { UserPlus, Upload, Camera as CameraIcon, CheckCircle2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { studentApi, recognitionApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    department: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("");
  const [regMode, setRegMode] = useState<"upload" | "live">("upload");
  const [cameraOn, setCameraOn] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    return () => {
      if (cameraOn) recognitionApi.stopCamera();
    };
  }, [cameraOn]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
    }
  };

  const startCamera = async () => {
    try {
      await recognitionApi.startCamera();
      setCameraOn(true);
      toast.success("Camera started");
    } catch (err) {
      toast.error("Failed to start camera");
    }
  };

  const capturePhoto = async () => {
    setCapturing(true);
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    try {
      toast.info("Capturing 3 samples for high accuracy. Keep looking at the camera...");
      
      for (let i = 1; i <= 3; i++) {
        const snapshotUrl = `${recognitionApi.getSnapshot()}?t=${Date.now()}`;
        const response = await fetch(snapshotUrl);
        const blob = await response.blob();
        const capturedFile = new File([blob], `capture_${i}.jpg`, { type: "image/jpeg" });
        newFiles.push(capturedFile);
        newPreviews.push(URL.createObjectURL(blob));
        
        // Visual feedback for each capture
        toast.info(`Captured sample ${i}/3`);
        setPreviews([...newPreviews]); // Update UI progressively
        
        if (i < 3) await new Promise(resolve => setTimeout(resolve, 800));
      }

      setFiles(newFiles);
      setPreviews(newPreviews);
      toast.success("All 3 samples captured!");
      await recognitionApi.stopCamera();
      setCameraOn(false);
    } catch (err) {
      toast.error("Capture failed");
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please provide at least one face photo");
      return;
    }

    setLoading(true);
    setProcessingMsg("Extracting biometric features...");
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("roll_number", formData.roll_number);
    data.append("department", formData.department);
    files.forEach(f => data.append("files", f));

    try {
      await studentApi.register(data);
      setProcessingMsg("Updating secure database...");
      toast.success(`Registration Complete! Added ${files.length} biometric samples.`);
      
      // Clear fields
      setFormData({ name: "", roll_number: "", department: "" });
      setFiles([]);
      setPreviews([]);
      
      // Brief pause to show success before redirect
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
      setProcessingMsg("");
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold neon-text animate-pulse">{processingMsg}</h2>
          <p className="text-muted-foreground mt-2">This may take a few seconds for high-precision models</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Registration</h1>
        <p className="text-muted-foreground mt-1">Register new students with high-accuracy biometric data</p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard glow>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Personal Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
              <input
                required
                className="w-full glass-card bg-background/50 px-4 py-2.5 outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Roll Number / ID</label>
              <input
                required
                className="w-full glass-card bg-background/50 px-4 py-2.5 outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. CS202401"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Department</label>
              <input
                required
                className="w-full glass-card bg-background/50 px-4 py-2.5 outline-none focus:ring-2 ring-primary/50 transition-all"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            
            <div className="pt-4">
              <GlassButton type="submit" size="lg" className="w-full" disabled={loading || capturing}>
                {loading ? "Registering..." : "Complete Registration"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>

        <GlassCard glow>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CameraIcon className="h-5 w-5 text-primary" /> Face Biometric
            </h2>
            <div className="flex gap-1 glass-card p-1">
              <button
                type="button"
                onClick={() => { setRegMode("upload"); if(cameraOn) recognitionApi.stopCamera(); setCameraOn(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${regMode === "upload" ? "gradient-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setRegMode("live")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${regMode === "live" ? "gradient-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Live Capture
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[320px] rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center overflow-hidden bg-muted/20">
              {regMode === "live" ? (
                cameraOn ? (
                  <img src="http://localhost:8000/recognition/video_feed" className="w-full h-full object-cover" alt="Live Preview" />
                ) : previews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-full h-full">
                    {previews.map((p, i) => (
                      <img key={i} src={p} className={`w-full h-full object-cover ${previews.length === 1 ? 'col-span-2 row-span-2' : ''}`} alt={`Sample ${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CameraIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Camera is off</p>
                  </div>
                )
              ) : previews.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  {previews.map((p, i) => (
                    <img key={i} src={p} className={`w-full h-full object-cover ${previews.length === 1 ? 'col-span-2 row-span-2' : ''}`} alt={`Uploaded ${i}`} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Upload 1-3 photos of the student's face</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {regMode === "upload" ? (
                <>
                  <input type="file" id="face-upload" hidden accept="image/*" multiple onChange={handleFileChange} />
                  <label htmlFor="face-upload" className="cursor-pointer glass-card px-8 py-3 text-sm font-semibold hover:bg-muted/50 transition-all flex items-center gap-2">
                    <Upload className="h-4 w-4" /> {previews.length > 0 ? "Change Photos" : "Select Photos"}
                  </label>
                </>
              ) : (
                <>
                  {!cameraOn ? (
                    <GlassButton type="button" onClick={startCamera}>
                      <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> {previews.length > 0 ? "Restart Camera" : "Start Camera"}</span>
                    </GlassButton>
                  ) : (
                    <GlassButton type="button" onClick={capturePhoto} disabled={capturing}>
                      <span className="flex items-center gap-2">
                        {capturing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CameraIcon className="h-4 w-4" />} 
                        {capturing ? "Capturing..." : "Capture 3 Samples"}
                      </span>
                    </GlassButton>
                  )}
                </>
              )}
            </div>
            
            <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {capturing ? "Biometric Burst Mode Active" : "Verification Engine Ready"}
            </p>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
