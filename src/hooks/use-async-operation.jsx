"use client"

import { useState, useCallback } from "react"
import { useToast } from "./hooks/use-toast"

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const execute = useCallback(
    async (operation, options) => {
      try {
        setLoading(true)
        const result = await operation()

        if (options?.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          })
        }

        options?.onSuccess?.(result)
        return result
      } catch (error) {
        const errorMessage = options?.errorMessage || error.message || "An error occurred"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        options?.onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  return { execute, loading }
}
