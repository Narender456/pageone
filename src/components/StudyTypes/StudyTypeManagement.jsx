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
import { Button } from "../ui/buttons"  // Fixed import path
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { StudyTypeDialog } from "./StudyTypeDialog"
import { DeleteStudyTypeDialog } from "./DeleteStudyTypeDialog"
import { StudyTypeDetailsDialog } from "./StudyTypeDetailsDialog"
import { studyTypeAPI } from "../../lib/StudyTypeAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function StudyTypeManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [deletingType, setDeletingType] = useState(null)
  const [viewingType, setViewingType] = useState(null)

  const { toast } = useToast()

  const {
    data: typesResponse,
    loading: typesLoading,
    error: typesError,
    refetch: refetchTypes,
  } = useApi(() => studyTypeAPI.getStudytype(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => studyTypeAPI.getStudytypetats(), [])

  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  const types = Array.isArray(typesResponse?.data) ? typesResponse.data : typesResponse || []
  const studies = Array.isArray(studiesResponse?.data) ? studiesResponse.data : studiesResponse || []
  
  // Calculate stats with fallback logic
  const calculateStats = () => {
    const baseStats = statsData?.data || statsData || {}
    
    return {
      totalTypes: baseStats.totalTypes || types.length || 0,
      activeTypes: baseStats.activeTypes || types.filter(type => type.isActive).length || 0,
      totalStudies: baseStats.totalStudies || studies.length || 0,
      recentTypes: baseStats.recentTypes || 0,
    }
  }

  const stats = calculateStats()

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const toggleStatus = async (typeId) => {
    try {
      const result = await executeOperation(() => studyTypeAPI.toggleStudytypetatus(typeId))
      if (result) {
        toast({ title: "Status updated", description: "Study type status updated successfully" })
        refetchTypes()
        refetchStats()
      }
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const deleteType = async (typeId) => {
    try {
      await executeOperation(() => studyTypeAPI.deleteStudyType(typeId))
      toast({ title: "Deleted", description: "Study type deleted successfully" })
      setDeletingType(null)
      refetchTypes()
      refetchStats()
    } catch {
      toast({ title: "Error", description: "Failed to delete study type", variant: "destructive" })
    }
  }

  const addType = async (data) => {
    try {
      console.log('Creating study type with data:', data)
      
      // Try with minimal data first for debugging
      const debugPayload = {
        study_type: data.study_type,
        isActive: data.isActive,
        studies: [] // Empty array for testing
      }
      
      console.log('Debug payload (empty studies):', debugPayload)
      
      const result = await executeOperation(() => studyTypeAPI.createStudyType(data))
      console.log('Study type created successfully:', result)
      toast({ title: "Created", description: "Study type created successfully" })
      setShowAddDialog(false)
      refetchTypes()
      refetchStats()
    } catch (error) {
      console.error('Error creating study type:', error)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      console.error('Error response:', error?.response?.data)
      
      // Extract detailed error information
      let errorMessage = "Failed to create study type"
      let detailedErrors = []
      
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        detailedErrors = error.response.data.errors.map(err => {
          if (typeof err === 'object' && err.message) {
            return `${err.field || 'Field'}: ${err.message}`
          }
          return err.toString()
        })
        errorMessage = detailedErrors.join(', ')
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      console.log('Detailed errors:', detailedErrors)
      
      toast({ 
        title: "Validation Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  const updateType = async (data) => {
    if (!editingType) return
    try {
      console.log('Updating study type with data:', data)
      await executeOperation(() => studyTypeAPI.updateStudyType(editingType._id, data))
      toast({ title: "Updated", description: "Study type updated successfully" })
      setEditingType(null)
      refetchTypes()
      refetchStats()
    } catch (error) {
      console.error('Error updating study type:', error)
      toast({ 
        title: "Error", 
        description: error?.response?.data?.message || "Failed to update study type", 
        variant: "destructive" 
      })
    }
  }

  const formatDate = (d) => {
    if (!d) return "N/A"
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Type Management</h1>
          <p className="text-muted-foreground">Manage study types and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchTypes()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Study Type
          </Button>
        </div>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="types">Study Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Types", value: stats.totalTypes, icon: <Filter /> },
              { label: "Active Types", value: stats.activeTypes, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Types", value: stats.recentTypes, icon: <Plus /> },
            ].map(({ label, value, icon }, i) => (
              <Card key={i}>
                <CardHeader className="flex justify-between">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading || studiesLoading ? "..." : value}
                  </div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardContent className="p-0">
              {typesLoading ? (
                <div className="h-64 flex items-center justify-center">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Study Type</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.map((type, index) => (
                      <TableRow key={type._id || type.id || index}>
                        <TableCell>
                          <div className="font-medium">{type.study_type}</div>
                          <div className="text-sm text-muted-foreground">ID: {type._id || type.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge>{type.studies?.length || 0} studies</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(type._id || type.id)}>
                            {type.isActive ? (
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
                        <TableCell>{formatDate(type.createdAt)}</TableCell>
                        <TableCell>{formatDate(type.updatedAt)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" onClick={() => setViewingType(type)}>View</Button>
                          <Button size="sm" onClick={() => setEditingType(type)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => setDeletingType(type)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudyTypeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addType}
        title="Add New Study Type"
        loading={operationLoading}
        studies={studies}
      />
      <StudyTypeDialog
        open={!!editingType}
        onOpenChange={(open) => !open && setEditingType(null)}
        onSave={updateType}
        studyType={editingType} // Fixed prop name from studyPhase to studyType
        title="Edit Study Type"
        loading={operationLoading}
        studies={studies}
      />
      <DeleteStudyTypeDialog
        open={!!deletingType}
        onOpenChange={(open) => !open && setDeletingType(null)}
        onConfirm={() => deletingType && deleteType(deletingType._id || deletingType.id)}
        studyType={deletingType} // Fixed prop name
        loading={operationLoading}
      />
      <StudyTypeDetailsDialog
        open={!!viewingType}
        onOpenChange={(open) => !open && setViewingType(null)}
        studyType={viewingType} // Fixed prop name
        studies={studies}
      />
    </div>
  )
}