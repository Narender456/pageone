"use client"
import { useQuery } from "@tanstack/react-query"

import { shipmentsAPI } from "../../lib/DrugShipmentAPI" 

const ShipmentDetails = ({ shipment, onClose }) => {
  const { data: detailsData, isLoading, error, isError } = useQuery({
    queryKey: ["shipment-details", shipment._id],
    queryFn: () => shipmentsAPI.getById(shipment._id),
    select: (response) => {
      console.log("Raw API response:", response);
      // Try different possible response structures
      if (response?.data) {
        return response.data;
      } else if (response) {
        return response;
      }
      return null;
    },
    enabled: !!shipment._id, // Only run query if shipment._id exists
  });

  console.log("Query state:", { detailsData, isLoading, error, isError });
  console.log("Shipment object:", shipment);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isError) {
    console.error("API Error:", error);
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-600">Error loading shipment details: {error?.message || 'Unknown error'}</div>
      </div>
    )
  }

  // Add debug logging to see what data we're getting
  console.log("detailsData:", detailsData);
  console.log("acknowledgments:", detailsData?.acknowledgments);
  console.log("shipment.selectType:", shipment.selectType);

  const renderDetailsTable = () => {
    // Check if we have the necessary data
    if (!detailsData) {
      console.log("No detailsData available");
      return (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">No details data available</p>
          <p className="text-sm text-yellow-600 mt-2">
            This could mean:
            <br />• The API call failed
            <br />• The shipment ID is invalid
            <br />• The response structure is different than expected
          </p>
        </div>
      );
    }

    // Check if acknowledgments exist - try different possible property names
    let acknowledgments = detailsData.acknowledgments || 
                         detailsData.acknowledgements || 
                         detailsData.items || 
                         detailsData.details ||
                         detailsData;

    if (!acknowledgments) {
      console.log("No acknowledgments available");
      return (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">No acknowledgments available</p>
          <p className="text-sm text-blue-600 mt-2">Available data keys: {Object.keys(detailsData || {}).join(', ')}</p>
        </div>
      );
    }

    // Ensure acknowledgments is an array
    if (!Array.isArray(acknowledgments)) {
      console.log("Acknowledgments is not an array:", acknowledgments);
      return (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">Acknowledgments data is not in expected format</p>
          <p className="text-sm text-blue-600 mt-2">Type: {typeof acknowledgments}</p>
        </div>
      );
    }

    if (acknowledgments.length === 0) {
      console.log("Acknowledgments array is empty");
      return (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-800">No acknowledgment records found</p>
        </div>
      );
    }

if (shipment.selectType === "Randomization") {
  // Define preferred column order
  const preferredOrder = ["Random_Number", "Kit_Number", "Dummy_Treatment", "SITE", "Block", "Status"]

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Randomization Details</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              {preferredOrder.map((header) => (
                <th key={header} className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {acknowledgments.map((ack, index) => {
              // Determine status based on acknowledgment
              const currentStatus =
                ack.status && ack.status !== "Not Acknowledged" ? "Acknowledged" : "Not Acknowledged"

              return (
                <tr key={ack._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {preferredOrder.map((header) => {
                    // Handle Status column specially
                    if (header === "Status") {
                      return (
                        <td key={header} className="py-3 px-4 text-gray-900 border-r border-gray-300">
                          {currentStatus}
                        </td>
                      )
                    }

                    // Display excel row data for other columns
                    // Fixed: Added better null checking and fallback
                    let cellValue = "";
                    if (ack.excelRow && ack.excelRow.rowData && ack.excelRow.rowData[header]) {
                      cellValue = ack.excelRow.rowData[header];
                    } else if (ack.excelRow && ack.excelRow[header]) {
                      // Fallback: check if the data is directly on excelRow
                      cellValue = ack.excelRow[header];
                    } else {
                      // Final fallback: show a placeholder or fetch from shipment excelRows
                      const matchingExcelRow = shipment.excelRows && shipment.excelRows.find(row => 
                        row._id.toString() === ack.excelRow
                      );
                      if (matchingExcelRow && matchingExcelRow.rowData) {
                        cellValue = matchingExcelRow.rowData[header] || "";
                      } else {
                        cellValue = "N/A";
                      }
                    }

                    return (
                      <td key={header} className="py-3 px-4 text-gray-900 border-r border-gray-300">
                        {cellValue}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
    } else if (shipment.selectType === "Drug") {
      return (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Drug Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Drug Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Sent Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Received</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Missing</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Damaged</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {acknowledgments.map((ack, index) => (
                  <tr key={ack._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.drug?.drugName || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.acknowledgedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.receivedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.missingQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.damagedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900">{ack.status || "Not Acknowledged"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    } else if (shipment.selectType === "DrugGroup") {
      return (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Drug Group Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Group Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Drug Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Sent Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Received</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Missing</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base border-r border-gray-300">Damaged</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {acknowledgments.map((ack, index) => (
                  <tr key={ack._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.drugGroup?.groupName || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.drug?.drugName || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.acknowledgedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.receivedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.missingQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900 border-r border-gray-300">{ack.damagedQuantity || 0}</td>
                    <td className="py-3 px-4 text-gray-900">{ack.status || "Not Acknowledged"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    } else {
      return (
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded">
          <p className="text-orange-800">Unknown shipment type: {shipment.selectType}</p>
          <p className="text-sm text-orange-600 mt-2">Available data: {JSON.stringify(detailsData, null, 2)}</p>
        </div>
      );
    }
  }

  const isAcknowledged = detailsData?.acknowledgments?.every((ack) => ack.status !== "Not Acknowledged") || 
                     detailsData?.acknowledgements?.every((ack) => ack.status !== "Not Acknowledged") || 
                     false

  return (
    <div className="p-6 bg-white">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Shipment Details</h2>

      {/* Shipment Info - Simple text format matching the image */}
      <div className="space-y-4 mb-6">
        <div>
          <span className="text-blue-600 text-lg">Shipment Number: </span>
          <span className="text-blue-600 text-lg">{shipment.shipmentNumber}</span>
        </div>

        <div>
          <span className="text-blue-600 text-lg">Study: </span>
          <span className="text-blue-600 text-lg">{shipment.study?.study_name || "N/A"}</span>
        </div>

        <div>
          <span className="text-blue-600 text-lg">Shipment Date: </span>
          <span className="text-blue-600 text-lg">{new Date(shipment.shipmentDate).toISOString().split("T")[0]}</span>
        </div>
      </div>

      {/* Details Table */}
      {renderDetailsTable()}

      {/* Acknowledged Status */}
      <div className="mt-8">
        <span className="text-blue-600 text-lg">Acknowledged: </span>
        <span className="text-blue-600 text-lg">{isAcknowledged ? "Yes" : "No"}</span>
      </div>

      {/* Close Button */}
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
      </div>
    </div>
  )
}

export default ShipmentDetails