// hooks/useNavigation.js
import { useState, useEffect, useCallback } from 'react'
import { getNavigationItems, SUPPORT_ITEMS } from '../constants/navigation'
import { menuOptionsApi } from '../lib/menu-options-api'

export const useNavigation = () => {
  const [navigationItems, setNavigationItems] = useState([])
  const [supportItems] = useState(SUPPORT_ITEMS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const buildNavigation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dynamic menu options from API
      const response = await menuOptionsApi.getMenuOptions()
      const dynamicMenus = Array.isArray(response) ? response : response?.data || []
      
      // Build navigation with dynamic menus
      const builtNavigation = getNavigationItems(dynamicMenus)
      setNavigationItems(builtNavigation)
    } catch (err) {
      console.error('Error building navigation:', err)
      setError(err)
      // Fallback to static navigation
      setNavigationItems(getNavigationItems([]))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    buildNavigation()
  }, [buildNavigation])

  // Function to refresh navigation (call this after creating/updating menu options)
  const refreshNavigation = useCallback(() => {
    buildNavigation()
  }, [buildNavigation])

  return {
    navigationItems,
    supportItems,
    loading,
    error,
    refreshNavigation
  }
}

// Example usage in your main layout or navigation component:
/*
import { useNavigation } from './hooks/useNavigation'

function MainLayout() {
  const { navigationItems, supportItems, loading, error, refreshNavigation } = useNavigation()
  
  // Call refreshNavigation after creating a new menu option
  const handleMenuCreated = () => {
    refreshNavigation()
  }
  
  if (loading) return <div>Loading navigation...</div>
  if (error) return <div>Error loading navigation</div>
  
  return (
    <div>
      <Navigation items={navigationItems} supportItems={supportItems} />
      <MenuOptionDialog onSave={handleMenuCreated} />
    </div>
  )
}
*/