"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentsAPI } from "../../lib/DrugShipmentAPI"
import { studiesApi } from "../../lib/studies-api"
import { siteAPI } from "../../lib/SiteAPI"
import ShipmentForm from "../../components/Shipment/ShipmentForm"
import ShipmentDetails from "../../components/Shipment/ShipmentDetails"
import Modal from "../../components/Shipment/Modal"
import Pagination from "../../components/Shipment/Modal"
import toast from "react-hot-toast"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"

const ShipmentList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    study: "",
    site: "",
    selectType: "",
  })
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const queryClient = useQueryClient()

  // Fetch shipments
const { data: shipmentsData, isLoading } = useQuery({
  queryKey: ["shipments", currentPage, filters],
  queryFn: () =>
    shipmentsAPI.getAll({
      page: currentPage,
      limit: 10,
      ...filters,
    }),
  select: (response) => response.data,
  keepPreviousData: true,
});

  // Fetch studies for filter
const { data: studies } = useQuery({
  queryKey: ["studies"],
  queryFn: () => studiesApi.getAll(),
  select: (response) => response.data,
});

const { data: sites } = useQuery({
  queryKey: ["sites", filters.study],
  queryFn: () => siteAPI.getAll({ study: filters.study }),
  select: (response) => response.data,
  enabled: !!filters.study,
});

  // Delete mutation
const deleteMutation = useMutation({
  mutationFn: (id) => shipmentsAPI.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["shipments"] });
    toast.success("Shipment deleted successfully");
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to delete shipment");
  },
});

  const handleEdit = (shipment) => {
    setSelectedShipment(shipment)
    setEditMode(true)
    setShowForm(true)
  }

  const handleDelete = (shipment) => {
    if (window.confirm(`Are you sure you want to delete shipment ${shipment.shipmentNumber}?`)) {
      deleteMutation.mutate(shipment._id)
    }
  }

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment)
    setShowDetails(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedShipment(null)
    setEditMode(false)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    queryClient.invalidateQueries("shipments")
    toast.success(editMode ? "Shipment updated successfully" : "Shipment created successfully")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drug Shipments</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and track all drug shipments</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shipment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Study</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filters.study}
                  onChange={(e) => setFilters({ ...filters, study: e.target.value, site: "" })}
                >
                  <option value="">All Studies</option>
                  {studies?.map((study) => (
                    <option key={study._id} value={study._id}>
                      {study.studyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={filters.site}
                  onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                  disabled={!filters.study}
                >
                  <option value="">All Sites</option>
                  {sites?.map((site) => (
                    <option key={site._id} value={site._id}>
                      {site.siteName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filters.selectType}
                  onChange={(e) => setFilters({ ...filters, selectType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="Drug">Drug</option>
                  <option value="DrugGroup">Drug Group</option>
                  <option value="Randomization">Randomization</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ study: "", site: "", selectType: "" })}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">R/M/D</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading shipments...</p>
                      </div>
                    </td>
                  </tr>
                ) : shipmentsData?.shipments?.length > 0 ? (
                  shipmentsData.shipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.study?.studyName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.shipmentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.siteNumber?.siteName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(shipment.shipmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {shipment.selectType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            shipment.isAcknowledged 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {shipment.isAcknowledged ? "Acknowledged" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center text-green-600">
                            <span className="font-medium">R:</span>
                            <span className="ml-1">{shipment.receivedCount || 0}</span>
                          </div>
                          <div className="flex items-center text-yellow-600">
                            <span className="font-medium">M:</span>
                            <span className="ml-1">{shipment.missingCount || 0}</span>
                          </div>
                          <div className="flex items-center text-red-600">
                            <span className="font-medium">D:</span>
                            <span className="ml-1">{shipment.damagedCount || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewDetails(shipment)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">No shipments found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or add a new shipment</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {shipmentsData?.pagination && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(shipmentsData.pagination.pages, currentPage + 1))}
                    disabled={currentPage === shipmentsData.pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{' '}
                      <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{shipmentsData.pagination.pages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, shipmentsData.pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(shipmentsData.pagination.pages, currentPage + 1))}
                        disabled={currentPage === shipmentsData.pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal isOpen={showForm} onClose={handleFormClose} title={editMode ? "Edit Shipment" : "Add Shipment"} size="xl">
          <ShipmentForm shipment={selectedShipment} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
        </Modal>

        <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} title="Shipment Details" size="xl">
          {selectedShipment && <ShipmentDetails shipment={selectedShipment} onClose={() => setShowDetails(false)} />}
        </Modal>
      </div>
    </div>
  )
}

export default ShipmentList