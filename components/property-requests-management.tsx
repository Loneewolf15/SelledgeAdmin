"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, DollarSign, User, Phone, Mail, Calendar, Search, Filter, TrendingUp 
} from "lucide-react"
import { toast } from "sonner"

interface PropertyRequest {
  request_id: string
  user_id: string
  category: string
  property_type: string
  state: string
  locality?: string
  specific_area?: string
  bedrooms?: number
  bathrooms?: number
  budget_min: number
  budget_max: number
  seeker_name: string
  seeker_phone: string
  seeker_email: string
  description?: string
  status: string
  created_at: string
}

export function PropertyRequestsManagement() {
  const [requests, setRequests] = useState<PropertyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    fulfilled: 0,
    closed: 0,
  })

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (activeTab !== "all") {
        filters.status = activeTab
      }
      if (stateFilter) {
        filters.state = stateFilter
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/propertyrequests/browse?${new URLSearchParams(filters).toString()}`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      const data = await response.json()
      
      if (data.status && data.data) {
        const allRequests = data.data.requests || []
        setRequests(allRequests)
        
        // Calculate stats
        setStats({
          total: allRequests.length,
          active: allRequests.filter((r: any) => r.status === 'active').length,
          fulfilled: allRequests.filter((r: any) => r.status === 'fulfilled').length,
          closed: allRequests.filter((r: any) => r.status === 'closed').length,
        })
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load property requests")
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    }
    return `₦${amount}`
  }

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.property_type.toLowerCase().includes(query) ||
      request.state.toLowerCase().includes(query) ||
      request.seeker_name.toLowerCase().includes(query) ||
      request.seeker_email.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Property Requests Management</h2>
        <p className="text-muted-foreground">Monitor and manage all property seeker requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fulfilled</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.fulfilled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by property type, state, seeker name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                <SelectItem value="Lagos">Lagos</SelectItem>
                <SelectItem value="Abuja">Abuja</SelectItem>
                <SelectItem value="Ogun">Ogun</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
            <Button onClick={fetchRequests}>
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled ({stats.fulfilled})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({stats.closed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No property requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.request_id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={request.status === "active" ? "default" : "secondary"}>
                              {request.category}
                            </Badge>
                            <Badge variant="outline">{request.status}</Badge>
                          </div>
                          <h3 className="text-xl font-semibold">{request.property_type}</h3>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p className="flex items-center gap-1 justify-end">
                            <Calendar className="h-4 w-4" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Property Details */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase">Property Details</h4>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-primary" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">
                                {request.state}
                                {request.locality && `, ${request.locality}`}
                                {request.specific_area && `, ${request.specific_area}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 mt-1 text-primary" />
                            <div>
                              <p className="font-medium">Budget Range</p>
                              <p className="text-sm font-semibold text-primary">
                                {formatBudget(request.budget_min)} - {formatBudget(request.budget_max)}
                              </p>
                            </div>
                          </div>

                          {(request.bedrooms || request.bathrooms) && (
                            <div className="flex items-center gap-4 text-sm">
                              {request.bedrooms && <span>{request.bedrooms} Bedrooms</span>}
                              {request.bathrooms && <span>{request.bathrooms} Bathrooms</span>}
                            </div>
                          )}

                          {request.description && (
                            <div>
                              <p className="font-medium text-sm">Description</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {request.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Seeker Contact */}
                        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase">Seeker Contact</h4>
                          
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-1 text-primary" />
                            <div>
                              <p className="font-medium">Name</p>
                              <p className="text-sm">{request.seeker_name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 mt-1 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">Phone</p>
                              <p className="text-sm">{request.seeker_phone}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:${request.seeker_phone}`)}
                            >
                              Call
                            </Button>
                          </div>

                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-1 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">Email</p>
                              <p className="text-sm break-all">{request.seeker_email}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`mailto:${request.seeker_email}`)}
                            >
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
