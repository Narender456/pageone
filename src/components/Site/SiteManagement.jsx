// Fixed SiteManagement with improved data handling and site creation display

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
import { SiteDialog } from "./SiteStatusDialog"
import { DeleteSiteDialog } from "./DeleteStatusSiteDialog"
import { SiteDetailsDialog } from "./SiteStatusDetailsDialog"
import { siteAPI } from "../../lib/SiteAPI"
import { studiesApi } from '../../lib/studies-api'
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export function SiteManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt', // instead of 'date_created'
    sortOrder: 'desc'
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSite, setEditingSite] = useState(null)
  const [deletingSite, setDeletingSite] = useState(null)
  const [viewingSite, setViewingSite] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add refresh trigger

  const { toast } = useToast()

  // Modified API call with refresh trigger dependency
  const {
    data: siteResponse,
    loading: siteLoading,
    error: siteError,
    refetch: refetchSite,
  } = useApi(() => {
    console.log('Making API call with filters:', filters)
    try {
      return siteAPI.getSites(filters)
    } catch (error) {
      console.error('Error in siteAPI.getSites:', error)
      throw error
    }
  }, [filters, refreshTrigger]) // Add refreshTrigger to dependencies

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi(() => siteAPI.getSiteStats(), [refreshTrigger]) // Add refreshTrigger here too

  // Fetch available studies for the dialog
  const {
    data: studiesResponse,
    loading: studiesLoading,
  } = useApi(() => studiesApi.getStudies({ limit: 1000 }), [])

  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation()

  // Enhanced debug logging
  useEffect(() => {
    console.log('=== SITE DEBUG ===')
    console.log('siteResponse:', siteResponse)
    console.log('siteLoading:', siteLoading)
    console.log('siteError:', siteError)
    console.log('filters:', filters)
    console.log('refreshTrigger:', refreshTrigger)
    
    if (siteError) {
      console.error('=== ERROR DETAILS ===')
      console.error('Error message:', siteError.message || siteError)
      console.error('Error type:', typeof siteError)
      console.error('Error keys:', Object.keys(siteError))
      console.error('Full error object:', siteError)
    }
  }, [siteResponse, siteLoading, siteError, filters, refreshTrigger])

  // Improved data extraction with fallback handling
  const sites = (() => {
    if (!siteResponse) {
      console.log('No siteResponse')
      return []
    }
    
    console.log('Full siteResponse structure:', JSON.stringify(siteResponse, null, 2))
    
    // Try different possible response structures
    let extractedSites = []
    
    if (Array.isArray(siteResponse)) {
      extractedSites = siteResponse
    } else if (siteResponse.data && Array.isArray(siteResponse.data)) {
      extractedSites = siteResponse.data
    } else if (siteResponse.sites && Array.isArray(siteResponse.sites)) {
      extractedSites = siteResponse.sites
    } else if (siteResponse.results && Array.isArray(siteResponse.results)) {
      extractedSites = siteResponse.results
    } else if (siteResponse.items && Array.isArray(siteResponse.items)) {
      extractedSites = siteResponse.items
    } else if (siteResponse.list && Array.isArray(siteResponse.list)) {
      extractedSites = siteResponse.list
    } else if (siteResponse.response && siteResponse.response.data && Array.isArray(siteResponse.response.data)) {
      extractedSites = siteResponse.response.data
    } else if (typeof siteResponse === 'object' && !Array.isArray(siteResponse) && siteResponse._id) {
      extractedSites = [siteResponse]
    } else {
      // Search for any array property in the response
      for (const key of Object.keys(siteResponse)) {
        if (Array.isArray(siteResponse[key])) {
          console.log(`Found array at key "${key}":`, siteResponse[key])
          extractedSites = siteResponse[key]
          break
        }
      }
    }
    
    console.log('Extracted sites:', extractedSites)
    return extractedSites || []
  })()

  const studies = (() => {
    if (!studiesResponse) return []
    
    if (Array.isArray(studiesResponse)) {
      return studiesResponse
    }
    
    if (studiesResponse.data && Array.isArray(studiesResponse.data)) {
      return studiesResponse.data
    }
    
    return studiesResponse.results || studiesResponse.items || []
  })()

  const stats = (() => {
    if (!statsData) {
      return {
        totalSites: sites.length, // Use actual sites length as fallback
        activeSites: sites.filter(site => site.isActive).length,
        totalStudies: 0,
        recentSites: 0,
      }
    }
    
    if (statsData.data) {
      return statsData.data
    }
    
    return statsData
  })()

  console.log('Processed sites:', sites)
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

  // Enhanced refresh function
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    refetchSite()
    refetchStats()
  }

  const toggleStatus = async (siteId) => {
    try {
      const result = await executeOperation(() => siteAPI.toggleSiteStatus(siteId))
      if (result) {
        toast({
          title: "Status updated",
          description: "Site status has been updated successfully",
        })
        forceRefresh() // Use enhanced refresh
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

  const deleteSite = async (siteId) => {
    try {
      const result = await executeOperation(() => siteAPI.deleteSite(siteId))
      if (result) {
        toast({
          title: "Site deleted",
          description: "Site has been deleted successfully",
        })
        setDeletingSite(null)
        forceRefresh() // Use enhanced refresh
      }
    } catch (error) {
      console.error('Error deleting site:', error)
      toast({
        title: "Error",
        description: "Failed to delete site",
        variant: "destructive"
      })
    }
  }

  const addSite = async (data) => {
    try {
      console.log('Creating site with data:', data)
      const result = await executeOperation(() => siteAPI.createSite(data))
      console.log('Site creation result:', result)
      
      if (result) {
        toast({
          title: "Site created",
          description: "Site has been created successfully",
        })
        setShowAddDialog(false)
        
        // Enhanced refresh with delay to ensure backend has processed
        setTimeout(() => {
          forceRefresh()
        }, 100)
        
        // Also trigger immediate refresh
        forceRefresh()
      }
    } catch (error) {
      console.error('Error creating site:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create site",
        variant: "destructive"
      })
    }
  }

  const updateSite = async (data) => {
    if (!editingSite) return
    try {
      const result = await executeOperation(() => siteAPI.updateSite(editingSite._id, data))
      if (result) {
        toast({
          title: "Site updated",
          description: "Site has been updated successfully",
        })
        setEditingSite(null)
        forceRefresh() // Use enhanced refresh
      }
    } catch (error) {
      console.error('Error updating site:', error)
      toast({
        title: "Error",
        description: "Failed to update site",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground">Manage sites and their associated studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={forceRefresh} disabled={siteLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${siteLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sites" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Sites", value: stats.totalSites, icon: <Filter /> },
              { label: "Active Sites", value: stats.activeSites, icon: <ToggleRight /> },
              { label: "Total Studies", value: stats.totalStudies, icon: <Search /> },
              { label: "Recent Sites", value: stats.recentSites, icon: <Plus /> },
            ].map(({ label, value, icon }, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : value}</div>
                  <p className="text-xs text-muted-foreground">{label === "Total Sites" ? "All sites" : label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search sites..."
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
                  <SelectItem value="siteName">Site Name</SelectItem>
                  <SelectItem value="siteId">Site ID</SelectItem>
                  <SelectItem value="protocolNumber">Protocol Number</SelectItem>
                  <SelectItem value="piName">PI Name</SelectItem>
                  <SelectItem value="date_created">Created Date</SelectItem>
                  <SelectItem value="last_updated">Updated Date</SelectItem>
                  <SelectItem value="studyCount">Study Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {siteLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : siteError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-red-500 mb-4">Error loading sites</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {siteError.message || "Unknown error occurred"}
                    </p>
                    <Button onClick={forceRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : sites.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No sites found</p>
                    {siteResponse && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Response keys: {JSON.stringify(Object.keys(siteResponse), null, 2)}
                      </p>
                    )}
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Site
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Site Name</TableHead>
                        <TableHead className="min-w-[120px]">Site ID</TableHead>
                        <TableHead className="min-w-[140px]">Protocol Number</TableHead>
                        <TableHead className="min-w-[140px]">PI Name</TableHead>
                        <TableHead className="min-w-[120px]">Assigned Studies</TableHead>
                        {/* <TableHead className="min-w-[100px]">Status</TableHead> */}
                        <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sites.map((site, index) => (
                        <TableRow key={site._id || site.id || index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{site.siteName || site.name || 'Unnamed Site'}</div>
                              <div className="text-sm text-muted-foreground">
                                Created:{formatDate(site.createdAt)}

                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {site.siteId || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {site.protocolNumber || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {site.piName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {site.selectedStudies?.length || site.studies?.length || 0} studies
                            </Badge>
                          </TableCell>
                          {/* <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(site._id || site.id)}
                              disabled={operationLoading}
                              className={`${getStatusColor(site.isActive)} hover:opacity-80`}
                            >
                              {site.isActive ? (
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
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => setViewingSite(site)}>
                                View
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingSite(site)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingSite(site)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {siteResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {sites.length} of {siteResponse.total || siteResponse.count || sites.length} sites
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!siteResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!siteResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SiteDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addSite}
        title="Add New Site"
        loading={operationLoading}
        studies={studies}
      />

      <SiteDialog
        open={!!editingSite}
        onOpenChange={(open) => !open && setEditingSite(null)}
        onSave={updateSite}
        site={editingSite}
        title="Edit Site"
        loading={operationLoading}
        studies={studies}
      />

      <DeleteSiteDialog
        open={!!deletingSite}
        onOpenChange={(open) => !open && setDeletingSite(null)}
        onConfirm={() => deletingSite && deleteSite(deletingSite._id || deletingSite.id)}
        site={deletingSite}
        loading={operationLoading}
      />

      <SiteDetailsDialog
        open={!!viewingSite}
        onOpenChange={(open) => !open && setViewingSite(null)}
        site={viewingSite}
        studies={studies}
      />
    </div>
  )
}