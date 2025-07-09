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
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Loader2 } from "lucide-react"
import { drugsAPI } from "../../lib/DrugsAPI" 
import PropTypes from "prop-types"

export function DrugGroupDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  drugGroup, 
  title, 
  loading, 
  studies = [], 
  drugs = [] // This might be empty, so we'll fetch it ourselves
}) {
  const [formData, setFormData] = useState({
    group_name: "",
    description: "",
    isActive: true,
    selectedStudies: [],
    selectedDrugs: [],
  })

  const [errors, setErrors] = useState({})
  const [studySearchTerm, setStudySearchTerm] = useState("")
  const [drugSearchTerm, setDrugSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])
  const [filteredDrugs, setFilteredDrugs] = useState([])
  
  // Add state for internal data loading
  const [internalDrugs, setInternalDrugs] = useState([])
  const [drugsLoading, setDrugsLoading] = useState(false)
  const [drugsError, setDrugsError] = useState(null)

  // Fetch drugs when dialog opens if drugs array is empty
  useEffect(() => {
    const fetchDrugs = async () => {
      if (open && drugs.length === 0) {
        setDrugsLoading(true)
        setDrugsError(null)
        try {
          console.log('Fetching drugs because drugs array is empty...')
          const response = await drugsAPI.getDrugs()
          console.log('Drugs API Response:', response)
          
          // Handle different response structures
          const drugsData = response?.data || response || []
          console.log('Processed drugs data:', drugsData)
          setInternalDrugs(drugsData)
        } catch (error) {
          console.error('Error fetching drugs:', error)
          setDrugsError(error.message || 'Failed to fetch drugs')
          setInternalDrugs([])
        } finally {
          setDrugsLoading(false)
        }
      }
    }

    fetchDrugs()
  }, [open, drugs.length])

  // Use either passed drugs or internally fetched drugs
  const availableDrugs = drugs.length > 0 ? drugs : internalDrugs

  useEffect(() => {
    if (drugGroup) {
      setFormData({
        group_name: drugGroup.group_name || "",
        description: drugGroup.description || "",
        isActive: drugGroup.isActive !== undefined ? drugGroup.isActive : true,
        selectedStudies: drugGroup.studies?.map((s) => s._id || s.id) || [],
        selectedDrugs: drugGroup.drugs?.map((d) => d._id || d.id) || [],
      })
    } else {
      setFormData({
        group_name: "",
        description: "",
        isActive: true,
        selectedStudies: [],
        selectedDrugs: [],
      })
    }
    setErrors({})
    setStudySearchTerm("")
    setDrugSearchTerm("")
  }, [drugGroup, open])

  useEffect(() => {
    console.log("ALL STUDIES:", studies)
    if (studySearchTerm.trim() === "") {
      setFilteredStudies(studies)
    } else {
      const filtered = studies.filter((study) =>
        study.study_name?.toLowerCase().includes(studySearchTerm.toLowerCase()) ||
        study.protocol_number?.toLowerCase().includes(studySearchTerm.toLowerCase()) ||
        study.study_title?.toLowerCase().includes(studySearchTerm.toLowerCase())
      )
      setFilteredStudies(filtered)
    }
  }, [studySearchTerm, studies])

  useEffect(() => {
    console.log("Available Drugs:", availableDrugs)
    console.log("Drugs loading:", drugsLoading)
    if (drugSearchTerm.trim() === "") {
      setFilteredDrugs(availableDrugs)
    } else {
      const filtered = availableDrugs.filter((drug) =>
        drug.drug_name?.toLowerCase().includes(drugSearchTerm.toLowerCase()) ||
        drug.quantity?.toString().toLowerCase().includes(drugSearchTerm.toLowerCase()) ||
        drug.remaining_quantity?.toString().toLowerCase().includes(drugSearchTerm.toLowerCase()) ||
        drug.description?.toLowerCase().includes(drugSearchTerm.toLowerCase())
      )
      setFilteredDrugs(filtered)
    }
  }, [drugSearchTerm, availableDrugs])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.group_name.trim()) {
      newErrors.group_name = "Drug group name is required"
    } else if (formData.group_name.length > 255) {
      newErrors.group_name = "Drug group name cannot exceed 255 characters"
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    onSave(formData)
  }

  const handleSelectAllStudies = () => {
    if (formData.selectedStudies.length === filteredStudies.length) {
      setFormData({ ...formData, selectedStudies: [] })
    } else {
      const allStudyIds = filteredStudies.map((study) => study._id || study.id)
      setFormData({ ...formData, selectedStudies: allStudyIds })
    }
  }

  const handleSelectAllDrugs = () => {
    if (formData.selectedDrugs.length === filteredDrugs.length) {
      setFormData({ ...formData, selectedDrugs: [] })
    } else {
      const allDrugIds = filteredDrugs.map((drug) => drug._id || drug.id)
      setFormData({ ...formData, selectedDrugs: allDrugIds })
    }
  }

  const handleStudySelect = (studyId) => {
    const updatedSelection = formData.selectedStudies.includes(studyId)
      ? formData.selectedStudies.filter((id) => id !== studyId)
      : [...formData.selectedStudies, studyId]

    setFormData({ ...formData, selectedStudies: updatedSelection })
  }

  const handleDrugSelect = (drugId) => {
    const updatedSelection = formData.selectedDrugs.includes(drugId)
      ? formData.selectedDrugs.filter((id) => id !== drugId)
      : [...formData.selectedDrugs, drugId]

    setFormData({ ...formData, selectedDrugs: updatedSelection })
  }

  const isAllStudiesSelected = filteredStudies.length > 0 &&
    formData.selectedStudies.length === filteredStudies.length

  const isAllDrugsSelected = filteredDrugs.length > 0 &&
    formData.selectedDrugs.length === filteredDrugs.length

  const handleRetryFetchDrugs = async () => {
    setDrugsLoading(true)
    setDrugsError(null)
    try {
      const response = await drugsAPI.getDrugs()
      const drugsData = response?.data || response || []
      setInternalDrugs(drugsData)
    } catch (error) {
      console.error('Error retrying drugs fetch:', error)
      setDrugsError(error.message || 'Failed to fetch drugs')
      setInternalDrugs([])
    } finally {
      setDrugsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {drugGroup ? "Update the drug group information." : "Add a new drug group to organize your studies and drugs."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group_name">Drug Group Name *</Label>
              <Input
                id="group_name"
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                placeholder="Enter drug group name"
                className={errors.group_name ? "border-destructive" : ""}
              />
              {errors.group_name && <p className="text-sm text-destructive">{errors.group_name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                className={errors.description ? "border-destructive" : ""}
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <Tabs defaultValue="studies" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="studies">
                  Studies ({formData.selectedStudies.length})
                </TabsTrigger>
                <TabsTrigger value="drugs">
                  Drugs ({formData.selectedDrugs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="studies" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="searchStudies">Search Studies</Label>
                  <Input
                    id="searchStudies"
                    value={studySearchTerm}
                    onChange={(e) => setStudySearchTerm(e.target.value)}
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
                      onClick={handleSelectAllStudies}
                      disabled={filteredStudies.length === 0}
                    >
                      {isAllStudiesSelected ? "Deselect All" : "Select All"}
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
                          <div className="text-sm truncate">{study.study_title || "N/A"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        {studySearchTerm ? "No studies found matching your search" : "No studies available"}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drugs" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="searchDrugs">Search Drugs</Label>
                  <Input
                    id="searchDrugs"
                    value={drugSearchTerm}
                    onChange={(e) => setDrugSearchTerm(e.target.value)}
                    placeholder="Search by drug name, quantity, stock, or description"
                    disabled={drugsLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Assign Drugs</Label>
                    <div className="flex gap-2">
                      {drugsError && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetryFetchDrugs}
                          disabled={drugsLoading}
                        >
                          {drugsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllDrugs}
                        disabled={filteredDrugs.length === 0 || drugsLoading}
                      >
                        {isAllDrugsSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                      <div>Select</div>
                      <div>Drug Name</div>
                      <div>Quantity</div>
                      <div>Stock</div>
                      <div>Description</div>
                    </div>

                    {drugsLoading ? (
                      <div className="p-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading drugs...</p>
                      </div>
                    ) : drugsError ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-destructive mb-2">Error loading drugs: {drugsError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetryFetchDrugs}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : filteredDrugs.length > 0 ? (
                      filteredDrugs.map((drug) => (
                        <div key={drug._id || drug.id} className="grid grid-cols-5 gap-2 p-3 border-b hover:bg-muted/20">
                          <div className="flex items-center">
                            <Checkbox
                              checked={formData.selectedDrugs.includes(drug._id || drug.id)}
                              onCheckedChange={() => handleDrugSelect(drug._id || drug.id)}
                            />
                          </div>
                          <div className="text-sm">{drug.drug_name || "N/A"}</div>
                          <div className="text-sm">{drug.quantity || "N/A"}</div>
                          <div className="text-sm">{drug.remaining_quantity || "N/A"}</div>
                          <div className="text-sm truncate">{drug.description || "N/A"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        {drugSearchTerm ? "No drugs found matching your search" : "No drugs available"}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {(formData.selectedStudies.length > 0 || formData.selectedDrugs.length > 0) && (
              <div className="p-3 bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Selection Summary:</strong> {formData.selectedStudies.length} study(ies) and {formData.selectedDrugs.length} drug(s) selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || drugsLoading}>
              {loading ? "Saving..." : drugGroup ? "Update Drug Group" : "Add Drug Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

DrugGroupDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  drugGroup: PropTypes.shape({
    group_name: PropTypes.string,
    description: PropTypes.string,
    isActive: PropTypes.bool,
    studies: PropTypes.array,
    drugs: PropTypes.array,
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
  drugs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      drug_name: PropTypes.string,
      quantity: PropTypes.string,
      remaining_quantity: PropTypes.string,
      description: PropTypes.string,
    })
  ),
}