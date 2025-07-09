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

export function SponsorDialog({ open, onOpenChange, onSave, sponsor, title, loading, studies = [] }) {
  const [formData, setFormData] = useState({
    sponsor_name: "",
    isActive: true,
    selectedStudies: [],
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])

  useEffect(() => {
    console.log('=== SPONSOR DIALOG EFFECT DEBUG ===')
    console.log('sponsor prop:', sponsor)
    console.log('open prop:', open)
    console.log('studies prop:', studies)
    
    if (sponsor) {
      const newFormData = {
        sponsor_name: sponsor.sponsor_name || sponsor.sponsor || "",
        isActive: sponsor.isActive,
        selectedStudies: sponsor.studies?.map((s) => s._id || s.id) || [],
      }
      console.log('Setting form data from sponsor:', newFormData)
      setFormData(newFormData)
    } else {
      const newFormData = {
        sponsor_name: "",
        isActive: true,
        selectedStudies: [],
      }
      console.log('Setting default form data:', newFormData)
      setFormData(newFormData)
    }
    setErrors({})
    setSearchTerm("")
    console.log('=== SPONSOR DIALOG EFFECT DEBUG END ===')
  }, [sponsor, open])

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
    console.log('=== FORM VALIDATION DEBUG ===')
    console.log('Current form data:', formData)
    
    const newErrors = {}
    
    if (!formData.sponsor_name) {
      console.log('❌ sponsor_name is falsy:', formData.sponsor_name)
      newErrors.sponsor_name = "Sponsor name is required"
    } else if (!formData.sponsor_name.trim()) {
      console.log('❌ sponsor_name is empty after trim:', formData.sponsor_name)
      newErrors.sponsor_name = "Sponsor name is required"
    } else if (formData.sponsor_name.length > 255) {
      console.log('❌ sponsor_name too long:', formData.sponsor_name.length)
      newErrors.sponsor_name = "Sponsor name cannot exceed 255 characters"
    } else {
      console.log('✅ sponsor_name validation passed:', formData.sponsor_name)
    }

    console.log('Validation errors:', newErrors)
    console.log('=== FORM VALIDATION DEBUG END ===')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMIT DEBUG ===')
    console.log('Form data before validation:', JSON.stringify(formData, null, 2))
    
    if (!validateForm()) {
      console.log('❌ Form validation failed, not submitting')
      return
    }
    
    console.log('✅ Form validation passed')
    console.log('Calling onSave with:', JSON.stringify(formData, null, 2))
    console.log('=== FORM SUBMIT DEBUG END ===')
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {sponsor ? "Update the sponsor information." : "Add a new sponsor to organize your studies."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sponsor_name">Sponsor Name *</Label>
              <Input
                id="sponsor_name"
                value={formData.sponsor_name}
                onChange={(e) => {
                  console.log('Sponsor name input changed:', e.target.value)
                  setFormData({ ...formData, sponsor_name: e.target.value })
                }}
                placeholder="Enter sponsor name"
                className={errors.sponsor_name ? "border-destructive" : ""}
              />
              {errors.sponsor_name && <p className="text-sm text-destructive">{errors.sponsor_name}</p>}
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
              {loading ? "Saving..." : sponsor ? "Update Sponsor" : "Add Sponsor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

SponsorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  sponsor: PropTypes.shape({
    sponsor_name: PropTypes.string,
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