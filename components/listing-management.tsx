"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Check, X, Eye, Clock, Building, MapPin, DollarSign } from "lucide-react"
import { RejectionReasonModal } from "./rejection-reason-modal"
import { ListingDetailView } from "./listing-detail-view"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  status: "pending" | "approved" | "rejected" | "active" | "inactive"
  createdAt: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  images: string[]
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  area: number
  rejectionReason?: string
}

const mockListings: Listing[] = [
  {
    id: "listing-001",
    title: "Modern Downtown Apartment",
    description: "Beautiful 2-bedroom apartment in the heart of downtown with city views.",
    price: 2500,
    location: "Downtown, New York",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    ownerId: "user-001",
    ownerName: "John Smith",
    ownerEmail: "john.smith@example.com",
    images: ["/modern-apartment-living.png"],
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
  },
  {
    id: "listing-002",
    title: "Cozy Suburban House",
    description: "Family-friendly 3-bedroom house with a large backyard and garage.",
    price: 3200,
    location: "Suburbs, California",
    status: "active",
    createdAt: "2024-01-14T14:20:00Z",
    ownerId: "user-002",
    ownerName: "Sarah Johnson",
    ownerEmail: "sarah.j@example.com",
    images: ["/suburban-house.png"],
    propertyType: "House",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
  },
  {
    id: "listing-003",
    title: "Luxury Penthouse Suite",
    description: "Exclusive penthouse with panoramic city views and premium amenities.",
    price: 8500,
    location: "Upper East Side, New York",
    status: "approved",
    createdAt: "2024-01-13T09:15:00Z",
    ownerId: "user-003",
    ownerName: "Mike Davis",
    ownerEmail: "mike.davis@example.com",
    images: ["/luxury-penthouse.png"],
    propertyType: "Penthouse",
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
  },
  {
    id: "listing-004",
    title: "Studio Loft",
    description: "Compact studio loft perfect for young professionals.",
    price: 1800,
    location: "Brooklyn, New York",
    status: "rejected",
    createdAt: "2024-01-12T16:45:00Z",
    ownerId: "user-004",
    ownerName: "Lisa Wilson",
    ownerEmail: "lisa.w@example.com",
    images: ["/studio-loft.png"],
    propertyType: "Studio",
    bedrooms: 0,
    bathrooms: 1,
    area: 600,
  },
]

export function ListingManagement() {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "active" | "inactive">(
    "all",
  )
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; listingId: string | null }>({
    isOpen: false,
    listingId: null,
  })
  const [viewingListing, setViewingListing] = useState<string | null>(null)

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = (listingId: string) => {
    setListings((prev) =>
      prev.map((listing) => (listing.id === listingId ? { ...listing, status: "approved" as const } : listing)),
    )
  }

  const handleReject = (listingId: string) => {
    setRejectionModal({ isOpen: true, listingId })
  }

  const handleRejectWithReason = (listingId: string, reason: string) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId ? { ...listing, status: "rejected" as const, rejectionReason: reason } : listing,
      ),
    )
    setRejectionModal({ isOpen: false, listingId: null })
  }

  const handleToggleActive = (listingId: string) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: listing.status === "active" ? ("inactive" as const) : ("active" as const),
            }
          : listing,
      ),
    )
  }

  const handleViewListing = (listingId: string) => {
    setViewingListing(listingId)
  }

  const getStatusBadge = (status: Listing["status"]) => {
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
          <Badge variant="outline" className="text-blue-600 border-blue-600">
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
      case "active":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Building className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            Inactive
          </Badge>
        )
    }
  }

  const pendingCount = listings.filter((listing) => listing.status === "pending").length
  const activeCount = listings.filter((listing) => listing.status === "active").length

  if (viewingListing) {
    const listing = listings.find((l) => l.id === viewingListing)
    if (listing) {
      return (
        <ListingDetailView
          listing={listing}
          onBack={() => setViewingListing(null)}
          onApprove={() => {
            handleApprove(viewingListing)
            setViewingListing(null)
          }}
          onReject={() => handleReject(viewingListing)}
        />
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listing Management</h1>
          <p className="text-muted-foreground">Review and manage property listings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">{pendingCount} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">{activeCount} active</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "active", "inactive", "rejected"] as const).map((status) => (
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
        {filteredListings.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={listing.images[0] || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{listing.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />${listing.price}/month
                        </div>
                        <span>{listing.propertyType}</span>
                        {listing.bedrooms !== undefined && (
                          <span>
                            {listing.bedrooms} bed, {listing.bathrooms} bath
                          </span>
                        )}
                        <span>{listing.area} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {listing.ownerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{listing.ownerName}</span>
                        <span>•</span>
                        <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                      {listing.status === "rejected" && listing.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {listing.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(listing.status)}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewListing(listing.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {listing.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                              onClick={() => handleApprove(listing.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleReject(listing.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {(listing.status === "active" || listing.status === "inactive") && (
                          <Button variant="outline" size="sm" onClick={() => handleToggleActive(listing.id)}>
                            {listing.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">No listings match your current filters.</p>
          </CardContent>
        </Card>
      )}

      <RejectionReasonModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, listingId: null })}
        onSubmit={(reason) => rejectionModal.listingId && handleRejectWithReason(rejectionModal.listingId, reason)}
        title="Reject Listing"
        description="Please provide a reason for rejecting this listing. This will help the property owner understand what needs to be corrected."
      />
    </div>
  )
}
