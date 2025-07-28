"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { useToast } from "../../hooks/use-toast"
import { pagesApi } from "../../lib/pages-api"

export function DeletePageDialog({ page, open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!page) return

    setIsLoading(true)
    try {
      const response = await pagesApi.deletePage(page.slug)

      if (response.success) {
        toast({
          title: "Success",
          description: "Page deleted successfully",
        })
        onSuccess()
      }
    } catch (error) {
      console.error("Error deleting page:", error)
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Page</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the page "{page?.title}"? This action cannot be undone and will permanently
            remove the page and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Page"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
