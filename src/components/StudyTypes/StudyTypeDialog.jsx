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

export function StudyTypeDialog({ open, onOpenChange, onSave, studyType, title, loading, studies = [] }) {
  const [formData, setFormData] = useState({
    study_type: "", // Changed from study_Type to study_type
    isActive: true,
    selectedStudies: [],
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])

  useEffect(() => {
    if (studyType) {
      setFormData({
        study_type: studyType.study_type || studyType.study_Type || "", // Handle both cases
        isActive: studyType.isActive ?? true,
        selectedStudies: studyType.studies?.map((s) => s._id || s.id) || [],
      })
    } else {
      setFormData({
        study_type: "",
        isActive: true,
        selectedStudies: [],
      })
    }
    setErrors({})
    setSearchTerm("")
  }, [studyType, open])

  useEffect(() => {
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
    if (!formData.study_type.trim()) {
      newErrors.study_type = "Study type name is required"
    } else if (formData.study_type.length > 255) {
      newErrors.study_type = "Study type name cannot exceed 255 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = (e) => {
  e.preventDefault()
  if (!validateForm()) return

  const payload = {
    study_type: formData.study_type, // ✅ map to expected backend key
    isActive: formData.isActive,
    studies: formData.selectedStudies,
  }

  console.log("Creating study Type with payload:", payload)
  onSave(payload)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {studyType ? "Update the study type information." : "Add a new study type to organize your studies."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="study_type">Study Type Name *</Label>
              <Input
                id="study_type"
                value={formData.study_type}
                onChange={(e) => setFormData({ ...formData, study_type: e.target.value })}
                placeholder="Enter study type name"
                className={errors.study_type ? "border-destructive" : ""}
              />
              {errors.study_type && <p className="text-sm text-destructive">{errors.study_type}</p>}
            </div>

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
              {loading ? "Saving..." : studyType ? "Update Study Type" : "Add Study Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

StudyTypeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  studyType: PropTypes.shape({
    study_type: PropTypes.string, // Changed from study_Type to study_type
    study_Type: PropTypes.string, // Keep this for backward compatibility
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