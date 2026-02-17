import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "./NotificationBell";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background dark">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-2 px-6 py-3 border-b border-border">
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
