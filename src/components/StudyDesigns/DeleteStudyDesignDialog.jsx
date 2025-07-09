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

export function DeleteStudyDesignDialog({
  open,
  onOpenChange,
  onConfirm,
  studyDesign,
  loading,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the study design{" "}
            <strong>"{studyDesign?.study_design}"</strong>
            {studyDesign?.studyCount && studyDesign.studyCount > 0 && (
              <span className="text-destructive">
                {" "}
                and remove {studyDesign.studyCount} associated studies
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
            {loading ? "Deleting..." : "Delete Study Design"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Optional: Add PropTypes for validation
DeleteStudyDesignDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  studyDesign: PropTypes.shape({
    study_design: PropTypes.string,
    studyCount: PropTypes.number,
  }),
  loading: PropTypes.bool,
}