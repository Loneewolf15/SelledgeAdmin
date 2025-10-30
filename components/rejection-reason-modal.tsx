"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface RejectionReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  title: string
  description: string
}

export function RejectionReasonModal({ isOpen, onClose, onSubmit, title, description }: RejectionReasonModalProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim())
      setReason("")
    }
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <X className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a clear explanation for the rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] mt-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              variant="outline"
            >
              Submit Rejection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
