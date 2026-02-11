"use client";
import { useLayoutStore } from "@/src/lib/layoutStore";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const isSidebarOpen = useLayoutStore(state => state.isSidebarOpen);
    const toggleSidebar = useLayoutStore(state => state.toggleSidebar);
    const closeSidebar = useLayoutStore(state => state.closeSidebar);
  
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:fixed md:top-0 md:left-0 md:w-64 lg:w-72 md:h-screen border-r border-border bg-card/20 z-10">
          <div className="h-full overflow-y-auto">
            <Sidebar className="w-full" />
          </div>
        </aside>
  
        {/* Main content */}
        <div className="md:pl-64 lg:pl-72 min-w-0 flex flex-col min-h-screen">
          {/* Global mobile header with hamburger */}
          <header className="md:hidden border-b border-border bg-background sticky top-0 z-10 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                aria-label="Toggle sidebar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                AiRA
              </span>
            </div>
          </header>
  
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </div>
  
        {/* Mobile sidebar drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background shadow-lg transition-transform duration-200 md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar className="h-full" />
        </div>
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>
    );
  }