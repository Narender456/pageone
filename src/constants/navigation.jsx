// constants/navigation.js
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Settings,
  Home,
  FileText,
  HelpCircle,
  ChevronRight
} from "lucide-react"

export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3
  },
  {
    title: "Users",
    url: "/users",
    icon: Users
  },
  {
    title: "Studies",
    icon: FileText,
    isDropdown: true,
    children: [
      // {
      //   title: "Study",
      //   url: "/study",
      //   icon: FileText,
      // },
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
    icon: ShoppingCart
  },
    {
    title: "Sponsors",
    url: "/sponsors",
    icon: Package
  },
  {
    title: "Drugs",
    icon: FileText,
    isDropdown: true,
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
    icon: ShoppingCart
  },
  
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

  {
    title: "Orders",
    url: "#",
    icon: ShoppingCart
  },
  {
    title: "Products",
    url: "#",
    icon: Package
  },
  {
    title: "Reports",
    url: "#",
    icon: FileText
  }
]

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