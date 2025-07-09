"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/buttons"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DrugShipmentDialog } from "./DrugShipmentDialog"
import { DeleteDrugShipmentDialog } from "./DeleteDrugShipmentDialog"
import { DrugShipmentDetailsDialog } from "./DrugShipmentDetailsDialog"
import { drugShipmentAPI } from "../../lib/DrugShipmentAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function DrugShipmentManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "dateCreated",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingShipment, setEditingShipment] = useState(null)
  const [deletingShipment, setDeletingShipment] = useState(null)
  const [viewingShipment, setViewingShipment] = useState(null)

  const { toast } = useToast()

  const {
    data: shipmentResponse,
    loading: shipmentLoading,
    error: shipmentError,
    refetch: refetchShipments,
  } = useApi(() => drugShipmentAPI.getDrugShipments(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => drugShipmentAPI.getDashboardStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== DRUG SHIPMENT DEBUG ===')
    console.log('shipmentResponse:', shipmentResponse)
    console.log('shipmentLoading:', shipmentLoading)
    console.log('shipmentError:', shipmentError)
    console.log('filters:', filters)
  }, [shipmentResponse, shipmentLoading, shipmentError, filters])

  // Extract data with better error handling
  const drugShipments = (() => {
    if (!shipmentResponse) return []
    if (Array.isArray(shipmentResponse)) return shipmentResponse
    if (shipmentResponse.data && Array.isArray(shipmentResponse.data)) return shipmentResponse.data
    if (shipmentResponse.shipments && Array.isArray(shipmentResponse.shipments)) return shipmentResponse.shipments
    if (shipmentResponse.results && Array.isArray(shipmentResponse.results)) return shipmentResponse.results
    return []
  })()

  const studies = (() => {
    if (!studiesResponse) return []
    if (Array.isArray(studiesResponse)) return studiesResponse
    if (studiesResponse.data && Array.isArray(studiesResponse.data)) return studiesResponse.data
    return studiesResponse
  })()

  const stats = (() => {
    if (!statsData) {
      return {
        totalShipments: 0,
        pendingShipments: 0,
        shipmentsByType: [],
        recentShipments: [],
      }
    }
    if (statsData.data) return statsData.data
    return statsData
  })()

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const toggleStatus = async (shipmentId) => {
    // Implement status toggle logic if you have such a field for shipments
    // For now, just a placeholder
    toast({
      title: "Not implemented",
      description: "Shipment status toggle is not implemented.",
      variant: "destructive"
    })
  }

  const deleteDrugShipment = async (shipmentId) => {
    try {
      const result = await executeOperation(() => drugShipmentAPI.deleteDrugShipment(shipmentId))
      if (result) {
        toast({
          title: "Drug shipment deleted",
          description: "Drug shipment has been deleted successfully",
        })
        setDeletingShipment(null)
        refetchShipments()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting drug shipment:', error)
      toast({
        title: "Error",
        description: "Failed to delete drug shipment",
        variant: "destructive"
      })
    }
  }

  const addDrugShipment = async (data) => {
    try {
      const result = await executeOperation(() => drugShipmentAPI.createDrugShipment(data))
      if (result) {
        toast({
          title: "Drug shipment created",
          description: "Drug shipment has been created successfully",
        })
        setShowAddDialog(false)
        refetchShipments()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating drug shipment:', error)
      toast({
        title: "Error",
        description: "Failed to create drug shipment",
        variant: "destructive"
      })
    }
  }

  const updateDrugShipment = async (data) => {
    if (!editingShipment) return
    try {
      const result = await executeOperation(() => drugShipmentAPI.updateDrugShipment(editingShipment._id, data))
      if (result) {
        toast({
          title: "Drug shipment updated",
          description: "Drug shipment has been updated successfully",
        })
        setEditingShipment(null)
        refetchShipments()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating drug shipment:', error)
      toast({
        title: "Error",
        description: "Failed to update drug shipment",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  // Enhanced error display
  if (shipmentError) {
    console.error('Drug shipment error:', shipmentError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading drug shipments:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(shipmentError)}</p>
          <Button onClick={() => refetchShipments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drug Shipment Management</h1>
          <p className="text-muted-foreground">Manage drug shipments and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchShipments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Drug Shipment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shipments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">Drug Shipments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Shipments", value: stats.totalShipments, icon: <Filter /> },
              { label: "Pending Shipments", value: stats.pendingShipments, icon: <ToggleRight /> },
              { label: "Shipments by Type", value: Array.isArray(stats.shipmentsByType) ? stats.shipmentsByType.map(t => `${t._id}: ${t.count}`).join(", ") : "", icon: <Search /> },
              { label: "Recent Shipments", value: Array.isArray(stats.recentShipments) ? stats.recentShipments.length : 0, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search drug shipments..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={filters.selectType || "all"}
                onValueChange={(value) => handleFilterChange("selectType", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DrugGroup">Drug Group</SelectItem>
                  <SelectItem value="Drug">Drug</SelectItem>
                  <SelectItem value="Randomization">Randomization</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortBy || "dateCreated"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipmentNumber">Shipment Number</SelectItem>
                  <SelectItem value="dateCreated">Created Date</SelectItem>
                  <SelectItem value="lastUpdated">Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {shipmentLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : drugShipments.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No drug shipments found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Drug Shipment
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Study</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drugShipments.map((shipment, index) => (
                      <TableRow key={shipment._id || shipment.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{shipment.shipmentNumber || shipment.slug || 'Unnamed Shipment'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {shipment.uniqueId || shipment._id || shipment.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {shipment.selectType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {shipment.study?.name || shipment.study?.studyCode || shipment.study || "N/A"}
                        </TableCell>
                        <TableCell>
                          {shipment.siteNumber?.siteName || shipment.siteNumber?.siteNumber || shipment.siteNumber || "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(shipment.dateCreated || shipment.createdAt)}</TableCell>
                        <TableCell>{formatDate(shipment.lastUpdated || shipment.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingShipment(shipment)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingShipment(shipment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingShipment(shipment)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {shipmentResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {drugShipments.length} of {shipmentResponse.total} drug shipments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!shipmentResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!shipmentResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DrugShipmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addDrugShipment}
        title="Add New Drug Shipment"
        loading={operationLoading}
        studies={studies}
      />

      <DrugShipmentDialog
        open={!!editingShipment}
        onOpenChange={(open) => !open && setEditingShipment(null)}
        onSave={updateDrugShipment}
        drugShipment={editingShipment}
        title="Edit Drug Shipment"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteDrugShipmentDialog
        open={!!deletingShipment}
        onOpenChange={(open) => !open && setDeletingShipment(null)}
        onConfirm={() => deletingShipment && deleteDrugShipment(deletingShipment._id || deletingShipment.id)}
        drugShipment={deletingShipment}
        loading={operationLoading}
      />

      <DrugShipmentDetailsDialog
        open={!!viewingShipment}
        onOpenChange={(open) => !open && setViewingShipment(null)}
        drugShipment={viewingShipment}
      />
    </div>
  )
}