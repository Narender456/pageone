"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import PropTypes from "prop-types"

export function DrugsDialog({ open, onOpenChange, onSave, drugs, title, loading, studies = [] }) {
  const [formData, setFormData] = useState({
    drug_name: "",
    quantity: "",
    remaining_quantity: "",
    isActive: true,
    selectedStudies: [],
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])

  useEffect(() => {
    if (drugs) {
      setFormData({
        drug_name: drugs.drug_name,
        quantity: drugs.quantity || "",
        remaining_quantity: drugs.remaining_quantity || "",
        isActive: drugs.isActive,
        selectedStudies: drugs.studies?.map((s) => s._id || s.id) || [],
      })
    } else {
      setFormData({
        drug_name: "",
        quantity: "",
        remaining_quantity: "",
        isActive: true,
        selectedStudies: [],
      })
    }
    setErrors({})
    setSearchTerm("")
  }, [drugs, open])

useEffect(() => {
  console.log("ALL STUDIES:", studies)
  if (searchTerm.trim() === "") {
    setFilteredStudies(studies)
  } else {
    const filtered = studies.filter((study) =>
      study.study_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.protocol_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.study_title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStudies(filtered)
  }
}, [searchTerm, studies])


  const validateForm = () => {
    const newErrors = {}
    if (!formData.drug_name.trim()) {
      newErrors.drug_name = "Drug name is required"
    } else if (formData.drug_name.length > 255) {
      newErrors.drug_name = "Drug name cannot exceed 255 characters"
    }

    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = "Quantity must be a valid number"
    } else if (formData.quantity && Number(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative"
    }

    if (formData.remaining_quantity && isNaN(Number(formData.remaining_quantity))) {
      newErrors.remaining_quantity = "Remaining quantity must be a valid number"
    } else if (formData.remaining_quantity && Number(formData.remaining_quantity) < 0) {
      newErrors.remaining_quantity = "Remaining quantity cannot be negative"
    }

    // Validate that remaining quantity doesn't exceed total quantity
    if (formData.quantity && formData.remaining_quantity) {
      const total = Number(formData.quantity)
      const remaining = Number(formData.remaining_quantity)
      if (remaining > total) {
        newErrors.remaining_quantity = "Remaining quantity cannot exceed total quantity"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    onSave(formData)
  }

  const handleSelectAll = () => {
    if (formData.selectedStudies.length === filteredStudies.length) {
      setFormData({ ...formData, selectedStudies: [] })
    } else {
      const allStudyIds = filteredStudies.map((study) => study._id || study.id)
      setFormData({ ...formData, selectedStudies: allStudyIds })
    }
  }

  const handleStudySelect = (studyId) => {
    const updatedSelection = formData.selectedStudies.includes(studyId)
      ? formData.selectedStudies.filter((id) => id !== studyId)
      : [...formData.selectedStudies, studyId]

    setFormData({ ...formData, selectedStudies: updatedSelection })
  }

  const isAllSelected = filteredStudies.length > 0 &&
    formData.selectedStudies.length === filteredStudies.length

  const isEditMode = !!drugs

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {drugs ? "Update the drug information." : "Add a new drug to organize your studies."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="drug_name">Drug Name *</Label>
              <Input
                id="drug_name"
                value={formData.drug_name}
                onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                placeholder="Enter drug name"
                className={errors.drug_name ? "border-destructive" : ""}
              />
              {errors.drug_name && <p className="text-sm text-destructive">{errors.drug_name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
                min="0"
                step="1"
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
            </div>

            {isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="remaining_quantity">Remaining Quantity</Label>
                <Input
                  id="remaining_quantity"
                  type="number"
                  value={formData.remaining_quantity}
                  onChange={(e) => setFormData({ ...formData, remaining_quantity: e.target.value })}
                  placeholder="Enter remaining quantity"
                  min="0"
                  step="1"
                  className={errors.remaining_quantity ? "border-destructive" : ""}
                />
                {errors.remaining_quantity && <p className="text-sm text-destructive">{errors.remaining_quantity}</p>}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="searchStudies">Search Studies</Label>
              <Input
                id="searchStudies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by study name, protocol number, or study title"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Assign Studies</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredStudies.length === 0}
                >
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="border rounded-md max-h-60 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                  <div>Select</div>
                  <div>Study Name</div>
                  <div>Protocol Number</div>
                  <div>Study Title</div>
                </div>

                {filteredStudies.length > 0 ? (
                  filteredStudies.map((study) => (
                    <div key={study._id || study.id} className="grid grid-cols-4 gap-2 p-3 border-b hover:bg-muted/20">
                      <div className="flex items-center">
                        <Checkbox
                          checked={formData.selectedStudies.includes(study._id || study.id)}
                          onCheckedChange={() => handleStudySelect(study._id || study.id)}
                        />
                      </div>
                      <div className="text-sm">{study.study_name || "N/A"}</div>
                      <div className="text-sm">{study.protocol_number || "N/A"}</div>
                      <div className="text-sm">{study.study_title || "N/A"}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    {searchTerm ? "No studies found matching your search" : "No studies available"}
                  </div>
                )}
              </div>

              {formData.selectedStudies.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.selectedStudies.length} study(ies) selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : drugs ? "Update Drug" : "Add Drug"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

DrugsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  drugs: PropTypes.shape({
    drug_name: PropTypes.string,
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remaining_quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isActive: PropTypes.bool,
    studies: PropTypes.array,
  }),
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  studies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      study_name: PropTypes.string,
      protocol_number: PropTypes.string,
      study_title: PropTypes.string,
    })
  ),
}