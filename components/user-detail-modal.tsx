"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUpdateUser: (user: any) => void
}

export function UserDetailModal({ isOpen, onClose, user, onUpdateUser }: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)

  useEffect(() => {
    setEditedUser(user)
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setEditedUser({ ...editedUser, [field]: value })
  }

  const handleSave = () => {
    onUpdateUser(editedUser)
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "User Details"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            {isEditing ? (
              <Input id="name" value={editedUser.name} onChange={(e) => handleInputChange("name", e.target.value)} className="col-span-3" />
            ) : (
              <span className="col-span-3">{user.name}</span>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            {isEditing ? (
              <Input id="email" value={editedUser.email} onChange={(e) => handleInputChange("email", e.target.value)} className="col-span-3" />
            ) : (
              <span className="col-span-3">{user.email}</span>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            {isEditing ? (
              <Select value={editedUser.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="col-span-3">{user.role}</span>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <span className="col-span-3">{user.status}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Last Login</Label>
            <span className="col-span-3">{user.lastLogin}</span>
          </div>
          
          {(user.company_name || user.cac_number) && (
            <>
              <div className="col-span-4 mt-4 mb-2 border-t pt-4">
                <h4 className="font-semibold text-sm">Company Information</h4>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Company Name</Label>
                <span className="col-span-3">{user.company_name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">CAC Number</Label>
                <span className="col-span-3 font-mono">{user.cac_number}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Address</Label>
                <span className="col-span-3">{user.office_address || "N/A"}</span>
              </div>
              {user.cac_certificate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Certificate</Label>
                  <div className="col-span-3">
                    <Button variant="outline" size="sm" onClick={() => window.open(user.cac_certificate, '_blank')}>
                      View CAC Certificate
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
