"use client"

import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Separator } from "../ui/separator"
import { format } from "date-fns"

export function StudyDetailsDialog({ open, onOpenChange, study }) {
  if (!study) return null

  const getStudyStatus = (study) => {
    const now = new Date()
    const startDate = new Date(study.study_start_date)
    const endDate = study.study_end_date ? new Date(study.study_end_date) : null

    if (endDate && endDate < now) {
      return { label: "Completed", variant: "secondary" }
    } else if (startDate <= now) {
      return { label: "Active", variant: "default" }
    } else {
      return { label: "Upcoming", variant: "outline" }
    }
  }

  const status = getStudyStatus(study)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {study.study_name}
            <Badge variant={status.variant}>{status.label}</Badge>
          </DialogTitle>
          <DialogDescription>Protocol: {study.protocol_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Study Title</h3>
            <p className="text-muted-foreground">{study.study_title}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Study Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Protocol Number</p>
                  <p className="text-muted-foreground">{study.protocol_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Unique ID</p>
                  <p className="text-muted-foreground">{study.uniqueId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Slug</p>
                  <p className="text-muted-foreground">{study.slug}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Initiation Date</p>
                  <p className="text-muted-foreground">{format(new Date(study.study_initiation_date), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-muted-foreground">{format(new Date(study.study_start_date), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-muted-foreground">
                    {study.study_end_date ? format(new Date(study.study_end_date), "PPP") : "Ongoing"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">{format(new Date(study.date_created), "PPp")}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">{format(new Date(study.last_updated), "PPp")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
