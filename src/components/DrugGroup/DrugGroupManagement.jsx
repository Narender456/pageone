// Debug version of DrugGroupManagement with console logging and error handling

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
import { DrugGroupDialog } from "./DrugGroupDialog"
import { DeleteDrugGroupDialog } from "./DeleteDrugGroupDialog"
import { DrugGroupDetailsDialog } from "./DrugGroupDetailsDialog"
import { drugGroupAPI } from "../../lib/DrugGroupAPI"
import { studiesApi } from '../../lib/studies-api'
import { drugsAPI } from '../../lib/DrugsAPI'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function DrugGroupManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDrugGroup, setEditingDrugGroup] = useState(null)
  const [deletingDrugGroup, setDeletingDrugGroup] = useState(null)
  const [viewingDrugGroup, setViewingDrugGroup] = useState(null)

  const { toast } = useToast()

  // Fetch drug groups
  const {
    data: drugGroupResponse,
    loading: drugGroupLoading,
    error: drugGroupError,
    refetch: refetchDrugGroups,
  } = useApi(() => drugGroupAPI.getDrugGroups(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => drugGroupAPI.getDrugGroupStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  // Fetch available drugs for the dialog
  const {
    data: drugsResponse,
    loading: drugsLoading,
  } = useApi(() => drugsAPI.getDrugs({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== DRUG GROUP DEBUG ===')
    console.log('drugGroupResponse:', drugGroupResponse)
    console.log('drugGroupLoading:', drugGroupLoading)
    console.log('drugGroupError:', drugGroupError)
    console.log('filters:', filters)
  }, [drugGroupResponse, drugGroupLoading, drugGroupError, filters])

  // Extract data with better error handling
  const drugGroups = (() => {
    if (!drugGroupResponse) {
      console.log('No drugGroupResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(drugGroupResponse)) {
      console.log('drugGroupResponse is array:', drugGroupResponse)
      return drugGroupResponse
    }
    
    if (drugGroupResponse.data && Array.isArray(drugGroupResponse.data)) {
      console.log('drugGroupResponse.data is array:', drugGroupResponse.data)
      return drugGroupResponse.data
    }
    
    if (drugGroupResponse.drugGroups && Array.isArray(drugGroupResponse.drugGroups)) {
      console.log('drugGroupResponse.drugGroups is array:', drugGroupResponse.drugGroups)
      return drugGroupResponse.drugGroups
    }
    
    if (drugGroupResponse.results && Array.isArray(drugGroupResponse.results)) {
      console.log('drugGroupResponse.results is array:', drugGroupResponse.results)
      return drugGroupResponse.results
    }
    
    console.log('Unknown response structure:', drugGroupResponse)
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

  const drugs = (() => {
    if (!drugsResponse) return []
    
    if (Array.isArray(drugsResponse)) {
      return drugsResponse
    }
    
    if (drugsResponse.data && Array.isArray(drugsResponse.data)) {
      return drugsResponse.data
    }
    
    return drugsResponse
  })()

  const stats = (() => {
    if (!statsData) {
      return {
        totalDrugGroups: 0,
        activeDrugGroups: 0,
        totalStudies: 0,
        totalDrugs: 0,
        recentDrugGroups: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed drugGroups:', drugGroups)
  console.log('Processed studies:', studies)
  console.log('Processed drugs:', drugs)
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

  const toggleStatus = async (drugGroupId) => {
    try {
      const result = await executeOperation(() => drugGroupAPI.toggleDrugGroupStatus(drugGroupId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Drug group status has been updated successfully",
        })
        refetchDrugGroups()
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

  const deleteDrugGroup = async (drugGroupId) => {
    try {
      const result = await executeOperation(() => drugGroupAPI.deleteDrugGroup(drugGroupId))
      if (result) {
        toast({
          title: "Drug group deleted",
          description: "Drug group has been deleted successfully",
        })
        setDeletingDrugGroup(null)
        refetchDrugGroups()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting drug group:', error)
      toast({
        title: "Error",
        description: "Failed to delete drug group",
        variant: "destructive"
      })
    }
  }

  const addDrugGroup = async (data) => {
    try {
      const result = await executeOperation(() => drugGroupAPI.createDrugGroup(data))
      if (result) {
        toast({
          title: "Drug group created",
          description: "Drug group has been created successfully",
        })
        setShowAddDialog(false)
        refetchDrugGroups()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating drug group:', error)
      toast({
        title: "Error",
        description: "Failed to create drug group",
        variant: "destructive"
      })
    }
  }

  const updateDrugGroup = async (data) => {
    if (!editingDrugGroup) return
    try {
      const result = await executeOperation(() => drugGroupAPI.updateDrugGroup(editingDrugGroup._id, data))
      if (result) {
        toast({
          title: "Drug group updated",
          description: "Drug group has been updated successfully",
        })
        setEditingDrugGroup(null)
        refetchDrugGroups()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating drug group:', error)
      toast({
        title: "Error",
        description: "Failed to update drug group",
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
  if (drugGroupError) {
    console.error('Drug group error:', drugGroupError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading drug groups:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(drugGroupError)}</p>
          <Button onClick={() => refetchDrugGroups()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Drug Group Management</h1>
          <p className="text-muted-foreground">Manage drug groups and their associated studies and drugs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchDrugGroups()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Drug Group
          </Button>
        </div>
      </div>

      <Tabs defaultValue="druggroups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="druggroups">Drug Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total Drug Groups", value: stats.totalDrugGroups, icon: <Filter /> },
              { label: "Active Drug Groups", value: stats.activeDrugGroups, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Total Drugs", value: stats.totalDrugs, icon: <Plus /> },
              { label: "Recent Drug Groups", value: stats.recentDrugGroups, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Drug Groups" ? "All drug groups" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="druggroups" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search drug groups..."
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
                  <SelectItem value="group_name">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                  <SelectItem value="drugCount">Drug Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {drugGroupLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : drugGroups.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No drug groups found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Drug Group
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drug Group Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Assigned Drugs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drugGroups.map((drugGroup, index) => (
                      <TableRow key={drugGroup._id || drugGroup.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{drugGroup.group_name || drugGroup.name || 'Unnamed Group'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {drugGroup.uniqueId || drugGroup._id || drugGroup.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {drugGroup.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {drugGroup.selectedStudies?.length || drugGroup.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {drugGroup.selectedDrugs?.length || drugGroup.drugs?.length || 0} drugs
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(drugGroup._id || drugGroup.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(drugGroup.isActive)} hover:opacity-80`}
                          >
                            {drugGroup.isActive ? (
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
                        <TableCell>{formatDate(drugGroup.date_created || drugGroup.createdAt)}</TableCell>
                        <TableCell>{formatDate(drugGroup.last_updated || drugGroup.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingDrugGroup(drugGroup)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingDrugGroup(drugGroup)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingDrugGroup(drugGroup)}>
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

          {drugGroupResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {drugGroups.length} of {drugGroupResponse.total} drug groups
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!drugGroupResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!drugGroupResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DrugGroupDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addDrugGroup}
        title="Add New Drug Group"
        loading={operationLoading}
        studies={studies}
        drugs={drugs}
      />

      <DrugGroupDialog
        open={!!editingDrugGroup}
        onOpenChange={(open) => !open && setEditingDrugGroup(null)}
        onSave={updateDrugGroup}
        drugGroup={editingDrugGroup}
        title="Edit Drug Group"
        loading={operationLoading}
        studies={studies}
        drugs={drugs}
      />

      <DeleteDrugGroupDialog
        open={!!deletingDrugGroup}
        onOpenChange={(open) => !open && setDeletingDrugGroup(null)}
        onConfirm={() => deletingDrugGroup && deleteDrugGroup(deletingDrugGroup._id || deletingDrugGroup.id)}
        drugGroup={deletingDrugGroup}
        loading={operationLoading}
      />

      <DrugGroupDetailsDialog
        open={!!viewingDrugGroup}
        onOpenChange={(open) => !open && setViewingDrugGroup(null)}
        drugGroup={viewingDrugGroup}
        studies={studies}
        drugs={drugs}
      />
    </div>
  )
}