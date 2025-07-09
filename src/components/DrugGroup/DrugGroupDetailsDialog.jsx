"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import PropTypes from "prop-types"

export function DrugGroupDetailsDialog({ open, onOpenChange, drugGroup, studies = [], drugs = [] }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  // Get selected studies details
  const getSelectedStudies = () => {
    if (!drugGroup?.studies || !Array.isArray(drugGroup.studies)) {
      return []
    }

    return drugGroup.studies.map(study => ({
      id: study._id || study.id || "unknown",
      study_name: study.study_name || "Unknown Study",
      protocol_number: study.protocol_number || "N/A",
      study_title: study.study_title || "N/A"
    }))
  }

  // Get selected drugs details
  const getSelectedDrugs = () => {
    if (!drugGroup?.drugs || !Array.isArray(drugGroup.drugs)) {
      return []
    }

    return drugGroup.drugs.map(drug => ({
      id: drug._id || drug.id || "unknown",
      drug_name: drug.drug_name || "Unknown Drug",
      generic_name: drug.generic_name || "N/A",
      brand_name: drug.brand_name || "N/A",
      drug_type: drug.drug_type || "N/A"
    }))
  }

  const selectedStudies = getSelectedStudies()
  const selectedDrugs = getSelectedDrugs()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Drug Group Details</DialogTitle>
          <DialogDescription>{drugGroup ? `Details for "${drugGroup.group_name}"` : "Loading..."}</DialogDescription>
        </DialogHeader>

        {drugGroup && (
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Group Name</label>
                      <p className="text-sm">{drugGroup.group_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={getStatusColor(drugGroup.isActive)}>
                          {drugGroup.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm">{drugGroup.description || "No description provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
                      <p className="text-sm font-mono">{drugGroup.uniqueId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Slug</label>
                      <p className="text-sm font-mono">{drugGroup.slug}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(drugGroup.date_created)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(drugGroup.last_updated)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Studies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Studies</CardTitle>
                  <CardDescription>{selectedStudies.length} studies assigned to this drug group</CardDescription>
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
                      <p className="text-muted-foreground">No studies assigned to this drug group</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assigned Drugs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Drugs</CardTitle>
                  <CardDescription>{selectedDrugs.length} drugs assigned to this drug group</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDrugs.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                        <div>Drug Name</div>
                        <div>Generic Name</div>
                        <div>Brand Name</div>
                        <div>Drug Type</div>
                      </div>
                      {selectedDrugs.map((drug) => (
                        <div key={drug.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                          <div className="text-sm">{drug.drug_name || "N/A"}</div>
                          <div className="text-sm">{drug.generic_name || "N/A"}</div>
                          <div className="text-sm">{drug.brand_name || "N/A"}</div>
                          <div className="text-sm">
                            {drug.drug_type && (
                              <Badge variant="outline" className="text-xs">
                                {drug.drug_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No drugs assigned to this drug group</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* URL Information */}
              {drugGroup.absoluteUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">URL Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Absolute URL</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{drugGroup.absoluteUrl}</p>
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

DrugGroupDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  drugGroup: PropTypes.shape({
    group_name: PropTypes.string,
    description: PropTypes.string,
    isActive: PropTypes.bool,
    uniqueId: PropTypes.string,
    slug: PropTypes.string,
    date_created: PropTypes.string,
    last_updated: PropTypes.string,
    absoluteUrl: PropTypes.string,
    studies: PropTypes.array,
    drugs: PropTypes.array,
  }),
  studies: PropTypes.array,
  drugs: PropTypes.array,
}