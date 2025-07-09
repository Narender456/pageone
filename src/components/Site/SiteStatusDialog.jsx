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

export function SiteDialog({ open, onOpenChange, onSave, site, title, loading, studies = [] }) {
  const [formData, setFormData] = useState({
    siteName: "",
    siteId: "",
    protocolNumber: "",
    piName: "",
    isActive: true,
    selectedStudies: [],
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])

  useEffect(() => {
    if (site) {
      setFormData({
        siteName: site.siteName || "",
        siteId: site.siteId || "",
        protocolNumber: site.protocolNumber || "",
        piName: site.piName || "",
        isActive: site.isActive,
        selectedStudies: site.studies?.map((s) => s._id || s.id) || [],
      })
    } else {
      setFormData({
        siteName: "",
        siteId: "",
        protocolNumber: "",
        piName: "",
        isActive: true,
        selectedStudies: [],
      })
    }
    setSearchTerm("")
  }, [site, open])

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

  const handleSubmit = (e) => {
    e.preventDefault()
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
            {site ? "Update the site information." : "Add a new site to organize your studies."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Site Name */}
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                placeholder="Enter site name"
              />
            </div>

            {/* Site ID */}
            <div className="grid gap-2">
              <Label htmlFor="siteId">Site ID</Label>
              <Input
                id="siteId"
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                placeholder="Enter site ID"
              />
            </div>

            {/* Protocol Number */}
            <div className="grid gap-2">
              <Label htmlFor="protocolNumber">Protocol Number</Label>
              <Input
                id="protocolNumber"
                value={formData.protocolNumber}
                onChange={(e) => setFormData({ ...formData, protocolNumber: e.target.value })}
                placeholder="Enter protocol number"
              />
            </div>

            {/* PI Name */}
            <div className="grid gap-2">
              <Label htmlFor="piName">PI Name</Label>
              <Input
                id="piName"
                value={formData.piName}
                onChange={(e) => setFormData({ ...formData, piName: e.target.value })}
                placeholder="Enter principal investigator name"
              />
            </div>

            {/* Search Studies */}
            <div className="grid gap-2">
              <Label htmlFor="searchStudies">Search Studies</Label>
              <Input
                id="searchStudies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by study name, protocol number, or study title"
              />
            </div>

            {/* Assign Studies */}
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
              {loading ? "Saving..." : site ? "Update Site" : "Add Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

SiteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  site: PropTypes.shape({
    siteName: PropTypes.string,
    siteId: PropTypes.string,
    protocolNumber: PropTypes.string,
    piName: PropTypes.string,
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
