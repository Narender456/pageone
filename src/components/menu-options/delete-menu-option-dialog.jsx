"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertTriangle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { menuOptionsApi } from "../../lib/menu-options-api"

export function DeleteMenuOptionDialog({ open, onOpenChange, menuOption, onDelete }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!menuOption) return

    setLoading(true)
    try {
      await menuOptionsApi.deleteMenuOption(menuOption._id)
      toast({
        title: "Success",
        description: "Menu option deleted successfully",
      })
      onDelete()
    } catch (error) {
      console.error("Error deleting menu option:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete menu option",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!menuOption) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Menu Option
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the menu option.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete the menu option <strong>"{menuOption.name}"</strong>.
              {menuOption.children && menuOption.children.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This menu option has {menuOption.children.length} child menu(s) that will also be affected.
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium mb-2">Menu Option Details:</h4>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Name:</strong> {menuOption.name}
              </div>
              <div>
                <strong>URL:</strong> {menuOption.url}
              </div>
              {menuOption.parent && (
                <div>
                  <strong>Parent:</strong>{" "}
                  {typeof menuOption.parent === "string" ? menuOption.parent : menuOption.parent.name}
                </div>
              )}
              <div>
                <strong>Order:</strong> {menuOption.order}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Menu Option"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}