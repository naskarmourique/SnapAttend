export default function StatusIndicator({ status }: { status: "detected" | "scanning" | "unknown" | "idle" }) {
  const config = {
    detected: { label: "Face Detected", color: "bg-green-500", pulse: true },
    scanning: { label: "Scanning...", color: "bg-primary", pulse: true },
    unknown: { label: "Unknown Face", color: "bg-destructive", pulse: false },
    idle: { label: "Waiting...", color: "bg-muted-foreground", pulse: false },
  };
  const c = config[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-3 w-3`}>
        {c.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${c.color}`} />
      </span>
      <span className="text-sm font-medium text-foreground">{c.label}</span>
    </div>
  );
}
