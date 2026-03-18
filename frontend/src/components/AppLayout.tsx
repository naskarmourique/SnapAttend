import { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background liquid-bg relative overflow-hidden">
      {/* Floating liquid blobs */}
      <div className="liquid-blob liquid-blob-1 top-[-10%] left-[-5%]" />
      <div className="liquid-blob liquid-blob-2 top-[40%] right-[-8%]" />
      <div className="liquid-blob liquid-blob-3 bottom-[-5%] left-[30%]" />

      <AppSidebar />
      <main className="lg:pl-64 relative z-10">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
