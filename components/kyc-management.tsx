"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Check, X, Eye, Clock, AlertCircle } from "lucide-react"
import { KycReviewDetail } from "./kyc-review-detail"
import { RejectionReasonModal } from "./rejection-reason-modal"

interface KycRequest {
  id: string
  userId: string
  userName: string
  email: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  documentType: string
  documentNumber: string
  avatar?: string
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    phoneNumber: string
  }
  documents: {
    frontImage: string
    backImage?: string
    selfieImage: string
  }
  rejectionReason?: string
}

const mockKycRequests: KycRequest[] = [
  {
    id: "kyc-001",
    userId: "user-001",
    userName: "John Smith",
    email: "john.smith@example.com",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    documentType: "Driver's License",
    documentNumber: "DL123456789",
    personalInfo: {
      firstName: "John",
      lastName: "Smith",
      dateOfBirth: "1990-05-15",
      nationality: "United States",
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
      },
      phoneNumber: "+1 (555) 123-4567",
    },
    documents: {
      frontImage: "/generic-identification-card-front.png",
      backImage: "/driver-license-back.png",
      selfieImage: "/diverse-group-selfie.png",
    },
  },
  {
    id: "kyc-002",
    userId: "user-002",
    userName: "Sarah Johnson",
    email: "sarah.j@example.com",
    status: "pending",
    submittedAt: "2024-01-14T14:20:00Z",
    documentType: "Passport",
    documentNumber: "P987654321",
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "1985-08-22",
      nationality: "Canada",
      address: {
        street: "456 Oak Avenue",
        city: "Toronto",
        state: "ON",
        zipCode: "M5V 3A8",
        country: "Canada",
      },
      phoneNumber: "+1 (416) 555-0123",
    },
    documents: {
      frontImage: "/passport-photo-page.jpg",
      selfieImage: "/woman-selfie.png",
    },
  },
  {
    id: "kyc-003",
    userId: "user-003",
    userName: "Mike Davis",
    email: "mike.davis@example.com",
    status: "approved",
    submittedAt: "2024-01-13T09:15:00Z",
    documentType: "National ID",
    documentNumber: "ID456789123",
    personalInfo: {
      firstName: "Mike",
      lastName: "Davis",
      dateOfBirth: "1988-12-03",
      nationality: "United Kingdom",
      address: {
        street: "789 Queen Street",
        city: "London",
        state: "England",
        zipCode: "SW1A 1AA",
        country: "United Kingdom",
      },
      phoneNumber: "+44 20 7946 0958",
    },
    documents: {
      frontImage: "/uk-national-id-front.jpg",
      backImage: "/uk-national-id-back.jpg",
      selfieImage: "/man-selfie.jpg",
    },
  },
  {
    id: "kyc-004",
    userId: "user-004",
    userName: "Lisa Wilson",
    email: "lisa.w@example.com",
    status: "rejected",
    submittedAt: "2024-01-12T16:45:00Z",
    documentType: "Driver's License",
    documentNumber: "DL987654321",
    rejectionReason: "Document image quality is too poor to verify. Please resubmit with clearer photos.",
    personalInfo: {
      firstName: "Lisa",
      lastName: "Wilson",
      dateOfBirth: "1992-03-18",
      nationality: "Australia",
      address: {
        street: "321 Collins Street",
        city: "Melbourne",
        state: "VIC",
        zipCode: "3000",
        country: "Australia",
      },
      phoneNumber: "+61 3 9123 4567",
    },
    documents: {
      frontImage: "/blurry-driver-license.jpg",
      backImage: "/blurry-license-back.jpg",
      selfieImage: "/woman-selfie-blurry.jpg",
    },
  },
]

export function KycManagement() {
  const [requests, setRequests] = useState<KycRequest[]>(mockKycRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null)
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; requestId: string | null }>({
    isOpen: false,
    requestId: null,
  })

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = (requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)))
  }

  const handleReject = (requestId: string) => {
    setRejectionModal({ isOpen: true, requestId })
  }

  const handleRejectWithReason = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" as const, rejectionReason: reason } : req,
      ),
    )
    setRejectionModal({ isOpen: false, requestId: null })
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

  const pendingCount = requests.filter((req) => req.status === "pending").length

  if (selectedRequest) {
    return (
      <KycReviewDetail
        request={selectedRequest}
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
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium">{pendingCount} pending requests</span>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={request.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {request.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{request.userName}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{request.documentType}</span>
                      <span>•</span>
                      <span>{request.documentNumber}</span>
                      <span>•</span>
                      <span>Submitted {new Date(request.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {request.status === "rejected" && request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
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
                          className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KYC requests found</h3>
            <p className="text-muted-foreground">No requests match your current filters.</p>
          </CardContent>
        </Card>
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
