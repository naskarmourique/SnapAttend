import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import StatusIndicator from "@/components/StatusIndicator";
import AppLayout from "@/components/AppLayout";
import { Camera, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

type ScanStatus = "idle" | "scanning" | "detected" | "unknown";

export default function CameraCapture() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [statusText, setStatusText] = useState("Press Start to begin scanning");

  // Simulate scanning cycle
  const startScanning = () => {
    setStatus("scanning");
    setStatusText("Scanning...");
    setTimeout(() => {
      const detected = Math.random() > 0.3;
      if (detected) {
        setStatus("detected");
        setStatusText("Recognized — Aarav Patel");
      } else {
        setStatus("unknown");
        setStatusText("Unknown face detected");
      }
    }, 3000);
  };

  const reset = () => {
    setStatus("idle");
    setStatusText("Press Start to begin scanning");
  };

  return (
    <AppLayout>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold tracking-tight mb-8"
      >
        Camera Capture
      </motion.h1>

      <div className="max-w-2xl mx-auto">
        <GlassCard glow>
          {/* Camera viewport */}
          <div
            className={`relative aspect-square bg-background/50 rounded-2xl overflow-hidden flex items-center justify-center ${
              status === "scanning" ? "pulse-glow" : ""
            }`}
          >
            {/* Bracket corners */}
            <div className="bracket-corner bracket-tl top-6 left-6" style={{ animation: status === "scanning" ? "bracketPulse 1.5s infinite" : "none" }} />
            <div className="bracket-corner bracket-tr top-6 right-6" style={{ animation: status === "scanning" ? "bracketPulse 1.5s infinite" : "none" }} />
            <div className="bracket-corner bracket-bl bottom-6 left-6" style={{ animation: status === "scanning" ? "bracketPulse 1.5s infinite" : "none" }} />
            <div className="bracket-corner bracket-br bottom-6 right-6" style={{ animation: status === "scanning" ? "bracketPulse 1.5s infinite" : "none" }} />

            {/* Scan line */}
            {status === "scanning" && (
              <div className="absolute top-6 left-6 right-6 h-0.5 gradient-accent opacity-80 scan-line" />
            )}

            {/* Face bounding box */}
            {(status === "detected" || status === "unknown") && (
              <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`absolute w-32 h-40 rounded-2xl border-2 ${
                  status === "detected" ? "border-green-400" : "border-destructive"
                }`}
                style={{
                  boxShadow:
                    status === "detected"
                      ? "0 0 20px rgba(74,222,128,0.4), inset 0 0 20px rgba(74,222,128,0.1)"
                      : "0 0 20px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.1)",
                }}
              />
            )}

            <div className="text-center z-10">
              <Camera className="h-20 w-20 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Live camera feed</p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 flex items-center justify-between">
            <StatusIndicator status={status} />
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-foreground"
            >
              {statusText}
            </motion.p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {status === "idle" ? (
              <GlassButton size="lg" className="flex-1" onClick={startScanning}>
                <span className="flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" /> Start Scanning
                </span>
              </GlassButton>
            ) : (
              <GlassButton size="lg" variant="ghost" className="flex-1" onClick={reset}>
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw className="h-5 w-5" /> Reset
                </span>
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
