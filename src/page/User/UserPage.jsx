
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"
import User from "../../components/User/User"


export default function UsersPage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <User />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
