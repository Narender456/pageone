"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import PropTypes from "prop-types"

export function SiteDetailsDialog({ open, onOpenChange, site, studies = [] }) {
  const formatDate = (dateString) => {
    // Handle null, undefined, or invalid date strings
    if (!dateString) return "N/A"
    
    const date = new Date(dateString)
    // Check if the date is valid
    if (isNaN(date.getTime())) return "N/A"
    
    return date.toLocaleString()
  }


  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getSelectedStudies = () => {
    if (!site?.studies || !Array.isArray(site.studies)) {
      return []
    }

    return site.studies.map(study => ({
      id: study._id || study.id || "unknown",
      study_name: study.study_name || "Unknown Study",
      protocol_number: study.protocol_number || "N/A",
      study_title: study.study_title || "N/A"
    }))
  }

  const selectedStudies = getSelectedStudies()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Site Status Details</DialogTitle>
          {/* <DialogDescription>{site ? `Details for "${site.site_status}"` : "Loading..."}</DialogDescription> */}
        </DialogHeader>

        {site && (
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site Name</label>
                      <p className="text-sm">{site.siteName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site ID</label>
                      <p className="text-sm">{site.siteId || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Protocol Number</label>
                      <p className="text-sm">{site.protocolNumber || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">PI Name</label>
                      <p className="text-sm">{site.piName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={getStatusColor(site.isActive)}>
                          {site.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site Status Name</label>
                      <p className="text-sm">{site.site_status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
                      <p className="text-sm font-mono">{site.uniqueId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Slug</label>
                      <p className="text-sm font-mono">{site.slug}</p>
                    </div>
                      <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(site.date_created || site.dateCreated || site.created_at || site.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(site.last_updated || site.lastUpdated || site.updated_at || site.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Studies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Studies</CardTitle>
                  <CardDescription>{selectedStudies.length} studies assigned to this site status</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudies.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                        <div>Study Name</div>
                        <div>Protocol Number</div>
                        <div>Study Title</div>
                      </div>
                        {selectedStudies.map((study) => (
                          <div key={study.id} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">

                          <div className="text-sm">{study.study_name || "N/A"}</div>
                          <div className="text-sm font-mono">{study.protocol_number || "N/A"}</div>
                          <div className="text-sm">{study.study_title || "N/A"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No studies assigned to this blinding status</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* URL Information */}
              {site.absoluteUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">URL Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Absolute URL</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{site.absoluteUrl}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

SiteDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  site: PropTypes.shape({
    siteName: PropTypes.string,
    siteId: PropTypes.string,
    protocolNumber: PropTypes.string,
    piName: PropTypes.string,
    site_status: PropTypes.string,
    isActive: PropTypes.bool,
    uniqueId: PropTypes.string,
    slug: PropTypes.string,
    date_created: PropTypes.string,
    last_updated: PropTypes.string,
    absoluteUrl: PropTypes.string,
    studies: PropTypes.array,
  }),
  studies: PropTypes.array,
}
