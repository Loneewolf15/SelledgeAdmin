"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, ShieldCheck, DollarSign } from "lucide-react"
import { ActivityChart } from "@/components/activity-chart"
import { api } from "@/lib/api"

interface DashboardStats {
  user_name?: string
  total_users: number
  total_listings: number
  pending_kyc: number
  total_revenue: number
  monthly_growth: Array<{ name: string; users: number; listings: number }>
  recent_activity: Array<{ user: string; action: string; time: string }>
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.getDashboardStats()
      if (res.status && res.data) {
        setStats(res.data)
      } else {
        setError(res.message || "Failed to load dashboard stats")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users.toLocaleString(),
      icon: Users,
      description: "registered users",
    },
    {
      title: "Total Listings",
      value: stats.total_listings.toLocaleString(),
      icon: Home,
      description: "active listings",
    },
    {
      title: "Pending KYC",
      value: stats.pending_kyc.toString(),
      icon: ShieldCheck,
      description: "awaiting review",
    },
    {
      title: "Total Revenue",
      value: "$" + stats.total_revenue.toLocaleString(),
      icon: DollarSign,
      description: "this month",
    },
  ]

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {stats.user_name || 'Admin'}! Here's a snapshot of your platform's activity.</p>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart monthlyGrowth={stats.monthly_growth} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of the latest platform activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
