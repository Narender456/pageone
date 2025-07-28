"use client"

import { useState, useEffect } from "react"
import { Settings, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { useToast } from "../../hooks/use-toast"
import { permissionsApi } from "../../lib/permissions-api"

export function PermissionsDialog({ open, onClose, role }) {
  const [permissions, setPermissions] = useState([])
  const [groupedPermissions, setGroupedPermissions] = useState({})
  const [rootPermissions, setRootPermissions] = useState([])
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchPermissions()
    }
  }, [open, role])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await permissionsApi.getRolePermissions(role._id)

      if (response.success) {
        setPermissions(response.data.permissions)
        setGroupedPermissions(response.data.groupedPermissions)
        setRootPermissions(response.data.rootPermissions)

        // Expand all groups by default
        setExpandedGroups(new Set(Object.keys(response.data.groupedPermissions)))
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId, field, value) => {
    setPermissions((prev) =>
      prev.map((permission) => (permission._id === permissionId ? { ...permission, [field]: value } : permission)),
    )

    // Update grouped permissions
    setGroupedPermissions((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((group) => {
        updated[group] = updated[group].map((permission) =>
          permission._id === permissionId ? { ...permission, [field]: value } : permission,
        )
      })
      return updated
    })

    // Update root permissions
    setRootPermissions((prev) =>
      prev.map((permission) => (permission._id === permissionId ? { ...permission, [field]: value } : permission)),
    )
  }

  const handleGroupToggle = (groupName) => {
    setExpandedGroups((prev) => {
      const updated = new Set(prev)
      if (updated.has(groupName)) {
        updated.delete(groupName)
      } else {
        updated.add(groupName)
      }
      return updated
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const permissionUpdates = permissions.map((permission) => ({
        menuOptionId: typeof permission.menuOption === "string" ? permission.menuOption : permission.menuOption._id,
        canView: permission.canView,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
        canCreate: permission.canCreate,
      }))

      const response = await permissionsApi.updateRolePermissions(role._id, permissionUpdates)

      if (response.success) {
        toast({
          title: "Success",
          description: "Permissions updated successfully",
        })
        onClose()
      }
    } catch (error) {
      console.error("Error updating permissions:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const PermissionRow = ({ permission }) => {
    const menuOption =
      typeof permission.menuOption === "string"
        ? { _id: permission.menuOption, name: "Unknown", url: "#" }
        : permission.menuOption

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{menuOption.name}</p>
            <p className="text-xs text-muted-foreground">{menuOption.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={permission.canView}
              onCheckedChange={(checked) => handlePermissionChange(permission._id, "canView", Boolean(checked))}
            />
            <span className="text-sm">View</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={permission.canCreate}
              onCheckedChange={(checked) => handlePermissionChange(permission._id, "canCreate", Boolean(checked))}
            />
            <span className="text-sm">Create</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={permission.canEdit}
              onCheckedChange={(checked) => handlePermissionChange(permission._id, "canEdit", Boolean(checked))}
            />
            <span className="text-sm">Edit</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={permission.canDelete}
              onCheckedChange={(checked) => handlePermissionChange(permission._id, "canDelete", Boolean(checked))}
            />
            <span className="text-sm">Delete</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>Configure permissions for the "{role.name}" role.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading permissions...</p>
              </div>
            ) : (
              <>
                {/* Root Permissions */}
                {rootPermissions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Main Menu</h3>
                    {rootPermissions.map((permission) => (
                      <PermissionRow key={permission._id} permission={permission} />
                    ))}
                  </div>
                )}

                {/* Grouped Permissions */}
                {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                  <div key={groupName} className="space-y-2">
                    <Collapsible open={expandedGroups.has(groupName)} onOpenChange={() => handleGroupToggle(groupName)}>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                        {expandedGroups.has(groupName) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          {groupName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {groupPermissions.length}
                        </Badge>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-2 ml-6">
                        {groupPermissions.map((permission) => (
                          <PermissionRow key={permission._id} permission={permission} />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}