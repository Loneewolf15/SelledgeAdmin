"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { UserManagement } from "@/components/user-management"
import { KycManagement } from "@/components/kyc-management"
import { ListingManagement } from "@/components/listing-management"
import { PropertyReviews } from "@/components/property-reviews"
import { AdminSettings } from "@/components/admin-settings"
import { SubscriptionManagement } from "@/components/subscription-management"
import UserSubscriptionsPage from "@/app/user-subscriptions/page"
import { CompanyAgentsView } from "@/components/company-agents-view"
import { PropertyRequestsManagement } from "@/components/property-requests-management"

interface AdminDashboardProps {
  onLogout: () => void
}

export type AdminView = "overview" | "users" | "kyc" | "listings" | "properties" | "settings" | "subscriptions" | "user-subscriptions" | "company-agents" | "property-requests"

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
      case "settings":
        return <AdminSettings />
      case "subscriptions":
        return <SubscriptionManagement />
      case "user-subscriptions":
        return <UserSubscriptionsPage />
      case "company-agents":
        return <CompanyAgentsView />
      case "property-requests":
        return <PropertyRequestsManagement />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={onLogout}
    >
      {renderContent()}
    </AdminLayout>
  )
}
