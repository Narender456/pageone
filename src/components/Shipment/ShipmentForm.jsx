"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentsAPI } from "../../lib/DrugShipmentAPI" 
import { studiesApi } from "../../lib/studies-api"
import toast from "react-hot-toast"

const ShipmentForm = ({ shipment, onSuccess, onCancel }) => {
  const [selectType, setSelectType] = useState(shipment?.selectType || "")
  const [selectedStudy, setSelectedStudy] = useState(shipment?.study?._id || "")
  const [relatedData, setRelatedData] = useState(null)
  const [selectedItems, setSelectedItems] = useState({
    drugs: [],
    drugGroups: [],
    excelRows: [],
  })
  const [quantities, setQuantities] = useState({})

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      study: shipment?.study?._id || "",
      siteNumber: shipment?.siteNumber?._id || "",
      shipmentNumber: shipment?.shipmentNumber || "",
      shipmentDate: shipment?.shipmentDate
        ? new Date(shipment.shipmentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      selectType: shipment?.selectType || "",
    },
  })

  // Fetch studies - Fixed the function name
  const { data: studies, isLoading: studiesLoading, error: studiesError } = useQuery({
    queryKey: ["studies"],
    queryFn: () => studiesApi.getStudies(),
    select: (response) => {
      return response.data || response;
    },
  })

  // Fetch related fields when study changes
  const {
    data: relatedFields,
    refetch: refetchRelated,
  } = useQuery({
    queryKey: ["related-fields", selectedStudy],
    queryFn: () => shipmentsAPI.getRelatedFields(selectedStudy),
    enabled: !!selectedStudy,
    select: (response) => response.data,
    onSuccess: (data) => setRelatedData(data),
  })

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      return shipment
        ? shipmentsAPI.update(shipment._id, data)
        : shipmentsAPI.create(data)
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Operation failed")
    },
  })

  useEffect(() => {
    if (selectedStudy) {
      refetchRelated()
    }
  }, [selectedStudy, refetchRelated])

  useEffect(() => {
    if (shipment) {
      setSelectedStudy(shipment.study?._id || "")
      setSelectType(shipment.selectType || "")

      if (shipment.selectType === "Drug") {
        setSelectedItems((prev) => ({
          ...prev,
          drugs: shipment.drug?.map((d) => d._id) || [],
        }))
      } else if (shipment.selectType === "DrugGroup") {
        setSelectedItems((prev) => ({
          ...prev,
          drugGroups: shipment.groupName?.map((g) => g._id) || [],
        }))
      } else if (shipment.selectType === "Randomization") {
        setSelectedItems((prev) => ({
          ...prev,
          excelRows: shipment.excelRows?.map((r) => r._id) || [],
        }))
      }
    }
  }, [shipment])

  const handleStudyChange = (studyId) => {
    setSelectedStudy(studyId)
    setValue("study", studyId)
    setValue("siteNumber", "")
    setSelectType("")
    setValue("selectType", "")
    setSelectedItems({ drugs: [], drugGroups: [], excelRows: [] })
    setQuantities({})
  }

  const handleSelectTypeChange = (type) => {
    setSelectType(type)
    setValue("selectType", type)
    setSelectedItems({ drugs: [], drugGroups: [], excelRows: [] })
    setQuantities({})
  }

  const handleItemSelection = (type, itemId, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      [type]: checked ? [...prev[type], itemId] : prev[type].filter((id) => id !== itemId),
    }))
  }

  const handleQuantityChange = (itemId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Number.parseInt(quantity) || 0,
    }))
  }

  const onSubmit = (data) => {
    // Validate selections
    if (selectType === "Drug" && selectedItems.drugs.length === 0) {
      toast.error("Please select at least one drug")
      return
    }
    if (selectType === "DrugGroup" && selectedItems.drugGroups.length === 0) {
      toast.error("Please select at least one drug group")
      return
    }
    if (selectType === "Randomization" && selectedItems.excelRows.length === 0) {
      toast.error("Please select at least one excel row")
      return
    }

    // Validate quantities for drugs
    if (selectType === "Drug" || selectType === "DrugGroup") {
      const requiredQuantities =
        selectType === "Drug"
          ? selectedItems.drugs
          : relatedData?.drugGroups
              ?.filter((g) => selectedItems.drugGroups.includes(g._id))
              ?.flatMap((g) => g.drugs.map((d) => d._id)) || []

      for (const itemId of requiredQuantities) {
        if (!quantities[itemId] || quantities[itemId] <= 0) {
          toast.error("Please enter valid quantities for all selected items")
          return
        }
      }
    }

    const submitData = {
      ...data,
      drug: selectType === "Drug" ? selectedItems.drugs : [],
      groupName: selectType === "DrugGroup" ? selectedItems.drugGroups : [],
      excelRows: selectType === "Randomization" ? selectedItems.excelRows : [],
      quantities,
    }

    mutation.mutate(submitData)
  }

  const renderDrugSelection = () => {
    if (!relatedData?.drugs?.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m0 0h10" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No drugs available for this study.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h4 className="font-semibold text-gray-900">Select Drugs</h4>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drug Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity to Ship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedData.drugs.map((drug) => (
                  <tr key={drug._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{drug.drugName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {drug.remainingQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        max={drug.remainingQuantity}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        value={quantities[drug._id] || ""}
                        onChange={(e) => handleQuantityChange(drug._id, e.target.value)}
                        disabled={!selectedItems.drugs.includes(drug._id)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.drugs.includes(drug._id)}
                        onChange={(e) => handleItemSelection("drugs", drug._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderDrugGroupSelection = () => {
    if (!relatedData?.drugGroups?.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No drug groups available for this study.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <h4 className="font-semibold text-gray-900">Select Drug Groups</h4>
        </div>
        <div className="space-y-4">
          {relatedData.drugGroups.map((group) => (
            <div key={group._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.drugGroups.includes(group._id)}
                    onChange={(e) => handleItemSelection("drugGroups", group._id, e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <h5 className="font-medium text-gray-900">{group.groupName}</h5>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {group.drugs?.length || 0} drugs
                  </span>
                </div>
              </div>

              {selectedItems.drugGroups.includes(group._id) && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Drug Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity to Ship
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.drugs.map((drug) => (
                          <tr key={drug._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">
                              <div className="text-sm font-medium text-gray-900">{drug.drugName}</div>
                            </td>
                            <td className="px-4 py-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {drug.remainingQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                max={drug.remainingQuantity}
                                className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                value={quantities[drug._id] || ""}
                                onChange={(e) => handleQuantityChange(drug._id, e.target.value)}
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderExcelRowSelection = () => {
    if (!relatedData?.excelRows?.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No excel rows available for this study.</p>
        </div>
      )
    }

    const headers = relatedData.headers || []

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h4 className="font-semibold text-gray-900">Select Excel Rows</h4>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedData.excelRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {headers.map((header) => (
                      <td key={header} className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{row[header] || "-"}</div>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.excelRows.includes(row.id)}
                        onChange={(e) => handleItemSelection("excelRows", row.id, e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {shipment ? "Edit Shipment" : "Create New Shipment"}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study <span className="text-red-500">*</span>
              </label>
              <select
                {...register("study", { required: "Study is required" })}
               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                onChange={(e) => handleStudyChange(e.target.value)}
                disabled={studiesLoading}
                
              >
                <option value="">
                  {studiesLoading ? "Loading studies..." : "Select Study"}
                </option>
                {studies?.map((study) => (
                  <option key={study._id} value={study._id} >
                    {study.studyName}
                  </option>
                ))}
              </select>
              {errors.study && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.study.message}
                </p>
              )}
              {studiesError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Error loading studies
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site <span className="text-red-500">*</span>
              </label>
              <select
                {...register("siteNumber", { required: "Site is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!selectedStudy}
              >
                <option value="">Select Site</option>
                {relatedData?.sites?.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.siteName}
                  </option>
                ))}
              </select>
              {errors.siteNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.siteNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipment Number
              </label>
              <input
                {...register("shipmentNumber")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                readOnly
                placeholder="Auto-generated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipment Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register("shipmentDate", { required: "Shipment date is required" })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.shipmentDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.shipmentDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Select Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Type <span className="text-red-500">*</span>
            </label>
            <select
              value={selectType}
              onChange={(e) => handleSelectTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!selectedStudy}
            >
              <option value="">Select Type</option>
              <option value="Drug">Drug</option>
              <option value="DrugGroup">Drug Group</option>
              <option value="Randomization">Randomization</option>
            </select>
          </div>

          {/* Dynamic Content Based on Select Type */}
          {selectType && relatedData && (
            <div className="border-t border-gray-200 pt-6">
              {selectType === "Drug" && renderDrugSelection()}
              {selectType === "DrugGroup" && renderDrugGroupSelection()}
              {selectType === "Randomization" && renderExcelRowSelection()}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {mutation.isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {mutation.isLoading ? "Saving..." : shipment ? "Update Shipment" : "Create Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShipmentForm