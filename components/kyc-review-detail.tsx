"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Check, X, User, FileText, MapPin, Phone, Calendar, Globe } from "lucide-react"
import { getImageUrl } from "@/lib/image-utils"

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

interface KycReviewDetailProps {
  request: KycRequest
  onBack: () => void
  onApprove: () => void
  onReject: () => void
}

export function KycReviewDetail({ request, onBack, onApprove, onReject }: KycReviewDetailProps) {


  const getStatusBadge = (status: KycRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending Review
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">KYC Review - {request.userName}</h1>
          <p className="text-muted-foreground">Detailed verification information</p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={getImageUrl(request.documents.selfieImage) || request.avatar || "/placeholder.svg"}
                    alt={request.userName}
                    onError={(e) => {
                      console.log('[KYC Avatar] Failed to load:', e.currentTarget.src);
                    }}
                  />
                  <AvatarFallback className="text-lg">
                    {request.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {request.personalInfo.firstName} {request.personalInfo.lastName}
                  </h3>
                  <p className="text-muted-foreground">{request.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {request.personalInfo.dateOfBirth && !isNaN(new Date(request.personalInfo.dateOfBirth).getTime())
                        ? new Date(request.personalInfo.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{request.personalInfo.nationality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{request.personalInfo.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Document Type</p>
                    <p className="font-medium">{request.documentType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{request.personalInfo.address.street}</p>
                <p className="text-muted-foreground">
                  {request.personalInfo.address.city}, {request.personalInfo.address.state}{" "}
                  {request.personalInfo.address.zipCode}
                </p>
                <p className="text-muted-foreground">{request.personalInfo.address.country}</p>
              </div>
            </CardContent>
          </Card>

          {request.status === "rejected" && request.rejectionReason && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">{request.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Document Front</p>
                <img
                  src={getImageUrl(request.documents.frontImage)}
                  alt="Document front"
                  className="w-full rounded-lg border"
                  onError={(e) => {
                    console.error('[KYC Image] Failed to load front image:', e.currentTarget.src);
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>

              {request.documents.backImage && (
                <div>
                  <p className="text-sm font-medium mb-2">Document Back</p>
                  <img
                    src={getImageUrl(request.documents.backImage)}
                    alt="Document back"
                    className="w-full rounded-lg border"
                    onError={(e) => {
                      console.error('[KYC Image] Failed to load back image:', e.currentTarget.src);
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Selfie Verification</p>
                <img
                  src={getImageUrl(request.documents.selfieImage)}
                  alt="Selfie verification"
                  className="w-full rounded-lg border"
                  onError={(e) => {
                    console.error('[KYC Image] Failed to load selfie image:', e.currentTarget.src);
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Document Number</p>
                <p className="font-medium">{request.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{new Date(request.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium font-mono text-xs">{request.userId}</p>
              </div>
            </CardContent>
          </Card>

          {request.status === "pending" && (
            <div className="space-y-3">
              <Button
                className="w-full text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                variant="outline"
                onClick={onApprove}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve KYC Request
              </Button>
              <Button
                className="w-full text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                variant="outline"
                onClick={onReject}
              >
                <X className="w-4 h-4 mr-2" />
                Reject with Reason
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
