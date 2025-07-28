"use client"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Calendar } from "lucide-react"

export function MenuOptionDetailsDialog({ open, onOpenChange, menuOption }) {
  if (!menuOption) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {menuOption.icon && <span>{menuOption.icon}</span>}
            Menu Option Details
          </DialogTitle>
          <DialogDescription>Complete information about the menu option</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm mt-1">{menuOption.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL</label>
                <p className="text-sm mt-1 font-mono bg-muted px-2 py-1 rounded">{menuOption.url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Icon</label>
                <p className="text-sm mt-1">
                  {menuOption.icon ? (
                    <span className="flex items-center gap-2">
                      <span>{menuOption.icon}</span>
                      <code className="text-xs bg-muted px-1 rounded">{menuOption.icon}</code>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No icon</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order</label>
                <p className="text-sm mt-1">{menuOption.order}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status and Type */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status & Type</h3>
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={menuOption.isActive ? "default" : "secondary"}>
                    {menuOption.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1">
                  <Badge variant={menuOption.isSystemMenu ? "outline" : "secondary"}>
                    {menuOption.isSystemMenu ? "System Menu" : "Custom Menu"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hierarchy */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Hierarchy</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Parent Menu</label>
                <p className="text-sm mt-1">
                  {menuOption.parent ? (
                    typeof menuOption.parent === "string" ? (
                      menuOption.parent
                    ) : (
                      menuOption.parent.name
                    )
                  ) : (
                    <span className="text-muted-foreground">No parent (Top level)</span>
                  )}
                </p>
              </div>
              {menuOption.children && menuOption.children.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Child Menus ({menuOption.children.length})
                  </label>
                  <div className="mt-1 space-y-1">
                    {menuOption.children.map((child, index) => (
                      <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                        {child.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {menuOption.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground">{menuOption.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created At
                </label>
                <p className="text-sm mt-1">{formatDate(menuOption.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated At
                </label>
                <p className="text-sm mt-1">{formatDate(menuOption.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}