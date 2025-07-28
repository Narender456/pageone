"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { rolesApi } from "../../lib/roles-api"

export function RoleDialog({ open, onClose, role }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        description: role.description || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [role])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      let response

      if (role) {
        // Update existing role
        const updateData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        }

        response = await rolesApi.updateRole(role._id || role.id, updateData)
        console.log("Update response:", response) // Debug log
      } else {
        // Create new role
        response = await rolesApi.createRole({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        })
        console.log("Create response:", response) // Debug log
      }

      // Check for successful response - handle different API response formats
      const isSuccess = response && (
        response.success === true ||
        response.status === 200 ||
        response.status === 201 ||
        (response._id || response.id) || // Response is the created/updated role object
        Array.isArray(response) // Some APIs return arrays
      )

      if (isSuccess) {
        toast({
          title: "Success",
          description: role ? "Role updated successfully" : "Role created successfully",
        })
        
        // Reset form for create mode
        if (!role) {
          setFormData({
            name: "",
            description: "",
          })
        }
        
        // Close dialog immediately after successful operation
        onClose()
      } else {
        // Handle unsuccessful response
        const errorMessage = response?.message || response?.error || "Failed to save role"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving role:", error)
      
      // Extract error message from different possible error formats
      let errorMessage = "Failed to save role"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        name: "",
        description: "",
      })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {role ? "Update the role information below." : "Create a new role with the information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter role name"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter role description (optional)"
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}