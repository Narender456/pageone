"use client"

import PropTypes from "prop-types"
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

export function DeleteSponsorDialog({
  open,
  onOpenChange,
  onConfirm,
  sponsor,
  loading,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the sponsor{" "}
            <strong>"{sponsor?.sponsor}"</strong>
            {sponsor?.studyCount && sponsor.studyCount > 0 && (
              <span className="text-destructive">
                {" "}
                and remove {sponsor.studyCount} associated studies
              </span>
            )}
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete Sponsor"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Optional: Add PropTypes for validation
DeleteSponsorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  sponsor: PropTypes.shape({
    sponsor: PropTypes.string,
    studyCount: PropTypes.number,
  }),
  loading: PropTypes.bool,
}