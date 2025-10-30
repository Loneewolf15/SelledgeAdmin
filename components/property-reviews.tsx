"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, MessageSquare, Flag, Eye, MapPin, Calendar } from "lucide-react"

interface PropertyReview {
  id: string
  propertyId: string
  propertyTitle: string
  propertyLocation: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  status: "pending" | "approved" | "flagged" | "rejected"
  flagReason?: string
  images?: string[]
}

const mockReviews: PropertyReview[] = [
  {
    id: "review-001",
    propertyId: "prop-001",
    propertyTitle: "Modern Downtown Apartment",
    propertyLocation: "Downtown, New York",
    reviewerId: "user-005",
    reviewerName: "Emma Thompson",
    rating: 5,
    title: "Amazing place to live!",
    content:
      "I've been living here for 6 months and absolutely love it. The location is perfect, the apartment is modern and well-maintained. The building management is very responsive to any issues.",
    createdAt: "2024-01-15T10:30:00Z",
    status: "pending",
    images: ["/modern-apartment-interior.png"],
  },
  {
    id: "review-002",
    propertyId: "prop-002",
    propertyTitle: "Cozy Suburban House",
    propertyLocation: "Suburbs, California",
    reviewerId: "user-006",
    reviewerName: "David Chen",
    rating: 4,
    title: "Great for families",
    content:
      "Perfect house for our family. The backyard is spacious and the neighborhood is quiet and safe. Only minor issue is the kitchen could use some updates.",
    createdAt: "2024-01-14T14:20:00Z",
    status: "approved",
  },
  {
    id: "review-003",
    propertyId: "prop-003",
    propertyTitle: "Luxury Penthouse Suite",
    propertyLocation: "Upper East Side, New York",
    reviewerId: "user-007",
    reviewerName: "Michael Rodriguez",
    rating: 2,
    title: "Overpriced and disappointing",
    content:
      "For the price, I expected much better. The views are nice but there are constant noise issues from construction nearby. Management is unresponsive to complaints.",
    createdAt: "2024-01-13T09:15:00Z",
    status: "flagged",
    flagReason: "Potentially fake review - suspicious language patterns",
  },
  {
    id: "review-004",
    propertyId: "prop-001",
    propertyTitle: "Modern Downtown Apartment",
    propertyLocation: "Downtown, New York",
    reviewerId: "user-008",
    reviewerName: "Jennifer Lee",
    rating: 4,
    title: "Good location, minor issues",
    content:
      "The apartment is in a great location with easy access to public transport. The unit itself is nice but there were some maintenance issues when I moved in that took a while to resolve.",
    createdAt: "2024-01-12T16:45:00Z",
    status: "approved",
  },
]

export function PropertyReviews() {
  const [reviews, setReviews] = useState<PropertyReview[]>(mockReviews)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "flagged" | "rejected">("all")
  const [selectedReview, setSelectedReview] = useState<PropertyReview | null>(null)

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, status: "approved" as const } : review)),
    )
  }

  const handleReject = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, status: "rejected" as const } : review)),
    )
  }

  const handleFlag = (reviewId: string, reason: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, status: "flagged" as const, flagReason: reason } : review,
      ),
    )
  }

  const getStatusBadge = (status: PropertyReview["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Approved
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Flag className="w-3 h-3 mr-1" />
            Flagged
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejected
          </Badge>
        )
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const pendingCount = reviews.filter((review) => review.status === "pending").length
  const flaggedCount = reviews.filter((review) => review.status === "flagged").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Reviews</h1>
          <p className="text-muted-foreground">Review and moderate property reviews from tenants</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">{pendingCount} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">{flaggedCount} flagged</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "flagged", "rejected"] as const).map((status) => (
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
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.reviewerAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {review.reviewerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{review.reviewerName}</h3>
                        <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {review.propertyTitle} • {review.propertyLocation}
                        </span>
                        <Calendar className="w-4 h-4 ml-2" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                      {review.flagReason && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                          <strong>Flag Reason:</strong> {review.flagReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(review.status)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {review.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                            onClick={() => handleApprove(review.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleReject(review.id)}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50 bg-transparent"
                            onClick={() => handleFlag(review.id, "Requires manual review")}
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Flag
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground">No reviews match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
