"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/buttons";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Snowflake as Freeze,
  Unplug as Unfreeze
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { PageDialog } from "./page-dialog";
import { DeletePageDialog } from "./delete-page-dialog";
import { pagesApi } from "../../lib/pages-api";

export function PageManagement({ initialPages = [], studies = [], sites = [], stages = [] }) {

  const [pages, setPages] = useState(initialPages);
  const [filteredPages, setFilteredPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudy, setSelectedStudy] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Initialize permissions with canEdit: true for testing, or add fallback logic
  const [permissions, setPermissions] = useState({ canEdit: true, canDelete: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const response = await pagesApi.getPages({
        study: selectedStudy,
        site: selectedSite,
        page: currentPage
      });

      if (response.success) {
        setPages(response.data.pages);
        // Ensure permissions are properly set, with fallback
        setPermissions({
          canEdit: response.data.permissions?.canEdit ?? true,
          canDelete: response.data.permissions?.canDelete ?? true
        });
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading pages:", error);
      // Set default permissions on error to ensure UI functionality
      setPermissions({ canEdit: true, canDelete: true });
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = pages;

    if (searchTerm) {
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.form?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPhase !== "all") {
      filtered = filtered.filter((page) => page.phase === selectedPhase);
    }

    setFilteredPages(filtered);
  }, [pages, searchTerm, selectedPhase]);

  useEffect(() => {
    loadPages();
  }, [selectedStudy, selectedSite, currentPage]);

  const handleCreatePage = () => {
    setSelectedPage(null);
    setIsPageDialogOpen(true);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setIsPageDialogOpen(true);
  };

  const handleDeletePage = (page) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };

  const handleViewPage = (page) => {
    window.open(`/pages/view/${page.slug}`, "_blank");
  };

  const handlePhaseTransition = async (page, action) => {
    try {
      let response;
      switch (action) {
        case "testing":
          response = await pagesApi.moveToTesting(page.slug);
          break;
        case "migrate":
          response = await pagesApi.moveToMigrate(page.slug);
          break;
        case "live":
          response = await pagesApi.moveToLive(page.slug);
          break;
        case "development":
          response = await pagesApi.moveToDevelopment(page.slug);
          break;
        case "mark-passed":
          response = await pagesApi.markTestingPassed(page.slug);
          break;
        case "toggle-freeze":
          response = await pagesApi.toggleFreezePage(page.slug);
          break;
        default:
          return;
      }

      if (response.success) {
        toast({
          title: "Success",
          description: response.message
        });
        loadPages();
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} page`,
        variant: "destructive"
      });
    }
  };

  const getPhaseBadgeColor = (phase) => {
    switch (phase) {
      case "development":
        return "bg-blue-100 text-blue-800";
      case "testing":
        return "bg-yellow-100 text-yellow-800";
      case "migrate":
        return "bg-orange-100 text-orange-800";
      case "live":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailableActions = (page) => {
    const actions = [];

    if (permissions.canEdit) {
      actions.push({ label: "Edit", icon: Edit, action: () => handleEditPage(page) });
    }

    actions.push({ label: "View", icon: Eye, action: () => handleViewPage(page) });

    if (page.phase === "development" && permissions.canEdit) {
      actions.push({
        label: "Move to Testing",
        icon: Play,
        action: () => handlePhaseTransition(page, "testing")
      });
    }

    if (page.phase === "testing" && permissions.canEdit) {
      actions.push({
        label: "Mark as Passed",
        icon: CheckCircle,
        action: () => handlePhaseTransition(page, "mark-passed")
      });

      if (page.testingPassed) {
        actions.push({
          label: "Move to Migrate",
          icon: ArrowRight,
          action: () => handlePhaseTransition(page, "migrate")
        });
      }
    }

    if (page.phase === "migrate" && permissions.canEdit) {
      actions.push({
        label: "Move to Live",
        icon: ArrowRight,
        action: () => handlePhaseTransition(page, "live")
      });
    }

    if (page.phase === "live" && permissions.canEdit) {
      actions.push({
        label: "Revert to Development",
        icon: RotateCcw,
        action: () => handlePhaseTransition(page, "development")
      });
    }

    if (permissions.canEdit) {
      actions.push({
        label: page.isActive ? "Freeze" : "Unfreeze",
        icon: page.isActive ? Freeze : Unfreeze,
        action: () => handlePhaseTransition(page, "toggle-freeze")
      });
    }

    if (permissions.canDelete && page.phase !== "live") {
      actions.push({
        label: "Delete",
        icon: Trash2,
        action: () => handleDeletePage(page),
        destructive: true
      });
    }

    return actions;
  };

  // Debug: Log permissions to check their state
  console.log("Current permissions:", permissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Page Management</h1>
          <p className="text-muted-foreground">Manage clinical trial pages and their lifecycle phases</p>
        </div>
        {/* Always show button for debugging, or add explicit check */}
        {(permissions.canEdit || true) && (
          <Button onClick={handleCreatePage}>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Study</label>
              <Select value={selectedStudy} onValueChange={setSelectedStudy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Studies</SelectItem>
                  {studies.map((study) => (
                    <SelectItem key={study.id} value={study.id}>
                      {study.studyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.siteName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phase</label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="migrate">Migrate</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pages ({filteredPages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Phase</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Studies</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading pages...
                    </TableCell>
                  </TableRow>
                ) : filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No pages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        {page.title}
                        {!page.isActive && (
                          <Badge variant="secondary" className="ml-2">
                            Frozen
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{page.stages?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getPhaseBadgeColor(page.phase)}>{page.phase}</Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex items-center space-x-2">
                          {page.phase === "testing" && (
                            <Badge variant={page.testingPassed ? "default" : "secondary"}>
                              {page.testingPassed ? "Passed" : "Pending"}
                            </Badge>
                          )}
                          {page.isEdited && <Badge variant="outline">Edited</Badge>}
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {page.studies?.slice(0, 2).map((study) => (
                            <Badge key={study.id} variant="outline" className="text-xs">
                              {study.study_name}
                            </Badge>
                          ))}
                          {page.studies && page.studies.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{page.studies.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(page.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getAvailableActions(page).map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={action.action}
                                className={action.destructive ? "text-red-600" : ""}
                              >
                                <action.icon className="h-4 w-4 mr-2" />
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
<PageDialog
  page={selectedPage}
  studies={studies}
  sites={sites}
  stages={stages} // ✅ FIX ADDED HERE
  open={isPageDialogOpen}
  onOpenChange={setIsPageDialogOpen}
  onSuccess={() => {
    loadPages()
    setIsPageDialogOpen(false)
  }}
/>


      <DeletePageDialog
        page={selectedPage}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={() => {
          loadPages()
          setIsDeleteDialogOpen(false)
        }}
      />
    </div>
  )
}