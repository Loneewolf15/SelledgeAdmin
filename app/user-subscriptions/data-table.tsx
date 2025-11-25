"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Subscription } from "./types"
import { Copy, Trash2, Mail } from "lucide-react"
import { format } from "date-fns"

interface DataTableProps {
    data: Subscription[]
    onSendReminder: (id: string) => void
    onDelete: (id: string) => void // Placeholder for now
}

export function DataTable({ data, onSendReminder, onDelete }: DataTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "pending":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
            case "expired":
                return <Badge variant="destructive">Expired</Badge>
            case "cancelled":
                return <Badge variant="secondary">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatCurrency = (amount: string, currency: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
        }).format(parseFloat(amount))
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), "MMM d, yyyy")
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Plan</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Cycle</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Start Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">End Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                    No subscriptions found.
                                </td>
                            </tr>
                        ) : (
                            data.map((sub) => (
                                <tr key={sub.subscription_id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sub.user_name}</span>
                                            <span className="text-xs text-muted-foreground">{sub.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{sub.plan_name}</td>
                                    <td className="p-4 align-middle">{getStatusBadge(sub.status)}</td>
                                    <td className="p-4 align-middle">{formatCurrency(sub.amount, sub.currency)}</td>
                                    <td className="p-4 align-middle capitalize">{sub.billing_cycle}</td>
                                    <td className="p-4 align-middle">{formatDate(sub.start_date)}</td>
                                    <td className="p-4 align-middle">{formatDate(sub.end_date)}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigator.clipboard.writeText(sub.subscription_id)}
                                                title="Copy ID"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSendReminder(sub.subscription_id)}
                                            >
                                                <Mail className="h-4 w-4 mr-1" />
                                                Reminder
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent dark:hover:bg-red-900/20"
                                                onClick={() => onDelete(sub.subscription_id)}
                                                title="Delete Subscription"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
