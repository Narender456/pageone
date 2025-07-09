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

export function DrugShipmentDialog({
  open,
  onOpenChange,
  onSave,
  drugShipment,
  title,
  loading,
  studies = [],
}) {
  const [formData, setFormData] = useState({
    shipmentNumber: "",
    shipmentDate: "",
    selectType: "DrugGroup",
    study: "",
    siteNumber: "",
    groupName: [],
    drug: [],
    excelRows: [],
    selectedStudies: [],
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])

  useEffect(() => {
    if (drugShipment) {
      setFormData({
        shipmentNumber: drugShipment.shipmentNumber || "",
        shipmentDate: drugShipment.shipmentDate
          ? drugShipment.shipmentDate.slice(0, 10)
          : "",
        selectType: drugShipment.selectType || "DrugGroup",
        study: drugShipment.study?._id || drugShipment.study || "",
        siteNumber: drugShipment.siteNumber?._id || drugShipment.siteNumber || "",
        groupName: drugShipment.groupName || [],
        drug: drugShipment.drug || [],
        excelRows: drugShipment.excelRows || [],
        selectedStudies: [], // You can adapt this if you want to pre-select studies
      })
    } else {
      setFormData({
        shipmentNumber: "",
        shipmentDate: "",
        selectType: "DrugGroup",
        study: "",
        siteNumber: "",
        groupName: [],
        drug: [],
        excelRows: [],
        selectedStudies: [],
      })
    }
    setErrors({})
    setSearchTerm("")
  }, [drugShipment, open])

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
    if (!formData.study) {
      newErrors.study = "Study is required"
    }
    if (!formData.siteNumber) {
      newErrors.siteNumber = "Site is required"
    }
    if (!formData.selectType) {
      newErrors.selectType = "Select type is required"
    }
    // Add more validation as needed
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

  const isAllSelected =
    filteredStudies.length > 0 &&
    formData.selectedStudies.length === filteredStudies.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {drugShipment
              ? "Update the drug shipment information."
              : "Add a new drug shipment to organize your studies."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shipmentNumber">Shipment Number</Label>
              <Input
                id="shipmentNumber"
                value={formData.shipmentNumber}
                onChange={(e) =>
                  setFormData({ ...formData, shipmentNumber: e.target.value })
                }
                placeholder="Enter shipment number"
                className={errors.shipmentNumber ? "border-destructive" : ""}
              />
              {errors.shipmentNumber && (
                <p className="text-sm text-destructive">
                  {errors.shipmentNumber}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shipmentDate">Shipment Date</Label>
              <Input
                id="shipmentDate"
                type="date"
                value={formData.shipmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, shipmentDate: e.target.value })
                }
                className={errors.shipmentDate ? "border-destructive" : ""}
              />
              {errors.shipmentDate && (
                <p className="text-sm text-destructive">
                  {errors.shipmentDate}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="selectType">Select Type</Label>
              <select
                id="selectType"
                value={formData.selectType}
                onChange={(e) =>
                  setFormData({ ...formData, selectType: e.target.value })
                }
                className="border rounded px-2 py-1"
              >
                <option value="DrugGroup">Drug Group</option>
                <option value="Drug">Drug</option>
                <option value="Randomization">Randomization</option>
              </select>
              {errors.selectType && (
                <p className="text-sm text-destructive">
                  {errors.selectType}
                </p>
              )}
            </div>

            {/* Example: Study selection */}
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
                    <div
                      key={study._id || study.id}
                      className="grid grid-cols-4 gap-2 p-3 border-b hover:bg-muted/20"
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={formData.selectedStudies.includes(
                            study._id || study.id
                          )}
                          onCheckedChange={() =>
                            handleStudySelect(study._id || study.id)
                          }
                        />
                      </div>
                      <div className="text-sm">
                        {study.study_name || "N/A"}
                      </div>
                      <div className="text-sm">
                        {study.protocol_number || "N/A"}
                      </div>
                      <div className="text-sm">
                        {study.study_title || "N/A"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    {searchTerm
                      ? "No studies found matching your search"
                      : "No studies available"}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : drugShipment
                ? "Update Drug Shipment"
                : "Add Drug Shipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

DrugShipmentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  drugShipment: PropTypes.shape({
    shipmentNumber: PropTypes.string,
    shipmentDate: PropTypes.string,
    selectType: PropTypes.string,
    study: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    siteNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    groupName: PropTypes.array,
    drug: PropTypes.array,
    excelRows: PropTypes.array,
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