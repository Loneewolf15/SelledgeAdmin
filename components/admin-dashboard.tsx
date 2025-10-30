"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { DashboardOverview } from "@/components/dashboard-overview"
import { UserManagement } from "@/components/user-management"
import { AdminSettings } from "@/components/admin-settings"
import { KycManagement } from "@/components/kyc-management"
import { ListingManagement } from "@/components/listing-management"
import { PropertyReviews } from "@/components/property-reviews"

import { SubscriptionManagement } from "@/components/subscription-management"

interface AdminDashboardProps {
  onLogout: () => void
}

export type AdminView = "overview" | "users" | "kyc" | "listings" | "properties" | "subscriptions" | "settings"

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("overview")

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UserManagement />
      case "kyc":
        return <KycManagement />
      case "listings":
        return <ListingManagement />
      case "properties":
        return <PropertyReviews />
      case "subscriptions":
        return <SubscriptionManagement />
      case "settings":
        return <AdminSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 flex flex-col">
          <AdminHeader onLogout={onLogout} />
          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  )
}
