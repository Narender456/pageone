"use client"

import { useState, useEffect } from "react"
import { Search, User, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Checkbox } from "../ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { useToast } from "../../hooks/use-toast"
import { rolesApi } from "../../lib/roles-api"
import { usersAPI } from "../../lib/users-api"

export function AssignUsersDialog({ open, onClose, role }) {
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchUsers()
      // Set initially selected users
      if (Array.isArray(role.users)) {
        setSelectedUsers(role.users.map((user) => (typeof user === "string" ? user : user._id)))
      }
    }
  }, [open, role])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getUsers({
        limit: 100,
        search: searchTerm,
      })

      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate role ID first
      if (!role._id && !role.id) {
        throw new Error("Role ID is missing")
      }

      // Log the payload being sent for debugging
      const payload = {
        users: selectedUsers,
      }
      console.log("Sending payload:", payload)
      console.log("Role ID:", role._id || role.id)
      console.log("Selected users:", selectedUsers)

      const response = await rolesApi.updateRole(role._id || role.id, payload)

      // Log the response for debugging
      console.log("API Response:", response)

      // Check for successful response - handle different API response formats
      const isSuccess = response && (
        response.success === true ||
        response.status === 200 ||
        response.status === 201 ||
        (response._id || response.id) || // Response is the updated role object
        Array.isArray(response) // Some APIs return arrays
      )

      if (isSuccess) {
        toast({
          title: "Success",
          description: response.message || "User assignments updated successfully",
        })
        onClose()
        
        // Optionally refresh the parent component data
        if (typeof onClose === 'function') {
          onClose(true) // Pass true to indicate success
        }
      } else {
        // Handle unsuccessful response
        const errorMessage = response?.message || response?.error || "Failed to update user assignments"
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Full error object:", error)
      console.error("Error type:", typeof error)
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      console.error("Error config:", error.config)
      
      // Handle different error formats
      let errorMessage = "Failed to update user assignments"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          errorMessage = validationErrors.map(err => err.msg || err.message).join(", ")
        }
      } else if (error.message && error.message !== "Failed to update user assignments") {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Users to Role</DialogTitle>
          <DialogDescription>Select users to assign to the "{role.name}" role.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Selected ({selectedUsers.length}):</Label>
              {selectedUsers.slice(0, 5).map((userId) => {
                const user = users.find((u) => u._id === userId)
                return user ? (
                  <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                    {user.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleUserToggle(userId)} />
                  </Badge>
                ) : null
              })}
              {selectedUsers.length > 5 && <Badge variant="outline">+{selectedUsers.length - 5} more</Badge>}
            </div>
          )}

          {/* Users List */}
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleUserToggle(user._id)}
                  >
                    <Checkbox checked={selectedUsers.includes(user._id)} onChange={() => handleUserToggle(user._id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.hasAccess ? "default" : "secondary"} className="text-xs">
                        {user.hasAccess ? "Active" : "Inactive"}
                      </Badge>
                      {user.role === "admin" && (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}