"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Save, Building, Wrench, DollarSign, Shield, Bell, Settings, Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { BoostTiersManagement } from "./boost-tiers-management"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  item_type: "property" | "equipment" | "general"
  active: number
  created_at: string
  updated_at: string
}

export function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categoryType, setCategoryType] = useState<"property" | "equipment">("equipment")
  const [activeCategoryTab, setActiveCategoryTab] = useState<"property" | "equipment">("equipment")
  const { toast } = useToast()

  const [propertySettings, setPropertySettings] = useState({
    default_commission_rate: "5",
    minimum_listing_price: "500",
    maximum_listing_price: "50000",
    auto_approval_threshold: "2000",
    require_kyc_for_listing: true,
    allow_pet_friendly_listings: true,
    require_property_inspection: false,
    max_images_per_listing: "10",
    listing_expiration_days: "90",
  })

  const [allCategories, setAllCategories] = useState<Category[]>([])

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    emergency_response_time: "2",
    routine_maintenance_schedule: "monthly",
    inspection_frequency: "quarterly",
    maintenance_request_auto_assign: true,
    tenant_maintenance_portal: true,
    maintenance_notifications: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    platform_name: "PropertyHub Admin",
    maintenance_mode: false,
    user_registration: true,
    email_notifications: true,
    admin_email: "admin@propertyhub.com",
    support_email: "support@propertyhub.com",
  })

  // Filter categories based on active tab
  const filteredCategories = allCategories.filter(cat => cat.item_type === activeCategoryTab)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [settingsRes, categoriesRes] = await Promise.all([
        api.getSettingsGrouped(),
        api.getEquipmentCategories()
      ])

      if (settingsRes.status && settingsRes.data) {
        // Update property settings
        if (settingsRes.data.property) {
          setPropertySettings((prev) => ({ ...prev, ...settingsRes.data.property }))
        }
        // Update maintenance settings
        if (settingsRes.data.maintenance) {
          setMaintenanceSettings((prev) => ({ ...prev, ...settingsRes.data.maintenance }))
        }
        // Update system settings
        if (settingsRes.data.system) {
          setSystemSettings((prev) => ({ ...prev, ...settingsRes.data.system }))
        }
      }

      if (categoriesRes.status && categoriesRes.data?.categories) {
        setAllCategories(categoriesRes.data.categories)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePropertySettings = async () => {
    try {
      setSaving("property")
      const res = await api.updateMultipleSettings(propertySettings)
      if (res.status) {
        toast({
          title: "Success",
          description: "Property settings saved successfully",
        })
      } else {
        throw new Error(res.message || "Failed to save settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save property settings",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const handleSaveMaintenanceSettings = async () => {
    try {
      setSaving("maintenance")
      const res = await api.updateMultipleSettings(maintenanceSettings)
      if (res.status) {
        toast({
          title: "Success",
          description: "Maintenance settings saved successfully",
        })
      } else {
        throw new Error(res.message || "Failed to save settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save maintenance settings",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const handleSaveSystemSettings = async () => {
    try {
      setSaving("system")
      const res = await api.updateMultipleSettings(systemSettings)
      if (res.status) {
        toast({
          title: "Success",
          description: "System settings saved successfully",
        })
      } else {
        throw new Error(res.message || "Failed to save settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save system settings",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const updatePropertySetting = (key: string, value: any) => {
    setPropertySettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateMaintenanceSetting = (key: string, value: any) => {
    setMaintenanceSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryName(category.name)
      setCategoryDescription(category.description || "")
      setCategoryType(category.item_type as "property" | "equipment")
    } else {
      setEditingCategory(null)
      setCategoryName("")
      setCategoryDescription("")
      setCategoryType(activeCategoryTab) // Set to current active tab
    }
    setShowCategoryModal(true)
  }

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setCategoryName("")
    setCategoryDescription("")
    setCategoryType(activeCategoryTab)
  }

  const handleSaveCategory = async () => {
    try {
      if (!categoryName.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      setSaving("category")

      if (editingCategory) {
        // Update existing category
        const res = await api.updateEquipmentCategory({
          id: editingCategory.id,
          name: categoryName,
          description: categoryDescription || undefined,
        })

        if (res.status) {
          toast({
            title: "Success",
            description: "Equipment category updated successfully",
          })
          fetchSettings()
          handleCloseCategoryModal()
        } else {
          throw new Error(res.message || "Failed to update category")
        }
      } else {
        // Create new category
        const res = await api.createEquipmentCategory({
          name: categoryName,
          description: categoryDescription || undefined,
          item_type: categoryType,
        })

        if (res.status) {
          toast({
            title: "Success",
            description: "Equipment category created successfully",
          })
          fetchSettings()
          handleCloseCategoryModal()
        } else {
          throw new Error(res.message || "Failed to create category")
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const toggleEquipmentCategory = async (id: number) => {
    try {
      const res = await api.toggleEquipmentCategory(id)
      if (res.status) {
        toast({
          title: "Success",
          description: "Category status updated",
        })
        fetchSettings()
      } else {
        throw new Error(res.message || "Failed to toggle category")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle category status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const res = await api.deleteEquipmentCategory(id)
      if (res.status) {
        toast({
          title: "Success",
          description: "Equipment category deleted successfully",
        })
        fetchSettings()
      } else {
        throw new Error(res.message || "Failed to delete category")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Properties & Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure property listings, equipment categories, and maintenance settings.
        </p>
      </div>

      {/* Property Management Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Property Management</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Commission
              </CardTitle>
              <CardDescription>Configure pricing rules and commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Default Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={propertySettings.default_commission_rate}
                  onChange={(e) => updatePropertySetting("default_commission_rate", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPrice">Minimum Listing Price (₦)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={propertySettings.minimum_listing_price}
                    onChange={(e) => updatePropertySetting("minimum_listing_price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Listing Price (₦)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={propertySettings.maximum_listing_price}
                    onChange={(e) => updatePropertySetting("maximum_listing_price", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoApproval">Auto-Approval Threshold (₦)</Label>
                <Input
                  id="autoApproval"
                  type="number"
                  value={propertySettings.auto_approval_threshold}
                  onChange={(e) => updatePropertySetting("auto_approval_threshold", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Listings below this amount are auto-approved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Listing Requirements
              </CardTitle>
              <CardDescription>Set requirements for property listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require KYC for Listing</Label>
                  <p className="text-sm text-muted-foreground">Users must complete KYC before listing</p>
                </div>
                <Switch
                  checked={propertySettings.require_kyc_for_listing}
                  onCheckedChange={(checked) => updatePropertySetting("require_kyc_for_listing", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Pet-Friendly Listings</Label>
                  <p className="text-sm text-muted-foreground">Enable pet-friendly property options</p>
                </div>
                <Switch
                  checked={propertySettings.allow_pet_friendly_listings}
                  onCheckedChange={(checked) => updatePropertySetting("allow_pet_friendly_listings", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Property Inspection</Label>
                  <p className="text-sm text-muted-foreground">Mandatory inspection before approval</p>
                </div>
                <Switch
                  checked={propertySettings.require_property_inspection}
                  onCheckedChange={(checked) => updatePropertySetting("require_property_inspection", checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxImages">Max Images per Listing</Label>
                  <Input
                    id="maxImages"
                    type="number"
                    value={propertySettings.max_images_per_listing}
                    onChange={(e) => updatePropertySetting("max_images_per_listing", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDays">Listing Expiration (days)</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    value={propertySettings.listing_expiration_days}
                    onChange={(e) => updatePropertySetting("listing_expiration_days", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSavePropertySettings} disabled={saving === "property"} className="gap-2">
            {saving === "property" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving === "property" ? "Saving..." : "Save Property Settings"}
          </Button>
        </div>
      </div>

      {/* Category Management (Equipment & Property) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Category Management</h2>
          </div>
          <Button onClick={() => handleOpenCategoryModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage property and equipment categories</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeCategoryTab === "property" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategoryTab("property")}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Property
                </Button>
                <Button
                  variant={activeCategoryTab === "equipment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategoryTab("equipment")}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Equipment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeCategoryTab} categories found. Click "Add Category" to create one.
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant={category.active ? "default" : "secondary"}>
                          {category.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenCategoryModal(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch checked={Boolean(category.active)} onCheckedChange={() => toggleEquipmentCategory(category.id)} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Maintenance Management</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
              <CardDescription>Configure maintenance response schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyResponse">Emergency Response Time (hours)</Label>
                <Input
                  id="emergencyResponse"
                  type="number"
                  value={maintenanceSettings.emergency_response_time}
                  onChange={(e) => updateMaintenanceSetting("emergency_response_time", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routineMaintenance">Routine Maintenance Schedule</Label>
                <select
                  id="routineMaintenance"
                  value={maintenanceSettings.routine_maintenance_schedule}
                  onChange={(e) => updateMaintenanceSetting("routine_maintenance_schedule", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspectionFreq">Inspection Frequency</Label>
                <select
                  id="inspectionFreq"
                  value={maintenanceSettings.inspection_frequency}
                  onChange={(e) => updateMaintenanceSetting("inspection_frequency", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automated maintenance features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Assign Maintenance Requests</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign requests to available staff</p>
                </div>
                <Switch
                  checked={maintenanceSettings.maintenance_request_auto_assign}
                  onCheckedChange={(checked) => updateMaintenanceSetting("maintenance_request_auto_assign", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tenant Maintenance Portal</Label>
                  <p className="text-sm text-muted-foreground">Allow tenants to submit maintenance requests</p>
                </div>
                <Switch
                  checked={maintenanceSettings.tenant_maintenance_portal}
                  onCheckedChange={(checked) => updateMaintenanceSetting("tenant_maintenance_portal", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications for maintenance updates</p>
                </div>
                <Switch
                  checked={maintenanceSettings.maintenance_notifications}
                  onCheckedChange={(checked) => updateMaintenanceSetting("maintenance_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveMaintenanceSettings} disabled={saving === "maintenance"} className="gap-2">
            {saving === "maintenance" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving === "maintenance" ? "Saving..." : "Save Maintenance Settings"}
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">System Settings</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General System Configuration</CardTitle>
            <CardDescription>Basic platform settings and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={systemSettings.platform_name}
                  onChange={(e) => updateSystemSetting("platform_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={systemSettings.admin_email}
                  onChange={(e) => updateSystemSetting("admin_email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={systemSettings.support_email}
                onChange={(e) => updateSystemSetting("support_email", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
              </div>
              <Switch
                checked={systemSettings.maintenance_mode}
                onCheckedChange={(checked) => updateSystemSetting("maintenance_mode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new user registrations</p>
              </div>
              <Switch
                checked={systemSettings.user_registration}
                onCheckedChange={(checked) => updateSystemSetting("user_registration", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSystemSettings} disabled={saving === "system"} className="gap-2">
            {saving === "system" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving === "system" ? "Saving..." : "Save System Settings"}
          </Button>
        </div>
      </div>


      {/* Boost Tiers Management */}
      <BoostTiersManagement />

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of the category."
                : "Add a new category for listings."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-type">Category Type *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={categoryType === "property" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryType("property")}
                  disabled={!!editingCategory}
                  className="flex-1"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Property
                </Button>
                <Button
                  type="button"
                  variant={categoryType === "equipment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryType("equipment")}
                  disabled={!!editingCategory}
                  className="flex-1"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Equipment
                </Button>
              </div>
              {editingCategory && (
                <p className="text-xs text-muted-foreground">Category type cannot be changed after creation</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                placeholder={categoryType === "property" ? "e.g., Apartment" : "e.g., Pool Equipment"}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Brief description of the category"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCategoryModal} disabled={saving === "category"}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={saving === "category"} className="gap-2">
              {saving === "category" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingCategory ? "Update" : "Create"} Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
