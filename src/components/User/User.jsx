"use client"

import { useState } from "react"
import { Users, Shield, Settings, BarChart3, Plus, Edit, Trash2, Check, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/buttons"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { UserDialog } from "./user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { UserActivityDialog } from "./user-activity-dialog"
import { usersAPI } from "../../lib/users-api"
import { useApi, useAsyncOperation } from "../../hooks/use-api"
import { useToast } from "../../hooks/use-toast"

export default function UserManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [viewingActivity, setViewingActivity] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])

  const { toast } = useToast()

  // API hooks
  const {
    data: usersResponse,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useApi(() => usersAPI.getUsers(filters), [filters])

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useApi(() => usersAPI.getUserStats(), [])

  const { execute: executeUserOperation, loading: operationLoading } = useAsyncOperation()

  // Fixed data extraction with better error handling
  const users = Array.isArray(usersResponse?.data) 
    ? usersResponse.data 
    : Array.isArray(usersResponse) 
      ? usersResponse 
      : []

  const stats = statsData?.data || statsData || {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    recentLogins: 0,
  }

  // Add debug logging to see what data we're getting
  console.log('Debug - usersResponse:', usersResponse)
  console.log('Debug - users array:', users)
  console.log('Debug - statsData:', statsData)

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const toggleAccess = async (userId) => {
    try {
      const result = await executeUserOperation(() => usersAPI.toggleUserAccess(userId))
      if (result) {
        toast({
          title: "Access updated",
          description: "User access has been updated successfully",
        })
        refetchUsers()
        refetchStats()
      }
    } catch (error) {
      console.error('Toggle access error:', error)
      toast({
        title: "Error",
        description: "Failed to update user access",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId) => {
    const result = await executeUserOperation(() => usersAPI.deleteUser(userId))
    if (result) {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      })
      setDeletingUser(null)
      refetchUsers()
      refetchStats()
    }
  }

  const addUser = async (userData) => {
    const result = await executeUserOperation(() => usersAPI.createUser(userData))
    if (result) {
      toast({
        title: "User created",
        description: "User has been created successfully",
      })
      setShowAddUser(false)
      refetchUsers()
      refetchStats()
    }
  }

  const updateUser = async (userData) => {
    const result = await executeUserOperation(() => usersAPI.updateUser(userData.id, userData))
    if (result) {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      })
      setEditingUser(null)
      refetchUsers()
      refetchStats()
    }
  }

  const exportUsers = async () => {
    try {
      const blob = await usersAPI.exportUsers()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: "Users data has been exported to CSV",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export users data",
        variant: "destructive",
      })
    }
  }

  const bulkUpdateAccess = async (hasAccess) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select users to update",
        variant: "destructive",
      })
      return
    }

    const result = await executeUserOperation(() =>
      usersAPI.bulkUpdateUsers({
        userIds: selectedUsers,
        updates: { hasAccess },
      }),
    )

    if (result) {
      toast({
        title: "Bulk update successful",
        description: `Updated access for ${selectedUsers.length} users`,
      })
      setSelectedUsers([])
      refetchUsers()
      refetchStats()
    }
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleColor = (role) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
  }

  const getAccessColor = (hasAccess) => {
    return hasAccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading users: {usersError}</p>
          <Button onClick={() => refetchUsers()}>
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => refetchUsers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Users with access</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats.adminUsers}</div>
                <p className="text-xs text-muted-foreground">Administrator accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats.recentLogins}</div>
                <p className="text-xs text-muted-foreground">Last 2 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search users..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={filters.role || "all"}
                onValueChange={(value) => handleFilterChange("role", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.hasAccess?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange("hasAccess", value === "all" ? undefined : value === "true")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access</SelectItem>
                  <SelectItem value="true">Has Access</SelectItem>
                  <SelectItem value="false">No Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateAccess(true)}
                    disabled={operationLoading}
                  >
                    Grant Access ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateAccess(false)}
                    disabled={operationLoading}
                  >
                    Revoke Access ({selectedUsers.length})
                  </Button>
                </>
              )}
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new user</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map((u) => u.id))
                            } else {
                              setSelectedUsers([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id || user._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id || user._id)}
                            onChange={(e) => {
                              const userId = user.id || user._id
                              if (e.target.checked) {
                                setSelectedUsers((prev) => [...prev, userId])
                              } else {
                                setSelectedUsers((prev) => prev.filter((id) => id !== userId))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User"} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name || "No Name"}</div>
                              <div className="text-sm text-muted-foreground">{user.email || "No Email"}</div>
                              {user.isEmailVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getRoleColor(user.role)}>
                            {user.role || "user"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAccess(user.id || user._id)}
                            disabled={operationLoading}
                            className={`${getAccessColor(user.hasAccess)} hover:opacity-80`}
                          >
                            {user.hasAccess ? "Granted" : "Denied"}
                          </Button>
                        </TableCell>
                        <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                try {
                                  console.log('Opening activity for user:', user)
                                  setViewingActivity(user)
                                } catch (error) {
                                  console.error('Error opening activity dialog:', error)
                                  toast({
                                    title: "Error",
                                    description: "Failed to open activity dialog",
                                    variant: "destructive",
                                  })
                                }
                              }}
                            >
                              Activity
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingUser(user)}>
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

          {/* Pagination */}
          {usersResponse?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {users.length} of {usersResponse.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!usersResponse.pagination.prev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!usersResponse.pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>Configure user management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dashboard Name</label>
                <Input defaultValue="Admin Dashboard" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default User Role</label>
                <Select defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoApprove"
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label htmlFor="autoApprove" className="text-sm">
                  Auto-approve new user registrations
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserDialog
        open={showAddUser}
        onOpenChange={setShowAddUser}
        onSave={addUser}
        title="Add New User"
        loading={operationLoading}
      />

      <UserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSave={updateUser}
        user={editingUser}
        title="Edit User"
        loading={operationLoading}
      />

      <DeleteUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteUser(deletingUser.id || deletingUser._id)}
        user={deletingUser}
        loading={operationLoading}
      />

      <UserActivityDialog
        open={!!viewingActivity}
        onOpenChange={(open) => {
          try {
            if (!open) {
              setViewingActivity(null)
            }
          } catch (error) {
            console.error('Error closing activity dialog:', error)
            setViewingActivity(null)
          }
        }}
        user={viewingActivity}
      />
    </div>
  )
}