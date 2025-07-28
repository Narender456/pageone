// components/sidebar/AppSidebar.js
"use client"

import { useState } from "react"
import { BarChart3, ChevronRight, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useNavigation } from "../../hooks/useNavigation"
import { useAuth } from "../../lib/auth-context"

export function AppSidebar() {
  const { user } = useAuth()
  const { navigationItems, supportItems, loading, error } = useNavigation()
  const [openDropdowns, setOpenDropdowns] = useState({})

  const toggleDropdown = (itemTitle) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle]
    }))
  }

  const renderNavigationItem = (item) => {
    if (item.isDropdown) {
      const isOpen = openDropdowns[item.title]
      
      return (
        <div key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleDropdown(item.title)}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4"/>
                <span>{item.title}</span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => (
                <SidebarMenuItem key={child.title}>
                  <SidebarMenuButton asChild>
                    <a href={child.url} className="pl-6">
                      <child.icon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <a href={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  if (loading) {
    return (
      <Sidebar>
        <SidebarContent className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </SidebarContent>
      </Sidebar>
    )
  }

  if (error) {
    return (
      <Sidebar>
        <SidebarContent className="flex items-center justify-center">
          <div className="text-red-500 text-sm">Error loading navigation</div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">PageOne</span>
            <span className="truncate text-xs text-muted-foreground">
              Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg?height=24&width=24"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name || "Guest"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || "guest@example.com"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}