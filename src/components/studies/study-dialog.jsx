"use client"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { studiesApi } from "../../lib/studies-api"
import { format } from "date-fns"

export function StudyDialog({
  open,
  onOpenChange,
  study,
  // blindingStatuses = [], // Add default empty array
  onStudyCreated,
  onStudyUpdated
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    study_name: "",
    protocol_number: "",
    study_initiation_date: "",
    study_title: "",
    study_start_date: "",
    study_end_date: "",
    // blinding_status: "none"
  })
  const { toast } = useToast()

  const isEditing = !!study

  useEffect(() => {
    if (study) {
      setFormData({
        study_name: study.study_name,
        protocol_number: study.protocol_number,
        study_initiation_date: format(
          new Date(study.study_initiation_date),
          "yyyy-MM-dd"
        ),
        study_title: study.study_title,
        study_start_date: format(
          new Date(study.study_start_date),
          "yyyy-MM-dd"
        ),
        study_end_date: study.study_end_date
          ? format(new Date(study.study_end_date), "yyyy-MM-dd")
          : "",
        blinding_status: study.blinding_status?._id || "none"
      })
    } else {
      setFormData({
        study_name: "",
        protocol_number: "",
        study_initiation_date: format(new Date(), "yyyy-MM-dd"),
        study_title: "",
        study_start_date: "",
        study_end_date: "",
        blinding_status: "none"
      })
    }
  }, [study, open])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        blinding_status: formData.blinding_status || undefined,
        study_end_date: formData.study_end_date || undefined
      }

      if (isEditing) {
        await studiesApi.updateStudy(study._id, submitData)
        onStudyUpdated()
      } else {
        await studiesApi.createStudy(submitData)
        onStudyCreated()
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message || `Failed to ${isEditing ? "update" : "create"} study`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Study" : "Create New Study"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the study information below."
              : "Fill in the details to create a new study."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="study_name">Study Name *</Label>
              <Input
                id="study_name"
                value={formData.study_name}
                onChange={e => handleInputChange("study_name", e.target.value)}
                placeholder="Enter study name"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol_number">Protocol Number *</Label>
              <Input
                id="protocol_number"
                value={formData.protocol_number}
                onChange={e =>
                  handleInputChange("protocol_number", e.target.value)
                }
                placeholder="Enter protocol number"
                required
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="study_title">Study Title *</Label>
            <Textarea
              id="study_title"
              value={formData.study_title}
              onChange={e => handleInputChange("study_title", e.target.value)}
              placeholder="Enter study title"
              required
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="study_initiation_date">Initiation Date</Label>
              <Input
                id="study_initiation_date"
                type="date"
                value={formData.study_initiation_date}
                onChange={e =>
                  handleInputChange("study_initiation_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="study_start_date">Start Date *</Label>
              <Input
                id="study_start_date"
                type="date"
                value={formData.study_start_date}
                onChange={e =>
                  handleInputChange("study_start_date", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="study_end_date">End Date</Label>
              <Input
                id="study_end_date"
                type="date"
                value={formData.study_end_date}
                onChange={e =>
                  handleInputChange("study_end_date", e.target.value)
                }
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="blinding_status">Blinding Status</Label>
            <Select
              value={formData.blinding_status}
              onValueChange={value =>
                handleInputChange("blinding_status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blinding status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No blinding status</SelectItem>
                {blindingStatuses && blindingStatuses.length > 0 && 
                  blindingStatuses.map(status => (
                    <SelectItem key={status._id} value={status._id}>
                      {status.status_name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div> */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Study"
                : "Create Study"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}