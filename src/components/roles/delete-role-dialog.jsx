"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { useToast } from "../../hooks/use-toast"
import { rolesApi } from "../../lib/roles-api"

export function DeleteRoleDialog({ open, onClose, role, onRoleDeleted }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setLoading(true)

      const response = await rolesApi.deleteRole(role._id)
      
      // Debug: Log the response to see what we're getting
      console.log("Delete response:", response)

      // Handle different response formats
      // Many DELETE APIs return 204 No Content (undefined/null response)
      // or 200 with various success indicators
      const isSuccess = 
        response === undefined || 
        response === null || 
        response.success === true || 
        response.ok === true ||
        response.status === 200 ||
        response.status === 204 ||
        (response.data && response.data.success === true) ||
        // If response is an object without explicit success field, assume success
        (typeof response === 'object' && !response.error && !response.message)

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        })
        
        // Call the callback to refresh the parent component's data
        if (onRoleDeleted) {
          onRoleDeleted(role._id)
        }
        
        // Close the dialog
        onClose()
      } else {
        // Handle case where response indicates failure
        throw new Error(response?.message || response?.error || "Delete operation failed")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to delete role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete the role "{role?.name}"? This action cannot be undone.
            {role?.userCount && role.userCount > 0 && (
              <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive font-medium">
                  Warning: This role is assigned to {role.userCount} user(s). Deleting this role will remove it from all
                  assigned users.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Role"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}