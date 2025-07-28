"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stagesAPI } from "../../lib/stagesAPI";
import StageForm from "../../components/stages/StageForm";
import Modal from "../../components/Shipment/Modal";
import Pagination from "../../components/Shipment/Pagination";
import toast from "react-hot-toast"
import { PlusIcon, EditIcon, TrashIcon, ListIcon } from "lucide-react"

const StageList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    study: "all",
    site: "all",
    stage: "all",
  })
  const [showForm, setShowForm] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const queryClient = useQueryClient()

  // Fetch stages with better error handling
  const { data: stagesData, isLoading, error, isError } = useQuery({
    queryKey: ["stages", currentPage, filters],
    queryFn: async () => {
      try {
        const response = await stagesAPI.getAll({
          page: currentPage,
          limit: 10,
          ...filters,
        });
        
        console.log("API Response:", response); // Debug log
        
        // Handle different response structures
        if (response?.data) {
          return response.data;
        } else if (response?.stages) {
          return response;
        } else if (Array.isArray(response)) {
          return { stages: response, pagination: null };
        } else {
          console.warn("Unexpected API response structure:", response);
          return { stages: [], pagination: null };
        }
      } catch (error) {
        console.error("Error fetching stages:", error);
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: 1000,
  })

  console.log("Stages Data:", stagesData); // Debug log
  console.log("Is Loading:", isLoading); // Debug log
  console.log("Error:", error); // Debug log

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (slug) => stagesAPI.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages"] })
      toast.success("Stage deleted successfully")
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete stage")
    },
  })

  const handleEdit = (stage) => {
    setSelectedStage(stage)
    setEditMode(true)
    setShowForm(true)
  }

  const handleDelete = (stage) => {
    if (window.confirm(`Are you sure you want to delete stage "${stage.name}"?`)) {
      deleteMutation.mutate(stage.slug)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedStage(null)
    setEditMode(false)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    queryClient.invalidateQueries({ queryKey: ["stages"] })
    toast.success(editMode ? "Stage updated successfully" : "Stage created successfully")
  }

  // Handle permissions with better fallbacks
  const canEdit = stagesData?.permissions?.canEdit ?? true
  const canDelete = stagesData?.permissions?.canDelete ?? true

  // Get stages array with better fallbacks
  const stages = stagesData?.stages || stagesData?.data?.stages || stagesData || [];
  const pagination = stagesData?.pagination || stagesData?.data?.pagination || null;

  console.log("Processed stages:", stages); // Debug log
  console.log("Processed pagination:", pagination); // Debug log

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ListIcon className="w-6 h-6 mr-2 text-black" />
            Stage Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">Manage and organize study stages</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setShowForm(true)} 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Stage
          </button>
        )}
      </div>

      {/* Debug Information (Remove in production)
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
          <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
            {JSON.stringify({ 
              isLoading, 
              isError, 
              error: error?.message, 
              stagesCount: stages?.length,
              hasData: !!stagesData,
              dataStructure: stagesData ? Object.keys(stagesData) : null
            }, null, 2)}
          </pre>
        </div>
      )} */}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Study</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                value={filters.study}
                onChange={(e) => setFilters({ ...filters, study: e.target.value })}
              >
                <option value="all">All Studies</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                value={filters.site}
                onChange={(e) => setFilters({ ...filters, site: e.target.value })}
              >
                <option value="all">All Sites</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              >
                <option value="all">All Stages</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ study: "all", site: "all", stage: "all" })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Error Loading Stages:</h3>
          <p className="text-sm text-red-700">
            {error?.response?.data?.message || error?.message || "Failed to load stages"}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["stages"] })}
            className="mt-2 px-3 py-1 text-xs font-medium text-red-800 bg-red-100 border border-red-300 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stages Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                {(canEdit || canDelete) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={canEdit || canDelete ? "6" : "5"} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-500">Loading stages...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={canEdit || canDelete ? "6" : "5"} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-red-500 mb-2">⚠️ Error loading data</div>
                      <p className="text-gray-500 text-sm">Please check your connection and try again</p>
                    </div>
                  </td>
                </tr>
              ) : Array.isArray(stages) && stages.length > 0 ? (
                stages.map((stage, index) => (
                  <tr key={stage._id || stage.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stage.orderNumber || stage.order || index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stage.name || 'Unnamed Stage'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={stage.description}>
                        {stage.description || (
                          <span className="italic text-gray-400">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stage.dateCreated || stage.createdAt ? 
                        new Date(stage.dateCreated || stage.createdAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stage.lastUpdated || stage.updatedAt ? 
                        new Date(stage.lastUpdated || stage.updatedAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(stage)}
                              className="text-green-600 hover:text-green-900 transition-colors duration-150 p-1 rounded hover:bg-green-50"
                              title="Edit Stage"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(stage)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1 rounded hover:bg-red-50"
                              title="Delete Stage"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit || canDelete ? "6" : "5"} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <ListIcon className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No stages found</h3>
                      <p className="text-gray-500">Get started by creating your first stage.</p>
                      {canEdit && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add First Stage
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Stage Form Modal */}
      <Modal isOpen={showForm} onClose={handleFormClose} title={editMode ? "Edit Stage" : "Add Stage"} size="lg">
        <StageForm stage={selectedStage} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
      </Modal>
    </div>
  )
}

export default StageList