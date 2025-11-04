"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, LogOut } from "lucide-react"

interface AdminHeaderProps {
  onLogout: () => void
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  const [userName, setUserName] = useState("Admin User")
  const [userInitials, setUserInitials] = useState("AU")

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user_data")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.name) {
          setUserName(user.name)
          // Generate initials from first and last name
          const nameParts = user.name.trim().split(/\s+/)
          if (nameParts.length >= 2) {
            setUserInitials(
              (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            )
          } else if (nameParts.length === 1) {
            setUserInitials(nameParts[0].substring(0, 2).toUpperCase())
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{userName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
