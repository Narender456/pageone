"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Users, Shield, Settings } from "lucide-react"
import { Button } from "../ui/buttons"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Skeleton } from "../ui/skeleton"
import { useToast } from "../../hooks/use-toast"
import { rolesApi } from "../../lib/roles-api"
import { RoleDialog } from "./role-dialog"
import { DeleteRoleDialog } from "./delete-role-dialog"
import { AssignUsersDialog } from "./assign-users-dialog"
import { PermissionsDialog } from "./permissions-dialog"

export function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedRole, setSelectedRole] = useState(null)
  const [dialogType, setDialogType] = useState(null)
  const { toast } = useToast()

const fetchRoles = async () => {
  try {
    setLoading(true)
    console.log("Fetching roles...") // Debug log
    
    const response = await rolesApi.getRoles({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      sortBy: "createdAt",
      sortOrder: "desc",
    })

    console.log("API Response:", response) // Debug log

    // Check if response is directly an array (your current API format)
    if (Array.isArray(response)) {
      console.log("Response is direct array:", response) // Debug log
      setRoles(response)
      setTotalPages(1) // Since we don't have pagination info, assume single page
      setTotalItems(response.length)
    } 
    // Check if response has success property (expected format)
    else if (response && response.success) {
      const rolesData = response.data || response.roles || []
      const pagination = response.pagination || {}
      
      console.log("Roles data:", rolesData) // Debug log
      
      setRoles(Array.isArray(rolesData) ? rolesData : [])
      setTotalPages(pagination.totalPages || 1)
      setTotalItems(pagination.totalItems || rolesData.length || 0)
    }
    // Check if response has a data property without success
    else if (response && response.data) {
      console.log("Response has data property:", response.data) // Debug log
      const rolesData = response.data
      setRoles(Array.isArray(rolesData) ? rolesData : [])
      setTotalPages(response.totalPages || 1)
      setTotalItems(response.totalItems || rolesData.length || 0)
    }
    // Fallback: try to use response directly if it has role-like properties
    else if (response && typeof response === 'object' && !Array.isArray(response)) {
      console.log("Treating response as single role or unknown format:", response)
      // If it looks like a single role object, wrap it in an array
      if (response._id || response.id) {
        setRoles([response])
        setTotalPages(1)
        setTotalItems(1)
      } else {
        // Unknown format, set empty state
        console.warn("Unknown response format:", response)
        setRoles([])
        setTotalPages(1)
        setTotalItems(0)
      }
    }
    else {
      console.warn("Unexpected response format:", response)
      setRoles([])
      setTotalPages(1)
      setTotalItems(0)
    }
  } catch (error) {
    console.error("Error fetching roles:", error)
    setRoles([])
    setTotalPages(1)
    setTotalItems(0)
    toast({
      title: "Error",
      description: "Failed to fetch roles",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    fetchRoles()
  }, [currentPage, searchTerm, statusFilter])

  const handleCreateRole = () => {
    setSelectedRole(null)
    setDialogType("create")
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setDialogType("edit")
  }

  const handleDeleteRole = (role) => {
    setSelectedRole(role)
    setDialogType("delete")
  }

  const handleAssignUsers = (role) => {
    setSelectedRole(role)
    setDialogType("assign-users")
  }

  const handleManagePermissions = (role) => {
    setSelectedRole(role)
    setDialogType("permissions")
  }

  const handleDialogClose = () => {
    setDialogType(null)
    setSelectedRole(null)
    // Refresh the roles list after dialog closes
    fetchRoles()
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Safe format date function
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({totalItems})</CardTitle>
          <CardDescription>A list of all roles in your system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(roles) || roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {loading ? "Loading roles..." : "No roles found"}
                          </p>
                          {!loading && (
                            <Button variant="outline" onClick={handleCreateRole}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create your first role
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role._id || role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            {role.name || "Unnamed Role"}
                            {role.isSystemRole && (
                              <Badge variant="secondary" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {role.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{role.userCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.isActive !== false ? "default" : "secondary"}>
                            {role.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {role.createdAt ? formatDate(role.createdAt) : "Unknown"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignUsers(role)}>
                                <Users className="mr-2 h-4 w-4" />
                                Assign Users
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Manage Permissions
                              </DropdownMenuItem>
                              {!role.isSystemRole && (
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRole(role)} 
                                  className="text-destructive"
                                >
                                  Delete Role
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} roles
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {dialogType === "create" && <RoleDialog open={true} onClose={handleDialogClose} role={null} />}

      {dialogType === "edit" && selectedRole && (
        <RoleDialog open={true} onClose={handleDialogClose} role={selectedRole} />
      )}

      {dialogType === "delete" && selectedRole && (
        <DeleteRoleDialog open={true} onClose={handleDialogClose} role={selectedRole} />
      )}

      {dialogType === "assign-users" && selectedRole && (
        <AssignUsersDialog open={true} onClose={handleDialogClose} role={selectedRole} />
      )}

      {dialogType === "permissions" && selectedRole && (
        <PermissionsDialog open={true} onClose={handleDialogClose} role={selectedRole} />
      )}
    </div>
  )
}