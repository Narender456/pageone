// Debug version of BlindingStatusManagement with console logging and error handling

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
import { BlindingStatusDialog } from "./BlindingStatusDialog"
import { DeleteBlindingStatusDialog } from "./DeleteBlindingStatusDialog"
import { BlindingStatusDetailsDialog } from "./BlindingStatusDetailsDialog"
import { blindingStatusAPI } from "../../lib/BlindingStatusAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function BlindingStatusManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingStatus, setEditingStatus] = useState(null)
  const [deletingStatus, setDeletingStatus] = useState(null)
  const [viewingStatus, setViewingStatus] = useState(null)

  const { toast } = useToast()

  // Fixed: Changed from getBlindingStatus to getBlindingStatuses
  const {
    data: statusResponse,
    loading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useApi(() => blindingStatusAPI.getBlindingStatuses(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => blindingStatusAPI.getBlindingStatusStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== BLINDING STATUS DEBUG ===')
    console.log('statusResponse:', statusResponse)
    console.log('statusLoading:', statusLoading)
    console.log('statusError:', statusError)
    console.log('filters:', filters)
  }, [statusResponse, statusLoading, statusError, filters])

  // Extract data with better error handling
  const blindingStatuses = (() => {
    if (!statusResponse) {
      console.log('No statusResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(statusResponse)) {
      console.log('statusResponse is array:', statusResponse)
      return statusResponse
    }
    
    if (statusResponse.data && Array.isArray(statusResponse.data)) {
      console.log('statusResponse.data is array:', statusResponse.data)
      return statusResponse.data
    }
    
    if (statusResponse.blindingStatuses && Array.isArray(statusResponse.blindingStatuses)) {
      console.log('statusResponse.blindingStatuses is array:', statusResponse.blindingStatuses)
      return statusResponse.blindingStatuses
    }
    
    if (statusResponse.results && Array.isArray(statusResponse.results)) {
      console.log('statusResponse.results is array:', statusResponse.results)
      return statusResponse.results
    }
    
    console.log('Unknown response structure:', statusResponse)
    return []
  })()

  const studies = (() => {
    if (!studiesResponse) return []
    
    if (Array.isArray(studiesResponse)) {
      return studiesResponse
    }
    
    if (studiesResponse.data && Array.isArray(studiesResponse.data)) {
      return studiesResponse.data
    }
    
    return studiesResponse
  })()

  const stats = (() => {
    if (!statsData) {
      return {
        totalBlindingStatuses: 0,
        activeBlindingStatuses: 0,
        totalStudies: 0,
        recentBlindingStatuses: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed blindingStatuses:', blindingStatuses)
  console.log('Processed studies:', studies)
  console.log('Processed stats:', stats)

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  // Fixed: Changed from toggleBlindingStatusActive to toggleBlindingStatusStatus
  const toggleStatus = async (statusId) => {
    try {
      const result = await executeOperation(() => blindingStatusAPI.toggleBlindingStatusStatus(statusId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Blinding status has been updated successfully",
        })
        refetchStatus()
        refetchStats()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const deleteBlindingStatus = async (statusId) => {
    try {
      const result = await executeOperation(() => blindingStatusAPI.deleteBlindingStatus(statusId))
      if (result) {
        toast({
          title: "Blinding status deleted",
          description: "Blinding status has been deleted successfully",
        })
        setDeletingStatus(null)
        refetchStatus()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting blinding status:', error)
      toast({
        title: "Error",
        description: "Failed to delete blinding status",
        variant: "destructive"
      })
    }
  }

  const addBlindingStatus = async (data) => {
    try {
      const result = await executeOperation(() => blindingStatusAPI.createBlindingStatus(data))
      if (result) {
        toast({
          title: "Blinding status created",
          description: "Blinding status has been created successfully",
        })
        setShowAddDialog(false)
        refetchStatus()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating blinding status:', error)
      toast({
        title: "Error",
        description: "Failed to create blinding status",
        variant: "destructive"
      })
    }
  }

  const updateBlindingStatus = async (data) => {
    if (!editingStatus) return
    try {
      const result = await executeOperation(() => blindingStatusAPI.updateBlindingStatus(editingStatus._id, data))
      if (result) {
        toast({
          title: "Blinding status updated",
          description: "Blinding status has been updated successfully",
        })
        setEditingStatus(null)
        refetchStatus()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating blinding status:', error)
      toast({
        title: "Error",
        description: "Failed to update blinding status",
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

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  // Enhanced error display
  if (statusError) {
    console.error('Blinding status error:', statusError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading blinding statuses:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(statusError)}</p>
          <Button onClick={() => refetchStatus()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Blinding Status Management</h1>
          <p className="text-muted-foreground">Manage blinding statuses and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchStatus()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Blinding Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="statuses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statuses">Blinding Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Blinding Statuses", value: stats.totalBlindingStatuses, icon: <Filter /> },
              { label: "Active Blinding Statuses", value: stats.activeBlindingStatuses, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Blinding Statuses", value: stats.recentBlindingStatuses, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Blinding Statuses" ? "All blinding statuses" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search blinding statuses..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={filters.isActive?.toString() || "all"}
                onValueChange={(value) => handleFilterChange("isActive", value === "all" ? undefined : value === "true")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortBy || "date_created"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blinding_status">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {statusLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : blindingStatuses.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No blinding statuses found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Blinding Status
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blinding Status</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blindingStatuses.map((status, index) => (
                      <TableRow key={status._id || status.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{status.blinding_status || status.name || 'Unnamed Status'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {status.uniqueId || status._id || status.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {status.selectedStudies?.length || status.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(status._id || status.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(status.isActive)} hover:opacity-80`}
                          >
                            {status.isActive ? (
                              <>
                                <ToggleRight className="h-4 w-4 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4 mr-1" />
                                Inactive
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{formatDate(status.date_created || status.createdAt)}</TableCell>
                        <TableCell>{formatDate(status.last_updated || status.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingStatus(status)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingStatus(status)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingStatus(status)}>
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

          {statusResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {blindingStatuses.length} of {statusResponse.total} blinding statuses
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!statusResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!statusResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BlindingStatusDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addBlindingStatus}
        title="Add New Blinding Status"
        loading={operationLoading}
        studies={studies}
      />

      <BlindingStatusDialog
        open={!!editingStatus}
        onOpenChange={(open) => !open && setEditingStatus(null)}
        onSave={updateBlindingStatus}
        blindingStatus={editingStatus}
        title="Edit Blinding Status"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteBlindingStatusDialog
        open={!!deletingStatus}
        onOpenChange={(open) => !open && setDeletingStatus(null)}
        onConfirm={() => deletingStatus && deleteBlindingStatus(deletingStatus._id || deletingStatus.id)}
        blindingStatus={deletingStatus}
        loading={operationLoading}
      />

      <BlindingStatusDetailsDialog
        open={!!viewingStatus}
        onOpenChange={(open) => !open && setViewingStatus(null)}
        blindingStatus={viewingStatus}
        studies={studies}
      />
    </div>
  )
}