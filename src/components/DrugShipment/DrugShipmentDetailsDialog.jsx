"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import PropTypes from "prop-types"

export function DrugShipmentDetailsDialog({ open, onOpenChange, drugShipment }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  // Helper to get assigned items based on selectType
  const getAssignedItems = () => {
    if (!drugShipment) return []
    if (drugShipment.selectType === "DrugGroup" && Array.isArray(drugShipment.groupName)) {
      return drugShipment.groupName.map(group => ({
        id: group._id || group.id || "unknown",
        name: group.name || "Unknown Group",
        description: group.description || "N/A"
      }))
    }
    if (drugShipment.selectType === "Drug" && Array.isArray(drugShipment.drug)) {
      return drugShipment.drug.map(drug => ({
        id: drug._id || drug.id || "unknown",
        name: drug.name || "Unknown Drug",
        code: drug.code || "N/A",
        description: drug.description || "N/A"
      }))
    }
    if (drugShipment.selectType === "Randomization" && Array.isArray(drugShipment.excelRows)) {
      return drugShipment.excelRows.map(row => ({
        id: row._id || row.id || "unknown",
        label: row.label || "Excel Row",
        // Add more fields as needed
      }))
    }
    return []
  }

  const assignedItems = getAssignedItems()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Drug Shipment Details</DialogTitle>
          <DialogDescription>
            {drugShipment
              ? `Details for "${drugShipment.shipmentNumber || drugShipment.slug || drugShipment._id}"`
              : "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {drugShipment && (
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
                      <label className="text-sm font-medium text-muted-foreground">Shipment Number</label>
                      <p className="text-sm">{drugShipment.shipmentNumber || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Select Type</label>
                      <p className="text-sm">{drugShipment.selectType || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Study</label>
                      <p className="text-sm">
                        {drugShipment.study?.name || drugShipment.study?.studyCode || drugShipment.study || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site</label>
                      <p className="text-sm">
                        {drugShipment.siteNumber?.siteName || drugShipment.siteNumber?.siteNumber || drugShipment.siteNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Shipment Date</label>
                      <p className="text-sm">{formatDate(drugShipment.shipmentDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(drugShipment.dateCreated)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(drugShipment.lastUpdated)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
                      <p className="text-sm font-mono">{drugShipment.uniqueId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Slug</label>
                      <p className="text-sm font-mono">{drugShipment.slug}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {drugShipment.selectType === "DrugGroup"
                      ? "Assigned Drug Groups"
                      : drugShipment.selectType === "Drug"
                      ? "Assigned Drugs"
                      : drugShipment.selectType === "Randomization"
                      ? "Assigned Excel Rows"
                      : "Assigned Items"}
                  </CardTitle>
                  <CardDescription>
                    {assignedItems.length} {drugShipment.selectType === "Randomization" ? "rows" : "items"} assigned to this shipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignedItems.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                        {drugShipment.selectType === "DrugGroup" && (
                          <>
                            <div>Group Name</div>
                            <div>Description</div>
                            <div>ID</div>
                          </>
                        )}
                        {drugShipment.selectType === "Drug" && (
                          <>
                            <div>Drug Name</div>
                            <div>Code</div>
                            <div>Description</div>
                          </>
                        )}
                        {drugShipment.selectType === "Randomization" && (
                          <>
                            <div>Row Label</div>
                            <div>ID</div>
                            <div></div>
                          </>
                        )}
                      </div>
                      {assignedItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                          {drugShipment.selectType === "DrugGroup" && (
                            <>
                              <div className="text-sm">{item.name}</div>
                              <div className="text-sm">{item.description}</div>
                              <div className="text-sm font-mono">{item.id}</div>
                            </>
                          )}
                          {drugShipment.selectType === "Drug" && (
                            <>
                              <div className="text-sm">{item.name}</div>
                              <div className="text-sm font-mono">{item.code}</div>
                              <div className="text-sm">{item.description}</div>
                            </>
                          )}
                          {drugShipment.selectType === "Randomization" && (
                            <>
                              <div className="text-sm">{item.label}</div>
                              <div className="text-sm font-mono">{item.id}</div>
                              <div></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No items assigned to this shipment</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* URL Information */}
              {drugShipment.getAbsoluteUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">URL Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Absolute URL</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{drugShipment.getAbsoluteUrl()}</p>
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

DrugShipmentDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  drugShipment: PropTypes.shape({
    shipmentNumber: PropTypes.string,
    shipmentDate: PropTypes.string,
    selectType: PropTypes.string,
    study: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    siteNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    groupName: PropTypes.array,
    drug: PropTypes.array,
    excelRows: PropTypes.array,
    uniqueId: PropTypes.string,
    slug: PropTypes.string,
    dateCreated: PropTypes.string,
    lastUpdated: PropTypes.string,
    getAbsoluteUrl: PropTypes.func,
  }),
}