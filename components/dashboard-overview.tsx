import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, ShieldCheck, DollarSign } from "lucide-react"
import { ActivityChart } from "@/components/activity-chart"
import { api } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface RecentActivityItem {
  user_id: string
  user_name: string
  action: string
  time: string
  created_at: string
}

interface RecentActivityPagination {
  total_items: number
  current_page: number
  page_size: number
  total_pages: number
}

interface DashboardStats {
  user_name?: string
  total_users: number
  total_listings: number
  pending_kyc: number
  total_revenue: number
  monthly_growth: Array<{ name: string; users: number; listings: number }>
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([])
  const [activityPagination, setActivityPagination] = useState<RecentActivityPagination | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [error, setError] = useState("")
  const [activityFilter, setActivityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Fixed items per page for recent activity

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchRecentActivities()
  }, [activityFilter, currentPage])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const res = await api.getDashboardStats()
      if (res.status && res.data) {
        setStats(res.data)
      } else {
        setError(res.message || "Failed to load dashboard stats")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard stats")
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      setLoadingActivities(true)
      const res = await api.getRecentActivities({ filter: activityFilter, page: currentPage, limit: itemsPerPage })
      if (res.status && res.data) {
        setRecentActivities(res.data.activities)
        setActivityPagination(res.data.pagination)
      } else {
        setError(res.message || "Failed to load recent activities")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load recent activities")
    } finally {
      setLoadingActivities(false)
    }
  }

  if (loadingStats || loadingActivities) {
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
      value: "₦" + stats.total_revenue.toLocaleString(),
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Select value={activityFilter} onValueChange={(value) => {
              setActivityFilter(value)
              setCurrentPage(1) // Reset to first page on filter change
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
            {activityPagination && activityPagination.total_pages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {activityPagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(activityPagination.total_pages, prev + 1))}
                  disabled={currentPage === activityPagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
