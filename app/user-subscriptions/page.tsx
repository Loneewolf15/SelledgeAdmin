"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "./data-table"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Subscription, PaginationData } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function UserSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")
    const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, total_pages: 1 })

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [timeFilter, setTimeFilter] = useState<string>("all") // all, expiring_soon, expired

    const { toast } = useToast()

    const fetchSubscriptions = useCallback(async (skipCache = false) => {
        try {
            setLoading(true)
            setError("")

            const params: any = {
                page: pagination.page,
                limit: pagination.limit
            }

            if (statusFilter !== "all") params.status = statusFilter
            if (searchTerm) params.search = searchTerm

            if (timeFilter === "expiring_soon") {
                params.expiring_within_days = 7 // Default to 7 days
            } else if (timeFilter === "expired") {
                params.status = "expired" // Override status if checking expired
            }

            const res = await api.getUserSubscriptions(params, skipCache)

            if (res.status && res.data) {
                setSubscriptions(res.data.subscriptions || [])
                if (res.data.pagination) {
                    setPagination(prev => ({ ...prev, ...res.data.pagination }))
                }
            } else {
                setError(res.message || "Failed to load subscriptions")
            }
        } catch (err: any) {
            console.error('Error fetching subscriptions:', err)
            setError(err.message || "Failed to load subscriptions")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [pagination.page, pagination.limit, statusFilter, searchTerm, timeFilter])

    useEffect(() => {
        fetchSubscriptions()
    }, [fetchSubscriptions])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchSubscriptions(true)
    }

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleSendReminder = async (id: string) => {
        try {
            const res = await api.sendSubscriptionReminder(id)
            if (res.status) {
                toast({ title: "Success", description: "Reminder sent successfully" })
            } else {
                throw new Error(res.message || "Failed to send reminder")
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to send reminder", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription? This action cannot be undone.")) return

        try {
            const res = await api.deleteUserSubscription(id)
            if (res.status) {
                toast({ title: "Success", description: "Subscription deleted successfully" })
                fetchSubscriptions(true)
            } else {
                throw new Error(res.message || "Failed to delete subscription")
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to delete subscription", variant: "destructive" })
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, page: newPage }))
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Subscriptions</h1>
                    <p className="text-muted-foreground">Manage user subscriptions and renewals</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
                    {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center flex-1 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search user, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSearch()
                            }}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={timeFilter}
                            onChange={(e) => {
                                setTimeFilter(e.target.value)
                                setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="expiring_soon">Expiring Soon (7 days)</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && !refreshing ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground ml-2">Loading subscriptions...</p>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64 flex-col gap-4">
                    <p className="text-red-600">{error}</p>
                    <Button onClick={() => fetchSubscriptions(true)}>Retry</Button>
                </div>
            ) : (
                <>
                    <DataTable
                        data={subscriptions}
                        onSendReminder={handleSendReminder}
                        onDelete={handleDelete}
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.total_pages}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
