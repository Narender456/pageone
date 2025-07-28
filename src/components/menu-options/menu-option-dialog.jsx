"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { menuOptionsApi } from "../../lib/menu-options-api"

export function MenuOptionDialog({ open, onOpenChange, menuOption, onSave, mode }) {
  const [loading, setLoading] = useState(false)
  const [parentOptions, setParentOptions] = useState([])
  const [usedOrderNumbers, setUsedOrderNumbers] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    icon: "",
    parent: "",
    order: 0,
    description: "",
    isActive: true,
  })
  const { toast } = useToast()
  const minOrder = 11

  useEffect(() => {
    if (open) {
      fetchParentOptions()
      fetchUsedOrderNumbers()

      if (mode === "edit" && menuOption) {
        setFormData({
          name: menuOption.name,
          url: menuOption.url,
          icon: menuOption.icon || "",
          parent: typeof menuOption.parent === "string" ? menuOption.parent : menuOption.parent?._id || "",
          order: menuOption.order,
          description: menuOption.description || "",
          isActive: menuOption.isActive,
        })
      } else {
        setFormData({
          name: "",
          url: "",
          icon: "nav-icon ",
          parent: "",
          order: 0,
          description: "",
          isActive: true,
        })
      }
    }
  }, [open, mode, menuOption])

  useEffect(() => {
    if (mode === "create" && usedOrderNumbers.length > 0) {
      const nextOrder = Math.max(minOrder, ...usedOrderNumbers) + 1
      setFormData((prev) => ({
        ...prev,
        order: nextOrder,
      }))
    }
  }, [usedOrderNumbers, mode])

const fetchParentOptions = async () => {
  try {
    const response = await menuOptionsApi.getParentMenuOptions()
    console.log("Parent options API response:", response) // Debug log
    
    // The API returns data directly as an array
    if (Array.isArray(response)) {
      console.log("Raw response data:", response) // Debug: see raw data
      
      // Remove the order > 10 filter temporarily to see all options
      const filteredParents = response.filter((menu) => {
        console.log("Menu item:", menu) // Debug: see each item
        console.log("Menu order:", menu?.order, "Menu name:", menu?.name) // Debug properties
        return menu && menu.name // Only check if menu exists and has a name
      })
      
      console.log("Filtered parents:", filteredParents) // Debug: see filtered result
      setParentOptions(filteredParents)
    } else if (response?.data && Array.isArray(response.data)) {
      // Fallback for wrapped response
      console.log("Using fallback - response.data:", response.data)
      const filteredParents = response.data.filter((menu) => menu && menu.name)
      console.log("Filtered parents (fallback):", filteredParents)
      setParentOptions(filteredParents)
    } else {
      console.warn("Unexpected response structure:", response)
      setParentOptions([])
    }
    
  } catch (error) {
    console.error("Error fetching parent options:", error)
    setParentOptions([])
  }
}

const fetchUsedOrderNumbers = async () => {
  try {
    const response = await menuOptionsApi.getMenuOptions()
    console.log("Menu options API response:", response) // Debug log
    
    // The API returns data directly as an array
    if (Array.isArray(response)) {
      const orders = response
        .filter(menu => menu && typeof menu.order !== 'undefined')
        .map(menu => menu.order)
      setUsedOrderNumbers(orders)
    } else if (response?.data && Array.isArray(response.data)) {
      // Fallback for wrapped response
      const orders = response.data
        .filter(menu => menu && typeof menu.order !== 'undefined')
        .map(menu => menu.order)
      setUsedOrderNumbers(orders)
    } else {
      console.warn("Unexpected response structure:", response)
      setUsedOrderNumbers([])
    }
    
  } catch (error) {
    console.error("Error fetching used order numbers:", error)
    setUsedOrderNumbers([])
  }
}
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    const data = {
      name: formData.name,
      url: formData.url,
      icon: formData.icon || undefined,
      parent: formData.parent || null,
      order: formData.order,
      description: formData.description || undefined,
      ...(mode === "edit" && { isActive: formData.isActive }),
    }

    if (mode === "create") {
      await menuOptionsApi.createMenuOption(data)
      toast({
        title: "Success",
        description: "Menu option created successfully",
      })
    } else {
      await menuOptionsApi.updateMenuOption(menuOption._id, data)
      toast({
        title: "Success",
        description: "Menu option updated successfully",
      })
    }

    // Call the onSave callback which should refresh the navigation
    onSave()
    
    // Close the dialog
    onOpenChange(false)
    
  } catch (error) {
    console.error("Error saving menu option:", error)
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to save menu option",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateOrderNumber = (value) => {
    if (value < minOrder) {
      toast({
        title: "Invalid Order",
        description: `Order number must be greater than or equal to ${minOrder}.`,
        variant: "destructive",
      })
      return minOrder
    }

    if (usedOrderNumbers.includes(value) && !(mode === "edit" && menuOption && menuOption.order === value)) {
      toast({
        title: "Invalid Order",
        description: `Order number ${value} is already in use. Please choose another.`,
        variant: "destructive",
      })
      return 0
    }

    return value
  }

  const handleIconChange = (value) => {
    if (!value.startsWith("nav-icon")) {
      value = "nav-icon " + value.replace("nav-icon", "").trim()
    }
    handleInputChange("icon", value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Menu" : "Edit Menu"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new menu option to the navigation system."
              : "Update the menu option details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Menu Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Menu name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Menu URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              placeholder="/path or #"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                nav-icon
              </span>
              <Input
                id="icon"
                value={formData.icon.replace("nav-icon", "").trim()}
                onChange={(e) => handleIconChange(e.target.value)}
                placeholder="fa-home"
                className="rounded-l-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Menu (optional)</Label>
            <Select value={formData.parent} onValueChange={(value) => handleInputChange("parent", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent</SelectItem>
                {parentOptions
                  .filter((option) => option._id !== menuOption?._id)
                  .map((option) => (
                    <SelectItem key={option._id} value={option._id}>
                      {option.name} (Order: {option.order})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order || ""}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value)
                if (!isNaN(value)) {
                  const validatedValue = validateOrderNumber(value)
                  handleInputChange("order", validatedValue)
                }
              }}
              placeholder={`Minimum ${minOrder}`}
              min={minOrder}
              required
            />
            <p className="text-sm text-muted-foreground">
              Order must be {minOrder} or greater and must be unique
            </p>
          </div>

          {mode === "edit" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.order < minOrder}>
              {loading ? "Saving..." : mode === "create" ? "Create Menu" : "Update Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
