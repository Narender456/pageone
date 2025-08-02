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

  // Debug: Log stages data when component mounts or stages prop changes
  useEffect(() => {
    console.log('Stages received in PageDialog:', stages);
    console.log('Stages length:', stages?.length || 0);
    console.log('Stages array check:', Array.isArray(stages));
  }, [stages]);

  // Reset form when dialog opens/closes or page changes
  useEffect(() => {
    if (open) {
      if (page) {
        // Get stage ID from various possible formats
        const stageId = page.stages?.id || page.stages?._id || page.stages?.slug || page.stages;
        
        // Initialize sites with "siteId-studyId" pairs from existing assignments
        const initialSiteStudyPairs =
          page.pageSiteStudyAssignments?.map((assignment) => `${assignment.site.id}-${assignment.study.id}`) || []

        setFormData({
          title: page.title || "",
          content: page.content || "",
          css: page.css || "",
          stages: stageId || "",
          studies: page.studies?.map((s) => s.id || s._id) || [],
          sites: initialSiteStudyPairs,
          shipment: page.shipment?.id || page.shipment?._id || "",
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
      // Add validation to ensure formData.studies is defined and not empty
      if (formData.studies && Array.isArray(formData.studies) && formData.studies.length > 0) {
        try {
          // Filter out any undefined or null values from the studies array
          const validStudyIds = formData.studies.filter(id => id !== undefined && id !== null && id !== '');
          
          if (validStudyIds.length > 0) {
            console.log('Fetching sites for studies:', validStudyIds);
            console.log('Available studies:', studies);
            console.log('Available sites:', sites);
            
            // Since the API endpoint seems to be missing, let's create site-study pairs
            // from the available sites and studies data
            const siteStudyPairs = [];
            
            // Match sites with selected studies based on protocol numbers
            validStudyIds.forEach(studyId => {
              const study = studies.find(s => s._id === studyId);
              console.log(`Looking for study with ID ${studyId}:`, study);
              
              if (study) {
                console.log(`Study found: ${study.study_name}, protocol: ${study.protocol_number}`);
                
                // Find sites that match this study's protocol number
                const matchingSites = sites.filter(site => {
                  console.log(`Comparing site protocol ${site.protocolNumber} with study protocol ${study.protocol_number}`);
                  return site.protocolNumber === study.protocol_number;
                });
                
                console.log(`Matching sites for study ${study.study_name}:`, matchingSites);
                
                if (matchingSites.length === 0) {
                  // If no exact match, create a pair anyway for demonstration
                  // In a real scenario, you might want to handle this differently
                  console.log(`No matching sites found for study ${study.study_name}, creating pairs with all sites`);
                  
                  sites.forEach(site => {
                    siteStudyPairs.push({
                      siteId: site._id,
                      studyId: study._id,
                      siteName: site.siteName,
                      studyName: study.study_name,
                      siteIdentifier: site.siteId,
                      piName: site.piName
                    });
                  });
                } else {
                  matchingSites.forEach(site => {
                    siteStudyPairs.push({
                      siteId: site._id,
                      studyId: study._id,
                      siteName: site.siteName,
                      studyName: study.study_name,
                      siteIdentifier: site.siteId,
                      piName: site.piName
                    });
                  });
                }
              } else {
                console.log(`No study found with ID ${studyId}`);
              }
            });
            
            console.log('Generated site-study pairs:', siteStudyPairs);
            setAvailableSiteStudyPairs(siteStudyPairs);
            
          } else {
            setAvailableSiteStudyPairs([])
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
  }, [formData.studies, sites, studies])

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
    if (!formData.stages || !stages || stages.length === 0) {
      return false;
    }
    
    const selectedStage = stages.find((s) => {
      const stageId = s.id || s._id || s.slug;
      return stageId === formData.stages;
    });
    
    console.log('Selected stage for randomization check:', selectedStage);
    
    if (!selectedStage) {
      return false;
    }
    
    const stageName = selectedStage.name || selectedStage.title || selectedStage.stageName || '';
    return stageName.toLowerCase().includes('randomization');
  }, [formData.stages, stages])

  // Filter studies based on search term
  const filteredStudies = useMemo(() => {
    if (!searchTermStudies) {
      return studies
    }
    return studies.filter(
      (study) =>
        // Use the correct property names from your data structure
        (study.study_name && study.study_name.toLowerCase().includes(searchTermStudies.toLowerCase())) ||
        (study.protocol_number && study.protocol_number.toLowerCase().includes(searchTermStudies.toLowerCase())) ||
        (study.description && study.description.toLowerCase().includes(searchTermStudies.toLowerCase())) ||
        (study.study_title && study.study_title.toLowerCase().includes(searchTermStudies.toLowerCase()))
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
    if (checked) {
      // Select all filtered studies
      const allFilteredStudyIds = filteredStudies.map((s) => s._id)
      setFormData((prev) => ({
        ...prev,
        studies: allFilteredStudyIds,
      }))
    } else {
      // Deselect all studies
      setFormData((prev) => ({
        ...prev,
        studies: [],
      }))
    }
  }

  const formatShipmentLabel = (shipment) => {
    const studyName = shipment.study?.studyName || "N/A"
    const siteName = shipment.siteNumber?.siteName || "N/A"
    const shipmentType = shipment.selectType || "N/A"
    return `${shipment.shipmentNumber} | ${studyName} | ${siteName} | Type: ${shipmentType}`
  }

  const isShipmentReadOnly = page && page.shipment

  // Check if all filtered studies are selected
  const areAllFilteredStudiesSelected = filteredStudies.length > 0 && 
    filteredStudies.every(study => formData.studies.includes(study._id))

  // Debug: Log current stages and formData.stages
  console.log('Current stages in render:', stages);
  console.log('Current formData.stages:', formData.stages);

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
                  {!stages || stages.length === 0 ? (
                    <SelectItem value="no-stages" disabled>
                      No stages available
                    </SelectItem>
                  ) : (
                    stages.map((stage) => {
                      const stageId = stage.id || stage._id || stage.slug;
                      const stageName = stage.name || stage.title || stage.stageName || `Stage ${stageId}`;
                      
                      return (
                        <SelectItem key={stageId} value={stageId}>
                          {stageName}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500">
                  Debug: {stages?.length || 0} stages available
                </div>
              )}
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
                onClick={() => handleSelectAllStudies(!areAllFilteredStudiesSelected)}
                disabled={filteredStudies.length === 0}
              >
                {areAllFilteredStudiesSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Study Name</TableHead>
                    <TableHead>Protocol Number</TableHead>
                    <TableHead>Study Title</TableHead>
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
                      <TableRow key={study._id}>
                        <TableCell>
                          <Checkbox
                            id={`study-${study._id}`}
                            checked={formData.studies.includes(study._id)}
                            onCheckedChange={(checked) => handleStudyChange(study._id, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{study.study_name || "N/A"}</TableCell>
                        <TableCell>{study.protocol_number || "N/A"}</TableCell>
                        <TableCell>{study.study_title || "N/A"}</TableCell>
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