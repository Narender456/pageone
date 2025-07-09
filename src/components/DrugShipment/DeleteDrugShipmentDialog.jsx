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

export function DeleteDrugShipmentDialog({
  open,
  onOpenChange,
  onConfirm,
  drugShipment,
  loading,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the drug shipment{" "}
            <strong>
              "{drugShipment?.shipmentNumber || drugShipment?.slug || drugShipment?._id}"
            </strong>
            {drugShipment?.itemCount && drugShipment.itemCount > 0 && (
              <span className="text-destructive">
                {" "}
                and remove {drugShipment.itemCount} associated items
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
            {loading ? "Deleting..." : "Delete Drug Shipment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

DeleteDrugShipmentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  drugShipment: PropTypes.shape({
    shipmentNumber: PropTypes.string,
    slug: PropTypes.string,
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    itemCount: PropTypes.number, // Adjust as needed for your use case
  }),
  loading: PropTypes.bool,
}