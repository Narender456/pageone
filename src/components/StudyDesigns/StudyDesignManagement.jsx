// Debug version of StudyDesignManagement with console logging and error handling

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
import { StudyDesignDialog } from "./StudyDesignDialog"
import { DeleteStudyDesignDialog } from "./DeleteStudyDesignDialog"
import { StudyDesignDetailsDialog } from "./StudyDesignDetailsDialog"
import { studyDesignsAPI } from "../../lib/StudyDesignsAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function StudyDesignManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDesign, setEditingDesign] = useState(null)
  const [deletingDesign, setDeletingDesign] = useState(null)
  const [viewingDesign, setViewingDesign] = useState(null)

  const { toast } = useToast()

  const {
    data: designsResponse,
    loading: designsLoading,
    error: designsError,
    refetch: refetchDesigns,
  } = useApi(() => studyDesignsAPI.getStudyDesigns(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => studyDesignsAPI.getStudyDesignStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== STUDY DESIGNS DEBUG ===')
    console.log('designsResponse:', designsResponse)
    console.log('designsLoading:', designsLoading)
    console.log('designsError:', designsError)
    console.log('filters:', filters)
  }, [designsResponse, designsLoading, designsError, filters])

  // Extract data with better error handling
  const designs = (() => {
    if (!designsResponse) {
      console.log('No designsResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(designsResponse)) {
      console.log('designsResponse is array:', designsResponse)
      return designsResponse
    }
    
    if (designsResponse.data && Array.isArray(designsResponse.data)) {
      console.log('designsResponse.data is array:', designsResponse.data)
      return designsResponse.data
    }
    
    if (designsResponse.designs && Array.isArray(designsResponse.designs)) {
      console.log('designsResponse.designs is array:', designsResponse.designs)
      return designsResponse.designs
    }
    
    if (designsResponse.results && Array.isArray(designsResponse.results)) {
      console.log('designsResponse.results is array:', designsResponse.results)
      return designsResponse.results
    }
    
    console.log('Unknown response structure:', designsResponse)
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
        totalDesigns: 0,
        activeDesigns: 0,
        totalStudies: 0,
        recentDesigns: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed designs:', designs)
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

  const toggleStatus = async (designId) => {
    try {
      const result = await executeOperation(() => studyDesignsAPI.toggleStudyDesignStatus(designId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Study design status has been updated successfully",
        })
        refetchDesigns()
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

  const deleteDesign = async (designId) => {
    try {
      const result = await executeOperation(() => studyDesignsAPI.deleteStudyDesign(designId))
      if (result) {
        toast({
          title: "Study design deleted",
          description: "Study design has been deleted successfully",
        })
        setDeletingDesign(null)
        refetchDesigns()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting design:', error)
      toast({
        title: "Error",
        description: "Failed to delete study design",
        variant: "destructive"
      })
    }
  }

  const addDesign = async (data) => {
    try {
      const result = await executeOperation(() => studyDesignsAPI.createStudyDesign(data))
      if (result) {
        toast({
          title: "Study design created",
          description: "Study design has been created successfully",
        })
        setShowAddDialog(false)
        refetchDesigns()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating design:', error)
      toast({
        title: "Error",
        description: "Failed to create study design",
        variant: "destructive"
      })
    }
  }

  const updateDesign = async (data) => {
    if (!editingDesign) return
    try {
      const result = await executeOperation(() => studyDesignsAPI.updateStudyDesign(editingDesign._id, data))
      if (result) {
        toast({
          title: "Study design updated",
          description: "Study design has been updated successfully",
        })
        setEditingDesign(null)
        refetchDesigns()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating design:', error)
      toast({
        title: "Error",
        description: "Failed to update study design",
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
  if (designsError) {
    console.error('Designs error:', designsError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading study designs:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(designsError)}</p>
          <Button onClick={() => refetchDesigns()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Study Design Management</h1>
          <p className="text-muted-foreground">Manage study designs and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchDesigns()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Study Design
          </Button>
        </div>
      </div>

      <Tabs defaultValue="designs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="designs">Study Designs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Designs", value: stats.totalDesigns, icon: <Filter /> },
              { label: "Active Designs", value: stats.activeDesigns, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Designs", value: stats.recentDesigns, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Designs" ? "All study designs" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="designs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search study designs..."
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
                  <SelectItem value="study_design">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {designsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : designs.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No study designs found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Study Design
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Study Design</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designs.map((design, index) => (
                      <TableRow key={design._id || design.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{design.study_design || design.name || 'Unnamed Design'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {design.uniqueId || design._id || design.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {design.selectedStudies?.length || design.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(design._id || design.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(design.isActive)} hover:opacity-80`}
                          >
                            {design.isActive ? (
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
                        <TableCell>{formatDate(design.date_created || design.createdAt)}</TableCell>
                        <TableCell>{formatDate(design.last_updated || design.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingDesign(design)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingDesign(design)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingDesign(design)}>
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

          {designsResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {designs.length} of {designsResponse.total} study designs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!designsResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!designsResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudyDesignDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addDesign}
        title="Add New Study Design"
        loading={operationLoading}
        studies={studies}
      />

      <StudyDesignDialog
        open={!!editingDesign}
        onOpenChange={(open) => !open && setEditingDesign(null)}
        onSave={updateDesign}
        studyDesign={editingDesign}
        title="Edit Study Design"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteStudyDesignDialog
        open={!!deletingDesign}
        onOpenChange={(open) => !open && setDeletingDesign(null)}
        onConfirm={() => deletingDesign && deleteDesign(deletingDesign._id || deletingDesign.id)}
        studyDesign={deletingDesign}
        loading={operationLoading}
      />

      <StudyDesignDetailsDialog
        open={!!viewingDesign}
        onOpenChange={(open) => !open && setViewingDesign(null)}
        studyDesign={viewingDesign}
        studies={studies}
      />
    </div>
  )
}