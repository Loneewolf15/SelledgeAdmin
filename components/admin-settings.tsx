"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Building, Wrench, DollarSign, Shield, Bell, Settings, Plus, Trash2, Edit } from "lucide-react"

export function AdminSettings() {
  const [propertySettings, setPropertySettings] = useState({
    defaultCommissionRate: "5",
    minimumListingPrice: "500",
    maximumListingPrice: "50000",
    autoApprovalThreshold: "2000",
    requireKYCForListing: true,
    allowPetFriendlyListings: true,
    requirePropertyInspection: false,
    maxImagesPerListing: "10",
    listingExpirationDays: "90",
  })

  const [equipmentCategories, setEquipmentCategories] = useState([
    { id: 1, name: "HVAC Systems", description: "Heating, ventilation, and air conditioning", active: true },
    { id: 2, name: "Kitchen Appliances", description: "Refrigerators, ovens, dishwashers", active: true },
    { id: 3, name: "Laundry Equipment", description: "Washers, dryers, laundry facilities", active: true },
    { id: 4, name: "Security Systems", description: "Cameras, alarms, access control", active: true },
    { id: 5, name: "Fitness Equipment", description: "Gym equipment, exercise machines", active: false },
  ])

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    emergencyResponseTime: "2",
    routineMaintenanceSchedule: "monthly",
    inspectionFrequency: "quarterly",
    maintenanceRequestAutoAssign: true,
    tenantMaintenancePortal: true,
    maintenanceNotifications: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    platformName: "PropertyHub Admin",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    adminEmail: "admin@propertyhub.com",
    supportEmail: "support@propertyhub.com",
  })

  const handleSavePropertySettings = () => {
    console.log("Property settings saved:", propertySettings)
  }

  const handleSaveMaintenanceSettings = () => {
    console.log("Maintenance settings saved:", maintenanceSettings)
  }

  const handleSaveSystemSettings = () => {
    console.log("System settings saved:", systemSettings)
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

  const toggleEquipmentCategory = (id: number) => {
    setEquipmentCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat)))
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
                  value={propertySettings.defaultCommissionRate}
                  onChange={(e) => updatePropertySetting("defaultCommissionRate", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPrice">Minimum Listing Price ($)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={propertySettings.minimumListingPrice}
                    onChange={(e) => updatePropertySetting("minimumListingPrice", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Listing Price ($)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={propertySettings.maximumListingPrice}
                    onChange={(e) => updatePropertySetting("maximumListingPrice", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoApproval">Auto-Approval Threshold ($)</Label>
                <Input
                  id="autoApproval"
                  type="number"
                  value={propertySettings.autoApprovalThreshold}
                  onChange={(e) => updatePropertySetting("autoApprovalThreshold", e.target.value)}
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
                  checked={propertySettings.requireKYCForListing}
                  onCheckedChange={(checked) => updatePropertySetting("requireKYCForListing", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Pet-Friendly Listings</Label>
                  <p className="text-sm text-muted-foreground">Enable pet-friendly property options</p>
                </div>
                <Switch
                  checked={propertySettings.allowPetFriendlyListings}
                  onCheckedChange={(checked) => updatePropertySetting("allowPetFriendlyListings", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Property Inspection</Label>
                  <p className="text-sm text-muted-foreground">Mandatory inspection before approval</p>
                </div>
                <Switch
                  checked={propertySettings.requirePropertyInspection}
                  onCheckedChange={(checked) => updatePropertySetting("requirePropertyInspection", checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxImages">Max Images per Listing</Label>
                  <Input
                    id="maxImages"
                    type="number"
                    value={propertySettings.maxImagesPerListing}
                    onChange={(e) => updatePropertySetting("maxImagesPerListing", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDays">Listing Expiration (days)</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    value={propertySettings.listingExpirationDays}
                    onChange={(e) => updatePropertySetting("listingExpirationDays", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSavePropertySettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save Property Settings
          </Button>
        </div>
      </div>

      {/* Equipment Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Equipment Categories</h2>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Categories</CardTitle>
            <CardDescription>Manage equipment categories for property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipmentCategories.map((category) => (
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
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Switch checked={category.active} onCheckedChange={() => toggleEquipmentCategory(category.id)} />
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                  value={maintenanceSettings.emergencyResponseTime}
                  onChange={(e) => updateMaintenanceSetting("emergencyResponseTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routineMaintenance">Routine Maintenance Schedule</Label>
                <select
                  id="routineMaintenance"
                  value={maintenanceSettings.routineMaintenanceSchedule}
                  onChange={(e) => updateMaintenanceSetting("routineMaintenanceSchedule", e.target.value)}
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
                  value={maintenanceSettings.inspectionFrequency}
                  onChange={(e) => updateMaintenanceSetting("inspectionFrequency", e.target.value)}
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
                  checked={maintenanceSettings.maintenanceRequestAutoAssign}
                  onCheckedChange={(checked) => updateMaintenanceSetting("maintenanceRequestAutoAssign", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tenant Maintenance Portal</Label>
                  <p className="text-sm text-muted-foreground">Allow tenants to submit maintenance requests</p>
                </div>
                <Switch
                  checked={maintenanceSettings.tenantMaintenancePortal}
                  onCheckedChange={(checked) => updateMaintenanceSetting("tenantMaintenancePortal", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications for maintenance updates</p>
                </div>
                <Switch
                  checked={maintenanceSettings.maintenanceNotifications}
                  onCheckedChange={(checked) => updateMaintenanceSetting("maintenanceNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveMaintenanceSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save Maintenance Settings
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
                  value={systemSettings.platformName}
                  onChange={(e) => updateSystemSetting("platformName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={systemSettings.adminEmail}
                  onChange={(e) => updateSystemSetting("adminEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={systemSettings.supportEmail}
                onChange={(e) => updateSystemSetting("supportEmail", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => updateSystemSetting("maintenanceMode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new user registrations</p>
              </div>
              <Switch
                checked={systemSettings.userRegistration}
                onCheckedChange={(checked) => updateSystemSetting("userRegistration", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSystemSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save System Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
