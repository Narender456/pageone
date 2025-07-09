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

export function DeleteStudyPhaseDialog({
  open,
  onOpenChange,
  onConfirm,
  studyPhase,
  loading,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the study phase{" "}
            <strong>"{studyPhase?.study_phase}"</strong>
            {studyPhase?.studyCount && studyPhase.studyCount > 0 && (
              <span className="text-destructive">
                {" "}
                and remove {studyPhase.studyCount} associated studies
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
            {loading ? "Deleting..." : "Delete Study Phase"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Optional: Add PropTypes for validation
DeleteStudyPhaseDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  studyPhase: PropTypes.shape({
    study_phase: PropTypes.string,
    studyCount: PropTypes.number,
  }),
  loading: PropTypes.bool,
}
