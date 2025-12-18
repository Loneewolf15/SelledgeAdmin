"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Zap, Save, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BoostTier {
    id: string
    name?: string
    duration: number
    price: number
    multiplier: number
    active?: boolean
}

export function BoostTiersManagement() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [tiers, setTiers] = useState<Record<string, BoostTier>>({})
    const { toast } = useToast()

    useEffect(() => {
        fetchTiers()
    }, [])

    const fetchTiers = async () => {
        try {
            setLoading(true)
            const res = await api.getSettings("boosts")
            if (res.status && res.data && res.data.settings) {
                const boostTiersSetting = res.data.settings.find((s: any) => s.key === "boost_tiers")
                if (boostTiersSetting && boostTiersSetting.value) {
                    setTiers(boostTiersSetting.value)
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch boost tiers:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const res = await api.updateSetting("boost_tiers", tiers)
            if (res.status) {
                toast({
                    title: "Success",
                    description: "Boost tiers saved successfully",
                })
            } else {
                throw new Error(res.message || "Failed to save boost tiers")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save boost tiers",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const updateTier = (id: string, field: keyof BoostTier, value: any) => {
        setTiers(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }))
    }

    const toggleTierActive = (id: string) => {
        setTiers(prev => ({
            ...prev,
            [id]: { ...prev[id], active: !prev[id].active }
        }))
    }

    // Helper to convert object to array for rendering
    const tierList = Object.entries(tiers).map(([key, value]) => ({ ...value, id: key }))

    if (loading) {
        return <div>Loading boost tiers...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">Boost Tiers Management</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configure Boost Tiers</CardTitle>
                    <CardDescription>Set duration, price, and visibility multipliers for boost packages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {tierList.map((tier) => (
                        <div key={tier.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg capitalize">{tier.id} Tier</h3>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`active-${tier.id}`}>Active</Label>
                                    <Switch
                                        id={`active-${tier.id}`}
                                        checked={tier.active !== false}
                                        onCheckedChange={() => toggleTierActive(tier.id)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`duration-${tier.id}`}>Duration (Hours)</Label>
                                    <Input
                                        id={`duration-${tier.id}`}
                                        type="number"
                                        value={tier.duration}
                                        onChange={(e) => updateTier(tier.id, "duration", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`price-${tier.id}`}>Price (₦)</Label>
                                    <Input
                                        id={`price-${tier.id}`}
                                        type="number"
                                        value={tier.price}
                                        onChange={(e) => updateTier(tier.id, "price", parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`multiplier-${tier.id}`}>Visibility Multiplier</Label>
                                    <Input
                                        id={`multiplier-${tier.id}`}
                                        type="number"
                                        value={tier.multiplier}
                                        onChange={(e) => updateTier(tier.id, "multiplier", parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save Boost Tiers"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
