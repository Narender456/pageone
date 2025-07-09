"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import PropTypes from "prop-types"

export function StudyTypeDetailsDialog({ open, onOpenChange, studyType, studies = [] }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getSelectedStudies = () => {
    if (!studyType?.studies || !Array.isArray(studyType.studies)) {
      return []
    }

    return studyType.studies.map(study => ({
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
          <DialogTitle>Study Type Details</DialogTitle>
          <DialogDescription>
            {studyType ? `Details for "${studyType.study_Type}"` : "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {studyType && (
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
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">{studyType.study_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={getStatusColor(studyType.isActive)}>
                          {studyType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
                      <p className="text-sm font-mono">{studyType.uniqueId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Slug</label>
                      <p className="text-sm font-mono">{studyType.slug}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(studyType.date_created)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(studyType.last_updated)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Studies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Studies</CardTitle>
                  <CardDescription>{selectedStudies.length} studies assigned to this type</CardDescription>
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
                      <p className="text-muted-foreground">No studies assigned to this type</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* URL Information */}
              {studyType.absoluteUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">URL Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Absolute URL</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{studyType.absoluteUrl}</p>
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

StudyTypeDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  studyType: PropTypes.object,
  studies: PropTypes.array,
}
