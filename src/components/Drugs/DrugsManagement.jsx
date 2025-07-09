// Debug version of DrugsManagement with console logging and error handling

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
import { DrugsDialog } from "./DrugsDialog"
import { DeleteDrugsDialog } from "./DeleteDrugsDialog"
import { DrugsDetailsDialog } from "./DrugsDetailsDialog"
import { drugsAPI } from "../../lib/DrugsAPI"
import { studiesApi } from '../../lib/studies-api.jsx'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function DrugsManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDrug, setEditingDrug] = useState(null)
  const [deletingDrug, setDeletingDrug] = useState(null)
  const [viewingDrug, setViewingDrug] = useState(null)

  const { toast } = useToast()

  // Fixed: Changed from getBlindingStatus to getDrugs
  const {
    data: drugResponse,
    loading: drugLoading,
    error: drugError,
    refetch: refetchDrugs,
  } = useApi(() => drugsAPI.getDrugs(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => drugsAPI.getDrugsStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== DRUGS DEBUG ===')
    console.log('drugResponse:', drugResponse)
    console.log('drugLoading:', drugLoading)
    console.log('drugError:', drugError)
    console.log('filters:', filters)
  }, [drugResponse, drugLoading, drugError, filters])

  // Extract data with better error handling
  const drugs = (() => {
    if (!drugResponse) {
      console.log('No drugResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(drugResponse)) {
      console.log('drugResponse is array:', drugResponse)
      return drugResponse
    }
    
    if (drugResponse.data && Array.isArray(drugResponse.data)) {
      console.log('drugResponse.data is array:', drugResponse.data)
      return drugResponse.data
    }
    
    if (drugResponse.drugs && Array.isArray(drugResponse.drugs)) {
      console.log('drugResponse.drugs is array:', drugResponse.drugs)
      return drugResponse.drugs
    }
    
    if (drugResponse.results && Array.isArray(drugResponse.results)) {
      console.log('drugResponse.results is array:', drugResponse.results)
      return drugResponse.results
    }
    
    console.log('Unknown response structure:', drugResponse)
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
        totalDrugs: 0,
        activeDrugs: 0,
        totalStudies: 0,
        recentDrugs: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed drugs:', drugs)
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

  // Fixed: Changed from toggleBlindingStatusActive to toggleDrugStatus
  const toggleStatus = async (drugId) => {
    try {
      const result = await executeOperation(() => drugsAPI.toggleDrugStatus(drugId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Drug has been updated successfully",
        })
        refetchDrugs()
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

  const deleteDrug = async (drugId) => {
    try {
      const result = await executeOperation(() => drugsAPI.deleteDrug(drugId))
      if (result) {
        toast({
          title: "Drug deleted",
          description: "Drug has been deleted successfully",
        })
        setDeletingDrug(null)
        refetchDrugs()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting drug:', error)
      toast({
        title: "Error",
        description: "Failed to delete drug",
        variant: "destructive"
      })
    }
  }

  const addDrug = async (data) => {
    try {
      const result = await executeOperation(() => drugsAPI.createDrug(data))
      if (result) {
        toast({
          title: "Drug created",
          description: "Drug has been created successfully",
        })
        setShowAddDialog(false)
        refetchDrugs()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating drug:', error)
      toast({
        title: "Error",
        description: "Failed to create drug",
        variant: "destructive"
      })
    }
  }

  const updateDrug = async (data) => {
    if (!editingDrug) return
    try {
      const result = await executeOperation(() => drugsAPI.updateDrug(editingDrug._id, data))
      if (result) {
        toast({
          title: "Drug updated",
          description: "Drug has been updated successfully",
        })
        setEditingDrug(null)
        refetchDrugs()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating drug:', error)
      toast({
        title: "Error",
        description: "Failed to update drug",
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
  if (drugError) {
    console.error('Drug error:', drugError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading drugs:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(drugError)}</p>
          <Button onClick={() => refetchDrugs()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Drugs Management</h1>
          <p className="text-muted-foreground">Manage drugs and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchDrugs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Drug
          </Button>
        </div>
      </div>

      <Tabs defaultValue="drugs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drugs">Drugs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Drugs", value: stats.totalDrugs, icon: <Filter /> },
              { label: "Active Drugs", value: stats.activeDrugs, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Drugs", value: stats.recentDrugs, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Drugs" ? "All drugs" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drugs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search drugs..."
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
                  <SelectItem value="drug_name">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {drugLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : drugs.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No drugs found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Drug
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drug Name</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead>Quantity</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drugs.map((drug, index) => (
                      <TableRow key={drug._id || drug.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{drug.drug_name || drug.name || 'Unnamed Drug'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {drug.uniqueId || drug._id || drug.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {drug.selectedStudies?.length || drug.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        {/* <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(drug._id || drug.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(drug.isActive)} hover:opacity-80`}
                          >
                            {drug.isActive ? (
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
                        </TableCell> */}
                        <TableCell>{drug.quantity}</TableCell>
                        <TableCell>{drug.remaining_quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingDrug(drug)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingDrug(drug)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingDrug(drug)}>
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

          {drugResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {drugs.length} of {drugResponse.total} drugs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!drugResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!drugResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DrugsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addDrug}
        title="Add New Drug"
        loading={operationLoading}
        studies={studies}
      />

      <DrugsDialog
        open={!!editingDrug}
        onOpenChange={(open) => !open && setEditingDrug(null)}
        onSave={updateDrug}
        drugs={editingDrug}
        title="Edit Drug"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteDrugsDialog
        open={!!deletingDrug}
        onOpenChange={(open) => !open && setDeletingDrug(null)}
        onConfirm={() => deletingDrug && deleteDrug(deletingDrug._id || deletingDrug.id)}
        drugs={deletingDrug}
        loading={operationLoading}
      />

      <DrugsDetailsDialog
        open={!!viewingDrug}
        onOpenChange={(open) => !open && setViewingDrug(null)}
        drugs={viewingDrug}
        studies={studies}
      />
    </div>
  )
}