"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { Wifi, AirVent, Utensils, Tv, Dumbbell, Car, Shield, ArrowLeft, Bed, Bath, Square, Mail, Phone, MapPin, Calendar, User, Check, X } from "lucide-react";

interface Listing {
  listing_id: string
  title: string
  description: string
  price: number
  location: string
  status: "pending" | "approved" | "rejected" | "active" | "inactive"
  createdAt: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  ownerProfileImage?: string
  images: string[]
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  area: number
  rejectionReason?: string
  amenities?: string[]
  agency_fee_percentage?: number
}

interface ListingDetailViewProps {
  listing: Listing
  onBack: () => void
  onApprove: () => void
  onReject: () => void
}

export function ListingDetailView({ listing, onBack, onApprove, onReject }: ListingDetailViewProps) {
  const getStatusBadge = (status: Listing["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejected
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
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

  const getAmenityIcon = (name: string) => {
    const normalized = name.toLowerCase()
    if (normalized.includes("wifi") || normalized.includes("internet")) return Wifi
    if (normalized.includes("air") || normalized.includes("ac")) return AirVent
    if (normalized.includes("kitchen") || normalized.includes("cooking")) return Utensils
    if (normalized.includes("tv") || normalized.includes("cable")) return Tv
    if (normalized.includes("gym") || normalized.includes("fitness")) return Dumbbell
    if (normalized.includes("parking") || normalized.includes("garage")) return Car
    if (normalized.includes("security") || normalized.includes("guard")) return Shield
    return Check // Default icon
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground">Listing ID: {listing.listing_id}</p>
        </div>
        {getStatusBadge(listing.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(listing.images[0])}
                      alt={listing.title}
                      className="w-full h-64 object-cover rounded-lg col-span-2"
                    />
                    {listing.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={getImageUrl(image)}
                        alt={`Property view ${index + 2}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </>
                ) : (
                  <div className="col-span-2 h-64 bg-muted flex items-center justify-center rounded-lg">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{listing.bedrooms || 0}</p>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{listing.bathrooms || 0}</p>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{listing.area}</p>
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type:</span>
                  <span className="font-medium">{listing.propertyType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </CardContent>
          </Card>

          {/* Amenities - Conditionally Rendered */}
          {listing.amenities && listing.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity)
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">₦{listing.price.toLocaleString()}</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₦{listing.price.toLocaleString()}</span>
                </div>
                {listing.agency_fee_percentage && (
                  <div className="flex justify-between">
                    <span>Agency Fee:</span>
                    <span>{listing.agency_fee_percentage}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getImageUrl(listing.ownerProfileImage)} />
                  <AvatarFallback>
                    {listing.ownerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{listing.ownerName}</p>
                  <p className="text-sm text-muted-foreground">Property Owner</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{listing.ownerEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{listing.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Listing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Listed</p>
                  <p className="text-sm text-muted-foreground">{new Date(listing.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Owner ID</p>
                  <p className="text-sm text-muted-foreground">{listing.ownerId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {listing.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={onApprove} className="w-full bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Approve Listing
                </Button>
                <Button
                  onClick={onReject}
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Listing
                </Button>
              </CardContent>
            </Card>
          )}

          {listing.status === "rejected" && listing.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{listing.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
