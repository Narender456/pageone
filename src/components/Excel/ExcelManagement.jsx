// Debug version of ExcelManagement with console logging and error handling

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
import { ExcelDialog } from "./ExcelDialog"
import { DeleteExcelDialog } from "./DeleteExcelDialog"
import { ExcelDetailsDialog } from "./ExcelDetailsDialog"
import { excelAPI } from "../../lib/ExcelAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function ExcelManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingExcel, setEditingExcel] = useState(null)
  const [deletingExcel, setDeletingExcel] = useState(null)
  const [viewingExcel, setViewingExcel] = useState(null)

  const { toast } = useToast()

  // Fixed: Changed from getExcel to getExcels
  const {
    data: excelResponse,
    loading: excelLoading,
    error: excelError,
    refetch: refetchExcel,
  } = useApi(() => excelAPI.getExcels(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => excelAPI.getExcelStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== EXCEL DEBUG ===')
    console.log('excelResponse:', excelResponse)
    console.log('excelLoading:', excelLoading)
    console.log('excelError:', excelError)
    console.log('filters:', filters)
  }, [excelResponse, excelLoading, excelError, filters])

  // Extract data with better error handling
  const excels = (() => {
    if (!excelResponse) {
      console.log('No excelResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(excelResponse)) {
      console.log('excelResponse is array:', excelResponse)
      return excelResponse
    }
    
    if (excelResponse.data && Array.isArray(excelResponse.data)) {
      console.log('excelResponse.data is array:', excelResponse.data)
      return excelResponse.data
    }
    
    if (excelResponse.excels && Array.isArray(excelResponse.excels)) {
      console.log('excelResponse.excels is array:', excelResponse.excels)
      return excelResponse.excels
    }
    
    if (excelResponse.results && Array.isArray(excelResponse.results)) {
      console.log('excelResponse.results is array:', excelResponse.results)
      return excelResponse.results
    }
    
    console.log('Unknown response structure:', excelResponse)
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
        totalExcels: 0,
        activeExcels: 0,
        totalStudies: 0,
        recentExcels: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed excels:', excels)
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

  // Fixed: Changed from toggleExcelActive to toggleExcelStatus
  const toggleStatus = async (excelId) => {
    try {
      const result = await executeOperation(() => excelAPI.toggleExcelStatus(excelId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Excel has been updated successfully",
        })
        refetchExcel()
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

  const deleteExcel = async (excelId) => {
    try {
      const result = await executeOperation(() => excelAPI.deleteExcel(excelId))
      if (result) {
        toast({
          title: "Excel deleted",
          description: "Excel has been deleted successfully",
        })
        setDeletingExcel(null)
        refetchExcel()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting excel:', error)
      toast({
        title: "Error",
        description: "Failed to delete excel",
        variant: "destructive"
      })
    }
  }

  const addExcel = async (data) => {
    try {
      const result = await executeOperation(() => excelAPI.createExcel(data))
      if (result) {
        toast({
          title: "Excel created",
          description: "Excel has been created successfully",
        })
        setShowAddDialog(false)
        refetchExcel()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating excel:', error)
      toast({
        title: "Error",
        description: "Failed to create excel",
        variant: "destructive"
      })
    }
  }

  const updateExcel = async (data) => {
    if (!editingExcel) return
    try {
      const result = await executeOperation(() => excelAPI.updateExcel(editingExcel._id, data))
      if (result) {
        toast({
          title: "Excel updated",
          description: "Excel has been updated successfully",
        })
        setEditingExcel(null)
        refetchExcel()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating excel:', error)
      toast({
        title: "Error",
        description: "Failed to update excel",
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
  if (excelError) {
    console.error('Excel error:', excelError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading excels:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(excelError)}</p>
          <Button onClick={() => refetchExcel()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Excel Management</h1>
          <p className="text-muted-foreground">Manage excels and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchExcel()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="excels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="excels">Excels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Excels", value: stats.totalExcels, icon: <Filter /> },
              { label: "Active Excels", value: stats.activeExcels, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Excels", value: stats.recentExcels, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Excels" ? "All excels" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="excels" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search excels..."
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
                  <SelectItem value="excel_name">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {excelLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : excels.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No excels found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Excel
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Excel Name</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excels.map((excel, index) => (
                      <TableRow key={excel._id || excel.id || index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{excel.excel_name || excel.name || 'Unnamed Excel'}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {excel.uniqueId || excel._id || excel.id || 'N/A'}
                      </div>
                      {/* Add file information */}
                      {excel.file && (
                        <div className="text-xs text-muted-foreground mt-1">
                          File: {typeof excel.file === 'string' ? excel.file.split('/').pop() : 'Attached'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {/* Handle different study field names with better fallback */}
                          {excel.selectedStudies?.length || excel.Studies?.length || excel.studies?.length || 0} studies
                        </Badge>
                        {/* Show study names if available with improved property access */}
                        {(excel.selectedStudies || excel.Studies || excel.studies) && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {(excel.selectedStudies || excel.Studies || excel.studies).slice(0, 2).map(study => 
                              typeof study === 'object' ? (study.study_name || study.name || 'Unknown') : study
                            ).join(', ')}
                            {(excel.selectedStudies || excel.Studies || excel.studies).length > 2 && '...'}
                          </div>
                        )}
                      </TableCell>
                        <TableCell>{formatDate(excel.date_created || excel.createdAt)}</TableCell>
                        <TableCell>{formatDate(excel.last_updated || excel.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingExcel(excel)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingExcel(excel)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingExcel(excel)}>
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

          {excelResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {excels.length} of {excelResponse.total} excels
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!excelResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!excelResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ExcelDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addExcel}
        title="Add New Excel"
        loading={operationLoading}
        studies={studies}
      />

      <ExcelDialog
        open={!!editingExcel}
        onOpenChange={(open) => !open && setEditingExcel(null)}
        onSave={updateExcel}
        excel={editingExcel}
        title="Edit Excel"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteExcelDialog
        open={!!deletingExcel}
        onOpenChange={(open) => !open && setDeletingExcel(null)}
        onConfirm={() => deletingExcel && deleteExcel(deletingExcel._id || deletingExcel.id)}
        excel={deletingExcel}
        loading={operationLoading}
      />

      <ExcelDetailsDialog
        open={!!viewingExcel}
        onOpenChange={(open) => !open && setViewingExcel(null)}
        excel={viewingExcel}
        studies={studies}
      />
    </div>
  )
}