"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { stagesAPI } from "../../lib/stagesAPI" 
import toast from "react-hot-toast"

const StageForm = ({ stage, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      orderNumber: "",
    },
  })

  // Create/Update mutation - Updated for TanStack Query v5
  const mutation = useMutation({
    mutationFn: (data) => {
      if (stage) {
        return stagesAPI.update(stage.slug, data)
      } else {
        return stagesAPI.create(data)
      }
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Operation failed"
      toast.error(errorMessage)
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  useEffect(() => {
    if (stage) {
      // Pre-populate form for editing
      setValue("name", stage.name || "")
      setValue("description", stage.description || "")
      setValue("orderNumber", stage.orderNumber || "")
    } else {
      // Reset form for new stage
      reset()
    }
  }, [stage, setValue, reset])

  const onSubmit = (data) => {
    setIsSubmitting(true)

    // Convert orderNumber to number if provided
    const submitData = {
      ...data,
      orderNumber: data.orderNumber ? Number.parseInt(data.orderNumber) : undefined,
    }

    // Remove empty fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === "" || submitData[key] === undefined) {
        delete submitData[key]
      }
    })

    mutation.mutate(submitData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Stage Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stage Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", {
            required: "Stage name is required",
            maxLength: {
              value: 100,
              message: "Stage name must be less than 100 characters",
            },
          })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          placeholder="Enter stage name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
          placeholder="Enter stage description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Order Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
        <input
          {...register("orderNumber", {
            min: {
              value: 1,
              message: "Order number must be at least 1",
            },
            pattern: {
              value: /^[1-9]\d*$/,
              message: "Order number must be a positive integer",
            },
          })}
          type="number"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          placeholder="Auto-generated if not provided"
        />
        {errors.orderNumber && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.orderNumber.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 flex items-start">
          <svg className="w-4 h-4 mr-1 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Leave empty to auto-generate the next available order number
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {stage ? "Updating..." : "Creating..."}
            </>
          ) : stage ? (
            "Update Stage"
          ) : (
            "Create Stage"
          )}
        </button>
      </div>
    </form>
  )
}

export default StageForm