// utils/navigationBuilder.js
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Settings,
  Home,
  FileText,
  HelpCircle
} from "lucide-react"

// Base static navigation items
const BASE_NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    order: 1
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    order: 2
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    order: 3
  },
  {
    title: "Studies",
    icon: FileText,
    isDropdown: true,
    order: 4,
    children: [
      {
        title: "Studies",
        url: "/studies",
        icon: FileText,
      },
      {
        title: "Study Phases",
        url: "/study-phases",
        icon: Package,
      },
      {
        title: "Study Type",
        url: "/study-type",
        icon: Package,
      },
      {
        title: "Study Designs",
        url: "/study-designs",
        icon: Package,
      },
      {
        title: "Blinding Status",
        url: "/blinding-status",
        icon: Package,
      }
    ]
  },
  {
    title: "Sites",
    url: "/site",
    icon: ShoppingCart,
    order: 5
  },
  {
    title: "Sponsors",
    url: "/sponsors",
    icon: Package,
    order: 6
  },
  {
    title: "Drugs",
    icon: FileText,
    isDropdown: true,
    order: 7,
    children: [
      {
        title: "Drugs",
        url: "/drug",
        icon: ShoppingCart
      },
      {
        title: "Drugs Group",
        url: "/drug-group",
        icon: ShoppingCart
      },
    ]
  },
  {
    title: "Randomization",
    url: "/excel",
    icon: ShoppingCart,
    order: 8
  },
  {
    title: "Shipments",
    icon: FileText,
    isDropdown: true,
    order: 9,
    children: [
      {
        title: "Shipments",
        url: "/shipment",
        icon: ShoppingCart
      },
      {
        title: "acknowledge",
        url: "/acknowledge",
        icon: ShoppingCart
      },
    ]
  },
  {
    title: "Pages",
    icon: FileText,
    isDropdown: true,
    order: 10,
    children: [
      {
        title: "PageList",
        url: "/page",
        icon: ShoppingCart
      },
      {
        title: "Stage",
        url: "/stage",
        icon: ShoppingCart
      },
    ]
  },
  // {
  //   title: "Stage",
  //   url: "/stage",
  //   icon: ShoppingCart,
  //   order: 10
  // },
  {
    title: "Role",
    url: "/role",
    icon: ShoppingCart,
    order: 11
  },
  {
    title: "Forms",
    url: "/menue",
    icon: ShoppingCart,
    order: 12,
    _id: "forms_menu_id" // Add identifier for Forms menu
  },
  {
    title: "Orders",
    url: "#",
    icon: ShoppingCart,
    order: 13
  },
  {
    title: "Products",
    url: "#",
    icon: Package,
    order: 14
  },
  {
    title: "Reports",
    url: "#",
    icon: FileText,
    order: 15
  }
]

// Function to get icon component from string
const getIconComponent = (iconString) => {
  const iconMap = {
    'Home': Home,
    'BarChart3': BarChart3,
    'Users': Users,
    'ShoppingCart': ShoppingCart,
    'Package': Package,
    'Settings': Settings,
    'FileText': FileText,
    'HelpCircle': HelpCircle
  }
  
  // Default to ShoppingCart if icon not found
  return iconMap[iconString] || ShoppingCart
}

// Function to build dynamic navigation
export const buildNavigationItems = (dynamicMenuOptions = []) => {
  // Start with base navigation items
  let navigationItems = [...BASE_NAVIGATION_ITEMS]
  
  // Create a map for quick lookup
  const navigationMap = new Map()
  navigationItems.forEach(item => {
    navigationMap.set(item._id || item.title, item)
  })
  
  // Process dynamic menu options
  dynamicMenuOptions.forEach(menuOption => {
    if (!menuOption.isActive) return
    
    const newMenuItem = {
      title: menuOption.name,
      url: menuOption.url,
      icon: getIconComponent(menuOption.icon?.replace('nav-icon', '').trim()) || ShoppingCart,
      order: menuOption.order,
      _id: menuOption._id
    }
    
    // If this menu option has a parent
    if (menuOption.parent) {
      const parentId = typeof menuOption.parent === 'string' ? menuOption.parent : menuOption.parent._id
      const parentName = typeof menuOption.parent === 'object' ? menuOption.parent.name : null
      
      // Find parent in navigation (could be by _id or by name)
      let parentItem = null
      
      // First try to find by _id
      for (let item of navigationItems) {
        if (item._id === parentId) {
          parentItem = item
          break
        }
      }
      
      // If not found by _id, try to find by name (for Forms example)
      if (!parentItem && parentName) {
        for (let item of navigationItems) {
          if (item.title === parentName || (item._id && item._id === 'forms_menu_id' && parentName === 'Forms')) {
            parentItem = item
            break
          }
        }
      }
      
      // If parent found, convert it to dropdown and add child
      if (parentItem) {
        // Convert parent to dropdown if it isn't already
        if (!parentItem.isDropdown) {
          parentItem.isDropdown = true
          parentItem.children = []
          // Remove URL from parent as it becomes a dropdown
          delete parentItem.url
        }
        
        // Add the new menu as a child
        if (!parentItem.children) {
          parentItem.children = []
        }
        
        parentItem.children.push(newMenuItem)
        
        // Sort children by order if they have order property
        parentItem.children.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    } else {
      // If no parent, add as top-level item
      navigationItems.push(newMenuItem)
    }
  })
  
  // Sort navigation items by order
  navigationItems.sort((a, b) => (a.order || 0) - (b.order || 0))
  
  return navigationItems
}

// Support items remain static
export const SUPPORT_ITEMS = [
  {
    title: "Help Center",
    url: "#",
    icon: HelpCircle
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings
  }
]