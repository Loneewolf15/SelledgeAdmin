"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Check, X, Eye, Clock, Building, MapPin, RefreshCw, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { RejectionReasonModal } from "./rejection-reason-modal"
import { ListingDetailView } from "./listing-detail-view"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"

interface Listing {
  id: string
  listing_id: string
  seller_id: string
  title: string
  description: string
  listing_type: string
  price: string
  currency: string
  category_id: number
  bedrooms: number | null
  bathrooms: number | null
  size_sqft: number | null
  address: string
  city: string
  state: string
  country: string
  status: "pending" | "approved" | "rejected" | "active" | "inactive"
  featured: number
  rejection_reason?: string
  agency_fee_percentage?: number
  created_at: string
  updated_at: string
  seller_name: string
  seller_email: string
  seller_profile_image?: string
  images: string[]
  amenities?: string[]
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export function ListingManagement() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "active" | "inactive">("all")
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, pages: 1 })
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; listingId: string | null }>({
    isOpen: false,
    listingId: null,
  })
  const [viewingListing, setViewingListing] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchListings = useCallback(async (skipCache = false) => {
    try {
      setLoading(true)
      setError("")

      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      }

      if (statusFilter !== "all") params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      console.log('[Listings] Fetching with params:', params)
      const res = await api.getListings(params, skipCache)
      console.log('[Listings] API Response:', res)

      if (res.status && res.data) {
        const listingsData = res.data.listings
        const paginationData = res.data.pagination

        if (Array.isArray(listingsData)) {
          setListings(listingsData)
        } else {
          console.error('[Listings] Listings is not an array:', listingsData)
          setListings([])
        }

        if (paginationData) {
          setPagination(paginationData)
        }
      } else {
        setError(res.message || "Failed to load listings")
      }
    } catch (err: any) {
      console.error('[Listings] Error:', err)
      setError(err.message || "Failed to load listings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, searchTerm])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchListings(true)
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
  }

  const handleStatusFilterChange = (status: "all" | "pending" | "approved" | "rejected" | "active" | "inactive") => {
    setStatusFilter(status)
    setPagination({ ...pagination, page: 1 })
  }

  const handleApprove = async (listingId: string) => {
    try {
      const res = await api.approveListing(listingId)
      if (res.status) {
        toast({ title: "Success", description: "Listing approved successfully" })
        fetchListings(true)
      } else {
        throw new Error(res.message || "Failed to approve listing")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to approve listing", variant: "destructive" })
    }
  }

  const handleReject = (listingId: string) => {
    setRejectionModal({ isOpen: true, listingId })
  }

  const handleRejectWithReason = async (listingId: string, reason: string) => {
    try {
      const res = await api.rejectListing(listingId, reason)
      if (res.status) {
        toast({ title: "Success", description: "Listing rejected successfully" })
        setRejectionModal({ isOpen: false, listingId: null })
        fetchListings(true)
      } else {
        throw new Error(res.message || "Failed to reject listing")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reject listing", variant: "destructive" })
    }
  }

  const handleToggleActive = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      const res = await api.updateListingStatus(listingId, newStatus)
      if (res.status) {
        toast({ title: "Success", description: `Listing ${newStatus === "active" ? "activated" : "deactivated"} successfully` })
        fetchListings(true)
      } else {
        throw new Error(res.message || "Failed to update listing status")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update listing status", variant: "destructive" })
    }
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }
    try {
      const res = await api.deleteListing(listingId)
      if (res.status) {
        toast({ title: "Success", description: "Listing deleted successfully" })
        fetchListings(true)
      } else {
        throw new Error(res.message || "Failed to delete listing")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete listing", variant: "destructive" })
    }
  }

  const handleViewListing = (listingId: string) => {
    setViewingListing(listingId)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage })
    }
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

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    } else if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase()
    }
    return "UN"
  }

  const pendingCount = listings.filter((listing) => listing.status === "pending").length
  const activeCount = listings.filter((listing) => listing.status === "active").length

  if (viewingListing) {
    const listing = listings.find((l) => l.id === viewingListing)
    if (listing) {
      return (
        <>
          <ListingDetailView
            listing={{
              listing_id: listing.listing_id,
              id: listing.id,
              title: listing.title,
              description: listing.description,
              price: parseFloat(listing.price),
              location: `${listing.city}, ${listing.state}`,
              status: listing.status,
              createdAt: listing.created_at,
              ownerId: listing.seller_id,
              ownerName: listing.seller_name,
              ownerEmail: listing.seller_email,
              ownerProfileImage: listing.seller_profile_image,
              images: listing.images,
              propertyType: listing.listing_type,
              bedrooms: listing.bedrooms || 0,
              bathrooms: listing.bathrooms || 0,
              area: listing.size_sqft || 0,
              rejectionReason: listing.rejection_reason,
              amenities: listing.amenities || [],
              agency_fee_percentage: listing.agency_fee_percentage
            }}
            onBack={() => setViewingListing(null)}
            onApprove={() => {
              handleApprove(viewingListing)
              setViewingListing(null)
            }}
            onReject={() => handleReject(viewingListing)}
          />
          <RejectionReasonModal
            isOpen={rejectionModal.isOpen}
            onClose={() => setRejectionModal({ isOpen: false, listingId: null })}
            onSubmit={(reason) => rejectionModal.listingId && handleRejectWithReason(rejectionModal.listingId, reason)}
            title="Reject Listing"
            description="Please provide a reason for rejecting this listing. This will help the property owner understand what needs to be corrected."
          />
        </>
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
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "active", "inactive", "rejected"] as const).map((status) => (
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
          <p className="text-muted-foreground ml-2">Loading listings...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => fetchListings(true)}>Retry</Button>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">No listings match your current filters.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={getImageUrl(listing.images[0])}
                    alt={listing.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground mb-1">ID: {listing.listing_id}</p>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{listing.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {listing.city}, {listing.state}
                          </div>
                          <div className="flex items-center gap-1">
                            ₦{parseFloat(listing.price).toLocaleString()}/{listing.listing_type === 'rent' ? 'year' : 'sale'}
                          </div>
                          {listing.bedrooms !== null && (
                            <span>
                              {listing.bedrooms} bed, {listing.bathrooms} bath
                            </span>
                          )}
                          {listing.size_sqft && <span>{listing.size_sqft} sq ft</span>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{getInitials(listing.seller_name)}</AvatarFallback>
                          </Avatar>
                          <span>{listing.seller_name}</span>
                          <span>•</span>
                          <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                        {listing.status === "rejected" && listing.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                            <strong>Rejection Reason:</strong> {listing.rejection_reason}
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
                                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent dark:hover:bg-green-900/20"
                                onClick={() => handleApprove(listing.listing_id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent dark:hover:bg-red-900/20"
                                onClick={() => handleReject(listing.listing_id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {(listing.status === "active" || listing.status === "inactive") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(listing.listing_id, listing.status)}
                            >
                              {listing.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(listing.id)}
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && listings.length > 0 && (
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
              disabled={pagination.page >= pagination.pages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
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
