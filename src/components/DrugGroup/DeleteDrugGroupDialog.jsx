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

export function DeleteDrugGroupDialog({
  open,
  onOpenChange,
  onConfirm,
  drugGroup,
  loading,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the drug group{" "}
            <strong>"{drugGroup?.group_name}"</strong>
            {drugGroup?.studyCount && drugGroup.studyCount > 0 && (
              <span className="text-destructive">
                {" "}
                and remove {drugGroup.studyCount} associated studies
              </span>
            )}
            {drugGroup?.drugCount && drugGroup.drugCount > 0 && (
              <span className="text-destructive">
                {" "}
                and {drugGroup.drugCount} associated drugs
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
            {loading ? "Deleting..." : "Delete Drug Group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Optional: Add PropTypes for validation
DeleteDrugGroupDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  drugGroup: PropTypes.shape({
    group_name: PropTypes.string,
    studyCount: PropTypes.number,
    drugCount: PropTypes.number,
  }),
  loading: PropTypes.bool,
}