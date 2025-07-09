// Debug version of StudyPhaseManagement with console logging and error handling

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
import { StudyPhaseDialog } from "./study-phase-dialog"
import { DeleteStudyPhaseDialog } from "./delete-study-phase-dialog"
import { StudyPhaseDetailsDialog } from "./study-phase-details-dialog"
import { studyPhasesAPI } from "../../lib/study-phases-api"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function StudyPhaseManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPhase, setEditingPhase] = useState(null)
  const [deletingPhase, setDeletingPhase] = useState(null)
  const [viewingPhase, setViewingPhase] = useState(null)

  const { toast } = useToast()

  const {
    data: phasesResponse,
    loading: phasesLoading,
    error: phasesError,
    refetch: refetchPhases,
  } = useApi(() => studyPhasesAPI.getStudyPhases(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => studyPhasesAPI.getStudyPhaseStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== STUDY PHASES DEBUG ===')
    console.log('phasesResponse:', phasesResponse)
    console.log('phasesLoading:', phasesLoading)
    console.log('phasesError:', phasesError)
    console.log('filters:', filters)
  }, [phasesResponse, phasesLoading, phasesError, filters])

  // Extract data with better error handling
  const phases = (() => {
    if (!phasesResponse) {
      console.log('No phasesResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(phasesResponse)) {
      console.log('phasesResponse is array:', phasesResponse)
      return phasesResponse
    }
    
    if (phasesResponse.data && Array.isArray(phasesResponse.data)) {
      console.log('phasesResponse.data is array:', phasesResponse.data)
      return phasesResponse.data
    }
    
    if (phasesResponse.phases && Array.isArray(phasesResponse.phases)) {
      console.log('phasesResponse.phases is array:', phasesResponse.phases)
      return phasesResponse.phases
    }
    
    if (phasesResponse.results && Array.isArray(phasesResponse.results)) {
      console.log('phasesResponse.results is array:', phasesResponse.results)
      return phasesResponse.results
    }
    
    console.log('Unknown response structure:', phasesResponse)
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
        totalPhases: 0,
        activePhases: 0,
        totalStudies: 0,
        recentPhases: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed phases:', phases)
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

  const toggleStatus = async (phaseId) => {
    try {
      const result = await executeOperation(() => studyPhasesAPI.toggleStudyPhaseStatus(phaseId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Study phase status has been updated successfully",
        })
        refetchPhases()
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

  const deletePhase = async (phaseId) => {
    try {
      const result = await executeOperation(() => studyPhasesAPI.deleteStudyPhase(phaseId))
      if (result) {
        toast({
          title: "Study phase deleted",
          description: "Study phase has been deleted successfully",
        })
        setDeletingPhase(null)
        refetchPhases()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting phase:', error)
      toast({
        title: "Error",
        description: "Failed to delete study phase",
        variant: "destructive"
      })
    }
  }

  const addPhase = async (data) => {
    try {
      const result = await executeOperation(() => studyPhasesAPI.createStudyPhase(data))
      if (result) {
        toast({
          title: "Study phase created",
          description: "Study phase has been created successfully",
        })
        setShowAddDialog(false)
        refetchPhases()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating phase:', error)
      toast({
        title: "Error",
        description: "Failed to create study phase",
        variant: "destructive"
      })
    }
  }

  const updatePhase = async (data) => {
    if (!editingPhase) return
    try {
      const result = await executeOperation(() => studyPhasesAPI.updateStudyPhase(editingPhase._id, data))
      if (result) {
        toast({
          title: "Study phase updated",
          description: "Study phase has been updated successfully",
        })
        setEditingPhase(null)
        refetchPhases()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating phase:', error)
      toast({
        title: "Error",
        description: "Failed to update study phase",
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
  if (phasesError) {
    console.error('Phases error:', phasesError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading study phases:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(phasesError)}</p>
          <Button onClick={() => refetchPhases()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Study Phase Management</h1>
          <p className="text-muted-foreground">Manage study phases and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPhases()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Study Phase
          </Button>
        </div>
      </div>

      <Tabs defaultValue="phases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Study Phases</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Phases", value: stats.totalPhases, icon: <Filter /> },
              { label: "Active Phases", value: stats.activePhases, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Phases", value: stats.recentPhases, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Phases" ? "All study phases" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="phases" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search study phases..."
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
                  <SelectItem value="study_phase">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {phasesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : phases.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No study phases found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Study Phase
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Study Phase</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map((phase, index) => (
                      <TableRow key={phase._id || phase.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{phase.study_phase || phase.name || 'Unnamed Phase'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {phase.uniqueId || phase._id || phase.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {phase.selectedStudies?.length || phase.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(phase._id || phase.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(phase.isActive)} hover:opacity-80`}
                          >
                            {phase.isActive ? (
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
                        <TableCell>{formatDate(phase.date_created || phase.createdAt)}</TableCell>
                        <TableCell>{formatDate(phase.last_updated || phase.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingPhase(phase)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingPhase(phase)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingPhase(phase)}>
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

          {phasesResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {phases.length} of {phasesResponse.total} study phases
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!phasesResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!phasesResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudyPhaseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addPhase}
        title="Add New Study Phase"
        loading={operationLoading}
        studies={studies}
      />

      <StudyPhaseDialog
        open={!!editingPhase}
        onOpenChange={(open) => !open && setEditingPhase(null)}
        onSave={updatePhase}
        studyPhase={editingPhase}
        title="Edit Study Phase"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteStudyPhaseDialog
        open={!!deletingPhase}
        onOpenChange={(open) => !open && setDeletingPhase(null)}
        onConfirm={() => deletingPhase && deletePhase(deletingPhase._id || deletingPhase.id)}
        studyPhase={deletingPhase}
        loading={operationLoading}
      />

      <StudyPhaseDetailsDialog
        open={!!viewingPhase}
        onOpenChange={(open) => !open && setViewingPhase(null)}
        studyPhase={viewingPhase}
        studies={studies}
      />
    </div>
  )
}