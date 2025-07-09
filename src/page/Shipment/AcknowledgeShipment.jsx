"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentsAPI } from "../../lib/DrugShipmentAPI"
import Modal from "../../components/Shipment/Modal"
import Pagination from "../../components/Shipment/Pagination"
import toast from "react-hot-toast"
import { EyeIcon } from "lucide-react"

const AcknowledgeShipment = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showAcknowledgment, setShowAcknowledgment] = useState(false)
  const [acknowledgmentData, setAcknowledgmentData] = useState({})

  const queryClient = useQueryClient()

  // Fetch shipments for acknowledgment
  const { data: shipmentsData, isLoading } = useQuery(
    ["acknowledge-shipments", currentPage],
    () =>
      shipmentsAPI.getAll({
        page: currentPage,
        limit: 10,
      }),
    {
      select: (response) => response.data,
      keepPreviousData: true,
    },
  )

  // Fetch shipment details
  const { data: shipmentDetails, isLoading: detailsLoading } = useQuery(
    ["shipment-details", selectedShipment?._id],
    () => shipmentsAPI.getById(selectedShipment._id),
    {
      enabled: !!selectedShipment,
      select: (response) => response.data,
    },
  )

  // Acknowledge mutation
  const acknowledgeMutation = useMutation(({ shipmentId, data }) => shipmentsAPI.acknowledge(shipmentId, data), {
    onSuccess: () => {
      queryClient.invalidateQueries("acknowledge-shipments")
      queryClient.invalidateQueries(["shipment-details", selectedShipment._id])
      toast.success("Acknowledgment updated successfully")
      setShowAcknowledgment(false)
      setSelectedShipment(null)
      setAcknowledgmentData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update acknowledgment")
    },
  })

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment)
    setShowAcknowledgment(true)
  }

  const handleAcknowledgmentChange = (key, value) => {
    setAcknowledgmentData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmitAcknowledgment = (e) => {
    e.preventDefault()

    // Validate acknowledgment data
    if (selectedShipment.selectType === "Drug" || selectedShipment.selectType === "DrugGroup") {
      const acknowledgments = shipmentDetails?.acknowledgments || []

      for (const ack of acknowledgments) {
        const drugId = ack.drug?._id
        const received = Number.parseInt(acknowledgmentData[`received_quantity_${drugId}`] || 0)
        const missing = Number.parseInt(acknowledgmentData[`missing_quantity_${drugId}`] || 0)
        const damaged = Number.parseInt(acknowledgmentData[`damaged_quantity_${drugId}`] || 0)
        const sent = ack.acknowledgedQuantity || 0

        if (received + missing + damaged !== sent) {
          toast.error(`Total acknowledged quantity for ${ack.drug?.drugName} must equal sent quantity (${sent})`)
          return
        }
      }
    } else if (selectedShipment.selectType === "Randomization") {
      const acknowledgments = shipmentDetails?.acknowledgments || []

      for (const ack of acknowledgments) {
        const kitNumber = ack.excelRow?.rowData?.Kit_Number || `row_${ack.excelRow?._id}`
        const status = acknowledgmentData[`status_${kitNumber}`]

        if (!status || !["received", "missing", "damaged"].includes(status)) {
          toast.error(`Status must be selected for Kit Number ${kitNumber}`)
          return
        }
      }
    }

    acknowledgeMutation.mutate({
      shipmentId: selectedShipment._id,
      data: acknowledgmentData,
    })
  }

  const renderAcknowledgmentForm = () => {
    if (!shipmentDetails || detailsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    const acknowledgments = shipmentDetails.acknowledgments || []

    if (selectedShipment.selectType === "Drug" || selectedShipment.selectType === "DrugGroup") {
      return (
        <div className="space-y-6">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {selectedShipment.selectType === "DrugGroup" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group Name
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drug Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Missing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Damaged
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acknowledgments.map((ack) => {
                    const drugId = ack.drug?._id
                    const sentQuantity = ack.acknowledgedQuantity || 0
                    const isAcknowledged = ack.status !== "Not Acknowledged"

                    return (
                      <tr key={ack._id} className="hover:bg-gray-50">
                        {selectedShipment.selectType === "DrugGroup" && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ack.drugGroup?.groupName || "N/A"}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ack.drug?.drugName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sentQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={sentQuantity}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            value={acknowledgmentData[`received_quantity_${drugId}`] || ack.receivedQuantity || ""}
                            onChange={(e) => handleAcknowledgmentChange(`received_quantity_${drugId}`, e.target.value)}
                            disabled={isAcknowledged}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={sentQuantity}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            value={acknowledgmentData[`missing_quantity_${drugId}`] || ack.missingQuantity || ""}
                            onChange={(e) => handleAcknowledgmentChange(`missing_quantity_${drugId}`, e.target.value)}
                            disabled={isAcknowledged}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={sentQuantity}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            value={acknowledgmentData[`damaged_quantity_${drugId}`] || ack.damagedQuantity || ""}
                            onChange={(e) => handleAcknowledgmentChange(`damaged_quantity_${drugId}`, e.target.value)}
                            disabled={isAcknowledged}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    } else if (selectedShipment.selectType === "Randomization") {
      return (
        <div className="space-y-6">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kit Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acknowledgment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acknowledgments.map((ack) => {
                    const kitNumber = ack.excelRow?.rowData?.Kit_Number || `row_${ack.excelRow?._id}`
                    const currentStatus = ack.status || "Not Acknowledged"
                    const isAcknowledged = currentStatus !== "Not Acknowledged"

                    return (
                      <tr key={ack._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {kitNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <pre className="text-xs bg-gray-100 p-2 rounded max-w-xs overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(ack.excelRow?.rowData, null, 2)}
                          </pre>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              currentStatus === "received"
                                ? "bg-green-100 text-green-800"
                                : currentStatus === "missing"
                                  ? "bg-red-100 text-red-800"
                                  : currentStatus === "damaged"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {["received", "missing", "damaged"].map((status) => (
                              <label key={status} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`status_${kitNumber}`}
                                  value={status}
                                  checked={
                                    acknowledgmentData[`status_${kitNumber}`] === status ||
                                    (!acknowledgmentData[`status_${kitNumber}`] && currentStatus === status)
                                  }
                                  onChange={(e) => handleAcknowledgmentChange(`status_${kitNumber}`, e.target.value)}
                                  disabled={isAcknowledged}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }
  }

  const isFullyAcknowledged = shipmentDetails?.acknowledgments?.every((ack) => ack.status !== "Not Acknowledged")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Acknowledge Shipments</h1>
        <p className="mt-1 text-sm text-gray-600">Review and acknowledge received drug shipments</p>
      </div>

      {/* Shipments Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S. No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acknowledged
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : shipmentsData?.shipments?.length > 0 ? (
                shipmentsData.shipments.map((shipment, index) => (
                  <tr key={shipment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shipment.shipmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.siteNumber?.siteName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shipment.shipmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          shipment.isAcknowledged ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {shipment.isAcknowledged ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleViewDetails(shipment)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded transition-colors duration-200"
                        title="View/Acknowledge"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No shipments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {shipmentsData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={shipmentsData.pagination.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Acknowledgment Modal */}
      <Modal
        isOpen={showAcknowledgment}
        onClose={() => {
          setShowAcknowledgment(false)
          setSelectedShipment(null)
          setAcknowledgmentData({})
        }}
        title="Acknowledge Shipment"
        size="2xl"
      >
        {selectedShipment && (
          <form onSubmit={handleSubmitAcknowledgment} className="space-y-6">
            {/* Shipment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Number
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {selectedShipment.shipmentNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study
                </label>
                <p className="text-sm text-gray-900">
                  {selectedShipment.study?.studyName || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site
                </label>
                <p className="text-sm text-gray-900">
                  {selectedShipment.siteNumber?.siteName || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Date
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedShipment.shipmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Acknowledgment Form */}
            {renderAcknowledgmentForm()}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowAcknowledgment(false)
                  setSelectedShipment(null)
                  setAcknowledgmentData({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              {!isFullyAcknowledged && (
                <button 
                  type="submit" 
                  disabled={acknowledgeMutation.isLoading} 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {acknowledgeMutation.isLoading ? "Acknowledging..." : "Acknowledge"}
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default AcknowledgeShipment