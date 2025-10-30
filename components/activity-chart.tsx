"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ActivityChartProps {
  monthlyGrowth?: Array<{ name: string; users: number; listings: number }>
}

export function ActivityChart({ monthlyGrowth = [] }: ActivityChartProps) {
  const data = monthlyGrowth.length > 0 ? monthlyGrowth : [
    { name: "Jan", users: 0, listings: 0 },
    { name: "Feb", users: 0, listings: 0 },
    { name: "Mar", users: 0, listings: 0 },
    { name: "Apr", users: 0, listings: 0 },
    { name: "May", users: 0, listings: 0 },
    { name: "Jun", users: 0, listings: 0 },
    { name: "Jul", users: 0, listings: 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Growth</CardTitle>
        <CardDescription>User and listing growth over the last 7 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" />
            <Line type="monotone" dataKey="listings" stroke="#82ca9d" name="New Listings" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
