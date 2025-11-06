"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Check, X, Eye, Clock, AlertCircle, RefreshCw, Loader2, Trash2 } from "lucide-react"
import { KycReviewDetail } from "./kyc-review-detail"
import { RejectionReasonModal } from "./rejection-reason-modal"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface KycRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone?: string
  status: "pending" | "approved" | "rejected"
  id_type: string
  doc_front_url: string
  doc_back_url?: string
  selfie_url?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  date_of_birth?: string
  nationality?: string
  street_address?: string
  rejection_reason?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export function KycManagement() {
  const [requests, setRequests] = useState<KycRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, pages: 1 })
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; requestId: string | null }>({
    isOpen: false,
    requestId: null,
  })
  const { toast } = useToast()

  const fetchRequests = useCallback(async (skipCache = false) => {
    try {
      setLoading(true)
      setError("")

      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      }

      if (statusFilter !== "all") params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      console.log('[KYC] Fetching requests with params:', params)
      const res = await api.getKycRequests(params, skipCache)
      console.log('[KYC] API Response:', res)

      if (res.status && res.data) {
        const requestsData = res.data.requests
        const paginationData = res.data.pagination

        console.log('[KYC] Requests:', requestsData)
        console.log('[KYC] Requests Data:', res.data)
        console.log('[KYC] Pagination:', paginationData)

        if (Array.isArray(requestsData)) {
          setRequests(requestsData)
        } else {
          console.error('[KYC] Requests is not an array:', requestsData)
          setRequests([])
        }

        if (paginationData) {
          setPagination(paginationData)
        }
      } else {
        setError(res.message || "Failed to load KYC requests")
      }
    } catch (err: any) {
      console.error('[KYC] Error:', err)
      setError(err.message || "Failed to load KYC requests")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, searchTerm])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRequests(true)
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchRequests(true)
  }

  const handleStatusFilterChange = (status: "all" | "pending" | "approved" | "rejected") => {
    setStatusFilter(status)
    setPagination({ ...pagination, page: 1 })
  }

  const handleApprove = async (requestId: string) => {
    try {
      const res = await api.approveKyc(requestId)
      if (res.status) {
        toast({ title: "Success", description: "KYC request approved successfully" })
        fetchRequests(true)
      } else {
        throw new Error(res.message || "Failed to approve KYC request")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to approve KYC request", variant: "destructive" })
    }
  }

  const handleReject = (requestId: string) => {
    setRejectionModal({ isOpen: true, requestId })
  }

  const handleRejectWithReason = async (requestId: string, reason: string) => {
    try {
      const res = await api.rejectKyc(requestId, reason)
      if (res.status) {
        toast({ title: "Success", description: "KYC request rejected successfully" })
        setRejectionModal({ isOpen: false, requestId: null })
        fetchRequests(true)
      } else {
        throw new Error(res.message || "Failed to reject KYC request")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reject KYC request", variant: "destructive" })
    }
  }

  const handleDelete = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this KYC request? This action cannot be undone.")) {
      return
    }
    try {
      const res = await api.deleteKyc(requestId)
      if (res.status) {
        toast({ title: "Success", description: "KYC request deleted successfully" })
        fetchRequests(true)
      } else {
        throw new Error(res.message || "Failed to delete KYC request")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete KYC request", variant: "destructive" })
    }
  }

  const handleReview = (request: KycRequest) => {
    setSelectedRequest(request)
  }

  const handleBackToList = () => {
    setSelectedRequest(null)
  }

  const getStatusBadge = (status: KycRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    } else if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase()
    }
    return "UN"
  }

  const pendingCount = requests.filter((req) => req.status === "pending").length

  if (selectedRequest) {
    return (
      <KycReviewDetail
        request={{
          id: selectedRequest.id,
          userId: selectedRequest.user_id,
          userName: selectedRequest.user_name,
          email: selectedRequest.user_email,
          status: selectedRequest.status,
          submittedAt: selectedRequest.created_at,
          documentType: selectedRequest.id_type,
          documentNumber: "",
          personalInfo: {
            firstName: selectedRequest.user_name.split(" ")[0] || "",
            lastName: selectedRequest.user_name.split(" ").slice(1).join(" ") || "",
            dateOfBirth: selectedRequest.date_of_birth || "",
            nationality: selectedRequest.nationality || "",
            address: {
              street: selectedRequest.street_address || "",
              city: selectedRequest.city || "",
              state: selectedRequest.state || "",
              zipCode: selectedRequest.postal_code || "",
              country: selectedRequest.country || ""
            },
            phoneNumber: selectedRequest.user_phone || ""
          },
          documents: {
            frontImage: selectedRequest.doc_front_url,
            backImage: selectedRequest.doc_back_url,
            selfieImage: selectedRequest.selfie_url || ""
          },
          rejectionReason: selectedRequest.rejection_reason
        }}
        onBack={handleBackToList}
        onApprove={() => {
          handleApprove(selectedRequest.id)
          handleBackToList()
        }}
        onReject={() => handleReject(selectedRequest.id)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Review and approve user verification requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">{pendingCount} pending requests</span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilterChange(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground ml-2">Loading KYC requests...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => fetchRequests(true)}>Retry</Button>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KYC requests found</h3>
            <p className="text-muted-foreground">No requests match your current filters.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={request.selfie_url || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(request.user_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{request.user_name}</h3>
                      <p className="text-sm text-muted-foreground">{request.user_email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{request.id_type}</span>
                        <span>•</span>
                        <span>Submitted {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      {request.status === "rejected" && request.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                          <strong>Rejection Reason:</strong> {request.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReview(request)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent dark:hover:bg-green-900/20"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent dark:hover:bg-red-900/20"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                        onClick={() => handleDelete(request.id)}
                        title="Delete KYC Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RejectionReasonModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, requestId: null })}
        onSubmit={(reason) => rejectionModal.requestId && handleRejectWithReason(rejectionModal.requestId, reason)}
        title="Reject KYC Request"
        description="Please provide a reason for rejecting this KYC request. This will help the user understand what needs to be corrected."
      />
    </div>
  )
}
