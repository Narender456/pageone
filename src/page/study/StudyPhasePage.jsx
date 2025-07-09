
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { StudyManagement } from "../../components/studies/study-management"
import { StudyPhaseManagement } from "../../components/study-phases/study-phase-management"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"
import User from "../../components/User/User"


export default function StudyPhasePage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <StudyPhaseManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
