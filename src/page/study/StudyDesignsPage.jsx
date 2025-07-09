
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { StudyDesignManagement } from "../../components/StudyDesigns/StudyDesignManagement"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"



export default function StudyDesignsPage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <StudyDesignManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
