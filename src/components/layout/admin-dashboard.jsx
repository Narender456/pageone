import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { DashboardContent } from "../dashboard/dashboard-content" 
import { SidebarProvider, SidebarInset } from "../ui/sidebar"

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <DashboardContent />
      </SidebarInset>
    </SidebarProvider>
  )
}


