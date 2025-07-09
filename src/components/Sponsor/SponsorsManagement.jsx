// Debug version of SponsorsManagement with console logging and error handling

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
import { SponsorDialog } from "./SponsorDialog"
import { DeleteSponsorDialog } from "./DeleteSponsorDialog"
import { SponsorDetailsDialog } from "./SponsorDetailsDialog"
import { sponsorsAPI } from "../../lib/SponsorsAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function SponsorsManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "date_created",
    sortOrder: "desc",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState(null)
  const [deletingSponsor, setDeletingSponsor] = useState(null)
  const [viewingSponsor, setViewingSponsor] = useState(null)

  const { toast } = useToast()

  // Fixed: Changed from getBlindingStatus to getSponsors
  const {
    data: sponsorResponse,
    loading: sponsorLoading,
    error: sponsorError,
    refetch: refetchSponsor,
  } = useApi(() => sponsorsAPI.getSponsors(filters), [filters])

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => sponsorsAPI.getSponsorStats(), [])

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Debug logging
  useEffect(() => {
    console.log('=== SPONSORS DEBUG ===')
    console.log('sponsorResponse:', sponsorResponse)
    console.log('sponsorLoading:', sponsorLoading)
    console.log('sponsorError:', sponsorError)
    console.log('filters:', filters)
  }, [sponsorResponse, sponsorLoading, sponsorError, filters])

  // Extract data with better error handling
  const sponsors = (() => {
    if (!sponsorResponse) {
      console.log('No sponsorResponse')
      return []
    }
    
    // Check different possible response structures
    if (Array.isArray(sponsorResponse)) {
      console.log('sponsorResponse is array:', sponsorResponse)
      return sponsorResponse
    }
    
    if (sponsorResponse.data && Array.isArray(sponsorResponse.data)) {
      console.log('sponsorResponse.data is array:', sponsorResponse.data)
      return sponsorResponse.data
    }
    
    if (sponsorResponse.sponsors && Array.isArray(sponsorResponse.sponsors)) {
      console.log('sponsorResponse.sponsors is array:', sponsorResponse.sponsors)
      return sponsorResponse.sponsors
    }
    
    if (sponsorResponse.results && Array.isArray(sponsorResponse.results)) {
      console.log('sponsorResponse.results is array:', sponsorResponse.results)
      return sponsorResponse.results
    }
    
    console.log('Unknown response structure:', sponsorResponse)
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
        totalSponsors: 0,
        activeSponsors: 0,
        totalStudies: 0,
        recentSponsors: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed sponsors:', sponsors)
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

  // Fixed: Changed from toggleBlindingStatusActive to toggleSponsorStatus
  const toggleStatus = async (sponsorId) => {
    try {
      const result = await executeOperation(() => sponsorsAPI.toggleSponsorStatus(sponsorId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Sponsor status has been updated successfully",
        })
        refetchSponsor()
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

  const deleteSponsor = async (sponsorId) => {
    try {
      const result = await executeOperation(() => sponsorsAPI.deleteSponsor(sponsorId))
      if (result) {
        toast({
          title: "Sponsor deleted",
          description: "Sponsor has been deleted successfully",
        })
        setDeletingSponsor(null)
        refetchSponsor()
        refetchStats()
      }
    } catch (error) {
      console.error('Error deleting sponsor:', error)
      toast({
        title: "Error",
        description: "Failed to delete sponsor",
        variant: "destructive"
      })
    }
  }

  const addSponsor = async (data) => {
    try {
      const result = await executeOperation(() => sponsorsAPI.createSponsor(data))
      if (result) {
        toast({
          title: "Sponsor created",
          description: "Sponsor has been created successfully",
        })
        setShowAddDialog(false)
        refetchSponsor()
        refetchStats()
      }
    } catch (error) {
      console.error('Error creating sponsor:', error)
      toast({
        title: "Error",
        description: "Failed to create sponsor",
        variant: "destructive"
      })
    }
  }

  const updateSponsor = async (data) => {
    if (!editingSponsor) return
    try {
      const result = await executeOperation(() => sponsorsAPI.updateSponsor(editingSponsor._id, data))
      if (result) {
        toast({
          title: "Sponsor updated",
          description: "Sponsor has been updated successfully",
        })
        setEditingSponsor(null)
        refetchSponsor()
        refetchStats()
      }
    } catch (error) {
      console.error('Error updating sponsor:', error)
      toast({
        title: "Error",
        description: "Failed to update sponsor",
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
  if (sponsorError) {
    console.error('Sponsor error:', sponsorError)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading sponsors:</p>
          <p className="text-sm text-muted-foreground mb-4">{String(sponsorError)}</p>
          <Button onClick={() => refetchSponsor()}>
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
          <h1 className="text-3xl font-bold tracking-tight">Sponsors Management</h1>
          <p className="text-muted-foreground">Manage sponsors and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchSponsor()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sponsors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Sponsors", value: stats.totalSponsors, icon: <Filter /> },
              { label: "Active Sponsors", value: stats.activeSponsors, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Sponsors", value: stats.recentSponsors, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Sponsors" ? "All sponsors" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search sponsors..."
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
                  <SelectItem value="sponsor_name">Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {sponsorLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : sponsors.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No sponsors found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Sponsor
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sponsor Name</TableHead>
                      <TableHead>Assigned Studies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((sponsor, index) => (
                      <TableRow key={sponsor._id || sponsor.id || index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sponsor.sponsor_name || sponsor.name || 'Unnamed Sponsor'}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {sponsor.uniqueId || sponsor._id || sponsor.id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {sponsor.selectedStudies?.length || sponsor.studies?.length || 0} studies
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(sponsor._id || sponsor.id)}
                            disabled={operationLoading}
                            className={`${getStatusColor(sponsor.isActive)} hover:opacity-80`}
                          >
                            {sponsor.isActive ? (
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
                        <TableCell>{formatDate(sponsor.date_created || sponsor.createdAt)}</TableCell>
                        <TableCell>{formatDate(sponsor.last_updated || sponsor.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingSponsor(sponsor)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingSponsor(sponsor)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingSponsor(sponsor)}>
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

          {sponsorResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {sponsors.length} of {sponsorResponse.total} sponsors
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!sponsorResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!sponsorResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SponsorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addSponsor}
        title="Add New Sponsor"
        loading={operationLoading}
        studies={studies}
      />

      <SponsorDialog
        open={!!editingSponsor}
        onOpenChange={(open) => !open && setEditingSponsor(null)}
        onSave={updateSponsor}
        sponsor={editingSponsor}
        title="Edit Sponsor"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteSponsorDialog
        open={!!deletingSponsor}
        onOpenChange={(open) => !open && setDeletingSponsor(null)}
        onConfirm={() => deletingSponsor && deleteSponsor(deletingSponsor._id || deletingSponsor.id)}
        sponsor={deletingSponsor}
        loading={operationLoading}
      />

      <SponsorDetailsDialog
        open={!!viewingSponsor}
        onOpenChange={(open) => !open && setViewingSponsor(null)}
        sponsor={viewingSponsor}
        studies={studies}
      />
    </div>
  )
}