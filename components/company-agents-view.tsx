"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Building2, FileText, MapPin, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface CompanyAgentRequest {
  id: number
  user_id: string
  user_name: string
  user_email: string
  company_name: string
  cac_number: string
  office_address: string
  description: string
  cac_certificate_url: string | null
  status: "pending" | "approved" | "rejected"
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export function CompanyAgentsView() {
  const [requests, setRequests] = useState<CompanyAgentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<CompanyAgentRequest | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const status = activeTab === "all" ? null : activeTab
      const url = status 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/companyagents/getAllRequests?status=${status}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/companyagents/getAllRequests`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data?.requests) {
        setRequests(data.data.requests)
      }
    } catch (error) {
      console.error("Failed to fetch company agent requests:", error)
      toast.error("Failed to load company agent requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: CompanyAgentRequest) => {
    setProcessing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/companyagents/updateStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          request_id: request.id,
          status: "approved",
        }),
      })

      const data = await response.json()
      if (data.status) {
        toast.success("Company agent approved successfully")
        fetchRequests()
        setSelectedRequest(null)
      } else {
        toast.error(data.message || "Failed to approve request")
      }
    } catch (error) {
      console.error("Failed to approve request:", error)
      toast.error("Failed to approve request")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/companyagents/updateStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          status: "rejected",
          rejection_reason: rejectionReason,
        }),
      })

      const data = await response.json()
      if (data.status) {
        toast.success("Company agent rejected")
        fetchRequests()
        setSelectedRequest(null)
        setShowRejectDialog(false)
        setRejectionReason("")
      } else {
        toast.error(data.message || "Failed to reject request")
      }
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast.error("Failed to reject request")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const filteredRequests = requests

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Agent Verification</h2>
        <p className="text-muted-foreground">Review and verify company agent registration requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({requests.filter(r => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No company agent requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {request.company_name}
                        </CardTitle>
                        <CardDescription>
                          Submitted by {request.user_name} ({request.user_email})
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">CAC Number</p>
                            <p className="text-sm text-muted-foreground">{request.cac_number}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Office Address</p>
                            <p className="text-sm text-muted-foreground">{request.office_address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {request.description && (
                          <div>
                            <p className="text-sm font-medium">Description</p>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          </div>
                        )}
                        {request.cac_certificate_url && (
                          <div>
                            <p className="text-sm font-medium mb-1">CAC Certificate</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}${request.cac_certificate_url}`, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Document
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.rejection_reason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{request.rejection_reason}</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={processing}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowRejectDialog(true)
                          }}
                          disabled={processing}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Submitted: {new Date(request.created_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Company Agent Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this company agent registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
