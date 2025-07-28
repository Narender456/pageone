"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { useToast } from "../../hooks/use-toast"
import { pagesApi } from "../../lib/pages-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

// A simplified list of common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
]

export function PageDialog({ page, studies, sites, stages = [], open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    css: "",
    stages: "", // Stores stage ID
    studies: [], // Stores study IDs
    sites: [], // Stores site-study pair strings: "siteId-studyId"
    shipment: "", // Stores shipment ID
    generateScreeningInRandomization: false,
    windowStart: "",
    windowEnd: "",
    timezone: "UTC",
    phase: "development",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [availableShipments, setAvailableShipments] = useState([])
  const [availableSiteStudyPairs, setAvailableSiteStudyPairs] = useState([])
  const [searchTermStudies, setSearchTermStudies] = useState("")
  const { toast } = useToast()

  // Reset form when dialog opens/closes or page changes
  useEffect(() => {
    if (open) {
      if (page) {
        // Initialize sites with "siteId-studyId" pairs from existing assignments
        const initialSiteStudyPairs =
          page.pageSiteStudyAssignments?.map((assignment) => `${assignment.site.id}-${assignment.study.id}`) || []

        setFormData({
          title: page.title || "",
          content: page.content || "",
          css: page.css || "",
          stages: page.stages?.id || "",
          studies: page.studies?.map((s) => s.id) || [],
          sites: initialSiteStudyPairs,
          shipment: page.shipment?.id || "",
          generateScreeningInRandomization: page.generateScreeningInRandomization || false,
          windowStart: page.windowStart ? new Date(page.windowStart).toISOString().slice(0, 16) : "",
          windowEnd: page.windowEnd ? new Date(page.windowEnd).toISOString().slice(0, 16) : "",
          timezone: page.timezone || "UTC",
          phase: page.phase || "development",
        })
      } else {
        setFormData({
          title: "",
          content: "",
          css: "",
          stages: "",
          studies: [],
          sites: [],
          shipment: "",
          generateScreeningInRandomization: false,
          windowStart: "",
          windowEnd: "",
          timezone: "UTC",
          phase: "development",
        })
      }
      setSearchTermStudies("") // Reset search term on dialog open
    }
  }, [open, page])

  // Fetch sites dynamically based on selected studies
  useEffect(() => {
    const fetchSitesForSelectedStudies = async () => {
      if (formData.studies.length > 0) {
        try {
          const response = await pagesApi.fetchSitesForStudies(formData.studies)
          if (response.success) {
            setAvailableSiteStudyPairs(response.data.sites)
          }
        } catch (error) {
          console.error("Error fetching sites for studies:", error)
          setAvailableSiteStudyPairs([])
        }
      } else {
        setAvailableSiteStudyPairs([])
      }
    }
    fetchSitesForSelectedStudies()
  }, [formData.studies])

  // Fetch shipments when exactly one study and one site are selected
  useEffect(() => {
    const fetchShipments = async () => {
      if (formData.studies.length === 1 && formData.sites.length === 1) {
        const selectedStudyId = formData.studies[0]
        const selectedSiteStudyPair = formData.sites[0]
        const selectedSiteId = selectedSiteStudyPair.split("-")[0] // Extract site ID from "siteId-studyId"

        try {
          const response = await pagesApi.fetchShipments(selectedStudyId, selectedSiteId)
          if (response.success) {
            setAvailableShipments(response.data.shipments)
          }
        } catch (error) {
          console.error("Error fetching shipments:", error)
          setAvailableShipments([])
        }
      } else {
        setAvailableShipments([])
        setFormData((prev) => ({ ...prev, shipment: "" })) // Clear shipment if criteria not met
      }
    }
    fetchShipments()
  }, [formData.studies, formData.sites])

  // Determine if shipment and screening fields should be visible
  const isRandomizationStage = useMemo(() => {
    const selectedStage = stages.find((s) => s.id === formData.stages)
    return selectedStage?.name.toLowerCase() === "randomization"
  }, [formData.stages, stages])

  // Filter studies based on search term
  const filteredStudies = useMemo(() => {
    if (!searchTermStudies) {
      return studies
    }
    return studies.filter(
      (study) =>
        study.studyName.toLowerCase().includes(searchTermStudies.toLowerCase()) ||
        study.studyNumber.toLowerCase().includes(searchTermStudies.toLowerCase()) ||
        study.description?.toLowerCase().includes(searchTermStudies.toLowerCase()),
    )
  }, [studies, searchTermStudies])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        windowStart: formData.windowStart ? new Date(formData.windowStart).toISOString() : null,
        windowEnd: formData.windowEnd ? new Date(formData.windowEnd).toISOString() : null,
      }

      let response
      if (page) {
        response = await pagesApi.updatePage(page.slug, submitData)
      } else {
        response = await pagesApi.createPage(submitData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Page ${page ? "updated" : "created"} successfully`,
        })
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast({
        title: "Error",
        description: `Failed to ${page ? "update" : "create"} page`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudyChange = (studyId, checked) => {
    setFormData((prev) => ({
      ...prev,
      studies: checked ? [...prev.studies, studyId] : prev.studies.filter((id) => id !== studyId),
    }))
  }

  const handleSiteStudyPairChange = (pair, checked) => {
    setFormData((prev) => ({
      ...prev,
      sites: checked ? [...prev.sites, pair] : prev.sites.filter((p) => p !== pair),
    }))
  }

  const handleSelectAllStudies = (checked) => {
    setFormData((prev) => ({
      ...prev,
      studies: checked ? studies.map((s) => s.id) : [],
    }))
  }

  const formatShipmentLabel = (shipment) => {
    const studyName = shipment.study?.studyName || "N/A"
    const siteName = shipment.siteNumber?.siteName || "N/A"
    const shipmentType = shipment.selectType || "N/A"
    return `${shipment.shipmentNumber} | ${studyName} | ${siteName} | Type: ${shipmentType}`
  }

  const isShipmentReadOnly = page && page.shipment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Edit Page" : "Create New Page"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter page title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stages">Stage *</Label>
              <Select
                value={formData.stages}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, stages: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Enter page content"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="css">CSS</Label>
            <Textarea
              id="css"
              value={formData.css}
              onChange={(e) => setFormData((prev) => ({ ...prev, css: e.target.value }))}
              placeholder="Enter custom CSS"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phase">Phase</Label>
              <Select
                value={formData.phase}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, phase: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="migrate">Migrate</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="windowStart">Window Start</Label>
              <Input
                id="windowStart"
                type="datetime-local"
                value={formData.windowStart}
                onChange={(e) => setFormData((prev) => ({ ...prev, windowStart: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="windowEnd">Window End</Label>
              <Input
                id="windowEnd"
                type="datetime-local"
                value={formData.windowEnd}
                onChange={(e) => setFormData((prev) => ({ ...prev, windowEnd: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Study Selection */}
          <div className="space-y-4">
            <Label>Assign Studies</Label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search studies..."
                value={searchTermStudies}
                onChange={(e) => setSearchTermStudies(e.target.value)}
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSelectAllStudies(filteredStudies.length !== formData.studies.length)}
              >
                {filteredStudies.length === formData.studies.length && filteredStudies.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Study Name</TableHead>
                    <TableHead>Study Number</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No studies found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudies.map((study) => (
                      <TableRow key={study.id}>
                        <TableCell>
                          <Checkbox
                            id={`study-${study.id}`}
                            checked={formData.studies.includes(study.id)}
                            onCheckedChange={(checked) => handleStudyChange(study.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{study.studyName}</TableCell>
                        <TableCell>{study.studyNumber}</TableCell>
                        <TableCell>{study.description || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Site Selection (Dynamic) */}
          <div className="space-y-4">
            <Label>Assign Sites under Studies</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Study Name</TableHead>
                    <TableHead>Site ID</TableHead>
                    <TableHead>PI Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSiteStudyPairs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {formData.studies.length === 0
                          ? "Select studies to view available sites."
                          : "No sites found for selected studies."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableSiteStudyPairs.map((pair) => {
                      const pairValue = `${pair.siteId}-${pair.studyId}`
                      return (
                        <TableRow key={pairValue}>
                          <TableCell>
                            <Checkbox
                              id={`site-${pairValue}`}
                              checked={formData.sites.includes(pairValue)}
                              onCheckedChange={(checked) => handleSiteStudyPairChange(pairValue, checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{pair.siteName}</TableCell>
                          <TableCell>{pair.studyName}</TableCell>
                          <TableCell>{pair.siteIdentifier}</TableCell>
                          <TableCell>{pair.piName || "N/A"}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Shipment Selection (Conditional) */}
          {isRandomizationStage && (
            <div className="space-y-2">
              <Label htmlFor="shipment">Assign Shipment</Label>
              <Select
                value={formData.shipment}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, shipment: value }))}
                disabled={availableShipments.length === 0 || isShipmentReadOnly}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isShipmentReadOnly
                        ? "Shipment already assigned (Read-Only)"
                        : availableShipments.length === 0
                          ? "Select Study and Site to view shipments"
                          : "Select shipment"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableShipments.map((shipment) => (
                    <SelectItem key={shipment.id} value={shipment.id}>
                      {formatShipmentLabel(shipment)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isShipmentReadOnly && (
                <p className="text-sm text-muted-foreground">This shipment is read-only in edit mode.</p>
              )}
            </div>
          )}

          {/* Generate Screening Number in Randomization (Conditional) */}
          {isRandomizationStage && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generateScreening"
                checked={formData.generateScreeningInRandomization}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, generateScreeningInRandomization: checked }))
                }
              />
              <Label htmlFor="generateScreening">Generate screening number in randomization</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : page ? "Update Page" : "Create Page"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}