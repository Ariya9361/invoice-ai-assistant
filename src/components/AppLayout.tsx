import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background dark">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
