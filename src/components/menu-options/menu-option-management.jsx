"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "../ui/buttons"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { menuOptionsApi } from "../../lib/menu-options-api"
import { MenuOptionDialog } from "./menu-option-dialog"
import { DeleteMenuOptionDialog } from "./delete-menu-option-dialog"
import { MenuOptionDetailsDialog } from "./menu-option-details-dialog"

export function MenuOptionManagement() {
  const [menuOptions, setMenuOptions] = useState([])
  const [menuHierarchy, setMenuHierarchy] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMenuOption, setSelectedMenuOption] = useState(null)
  const [dialogType, setDialogType] = useState(null)
  const { toast } = useToast()
  const itemsPerPage = 10

const fetchMenuHierarchy = async () => {
  try {
    const response = await menuOptionsApi.getMenuHierarchy()
    console.log("Menu hierarchy API response:", response) // Debug log
    
    // The API returns data directly as an array (same as other endpoints)
    if (Array.isArray(response)) {
      console.log("Raw hierarchy data:", response) // Debug: see raw data
      
      const filteredHierarchy = response.filter((menu) => {
        console.log("Checking hierarchy menu:", menu) // Debug each item
        return menu && menu.order >= 11
      })
      
      console.log("Filtered hierarchy:", filteredHierarchy) // Debug filtered result
      setMenuHierarchy(filteredHierarchy)
    } else if (response?.data && Array.isArray(response.data)) {
      // Fallback for wrapped response
      console.log("Using fallback - response.data:", response.data)
      const filteredHierarchy = response.data.filter((menu) => menu && menu.order >= 11)
      console.log("Filtered hierarchy (fallback):", filteredHierarchy)
      setMenuHierarchy(filteredHierarchy)
    } else {
      console.warn("Unexpected hierarchy response structure:", response)
      setMenuHierarchy([])
    }
  } catch (error) {
    console.error("Error fetching menu hierarchy:", error)
    setMenuHierarchy([]) // Ensure state is set to empty array on error
  }
}

const fetchMenuOptions = async () => {
  try {
    setLoading(true)
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      sortBy: "order",
      sortOrder: "asc",
    }

    const response = await menuOptionsApi.getMenuOptions(params)
    console.log("Menu options API response:", response) // Debug log
    
    // Handle different response structures
    if (Array.isArray(response)) {
      // Direct array response
      setMenuOptions(response)
      setTotalPages(Math.ceil(response.length / itemsPerPage))
    } else if (response?.data && Array.isArray(response.data)) {
      // Wrapped response with data property
      setMenuOptions(response.data)
      setTotalPages(Math.ceil((response.total || response.data.length) / itemsPerPage))
    } else if (response && typeof response === 'object') {
      // Response might have different structure
      const dataArray = response.data || response.items || response.results || []
      setMenuOptions(Array.isArray(dataArray) ? dataArray : [])
      setTotalPages(Math.ceil((response.total || response.count || dataArray.length) / itemsPerPage))
    } else {
      console.warn("Unexpected menu options response structure:", response)
      setMenuOptions([])
      setTotalPages(1)
    }
  } catch (error) {
    console.error("Error fetching menu options:", error)
    setMenuOptions([]) // Ensure state is set to empty array on error
    setTotalPages(1)
    toast({
      title: "Error",
      description: "Failed to fetch menu options",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchMenuOptions()
    fetchMenuHierarchy()
  }, [currentPage, searchTerm, statusFilter])

  const handleCreateMenuOption = () => {
    setSelectedMenuOption(null)
    setDialogType("create")
  }

  const handleEditMenuOption = (menuOption) => {
    setSelectedMenuOption(menuOption)
    setDialogType("edit")
  }

  const handleDeleteMenuOption = (menuOption) => {
    setSelectedMenuOption(menuOption)
    setDialogType("delete")
  }

  const handleViewMenuOption = (menuOption) => {
    setSelectedMenuOption(menuOption)
    setDialogType("details")
  }

  const handleDialogClose = () => {
    setDialogType(null)
    setSelectedMenuOption(null)
  }

  const handleMenuOptionSaved = () => {
    fetchMenuOptions()
    fetchMenuHierarchy()
    handleDialogClose()
  }

  const handleMenuOptionDeleted = () => {
    fetchMenuOptions()
    fetchMenuHierarchy()
    handleDialogClose()
  }

  const getParentName = (menuOption) => {
    if (!menuOption.parent) return "None"
    return typeof menuOption.parent === "object" ? menuOption.parent.name : "Unknown"
  }

  const renderMenuItems = () => {
    if (menuHierarchy.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8">
            No menu options found
          </TableCell>
        </TableRow>
      )
    }

    return menuHierarchy.map((menu) => (
      <React.Fragment key={menu._id}>
        <TableRow>
          <TableCell className="font-medium">{menu.name}</TableCell>
          <TableCell>None</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMenuOption(menu)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditMenuOption(menu)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {!menu.isSystemMenu && (
                  <DropdownMenuItem onClick={() => handleDeleteMenuOption(menu)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {menu.children &&
          menu.children.length > 0 &&
          menu.children
            .filter((submenu) => submenu.order >= 11)
            .map((submenu) => (
              <TableRow key={submenu._id}>
                <TableCell className="font-medium pl-8">— {submenu.name}</TableCell>
                <TableCell>{menu.name}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewMenuOption(submenu)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditMenuOption(submenu)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {!submenu.isSystemMenu && (
                        <DropdownMenuItem onClick={() => handleDeleteMenuOption(submenu)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
      </React.Fragment>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu List</h1>
          <p className="text-muted-foreground">Manage navigation menu options and their hierarchy</p>
        </div>
        <Button onClick={handleCreateMenuOption}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Options</CardTitle>
          <CardDescription>A list of all menu options in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Menu</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderMenuItems()}</TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MenuOptionDialog
        open={dialogType === "create" || dialogType === "edit"}
        onOpenChange={handleDialogClose}
        menuOption={selectedMenuOption}
        onSave={handleMenuOptionSaved}
        mode={dialogType === "create" ? "create" : "edit"}
      />

      <DeleteMenuOptionDialog
        open={dialogType === "delete"}
        onOpenChange={handleDialogClose}
        menuOption={selectedMenuOption}
        onDelete={handleMenuOptionDeleted}
      />

      <MenuOptionDetailsDialog
        open={dialogType === "details"}
        onOpenChange={handleDialogClose}
        menuOption={selectedMenuOption}
      />
    </div>
  )
}
