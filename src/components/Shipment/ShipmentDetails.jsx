"use client"
import { useQuery } from "@tanstack/react-query"; // ✅ correct
import { shipmentsAPI } from "../../lib/DrugShipmentAPI" 

const ShipmentDetails = ({ shipment, onClose }) => {
  const { data: detailsData, isLoading } = useQuery(
    ["shipment-details", shipment._id],
    () => shipmentsAPI.getById(shipment._id),
    {
      select: (response) => response.data,
    },
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderDetailsTable = () => {
    if (!detailsData?.acknowledgments) return null

    if (shipment.selectType === "Drug") {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {detailsData.acknowledgments.map((ack) => (
              <tr key={ack._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ack.drug?.drugName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.acknowledgedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.receivedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.missingQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.damagedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ack.status === "received"
                        ? "bg-green-100 text-green-800"
                        : ack.status === "partial"
                          ? "bg-yellow-100 text-yellow-800"
                          : ack.status === "missing"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ack.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    } else if (shipment.selectType === "DrugGroup") {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group Name
              </th>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {detailsData.acknowledgments.map((ack) => (
              <tr key={ack._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ack.drugGroup?.groupName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.drug?.drugName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.acknowledgedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.receivedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.missingQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ack.damagedQuantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ack.status === "received"
                        ? "bg-green-100 text-green-800"
                        : ack.status === "partial"
                          ? "bg-yellow-100 text-yellow-800"
                          : ack.status === "missing"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ack.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    } else if (shipment.selectType === "Randomization") {
      return (
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {detailsData.acknowledgments.map((ack) => (
              <tr key={ack._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ack.excelRow?.rowData?.Kit_Number || `Row ${ack.excelRow?._id}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap overflow-x-auto max-w-xs">
                    {JSON.stringify(ack.excelRow?.rowData, null, 2)}
                  </pre>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ack.status === "received"
                        ? "bg-green-100 text-green-800"
                        : ack.status === "missing"
                          ? "bg-red-100 text-red-800"
                          : ack.status === "damaged"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ack.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Shipment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipment Number
          </label>
          <p className="text-sm text-gray-900 font-medium">
            {shipment.shipmentNumber}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Study
          </label>
          <p className="text-sm text-gray-900">
            {shipment.study?.studyName || "N/A"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site
          </label>
          <p className="text-sm text-gray-900">
            {shipment.siteNumber?.siteName || "N/A"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipment Date
          </label>
          <p className="text-sm text-gray-900">
            {new Date(shipment.shipmentDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <p className="text-sm text-gray-900">
            {shipment.selectType}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              shipment.isAcknowledged 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {shipment.isAcknowledged ? "Acknowledged" : "Pending"}
          </span>
        </div>
      </div>

      {/* Details Table */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Shipment Details
        </h4>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <div className="overflow-x-auto">
            {renderDetailsTable()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button 
          onClick={onClose} 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ShipmentDetails