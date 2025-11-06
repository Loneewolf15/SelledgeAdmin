"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Settings, Home, Shield, Building, MapPin } from "lucide-react"
import type { AdminView } from "@/components/admin-dashboard"

interface AdminSidebarProps {
  currentView: AdminView
  onViewChange: (view: AdminView) => void
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { id: "overview" as AdminView, name: "Overview", icon: Home },
  { id: "users" as AdminView, name: "Users", icon: Users },
  { id: "kyc" as AdminView, name: "KYC Requests", icon: Shield },
  { id: "listings" as AdminView, name: "Listings", icon: Building },
  { id: "properties" as AdminView, name: "Properties", icon: MapPin },
  { id: "settings" as AdminView, name: "Settings", icon: Settings },
]

export function AdminSidebar({ currentView, onViewChange, isOpen, onToggle }: AdminSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-30 md:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onToggle}
      />
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", currentView === item.id && "bg-secondary")}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
    </>
  )
}
