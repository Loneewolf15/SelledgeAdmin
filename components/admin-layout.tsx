"use client"

import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import type { AdminView } from "@/components/admin-dashboard"

interface AdminLayoutProps {
  children: ReactNode
  currentView: AdminView
  onViewChange: (view: AdminView) => void
  onLogout: () => void
}

export function AdminLayout({
  children,
  currentView,
  onViewChange,
  onLogout,
}: AdminLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}