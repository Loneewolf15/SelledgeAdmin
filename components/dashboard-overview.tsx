"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Database } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    icon: Users,
    description: "from last month",
  },
  {
    title: "Active Sessions",
    value: "1,234",
    change: "+5%",
    icon: Activity,
    description: "currently online",
  },
  {
    title: "Growth Rate",
    value: "23.5%",
    change: "+2.1%",
    icon: TrendingUp,
    description: "this quarter",
  },
  {
    title: "Database Size",
    value: "45.2 GB",
    change: "+8%",
    icon: Database,
    description: "total storage",
  },
]

const recentActivity = [
  { user: "John Doe", action: "Created account", time: "2 minutes ago" },
  { user: "Jane Smith", action: "Updated profile", time: "5 minutes ago" },
  { user: "Mike Johnson", action: "Deleted post", time: "10 minutes ago" },
  { user: "Sarah Wilson", action: "Changed password", time: "15 minutes ago" },
  { user: "Tom Brown", action: "Logged in", time: "20 minutes ago" },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
                  <span className="text-green-600">{stat.change}</span> {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions in your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">API Response Time</span>
                <span className="text-sm font-medium text-green-600">125ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Server Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Memory Usage</span>
                <span className="text-sm font-medium text-yellow-600">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Disk Space</span>
                <span className="text-sm font-medium text-green-600">45%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
