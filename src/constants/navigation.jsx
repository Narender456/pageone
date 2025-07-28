// constants/navigation.js
import { buildNavigationItems, SUPPORT_ITEMS } from '../utils/navigationBuilder'

// Example of how to use the dynamic navigation builder
// This would typically be called in your component with actual menu data from API

export const getNavigationItems = (dynamicMenuOptions = []) => {
  return buildNavigationItems(dynamicMenuOptions)
}

// For backward compatibility, export static items as default
export const NAVIGATION_ITEMS = buildNavigationItems([])

export { SUPPORT_ITEMS }

// Example usage in a React component:
/*
import { useEffect, useState } from 'react'
import { getNavigationItems } from './constants/navigation'
import { menuOptionsApi } from './lib/menu-options-api'

function NavigationComponent() {
  const [navigationItems, setNavigationItems] = useState([])
  
  useEffect(() => {
    const fetchAndBuildNavigation = async () => {
      try {
        // Fetch dynamic menu options from API
        const dynamicMenus = await menuOptionsApi.getMenuOptions()
        
        // Build navigation with dynamic menus
        const builtNavigation = getNavigationItems(dynamicMenus)
        setNavigationItems(builtNavigation)
      } catch (error) {
        console.error('Error building navigation:', error)
        // Fallback to static navigation
        setNavigationItems(getNavigationItems([]))
      }
    }
    
    fetchAndBuildNavigation()
  }, [])
  
  return (
    // Your navigation JSX here using navigationItems
  )
}
*/