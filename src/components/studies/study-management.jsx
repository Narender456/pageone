"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "../ui/buttons"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { useToast } from "../../hooks/use-toast"
import { studiesApi } from "../../lib/studies-api"
import { StudyDialog } from "./study-dialog"
import { DeleteStudyDialog } from "./delete-study-dialog"
import { StudyDetailsDialog } from "./study-details-dialog"
import { format } from "date-fns"

export function StudyManagement() {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [selectedStudy, setSelectedStudy] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const { toast } = useToast()

const fetchStudies = async () => {
  try {
    setLoading(true)
    const response = await studiesApi.getStudies(filters)
    
    // Check if response is directly an array (based on your console output)
    if (Array.isArray(response)) {
      setStudies(response)
      // Set default pagination since API doesn't seem to return pagination info
      setPagination({
        page: 1,
        limit: 10,
        total: response.length,
        pages: Math.ceil(response.length / 10),
      })
    } 
    // Fallback: check if response has data property with array
    else if (response && response.data && Array.isArray(response.data)) {
      setStudies(response.data)
      if (response.pagination) {
        setPagination(response.pagination)
      } else {
        setPagination({
          page: 1,
          limit: 10,
          total: response.data.length,
          pages: Math.ceil(response.data.length / 10),
        })
      }
    } 
    // Handle unexpected response structure
    else {
      console.warn("Unexpected API response structure:", response)
      setStudies([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      })
    }
  } catch (error) {
    console.error("Failed to fetch studies:", error)
    setStudies([])
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    })
    toast({
      title: "Error",
      description: error.message || "Failed to fetch studies",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    fetchStudies()
  }, [filters])

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleCreateStudy = () => {
    setSelectedStudy(null)
    setDialogOpen(true)
  }

  const handleEditStudy = (study) => {
    setSelectedStudy(study)
    setDialogOpen(true)
  }

  const handleDeleteStudy = (study) => {
    setSelectedStudy(study)
    setDeleteDialogOpen(true)
  }

  const handleViewStudy = (study) => {
    setSelectedStudy(study)
    setDetailsDialogOpen(true)
  }

  const handleStudyCreated = () => {
    fetchStudies()
    setDialogOpen(false)
    toast({
      title: "Success",
      description: "Study created successfully",
    })
  }

  const handleStudyUpdated = () => {
    fetchStudies()
    setDialogOpen(false)
    toast({
      title: "Success",
      description: "Study updated successfully",
    })
  }

  const handleStudyDeleted = () => {
    fetchStudies()
    setDeleteDialogOpen(false)
    toast({
      title: "Success",
      description: "Study deleted successfully",
    })
  }

  const getStudyStatus = (study) => {
    const now = new Date()
    const startDate = new Date(study.study_start_date)
    const endDate = study.study_end_date ? new Date(study.study_end_date) : null

    if (endDate && endDate < now) {
      return { label: "Completed", variant: "secondary" }
    } else if (startDate <= now) {
      return { label: "Active", variant: "default" }
    } else {
      return { label: "Upcoming", variant: "outline" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Studies</h1>
          <p className="text-muted-foreground">Manage clinical studies and research protocols</p>
        </div>
        <Button onClick={handleCreateStudy}>
          <Plus className="mr-2 h-4 w-4" />
          Add Study
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search studies..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              placeholder="Start Date From"
              value={filters.start_date || ""}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start Date To"
              value={filters.end_date || ""}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Studies ({pagination.total})</CardTitle>
          <CardDescription>A list of all clinical studies in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Study Name</TableHead>
                    <TableHead>Protocol Number</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Add additional safety check here */}
                  {Array.isArray(studies) && studies.length > 0 ? (
                    studies.map((study) => {
                      const status = getStudyStatus(study)
                      return (
                        <TableRow key={study._id}>
                          <TableCell className="font-medium">{study.study_name}</TableCell>
                          <TableCell>{study.protocol_number}</TableCell>
                          {/* <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell> */}
                          <TableCell>{format(new Date(study.study_start_date), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            {study.study_end_date ? format(new Date(study.study_end_date), "MMM dd, yyyy") : "Ongoing"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewStudy(study)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditStudy(study)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteStudy(study)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No studies found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <StudyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        study={selectedStudy}
        onStudyCreated={handleStudyCreated}
        onStudyUpdated={handleStudyUpdated}
      />

      <DeleteStudyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        study={selectedStudy}
        onStudyDeleted={handleStudyDeleted}
      />

      <StudyDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        study={selectedStudy}
      />
    </div>
  )
}