"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Trash2, Plus, RefreshCw, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type SubscriptionPlan = {
  plan_id: string
  plan_name: string
  target_role: 'seller' | 'vendor' | 'agent' | 'agent-individual' | 'agent-company' | 'all'
  price_monthly: number
  price_yearly: number
  limits: {
    max_listings?: number
    max_photos?: number
    featured_listings?: number
    boosts_per_month?: number
    max_property_requests_per_month?: number
    listing_duration_days?: number
    [key: string]: any
  }
  features: string[]
}

export function SubscriptionManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editedPlan, setEditedPlan] = useState<Partial<SubscriptionPlan>>({})
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async (skipCache = false) => {
    try {
      setLoading(true)
      setError("")

      console.log('[Subscriptions] Fetching plans...')
      const res = await api.getSubscriptionPlans(skipCache)
      console.log('[Subscriptions] API Response:', res)

      if (res.status && res.data && res.data.plans) {
        console.log('[Subscriptions] Plans:', res.data.plans)
        setPlans(res.data.plans)
      } else {
        setError(res.message || "Failed to load plans")
      }
    } catch (err: any) {
      console.error('[Subscriptions] Error:', err)
      setError(err.message || "Failed to load plans")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPlans(true)
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setIsEditing(plan.plan_id)
    setEditedPlan({ ...plan })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setIsEditing("new")
    setEditedPlan({
      plan_name: "",
      target_role: "all",
      price_monthly: 0,
      price_yearly: 0,
      limits: {
        max_listings: 10,
        max_photos: 5,
        featured_listings: 0,
        boosts_per_month: 0,
        property_requests_per_month: 0,
        listing_duration_days: 30
      },
      features: []
    })
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsCreating(false)
    setEditedPlan({})
  }

  const handleSave = async () => {
    try {
      if (!editedPlan.plan_name || editedPlan.price_monthly === undefined) {
        toast({
          title: "Error",
          description: "Plan name and monthly price are required",
          variant: "destructive"
        })
        return
      }

      let res
      if (isCreating) {
        res = await api.createSubscriptionPlan(editedPlan)
      } else {
        res = await api.updateSubscriptionPlan(editedPlan)
      }

      if (res.status) {
        toast({
          title: "Success",
          description: `Plan ${isCreating ? 'created' : 'updated'} successfully`
        })
        setIsEditing(null)
        setIsCreating(false)
        setEditedPlan({})
        fetchPlans(true)
      } else {
        throw new Error(res.message)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save plan",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await api.deleteSubscriptionPlan(planId)
      if (res.status) {
        toast({
          title: "Success",
          description: "Plan deleted successfully"
        })
        fetchPlans(true)
      } else {
        throw new Error(res.message)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete plan. It may have active subscriptions.",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: keyof SubscriptionPlan, value: any) => {
    setEditedPlan((prev) => ({ ...prev, [field]: value }))
  }

  const handleLimitChange = (key: string, value: number) => {
    setEditedPlan((prev) => ({
      ...prev,
      limits: { ...(prev.limits || {}), [key]: value }
    }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(editedPlan.features || [])]
    newFeatures[index] = value
    setEditedPlan((prev) => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setEditedPlan((prev) => ({ ...prev, features: [...(prev.features || []), ""] }))
  }

  const removeFeature = (index: number) => {
    const newFeatures = [...(editedPlan.features || [])]
    newFeatures.splice(index, 1)
    setEditedPlan((prev) => ({ ...prev, features: newFeatures }))
  }

  const toggleFeature = (feature: string) => {
    const features = editedPlan.features || []
    if (features.includes(feature)) {
      setEditedPlan(prev => ({ ...prev, features: features.filter(f => f !== feature) }))
    } else {
      setEditedPlan(prev => ({ ...prev, features: [...features, feature] }))
    }
  }

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <Card key={plan.plan_id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{plan.plan_name}</span>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.plan_id, plan.plan_name)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
              {plan.target_role === 'all' ? 'All Users' : plan.target_role.charAt(0).toUpperCase() + plan.target_role.slice(1)}
            </span>
            <span>•</span>
            <span>{plan.limits?.max_listings ? `Up to ${plan.limits.max_listings} listings` : 'Custom limits'}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="text-3xl font-bold">
            ₦{Number(plan.price_monthly).toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          {plan.price_yearly > 0 && (
            <div className="text-lg text-muted-foreground">
              ₦{Number(plan.price_yearly).toLocaleString()}/year
              {plan.price_yearly < plan.price_monthly * 12 && (
                <span className="ml-2 text-xs text-green-600">
                  Save ₦{(plan.price_monthly * 12 - plan.price_yearly).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-semibold text-muted-foreground">Limits:</p>
          <ul className="text-sm space-y-1">
            {plan.limits?.max_listings && (
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {plan.limits.max_listings} active listings
              </li>
            )}
            {plan.limits?.max_photos && (
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {plan.limits.max_photos} photos per listing
              </li>
            )}
            {plan.limits?.featured_listings !== undefined && (
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {plan.limits.featured_listings} featured listing{plan.limits.featured_listings !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>

        {plan.features && plan.features.length > 0 && (
          <>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Features:</p>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => handleEdit(plan)}>Edit Plan</Button>
      </CardFooter>
    </Card>
  )

  const renderEditForm = () => {
    if (!isEditing || !editedPlan) return null
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl my-8">
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New' : 'Edit'} Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="plan_name">Plan Name *</Label>
              <Input
                id="plan_name"
                value={editedPlan.plan_name || ""}
                onChange={(e) => handleInputChange("plan_name", e.target.value)}
                placeholder="e.g. Premium Plan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_role">Target Role *</Label>
              <Select
                value={editedPlan.target_role || "all"}
                onValueChange={(value) => handleInputChange("target_role", value)}
              >
                <SelectTrigger id="target_role">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="agent">Agent (General)</SelectItem>
                  <SelectItem value="agent-individual">Agent (Individual)</SelectItem>
                  <SelectItem value="agent-company">Agent (Company)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Monthly Price (₦) *</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  step="0.01"
                  value={editedPlan.price_monthly || ""}
                  onChange={(e) => handleInputChange("price_monthly", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_yearly">Yearly Price (₦)</Label>
                <Input
                  id="price_yearly"
                  type="number"
                  step="0.01"
                  value={editedPlan.price_yearly || ""}
                  onChange={(e) => handleInputChange("price_yearly", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <Label className="text-base font-semibold">Limits</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_listings">Max Listings</Label>
                  <Input
                    id="max_listings"
                    type="number"
                    value={editedPlan.limits?.max_listings || 0}
                    onChange={(e) => handleLimitChange("max_listings", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_photos">Max Photos</Label>
                  <Input
                    id="max_photos"
                    type="number"
                    value={editedPlan.limits?.max_photos || 0}
                    onChange={(e) => handleLimitChange("max_photos", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured_listings">Featured Listings</Label>
                  <Input
                    id="featured_listings"
                    type="number"
                    value={editedPlan.limits?.featured_listings || 0}
                    onChange={(e) => handleLimitChange("featured_listings", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boosts_per_month">Boosts/Month</Label>
                  <Input
                    id="boosts_per_month"
                    type="number"
                    value={editedPlan.limits?.boosts_per_month || 0}
                    onChange={(e) => handleLimitChange("boosts_per_month", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_property_requests_per_month">Requests/Month</Label>
                  <Input
                    id="max_property_requests_per_month"
                    type="number"
                    value={editedPlan.limits?.max_property_requests_per_month || 0}
                    onChange={(e) => handleLimitChange("max_property_requests_per_month", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listing_duration_days">Listing Duration (Days)</Label>
                  <Input
                    id="listing_duration_days"
                    type="number"
                    value={editedPlan.limits?.listing_duration_days || 30}
                    onChange={(e) => handleLimitChange("listing_duration_days", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Features</Label>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="can_boost"
                  checked={editedPlan.features?.includes('can_boost')}
                  onCheckedChange={() => toggleFeature('can_boost')}
                />
                <Label htmlFor="can_boost">Allow Boosting</Label>
              </div>
              {editedPlan.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Enter feature description"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeature} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create Plan' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading subscription plans...</p>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => fetchPlans(true)}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">Manage subscription plans and pricing</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(renderPlanCard)}

        <Card className="border-dashed hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreate}>
          <CardHeader>
            <CardTitle className="text-center">Create New Plan</CardTitle>
            <CardDescription className="text-center">Add a new subscription tier</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {renderEditForm()}
    </div>
  )
}
